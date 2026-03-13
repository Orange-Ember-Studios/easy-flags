/**
 * Analytics Tracking Middleware
 * Automatically tracks flag evaluations without requiring manual integration
 * Follows middleware pattern for clean separation of concerns
 */

import type { CreateFlagEvaluationDTO } from "@domain/entities";
import { AnalyticsService } from "@application/services";
import { hashApiKey } from "./analytics-tracking";
import crypto from "crypto";

export interface EvaluationContext {
  spaceId: number;
  environmentId: number;
  featureId: number;
  apiKey: string;
  userId?: string;
  customContext?: Record<string, any>;
}

export interface EvaluationResult {
  value: boolean | string | Record<string, any>;
  evaluationTimeMs: number;
  error?: string;
}

/**
 * Analytics tracking middleware
 * Wraps flag evaluation to automatically track the evaluation
 */
export class AnalyticsMiddleware {
  private analyticsService = new AnalyticsService();

  /**
   * Track a flag evaluation
   * Should be called after evaluating a flag in your API endpoint
   */
  async trackEvaluation(
    context: EvaluationContext,
    result: EvaluationResult,
  ): Promise<void> {
    try {
      const dto: CreateFlagEvaluationDTO = {
        space_id: context.spaceId,
        environment_id: context.environmentId,
        feature_id: context.featureId,
        api_key_hash: hashApiKey(context.apiKey),
        was_enabled:
          typeof result.value === "boolean"
            ? result.value
            : typeof result.value === "string" && result.value === "true",
        evaluation_result: String(result.value),
        evaluation_time_ms: result.evaluationTimeMs,
        error_message: result.error,
        context_data: {
          user_id: context.userId,
          ...context.customContext,
        },
      };

      await this.analyticsService.trackFlagEvaluation(dto);
    } catch (error) {
      // Log but don't throw - analytics failures should not break flag evaluation
      console.error("Failed to track flag evaluation:", error);
    }
  }

  /**
   * Batch track multiple evaluations
   * Useful for bulk operations or test scenarios
   */
  async trackEvaluationBatch(
    contexts: EvaluationContext[],
    results: EvaluationResult[],
  ): Promise<void> {
    if (contexts.length !== results.length) {
      throw new Error("Context and result arrays must have equal length");
    }

    try {
      const promises = contexts.map((ctx, idx) =>
        this.trackEvaluation(ctx, results[idx]),
      );
      await Promise.allSettled(promises);
    } catch (error) {
      console.error("Failed to batch track evaluations:", error);
    }
  }

  /**
   * Wrap a flag evaluation function with automatic tracking
   * Returns a function that evaluates and tracks in one call
   */
  createTrackedEvaluator<T extends boolean | string | Record<string, any>>(
    evaluationFn: (context: EvaluationContext) => Promise<T>,
  ) {
    return async (
      context: EvaluationContext,
    ): Promise<{ value: T; tracked: boolean }> => {
      const startTime = performance.now();
      let error: string | undefined;
      let value: T;

      try {
        value = await evaluationFn(context);
      } catch (err) {
        error = err instanceof Error ? err.message : "Unknown error";
        value = false as T;
      }

      const evaluationTimeMs = performance.now() - startTime;

      // Track asynchronously without blocking the response
      this.trackEvaluation(context, { value, evaluationTimeMs, error }).catch(
        (err) => {
          console.error("Async tracking failed:", err);
        },
      );

      return { value, tracked: !error };
    };
  }

  /**
   * Get analytics service for advanced use cases
   */
  getAnalyticsService(): AnalyticsService {
    return this.analyticsService;
  }
}

/**
 * Global analytics middleware instance
 */
const analyticsMiddleware = new AnalyticsMiddleware();

export function getAnalyticsMiddleware(): AnalyticsMiddleware {
  return analyticsMiddleware;
}

/**
 * Helper function for tracking evaluations directly
 * Convenience wrapper for simple tracking needs
 */
export async function trackFlagEvaluation(
  context: EvaluationContext,
  result: EvaluationResult,
): Promise<void> {
  return analyticsMiddleware.trackEvaluation(context, result);
}

/**
 * Helper function to create a tracked evaluator
 * Useful for wrapping your flag evaluation logic
 */
export function createTrackedEvaluator<
  T extends boolean | string | Record<string, any>,
>(evaluationFn: (context: EvaluationContext) => Promise<T>) {
  return analyticsMiddleware.createTrackedEvaluator(evaluationFn);
}
