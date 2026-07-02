import { DBPool } from '../../core/database'

export class PlansService {
  constructor(private pool: DBPool) {}

  async create(data: { name: string; description?: string }) {
    const result = await this.pool.query(
      `INSERT INTO plans (name, description) VALUES ($1, $2) RETURNING *`,
      [data.name, data.description]
    )
    return result.rows[0]
  }

  async findAll() {
    const result = await this.pool.query(
      `SELECT * FROM plans WHERE is_active = true ORDER BY created_at DESC`
    )
    return result.rows
  }

  async findById(id: string) {
    const result = await this.pool.query(
      `SELECT * FROM plans WHERE id = $1`, [id]
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