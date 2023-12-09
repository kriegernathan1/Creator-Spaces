import express from "express";
import postRouter from "./services/post/postService";
import userRouter from "./services/user/userService";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PLATFORM_PORT;

app.use("/user-service", userRouter);
app.use("/post-service", postRouter);

app.listen(PORT, () => {
  console.log(`Lisening on port ${PORT}`);
});
