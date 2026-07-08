import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("plan_features")
    .ifNotExists()
    .addColumn("id", "uuid", (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("plan_id", "uuid", (c) =>
      c.references("plans.id").onDelete("cascade")
    )
    .addColumn("feature_text", "text", (c) => c.notNull())
    .addColumn("feature_description", "text")
    .addColumn("limitation_type", "varchar(50)", (c) =>
      c.notNull().defaultTo("feature_access")
    )
    .addColumn("limitation_value", "integer", (c) => c.defaultTo(null))
    .addColumn("is_enabled", "boolean", (c) => c.defaultTo(true))
    .addColumn("display_order", "integer", (c) => c.defaultTo(0))
    .addColumn("created_at", "timestamp", (c) => c.defaultTo(sql`NOW()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("plan_features").ifExists().execute();
}