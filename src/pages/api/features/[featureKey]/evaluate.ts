/**
 * Flag Evaluation Endpoint
 * GET /api/features/[featureKey]/evaluate
 * Evaluates a feature flag and automatically tracks the evaluation
 */

export const prerender = false;

import type { APIRoute } from "astro";
import { getUserFromContext } from "@/utils/auth";
import { unauthorizedResponse, badRequestResponse } from "@/utils/api";
import { FeatureFlagService, FeatureService } from "@application/services";
import {
  getAnalyticsMiddleware,
  type EvaluationContext,
  type EvaluationResult,
} from "@/lib/analytics-middleware";

const featureFlagService = new FeatureFlagService();
const featureService = new FeatureService();
const analyticsMiddleware = getAnalyticsMiddleware();

interface EvaluationQuery {
  environment_id: string;
  user_id?: string;
  api_key: string;
  context?: Record<string, any>;
}

/**
 * GET /api/features/[featureKey]/evaluate
 *
 * Evaluate a feature flag for a user and automatically track the evaluation
 *
 * Query parameters:
 * - space_id: number (required) - The space ID
 * - environment_id: number (required) - The environment to evaluate in
 * - api_key: string (required) - API key for authentication
 * - user_id?: string - Optional user ID for context
 * - context?: object - Optional custom context data (JSON stringified)
 *
 * Response:
 * {
 *   "feature_key": string,
 *   "value": boolean | string | object,
 *   "evaluation_time_ms": number,
 *   "environment": string,
 *   "tracked": boolean
 * }
 */
export const GET: APIRoute = async (context) => {
  try {
    const user = getUserFromContext(context);
    if (!user) {
      return new Response(JSON.stringify(unauthorizedResponse()), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { params } = context;
    const featureKey = params.featureKey as string;

    if (!featureKey) {
      return new Response(
        JSON.stringify(badRequestResponse("featureKey is required")),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const spaceId = context.url.searchParams.get("space_id");
    const environmentId = context.url.searchParams.get("environment_id");
    const apiKey = context.url.searchParams.get("api_key");
    const userId = context.url.searchParams.get("user_id");
    const contextData = context.url.searchParams.get("context");

    if (!spaceId || !environmentId || !apiKey) {
      return new Response(
        JSON.stringify(
          badRequestResponse(
            "space_id, environment_id, and api_key are required",
          ),
        ),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Get the feature
    const feature = await featureService.getFeatureByKey(
      parseInt(spaceId),
      featureKey,
    );
    if (!feature) {
      return new Response(
        JSON.stringify({ error: "Feature not found", feature_key: featureKey }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Get the feature flag for this environment
    const flag = await featureFlagService.getFeatureFlagByFeatureAndEnvironment(
      feature.id,
      parseInt(environmentId),
    );

    if (!flag) {
      return new Response(
        JSON.stringify({
          error: "Feature flag configuration not found",
          feature_key: featureKey,
          environment_id: environmentId,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Prepare evaluation context
    const evaluationContext: EvaluationContext = {
      spaceId: parseInt(spaceId),
      environmentId: parseInt(environmentId),
      featureId: feature.id,
      apiKey,
      userId: userId || undefined,
      customContext: contextData ? JSON.parse(contextData) : {},
    };

    // Evaluate the flag
    const startTime = performance.now();
    let error: string | undefined;
    let value: boolean | string | Record<string, any> = false;

    try {
      // Determine flag value based on configuration
      if (!flag.is_enabled) {
        value = false;
      } else {
        // Check rollout percentage
        if (
          flag.rollout_percentage !== undefined &&
          flag.rollout_percentage < 100
        ) {
          // Use deterministic hash of user_id for consistent rollout
          if (userId) {
            const hash =
              parseInt(
                userId
                  .split("")
                  .reduce((acc, char) => acc + char.charCodeAt(0), 0)
                  .toString(16),
                16,
              ) % 100;
            value = hash < flag.rollout_percentage;
          } else {
            // No user ID, use random
            value = Math.random() * 100 < flag.rollout_percentage;
          }
        } else {
          value = true;
        }

        // If flag has a specific value, use it
        if (flag.value !== undefined && flag.value !== null) {
          try {
            value = JSON.parse(flag.value);
          } catch {
            value = flag.value;
          }
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Evaluation failed";
      value = false;
    }

    const evaluationTimeMs = performance.now() - startTime;

    // Prepare evaluation result
    const result: EvaluationResult = {
      value,
      evaluationTimeMs,
      error,
    };

    // Track the evaluation asynchronously
    analyticsMiddleware.trackEvaluation(evaluationContext, result).catch((err) => {
      console.error("Failed to track evaluation:", err);
    });

    return new Response(
      JSON.stringify({
        feature_key: featureKey,
        value,
        evaluation_time_ms: evaluationTimeMs,
        environment: parseInt(environmentId),
        tracked: true,
        error,
      }),
      {
        status: error ? 200 : 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error evaluating feature flag:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to evaluate feature flag",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

/**
 * POST /api/features/[featureKey]/evaluate
 *
 * Evaluate a feature flag with POST body for complex context
 *
 * Body:
 * {
 *   "space_id": number (required),
 *   "environment_id": number (required),
 *   "api_key": string (required),
 *   "user_id"?: string,
 *   "context"?: object
 * }
 */
export const POST: APIRoute = async (context) => {
  try {
    const user = getUserFromContext(context);
    if (!user) {
      return new Response(JSON.stringify(unauthorizedResponse()), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { params } = context;
    const featureKey = params.featureKey as string;
    const body = await context.request.json();

    const { space_id, environment_id, api_key, user_id, context: customContext } =
      body;

    if (!featureKey || !space_id || !environment_id || !api_key) {
      return new Response(
        JSON.stringify(
          badRequestResponse(
            "featureKey, space_id, environment_id, and api_key are required",
          ),
        ),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Get the feature
    const feature = await featureService.getFeatureByKey(space_id, featureKey);
    if (!feature) {
      return new Response(
        JSON.stringify({ error: "Feature not found", feature_key: featureKey }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Get the feature flag
    const flag = await featureFlagService.getFeatureFlagByFeatureAndEnvironment(
      feature.id,
      environment_id,
    );

    if (!flag) {
      return new Response(
        JSON.stringify({
          error: "Feature flag configuration not found",
          feature_key: featureKey,
          environment_id,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Prepare evaluation context
    const evaluationContext: EvaluationContext = {
      spaceId: space_id,
      environmentId: environment_id,
      featureId: feature.id,
      apiKey: api_key,
      userId: user_id,
      customContext: customContext || {},
    };

    // Evaluate the flag
    const startTime = performance.now();
    let error: string | undefined;
    let value: boolean | string | Record<string, any> = false;

    try {
      if (!flag.is_enabled) {
        value = false;
      } else {
        if (
          flag.rollout_percentage !== undefined &&
          flag.rollout_percentage < 100
        ) {
          if (user_id) {
            const hash =
              parseInt(
                user_id
                  .split("")
                  .reduce(
                    (acc: number, char: string) => acc + char.charCodeAt(0),
                    0,
                  )
                  .toString(16),
                16,
              ) % 100;
            value = hash < flag.rollout_percentage;
          } else {
            value = Math.random() * 100 < flag.rollout_percentage;
          }
        } else {
          value = true;
        }

        if (flag.value !== undefined && flag.value !== null) {
          try {
            value = JSON.parse(flag.value);
          } catch {
            value = flag.value;
          }
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Evaluation failed";
      value = false;
    }

    const evaluationTimeMs = performance.now() - startTime;

    // Prepare evaluation result
    const result: EvaluationResult = {
      value,
      evaluationTimeMs,
      error,
    };

    // Track the evaluation
    analyticsMiddleware.trackEvaluation(evaluationContext, result).catch((err) => {
      console.error("Failed to track evaluation:", err);
    });

    return new Response(
      JSON.stringify({
        feature_key: featureKey,
        value,
        evaluation_time_ms: evaluationTimeMs,
        environment: environment_id,
        tracked: true,
        error,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error evaluating feature flag:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to evaluate feature flag",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
