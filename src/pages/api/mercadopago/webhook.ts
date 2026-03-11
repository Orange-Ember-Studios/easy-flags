import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const xSignature = context.request.headers.get("x-signature") || "";
  const xRequestId = context.request.headers.get("x-request-id") || "";
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || "";

  if (!webhookSecret) {
    console.warn(
      "MERCADOPAGO_WEBHOOK_SECRET not set; webhook verification disabled",
    );
    return new Response(
      JSON.stringify({
        success: false,
        error: "Webhook secret not configured",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const body = await context.request.text();

    // Parse the webhook data
    let webhookData: any;
    try {
      webhookData = JSON.parse(body);
    } catch (err) {
      console.error("Failed to parse webhook body:", err);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid webhook data",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Handle different webhook event types
    if (webhookData.type === "payment") {
      const paymentData = webhookData.data;
      const paymentId = paymentData.id;

      // Check payment status
      if (webhookData.action === "payment.created") {
        console.log("Payment created:", paymentId);
        // TODO: Update payment status in database as pending
      } else if (webhookData.action === "payment.updated") {
        console.log("Payment updated:", paymentId);
        // Check payment status and update accordingly
        // TODO: Fetch payment details from Mercadopago API
        // TODO: Update subscription status in database
      }
    } else if (webhookData.type === "plan") {
      const planId = webhookData.data?.id;
      console.log("Plan webhook received:", planId);
      // Handle plan-related webhooks
    } else if (webhookData.type === "subscription") {
      const subscriptionId = webhookData.data?.id;
      console.log("Subscription webhook received:", subscriptionId);

      if (webhookData.action === "subscription.created") {
        console.log("Subscription created:", subscriptionId);
        // TODO: Update user subscription in database
      } else if (webhookData.action === "subscription.updated") {
        console.log("Subscription updated:", subscriptionId);
        // TODO: Update subscription status in database
      } else if (webhookData.action === "subscription.cancelled") {
        console.log("Subscription cancelled:", subscriptionId);
        // TODO: Update subscription status to canceled in database
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error handling Mercadopago webhook:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
