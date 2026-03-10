/**
 * Additional LibSQL Repository Adapters
 * Continuing with Environment Config, API Key, Feature, Feature Flag, Advanced Config and Targeting Rules
 */

import { getDatabase } from "@lib/db";
import type { Client, InArgs } from "@libsql/client";
import type {
  EnvironmentConfig,
  ApiKey,
  Feature,
  FeatureFlag,
  AdvancedConfiguration,
  TargetingRule,
  CreateFeatureDTO,
  UpdateFeatureDTO,
  CreateAdvancedConfigDTO,
} from "@domain/entities";
import type {
  EnvironmentConfigRepository,
  ApiKeyRepository,
  FeatureRepository,
  FeatureFlagRepository,
  AdvancedConfigRepository,
  TargetingRuleRepository,
} from "@application/ports/repositories";
import { generateSecureId } from "../../lib/utils";

// ====================
// Environment Config Repository Adapter
// ====================

export class LibSqlEnvironmentConfigRepository implements EnvironmentConfigRepository {
  private db: Client | null = null;

  private async getDb(): Promise<Client> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  async findById(id: number): Promise<EnvironmentConfig | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM environment_configs WHERE id = ?",
      args: [id],
    });
    return (result.rows[0] as never as EnvironmentConfig) || null;
  }

  async findByEnvironmentId(
    environmentId: number,
  ): Promise<EnvironmentConfig[]> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM environment_configs WHERE environment_id = ? ORDER BY created_at DESC",
      args: [environmentId],
    });
    return result.rows as never as EnvironmentConfig[];
  }

  async create(
    environmentId: number,
    config: Partial<EnvironmentConfig>,
  ): Promise<EnvironmentConfig> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: `INSERT INTO environment_configs (environment_id, key, default_value, overridden_value)
            VALUES (?, ?, ?, ?)`,
      args: [
        environmentId,
        config.key as string,
        config.default_value as string,
        config.overridden_value || null,
      ],
    });
    const created = await this.findById(Number(result.lastInsertRowid));
    if (!created) throw new Error("Failed to create environment config");
    return created;
  }

  async update(
    id: number,
    config: Partial<EnvironmentConfig>,
  ): Promise<EnvironmentConfig> {
    const db = await this.getDb();
    const updates: string[] = [];
    const args: unknown[] = [];

    if (config.key) {
      updates.push("key = ?");
      args.push(config.key);
    }
    if (config.default_value !== undefined) {
      updates.push("default_value = ?");
      args.push(config.default_value);
    }
    if (config.overridden_value !== undefined) {
      updates.push("overridden_value = ?");
      args.push(config.overridden_value);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    args.push(id);

    await db.execute({
      sql: `UPDATE environment_configs SET ${updates.join(", ")} WHERE id = ?`,
      args: args as InArgs,
    });

    const updated = await this.findById(id);
    if (!updated) throw new Error("Failed to update environment config");
    return updated;
  }

  async delete(id: number): Promise<void> {
    const db = await this.getDb();
    await db.execute({
      sql: "DELETE FROM environment_configs WHERE id = ?",
      args: [id],
    });
  }
}

// ====================
// API Key Repository Adapter
// ====================

export class LibSqlApiKeyRepository implements ApiKeyRepository {
  private db: Client | null = null;

  private async getDb(): Promise<Client> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  async findById(id: number): Promise<ApiKey | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM api_keys WHERE id = ?",
      args: [id],
    });
    return (result.rows[0] as never as ApiKey) || null;
  }

  async findByKey(key: string): Promise<ApiKey | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM api_keys WHERE key = ?",
      args: [key],
    });
    return (result.rows[0] as never as ApiKey) || null;
  }

  async findByEnvironmentId(environmentId: number): Promise<ApiKey[]> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM api_keys WHERE environment_id = ? ORDER BY created_at DESC",
      args: [environmentId],
    });
    return result.rows as never as ApiKey[];
  }

  async create(environmentId: number): Promise<ApiKey> {
    const db = await this.getDb();
    const key = generateSecureId();
    const result = await db.execute({
      sql: `INSERT INTO api_keys (environment_id, key) VALUES (?, ?)`,
      args: [environmentId, key],
    });
    const created = await this.findById(Number(result.lastInsertRowid));
    if (!created) throw new Error("Failed to create API key");
    return created;
  }

  async updateLastUsed(id: number): Promise<void> {
    const db = await this.getDb();
    await db.execute({
      sql: "UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE id = ?",
      args: [id],
    });
  }

  async delete(id: number): Promise<void> {
    const db = await this.getDb();
    await db.execute({
      sql: "DELETE FROM api_keys WHERE id = ?",
      args: [id],
    });
  }
}

// ====================
// Feature Repository Adapter
// ====================

export class LibSqlFeatureRepository implements FeatureRepository {
  private db: Client | null = null;

  private async getDb(): Promise<Client> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  async findById(id: number): Promise<Feature | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM features WHERE id = ?",
      args: [id],
    });
    return (result.rows[0] as never as Feature) || null;
  }

  async findBySpaceId(spaceId: number): Promise<Feature[]> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM features WHERE space_id = ? ORDER BY created_at DESC",
      args: [spaceId],
    });
    return result.rows as never as Feature[];
  }

  async findByKey(spaceId: number, key: string): Promise<Feature | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM features WHERE space_id = ? AND key = ?",
      args: [spaceId, key],
    });
    return (result.rows[0] as never as Feature) || null;
  }

  async create(spaceId: number, dto: CreateFeatureDTO): Promise<Feature> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: `INSERT INTO features (space_id, key, name, description, type, default_value)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        spaceId,
        dto.key,
        dto.name,
        dto.description || null,
        dto.type,
        dto.default_value,
      ],
    });
    const created = await this.findById(Number(result.lastInsertRowid));
    if (!created) throw new Error("Failed to create feature");
    return created;
  }

  async update(id: number, dto: UpdateFeatureDTO): Promise<Feature> {
    const db = await this.getDb();
    const updates: string[] = [];
    const args: unknown[] = [];

    if (dto.name) {
      updates.push("name = ?");
      args.push(dto.name);
    }
    if (dto.description !== undefined) {
      updates.push("description = ?");
      args.push(dto.description || null);
    }
    if (dto.default_value) {
      updates.push("default_value = ?");
      args.push(dto.default_value);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    args.push(id);

    await db.execute({
      sql: `UPDATE features SET ${updates.join(", ")} WHERE id = ?`,
      args: args as InArgs,
    });

    const updated = await this.findById(id);
    if (!updated) throw new Error("Failed to update feature");
    return updated;
  }

  async delete(id: number): Promise<void> {
    const db = await this.getDb();
    await db.execute({
      sql: "DELETE FROM features WHERE id = ?",
      args: [id],
    });
  }
}

// ====================
// Feature Flag Repository Adapter
// ====================

export class LibSqlFeatureFlagRepository implements FeatureFlagRepository {
  private db: Client | null = null;

  private async getDb(): Promise<Client> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  async findById(id: number): Promise<FeatureFlag | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM feature_flags WHERE id = ?",
      args: [id],
    });
    return (result.rows[0] as never as FeatureFlag) || null;
  }

  async findByFeatureAndEnvironment(
    featureId: number,
    environmentId: number,
  ): Promise<FeatureFlag | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM feature_flags WHERE feature_id = ? AND environment_id = ?",
      args: [featureId, environmentId],
    });
    return (result.rows[0] as never as FeatureFlag) || null;
  }

  async findByEnvironmentId(environmentId: number): Promise<FeatureFlag[]> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM feature_flags WHERE environment_id = ? ORDER BY created_at DESC",
      args: [environmentId],
    });
    return result.rows as never as FeatureFlag[];
  }

  async findByFeatureId(featureId: number): Promise<FeatureFlag[]> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM feature_flags WHERE feature_id = ? ORDER BY created_at DESC",
      args: [featureId],
    });
    return result.rows as never as FeatureFlag[];
  }

  async create(featureId: number, environmentId: number): Promise<FeatureFlag> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: `INSERT INTO feature_flags (feature_id, environment_id) VALUES (?, ?)`,
      args: [featureId, environmentId],
    });
    const created = await this.findById(Number(result.lastInsertRowid));
    if (!created) throw new Error("Failed to create feature flag");
    return created;
  }

  async update(
    id: number,
    updates: Partial<FeatureFlag>,
  ): Promise<FeatureFlag> {
    const db = await this.getDb();
    const parts: string[] = [];
    const args: unknown[] = [];

    if (updates.is_enabled !== undefined) {
      parts.push("is_enabled = ?");
      args.push(updates.is_enabled ? 1 : 0);
    }
    if (updates.rollout_percentage !== undefined) {
      parts.push("rollout_percentage = ?");
      args.push(updates.rollout_percentage);
    }
    if (updates.value !== undefined) {
      parts.push("value = ?");
      args.push(updates.value);
    }

    parts.push("updated_at = CURRENT_TIMESTAMP");
    args.push(id);

    await db.execute({
      sql: `UPDATE feature_flags SET ${parts.join(", ")} WHERE id = ?`,
      args: args as InArgs,
    });

    const updated = await this.findById(id);
    if (!updated) throw new Error("Failed to update feature flag");
    return updated;
  }

  async delete(id: number): Promise<void> {
    const db = await this.getDb();
    await db.execute({
      sql: "DELETE FROM feature_flags WHERE id = ?",
      args: [id],
    });
  }
}

// ====================
// Advanced Configuration Repository Adapter
// ====================

export class LibSqlAdvancedConfigRepository implements AdvancedConfigRepository {
  private db: Client | null = null;

  private async getDb(): Promise<Client> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  async findById(id: number): Promise<AdvancedConfiguration | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM advanced_configurations WHERE id = ?",
      args: [id],
    });
    return (result.rows[0] as never as AdvancedConfiguration) || null;
  }

  async findByFeatureFlagId(
    featureFlagId: number,
  ): Promise<AdvancedConfiguration | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM advanced_configurations WHERE feature_flag_id = ?",
      args: [featureFlagId],
    });
    return (result.rows[0] as never as AdvancedConfiguration) || null;
  }

  async create(dto: CreateAdvancedConfigDTO): Promise<AdvancedConfiguration> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: `INSERT INTO advanced_configurations (
        feature_flag_id, rollout_percentage, rollout_start_date, rollout_end_date,
        default_value, scheduling_enabled, schedule_start_date, schedule_start_time,
        schedule_end_date, schedule_end_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        dto.feature_flag_id,
        dto.rollout_percentage,
        dto.rollout_start_date || null,
        dto.rollout_end_date || null,
        dto.default_value,
        dto.scheduling_enabled ? 1 : 0,
        dto.schedule_start_date || null,
        dto.schedule_start_time || null,
        dto.schedule_end_date || null,
        dto.schedule_end_time || null,
      ],
    });
    const created = await this.findById(Number(result.lastInsertRowid));
    if (!created) throw new Error("Failed to create advanced configuration");
    return created;
  }

  async update(
    id: number,
    updates: Partial<AdvancedConfiguration>,
  ): Promise<AdvancedConfiguration> {
    const db = await this.getDb();
    const parts: string[] = [];
    const args: unknown[] = [];

    if (updates.rollout_percentage !== undefined) {
      parts.push("rollout_percentage = ?");
      args.push(updates.rollout_percentage);
    }
    if (updates.rollout_start_date !== undefined) {
      parts.push("rollout_start_date = ?");
      args.push(updates.rollout_start_date);
    }
    if (updates.rollout_end_date !== undefined) {
      parts.push("rollout_end_date = ?");
      args.push(updates.rollout_end_date);
    }
    if (updates.default_value !== undefined) {
      parts.push("default_value = ?");
      args.push(updates.default_value);
    }
    if (updates.scheduling_enabled !== undefined) {
      parts.push("scheduling_enabled = ?");
      args.push(updates.scheduling_enabled ? 1 : 0);
    }
    if (updates.schedule_start_date !== undefined) {
      parts.push("schedule_start_date = ?");
      args.push(updates.schedule_start_date);
    }
    if (updates.schedule_start_time !== undefined) {
      parts.push("schedule_start_time = ?");
      args.push(updates.schedule_start_time);
    }
    if (updates.schedule_end_date !== undefined) {
      parts.push("schedule_end_date = ?");
      args.push(updates.schedule_end_date);
    }
    if (updates.schedule_end_time !== undefined) {
      parts.push("schedule_end_time = ?");
      args.push(updates.schedule_end_time);
    }

    parts.push("updated_at = CURRENT_TIMESTAMP");
    args.push(id);

    await db.execute({
      sql: `UPDATE advanced_configurations SET ${parts.join(", ")} WHERE id = ?`,
      args: args as InArgs,
    });

    const updated = await this.findById(id);
    if (!updated) throw new Error("Failed to update advanced configuration");
    return updated;
  }

  async delete(id: number): Promise<void> {
    const db = await this.getDb();
    await db.execute({
      sql: "DELETE FROM advanced_configurations WHERE id = ?",
      args: [id],
    });
  }
}

// ====================
// Targeting Rule Repository Adapter
// ====================

export class LibSqlTargetingRuleRepository implements TargetingRuleRepository {
  private db: Client | null = null;

  private async getDb(): Promise<Client> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  async findById(id: number): Promise<TargetingRule | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM targeting_rules WHERE id = ?",
      args: [id],
    });
    return (result.rows[0] as never as TargetingRule) || null;
  }

  async findByFeatureFlagId(featureFlagId: number): Promise<TargetingRule[]> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM targeting_rules WHERE feature_flag_id = ? ORDER BY created_at DESC",
      args: [featureFlagId],
    });
    return result.rows as never as TargetingRule[];
  }

  async create(
    featureFlagId: number,
    rule: Omit<TargetingRule, "id" | "created_at">,
  ): Promise<TargetingRule> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: `INSERT INTO targeting_rules (feature_flag_id, rule_type, rule_value, operator)
            VALUES (?, ?, ?, ?)`,
      args: [featureFlagId, rule.rule_type, rule.rule_value, rule.operator],
    });
    const created = await this.findById(Number(result.lastInsertRowid));
    if (!created) throw new Error("Failed to create targeting rule");
    return created;
  }

  async update(
    id: number,
    rule: Partial<Omit<TargetingRule, "id" | "created_at">>,
  ): Promise<TargetingRule> {
    const db = await this.getDb();
    const parts: string[] = [];
    const args: unknown[] = [];

    if (rule.rule_type) {
      parts.push("rule_type = ?");
      args.push(rule.rule_type);
    }
    if (rule.rule_value) {
      parts.push("rule_value = ?");
      args.push(rule.rule_value);
    }
    if (rule.operator) {
      parts.push("operator = ?");
      args.push(rule.operator);
    }

    args.push(id);

    await db.execute({
      sql: `UPDATE targeting_rules SET ${parts.join(", ")} WHERE id = ?`,
      args: args as InArgs,
    });

    const updated = await this.findById(id);
    if (!updated) throw new Error("Failed to update targeting rule");
    return updated;
  }

  async delete(id: number): Promise<void> {
    const db = await this.getDb();
    await db.execute({
      sql: "DELETE FROM targeting_rules WHERE id = ?",
      args: [id] as InArgs,
    });
  }

  async deleteByFeatureFlagId(featureFlagId: number): Promise<void> {
    const db = await this.getDb();
    await db.execute({
      sql: "DELETE FROM targeting_rules WHERE feature_flag_id = ?",
      args: [featureFlagId],
    });
  }
}
