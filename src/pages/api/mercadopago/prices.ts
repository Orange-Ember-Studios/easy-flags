import type { APIRoute } from "astro";
import { MercadopagoService } from "@/application/services/MercadopagoService";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const prices = await MercadopagoService.getPrices();

    return new Response(
      JSON.stringify({
        success: true,
        data: prices,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Error fetching Mercadopago prices:", error.message, error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to fetch prices",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
