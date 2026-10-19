# MERCHANDISE COMMERCE — Cart and Checkout

**Project:** Fin & Feathers Las Vegas

**Website:** https://finandfeatherslv.live

**Documentation Status:** Architecture and Guest Experience Planning

**Audience:** Restaurant Ownership, Merchandise Managers, Developers, Commerce Operators, Technical Administrators, and Payment Partners

**Implementation Status:** Native merchandise cart and checkout proposed; platform and payment provider not selected

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Cart and Checkout Objectives](#cart-and-checkout-objectives)
3. [Current Merchandise Ordering Baseline](#current-merchandise-ordering-baseline)
4. [Scope and System Boundaries](#scope-and-system-boundaries)
5. [Commerce Architecture Options](#commerce-architecture-options)
6. [Proposed Guest Shopping Journey](#proposed-guest-shopping-journey)
7. [Product Selection and Variant Validation](#product-selection-and-variant-validation)
8. [Cart Data Model](#cart-data-model)
9. [Cart Creation and Identity](#cart-creation-and-identity)
10. [Adding Items to Cart](#adding-items-to-cart)
11. [Updating Quantities and Removing Items](#updating-quantities-and-removing-items)
12. [Cart Persistence and Expiration](#cart-persistence-and-expiration)
13. [Cart Pricing and Totals](#cart-pricing-and-totals)
14. [Inventory Validation and Reservations](#inventory-validation-and-reservations)
15. [Shipping Options and Address Collection](#shipping-options-and-address-collection)
16. [Taxes, Discounts, and Additional Charges](#taxes-discounts-and-additional-charges)
17. [Guest Checkout and Customer Identity](#guest-checkout-and-customer-identity)
18. [Checkout Session Architecture](#checkout-session-architecture)
19. [Payment Provider Handoff](#payment-provider-handoff)
20. [Payment and Order State Coordination](#payment-and-order-state-coordination)
21. [Order Confirmation](#order-confirmation)
22. [Checkout Errors and Recovery](#checkout-errors-and-recovery)
23. [Duplicate Orders and Idempotency](#duplicate-orders-and-idempotency)
24. [Abandoned Carts and Recovery](#abandoned-carts-and-recovery)
25. [Returns, Cancellations, and Refunds](#returns-cancellations-and-refunds)
26. [Mobile Experience and Accessibility](#mobile-experience-and-accessibility)
27. [Security and Privacy](#security-and-privacy)
28. [Supabase and Infrastructure Planning](#supabase-and-infrastructure-planning)
29. [External Integrations and Webhooks](#external-integrations-and-webhooks)
30. [Monitoring and Analytics](#monitoring-and-analytics)
31. [Manager and Fulfillment Workflows](#manager-and-fulfillment-workflows)
32. [Testing and Quality Assurance](#testing-and-quality-assurance)
33. [Implementation Roadmap](#implementation-roadmap)
34. [Acceptance Criteria](#acceptance-criteria)
35. [Implementation Status](#implementation-status)
36. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed shopping cart and checkout architecture for future merchandise commerce on the Fin & Feathers Las Vegas website.

The cart allows guests to select merchandise, review purchases, and proceed to an approved payment workflow.

Checkout coordinates product availability, authoritative pricing, shipping information, applicable taxes, payment processing, and merchandise order creation.

The proposed experience may include:

- Product and variant selection.
- A dedicated merchandise cart.
- Quantity adjustments.
- Cart persistence.
- Inventory validation.
- Shipping destination collection.
- Shipping method selection.
- Authoritative tax and price calculations.
- Guest checkout.
- Secure payment handoff.
- Verified order confirmation.
- Recovery from failed or interrupted checkout attempts.

The implementation must follow the capabilities of the selected commerce and payment providers.

### Important Boundary

This document describes proposed functionality.

It does not establish that a native merchandise cart, checkout session, payment integration, or merchandise order system currently exists.

---

## Cart and Checkout Objectives

### Simple Guest Experience

Make it easy to purchase merchandise.

### Mobile-First Design

Support shopping and checkout on phones.

### Accurate Product Selection

Preserve the exact selected merchandise configuration.

### Reliable Pricing

Use authoritative prices and validated totals.

### Inventory Protection

Prevent unsupported purchases of unavailable products.

### Secure Payment

Keep sensitive payment information within an approved provider boundary.

### Clear Fulfillment

Communicate shipping or pickup requirements accurately.

### Verified Confirmation

Do not confirm orders before authoritative verification.

### Reliable Recovery

Handle failed, interrupted, and repeated checkout attempts safely.

### Operational Maintainability

Avoid unnecessary custom payment and order-processing responsibilities.

---

## Current Merchandise Ordering Baseline

### Website

    https://finandfeatherslv.live

### Existing Merchandise Presentation

The website includes a merchandise thumbnail or promotional image.

### Existing Interaction

The merchandise component presents an external merchandise storefront through a modal-based experience.

### Current Checkout Provider

The provider and its exact checkout capabilities require verification.

### Native Cart

A native merchandise shopping cart has not been established as implemented.

### Native Checkout

A native merchandise checkout workflow has not been established as implemented.

### Native Orders

No merchandise order-management database schema has been established as implemented.

### Current Fulfillment

The existing merchandise fulfillment process requires discovery.

### Preservation Requirement

Keep the existing external merchandise experience available until an approved replacement has passed testing.

---

## Scope and System Boundaries

### Merchandise Cart

Contains merchandise products and variants only.

### Restaurant Food Ordering

Remains a separate Toast ordering workflow.

### Payment Provider

Handles payment according to the selected architecture.

### Inventory Authority

Determines which merchandise is available.

### Order Authority

Maintains authoritative merchandise order records.

### Fulfillment Provider

Prepares and delivers purchased merchandise.

### Supabase

May support approved cart, customer, or order data.

### Manager Dashboard

May support authorized merchandise administration.

### Critical Separation

Do not combine restaurant food ordering and merchandise purchasing without a separately approved architecture.

### Service Policy

Do not automatically apply restaurant dining service charges to merchandise orders.

---

## Commerce Architecture Options

### Option A — Existing External Checkout

Continue directing guests to the current merchandise storefront.

### Option B — Hosted Commerce Checkout

Use a managed commerce provider for cart and checkout.

### Option C — Native Cart with Hosted Checkout

Build a website cart that creates an approved provider checkout session.

### Option D — Headless Commerce

Use a commerce backend with a custom Next.js frontend.

### Option E — Custom Commerce Backend

Implement approved cart and order functionality using existing infrastructure.

### Evaluation Criteria

- Guest experience.
- Platform eligibility.
- Cart transfer capabilities.
- Payment security.
- Inventory compatibility.
- Shipping features.
- Development cost.
- Recurring cost.
- Maintenance responsibility.
- Data portability.

### Decision Rule

Choose the architecture before developing a production checkout workflow.

---

## Proposed Guest Shopping Journey

### Step 1 — Open Merchandise

Guest enters the merchandise section.

### Step 2 — Browse Products

Guest reviews available products.

### Step 3 — Select Product

Guest opens a product detail experience.

### Step 4 — Choose Variant

Guest selects size, color, or other required options.

### Step 5 — Add to Cart

The exact configuration is added to the merchandise cart.

### Step 6 — Review Cart

Guest checks quantities and estimated totals.

### Step 7 — Begin Checkout

The system validates selections.

### Step 8 — Enter Fulfillment Information

Guest supplies necessary shipping or approved pickup details.

### Step 9 — Review Final Amount

Guest sees authoritative charges.

### Step 10 — Complete Payment

Guest uses the approved payment interface.

### Step 11 — Verify Order

The system confirms the authoritative transaction result.

### Step 12 — Receive Confirmation

Guest receives appropriate order and fulfillment information.

---

## Product Selection and Variant Validation

### Product Identifier

Every cart item must reference a valid product.

### Variant Identifier

Preserve the exact purchasable configuration.

### Size

Validate selected apparel sizes.

### Color

Validate supported colors.

### Style

Validate other applicable options.

### Required Options

Do not permit incomplete selections.

### Invalid Combinations

Reject unavailable combinations.

### Publication

Prevent purchase of unpublished products.

### Inventory

Check authoritative availability.

### Price

Retrieve the correct variant price.

### Security

Do not rely on browser-submitted product descriptions or prices as authoritative data.

---

## Cart Data Model

A future cart model may include the following conceptual information.

### Cart Identifier

Distinguishes the shopping cart.

### Guest or Session Reference

Associates the cart with an appropriate session or account.

### Line Items

Represent selected merchandise.

### Product Reference

Identifies the parent product.

### Variant Reference

Identifies the purchasable configuration.

### Quantity

Represents the requested number of units.

### Display Snapshot

May preserve appropriate product information for presentation.

### Price Reference

Allows authoritative price validation.

### Cart Status

Distinguishes active, expired, or completed carts.

### Qualification

These are conceptual fields, not confirmed Supabase columns or an implemented schema.

---

## Cart Creation and Identity

### Guest Session

A cart may be associated with a temporary guest session.

### Authenticated Customer

A future account system may support persistent carts.

### Cart Identifier

Use an appropriately generated identifier.

### Ownership

Prevent guests from accessing other customers' carts.

### Session Security

Protect cart session references.

### Anonymous Checkout

Support guest purchasing if approved.

### Multiple Devices

Determine whether cross-device carts are necessary.

### Account Merge

Consider merging carts only if customer accounts are implemented.

### Expiration

Define how inactive carts are handled.

### Platform Authority

Use the selected commerce provider's cart identity model where applicable.

---

## Adding Items to Cart

### Product Validation

Confirm the selected product exists.

### Publication Validation

Confirm the product is purchasable.

### Variant Validation

Confirm the selected configuration is valid.

### Quantity Validation

Reject unsupported quantities.

### Inventory Review

Check availability according to the selected architecture.

### Cart Update

Add the validated selection.

### Duplicate Selection

Define whether identical variants merge into one line.

### Feedback

Clearly confirm the cart update.

### Error Handling

Explain why a selection cannot be added.

### Important Rule

Adding an item to a cart does not automatically guarantee inventory reservation.

---

## Updating Quantities and Removing Items

### Quantity Increase

Validate the requested new quantity.

### Quantity Decrease

Update the selected line item.

### Quantity Limits

Respect approved purchase limits.

### Availability

Recheck stock when quantities increase.

### Remove Item

Allow guests to remove a selection.

### Empty Cart

Display an appropriate empty state.

### Totals

Recalculate displayed amounts.

### Persistence

Save updates through the approved cart authority.

### Concurrency

Handle overlapping cart updates safely.

### Confirmation

Reflect the actual saved cart state.

---

## Cart Persistence and Expiration

### Browser Session

A temporary cart may exist during a browsing session.

### Provider Session

A commerce platform may maintain cart state.

### Database Persistence

A custom system may store cart records.

### Persistence Duration

Set an appropriate expiration policy.

### Guest Privacy

Avoid unnecessary long-term personal data retention.

### Expired Products

Revalidate products when a cart is reopened.

### Price Changes

Update totals using authoritative current prices.

### Stock Changes

Notify guests when quantities become unavailable.

### Completed Checkout

Prevent reuse of a completed cart as a new order without an explicit new checkout.

### Cleanup

Define how expired cart records are handled.

---

## Cart Pricing and Totals

### Item Price

Use the authoritative current product or variant price.

### Quantity

Multiply validated unit price by requested quantity.

### Merchandise Subtotal

Sum validated line-item amounts.

### Discounts

Apply only approved promotions.

### Shipping

Include applicable shipping charges.

### Taxes

Use the approved tax calculation process.

### Final Total

Present the amount that the payment provider will charge.

### Currency

Use a consistent supported currency.

### Monetary Precision

Avoid unsafe floating-point calculations.

### Critical Rule

Browser-displayed totals must never be the sole authority for payment amounts.

---

## Inventory Validation and Reservations

### Cart Stage

Display current availability information.

### Checkout Stage

Revalidate selected quantities.

### Inventory Authority

Use the approved stock system.

### Reservation Model

Determine whether inventory is reserved during checkout.

### Reservation Expiration

Release expired reservations when appropriate.

### Payment Failure

Restore availability according to the approved lifecycle.

### Concurrent Checkout

Prevent multiple guests from purchasing the same unavailable stock.

### Print-on-Demand

Use the provider's actual availability model.

### External Inventory

Do not create competing stock reservations without provider support.

### Critical Rule

The final checkout must not rely solely on a previous browser availability check.

---

## Shipping Options and Address Collection

### Fulfillment Model

Confirm whether merchandise is shipped, picked up, or fulfilled by a third party.

### Shipping Address

Collect only the information required for delivery.

### Address Validation

Use appropriate supported validation.

### Shipping Regions

Restrict checkout to approved destinations.

### Shipping Methods

Present supported options.

### Shipping Rates

Use authoritative calculations.

### Delivery Estimates

Avoid unsupported promises.

### Local Pickup

Offer only if restaurant operations approve it.

### Fulfillment Restrictions

Validate product-specific shipping limitations.

### Privacy

Protect customer address information.

---

## Taxes, Discounts, and Additional Charges

### Sales Tax

Determine applicable tax obligations through an appropriate tax configuration.

### Tax Calculation

Use the approved commerce or tax provider.

### Discounts

Validate promotion eligibility.

### Coupon Codes

Support only if the selected platform and business requirements justify them.

### Shipping Charges

Display applicable shipping fees.

### Handling Charges

Apply only approved and disclosed fees.

### Final Review

Present an understandable breakdown before payment.

### Refund Calculations

Follow the provider's supported tax and fee reversal process.

### Dining Policy Separation

Restaurant dine-in service charge policies do not automatically apply to merchandise.

### Approval

Restaurant ownership must approve the merchandise pricing and fee policies.

---

## Guest Checkout and Customer Identity

### Guest Checkout

Evaluate allowing purchases without account creation.

### Customer Accounts

Consider only if they provide meaningful business value.

### Contact Email

Collect when necessary for confirmation and support.

### Contact Phone

Collect only when operationally justified.

### Shipping Information

Collect the required delivery details.

### Billing Information

Use the approved payment provider's supported collection method.

### Existing Supabase Auth

Reuse only where appropriate.

### FAM CLUB

Do not require future loyalty membership without explicit approval.

### Privacy

Minimize customer information collection.

### Order Access

Prevent unauthorized viewing of customer transactions.

---

## Checkout Session Architecture

A checkout session coordinates the purchase with the selected provider.

### Session Creation

Use an authorized server-side or provider-supported process.

### Cart Validation

Confirm valid products and variants.

### Price Validation

Calculate authoritative amounts.

### Inventory Validation

Confirm supported availability.

### Customer Information

Associate necessary guest details.

### Shipping Configuration

Apply approved fulfillment options.

### Session Expiration

Respect the provider's supported expiration behavior.

### Session Reference

Preserve an appropriate non-sensitive identifier.

### Completion

Verify the actual checkout outcome.

### Qualification

No specific checkout API, session object, or provider endpoint is assumed to exist.

---

## Payment Provider Handoff

### Provider Selection

Choose an authorized payment processor.

### Hosted Checkout

Redirect to a provider-controlled payment interface where supported.

### Embedded Checkout

Use only officially supported embedded components.

### Server Validation

Never allow the browser to determine final payable amounts.

### Secure Transport

Use appropriate HTTPS connections.

### Payment Credentials

Keep privileged credentials server-side.

### Cardholder Data

Avoid direct collection of raw card details.

### Return URL

Provide a supported return experience.

### Cancellation URL

Allow guests to recover from canceled checkout.

### Verification

Do not infer successful payment solely from a redirect.

---

## Payment and Order State Coordination

Payment and merchandise order creation must remain consistent.

### Checkout Initiated

A purchase attempt has begun.

### Payment Pending

The authoritative payment result is unresolved.

### Payment Confirmed

The provider reports the required payment state.

### Order Created

The commerce system records the merchandise order.

### Fulfillment Pending

The order awaits operational processing.

### Payment Failed

The attempt did not complete successfully.

### Unknown Outcome

The system must reconcile an uncertain result.

### Inventory Commitment

Coordinate stock changes with the approved lifecycle.

### Critical Rule

A successful browser redirect is not sufficient evidence of a completed payment or order.

---

## Order Confirmation

### Authoritative Verification

Confirm the order through the selected commerce system.

### Order Reference

Provide an appropriate order identifier.

### Purchased Items

Display the confirmed products and variants.

### Quantities

Show confirmed quantities.

### Amount

Show the authoritative transaction amount.

### Shipping

Provide relevant fulfillment information.

### Customer Communication

Use approved email or other notification mechanisms.

### Duplicate Confirmation

Avoid creating additional orders when guests reload the confirmation page.

### Privacy

Do not expose other customers' order information.

### Support

Provide an appropriate contact or support path.

---

## Checkout Errors and Recovery

### Invalid Product

Explain that the selected item is unavailable.

### Invalid Variant

Request a valid configuration.

### Price Change

Show updated authoritative pricing before payment.

### Stock Change

Allow guests to adjust unavailable quantities.

### Payment Decline

Provide an appropriate retry path.

### Network Timeout

Verify the transaction state before retrying.

### Provider Outage

Display accurate availability information.

### Session Expiration

Allow guests to begin a new valid checkout.

### Unknown Payment

Do not create a second charge without reconciliation.

### Support Escalation

Provide a documented path for unresolved transactions.

---

## Duplicate Orders and Idempotency

### Duplicate Risk

Repeated clicks or network retries may create multiple requests.

### Checkout Attempts

Assign appropriate stable attempt references.

### Provider Support

Use documented idempotency mechanisms where available.

### Server Validation

Prevent repeated processing of completed attempts.

### Payment Events

Handle repeated notifications safely.

### Order Creation

Avoid creating multiple orders for one confirmed transaction.

### Inventory

Avoid duplicate stock deductions.

### Refunds

Prevent repeated refund operations.

### Reconciliation

Investigate uncertain outcomes before retrying.

### Critical Rule

A request timeout does not prove that the provider failed to process the operation.

---

## Abandoned Carts and Recovery

### Definition

An abandoned cart contains selections without a completed purchase.

### Persistence

Determine how long abandoned carts remain available.

### Inventory

Do not reserve stock indefinitely.

### Price Changes

Revalidate prices when checkout resumes.

### Product Changes

Remove or correct unavailable selections.

### Customer Contact

Collect only information necessary for approved communication.

### Recovery Messages

Use only permitted messaging workflows.

### Consent

Respect applicable communication consent requirements.

### Analytics

Measure abandonment without unnecessary personal tracking.

### Scope

Do not introduce marketing automation until approved by the business.

---

## Returns, Cancellations, and Refunds

### Cancellation Policy

Define when orders can be canceled.

### Fulfillment Status

Check whether merchandise has already shipped.

### Payment Status

Verify the authoritative payment outcome.

### Refund Eligibility

Follow the approved merchandise return policy.

### Refund Processing

Use the authorized payment provider.

### Partial Refunds

Support only where approved and technically available.

### Inventory Restoration

Coordinate stock changes with actual returned or canceled merchandise.

### Duplicate Prevention

Avoid repeated refund processing.

### Guest Communication

Provide accurate status information.

### Restaurant Ordering Separation

Merchandise returns must not be treated as Toast restaurant order refunds.

---

## Mobile Experience and Accessibility

### Mobile-First Layout

Prioritize narrow viewports.

### Cart Access

Make the merchandise cart easy to locate.

### Product Details

Display selected variants clearly.

### Quantity Controls

Use accessible interactive elements.

### Price Summary

Keep totals understandable.

### Shipping Forms

Provide appropriate labels and input behavior.

### Checkout Actions

Use clear button descriptions.

### Loading States

Communicate processing activity.

### Error Messages

Explain how to correct problems.

### Keyboard and Screen Readers

Support accessible interaction throughout the purchase flow.

---

## Security and Privacy

### Payment Data Boundary

Keep raw cardholder information within approved provider systems.

### Server-Side Pricing

Validate monetary amounts using authoritative data.

### Cart Authorization

Prevent unauthorized cart access.

### Order Authorization

Protect customer order information.

### Input Validation

Validate product IDs, quantities, addresses, and applicable options.

### Credential Storage

Keep privileged secrets server-side.

### Source Control

Never commit `.env.local`.

### Database Security

Apply appropriate Supabase RLS policies if custom tables are implemented.

### Webhook Security

Verify provider event authenticity.

### Logging

Redact secrets and sensitive customer information.

---

## Supabase and Infrastructure Planning

Supabase may support approved custom cart or order functionality.

### Potential Cart Records

Store cart identity and lifecycle information.

### Potential Cart Items

Store product and variant references.

### Potential Checkout Attempts

Track non-sensitive checkout references.

### Potential Order Records

Store merchandise order information where the website is authoritative.

### Potential Payment References

Store appropriate provider identifiers.

### Potential Fulfillment References

Associate orders with shipping or pickup activity.

### Row Level Security

Restrict access to customer and administrative records.

### Server Functions

Perform privileged operations through authorized backend services.

### Vercel

Use approved deployment and environment configuration.

### Schema Qualification

These are conceptual requirements, not confirmed existing tables or migrations.

---

## External Integrations and Webhooks

### Commerce Provider

May manage checkout sessions and orders.

### Payment Provider

May report payment outcomes.

### Inventory Provider

May report availability changes.

### Fulfillment Provider

May report shipping updates.

### Webhook Availability

Verify supported events with each provider.

### Authenticity

Use official event verification mechanisms.

### Duplicate Delivery

Handle repeated events idempotently.

### Out-of-Order Events

Do not assume notifications arrive in sequence.

### Missed Events

Provide reconciliation procedures.

### Security

Avoid exposing privileged event-processing endpoints without verification.

---

## Monitoring and Analytics

### Cart Creation

Measure relevant shopping activity.

### Add-to-Cart

Track product selection where approved.

### Checkout Initiation

Measure purchase attempts.

### Checkout Completion

Count authoritative completed transactions.

### Checkout Failures

Classify error causes.

### Payment Exceptions

Identify uncertain payment states.

### Inventory Conflicts

Detect unavailable selections.

### Abandoned Carts

Measure incomplete checkout activity.

### Conversion

Evaluate completed purchases relative to appropriate traffic.

### Privacy

Use analytics consistent with approved privacy practices.

---

## Manager and Fulfillment Workflows

### Product Management

Managers maintain approved merchandise information.

### Pricing

Authorized personnel control selling prices.

### Inventory

The designated inventory authority manages stock.

### Order Review

Authorized staff review confirmed merchandise orders.

### Fulfillment

The assigned team prepares orders.

### Shipping

The fulfillment provider handles delivery procedures.

### Cancellations

Follow approved cancellation rules.

### Refunds

Restrict financial actions appropriately.

### Customer Support

Provide a process for unresolved checkout issues.

### Audit

Record material operational changes.

---

## Testing and Quality Assurance

### Cart Functionality

- [ ] Products can be added.
- [ ] Variants remain accurate.
- [ ] Quantities can be changed.
- [ ] Products can be removed.
- [ ] Empty cart behavior is correct.

### Pricing

- [ ] Unit prices are authoritative.
- [ ] Totals are calculated correctly.
- [ ] Discounts follow approved rules.
- [ ] Shipping charges are accurate.
- [ ] Applicable taxes are calculated correctly.

### Inventory

- [ ] Availability is revalidated.
- [ ] Concurrent purchases are handled.
- [ ] Unavailable products are rejected.
- [ ] Failed checkout reservations are released appropriately.

### Checkout

- [ ] Authorized payment tests pass.
- [ ] Declines are handled.
- [ ] Unknown outcomes are reconciled.
- [ ] Duplicate charges are prevented.
- [ ] Confirmation reflects authoritative results.

### Security and Operations

- [ ] Customer order data is protected.
- [ ] Webhook authenticity is verified where applicable.
- [ ] Fulfillment receives confirmed orders.
- [ ] Recovery procedures are tested.
- [ ] Staff acceptance is documented.

---

## Implementation Roadmap

### Phase 0 — Discovery

Inspect the existing merchandise storefront and checkout provider.

### Phase 1 — Requirements

Confirm product, inventory, shipping, and checkout needs.

### Phase 2 — Platform Evaluation

Compare feasible commerce architectures.

### Phase 3 — Architecture Approval

Select cart, payment, order, and inventory authorities.

### Phase 4 — Cart Foundation

Implement or configure approved cart behavior.

### Phase 5 — Product Integration

Connect valid merchandise products and variants.

### Phase 6 — Inventory Validation

Implement supported availability safeguards.

### Phase 7 — Shipping and Tax

Configure approved fulfillment and charge calculations.

### Phase 8 — Payment Handoff

Integrate the authorized checkout provider.

### Phase 9 — Order Confirmation

Verify payment and order outcomes.

### Phase 10 — Failure Recovery

Implement safe retry and reconciliation procedures.

### Phase 11 — Testing

Complete functional, security, and operational acceptance.

### Phase 12 — Launch

Deploy only after ownership approval.

---

## Acceptance Criteria

### Architecture

- [ ] Commerce platform selected.
- [ ] Payment provider approved.
- [ ] Inventory authority documented.
- [ ] Order authority documented.
- [ ] Fulfillment workflow confirmed.

### Cart

- [ ] Product and variant selections are accurate.
- [ ] Quantity changes are validated.
- [ ] Cart persistence behaves as designed.
- [ ] Restaurant ordering remains separate.

### Checkout

- [ ] Prices are authoritative.
- [ ] Availability is revalidated.
- [ ] Shipping and taxes are correct.
- [ ] Payment information is protected.
- [ ] Payment outcomes are verified.

### Reliability

- [ ] Duplicate orders are prevented.
- [ ] Unknown outcomes can be reconciled.
- [ ] Provider failures are handled.
- [ ] Inventory remains consistent.

### Production

- [ ] End-to-end tests pass.
- [ ] Staff procedures are documented.
- [ ] Rollback strategy is approved.
- [ ] Restaurant ownership authorizes launch.

---

## Implementation Status

| Capability | Status |
|---|---|
| Existing external merchandise storefront | Established |
| Current checkout provider | Requires verification |
| Native merchandise cart | Proposed |
| Cart architecture selection | Pending |
| Cart data model | Planning |
| Guest cart sessions | Proposed |
| Product and variant validation | Proposed |
| Quantity editing | Proposed |
| Cart persistence | Proposed |
| Authoritative cart pricing | Proposed |
| Inventory reservations | Conditional |
| Checkout stock validation | Proposed |
| Shipping selection | Proposed |
| Merchandise tax calculation | Pending platform decision |
| Discount support | Optional |
| Guest checkout | Pending business decision |
| Checkout session integration | Proposed |
| Payment provider selection | Pending |
| Native merchandise checkout | Not implemented |
| Verified order confirmation | Proposed |
| Duplicate-order protection | Proposed |
| Payment reconciliation | Proposed |
| Abandoned cart recovery | Optional |
| Merchandise refunds | Proposed |
| Supabase cart and order schema | Not established |
| Commerce webhooks | Unconfirmed |
| Security review | Pending |
| End-to-end checkout testing | Not started |
| Native commerce production launch | Not approved |

### Overall Assessment

The native merchandise cart and checkout remain in the planning stage.

The existing external merchandise experience should remain operational until a supported replacement has been selected, tested, and approved.

The preferred implementation should minimize custom payment-processing responsibilities while maintaining accurate pricing, inventory, and order confirmation.

---

## Related Documentation

### Merchandise Commerce

- [Merchandise Commerce Overview](README.md)
- [Commerce Architecture Overview](commerce-overview.md)
- [Product Catalog](product-catalog.md)
- [Inventory Management](inventory-management.md)
- [Payment Processing](payment-processing.md)
- [Shipping and Fulfillment](shipping-and-fulfillment.md)
- [Platform Evaluation](platform-evaluation.md)
- [Cost Analysis](cost-analysis.md)
- [Implementation Roadmap](implementation-roadmap.md)

### Existing Website Merchandise

- [Merchandise Overview](../02-website/merch/README.md)
- [Storefront Overview](../02-website/merch/storefront-overview.md)
- [Product Display](../02-website/merch/product-display.md)
- [Shopping Cart Planning](../02-website/merch/shopping-cart.md)

### Administration and Database

- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Merchandise Administration](../04-admin-dashboard/merch-management.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Supabase Authentication](../05-authentication/supabase-auth.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Database Storage](../06-database/storage.md)

### Deployment and Operations

- [Project Architecture](../01-project-overview/architecture.md)
- [Technology Stack](../01-project-overview/technology-stack.md)
- [Vercel Deployment](../07-deployment/vercel-deployment.md)
- [Rollback Procedures](../07-deployment/rollback-procedures.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Master Documentation Index](../README.md)

### Separate Restaurant Ordering

- [Toast POS Integration Overview](../10-toast-pos-integration/README.md)
- [Toast Cart and Checkout](../10-toast-pos-integration/cart-and-checkout.md)

---

[Back to Merchandise Commerce Overview](README.md)
