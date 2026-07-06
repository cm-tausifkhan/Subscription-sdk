import { DBPool } from "../../core/database";
import { PaymentGateway } from "../../types";
import { CustomersRepository } from "../../repository/customers.repository";

export class CustomersService {
  private repo: CustomersRepository;

  constructor(pool: DBPool) {
    this.repo = new CustomersRepository(pool);
  }

  async create(data: { name: string; email: string }) {
    const existing = await this.repo.findByEmail(data.email);
    if (existing.rows.length > 0) {
      throw new Error("Customer with this email already exists");
    }
    const result = await this.repo.create(data.name, data.email);
    return result.rows[0];
  }

  async findAll() {
    const result = await this.repo.findAll();
    return result.rows;
  }

  async findById(id: string) {
    const result = await this.repo.findById(id);
    return result.rows[0];
  }

  async update(id: string, data: { name?: string; email?: string }) {
    const result = await this.repo.update(id, data.name, data.email);
    return result.rows[0];
  }

  async delete(id: string) {
    await this.repo.softDelete(id);
    return { message: "Customer deleted successfully" };
  }

  async connectPaymentGateway(id: string, data: { paymentGateway: PaymentGateway; gatewayCustomerId: string }) {
    const result = await this.repo.connectPaymentGateway(id, data.paymentGateway, data.gatewayCustomerId);
    return result.rows[0];
  }

  async savePaymentMethod(id: string, data: { paymentMethodId: string }) {
    const result = await this.repo.savePaymentMethod(id, data.paymentMethodId);
    return result.rows[0];
  }

  async getCustomerSubscriptions(customerId: string) {
    const result = await this.repo.getSubscriptions(customerId);
    return result.rows;
  }

  async removeFromPlan(subscriptionId: string) {
    const result = await this.repo.cancelSubscription(subscriptionId);
    return { message: "Customer removed from plan successfully", data: result.rows[0] };
  }

  async count() {
    const result = await this.repo.count();
    return { count: parseInt(result.rows[0].count) };
  }
}
