# App Store Readiness Checklist

Use this checklist before submitting Cart Drawer Upsell to the Shopify
App Store. Keep every item honest: if it has not been tested on a real
storefront preview, leave it unchecked.

## App Behavior

- [ ] App installs without manual theme file edits.
- [ ] Theme App Extension app embed can be enabled from the theme editor.
- [ ] App drawer opens instead of the native theme drawer when replacement is enabled.
- [ ] Native theme drawer does not open at the same time.
- [ ] App drawer does not break product forms, quick add, cart page, or checkout links.
- [ ] Header cart count updates after add, remove, and quantity changes.
- [ ] Drawer works on mobile and desktop.
- [ ] Drawer works when the cart is empty.
- [ ] Drawer works when the cart already has products.

## Upsells

- [ ] Merchant can select up to four active upsell product variants.
- [ ] Draft, archived, and hidden products are not saved as upsells.
- [ ] Sold-out upsells appear disabled in the storefront drawer.
- [ ] Adding an upsell updates the drawer and header cart count.
- [ ] Upsell add errors are shown to shoppers without console-only failures.
- [ ] Upsell heading and number shown can be configured in the theme editor.

## Theme Compatibility

- [ ] Dawn product page add to cart works.
- [ ] Dawn header cart link opens the app drawer.
- [ ] Dawn quick add works.
- [ ] Horizon product page add to cart works.
- [ ] Horizon header cart link opens the app drawer.
- [ ] At least two additional popular themes are tested.
- [ ] Standard Shopify cart events are handled when themes emit them.
- [ ] Fetch and XMLHttpRequest cart add fallbacks work.
- [ ] Generic `/cart` links open the drawer when replacement is enabled.

## Accessibility

- [ ] Drawer uses `role="dialog"` and `aria-modal="true"`.
- [ ] Close button has an accessible label.
- [ ] Escape closes the drawer.
- [ ] Focus moves into the drawer when opened.
- [ ] Focus remains inside the drawer while open.
- [ ] Focus returns to the previous element after close.
- [ ] Quantity buttons have accessible labels.
- [ ] Status messages use live regions where needed.
- [ ] Color settings still allow readable contrast in recommended defaults.

## Performance

- [ ] `npm run check:cart-drawer` passes.
- [ ] `npm run build` passes.
- [ ] `shopify app build` passes.
- [ ] Generated `cart-drawer.js` stays below the configured Theme Check asset size limit.
- [ ] Storefront JavaScript is minified from source files, not manually edited.
- [ ] App embed does not block page rendering.
- [ ] Images use lazy loading where appropriate.

## Privacy And Data

- [ ] App requests only required Shopify scopes.
- [ ] App explains what merchant data is stored.
- [ ] App data is stored per app installation.
- [ ] App uninstall webhook deletes local sessions by shop.
- [ ] Privacy policy URL is ready.
- [ ] Terms of service URL is ready.
- [ ] Support contact email or support URL is ready.

## Billing

- [ ] Production plan name is decided.
- [ ] Monthly price is decided.
- [ ] Free trial length is decided.
- [ ] Billing implementation is enabled only after pricing is final.
- [ ] Test charges are used before production billing.
- [ ] Install, trial, cancellation, uninstall, and reinstall flows are tested.

## Admin UX

- [ ] Merchant can understand setup without developer tools.
- [ ] Get started section accurately describes the install flow.
- [ ] Setup status reflects saved upsell state.
- [ ] Theme editor link opens the current theme editor.
- [ ] Storefront test link opens a usable storefront preview.
- [ ] Validation errors are shown as merchant-friendly toasts.

## App Listing

- [ ] App name is finalized.
- [ ] App icon is created.
- [ ] App tagline is finalized.
- [ ] App description explains the value clearly.
- [ ] Screenshots show drawer, upsells, admin setup, and theme editor settings.
- [ ] Demo video or GIF is prepared if needed.
- [ ] Pricing copy matches the real billing plan.
- [ ] Support and policy links are live.

## Shopify Review Notes

- [ ] Explain that the app uses a Theme App Extension app embed.
- [ ] Explain that merchants do not need to edit theme files.
- [ ] Explain how to enable the app embed.
- [ ] Provide a test store and clear test instructions.
- [ ] Provide products that reviewers can add to cart.
- [ ] Provide an upsell configuration already saved in the test store.
- [ ] Mention that cart behavior should be tested on storefront preview, not only inside the theme editor iframe.
