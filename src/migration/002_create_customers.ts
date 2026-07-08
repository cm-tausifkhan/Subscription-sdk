import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("customers")
    .ifNotExists()
    .addColumn("id", "uuid", (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("name", "varchar(255)", (c) => c.notNull())
    .addColumn("email", "varchar(255)", (c) => c.notNull().unique())
    .addColumn("payment_gateway", "varchar(50)", (c) => c.defaultTo(null))
    .addColumn("gateway_customer_id", "varchar(255)", (c) => c.defaultTo(null))
    .addColumn("payment_method_id", "varchar(255)", (c) => c.defaultTo(null))
    .addColumn("is_active", "boolean", (c) => c.defaultTo(true))
    .addColumn("created_at", "timestamp", (c) => c.defaultTo(sql`NOW()`))
    .addColumn("updated_at", "timestamp", (c) => c.defaultTo(sql`NOW()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("customers").ifExists().execute();
}