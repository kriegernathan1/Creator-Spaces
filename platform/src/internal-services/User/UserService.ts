import { NewUser } from "../Database/types";
import { IUserRepository } from "../../Repositories/UserRepository";
import { ISecurityService } from "../Security/SecurityService";

interface SignupFields extends NewUser {
  passwordRepeated: string;
}

interface SigninFields {
  email: string;
  password: string;
}

export interface IUserService {
  signup(fields: SignupFields): Promise<boolean>;
  signin(fields: SigninFields): Promise<boolean>;
}

interface Dependencies {
  userRepository: IUserRepository;
  securityService: ISecurityService;
}

class UserService implements IUserService {
  private userRepository: IUserRepository;
  private securityService: ISecurityService;

  constructor(private dependencies: Dependencies) {
    this.userRepository = this.dependencies.userRepository;
    this.securityService = this.dependencies.securityService;
  }

  async signup(fields: SignupFields): Promise<boolean> {
    if (fields.passwordRepeated !== fields.password) {
      return Promise.resolve(false);
    }

    delete (fields as any).passwordRepeated;

    const hashedPassword = await this.securityService.hashPassword(
      fields.password
    );
    fields.password = hashedPassword;

    return await this.userRepository.addUser(fields);
  }

  async signin(fields: SigninFields): Promise<boolean> {
    const user = await this.userRepository.getUser({ email: fields.email });

    if (user?.email === undefined) {
      return false;
    }

    return this.securityService.arePasswordsEqual(
      fields.password,
      user.password
    );
  }
}
