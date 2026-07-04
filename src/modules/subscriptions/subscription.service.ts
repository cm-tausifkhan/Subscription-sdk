import { DBPool } from '../../core/database'

export class SubscriptionService {
  constructor(private pool: DBPool) {}
  /* Get all subscriptions of a customer with plan details */



  async create(data: {
    customerId: string
    planId: string
    expiresAt?: Date
  }) {
    /* Check if customer already has an active subscription */
    const existing = await this.pool.query(
      `SELECT * FROM subscriptions 
       WHERE customer_id = $1 AND status = 'active'`,
      [data.customerId]
    )

    if (existing.rows.length > 0) {
      throw new Error('Customer already has an active subscription')
    }

    /* Check if customer exists */
    const customer = await this.pool.query(
      `SELECT * FROM customers WHERE id = $1 AND is_active = true`,
      [data.customerId]
    )
    if (customer.rows.length === 0) {
      throw new Error('Customer not found')
    }

    /* Check if plan exists */
    const plan = await this.pool.query(
      `SELECT * FROM plans WHERE id = $1 AND is_active = true`,
      [data.planId]
    )
    if (plan.rows.length === 0) {
      throw new Error('Plan not found')
    }

    const result = await this.pool.query(
      `INSERT INTO subscriptions (customer_id, plan_id, expires_at)
       VALUES ($1, $2, $3) RETURNING *`,
      [data.customerId, data.planId, data.expiresAt || null]
    )
    return result.rows[0]
  }
  async getCustomerSubscriptions(customerId: string) {
    const result = await this.pool.query(
      `SELECT 
      s.id as subscription_id,
      s.status,
      s.started_at,
      s.expires_at,
      p.id as plan_id,
      p.name as plan_name,
      p.description as plan_description
     FROM subscriptions s
     JOIN plans p ON s.plan_id = p.id
     WHERE s.customer_id = $1
     ORDER BY s.started_at DESC`,
      [customerId],
    );
    return result.rows;
  }

  /* Remove customer from a plan (cancel subscription) */
  async removeFromPlan(subscriptionId: string) {
    const result = await this.pool.query(
      `UPDATE subscriptions SET status = 'cancelled' 
     WHERE id = $1 RETURNING *`,
      [subscriptionId],
    );
    return {
      message: "Customer removed from plan successfully",
      data: result.rows[0],
    };
  }


  /* Get all customers subscribed to a specific plan */
async findByPlan(planId: string) {
  const result = await this.pool.query(
    `SELECT 
      c.id,
      c.name,
      c.email,
      s.id as subscription_id,
      s.status,
      s.started_at,
      s.expires_at
     FROM subscriptions s
     JOIN customers c ON s.customer_id = c.id
     WHERE s.plan_id = $1 AND s.status = 'active'
     ORDER BY s.started_at DESC`,
    [planId]
  )
  return result.rows
}
}