import { z } from "zod";

import {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  platform_user: UserTable;
}

// Allows type checking at runtime with Zod from union types
export const ALL_ROLES = ["user", "platform_admin"] as const;
type ROLES = (typeof ALL_ROLES)[number];

export interface UserTable {
  id: ColumnType<string, string | undefined, never>;
  first_name: string;
  last_name: string;
  email: string;
  created_at: ColumnType<string, never, never>;
  namespace: string;
  password: ColumnType<string, string, string | undefined>;
  role: ROLES;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UpdateUser = Updateable<UserTable>;

export const UserSchema = z
  .object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
    namespace: z.string(),
    password: z.string(),
    role: z.enum(ALL_ROLES),
    id: z.string(),
    created_at: z.string(),
  })
  .strict() satisfies z.ZodType<User>;

export const NewUserSchema = UserSchema.extend({
  id: z.optional(z.string()),
  created_at: z.optional(z.string()),
}).strict() satisfies z.ZodType<NewUser>;

export const UpdateUserSchema = z
  .object({
    first_name: z.optional(z.string()),
    last_name: z.optional(z.string()),
    email: z.optional(z.string().email()),
    namespace: z.optional(z.string()),
    password: z.optional(z.string()),
    role: z.optional(z.enum(ALL_ROLES)),
    id: z.optional(z.optional(z.string())),
  })
  .strict() satisfies z.ZodType<UpdateUser>;
