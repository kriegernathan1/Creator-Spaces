import express from "express";
import postRouter from "./services/post/postService";
import userRouter from "./services/user/userService";

const app = express();
const PORT = 3000;

app.use("/user", userRouter);
app.use("/post", postRouter);

app.listen(PORT, () => {
  console.log(`Lisening on port ${PORT}`);
});
