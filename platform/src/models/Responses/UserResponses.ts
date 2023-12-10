import { ResponseCode } from "../../enums/ResponseCodes";
import { ResponseMessages } from "../../enums/ResponseMessages";
import { IJwtPayload } from "../../internal-services/User/UserService";
import { BaseResponse, IBaseResponse } from "./Response";

export interface ISigninResponse extends IBaseResponse {
  token: string;
}

export function SigninResponse(
  code: ResponseCode,
  token: string
): ISigninResponse {
  return {
    ...BaseResponse(code),
    token,
  };
}
