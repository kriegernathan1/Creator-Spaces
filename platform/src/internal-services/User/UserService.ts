import { z } from "zod";
import { HttpStatusCode } from "../../enums/ResponseCodes";
import { ResponseMessages } from "../../enums/ResponseMessages";
import { BaseResponseFactory } from "../../models/Responses/Response";
import {
  RefreshTokenResponse,
  RefreshTokenResponseFactory,
  SigninResponse,
  SigninResponseFactory,
  UpdateUserResponse,
} from "../../models/Responses/UserResponses";
import { ErrorResponseFactory } from "../../models/Responses/errorResponse";
import { PlatformResponse } from "../../models/Responses/types";
import { IUserRepository } from "../../repositories/UserRepository";
import { NewUser, UpdateUser, User, UserSchema } from "../Database/types";
import {
  ISecurityService,
  JwtPayload,
  JwtToken,
} from "../Security/SecurityService";

export type SigninFields = {
  email: string;
  password: string;
};

export const SigninFieldsSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
  })
  .strict() satisfies z.ZodType<SigninFields>;

export type RedactedUser = Omit<User, "password">;

export const RedactedUserSchema = UserSchema.extend({
  password: z.undefined(),
}).strict() satisfies z.ZodType<RedactedUser>;

export interface IUserService {
  signup(user: NewUser): Promise<PlatformResponse>;
  signin(fields: SigninFields): Promise<SigninResponse>;
  getUsers(namespace: string): Promise<RedactedUser[] | []>;
  getUser(userId: string): Promise<RedactedUser | undefined>;
  updateUser(
    userId: string,
    namespace: string,
    user: UpdateUser,
  ): Promise<UpdateUserResponse>;
  deleteUser(userId: string, namespace: string): Promise<PlatformResponse>;
  refreshToken(token: JwtToken): RefreshTokenResponse;
}

type Dependencies = {
  userRepository: IUserRepository;
  securityService: ISecurityService;
};

export class UserService implements IUserService {
  private userRepository: IUserRepository;
  private securityService: ISecurityService;

  constructor(private dependencies: Dependencies) {
    this.userRepository = this.dependencies.userRepository;
    this.securityService = this.dependencies.securityService;
  }

  async signup(user: NewUser): Promise<PlatformResponse> {
    if (this.securityService.isPasswordStrong(user.password) === false) {
      return ErrorResponseFactory(
        HttpStatusCode.BadRequest,
        ResponseMessages.WeakPassword,
      );
    }

    const hashedPassword = await this.securityService.hashPassword(
      user.password,
    );
    user.password = hashedPassword;

    const isUniqueEmail = !(await this.userRepository.getUserBy(
      "email",
      user.email,
    ));
    if (!isUniqueEmail) {
      return ErrorResponseFactory(
        HttpStatusCode.BadRequest,
        ResponseMessages.UniqueEmailOnly,
      );
    }

    const isSuccessfulAdd = await this.userRepository.addUser(user);

    if (isSuccessfulAdd) {
      return BaseResponseFactory(HttpStatusCode.Created);
    }

    return ErrorResponseFactory(
      HttpStatusCode.InternalServerError,
      ResponseMessages.InternalServerError,
    );
  }

  async signin(fields: SigninFields): Promise<SigninResponse> {
    const user = await this.userRepository.getUserBy("email", fields.email);

    if (user === undefined) {
      return ErrorResponseFactory(
        HttpStatusCode.Unauthorized,
        ResponseMessages.UnableToFindUser,
      );
    }
    if (user.email === undefined || user.password === undefined) {
      return ErrorResponseFactory(
        HttpStatusCode.BadRequest,
        ResponseMessages.BadRequest,
      );
    }

    const doPasswordsMatch = await this.securityService.arePasswordsEqual(
      fields.password,
      user.password,
    );

    if (doPasswordsMatch === false) {
      return ErrorResponseFactory(
        HttpStatusCode.Unauthorized,
        ResponseMessages.UnauthorizedAction,
      );
    }

    const payload: JwtPayload = {
      userId: user.id,
      namespace: user.namespace,
      role: user.role,
    };
    const token = this.securityService.generateJwt(payload);

    return SigninResponseFactory(HttpStatusCode.Ok, token);
  }

  refreshToken(token: JwtToken): RefreshTokenResponse {
    const newToken = this.securityService.generateJwt({
      userId: token.userId,
      namespace: token.namespace,
    } as JwtPayload);

    return RefreshTokenResponseFactory(HttpStatusCode.Ok, newToken);
  }

  async getUsers(namespace: string): Promise<RedactedUser[]> {
    const users = await this.userRepository.getUsers(namespace);

    return users.map((user) => {
      const { password, ...details } = user;
      return details;
    });
  }

  async getUser(userId: string): Promise<RedactedUser | undefined> {
    const user = await this.userRepository.getUserBy("id", userId);

    if (user) {
      const { password, ...redactedUser } = user;
      return redactedUser;
    }
  }

  async updateUser(
    userId: string,
    namespace: string,
    user: UpdateUser,
  ): Promise<UpdateUserResponse> {
    const result = await this.userRepository.updateUser(
      userId,
      namespace,
      user,
    );

    if (result === false) {
      return ErrorResponseFactory(
        HttpStatusCode.InternalServerError,
        ResponseMessages.InternalServerError,
      );
    }

    return BaseResponseFactory(HttpStatusCode.Ok);
  }

  async deleteUser(
    userId: string,
    namespace: string,
  ): Promise<PlatformResponse> {
    const result = await this.userRepository.deleteUser(userId, namespace);

    if (result === false) {
      return ErrorResponseFactory(
        HttpStatusCode.InternalServerError,
        ResponseMessages.InternalServerError,
      );
    }

    return BaseResponseFactory(HttpStatusCode.Ok);
  }
}
