import { DBPool } from "../core/database";
import type { QueryResult } from "pg";

export class PlansRepository {
  constructor(private pool: DBPool) {}

  async create(
    name: string,
    description: string | undefined,
    createdBy: string,
  ): Promise<QueryResult<any>> {
    return this.pool.query(
      `INSERT INTO plans (name, description, created_by)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description, createdBy],
    );
  }

  async findAll(): Promise<QueryResult<any>> {
    return this.pool.query(
      `SELECT
        p.*,
        u.email as created_by_email
       FROM plans p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.is_active = true
       ORDER BY p.created_at DESC`,
    );
  }

  async findById(id: string): Promise<QueryResult<any>> {
    return this.pool.query(
      `SELECT
        p.*,
        u.email as created_by_email
       FROM plans p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1`,
      [id],
    );
  }

  async update(
    id: string,
    name?: string,
    description?: string,
  ): Promise<QueryResult<any>> {
    return this.pool.query(
      `UPDATE plans SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [name, description, id],
    );
  }

  async softDelete(id: string): Promise<QueryResult<any>> {
    return this.pool.query(`UPDATE plans SET is_active = false WHERE id = $1`, [
      id,
    ]);
  }
}
