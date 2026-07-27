# Deployment Checklist

Use this before deploying Cart Drawer Upsell outside local development.

## Hosting

- [ ] Choose a hosting provider for the embedded admin app.
- [ ] Choose a production database. Do not use the local SQLite development
  database for multi-instance production hosting.
- [ ] Set production environment variables securely in the hosting provider.
- [ ] Run the app in production mode.

## Required Environment Variables

- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_APP_URL`
- `SCOPES`
- `NODE_ENV=production`

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

## Before App Store Submission

- [ ] Production app URL is real and stable.
- [ ] Redirect URL uses the production app URL.
- [ ] Privacy policy URL is live.
- [ ] Terms of service URL is live.
- [ ] Support URL or email is live.
- [ ] Billing mode and trial length are final.
- [ ] Shopify review guide has real credentials and test store details.
