import dotenv from "dotenv";
import express from "express";
import { expressjwt } from "express-jwt";
import { setupServices } from "./internal-services/ServiceManager";
import { handleExpressJwtErrors, isAuthorized } from "./middleware";
import postRouter from "./services/post/postService";
import userRouter from "./services/user/userService";

dotenv.config();
setupServices();

const app = express();
const PORT = process.env.PLATFORM_PORT;

app.use(express.json());
app.use(
  expressjwt({
    secret: process.env.JWT_SECRET!,
    algorithms: ["HS256"],
    credentialsRequired: false,
  }),
);
app.use(handleExpressJwtErrors);
app.use("/user-service", userRouter);
app.use("/post-service", isAuthorized(), postRouter);

app.listen(PORT, () => {
  console.log(`Lisening on port ${PORT}`);
});
