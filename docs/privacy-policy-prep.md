# Privacy Policy Preparation

This document is a preparation guide for the public Cart Drawer Upsell privacy
policy. It is not legal advice and should be reviewed by a qualified lawyer
before publishing or linking from the Shopify App Store listing.

Use `docs/data-and-privacy.md` as the source of truth for what the app stores
today.

## Required Public Policy Details

Fill these in before launch:

- Legal business name:
- Business address, if required:
- Privacy contact email:
- Support contact email:
- Effective date:
- Public privacy policy URL:
- Public terms of service URL:
- Production hosting provider:
- Production database provider:
- Backup retention period:
- Data subprocessors, if any:

## Current Data Summary

Cart Drawer Upsell currently stores the minimum data needed to run the embedded
admin app and render configured upsells in the storefront drawer.

### Shopify Session Data

The app stores Shopify session records through Prisma session storage. These
records are required for embedded app authentication and Admin API access.

Session data can include:

- Shop domain
- Access token
- Granted scope string
- Session state
- Online or offline session flag
- Token expiry fields
- Shopify user profile fields for online sessions, when Shopify provides them

Production must use a durable database with access controls and backups.

### Merchant Configuration

The app stores cart drawer upsell settings on the current app installation in
Shopify app-data metafields.

Stored configuration can include:

- Whether upsells are enabled
- Selected product handles
- Selected variant IDs
- Product title
- Product handle
- Product image URL
- Product price
- Variant title
- Availability and status fields needed to render the drawer

This data is used only to show the merchant-selected recommendations in the
Theme App Extension drawer.

### Product And Variant Data

The app requests product access so merchants can choose upsell products and
variants in the embedded admin app.

The app currently requests:

- `read_products`

Do not add more Shopify API scopes unless a future feature requires them.

## Data Not Stored Locally

The app does not currently store local copies of:

- Customer records
- Customer email addresses
- Customer addresses
- Customer phone numbers
- Orders
- Payment details
- Checkout details
- Storefront cart contents
- Cart notes
- Discount codes entered by shoppers
- Storefront analytics events

Cart notes and discount code attempts are sent to Shopify Ajax Cart endpoints
from the storefront drawer, but they are not stored in this app database.

## Data Deletion And Webhooks

The app defines Shopify compliance webhook handlers for:

- `customers/data_request`
- `customers/redact`
- `shop/redact`

For customer data requests and customer redaction requests, the app currently
acknowledges the webhook because it does not store customer or order personal
data locally.

For shop redaction and app uninstall events, the app deletes local Shopify
session records for the shop.

Before launch, verify the production app handles:

- `app/uninstalled`
- `shop/redact`
- `customers/data_request`
- `customers/redact`

## Public Policy Draft Checklist

The published privacy policy should clearly explain:

- What Shopify API information the app accesses.
- What merchant configuration the app stores.
- That upsell configuration is stored per app installation.
- That cart notes, discount codes, and cart contents are not stored locally.
- How the app uses stored data to provide the cart drawer and upsell features.
- How long data is retained after uninstall or deletion requests.
- How merchants can contact support or privacy contact.
- Which production hosting, database, and subprocessors handle app data.
- Whether data is processed outside the merchant's country or region.

## Future Changes That Require Review

Update this document and the public privacy policy before shipping any feature
that adds:

- Billing enforcement details beyond Shopify billing records
- Usage analytics
- Conversion tracking
- Customer targeting
- Order-based upsell rules
- Market-specific shipping goals
- Discount generation
- Support diagnostics that collect storefront details
- Any customer, order, checkout, or payment data storage

## Launch Status

- [ ] Legal business details filled in.
- [ ] Production hosting and database providers filled in.
- [ ] Subprocessors listed.
- [ ] Public privacy policy drafted.
- [ ] Public privacy policy reviewed legally.
- [ ] Public privacy policy hosted at a stable URL.
- [ ] Shopify App Store listing privacy policy URL added.
- [ ] `docs/data-and-privacy.md` still matches actual app behavior.
