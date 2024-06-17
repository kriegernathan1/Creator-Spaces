import { z } from "zod";
import {
  SigninResponse,
  SuccessfulSigninResponse,
} from "../../models/Responses/UserResponses";
import { BaseResponse } from "../../models/Responses/Response";
import { ErrorResponse } from "../../models/Responses/errorResponse";

export const BaseResponseSchema = z
  .object({
    code: z.coerce.number(),
  })
  .strict() satisfies z.ZodType<BaseResponse>;

export const ErrorResponseSchema = BaseResponseSchema.extend({
  error: z.object({
    message: z.string(),
  }),
}).strict() satisfies z.ZodType<ErrorResponse>;

export const SuccessfulSigninResponseSchema = BaseResponseSchema.extend({
  token: z.string(),
}).strict() satisfies z.ZodType<SuccessfulSigninResponse>;
