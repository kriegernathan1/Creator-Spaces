import { Request, Response, Router } from "express";
import { HttpStatusCode } from "../../enums/ResponseCodes";
import { ResponseMessages } from "../../enums/ResponseMessages";
import { userService } from "../../internal-services/ServiceManager";
import {
  SignUpFieldsSchema,
  SigninFieldsSchema,
} from "../../internal-services/User/UserService";
import { ErrorResponse } from "../../models/Responses/errorResponse";

const userRouter = Router({ mergeParams: true });

userRouter.post("/signup", async (req: Request, res: Response) => {
  if (SignUpFieldsSchema.safeParse(req.body).success === false) {
    res.json(
      ErrorResponse(HttpStatusCode.BadRequest, ResponseMessages.BadRequest)
    );
    return;
  }

  res.json(await userService.signup(req.body));
});

userRouter.post("/signin", async (req: Request, res: Response) => {
  if (SigninFieldsSchema.safeParse(req.body).success === false) {
    res.json(
      ErrorResponse(HttpStatusCode.BadRequest, ResponseMessages.BadRequest)
    );
    return;
  }

  res.json(await userService.signin(req.body));
});

export default userRouter;
