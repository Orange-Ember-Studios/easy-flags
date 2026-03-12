/**
 * Analytics LibSQL Repository Adapters
 * Implementations for Flag Evaluation, Usage Metrics, and Performance Metrics
 */

import { getDatabase } from "@lib/db";
import type { Client, InArgs } from "@libsql/client";
import type {
  FlagEvaluation,
  FlagUsageMetric,
  PerformanceMetric,
  CreateFlagEvaluationDTO,
  AnalyticsQueryFilters,
} from "@domain/entities";
import type {
  FlagEvaluationRepository,
  FlagUsageMetricRepository,
  PerformanceMetricRepository,
} from "@application/ports/repositories";

// ====================
// Flag Evaluation Repository Adapter
// ====================

export class LibSqlFlagEvaluationRepository implements FlagEvaluationRepository {
  private db: Client | null = null;

  private async getDb(): Promise<Client> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  async create(dto: CreateFlagEvaluationDTO): Promise<FlagEvaluation> {
    const db = await this.getDb();
    const contextDataJson = dto.context_data
      ? JSON.stringify(dto.context_data)
      : null;

    const result = await db.execute({
      sql: `INSERT INTO flag_evaluations (
        space_id, environment_id, feature_id, api_key_hash, 
        was_enabled, evaluation_result, evaluation_time_ms, 
        error_message, context_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [
        dto.space_id,
        dto.environment_id,
        dto.feature_id,
        dto.api_key_hash,
        dto.was_enabled ? 1 : 0,
        dto.evaluation_result,
        dto.evaluation_time_ms,
        dto.error_message || null,
        contextDataJson,
      ],
    });

    const created = await this.findById(Number(result.lastInsertRowid));
    if (!created) throw new Error("Failed to create flag evaluation");
    return created;
  }

  async findById(id: number): Promise<FlagEvaluation | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM flag_evaluations WHERE id = ?",
      args: [id],
    });
    const row = result.rows[0] as any;
    if (!row) return null;

    return this.mapRowToEntity(row);
  }

  async findByFilters(filters: AnalyticsQueryFilters): Promise<FlagEvaluation[]> {
    const db = await this.getDb();
    const conditions: string[] = [];
    const args: unknown[] = [];

    if (filters.spaceId) {
      conditions.push("space_id = ?");
      args.push(filters.spaceId);
    }
    if (filters.environmentId) {
      conditions.push("environment_id = ?");
      args.push(filters.environmentId);
    }
    if (filters.featureId) {
      conditions.push("feature_id = ?");
      args.push(filters.featureId);
    }
    if (filters.dateFrom) {
      conditions.push("DATE(created_at) >= ?");
      args.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push("DATE(created_at) <= ?");
      args.push(filters.dateTo);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = filters.limit || 1000;
    const offset = filters.offset || 0;

    const result = await db.execute({
      sql: `SELECT * FROM flag_evaluations 
            ${whereClause} 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?`,
      args: [...args, limit, offset] as InArgs,
    });

    return result.rows.map((row) => this.mapRowToEntity(row as any));
  }

  async findRecentByEnvironment(
    environmentId: number,
    limit: number,
  ): Promise<FlagEvaluation[]> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: `SELECT * FROM flag_evaluations 
            WHERE environment_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?`,
      args: [environmentId, limit],
    });

    return result.rows.map((row) => this.mapRowToEntity(row as any));
  }

  async deleteOlderThan(days: number): Promise<number> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: `DELETE FROM flag_evaluations 
            WHERE created_at < datetime('now', '-' || ? || ' days')`,
      args: [days],
    });
    return (result as any).changes || 0;
  }

  private mapRowToEntity(row: any): FlagEvaluation {
    return {
      id: row.id as number,
      space_id: row.space_id as number,
      environment_id: row.environment_id as number,
      feature_id: row.feature_id as number,
      api_key_hash: row.api_key_hash as string,
      was_enabled: Boolean(row.was_enabled),
      evaluation_result: row.evaluation_result as string,
      evaluation_time_ms: row.evaluation_time_ms as number,
      error_message: row.error_message as string | undefined,
      context_data: row.context_data as string | undefined,
      created_at: row.created_at as string,
    };
  }
}

// ====================
// Flag Usage Metric Repository Adapter
// ====================

export class LibSqlFlagUsageMetricRepository
  implements FlagUsageMetricRepository
{
  private db: Client | null = null;

  private async getDb(): Promise<Client> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  async create(
    metric: Omit<FlagUsageMetric, "id" | "created_at" | "updated_at">,
  ): Promise<FlagUsageMetric> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: `INSERT INTO flag_usage_metrics (
        space_id, environment_id, feature_id, metric_date,
        total_evaluations, enabled_count, disabled_count, error_count,
        avg_evaluation_time_ms, min_evaluation_time_ms, max_evaluation_time_ms,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [
        metric.space_id,
        metric.environment_id,
        metric.feature_id,
        metric.metric_date,
        metric.total_evaluations,
        metric.enabled_count,
        metric.disabled_count,
        metric.error_count,
        metric.avg_evaluation_time_ms,
        metric.min_evaluation_time_ms,
        metric.max_evaluation_time_ms,
      ],
    });

    const created = await this.findById(Number(result.lastInsertRowid));
    if (!created) throw new Error("Failed to create usage metric");
    return created;
  }

  async findById(id: number): Promise<FlagUsageMetric | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM flag_usage_metrics WHERE id = ?",
      args: [id],
    });
    return (result.rows[0] as never as FlagUsageMetric) || null;
  }

  async findByFilters(filters: AnalyticsQueryFilters): Promise<FlagUsageMetric[]> {
    const db = await this.getDb();
    const conditions: string[] = [];
    const args: unknown[] = [];

    if (filters.spaceId) {
      conditions.push("space_id = ?");
      args.push(filters.spaceId);
    }
    if (filters.environmentId) {
      conditions.push("environment_id = ?");
      args.push(filters.environmentId);
    }
    if (filters.featureId) {
      conditions.push("feature_id = ?");
      args.push(filters.featureId);
    }
    if (filters.dateFrom) {
      conditions.push("metric_date >= ?");
      args.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push("metric_date <= ?");
      args.push(filters.dateTo);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    const result = await db.execute({
      sql: `SELECT * FROM flag_usage_metrics 
            ${whereClause} 
            ORDER BY metric_date DESC 
            LIMIT ? OFFSET ?`,
      args: [...args, limit, offset] as InArgs,
    });

    return result.rows as never as FlagUsageMetric[];
  }

  async findLatestByFeature(
    featureId: number,
    days: number,
  ): Promise<FlagUsageMetric[]> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: `SELECT * FROM flag_usage_metrics 
            WHERE feature_id = ? 
            AND metric_date >= date('now', '-' || ? || ' days')
            ORDER BY metric_date DESC`,
      args: [featureId, days],
    });

    return result.rows as never as FlagUsageMetric[];
  }

  async findBySpaceAndDate(
    spaceId: number,
    dateFrom: string,
    dateTo: string,
  ): Promise<FlagUsageMetric[]> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: `SELECT * FROM flag_usage_metrics 
            WHERE space_id = ? 
            AND metric_date >= ? 
            AND metric_date <= ?
            ORDER BY metric_date DESC`,
      args: [spaceId, dateFrom, dateTo],
    });

    return result.rows as never as FlagUsageMetric[];
  }

  async upsert(
    metric: Omit<FlagUsageMetric, "id" | "created_at" | "updated_at">,
  ): Promise<FlagUsageMetric> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: `INSERT INTO flag_usage_metrics (
        space_id, environment_id, feature_id, metric_date,
        total_evaluations, enabled_count, disabled_count, error_count,
        avg_evaluation_time_ms, min_evaluation_time_ms, max_evaluation_time_ms,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(space_id, environment_id, feature_id, metric_date) DO UPDATE SET
        total_evaluations = excluded.total_evaluations,
        enabled_count = excluded.enabled_count,
        disabled_count = excluded.disabled_count,
        error_count = excluded.error_count,
        avg_evaluation_time_ms = excluded.avg_evaluation_time_ms,
        min_evaluation_time_ms = excluded.min_evaluation_time_ms,
        max_evaluation_time_ms = excluded.max_evaluation_time_ms,
        updated_at = CURRENT_TIMESTAMP`,
      args: [
        metric.space_id,
        metric.environment_id,
        metric.feature_id,
        metric.metric_date,
        metric.total_evaluations,
        metric.enabled_count,
        metric.disabled_count,
        metric.error_count,
        metric.avg_evaluation_time_ms,
        metric.min_evaluation_time_ms,
        metric.max_evaluation_time_ms,
      ],
    });

    // Find by unique constraint for upserted data
    const findResult = await db.execute({
      sql: `SELECT * FROM flag_usage_metrics 
            WHERE space_id = ? AND environment_id = ? AND feature_id = ? AND metric_date = ?`,
      args: [
        metric.space_id,
        metric.environment_id,
        metric.feature_id,
        metric.metric_date,
      ],
    });

    const created = findResult.rows[0] as unknown as FlagUsageMetric | undefined;
    if (!created) throw new Error("Failed to upsert usage metric");
    return created;
  }
}

// ====================
// Performance Metric Repository Adapter
// ====================

export class LibSqlPerformanceMetricRepository
  implements PerformanceMetricRepository
{
  private db: Client | null = null;

  private async getDb(): Promise<Client> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  async create(
    metric: Omit<PerformanceMetric, "id" | "created_at">,
  ): Promise<PerformanceMetric> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: `INSERT INTO performance_metrics (
        space_id, metric_type, value_ms, endpoint, environment_id, created_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [
        metric.space_id,
        metric.metric_type,
        metric.value_ms,
        metric.endpoint || null,
        metric.environment_id || null,
      ],
    });

    const created = await this.findById(Number(result.lastInsertRowid));
    if (!created) throw new Error("Failed to create performance metric");
    return created;
  }

  async findById(id: number): Promise<PerformanceMetric | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM performance_metrics WHERE id = ?",
      args: [id],
    });
    return (result.rows[0] as never as PerformanceMetric) || null;
  }

  async findByMetricType(
    metricType: PerformanceMetric["metric_type"],
    limit: number,
  ): Promise<PerformanceMetric[]> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: `SELECT * FROM performance_metrics 
            WHERE metric_type = ? 
            ORDER BY created_at DESC 
            LIMIT ?`,
      args: [metricType, limit],
    });

    return result.rows as never as PerformanceMetric[];
  }

  async findAverageByEndpoint(endpoint: string, hours: number): Promise<number> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: `SELECT AVG(value_ms) as avg_time FROM performance_metrics 
            WHERE endpoint = ? 
            AND created_at > datetime('now', '-' || ? || ' hours')`,
      args: [endpoint, hours],
    });

    const row = result.rows[0] as any;
    return row?.avg_time ?? 0;
  }

  async deleteOlderThan(days: number): Promise<number> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: `DELETE FROM performance_metrics 
            WHERE created_at < datetime('now', '-' || ? || ' days')`,
      args: [days],
    });
    return (result as any).changes || 0;
  }
}
