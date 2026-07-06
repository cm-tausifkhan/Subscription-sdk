import { DBPool } from "../core/database";
import type { QueryResult } from "pg";

export class SubscriptionRepository {
  constructor(private pool: DBPool) {}

  async findActiveByCustomer(customerId: string): Promise<QueryResult<any>> {
    return this.pool.query(
      `SELECT * FROM subscriptions
       WHERE customer_id = $1 AND status = 'active'`,
      [customerId]
    );
  }

  async findActiveCustomer(customerId: string): Promise<QueryResult<any>> {
    return this.pool.query(
      `SELECT * FROM customers WHERE id = $1 AND is_active = true`,
      [customerId]
    );
  }

  async findActivePlan(planId: string): Promise<QueryResult<any>> {
    return this.pool.query(
      `SELECT * FROM plans WHERE id = $1 AND is_active = true`,
      [planId]
    );
  }

  async create(
    customerId: string,
    planId: string,
    expiresAt: Date | null
  ): Promise<QueryResult<any>> {
    return this.pool.query(
      `INSERT INTO subscriptions (customer_id, plan_id, expires_at)
       VALUES ($1, $2, $3) RETURNING *`,
      [customerId, planId, expiresAt]
    );
  }

  async findByCustomer(customerId: string): Promise<QueryResult<any>> {
    return this.pool.query(
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
      [customerId]
    );
  }

  async cancel(subscriptionId: string): Promise<QueryResult<any>> {
    return this.pool.query(
      `UPDATE subscriptions SET status = 'cancelled'
       WHERE id = $1 RETURNING *`,
      [subscriptionId]
    );
  }

  async findByPlan(planId: string): Promise<QueryResult<any>> {
    return this.pool.query(
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
    );
  }
}