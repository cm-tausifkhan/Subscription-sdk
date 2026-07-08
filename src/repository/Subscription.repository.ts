import { DB } from "../core/database";

export class SubscriptionRepository {
  constructor(private db: DB) {}

  async findActiveByCustomer(customerId: string) {
    return this.db
      .selectFrom("subscriptions")
      .where("customer_id", "=", customerId)
      .where("status", "=", "active")
      .selectAll()
      .executeTakeFirst();
  }

  async findActiveCustomer(customerId: string) {
    return this.db
      .selectFrom("customers")
      .where("id", "=", customerId)
      .where("is_active", "=", true)
      .selectAll()
      .executeTakeFirst();
  }

  async findActivePlan(planId: string) {
    return this.db
      .selectFrom("plans")
      .where("id", "=", planId)
      .where("is_active", "=", true)
      .selectAll()
      .executeTakeFirst();
  }

  async create(customerId: string, planId: string, expiresAt: Date | null) {
    return this.db
      .insertInto("subscriptions")
      .values({ customer_id: customerId, plan_id: planId, expires_at: expiresAt })
      .returningAll()
      .executeTakeFirst();
  }

  async findByCustomer(customerId: string) {
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

  async cancel(subscriptionId: string) {
    return this.db
      .updateTable("subscriptions")
      .set({ status: "cancelled" })
      .where("id", "=", subscriptionId)
      .returningAll()
      .executeTakeFirst();
  }

  async findByPlan(planId: string) {
    return this.db
      .selectFrom("subscriptions as s")
      .innerJoin("customers as c", "c.id", "s.customer_id")
      .select([
        "c.id",
        "c.name",
        "c.email",
        "s.id as subscription_id",
        "s.status",
        "s.started_at",
        "s.expires_at",
      ])
      .where("s.plan_id", "=", planId)
      .where("s.status", "=", "active")
      .orderBy("s.started_at", "desc")
      .execute();
  }
}
