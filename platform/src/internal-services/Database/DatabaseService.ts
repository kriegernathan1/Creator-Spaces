import { Kysely, PostgresDialect } from "kysely";
import { Client, Pool, PoolClient } from "pg";
import { Database } from "./types";

export interface IDatabaseService {
  getClient(): DatabaseClient;
}

export type DatabaseClient = Kysely<Database>;

type Dependencies = {
  connectionString: string;
};

const MAX_CONNECTIONS = 50;

export class DatabaseService implements IDatabaseService {
  private client!: Kysely<Database>;

  constructor(private dependencies: Dependencies) {
    this.setupConnectionPool();
  }

  private setupConnectionPool() {
    const dialect = new PostgresDialect({
      pool: new Pool({
        connectionString: this.dependencies.connectionString,
        max: MAX_CONNECTIONS,
      }),
    });

    this.client = new Kysely<Database>({ dialect });
  }

  getClient(): DatabaseClient {
    return this.client;
  }

  async destroyConnectionPool(): Promise<void> {
    await this.client.destroy();
  }
}
