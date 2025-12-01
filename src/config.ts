import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();


type APIConfig = {
  fileServerHits: number;
  db: DBConfig;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
}


export const config: APIConfig = {
  fileServerHits: 0,
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: {
      migrationsFolder: "./src/db/migrations"
    }
  }
};


function envOrThrow(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}