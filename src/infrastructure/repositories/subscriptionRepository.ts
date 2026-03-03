import getDb from "../../db";

export class SubscriptionRepository {
  async upsertByCustomer(
    userId: number | null,
    customerId: string,
    subscriptionId: string,
    status: string,
    priceId?: string,
    currentPeriodEnd?: number,
    metadata?: object,
  ) {
    const db = await getDb();

    const existing = await db.get(
      `SELECT * FROM subscriptions WHERE stripe_customer_id = ?`,
      customerId,
    );

    if (existing) {
      await db.run(
        `UPDATE subscriptions SET user_id = ?, stripe_subscription_id = ?, status = ?, price_id = ?, current_period_end = ?, metadata = ? WHERE id = ?`,
        userId,
        subscriptionId,
        status,
        priceId,
        currentPeriodEnd || null,
        metadata ? JSON.stringify(metadata) : null,
        existing.id,
      );
      return;
    }

    await db.run(
      `INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, price_id, status, current_period_end, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      userId,
      customerId,
      subscriptionId,
      priceId,
      status,
      currentPeriodEnd || null,
      metadata ? JSON.stringify(metadata) : null,
    );
  }

  async updateStatusBySubscriptionId(subscriptionId: string, status: string) {
    const db = await getDb();
    await db.run(
      `UPDATE subscriptions SET status = ? WHERE stripe_subscription_id = ?`,
      status,
      subscriptionId,
    );
  }

  async findByCustomerId(customerId: string) {
    const db = await getDb();
    return db.get(
      `SELECT * FROM subscriptions WHERE stripe_customer_id = ?`,
      customerId,
    );
  }
}
