# Setup PostgresSQL and EXPRESS

Basic example and use case of setup PostgresSQL database and EXPRESS application

## Notes about PostgreSQL

### PostgreSQL Installation on MacOS (with HomeBrew)

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

brew update
brew install postgresql
postgres --version
```

### Create a physical space on your drive to allocate a PostgreSQL database cluster

```
initdb /usr/local/var/postgres
```

You will see the error message: “initdb: directory “/usr/local/var/postgres” exists but is not empty” if the database was already created when you installed PostgreSQL.

### Start/stop a PostgreSQL Database

```
pg_ctl -D /usr/local/var/postgres start
pg_ctl -D /usr/local/var/postgres stop
```

### Create the actual PostgreSQL database

```
createdb mydatabasename
dropdb mydatabasename
```

### Connect to the database

```
psql mydatabasename
```

To exit the psql shell either press "CTRL + d" or type "\q"

### Useful commands in the psql shell

```
CREATE DATABASE mydatabasename
DROP DATABASE mydatabasename
\list - List all of your actual databases.
\c mydatabasename - Connect to another database.
\d - List the relations of your currently connected database.
\d mytablename - Shows information for a specific table.
```

## Notes about Sequelize

### PostgreSQL with Sequelize in Express Installation

```
npm install pg sequelize --save
```

### Datamodels, schemas and entities

Define your datamodels

```js
const user = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    username: {
      type: DataTypes.STRING,
      unique: true
    }
  });

  User.associate = models => {
    User.hasMany(models.Message, { onDelete: "CASCADE" });
  };

  User.findByLogin = async login => {
    let user = await User.findOne({
      where: { username: login }
    });

    if (!user) {
      user = await User.findOne({
        where: { email: login }
      });
    }

    return user;
  };

  return User;
};

export default user;
```

Create a Sequelize instance by passing the mandatory arguments (database name, database superuser, database superuser’s password and additional configuration).

```js
import Sequelize from "sequelize";

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    dialect: "postgres"
  }
);

const models = {
  User: sequelize.import("./user"),
  Message: sequelize.import("./message")
};

Object.keys(models).forEach(key => {
  if ("associate" in models[key]) {
    models[key].associate(models);
  }
});

export { sequelize };

export default models;
```

Connect your Express appication to the database asynchronosuly

```js
import express from 'express';
import models, { sequelize } from './models';
const app = express();
...

sequelize.sync().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Sample app listening on port ${process.env.PORT}!`),
  });
});
...
```

### Create the Rest API with Express and PostgreSQL

```js
import models from './models';
const app = express();
...

// Express middleware for passing the models as context to the Express routes.
app.use((req, res, next) => {
  req.context = {
    models,
    me: await models.User.findByLogin(...),
  };
  next();
});
```

Users Route

```js
import { Router } from "express";
const router = Router();

// Fetches a list of all the users
router.get("/", async (req, res) => {
  const users = await req.context.models.User.findAll();
  return res.send(users);
});

// Fetch and access the user identifier with the information from req.params
router.get("/:userId", async (req, res) => {
  const user = await req.context.models.User.findByPk(req.params.userId);
  return res.send(user);
});

export default router;
```

Messages Route

```js
import { Router } from "express";
const router = Router();

// Fetches a list of all the messages
router.get("/", async (req, res) => {
  const messages = await req.context.models.Message.findAll();
  return res.send(messages);
});

// Fetch and access the message identifier with the information from req.params
router.get("/:messageId", async (req, res) => {
  const message = await req.context.models.Message.findByPk(
    req.params.messageId
  );
  return res.send(message);
});

// Post a new message with the data from req.body and relates it to the me user passed to req.context
router.post("/", async (req, res) => {
  const message = await req.context.models.Message.create({
    text: req.body.text,
    userId: req.context.me.id
  });

  return res.send(message);
});

// Deletes a message with a provided messageId
router.delete("/:messageId", async (req, res) => {
  const result = await req.context.models.Message.destroy({
    where: { id: req.params.messageId }
  });

  return res.send(true);
});

export default router;
```
