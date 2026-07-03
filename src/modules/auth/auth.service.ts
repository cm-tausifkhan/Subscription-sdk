import { DBPool } from '../../core/database'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { UserRole } from '../../types'

export class AuthService {
  constructor(private pool: DBPool) {}

  /*
   * Seed the hardcoded admin from .env into the users table
   * This runs once on server start
   * If admin already exists it skips
   */
  async seedAdmin() {
    const existing = await this.pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [process.env.ADMIN_EMAIL]
    )

    if (existing.rows.length > 0) {
      console.log('✅ Admin already exists - skipping seed')
      return
    }

    /* Hash the password from .env before storing */
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD!,
      10
    )

    await this.pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)`,
      [
        process.env.ADMIN_NAME,
        process.env.ADMIN_EMAIL,
        hashedPassword,
        process.env.ADMIN_ROLE
      ]
    )
    console.log('✅ Admin seeded successfully')
  }

  /*
   * Login - verify email and password
   * Returns JWT token with 1 day expiry
   */
  async login(data: { email: string; password: string }) {
    /* Step 1 - Find user by email */
    const result = await this.pool.query(
      `SELECT * FROM users WHERE email = $1 AND is_active = true`,
      [data.email]
    )

    const user = result.rows[0]
    if (!user) {
      throw new Error('Invalid email or password')
    }

    /* Step 2 - Compare password with hashed password */
    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password
    )

    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    /* Step 3 - Generate JWT token with 1 day expiry */
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role as UserRole,
        name: user.name
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    )

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  }

  /*
   * Get current logged in user from token
   */
  async getMe(userId: string) {
    const result = await this.pool.query(
      `SELECT id, name, email, role, created_at FROM users WHERE id = $1`,
      [userId]
    )
    return result.rows[0]
  }
}