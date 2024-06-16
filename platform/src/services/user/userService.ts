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
import { AuthenticatedRequest, isAuthorized } from "../../middleware";
import { CreateResponse } from "../../models/Responses/Response";
import { ErrorResponseFactory } from "../../models/Responses/errorResponse";
import { isAuthorizedToPerformUserAction } from "./middleware";

const userRouter = Router({ mergeParams: true });

const FETCH_USER_ID_ROUTE_PARAM = "id";
const UPDATE_USER_ID_ROUTE_PARAM = "id";
const DELETE_USER_ID_ROUTE_PARAM = "id";

userRouter.post("/signup", async (req: Request, res: Response) => {
  if (NewUserSchema.safeParse(req.body).success === false) {
    CreateResponse(
      res,
      ErrorResponseFactory(
        HttpStatusCode.BadRequest,
        ResponseMessages.BadRequest,
      ),
    );
    return;
  }

  const newUserFields = req.body as NewUser;
  const allowedPublicAssignedRoles = ["user"];
  if (!allowedPublicAssignedRoles.includes(newUserFields.role)) {
    CreateResponse(
      res,
      ErrorResponseFactory(
        HttpStatusCode.Forbidden,
        ResponseMessages.UnauthorizedAction,
      ),
    );
    return;
  }

  CreateResponse(res, await userService.signup(req.body as NewUser));
});

userRouter.post("/signin", async (req: Request, res: Response) => {
  if (SigninFieldsSchema.safeParse(req.body).success === false) {
    CreateResponse(
      res,
      ErrorResponseFactory(
        HttpStatusCode.BadRequest,
        ResponseMessages.BadRequest,
      ),
    );
    return;
  }

  CreateResponse(res, await userService.signin(req.body as SigninFields));
});

userRouter.get(
  "/users",
  isAuthorized(["get_users"]),
  async (req: Request, res: Response) => {
    const jwt = (req as AuthenticatedRequest).auth;
    const users = await userService.getUsers(jwt.namespace);

    res.json(users);
  },
);

userRouter.get(
  "/user/refreshToken",
  isAuthorized(),
  async (req: Request, res: Response) => {
    const oldToken = (req as AuthenticatedRequest).auth;
    res.json(userService.refreshToken(oldToken));
  },
);

userRouter.get(
  `/user/:${FETCH_USER_ID_ROUTE_PARAM}?`,
  isAuthorized(["get_user", "get_user_self"]),
  isAuthorizedToPerformUserAction(FETCH_USER_ID_ROUTE_PARAM, "get_user"),
  async (req: Request, res: Response) => {
    const userJwt = (req as AuthenticatedRequest).auth;
    const queriedUserId = req.params[FETCH_USER_ID_ROUTE_PARAM];

    const user = await userService.getUser(queriedUserId ?? userJwt.userId);
    res.json(user);
  },
);

userRouter.post(
  `/user/create`,
  isAuthorized(["create_user"]),
  async (req: Request, res: Response) => {
    if (NewUserSchema.safeParse(req.body).success === false) {
      CreateResponse(
        res,
        ErrorResponseFactory(
          HttpStatusCode.BadRequest,
          ResponseMessages.BadRequest,
        ),
      );
      return;
    }

    CreateResponse(res, await userService.signup(req.body as NewUser));
  },
);

userRouter.put(
  `/user/:${UPDATE_USER_ID_ROUTE_PARAM}?`,
  isAuthorized(["update_user", "update_user_self"]),
  isAuthorizedToPerformUserAction(UPDATE_USER_ID_ROUTE_PARAM, "update_user"),
  async (req: Request, res: Response) => {
    const authenticatedUserJwt = (req as AuthenticatedRequest).auth;
    const queriedUserId = req.params[UPDATE_USER_ID_ROUTE_PARAM];

    const badRequest = ErrorResponseFactory(
      HttpStatusCode.BadRequest,
      ResponseMessages.BadRequest,
    );

    if (UpdateUserSchema.safeParse(req.body).success === false) {
      CreateResponse(res, badRequest);
      return;
    }

    const user = req.body as UpdateUser;
    CreateResponse(
      res,
      await userService.updateUser(
        queriedUserId ?? authenticatedUserJwt.userId,
        authenticatedUserJwt.namespace,
        user,
      ),
    );
  },
);

userRouter.delete(
  `/user/:${DELETE_USER_ID_ROUTE_PARAM}?`,
  isAuthorized(["delete_user", "delete_user_self"]),
  isAuthorizedToPerformUserAction(DELETE_USER_ID_ROUTE_PARAM, "delete_user"),
  async (req: Request, res: Response) => {
    const queriedUserId = req.params[DELETE_USER_ID_ROUTE_PARAM];
    const authenticatedUserJwt = (req as AuthenticatedRequest).auth;

    CreateResponse(
      res,
      await userService.deleteUser(
        queriedUserId ?? authenticatedUserJwt.userId,
        authenticatedUserJwt.namespace,
      ),
    );
  },
);

export default userRouter;
