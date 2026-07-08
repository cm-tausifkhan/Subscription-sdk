import { DB } from "../../core/database/index.js";
import { PricingRepository } from "../../repository/Pricing.repository";

export class PricingService {
  private repo: PricingRepository;

  constructor(pool: DB) {
    this.repo = new PricingRepository(pool);
  }

  async create(data: {
    planId: string;
    amount: number;
    currency?: string;
    interval: "monthly" | "yearly" | "one-time";
  }) {
    const result = await this.repo.create(
      data.planId,
      data.amount,
      data.currency || "USD",
      data.interval,
    );
    return result;
  }

  async findByPlan(planId: string) {
    const result = await this.repo.findByPlan(planId);
    return result;
  }

  async update(
    id: string,
    data: { amount?: number; currency?: string; interval?: string },
  ) {
    const result = await this.repo.update(
      id,
      data.amount,
      data.currency,
      data.interval,
    );
    return result;
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return { message: "Pricing deleted successfully" };
  }
}
