import { IBaseResponse, BaseResponse } from "./Response";

export interface IErrorResponse extends IBaseResponse {
  error: {
    message: string;
  };
}

export function ErrorResponse(code: number, message: string): ErrorResponse {
  const res = BaseResponse(code);
  return {
    ...res,
    error: {
      message,
    },
  };
}
