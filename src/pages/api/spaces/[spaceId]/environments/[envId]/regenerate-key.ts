/**
 * API Handler - Regenerate Environment API Key
 */

import type { APIRoute } from "astro";
import { getUserFromContext } from "@/utils/auth";
import { unauthorizedResponse } from "@/utils/api";
import { EnvironmentService } from "@application/services";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const user = getUserFromContext(context);
  if (!user) {
    return new Response(JSON.stringify(unauthorizedResponse()), {
      status: 401,
    });
  }

  try {
    const environmentService = new EnvironmentService();
    const envId = parseInt(context.params.envId as string);

    const environment = await environmentService.regenerateApiKey(envId);

    if (!environment) {
      return new Response(JSON.stringify({ error: "Environment not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(environment), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 },
    );
  }
};
