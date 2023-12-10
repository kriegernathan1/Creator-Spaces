import { z } from "zod";

import {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  user: UserTable;
}

export interface UserTable {
  id: ColumnType<string, string | undefined, never>;
  first_name: string;
  last_name: string;
  email: string;
  created_at: ColumnType<Date, never, never>;
  namespace: string;
  password: ColumnType<string, string, string | undefined>;
  role: "creator" | "user" | "moderator";
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UpdateUser = Updateable<UserTable>;

export const NewUserSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  namespace: z.string(),
  password: z.string(),
  role: z.enum(["creator", "user", "moderator"]),
  id: z.optional(z.string()),
}) satisfies z.ZodType<NewUser>;

export const UpdateUserSchema = z.object({}) satisfies z.ZodType<UpdateUser>;
