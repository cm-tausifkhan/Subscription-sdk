import { DBPool } from "../../core/database";
import { PricingRepository } from "../../repository/Pricing.repository";

export class PricingService {
  private repo: PricingRepository;

  constructor(pool: DBPool) {
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
      data.interval
    );
    return result.rows[0];
  }

  async findByPlan(planId: string) {
    const result = await this.repo.findByPlan(planId);
    return result.rows;
  }

  async update(id: string, data: { amount?: number; currency?: string; interval?: string }) {
    const result = await this.repo.update(id, data.amount, data.currency, data.interval);
    return result.rows[0];
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return { message: "Pricing deleted successfully" };
  }
}