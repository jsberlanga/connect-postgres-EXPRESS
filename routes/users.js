const express = require("express");
const router = express.Router();

/* GET users listing. */
router.get("/", async (req, res) => {
  const users = await req.context.models.User.findAll();
  return res.json(users);
});

router.get("/:userId", async (req, res) => {
  const user = await req.context.models.User.findByPk(req.params.userId);
  return res.json(user);
});

module.exports = router;
