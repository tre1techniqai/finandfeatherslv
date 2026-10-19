# MERCHANDISE COMMERCE — Inventory Management

**Project:** Fin & Feathers Las Vegas

**Website:** https://finandfeatherslv.live

**Documentation Status:** Inventory Architecture and Operational Planning

**Audience:** Restaurant Ownership, Merchandise Managers, Developers, Inventory Personnel, Fulfillment Partners, and Technical Administrators

**Implementation Status:** Inventory authority unverified; native inventory management proposed

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Inventory Management Objectives](#inventory-management-objectives)
3. [Current Inventory Baseline](#current-inventory-baseline)
4. [Inventory Architecture Options](#inventory-architecture-options)
5. [Inventory Ownership and Authority](#inventory-ownership-and-authority)
6. [Product and Variant Relationships](#product-and-variant-relationships)
7. [SKU Management](#sku-management)
8. [Inventory Data Model](#inventory-data-model)
9. [Stock Quantity Definitions](#stock-quantity-definitions)
10. [Inventory Locations](#inventory-locations)
11. [Receiving Merchandise](#receiving-merchandise)
12. [Stock Adjustments](#stock-adjustments)
13. [Inventory Reservations](#inventory-reservations)
14. [Checkout Inventory Validation](#checkout-inventory-validation)
15. [Overselling Prevention](#overselling-prevention)
16. [Payment and Inventory Coordination](#payment-and-inventory-coordination)
17. [Order Fulfillment and Stock Deduction](#order-fulfillment-and-stock-deduction)
18. [Order Cancellation and Stock Restoration](#order-cancellation-and-stock-restoration)
19. [Returns and Restocking](#returns-and-restocking)
20. [Low-Stock Alerts](#low-stock-alerts)
21. [Out-of-Stock Product Behavior](#out-of-stock-product-behavior)
22. [Inventory Synchronization](#inventory-synchronization)
23. [External Fulfillment and Print-on-Demand](#external-fulfillment-and-print-on-demand)
24. [Manager Inventory Administration](#manager-inventory-administration)
25. [Inventory Audit Trail](#inventory-audit-trail)
26. [Physical Inventory Reconciliation](#physical-inventory-reconciliation)
27. [Security and Access Controls](#security-and-access-controls)
28. [Supabase and Infrastructure Planning](#supabase-and-infrastructure-planning)
29. [Monitoring and Exception Handling](#monitoring-and-exception-handling)
30. [Inventory Reporting](#inventory-reporting)
31. [Testing and Quality Assurance](#testing-and-quality-assurance)
32. [Operational Procedures](#operational-procedures)
33. [Implementation Roadmap](#implementation-roadmap)
34. [Acceptance Criteria](#acceptance-criteria)
35. [Implementation Status](#implementation-status)
36. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed inventory management architecture for future merchandise commerce on the Fin & Feathers Las Vegas website.

Inventory management determines whether merchandise can be offered for purchase, how stock quantities are maintained, and how orders affect product availability.

The inventory system must coordinate with the selected product catalog, shopping cart, payment provider, and fulfillment workflow.

Its responsibilities may include:

- Identifying stock-tracked products.
- Tracking inventory by SKU or variant.
- Managing available quantities.
- Recording merchandise receipts.
- Preventing overselling.
- Reserving stock during checkout where appropriate.
- Coordinating payment and order status.
- Deducting inventory for confirmed purchases.
- Restoring inventory following cancellations.
- Handling returns and restocking.
- Providing low-stock notifications.
- Supporting authorized adjustments.
- Reconciling physical and recorded quantities.

The final implementation depends on the selected commerce and fulfillment platforms.

### Important Boundary

No native merchandise inventory system has been established as implemented.

This document describes potential requirements and operating procedures, not existing Supabase tables or production services.

---

## Inventory Management Objectives

### Accurate Availability

Display merchandise availability based on an authoritative stock source.

### Reliable Purchasing

Avoid accepting purchases for unavailable products.

### Variant-Level Control

Support independent stock quantities for sizes, colors, and other purchasable configurations.

### Operational Accountability

Record the reason and responsible actor for material stock changes.

### Fulfillment Coordination

Ensure paid orders are communicated to the appropriate fulfillment operation.

### Efficient Administration

Allow authorized personnel to maintain inventory without unnecessary complexity.

### Financial Visibility

Support evaluation of inventory investment and unsold merchandise.

### Provider Compatibility

Work with the selected commerce platform's inventory capabilities.

### Recoverability

Provide documented procedures for correcting discrepancies.

### Scalability

Allow inventory operations to grow with the merchandise business.

---

## Current Inventory Baseline

### Existing Website

    https://finandfeatherslv.live

### Existing Merchandise Experience

The website currently provides an external merchandise shopping experience.

### Inventory Provider

The system currently responsible for merchandise stock has not been verified.

### Current Stock Tracking

The existence and structure of provider-managed inventory records require review.

### Current Fulfillment

The business or service responsible for merchandise fulfillment has not been confirmed.

### Current Native Database

No merchandise inventory tables have been established as implemented in the existing Supabase database.

### Current Manager Administration

The existing manager interface supports menu administration, but native merchandise inventory controls are not established.

### Discovery Requirements

Determine:

- Who owns merchandise inventory.
- Where merchandise is stored.
- Whether products are produced on demand.
- Whether a third party handles fulfillment.
- How stock quantities are updated.
- How cancellations affect inventory.
- How returns are handled.

### Preservation Requirement

Maintain the existing external merchandise workflow while evaluating any replacement.

---

## Inventory Architecture Options

### Option A — External Commerce Inventory

The existing or selected commerce provider maintains stock.

**Potential advantages:**

- Less custom inventory development.
- Provider-managed checkout coordination.
- Existing administrative tools may be available.

**Potential limitations:**

- Dependence on provider capabilities.
- Potential synchronization requirements.
- Less control over custom workflows.

### Option B — Supabase-Native Inventory

An approved custom inventory model uses Supabase PostgreSQL.

**Potential advantages:**

- Direct integration with the website.
- Flexible administrative workflows.
- Custom reporting opportunities.

**Potential limitations:**

- Greater engineering responsibility.
- Concurrency and reservation complexity.
- Ongoing security and maintenance requirements.

### Option C — Fulfillment Partner Inventory

A fulfillment provider manages stock and availability.

### Option D — Print-on-Demand

Products are manufactured after an order is accepted, subject to provider capabilities.

### Option E — Hybrid Inventory

A provider maintains authoritative stock while the website displays synchronized availability.

### Decision

Select the inventory architecture after confirming the merchandise sourcing and fulfillment model.

---

## Inventory Ownership and Authority

Every stock-tracked item should have one authoritative inventory system.

### Ownership

Identify the organization responsible for the physical or fulfillable merchandise.

### System Authority

Identify the system permitted to change authoritative stock quantities.

### Display Authority

Determine where the website retrieves availability.

### Reservation Authority

Identify which system reserves stock during checkout.

### Fulfillment Authority

Determine which system records stock consumption.

### Adjustment Authority

Restrict manual changes to approved personnel.

### Synchronization

Document how secondary systems receive updates.

### Conflict Resolution

Define which record prevails when stock values disagree.

### Provider Outage

Determine how purchasing behaves when the authoritative system cannot be reached.

### Critical Rule

Do not allow independent systems to modify the same authoritative inventory without a verified coordination mechanism.

---

## Product and Variant Relationships

Inventory must identify the exact purchasable merchandise configuration.

### Parent Product

Represents the merchandise listing.

### Variant

Represents a specific purchasable option.

### Size

A shirt may have separate stock for each size.

### Color

A product may have different quantities by color.

### Combined Options

Size and color combinations may each require independent inventory.

### Variant Identifier

Use a stable identifier from the authoritative catalog.

### Inventory Reference

Associate stock with the appropriate purchasable identifier.

### Product Changes

Avoid breaking inventory references when descriptions or images change.

### Discontinued Variants

Prevent new purchases while retaining necessary order history.

### Validation

Reject invalid product and variant combinations.

---

## SKU Management

A stock-keeping unit identifies a merchandise configuration for operational tracking.

### SKU Assignment

Define whether the commerce platform or restaurant assigns SKUs.

### Uniqueness

Establish an approved uniqueness policy.

### Variant SKUs

Use distinct identifiers for separately tracked configurations.

### Provider SKUs

Preserve provider identifiers where they are authoritative.

### Receiving

Use the correct SKU when merchandise arrives.

### Fulfillment

Ensure staff can identify the purchased configuration.

### Returns

Use SKU references to determine restocking eligibility.

### Imports

Validate missing and duplicate identifiers.

### Historical Records

Retain necessary references for completed orders.

### Format

Do not establish a final SKU naming convention until the operating model is approved.

---

## Inventory Data Model

A future inventory model may require the following conceptual entities.

### Inventory Item

Associates a purchasable variant with inventory tracking.

### Inventory Location

Identifies where stock is held.

### Stock Balance

Represents quantities associated with a location and variant.

### Stock Movement

Records inventory increases and decreases.

### Reservation

Tracks temporarily committed stock where supported.

### Adjustment

Records an authorized correction.

### Receiving Record

Documents incoming merchandise.

### Fulfillment Reference

Associates stock consumption with an order.

### External Mapping

Links local records with provider identifiers.

### Important Qualification

These are proposed entities.

They are not confirmed Supabase tables, migrations, or production database relationships.

---

## Stock Quantity Definitions

Inventory calculations require precise terminology.

### On-Hand Quantity

Physical stock recorded as held by the business or fulfillment provider.

### Reserved Quantity

Stock temporarily committed to an order or checkout.

### Available Quantity

Stock currently eligible for new purchases.

### Damaged Quantity

Units that cannot be sold in their present condition.

### Incoming Quantity

Units expected from an approved supplier or production process.

### Fulfilled Quantity

Units consumed through completed fulfillment activity.

### Returned Quantity

Units received through a return process.

### Conceptual Formula

    Available Quantity =
        On-Hand Quantity
        - Active Reserved Quantity
        - Other Unavailable Quantity

### Qualification

The actual formula must match the selected inventory provider's definitions and lifecycle.

### Financial Distinction

Incoming inventory should not automatically be treated as immediately available.

---

## Inventory Locations

Inventory may exist at one or more locations.

### Restaurant Location

Merchandise may be stored at the restaurant.

### External Warehouse

A third party may store inventory.

### Fulfillment Provider

A provider may control stock at its own facility.

### Multiple Locations

Different locations may have independent quantities.

### Location Identity

Use stable identifiers if multiple locations are supported.

### Receiving

Associate incoming stock with the correct location.

### Transfers

Record movement between locations where applicable.

### Availability

Determine which locations can fulfill an order.

### Shipping

Consider how fulfillment location affects shipping options.

### Scope

Do not implement multi-location inventory unless the business requires it.

---

## Receiving Merchandise

Receiving increases recorded stock after merchandise is verified.

### Purchase or Production Reference

Associate the receipt with an approved source where available.

### Product Identification

Confirm the correct SKU or variant.

### Quantity Verification

Count the units actually received.

### Condition Inspection

Identify damaged or unsuitable merchandise.

### Location

Record where accepted units are stored.

### Inventory Update

Apply the approved increase through the authoritative system.

### Documentation

Record receipt details as required.

### Discrepancy

Investigate differences between expected and received quantities.

### Authorization

Restrict receipt confirmation to appropriate personnel.

### Verification

Confirm that the resulting stock balance is correct.

---

## Stock Adjustments

Adjustments correct inventory outside ordinary order fulfillment.

### Reasons

Potential reasons include:

- Physical count corrections.
- Damaged merchandise.
- Lost merchandise.
- Supplier discrepancies.
- Inventory transfers.
- Administrative corrections.

### Required Context

Record the affected SKU, quantity change, reason, and responsible actor.

### Positive Adjustment

Increase inventory only when justified.

### Negative Adjustment

Decrease inventory only when justified.

### Permissions

Restrict adjustments to authorized personnel.

### Validation

Prevent invalid quantities.

### Auditability

Retain a record of material changes.

### Review

Consider additional approval for unusually large adjustments.

### Correction

Prefer traceable reversing adjustments over silently overwriting history.

### Provider Compatibility

Use the external platform's supported adjustment workflow when it is authoritative.

---

## Inventory Reservations

Reservations may temporarily prevent stock from being sold to another guest.

### Reservation Purpose

Reduce competing purchases of the same limited stock.

### Reservation Timing

Determine when stock becomes reserved.

### Reservation Duration

Establish an approved expiration policy.

### Cart Behavior

Do not assume adding an item to a cart reserves stock.

### Checkout Behavior

Confirm the selected provider's actual reservation rules.

### Payment Success

Convert or reconcile the reservation according to the approved order lifecycle.

### Payment Failure

Release stock when appropriate.

### Abandoned Checkout

Ensure temporary reservations expire safely.

### Duplicate Requests

Prevent multiple reservations for one logical checkout attempt.

### Feasibility

Do not implement a custom reservation model without a documented concurrency strategy.

---

## Checkout Inventory Validation

Inventory must be checked at an appropriate authoritative point before purchase completion.

### Cart Review

Display the best available stock information.

### Checkout Initiation

Validate selected variants and quantities.

### Price Review

Confirm authoritative pricing independently.

### Availability Check

Verify sufficient stock.

### Concurrent Purchases

Account for other guests purchasing the same SKU.

### Reservation

Use provider-supported reservation controls where available.

### Unavailable Items

Explain which selections require changes.

### Quantity Reduction

Offer an appropriate correction when fewer units are available.

### Payment Coordination

Avoid charging for an order that cannot be fulfilled without an approved recovery process.

### Final Confirmation

Use the authoritative order result.

---

## Overselling Prevention

Overselling occurs when accepted orders exceed fulfillable inventory.

### Primary Risk

Multiple guests may purchase the last available unit concurrently.

### Atomic Operations

A custom database design should use appropriate transactional safeguards.

### Conditional Updates

Avoid unsafe read-then-write quantity changes.

### Provider Inventory

Use the commerce provider's authoritative controls when available.

### Reservation Consistency

Prevent duplicate or expired reservations from consuming stock incorrectly.

### Checkout Retries

Avoid duplicate stock deductions.

### Event Processing

Handle repeated external notifications safely.

### Stock Reconciliation

Detect negative or inconsistent balances.

### Exception Workflow

Provide staff with a procedure for resolving oversold items.

### Critical Rule

Disabling a purchase button in the browser is not sufficient overselling protection.

---

## Payment and Inventory Coordination

Payment and inventory operations may involve separate systems.

### Checkout Start

Confirm the selected items remain valid.

### Stock Reservation

Reserve stock where the architecture requires it.

### Payment Authorization

Use the approved provider's supported workflow.

### Payment Capture

Determine when payment becomes final.

### Order Creation

Create or confirm the merchandise order through the authoritative system.

### Inventory Commitment

Deduct or finalize reserved stock at the approved lifecycle stage.

### Payment Failure

Release inventory appropriately.

### Unknown Payment Outcome

Reconcile the payment before repeating an operation.

### Duplicate Notifications

Process repeated provider events idempotently.

### Important Principle

Do not assume payment and inventory changes across separate providers form one atomic transaction.

---

## Order Fulfillment and Stock Deduction

Fulfillment must use the approved stock accounting model.

### Order Acceptance

Verify that an authoritative order exists.

### Item Verification

Confirm the exact purchased SKUs and quantities.

### Stock Allocation

Determine which location fulfills the order.

### Picking

Identify the required merchandise.

### Packing

Confirm the prepared items match the order.

### Shipment

Record the appropriate shipping handoff.

### Stock Consumption

Apply inventory deduction at the lifecycle stage defined by the authoritative system.

### Duplicate Prevention

Avoid deducting stock twice for one order.

### Partial Fulfillment

Define behavior if only some items can be fulfilled.

### Reconciliation

Compare fulfilled quantities with inventory movements.

---

## Order Cancellation and Stock Restoration

Canceled orders may require inventory restoration.

### Cancellation Eligibility

Determine whether the order can still be canceled.

### Payment Status

Review the authoritative payment outcome.

### Fulfillment Status

Determine whether merchandise has already shipped.

### Reserved Stock

Release active reservations where appropriate.

### Committed Stock

Restore stock only when justified by the approved lifecycle.

### Partial Cancellation

Adjust only the affected items.

### Duplicate Events

Prevent repeated restoration.

### External Provider

Use the provider's supported cancellation process.

### Audit Trail

Record the reason and resulting stock movement.

### Verification

Confirm the updated available quantity.

---

## Returns and Restocking

Returned merchandise should not automatically become sellable inventory.

### Return Authorization

Confirm that the return is permitted.

### Product Identification

Verify the returned SKU.

### Quantity

Record units actually received.

### Condition

Inspect merchandise before restocking.

### Sellable Return

Restore stock when approved.

### Damaged Return

Keep unsuitable merchandise unavailable.

### Exchange

Coordinate stock changes for the returned and replacement items.

### Refund

Distinguish payment refund completion from physical stock restoration.

### External Fulfillment

Follow the provider's return and restocking procedures.

### Audit

Document the inventory outcome.

---

## Low-Stock Alerts

Low-stock notifications may support timely replenishment.

### Threshold

Define an approved alert quantity.

### Variant Level

Evaluate thresholds for individual SKUs.

### Location Level

Consider separate thresholds where necessary.

### Notification Recipient

Assign an authorized manager.

### Alert Frequency

Avoid unnecessary repeated notifications.

### Replenishment

Provide a procedure for responding to alerts.

### Supplier Lead Time

Consider how long replacement stock takes to arrive.

### Seasonal Demand

Adjust planning based on actual sales patterns.

### Reporting

Identify frequently low-stock products.

### Scope

Do not introduce alert infrastructure until it provides measurable operational value.

---

## Out-of-Stock Product Behavior

The storefront must communicate stock limitations accurately.

### Product Display

Determine whether sold-out products remain visible.

### Purchase Controls

Prevent unsupported purchases.

### Variant Selection

Disable or identify unavailable configurations.

### Messaging

Use clear stock status information.

### Cart Validation

Recheck availability when guests return to an existing cart.

### Checkout Validation

Reject purchases exceeding authoritative availability.

### Restock Notification

Consider only if approved and supported.

### Backorders

Do not enable without explicit business approval.

### Preorders

Use only with a documented fulfillment policy.

### Manager Controls

Provide an appropriate method to correct availability.

---

## Inventory Synchronization

A hybrid architecture may require synchronization between systems.

### Authoritative Source

Identify the system responsible for stock.

### Secondary Display

Determine which systems display synchronized quantities.

### Update Direction

Prefer a clearly defined direction.

### Synchronization Method

Evaluate supported APIs or events.

### Frequency

Set an appropriate freshness requirement.

### Identifier Mapping

Use stable SKU or variant relationships.

### Failure Handling

Detect missed or rejected updates.

### Stale Data

Prevent checkout from relying on outdated stock.

### Reconciliation

Compare authoritative and displayed quantities.

### Vendor Limitation

Do not assume the selected commerce platform supports every required synchronization feature.

---

## External Fulfillment and Print-on-Demand

Some merchandise businesses rely on external production or fulfillment.

### Fulfillment Provider

Identify the actual provider.

### Product Availability

Determine how the provider communicates availability.

### Print-on-Demand

Stock may represent production capability rather than physical units.

### Production Lead Time

Publish accurate expectations.

### Variant Support

Verify available sizes, colors, and designs.

### Order Transmission

Use approved provider interfaces.

### Production Errors

Define escalation procedures.

### Shipping

Determine who purchases labels and manages delivery.

### Returns

Review the provider's actual return policies.

### Architecture Rule

Do not build physical stock reservation logic when the approved fulfillment model does not require it.

---

## Manager Inventory Administration

A future manager interface may provide stock controls.

### Inventory Dashboard

Display relevant stock status.

### SKU Search

Locate the correct merchandise configuration.

### Quantity Review

Show authoritative quantities.

### Receiving

Record incoming merchandise where supported.

### Adjustments

Apply authorized corrections.

### Low-Stock Review

Identify items needing replenishment.

### Order References

Review stock movements associated with orders.

### Audit History

Provide appropriate change visibility.

### Permissions

Restrict inventory operations through server-side authorization.

### Implementation Boundary

These controls are proposed, not existing `/admin` features.

---

## Inventory Audit Trail

An audit trail supports accountability and investigation.

### Movement Identifier

Distinguish individual stock movements.

### SKU Reference

Identify the affected variant.

### Location Reference

Record the relevant inventory location.

### Quantity Change

Record the increase or decrease.

### Reason

Identify why the change occurred.

### Related Order

Associate order-driven movements where appropriate.

### Responsible Actor

Record an authorized user or system reference.

### Timestamp

Record when the movement occurred.

### Correction

Preserve traceable adjustment history.

### Retention

Apply an approved retention policy.

---

## Physical Inventory Reconciliation

Physical stock counts should be compared with recorded inventory.

### Schedule

Establish a practical counting frequency.

### Scope

Identify products and locations being counted.

### Count

Record actual physical quantities.

### Comparison

Compare the count with the authoritative system.

### Discrepancy

Investigate unexpected differences.

### Adjustment

Apply approved corrections.

### Documentation

Retain reconciliation evidence.

### Review

Consider additional approval for material variances.

### Follow-Up

Identify recurring causes of stock loss.

### External Providers

Use provider reports or supported reconciliation procedures when inventory is externally managed.

---

## Security and Access Controls

### Authentication

Require approved credentials for inventory administration.

### Manager Authorization

Use established server-side permission patterns where appropriate.

### Least Privilege

Limit access to necessary functions.

### Input Validation

Reject invalid quantities and identifiers.

### Protected Operations

Perform privileged changes through authorized backend services.

### Database Security

Apply appropriate Supabase RLS policies if using custom tables.

### Credentials

Keep external provider secrets server-side.

### Source Control

Never commit `.env.local`.

### Auditability

Record significant stock modifications.

### Incident Response

Define procedures for unauthorized or erroneous inventory changes.

---

## Supabase and Infrastructure Planning

Supabase may support custom inventory functionality if selected.

### PostgreSQL

Provides transactional database capabilities.

### Potential Tables

Conceptual requirements may include:

- Inventory items.
- Stock balances.
- Inventory locations.
- Stock movements.
- Reservations.
- External identifier mappings.

### Transactional Integrity

Use appropriate database transactions for dependent stock changes.

### Concurrency

Design for simultaneous checkout requests.

### Row Level Security

Protect sensitive inventory operations.

### Server Functions

Use authorized server-side access for privileged actions.

### Scheduled Work

Evaluate reconciliation or reservation cleanup jobs only where necessary.

### Backups

Review recovery procedures.

### Schema Boundary

No table names, functions, or migrations in this section are asserted as implemented.

---

## Monitoring and Exception Handling

### Negative Inventory

Detect unexpected negative balances.

### Reservation Expiration

Identify stale reservations.

### Synchronization Failures

Detect provider communication errors.

### Duplicate Movements

Identify repeated stock adjustments.

### Missing Order References

Investigate unexplained deductions.

### Fulfillment Discrepancies

Compare orders and inventory consumption.

### Failed Restorations

Detect canceled orders whose stock was not restored appropriately.

### Low Stock

Notify authorized personnel when configured.

### Logging

Record safe diagnostic information.

### Escalation

Assign responsibility for unresolved inventory exceptions.

---

## Inventory Reporting

Reports should support practical business decisions.

### Stock on Hand

Show recorded physical stock.

### Available Stock

Show quantities eligible for purchase.

### Reserved Stock

Identify temporarily committed units.

### Low-Stock Products

Highlight replenishment needs.

### Out-of-Stock Products

Identify unavailable merchandise.

### Inventory Movements

Summarize receipts, deductions, and adjustments.

### Sales by SKU

Compare merchandise demand by variant.

### Unsold Merchandise

Identify slow-moving products.

### Inventory Value

Calculate using an approved product cost basis.

### Data Quality

Clearly distinguish verified inventory data from estimates.

---

## Testing and Quality Assurance

### Product Mapping

Verify each stock record references the correct SKU.

### Receiving

Test authorized quantity increases.

### Adjustments

Test positive and negative corrections.

### Permissions

Confirm unauthorized users cannot change stock.

### Concurrent Checkout

Test simultaneous purchases of limited inventory.

### Reservations

Test creation and expiration if supported.

### Payment Failure

Verify appropriate stock release.

### Order Cancellation

Verify stock restoration.

### Returns

Test sellable and damaged merchandise outcomes.

### External Failures

Test provider timeouts and repeated notifications.

### Reconciliation

Verify that discrepancies can be identified and resolved.

---

## Operational Procedures

### Daily Review

Check relevant inventory exceptions.

### Receiving

Verify and record incoming stock.

### Product Launch

Confirm initial availability before publishing.

### Low Stock

Review replenishment requirements.

### Fulfillment

Ensure order-driven deductions are accurate.

### Cancellations

Confirm appropriate stock restoration.

### Returns

Inspect and classify returned merchandise.

### Physical Counts

Perform scheduled reconciliation.

### Corrections

Require documented adjustment reasons.

### Escalation

Report unresolved stock discrepancies to the designated manager.

---

## Implementation Roadmap

### Phase 0 — Discovery

Determine the current merchandise sourcing and fulfillment model.

### Phase 1 — Inventory Authority

Select the system responsible for stock.

### Phase 2 — Requirements

Confirm SKU, location, reservation, and adjustment needs.

### Phase 3 — Platform Evaluation

Review supported inventory capabilities.

### Phase 4 — Data Architecture

Define approved product and stock relationships.

### Phase 5 — Administrative Controls

Implement or configure authorized inventory operations.

### Phase 6 — Cart Integration

Connect checkout availability validation.

### Phase 7 — Payment Coordination

Define reservation and stock commitment behavior.

### Phase 8 — Fulfillment Integration

Coordinate stock changes with merchandise orders.

### Phase 9 — Reconciliation

Establish monitoring and correction procedures.

### Phase 10 — Testing

Validate concurrency, failure, and recovery scenarios.

### Phase 11 — Launch

Activate only after operational approval.

### Phase 12 — Optimization

Review actual inventory accuracy and operating costs.

---

## Acceptance Criteria

### Architecture

- [ ] Inventory authority documented.
- [ ] Fulfillment model confirmed.
- [ ] SKU policy approved.
- [ ] Data ownership defined.

### Stock Accuracy

- [ ] Product and variant mappings verified.
- [ ] Available quantities are authoritative.
- [ ] Stock adjustments are traceable.
- [ ] Physical reconciliation procedures documented.

### Checkout

- [ ] Availability is revalidated.
- [ ] Concurrent purchases are handled.
- [ ] Overselling safeguards are tested.
- [ ] Failed checkouts release stock appropriately.

### Orders

- [ ] Fulfillment deductions are accurate.
- [ ] Duplicate deductions are prevented.
- [ ] Cancellations restore stock when appropriate.
- [ ] Returns follow approved restocking rules.

### Administration

- [ ] Manager permissions are verified.
- [ ] Monitoring is operational.
- [ ] Staff training is complete.
- [ ] Ownership approves production use.

---

## Implementation Status

| Component | Status |
|---|---|
| Existing external merchandise experience | Established |
| Current inventory provider | Unverified |
| Inventory ownership | Pending confirmation |
| Fulfillment model | Pending confirmation |
| Native inventory architecture | Proposed |
| Inventory platform selection | Pending |
| SKU policy | Pending |
| Product and variant stock mapping | Proposed |
| Stock quantity definitions | Planning |
| Inventory locations | Pending requirements |
| Receiving workflow | Proposed |
| Stock adjustment workflow | Proposed |
| Inventory reservations | Conditional |
| Checkout stock validation | Proposed |
| Overselling prevention | Proposed |
| Payment and stock coordination | Pending architecture |
| Fulfillment stock deduction | Proposed |
| Cancellation stock restoration | Proposed |
| Returns and restocking | Proposed |
| Low-stock alerts | Optional |
| External inventory synchronization | Unconfirmed |
| Manager inventory interface | Proposed |
| Inventory audit trail | Proposed |
| Physical reconciliation process | Pending |
| Supabase inventory schema | Not established |
| Security review | Pending |
| Inventory testing | Not started |
| Native inventory production launch | Not approved |

### Overall Assessment

Merchandise inventory management remains in the planning stage.

The first implementation decision must identify who owns and manages inventory.

A custom Supabase inventory system should not be built unless the selected commerce and fulfillment architecture requires it.

---

## Related Documentation

### Merchandise Commerce

- [Merchandise Commerce Overview](README.md)
- [Commerce Architecture Overview](commerce-overview.md)
- [Product Catalog](product-catalog.md)
- [Cart and Checkout](cart-and-checkout.md)
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

### Project and Operations

- [Project Architecture](../01-project-overview/architecture.md)
- [Technology Stack](../01-project-overview/technology-stack.md)
- [Vercel Deployment](../07-deployment/vercel-deployment.md)
- [Rollback Procedures](../07-deployment/rollback-procedures.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Master Documentation Index](../README.md)

---

[Back to Merchandise Commerce Overview](README.md)
