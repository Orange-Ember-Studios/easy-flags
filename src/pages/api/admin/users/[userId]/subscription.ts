import type { APIRoute } from "astro";
import { getUserFromContext, isSuperUser } from "@/utils/auth";
import { unauthorizedResponse } from "@/utils/api";
import { PricingService } from "@/application/services/pricing.service";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const user = getUserFromContext(context);
  
  if (!user || !isSuperUser(user)) {
    return new Response(JSON.stringify(unauthorizedResponse()), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = parseInt(context.params.userId || "");
  if (isNaN(userId)) {
    return new Response(JSON.stringify({ error: "Invalid user ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await context.request.json();
    const { planSlug } = body;

    if (!planSlug) {
      return new Response(JSON.stringify({ error: "planSlug is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const pricingService = PricingService.getInstance();
    await pricingService.assignPlanToUser(userId, planSlug);

    return new Response(JSON.stringify({
      message: `Successfully assigned plan ${planSlug} to user ${userId}`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Error assigning plan to user:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Internal server error" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
