# Billing Roadmap

Billing is not active yet. The app should keep working normally in
development until pricing, trial length, and plan names are finalized.

Current placeholder settings live in `app/billing.server.ts` and can be
controlled with environment variables:

- `BILLING_ENABLED=false`
- `BILLING_PLAN_NAME="Cart Drawer Upsell"`
- `BILLING_MONTHLY_PRICE=0`
- `BILLING_CURRENCY_CODE=USD`
- `BILLING_TRIAL_DAYS=10`
- `BILLING_TEST_MODE=true`

The embedded admin app displays these values in a Plan status section so
development stores, testers, and reviewers can confirm whether billing is still
disabled, whether charges are in test mode, and which plan values are currently
configured.

Before enabling billing:

1. Decide the production plan name, monthly price, and free trial length.
2. Confirm the billing flow against Shopify's current app billing API.
3. Add a billing check after merchant authentication.
4. Redirect shops without an active subscription to Shopify's confirmation URL.
5. Keep development stores and test charges in test mode until production launch.
6. Verify install, trial, cancellation, uninstall, and reinstall behavior.

Billing should not block access while `BILLING_ENABLED` is `false`.
Do not set `BILLING_ENABLED=true` in production until the billing gate is
implemented and tested end to end.
