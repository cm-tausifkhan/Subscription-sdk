import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("users")
    .ifNotExists()
    .addColumn("id", "uuid", (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("name", "varchar(255)", (c) =>
      c.notNull().defaultTo("Admin")
    )
    .addColumn("email", "varchar(255)", (c) => c.notNull().unique())
    .addColumn("password", "varchar(255)", (c) => c.notNull())
    .addColumn("role", "varchar(20)", (c) =>
      c.notNull().defaultTo("admin")
    )
    .addColumn("is_active", "boolean", (c) => c.defaultTo(true))
    .addColumn("created_at", "timestamp", (c) => c.defaultTo(sql`NOW()`))
    .addColumn("updated_at", "timestamp", (c) => c.defaultTo(sql`NOW()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("users").ifExists().execute();
}