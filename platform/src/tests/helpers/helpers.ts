import { NewUser } from "../../internal-services/Database/types";

export function getEndpointUrl(servicePath: string, endpointPath: string) {
  return servicePath + endpointPath;
}

export function getGenericUser(id = "1234"): NewUser {
  return {
    email: "user@email.com",
    first_name: "John",
    last_name: "Doe",
    namespace: "platform",
    password: "test",
    role: "user",
    id: id,
  };
}
