import express from "express";
import stripe from "../stripeClient";
import { SubscriptionRepository } from "../infrastructure/repositories/subscriptionRepository";
import { asyncHandler } from "../utils/errorHandler";
import { HTTP_STATUS } from "../utils/constants";

const router = express.Router();

// Public webhook endpoint expects raw body handled by app-level middleware
router.post("/webhook", asyncHandler(async (req, res) => {
  const sig = (req.headers["stripe-signature"] as string) || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body as any, sig, webhookSecret);
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(HTTP_STATUS.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
  }

  const subscriptionRepo = new SubscriptionRepository();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        if (session && session.subscription && session.customer) {
          const userId = session.metadata?.userId
            ? Number(session.metadata.userId)
            : null;
          await subscriptionRepo.upsertByCustomer(
            userId,
            session.customer,
            session.subscription,
            "active",
            session.total_details?.amount_discounted || undefined,
            session.current_period_end || null,
            session.metadata || {},
          );
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        await subscriptionRepo.updateStatusBySubscriptionId(sub.id, sub.status);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        await subscriptionRepo.updateStatusBySubscriptionId(
          sub.id,
          sub.status || "canceled",
        );
        break;
      }
      default:
        break;
    }
  } catch (err: any) {
    console.error("Error handling stripe webhook event:", err?.message || err);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal error");
  }

  res.json({ received: true });
}));

router.get("/prices", asyncHandler(async (req, res) => {
  const prices = await stripe.prices.list({
    active: true,
    expand: ["data.product"],
  });

  const mapped = prices.data.map((p: any) => ({
    id: p.id,
    unit_amount: p.unit_amount,
    currency: p.currency,
    interval: p.recurring?.interval || null,
    product:
      p.product && typeof p.product === "object"
        ? {
            id: p.product.id,
            name: p.product.name,
            description: p.product.description,
            features: p.product.marketing_features || null,
          }
        : null,
  }));

  res.json(mapped);
}));

export default router;
