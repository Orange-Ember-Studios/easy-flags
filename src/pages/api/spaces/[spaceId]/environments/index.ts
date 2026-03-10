/**
 * API Handler - Environments List
 */

import type { APIRoute } from "astro";
import { EnvironmentService } from "@application/services";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const environmentService = new EnvironmentService();
    const spaceId = parseInt(params.spaceId as string);
    const environments = await environmentService.getSpaceEnvironments(spaceId);
    return new Response(JSON.stringify(environments), { status: 200 });
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
    const environmentService = new EnvironmentService();
    const body = await request.json();
    const spaceId = parseInt(params.spaceId as string);
    const environment = await environmentService.createEnvironment(spaceId, {
      name: body.name,
      description: body.description,
    });
    return new Response(JSON.stringify(environment), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 },
    );
  }
};
