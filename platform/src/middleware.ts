import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "./enums/ResponseCodes";
import { ResponseMessages } from "./enums/ResponseMessages";
import { JwtPayloadSchema } from "./internal-services/User/UserService";
import { ErrorResponse } from "./models/Responses/errorResponse";
import { AuthenticatedRequest } from "./platform";

// WARNING: Middleware must load before routes are defined or error will be thrown by express

export function isAuthorizedMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!(req as any).auth) {
    res.json(
      ErrorResponse(
        HttpStatusCode.Unauthorized,
        ResponseMessages.UnauthorizedAction
      )
    );

    next(HttpStatusCode.Unauthorized);
  }

  if (
    JwtPayloadSchema.safeParse((req as AuthenticatedRequest).auth).success ===
    false
  ) {
    res.json(
      ErrorResponse(HttpStatusCode.BadRequest, ResponseMessages.BadRequest)
    );
    return;
  }

  next();
}

export const handleExpressJwtErrors = (
  err: Error,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.name === "UnauthorizedError") {
    res.json(
      ErrorResponse(
        HttpStatusCode.Unauthorized,
        ResponseMessages.UnauthorizedAction
      )
    );
    next(HttpStatusCode.Unauthorized);
  }
};
