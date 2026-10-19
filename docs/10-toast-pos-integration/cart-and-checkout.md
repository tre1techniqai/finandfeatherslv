# TOAST POS INTEGRATION — Cart and Checkout

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** Planning and Feasibility Evaluation

**Audience:** Restaurant Ownership, Managers, Developers, Technical Administrators, and Integration Partners

**Implementation Status:** External Toast ordering established; native website cart and checkout proposed

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Objectives](#objectives)
3. [Current Ordering Experience](#current-ordering-experience)
4. [Proposed Guest Journey](#proposed-guest-journey)
5. [Architecture Options](#architecture-options)
6. [Integration Prerequisites](#integration-prerequisites)
7. [Cart Data Model](#cart-data-model)
8. [Menu Item Selection](#menu-item-selection)
9. [Modifier Selection](#modifier-selection)
10. [Quantities and Item Notes](#quantities-and-item-notes)
11. [Cart State Management](#cart-state-management)
12. [Cart Persistence](#cart-persistence)
13. [Pricing Authority](#pricing-authority)
14. [Taxes and Service Charges](#taxes-and-service-charges)
15. [SPECIALS and Discounts](#specials-and-discounts)
16. [Item Availability](#item-availability)
17. [Cart Validation](#cart-validation)
18. [Checkout Entry](#checkout-entry)
19. [Guest Information](#guest-information)
20. [Fulfillment Options](#fulfillment-options)
21. [Pickup Scheduling](#pickup-scheduling)
22. [Checkout Handoff](#checkout-handoff)
23. [Payment Boundaries](#payment-boundaries)
24. [Order Review](#order-review)
25. [Order Submission](#order-submission)
26. [Confirmation and Receipt](#confirmation-and-receipt)
27. [Failure and Recovery](#failure-and-recovery)
28. [Mobile Experience](#mobile-experience)
29. [Accessibility](#accessibility)
30. [Security and Privacy](#security-and-privacy)
31. [Monitoring and Support](#monitoring-and-support)
32. [Testing and Acceptance](#testing-and-acceptance)
33. [Implementation Roadmap](#implementation-roadmap)
34. [Implementation Status](#implementation-status)
35. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the proposed cart and checkout experience for a potential direct integration between the Fin & Feathers Las Vegas website and Toast POS.

The restaurant currently directs guests to Toast's external online ordering experience.

A future integration may introduce a native cart, a more seamless checkout handoff, or an officially supported embedded ordering experience.

The appropriate architecture depends on Toast's confirmed integration capabilities, restaurant eligibility, contractual permissions, payment requirements, and operational needs.

This document defines proposed behavior, responsibilities, validation rules, and acceptance criteria.

It does not establish that Toast supports a custom cart, hosted checkout handoff, direct order submission, or native website payment processing for this restaurant.

## Objectives

### Improve Guest Convenience

Reduce unnecessary navigation between the restaurant website and the ordering experience.

### Preserve Brand Consistency

Present a cohesive experience aligned with the website's existing visual identity.

### Support Accurate Selections

Allow guests to choose valid items and modifiers.

### Protect Pricing Integrity

Use authoritative ordering-system calculations.

### Prevent Invalid Orders

Validate item identity, availability, and option requirements.

### Minimize Payment Risk

Prefer a supported checkout model that avoids direct website handling of sensitive card data.

### Prevent Duplicate Orders

Handle retries and uncertain outcomes safely.

### Support Mobile Guests

Prioritize responsive, touch-friendly interactions.

### Preserve Operational Reliability

Keep external Toast ordering available as a fallback until an approved replacement is operational.

## Current Ordering Experience

**Status:** Established operational baseline.

### Guest Flow

1. Guest opens `https://finandfeatherslv.live`.
2. Guest selects ORDER ONLINE.
3. Guest proceeds to Toast's external ordering experience.
4. Guest selects available menu items.
5. Guest completes checkout through Toast.
6. Toast processes the order according to the restaurant's configured workflow.

### Current Website Responsibilities

- Present the restaurant brand.
- Provide menu information.
- Direct guests to online ordering.

### Current Toast Responsibilities

- Present the external ordering experience.
- Handle supported item selection and checkout.
- Process orders within the restaurant's Toast configuration.

### Current Limitations

Website menu information and Toast ordering information may require separate administration.

### Operational Rule

Do not remove the existing ordering link before an alternative has been approved and tested.

## Proposed Guest Journey

A future guest journey could include:

### Step 1 — Browse

Guest opens the restaurant's menu.

### Step 2 — Select

Guest chooses an available menu item.

### Step 3 — Configure

Guest selects supported modifiers and quantities.

### Step 4 — Add

Guest adds the configured item to a cart.

### Step 5 — Review

Guest reviews selected items and estimated or authoritative charges.

### Step 6 — Fulfillment

Guest selects an approved fulfillment option.

### Step 7 — Checkout

Guest proceeds through the supported payment and order-acceptance workflow.

### Step 8 — Confirmation

Guest receives an accurate confirmation after authoritative acceptance.

### Important Qualification

This is a proposed user experience.

The final steps depend on the integration model actually supported and approved by Toast.

## Architecture Options

Several cart and checkout approaches are possible.

### Option A — External Toast Ordering

Retain the current redirect.

**Advantages:** Lowest custom-ordering complexity and established workflow.

**Limitations:** Ordering occurs outside the website.

### Option B — Supported Hosted Checkout

A website cart might transfer an order to an officially supported hosted checkout, if Toast provides and authorizes such a mechanism.

**Important:** The availability of cart transfer must be verified. A normal ordering URL does not establish that selected items can be transferred.

### Option C — Supported Embedded Ordering

Use an officially permitted embedded experience if available.

Browser, payment, and vendor restrictions must be reviewed.

### Option D — Custom Cart and Order Submission

Build a website cart and use approved Toast interfaces for order creation and payment.

This option has the greatest integration and operational complexity.

### Decision

Select the least complex supported approach that meets restaurant requirements.

## Integration Prerequisites

Before implementing a native cart or checkout, confirm:

### Toast Eligibility

The restaurant qualifies for the required integration access.

### Menu Access

Authorized menu data can be retrieved or mapped.

### Item Identity

Valid Toast ordering identifiers are available.

### Modifier Support

Required options and constraints can be represented.

### Pricing

An authoritative pricing and total-calculation approach exists.

### Availability

The selected workflow can handle unavailable items.

### Order Submission

The integration may create orders if needed.

### Payment Model

An approved payment flow is available.

### Testing Environment

Safe, authorized integration testing is possible.

### Commercial Approval

Ownership accepts the applicable costs and obligations.

### Decision Gate

Do not implement production checkout before these dependencies are resolved.

## Cart Data Model

A future cart needs a structured representation of guest selections.

### Cart Identifier

A non-sensitive identifier may distinguish one cart from another.

### Cart Items

Each line represents a selected menu item and configuration.

### Item Reference

Use a stable internal identifier and, where necessary, an approved Toast mapping.

### Quantity

Store a valid positive quantity.

### Modifiers

Preserve selected option identifiers and quantities.

### Item Notes

Store supported guest instructions where permitted.

### Price Snapshot

Display values may be recorded for presentation, but they must not override authoritative checkout pricing.

### Fulfillment

Store the guest's selected supported fulfillment mode.

### State

Distinguish editable, validating, checkout-pending, and completed states.

### Schema Boundary

These are proposed data requirements, not assertions about existing database tables.

## Menu Item Selection

Guests should select items from the approved menu presentation.

### Identity

Use stable item identifiers rather than names alone.

### Name

Display the approved guest-facing item name.

### Description

Show relevant restaurant-approved information.

### Image

Display approved food photography when available.

### COCKTAILS

Do not require images for COCKTAILS.

### Category

Use the approved spreadsheet categories and subcategories.

### HOOKAH

Do not introduce a HOOKAH category filter.

### Price

Show approved pricing information.

### Availability

Prevent unsupported selections where reliable availability information exists.

### Validation

Revalidate item identity before checkout.

## Modifier Selection

Modifiers can affect both the kitchen instructions and order price.

### Groups

Present the correct modifier groups for each item.

### Required Options

Enforce minimum selection requirements.

### Optional Options

Allow valid additions.

### Maximum Selections

Prevent selections exceeding supported limits.

### Surcharges

Display applicable charges.

### Defaults

Apply only confirmed default selections.

### Item Associations

Do not attach a modifier to an unrelated item.

### Nested Options

Support nested choices only if the selected integration requires and permits them.

### Submission

Use the authoritative modifier identifiers.

### Acceptance

Test representative menu items with multiple option combinations.

## Quantities and Item Notes

### Quantity Controls

Allow guests to increase or decrease quantities within supported limits.

### Minimum Quantity

Prevent zero or negative submitted quantities.

### Maximum Quantity

Apply confirmed operational restrictions where necessary.

### Per-Line Configuration

Treat differently configured instances of the same item as separate lines when appropriate.

### Guest Notes

Collect special instructions only where supported.

### Note Length

Enforce reasonable limits based on the selected integration.

### Safety

Do not represent free-text notes as guaranteed accommodations.

### Allergies

Provide clear restaurant-approved allergy guidance; do not assume the cart can guarantee allergen safety.

### Recalculation

Update displayed totals after quantity or modifier changes.

### Verification

Confirm the final review accurately reflects each configured item.

## Cart State Management

Cart state must remain predictable.

### Add Item

Insert a valid configured selection.

### Update Item

Modify supported selections.

### Remove Item

Remove the intended line.

### Clear Cart

Require appropriate user intent before discarding selections.

### Recalculate

Update displayed amounts after changes.

### Validation State

Distinguish valid and invalid selections.

### Checkout State

Prevent conflicting edits during critical submission steps.

### Completion State

Do not allow a completed order to be resubmitted accidentally.

### Error State

Preserve recoverable selections when possible.

### Implementation Boundary

No native restaurant-order cart is established as deployed.

## Cart Persistence

Persistence affects convenience and privacy.

### In-Memory State

Cart data may exist only during the active session.

### Browser Persistence

A future implementation may retain non-sensitive selections locally.

### Server Persistence

A server-managed cart may be appropriate for an authorized integration.

### Expiration

Define how long inactive carts remain valid.

### Stale Prices

Revalidate prices after an extended delay.

### Stale Availability

Recheck whether selected items remain orderable.

### Privacy

Avoid unnecessary personal information in persistent cart data.

### Device Changes

Cross-device persistence should not be assumed.

### Recovery

Restore selections only when they remain valid.

### Decision

Choose persistence after defining checkout architecture and privacy requirements.

## Pricing Authority

Pricing must not be controlled by the browser.

### Displayed Price

The website may show a menu price.

### Ordering Price

Toast or another approved checkout authority determines the valid ordering amount.

### Base Price

Use the correct item-specific amount.

### Modifiers

Apply authoritative option charges.

### Quantity

Calculate extensions accurately.

### Market Price

Do not invent fixed amounts for MKT items.

### Currency

Use a consistent currency representation.

### Precision

Avoid unsafe floating-point money calculations.

### Price Changes

Notify guests when authoritative prices differ from earlier displayed values.

### Acceptance

Confirm final checkout pricing using authorized test transactions.

## Taxes and Service Charges

Taxes and service charges require explicit separation.

### Taxes

The checkout system must calculate applicable taxes according to its supported configuration.

### Ordering Fees

Any pickup, delivery, or platform fees must come from the approved ordering workflow.

### Restaurant House Rules

The restaurant's published service policy states that a 20% service charge applies to checks over $100 and parties of six or more.

### Integration Question

Determine whether and how that policy applies to online orders.

### No Automatic Assumption

Do not automatically impose the dine-in service policy on online checkout without management approval and verified POS configuration.

### Transparency

Display applicable charges clearly before payment.

### Calculation Authority

Do not invent tax or fee rules in client code.

### Testing

Verify threshold behavior and applicable charges.

### Reconciliation

Confirm that displayed totals match the accepted transaction.

## SPECIALS and Discounts

### Existing Website Control

The menu editor includes an existing $5 specials toggle.

### Verification

The exact effect of that toggle requires source-code confirmation.

### Planned Scheduling

Future weekday SPECIALS may highlight approved existing menu items.

### Example

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

### Cart Presentation

Display approved promotions clearly.

### Discount Authority

The ordering system must determine applicable checkout discounts.

### Conflicting Promotions

Avoid unintended discount stacking.

### Expiration

Revalidate promotions at checkout.

### Timezone

Use the restaurant's local operating timezone.

### Important Rule

A website promotional label does not establish that Toast will apply the same discount.

## Item Availability

### Current Availability

Determine whether the selected item is orderable.

### Sold-Out Items

Prevent unsupported ordering attempts.

### Unavailable Modifiers

Reject invalid option combinations.

### Time Restrictions

Respect confirmed ordering schedules.

### Menu Changes

Revalidate selections if the underlying menu changes.

### Checkout Validation

Check availability at the appropriate authoritative stage.

### Recovery

Allow guests to remove or replace unavailable items.

### Guest Messaging

Explain why a selection can no longer be ordered.

### Fallback

Direct guests to the supported ordering experience when necessary.

### API Boundary

Real-time Toast availability access remains unconfirmed.

## Cart Validation

Validation should occur at multiple points.

### Selection Validation

Verify the selected item exists.

### Modifier Validation

Enforce required and maximum choices.

### Quantity Validation

Reject invalid quantities.

### Price Validation

Use authoritative calculations.

### Availability Validation

Reject unsupported selections.

### Fulfillment Validation

Confirm that the requested service option is available.

### Guest Information Validation

Require only necessary fields.

### Server Validation

Never rely solely on browser checks.

### Error Reporting

Provide actionable corrections.

### Acceptance

Test invalid and tampered requests.

## Checkout Entry

Checkout begins when the guest chooses to finalize the cart.

### Preflight Validation

Review all selected items.

### Price Refresh

Obtain updated authoritative pricing when supported.

### Availability Refresh

Check current orderability.

### Fulfillment Review

Confirm the selected fulfillment option.

### Guest Information

Collect required information through the approved flow.

### Payment Path

Determine the supported checkout destination.

### Duplicate Protection

Prevent multiple simultaneous checkout attempts.

### State Transition

Mark the cart appropriately while checkout begins.

### Failure

Return to an editable state when safe.

### Implementation Boundary

No native checkout entry workflow is established as deployed.

## Guest Information

Guest information requirements depend on the selected integration.

### Name

Collect when required.

### Contact Details

Collect only supported and necessary information.

### Pickup Contact

Determine whether phone or email is required.

### Delivery Details

Collect an address only if delivery is supported.

### Special Instructions

Use supported fields.

### Privacy

Explain relevant data usage.

### Retention

Avoid storing unnecessary personal information.

### Validation

Apply appropriate formatting and required-field checks.

### Security

Protect information in transit and at rest.

### Consent

Obtain consent where required for optional communications.

## Fulfillment Options

Only offer fulfillment modes supported by the restaurant and the chosen integration.

### Pickup

Confirm whether pickup is supported.

### Delivery

Do not offer delivery without operational and vendor confirmation.

### Dine-In

Do not assume dine-in ordering is supported through the same API.

### Scheduled Orders

Verify whether future ordering is available.

### Preparation Time

Use authoritative estimates where available.

### Location

Confirm the correct restaurant location.

### Hours

Respect the configured ordering schedule.

### Cutoff

Handle ordering cutoffs appropriately.

### Fees

Display supported fulfillment-related charges.

### Acceptance

Test each approved fulfillment mode separately.

## Pickup Scheduling

Scheduling must reflect actual restaurant capabilities.

### Immediate Pickup

Use supported preparation estimates.

### Future Pickup

Offer only if the ordering system permits scheduling.

### Timezone

Use the restaurant's local timezone.

### Operating Hours

Respect applicable ordering hours.

### Lead Time

Use approved preparation requirements.

### Maximum Advance Window

Use confirmed Toast or restaurant ordering limits.

### Closed Periods

Prevent unsupported times.

### Capacity

Consider any vendor-supported capacity restrictions.

### Changes

Handle unavailable pickup slots before final submission.

### Qualification

Do not reuse reservation scheduling rules as online-order scheduling rules without explicit approval.

## Checkout Handoff

A handoff may be preferable to custom payment collection.

### Existing Handoff

The website links to external Toast ordering.

### Proposed Enhanced Handoff

A future integration might transfer a prepared cart to a supported hosted checkout.

### Critical Dependency

Toast must explicitly support the transfer mechanism.

### Item Mapping

All transferred items must use valid ordering identifiers.

### Modifiers

Selected options must remain intact.

### Pricing

The destination must calculate authoritative totals.

### Return URL

Use only officially supported return behavior.

### Abandoned Checkout

Define what happens when the guest leaves checkout.

### Confirmation

Do not infer payment success from a browser redirect alone.

### Fallback

Retain the established external ordering link.

## Payment Boundaries

### Current Payment Experience

Toast manages payment through external ordering.

### Future Payment Architecture

Must be approved and supported.

### Cardholder Data

Avoid collecting or storing raw card details in the website.

### Credentials

Keep privileged payment credentials server-side.

### PCI Scope

Assess applicable compliance responsibilities.

### Authorization

Use the approved payment processor and flow.

### Capture

Define when funds are captured.

### Refunds

Confirm supported refund handling.

### Duplicate Charges

Protect against repeated payment attempts.

### Reconciliation

Ensure payment and order status remain consistent.

### Implementation Boundary

Native restaurant-order payment processing is not implemented.

## Order Review

The guest should review the complete order before final submission.

### Item Names

Display recognizable item titles.

### Quantities

Show each selected quantity.

### Modifiers

Display all relevant options.

### Item Notes

Show supported instructions.

### Subtotal

Display an accurate amount or clearly identified estimate.

### Taxes and Fees

Show applicable charges when known.

### Discounts

Display confirmed promotions.

### Fulfillment

Show the selected service method.

### Total

Use authoritative checkout totals.

### Confirmation Action

Make the final action unambiguous.

## Order Submission

Direct submission requires verified Toast API permissions.

### Server-Side Operation

Submit through a trusted integration layer.

### Authorization

Use approved Toast credentials.

### Item Mapping

Use valid external identifiers.

### Validation

Reject malformed or stale carts.

### Idempotency

Use vendor-supported duplicate-prevention mechanisms.

### Timeout

Distinguish uncertain submission status from rejection.

### Accepted Order

Record the authoritative confirmation.

### Rejected Order

Provide a clear correction path.

### Unknown State

Investigate before retrying.

### Important Boundary

Direct Toast order submission is not established as implemented.

## Confirmation and Receipt

Confirmation must accurately reflect the ordering system.

### Accepted

Display success only after authoritative acceptance.

### Reference

Show a supported order reference when available.

### Summary

Present the accepted order details.

### Fulfillment

Show confirmed pickup or delivery information.

### Payment

Show the supported payment status.

### Receipt

Use an approved receipt mechanism.

### Email or SMS

Send notifications only through authorized workflows.

### Pending

Clearly distinguish pending from confirmed.

### Failure

Do not issue a success message for a rejected order.

### Recovery

Provide a support path for uncertain outcomes.

## Failure and Recovery

### Network Interruption

Preserve recoverable cart information.

### Item Unavailable

Prompt the guest to revise the cart.

### Price Changed

Require review of the updated amount.

### Invalid Modifier

Identify the affected selection.

### Checkout Unavailable

Offer the approved fallback.

### Payment Failed

Follow the supported payment recovery flow.

### Submission Rejected

Explain that the order was not accepted.

### Submission Unknown

Do not automatically submit again.

### Duplicate Prevention

Track attempts according to the supported integration design.

### Operational Escalation

Provide a process for investigating unresolved order states.

## Mobile Experience

The website follows a mobile-first design approach.

### Touch Targets

Provide appropriately sized controls.

### Menu Selection

Keep item options readable.

### Modifier Controls

Make required choices clear.

### Cart Access

Provide an obvious way to review the cart.

### Quantity Editing

Support touch-friendly adjustments.

### Checkout Progress

Show clear progress and loading states.

### Keyboard Behavior

Prevent form fields from becoming inaccessible.

### Error Messages

Display errors near the affected controls.

### Performance

Test on slower mobile connections.

### Acceptance

Verify the complete flow on representative mobile devices.

## Accessibility

The proposed ordering experience should be usable with assistive technology.

### Semantic Controls

Use appropriate buttons, labels, and form elements.

### Keyboard Navigation

Support keyboard-only interaction.

### Focus Management

Manage focus in dialogs and checkout transitions.

### Screen Readers

Provide meaningful labels and status announcements.

### Required Fields

Identify required selections clearly.

### Validation

Explain errors in accessible text.

### Contrast

Maintain readable contrast.

### Motion

Respect reduced-motion preferences.

### Touch Accessibility

Avoid overly small interactive elements.

### Testing

Include keyboard and assistive-technology checks.

## Security and Privacy

### Client Trust

Treat browser-submitted data as untrusted.

### Server Validation

Validate all sensitive operations server-side.

### Credential Protection

Never expose Toast secrets in public code.

### Price Integrity

Reject client-controlled authoritative totals.

### Input Sanitization

Handle user-provided notes safely.

### Personal Information

Collect only what is necessary.

### Data Retention

Define appropriate retention limits.

### Session Security

Protect cart and checkout session identifiers.

### Logging

Redact sensitive information.

### Payment Compliance

Use an approved architecture with documented responsibilities.

## Monitoring and Support

A future checkout integration requires operational visibility.

### Cart Errors

Track meaningful application failures.

### Validation Failures

Identify recurring invalid selections.

### Checkout Failures

Monitor handoff and payment problems.

### Submission Failures

Detect rejected and uncertain orders.

### Duplicate Attempts

Monitor repeat submissions.

### Performance

Measure critical request latency.

### Vendor Availability

Track relevant Toast integration errors.

### Alerts

Notify responsible personnel of material incidents.

### Privacy

Avoid sensitive data in diagnostic logs.

### Support Workflow

Establish a clear restaurant escalation process.

## Testing and Acceptance

### Menu Selection

- [ ] Approved items display correctly.
- [ ] Categories and subcategories are accurate.
- [ ] COCKTAILS work without images.
- [ ] No HOOKAH filter is introduced.

### Cart

- [ ] Items can be added.
- [ ] Quantities can be changed.
- [ ] Items can be removed.
- [ ] Modifier constraints are enforced.
- [ ] Invalid selections are rejected.

### Pricing

- [ ] Base prices are correct.
- [ ] Modifier surcharges are correct.
- [ ] Market-price behavior is defined.
- [ ] Taxes and fees are verified.
- [ ] Discounts match authoritative checkout rules.

### Checkout

- [ ] Supported fulfillment options work.
- [ ] Guest information is validated.
- [ ] Payment handling is approved.
- [ ] Order acceptance is confirmed authoritatively.
- [ ] Duplicate submission protection is tested.

### Reliability

- [ ] Network interruption is handled.
- [ ] Unknown submission states are handled.
- [ ] The external ordering fallback works.

### Accessibility

- [ ] Mobile usability passes.
- [ ] Keyboard navigation passes.
- [ ] Validation messages are accessible.

### Evidence

Do not mark acceptance items complete without actual testing.

## Implementation Roadmap

### Stage 1 — Toast Feasibility

Confirm access, permissions, and supported checkout models.

### Stage 2 — Requirements

Approve the intended guest experience.

### Stage 3 — Architecture Selection

Choose external, hosted, embedded, hybrid, or custom ordering.

### Stage 4 — Data Mapping

Map menu items and modifiers.

### Stage 5 — Cart Prototype

Build a controlled demonstration if authorized.

### Stage 6 — Pricing and Availability

Integrate supported validation.

### Stage 7 — Checkout Integration

Implement the approved handoff or payment flow.

### Stage 8 — Order Submission

Add direct submission only if authorized and required.

### Stage 9 — Security Review

Validate credentials, privacy, and payment boundaries.

### Stage 10 — Failure Testing

Test timeouts, rejected orders, and uncertain states.

### Stage 11 — Staff Acceptance

Confirm operational fit with restaurant personnel.

### Stage 12 — Production Decision

Release only after formal approval.

### Fallback

Preserve the current Toast ordering link until the new flow is accepted.

## Implementation Status

| Capability | Status |
|---|---|
| External Toast ordering link | Established |
| Website menu presentation | Implemented |
| Protected menu administration | Implemented |
| Supabase menu database | Implemented |
| Menu image management | Implemented |
| Toast API eligibility | Unconfirmed |
| Toast menu data access | Unconfirmed |
| Toast modifier data access | Unconfirmed |
| Toast availability access | Unconfirmed |
| Native cart | Proposed |
| Cart persistence | Proposed |
| Cart validation | Proposed |
| Authoritative checkout pricing integration | Unconfirmed |
| Supported fulfillment integration | Unconfirmed |
| Hosted checkout handoff | Unconfirmed |
| Embedded checkout | Unconfirmed |
| Direct order submission | Unconfirmed |
| Order-status retrieval | Unconfirmed |
| Native payment processing | Not implemented |
| Duplicate-order safeguards | Proposed |
| Checkout monitoring | Proposed |
| Accessibility acceptance | Pending |
| Security review | Pending |
| End-to-end testing | Not started |
| Production native checkout | Not implemented |

## Related Documentation

- [Toast POS Integration Overview](README.md)
- [Integration Architecture](integration-overview.md)
- [API Feasibility](api-feasibility.md)
- [Menu Synchronization](menu-synchronization.md)
- [Order Submission](order-submission.md)
- [Payment Processing](payment-processing.md)
- [Security and Compliance](security-and-compliance.md)
- [Cost Analysis](cost-analysis.md)
- [Implementation Roadmap](implementation-roadmap.md)
- [Website Overview](../02-website/README.md)
- [Website Menu System](../02-website/menu-system.md)
- [Website SPECIALS Overview](../02-website/specials/specials-overview.md)
- [Admin Menu Management](../04-admin-dashboard/menu-management.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Menu Management Overview](../09-menu-management/README.md)
- [Categories and Subcategories](../09-menu-management/categories-and-subcategories.md)
- [Pricing and Modifiers](../09-menu-management/pricing-and-modifiers.md)
- [SPECIALS Management](../09-menu-management/specials-management.md)
- [Master Documentation Index](../README.md)

---

[Back to Toast POS Integration Overview](README.md)
