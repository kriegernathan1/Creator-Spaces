import express, { NextFunction, Request, Response } from "express";
import postRouter from "./services/post/postService";
import userRouter from "./services/user/UserService";
import dotenv from "dotenv";
import { setupServices } from "./internal-services/ServiceManager";
import { expressjwt } from "express-jwt";
import { ErrorResponse } from "./models/Responses/errorResponse";
import { HttpStatusCode } from "./enums/ResponseCodes";
import { ResponseMessages } from "./enums/ResponseMessages";

dotenv.config();
setupServices();

const app = express();
const PORT = process.env.PLATFORM_PORT;

export const isAuthorizedMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!(req as any).auth) {
    res.json(
      ErrorResponse(
        HttpStatusCode.Unauthorized,
        ResponseMessages.UnauthorizedAction
      )
    );
    next(HttpStatusCode.Unauthorized);
  }

  next();
};

const handleExpressJwtErrors = (
  err: Error,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.name === "UnauthorizedError") {
    res.json(
      ErrorResponse(
        HttpStatusCode.Unauthorized,
        ResponseMessages.UnauthorizedAction
      )
    );
    next(HttpStatusCode.Unauthorized);
  }
};

app.use(express.json());
app.use(
  expressjwt({
    secret: process.env.JWT_SECRET!,
    algorithms: ["HS256"],
    credentialsRequired: false,
  })
);
app.use(handleExpressJwtErrors);
app.use("/user-service", userRouter);
app.use("/post-service", isAuthorizedMiddleware, postRouter);

app.listen(PORT, () => {
  console.log(`Lisening on port ${PORT}`);
});
