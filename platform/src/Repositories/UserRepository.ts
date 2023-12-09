import {
  DatabaseClient,
  IDatabaseService,
} from "../internal-services/Database/DatabaseService";
import { NewUser, UpdateUser, User } from "../internal-services/Database/types";
import { v4 as uuidv4 } from "uuid";

interface Dependencies {
  DatabaseService: IDatabaseService;
}

export interface IUserRepository {
  getUser(userId: string): Promise<User | undefined>;
  getUsers(namespace: string): Promise<User[] | []>;
  addUser(user: NewUser): Promise<boolean>;
  deleteUser(userId: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  private client: DatabaseClient;
  constructor(private dependencies: Dependencies) {
    this.client = this.dependencies.DatabaseService.getClient();
  }

  async getUser(userId: string): Promise<User | undefined> {
    return await this.client
      .selectFrom("user")
      .selectAll()
      .where("id", "==", userId)
      .executeTakeFirst();
  }

  async getUsers(namespace: string): Promise<User[] | []> {
    return await this.client
      .selectFrom("user")
      .selectAll()
      .where("namespace", "==", namespace)
      .execute();
  }

  async addUser(user: NewUser): Promise<boolean> {
    if (!user.id) {
      user.id = uuidv4();
    }

    try {
      await this.client.insertInto("user").values(user).execute();
      return true;
    } catch {
      return false;
    }
  }

  async updateUser(userId: string, user: UpdateUser): Promise<boolean> {
    try {
      await this.client.updateTable("user").set(user).where("id", "==", userId);
      return true;
    } catch {
      return false;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      await this.client.deleteFrom("user").where("id", "==", userId);
      return true;
    } catch {
      return false;
    }
  }
}
