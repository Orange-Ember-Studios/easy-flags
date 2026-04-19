import type { APIRoute } from "astro";
import { getUserFromContext, isSuperUser } from "@/utils/auth";
import { unauthorizedResponse } from "@/utils/api";
import { getRepositoryRegistry } from "@/infrastructure/registry";
import { PricingService } from "@/application/services/pricing.service";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const user = getUserFromContext(context);
  
  if (!user || !isSuperUser(user)) {
    return new Response(JSON.stringify(unauthorizedResponse()), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(context.request.url);
  const search = url.searchParams.get("search") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  try {
    const registry = getRepositoryRegistry();
    const userRepo = registry.getUserRepository();
    const pricingService = PricingService.getInstance();

    const { users, total } = await userRepo.findAll({ search, limit, offset });

    // Fetch subscription details for each user
    const usersWithSubscriptions = await Promise.all(
      users.map(async (u) => {
        const subscription = await pricingService.getUserSubscription(u.id);
        return {
          ...u,
          subscription: subscription ? {
            id: subscription.id,
            plan_name: subscription.plan?.name || "Unknown",
            plan_slug: subscription.plan?.slug || "unknown",
            status: subscription.status
          } : null
        };
      })
    );

    return new Response(JSON.stringify({
      users: usersWithSubscriptions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching users for admin:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
