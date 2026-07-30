# Troubleshooting Guide

Use this guide when the drawer or upsells behave differently during setup,
Shopify review, or merchant support.

## App Drawer Does Not Open

Check these first:

- The Cart Drawer app embed is enabled in the active theme.
- `Replace the theme cart drawer` is enabled in the app embed settings.
- The storefront preview is opened in a normal storefront tab, not only inside
  the theme editor iframe.
- `shopify app dev` is running when testing development preview changes.
- The storefront has the latest extension preview after `shopify app build`.

Expected technical state:

- `[data-cdu-cart-drawer]` exists in the storefront HTML.
- `data-cdu-initialized="true"` is present after the drawer script runs.
- `window.CartDrawerUpsell.open` is available.

Do not ask merchants to inspect these console checks unless support is actively
debugging with them.

## Native Theme Drawer Opens Instead

When replacement is enabled, the app tries to intercept standard Shopify cart
events, Ajax add-to-cart requests, generic cart links, and Dawn drawer methods.

If the native drawer still opens:

- Confirm replacement is enabled in the app embed settings.
- Test on the live storefront preview, not only inside the theme editor iframe.
- Confirm the theme is not blocking app embed scripts.
- Record the theme name, theme version, and the cart action that opened the
  native drawer.

Theme-specific fixes should be added as small compatibility adapters. Do not
edit merchant theme files directly.

## Upsells Do Not Appear

Check these in order:

- Upsells are enabled in the embedded app admin.
- At least one upsell product variant is selected and saved.
- The selected product is active.
- The selected variant still exists.
- The app embed is enabled in the current theme.
- The theme editor `Upsells shown` setting is greater than zero.
- The product is not already in the cart. The drawer hides upsells that are
  already represented by cart items.

Sold-out upsells can appear disabled in the drawer. Draft, archived, and hidden
products should not be saved as upsells.

## Upsell Add Does Not Work

Common causes:

- The selected variant is sold out.
- The selected variant no longer exists.
- Shopify admin theme editor iframe behavior is blocking cart cookies or Ajax
  state.
- The product requires a selling plan or product form data that is not
  currently supported by one-click upsell add.

Final behavior should be tested on the storefront preview outside the theme
editor iframe.

## Cart Count Does Not Update

The app updates common cart-count elements and Dawn's `cart-icon-bubble`
section when Shopify returns it.

If a theme uses a custom count element:

- Confirm cart changes work in the drawer itself.
- Record the theme name and header cart markup.
- Add a narrow compatibility adapter if needed.

Do not replace the entire header cart anchor, because that can remove theme
listeners.

## Theme Editor Differences

The Shopify theme editor renders the storefront inside an admin iframe. Cart
Ajax behavior can differ there because Shopify controls preview cookies,
redirects, and iframe security.

Use the theme editor to confirm app embed settings, copy, colors, and drawer
layout. Use the storefront preview opened in a normal tab to confirm cart
behavior.

## Development Warnings

These warnings can appear during development and are usually not app runtime
bugs:

- Shopify preview cookie warnings.
- Missing `favicon.ico` warnings.
- React Router future flag warnings.
- Shopify CLI network or DNS errors such as `EAI_AGAIN`.

`shopify app build` passing confirms the extension bundle and Theme Check are
valid, but `shopify app dev` still needs network access to Shopify services.
