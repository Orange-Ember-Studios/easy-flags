/**
 * Analytics Tracking Utility
 * Provides helper functions for tracking flag evaluations
 */

import type { CreateFlagEvaluationDTO } from "@domain/entities";
import crypto from "crypto";

interface TrackingOptions {
  spaceId: number;
  environmentId: number;
  featureId: number;
  apiKey: string;
  wasEnabled: boolean;
  evaluationResult: string;
  evaluationTimeMs?: number;
  errorMessage?: string;
  contextData?: Record<string, any>;
}

/**
 * Hash an API key for secure storage
 * Used server-side to hash keys before storing in analytics
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Create a flag evaluation DTO from tracking options
 * This is useful for creating consistent evaluation records
 */
export function createEvaluationDTO(
  options: TrackingOptions,
): CreateFlagEvaluationDTO {
  return {
    space_id: options.spaceId,
    environment_id: options.environmentId,
    feature_id: options.featureId,
    api_key_hash: hashApiKey(options.apiKey),
    was_enabled: options.wasEnabled,
    evaluation_result: options.evaluationResult,
    evaluation_time_ms: options.evaluationTimeMs || 0,
    error_message: options.errorMessage,
    context_data: options.contextData,
  };
}

/**
 * Record an evaluation (server-side wrapper)
 * This would be used on the backend to record evaluations
 */
export async function recordEvaluationAsync(
  options: TrackingOptions,
): Promise<Response> {
  const dto = createEvaluationDTO(options);

  const response = await fetch("/api/analytics/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...dto,
      api_key: options.apiKey, // Send the API key hash in the request body
    }),
  });

  if (!response.ok) {
    console.error("Failed to track evaluation:", response.statusText);
  }

  return response;
}

/**
 * Helper to batch track multiple evaluations
 * Useful for high-volume tracking scenarios
 */
export async function batchTrackEvaluations(
  evaluations: TrackingOptions[],
): Promise<void> {
  // For now, send individually - in production, you might want to batch these
  // and send them in a single request
  await Promise.allSettled(
    evaluations.map((ev) =>
      recordEvaluationAsync(ev).catch((error) => {
        console.error("Error tracking evaluation:", error);
      }),
    ),
  );
}

/**
 * Format evaluation time in milliseconds to human-readable format
 */
export function formatEvaluationTime(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)}µs`;
  } else if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(
  current: number,
  previous: number,
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Determine trend direction
 */
export function getTrendDirection(
  percentageChange: number,
): "up" | "down" | "stable" {
  if (percentageChange > 5) {
    return "up";
  } else if (percentageChange < -5) {
    return "down";
  }
  return "stable";
}
