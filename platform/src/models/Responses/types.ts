import { BaseResponse } from "./Response";
import { ErrorResponse, ErrorResponseFactory } from "./errorResponse";

export type PlatformResponse = ErrorResponse | BaseResponse;
