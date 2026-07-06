import { DBPool } from "../core/database";
import { LimitationType } from "../types";
import type { QueryResult } from "pg";

export class FeaturesRepository {
  constructor(private pool: DBPool) {}

  async create(
    planId: string,
    featureText: string,
    featureDescription: string | null,
    limitationType: LimitationType,
    limitationValue: number | null,
    displayOrder: number
  ): Promise<QueryResult<any>> {
    return this.pool.query(
      `INSERT INTO plan_features 
        (plan_id, feature_text, feature_description, limitation_type, limitation_value, display_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [planId, featureText, featureDescription, limitationType, limitationValue, displayOrder]
    );
  }

  async findByPlan(planId: string): Promise<QueryResult<any>> {
    return this.pool.query(
      `SELECT * FROM plan_features WHERE plan_id = $1 ORDER BY display_order ASC`,
      [planId]
    );
  }

  async update(
    id: string,
    featureText?: string,
    featureDescription?: string,
    limitationType?: LimitationType,
    limitationValue?: number | null,
    displayOrder?: number
  ): Promise<QueryResult<any>> {
    return this.pool.query(
      `UPDATE plan_features SET
        feature_text = COALESCE($1, feature_text),
        feature_description = COALESCE($2, feature_description),
        limitation_type = COALESCE($3, limitation_type),
        limitation_value = COALESCE($4, limitation_value),
        display_order = COALESCE($5, display_order)
       WHERE id = $6 RETURNING *`,
      [featureText ?? null, featureDescription ?? null, limitationType ?? null, limitationValue ?? null, displayOrder ?? null, id]
    );
  }

  async delete(id: string): Promise<QueryResult<any>> {
    return this.pool.query(`DELETE FROM plan_features WHERE id = $1`, [id]);
  }

  async deleteByPlan(planId: string): Promise<QueryResult<any>> {
    return this.pool.query(`DELETE FROM plan_features WHERE plan_id = $1`, [planId]);
  }

  async toggleFeature(id: string, isEnabled: boolean): Promise<QueryResult<any>> {
    return this.pool.query(
      `UPDATE plan_features SET is_enabled = $1 WHERE id = $2 RETURNING *`,
      [isEnabled, id]
    );
  }
}