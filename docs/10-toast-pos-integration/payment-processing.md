# TOAST POS INTEGRATION — Payment Processing

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** Planning and Feasibility Evaluation

**Audience:** Restaurant Ownership, Managers, Developers, Technical Administrators, Finance Personnel, and Integration Partners

**Implementation Status:** External Toast checkout established; native payment integration not implemented

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Payment Integration Objectives](#payment-integration-objectives)
3. [Current Payment Workflow](#current-payment-workflow)
4. [Payment Architecture Options](#payment-architecture-options)
5. [Toast Integration Prerequisites](#toast-integration-prerequisites)
6. [Payment Responsibilities](#payment-responsibilities)
7. [Hosted Checkout](#hosted-checkout)
8. [Embedded Checkout](#embedded-checkout)
9. [Custom Payment Integration](#custom-payment-integration)
10. [Payment Lifecycle](#payment-lifecycle)
11. [Payment Authorization](#payment-authorization)
12. [Payment Capture](#payment-capture)
13. [Pricing and Order Totals](#pricing-and-order-totals)
14. [Taxes and Service Charges](#taxes-and-service-charges)
15. [SPECIALS and Discounts](#specials-and-discounts)
16. [Payment Methods](#payment-methods)
17. [Payment and Order Coordination](#payment-and-order-coordination)
18. [Duplicate Payment Prevention](#duplicate-payment-prevention)
19. [Payment Failures](#payment-failures)
20. [Unknown Payment Outcomes](#unknown-payment-outcomes)
21. [Refunds and Voids](#refunds-and-voids)
22. [Disputes and Chargebacks](#disputes-and-chargebacks)
23. [Reconciliation and Reporting](#reconciliation-and-reporting)
24. [PCI Compliance Boundaries](#pci-compliance-boundaries)
25. [Security and Credential Management](#security-and-credential-management)
26. [Guest Privacy](#guest-privacy)
27. [Payment Notifications](#payment-notifications)
28. [Monitoring and Incident Response](#monitoring-and-incident-response)
29. [Restaurant Staff Procedures](#restaurant-staff-procedures)
30. [Testing Scenarios](#testing-scenarios)
31. [Acceptance Criteria](#acceptance-criteria)
32. [Costs and Commercial Dependencies](#costs-and-commercial-dependencies)
33. [Implementation Roadmap](#implementation-roadmap)
34. [Implementation Status](#implementation-status)
35. [Related Documentation](#related-documentation)

---

## Purpose

This document defines payment-processing considerations for a potential integration between the Fin & Feathers Las Vegas website and Toast POS.

The restaurant currently directs guests to an external Toast online ordering experience.

In that workflow, payment is handled through the supported Toast checkout process rather than through a custom payment form on the restaurant website.

A future ordering integration may introduce new payment requirements.

Those requirements depend on the selected architecture, available Toast integration permissions, contractual terms, payment-provider capabilities, and security obligations.

The primary goal is to support a reliable guest checkout experience without unnecessarily expanding the website's exposure to sensitive payment information.

This document describes proposed architecture, operational safeguards, and decision criteria.

It does not establish that direct Toast payment APIs, hosted cart transfer, embedded checkout, or native payment processing are available to the restaurant.

## Payment Integration Objectives

### Reliable Checkout

Guests should complete payment through an authorized and dependable workflow.

### Accurate Charges

Payment amounts must reflect authoritative order calculations.

### Clear Confirmation

Guests should receive confirmation only when the relevant payment and order states are verified.

### Duplicate Prevention

Repeated actions must not unintentionally create additional charges.

### Operational Reconciliation

Staff must be able to investigate discrepancies between orders and payments.

### Refund Support

Refunds must follow the approved payment provider's procedures.

### Reduced Security Exposure

Avoid collecting raw cardholder data within the custom website.

### Compliance

Identify and satisfy applicable payment security obligations.

### Guest Transparency

Clearly present applicable taxes, fees, and discounts.

### Maintainability

Choose a payment model the restaurant can support over time.

## Current Payment Workflow

**Status:** Established external ordering model.

### Step 1 — Website

Guest visits:

    https://finandfeatherslv.live

### Step 2 — Ordering

Guest selects ORDER ONLINE.

### Step 3 — Toast

Guest proceeds to the external Toast ordering experience.

### Step 4 — Cart

Guest selects supported menu items and modifiers.

### Step 5 — Checkout

Guest completes payment through Toast's configured ordering workflow.

### Step 6 — Order Processing

Toast handles the transaction according to the restaurant's configuration.

### Website Boundary

The custom website does not currently provide a native restaurant-order payment interface.

### Operational Requirement

Preserve the existing ordering path until a replacement has passed acceptance testing.

## Payment Architecture Options

Several approaches may be evaluated.

| Model | Description | Current Status |
|---|---|---|
| External Toast checkout | Guest completes ordering and payment through Toast | Established |
| Supported hosted checkout | Website initiates an approved hosted payment flow | Unconfirmed |
| Supported embedded checkout | Payment occurs through a vendor-approved embedded interface | Unconfirmed |
| Custom integrated checkout | Website coordinates authorized payment and order APIs | Unconfirmed |
| Hybrid ordering | Website presents selected menu information; Toast handles checkout | Proposed |

### Evaluation Criteria

- Vendor support.
- Restaurant eligibility.
- Payment security.
- Guest experience.
- Development effort.
- Transaction reliability.
- Operational maintenance.
- Total cost.

### Important Distinction

A vendor's general payment capability does not establish access to that capability through the restaurant's integration.

### Decision

Choose the least complex authorized model that meets business requirements.

## Toast Integration Prerequisites

Payment integration cannot proceed solely from a website design decision.

### Account Eligibility

Confirm that the restaurant qualifies for the intended integration.

### API Permissions

Verify the required ordering and payment capabilities.

### Payment Model

Determine whether the integration supports a hosted, embedded, or direct payment workflow.

### Merchant Configuration

Confirm the required restaurant payment configuration.

### Test Environment

Obtain an authorized method for testing transactions.

### Documentation

Review current official Toast integration documentation.

### Commercial Terms

Identify applicable payment and integration fees.

### Compliance

Determine the merchant's and developer's responsibilities.

### Operational Approval

Obtain restaurant management authorization.

### Decision Gate

Do not implement production payment functionality until these requirements are satisfied.

## Payment Responsibilities

Every payment-related operation must have a defined owner.

### Restaurant

Approves prices, fees, refunds, and operating procedures.

### Website

Presents approved ordering information and guest interactions.

### Server Integration

Coordinates permitted operations without exposing secrets.

### Toast

Performs only the ordering and payment operations supported by the approved integration.

### Payment Processor

Authorizes, captures, settles, or refunds transactions according to its actual contractual role.

### Supabase

May store approved non-sensitive application metadata.

### Finance Personnel

Review payment reports and discrepancies.

### Support Personnel

Investigate failures through authorized tools.

### Ownership Matrix

Document the responsible system for each payment lifecycle stage.

### Qualification

The final responsibilities depend on the selected payment architecture.

## Hosted Checkout

Hosted checkout may reduce custom payment-handling responsibilities.

### Concept

Guests complete payment through a provider-controlled checkout experience.

### Potential Benefit

The website does not need to build its own card-entry interface.

### Integration Dependency

Toast must explicitly support the intended handoff.

### Cart Transfer

Confirm whether selected items and modifiers can be transferred.

### Amount

The checkout provider must determine the authoritative payable total.

### Return Navigation

Use only supported return or completion behavior.

### Confirmation

Do not infer payment success from a browser redirect.

### Abandoned Checkout

Define how incomplete sessions are handled.

### Error Recovery

Provide an appropriate path back to ordering.

### Status

A Toast-hosted cart-transfer mechanism is not confirmed as available.

## Embedded Checkout

An embedded checkout may appear visually integrated with the website.

### Feasibility

Confirm official vendor support before designing the implementation.

### Browser Restrictions

Payment providers may restrict iframe embedding or cross-origin behavior.

### Authentication

Follow the provider's supported session model.

### Security

Avoid exposing privileged credentials.

### Payment Data

Keep cardholder data within the approved provider-controlled environment.

### Accessibility

Verify keyboard navigation and screen-reader support.

### Mobile

Test the complete embedded experience on mobile devices.

### Error Handling

Define recovery from blocked or interrupted checkout.

### Confirmation

Use authoritative status information.

### Qualification

Do not assume that an external Toast ordering page may be embedded simply because it has a URL.

## Custom Payment Integration

A custom payment integration introduces additional technical and compliance responsibilities.

### Potential Architecture

    Guest Website
          |
          v
    Approved Checkout Interface
          |
          v
    Authorized Server Integration
          |
          v
    Supported Payment Provider
          |
          v
    Authoritative Payment Result

### Requirements

- Vendor authorization.
- Supported payment interfaces.
- Secure session management.
- Accurate order pricing.
- Payment and order reconciliation.
- Duplicate-charge safeguards.
- Refund procedures.
- Security review.

### Card Data

Do not collect raw cardholder data directly unless a separately approved, compliant architecture explicitly requires it.

### Decision

Avoid custom payment handling when a simpler supported model satisfies the restaurant's requirements.

## Payment Lifecycle

A proposed payment lifecycle may include several distinct states.

### Initiated

A payment attempt has begun.

### Pending

The final outcome is not yet known.

### Authorized

The payment provider has approved an authorization.

### Captured

The provider has recorded a capture according to its processing model.

### Failed

The payment attempt has been definitively declined or rejected.

### Canceled

The payment attempt has been canceled through an approved mechanism.

### Refunded

An approved refund has been processed.

### Partially Refunded

Only part of the original amount has been refunded.

### Disputed

The transaction is subject to a payment dispute.

### Important Boundary

These are conceptual lifecycle states, not verified Toast API fields or an existing database schema.

## Payment Authorization

Authorization is not necessarily equivalent to final settlement.

### Purpose

Determine whether the payment method can support the proposed charge.

### Provider

The authorized payment provider performs authorization.

### Amount

Use an authoritative amount.

### Result

Distinguish approved, declined, and uncertain outcomes.

### Expiration

Understand any authorization validity limits.

### Retry

Avoid repeated authorization without appropriate safeguards.

### Order Relationship

Define when order submission occurs relative to authorization.

### Guest Communication

Do not describe authorization as completed settlement unless the provider's workflow warrants it.

### Verification

Confirm actual authorization behavior during approved testing.

## Payment Capture

Capture timing affects operational and financial consistency.

### Immediate Capture

A provider may capture payment as part of checkout.

### Delayed Capture

Some architectures may separate authorization from capture.

### Supported Model

Use only the model approved for the restaurant.

### Order Acceptance

Determine how capture relates to an accepted order.

### Failed Order

Define recovery when payment has progressed but order acceptance fails.

### Duplicate Capture

Prevent repeated capture operations.

### Transaction Reference

Retain appropriate non-sensitive references.

### Reporting

Ensure captured payments appear in authoritative reports.

### Qualification

The actual Toast payment sequence must be verified before implementation.

## Pricing and Order Totals

The website must not determine final charges from untrusted browser data.

### Base Prices

Use approved ordering-system prices.

### Modifiers

Include valid surcharges.

### Quantity

Calculate extended amounts accurately.

### Discounts

Apply supported promotional rules.

### Taxes

Use the approved tax calculation process.

### Fees

Include applicable ordering charges.

### Market-Price Items

Do not invent fixed prices for MKT offerings.

### Currency

Use a consistent currency convention.

### Precision

Use safe monetary representations rather than uncontrolled floating-point arithmetic.

### Final Review

Present the authoritative payable amount before the guest confirms payment.

## Taxes and Service Charges

Charges must follow approved restaurant and ordering-system rules.

### Taxes

Use the authoritative tax configuration.

### Ordering Fees

Identify applicable pickup, delivery, or platform fees.

### Restaurant House Rules

The published restaurant service policy states that a 20% service charge applies to checks over $100 and parties of six or more.

### Online Ordering Applicability

Management must determine whether that policy applies to online transactions.

### No Automatic Extension

Do not assume dine-in service-charge rules apply to Toast online checkout.

### Thresholds

Confirm the basis for any applicable charge.

### Disclosure

Show applicable charges before payment.

### Calculation

Avoid independently inventing fee logic in the website.

### Acceptance

Verify calculations against the configured ordering system.

## SPECIALS and Discounts

The restaurant intends to coordinate promotional menu offerings.

### Existing Website Feature

A $5 specials toggle exists in the menu editor.

### Behavior

Its precise implementation requires source-code verification.

### Future Feature

Weekday SPECIALS scheduling is planned.

### Example

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

### Website Display

The website may advertise an approved promotional offering.

### Checkout Authority

The payment and ordering system must calculate the actual discount.

### Expiration

Validate promotion eligibility at checkout.

### Stacking

Prevent unsupported combinations of discounts.

### Guest Review

Show the applied discount before payment.

### Important Rule

A website SPECIALS label does not automatically create a Toast payment discount.

## Payment Methods

The available payment methods depend on the authorized checkout configuration.

### Credit Cards

Verify supported card payment options.

### Debit Cards

Confirm applicable support.

### Digital Wallets

Determine whether the selected checkout offers wallet payments.

### Gift Cards

Do not assume gift-card redemption is available through a custom integration.

### Promotional Credits

Confirm supported redemption rules.

### Cash

Do not offer cash payment unless the restaurant and ordering workflow support it.

### Tips

Confirm whether tipping is supported and how amounts are calculated.

### Restrictions

Respect provider and restaurant limitations.

### Presentation

Show only payment methods actually available to guests.

### Testing

Test each enabled method through approved procedures.

## Payment and Order Coordination

Payment and order submission must form a coherent workflow.

### Core Risk

A payment may succeed while the order is not accepted.

### Reverse Risk

An order may be accepted while payment remains unresolved.

### Architecture Decision

Define which operation occurs first.

### Authoritative Status

Use verified payment and order results.

### Correlation

Associate related payment and order attempts using approved references.

### Failure Handling

Define compensation or recovery procedures.

### Transaction Boundaries

Do not assume that a database transaction can atomically commit operations across Toast and a separate payment service.

### Reconciliation

Investigate inconsistent states.

### Staff Escalation

Provide an operational process for unresolved transactions.

### Acceptance

Test mismatched payment and order outcomes explicitly.

## Duplicate Payment Prevention

Repeated checkout attempts can create duplicate charges.

### Double Click

A guest may press the payment button multiple times.

### Refresh

The browser may reload during processing.

### Network Timeout

The guest may retry without knowing the original outcome.

### Submission Reference

Associate retries with the original logical payment attempt.

### Provider Support

Use officially supported idempotency mechanisms when available.

### Local Protection

Prevent concurrent duplicate processing where appropriate.

### Unknown Outcome

Check authoritative status before retrying.

### Confirmation

Avoid issuing duplicate receipts or confirmations.

### Monitoring

Detect suspicious repeated payment attempts.

### Acceptance

Test interruption and retry scenarios.

## Payment Failures

Failures must be communicated accurately.

### Declined Payment

The provider rejects the payment attempt.

### Invalid Payment Method

The selected method cannot be used.

### Expired Session

The checkout session is no longer valid.

### Network Failure

Communication is interrupted.

### Provider Unavailable

The payment service cannot complete the request.

### Invalid Amount

The provider rejects the requested charge.

### Authentication Failure

An integration credential is invalid or unauthorized.

### Guest Message

Provide clear, non-sensitive instructions.

### Recovery

Follow the approved payment provider's retry procedure.

### Logging

Do not record sensitive payment credentials.

## Unknown Payment Outcomes

An interrupted response does not establish payment failure.

### Example

A payment request is sent and the connection times out.

### Possible Outcome A

The provider never received the request.

### Possible Outcome B

The provider declined the payment.

### Possible Outcome C

The provider accepted or captured the payment.

### Required State

Treat the result as unknown until verified.

### Verification

Use supported transaction lookup or provider reconciliation tools.

### Retry Restriction

Do not blindly repeat the charge.

### Guest Communication

Explain that payment status is being verified.

### Staff Escalation

Provide a defined investigation process.

### Resolution

Record the authoritative result.

## Refunds and Voids

Refund operations require explicit authorization and accounting controls.

### Refund Authority

Identify which system and staff roles can issue refunds.

### Full Refund

Return the eligible transaction amount according to provider rules.

### Partial Refund

Refund an approved portion where supported.

### Void

Determine whether cancellation before settlement is supported.

### Order Cancellation

Do not assume cancellation automatically refunds payment.

### Payment Reference

Use the correct authoritative transaction identifier.

### Duplicate Refund

Prevent repeated refund processing.

### Audit

Record approved refund actions.

### Guest Communication

Provide accurate refund status.

### Verification

Test refund workflows only through authorized procedures.

## Disputes and Chargebacks

Payment disputes may occur after the order is completed.

### Notification

Determine how the merchant receives dispute notices.

### Ownership

Assign responsibility for responding.

### Evidence

Retain appropriate transaction and order records.

### Privacy

Limit access to guest information.

### Deadlines

Follow payment provider deadlines.

### Refund Interaction

Avoid duplicate refunds during dispute resolution.

### Reporting

Track dispute outcomes.

### Fees

Review applicable provider terms.

### Escalation

Contact the authorized payment support channel.

### Documentation

Maintain a clear operational procedure.

## Reconciliation and Reporting

Reconciliation ensures orders and financial transactions agree.

### Order Reference

Identify the accepted restaurant order.

### Payment Reference

Identify the associated transaction.

### Amount

Compare authoritative amounts.

### Status

Compare accepted, captured, refunded, and failed states.

### Date

Use appropriate transaction timestamps.

### Settlement

Distinguish payment capture from bank settlement.

### Fees

Account for provider processing charges.

### Exceptions

Identify missing, duplicated, or unmatched records.

### Review Frequency

Establish an appropriate operational cadence.

### Evidence

Retain approved reports and investigation outcomes.

## PCI Compliance Boundaries

Payment Card Industry requirements must be evaluated for the actual architecture.

### Hosted Payment

A provider-controlled checkout may reduce the website's direct card-data exposure.

### Embedded Payment

Compliance scope depends on the precise integration and provider implementation.

### Custom Payment

Direct card-data handling can substantially increase compliance obligations.

### Card Numbers

Do not store full card numbers in the website database.

### Security Codes

Do not store card verification codes.

### Tokens

Use provider-approved tokens only where authorized.

### Logging

Never log raw payment credentials.

### Scope Assessment

Obtain a qualified review of applicable PCI DSS obligations.

### Vendor Documentation

Follow current provider security requirements.

### Acceptance

Document the final payment-data boundary before production release.

## Security and Credential Management

### Privileged Credentials

Store payment and Toast secrets in protected server-side configuration.

### Local Development

Keep `.env.local` out of Git.

### Deployment

Use approved Vercel environment-variable controls.

### Browser

Never expose secret payment credentials in client JavaScript.

### Authentication

Follow the approved provider mechanism.

### Authorization

Use least-privilege permissions.

### Transport

Use secure connections.

### Input Validation

Treat all browser-submitted amounts and identifiers as untrusted.

### Logging

Redact secrets and sensitive transaction details.

### Rotation

Maintain credential rotation and revocation procedures.

## Guest Privacy

Payment workflows may involve personal information.

### Data Minimization

Collect only necessary details.

### Name

Use guest identity information only as required.

### Contact Details

Collect supported receipt or fulfillment information.

### Billing Information

Use provider-controlled collection where possible.

### Payment Data

Do not retain raw cardholder details.

### Consent

Obtain consent for optional communications when required.

### Retention

Define appropriate data-retention periods.

### Access

Restrict staff visibility according to responsibilities.

### Privacy Notice

Ensure the website's privacy documentation reflects actual processing.

### Verification

Review data flows before deployment.

## Payment Notifications

Notifications must accurately describe payment and order status.

### Checkout Pending

Payment has not reached a verified final outcome.

### Payment Failed

The provider definitively rejected the attempt.

### Payment Authorized

Authorization succeeded, but other processing may remain.

### Payment Captured

The provider confirms capture according to its workflow.

### Order Accepted

The restaurant's ordering system confirms acceptance.

### Refund Initiated

A refund request has been submitted.

### Refund Completed

The provider confirms the refund outcome.

### Email or SMS

Use only approved notification mechanisms.

### Duplicate Prevention

Avoid repeated notifications for the same event.

### Important Rule

A payment confirmation alone must not be represented as proof that the restaurant accepted the order.

## Monitoring and Incident Response

A production payment integration requires meaningful monitoring.

### Payment Failures

Track error classifications.

### Unknown Outcomes

Alert on unresolved transactions.

### Duplicate Attempts

Detect repeated payment activity.

### Order Mismatches

Identify payments without corresponding accepted orders.

### Refund Errors

Monitor unsuccessful refund operations.

### Authentication Failures

Detect invalid or revoked credentials.

### Provider Outages

Monitor integration availability.

### Diagnostic Privacy

Keep cardholder data out of logs.

### Incident Escalation

Assign responsible contacts.

### Recovery

Document verified outcomes and corrective actions.

## Restaurant Staff Procedures

### Workflow A — Guest Reports a Charge Without an Order

1. Obtain an appropriate transaction or order reference.
2. Check the authoritative payment system.
3. Check the authoritative ordering system.
4. Determine whether the charge was authorized, captured, or pending.
5. Verify whether an order was accepted.
6. Escalate discrepancies.
7. Follow the approved refund or correction process.
8. Communicate only verified findings.

### Workflow B — Duplicate Charge

1. Identify the relevant transactions.
2. Verify actual payment status.
3. Check associated orders.
4. Avoid issuing duplicate refunds.
5. Use the approved provider tools.
6. Record the resolution.

### Workflow C — Refund Request

1. Confirm staff authorization.
2. Identify the correct transaction.
3. Review restaurant refund policy.
4. Perform the approved action.
5. Verify the result.
6. Record the action.

### Workflow D — Payment Provider Outage

1. Confirm the issue.
2. Suspend unsafe payment attempts if necessary.
3. Use the approved ordering fallback.
4. Notify responsible personnel.
5. Resume only after verification.

## Testing Scenarios

### Successful Checkout

Verify a valid payment and accepted order.

### Declined Payment

Confirm clear failure messaging.

### Invalid Amount

Reject tampered pricing.

### Changed Price

Require guest review.

### Expired Session

Handle checkout expiration safely.

### Repeated Click

Prevent duplicate charges.

### Network Timeout

Preserve an unknown state until verified.

### Payment Success, Order Failure

Test reconciliation and recovery.

### Order Success, Payment Failure

Test the approved handling sequence.

### Refund

Verify authorized refund behavior.

### Duplicate Refund

Prevent repeated processing.

### Provider Outage

Test the approved fallback.

### Testing Restriction

Use only authorized test environments and approved payment test methods.

## Acceptance Criteria

### Vendor

- [ ] Toast integration eligibility confirmed.
- [ ] Approved payment model identified.
- [ ] Required permissions verified.
- [ ] Commercial terms reviewed.

### Architecture

- [ ] Payment responsibilities documented.
- [ ] Payment and order sequence approved.
- [ ] Sensitive-data boundaries reviewed.
- [ ] Compliance obligations assessed.

### Pricing

- [ ] Base prices verified.
- [ ] Modifier charges verified.
- [ ] Taxes and fees verified.
- [ ] Discounts verified.
- [ ] Final totals confirmed authoritatively.

### Reliability

- [ ] Declined payments handled.
- [ ] Unknown outcomes handled.
- [ ] Duplicate charges prevented.
- [ ] Payment/order mismatches reconciled.
- [ ] Provider outages handled.

### Operations

- [ ] Refund procedures approved.
- [ ] Staff escalation defined.
- [ ] Monitoring established.
- [ ] External ordering fallback verified.

### Evidence

Do not mark acceptance items complete without documented testing.

## Costs and Commercial Dependencies

Payment integration costs require separate analysis.

### Processing Fees

Review the merchant's applicable payment processing rates.

### Integration Fees

Determine whether Toast charges for the intended integration arrangement.

### Partner Fees

Identify any required third-party integration costs.

### Transaction Fees

Review additional per-order charges.

### Hosting

Account for server-side integration usage.

### Monitoring

Include operational diagnostics.

### Security

Include compliance and security review expenses.

### Maintenance

Budget for API and dependency changes.

### Support

Account for payment incident investigations.

### Financial Decision

Compare the full ownership cost with the existing external Toast checkout workflow.

## Implementation Roadmap

### Stage 1 — Confirm Toast Eligibility

Establish the permitted integration arrangement.

### Stage 2 — Select Checkout Model

Evaluate external, hosted, embedded, and custom options.

### Stage 3 — Confirm Payment Responsibilities

Identify the payment processor and merchant obligations.

### Stage 4 — Define Pricing Authority

Approve taxes, fees, discounts, and total calculations.

### Stage 5 — Design Payment Lifecycle

Define authoritative states and transitions.

### Stage 6 — Coordinate Order Submission

Plan the payment/order sequence and reconciliation.

### Stage 7 — Security Review

Assess secrets, privacy, and PCI scope.

### Stage 8 — Authorized Prototype

Test the approved payment architecture.

### Stage 9 — Failure Testing

Simulate declines, timeouts, and inconsistent states.

### Stage 10 — Refund and Reconciliation Testing

Verify operational correction procedures.

### Stage 11 — Staff Acceptance

Review finance and restaurant support workflows.

### Stage 12 — Production Decision

Release only after formal approval.

### Fallback

Maintain external Toast checkout until the new workflow is accepted.

## Implementation Status

| Capability | Status |
|---|---|
| External Toast checkout | Established |
| Website menu presentation | Implemented |
| Protected menu administration | Implemented |
| Supabase menu database | Implemented |
| Toast integration eligibility | Unconfirmed |
| Toast payment API access | Unconfirmed |
| Hosted cart-to-checkout handoff | Unconfirmed |
| Embedded Toast checkout | Unconfirmed |
| Custom payment integration | Not implemented |
| Native restaurant-order cart | Proposed |
| Authoritative pricing integration | Unconfirmed |
| Tax calculation integration | Unconfirmed |
| Online service-charge applicability | Pending management review |
| SPECIALS discount synchronization | Unconfirmed |
| Payment authorization integration | Unconfirmed |
| Payment capture integration | Unconfirmed |
| Direct order submission | Not implemented |
| Duplicate-charge safeguards | Proposed |
| Payment/order reconciliation | Proposed |
| Refund integration | Unconfirmed |
| Dispute-management workflow | Proposed |
| PCI scope assessment | Pending |
| Payment monitoring | Proposed |
| Security review | Pending |
| Authorized payment testing | Not started |
| Production native payment processing | Not implemented |

## Related Documentation

- [Toast POS Integration Overview](README.md)
- [Integration Architecture](integration-overview.md)
- [API Feasibility](api-feasibility.md)
- [Menu Synchronization](menu-synchronization.md)
- [Cart and Checkout](cart-and-checkout.md)
- [Order Submission](order-submission.md)
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
- [Pricing and Modifiers](../09-menu-management/pricing-and-modifiers.md)
- [SPECIALS Management](../09-menu-management/specials-management.md)
- [Operations Troubleshooting](../08-operations/troubleshooting.md)
- [Master Documentation Index](../README.md)

---

[Back to Toast POS Integration Overview](README.md)
