import { DB } from "../core/database";
import { sql } from "kysely";

export class CustomersRepository {
  constructor(private db: DB) {}

  async create(name: string, email: string) {
    return this.db
      .insertInto("customers")
      .values({ name, email })
      .returningAll()
      .executeTakeFirst();
  }

  async findByEmail(email: string) {
    return this.db
      .selectFrom("customers")
      .where("email", "=", email)
      .selectAll()
      .executeTakeFirst();
  }

  async findAll() {
    return this.db
      .selectFrom("customers")
      .where("is_active", "=", true)
      .orderBy("created_at", "desc")
      .selectAll()
      .execute();
  }

  async findById(id: string) {
    return this.db
      .selectFrom("customers")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();
  }

  async update(id: string, name?: string, email?: string) {
    return this.db
      .updateTable("customers")
      .set({
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        updated_at: sql`NOW()`,
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async softDelete(id: string) {
    return this.db
      .updateTable("customers")
      .set({ is_active: false })
      .where("id", "=", id)
      .execute();
  }

  async connectPaymentGateway(
    id: string,
    paymentGateway: string,
    gatewayCustomerId: string,
  ) {
    return this.db
      .updateTable("customers")
      .set({
        payment_gateway: paymentGateway,
        gateway_customer_id: gatewayCustomerId,
        updated_at: sql`NOW()`,
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async savePaymentMethod(id: string, paymentMethodId: string) {
    return this.db
      .updateTable("customers")
      .set({
        payment_method_id: paymentMethodId,
        updated_at: sql`NOW()`,
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async getSubscriptions(customerId: string) {
    return this.db
      .selectFrom("subscriptions as s")
      .innerJoin("plans as p", "p.id", "s.plan_id")
      .select([
        "s.id as subscription_id",
        "s.status",
        "s.started_at",
        "s.expires_at",
        "p.id as plan_id",
        "p.name as plan_name",
        "p.description as plan_description",
      ])
      .where("s.customer_id", "=", customerId)
      .orderBy("s.started_at", "desc")
      .execute();
  }

  async cancelSubscription(subscriptionId: string) {
    return this.db
      .updateTable("subscriptions")
      .set({ status: "cancelled" })
      .where("id", "=", subscriptionId)
      .returningAll()
      .executeTakeFirst();
  }

  async count() {
    const result = await this.db
      .selectFrom("customers")
      .where("is_active", "=", true)
      .select((eb) => eb.fn.countAll<number>().as("count"))
      .executeTakeFirstOrThrow();
    return result.count;
  }
}