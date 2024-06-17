type Service = {
  name: string;
  path: string;
};

type Services = {
  [Property in keyof typeof Services]: Service;
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
};
