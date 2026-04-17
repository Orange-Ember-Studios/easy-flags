# Wompi Payment Flow Integration

This document defines the technical architecture and the navigation requirements for the Wompi payment gateway integration in Easy Flags.

## 1. User & Navigation Flow

To ensure a seamless experience, the application must handle the context of the **Space** to which a subscription is being applied.

### Pre-requisites to reach Pricing
- The user must be **Authenticated**.
- The system must have a target **Space ID**.

### Navigation Scenarios
1.  **From Space Settings (`/spaces/[id]/settings`)**:
    - The user clicks "Upgrade Plan".
    - The navigation flows to `/billing?spaceId=[id]`.
    - `CheckoutButton` automatically uses this `spaceId`.

2.  **From Global Header (`/billing`)**:
    - If the user has only one Space: The system automatically selects that space.
    - If the user has multiple Spaces: A **Space Selector Modal** must appear when clicking "Get Started" to confirm which workspace to upgrade.
    - If the user has no Spaces: The system redirects to `/spaces` to create one before proceeding with any payment.

## 2. Technical Checkout Flow (Frontend $\rightarrow$ API)

1.  **Selection**: User selects a plan (e.g., "Pro").
2.  **Initialization**: `CheckoutButton` calls `POST /api/payments/checkout` with `{ planSlug, spaceId }`.
3.  **Backend Intent**: 
    - `PaymentService` creates a local record in the `payments` table (status: `PENDING`).
    - Generates a unique `reference` (e.g., `EF-1-2-1713340000`).
    - Calculates a SHA256 **Integrity Signature** using `reference`, `amount`, `currency`, and `WOMPI_INTEGRITY_SECRET`.
4.  **Widget Opening**: The frontend receives the signature and public key, then opens the `WidgetCheckout` modal.

## 3. Webhook & Activation Flow (Wompi $\rightarrow$ API)

Wompi notifies our system asynchronously via the webhook endpoint: `/api/payments/wompi-webhook`.

1.  **Signature Verification**: The system validates the `X-Event-Checksum` against the payload and the `WOMPI_EVENT_SECRET`.
2.  **Transaction Update**: The `PaymentService` updates the local transaction record with the Wompi `external_id` and the new `status` (`APPROVED`, `DECLINED`, etc.).
3.  **Plan Assignment**: If `APPROVED`:
    - The system calls `PricingService.assignPlanToSpace(spaceId, planSlug)`.
    - This updates the `space_subscriptions` table and refreshes the cache/feature flag limits for that space.

## 4. Security & Error Handling

- **Cents vs. Units**: All amounts sent to Wompi must be in cents (e.g., 29,000 COP is sent as 2,900,000 cents).
- **Redundancy**: The `reference` field is unique to prevent double-billing.
- **Webhook Retry**: Wompi will retry webhook delivery if our server returns a non-200 status. The implementation is idempotent; it won't re-assign the plan if the transaction was already processed.
- **Environment Keys**: Never expose `INTEGRITY_SECRET` or `EVENT_SECRET` to the client. Only the `PUBLIC_KEY` is shared with the browser.
