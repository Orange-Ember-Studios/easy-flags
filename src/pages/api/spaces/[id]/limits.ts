/**
 * API Handler - Space Limits
 * Returns limits and enabled features for a specific space
 */

import type { APIRoute } from "astro";
import { getUserFromContext } from "@/utils/auth";
import { unauthorizedResponse } from "@/utils/api";
import { SpaceService, PricingService } from "@application/services";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const user = getUserFromContext(context);
  if (!user) {
    return new Response(JSON.stringify(unauthorizedResponse()), {
      status: 401,
    });
  }

  const { params } = context;
  const spaceSlug = params.id as string;

  try {
    const spaceService = new SpaceService();
    const pricingService = PricingService.getInstance();
    
    const space = await spaceService.getSpaceBySlug(spaceSlug);
    if (!space) {
      return new Response(JSON.stringify({ error: "Space not found" }), {
        status: 404,
      });
    }

    // Fetch limits
    const maxFlags = await pricingService.getSpaceLimit(space.id, "max_flags");
    const maxEnvironments = await pricingService.getSpaceLimit(space.id, "max_environments");
    
    // Fetch features
    const hasScheduling = await pricingService.hasSpaceFeature(space.id, "scheduling");
    const hasTargeting = await pricingService.hasSpaceFeature(space.id, "targeting");
    const hasApiAccess = await pricingService.hasSpaceFeature(space.id, "api access");
    const hasTeamCollaboration = await pricingService.hasSpaceFeature(space.id, "team collaboration");

    return new Response(
      JSON.stringify({
        limits: {
          max_flags: maxFlags,
          max_environments: maxEnvironments,
        },
        features: {
          scheduling: hasScheduling,
          targeting: hasTargeting,
          api_access: hasApiAccess,
          team_collaboration: hasTeamCollaboration,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 }
    );
  }
};
