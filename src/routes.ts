import express from "express";
import fs from "fs";
import path from "path";
import { authMiddleware } from "./authMiddlewares";
import stripe from "./stripeClient";
import { SubscriptionRepository } from "./infrastructure/repositories/subscriptionRepository";
import { EnvironmentRepository } from "./infrastructure/repositories/environmentRepository";
import { FeatureRepository } from "./infrastructure/repositories/featureRepository";
import { FeatureValueRepository } from "./infrastructure/repositories/featureValueRepository";
import { EnvironmentService } from "./application/services/environmentService";
import { FeatureService } from "./application/services/featureService";
import { FlagQueryService } from "./application/services/flagQueryService";

const router = express.Router();

const environmentRepository = new EnvironmentRepository();
const featureRepository = new FeatureRepository();
const featureValueRepository = new FeatureValueRepository();

const environmentService = new EnvironmentService(
  environmentRepository,
  featureRepository,
  featureValueRepository,
);
const featureService = new FeatureService(
  featureRepository,
  featureValueRepository,
);
const flagQueryService = new FlagQueryService(
  environmentRepository,
  featureRepository,
  featureValueRepository,
);

const openApiSpec = JSON.parse(
  fs.readFileSync(
    path.resolve(process.cwd(), "src/docs/openapi.json"),
    "utf-8",
  ),
);

// Public OpenAPI JSON for Swagger UI
router.get("/openapi.json", (req, res) => {
  res.json(openApiSpec);
});

// Stripe webhook endpoint (public). Raw body is provided by app-level middleware.
router.post("/stripe/webhook", async (req, res) => {
  const sig = (req.headers["stripe-signature"] as string) || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  let event;
  try {
    // req.body will be a raw Buffer because index.ts applies express.raw for this path
    event = stripe.webhooks.constructEvent(req.body as any, sig, webhookSecret);
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
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
        // Ignore other events
        break;
    }
  } catch (err: any) {
    console.error("Error handling stripe webhook event:", err?.message || err);
    return res.status(500).send("Internal error");
  }

  res.json({ received: true });
});

// Public authenticated endpoint to list active prices (includes product info)
router.get("/stripe/prices", async (req, res) => {
  try {
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
  } catch (err: any) {
    console.error("Failed to list stripe prices", err?.message || err);
    res.status(500).json({ error: "Failed to list prices" });
  }
});

// Protect all remaining routes with authentication
router.use(authMiddleware);

// Create a Stripe Checkout session for subscription purchase
router.post("/stripe/create-checkout-session", async (req, res) => {
  const user = (req as any).user;
  const priceId = req.body?.priceId || process.env.STRIPE_DEFAULT_PRICE_ID;
  if (!priceId) return res.status(400).json({ error: "priceId required" });

  try {
    // Create (or reuse) a Stripe Customer with metadata linking to our user
    const customer = await stripe.customers.create({
      metadata: { userId: String(user.id), username: String(user.username) },
    });

    const successUrl =
      process.env.STRIPE_SUCCESS_URL ||
      `${process.env.APP_ORIGIN || "http://localhost:3000"}/environments`;
    const cancelUrl =
      process.env.STRIPE_CANCEL_URL ||
      `${process.env.APP_ORIGIN || "http://localhost:3000"}/environments`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId: String(user.id) },
    });

    res.json({ url: session.url, id: session.id });
  } catch (err: any) {
    console.error("Failed to create checkout session:", err?.message || err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Environments
router.get("/environments", async (req, res) => {
  const rows = await environmentService.listEnvironments();
  res.json(rows);
});

router.post("/environments", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  try {
    const env = await environmentService.createEnvironment(name);
    res.status(201).json(env);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/environments/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const deleted = await environmentService.deleteEnvironment(id);
    if (deleted) return res.json({ success: true });
    return res.status(404).json({ error: "Environment not found" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/environments/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  try {
    const env = await environmentService.updateEnvironmentName(id, name);
    if (env) return res.json(env);
    return res.status(404).json({ error: "Environment not found" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Features
router.get("/features", async (req, res) => {
  const rows = await featureService.listFeatures();
  res.json(rows);
});

router.post("/features", async (req, res) => {
  const { key, description } = req.body;
  if (!key) return res.status(400).json({ error: "key required" });
  if (/\s/.test(key)) {
    return res.status(400).json({ error: "key cannot contain spaces" });
  }
  try {
    const feature = await featureService.createFeature(key, description);
    res.status(201).json(feature);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/features/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const deleted = await featureService.deleteFeature(id);
    if (deleted) return res.json({ success: true });
    return res.status(404).json({ error: "Feature not found" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/features/:id/value", async (req, res) => {
  const featureId = Number(req.params.id);
  const { environmentId, value } = req.body;
  if (!environmentId || typeof value !== "boolean") {
    return res
      .status(400)
      .json({ error: "environmentId and boolean value required" });
  }
  try {
    const fv = await featureService.setFeatureValue(
      featureId,
      environmentId,
      value,
    );
    res.json(fv);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/flags", async (req, res) => {
  const env = req.query.env as string | undefined;
  if (!env) {
    return res
      .status(400)
      .json({ error: "env query parameter required (name)" });
  }

  const flags = await flagQueryService.getFlagsByEnvironmentName(env);
  if (!flags) {
    return res.status(404).json({ error: "environment not found" });
  }

  res.json(flags);
});

router.get("/flags/:env/:key", async (req, res) => {
  const envName = req.params.env as string | undefined;
  const key = req.params.key as string | undefined;

  if (!envName || !key) {
    return res
      .status(400)
      .json({ error: "env and key path parameters required" });
  }

  const environment = await environmentService.findByName(envName);
  if (!environment) {
    return res.status(404).json({ error: "environment not found" });
  }

  const feature = await featureService.findByKey(key);
  if (!feature) {
    return res.status(404).json({ error: "feature not found" });
  }

  const result = await flagQueryService.isFeatureEnabled(envName, key);
  if (!result) {
    return res.status(404).json({ error: "feature value not found" });
  }

  res.json(result);
});

export default router;
