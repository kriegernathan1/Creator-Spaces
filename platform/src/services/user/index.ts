import { Permission } from "../../internal-services/Role/role";
import HTTPMethod from "../../models/Responses/HTTPMethod";

export type Endpoint = {
  method: Action;
  path: string;
  permissions: Permission[];
  description: string;
  protected: boolean;
  routeParams?: string[];
};

type Action = keyof typeof HTTPMethod;

export const userServiceEndpoints = {
  signup: {
    method: "POST",
    path: "/signup",
    permissions: [],
    description: "Create new user with limited values",
    protected: false,
  },
  signin: {
    method: "POST",
    path: "/signin",
    permissions: [],
    description: "Authenticate user",
    protected: false,
  },
  fetchUsers: {
    method: "GET",
    path: "/users",
    permissions: ["get_users"],
    description: "Fetch all users",
    protected: true,
  },
  refreshToken: {
    method: "GET",
    path: "/user/refreshToken",
    permissions: [],
    description: "Refresh valid JWT token",
    protected: true,
  },
  fetchUser: {
    method: "GET",
    get path() {
      return `/user/:${this.routeParams![0]}?`;
    },
    permissions: ["get_user", "get_user_self"],
    description: "Fetch specifc user",
    protected: true,
    routeParams: ["id"],
  },
  createUser: {
    method: "POST",
    path: "/user/create",
    permissions: ["create_user"],
    description: "Create user with any values",
    protected: true,
  },
  updateUser: {
    method: "PUT",
    get path() {
      return `/user/:${this.routeParams![0]}?`;
    },
    permissions: ["update_user", "update_user_self"],
    description: "Update a user's details",
    protected: true,
    routeParams: ["id"],
  },
  deleteUser: {
    method: "DELETE",
    get path() {
      return `/user/:${this.routeParams![0]}?`;
    },
    permissions: ["delete_user", "delete_user_self"],
    description: "delete a user",
    protected: true,
    routeParams: ["id"],
  },
} as const satisfies Record<string, Endpoint>;
