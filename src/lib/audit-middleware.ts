/**
 * Audit Middleware - Automatic Audit Logging
 * Provides utilities for automatically tracking security-relevant events
 */

import { AuditService } from "@application/services";
import type {
  CreateAuditLogDTO,
  AuditAction,
  AuditSeverity,
} from "@domain/entities";

/**
 * Audit context for middleware tracking
 */
export interface AuditContext {
  userId: number;
  spaceId?: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Audit Middleware for automatic event tracking
 */
export class AuditMiddleware {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  /**
   * Track an audit event
   */
  async track(
    action: AuditAction,
    context: AuditContext,
    details: {
      resourceType: string;
      resourceId: number;
      severity?: AuditSeverity;
      status?: "success" | "failure";
      errorMessage?: string;
      changesBefore?: Record<string, any>;
      changesAfter?: Record<string, any>;
    },
  ): Promise<void> {
    try {
      const dto: CreateAuditLogDTO = {
        space_id: context.spaceId,
        user_id: context.userId,
        action,
        resource_type: details.resourceType,
        resource_id: details.resourceId,
        severity: details.severity || this.determineSeverity(action),
        status: details.status || "success",
        error_message: details.errorMessage,
        changes_before: details.changesBefore,
        changes_after: details.changesAfter,
        ip_address: context.ipAddress,
        user_agent: context.userAgent,
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: context.userAgent,
        },
      };

      // Non-blocking async logging
      this.auditService.logAudit(dto).catch((err) => {
        console.error("Failed to log audit event:", err);
      });
    } catch (error) {
      console.error("Error in audit middleware:", error);
      // Don't throw - audit logging failures shouldn't break application
    }
  }

  /**
   * Track a permission denial event
   */
  async trackPermissionDenial(
    userId: number,
    resourceType: string,
    resourceId: number,
    requiredPermission: string,
    context: Partial<AuditContext>,
  ): Promise<void> {
    try {
      await this.auditService.logPermissionDenial(
        userId,
        resourceType,
        resourceId,
        requiredPermission,
        {
          spaceId: context.spaceId,
          ipAddress: context.ipAddress,
        },
      );

      // Also log as audit event with critical severity
      await this.track("PERMISSION_DENIED", 
        {
          userId,
          spaceId: context.spaceId,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
        {
          resourceType,
          resourceId,
          severity: "warning",
          status: "failure",
          errorMessage: `Permission denied: ${requiredPermission}`,
        },
      );
    } catch (error) {
      console.error("Error tracking permission denial:", error);
    }
  }

  /**
   * Create a wrapped function that automatically tracks audit events
   */
  createTrackedAction<T extends any[], R>(
    action: AuditAction,
    fn: (...args: T) => Promise<R>,
    context: (args: T) => AuditContext,
    details: (args: T, result: R) => {
      resourceType: string;
      resourceId: number;
      severity?: AuditSeverity;
      changesBefore?: Record<string, any>;
      changesAfter?: Record<string, any>;
    },
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      const auditContext = context(args);
      const startTime = Date.now();

      try {
        const result = await fn(...args);
        const detailsData = details(args, result);

        await this.track(action, auditContext, {
          ...detailsData,
          status: "success",
        });

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        await this.track(action, auditContext, {
          resourceType: "Operation",
          resourceId: 0,
          severity: this.determineSeverity(action),
          status: "failure",
          errorMessage,
        });

        throw error;
      }
    };
  }

  /**
   * Determine severity level based on action type
   */
  private determineSeverity(action: AuditAction): AuditSeverity {
    const criticalActions: AuditAction[] = [
      "SPACE_DELETED",
      "PERMISSION_REVOKED",
      "API_KEY_REVOKED",
      "MEMBER_REMOVED",
      "FAILED_LOGIN",
      "PERMISSION_DENIED",
    ];

    const warningActions: AuditAction[] = [
      "SPACE_UPDATED",
      "PERMISSION_GRANTED",
      "API_KEY_CREATED",
      "SETTINGS_CHANGED",
    ];

    if (criticalActions.includes(action)) {
      return "critical";
    } else if (warningActions.includes(action)) {
      return "warning";
    }
    return "info";
  }

  /**
   * Check for suspicious activity and log if detected
   */
  async checkSuspiciousActivity(
    userId: number,
    options: {
      denialThreshold?: number;
      timeWindowHours?: number;
    } = {},
  ): Promise<boolean> {
    try {
      const isSuspicious = await this.auditService.detectSuspiciousActivity(
        userId,
        options.denialThreshold || 5,
        options.timeWindowHours || 1,
      );

      if (isSuspicious) {
        await this.track(
          "PERMISSION_DENIED",
          { userId },
          {
            resourceType: "SecurityEvent",
            resourceId: userId,
            severity: "critical",
            errorMessage: "Suspicious activity detected: Multiple permission denials",
          },
        );
      }

      return isSuspicious;
    } catch (error) {
      console.error("Error checking suspicious activity:", error);
      return false;
    }
  }
}

// Global middleware instance
let auditMiddlewareInstance: AuditMiddleware | null = null;

export function getAuditMiddleware(): AuditMiddleware {
  if (!auditMiddlewareInstance) {
    auditMiddlewareInstance = new AuditMiddleware();
  }
  return auditMiddlewareInstance;
}

export function resetAuditMiddleware(): void {
  auditMiddlewareInstance = null;
}
