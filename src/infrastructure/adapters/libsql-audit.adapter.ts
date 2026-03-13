/**
 * Audit Logging LibSQL Repository Adapters
 * Implementations for Audit Logs, Permission Denials, and Compliance Reports
 */

import { getDatabase } from "@lib/db";
import type { Client } from "@libsql/client";
import type {
  AuditLog,
  ComplianceReport,
  PermissionDenialLog,
  CreateAuditLogDTO,
  AuditLogQueryFilters,
  ComplianceReportQueryFilters,
} from "@domain/entities";
import type {
  AuditLogRepository,
  PermissionDenialLogRepository,
  ComplianceReportRepository,
} from "@application/ports/repositories";

// ====================
// Audit Log Repository Adapter
// ====================

export class LibSqlAuditLogRepository implements AuditLogRepository {
  private db: Client | null = null;

  private async getDb(): Promise<Client> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  async create(dto: CreateAuditLogDTO): Promise<AuditLog> {
    const db = await this.getDb();

    const changesBeforeJson = dto.changes_before
      ? JSON.stringify(dto.changes_before)
      : null;
    const changesAfterJson = dto.changes_after
      ? JSON.stringify(dto.changes_after)
      : null;
    const metadataJson = dto.metadata ? JSON.stringify(dto.metadata) : null;

    const result = await db.execute({
      sql: `INSERT INTO audit_logs (
        space_id, user_id, action, resource_type, resource_id,
        severity, status, error_message, changes_before, changes_after,
        metadata, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      RETURNING *`,
      args: [
        dto.space_id || null,
        dto.user_id,
        dto.action,
        dto.resource_type,
        dto.resource_id,
        dto.severity,
        dto.status,
        dto.error_message || null,
        changesBeforeJson,
        changesAfterJson,
        metadataJson,
        dto.ip_address || null,
        dto.user_agent || null,
      ],
    });

    const row = (result as any).rows?.[0];
    if (!row) {
      throw new Error("Failed to create audit log");
    }

    return this.mapRowToAuditLog(row);
  }

  async findById(id: number): Promise<AuditLog | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM audit_logs WHERE id = ?",
      args: [id],
    });

    const row = (result as any).rows?.[0];
    return row ? this.mapRowToAuditLog(row) : null;
  }

  async findByFilters(filters: AuditLogQueryFilters): Promise<AuditLog[]> {
    const db = await this.getDb();
    let sql = "SELECT * FROM audit_logs WHERE 1=1";
    const args: any[] = [];

    if (filters.spaceId) {
      sql += " AND space_id = ?";
      args.push(filters.spaceId);
    }
    if (filters.userId) {
      sql += " AND user_id = ?";
      args.push(filters.userId);
    }
    if (filters.action) {
      sql += " AND action = ?";
      args.push(filters.action);
    }
    if (filters.resourceType) {
      sql += " AND resource_type = ?";
      args.push(filters.resourceType);
    }
    if (filters.severity) {
      sql += " AND severity = ?";
      args.push(filters.severity);
    }
    if (filters.status) {
      sql += " AND status = ?";
      args.push(filters.status);
    }
    if (filters.dateFrom) {
      sql += " AND created_at >= ?";
      args.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      sql += " AND created_at <= ?";
      args.push(filters.dateTo);
    }

    sql += " ORDER BY created_at DESC";
    if (filters.limit) {
      sql += " LIMIT ?";
      args.push(filters.limit);
    }
    if (filters.offset) {
      sql += " OFFSET ?";
      args.push(filters.offset);
    }

    const result = await db.execute({ sql, args });
    return ((result as any).rows || []).map((row: any) =>
      this.mapRowToAuditLog(row),
    );
  }

  async findBySpaceId(spaceId: number, limit = 100): Promise<AuditLog[]> {
    return this.findByFilters({
      spaceId,
      limit,
    });
  }

  async findByUserId(userId: number, limit = 100): Promise<AuditLog[]> {
    return this.findByFilters({
      userId,
      limit,
    });
  }

  async findBySeverity(severity: string, limit = 100): Promise<AuditLog[]> {
    return this.findByFilters({
      severity: severity as any,
      limit,
    });
  }

  async deleteOlderThan(days: number): Promise<number> {
    const db = await this.getDb();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const isoDate = cutoffDate.toISOString();

    const result = await db.execute({
      sql: "DELETE FROM audit_logs WHERE created_at < ?",
      args: [isoDate],
    });

    return (result as any).changes || 0;
  }

  private mapRowToAuditLog(row: any): AuditLog {
    return {
      id: row.id,
      space_id: row.space_id,
      user_id: row.user_id,
      action: row.action,
      resource_type: row.resource_type,
      resource_id: row.resource_id,
      severity: row.severity,
      status: row.status,
      error_message: row.error_message,
      changes_before: row.changes_before,
      changes_after: row.changes_after,
      metadata: row.metadata,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      created_at: row.created_at,
    };
  }
}

// ====================
// Permission Denial Log Repository Adapter
// ====================

export class LibSqlPermissionDenialLogRepository
  implements PermissionDenialLogRepository
{
  private db: Client | null = null;

  private async getDb(): Promise<Client> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  async create(
    log: Omit<PermissionDenialLog, "id" | "created_at">,
  ): Promise<PermissionDenialLog> {
    const db = await this.getDb();

    const result = await db.execute({
      sql: `INSERT INTO permission_denial_logs (
        user_id, space_id, resource_type, resource_id,
        required_permission, user_role, ip_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      RETURNING *`,
      args: [
        log.user_id,
        log.space_id || null,
        log.resource_type,
        log.resource_id,
        log.required_permission,
        log.user_role || null,
        log.ip_address || null,
      ],
    });

    const row = (result as any).rows?.[0];
    if (!row) {
      throw new Error("Failed to create permission denial log");
    }

    return this.mapRowToPermissionDenialLog(row);
  }

  async findById(id: number): Promise<PermissionDenialLog | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM permission_denial_logs WHERE id = ?",
      args: [id],
    });

    const row = (result as any).rows?.[0];
    return row ? this.mapRowToPermissionDenialLog(row) : null;
  }

  async findByUserId(userId: number, limit = 100): Promise<PermissionDenialLog[]> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM permission_denial_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
      args: [userId, limit],
    });

    return ((result as any).rows || []).map((row: any) =>
      this.mapRowToPermissionDenialLog(row),
    );
  }

  async findBySpaceId(spaceId: number, limit = 100): Promise<PermissionDenialLog[]> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM permission_denial_logs WHERE space_id = ? ORDER BY created_at DESC LIMIT ?",
      args: [spaceId, limit],
    });

    return ((result as any).rows || []).map((row: any) =>
      this.mapRowToPermissionDenialLog(row),
    );
  }

  async findRecentByUser(
    userId: number,
    hours: number,
  ): Promise<PermissionDenialLog[]> {
    const db = await this.getDb();
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    const isoTime = cutoffTime.toISOString();

    const result = await db.execute({
      sql: "SELECT * FROM permission_denial_logs WHERE user_id = ? AND created_at >= ? ORDER BY created_at DESC",
      args: [userId, isoTime],
    });

    return ((result as any).rows || []).map((row: any) =>
      this.mapRowToPermissionDenialLog(row),
    );
  }

  async deleteOlderThan(days: number): Promise<number> {
    const db = await this.getDb();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const isoDate = cutoffDate.toISOString();

    const result = await db.execute({
      sql: "DELETE FROM permission_denial_logs WHERE created_at < ?",
      args: [isoDate],
    });

    return (result as any).changes || 0;
  }

  private mapRowToPermissionDenialLog(row: any): PermissionDenialLog {
    return {
      id: row.id,
      user_id: row.user_id,
      space_id: row.space_id,
      resource_type: row.resource_type,
      resource_id: row.resource_id,
      required_permission: row.required_permission,
      user_role: row.user_role,
      ip_address: row.ip_address,
      created_at: row.created_at,
    };
  }
}

// ====================
// Compliance Report Repository Adapter
// ====================

export class LibSqlComplianceReportRepository
  implements ComplianceReportRepository
{
  private db: Client | null = null;

  private async getDb(): Promise<Client> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  async create(
    report: Omit<ComplianceReport, "id" | "created_at">,
  ): Promise<ComplianceReport> {
    const db = await this.getDb();
    const dataJson = JSON.stringify(report.data);

    const result = await db.execute({
      sql: `INSERT INTO compliance_reports (
        space_id, report_type, period_start, period_end,
        total_actions, critical_actions, failed_actions,
        unique_users, data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      RETURNING *`,
      args: [
        report.space_id,
        report.report_type,
        report.period_start,
        report.period_end,
        report.total_actions,
        report.critical_actions,
        report.failed_actions,
        report.unique_users,
        dataJson,
      ],
    });

    const row = (result as any).rows?.[0];
    if (!row) {
      throw new Error("Failed to create compliance report");
    }

    return this.mapRowToComplianceReport(row);
  }

  async findById(id: number): Promise<ComplianceReport | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM compliance_reports WHERE id = ?",
      args: [id],
    });

    const row = (result as any).rows?.[0];
    return row ? this.mapRowToComplianceReport(row) : null;
  }

  async findByFilters(
    filters: ComplianceReportQueryFilters,
  ): Promise<ComplianceReport[]> {
    const db = await this.getDb();
    let sql = "SELECT * FROM compliance_reports WHERE space_id = ?";
    const args: any[] = [filters.spaceId];

    if (filters.reportType) {
      sql += " AND report_type = ?";
      args.push(filters.reportType);
    }
    if (filters.dateFrom) {
      sql += " AND created_at >= ?";
      args.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      sql += " AND created_at <= ?";
      args.push(filters.dateTo);
    }

    sql += " ORDER BY created_at DESC";
    if (filters.limit) {
      sql += " LIMIT ?";
      args.push(filters.limit);
    }
    if (filters.offset) {
      sql += " OFFSET ?";
      args.push(filters.offset);
    }

    const result = await db.execute({ sql, args });
    return ((result as any).rows || []).map((row: any) =>
      this.mapRowToComplianceReport(row),
    );
  }

  async findLatestBySpaceAndType(
    spaceId: number,
    reportType: ComplianceReport["report_type"],
  ): Promise<ComplianceReport | null> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM compliance_reports WHERE space_id = ? AND report_type = ? ORDER BY created_at DESC LIMIT 1",
      args: [spaceId, reportType],
    });

    const row = (result as any).rows?.[0];
    return row ? this.mapRowToComplianceReport(row) : null;
  }

  async findBySpaceId(spaceId: number): Promise<ComplianceReport[]> {
    const db = await this.getDb();
    const result = await db.execute({
      sql: "SELECT * FROM compliance_reports WHERE space_id = ? ORDER BY created_at DESC",
      args: [spaceId],
    });

    return ((result as any).rows || []).map((row: any) =>
      this.mapRowToComplianceReport(row),
    );
  }

  private mapRowToComplianceReport(row: any): ComplianceReport {
    const data = typeof row.data === "string" ? row.data : JSON.stringify(row.data);
    return {
      id: row.id,
      space_id: row.space_id,
      report_type: row.report_type,
      period_start: row.period_start,
      period_end: row.period_end,
      total_actions: row.total_actions,
      critical_actions: row.critical_actions,
      failed_actions: row.failed_actions,
      unique_users: row.unique_users,
      data,
      created_at: row.created_at,
    };
  }
}
