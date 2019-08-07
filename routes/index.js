var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express with Postgres" });
});

/* POST home page. */
router.post("/", async (req, res) => {
  await req.context.models.User.create({
    username: req.body.username
  });
});

module.exports = router;
