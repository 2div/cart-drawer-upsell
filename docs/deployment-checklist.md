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

Keep `SCOPES` aligned with `shopify.app.toml`:

```bash
SCOPES=read_products
```

For local development, `automatically_update_urls_on_dev = true` is useful
because Shopify CLI can update tunnel URLs during `shopify app dev`. For a
dedicated production config, do not rely on dev tunnel URLs.

## Pre-Deploy Checks

Run these before deploying:

```bash
npm install
npm run check:cart-drawer
npm run typecheck
npm run build
shopify app build
git diff --check
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

## Before App Store Submission

- [ ] Production app URL is real and stable.
- [ ] Production database and session persistence are tested.
- [ ] Redirect URL uses the production app URL.
- [ ] Privacy policy URL is live.
- [ ] Terms of service URL is live.
- [ ] Support URL or email is live.
- [ ] Billing mode and trial length are final.
- [ ] Shopify review guide has real credentials and test store details.
