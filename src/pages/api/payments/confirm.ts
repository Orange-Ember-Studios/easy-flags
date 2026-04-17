import type { APIRoute } from "astro";
import { getUserFromContext } from "@/utils/auth";
import { PaymentService } from "@/application/services/payment.service";
import { 
  successResponse, 
  unauthorizedResponse, 
  badRequestResponse, 
  HTTP_STATUS 
} from "@/utils/api";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const user = getUserFromContext(context);

  if (!user) {
    return new Response(JSON.stringify(unauthorizedResponse()), {
      status: HTTP_STATUS.UNAUTHORIZED,
    });
  }

  try {
    const body = await context.request.json();
    const { 
      token, 
      acceptance_token, 
      personal_data_auth_token,
      reference,
      amountInCents,
      currency,
      customerData,
      shippingAddress
    } = body;

    if (!token || !acceptance_token || !reference) {
      return new Response(JSON.stringify(badRequestResponse("Missing required payment data")), {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const paymentService = PaymentService.getInstance();
    
    const transaction = await paymentService.processPayment(user.id, {
      token,
      acceptance_token,
      personal_data_auth_token,
      reference,
      amountInCents,
      currency,
      customerData,
      shippingAddress
    });

    return new Response(JSON.stringify(successResponse(transaction)), {
      status: HTTP_STATUS.OK,
    });
  } catch (error: any) {
    console.error("[Confirm Payment API Error]:", error);
    return new Response(JSON.stringify(badRequestResponse(error.message || "An error occurred during payment processing")), {
      status: HTTP_STATUS.BAD_REQUEST,
    });
  }
};
