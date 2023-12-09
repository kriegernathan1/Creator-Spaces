import { ResponseCode } from "../../enums/ResponseCodes";

export interface IBaseResponse {
  code: number;
}

export function BaseResponse(code: ResponseCode): IBaseResponse {
  return {
    code,
  };
}
