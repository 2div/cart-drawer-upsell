# Terms Of Service Preparation

This document is a preparation guide for the public Cart Drawer Upsell terms of
service. It is not legal advice and should be reviewed by a qualified lawyer
before publishing or linking from the Shopify App Store listing.

Use this together with:

- `docs/billing-roadmap.md`
- `docs/support-policy.md`
- `docs/data-and-privacy.md`
- `docs/app-store-readiness.md`

## Required Public Terms Details

Fill these in before launch:

- Legal business name:
- Business address, if required:
- Support email:
- Billing contact email:
- Effective date:
- Public terms of service URL:
- Public privacy policy URL:
- Production plan name:
- Monthly price:
- Free trial length:
- Refund policy:
- Cancellation policy:
- Support response expectations:
- Governing law or jurisdiction:

## Product Description

Cart Drawer Upsell provides an independent Shopify storefront cart drawer
through a Theme App Extension app embed. The app lets merchants configure:

- Drawer heading and storefront copy
- Free-shipping progress messages
- Drawer colors
- Whether order note and discount code sections are shown
- Manual upsell product variants
- Number of upsell recommendations shown

The app is designed to work without manual merchant theme file edits.

## Merchant Responsibilities

The public terms should explain that merchants are responsible for:

- Installing and enabling the Theme App Extension app embed.
- Testing the drawer on their storefront before relying on it in production.
- Choosing accurate drawer copy, colors, shipping messages, and recommendation
  products.
- Making sure selected upsell products, prices, and availability match their
  store policies.
- Removing recommendations that are no longer appropriate.
- Ensuring their own store policies, shipping terms, discounts, taxes, and
  checkout settings are accurate.

## Billing Terms To Finalize

Billing is not active yet. Before launch, the terms should match the final
Shopify billing configuration exactly.

Finalize:

- Plan name
- Monthly price
- Currency
- Free trial length
- Whether a free plan exists
- Whether charges are recurring monthly only
- What happens after a trial ends
- How merchants cancel
- Whether refunds are offered and under what conditions

All app charges should be handled through Shopify App Pricing or Shopify Billing
API. Do not describe billing terms that are not implemented in the app.

## Service Limitations To Explain

The public terms should set clear expectations:

- The app cannot guarantee compatibility with every heavily customized theme.
- The app does not modify merchant theme files directly.
- Theme App Extension behavior depends on the app embed being enabled.
- Some theme-editor iframe behavior can differ from live storefront behavior.
- Discount code behavior depends on Shopify cart and checkout rules.
- Shipping progress messages are display helpers and do not change Shopify
  shipping rates or checkout eligibility.
- Sold-out upsells can appear disabled if the selected variant is unavailable.
- Merchants should test after changing themes, app embed settings, or product
  availability.

## Acceptable Use

The public terms should prohibit merchants from using the app to:

- Mislead shoppers with false discounts, fake urgency, or inaccurate shipping
  claims.
- Bypass Shopify checkout or payment processing.
- Collect sensitive customer information through cart notes.
- Violate Shopify policies, applicable laws, or third-party rights.
- Attempt to reverse engineer, abuse, or disrupt the app service.

## Support Scope

The public terms can reference the support policy and clarify that support
covers:

- App embed setup
- Cart drawer replacement behavior
- Upsell product configuration
- Drawer settings
- Common theme compatibility troubleshooting

Support does not include:

- Custom theme development unrelated to the app
- Manual theme file edits
- Custom conversion strategy consulting
- Debugging unrelated third-party app conflicts without review

## Changes, Suspension, And Termination

The public terms should explain:

- Merchants can uninstall the app through Shopify admin.
- Uninstalling the app disables app access and removes the storefront embed
  behavior after Shopify applies the uninstall.
- The developer may suspend access for abuse, security risk, non-payment, or
  policy violations.
- Product features, pricing, and support terms may change with reasonable
  notice where required.

## Launch Status

- [ ] Business details filled in.
- [ ] Final billing plan and trial length decided.
- [ ] Refund and cancellation policy decided.
- [ ] Public terms drafted.
- [ ] Public terms reviewed legally.
- [ ] Public terms hosted at a stable URL.
- [ ] Shopify App Store listing terms URL added.
- [ ] Terms match `docs/billing-roadmap.md`.
- [ ] Terms match the app listing copy.
