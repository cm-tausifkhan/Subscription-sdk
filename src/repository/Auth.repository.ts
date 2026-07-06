import { DBPool } from "../core/database";
import type { QueryResult } from "pg";

export class AuthRepository {
  constructor(private pool: DBPool) {}

  async findByEmail(email: string): Promise<QueryResult<any>> {
    return this.pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
  }

  async findActiveByEmail(email: string): Promise<QueryResult<any>> {
    return this.pool.query(
      `SELECT * FROM users WHERE email = $1 AND is_active = true`,
      [email]
    );
  }

  async seedAdmin(
    name: string,
    email: string,
    hashedPassword: string,
    role: string
  ): Promise<QueryResult<any>> {
    return this.pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)`,
      [name, email, hashedPassword, role]
    );
  }

  async findById(id: string): Promise<QueryResult<any>> {
    return this.pool.query(
      `SELECT id, name, email, role, created_at FROM users WHERE id = $1`,
      [id]
    );
  }
}