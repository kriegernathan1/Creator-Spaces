type Service = {
  name: string;
  path: string;
};

export const Services = {
  User: {
    name: "User",
    path: "/user-service",
  },
  Post: {
    name: "Post",
    path: "/post-service",
  },
} as const satisfies { [key: string]: Service };
