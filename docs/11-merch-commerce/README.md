# MERCHANDISE COMMERCE — Documentation Overview

**Project:** Fin & Feathers Las Vegas

**Website:** https://finandfeatherslv.live

**Documentation Status:** Planning and Architecture Evaluation

**Audience:** Restaurant Ownership, Managers, Developers, Technical Administrators, Merchandise Personnel, and Fulfillment Partners

**Implementation Status:** Existing merchandise presentation and external storefront handoff; native merchandise commerce proposed

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Merchandise Commerce Vision](#merchandise-commerce-vision)
3. [Current Website Baseline](#current-website-baseline)
4. [Scope and Boundaries](#scope-and-boundaries)
5. [Business Objectives](#business-objectives)
6. [Commerce Architecture Options](#commerce-architecture-options)
7. [Proposed Guest Experience](#proposed-guest-experience)
8. [Product Catalog](#product-catalog)
9. [Product Variants and Options](#product-variants-and-options)
10. [Product Media](#product-media)
11. [Inventory Management](#inventory-management)
12. [Shopping Cart](#shopping-cart)
13. [Checkout and Payment Processing](#checkout-and-payment-processing)
14. [Orders and Order Status](#orders-and-order-status)
15. [Shipping and Fulfillment](#shipping-and-fulfillment)
16. [Returns and Refunds](#returns-and-refunds)
17. [Manager Administration](#manager-administration)
18. [Authentication and Guest Checkout](#authentication-and-guest-checkout)
19. [Database and Storage Planning](#database-and-storage-planning)
20. [Security and Privacy](#security-and-privacy)
21. [Platform Evaluation](#platform-evaluation)
22. [Cost and Financial Planning](#cost-and-financial-planning)
23. [Mobile Experience and Accessibility](#mobile-experience-and-accessibility)
24. [Monitoring and Operations](#monitoring-and-operations)
25. [Testing and Acceptance](#testing-and-acceptance)
26. [Implementation Phases](#implementation-phases)
27. [Decision Gates](#decision-gates)
28. [Risks and Dependencies](#risks-and-dependencies)
29. [Implementation Status](#implementation-status)
30. [Documentation Directory](#documentation-directory)
31. [Related Documentation](#related-documentation)

---

## Purpose

This documentation section establishes the proposed architecture, operating model, and implementation requirements for merchandise commerce on the Fin & Feathers Las Vegas website.

The existing website includes a merchandise presentation component that provides access to an external merchandise experience.

A future development phase may replace or supplement that arrangement with a more integrated storefront.

Potential functionality includes:

- A browsable merchandise catalog.
- Product images and descriptions.
- Size and color selection.
- Inventory availability.
- A dedicated merchandise shopping cart.
- Secure checkout.
- Merchandise order records.
- Shipping and fulfillment workflows.
- Returns and refunds.
- Authorized manager administration.
- Financial and operational reporting.

The exact feature set must be approved before implementation.

This section is a planning reference, not confirmation that these capabilities already exist.

## Merchandise Commerce Vision

The long-term vision is a branded merchandise experience that feels like a natural extension of the Fin & Feathers website.

### Brand Continuity

Maintain the established restaurant identity throughout product browsing and checkout.

### Mobile-First Presentation

Prioritize the experience of guests shopping from phones.

### Simple Purchasing

Allow guests to understand product options, pricing, and fulfillment before paying.

### Manageable Operations

Provide staff with appropriate tools without introducing unnecessary complexity.

### Inventory Accuracy

Reduce the risk of accepting orders for unavailable products.

### Secure Transactions

Use an approved payment provider and appropriate security controls.

### Future Growth

Allow the catalog and operating model to expand as merchandise demand develops.

### Guiding Principle

Select the simplest reliable commerce architecture that meets the restaurant's business requirements.

## Current Website Baseline

### Framework

Next.js App Router with TypeScript.

### Deployment

Vercel.

### Database

Supabase PostgreSQL.

### Authentication

Supabase Auth.

### Storage

Supabase Storage.

### Existing Merchandise Experience

The website includes a merchandise thumbnail and modal-based external storefront presentation.

### Current Native Commerce Status

A fully implemented native merchandise cart, checkout, and order-management system has not been established.

### Existing Manager Interface

The website includes protected manager administration for menu operations.

### Reuse Opportunity

Existing application conventions may inform a future merchandise administration interface.

### Verification

Inspect the current merchandise component and external storefront behavior before selecting a replacement architecture.

## Scope and Boundaries

### Potentially In Scope

- Product listings.
- Product details.
- Variants.
- Inventory.
- Merchandise cart.
- Checkout.
- Payment confirmation.
- Merchandise orders.
- Shipping.
- Returns.
- Manager tools.

### Separate from Restaurant Food Ordering

Toast restaurant ordering and merchandise commerce are distinct business workflows.

### Separate Cart

Do not combine restaurant food selections and merchandise products without a separately approved integration.

### Separate Fulfillment

Restaurant pickup orders must not be assumed to follow merchandise shipping procedures.

### Separate Payment Decisions

The merchandise payment provider must be evaluated independently of the Toast ordering workflow.

### Exclusions

No custom payment processor, warehouse management platform, or multivendor marketplace is assumed.

### Scope Approval

Every proposed capability requires an explicit implementation decision.

## Business Objectives

### Revenue Opportunity

Create a convenient channel for merchandise purchases.

### Brand Visibility

Extend the Fin & Feathers brand beyond the restaurant.

### Product Discovery

Make available merchandise easy to browse.

### Conversion

Reduce unnecessary friction between product selection and purchase.

### Inventory Control

Provide reliable product availability information.

### Administrative Efficiency

Simplify product updates and order management.

### Customer Confidence

Communicate payment, shipping, and return policies clearly.

### Operational Accountability

Track orders and fulfillment status.

### Financial Sustainability

Evaluate profitability after product, platform, payment, shipping, and support costs.

### Measurable Success

Define appropriate sales and operational metrics before launch.

## Commerce Architecture Options

Several approaches may be evaluated.

| Option | Description | Status |
|---|---|---|
| External merchandise storefront | Continue directing guests to the existing external store | Existing presentation |
| Hosted commerce platform | Use a dedicated provider for catalog, checkout, and orders | Under evaluation |
| Headless commerce | Integrate a commerce backend with the Next.js website | Under evaluation |
| Custom Supabase commerce | Build approved commerce logic using the existing application stack | Proposed option |
| Hybrid storefront | Use native product browsing with hosted checkout | Proposed option |

### Evaluation Factors

- Initial cost.
- Recurring cost.
- Payment security.
- Inventory features.
- Shipping capabilities.
- Administrative usability.
- Development effort.
- Vendor dependency.
- Maintenance burden.

### Decision Rule

Do not select a platform before confirming the restaurant's actual merchandise requirements.

## Proposed Guest Experience

### Product Discovery

Guests access the merchandise section from the website.

### Product Selection

Guests view product details and available options.

### Variant Selection

Guests select required sizes, colors, or other supported variants.

### Availability

The interface indicates whether the selection is purchasable.

### Cart

Guests review selected merchandise.

### Checkout

Guests proceed through an authorized payment workflow.

### Confirmation

The system presents a verified order result.

### Fulfillment

Guests receive appropriate shipping or pickup information.

### Support

Guests can access approved assistance and return information.

### Important Boundary

The guest journey is conceptual until the commerce platform is selected.

## Product Catalog

The catalog should support clear, consistent merchandise presentation.

### Product Identity

Each product requires a stable internal identifier.

### Name

Use an approved guest-facing product name.

### Description

Explain relevant product characteristics.

### Category

Organize merchandise using an approved merchandise-specific taxonomy.

### Price

Display the current approved selling price.

### Availability

Communicate the current purchasable status.

### Media

Associate approved product images.

### Publication

Distinguish draft and published products.

### Management

Allow authorized personnel to maintain catalog information.

## Product Variants and Options

Merchandise may require variations.

### Size

Examples may include apparel sizes where applicable.

### Color

Products may offer multiple colors.

### Style

Different styles may represent distinct products or variants.

### Variant Identity

Each purchasable configuration should have a stable identifier.

### Pricing

Variants may require different prices.

### Inventory

Stock may differ by variant.

### Availability

Prevent selection of unavailable combinations.

### Cart Accuracy

Preserve the exact selected variant.

### Manager Validation

Confirm valid option combinations.

### Design Requirement

Do not assume every product requires variants.

## Product Media

Product images should accurately represent merchandise.

### Primary Image

Provide a clear product image.

### Additional Images

Support alternate views where useful.

### Consistency

Use approved image dimensions and presentation conventions.

### Optimization

Deliver appropriately compressed images.

### Accessibility

Provide meaningful alternative text.

### Storage

Evaluate reuse of the existing Supabase Storage infrastructure.

### Authorization

Restrict media management to approved staff.

### File Validation

Validate upload type and size.

### Replacement

Avoid breaking product references when images change.

### Brand Approval

Use only authorized merchandise imagery.

## Inventory Management

Inventory controls depend on how merchandise is sourced and fulfilled.

### Stock Ownership

Determine who owns and manages inventory.

### Inventory Source

Identify the authoritative inventory system.

### Variant-Level Stock

Track stock by purchasable configuration where needed.

### Availability

Prevent purchases when stock is unavailable.

### Reservations

Determine whether inventory should be reserved during checkout.

### Payment Failure

Release reserved inventory according to the approved workflow.

### Cancellations

Define inventory restoration rules.

### Manual Adjustments

Restrict stock changes to authorized staff.

### Auditability

Track important adjustments.

### Third-Party Fulfillment

Avoid duplicating inventory authority when an external provider manages stock.

## Shopping Cart

The merchandise cart must be separate from the restaurant ordering cart.

### Product Identity

Store the selected product and variant.

### Quantity

Allow supported quantity adjustments.

### Price

Use authoritative current pricing.

### Availability

Revalidate stock before checkout.

### Removal

Allow guests to remove products.

### Persistence

Evaluate temporary or persistent cart storage.

### Totals

Display an understandable order summary.

### Shipping

Distinguish merchandise shipping costs from item prices.

### Checkout

Pass validated selections to the approved payment workflow.

### Security

Do not trust browser-submitted prices.

## Checkout and Payment Processing

The payment architecture requires a separate decision.

### Hosted Checkout

A commerce provider may manage the payment interface.

### Embedded Checkout

Use only officially supported embedded payment options.

### Custom Integration

Evaluate additional security and maintenance responsibilities.

### Payment Methods

Offer only supported payment methods.

### Pricing Authority

Validate all amounts server-side or through the approved provider.

### Taxes

Determine the applicable tax calculation process.

### Shipping Charges

Show applicable charges before payment.

### Confirmation

Use authoritative payment and order results.

### PCI DSS

Assess the actual payment architecture's compliance scope.

### Critical Restriction

Do not store raw cardholder data in Supabase.

## Orders and Order Status

Merchandise orders require their own lifecycle.

### Order Creation

Create orders through the selected commerce architecture.

### Reference

Assign or receive a stable order identifier.

### Customer Details

Collect necessary contact and fulfillment information.

### Line Items

Preserve purchased products and variants.

### Payment Status

Track the authoritative payment outcome.

### Fulfillment Status

Track preparation and shipment where applicable.

### Cancellation

Define supported cancellation procedures.

### Refund

Associate refunds with the correct transaction.

### Audit

Record important operational transitions.

### Schema Boundary

No specific merchandise order tables or fields are asserted as already implemented.

## Shipping and Fulfillment

Fulfillment must match the restaurant's merchandise operating model.

### Fulfillment Provider

Determine who prepares and ships merchandise.

### Stock Location

Identify where products are stored.

### Shipping Regions

Define supported destinations.

### Rates

Determine how shipping costs are calculated.

### Packaging

Account for materials and presentation.

### Processing Time

Publish realistic preparation expectations.

### Tracking

Provide shipment tracking when supported.

### Delivery Exceptions

Establish procedures for delayed or missing packages.

### Local Pickup

Offer only if approved and operationally supported.

### Responsibility

Assign ownership for fulfillment and customer inquiries.

## Returns and Refunds

A merchandise return policy should be approved before checkout launches.

### Return Eligibility

Define which products may be returned.

### Return Window

Set an approved timeframe.

### Condition Requirements

Explain acceptable product condition.

### Exchanges

Determine whether exchanges are supported.

### Shipping Responsibility

Specify who pays return shipping.

### Refund Authorization

Restrict refund actions appropriately.

### Payment Provider

Use supported refund tools.

### Inventory

Define how returned products affect stock.

### Guest Communication

Provide clear return instructions.

### Documentation

Publish the approved policy before accepting purchases.

## Manager Administration

The future admin interface may include merchandise operations.

### Catalog Management

Create and edit products.

### Product Publishing

Control product visibility.

### Variant Management

Maintain valid options.

### Inventory Management

Update stock where the website is authoritative.

### Order Visibility

Review merchandise orders.

### Fulfillment

Record approved status updates.

### Refund Operations

Provide only appropriately authorized capabilities.

### Permissions

Reuse established authorization conventions where suitable.

### Audit

Record important administrative actions.

### Implementation

Do not assume these capabilities already exist in `/admin`.

## Authentication and Guest Checkout

The guest identity model requires a business decision.

### Guest Checkout

Evaluate purchases without account creation.

### Account Checkout

Determine whether merchandise accounts provide meaningful value.

### Supabase Auth

Consider reuse only where appropriate.

### FAM CLUB

Do not assume future loyalty membership is required for merchandise purchasing.

### Contact Information

Collect only what is necessary.

### Order Lookup

Provide a supported method for guests to access order information.

### Password Security

Use approved authentication mechanisms.

### Authorization

Prevent guests from accessing other customers' orders.

### Privacy

Avoid unnecessary personal data collection.

### Decision

Choose the simplest secure checkout identity model.

## Database and Storage Planning

Existing infrastructure may support some commerce requirements.

### Database

Supabase PostgreSQL.

### Storage

Supabase Storage.

### Potential Records

- Products.
- Variants.
- Inventory.
- Carts.
- Orders.
- Fulfillment events.
- Refund references.

### Schema Qualification

These are conceptual entities, not confirmed existing tables.

### Data Ownership

Avoid duplicating records unnecessarily when a hosted platform is authoritative.

### RLS

Apply appropriate Row Level Security policies.

### Server Authorization

Protect administrative operations.

### Retention

Define justified retention periods.

### Migration

Review schema changes before deployment.

## Security and Privacy

### Payment Data

Keep cardholder information within the approved payment boundary.

### Secrets

Store privileged credentials server-side.

### Source Control

Never commit `.env.local`.

### Authentication

Protect administrative access.

### Authorization

Restrict order and inventory changes.

### Guest Information

Minimize collection and exposure.

### Database

Review RLS and access policies.

### Webhooks

Verify authenticity using the selected provider's documented mechanism.

### Logging

Redact secrets and sensitive information.

### Incident Response

Document containment, investigation, and recovery procedures.

## Platform Evaluation

The platform decision should follow requirements discovery.

### Hosted Commerce

Evaluate managed catalog, checkout, and fulfillment capabilities.

### Headless Commerce

Evaluate API support and frontend flexibility.

### Custom Commerce

Evaluate engineering and operational responsibilities.

### Payment Support

Confirm compatible providers.

### Inventory Support

Review stock and variant functionality.

### Shipping Support

Review rates, labels, and tracking capabilities.

### Manager Experience

Assess ease of use for restaurant staff.

### Costs

Compare setup, subscription, transaction, and maintenance expenses.

### Exit Strategy

Consider migration and data portability.

### Decision Evidence

Document verified capabilities and current commercial terms.

## Cost and Financial Planning

The business case should include the complete ownership cost.

### Product Cost

Determine acquisition or production expense.

### Initial Development

Estimate approved engineering work.

### Platform Fees

Obtain current vendor pricing.

### Payment Fees

Use documented processing terms.

### Shipping

Include packaging and carrier expenses.

### Inventory

Account for storage and unsold stock.

### Refunds

Include return and exception costs.

### Maintenance

Budget for technical support.

### Labor

Include order preparation and customer service.

### Profitability

Evaluate contribution margin rather than gross sales alone.

## Mobile Experience and Accessibility

The storefront should follow the existing mobile-first design direction.

### Responsive Layout

Support narrow and wide viewports.

### Product Images

Ensure clear product presentation.

### Variant Controls

Make options easy to select.

### Cart Access

Keep the cart understandable.

### Checkout

Minimize unnecessary steps.

### Keyboard Navigation

Support keyboard operation.

### Screen Readers

Provide appropriate labels and announcements.

### Errors

Clearly identify required corrections.

### Loading States

Avoid ambiguous payment or submission states.

### Testing

Verify representative mobile devices and accessibility workflows.

## Monitoring and Operations

Operational visibility is essential after launch.

### Catalog Errors

Detect missing product information.

### Inventory Errors

Identify stock discrepancies.

### Checkout Failures

Monitor failed purchase attempts.

### Unknown Payments

Escalate uncertain transaction outcomes.

### Order Exceptions

Identify orders requiring staff attention.

### Fulfillment Delays

Track unresolved shipments.

### Refund Issues

Monitor failed or duplicate refund attempts.

### Security Events

Review suspicious activity.

### Staff Support

Provide documented escalation procedures.

### Reporting

Measure operational and financial performance.

## Testing and Acceptance

### Catalog

- [ ] Products display correctly.
- [ ] Variants are valid.
- [ ] Product images load.
- [ ] Unpublished products are protected.

### Inventory

- [ ] Stock availability is accurate.
- [ ] Overselling scenarios are addressed.
- [ ] Cancellations update inventory appropriately.

### Cart

- [ ] Products can be added and removed.
- [ ] Quantities are validated.
- [ ] Totals are authoritative.

### Checkout

- [ ] Supported payments complete.
- [ ] Declined payments are handled.
- [ ] Duplicate charges are prevented.
- [ ] Confirmations reflect verified outcomes.

### Operations

- [ ] Fulfillment procedures are tested.
- [ ] Refund procedures are tested.
- [ ] Manager permissions are verified.
- [ ] Staff acceptance is documented.

## Implementation Phases

### Phase 0 — Discovery

Review the existing external merchandise experience and business requirements.

### Phase 1 — Platform Evaluation

Compare feasible hosted, headless, custom, and hybrid options.

### Phase 2 — Architecture Approval

Select the platform, data ownership, payment model, and fulfillment responsibilities.

### Phase 3 — Catalog Foundation

Establish approved product and variant structures.

### Phase 4 — Inventory

Implement the selected inventory model.

### Phase 5 — Storefront

Build approved product browsing and selection interfaces.

### Phase 6 — Cart

Implement a dedicated merchandise cart where required.

### Phase 7 — Checkout

Integrate the approved payment workflow.

### Phase 8 — Fulfillment

Implement shipping and order operations.

### Phase 9 — Testing

Complete technical, security, and staff acceptance.

### Phase 10 — Launch

Deploy through an approved, reversible release process.

### Phase 11 — Optimization

Review sales, costs, guest experience, and operational performance.

## Decision Gates

### Gate A — Business Requirements

Confirm merchandise types, expected volume, and fulfillment ownership.

### Gate B — Platform Selection

Approve the commerce architecture.

### Gate C — Financial Approval

Verify costs and expected profitability.

### Gate D — Security

Approve payment and guest-data boundaries.

### Gate E — Technical Feasibility

Validate required platform capabilities.

### Gate F — Operational Readiness

Confirm inventory, shipping, and returns procedures.

### Gate G — Acceptance

Complete testing and staff review.

### Gate H — Production Launch

Obtain restaurant ownership authorization.

### Rule

An unresolved critical gate must pause the affected implementation phase.

## Risks and Dependencies

| Risk | Potential Impact | Mitigation |
|---|---|---|
| Unclear product ownership | Catalog or fulfillment confusion | Confirm business responsibilities |
| Inventory inaccuracies | Overselling | Authoritative stock management |
| Payment errors | Financial discrepancies | Approved provider and reconciliation |
| Shipping delays | Guest dissatisfaction | Clear fulfillment procedures |
| Unplanned platform fees | Reduced profitability | Written cost analysis |
| Weak manager controls | Unauthorized changes | Server-side authorization |
| Inadequate return policy | Disputes and support issues | Publish approved policies |
| Platform dependency | Migration difficulty | Review data portability |
| Scope expansion | Delayed launch | Phased approval |
| Mixed restaurant and merchandise orders | Operational confusion | Separate carts and order workflows |

### Dependency Management

Track each material dependency, responsible owner, and resolution status.

## Implementation Status

| Capability | Status |
|---|---|
| Existing website merchandise presentation | Established |
| External merchandise storefront handoff | Existing workflow; details require review |
| Native product catalog | Proposed |
| Native product detail pages | Proposed |
| Product variant management | Proposed |
| Merchandise inventory management | Proposed |
| Native merchandise cart | Proposed |
| Native merchandise checkout | Not implemented |
| Commerce platform selection | Pending |
| Payment provider selection | Pending |
| Merchandise order management | Proposed |
| Shipping integration | Unconfirmed |
| Local merchandise pickup | Pending business decision |
| Returns and refunds workflow | Proposed |
| Manager merchandise administration | Proposed |
| Merchandise database schema | Pending architecture decision |
| Merchandise security review | Pending |
| Financial model | Pending |
| Staff acceptance testing | Not started |
| Production native commerce | Not implemented |

### Overall Assessment

The existing external merchandise experience remains the baseline while a native or more integrated solution is evaluated.

## Documentation Directory

This section contains the following planned documents.

| File | Purpose |
|---|---|
| [README.md](README.md) | Section overview and documentation navigation |
| [commerce-overview.md](commerce-overview.md) | Commerce architecture and guest journey |
| [product-catalog.md](product-catalog.md) | Products, variants, pricing, and presentation |
| [inventory-management.md](inventory-management.md) | Stock ownership, availability, and adjustments |
| [cart-and-checkout.md](cart-and-checkout.md) | Merchandise cart and checkout workflow |
| [payment-processing.md](payment-processing.md) | Payments, refunds, and reconciliation |
| [shipping-and-fulfillment.md](shipping-and-fulfillment.md) | Shipping, packing, tracking, and delivery |
| [platform-evaluation.md](platform-evaluation.md) | Commerce platform comparison and selection |
| [cost-analysis.md](cost-analysis.md) | Investment and operating cost evaluation |
| [implementation-roadmap.md](implementation-roadmap.md) | Phased development and launch plan |

### Documentation Status

The remaining documents are planned and should not be assumed complete until individually created and verified.

### Maintenance

Update the directory as documentation is completed.

## Related Documentation

### Project Overview

- [Master Documentation Index](../README.md)
- [Project Overview](../01-project-overview/README.md)
- [Project Architecture](../01-project-overview/architecture.md)
- [Technology Stack](../01-project-overview/technology-stack.md)
- [Development Roadmap](../01-project-overview/development-roadmap.md)

### Existing Website Merchandise

- [Website Overview](../02-website/README.md)
- [Merchandise Overview](../02-website/merch/README.md)
- [Storefront Overview](../02-website/merch/storefront-overview.md)
- [Product Display](../02-website/merch/product-display.md)
- [Shopping Cart Planning](../02-website/merch/shopping-cart.md)

### Administration and Data

- [Admin Dashboard Overview](../04-admin-dashboard/README.md)
- [Merchandise Administration](../04-admin-dashboard/merch-management.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Supabase Authentication](../05-authentication/supabase-auth.md)
- [Database Overview](../06-database/README.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Database Storage](../06-database/storage.md)

### Deployment and Operations

- [Vercel Deployment](../07-deployment/vercel-deployment.md)
- [Rollback Procedures](../07-deployment/rollback-procedures.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Testing Checklists](../08-operations/testing-checklists.md)

### Separate Restaurant Ordering

- [Toast POS Integration Overview](../10-toast-pos-integration/README.md)
- [Toast Cart and Checkout](../10-toast-pos-integration/cart-and-checkout.md)
- [Toast Payment Processing](../10-toast-pos-integration/payment-processing.md)

---

[Back to Master Documentation Index](../README.md)
