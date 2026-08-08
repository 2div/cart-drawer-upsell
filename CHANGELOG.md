# Changelog

All notable changes to Cart Drawer Upsell should be documented here.

This project is still pre-release. Use this changelog to keep App Store review,
deployment, and support notes aligned with the codebase.

## Unreleased

### Added

- Independent Theme App Extension cart drawer.
- Locale-aware Shopify Ajax Cart API integration.
- Cart item rendering with images, titles, variants, line prices, quantity
  controls, remove actions, subtotal, and checkout.
- Header cart count synchronization.
- Free-shipping progress bar with configurable messages.
- Manual upsell variant selection in the embedded admin app.
- Storefront upsell rendering with sold-out handling.
- Order note and discount code drawer sections.
- Theme editor settings for drawer copy, colors, upsell heading/count, order
  note, discount code, and free-shipping progress.
- Compatibility layer for Shopify cart events, Ajax add-to-cart detection,
  generic cart links, and Dawn drawer replacement.
- Privacy compliance webhook endpoints.
- App Store readiness, data/privacy, deployment, review, billing, and listing
  documentation.
- Release process documentation for development checkpoints, App Store
  submission candidates, production releases, and hotfixes.

### Changed

- Storefront JavaScript is maintained in readable source files and generated as
  minified Theme App Extension assets.
- Shopify app scopes were reduced to `read_products`.
- Template app pages and template README content were replaced with
  project-specific content.

### Not Enabled Yet

- Production billing enforcement.
- Final App Store listing assets.
- Production app URL and policy URLs.
