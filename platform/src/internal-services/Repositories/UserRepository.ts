import { DatabaseClient, IDatabaseService } from "../Database/Database";
import { User } from "../Database/types";

interface Dependencies {
  DatabaseService: IDatabaseService;
}

export interface IUserRepository {
  getUser(userId: string, namespace: string): Promise<User | undefined>;
  getUsers(namespace?: string): Promise<User[] | []>;
}

export class UserRepository implements IUserRepository {
  private client: DatabaseClient;
  constructor(private dependencies: Dependencies) {
    this.client = dependencies.DatabaseService.getClient();
  }

  async getUser(userId: string, namespace: string): Promise<User | undefined> {
    return await this.client
      .selectFrom("user")
      .selectAll()
      .where("id", "=", userId)
      .executeTakeFirst();
  }

  async getUsers(namespace?: string): Promise<User[] | []> {
    return await this.client.selectFrom("user").selectAll().execute();
  }
}
