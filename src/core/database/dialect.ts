//src/core/database/dialect.ts
import { PostgresDialect, MysqlDialect, SqliteDialect, Dialect } from "kysely";
import { Pool } from "pg";

export type DBConfig =
  | { type: "postgres"; connectionString: string }
  | { type: "mysql";    host: string; port: number; database: string; user: string; password: string }
  | { type: "sqlite";   filename: string };

export function createDialect(config: DBConfig): Dialect {
  switch (config.type) {
    case "postgres":
      return new PostgresDialect({
        pool: new Pool({ connectionString: config.connectionString }),
      });

    case "mysql":
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createPool } = require("mysql2");
      return new MysqlDialect({
        pool: createPool({ host: config.host, port: config.port,
          database: config.database, user: config.user, password: config.password }),
      });

    case "sqlite":
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Database = require("better-sqlite3");
      return new SqliteDialect({ database: new Database(config.filename) });

    default:
      throw new Error("Unsupported database type");
  }
}