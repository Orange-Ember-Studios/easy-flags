/**
 * API Handler - Single Feature
 */

import type { APIRoute } from "astro";
import { FeatureService } from "@application/services";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const featureService = new FeatureService();
    const featureId = parseInt(params.featureId as string);
    const feature = await featureService.getFeature(featureId);
    if (!feature) {
      return new Response(JSON.stringify({ error: "Feature not found" }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify(feature), { status: 200 });
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
    const featureService = new FeatureService();
    const body = await request.json();
    const featureId = parseInt(params.featureId as string);
    const feature = await featureService.updateFeature(featureId, {
      name: body.name,
      description: body.description,
      default_value: body.default_value,
    });
    return new Response(JSON.stringify(feature), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 },
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const featureService = new FeatureService();
    const featureId = parseInt(params.featureId as string);
    await featureService.deleteFeature(featureId);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 },
    );
  }
};
