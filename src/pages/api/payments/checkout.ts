import type { APIRoute } from "astro";
import { getUserFromContext } from "@/utils/auth";
import { PaymentService } from "@/application/services/payment.service";
import { SpaceService } from "@/application/services/index";
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
      planSlug, 
      phoneNumber, 
      phoneNumberPrefix, 
      legalId, 
      legalIdType,
      addressLine1,
      city,
      region
    } = body;

    if (!planSlug) {
      return new Response(JSON.stringify(badRequestResponse("planSlug is required")), {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const paymentService = PaymentService.getInstance();
    
    let ip = "";
    try {
      ip = context.clientAddress;
    } catch (e) {
      ip = context.request.headers.get("x-forwarded-for") || 
           context.request.headers.get("x-real-ip") || 
           "";
    }

    const paymentData = await paymentService.initializePayment(
      user.id, 
      planSlug, 
      ip,
      { 
        phoneNumber, 
        phoneNumberPrefix, 
        legalId, 
        legalIdType,
        addressLine1,
        city,
        region
      }
    );

    return new Response(JSON.stringify(successResponse(paymentData)), {
      status: HTTP_STATUS.OK,
    });
  } catch (error: any) {
    console.error("[Checkout API Error]:", error);
    return new Response(JSON.stringify(badRequestResponse(error.message || "An error occurred during checkout initialization")), {
      status: HTTP_STATUS.BAD_REQUEST,
    });
  }
};
