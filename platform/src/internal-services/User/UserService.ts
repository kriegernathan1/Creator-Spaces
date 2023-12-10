import { z } from "zod";
import { IUserRepository } from "../../Repositories/UserRepository";
import { HttpStatusCode } from "../../enums/ResponseCodes";
import { ResponseMessages } from "../../enums/ResponseMessages";
import { BaseResponse } from "../../models/Responses/Response";
import {
  ISigninResponse,
  IUpdateUserResponse,
  SigninResponse,
  UpdateUserResponse,
} from "../../models/Responses/UserResponses";
import { ErrorResponse } from "../../models/Responses/errorResponse";
import { PlatformResponse } from "../../models/Responses/types";
import { NewUser, NewUserSchema, UpdateUser, User } from "../Database/types";
import { ISecurityService, JwtPayload } from "../Security/SecurityService";

export type SigninFields = {
  email: string;
  password: string;
};

export const SigninFieldsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
}) satisfies z.ZodType<SigninFields>;

type RedactedUser = Omit<User, "password">;

export interface IUserService {
  signup(user: User): Promise<PlatformResponse>;
  signin(fields: SigninFields): Promise<ISigninResponse | PlatformResponse>;
  getUsers(namespace: string): Promise<RedactedUser[] | []>;
  getUser(userId: string): Promise<RedactedUser | undefined>;
  updateUser(
    userId: string,
    namespace: string,
    user: UpdateUser,
  ): Promise<IUpdateUserResponse>;
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

  async signup(user: User): Promise<PlatformResponse> {
    if (this.securityService.isPasswordStrong(user.password) === false) {
      return ErrorResponse(
        HttpStatusCode.BadRequest,
        ResponseMessages.WeakPassword,
      );
    }

    const hashedPassword = await this.securityService.hashPassword(
      user.password,
    );
    user.password = hashedPassword;

    const isSuccessfulAdd = await this.userRepository.addUser(user);

    if (isSuccessfulAdd) {
      return BaseResponse(HttpStatusCode.Created);
    }

    return ErrorResponse(
      HttpStatusCode.InternalServerError,
      ResponseMessages.InternalServerError,
    );
  }

  async signin(
    fields: SigninFields,
  ): Promise<ISigninResponse | PlatformResponse> {
    const user = await this.userRepository.getUser({ email: fields.email });
    const genericErrorResponse = ErrorResponse(
      HttpStatusCode.BadRequest,
      ResponseMessages.UnableToFindUser,
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
      user.password,
    );

    if (doPasswordsMatch === false) {
      return genericErrorResponse;
    }

    const payload: JwtPayload = {
      userId: user.id,
      namespace: user.namespace,
    };
    const token = this.securityService.generateJwt(payload);

    return SigninResponse(HttpStatusCode.Ok, token);
  }

  async getUsers(namespace: string): Promise<RedactedUser[] | []> {
    const users = await this.userRepository.getUsers(namespace);

    return users.map((user) => {
      const { password, ...details } = user;
      return details;
    });
  }

  async getUser(userId: string): Promise<RedactedUser | undefined> {
    const user = await this.userRepository.getUser({
      userId: userId,
    });

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
      return ErrorResponse(
        HttpStatusCode.InternalServerError,
        ResponseMessages.InternalServerError,
      );
    }

    return BaseResponse(HttpStatusCode.Ok);
  }
}
