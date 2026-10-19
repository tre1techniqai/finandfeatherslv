# TOAST POS INTEGRATION — Order Submission

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** Planning and Feasibility Evaluation

**Audience:** Restaurant Ownership, Managers, Developers, Technical Administrators, and Integration Partners

**Implementation Status:** External Toast ordering established; direct order submission not implemented or authorized as confirmed

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Order Submission Objectives](#order-submission-objectives)
3. [Current Ordering Baseline](#current-ordering-baseline)
4. [Integration Boundaries](#integration-boundaries)
5. [Toast API Prerequisites](#toast-api-prerequisites)
6. [Proposed Submission Architecture](#proposed-submission-architecture)
7. [Order Lifecycle](#order-lifecycle)
8. [Order Data Requirements](#order-data-requirements)
9. [Restaurant Identification](#restaurant-identification)
10. [Menu Item Mapping](#menu-item-mapping)
11. [Modifier Validation](#modifier-validation)
12. [Quantity and Instructions](#quantity-and-instructions)
13. [Pricing and Totals](#pricing-and-totals)
14. [SPECIALS and Discounts](#specials-and-discounts)
15. [Fulfillment Information](#fulfillment-information)
16. [Guest Information](#guest-information)
17. [Server-Side Validation](#server-side-validation)
18. [Submission Authorization](#submission-authorization)
19. [Submission Workflow](#submission-workflow)
20. [Idempotency and Duplicate Prevention](#idempotency-and-duplicate-prevention)
21. [Timeouts and Unknown Outcomes](#timeouts-and-unknown-outcomes)
22. [Order Acceptance and Rejection](#order-acceptance-and-rejection)
23. [Order Confirmation](#order-confirmation)
24. [Order Status and Reconciliation](#order-status-and-reconciliation)
25. [Payment and Order Consistency](#payment-and-order-consistency)
26. [Error Handling](#error-handling)
27. [Recovery and Escalation](#recovery-and-escalation)
28. [Security and Privacy](#security-and-privacy)
29. [Logging and Monitoring](#logging-and-monitoring)
30. [Restaurant Staff Workflows](#restaurant-staff-workflows)
31. [Testing Scenarios](#testing-scenarios)
32. [Acceptance Criteria](#acceptance-criteria)
33. [Operational Risks](#operational-risks)
34. [Implementation Roadmap](#implementation-roadmap)
35. [Implementation Status](#implementation-status)
36. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed architecture, validation requirements, operational safeguards, and acceptance criteria for submitting restaurant orders from the Fin & Feathers Las Vegas website to Toast POS.

Order submission is one of the highest-risk elements of a potential direct POS integration.

A guest may successfully complete a website interaction while the restaurant never receives an order.

Conversely, an interrupted network request may cause the website to report failure even though the restaurant has accepted the order.

If the website automatically retries that request without checking its outcome, duplicate orders or charges may result.

The integration must distinguish these conditions accurately.

### Primary Principle

**A website action is not proof that Toast accepted an order.**

The system must rely on the authoritative ordering platform for acceptance and confirmation.

### Documentation Boundary

This document describes a proposed integration.

It does not establish that the restaurant has Toast API credentials, order-creation permissions, a supported payment workflow, or a deployed direct ordering service.

## Order Submission Objectives

### Accurate Submission

Transmit only valid, supported order information.

### Correct Restaurant

Ensure every order targets the intended Fin & Feathers location.

### Correct Items

Use authorized menu identifiers and valid item configurations.

### Accurate Pricing

Rely on the approved ordering authority for final totals.

### Reliable Confirmation

Report success only when the authoritative system confirms acceptance.

### Duplicate Prevention

Avoid creating repeated orders from the same guest action.

### Recoverable Failures

Preserve enough non-sensitive information to investigate uncertain outcomes.

### Operational Visibility

Allow authorized personnel to identify and resolve submission problems.

### Payment Consistency

Ensure payment state and order state are reconciled appropriately.

### Safe Fallback

Preserve the established external Toast ordering option when the direct integration is unavailable.

## Current Ordering Baseline

### Website

    https://finandfeatherslv.live

### Framework

    Next.js App Router

### Database

    Supabase PostgreSQL

### Authentication

    Supabase Auth

### Hosting

    Vercel

### Current Ordering

Guests select ORDER ONLINE and proceed to the external Toast ordering experience.

### Current Responsibility

Toast manages ordering through its configured external workflow.

### Current Website Role

The website directs guests to that workflow.

### Direct Submission

No direct Toast order-submission functionality is established as implemented.

### Preservation Requirement

The existing ordering link must remain available until a replacement is approved and tested.

## Integration Boundaries

Direct order submission introduces new responsibilities.

### Website Interface

The website may collect guest selections through a proposed cart.

### Server Integration

A trusted server component would validate requests and communicate with an authorized Toast interface.

### Toast

Toast would perform only those order operations officially supported for the restaurant's approved integration.

### Database

Supabase may hold necessary non-sensitive submission metadata if an approved architecture requires it.

### Payment Provider

Payment responsibilities depend on the authorized checkout model.

### Restaurant Staff

Staff handle accepted orders according to the restaurant's operational procedures.

### Vendor Restrictions

Do not assume all Toast APIs are available to every restaurant.

### Production Restriction

Do not submit experimental orders to a live restaurant without explicit authorization.

## Toast API Prerequisites

Before implementation, confirm the following.

### Account Eligibility

The restaurant qualifies for the required Toast integration arrangement.

### API Credentials

Authorized credentials can be issued.

### Order-Creation Capability

The approved integration permits order submission.

### Menu Identifiers

Valid ordering identifiers are available.

### Modifier Support

Required modifier structures are supported.

### Fulfillment Support

The desired order type is permitted.

### Payment Model

The required payment and order sequence is supported.

### Status Retrieval

A reliable method exists to determine submission outcomes.

### Testing Access

An authorized testing environment is available.

### Commercial Approval

Restaurant ownership approves the costs and obligations.

### Decision Gate

Do not build production submission logic before the necessary permissions and capabilities are verified.

## Proposed Submission Architecture

A potential architecture separates browser interactions from privileged vendor operations.

### Conceptual Flow

    Guest Browser
          |
          v
    Website Cart
          |
          v
    Next.js Server Validation
          |
          v
    Approved Toast Integration
          |
          v
    Authoritative Order Result
          |
          v
    Guest Confirmation

### Browser Responsibility

Collect selections and display status.

### Server Responsibility

Validate data, protect credentials, and manage submission attempts.

### Toast Responsibility

Accept or reject orders according to its supported interface.

### Database Responsibility

Store necessary submission metadata if approved.

### Monitoring Responsibility

Identify rejected and uncertain transactions.

### Important Qualification

This is a conceptual design, not a verified Toast endpoint or API contract.

## Order Lifecycle

A proposed order lifecycle should distinguish several states.

### Draft

The guest is still editing selections.

### Validating

The server is checking the order.

### Ready

The order satisfies local requirements.

### Submitting

An authorized submission attempt is in progress.

### Accepted

The authoritative ordering system confirms acceptance.

### Rejected

The authoritative system explicitly declines the order.

### Unknown

The submission outcome cannot yet be determined.

### Reconciled

An uncertain outcome has been resolved using authoritative evidence.

### Completed

The ordering process has reached the appropriate final state.

### Design Requirement

State transitions must be explicit and auditable.

### Schema Boundary

These are conceptual states, not claims about existing database columns.

## Order Data Requirements

An order request may require several categories of information.

### Restaurant Identifier

The intended location.

### Menu Items

Valid ordering item references.

### Quantities

Supported positive quantities.

### Modifiers

Valid option selections.

### Fulfillment

An approved service method.

### Guest Information

Only the fields required by the selected workflow.

### Instructions

Supported special instructions.

### Pricing Context

Information needed for authoritative calculation.

### Submission Reference

A stable identifier for tracking attempts.

### Payment Context

Only the information permitted by the approved payment architecture.

### Verification

The exact request schema must come from current authorized Toast documentation.

## Restaurant Identification

Orders must be routed to the correct restaurant.

### Account

Identify the authorized Toast account.

### Location

Confirm the intended Fin & Feathers Las Vegas location.

### Identifier

Use the approved Toast restaurant or location identifier.

### Configuration

Keep location configuration under appropriate server-side control.

### Validation

Reject requests with unexpected restaurant identifiers.

### Multi-Location Risk

Do not assume credentials are limited to one location.

### Testing

Confirm test orders reach only the intended testing location.

### Production

Verify the production destination before enabling submissions.

### Monitoring

Include a safe location reference in operational diagnostics.

### Acceptance

Obtain restaurant confirmation of the correct destination.

## Menu Item Mapping

Website items and Toast items may use different identifiers.

### Website Item

A record in the existing menu system.

### Toast Item

The corresponding orderable object in Toast.

### Mapping

Associate the two using a verified relationship.

### Name Differences

Do not match solely on guest-facing names.

### Duplicate Names

Distinguish similarly named items.

### Removed Items

Reject obsolete identifiers.

### Availability

Ensure mapped items are currently orderable.

### Category

Preserve the approved website taxonomy.

### HOOKAH

Do not introduce a HOOKAH category filter.

### COCKTAILS

Do not require images for COCKTAILS.

### Acceptance

Verify representative mappings against authorized Toast data.

## Modifier Validation

Modifier rules must match the authoritative ordering configuration.

### Group Identity

Use the correct modifier group.

### Option Identity

Use valid option identifiers.

### Required Selections

Enforce minimum requirements.

### Maximum Selections

Prevent excessive choices.

### Quantity

Validate modifier quantities where applicable.

### Surcharges

Use authoritative price adjustments.

### Unavailable Options

Reject unavailable modifiers.

### Unrelated Options

Prevent modifiers from being applied to unrelated items.

### Server Validation

Do not trust browser-side modifier checks alone.

### Acceptance

Test complex modifier combinations before production release.

## Quantity and Instructions

### Item Quantity

Require supported positive quantities.

### Maximum Quantity

Apply confirmed operational limits.

### Per-Item Configuration

Preserve differences between separately configured instances.

### Special Instructions

Use only supported instruction fields.

### Length Limits

Follow the authorized interface's constraints.

### Character Validation

Handle supported punctuation and Unicode safely.

### Kitchen Clarity

Avoid transforming notes in ways that change meaning.

### Allergies

Do not imply that free-text notes guarantee allergy accommodation.

### Submission

Confirm that accepted instructions reach the intended workflow.

### Acceptance

Test representative quantities and notes.

## Pricing and Totals

Final pricing must come from an approved authoritative source.

### Base Price

Use the current orderable item price.

### Modifiers

Include applicable option charges.

### Quantity

Calculate extensions correctly.

### Taxes

Use the supported tax calculation process.

### Fees

Apply approved ordering charges.

### Discounts

Use supported promotional rules.

### Market Price

Do not invent prices for MKT items.

### Client Data

Never accept browser-submitted totals as authoritative.

### Changed Prices

Require appropriate guest review before payment or final submission.

### Acceptance

Verify accepted order totals against the approved checkout workflow.

## SPECIALS and Discounts

The website includes an existing $5 specials toggle.

### Exact Behavior

The toggle's semantics require source-code verification.

### Future Scheduling

Day-of-week SPECIALS scheduling is planned.

### Example

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

### Presentation

The website may advertise approved specials.

### Ordering

A displayed special must not be assumed to alter Toast checkout pricing.

### Discount Authority

Use only supported ordering-system promotion rules.

### Stacking

Prevent unintended combinations of discounts.

### Expiration

Validate promotion eligibility at submission time.

### Timezone

Use the restaurant's local timezone.

### Acceptance

Verify actual discounted totals through authorized testing.

## Fulfillment Information

The submission must describe a supported fulfillment method.

### Pickup

Confirm whether pickup orders are supported.

### Delivery

Do not offer delivery without operational and vendor approval.

### Dine-In

Do not assume dine-in submission uses the same workflow.

### Scheduling

Use only supported order scheduling capabilities.

### Preparation Time

Follow approved estimates.

### Location

Associate the order with the correct restaurant.

### Cutoff

Respect ordering hours and cutoff rules.

### Instructions

Use supported fulfillment instructions.

### Validation

Reject unsupported combinations.

### Acceptance

Test each approved fulfillment mode independently.

## Guest Information

Only necessary guest details should be transmitted.

### Name

Collect when required.

### Phone

Collect if required by the ordering workflow.

### Email

Collect if required for confirmation or receipt.

### Address

Collect only for supported delivery scenarios.

### Instructions

Transmit only supported information.

### Consent

Respect applicable communication requirements.

### Privacy

Explain how required information is used.

### Retention

Avoid unnecessary storage.

### Logging

Do not expose personal information in diagnostic logs.

### Acceptance

Verify required fields against the approved Toast interface.

## Server-Side Validation

The server must independently validate the proposed order.

### Item Existence

Verify each item.

### Item Mapping

Confirm valid Toast references.

### Quantity

Reject invalid values.

### Modifiers

Enforce option requirements.

### Availability

Check current orderability where supported.

### Pricing

Use the authoritative calculation process.

### Fulfillment

Validate supported service options.

### Guest Information

Validate required fields.

### Request Integrity

Reject malformed or tampered submissions.

### Failure Behavior

Return clear, non-sensitive errors without creating an order.

## Submission Authorization

Only an approved server integration should submit orders.

### Toast Credentials

Use authorized credentials.

### Credential Storage

Keep secrets server-side.

### Environment Variables

Use protected configuration.

### Source Control

Do not commit `.env.local`.

### Browser Exposure

Never send privileged credentials to the browser.

### Permission Scope

Request only necessary API permissions.

### Restaurant Scope

Restrict operations to approved locations.

### Access Revocation

Document credential revocation.

### Logging

Redact authorization information.

### Verification

Test denied operations as well as successful authorization.

## Submission Workflow

A proposed controlled workflow may follow these steps.

### Step 1 — Receive Request

Accept the guest's checkout action.

### Step 2 — Identify Attempt

Associate the action with a stable submission reference.

### Step 3 — Validate Cart

Check items, quantities, and modifiers.

### Step 4 — Confirm Location

Verify the intended restaurant.

### Step 5 — Validate Fulfillment

Check the supported order type.

### Step 6 — Verify Pricing

Use the authoritative calculation model.

### Step 7 — Check Prior Attempts

Determine whether the order was already submitted.

### Step 8 — Submit

Call the authorized Toast interface.

### Step 9 — Interpret Response

Distinguish accepted, rejected, and unknown outcomes.

### Step 10 — Record Result

Persist approved non-sensitive status metadata where required.

### Step 11 — Inform Guest

Display only the supported authoritative result.

### Step 12 — Escalate Uncertainty

Investigate ambiguous outcomes before retrying.

## Idempotency and Duplicate Prevention

Duplicate prevention is a critical operational safeguard.

### Problem

Guests may click repeatedly or retry after a timeout.

### Risk

Multiple submissions may create duplicate restaurant orders.

### Submission Reference

Assign a stable reference to the logical order attempt.

### Vendor Support

Determine whether Toast supports idempotency keys or equivalent safeguards.

### Local Protection

Prevent concurrent duplicate processing where appropriate.

### Retry Behavior

Follow the approved API's documented retry semantics.

### Unknown Outcome

Do not treat a timeout as proof that no order was created.

### Reconciliation

Check authoritative status before resubmission.

### Guest Messaging

Explain that an order may still be processing.

### Acceptance

Test repeated clicks, retries, and interrupted connections.

## Timeouts and Unknown Outcomes

A timeout creates uncertainty, not necessarily failure.

### Scenario

The website sends an order request.

### Interruption

The network connection fails before the response arrives.

### Possible Outcome A

Toast never received the request.

### Possible Outcome B

Toast received but rejected the request.

### Possible Outcome C

Toast accepted the request.

### Required Response

Mark the result as unknown until verified.

### Guest Messaging

Avoid both false success and false rejection.

### Reconciliation

Use supported order lookup or vendor procedures.

### Retry Restriction

Do not blindly resubmit.

### Escalation

Provide a defined process for unresolved cases.

## Order Acceptance and Rejection

### Accepted

The authoritative ordering system confirms that the order exists and has been accepted.

### Rejected

The authoritative system explicitly rejects the request.

### Local Validation Failure

The website rejects invalid data before contacting Toast.

### Transport Failure

The request cannot be completed reliably.

### Unknown Result

The outcome remains unverified.

### Response Interpretation

Use the approved Toast API contract.

### Error Mapping

Translate vendor errors into clear guest messages.

### Sensitive Details

Do not expose credentials or internal diagnostic information.

### Operational Record

Retain appropriate non-sensitive evidence.

### Acceptance

Verify all result categories through authorized tests.

## Order Confirmation

A guest confirmation must be grounded in authoritative evidence.

### Confirmation Trigger

Use a verified accepted-order result.

### Reference Number

Show an approved order reference when available.

### Item Summary

Present the accepted selections.

### Fulfillment

Display confirmed pickup or other service details.

### Payment

Show the supported payment state accurately.

### Receipt

Use the approved receipt mechanism.

### Pending State

Clearly label unconfirmed orders.

### Rejection

Explain when no order was accepted.

### Duplicate Prevention

Avoid issuing repeated confirmations for the same accepted order.

### Important Rule

A successful website request alone is not proof of restaurant acceptance.

## Order Status and Reconciliation

Reconciliation resolves discrepancies between systems.

### Status Source

Use an authoritative Toast status interface if supported.

### Lookup

Determine whether accepted orders can be retrieved.

### Matching

Use stable order and submission references.

### Pending

Track submissions awaiting a definitive result.

### Accepted

Confirm that the restaurant received the order.

### Rejected

Confirm that the order was not accepted.

### Unknown

Escalate unresolved outcomes.

### Periodic Review

Investigate outstanding uncertain attempts.

### Staff Verification

Use approved restaurant procedures when automated lookup is unavailable.

### Completion

Record the verified outcome without inventing status.

## Payment and Order Consistency

Order acceptance and payment completion are related but distinct.

### Payment Authorization

Determine when payment is authorized.

### Order Acceptance

Determine when Toast accepts the order.

### Payment Capture

Confirm which system captures funds.

### Failure Before Payment

Avoid submitting an order under unsupported conditions.

### Failure After Payment

Define how an unsuccessful order is reconciled.

### Accepted but Unpaid

Handle only according to the approved ordering model.

### Refunds

Use the authorized refund process.

### Duplicate Charges

Protect against repeated payment attempts.

### Reconciliation

Match authoritative payment and order records.

### Compliance

Avoid direct website handling of raw cardholder data.

## Error Handling

Error handling should be specific and recoverable.

### Invalid Item

Explain that the item cannot be ordered.

### Invalid Modifier

Identify the selection requiring correction.

### Item Unavailable

Allow removal or replacement.

### Price Changed

Require guest review.

### Invalid Fulfillment

Request a supported option.

### Authentication Failure

Stop submission and alert technical support.

### Rate Limit

Follow vendor guidance.

### Vendor Outage

Offer the approved fallback.

### Timeout

Treat the result as uncertain until verified.

### Database Failure

Preserve the appropriate operational state and diagnostic evidence.

## Recovery and Escalation

A recovery plan must prioritize order accuracy.

### Initial Assessment

Identify the affected submission.

### Evidence

Review sanitized logs and available references.

### Authoritative Check

Determine whether Toast accepted the order.

### Confirmed Accepted

Avoid duplicate submission.

### Confirmed Rejected

Allow a corrected attempt if appropriate.

### Unknown

Escalate to the designated restaurant or vendor contact.

### Guest Communication

Provide accurate status without unsupported guarantees.

### Payment Review

Check whether a transaction occurred.

### Incident Closure

Document the verified outcome.

### Prevention

Review recurring failure patterns.

## Security and Privacy

### Credentials

Protect all privileged Toast secrets.

### Transport

Use secure connections.

### Server Validation

Treat browser data as untrusted.

### Price Integrity

Reject client-controlled authoritative totals.

### Access Control

Restrict privileged operations.

### Personal Data

Collect only necessary information.

### Logging

Redact sensitive fields.

### Payment

Use an approved compliant flow.

### Retention

Define appropriate retention periods.

### Incident Response

Maintain a process for suspected compromise.

### Vendor Requirements

Follow applicable Toast security and contractual obligations.

## Logging and Monitoring

Operational diagnostics must support investigation without exposing sensitive data.

### Submission Reference

Track each logical order attempt.

### Restaurant Reference

Record the intended location safely.

### Timestamp

Record relevant processing times.

### State Transition

Track meaningful lifecycle changes.

### Vendor Response

Record sanitized response classifications.

### Error Type

Distinguish validation, authentication, transport, and vendor failures.

### Duration

Monitor submission latency.

### Unknown Outcomes

Alert on unresolved attempts.

### Duplicate Attempts

Detect repeated submission activity.

### Privacy

Exclude raw card data, credentials, and unnecessary guest details.

## Restaurant Staff Workflows

### Workflow A — Confirmed Order

1. Verify the order appears in the approved restaurant workflow.
2. Process it according to restaurant procedures.
3. Use the authoritative order reference for questions.
4. Escalate discrepancies.

### Workflow B — Guest Reports Missing Order

1. Request an appropriate order reference.
2. Check the authoritative ordering system.
3. Determine whether the order was accepted.
4. Review payment status through approved tools.
5. Avoid creating a replacement order without verification.
6. Communicate the confirmed result.

### Workflow C — Possible Duplicate

1. Identify the related order references.
2. Verify actual accepted orders.
3. Determine whether payment duplication occurred.
4. Follow approved correction procedures.
5. Document the incident.

### Workflow D — Vendor Outage

1. Confirm the integration problem.
2. Suspend unsafe direct submission if necessary.
3. Restore the external ordering fallback.
4. Inform responsible personnel.
5. Resume only after verification.

## Testing Scenarios

### Valid Order

Submit a fully supported test order.

### Invalid Item

Reject an unknown item identifier.

### Invalid Modifier

Reject an unsupported option.

### Missing Required Modifier

Prevent incomplete submission.

### Invalid Quantity

Reject zero or negative values.

### Price Difference

Require appropriate review.

### Sold-Out Item

Handle unavailable selections.

### Wrong Restaurant

Reject incorrect location configuration.

### Repeated Click

Prevent duplicate orders.

### Network Timeout

Handle an uncertain outcome.

### Vendor Rejection

Display an accurate rejection.

### Payment Failure

Follow the approved recovery flow.

### Accepted Order

Show confirmation only after authoritative acceptance.

### Testing Restriction

Use only an authorized testing environment and approved test procedures.

## Acceptance Criteria

### Vendor Access

- [ ] Restaurant eligibility confirmed.
- [ ] Order-creation permission confirmed.
- [ ] Approved testing environment available.

### Data Validation

- [ ] Item mappings verified.
- [ ] Modifier mappings verified.
- [ ] Quantities validated.
- [ ] Fulfillment options validated.
- [ ] Authoritative pricing verified.

### Submission

- [ ] Accepted test orders reach the intended location.
- [ ] Rejected orders are reported accurately.
- [ ] Repeated actions do not create duplicates.
- [ ] Timeouts are handled as uncertain outcomes.
- [ ] Order status can be reconciled through an approved process.

### Payments

- [ ] Payment sequence approved.
- [ ] Duplicate-charge scenarios evaluated.
- [ ] Failed-payment recovery tested.

### Operations

- [ ] Staff workflows approved.
- [ ] Escalation contacts established.
- [ ] External ordering fallback tested.
- [ ] Monitoring and alerts verified.

### Evidence

Each completed criterion requires actual test evidence.

## Operational Risks

### Lost Orders

The website may fail to transmit an order.

### False Confirmation

A guest may be told an order was accepted when it was not.

### Duplicate Orders

Retries may submit the same order more than once.

### Wrong Location

Incorrect configuration may route an order elsewhere.

### Invalid Modifiers

Unsupported choices may be rejected.

### Price Mismatch

Displayed and accepted totals may differ.

### Payment Inconsistency

Payment may succeed while order submission fails, or vice versa.

### Vendor Outage

Toast integration services may be unavailable.

### Insufficient Monitoring

Staff may not know an order is unresolved.

### Mitigation

Use authorized APIs, explicit state handling, idempotency safeguards, authoritative confirmation, reconciliation, and fallback procedures.

## Implementation Roadmap

### Stage 1 — Confirm API Eligibility

Verify Toast integration permissions.

### Stage 2 — Confirm Order-Creation Support

Review the authorized API contract.

### Stage 3 — Define Order Requirements

Document items, modifiers, fulfillment, and guest information.

### Stage 4 — Establish Identifier Mapping

Associate website items with valid Toast objects.

### Stage 5 — Select Payment Architecture

Define the approved payment and submission sequence.

### Stage 6 — Design Submission State

Plan tracking and recovery requirements.

### Stage 7 — Implement Validation

Protect the server boundary.

### Stage 8 — Prototype Authorized Submission

Use a controlled testing environment.

### Stage 9 — Add Duplicate Safeguards

Implement supported idempotency and reconciliation behavior.

### Stage 10 — Test Failures

Simulate rejection, timeout, and unknown states.

### Stage 11 — Staff Acceptance

Verify restaurant operational workflows.

### Stage 12 — Production Approval

Release only after documented acceptance.

### Fallback

Retain the external Toast ordering link until a replacement is proven reliable.

## Implementation Status

| Capability | Status |
|---|---|
| External Toast ordering | Established |
| Website menu administration | Implemented |
| Supabase menu database | Implemented |
| Manager authorization | Implemented |
| Toast integration eligibility | Unconfirmed |
| Toast order-creation permission | Unconfirmed |
| Authorized Toast credentials | Not confirmed |
| Restaurant identifier mapping | Pending |
| Menu item mapping | Proposed |
| Modifier mapping | Proposed |
| Native cart | Proposed |
| Server-side order validation | Proposed |
| Authoritative pricing integration | Unconfirmed |
| Fulfillment integration | Unconfirmed |
| Direct order submission | Not implemented |
| Submission-state tracking | Proposed |
| Idempotency safeguards | Proposed |
| Order-status retrieval | Unconfirmed |
| Reconciliation workflow | Proposed |
| Native restaurant-order payment flow | Not implemented |
| Submission monitoring | Proposed |
| Staff escalation procedures | Proposed |
| Authorized end-to-end testing | Not started |
| Production direct order submission | Not implemented |

## Related Documentation

- [Toast POS Integration Overview](README.md)
- [Integration Architecture](integration-overview.md)
- [API Feasibility](api-feasibility.md)
- [Menu Synchronization](menu-synchronization.md)
- [Cart and Checkout](cart-and-checkout.md)
- [Payment Processing](payment-processing.md)
- [Security and Compliance](security-and-compliance.md)
- [Cost Analysis](cost-analysis.md)
- [Implementation Roadmap](implementation-roadmap.md)
- [Project Architecture](../01-project-overview/architecture.md)
- [Technology Stack](../01-project-overview/technology-stack.md)
- [Website Menu System](../02-website/menu-system.md)
- [Admin Menu Management](../04-admin-dashboard/menu-management.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Menu Management Overview](../09-menu-management/README.md)
- [Categories and Subcategories](../09-menu-management/categories-and-subcategories.md)
- [Pricing and Modifiers](../09-menu-management/pricing-and-modifiers.md)
- [SPECIALS Management](../09-menu-management/specials-management.md)
- [Publishing Updates](../09-menu-management/publishing-updates.md)
- [Operations Troubleshooting](../08-operations/troubleshooting.md)
- [Master Documentation Index](../README.md)

---

[Back to Toast POS Integration Overview](README.md)
