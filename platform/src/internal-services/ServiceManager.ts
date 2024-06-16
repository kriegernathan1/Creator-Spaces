import { UserRepository } from "../repositories/UserRepository";
import { DatabaseService } from "./Database/DatabaseService";
import { SecurityService } from "./Security/SecurityService";
import { UserService } from "./User/UserService";

export interface Services {
  userService: UserService;
  userRepository: UserRepository;
  databaseService: DatabaseService;
  securityService: SecurityService;
}

let userService: UserService;
let securityService: SecurityService;
let databaseService: DatabaseService;

export function setupServices() {
  const connectionString = process.env.DEV_POSTGRESQL_DB_CONN_URL;

  if (connectionString === undefined) {
    console.error("Bad connection string");
    process.exit(1);
  }

  databaseService = new DatabaseService({
    connectionString: connectionString,
  });

  const userRepository = new UserRepository({
    DatabaseService: databaseService,
  });

  const securityService = new SecurityService({});

  userService = new UserService({
    securityService,
    userRepository,
  });
}

export function disposeServices() {
  databaseService.destroyConnectionPool();
}

export { userService, securityService };
