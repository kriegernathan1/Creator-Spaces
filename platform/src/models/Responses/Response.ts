import { ResponseCode } from "../../enums/ResponseCodes";

export type BaseResponse = {
  code: number;
};

export function BaseResponseFactory(code: ResponseCode): BaseResponse {
  return {
    code,
  };
}
