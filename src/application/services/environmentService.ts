import { Environment } from "../../domain/models";
import getDb from "../../db";
import { EnvironmentRepository } from "../../infrastructure/repositories/environmentRepository";
import { FeatureRepository } from "../../infrastructure/repositories/featureRepository";
import { FeatureValueRepository } from "../../infrastructure/repositories/featureValueRepository";

export class EnvironmentService {
  constructor(
    private readonly environmentRepository: EnvironmentRepository,
    private readonly featureRepository: FeatureRepository,
    private readonly featureValueRepository: FeatureValueRepository,
  ) {}

  async listEnvironments(): Promise<Environment[]> {
    return this.environmentRepository.listAll();
  }

  async createEnvironment(name: string): Promise<Environment> {
    return this.environmentRepository.create(name);
  }

  async updateEnvironmentName(
    id: number,
    name: string,
  ): Promise<Environment | null> {
    const updated = await this.environmentRepository.updateName(id, name);
    if (!updated) return null;
    const environment = await this.environmentRepository.findById(id);
    return environment || null;
  }

  async deleteEnvironment(id: number): Promise<boolean> {
    const environment = await this.environmentRepository.findById(id);
    if (!environment) return false;

    const db = await getDb();
    await db.exec("BEGIN");
    try {
      await this.featureValueRepository.deleteByEnvironmentId(id);

      const deleted = await this.environmentRepository.deleteById(id);
      if (!deleted) {
        throw new Error("Failed to delete environment");
      }

      const remainingEnvironments = await this.environmentRepository.countAll();
      if (remainingEnvironments === 0) {
        await this.featureValueRepository.deleteAll();
        await this.featureRepository.deleteAll();
      }

      await db.exec("COMMIT");
      return true;
    } catch (error) {
      await db.exec("ROLLBACK");
      throw error;
    }
  }

  async findByName(name: string): Promise<Environment | undefined> {
    return this.environmentRepository.findByName(name);
  }
}
