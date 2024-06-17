import { Response } from "express";
import { ResponseCode } from "../../enums/ResponseCodes";

export type BaseResponse = {
  code: ResponseCode;
};

export type DataResponse<T> = BaseResponse & {
  data: T;
};

export function BaseResponseFactory(code: ResponseCode): BaseResponse {
  return {
    code,
  };
}

export function SendResponse(
  expressResponse: Response,
  response: BaseResponse,
): void {
  expressResponse.status(response.code).json(response);
}
