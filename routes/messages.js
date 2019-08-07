var express = require("express");
var router = express.Router();

router.get("/", async (req, res) => {
  const messages = await req.context.models.Message.findAll();
  return res.json(messages);
});

router.get("/add", (req, res, next) => {
  res.render("messages", {
    title: "Add a New message"
  });
});

router.post("/add", async (req, res) => {
  const message = await req.context.models.Message.create({
    text: req.body.text,
    userId: req.context.me.id
  });
  console.log({ message: message, context: req.context.me });

  return res.redirect("/messages/add");
});

router.get("/:messageId", async (req, res) => {
  const message = await req.context.models.Message.findByPk(
    req.params.messageId
  );
  return res.json(message);
});

router.delete("/:messageId", async (req, res) => {
  const result = await req.context.models.Message.destroy({
    where: { id: req.params.messageId }
  });

  return res.send(true);
});

module.exports = router;
