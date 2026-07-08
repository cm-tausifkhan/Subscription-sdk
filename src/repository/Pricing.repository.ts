import { DB } from "../core/database";

export class PricingRepository {
  constructor(private db: DB) {}

  async create(planId: string, amount: number, currency: string, interval: string) {
    return this.db
      .insertInto("pricing")
      .values({ plan_id: planId, amount, currency, interval })
      .returningAll()
      .executeTakeFirst();
  }

  async findByPlan(planId: string) {
    return this.db
      .selectFrom("pricing")
      .where("plan_id", "=", planId)
      .selectAll()
      .execute();
  }

  async update(id: string, amount?: number, currency?: string, interval?: string) {
    return this.db
      .updateTable("pricing")
      .set({
        ...(amount !== undefined && { amount }),
        ...(currency !== undefined && { currency }),
        ...(interval !== undefined && { interval }),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(id: string) {
    return this.db
      .deleteFrom("pricing")
      .where("id", "=", id)
      .execute();
  }
}
