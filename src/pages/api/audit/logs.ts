/**
 * GET /api/audit/logs
 * Retrieve audit logs with filtering
 * Protected route - requires authentication
 */

import type { APIRoute } from "astro";
import { getUserFromContext } from "@/utils/auth";
import { AuditService } from "@/application/services";
import { isSpaceAdmin } from "@/utils/permissions";

interface AuditLogsQuery {
  spaceId?: string;
  userId?: string;
  action?: string;
  severity?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: string;
  offset?: string;
}

export const GET: APIRoute = async (context: any) => {
  try {
    // Check authentication
    const user = getUserFromContext(context);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse query parameters
    const url = new URL(context.request.url);
    const spaceId = url.searchParams.get("spaceId");
    const userId = url.searchParams.get("userId");
    const action = url.searchParams.get("action");
    const severity = url.searchParams.get("severity");
    const status = url.searchParams.get("status");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!) : 100;
    const offset = url.searchParams.get("offset") ? parseInt(url.searchParams.get("offset")!) : 0;

    const auditService = new AuditService();

    // Check permission if filtering by specific space
    if (spaceId && parseInt(spaceId) > 0) {
      const isAdmin = await isSpaceAdmin(user.id, parseInt(spaceId));
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const logs = await auditService.getAuditLogs({
      spaceId: spaceId ? parseInt(spaceId) : undefined,
      userId: userId ? parseInt(userId) : undefined,
      action: action as any,
      severity: severity as any,
      status: status as any,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit,
      offset,
    });

    return new Response(JSON.stringify({ logs, count: logs.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch audit logs",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
