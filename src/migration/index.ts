import { Kysely  } from "kysely";
import { Migrator, FileMigrationProvider } from "kysely/migration";
import * as path from "path";
import * as fs from "fs/promises";

export async function runMigrations(db: Kysely<any>): Promise<void> {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((r) => {
    if (r.status === "Success")
      console.log(`✅ Migration applied: ${r.migrationName}`);
    if (r.status === "Error")
      console.error(`❌ Migration failed:  ${r.migrationName}`);
  });

  if (error) {
    console.error("Migration runner encountered an error:", error);
    throw error;
  }

  console.log("✅ All migrations complete");
}