import { MercadopagoClient } from "@/lib/mercadopagoClient";

interface MercadopagoPrice {
  id: string;
  unit_amount: number;
  currency: string;
  title: string;
  description: string | null;
}

export class MercadopagoService {
  static async getPrices(): Promise<MercadopagoPrice[]> {
    try {
      console.log("Fetching Mercadopago prices...");

      // For this implementation, we're using predefined pricing tiers
      // In a production environment, you might want to fetch these from a database
      // or from Mercadopago's product catalog
      const prices: MercadopagoPrice[] = [
        {
          id: "lab_plan",
          unit_amount: 0, // Free tier
          currency: "USD",
          title: "Lab",
          description: "Perfect for testing and learning",
        },
        {
          id: "basic_plan",
          unit_amount: 999, // $9.99
          currency: "USD",
          title: "Basic",
          description: "Essential features for your project",
        },
        {
          id: "pro_plan",
          unit_amount: 2999, // $29.99
          currency: "USD",
          title: "Pro",
          description: "Advanced features for growing teams",
        },
      ];

      console.log(`Found ${prices.length} pricing plans`);
      return prices;
    } catch (error: any) {
      console.error("Error fetching Mercadopago prices:", error.message, error);
      throw new Error(error.message || "Failed to fetch Mercadopago prices");
    }
  }

  static async createPreference(
    planId: string,
    userId: string,
    userEmail: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    try {
      console.log(`Creating Mercadopago preference for plan: ${planId}`);

      // Get the plan details
      const prices = await this.getPrices();
      const plan = prices.find((p) => p.id === planId);

      if (!plan) {
        throw new Error(`Plan not found: ${planId}`);
      }

      const preferenceData = {
        items: [
          {
            title: plan.title,
            description: plan.description,
            unit_price: plan.unit_amount / 100, // Convert cents to dollars
            quantity: 1,
            currency_id: plan.currency,
          },
        ],
        payer: {
          email: userEmail,
        },
        back_urls: {
          success: successUrl,
          failure: cancelUrl,
          pending: cancelUrl,
        },
        auto_return: "approved",
        notification_url: `${process.env.MERCADOPAGO_WEBHOOK_URL || ""}`,
        metadata: {
          userId: userId,
          planId: planId,
        },
      };

      const preference =
        await MercadopagoClient.createPreference(preferenceData);
      return preference;
    } catch (error: any) {
      console.error(
        "Error creating Mercadopago preference:",
        error.message,
        error,
      );
      throw new Error(
        error.message || "Failed to create Mercadopago preference",
      );
    }
  }
}
