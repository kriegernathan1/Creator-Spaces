import { Response } from "express";
import { ResponseCode } from "../../enums/ResponseCodes";

export type BaseResponse = {
  code: number;
};

export function BaseResponseFactory(code: ResponseCode): BaseResponse {
  return {
    code,
  };
}

export function CreateResponse(
  expressResponse: Response,
  response: BaseResponse,
): void {
  expressResponse.status(response.code).json(response);
}
