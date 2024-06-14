import { Request, Response, Router } from "express";
import { HttpStatusCode } from "../../enums/ResponseCodes";
import { ResponseMessages } from "../../enums/ResponseMessages";
import {
  NewUser,
  NewUserSchema,
  UpdateUser,
  UpdateUserSchema,
} from "../../internal-services/Database/types";
import { userService } from "../../internal-services/ServiceManager";
import {
  SigninFields,
  SigninFieldsSchema,
} from "../../internal-services/User/UserService";
import {
  AuthenticatedRequest,
  isAuthorizedMiddlewareFactory,
} from "../../middleware";
import { ErrorResponseFactory } from "../../models/Responses/errorResponse";

const userRouter = Router({ mergeParams: true });

userRouter.post("/signup", async (req: Request, res: Response) => {
  if (NewUserSchema.safeParse(req.body).success === false) {
    res.json(
      ErrorResponseFactory(
        HttpStatusCode.BadRequest,
        ResponseMessages.BadRequest,
      ),
    );
    return;
  }

  res.json(await userService.signup(req.body as NewUser));
});

userRouter.post("/signin", async (req: Request, res: Response) => {
  if (SigninFieldsSchema.safeParse(req.body).success === false) {
    res.json(
      ErrorResponseFactory(
        HttpStatusCode.BadRequest,
        ResponseMessages.BadRequest,
      ),
    );
    return;
  }

  res.json(await userService.signin(req.body as SigninFields));
});

userRouter.get(
  "/users",
  isAuthorizedMiddlewareFactory(["get_users"]),
  async (req: Request, res: Response) => {
    const jwt = (req as AuthenticatedRequest).auth;
    const users = await userService.getUsers(jwt.namespace);

    res.json({
      users,
    });
  },
);

userRouter.get(
  "/user/refreshToken",
  isAuthorizedMiddlewareFactory(),
  async (req: Request, res: Response) => {
    const oldToken = (req as AuthenticatedRequest).auth;
    res.json(userService.refreshToken(oldToken));
  },
);

userRouter.get(
  "/user/:id?",
  isAuthorizedMiddlewareFactory(["get_user"]),
  async (req: Request, res: Response) => {
    const userId = req.params["id"];
    if (!userId) {
      res.json(
        ErrorResponseFactory(
          HttpStatusCode.BadRequest,
          ResponseMessages.BadRequest,
        ),
      );
      return;
    }

    const user = await userService.getUser(userId);
    res.json({
      user: user ?? {},
    });
  },
);

const USER_ID_PARAM = "id";
userRouter.put(
  `/user/:${USER_ID_PARAM}?`,
  isAuthorizedMiddlewareFactory(["update_user", "update_user_self"]),
  async (req: Request, res: Response) => {
    const badRequest = ErrorResponseFactory(
      HttpStatusCode.BadRequest,
      ResponseMessages.BadRequest,
    );

    const queriedUserId = req.params[USER_ID_PARAM];
    if (!queriedUserId) {
      res.json(badRequest);
      return;
    }
    if (UpdateUserSchema.safeParse(req.body).success === false) {
      res.json(badRequest);
      return;
    }

    const jwt = (req as AuthenticatedRequest).auth;
    const user = req.body as UpdateUser;
    res.json(await userService.updateUser(queriedUserId, jwt.namespace, user));
  },
);

userRouter.delete(
  "/user/:id?",
  isAuthorizedMiddlewareFactory(["delete_user", "delete_user_self"]),
  async (req: Request, res: Response) => {
    const badRequest = ErrorResponseFactory(
      HttpStatusCode.BadRequest,
      ResponseMessages.BadRequest,
    );

    const userId = req.params["id"];
    if (!userId) {
      res.json(badRequest);
      return;
    }

    const jwt = (req as AuthenticatedRequest).auth;
    res.json(await userService.deleteUser(userId, jwt.namespace));
  },
);

export default userRouter;
