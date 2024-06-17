import dotenv from "dotenv";
import express from "express";
import { expressjwt } from "express-jwt";
import { setupServices } from "./internal-services/ServiceManager";
import { handleExpressJwtErrors, isAuthorized } from "./middleware";
import postRouter from "./services/post/postService";
import userRouter from "./services/user/userService";
import { Services } from "./services";

dotenv.config();
setupServices();

export const app = express();

app.use(express.json());
app.use(
  expressjwt({
    secret: process.env.JWT_SECRET!,
    algorithms: ["HS256"],
    credentialsRequired: false,
  }),
);
app.use(handleExpressJwtErrors);
app.use(Services.User.path, userRouter);
app.use(Services.Post.path, isAuthorized(), postRouter);
