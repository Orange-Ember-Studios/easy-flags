/**
 * Analytics API Endpoints
 * Handles tracking and querying analytics data
 */

export const prerender = false;

import type { APIRoute } from "astro";
import { AnalyticsService } from "@application/services";
import type { CreateFlagEvaluationDTO } from "@domain/entities";
import crypto from "crypto";

const analyticsService = new AnalyticsService();

/**
 * POST /api/analytics/track
 * Track a flag evaluation
 *
 * Body:
 * {
 *   "space_id": number,
 *   "environment_id": number,
 *   "feature_id": number,
 *   "api_key": string,
 *   "was_enabled": boolean,
 *   "evaluation_result": string,
 *   "evaluation_time_ms": number,
 *   "error_message"?: string,
 *   "context_data"?: object
 * }
 */
export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();

    if (
      !body.space_id ||
      !body.environment_id ||
      !body.feature_id ||
      !body.api_key ||
      typeof body.was_enabled !== "boolean" ||
      !body.evaluation_result
    ) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          required: [
            "space_id",
            "environment_id",
            "feature_id",
            "api_key",
            "was_enabled",
            "evaluation_result",
            "evaluation_time_ms",
          ],
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Hash the API key for storage (never store raw keys)
    const apiKeyHash = crypto
      .createHash("sha256")
      .update(body.api_key)
      .digest("hex");

    const dto: CreateFlagEvaluationDTO = {
      space_id: body.space_id,
      environment_id: body.environment_id,
      feature_id: body.feature_id,
      api_key_hash: apiKeyHash,
      was_enabled: body.was_enabled,
      evaluation_result: body.evaluation_result,
      evaluation_time_ms: body.evaluation_time_ms || 0,
      error_message: body.error_message,
      context_data: body.context_data,
    };

    const evaluation = await analyticsService.trackFlagEvaluation(dto);

    return new Response(JSON.stringify(evaluation), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error tracking flag evaluation:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to track evaluation",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
