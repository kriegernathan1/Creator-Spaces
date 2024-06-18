import { Request, Response, Router } from "express";
import { userServiceEndpoints } from ".";
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
  RedactedUser,
  SigninFields,
  SigninFieldsSchema,
} from "../../internal-services/User/UserService";
import {
  AuthenticatedRequest,
  isAuthorized,
  isSchemaValid,
} from "../../middleware";
import {
  BaseResponseFactory,
  DataResponse,
  SendResponse,
} from "../../models/Responses/Response";
import { ErrorResponseFactory } from "../../models/Responses/errorResponse";
import { isAuthorizedToPerformUserAction } from "./middleware";

const userRouter = Router({ mergeParams: true });

const {
  signup,
  signin,
  fetchUsers,
  refreshToken,
  fetchUser,
  createUser,
  updateUser,
  deleteUser,
} = userServiceEndpoints;

userRouter.post(
  signup.path,
  isSchemaValid(NewUserSchema),
  async (req: Request, res: Response) => {
    const newUserFields = req.body as NewUser;
    const allowedPublicAssignedRoles = ["user"];

    if (!allowedPublicAssignedRoles.includes(newUserFields.role)) {
      SendResponse(
        res,
        ErrorResponseFactory(
          HttpStatusCode.Forbidden,
          ResponseMessages.UnauthorizedAction,
        ),
      );
      return;
    }

    SendResponse(res, await userService.signup(req.body as NewUser));
  },
);

userRouter.post(
  signin.path,
  isSchemaValid(SigninFieldsSchema),
  async (req: Request, res: Response) => {
    SendResponse(res, await userService.signin(req.body as SigninFields));
  },
);

userRouter.get(
  fetchUsers.path,
  isAuthorized(fetchUsers.permissions),
  async (req: Request, res: Response) => {
    const jwt = (req as AuthenticatedRequest).auth;
    const users = await userService.getUsers(jwt.namespace);

    const response = {
      ...BaseResponseFactory(HttpStatusCode.Ok),
      data: users,
    };

    SendResponse(res, response);
  },
);

userRouter.get(
  refreshToken.path,
  isAuthorized(refreshToken.permissions),
  async (req: Request, res: Response) => {
    const oldToken = (req as AuthenticatedRequest).auth;
    res.json(userService.refreshToken(oldToken));
  },
);

userRouter.get(
  fetchUser.path,
  isAuthorized(fetchUser.permissions),
  isAuthorizedToPerformUserAction(
    fetchUser.routeParams![0],
    fetchUser.permissions[0],
  ),
  async (req: Request, res: Response) => {
    const userJwt = (req as AuthenticatedRequest).auth;
    const queriedUserId = req.params[fetchUser.routeParams![0]];

    const user = await userService.getUser(queriedUserId ?? userJwt.userId);

    const resBody: DataResponse<RedactedUser | {}> = {
      code: HttpStatusCode.Ok,
      data: user ?? {},
    };
    SendResponse(res, resBody);
  },
);

userRouter.post(
  createUser.path,
  isAuthorized(createUser.permissions),
  isSchemaValid(NewUserSchema),
  async (req: Request, res: Response) => {
    SendResponse(res, await userService.signup(req.body as NewUser));
  },
);

userRouter.put(
  updateUser.path,
  isAuthorized(updateUser.permissions),
  isAuthorizedToPerformUserAction(updateUser.routeParams![0], "update_user"),
  isSchemaValid(UpdateUserSchema),
  async (req: Request, res: Response) => {
    const authenticatedUserJwt = (req as AuthenticatedRequest).auth;
    const queriedUserId = req.params[updateUser.routeParams![0]];

    const user = req.body as UpdateUser;
    SendResponse(
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
  deleteUser.path,
  isAuthorized(deleteUser.permissions),
  isAuthorizedToPerformUserAction(
    deleteUser.routeParams![0],
    deleteUser.permissions[0],
  ),
  async (req: Request, res: Response) => {
    const queriedUserId = req.params[deleteUser.routeParams![0]];
    const authenticatedUserJwt = (req as AuthenticatedRequest).auth;

    SendResponse(
      res,
      await userService.deleteUser(
        queriedUserId ?? authenticatedUserJwt.userId,
        authenticatedUserJwt.namespace,
      ),
    );
  },
);

export default userRouter;
