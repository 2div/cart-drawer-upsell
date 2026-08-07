# App Store Submission QA

Use this checklist immediately before submitting Cart Drawer Upsell to the
Shopify App Store. It ties together the listing copy, media, policies, billing,
review instructions, and storefront behavior.

Do not mark an item complete unless it has been checked against the actual app
version being submitted.

## Listing Copy

- [ ] Final app name is unique and not confusingly similar to another app,
  developer, brand, or Shopify product.
- [ ] Subtitle describes only features that are live.
- [ ] Short description matches the current drawer behavior.
- [ ] Feature bullets match the implemented app.
- [ ] Listing mentions the Online Store requirement.
- [ ] Listing does not claim the app works with every theme.
- [ ] Listing does not claim guaranteed revenue, conversion lift, or AOV lift.
- [ ] Listing does not mention future features such as free gifts, bundles,
  AI recommendations, post-purchase upsells, or market-aware goals until they
  are implemented and tested.
- [ ] Pricing copy matches the final Shopify billing plan.

## Media

- [ ] Screenshots use the real app UI.
- [ ] Screenshots do not show browser developer tools, console logs, local
  warnings, bookmarks, personal accounts, or desktop notifications.
- [ ] Screenshots do not show private customer data, payment data, or real
  orders.
- [ ] Screenshots show at least one normal cart state.
- [ ] Screenshots show upsells in the drawer.
- [ ] Screenshots show empty cart behavior.
- [ ] Screenshots show the theme editor app embed settings.
- [ ] Screenshots show the embedded admin setup page.
- [ ] Screenshots show mobile drawer behavior.
- [ ] Captions match the exact screenshots used.

## Policies And Support

- [ ] Public privacy policy URL is live.
- [ ] Public terms of service URL is live.
- [ ] Support email or support URL is live.
- [ ] Privacy policy matches `docs/data-and-privacy.md`.
- [ ] Terms match the final billing plan, trial, refund, and cancellation
  policy.
- [ ] Support policy has real business contact details.
- [ ] Policy links are accessible without login.

## Billing

- [ ] Production plan name is final.
- [ ] Monthly price is final.
- [ ] Trial length is final.
- [ ] Billing is implemented before enabling paid production access.
- [ ] Test charges are used while validating install, trial, cancellation,
  uninstall, and reinstall behavior.
- [ ] Billing copy in the app, listing, terms, and Shopify pricing fields
  matches exactly.

## Review Store

- [ ] Review test store is prepared.
- [ ] App is installed on the review test store.
- [ ] Theme App Extension app embed is enabled.
- [ ] Replace the theme cart drawer is enabled.
- [ ] At least one normal product can be added to cart.
- [ ] At least two active upsell variants are saved.
- [ ] Optional sold-out upsell variant is saved if disabled-state review is
  desired.
- [ ] Order note and discount code sections are enabled if they are shown in
  listing screenshots.
- [ ] `docs/shopify-review-guide.md` has real review details.

## Storefront Behavior

- [ ] Product Add to Cart opens the app drawer.
- [ ] Native theme drawer does not open at the same time.
- [ ] Header cart icon opens the app drawer.
- [ ] Upsell Add button adds the selected variant.
- [ ] Cart quantity plus and minus work.
- [ ] Remove works.
- [ ] Header cart count updates.
- [ ] Subtotal updates.
- [ ] Empty cart state works.
- [ ] Free-shipping progress updates.
- [ ] Order note works when enabled.
- [ ] Discount code section works when enabled.
- [ ] Close button, Escape, and overlay click close the drawer.
- [ ] Mobile layout is usable.
- [ ] RTL layout is usable when tested in an RTL context.

## Technical Checks

Run these on the exact version being submitted:

```bash
npm install
npm run check:release
shopify app build
```

Also confirm:

- [ ] Generated storefront JavaScript is built from source files.
- [ ] Generated assets are not manually edited.
- [ ] Theme Check does not report blocking errors.
- [ ] `docs/deployment-checklist.md` is completed for the production app.
- [ ] Production database and session storage are not using local SQLite.
- [ ] Production `SHOPIFY_APP_URL` and redirect URL are correct.
- [ ] App scopes match the implemented features.

## Final Stop Signs

Do not submit if any of these are true:

- Billing terms are still undecided but paid billing is enabled.
- Privacy policy or terms are missing.
- The app requires manual theme file edits.
- The app opens both the native theme drawer and app drawer together.
- The listing shows features that are not implemented.
- The review guide still contains placeholders.
- Production hosting or database is not ready.
