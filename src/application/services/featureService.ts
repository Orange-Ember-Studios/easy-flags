import { Feature, FeatureValue } from "../../domain/models";
import { FeatureRepository } from "../../infrastructure/repositories/featureRepository";
import { FeatureValueRepository } from "../../infrastructure/repositories/featureValueRepository";

export class FeatureService {
  constructor(
    private readonly featureRepository: FeatureRepository,
    private readonly featureValueRepository: FeatureValueRepository,
  ) {}

  async listFeatures(): Promise<Feature[]> {
    return this.featureRepository.listAll();
  }

  async createFeature(key: string, description?: string): Promise<Feature> {
    return this.featureRepository.create(key, description);
  }

  async deleteFeature(id: number): Promise<boolean> {
    await this.featureValueRepository.deleteByFeatureId(id);
    return this.featureRepository.deleteById(id);
  }

  async setFeatureValue(
    featureId: number,
    environmentId: number,
    value: boolean,
  ): Promise<FeatureValue> {
    return this.featureValueRepository.upsert(featureId, environmentId, value);
  }

  async findByKey(key: string): Promise<Feature | undefined> {
    return this.featureRepository.findByKey(key);
  }
}
