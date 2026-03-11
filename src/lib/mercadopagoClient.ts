/**
 * Mercadopago Backend Client
 * Uses @mercadopago/sdk-js Payment API for payment processing
 */

import { Payment } from "@mercadopago/sdk-js";

export class MercadopagoClient {
  private static payment: Payment | null = null;

  static initialize(): Payment {
    if (!this.payment) {
      const accessToken = import.meta.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error(
          "MERCADOPAGO_ACCESS_TOKEN not set in environment variables",
        );
      }

      this.payment = new Payment({
        accessToken,
      });
    }
    return this.payment;
  }

  static async createPayment(data: any) {
    try {
      const payment = this.initialize();
      const response = await payment.create({
        body: data,
      });
      return response;
    } catch (error: any) {
      throw new Error(
        error.message || "Failed to create payment with Mercadopago",
      );
    }
  }

  static async getPayment(paymentId: number) {
    try {
      const payment = this.initialize();
      const response = await payment.get({
        id: paymentId,
      });
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to retrieve payment");
    }
  }
}
