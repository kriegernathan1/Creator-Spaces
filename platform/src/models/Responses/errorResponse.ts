import { HttpStatusCode } from "../../enums/ResponseCodes";
import { ResponseMessages } from "../../enums/ResponseMessages";
import { IBaseResponse, BaseResponse } from "./Response";

export interface IErrorResponse extends IBaseResponse {
  error: {
    message: string;
  };
}

export function ErrorResponse(
  code: HttpStatusCode,
  message: ResponseMessages
): IErrorResponse {
  const res = BaseResponse(code);
  return {
    ...res,
    error: {
      message,
    },
  };
}
