import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { HttpStatusCode } from "./enums/ResponseCodes";
import { ResponseMessages } from "./enums/ResponseMessages";
import { Permission, RolePermissionMap } from "./internal-services/Role/role";
import {
  JwtToken,
  JwtTokenSchema,
} from "./internal-services/Security/SecurityService";
import { SendResponse } from "./models/Responses/Response";
import { ErrorResponseFactory } from "./models/Responses/errorResponse";

// WARNING: Middleware must load before routes are defined or error will be thrown by express

export interface AuthenticatedRequest extends Request {
  auth: JwtToken;
}

export function isAuthorized(authorizedPermissions: Permission[] = []) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!(req as any).auth) {
      SendResponse(
        res,
        ErrorResponseFactory(
          HttpStatusCode.Unauthorized,
          ResponseMessages.UnauthenticatedAction,
        ),
      );

      return;
    }

    const jwtParseResult = JwtTokenSchema.safeParse(
      (req as AuthenticatedRequest).auth,
    );
    if (jwtParseResult.success === false) {
      SendResponse(
        res,
        ErrorResponseFactory(
          HttpStatusCode.InternalServerError,
          ResponseMessages.InternalServerError,
        ),
      );
      return;
    }

    const userPermissions =
      RolePermissionMap[jwtParseResult.data.role].permissions;

    let isAuthorized = false;
    for (const permission of authorizedPermissions) {
      if (userPermissions.includes(permission)) {
        isAuthorized = true;
        break;
      }
    }

    if (isAuthorized === false && authorizedPermissions.length > 0) {
      SendResponse(
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
}

export const handleExpressJwtErrors = (
  err: Error,
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err.name === "UnauthorizedError") {
    SendResponse(
      res,
      ErrorResponseFactory(
        HttpStatusCode.Unauthorized,
        ResponseMessages.UnauthenticatedAction,
      ),
    );
    next(HttpStatusCode.Unauthorized);
    return;
  }

  console.warn("Unhandled error from jwt Express");
  SendResponse(
    res,
    ErrorResponseFactory(
      HttpStatusCode.InternalServerError,
      ResponseMessages.InternalServerError,
    ),
  );
};

export function isSchemaValid(schema: z.ZodTypeAny) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (schema.safeParse(req.body).success === false) {
      SendResponse(
        res,
        ErrorResponseFactory(
          HttpStatusCode.BadRequest,
          ResponseMessages.BadRequest,
        ),
      );
      return;
    }

    next();
  };
}
