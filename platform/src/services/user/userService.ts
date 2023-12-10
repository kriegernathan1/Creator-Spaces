import { Request, Response, Router } from "express";
import { HttpStatusCode } from "../../enums/ResponseCodes";
import { ResponseMessages } from "../../enums/ResponseMessages";
import { userService } from "../../internal-services/ServiceManager";
import {
  SignUpFieldsSchema,
  SigninFields,
  SigninFieldsSchema,
  SignupFields,
} from "../../internal-services/User/UserService";
import { ErrorResponse } from "../../models/Responses/errorResponse";
import { AuthenticatedRequest } from "../../platform";

const userRouter = Router({ mergeParams: true });

userRouter.post("/signup", async (req: Request, res: Response) => {
  if (SignUpFieldsSchema.safeParse(req.body).success === false) {
    res.json(
      ErrorResponse(HttpStatusCode.BadRequest, ResponseMessages.BadRequest)
    );

    return;
  }

  res.json(await userService.signup(req.body as SignupFields));
});

userRouter.post("/signin", async (req: Request, res: Response) => {
  if (SigninFieldsSchema.safeParse(req.body).success === false) {
    res.json(
      ErrorResponse(HttpStatusCode.BadRequest, ResponseMessages.BadRequest)
    );
    return;
  }

  res.json(await userService.signin(req.body as SigninFields));
});

userRouter.get("/users", async (req: Request, res: Response) => {
  const jwt = (req as AuthenticatedRequest).auth;
  const users = await userService.getUsers(jwt.namespace);

  res.json({
    users,
  });
});

export default userRouter;
