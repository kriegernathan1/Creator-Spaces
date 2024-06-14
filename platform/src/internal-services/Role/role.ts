import { UserTable } from "../Database/types";

type Permission = {
  name: string;
  service: string;
  description: string;
};

const Permissions = [
  {
    name: "get_user_self",
    service: "user",
    description: "Fetch own user details",
  },
  {
    name: "get_user",
    service: "user",
    description: "Fetch individual user details",
  },
  {
    name: "get_users",
    service: "user",
    description: "Fetch all users details",
  },
  {
    name: "update_user",
    service: "user",
    description: "Fetch all users details",
  },
  {
    name: "update_user_self",
    service: "user",
    description: "Update own user details",
  },
  {
    name: "delete_user_self",
    service: "user",
    description: "Delete own user",
  },
  {
    name: "delete_user",
    service: "user",
    description: "Delete individual user other than self",
  },
] as const;

export type Permissions = (typeof Permissions)[number]["name"][];

export type Role = {
  name: UserTable["role"];
  permissions: Permissions;
};

const adminPermissions = Permissions.map((p) => p.name);

export const Roles: Role[] = [
  {
    name: "platform_admin",
    permissions: adminPermissions,
  },
  {
    name: "user",
    permissions: ["get_user_self", "update_user_self", "delete_user_self"],
  },
];
