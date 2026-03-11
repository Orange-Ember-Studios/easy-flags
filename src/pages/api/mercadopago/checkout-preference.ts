import type { APIRoute } from "astro";
import { MercadopagoService } from "@/application/services/MercadopagoService";

export const prerender = false;

interface CheckoutPreferenceRequest {
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export const POST: APIRoute = async (context) => {
  try {
    // Check if user is authenticated
    const user = await fetch("http://localhost:3001/api/auth/me", {
      headers: context.request.headers,
    }).then((res) => (res.ok ? res.json() : null));

    if (!user || !user.data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Not authenticated",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const body = (await context.request.json()) as CheckoutPreferenceRequest;
    const { planId, successUrl, cancelUrl } = body;

    if (!planId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Plan ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const preference = await MercadopagoService.createPreference(
      planId,
      user.data.id,
      user.data.email,
      successUrl || "http://localhost:3001/payment-success",
      cancelUrl || "http://localhost:3001/payment-error",
    );

    return new Response(
      JSON.stringify({
        success: true,
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Error creating Mercadopago preference:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to create checkout preference",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
