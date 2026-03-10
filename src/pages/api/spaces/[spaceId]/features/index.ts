/**
 * API Handler - Features
 */

import type { APIRoute } from "astro";
import { FeatureService } from "@application/services";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const featureService = new FeatureService();
    const spaceId = parseInt(params.spaceId as string);
    const features = await featureService.getSpaceFeatures(spaceId);
    return new Response(JSON.stringify(features), { status: 200 });
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
    const featureService = new FeatureService();
    const body = await request.json();
    const spaceId = parseInt(params.spaceId as string);
    const feature = await featureService.createFeature(spaceId, {
      key: body.key,
      name: body.name,
      description: body.description,
      type: body.type || "boolean",
      default_value: body.default_value || "false",
    });
    return new Response(JSON.stringify(feature), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 },
    );
  }
};
