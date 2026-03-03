import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";

if (!stripeSecret) {
  console.warn(
    "STRIPE_SECRET_KEY not set; Stripe API calls will fail in production",
  );
}

const stripe = new Stripe(stripeSecret, {
  apiVersion: "2022-11-15",
});

export default stripe;
