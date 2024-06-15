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
import { CreateResponse } from "../../models/Responses/Response";
import { RolePermissionMap } from "../../internal-services/Role/role";

const userRouter = Router({ mergeParams: true });

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

  res.json(await userService.signin(req.body as SigninFields));
});

userRouter.get(
  "/users",
  isAuthorizedMiddlewareFactory(["get_users"]),
  async (req: Request, res: Response) => {
    const jwt = (req as AuthenticatedRequest).auth;
    const users = await userService.getUsers(jwt.namespace);

    res.json(users);
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

const FETCH_USER_ID_ROUTE_PARAM = "id";
userRouter.get(
  `/user/:${FETCH_USER_ID_ROUTE_PARAM}?`,
  isAuthorizedMiddlewareFactory(["get_user", "get_user_self"]),
  async (req: Request, res: Response) => {
    const userJwt = (req as AuthenticatedRequest).auth;
    const authenticatedUserPermissions =
      RolePermissionMap[userJwt.role].permissions;
    const queriedUserId = req.params[FETCH_USER_ID_ROUTE_PARAM];

    if (
      authenticatedUserPermissions.includes("get_user") === false &&
      queriedUserId !== undefined &&
      queriedUserId !== userJwt.userId
    ) {
      CreateResponse(
        res,
        ErrorResponseFactory(
          HttpStatusCode.Forbidden,
          ResponseMessages.UnauthorizedAction,
        ),
      );
      return;
    }

    const user = await userService.getUser(queriedUserId ?? userJwt.userId);
    res.json({
      user: user ?? {},
    });
  },
);

userRouter.post(
  `/user/create`,
  isAuthorizedMiddlewareFactory(["create_user"]),
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

const UPDATE_USER_ID_ROUTE_PARAM = "id";
userRouter.put(
  `/user/:${UPDATE_USER_ID_ROUTE_PARAM}?`,
  isAuthorizedMiddlewareFactory(["update_user", "update_user_self"]),
  async (req: Request, res: Response) => {
    const authenticatedUserJwt = (req as AuthenticatedRequest).auth;
    const authenticatedUserPermissions =
      RolePermissionMap[authenticatedUserJwt.role].permissions;
    const queriedUserId = req.params[UPDATE_USER_ID_ROUTE_PARAM];

    const badRequest = ErrorResponseFactory(
      HttpStatusCode.BadRequest,
      ResponseMessages.BadRequest,
    );

    if (
      authenticatedUserPermissions.includes("update_user") === false &&
      queriedUserId !== undefined &&
      queriedUserId !== authenticatedUserJwt.userId
    ) {
      CreateResponse(
        res,
        ErrorResponseFactory(
          HttpStatusCode.Forbidden,
          ResponseMessages.UnauthorizedAction,
        ),
      );
      return;
    }

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

const DELETE_USER_ID_ROUTE_PARAM = "id";
userRouter.delete(
  `/user/:${DELETE_USER_ID_ROUTE_PARAM}?`,
  isAuthorizedMiddlewareFactory(["delete_user", "delete_user_self"]),
  async (req: Request, res: Response) => {
    const queriedUserId = req.params[DELETE_USER_ID_ROUTE_PARAM];
    const authenticatedUserJwt = (req as AuthenticatedRequest).auth;
    const authenticatedUserPermissions =
      RolePermissionMap[authenticatedUserJwt.role].permissions;

    if (
      authenticatedUserPermissions.includes("delete_user") === false &&
      queriedUserId !== undefined &&
      queriedUserId !== authenticatedUserJwt.userId
    ) {
      CreateResponse(
        res,
        ErrorResponseFactory(
          HttpStatusCode.Forbidden,
          ResponseMessages.UnauthorizedAction,
        ),
      );
      return;
    }

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
