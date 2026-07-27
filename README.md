# Cart Drawer Upsell

Cart Drawer Upsell is a Shopify app that provides an independent storefront
cart drawer through a Theme App Extension app embed. The drawer is designed to
work without manual merchant theme edits and to support configurable cart
upsells.

## Current Features

- Theme App Extension app embed
- Independent sliding cart drawer and overlay
- Locale-aware Shopify Ajax Cart API requests
- Product image, title, variant, line price, quantity controls, remove button,
  subtotal, and checkout button
- Header cart count synchronization
- Free-shipping progress bar
- Manual upsell product variant selection in the embedded admin app
- Storefront upsell rendering with sold-out handling
- Order note and discount-code drawer sections
- Theme editor settings for drawer copy, colors, upsell heading/count, order
  note, discount code, and free-shipping messaging
- Compatibility layer for standard Shopify cart events, Ajax add-to-cart
  detection, generic cart links, and Dawn drawer replacement
- Privacy compliance webhook endpoints

## Architecture

The app has two main pieces:

- Embedded admin app in `app/`
- Theme App Extension in `extensions/cart-drawer-extension/`

Readable storefront JavaScript lives in:

- `extension-src/cart-drawer-extension/cart-drawer.js`
- `extension-src/cart-drawer-extension/cart-drawer-compat.js`
- `extension-src/cart-drawer-extension/cart-drawer-upsells.js`

Generated/minified extension assets live in:

- `extensions/cart-drawer-extension/assets/cart-drawer.js`
- `extensions/cart-drawer-extension/assets/cart-drawer-compat.js`
- `extensions/cart-drawer-extension/assets/cart-drawer-upsells.js`

Do not manually edit the generated JavaScript assets. Edit the readable source
files and run the cart drawer build.

The drawer CSS is edited directly at:

- `extensions/cart-drawer-extension/assets/cart-drawer.css`

The app stores upsell configuration on the current app installation so the
Theme App Extension can read it without editing merchant theme files.

## Development

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Run type checks:

```bash
npm run typecheck
```

Build the storefront drawer assets:

```bash
npm run build:cart-drawer
```

Check the drawer source and generated assets:

```bash
npm run check:cart-drawer
```

Build the app:

```bash
npm run build
```

Run Shopify extension checks:

```bash
shopify app build
```

Local Shopify development is run separately with:

```bash
shopify app dev
```

## Important Rules

- Do not directly modify Dawn or merchant theme files.
- Do not rely only on Dawn selectors.
- Keep theme-specific behavior inside small compatibility adapters.
- Use Shopify routes such as `window.Shopify?.routes?.root || "/"`.
- Use line-item keys with `/cart/change.js`.
- Do not replace entire theme header cart anchors in a way that removes theme
  listeners.
- Avoid broad global CSS selectors that could affect merchant themes.
- Preserve native theme rendering, section updates, quick add, and product
  forms.
- Keep generated storefront JavaScript small enough for Shopify Theme Check.

## Manual Storefront Test Checklist

Test on the live/dev storefront preview, not only inside the theme editor iframe.

- Product Add to Cart opens only the app drawer.
- Native theme drawer does not also open.
- Header cart icon opens the app drawer.
- Quantity increase/decrease works.
- Remove works.
- Subtotal updates.
- Header cart count updates.
- Upsell add works and updates the cart.
- Sold-out upsells appear disabled.
- Empty cart state works.
- Free-shipping progress updates.
- Overlay closes the drawer.
- Clicking inside the drawer does not close it.
- Escape and close button close the drawer.
- Order note works when enabled.
- Discount code section works when enabled.
- No new console errors appear.

## Documentation

- `docs/app-store-readiness.md`
- `docs/billing-roadmap.md`
- `docs/data-and-privacy.md`

## Roadmap

1. Continue improving generic theme compatibility.
2. Test across Dawn, Horizon, and more popular themes.
3. Add compatibility diagnostics for merchants and support.
4. Finalize billing plan, trial length, and subscription enforcement.
5. Add market/currency-aware shipping goals.
6. Add English, Arabic, and RTL translations.
7. Prepare App Store listing assets, support policy, privacy policy, and review
   instructions.
