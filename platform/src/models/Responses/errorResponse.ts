import { HttpStatusCode } from "../../enums/ResponseCodes";
import { ResponseMessages } from "../../enums/ResponseMessages";
import { BaseResponse, BaseResponseFactory } from "./Response";

export type ErrorResponse = BaseResponse & {
  error: {
    message: string;
  };
};

export function ErrorResponseFactory(
  code: HttpStatusCode,
  message: ResponseMessages,
): ErrorResponse {
  const res = BaseResponseFactory(code);
  return {
    ...res,
    error: {
      message,
    },
  };
}
