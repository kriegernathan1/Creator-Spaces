import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "./enums/ResponseCodes";
import { ResponseMessages } from "./enums/ResponseMessages";
import {
  JwtToken,
  JwtTokenSchema,
} from "./internal-services/Security/SecurityService";
import { ErrorResponseFactory } from "./models/Responses/errorResponse";

// WARNING: Middleware must load before routes are defined or error will be thrown by express

export interface AuthenticatedRequest extends Request {
  auth: JwtToken;
}

export function isAuthorizedMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
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

  next();
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
