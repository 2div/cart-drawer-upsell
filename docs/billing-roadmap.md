# Billing Roadmap

Billing is not active yet. The app should keep working normally in
development until pricing, trial length, and plan names are finalized.

Current placeholder settings live in `app/billing.server.ts`:

- Billing enabled: `false`
- Plan name: `Cart Drawer Upsell`
- Monthly price: `0 USD`
- Trial days: `10`
- Test mode: `true`

Before enabling billing:

1. Decide the production plan name, monthly price, and free trial length.
2. Confirm the billing flow against Shopify's current app billing API.
3. Add a billing check after merchant authentication.
4. Redirect shops without an active subscription to Shopify's confirmation URL.
5. Keep development stores and test charges in test mode until production launch.
6. Verify install, trial, cancellation, uninstall, and reinstall behavior.

Billing should not block access while `BILLING_ENABLED` is `false`.
