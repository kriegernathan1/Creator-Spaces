import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "./enums/ResponseCodes";
import { ResponseMessages } from "./enums/ResponseMessages";
import {
  JwtToken,
  JwtTokenSchema,
} from "./internal-services/Security/SecurityService";
import { ErrorResponseFactory } from "./models/Responses/errorResponse";
import { UserTable } from "./internal-services/Database/types";

// WARNING: Middleware must load before routes are defined or error will be thrown by express

export interface AuthenticatedRequest extends Request {
  auth: JwtToken;
}

export function isAuthorizedMiddlewareFactory(
  authorizedRoles: UserTable["role"][] = [],
) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!(req as any).auth) {
      res.json(
        ErrorResponseFactory(
          HttpStatusCode.Unauthorized,
          ResponseMessages.UnauthorizedAction,
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

    const jwt = jwtParseResult.data;
    if (authorizedRoles.includes(jwt.role) === false) {
      res.json(
        ErrorResponseFactory(
          HttpStatusCode.Unauthorized,
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
        ResponseMessages.UnauthorizedAction,
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
