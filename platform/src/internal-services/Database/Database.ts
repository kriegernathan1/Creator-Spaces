import { Client, Pool, PoolClient } from "pg";

interface IDatabaseService {
  getClient(): PoolClient | undefined;
}

interface DatabaseServiceDependencies {
  connectionString: string;
}

const MAX_CONNECTIONS = 50;

class DatabaseService implements IDatabaseService {
  private client!: PoolClient;

  constructor(private dependencies: DatabaseServiceDependencies) {
    this.setupConnectionPool();
  }

  async setupConnectionPool() {
    const pool = new Pool({
      connectionString: this.dependencies.connectionString,
      max: MAX_CONNECTIONS,
    });

    try {
      this.client = await pool.connect();
    } catch {
      console.error("unable to connect to database");
      process.exit();
    }
  }

  getClient(): PoolClient {
    return this.client;
  }
}
