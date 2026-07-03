import { DBPool } from '../../core/database'

export class PlansService {
  constructor(private pool: DBPool) {}

  /* created_by comes from req.user.id via the auth middleware */
  async create(data: { name: string; description?: string; createdBy: string }) {
    const result = await this.pool.query(
      `INSERT INTO plans (name, description, created_by)
       VALUES ($1, $2, $3) RETURNING *`,
      [data.name, data.description, data.createdBy]
    )
    return result.rows[0]
  }

  /* Get all plans with the admin name who created it */
  async findAll() {
    const result = await this.pool.query(
      `SELECT 
        p.*,
        u.email as created_by_email
       FROM plans p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.is_active = true
       ORDER BY p.created_at DESC`
    )
    return result.rows
  }

  async findById(id: string) {
    const result = await this.pool.query(
      `SELECT 
        p.*,
        u.email as created_by_email
       FROM plans p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1`,
      [id]
    )
    return result.rows[0]
  }

  async update(id: string, data: { name?: string; description?: string }) {
    const result = await this.pool.query(
      `UPDATE plans SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [data.name, data.description, id]
    )
    return result.rows[0]
  }

  async delete(id: string) {
    await this.pool.query(
      `UPDATE plans SET is_active = false WHERE id = $1`, [id]
    )
    return { message: 'Plan deleted successfully' }
  }
}