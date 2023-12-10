import { ResponseCode } from "../../enums/ResponseCodes";
import { BaseResponse, BaseResponseFactory } from "./Response";
import { ErrorResponse } from "./errorResponse";
import { PlatformResponse } from "./types";

export type SigninResponse =
  | (BaseResponse & {
      token: string;
    })
  | PlatformResponse;

export function SigninResponseFactory(
  code: ResponseCode,
  token: string,
): SigninResponse {
  return {
    ...BaseResponseFactory(code),
    token,
  };
}

export type UpdateUserResponse = (BaseResponse & {}) | ErrorResponse;
