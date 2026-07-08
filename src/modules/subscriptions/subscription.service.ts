import { DB } from "../../core/database/index.js";
import { SubscriptionRepository } from "../../repository/Subscription.repository";

export class SubscriptionService {
  private repo: SubscriptionRepository;

  constructor(pool: DB) {
    this.repo = new SubscriptionRepository(pool);
  }

  async create(data: { customerId: string; planId: string; expiresAt?: Date }) {
    const existing = await this.repo.findActiveByCustomer(data.customerId);
    if (existing) {
      throw new Error("Customer already has an active subscription");
    }

    const customer = await this.repo.findActiveCustomer(data.customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    const plan = await this.repo.findActivePlan(data.planId);
    if (!plan) {
      throw new Error("Plan not found");
    }

    const result = await this.repo.create(
      data.customerId,
      data.planId,
      data.expiresAt || null,
    );
    return result;
  }

  async getCustomerSubscriptions(customerId: string) {
    const result = await this.repo.findByCustomer(customerId);
    return result;
  }

  async removeFromPlan(subscriptionId: string) {
    const result = await this.repo.cancel(subscriptionId);
    return {
      message: "Customer removed from plan successfully",
      data: result,
    };
  }

  async findByPlan(planId: string) {
    const result = await this.repo.findByPlan(planId);
    return result;
  }
}
