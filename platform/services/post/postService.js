const express = require("express");
const postRouter = express.Router({ mergeParams: true });

postRouter.get("/posts", (req, res) => {
  res.send("get all posts");
});

postRouter.get("/post/:id", (req, res) => {
  res.send(`get post id ${req.params.id}`);
});

module.exports = postRouter;
