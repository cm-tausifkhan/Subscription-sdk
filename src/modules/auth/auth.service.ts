import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DBPool } from "../../core/database";
import { UserRole } from "../../types";
import { AuthRepository } from "../../repository/Auth.repository";

export class AuthService {
  private repo: AuthRepository;

  constructor(pool: DBPool) {
    this.repo = new AuthRepository(pool);
  }

  /*
   * Seed the hardcoded admin from .env into the users table
   * This runs once on server start
   * If admin already exists it skips
   */
  async seedAdmin() {
    const existing = await this.repo.findByEmail(process.env.ADMIN_EMAIL!);
    if (existing.rows.length > 0) {
      console.log("✅ Admin already exists - skipping seed");
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);

    await this.repo.seedAdmin(
      process.env.ADMIN_NAME!,
      process.env.ADMIN_EMAIL!,
      hashedPassword,
      process.env.ADMIN_ROLE!
    );
    console.log("✅ Admin seeded successfully");
  }

  /*
   * Login - verify email and password
   * Returns JWT token with 1 day expiry
   */
  async login(data: { email: string; password: string }) {
    const result = await this.repo.findActiveByEmail(data.email);
    const user = result.rows[0];

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role as UserRole, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  /*
   * Get current logged in user from token
   */
  async getMe(userId: string) {
    const result = await this.repo.findById(userId);
    return result.rows[0];
  }
}