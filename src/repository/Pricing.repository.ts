import { DBPool } from "../core/database";
import type { QueryResult } from "pg";

export class PricingRepository {
  constructor(private pool: DBPool) {}

  async create(
    planId: string,
    amount: number,
    currency: string,
    interval: string,
  ): Promise<QueryResult<any>> {
    return this.pool.query(
      `INSERT INTO pricing (plan_id, amount, currency, interval)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [planId, amount, currency, interval],
    );
  }

  async findByPlan(planId: string): Promise<QueryResult<any>> {
    return this.pool.query(`SELECT * FROM pricing WHERE plan_id = $1`, [
      planId,
    ]);
  }

  async update(
    id: string,
    amount?: number,
    currency?: string,
    interval?: string,
  ): Promise<QueryResult<any>> {
    return this.pool.query(
      `UPDATE pricing SET
        amount = COALESCE($1, amount),
        currency = COALESCE($2, currency),
        interval = COALESCE($3, interval)
       WHERE id = $4 RETURNING *`,
      [amount, currency, interval, id],
    );
  }

  async delete(id: string): Promise<QueryResult<any>> {
    return this.pool.query(`DELETE FROM pricing WHERE id = $1`, [id]);
  }
}
