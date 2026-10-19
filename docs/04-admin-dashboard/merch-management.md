# ADMIN DASHBOARD — MERCH Management

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** External merchandise storefront integration exists; native MERCH administration and commerce operations planned or under evaluation

**Feature:** Manager MERCH Administration

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Business Objectives](#business-objectives)
3. [Current Implementation](#current-implementation)
4. [Administrative Architecture](#administrative-architecture)
5. [Manager Authorization](#manager-authorization)
6. [MERCH Management Dashboard](#merch-management-dashboard)
7. [Product Catalog](#product-catalog)
8. [Product Creation and Editing](#product-creation-and-editing)
9. [Product Variants](#product-variants)
10. [Pricing and Promotions](#pricing-and-promotions)
11. [Product Images](#product-images)
12. [Inventory Management](#inventory-management)
13. [Product Visibility and Publishing](#product-visibility-and-publishing)
14. [Shopping Cart and Checkout](#shopping-cart-and-checkout)
15. [Order Management](#order-management)
16. [Shipping and Fulfillment](#shipping-and-fulfillment)
17. [Returns and Refunds](#returns-and-refunds)
18. [External Storefront Integration](#external-storefront-integration)
19. [Database and Persistence](#database-and-persistence)
20. [Security and Compliance](#security-and-compliance)
21. [Error Handling and Recovery](#error-handling-and-recovery)
22. [Manager Operating Procedures](#manager-operating-procedures)
23. [Testing and Verification](#testing-and-verification)
24. [Implementation Roadmap](#implementation-roadmap)
25. [Implementation Status](#implementation-status)
26. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed administrative management capabilities for the Fin & Feathers Las Vegas merchandise experience.

The MERCH initiative may eventually allow restaurant managers to maintain merchandise products and manage commerce operations through an authorized administrative interface.

The document covers:

- Merchandise product administration.
- Product descriptions.
- Product variants.
- Pricing.
- Product imagery.
- Inventory.
- Product publication.
- Shopping cart integration.
- Checkout.
- Orders.
- Fulfillment.
- Returns.
- External storefront integration.
- Security.
- Operational procedures.

This document is an implementation planning reference.

It does not establish that a native merchandise commerce platform or management interface currently exists.

## Business Objectives

The MERCH system should support the restaurant's branded merchandise program.

### Brand Extension

Merchandise provides another way for guests to engage with the Fin & Feathers brand.

### Product Accuracy

Product descriptions, prices, sizes, and availability must be accurate.

### Manager Control

Authorized managers should eventually be able to maintain approved merchandise information.

### Inventory Visibility

The system should prevent unavailable merchandise from being presented as immediately available for purchase.

### Reliable Ordering

Customer purchases must follow a dependable checkout process.

### Fulfillment Coordination

Orders should be routed to the appropriate fulfillment operation.

### Financial Accuracy

Prices, taxes, shipping charges, and refunds must be calculated by the approved commerce platform.

### Incremental Implementation

The business may retain an external storefront rather than developing a native commerce system.

## Current Implementation

**Status:** External storefront presentation implemented

The public website includes a merchandise promotional component.

### Existing Promotional Asset

    /img/fin-feathers-merch-thumb.png

### Current Experience

The merchandise promotional image opens an external merchandise website in a modal iframe.

### Existing Website Role

The website provides an entry point to merchandise shopping.

### External Commerce Boundary

The external merchandise website is responsible for whatever catalog, cart, checkout, payment, and order functionality it actually provides.

### Native Capabilities Not Established

The current application has not been verified to include:

- Native merchandise product database.
- Native merchandise catalog editor.
- Native inventory management.
- Native shopping cart.
- Native checkout.
- Native payment processing.
- Native merchandise order management.
- Native fulfillment administration.

### Administrative Foundation

The application includes a protected Admin Dashboard.

### Existing Route

    /admin

### Manager Authorization

The established helper is:

    src/lib/auth/require-manager.ts

### Source Verification

The latest merchandise component and external storefront configuration should be inspected before changing the current integration.

## Administrative Architecture

The business must select an appropriate long-term merchandise architecture.

### Option A — External Storefront

Continue using a third-party merchandise commerce platform.

### Management Model

Product administration, orders, and fulfillment remain within the external platform.

### Website Role

The Fin & Feathers website provides approved storefront links or embedded presentation.

### Option B — Native Commerce

Develop product and order management within the existing Next.js application.

### Potential Native Technology

- Next.js.
- TypeScript.
- Supabase PostgreSQL.
- Supabase Storage.
- Approved payment provider.
- Approved shipping services.

### Option C — Hybrid Commerce

Use the Fin & Feathers website for product presentation while relying on an external platform for checkout and order processing.

### Architecture Decision

The business must evaluate cost, maintenance, security, and operational requirements before selecting an approach.

### Implementation Boundary

No native commerce architecture should be treated as approved until the platform decision is complete.

## Manager Authorization

MERCH administration must be restricted to authorized personnel.

### Established Helper

    requireManager()

### Source

    src/lib/auth/require-manager.ts

### Staff Role Source

    staff_roles

### Required Role

    manager

### Active Status

The staff role must be active.

### Protected Actions

Potential administrative actions include:

- Create product.
- Edit product.
- Change price.
- Upload product image.
- Adjust inventory.
- Publish product.
- Review orders.
- Update fulfillment status.
- Process approved returns.

### Server-Side Authorization

Every native administrative mutation must verify authorization on the server.

### External Platform Permissions

If an external storefront remains authoritative, its own administrator permissions must be configured separately.

### Least Privilege

Staff should receive only the permissions required for their responsibilities.

## MERCH Management Dashboard

**Status:** Planned or platform-dependent

A future dashboard may provide an overview of merchandise operations.

### Potential Sections

- Product catalog.
- Inventory.
- Orders.
- Fulfillment.
- Returns.
- Promotions.
- Reports.
- Store settings.

### Potential Summary Metrics

- Active products.
- Low-stock products.
- Pending orders.
- Orders awaiting fulfillment.
- Recent sales.

These are proposed metrics, not established existing dashboard values.

### Platform Dependency

If the restaurant uses an external commerce platform, these capabilities may be managed entirely outside the Fin & Feathers Admin Dashboard.

### Integration Possibility

The dashboard may eventually link to or display selected external platform information.

### Data Accuracy

Metrics must come from the authoritative commerce system.

### Mobile Experience

Administrative controls should remain usable on mobile devices.

### Error Handling

Failed commerce data retrieval must not be displayed as zero activity.

## Product Catalog

**Status:** Planned or externally managed

The merchandise catalog should contain approved branded products.

### Potential Product Types

- Shirts.
- Hoodies.
- Hats.
- Accessories.
- Other approved merchandise.

These are potential categories, not a verified inventory list.

### Product Information

A product may require:

- Identifier.
- Name.
- Description.
- Category.
- Price.
- Images.
- Variants.
- Availability.
- Display order.

### Catalog Authority

The selected commerce platform must be identified as the authoritative product catalog.

### Duplicate Products

The management process should prevent unintended duplicate listings.

### Product Availability

Unavailable products should follow the approved storefront display rules.

### Catalog Consistency

Product information must remain consistent between the website and checkout platform.

## Product Creation and Editing

**Status:** Planned or externally managed

Authorized managers may need to create and update merchandise products.

### Product Creation

1. Open the approved merchandise management interface.
2. Select the create-product action.
3. Enter the approved product name.
4. Add the approved description.
5. Select the appropriate category.
6. Configure variants.
7. Set approved pricing.
8. Upload approved product images.
9. Configure inventory.
10. Review the product.
11. Save.
12. Verify storefront presentation.

### Product Editing

Managers may need to update:

- Name.
- Description.
- Price.
- Variants.
- Images.
- Inventory.
- Visibility.
- Display order.

### Validation

Required product fields must be validated.

### Save Confirmation

The interface must not report success before the authoritative platform confirms persistence.

### External Platform Boundary

If the external storefront remains in use, product editing may occur exclusively within that provider's administration interface.

## Product Variants

Merchandise products may require multiple purchasing options.

### Common Variant Types

- Size.
- Color.
- Style.
- Material.

### Example

A branded shirt may have several approved sizes and colors.

### Variant Identity

Each purchasable combination may require a distinct SKU or equivalent identifier.

### Variant Pricing

Different variants may have different approved prices.

### Variant Inventory

Inventory may need to be tracked separately for each variant.

### Availability

Unavailable variants should not be presented as immediately purchasable.

### Validation

Invalid combinations should be prevented.

### External Platform Compatibility

Variant data must match the selected commerce platform's requirements.

### Implementation Boundary

No native product variant management system has been established as implemented.

## Pricing and Promotions

Merchandise pricing must follow approved business rules.

### Base Price

Each product or variant should have an approved selling price.

### Promotional Pricing

Temporary discounts may be supported by the selected commerce platform.

### Price Authority

Restaurant management must approve merchandise prices.

### Currency

The storefront should use the approved transaction currency.

### Taxes

Sales tax calculations must follow the selected commerce platform's approved configuration and applicable requirements.

### Shipping Charges

Shipping charges must be presented accurately during checkout.

### Discount Codes

Coupon support is platform-dependent.

### Refund Calculations

Refund amounts must reflect the authoritative order and payment records.

### Pricing Consistency

Displayed prices must match checkout pricing.

### Verification

Price changes should be checked in the actual purchasing flow.

## Product Images

Merchandise images are important for product presentation.

### Image Objectives

- Clear product appearance.
- Accurate colors.
- Consistent framing.
- Appropriate resolution.
- Fast loading.

### Potential Image Types

- Front view.
- Back view.
- Detail view.
- Lifestyle image.
- Variant-specific image.

### Current Promotional Image

The existing website uses:

    /img/fin-feathers-merch-thumb.png

### Future Storage

Native product images may use approved Supabase Storage infrastructure.

### External Platform

If the storefront remains external, images may be managed within that platform.

### Processing

Image size, format, and aspect ratio must follow the chosen commerce architecture.

### Rights

Only authorized merchandise imagery should be published.

### Accessibility

Product images should have meaningful alternative text.

### Verification

Managers should confirm images display correctly on mobile and desktop.

## Inventory Management

**Status:** Planned or externally managed

Inventory management is necessary when the restaurant maintains physical merchandise stock.

### Inventory Unit

Stock may be tracked by product variant or SKU.

### Available Quantity

The system should identify the quantity available for sale.

### Reserved Quantity

A commerce platform may reserve inventory during checkout or order processing.

### Sold Quantity

Completed sales should update inventory according to approved rules.

### Restocking

Managers may need to record incoming inventory.

### Adjustments

Manual corrections should be authorized and auditable.

### Low Stock

The system may provide low-stock alerts.

### Out of Stock

Unavailable items should not be oversold.

### Returns

Returned merchandise should not automatically become sellable without appropriate inspection and rules.

### Source of Truth

The authoritative inventory system must be identified before integration.

### Implementation Boundary

Native inventory tracking has not been established as implemented.

## Product Visibility and Publishing

Managers may need to control which products appear in the storefront.

### Potential States

- Draft.
- Active.
- Hidden.
- Archived.
- Sold Out.

These are conceptual states, not verified database values.

### Draft

A draft should not be publicly purchasable.

### Active

An active product may be displayed for sale.

### Hidden

A hidden product should not appear in normal storefront browsing.

### Archived

An archived product may be retained for historical purposes.

### Sold Out

A sold-out product should follow the approved availability presentation.

### Publishing

Publication should occur only after successful persistence.

### Product Preview

Managers should be able to inspect the product before making it available.

### External Platform Boundary

Actual publication controls depend on the selected commerce platform.

## Shopping Cart and Checkout

**Status:** External storefront functionality; native development under evaluation

The current Fin & Feathers website directs visitors to an external merchandise storefront.

### Existing Website Boundary

The Fin & Feathers application has not been established as operating its own merchandise cart or checkout.

### External Cart

The external storefront may provide cart functionality.

### External Checkout

Payment and order submission occur through the external platform's approved flow.

### Native Cart Consideration

A future native cart would require:

- Product selection.
- Variant selection.
- Quantity controls.
- Price calculation.
- Cart persistence.
- Checkout handoff.

### Checkout Consideration

A native checkout would require an approved payment provider and secure order processing.

### Payment Security

The application must not directly store raw payment card details.

### Order Accuracy

Cart totals must be recalculated by trusted server-side or payment-platform logic.

### Architecture Decision

The business must decide whether native checkout provides sufficient value to justify its development and maintenance costs.

## Order Management

**Status:** Planned or externally managed

A merchandise order system must track purchases accurately.

### Potential Order Information

- Order identifier.
- Customer contact.
- Purchased items.
- Variants.
- Quantities.
- Prices.
- Taxes.
- Shipping charges.
- Payment status.
- Fulfillment status.

### Order Authority

The selected commerce platform must be the authoritative source for order records.

### Proposed Order States

- Pending.
- Paid.
- Processing.
- Fulfilled.
- Cancelled.
- Refunded.

These are conceptual states, not verified platform statuses.

### Payment Confirmation

An order should not be marked paid without authoritative payment confirmation.

### Manager Actions

Potential actions include:

- Review order.
- Review payment status.
- Update fulfillment.
- Handle cancellation.
- Initiate approved refund.

### Duplicate Prevention

Order submission must be designed to avoid duplicate purchases.

### Implementation Boundary

No native merchandise order management interface has been established as implemented.

## Shipping and Fulfillment

Merchandise orders may require shipping or other approved fulfillment methods.

### Fulfillment Model

The business must determine whether orders are fulfilled:

- By restaurant staff.
- By an external merchandise provider.
- By a third-party fulfillment service.

### Shipping Information

Only necessary delivery information should be collected.

### Shipping Rates

Shipping charges must follow the selected provider's configuration.

### Tracking

The fulfillment system may provide shipment tracking.

### Status Updates

Customers should receive accurate fulfillment information.

### Inventory Coordination

Fulfillment should remain consistent with available stock.

### Lost or Delayed Shipments

The business should define support and escalation procedures.

### Local Pickup

Local pickup may be evaluated if operationally appropriate.

### Implementation Boundary

No native fulfillment management workflow has been established as implemented.

## Returns and Refunds

The merchandise program requires an approved return and refund policy.

### Policy Ownership

Restaurant management must approve the policy.

### Return Eligibility

Eligibility may depend on:

- Product type.
- Condition.
- Purchase date.
- Promotional terms.

### Refund Authority

Refunds must be processed through the authoritative payment or commerce platform.

### Inventory Handling

Returned items should be inspected before any inventory adjustment.

### Order Status

Refunded and returned orders must be represented accurately.

### Duplicate Refunds

The system must prevent unintended duplicate refund processing.

### Customer Communication

Guests should receive clear information about the return outcome.

### Administrative Permissions

Refund operations may require elevated authorization.

### Implementation Boundary

No native refund management capability has been established as implemented.

## External Storefront Integration

The existing merchandise experience relies on an external storefront.

### Current Presentation

The promotional image opens the external merchandise website in a modal iframe.

### Integration Responsibilities

The Fin & Feathers website provides the entry point.

### External Responsibilities

The external provider may manage:

- Product catalog.
- Inventory.
- Shopping cart.
- Checkout.
- Payment.
- Orders.
- Fulfillment.

The actual provider capabilities require verification.

### Embedded Experience

Iframe behavior may depend on the external site's embedding policies.

### Fallback Navigation

A direct external link may be necessary if embedding is unavailable.

### Security Boundary

The restaurant website must not assume control over external checkout security or payment processing.

### Future API Integration

Any external API integration requires provider capability, authentication, cost, and maintenance review.

### Platform Evaluation

A separate merchandise commerce evaluation should determine the preferred long-term architecture.

## Database and Persistence

**Status:** Architecture decision pending

The project uses Supabase PostgreSQL.

### Native Commerce Possibility

A native system may require data structures for:

- Products.
- Product variants.
- Inventory.
- Carts.
- Orders.
- Order items.
- Fulfillment.
- Refund references.

### Schema Boundary

These are conceptual data areas, not verified existing tables.

### External Commerce Possibility

If the external platform remains authoritative, duplicating commerce records in Supabase may be unnecessary.

### Synchronization

Any replicated data must have clear synchronization and reconciliation rules.

### Transaction Integrity

Order and inventory operations require reliable transactional behavior.

### Access Policies

Commerce records must be protected through appropriate authorization and database policies.

### Retention

Order data retention must follow approved business and legal requirements.

### Backup and Recovery

Critical commerce records require appropriate recovery procedures.

## Security and Compliance

Commerce administration requires careful security design.

### Authentication

Require valid administrative authentication.

### Authorization

Require the active manager role for protected operations.

### Server-Side Enforcement

Protect product, inventory, and order mutations.

### Payment Security

Use an approved payment processor.

### Card Data

Do not store raw payment card numbers, security codes, or sensitive authentication data in Supabase.

### Provider Compliance

Payment processing must follow the selected provider's requirements.

### Customer Information

Protect contact and shipping information.

### Database Policies

Use appropriate access controls for private commerce records.

### Integration Credentials

Store private API credentials securely on the server.

### Webhook Security

If webhooks are used, validate authenticity and handle retries safely.

### Fraud and Abuse

Consider appropriate order validation and fraud controls.

### Auditability

Significant price, inventory, and refund actions may require audit records.

### Privacy

Data collection, retention, and disclosure require approved policies.

## Error Handling and Recovery

### Product Load Failure

Show a retrieval error rather than an empty successful catalog.

### Failed Product Save

Do not report success before persistence succeeds.

### Inventory Conflict

Prevent sales based on stale or invalid stock information.

### Cart Error

Preserve or recover the cart where supported.

### Checkout Failure

Do not treat failed payment as a completed purchase.

### Duplicate Payment

Use provider-supported safeguards against duplicate charges.

### Order Synchronization Failure

Investigate differences between integrated systems.

### Fulfillment Error

Do not mark an order shipped without an authoritative fulfillment event.

### Refund Failure

Do not report a completed refund before provider confirmation.

### External Storefront Failure

Provide an appropriate fallback or customer-facing notice.

### Recovery

Follow the approved platform and business recovery procedures.

### Escalation

Financial or fulfillment incidents should be escalated promptly.

## Manager Operating Procedures

The following procedures describe the intended future management workflow.

### Adding Merchandise

1. Open the approved merchandise management system.
2. Select the product creation action.
3. Enter approved product details.
4. Configure variants.
5. Set pricing.
6. Add product images.
7. Configure inventory.
8. Review the listing.
9. Publish through the authoritative platform.
10. Verify storefront presentation.

### Updating Pricing

1. Confirm the approved price.
2. Locate the correct product or variant.
3. Update the price.
4. Save.
5. Verify the storefront.
6. Check checkout consistency.

### Adjusting Inventory

1. Identify the correct SKU.
2. Verify the physical or provider inventory.
3. Enter the authorized adjustment.
4. Save.
5. Confirm the new quantity.
6. Record the adjustment where required.

### Reviewing Orders

1. Open the authoritative order system.
2. Locate the relevant order.
3. Verify payment status.
4. Review fulfillment requirements.
5. Take only authorized actions.
6. Confirm the resulting status.

### Processing Returns

1. Verify the order.
2. Review the approved return policy.
3. Determine eligibility.
4. Process the return through the approved system.
5. Confirm refund status where applicable.
6. Update inventory only when appropriate.

### Current Operational Boundary

Until the architecture is selected and implemented, these procedures are planning references rather than verified native admin controls.

## Testing and Verification

### Authorization

- Valid active manager.
- Unauthenticated user.
- Inactive manager.
- Unauthorized role.
- Direct route access.
- Unauthorized mutation attempt.

### Products

- Create product.
- Edit product.
- Validate required fields.
- Configure variants.
- Update pricing.
- Publish and hide product.

### Images

- Upload valid image.
- Reject invalid file.
- Verify product image display.
- Verify mobile presentation.

### Inventory

- Track variant quantities.
- Prevent overselling.
- Handle stock adjustments.
- Handle concurrent orders.
- Verify low-stock behavior.

### Cart

If implemented:

- Add item.
- Change quantity.
- Remove item.
- Select variant.
- Recalculate totals.

### Checkout

If implemented:

- Successful payment.
- Declined payment.
- Duplicate submission.
- Invalid order.
- Payment provider failure.

### Orders

- Correct order creation.
- Correct payment status.
- Correct fulfillment status.
- Cancellation handling.
- Refund handling.

### External Storefront

- Promotional image opens storefront.
- Iframe loads where supported.
- External fallback works.
- Mobile shopping experience functions.
- Checkout remains within approved provider flow.

### Security

- Database policies.
- Secure credentials.
- Webhook validation if applicable.
- Protected customer information.
- Safe payment handling.

## Implementation Roadmap

### Stage 1 — Inspect Current Integration

Review the existing merchandise component and external storefront configuration.

### Stage 2 — Define Business Requirements

Confirm:

- Merchandise catalog.
- Inventory ownership.
- Product variants.
- Pricing.
- Fulfillment model.
- Returns.
- Reporting.
- Administrative responsibilities.

### Stage 3 — Evaluate Platforms

Compare external, native, and hybrid commerce options.

### Stage 4 — Approve Architecture

Select the preferred commerce platform and source of truth.

### Stage 5 — Design Administration

Determine which operations belong in the Fin & Feathers dashboard versus the external platform.

### Stage 6 — Implement Approved Capabilities

Build only the required management interfaces and integrations.

### Stage 7 — Verify Commerce Operations

Test catalog, inventory, checkout, payment, orders, and fulfillment as applicable.

### Stage 8 — Review Security

Verify access controls, payment handling, privacy, and integration security.

### Stage 9 — Operational Handoff

Provide manager procedures and support documentation.

### Scheduling

This sequence is proposed and does not establish a committed delivery date.

## Implementation Status

| Capability | Status |
|---|---|
| Public merchandise promotional image | Implemented |
| External storefront modal integration | Implemented |
| Admin Dashboard foundation | Implemented |
| Manager authentication | Implemented |
| Active manager authorization | Implemented |
| Current external storefront inventory | Source verification pending |
| Commerce platform evaluation | Under Evaluation |
| Dedicated MERCH admin route | Planned or platform-dependent |
| Native product catalog | Not implemented |
| Native product editor | Not implemented |
| Native variant management | Not implemented |
| Native inventory management | Not implemented |
| Native shopping cart | Not implemented |
| Native checkout | Not implemented |
| Native payment processing | Not implemented |
| Native order management | Not implemented |
| Native fulfillment management | Not implemented |
| External commerce API integration | Under Evaluation |
| MERCH database schema | Architecture decision pending |
| Payment provider selection | Pending Approval |
| Shipping and return policies | Pending Approval |
| End-to-end commerce acceptance testing | Pending architecture decision |

## Related Documentation

- [Admin Dashboard Overview](README.md)
- [Dashboard Overview](dashboard-overview.md)
- [Manager Permissions](manager-permissions.md)
- [Website MERCH Overview](../02-website/merch/README.md)
- [MERCH Storefront Overview](../02-website/merch/storefront-overview.md)
- [MERCH Product Display](../02-website/merch/product-display.md)
- [MERCH Shopping Cart](../02-website/merch/shopping-cart.md)
- [Merchandise Commerce Overview](../11-merch-commerce/README.md)
- [Commerce Overview](../11-merch-commerce/commerce-overview.md)
- [Product Catalog](../11-merch-commerce/product-catalog.md)
- [Inventory Management](../11-merch-commerce/inventory-management.md)
- [Cart and Checkout](../11-merch-commerce/cart-and-checkout.md)
- [Payment Processing](../11-merch-commerce/payment-processing.md)
- [Shipping and Fulfillment](../11-merch-commerce/shipping-and-fulfillment.md)
- [Platform Evaluation](../11-merch-commerce/platform-evaluation.md)
- [Database Overview](../06-database/README.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Master Documentation Index](../README.md)

---

[Back to Admin Dashboard Overview](README.md)
