import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("subscriptions")
    .ifNotExists()
    .addColumn("id", "uuid", (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("customer_id", "uuid", (c) =>
      c.references("customers.id").onDelete("cascade")
    )
    .addColumn("plan_id", "uuid", (c) => c.references("plans.id"))
    .addColumn("status", "varchar(50)", (c) => c.defaultTo("active"))
    .addColumn("started_at", "timestamp", (c) => c.defaultTo(sql`NOW()`))
    .addColumn("expires_at", "timestamp")
    .addColumn("created_at", "timestamp", (c) => c.defaultTo(sql`NOW()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("subscriptions").ifExists().execute();
}