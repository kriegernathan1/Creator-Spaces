import { ResponseMessages } from "../../enums/ResponseMessages";
import { IBaseResponse, BaseResponse } from "./Response";

export interface IErrorResponse extends IBaseResponse {
  error: {
    message: string;
  };
}

export function ErrorResponse(
  code: number,
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
