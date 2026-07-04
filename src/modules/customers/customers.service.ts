import { DBPool } from "../../core/database";
import { PaymentGateway } from "../../types";

export class CustomersService {
  constructor(private pool: DBPool) {}

  /* Create a new customer */
  async create(data: { name: string; email: string }) {
    /* Check if customer already exists */
    const existing = await this.pool.query(
      `SELECT * FROM customers WHERE email = $1`,
      [data.email],
    );

    if (existing.rows.length > 0) {
      throw new Error("Customer with this email already exists");
    }

    const result = await this.pool.query(
      `INSERT INTO customers (name, email)
       VALUES ($1, $2) RETURNING *`,
      [data.name, data.email],
    );
    return result.rows[0];
  }

  /* Get all customers */
  async findAll() {
    const result = await this.pool.query(
      `SELECT * FROM customers WHERE is_active = true ORDER BY created_at DESC`,
    );
    return result.rows;
  }

  /* Get customer by ID */
  async findById(id: string) {
    const result = await this.pool.query(
      `SELECT * FROM customers WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  }

  /* Update basic customer info */
  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
    },
  ) {
    const result = await this.pool.query(
      `UPDATE customers SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [data.name, data.email, id],
    );
    return result.rows[0];
  }

  /* Soft delete customer */
  async delete(id: string) {
    await this.pool.query(
      `UPDATE customers SET is_active = false WHERE id = $1`,
      [id],
    );
    return { message: "Customer deleted successfully" };
  }

  /*
   * Connect customer to payment gateway
   * This is called AFTER you create the customer in Stripe/Razorpay
   * and get back their gateway_customer_id
   */
  async connectPaymentGateway(
    id: string,
    data: {
      paymentGateway: PaymentGateway;
      gatewayCustomerId: string;
    },
  ) {
    const result = await this.pool.query(
      `UPDATE customers SET
        payment_gateway = $1,
        gateway_customer_id = $2,
        updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [data.paymentGateway, data.gatewayCustomerId, id],
    );
    return result.rows[0];
  }

  /*
   * Save payment method token
   * This is called AFTER customer adds their card
   * and Stripe/Razorpay gives back payment_method_id
   */
  async savePaymentMethod(
    id: string,
    data: {
      paymentMethodId: string;
    },
  ) {
    const result = await this.pool.query(
      `UPDATE customers SET
        payment_method_id = $1,
        updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [data.paymentMethodId, id],
    );
    return result.rows[0];
  }

  /* Get all subscriptions of a customer with plan details */
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
}
