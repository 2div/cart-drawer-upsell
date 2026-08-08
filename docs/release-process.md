# Release Process

Use this process when preparing a version for Shopify review, production
deployment, or post-launch merchant updates.

The goal is to keep releases small, tested, and easy to explain.

## Release Types

### Development Checkpoint

Use this for normal local progress before App Store submission.

- Update code or docs.
- Run `npm run check:release`.
- Commit with a clear message.
- Push and confirm GitHub Actions passes.
- Run `shopify app build` in the Shopify CLI environment when extension files,
  Liquid, CSS, or Shopify config changed.
- Test the storefront preview when drawer behavior changed.

### App Store Submission Candidate

Use this when preparing the exact version to submit.

- Complete `docs/app-store-submission-qa.md`.
- Complete `docs/app-store-readiness.md`.
- Confirm `docs/shopify-review-guide.md` has real review details.
- Confirm policy URLs, support contact, billing copy, and listing copy are
  final.
- Confirm screenshots match the submitted app behavior.
- Confirm the review store has saved upsells and enabled app embed settings.
- Run all technical checks on the exact commit being submitted.

### Production Release

Use this after hosting, database, billing, and Shopify app configuration are
ready.

- Complete `docs/deployment-checklist.md`.
- Confirm production environment variables are set.
- Confirm the production database is not local SQLite.
- Run Prisma migrations using the production deployment process.
- Deploy the web app.
- Deploy Shopify app config and extension versions with `shopify app deploy`.
- Install or re-authenticate the app on a test store.
- Run the storefront checklist from `README.md`.

### Hotfix

Use this for urgent merchant-facing issues.

- Keep the change as small as possible.
- Reproduce the issue before changing code when possible.
- Fix only the confirmed problem.
- Run `npm run check:release`.
- Run `shopify app build` if extension behavior changed.
- Test the exact affected storefront flow.
- Update `CHANGELOG.md` and support notes if merchants need to know.

## Version Notes

This repo is private and pre-release, so formal version numbers are not required
yet. Before App Store launch, decide whether to use:

- Git tags, such as `v0.1.0`
- App Store submission labels, such as `submission-1`
- A simple changelog-only process until production launch

After launch, keep `CHANGELOG.md` updated for merchant-facing changes,
compatibility fixes, billing changes, policy changes, and important bug fixes.

## Required Checks

Run these locally:

```bash
npm install
npm run check:release
```

Run this in the Shopify CLI environment:

```bash
shopify app build
```

Confirm in GitHub:

- GitHub Actions Release Check passed.
- Generated storefront JavaScript assets are committed.
- Dependabot update PRs pass before merging.

## Manual Storefront Checks

Run these when cart drawer behavior changed:

- Product Add to Cart opens only the app drawer.
- Native theme drawer does not open at the same time.
- Header cart icon opens the app drawer.
- Quantity controls work.
- Remove works.
- Upsell Add works.
- Header cart count updates.
- Empty cart state works.
- Order note and discount code sections work when enabled.
- Mobile layout is usable.
- No new console errors appear.

## Release Notes Checklist

Before tagging, deploying, or submitting, update `CHANGELOG.md` with:

- Added features
- Changed behavior
- Fixed bugs
- Theme compatibility updates
- Billing or policy changes
- Known limitations, if merchant-facing

Do not mention future features as shipped until they are implemented, tested,
and available in the submitted app version.
