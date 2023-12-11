import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { z } from "zod";

export interface ISecurityService {
  hashPassword(password: string): Promise<string>;
  arePasswordsEqual(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  isPasswordStrong(password: string): boolean;
  generateJwt(plainPayload: any): string;
}

export type JwtPayload = {
  userId: string;
  namespace: string;
};

export type JwtToken = JwtPayload & {
  iat: number;
  exp: number;
};

export type EncodedJwtToken = string;

export const JwtTokenSchema = z
  .object({
    userId: z.string(),
    namespace: z.string(),
    iat: z.number(),
    exp: z.number(),
  })
  .strict() satisfies z.ZodType<JwtToken>;

const JWT_TTL = "6H";

type Dependencies = {};

export class SecurityService implements ISecurityService {
  readonly SALT_ROUNDS = 10;

  constructor(dependencies: Dependencies) {}

  async hashPassword(password: string): Promise<string> {
    return await hash(password, this.SALT_ROUNDS);
  }

  async arePasswordsEqual(
    plainTextPassword: string,
    hashedPassword: string,
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
