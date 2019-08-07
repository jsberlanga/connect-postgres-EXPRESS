const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const helmet = require("helmet");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const messagesRouter = require("./routes/messages");

import models, { sequelize } from "./models";
const eraseDatabaseOnSync = true;

const app = express();
app.use(helmet());

app.use(async (req, res, next) => {
  req.context = {
    models,
    // we pass in the context an initialized fake login user
    me: await models.User.findByLogin("juliosoto")
  };
  next();
});

// view engine setup - jade/pug
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/messages", messagesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    createUsersWithMessages();
  }
  app.listen(5000, () => console.log(`app listening on port 5000!`));
});

const createUsersWithMessages = async () => {
  await models.User.create(
    {
      username: "juliosoto",
      messages: [
        {
          text: "Postgres and Sequelize"
        }
      ]
    },
    {
      include: [models.Message]
    }
  );
  await models.User.create(
    {
      username: "ignacysoto",
      messages: [
        {
          text: "Playing with crocodile"
        },
        {
          text: "Eating first carrot"
        }
      ]
    },
    {
      include: [models.Message]
    }
  );
};
