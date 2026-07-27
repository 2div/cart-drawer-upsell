# Shopify Review Guide

Use this document as the starting point for the App Store review instructions.
Replace bracketed values before submission.

## Test Store

- Store URL: `[store-url]`
- App name: `Cart Drawer Upsell`
- Test account email: `[reviewer-email]`
- Test account password: `[reviewer-password]`
- Theme to test first: `Dawn`

## What The App Does

Cart Drawer Upsell adds an independent cart drawer through a Theme App
Extension app embed. Merchants can enable the app embed, configure drawer copy
and styling in the theme editor, and choose up to four product variants to
recommend in the drawer.

The app does not require merchants to manually edit theme files.

## Setup For Review

Before submitting the app, prepare the review store with:

- The app installed.
- The Theme App Extension app embed enabled.
- Replace the theme cart drawer enabled.
- At least one regular product that reviewers can add to cart.
- At least two upsell variants saved in the app admin.
- One sold-out upsell variant if you want reviewers to verify disabled upsell
  behavior.

## Reviewer Test Steps

1. Open the app from Shopify admin.
2. Confirm the Get started section shows saved upsells and setup status.
3. Open the theme editor from the app.
4. Confirm the Cart Drawer app embed is enabled.
5. Open the storefront preview.
6. Add a product to cart from a product page.
7. Confirm the app drawer opens.
8. Confirm the native theme drawer does not also open.
9. Add an upsell product from the drawer.
10. Confirm the upsell appears in the cart and the subtotal updates.
11. Change item quantity.
12. Remove an item.
13. Click the header cart icon.
14. Confirm the app drawer opens again.
15. Test order note and discount code sections if enabled in theme settings.
16. Proceed to checkout.

## Expected Results

- The drawer opens without manual theme edits.
- Only one cart drawer opens.
- Quantity changes, remove, upsell add, subtotal, and header cart count update.
- Sold-out upsells are disabled and show a shopper-friendly message.
- The drawer works on desktop and mobile viewport sizes.
- Escape, overlay click, and close button close the drawer.

## Theme Editor Note

Shopify's theme editor runs the storefront inside an admin iframe. Some cart
Ajax behavior can differ inside that iframe because cookies, redirects, or
preview behavior are controlled by Shopify admin. Final cart behavior should be
tested on the storefront preview opened from the theme editor or app admin, not
only inside the editor iframe.

## Data And Privacy Summary

The app stores Shopify session records locally for authentication and stores
upsell configuration on the current app installation using Shopify app-data
metafields.

The app does not locally store customer records, orders, payment details,
storefront cart contents, cart notes, or discount codes entered by shoppers.

See `docs/data-and-privacy.md` for details.

## Known Development-Only Warnings

During local development, browsers may show Shopify preview cookie warnings,
missing favicon warnings, or React Router future flag warnings. These are not
storefront cart drawer runtime errors.
