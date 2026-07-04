import { DBPool } from "../../core/database";
import { LimitationType } from "../../types";
export class FeaturesService {
  constructor(private pool: DBPool) {}

  // Add a feature to a plan
  async create(data: {
    planId: string;
    featureText: string;
    featureDescription?: string;
    limitationType: LimitationType;
    limitationValue?: number;
    displayOrder?: number;
  }) {
    const result = await this.pool.query(
      `INSERT INTO plan_features 
      (plan_id, feature_text, feature_description, limitation_type, limitation_value, display_order) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        data.planId,
        data.featureText,
        data.featureDescription || null,
        data.limitationType,
        data.limitationValue || null,
        data.displayOrder || 0,
      ],
    );
    return result.rows[0];
  }

  // Get all features for a plan
  async findByPlan(planId: string) {
    const result = await this.pool.query(
      `SELECT * FROM plan_features WHERE plan_id = $1 ORDER BY display_order ASC`,
      [planId],
    );
    return result.rows;
  }

  // updates the feature details
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
    const result = await this.pool.query(
      `UPDATE plan_features SET 
      feature_text = COALESCE($1, feature_text), 
      feature_description = COALESCE($2, feature_description),
      limitation_type = COALESCE($3, limitation_type),
      limitation_value = COALESCE($4, limitation_value),
      display_order = COALESCE($5, display_order) 
     WHERE id = $6 RETURNING *`,
      [
        data.featureText ?? null,
        data.featureDescription ?? null,
        data.limitationType ?? null,
        data.limitationValue ?? null,
        data.displayOrder ?? null,
        id,
      ],
    );
    return result.rows[0];
  }

  // Delete a feature
  async delete(id: string) {
    await this.pool.query(`DELETE FROM plan_features WHERE id = $1`, [id]);
    return { message: "Feature deleted successfully" };
  }

  // Delete all features of a plan
  async deleteByPlan(planId: string) {
    await this.pool.query(`DELETE FROM plan_features WHERE plan_id = $1`, [
      planId,
    ]);
    return { message: "All features deleted for this plan" };
  }

  async toggleFeature(id: string, isEnabled: boolean) {
    const result = await this.pool.query(
      `UPDATE plan_features SET is_enabled = $1 WHERE id = $2 RETURNING *`,
      [isEnabled, id],
    );
    return result.rows[0];
  }
}
