# Support Policy Draft

Use this as a starting point for the public support page or support policy
linked from the Shopify App Store listing. Replace bracketed values before
submission.

## Support Contact

- Email: `[support-email]`
- Support URL: `[support-url]`
- Business name: `[business-name]`
- Time zone: `[support-time-zone]`

## Support Hours

Standard support hours are:

- Monday to Friday
- `[start-time]` to `[end-time]`
- Excluding local public holidays

## Response Targets

These targets are not service-level guarantees, but they set clear
expectations for merchants.

- Critical install or storefront cart issue: within 1 business day
- General setup question: within 2 business days
- Feature request or compatibility question: within 3 business days

## What Support Covers

Support includes:

- Helping merchants enable the Theme App Extension app embed
- Helping merchants select and save recommendation products
- Troubleshooting cart drawer opening behavior
- Troubleshooting recommendation add behavior
- Reviewing conflicts with common theme cart drawers
- Explaining theme editor settings for drawer text, colors, free-shipping
  progress, order note, and discount code sections

## What Support Does Not Cover

Support does not include:

- Custom theme development unrelated to the app
- Manual edits to merchant theme files
- Building custom upsell strategies for individual stores
- Debugging unrelated apps or checkout customizations
- Guaranteeing compatibility with heavily customized themes without review

## Merchant Information To Request

When a merchant reports an issue, ask for:

- Store URL
- Theme name and version
- Whether the issue happens on the storefront preview or only inside the theme
  editor iframe
- Product URL used for testing
- Whether Replace the theme cart drawer is enabled
- Screenshot or short screen recording
- Browser and device used for testing

Do not ask merchants to send passwords, payment information, customer personal
data, or private customer order details.

## Escalation Notes

Escalate for engineering review when:

- The app drawer does not initialize even though the app embed is enabled
- Both the app drawer and native theme drawer open together
- Ajax Cart API requests fail on the storefront preview
- Recommendations are saved in admin but do not render in the drawer
- A theme requires a new compatibility adapter

Document the theme name, storefront URL, reproduction steps, console errors,
and cart network requests before starting code changes.
