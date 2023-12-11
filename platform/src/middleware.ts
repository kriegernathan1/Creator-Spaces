import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "./enums/ResponseCodes";
import { ResponseMessages } from "./enums/ResponseMessages";
import { ErrorResponseFactory } from "./models/Responses/errorResponse";
import { AuthenticatedRequest } from "./platform";
import { JwtPayloadSchema } from "./internal-services/Security/SecurityService";

// WARNING: Middleware must load before routes are defined or error will be thrown by express

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

  if (
    JwtPayloadSchema.safeParse((req as AuthenticatedRequest).auth).success ===
    false
  ) {
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
  }
};
