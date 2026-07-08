import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("plans")
    .ifNotExists()
    .addColumn("id", "uuid", (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("name", "varchar(255)", (c) => c.notNull())
    .addColumn("description", "text")
    .addColumn("created_by", "uuid", (c) =>
      c.references("users.id").onDelete("set null"),
    )
    .addColumn("is_active", "boolean", (c) => c.defaultTo(true))
    .addColumn("created_at", "timestamp", (c) => c.defaultTo(sql`NOW()`))
    .addColumn("updated_at", "timestamp", (c) => c.defaultTo(sql`NOW()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("plans").ifExists().execute();
}
