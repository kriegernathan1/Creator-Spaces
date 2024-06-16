import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { HttpStatusCode } from "../../enums/ResponseCodes";
import { ResponseMessages } from "../../enums/ResponseMessages";
import {
  Permission,
  RolePermissionMap,
} from "../../internal-services/Role/role";
import { AuthenticatedRequest } from "../../middleware";
import { CreateResponse } from "../../models/Responses/Response";
import { ErrorResponseFactory } from "../../models/Responses/errorResponse";

export const isAuthorizedToPerformUserAction = (
  idRouteParam: string,
  genericActionPermission: Permission,
) => {
  return function (req: Request, res: Response, next: NextFunction) {
    const queriedUserId = req.params[idRouteParam];
    const authenticatedUserJwt = (req as AuthenticatedRequest).auth;
    const authenticatedUserPermissions =
      RolePermissionMap[authenticatedUserJwt.role].permissions;

    if (
      authenticatedUserPermissions.includes(genericActionPermission) ===
        false &&
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

    next();
  };
};
