import { DB } from "../../core/database/index.js";
import { PaymentGateway } from "../../types";
import { CustomersRepository } from "../../repository/customers.repository";

export class CustomersService {
  private repo: CustomersRepository;

  constructor(pool: DB) {
    this.repo = new CustomersRepository(pool);
  }

  async create(data: { name: string; email: string }) {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      throw new Error("Customer with this email already exists");
    }
    const result = await this.repo.create(data.name, data.email);
    return result;
  }

  async findAll() {
    const result = await this.repo.findAll();
    return result;
  }

  async findById(id: string) {
    const result = await this.repo.findById(id);
    return result;
  }

  async update(id: string, data: { name?: string; email?: string }) {
    const result = await this.repo.update(id, data.name, data.email);
    return result;
  }

  async delete(id: string) {
    await this.repo.softDelete(id);
    return { message: "Customer deleted successfully" };
  }

  async connectPaymentGateway(
    id: string,
    data: { paymentGateway: PaymentGateway; gatewayCustomerId: string },
  ) {
    const result = await this.repo.connectPaymentGateway(
      id,
      data.paymentGateway,
      data.gatewayCustomerId,
    );
    return result;
  }

  async savePaymentMethod(id: string, data: { paymentMethodId: string }) {
    const result = await this.repo.savePaymentMethod(id, data.paymentMethodId);
    return result;
  }

  async getCustomerSubscriptions(customerId: string) {
    const result = await this.repo.getSubscriptions(customerId);
    return result;
  }

  async removeFromPlan(subscriptionId: string) {
    const result = await this.repo.cancelSubscription(subscriptionId);
    return {
      message: "Customer removed from plan successfully",
      data: result,
    };
  }

  async count() {
    const count = await this.repo.count();
     return { count };
  }
}
