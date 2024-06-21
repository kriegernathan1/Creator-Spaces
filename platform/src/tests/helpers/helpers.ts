import { exit } from "process";
import { NewUser } from "../../internal-services/Database/types";
import { Endpoint } from "../../services/user";

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

export function getEndpointUrlWithParams(
  endpoint: Endpoint,
  ...params: string[]
): string {
  if (params.length !== params.length) {
    console.error(
      "Number of parameters passed is not equal to number of route params for endpoint",
    );
    exit(1);
  }

  let path = endpoint.path.replace(":", "").replace("?", "");

  endpoint.routeParams?.forEach((param, index) => {
    path = path.replace(param, params[index]);
  });

  return path;
}
