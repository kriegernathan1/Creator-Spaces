import { z } from "zod";
import { IUserRepository } from "../../Repositories/UserRepository";
import { HttpStatusCode } from "../../enums/ResponseCodes";
import { ResponseMessages } from "../../enums/ResponseMessages";
import { BaseResponse } from "../../models/Responses/Response";
import {
  ISigninResponse,
  SigninResponse,
} from "../../models/Responses/UserResponses";
import { ErrorResponse } from "../../models/Responses/errorResponse";
import { PlatformResponse } from "../../models/Responses/types";
import { NewUser, NewUserSchema, User } from "../Database/types";
import { ISecurityService } from "../Security/SecurityService";

export interface SignupFields extends NewUser {
  passwordRepeated: string;
}

export const SignUpFieldsSchema = NewUserSchema.and(
  z.object({
    passwordRepeated: z.string(),
  })
) satisfies z.ZodType<SignupFields>;

export interface SigninFields {
  email: string;
  password: string;
}

export const SigninFieldsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
}) satisfies z.ZodType<SigninFields>;

export interface IJwtPayload {
  userId: string;
  namespace: string;
}

export const JwtPayloadSchema = z.object({
  userId: z.string(),
  namespace: z.string(),
}) satisfies z.ZodType<IJwtPayload>;

export interface IUserService {
  signup(fields: SignupFields): Promise<PlatformResponse>;
  signin(fields: SigninFields): Promise<ISigninResponse | PlatformResponse>;
  getUsers(namespace: string): Promise<User[]>;
}

interface Dependencies {
  userRepository: IUserRepository;
  securityService: ISecurityService;
}

export class UserService implements IUserService {
  private userRepository: IUserRepository;
  private securityService: ISecurityService;

  constructor(private dependencies: Dependencies) {
    this.userRepository = this.dependencies.userRepository;
    this.securityService = this.dependencies.securityService;
  }

  async signup(fields: SignupFields): Promise<PlatformResponse> {
    if (fields.passwordRepeated !== fields.password) {
      const errResponse = ErrorResponse(
        HttpStatusCode.BadRequest,
        ResponseMessages.PasswordsDontMatch
      );
      return Promise.resolve(errResponse);
    }

    if (this.securityService.isPasswordStrong(fields.password) === false) {
      return ErrorResponse(
        HttpStatusCode.BadRequest,
        ResponseMessages.WeakPassword
      );
    }

    delete (fields as any).passwordRepeated;

    const hashedPassword = await this.securityService.hashPassword(
      fields.password
    );
    fields.password = hashedPassword;

    const isSuccessfulAdd = await this.userRepository.addUser(fields);

    if (isSuccessfulAdd) {
      return BaseResponse(HttpStatusCode.Ok);
    }

    return ErrorResponse(
      HttpStatusCode.InternalServerError,
      ResponseMessages.InternalServerError
    );
  }

  async signin(
    fields: SigninFields
  ): Promise<ISigninResponse | PlatformResponse> {
    const user = await this.userRepository.getUser({ email: fields.email });
    const genericErrorResponse = ErrorResponse(
      HttpStatusCode.BadRequest,
      ResponseMessages.UnableToFindUser
    );

    if (
      user === undefined ||
      user.email === undefined ||
      user.password === undefined
    ) {
      return genericErrorResponse;
    }

    const doPasswordsMatch = await this.securityService.arePasswordsEqual(
      fields.password,
      user.password
    );

    if (doPasswordsMatch === false) {
      return genericErrorResponse;
    }

    const payload: IJwtPayload = {
      userId: user.id,
      namespace: user.namespace,
    };
    const token = this.securityService.generateJwt(payload);

    return SigninResponse(HttpStatusCode.Ok, token);
  }

  async getUsers(namespace: string): Promise<User[]> {
    return await this.userRepository.getUsers(namespace);
  }
}
