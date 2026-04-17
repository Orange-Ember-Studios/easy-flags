# Wompi Payment Flow Integration (User-Centric Model)

This document defines the technical architecture and navigation for the Wompi payment gateway integration, where subscriptions are tied directly to the **User's Account** rather than specific Spaces.

## 1. User & Navigation Flow

The current architecture provides a unified subscription for the entire user account.

### Pre-requisites to reach Pricing
- The user must be **Authenticated**.
- No `spaceId` is required to view or purchase plans.

### Navigation Scenarios
1.  **Direct Access (`/billing`)**: 
    - Users can access the pricing table directly from the dashboard or landing page.
    - Clicking "Get Started" on a paid plan triggers the checkout process for the current user session.
    
2.  **From Space Views**:
    - If a user reaches a limit within a Space, they are redirected to `/billing`. 
    - Upon successful payment, the new limits apply to the user's entire account, covering all their existing and future Spaces.

## 2. Technical Checkout Flow (Frontend $\rightarrow$ API)

1.  **Selection**: User selects a plan (e.g., "Pro").
2.  **Initialization**: `CheckoutButton` calls `POST /api/payments/checkout` with `{ planSlug }`. The `userId` is extracted from the session context on the backend.
3.  **Backend Intent**: 
    - `PaymentService` creates a local record in the `payments` table (status: `PENDING`).
    - The record maps the transaction to the `user_id`.
    - Generates a unique `reference` following the pattern: `EF-USR-[userId]-[planId]-[timestamp]`.
    - Calculates a SHA256 **Integrity Signature**.
4.  **Widget Opening**: The frontend receiving the signature and public key opens the `WidgetCheckout` modal.

## 3. Webhook & Activation Flow (Wompi $\rightarrow$ API)

Wompi notifies our system asynchronously via the webhook endpoint: `/api/payments/wompi-webhook`.

1.  **Signature Verification**: Validates the `X-Event-Checksum` using the `WOMPI_EVENT_SECRET`.
2.  **Transaction Update**: The `PaymentService` updates the transaction record with the Wompi `external_id` and the new `status`.
3.  **Account Activation**: If `APPROVED`:
    - The system calls `PricingService.assignPlanToUser(userId, planSlug)`.
    - This updates the user's global subscription status.
    - All Spaces owned by this `userId` inherit the benefits and limits associated with the plan.

## 4. Security & Error Handling

- **Idempotency**: The `reference` ensures that a user is not charged twice for the same transaction attempt.
- **Role Permissions**: Only the account owner can initiate a checkout for a plan that affects the entire account.
- **Redirection**: After the Wompi Widget closes, the user is redirected to `/billing?status=success`. The UI reflects the new plan status immediately after the webhook is processed.
