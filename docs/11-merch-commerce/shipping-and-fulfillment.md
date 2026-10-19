# MERCHANDISE COMMERCE — Shipping and Fulfillment

**Project:** Fin & Feathers Las Vegas

**Website:** https://finandfeatherslv.live

**Documentation Status:** Fulfillment Architecture and Operational Planning

**Audience:** Restaurant Ownership, Merchandise Managers, Fulfillment Personnel, Developers, Customer Support, and Technical Administrators

**Implementation Status:** Existing external merchandise fulfillment requires verification; native shipping and fulfillment integration proposed

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Shipping and Fulfillment Objectives](#shipping-and-fulfillment-objectives)
3. [Current Fulfillment Baseline](#current-fulfillment-baseline)
4. [Scope and System Boundaries](#scope-and-system-boundaries)
5. [Fulfillment Architecture Options](#fulfillment-architecture-options)
6. [Fulfillment Ownership and Responsibilities](#fulfillment-ownership-and-responsibilities)
7. [Proposed Fulfillment Architecture](#proposed-fulfillment-architecture)
8. [Merchandise Order Handoff](#merchandise-order-handoff)
9. [Fulfillment Order States](#fulfillment-order-states)
10. [Inventory Allocation](#inventory-allocation)
11. [Picking and Order Preparation](#picking-and-order-preparation)
12. [Packaging and Product Protection](#packaging-and-product-protection)
13. [Shipping Regions and Restrictions](#shipping-regions-and-restrictions)
14. [Shipping Methods and Service Levels](#shipping-methods-and-service-levels)
15. [Shipping Rates and Calculations](#shipping-rates-and-calculations)
16. [Shipping Addresses and Validation](#shipping-addresses-and-validation)
17. [Shipping Labels and Carrier Integration](#shipping-labels-and-carrier-integration)
18. [Shipment Tracking](#shipment-tracking)
19. [Delivery Confirmation](#delivery-confirmation)
20. [Delivery Exceptions](#delivery-exceptions)
21. [Partial Shipments and Split Fulfillment](#partial-shipments-and-split-fulfillment)
22. [Local Pickup](#local-pickup)
23. [Print-on-Demand Fulfillment](#print-on-demand-fulfillment)
24. [Third-Party Fulfillment](#third-party-fulfillment)
25. [Cancellations and Order Changes](#cancellations-and-order-changes)
26. [Returns and Exchanges](#returns-and-exchanges)
27. [Refund and Payment Coordination](#refund-and-payment-coordination)
28. [Guest Communications](#guest-communications)
29. [Manager Fulfillment Administration](#manager-fulfillment-administration)
30. [Supabase and Integration Planning](#supabase-and-integration-planning)
31. [Security and Privacy](#security-and-privacy)
32. [Monitoring and Operational Reporting](#monitoring-and-operational-reporting)
33. [Shipping Costs and Financial Planning](#shipping-costs-and-financial-planning)
34. [Testing and Quality Assurance](#testing-and-quality-assurance)
35. [Implementation Roadmap](#implementation-roadmap)
36. [Acceptance Criteria](#acceptance-criteria)
37. [Implementation Status](#implementation-status)
38. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed shipping and fulfillment architecture for future merchandise commerce on the Fin & Feathers Las Vegas website.

Fulfillment begins when an authoritative merchandise order becomes eligible for processing and continues until the order is delivered, collected, canceled, or otherwise resolved.

The fulfillment workflow may involve restaurant personnel, an external merchandise provider, a warehouse, a print-on-demand partner, or a combination of these parties.

Its responsibilities may include:

- Receiving confirmed merchandise orders.
- Verifying purchased products and variants.
- Allocating available inventory.
- Preparing merchandise for shipment.
- Selecting approved shipping services.
- Calculating or confirming shipping charges.
- Generating shipping labels.
- Recording carrier tracking references.
- Communicating fulfillment progress.
- Resolving shipping exceptions.
- Managing cancellations and returns.
- Coordinating refunds and inventory changes.
- Reporting fulfillment costs and performance.

### Documentation Boundary

This document describes proposed capabilities and operating procedures.

It does not establish that native shipping integrations, fulfillment database tables, shipping labels, or warehouse operations currently exist.

---

## Shipping and Fulfillment Objectives

### Accurate Orders

Ensure the merchandise shipped matches the customer's confirmed purchase.

### Reliable Delivery

Use supported shipping methods and appropriate operational procedures.

### Clear Responsibility

Identify who owns each fulfillment step.

### Accurate Charges

Calculate shipping costs through an approved authority.

### Inventory Consistency

Coordinate fulfillment with the selected inventory system.

### Customer Visibility

Provide appropriate order and shipment status information.

### Operational Efficiency

Reduce manual errors and unnecessary handling.

### Secure Customer Information

Protect addresses and contact details.

### Financial Accountability

Understand shipping, packaging, and return costs.

### Maintainability

Select an operating model appropriate for the business's merchandise volume.

---

## Current Fulfillment Baseline

### Existing Merchandise Experience

The website provides an external merchandise shopping experience.

### Current Fulfillment Provider

The organization responsible for merchandise fulfillment has not been verified.

### Current Shipping Services

Supported shipping carriers and service levels require discovery.

### Current Product Storage

The location of merchandise inventory has not been established in this documentation.

### Current Production Model

It is not confirmed whether merchandise is stocked in advance or produced on demand.

### Current Shipping Policies

Shipping destinations, delivery estimates, and customer policies require verification.

### Current Native Integration

No native website shipping or fulfillment integration has been established as implemented.

### Discovery Actions

Review the external merchandise provider's administration, policies, and actual order-handling workflow.

### Preservation

Do not disrupt the existing merchandise fulfillment process during architecture planning.

---

## Scope and System Boundaries

### Merchandise Fulfillment

Applies to approved merchandise purchases.

### Restaurant Food Orders

Remain separate from merchandise shipping and fulfillment.

### Restaurant Reservations

Do not create merchandise fulfillment obligations.

### Commerce Platform

May own merchandise order and fulfillment records.

### Inventory Authority

Determines which merchandise can be allocated.

### Shipping Provider

Handles physical shipment according to the selected service.

### Fulfillment Operator

Prepares and hands off merchandise.

### Payment Provider

Maintains the authoritative payment and refund lifecycle.

### Supabase

May store approved fulfillment references if required.

### Critical Rule

Do not combine Toast restaurant orders with merchandise shipment records without a separately approved integration architecture.

---

## Fulfillment Architecture Options

### Option A — Existing External Storefront Fulfillment

Retain the current provider's fulfillment process.

**Potential advantages:**

- Minimal additional development.
- Existing operating procedures.
- Reduced website fulfillment responsibilities.

**Considerations:**

- Confirm actual service capabilities.
- Verify order visibility.
- Review shipping and return policies.
- Evaluate current costs.

### Option B — Restaurant-Managed Fulfillment

Restaurant personnel store, prepare, and ship merchandise.

### Option C — Third-Party Logistics

An external warehouse or fulfillment provider handles inventory and shipping.

### Option D — Print-on-Demand

A production partner manufactures and ships merchandise after purchase.

### Option E — Hybrid Fulfillment

Different merchandise products use different approved fulfillment methods.

### Decision

Select the operating model before implementing shipping workflows.

---

## Fulfillment Ownership and Responsibilities

Each fulfillment function requires an accountable owner.

| Function | Proposed Responsibility |
|---|---|
| Merchandise sourcing | Restaurant ownership or approved supplier |
| Inventory storage | Selected inventory or fulfillment operator |
| Order receipt | Commerce or fulfillment system |
| Order validation | Authoritative commerce system |
| Inventory allocation | Inventory authority |
| Picking and packing | Assigned fulfillment operator |
| Shipping label generation | Approved shipping workflow |
| Carrier handoff | Assigned fulfillment operator |
| Tracking updates | Shipping provider or fulfillment platform |
| Customer support | Designated business representative |
| Return inspection | Approved returns operator |
| Refund authorization | Authorized financial personnel |
| Reconciliation | Assigned operations or finance personnel |

### Responsibility Confirmation

Final ownership must be documented after selecting the commerce and fulfillment providers.

### Escalation

Each responsibility should have a designated escalation path.

---

## Proposed Fulfillment Architecture

The following model is conceptual.

    Guest Purchases Merchandise
                 |
                 v
       Approved Checkout
                 |
                 v
       Verified Payment State
                 |
                 v
       Authoritative Order
                 |
                 v
       Fulfillment Eligibility
                 |
                 v
       Inventory Allocation
                 |
                 v
       Fulfillment Operator
                 |
          +------+------+
          |             |
          v             v
       Shipping     Local Pickup
          |             |
          v             v
       Tracking     Collection
          |             |
          +------+------+
                 |
                 v
       Fulfillment Resolution

### Provider Ownership

A hosted platform may manage several steps internally.

### Custom Integration

A custom website may coordinate approved provider operations.

### Qualification

No routes, APIs, webhooks, or services in this diagram are asserted as deployed.

---

## Merchandise Order Handoff

### Authoritative Order

Fulfillment must reference a valid merchandise order.

### Payment Verification

Determine the payment state required before fulfillment.

### Product Information

Preserve purchased product and variant identities.

### Quantities

Transfer confirmed quantities.

### Customer Information

Provide only necessary delivery details.

### Shipping Selection

Preserve the approved service level.

### Fulfillment Reference

Use a stable identifier for the fulfillment operation.

### Duplicate Prevention

Avoid creating multiple fulfillment requests for one logical order.

### Failed Handoff

Record and resolve delivery failures between systems.

### Confirmation

Verify that the responsible fulfillment operator received the order.

---

## Fulfillment Order States

A future fulfillment workflow may use the following conceptual states.

### Awaiting Fulfillment

The order is eligible for processing.

### Allocated

Required stock has been assigned.

### Picking

Merchandise is being collected.

### Packing

Items are being prepared for shipment.

### Ready to Ship

The package is prepared for carrier handoff.

### Shipped

The package has entered the shipping process.

### In Transit

The carrier reports movement.

### Delivered

The carrier reports delivery where supported.

### Exception

An operational problem requires resolution.

### Canceled

Fulfillment has been canceled through an approved process.

### Qualification

These are planning concepts, not an existing database enum or universal provider status model.

---

## Inventory Allocation

### Stock Authority

Use the selected authoritative inventory system.

### Variant Identity

Allocate the exact purchased SKU or variant.

### Quantity

Confirm the required number of units.

### Location

Identify the appropriate stock location.

### Reservation

Honor valid inventory reservations where supported.

### Availability

Prevent unsupported allocations.

### Concurrent Orders

Handle competing requests safely.

### Allocation Failure

Escalate unavailable merchandise.

### Cancellation

Release allocations according to the approved lifecycle.

### Reconciliation

Ensure allocated and consumed quantities remain consistent.

---

## Picking and Order Preparation

### Order Review

Verify the confirmed merchandise order.

### Picking Reference

Provide the appropriate order identifier.

### SKU Verification

Match each item to its purchased configuration.

### Quantity Verification

Confirm the correct number of units.

### Product Condition

Inspect merchandise before packing.

### Missing Items

Identify unavailable or misplaced stock.

### Substitutions

Do not substitute merchandise without an approved customer and business process.

### Completion

Record picking completion where supported.

### Audit

Maintain appropriate operational records.

### Escalation

Report unresolved discrepancies before shipment.

---

## Packaging and Product Protection

### Packaging Standard

Select suitable packaging for each merchandise type.

### Apparel

Use appropriate protection from moisture and handling damage.

### Fragile Merchandise

Provide additional protection when required.

### Package Size

Avoid unnecessary oversized packaging.

### Package Weight

Use accurate shipment weight information.

### Branding

Consider approved Fin & Feathers packaging elements.

### Packing Slip

Include appropriate order information if required.

### Customer Privacy

Avoid exposing unnecessary personal details.

### Sustainability

Evaluate packaging waste and cost.

### Quality Check

Verify the final package before handoff.

---

## Shipping Regions and Restrictions

### Domestic Shipping

Determine approved domestic destinations.

### International Shipping

Enable only after business and provider feasibility review.

### Restricted Destinations

Honor carrier and product restrictions.

### Product Restrictions

Identify merchandise requiring special handling.

### Address Eligibility

Validate supported destinations.

### Shipping Origin

Confirm where packages originate.

### Customs

Evaluate international documentation obligations if applicable.

### Duties and Taxes

Disclose relevant responsibilities when supported.

### Checkout Enforcement

Prevent unsupported destinations from completing checkout.

### Policy Publication

Publish approved shipping coverage information.

---

## Shipping Methods and Service Levels

### Standard Shipping

May provide a lower-cost delivery option.

### Expedited Shipping

Consider only when supported and operationally feasible.

### Carrier Selection

Use approved shipping providers.

### Service Availability

Validate services for the destination and package.

### Delivery Estimates

Use provider-supported estimates.

### Cutoff Times

Document operational processing cutoffs where applicable.

### Holidays

Account for fulfillment and carrier closures.

### Weekend Processing

Confirm actual business operations.

### Customer Selection

Present supported options clearly.

### Service Changes

Handle unavailable shipping services before payment completion.

---

## Shipping Rates and Calculations

### Flat-Rate Shipping

A fixed approved amount may apply.

### Weight-Based Shipping

Charges may depend on package weight.

### Destination-Based Shipping

Rates may vary by shipping region.

### Carrier-Calculated Shipping

A provider may supply live shipping quotes.

### Free Shipping

Offer only under approved business rules.

### Multiple Packages

Account for split shipments where supported.

### Packaging Costs

Determine whether handling costs are included.

### Taxes

Review applicable treatment of shipping charges.

### Checkout Authority

Use authoritative rates when finalizing payment.

### Critical Rule

Do not treat an estimated shipping display as the final charge without validation.

---

## Shipping Addresses and Validation

### Recipient Name

Collect the information required for delivery.

### Address Lines

Support appropriate address formatting.

### City and Region

Collect applicable locality information.

### Postal Code

Validate according to the destination.

### Country

Restrict selection to supported destinations.

### Contact Information

Collect only necessary delivery contact details.

### Address Validation

Use supported validation where appropriate.

### Corrections

Allow guests to correct errors before payment.

### Post-Purchase Changes

Define when shipping addresses may be updated.

### Privacy

Protect customer address information throughout the workflow.

---

## Shipping Labels and Carrier Integration

### Label Authority

Determine which system creates shipping labels.

### Carrier Account

Verify account ownership and authorization.

### Service Selection

Use an approved carrier service.

### Package Data

Supply accurate dimensions and weight.

### Recipient Address

Use the confirmed delivery destination.

### Label Purchase

Follow the provider's supported process.

### Label Reference

Preserve an appropriate identifier.

### Duplicate Labels

Avoid unnecessary repeated purchases.

### Voids

Document how unused labels are canceled or voided.

### Integration Boundary

Do not assume direct carrier API access exists.

---

## Shipment Tracking

### Tracking Identifier

Associate the shipment with the correct carrier reference.

### Carrier

Identify the shipping provider.

### Shipment Status

Use authoritative tracking information.

### Guest Visibility

Provide tracking access where supported.

### Status Freshness

Communicate the limitations of delayed carrier updates.

### Multiple Packages

Associate each tracking reference with its relevant items.

### Notification

Send appropriate shipment updates.

### Failed Tracking Lookup

Provide a fallback support path.

### Security

Prevent unauthorized access to customer shipment details.

### Retention

Preserve tracking information according to approved operational requirements.

---

## Delivery Confirmation

### Carrier Status

Use the provider's reported delivery information.

### Delivery Timestamp

Record the provider-reported time where available.

### Proof of Delivery

Retain appropriate references when supported.

### Guest Notification

Communicate delivery status accurately.

### Customer Dispute

Provide a procedure for contested delivery.

### Lost Package

Do not assume a delivered scan resolves every customer concern.

### Financial Review

Determine whether a refund or replacement is justified.

### Support Ownership

Assign responsibility for investigation.

### Documentation

Preserve relevant shipment evidence.

### Qualification

Delivery confirmation capabilities vary by provider and service.

---

## Delivery Exceptions

### Address Problem

The carrier may be unable to deliver to the supplied address.

### Delayed Shipment

The package may exceed the expected delivery window.

### Lost Package

The shipment may become untraceable.

### Damaged Package

Merchandise may arrive damaged.

### Returned to Sender

The carrier may return an undeliverable package.

### Customs Delay

International shipments may experience additional processing.

### Carrier Outage

Tracking or shipment services may be unavailable.

### Escalation

Assign the exception to the appropriate operator.

### Resolution

Document replacement, reshipment, refund, or other approved action.

### Customer Communication

Provide accurate updates without unsupported guarantees.

---

## Partial Shipments and Split Fulfillment

### Multiple Items

One merchandise order may contain several products.

### Different Locations

Products may ship from separate facilities.

### Different Providers

Some items may be fulfilled by different partners.

### Partial Availability

Only part of an order may be ready.

### Split Shipment

Create separate shipment records where supported.

### Tracking

Associate tracking information with the correct items.

### Shipping Charges

Define the approved treatment of multiple shipments.

### Guest Communication

Explain partial fulfillment clearly.

### Payment Coordination

Review capture and refund implications.

### Operational Rule

Enable split fulfillment only when the selected commerce and fulfillment architecture supports it reliably.

---

## Local Pickup

Local pickup is an optional future fulfillment method.

### Business Approval

Restaurant ownership must approve pickup operations.

### Pickup Location

Use an approved, accurate collection location.

### Pickup Hours

Confirm actual operating availability.

### Staff Responsibility

Assign personnel to prepare and release orders.

### Order Readiness

Notify guests only when merchandise is ready.

### Identity Verification

Establish an appropriate pickup verification process.

### Pickup Window

Define how long orders remain available.

### Unclaimed Orders

Document handling procedures.

### Inventory

Coordinate stock commitment and collection.

### Important Boundary

Do not advertise local pickup before the restaurant has approved and staffed the workflow.

---

## Print-on-Demand Fulfillment

### Production Model

Merchandise may be produced after a purchase is accepted.

### Provider Selection

Confirm the actual production partner.

### Product Catalog

Verify supported products and variants.

### Artwork

Use approved brand designs.

### Production Timing

Publish accurate processing expectations.

### Inventory

Use the provider's production availability model.

### Order Submission

Follow the provider's supported integration.

### Quality

Define acceptable production standards.

### Shipping

Confirm the provider's carrier and tracking capabilities.

### Returns

Review the provider's actual return and replacement policies.

---

## Third-Party Fulfillment

### Provider Responsibility

Define the services the fulfillment partner performs.

### Inventory Storage

Confirm where merchandise is held.

### Receiving

Document how stock arrives at the provider.

### Order Integration

Verify supported order transmission.

### Picking and Packing

Establish operational standards.

### Shipping

Confirm available carrier services.

### Tracking

Determine how shipment updates are provided.

### Returns

Assign responsibility for returned merchandise.

### Reconciliation

Compare provider activity with commerce records.

### Contract Review

Confirm service levels, fees, liability, and termination procedures.

---

## Cancellations and Order Changes

### Cancellation Request

Identify the order and requester.

### Authorization

Confirm the request is legitimate.

### Payment State

Review the authoritative payment status.

### Fulfillment State

Determine whether processing or shipping has begun.

### Eligible Cancellation

Apply the approved cancellation process.

### Shipped Orders

Use the returns workflow where necessary.

### Address Changes

Allow only within supported operational limits.

### Product Changes

Determine whether a new order is required.

### Inventory

Release or restore stock when appropriate.

### Guest Communication

Confirm the actual outcome.

---

## Returns and Exchanges

### Return Policy

Publish the approved merchandise return policy.

### Return Eligibility

Determine which products qualify.

### Return Authorization

Use an appropriate verification process.

### Return Address

Provide the correct destination.

### Return Shipping

Define responsibility for shipping costs.

### Item Inspection

Verify condition and identity.

### Restocking

Restore inventory only when justified.

### Exchange

Define whether replacements or variant exchanges are supported.

### Refund

Coordinate with the authorized payment workflow.

### Documentation

Maintain appropriate return and exchange records.

---

## Refund and Payment Coordination

### Payment Authority

Use the selected payment provider.

### Refund Eligibility

Follow the approved business policy.

### Fulfillment Status

Check shipment and delivery progress.

### Return Receipt

Determine whether physical merchandise must be received first.

### Refund Amount

Validate approved merchandise and shipping adjustments.

### Partial Refund

Use only where supported.

### Inventory

Treat restocking separately from payment reversal.

### Duplicate Prevention

Avoid repeated refund processing.

### Financial Reconciliation

Include completed refunds in accounting records.

### Customer Communication

Provide accurate refund status information.

---

## Guest Communications

### Order Confirmation

Send only after authoritative order verification.

### Fulfillment Processing

Communicate relevant preparation status.

### Shipment Confirmation

Provide carrier and tracking information where available.

### Delivery Update

Use supported delivery notifications.

### Exception Notice

Explain material shipping problems.

### Pickup Ready

Notify guests when approved pickup orders are prepared.

### Return Instructions

Provide clear return guidance.

### Refund Status

Use authoritative financial information.

### Channel Selection

Choose approved email or other supported communication methods.

### Consent

Do not reuse restaurant reservation SMS consent as authorization for unrelated merchandise marketing.

---

## Manager Fulfillment Administration

### Order Queue

Display confirmed orders requiring action.

### Order Detail

Show necessary products, variants, and quantities.

### Fulfillment Assignment

Identify the responsible operator.

### Inventory Status

Display appropriate stock information.

### Shipping Status

Provide supported shipment updates.

### Tracking References

Associate carrier identifiers with orders.

### Exceptions

Highlight orders requiring intervention.

### Returns

Support authorized return review.

### Refund Coordination

Restrict financial actions appropriately.

### Audit

Record material fulfillment changes.

---

## Supabase and Integration Planning

### Existing Infrastructure

The website uses Next.js, Vercel, and Supabase.

### Potential Fulfillment Records

A custom architecture may store non-sensitive fulfillment references.

### Potential Shipment Records

May associate orders with carrier tracking information.

### Potential Package Records

May represent split shipments.

### Potential Return Records

May support approved returns workflows.

### External Identifiers

Preserve provider references where necessary.

### Provider Events

Verify supported shipment and delivery notifications.

### Access Control

Protect customer and operational information.

### Data Authority

Avoid duplicating records owned by the selected commerce provider without a clear need.

### Schema Qualification

These are conceptual entities, not implemented tables, migrations, or API routes.

---

## Security and Privacy

### Customer Addresses

Restrict access to authorized fulfillment personnel.

### Contact Information

Collect and share only necessary details.

### Provider Credentials

Keep shipping and fulfillment credentials server-side.

### Source Control

Do not commit `.env.local`.

### Administrative Permissions

Apply server-side authorization to privileged operations.

### Webhook Authenticity

Verify supported provider notifications.

### Logging

Redact sensitive customer and credential information.

### Data Retention

Establish appropriate retention periods.

### External Sharing

Review provider privacy and data-processing responsibilities.

### Incident Response

Document procedures for unauthorized disclosure or misuse.

---

## Monitoring and Operational Reporting

### Unfulfilled Orders

Identify orders awaiting processing.

### Processing Time

Measure the time from eligible order to shipment.

### Shipment Delays

Identify overdue shipments.

### Tracking Gaps

Detect missing or invalid tracking references.

### Delivery Exceptions

Review unresolved carrier problems.

### Fulfillment Errors

Track incorrect or missing items.

### Returns

Measure return reasons and outcomes.

### Provider Performance

Compare actual service with approved expectations.

### Customer Support

Track unresolved fulfillment requests.

### Data Quality

Distinguish confirmed provider information from estimates.

---

## Shipping Costs and Financial Planning

### Packaging

Estimate materials and preparation costs.

### Labor

Account for staff handling time.

### Carrier Rates

Obtain current verified service pricing.

### Fulfillment Fees

Review third-party processing charges.

### Storage

Include warehouse or inventory storage expenses.

### Returns

Estimate reverse logistics costs.

### Replacements

Account for damaged or lost merchandise.

### Free Shipping

Evaluate financial impact before offering it.

### Margin

Calculate contribution margin after fulfillment expenses.

### Decision

Select fulfillment options based on total operating cost and customer expectations.

---

## Testing and Quality Assurance

### Order Handoff

- [ ] Confirmed orders reach the correct fulfillment operator.
- [ ] Duplicate order handoffs are prevented.
- [ ] Invalid orders are rejected appropriately.

### Inventory

- [ ] Correct SKUs and quantities are allocated.
- [ ] Stock deductions follow the approved lifecycle.
- [ ] Cancellations release inventory correctly.

### Shipping

- [ ] Supported destinations are validated.
- [ ] Shipping rates are authoritative.
- [ ] Shipping methods match operational capabilities.
- [ ] Labels use accurate addresses and package information.

### Tracking

- [ ] Tracking references match the correct orders.
- [ ] Split shipments are represented accurately.
- [ ] Delivery exceptions can be resolved.

### Operations

- [ ] Returns and refunds are coordinated.
- [ ] Manager permissions are verified.
- [ ] Customer data is protected.
- [ ] Staff procedures are documented.
- [ ] Ownership approves production readiness.

---

## Implementation Roadmap

### Phase 0 — Current-State Discovery

Verify the external storefront's existing fulfillment model.

### Phase 1 — Business Requirements

Confirm merchandise sourcing, destinations, and delivery expectations.

### Phase 2 — Fulfillment Model Selection

Choose restaurant-managed, third-party, print-on-demand, or hybrid operations.

### Phase 3 — Provider Evaluation

Verify shipping and fulfillment capabilities.

### Phase 4 — Architecture Approval

Define authoritative order, inventory, and fulfillment systems.

### Phase 5 — Shipping Policies

Approve regions, methods, charges, and guest-facing terms.

### Phase 6 — Order Handoff

Implement or configure supported fulfillment transmission.

### Phase 7 — Shipping Integration

Configure approved rates, labels, and tracking.

### Phase 8 — Returns and Exceptions

Establish recovery procedures.

### Phase 9 — Manager Operations

Implement or configure authorized administrative workflows.

### Phase 10 — Testing

Validate ordinary and failure scenarios.

### Phase 11 — Staff Acceptance

Confirm training and operating readiness.

### Phase 12 — Production Launch

Activate only after approval and rollback review.

---

## Acceptance Criteria

### Business Decisions

- [ ] Fulfillment owner confirmed.
- [ ] Shipping regions approved.
- [ ] Shipping methods approved.
- [ ] Return policy approved.
- [ ] Operational responsibilities assigned.

### Architecture

- [ ] Order authority documented.
- [ ] Inventory authority documented.
- [ ] Fulfillment provider capabilities verified.
- [ ] Integration requirements approved.

### Guest Experience

- [ ] Shipping charges are accurate.
- [ ] Delivery expectations are clear.
- [ ] Tracking is provided where supported.
- [ ] Exceptions have an appropriate support path.

### Operations

- [ ] Orders reach the correct operator.
- [ ] Inventory changes are consistent.
- [ ] Returns and refunds are coordinated.
- [ ] Staff permissions are verified.
- [ ] Reporting supports reconciliation.

### Production

- [ ] End-to-end testing completed.
- [ ] Staff training completed.
- [ ] Rollback procedures reviewed.
- [ ] Restaurant ownership authorizes launch.

---

## Implementation Status

| Component | Status |
|---|---|
| Existing external merchandise experience | Established |
| Current fulfillment provider | Unverified |
| Current shipping carriers | Unverified |
| Merchandise storage model | Pending confirmation |
| Print-on-demand model | Possible option; unconfirmed |
| Native fulfillment architecture | Proposed |
| Fulfillment ownership | Pending |
| Shipping regions | Pending approval |
| Shipping methods | Pending approval |
| Shipping rate authority | Pending |
| Shipping address validation | Proposed |
| Native shipping labels | Not implemented |
| Carrier API integration | Unconfirmed |
| Shipment tracking integration | Proposed |
| Delivery status integration | Proposed |
| Fulfillment order states | Planning |
| Inventory allocation | Proposed |
| Picking and packing workflow | Pending operating model |
| Partial shipments | Conditional |
| Local pickup | Optional; not approved |
| Cancellation workflow | Proposed |
| Returns and exchanges | Pending policy |
| Refund coordination | Proposed |
| Guest fulfillment notifications | Proposed |
| Manager fulfillment dashboard | Proposed |
| Supabase fulfillment schema | Not established |
| Fulfillment webhooks | Unconfirmed |
| Shipping cost analysis | Pending |
| Security review | Pending |
| End-to-end testing | Not started |
| Native fulfillment production launch | Not approved |

### Overall Assessment

Merchandise shipping and fulfillment remain in the planning stage.

The first priority is to verify the current external storefront's fulfillment model and determine whether additional native capabilities would provide sufficient operational value.

No production shipping accounts, carrier settings, order routing, or live fulfillment workflows should be changed during this documentation phase.

---

## Related Documentation

### Merchandise Commerce

- [Merchandise Commerce Overview](README.md)
- [Commerce Architecture Overview](commerce-overview.md)
- [Product Catalog](product-catalog.md)
- [Inventory Management](inventory-management.md)
- [Cart and Checkout](cart-and-checkout.md)
- [Payment Processing](payment-processing.md)
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

### Separate Restaurant Ordering

- [Toast POS Integration Overview](../10-toast-pos-integration/README.md)
- [Toast Order Submission](../10-toast-pos-integration/order-submission.md)

### Master Index

- [Master Documentation Index](../README.md)

---

[Back to Merchandise Commerce Overview](README.md)
