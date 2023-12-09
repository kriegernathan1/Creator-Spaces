import { UserRepository } from "../Repositories/UserRepository";
import { DatabaseService } from "./Database/DatabaseService";
import { SecurityService } from "./Security/SecurityService";
import { UserService } from "./User/UserService";

export interface Services {
  userService: UserService;
  userRepository: UserRepository;
  databaseService: DatabaseService;
  securityService: SecurityService;
}

const databaseService = new DatabaseService({
  connectionString: process.env.DEV_POSTGRESQL_DB_CONN_URL,
});

const userRepository = new UserRepository({
  DatabaseService: databaseService,
});

const securityService = new SecurityService({});

const userService = new UserService({
  securityService,
  userRepository,
});

export { userService };
