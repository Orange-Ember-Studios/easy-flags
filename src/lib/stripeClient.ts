import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

if (!stripeSecret) {
  throw new Error(
    "STRIPE_SECRET_KEY not set in environment variables. Please add it to your .env file.",
  );
}

export const stripeClient = new Stripe(stripeSecret);
