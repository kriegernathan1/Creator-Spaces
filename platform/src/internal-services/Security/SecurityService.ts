import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";

export interface ISecurityService {
  hashPassword(password: string): Promise<string>;
  arePasswordsEqual(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  isPasswordStrong(password: string): boolean;
  generateJwt(plainPayload: any): string;
}

const JWT_TTL = "6H";

interface Dependencies {}

export class SecurityService implements ISecurityService {
  readonly SALT_ROUNDS = 10;

  constructor(dependencies: Dependencies) {}

  async hashPassword(password: string): Promise<string> {
    return await hash(password, this.SALT_ROUNDS);
  }

  async arePasswordsEqual(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await compare(plainTextPassword, hashedPassword);
  }

  isPasswordStrong(password: string): boolean {
    return true;
  }

  generateJwt(plainPayload: any): string {
    const jwt = sign(plainPayload, process.env.JWT_SECRET!, {
      expiresIn: JWT_TTL,
    });
    return jwt;
  }
}
