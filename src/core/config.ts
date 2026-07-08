//src/core/config.ts
import { DBConfig } from "./database/dialect";

export function getDBConfig(): DBConfig {
  const type = process.env.DB_TYPE || "postgres";

  if (type === "postgres") {
    return { type: "postgres", connectionString: process.env.DATABASE_URL! };
  }
  if (type === "mysql") {
    return { type: "mysql", host: process.env.DB_HOST!, port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME!, user: process.env.DB_USER!, password: process.env.DB_PASSWORD! };
  }
  if (type === "sqlite") {
    return { type: "sqlite", filename: process.env.DB_FILE || "./dev.sqlite" };
  }
  throw new Error(`Unknown DB_TYPE: ${type}`);
}