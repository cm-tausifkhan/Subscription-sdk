import { DBPool } from '../../core/database'

export class PricingService {
  constructor(private pool: DBPool) {}

  async create(data: { 
    planId: string; 
    amount: number; 
    currency?: string; 
    interval: 'monthly' | 'yearly' | 'one-time' 
  }) {
    const result = await this.pool.query(
      `INSERT INTO pricing (plan_id, amount, currency, interval) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.planId, data.amount, data.currency || 'USD', data.interval]
    )
    return result.rows[0]
  }

  async findByPlan(planId: string) {
    const result = await this.pool.query(
      `SELECT * FROM pricing WHERE plan_id = $1`, [planId]
    )
    return result.rows
  }

  async update(id: string, data: { amount?: number; currency?: string; interval?: string }) {
    const result = await this.pool.query(
      `UPDATE pricing SET 
        amount = COALESCE($1, amount), 
        currency = COALESCE($2, currency),
        interval = COALESCE($3, interval)
       WHERE id = $4 RETURNING *`,
      [data.amount, data.currency, data.interval, id]
    )
    return result.rows[0]
  }

  async delete(id: string) {
    await this.pool.query(`DELETE FROM pricing WHERE id = $1`, [id])
    return { message: 'Pricing deleted successfully' }
  }
}