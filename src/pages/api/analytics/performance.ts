/**
 * Analytics Performance Endpoint
 * GET /api/analytics/performance
 */

export const prerender = false;

import type { APIRoute } from "astro";
import { AnalyticsService } from "@application/services";
import { getUserFromContext } from "@utils/auth";
import { checkSpaceAccessAuth } from "@utils/permissions";

const analyticsService = new AnalyticsService();

/**
 * GET /api/analytics/performance
 * Query performance metrics for environments in a space
 *
 * Query params:
 * - spaceId: number (required)
 * - dateFrom?: string (ISO date)
 * - dateTo?: string (ISO date)
 */
export const GET: APIRoute = async (context) => {
  try {
    const user = getUserFromContext(context);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const spaceId = context.url.searchParams.get("spaceId");
    if (!spaceId) {
      return new Response(
        JSON.stringify({ error: "spaceId is required" }),
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

    const dateFrom = context.url.searchParams.get("dateFrom");
    const dateTo = context.url.searchParams.get("dateTo");

    // Get performance metrics from analytics service
    const performanceMetrics = await analyticsService.getPerformanceMetrics(
      "flag_evaluation",
      1000,
    );

    // Transform metrics to environment-based structure
    const environments = new Map<number, any>();

    performanceMetrics.forEach((metric: any) => {
      const envId = metric.environment_id || "unknown";
      if (!environments.has(envId)) {
        environments.set(envId, {
          environmentId: envId,
          requestCount: 0,
          avgResponseTime: 0,
          errorRate: 0,
          p50Latency: 0,
          p95Latency: 0,
          p99Latency: 0,
        });
      }

      const env = environments.get(envId);
      env.requestCount += (metric.value_ms || 0) / 100;
      env.avgResponseTime = metric.response_time_ms || env.avgResponseTime;
      env.errorRate = metric.error_rate || env.errorRate;
      env.p50Latency = metric.p50_latency_ms || env.p50Latency;
      env.p95Latency = metric.p95_latency_ms || env.p95Latency;
      env.p99Latency = metric.p99_latency_ms || env.p99Latency;
    });

    const environmentsList = Array.from(environments.values());

    // Create time series data (mock, should track over time in production)
    const timeSeries = [
      {
        date: new Date().toISOString().split("T")[0],
        avgResponseTime: environmentsList.reduce((sum, e) => sum + e.avgResponseTime, 0) / environmentsList.length || 0,
        errorRate: environmentsList.reduce((sum, e) => sum + e.errorRate, 0) / environmentsList.length || 0,
        requestCount: environmentsList.reduce((sum, e) => sum + e.requestCount, 0),
      },
    ];

    return new Response(
      JSON.stringify({
        environments: environmentsList,
        timeSeries,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error querying performance metrics:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to query performance metrics",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
