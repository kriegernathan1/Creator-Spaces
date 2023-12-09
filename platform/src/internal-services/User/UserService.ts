import { NewUser } from "../Database/types";
import { IUserRepository } from "../../Repositories/UserRepository";

interface SignupFields extends NewUser {
  passwordRepeated: string;
}

export interface IUserService {
  signup(fields: SignupFields): Promise<boolean>;
}

interface Dependencies {
  userRepository: IUserRepository;
}

class UserService implements IUserService {
  private userRepository: IUserRepository;

  constructor(private dependencies: Dependencies) {
    this.userRepository = this.dependencies.userRepository;
  }

  async signup(fields: SignupFields): Promise<boolean> {
    if (fields.passwordRepeated !== fields.password) {
      return Promise.resolve(false);
    }

    const { firstName, lastName, namespace, password, role, id } = fields;
    const newUser: NewUser = {
      firstName,
      lastName,
      namespace,
      password,
      role,
      id,
    };

    return await this.userRepository.addUser(newUser);
  }
}
