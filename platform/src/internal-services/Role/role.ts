import { UserTable } from "../Database/types";

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

export type Permission = (typeof Permissions)[number]["name"];

export type RolePermissionMap = {
  [Property in UserTable["role"]]: {
    permissions: Permission[];
  };
};

const adminPermissions = Permissions.map((p) => p.name);

export const ActiveRoles: RolePermissionMap = {
  platform_admin: {
    permissions: adminPermissions,
  },
  user: {
    permissions: ["get_user_self", "update_user_self", "delete_user_self"],
  },
} as const;
