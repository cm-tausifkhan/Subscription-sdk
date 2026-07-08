import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DB } from "../../core/database";
import { UserRole } from "../../types";
import { AuthRepository } from "../../repository/Auth.repository";

export class AuthService {
  private repo: AuthRepository;

  constructor(db: DB) {
    this.repo = new AuthRepository(db);
  }

  async seedAdmin() {
    const existing = await this.repo.findByEmail(process.env.ADMIN_EMAIL!);
    if (existing) {
      console.log("✅ Admin already exists - skipping seed");
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);
    await this.repo.seedAdmin(
      process.env.ADMIN_NAME!,
      process.env.ADMIN_EMAIL!,
      hashedPassword,
      process.env.ADMIN_ROLE!,
    );
    console.log("✅ Admin seeded successfully");
  }

  async login(data: { email: string; password: string }) {
    const user = await this.repo.findActiveByEmail(data.email);

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
      { expiresIn: "1d" },
    );

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async getMe(userId: string) {
    return this.repo.findById(userId);
  }
}