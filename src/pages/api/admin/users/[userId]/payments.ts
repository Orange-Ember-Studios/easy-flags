import type { APIRoute } from "astro";
import { getUserFromContext, isSuperUser } from "@/utils/auth";
import { unauthorizedResponse } from "@/utils/api";
import { PaymentService } from "@/application/services/payment.service";
import { getRepositoryRegistry } from "@/infrastructure/registry";

export const prerender = false;

export const GET: APIRoute = async (context) => {
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
    const registry = getRepositoryRegistry();
    const paymentRepo = registry.getPaymentRepository();
    const payments = await paymentRepo.findByUserId(userId);

    return new Response(JSON.stringify({ payments }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Error fetching user payments:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Internal server error" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

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
    const paymentService = PaymentService.getInstance();
    const registry = getRepositoryRegistry();
    const paymentRepo = registry.getPaymentRepository();
    
    // Fetch all pending payments
    const payments = await paymentRepo.findByUserId(userId);
    const pendingPayments = payments.filter(p => p.status === "PENDING" && p.external_id);

    // Sync each one
    for (const payment of pendingPayments) {
      try {
        await paymentService.syncTransactionStatus(payment.id);
      } catch (err) {
        console.error(`Failed to sync payment ${payment.id}:`, err);
      }
    }

    // Return updated list
    const updatedPayments = await paymentRepo.findByUserId(userId);

    return new Response(JSON.stringify({ payments: updatedPayments }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Error syncing user payments:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Internal server error" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
