## Summary

- Describe the change and why it is needed.

## Type Of Change

- [ ] Bug fix
- [ ] Cart drawer feature
- [ ] Admin app feature
- [ ] Theme compatibility change
- [ ] Documentation or checklist update
- [ ] Build, CI, or maintenance change

## Checks

- [ ] `npm run check:release` passes locally.
- [ ] GitHub Actions release check passes.
- [ ] `shopify app build` passes in the Shopify CLI environment when extension
  behavior changed.
- [ ] Generated storefront JavaScript assets were rebuilt from source when
  needed.
- [ ] No generated storefront JavaScript was manually edited.

## Storefront Testing

Complete this section for cart drawer, upsell, CSS, Liquid, or compatibility
changes.

- [ ] Product Add to Cart opens only the app drawer when replacement is enabled.
- [ ] Native theme drawer does not open at the same time.
- [ ] Header cart icon opens the app drawer.
- [ ] Quantity plus and minus work.
- [ ] Remove works.
- [ ] Upsell Add works and updates subtotal and cart count.
- [ ] Sold-out upsells show disabled state.
- [ ] Empty cart state works.
- [ ] Order note and discount code sections work when enabled.
- [ ] Mobile layout is usable.
- [ ] No new console errors appear.

## App Store And Policy Impact

- [ ] App listing copy does not need changes.
- [ ] Screenshots or media do not need changes.
- [ ] Privacy policy does not need changes.
- [ ] Terms of service do not need changes.
- [ ] Support docs do not need changes.
- [ ] Billing terms do not need changes.
- [ ] Shopify scopes do not need changes.

If any item above needs changes, link the relevant doc or task here:

- Add links or notes here.
