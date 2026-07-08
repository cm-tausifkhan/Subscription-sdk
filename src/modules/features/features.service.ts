import { DB } from "../../core/database/index.js";
import { LimitationType } from "../../types";
import { FeaturesRepository } from "../../repository/Features.repository";

export class FeaturesService {
  private repo: FeaturesRepository;

  constructor(pool: DB) {
    this.repo = new FeaturesRepository(pool);
  }

  async create(data: {
    planId: string;
    featureText: string;
    featureDescription?: string;
    limitationType: LimitationType;
    limitationValue?: number;
    displayOrder?: number;
  }) {
    const result = await this.repo.create(
      data.planId,
      data.featureText,
      data.featureDescription || null,
      data.limitationType,
      data.limitationValue || null,
      data.displayOrder || 0,
    );
    return result;
  }

  async findByPlan(planId: string) {
    const result = await this.repo.findByPlan(planId);
    return result;
  }

  async update(
    id: string,
    data: {
      featureText?: string;
      featureDescription?: string;
      limitationType?: LimitationType;
      limitationValue?: number | null;
      displayOrder?: number;
    },
  ) {
    const result = await this.repo.update(
      id,
      data.featureText,
      data.featureDescription,
      data.limitationType,
      data.limitationValue,
      data.displayOrder,
    );
    return result;
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return { message: "Feature deleted successfully" };
  }

  async deleteByPlan(planId: string) {
    await this.repo.deleteByPlan(planId);
    return { message: "All features deleted for this plan" };
  }

  async toggleFeature(id: string, isEnabled: boolean) {
    const result = await this.repo.toggleFeature(id, isEnabled);
    return result;
  }
}
