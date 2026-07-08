import { DB } from "../core/database";

export class AuthRepository {
  constructor(private db: DB) {}

  async findByEmail(email: string) {
    return this.db
      .selectFrom("users")
      .where("email", "=", email)
      .selectAll()
      .executeTakeFirst();
  }

  async findActiveByEmail(email: string) {
    return this.db
      .selectFrom("users")
      .where("email", "=", email)
      .where("is_active", "=", true)
      .selectAll()
      .executeTakeFirst();
  }

  async seedAdmin(
    name: string,
    email: string,
    hashedPassword: string,
    role: string,
  ) {
    return this.db
      .insertInto("users")
      .values({ name, email, password: hashedPassword, role })
      .execute();
  }

  async findById(id: string) {
    return this.db
      .selectFrom("users")
      .select(["id", "name", "email", "role", "created_at"])
      .where("id", "=", id)
      .executeTakeFirst();
  }
}
