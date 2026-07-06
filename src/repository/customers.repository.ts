import { DBPool } from "../core/database";
import type { QueryResult } from "pg";

export class CustomersRepository {
  constructor(private pool: DBPool) {}

  async create(name: string, email: string): Promise<QueryResult<any>> {
    return this.pool.query(
      `INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING *`,
      [name, email],
    );
  }

  async findByEmail(email: string): Promise<QueryResult<any>> {
    return this.pool.query(`SELECT * FROM customers WHERE email = $1`, [email]);
  }

  async findAll(): Promise<QueryResult<any>> {
    return this.pool.query(
      `SELECT * FROM customers WHERE is_active = true ORDER BY created_at DESC`,
    );
  }

  async findById(id: string): Promise<QueryResult<any>> {
    return this.pool.query(`SELECT * FROM customers WHERE id = $1`, [id]);
  }

  async update(
    id: string,
    name?: string,
    email?: string,
  ): Promise<QueryResult<any>> {
    return this.pool.query(
      `UPDATE customers SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [name, email, id],
    );
  }

  async softDelete(id: string): Promise<QueryResult<any>> {
    return this.pool.query(
      `UPDATE customers SET is_active = false WHERE id = $1`,
      [id],
    );
  }

  async connectPaymentGateway(
    id: string,
    paymentGateway: string,
    gatewayCustomerId: string,
  ): Promise<QueryResult<any>> {
    return this.pool.query(
      `UPDATE customers SET
        payment_gateway = $1,
        gateway_customer_id = $2,
        updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [paymentGateway, gatewayCustomerId, id],
    );
  }

  async savePaymentMethod(
    id: string,
    paymentMethodId: string,
  ): Promise<QueryResult<any>> {
    return this.pool.query(
      `UPDATE customers SET
        payment_method_id = $1,
        updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [paymentMethodId, id],
    );
  }

  async getSubscriptions(customerId: string): Promise<QueryResult<any>> {
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
      [customerId],
    );
  }

  async cancelSubscription(subscriptionId: string): Promise<QueryResult<any>> {
    return this.pool.query(
      `UPDATE subscriptions SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [subscriptionId],
    );
  }

  async count(): Promise<QueryResult<any>> {
    return this.pool.query(
      `SELECT COUNT(*) FROM customers WHERE is_active = true`,
    );
  }
}
