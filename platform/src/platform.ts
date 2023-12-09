import express from "express";
import postRouter from "./services/post/postService";
import userRouter from "./services/user/UserService";
import dotenv from "dotenv";
import { setupServices } from "./internal-services/ServiceManager";

dotenv.config();
setupServices();

const app = express();
const PORT = process.env.PLATFORM_PORT;

app.use(express.json());
app.use("/user-service", userRouter);
app.use("/post-service", postRouter);

app.listen(PORT, () => {
  console.log(`Lisening on port ${PORT}`);
});
