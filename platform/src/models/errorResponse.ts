import { PlatformResponse, Response } from "./Response";

export interface ErrorResponse extends PlatformResponse {
  error: {
    message: string;
  };
}

export function Error(code: number, message: string): ErrorResponse {
  const res = Response(code);
  return {
    ...res,
    error: {
      message,
    },
  };
}
