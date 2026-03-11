import { MercadoPagoConfig, Preference } from "mercadopago";

let mercadopagoInstance: MercadoPagoConfig | null = null;

export function getMercadopagoClient(): MercadoPagoConfig {
  if (!mercadopagoInstance) {
    const accessToken = import.meta.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error(
        "MERCADOPAGO_ACCESS_TOKEN not set in environment variables. Please add it to your .env file.",
      );
    }

    mercadopagoInstance = new MercadoPagoConfig({
      accessToken: accessToken,
    });
  }

  return mercadopagoInstance;
}

export class MercadopagoClient {
  static getConfig(): MercadoPagoConfig {
    return getMercadopagoClient();
  }

  static createPreference(data: any) {
    const client = getMercadopagoClient();
    const preference = new Preference(client);
    return preference.create(data);
  }

  static async getPreference(preferenceId: string) {
    const client = getMercadopagoClient();
    const preference = new Preference(client);
    return preference.get(preferenceId);
  }
}
