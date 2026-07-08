import { DB } from "../core/database";
import { sql } from "kysely";

export class PlansRepository {
  constructor(private db: DB) {}

  async create(name: string, description: string | undefined, createdBy: string) {
    return this.db
      .insertInto("plans")
      .values({ name, description: description ?? null, created_by: createdBy })
      .returningAll()
      .executeTakeFirst();
  }

  async findAll() {
    return this.db
      .selectFrom("plans as p")
      .leftJoin("users as u", "u.id", "p.created_by")
      .select([
        "p.id",
        "p.name",
        "p.description",
        "p.created_by",
        "p.is_active",
        "p.created_at",
        "p.updated_at",
        "u.email as created_by_email",
      ])
      .where("p.is_active", "=", true)
      .orderBy("p.created_at", "desc")
      .execute();
  }

  async findById(id: string) {
    return this.db
      .selectFrom("plans as p")
      .leftJoin("users as u", "u.id", "p.created_by")
      .select([
        "p.id",
        "p.name",
        "p.description",
        "p.created_by",
        "p.is_active",
        "p.created_at",
        "p.updated_at",
        "u.email as created_by_email",
      ])
      .where("p.id", "=", id)
      .executeTakeFirst();
  }

  async update(id: string, name?: string, description?: string) {
    return this.db
      .updateTable("plans")
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        updated_at: sql`NOW()`,
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async softDelete(id: string) {
    return this.db
      .updateTable("plans")
      .set({ is_active: false })
      .where("id", "=", id)
      .execute();
  }
}