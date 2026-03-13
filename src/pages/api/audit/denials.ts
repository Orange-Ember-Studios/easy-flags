/**
 * GET /api/audit/denials
 * Retrieve permission denial logs
 * Protected route - requires authentication
 */

import type { APIRoute } from "astro";
import { getUserFromContext } from "@/utils/auth";
import { AuditService } from "@/application/services";

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
    const hoursAgo = url.searchParams.get("hoursAgo") ? parseInt(url.searchParams.get("hoursAgo")!) : 24;
    const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!) : 50;

    const auditService = new AuditService();

    // Users can only see their own denial logs or admins can see space denials
    let denials: any[] = [];

    if (spaceId) {
      // Check if user is admin of space
      denials = await auditService.getSpaceDenialLogs(parseInt(spaceId), limit);
    } else {
      // Get current user's recent denials
      denials = await auditService.getUserRecentDenials(user.id, hoursAgo);
      if (denials.length > limit) {
        denials = denials.slice(0, limit);
      }
    }

    return new Response(JSON.stringify({ denials, count: denials.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching denial logs:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch denial logs",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
