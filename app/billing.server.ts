/*
 * Billing is intentionally disabled while the cart drawer and upsell
 * experience are being stabilized.
 *
 * When pricing is finalized, wire this config into the authenticated
 * app route before merchants can access paid features:
 *
 * 1. Check whether billing is enabled.
 * 2. Require an active app subscription for the current shop.
 * 3. Create a monthly app subscription with the configured trial.
 * 4. Redirect merchants to Shopify's confirmation URL.
 *
 * Keep development stores and local testing easy by leaving
 * BILLING_ENABLED as false until the final pricing decision is made.
 */

export const BILLING_ENABLED = false;

export const BILLING_PLAN = {
  name: "Cart Drawer Upsell",
  monthlyPrice: 0,
  currencyCode: "USD",
  trialDays: 10,
};

export const BILLING_TEST_MODE = true;
