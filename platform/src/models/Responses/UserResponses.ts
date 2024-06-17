import { ResponseCode } from "../../enums/ResponseCodes";
import { EncodedJwtToken } from "../../internal-services/Security/SecurityService";
import { BaseResponse, BaseResponseFactory } from "./Response";
import { ErrorResponse } from "./errorResponse";
import { PlatformResponse } from "./types";

export type SuccessfulSigninResponse = BaseResponse & {
  token: string;
};

export type SigninResponse = SuccessfulSigninResponse | PlatformResponse;

export function SigninResponseFactory(
  code: ResponseCode,
  token: EncodedJwtToken,
): SigninResponse {
  return {
    ...BaseResponseFactory(code),
    token,
  };
}

export type UpdateUserResponse = (BaseResponse & {}) | ErrorResponse;

export type RefreshTokenResponse = SigninResponse;

export function RefreshTokenResponseFactory(
  code: ResponseCode,
  token: EncodedJwtToken,
): RefreshTokenResponse {
  return SigninResponseFactory(code, token);
}
