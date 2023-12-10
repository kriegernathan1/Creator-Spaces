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
  firstName: string;
  lastName: string;
  email: string;
  createdAt: ColumnType<Date, never, never>;
  namespace: string;
  password: string;
  role: "creator" | "user" | "moderator";
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UpdateUser = Updateable<UserTable>;

export const NewUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  namespace: z.string(),
  password: z.string(),
  role: z.enum(["creator", "user", "moderator"]),
  id: z.optional(z.string()),
}) satisfies z.ZodType<NewUser>;

export const UpdateUserSchema = z.object<UpdateUser>({});
