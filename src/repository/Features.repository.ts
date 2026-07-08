import { DB } from "../core/database";
import { LimitationType } from "../types";

export class FeaturesRepository {
  constructor(private db: DB) {}

  async create(
    planId: string,
    featureText: string,
    featureDescription: string | null,
    limitationType: LimitationType,
    limitationValue: number | null,
    displayOrder: number,
  ) {
    return this.db
      .insertInto("plan_features")
      .values({
        plan_id: planId,
        feature_text: featureText,
        feature_description: featureDescription,
        limitation_type: limitationType,
        limitation_value: limitationValue,
        display_order: displayOrder,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async findByPlan(planId: string) {
    return this.db
      .selectFrom("plan_features")
      .where("plan_id", "=", planId)
      .orderBy("display_order", "asc")
      .selectAll()
      .execute();
  }

  async update(
    id: string,
    featureText?: string,
    featureDescription?: string,
    limitationType?: LimitationType,
    limitationValue?: number | null,
    displayOrder?: number,
  ) {
    return this.db
      .updateTable("plan_features")
      .set({
        ...(featureText !== undefined && { feature_text: featureText }),
        ...(featureDescription !== undefined && { feature_description: featureDescription }),
        ...(limitationType !== undefined && { limitation_type: limitationType }),
        ...(limitationValue !== undefined && { limitation_value: limitationValue }),
        ...(displayOrder !== undefined && { display_order: displayOrder }),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(id: string) {
    return this.db
      .deleteFrom("plan_features")
      .where("id", "=", id)
      .execute();
  }

  async deleteByPlan(planId: string) {
    return this.db
      .deleteFrom("plan_features")
      .where("plan_id", "=", planId)
      .execute();
  }

  async toggleFeature(id: string, isEnabled: boolean) {
    return this.db
      .updateTable("plan_features")
      .set({ is_enabled: isEnabled })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }
}