declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      PLATFORM_PORT: string;
      DEV_POSTGRESQL_DB_CONN_URL: string;
      JWT_SECRET: string;
      TESTING_PORT: string;
      ENV: "DEV" | "PROD" | "TEST";
      // add more environment variables and their types here
    }
  }
}

export default global;
