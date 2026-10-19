# MERCHANDISE COMMERCE — Commerce Architecture Overview

**Project:** Fin & Feathers Las Vegas

**Website:** https://finandfeatherslv.live

**Documentation Status:** Architecture Planning and Feasibility Evaluation

**Audience:** Restaurant Ownership, Managers, Developers, Technical Administrators, Commerce Operators, and Fulfillment Partners

**Implementation Status:** External merchandise experience established; native commerce architecture not selected

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Commerce Vision](#commerce-vision)
3. [Current Website Architecture](#current-website-architecture)
4. [Existing Merchandise Experience](#existing-merchandise-experience)
5. [Architecture Objectives](#architecture-objectives)
6. [System Boundaries](#system-boundaries)
7. [Commerce Platform Options](#commerce-platform-options)
8. [Proposed System Architecture](#proposed-system-architecture)
9. [Guest Shopping Journey](#guest-shopping-journey)
10. [Product Data Architecture](#product-data-architecture)
11. [Product Variants and Pricing](#product-variants-and-pricing)
12. [Product Media Architecture](#product-media-architecture)
13. [Inventory Authority](#inventory-authority)
14. [Shopping Cart Architecture](#shopping-cart-architecture)
15. [Checkout Architecture](#checkout-architecture)
16. [Payment Processing Boundaries](#payment-processing-boundaries)
17. [Merchandise Order Lifecycle](#merchandise-order-lifecycle)
18. [Shipping and Fulfillment Architecture](#shipping-and-fulfillment-architecture)
19. [Returns and Refunds](#returns-and-refunds)
20. [Guest Identity and Authentication](#guest-identity-and-authentication)
21. [Manager Administration](#manager-administration)
22. [Supabase Data Planning](#supabase-data-planning)
23. [External Integrations and Webhooks](#external-integrations-and-webhooks)
24. [Security and Privacy](#security-and-privacy)
25. [Mobile Experience and Accessibility](#mobile-experience-and-accessibility)
26. [Performance and Reliability](#performance-and-reliability)
27. [Monitoring and Reporting](#monitoring-and-reporting)
28. [Operational Responsibilities](#operational-responsibilities)
29. [Financial and Platform Considerations](#financial-and-platform-considerations)
30. [Architecture Decisions](#architecture-decisions)
31. [Implementation Phases](#implementation-phases)
32. [Testing and Acceptance Criteria](#testing-and-acceptance-criteria)
33. [Implementation Status](#implementation-status)
34. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed architecture for merchandise commerce on the Fin & Feathers Las Vegas website.

The existing website includes a merchandise presentation component that directs guests toward an external merchandise shopping experience.

A future phase may introduce a more integrated storefront with product browsing, variant selection, inventory management, cart functionality, secure checkout, and order fulfillment.

The architecture must be evaluated before implementation.

The purpose is to establish:

- System responsibilities.
- Data ownership.
- Guest-facing workflows.
- Administrative workflows.
- Payment boundaries.
- Inventory and fulfillment responsibilities.
- Integration requirements.
- Security expectations.
- Operational dependencies.
- Implementation decision criteria.

This document does not establish that a native merchandise commerce system already exists.

It also does not select a commerce platform or payment processor.

## Commerce Vision

The long-term objective is to create a branded shopping experience that extends the Fin & Feathers identity beyond the restaurant.

### Integrated Presentation

Merchandise should appear naturally within the existing website design.

### Mobile-First Experience

Guests should be able to browse, select, and purchase products comfortably from mobile devices.

### Clear Product Information

Each product should communicate its description, available variants, price, and fulfillment expectations.

### Reliable Inventory

Guests should not be encouraged to purchase unavailable products.

### Secure Checkout

Payment should occur through an approved provider.

### Manageable Administration

Authorized staff should be able to maintain merchandise information.

### Fulfillment Visibility

The restaurant or its fulfillment partner should understand which orders require action.

### Sustainable Operations

The commerce architecture must be maintainable within the restaurant's staffing and budget.

### Strategic Principle

Commerce complexity should increase only when business requirements justify it.

## Current Website Architecture

### Framework

    Next.js App Router

### Language

    TypeScript

### Hosting

    Vercel

### Database

    Supabase PostgreSQL

### Authentication

    Supabase Auth

### Media Storage

    Supabase Storage

### Source Control

    GitHub

### Repository

    tre1techniqai/finandfeatherslv

### Existing Administration

    /admin/login
    /admin
    /admin/menu

### Authorization Pattern

The application uses a protected manager authorization pattern through `requireManager()`.

### Architectural Consideration

Existing infrastructure may support some future commerce features.

However, reuse must be evaluated against the selected commerce platform's capabilities and responsibilities.

## Existing Merchandise Experience

### Current Presentation

The website includes a merchandise image or thumbnail.

### Existing Interaction

The merchandise component opens an external merchandise experience through a modal-based presentation.

### Current Architecture

The existing arrangement is primarily a storefront handoff rather than a confirmed native commerce implementation.

### Existing Provider

The specific external provider and its current operational capabilities should be verified from the actual component and business account.

### Existing Checkout

Do not assume the website directly processes merchandise payments.

### Existing Inventory

The authoritative inventory system has not been established in this documentation.

### Existing Fulfillment

Current shipping and fulfillment responsibilities require verification.

### Preservation Requirement

Do not remove the existing merchandise experience until an approved replacement has passed testing.

### Discovery Task

Inspect the current merchandise component, destination URL, provider terms, and operational workflow.

## Architecture Objectives

### Maintain Brand Consistency

Preserve the existing Fin & Feathers visual direction.

### Minimize Guest Friction

Reduce unnecessary navigation where practical.

### Protect Financial Transactions

Keep sensitive payment information within approved systems.

### Establish Data Authority

Avoid conflicting product, inventory, and order records.

### Support Product Variants

Allow appropriate size, color, or style selections.

### Prevent Overselling

Validate inventory before accepting orders.

### Enable Operational Visibility

Provide authorized staff with useful order and fulfillment information.

### Preserve Existing Features

Do not disrupt restaurant ordering, reservations, menu administration, or other website functionality.

### Support Growth

Allow additional merchandise without requiring a complete redesign.

### Control Cost

Prefer solutions whose benefits justify their recurring and implementation expenses.

## System Boundaries

The architecture should define clear boundaries between systems.

### Public Website

Responsible for guest-facing presentation and approved interactions.

### Commerce Backend

Responsible for the operations assigned by the selected architecture.

### Payment Provider

Responsible for authorized payment processing.

### Inventory System

Responsible for authoritative stock information.

### Fulfillment System

Responsible for shipment or pickup operations.

### Supabase

May provide approved application data storage and authentication.

### Manager Interface

Provides authorized administration where required.

### External Merchandise Platform

May remain the authoritative commerce system.

### Toast POS

Continues to serve the restaurant ordering workflow.

### Critical Separation

Restaurant food ordering and merchandise commerce must not be assumed to share a cart, payment session, or order lifecycle.

## Commerce Platform Options

Several architecture models remain available for evaluation.

### Option A — Existing External Storefront

Retain the current merchandise destination.

**Potential advantages:**

- Minimal custom development.
- Existing operational workflow.
- Reduced website checkout responsibility.

**Potential limitations:**

- Less integrated guest experience.
- External platform branding or navigation.
- Possible limitations in website administration.

### Option B — Hosted Commerce Platform

Use a managed provider for products, checkout, and order processing.

### Option C — Headless Commerce

Use a commerce backend with a custom Next.js storefront.

### Option D — Custom Commerce

Build approved catalog, cart, inventory, and order functionality using existing infrastructure.

### Option E — Hybrid Commerce

Use native website product browsing with provider-controlled checkout.

### Evaluation Rule

Each option must be compared using verified capabilities, costs, security obligations, and operational requirements.

## Proposed System Architecture

The final architecture depends on platform selection.

### Conceptual Hybrid Model

    Guest Browser
          |
          v
    Fin & Feathers Website
          |
          v
    Product Browsing and Selection
          |
          v
    Approved Commerce Backend
          |
          +----------------------+
          |                      |
          v                      v
    Inventory Authority     Payment Provider
          |                      |
          +-----------+----------+
                      |
                      v
             Merchandise Order
                      |
                      v
              Fulfillment Workflow

### Website Responsibility

Present products and support approved shopping interactions.

### Backend Responsibility

Validate product identity, availability, and order operations.

### Payment Responsibility

Process payments through an authorized provider.

### Fulfillment Responsibility

Prepare and deliver merchandise according to the approved operating model.

### Architecture Qualification

This diagram is conceptual and does not represent deployed infrastructure.

## Guest Shopping Journey

### Stage 1 — Discovery

Guest opens the merchandise section.

### Stage 2 — Browsing

Guest reviews available products.

### Stage 3 — Product Detail

Guest views product images, descriptions, and prices.

### Stage 4 — Variant Selection

Guest chooses supported options.

### Stage 5 — Cart

Guest adds products to a merchandise-specific cart.

### Stage 6 — Review

Guest verifies quantities, prices, and applicable charges.

### Stage 7 — Checkout

Guest enters required fulfillment details and completes an approved payment flow.

### Stage 8 — Confirmation

Guest receives a verified merchandise order result.

### Stage 9 — Fulfillment

The order enters the appropriate shipping or pickup workflow.

### Stage 10 — Support

Guest receives access to relevant order and return information.

### Important Rule

A browser redirect or payment attempt alone must not be treated as confirmed order completion.

## Product Data Architecture

Product data should be structured consistently.

### Product Identifier

A stable identifier distinguishes each product.

### Product Name

Use an approved customer-facing name.

### Description

Explain relevant merchandise characteristics.

### Product Category

Use an approved merchandise-specific taxonomy.

### Status

Distinguish draft, published, and unavailable products.

### Base Price

Store or retrieve the authoritative selling price.

### Variants

Associate purchasable configurations where required.

### Images

Reference approved media.

### Fulfillment Attributes

Record necessary shipping information where appropriate.

### Data Authority

Define which system owns each field.

### Schema Qualification

No specific product table or database fields are asserted as currently implemented.

## Product Variants and Pricing

Merchandise products may have multiple purchasable configurations.

### Apparel Sizes

A product may offer size selections.

### Colors

A product may offer color selections.

### Styles

Different styles may require separate identifiers.

### Variant Identity

Each purchasable configuration should be uniquely identifiable.

### Variant Price

Some variants may have different approved prices.

### Variant Inventory

Stock may be tracked independently.

### Invalid Combinations

Prevent selection of unavailable configurations.

### Cart Representation

Preserve the exact selected variant.

### Price Validation

Recalculate authoritative amounts before checkout.

### Manager Review

Confirm the available variants and pricing rules.

## Product Media Architecture

Product media must support a polished storefront.

### Primary Image

Each published product should have an appropriate primary image.

### Gallery Images

Additional images may show alternate views or product details.

### Image Quality

Use clear, approved merchandise photography.

### Optimization

Use appropriately sized and compressed assets.

### Responsive Delivery

Serve suitable image sizes across devices.

### Accessibility

Provide meaningful alternative text.

### Storage Options

Evaluate Supabase Storage or the selected commerce platform's media service.

### Upload Security

Restrict uploads and validate file types.

### Media Ownership

Confirm rights to use product imagery.

### Existing Rule Separation

The restaurant menu's food image rules do not automatically define merchandise image requirements.

## Inventory Authority

Inventory must have one clearly identified authoritative system.

### Option A — Commerce Platform

The external commerce provider manages stock.

### Option B — Supabase

An approved custom inventory model manages stock.

### Option C — Fulfillment Partner

A third-party fulfillment service maintains inventory.

### Variant-Level Stock

Track available quantities where necessary.

### Inventory Reservation

Determine whether stock is reserved during checkout.

### Failed Checkout

Define how inventory is released.

### Order Cancellation

Define how stock is restored.

### Manual Adjustments

Restrict stock modifications to authorized personnel.

### Reconciliation

Compare recorded stock with physical or provider-managed inventory.

### Critical Rule

Do not maintain competing inventory authorities without a documented synchronization model.

## Shopping Cart Architecture

The merchandise cart is independent of restaurant food ordering.

### Cart Identity

Associate selections with an appropriate guest session or account.

### Line Items

Preserve product and variant identifiers.

### Quantity

Validate supported purchase quantities.

### Price

Use authoritative current pricing.

### Inventory

Recheck availability before checkout.

### Cart Updates

Support adding, editing, and removing products.

### Persistence

Evaluate session-based or persistent carts.

### Expiration

Define how long abandoned carts remain valid.

### Security

Treat browser cart contents as untrusted.

### Recovery

Handle unavailable products and changed prices clearly.

## Checkout Architecture

Checkout design depends on the selected commerce provider.

### Hosted Checkout

The guest completes checkout in a provider-controlled environment.

### Embedded Checkout

Use only officially supported embedded checkout methods.

### Native Checkout Interface

May be feasible with an approved commerce and payment integration.

### Customer Information

Collect only necessary contact and fulfillment details.

### Shipping Address

Validate required address information.

### Shipping Rates

Use approved calculation rules.

### Taxes

Use an appropriate authoritative tax calculation process.

### Discounts

Apply only valid promotions.

### Order Review

Display the final payable amount before payment.

### Confirmation

Verify the authoritative checkout outcome.

## Payment Processing Boundaries

### Provider Selection

Select an authorized payment provider compatible with the chosen architecture.

### Cardholder Data

Avoid collecting raw card numbers directly through the custom website.

### Hosted Payment

Provider-controlled checkout may reduce direct card-data exposure.

### Payment Tokens

Use provider-approved tokens only where supported.

### Authorization

Distinguish authorization from final capture.

### Capture

Use the provider's supported payment lifecycle.

### Duplicate Prevention

Prevent repeated charges during retries.

### Unknown Outcomes

Verify payment status before retrying.

### Refunds

Use authorized provider procedures.

### PCI DSS

Determine applicable compliance responsibilities through an appropriate assessment.

### Toast Separation

Merchandise payment processing must not be assumed to use the restaurant's Toast payment configuration.

## Merchandise Order Lifecycle

A conceptual merchandise order lifecycle may include the following states.

### Draft

A potential order has not yet been finalized.

### Checkout Pending

The guest is completing checkout.

### Payment Pending

Payment outcome remains unresolved.

### Paid

The authorized provider confirms the required payment state.

### Processing

The order is being prepared.

### Fulfilled

The merchandise has been handed off or otherwise fulfilled according to the approved model.

### Shipped

A shipping provider has accepted the shipment, where applicable.

### Delivered

Delivery has been confirmed where supported.

### Canceled

The order has been canceled through an approved process.

### Refunded

An applicable refund has been completed.

### Qualification

These are conceptual states, not an implemented database enum or verified commerce-provider status model.

## Shipping and Fulfillment Architecture

### Fulfillment Ownership

Determine whether restaurant staff or a third party prepares orders.

### Inventory Location

Identify where merchandise is stored.

### Packaging

Define appropriate packaging materials.

### Shipping Provider

Select supported shipping services.

### Shipping Regions

Define permitted destinations.

### Rate Calculation

Use an approved rate model.

### Labels

Determine how shipping labels are generated.

### Tracking

Store or retrieve appropriate shipment references.

### Delivery Exceptions

Define procedures for missing or delayed packages.

### Local Pickup

Offer only if restaurant operations approve and support it.

### Operational Handoff

Ensure each paid order reaches the responsible fulfillment party.

## Returns and Refunds

### Policy Ownership

Restaurant management approves the merchandise return policy.

### Eligibility

Define which products may be returned.

### Return Period

Specify the approved timeframe.

### Product Condition

Explain return-condition requirements.

### Exchanges

Determine whether exchanges are supported.

### Shipping Costs

Clarify responsibility for return shipping.

### Refund Authorization

Restrict refunds to authorized personnel or provider workflows.

### Payment Reference

Associate refunds with the correct transaction.

### Inventory Adjustment

Define how returned items affect available stock.

### Guest Communication

Provide accurate return and refund status.

### Policy Publication

Publish the approved policy before accepting native merchandise orders.

## Guest Identity and Authentication

### Guest Checkout

Evaluate whether customers can purchase without creating accounts.

### Account-Based Checkout

Consider only if persistent accounts provide meaningful benefits.

### Existing Authentication

Supabase Auth is already used by the website.

### Account Reuse

Do not assume manager authentication should be reused for customer commerce accounts.

### FAM CLUB

Future loyalty membership should not automatically be required for merchandise purchasing.

### Contact Information

Collect necessary customer information.

### Order Access

Protect order details from unauthorized access.

### Session Management

Use secure session handling.

### Privacy

Limit unnecessary identity information.

### Decision

Choose the identity model after evaluating platform and business requirements.

## Manager Administration

Future merchandise management may be integrated into the existing admin dashboard.

### Product Creation

Allow authorized staff to add products.

### Product Editing

Maintain descriptions, prices, and images.

### Publication

Control product visibility.

### Variant Management

Maintain available options.

### Inventory

Provide stock management where appropriate.

### Orders

Display authorized order information.

### Fulfillment

Support relevant operational updates.

### Refunds

Restrict financial actions appropriately.

### Role Authorization

Use server-side permission checks.

### Implementation Boundary

No native merchandise administration capability is assumed to exist solely because the website already has a menu editor.

## Supabase Data Planning

Supabase may support a custom or hybrid commerce architecture.

### Potential Product Data

Product information and publication state.

### Potential Variant Data

Purchasable configurations.

### Potential Inventory Data

Stock and availability.

### Potential Cart Data

Guest selections.

### Potential Order Data

Merchandise transactions and fulfillment references.

### Potential Audit Data

Important administrative changes.

### External Provider Authority

Avoid unnecessary duplication when a commerce platform owns these records.

### RLS

Apply appropriate Row Level Security policies.

### Privileged Operations

Perform authorized server-side actions.

### Migration Planning

Review proposed database changes before implementation.

### Schema Boundary

These are planning concepts, not verified existing database structures.

## External Integrations and Webhooks

External integrations depend on the selected platform.

### Payment Events

May provide payment status updates.

### Order Events

May report order creation or changes.

### Inventory Events

May indicate stock adjustments.

### Shipping Events

May provide tracking updates.

### Webhook Availability

Confirm supported events with the selected provider.

### Authenticity

Verify incoming events using official provider mechanisms.

### Replay Protection

Handle duplicate deliveries safely.

### Event Ordering

Do not assume events arrive in sequence.

### Recovery

Provide reconciliation when notifications fail.

### Logging

Retain only appropriate non-sensitive diagnostic information.

## Security and Privacy

### Protected Credentials

Store provider secrets in server-side configuration.

### Local Development

Keep `.env.local` outside Git.

### Administrative Authorization

Protect merchandise management functions.

### Guest Data

Collect only necessary personal information.

### Payment Information

Keep cardholder data within the approved payment boundary.

### Database Access

Review applicable Supabase RLS policies.

### Webhooks

Authenticate external events.

### Input Validation

Validate all guest and manager inputs.

### Logging

Redact secrets and sensitive information.

### Incident Response

Document containment and recovery procedures.

### Compliance

Determine applicable legal, privacy, and payment obligations before launch.

## Mobile Experience and Accessibility

### Mobile-First Layout

Prioritize smaller screens.

### Product Discovery

Make merchandise easy to find.

### Product Images

Use responsive media.

### Variant Selection

Provide clear, accessible controls.

### Cart Review

Make quantities and totals understandable.

### Checkout

Minimize unnecessary steps.

### Forms

Provide descriptive labels and validation messages.

### Keyboard Support

Support keyboard navigation.

### Screen Readers

Provide appropriate semantic information.

### Loading States

Clearly communicate processing status.

### Confirmation

Avoid ambiguous payment or order results.

## Performance and Reliability

### Image Optimization

Deliver appropriately sized product images.

### Catalog Loading

Avoid unnecessary requests.

### Caching

Cache only data that can safely tolerate the chosen freshness interval.

### Inventory Freshness

Revalidate stock before purchase.

### Pricing Freshness

Confirm authoritative prices at checkout.

### Timeouts

Use bounded external requests.

### Retry Safety

Avoid duplicate orders or payments.

### Provider Outages

Display accurate unavailable states.

### Monitoring

Detect sustained failures.

### Fallback

Preserve the external merchandise experience until a replacement is verified.

## Monitoring and Reporting

### Catalog Health

Identify unpublished or invalid product records.

### Inventory Exceptions

Detect discrepancies and overselling risks.

### Cart Activity

Measure shopping behavior where appropriate.

### Checkout Failures

Track error categories.

### Payment Exceptions

Identify uncertain or failed transactions.

### Order Fulfillment

Monitor orders requiring action.

### Shipping Delays

Track unresolved shipments.

### Refunds

Review approved refund activity.

### Security Events

Monitor unauthorized operations.

### Financial Reporting

Measure revenue, costs, and contribution margin.

### Privacy

Collect analytics in accordance with approved privacy requirements.

## Operational Responsibilities

| Function | Proposed Owner |
|---|---|
| Merchandise assortment | Restaurant ownership |
| Product descriptions and prices | Authorized merchandise manager |
| Product photography | Approved content personnel |
| Inventory accuracy | Designated inventory authority |
| Platform administration | Authorized technical administrator |
| Payment processing | Selected authorized provider |
| Order preparation | Approved fulfillment team |
| Shipping | Approved fulfillment or shipping provider |
| Refund approval | Authorized restaurant personnel |
| Technical support | Assigned development or operations team |
| Financial reconciliation | Restaurant finance personnel |

### Qualification

Final responsibilities must be confirmed after platform selection.

### Staff Training

Document the approved workflow for each responsible role.

## Financial and Platform Considerations

### Initial Investment

Include discovery, design, development, testing, and launch.

### Platform Subscription

Obtain written current pricing.

### Payment Fees

Review applicable merchant terms.

### Inventory Costs

Account for merchandise acquisition and storage.

### Shipping Costs

Include packaging, labels, and carrier charges.

### Refunds

Consider return-related expenses.

### Maintenance

Estimate ongoing technical work.

### Support

Account for customer service and fulfillment administration.

### Profitability

Measure contribution margin rather than gross revenue alone.

### Decision

Compare total cost of ownership across feasible architectures.

## Architecture Decisions

Before development, record the following decisions.

### Decision 1 — Storefront Model

External, hosted, headless, custom, or hybrid?

### Decision 2 — Product Authority

Which system owns the product catalog?

### Decision 3 — Inventory Authority

Which system controls available stock?

### Decision 4 — Cart Storage

Where are merchandise cart selections maintained?

### Decision 5 — Checkout Provider

Which authorized service handles checkout?

### Decision 6 — Payment Processing

Who is responsible for authorization, capture, and refunds?

### Decision 7 — Order Records

Where are authoritative orders stored?

### Decision 8 — Fulfillment

Who prepares and ships products?

### Decision 9 — Customer Accounts

Is guest checkout sufficient?

### Decision 10 — Manager Administration

Which functions belong in the existing admin interface?

### Decision Record

Document the selected approach, evidence, alternatives, cost, security impact, and approving party.

## Implementation Phases

### Phase 0 — Current-State Discovery

Inspect the existing merchandise component and business workflow.

### Phase 1 — Requirements

Confirm products, variants, inventory, and fulfillment expectations.

### Phase 2 — Platform Evaluation

Compare supported commerce options.

### Phase 3 — Architecture Approval

Select data authority, checkout, and operational responsibilities.

### Phase 4 — Catalog Foundation

Implement or configure product data.

### Phase 5 — Inventory

Establish authoritative stock controls.

### Phase 6 — Storefront

Build approved product browsing.

### Phase 7 — Cart

Implement the required merchandise cart.

### Phase 8 — Checkout

Connect the authorized payment workflow.

### Phase 9 — Fulfillment

Implement order handling and shipping processes.

### Phase 10 — Security and Testing

Validate the complete commerce lifecycle.

### Phase 11 — Staff Acceptance

Confirm operational readiness.

### Phase 12 — Production Launch

Release through an approved reversible deployment.

### Phase 13 — Optimization

Review actual performance and costs.

## Testing and Acceptance Criteria

### Product Catalog

- [ ] Product identity is consistent.
- [ ] Published products display correctly.
- [ ] Product images are approved.
- [ ] Variants and prices are accurate.

### Inventory

- [ ] Stock authority is established.
- [ ] Unavailable products cannot be purchased.
- [ ] Inventory changes are validated.
- [ ] Overselling scenarios are addressed.

### Cart

- [ ] Product and variant selections persist correctly.
- [ ] Quantities can be edited.
- [ ] Prices are revalidated.
- [ ] Restaurant food orders remain separate.

### Checkout

- [ ] Supported payment methods work.
- [ ] Declines are handled.
- [ ] Duplicate charges are prevented.
- [ ] Unknown payment outcomes are reconciled.

### Orders and Fulfillment

- [ ] Verified orders reach the responsible operator.
- [ ] Shipping information is accurate.
- [ ] Fulfillment status can be tracked.
- [ ] Refund procedures are tested.

### Security and Operations

- [ ] Administrative permissions are verified.
- [ ] Payment-data boundaries are approved.
- [ ] Staff training is complete.
- [ ] Rollback procedures are tested.
- [ ] Restaurant ownership approves launch.

## Implementation Status

| Component | Status |
|---|---|
| Existing merchandise presentation | Established |
| External storefront handoff | Existing workflow; requires review |
| Native merchandise architecture | Planning |
| Commerce platform selection | Pending |
| Native product catalog | Proposed |
| Product variants | Proposed |
| Product media management | Proposed |
| Inventory authority | Pending |
| Native merchandise cart | Proposed |
| Native merchandise checkout | Not implemented |
| Payment provider selection | Pending |
| Native merchandise order management | Proposed |
| Shipping integration | Unconfirmed |
| Fulfillment operating model | Pending |
| Returns and refunds policy | Pending approval |
| Guest account model | Pending |
| Merchandise manager interface | Proposed |
| Supabase commerce schema | Not established |
| Commerce webhooks | Unconfirmed |
| Security review | Pending |
| Cost analysis | Pending |
| End-to-end testing | Not started |
| Production native commerce | Not implemented |

### Overall Assessment

The existing external merchandise experience remains the baseline.

A native or hybrid commerce system should proceed only after platform feasibility, financial justification, security review, and restaurant operational approval.

## Related Documentation

### Merchandise Commerce

- [Merchandise Commerce Overview](README.md)
- [Product Catalog](product-catalog.md)
- [Inventory Management](inventory-management.md)
- [Cart and Checkout](cart-and-checkout.md)
- [Payment Processing](payment-processing.md)
- [Shipping and Fulfillment](shipping-and-fulfillment.md)
- [Platform Evaluation](platform-evaluation.md)
- [Cost Analysis](cost-analysis.md)
- [Implementation Roadmap](implementation-roadmap.md)

### Existing Website

- [Website Overview](../02-website/README.md)
- [Merchandise Overview](../02-website/merch/README.md)
- [Storefront Overview](../02-website/merch/storefront-overview.md)
- [Product Display](../02-website/merch/product-display.md)
- [Shopping Cart Planning](../02-website/merch/shopping-cart.md)

### Administration

- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Merchandise Administration](../04-admin-dashboard/merch-management.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Supabase Authentication](../05-authentication/supabase-auth.md)

### Database and Deployment

- [Database Overview](../06-database/README.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Database Storage](../06-database/storage.md)
- [Vercel Deployment](../07-deployment/vercel-deployment.md)
- [Rollback Procedures](../07-deployment/rollback-procedures.md)

### Separate Restaurant Ordering

- [Toast POS Integration Overview](../10-toast-pos-integration/README.md)
- [Toast Cart and Checkout](../10-toast-pos-integration/cart-and-checkout.md)
- [Toast Payment Processing](../10-toast-pos-integration/payment-processing.md)

### Master Index

- [Master Documentation Index](../README.md)

---

[Back to Merchandise Commerce Overview](README.md)
