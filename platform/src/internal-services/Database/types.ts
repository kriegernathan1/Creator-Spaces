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
  createdAt: ColumnType<Date, string | undefined, never>;
  namespace: string;
  role: "creator" | "user" | "moderator";
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UpdateUser = Updateable<UserTable>;
