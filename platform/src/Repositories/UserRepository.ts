import {
  DatabaseClient,
  IDatabaseService,
} from "../internal-services/Database/DatabaseService";
import { NewUser, UpdateUser, User } from "../internal-services/Database/types";
import { v4 as uuidv4 } from "uuid";

type Dependencies = {
  DatabaseService: IDatabaseService;
};

interface SupportedFetchProperties {
  userId?: string;
  email?: string;
}

export interface IUserRepository {
  getUser(propertyValue: SupportedFetchProperties): Promise<User | undefined>;
  getUsers(namespace: string): Promise<User[] | []>;
  addUser(user: NewUser): Promise<boolean>;
  deleteUser(userId: string, namespace: string): Promise<boolean>;
  updateUser(
    userId: string,
    namespace: string,
    user: UpdateUser,
  ): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  private client: DatabaseClient;
  constructor(private dependencies: Dependencies) {
    this.client = this.dependencies.DatabaseService.getClient();
  }

  async getUser(
    propertyValue: SupportedFetchProperties,
  ): Promise<User | undefined> {
    if (propertyValue.email) {
      return await this.client
        .selectFrom("platform_user")
        .selectAll()
        .where("email", "=", propertyValue.email)
        .executeTakeFirst();
    } else if (propertyValue.userId) {
      return await this.client
        .selectFrom("platform_user")
        .selectAll()
        .where("id", "=", propertyValue.userId as string)
        .executeTakeFirst();
    }

    console.warn("No supported property based to getUser in User Repository");
  }

  async getUsers(namespace: string): Promise<User[] | []> {
    return await this.client
      .selectFrom("platform_user")
      .selectAll()
      .where("namespace", "=", namespace)
      .execute();
  }

  async addUser(user: NewUser): Promise<boolean> {
    if (!user.id) {
      user.id = uuidv4();
    }

    try {
      await this.client.insertInto("platform_user").values(user).execute();
      return true;
    } catch {
      return false;
    }
  }

  async updateUser(
    userId: string,
    namespace: string,
    user: UpdateUser,
  ): Promise<boolean> {
    try {
      await this.client
        .updateTable("platform_user")
        .set(user)
        .where("id", "=", userId)
        .where("namespace", "=", namespace)
        .execute();
      return true;
    } catch {
      return false;
    }
  }

  async deleteUser(userId: string, namespace: string): Promise<boolean> {
    try {
      await this.client
        .deleteFrom("platform_user")
        .where("id", "=", userId)
        .where("namespace", "=", namespace)
        .execute();
      return true;
    } catch {
      return false;
    }
  }
}
