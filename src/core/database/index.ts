//src/core/database/index.ts
import { Kysely } from "kysely";
import { Database } from "./types";
import { createDialect, DBConfig } from "./dialect";

export type { Database };
export type DB = Kysely<Database>;

let db: DB;

export function initDB(config: DBConfig): DB {
  db = new Kysely<Database>({ dialect: createDialect(config) });
  return db;
}

export function getDB(): DB {
  if (!db) throw new Error("DB not initialized — call initDB() first");
  return db;
}
