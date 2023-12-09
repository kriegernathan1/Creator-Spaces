import { IBaseResponse } from "./Response";
import { IErrorResponse } from "./errorResponse";

export type PlatformResponse = IErrorResponse | IBaseResponse;
