/**
 * GET /api/audit/reports
 * POST /api/audit/reports
 * Retrieve or create compliance reports
 * Protected route - requires admin permissions
 */

import type { APIRoute } from "astro";
import { getUserFromContext } from "@/utils/auth";
import { AuditService } from "@/application/services";
import { isSpaceAdmin } from "@/utils/permissions";

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

    const url = new URL(context.request.url);
    const spaceId = url.searchParams.get("spaceId");

    if (!spaceId) {
      return new Response(
        JSON.stringify({ error: "spaceId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Check permission
    const isAdmin = await isSpaceAdmin(user.id, parseInt(spaceId));
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const auditService = new AuditService();
    const reports = await auditService.getComplianceReports({
      spaceId: parseInt(spaceId),
      limit: 50,
    });

    return new Response(JSON.stringify({ reports }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching compliance reports:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch reports",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const POST: APIRoute = async (context: any) => {
  try {
    // Check authentication
    const user = getUserFromContext(context);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await context.request.json();
    const { spaceId, dateFrom, dateTo, reportType } = body;

    if (!spaceId || !dateFrom || !dateTo) {
      return new Response(
        JSON.stringify({
          error: "spaceId, dateFrom, and dateTo are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Check permission
    const isAdmin = await isSpaceAdmin(user.id, spaceId);
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const auditService = new AuditService();
    const report = await auditService.generateComplianceReport(
      spaceId,
      dateFrom,
      dateTo,
      reportType || "compliance_snapshot",
    );

    return new Response(JSON.stringify({ report }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating compliance report:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to create report",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
