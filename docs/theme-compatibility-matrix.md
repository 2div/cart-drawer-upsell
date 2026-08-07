# Theme Compatibility Matrix

Use this matrix to track storefront testing across Shopify themes. Test on the
storefront preview opened in a normal browser tab, not only inside the theme
editor iframe.

## Test Status Key

- `Not tested`: no result yet
- `Pass`: works without changes
- `Partial`: works with limitations or needs a compatibility note
- `Fail`: needs a fix before launch

## Theme Matrix

| Theme | Version | Product add opens app drawer | Header cart opens app drawer | Native drawer stays closed | Quick add works | Cart count updates | Recommendations work | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dawn | `[version]` | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Primary Shopify reference theme. |
| Horizon | `[version]` | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Shopify theme to validate after Dawn. |
| `[theme-name]` | `[version]` | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Add popular paid or free theme. |
| `[theme-name]` | `[version]` | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Add popular paid or free theme. |

## Required Checks Per Theme

For each theme, test:

- App embed can be enabled without editing theme files
- Product page Add to Cart opens only the app drawer
- Header cart icon opens the app drawer when replacement is enabled
- Native theme drawer does not open at the same time
- Quick add or featured product add-to-cart still works
- Quantity increase and decrease work
- Remove item works
- Header cart count updates
- Empty cart state works
- Recommendations appear when enabled and saved
- Recommendation Add button works for available variants
- Sold-out recommendations appear disabled
- Order note and discount code sections work when enabled
- Free-shipping progress updates
- Drawer closes with overlay, Escape, and close button
- Mobile layout is usable
- No new console errors appear

## Compatibility Notes

Record the exact behavior before adding an adapter. Useful details include:

- Theme name and version
- Storefront URL tested
- Page type tested
- Button or link clicked
- Whether the theme emits standard Shopify cart events
- Whether the theme uses fetch, XMLHttpRequest, or form navigation
- Console errors
- Cart network request and response status
- Header cart count markup

Keep theme-specific fixes isolated in small compatibility adapters. Do not edit
merchant theme files directly.
