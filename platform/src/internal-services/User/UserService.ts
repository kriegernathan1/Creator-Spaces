import { NewUser } from "../Database/types";
import { IUserRepository } from "../../Repositories/UserRepository";
import { ISecurityService } from "../Security/SecurityService";
import { IBaseResponse, BaseResponse } from "../../models/Responses/Response";
import {
  IErrorResponse,
  ErrorResponse,
} from "../../models/Responses/errorResponse";
import { HttpStatusCode } from "../../enums/ResponseCodes";
import { PlatformResponse } from "../../models/Responses/types";
import { ResponseMessages } from "../../enums/ResponseMessages";

interface SignupFields extends NewUser {
  passwordRepeated: string;
}

interface SigninFields {
  email: string;
  password: string;
}

export interface IUserService {
  signup(fields: SignupFields): Promise<PlatformResponse>;
  signin(fields: SigninFields): Promise<PlatformResponse>;
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

  async signin(fields: SigninFields): Promise<PlatformResponse> {
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

    return BaseResponse(HttpStatusCode.Ok);
  }
}
