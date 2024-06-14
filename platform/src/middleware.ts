import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "./enums/ResponseCodes";
import { ResponseMessages } from "./enums/ResponseMessages";
import {
  JwtToken,
  JwtTokenSchema,
} from "./internal-services/Security/SecurityService";
import { ErrorResponseFactory } from "./models/Responses/errorResponse";
import { UserTable } from "./internal-services/Database/types";
import { ActiveRoles, Permission } from "./internal-services/Role/role";

// WARNING: Middleware must load before routes are defined or error will be thrown by express

export interface AuthenticatedRequest extends Request {
  auth: JwtToken;
}

export function isAuthorizedMiddlewareFactory(
  authorizedPermissions: Permission[] = [],
) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!(req as any).auth) {
      res.json(
        ErrorResponseFactory(
          HttpStatusCode.Unauthorized,
          ResponseMessages.UnauthenticatedAction,
        ),
      );

      next(HttpStatusCode.Unauthorized);
    }

    const jwtParseResult = JwtTokenSchema.safeParse(
      (req as AuthenticatedRequest).auth,
    );
    if (jwtParseResult.success === false) {
      res.json(
        ErrorResponseFactory(
          HttpStatusCode.InternalServerError,
          ResponseMessages.InternalServerError,
        ),
      );
      return;
    }

    const userPermissions = ActiveRoles[jwtParseResult.data.role].permissions;

    let isAuthorized = false;
    for (const permission of authorizedPermissions) {
      if (userPermissions.includes(permission)) {
        isAuthorized = true;
        break;
      }
    }

    if (isAuthorized === false) {
      res.json(
        ErrorResponseFactory(
          HttpStatusCode.Forbidden,
          ResponseMessages.UnauthorizedAction,
        ),
      );

      return;
    }

    next();
  };
}

export const handleExpressJwtErrors = (
  err: Error,
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err.name === "UnauthorizedError") {
    res.json(
      ErrorResponseFactory(
        HttpStatusCode.Unauthorized,
        ResponseMessages.UnauthenticatedAction,
      ),
    );
    next(HttpStatusCode.Unauthorized);
    return;
  }

  console.warn("Unhandled error from jwt Express");
  res.json(
    ErrorResponseFactory(
      HttpStatusCode.InternalServerError,
      ResponseMessages.InternalServerError,
    ),
  );
};
