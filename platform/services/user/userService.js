const express = require("express");

const userRouter = express.Router({ mergeParams: true });

userRouter.get("/users", (req, res) => {
  res.send("get all users");
});

userRouter.get("/:id", (req, res) => {
  res.send(`get user id ${req.params.id}`);
});

userRouter.get("*", (req, res) => {
  res.send("got to user fallback route");
});

module.exports = userRouter;
