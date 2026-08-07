# Deployment Checklist

Use this before deploying Cart Drawer Upsell outside local development.

## Hosting

- [ ] Choose a hosting provider for the embedded admin app.
- [ ] Choose a production database. Do not use the local SQLite development
  database for multi-instance production hosting.
- [ ] Update the Prisma datasource and migration strategy for the chosen
  production database before serving real merchants.
- [ ] Set production environment variables securely in the hosting provider.
- [ ] Run the app in production mode.
- [ ] Confirm the hosted app is reachable over HTTPS without basic auth,
  password protection, or iframe-blocking headers.
- [ ] Confirm the hosting provider preserves Shopify webhook request bodies and
  forwards POST requests to the app unchanged.

## Database

The current Prisma schema uses local SQLite for development:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:dev.sqlite"
}
```

That is fine for local testing, but it is not a production database plan for a
paid Shopify app. Before App Store launch, choose the production database
provider, update `prisma/schema.prisma`, create the required migrations, and
verify session persistence across deploys, restarts, and multiple app
instances.

Production database checks:

- [ ] `DATABASE_URL` or the chosen provider equivalent is set securely.
- [ ] Prisma migrations run during deploy or release.
- [ ] Session records survive app restarts.
- [ ] Session records survive multiple app instances, if horizontally scaled.
- [ ] Backups and restore process are documented.
- [ ] Database access is restricted to the app and trusted operators.

## Required Environment Variables

- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_APP_URL`
- `SCOPES`
- `NODE_ENV=production`
- Billing variables from `.env.example`, after pricing and trial terms are
  finalized

`SHOPIFY_APP_URL` must be the public HTTPS origin of the hosted app, for
example `https://app.example.com`.

Production values to confirm:

- [ ] `NODE_ENV=production`
- [ ] `SHOPIFY_APP_URL` has no trailing slash.
- [ ] `SCOPES=read_products` unless a shipped feature requires more.
- [ ] `BILLING_ENABLED=false` until the billing gate is implemented.
- [ ] `BILLING_TEST_MODE=true` while validating test charges.
- [ ] Real secrets are stored only in the hosting provider, not committed.

## Shopify App Configuration

Before production deployment, replace development placeholders in
`shopify.app.toml`:

```toml
application_url = "<SHOPIFY_APP_URL>"

[auth]
redirect_urls = [
  "<SHOPIFY_APP_URL>/auth/callback",
]
```

This app currently sets `authPathPrefix: "/auth"` in `app/shopify.server.ts`,
so production redirect URLs must match the real auth routes served by the app.
Do not leave the config pointing to an old or unrelated path.

Keep `SCOPES` aligned with `shopify.app.toml`:

```bash
SCOPES=read_products
```

Before launch:

- [ ] `shopify.app.toml` uses the production app URL.
- [ ] Redirect URLs match the auth routes used by `app/shopify.server.ts`.
- [ ] Webhook API version is reviewed and supported for the launch window.
- [ ] App API version in `app/shopify.server.ts` is reviewed and supported for
  the launch window.
- [ ] Webhook topics match the implemented route handlers.
- [ ] Access scopes match the submitted app features.
- [ ] `include_config_on_deploy` is understood before running
  `shopify app deploy`.

For local development, `automatically_update_urls_on_dev = true` is useful
because Shopify CLI can update tunnel URLs during `shopify app dev`. For a
dedicated production config, do not rely on dev tunnel URLs.

## Pre-Deploy Checks

Run these before deploying:

```bash
npm install
npm run check:release
shopify app build
```

## Deploy Sequence

1. Build and deploy the web app to the hosting provider.
2. Set production environment variables on the hosting provider.
3. Confirm the hosted app responds at `SHOPIFY_APP_URL`.
4. Update the Shopify app config with the production app URL and redirect URL.
5. Deploy Shopify app configuration and extension versions with:

```bash
shopify app deploy
```

6. Install or re-authenticate the app on a test store.
7. Enable the Theme App Extension app embed.
8. Run the storefront test checklist from `README.md`.
9. Restart the deployed app and confirm the embedded admin app still recognizes
   the installed shop session.
10. Uninstall and reinstall the app on the test store to confirm auth, session
    storage, webhooks, and app-data settings behave as expected.

## Before App Store Submission

- [ ] Production app URL is real and stable.
- [ ] Production database and session persistence are tested.
- [ ] Redirect URL uses the production app URL.
- [ ] API and webhook versions are reviewed for the launch date.
- [ ] Privacy policy URL is live.
- [ ] Terms of service URL is live.
- [ ] Support URL or email is live.
- [ ] Billing mode and trial length are final.
- [ ] Shopify review guide has real credentials and test store details.
