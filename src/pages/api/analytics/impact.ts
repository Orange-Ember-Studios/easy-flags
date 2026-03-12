/**
 * Flag Impact Analysis Endpoint
 * GET /api/analytics/impact
 */

export const prerender = false;

import type { APIRoute } from "astro";
import { AnalyticsService } from "@application/services";
import { requireAuth } from "@utils/auth-redirect";
import { checkSpaceAccessAuth } from "@utils/permissions";

const analyticsService = new AnalyticsService();

/**
 * GET /api/analytics/impact
 * Analyze the impact of a feature flag
 *
 * Query params:
 * - space_id: number (required)
 * - feature_id: number (required)
 * - environment_id: number (required)
 */
export const GET: APIRoute = async (context) => {
  try {
    const user = await requireAuth(context);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const spaceId = context.url.searchParams.get("space_id");
    const featureId = context.url.searchParams.get("feature_id");
    const environmentId = context.url.searchParams.get("environment_id");

    if (!spaceId || !featureId || !environmentId) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters",
          required: ["space_id", "feature_id", "environment_id"],
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Check if user has access to this space
    const { isAuthorized } = await checkSpaceAccessAuth(
      context,
      Number(spaceId),
    );
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: "Access denied to space" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }

    const analysis = await analyticsService.analyzeFlagImpact(
      Number(featureId),
      Number(environmentId),
    );

    if (!analysis) {
      return new Response(
        JSON.stringify({
          error: "No analytics data available",
          message:
            "The feature flag has not been evaluated yet or has no recent data",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error analyzing flag impact:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to analyze impact",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
