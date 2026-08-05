# Data And Privacy Notes

This document describes what Cart Drawer Upsell stores today. Keep it updated
whenever the app starts storing new merchant, customer, order, billing, or
storefront analytics data.

## Data Stored By The App

### Shopify Sessions

The app stores Shopify session records through Prisma session storage.

Stored fields include:

- Shop domain
- Access token
- Granted scope string
- Session state
- Online/offline session flag
- Token expiry fields
- Shopify user profile fields for online sessions, when Shopify provides them

These records are required for embedded admin authentication and Admin API
access.

The development schema currently uses local SQLite. Production hosting must use
a durable database with backups and access controls appropriate for Shopify
session data.

Session records are deleted when the app receives:

- `app/uninstalled`
- `shop/redact`

### Upsell Configuration

The app stores cart drawer upsell settings on the current app installation in
Shopify app-data metafields.

Stored fields include:

- Whether upsells are enabled
- Selected product handles
- Selected variant IDs
- Product title, handle, image URL, price, variant title, availability, and
  status fields needed to render the drawer

This configuration is scoped to the app installation and is read by the Theme
App Extension app embed.

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

## Shopify API Access

The app currently requests:

- `read_products`

This is used so the embedded admin app can show product and variant data for
manual upsell selection.

The app should not request write product, metaobject, order, customer, or
analytics scopes unless a future feature requires them.

## Compliance Webhooks

The app defines handlers for:

- `customers/data_request`
- `customers/redact`
- `shop/redact`

For customer data requests and customer redaction requests, the app currently
acknowledges the webhook because it does not store customer or order personal
data locally.

For shop redaction, the app deletes local Shopify sessions for the shop.

## Future Data Changes To Review

Before launch, revisit this document if the app adds:

- Billing enforcement
- Usage analytics
- Conversion tracking
- Customer targeting
- Order-based upsell rules
- Market-specific shipping goals
- Discount generation
- Support diagnostics that collect storefront details
