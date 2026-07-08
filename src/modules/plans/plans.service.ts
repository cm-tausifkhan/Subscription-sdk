import { DB } from "../../core/database/index.js";
import { PlansRepository } from "../../repository/Plans.repository";

export class PlansService {
  private repo: PlansRepository;

  constructor(pool: DB) {
    this.repo = new PlansRepository(pool);
  }

  /* created_by comes from req.user.id via the auth middleware */
  async create(data: {
    name: string;
    description?: string;
    createdBy: string;
  }) {
    const result = await this.repo.create(
      data.name,
      data.description,
      data.createdBy,
    );
    return result;
  }

  /* Get all plans with the admin name who created it */
  async findAll() {
    const result = await this.repo.findAll();
    return result;
  }

  async findById(id: string) {
    const result = await this.repo.findById(id);
    return result;
  }

  async update(id: string, data: { name?: string; description?: string }) {
    const result = await this.repo.update(id, data.name, data.description);
    return result;
  }

  async delete(id: string) {
    await this.repo.softDelete(id);
    return { message: "Plan deleted successfully" };
  }
}
