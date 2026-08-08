# Security Policy

Use this document to report security issues for Cart Drawer Upsell.

Do not open a public GitHub issue for vulnerabilities, secrets, access tokens,
customer personal data, payment data, private order details, or store-specific
security incidents.

## Reporting A Vulnerability

Before launch, replace these placeholders with real contact details:

- Security contact email: `[security-email]`
- Support URL: `[support-url]`
- Business name: `[business-name]`

When reporting a vulnerability, include:

- A short summary of the issue
- Steps to reproduce
- Affected route, file, app area, or storefront behavior
- Impact assessment, if known
- Screenshots or logs, with secrets and personal data removed

Do not include:

- Shopify access tokens
- API secrets
- Store owner passwords
- Customer names, emails, addresses, phone numbers, or payment details
- Private order details

## Expected Response

These targets are not service-level guarantees, but they define the intended
security response process.

- Acknowledge the report within 2 business days.
- Triage severity and impact before making public changes.
- Fix critical issues before unrelated feature work.
- Coordinate disclosure timing when needed.
- Update documentation, policies, or review notes if the issue changes app
  behavior or data handling.

## Supported Versions

Before the app is listed, only the current development version is supported.

After App Store launch, keep this section updated with the production app
version or release window that receives security fixes.

## Security Areas To Review Before Launch

- Shopify OAuth and embedded admin authentication
- Session storage and production database access
- Webhook authentication and raw request body handling
- App-data metafield reads and writes
- Storefront Ajax Cart API requests
- Billing gate behavior, once billing is enabled
- Privacy compliance webhook behavior
- Access scopes in `shopify.app.toml` and `SCOPES`
- Environment variable handling in production hosting
