/**
 * API Handler - Advanced Configuration
 */

import type { APIRoute } from "astro";
import { AdvancedConfigService } from "@application/services";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const advConfigService = new AdvancedConfigService();
    const featureFlagId = parseInt(params.featureFlagId as string);
    const config =
      await advConfigService.getAdvancedConfigByFeatureFlag(featureFlagId);
    if (!config) {
      return new Response(
        JSON.stringify({ error: "Configuration not found" }),
        {
          status: 404,
        },
      );
    }
    return new Response(JSON.stringify(config), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 },
    );
  }
};

export const POST: APIRoute = async ({ request, params }) => {
  try {
    const advConfigService = new AdvancedConfigService();
    const body = await request.json();
    const featureFlagId = parseInt(params.featureFlagId as string);
    const config = await advConfigService.createAdvancedConfig({
      feature_flag_id: featureFlagId,
      rollout_percentage: body.rollout_percentage || 0,
      rollout_start_date: body.rollout_start_date,
      rollout_end_date: body.rollout_end_date,
      default_value: body.default_value || "",
      scheduling_enabled: body.scheduling_enabled || false,
      schedule_start_date: body.schedule_start_date,
      schedule_start_time: body.schedule_start_time,
      schedule_end_date: body.schedule_end_date,
      schedule_end_time: body.schedule_end_time,
      targeting_rules: body.targeting_rules || [],
    });
    return new Response(JSON.stringify(config), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 },
    );
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const advConfigService = new AdvancedConfigService();
    const body = await request.json();
    const configId = body.config_id;
    const config = await advConfigService.updateAdvancedConfig(configId, body);
    return new Response(JSON.stringify(config), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 },
    );
  }
};
