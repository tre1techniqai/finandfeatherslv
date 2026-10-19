# MERCHANDISE COMMERCE — Payment Processing

**Project:** Fin & Feathers Las Vegas

**Website:** https://finandfeatherslv.live

**Documentation Status:** Payment Architecture, Security, and Operational Planning

**Audience:** Restaurant Ownership, Finance Personnel, Merchandise Managers, Developers, Technical Administrators, and Payment Partners

**Implementation Status:** Native merchandise payment processing not implemented; provider selection pending

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Payment Processing Objectives](#payment-processing-objectives)
3. [Current Payment Baseline](#current-payment-baseline)
4. [Scope and System Boundaries](#scope-and-system-boundaries)
5. [Payment Architecture Options](#payment-architecture-options)
6. [Payment Provider Evaluation](#payment-provider-evaluation)
7. [Merchant Account and Settlement Ownership](#merchant-account-and-settlement-ownership)
8. [Supported Payment Methods](#supported-payment-methods)
9. [Checkout and Payment Session Creation](#checkout-and-payment-session-creation)
10. [Authoritative Pricing and Payment Amounts](#authoritative-pricing-and-payment-amounts)
11. [Payment Authorization and Capture](#payment-authorization-and-capture)
12. [Payment Transaction States](#payment-transaction-states)
13. [Payment Confirmation and Order Creation](#payment-confirmation-and-order-creation)
14. [Payment Events and Webhooks](#payment-events-and-webhooks)
15. [Idempotency and Duplicate Charge Prevention](#idempotency-and-duplicate-charge-prevention)
16. [Payment Failures and Recovery](#payment-failures-and-recovery)
17. [Inventory and Payment Coordination](#inventory-and-payment-coordination)
18. [Refund Processing](#refund-processing)
19. [Cancellations and Partial Refunds](#cancellations-and-partial-refunds)
20. [Disputes and Chargebacks](#disputes-and-chargebacks)
21. [Fraud Prevention](#fraud-prevention)
22. [PCI DSS and Payment Security](#pci-dss-and-payment-security)
23. [Customer Privacy and Data Retention](#customer-privacy-and-data-retention)
24. [Supabase and Infrastructure Planning](#supabase-and-infrastructure-planning)
25. [Financial Reconciliation](#financial-reconciliation)
26. [Payment Fees and Cost Analysis](#payment-fees-and-cost-analysis)
27. [Taxes and Financial Reporting](#taxes-and-financial-reporting)
28. [Manager Permissions and Operational Controls](#manager-permissions-and-operational-controls)
29. [Monitoring and Incident Response](#monitoring-and-incident-response)
30. [Testing and Sandbox Validation](#testing-and-sandbox-validation)
31. [Implementation Roadmap](#implementation-roadmap)
32. [Acceptance Criteria](#acceptance-criteria)
33. [Implementation Status](#implementation-status)
34. [Related Documentation](#related-documentation)

---

## Purpose

This document establishes the proposed payment processing architecture for a future Fin & Feathers Las Vegas merchandise commerce system.

Payment processing is a critical component of the merchandise purchasing lifecycle.

It must reliably coordinate:

- Authoritative merchandise prices.
- Shopping cart totals.
- Shipping charges.
- Applicable taxes.
- Payment authorization.
- Payment capture.
- Order confirmation.
- Inventory commitments.
- Refunds.
- Disputes.
- Financial reconciliation.
- Customer communications.

The selected payment architecture must support the restaurant's operational requirements while minimizing unnecessary security and maintenance responsibilities.

### Documentation Boundary

This document is a planning reference.

It does not establish that a merchandise payment provider, merchant account integration, payment webhook, or native payment database has been implemented.

### Fundamental Principle

Payment success must be established through an authoritative provider result, not an unverified browser action.

---

## Payment Processing Objectives

### Secure Transactions

Protect payment information through approved payment services.

### Accurate Charges

Charge only validated merchandise amounts.

### Reliable Confirmation

Ensure orders reflect verified payment outcomes.

### Duplicate Prevention

Avoid repeated charges for the same logical purchase.

### Clear Guest Experience

Communicate payment status without ambiguity.

### Operational Visibility

Provide authorized staff with transaction references and relevant status information.

### Refund Accountability

Support controlled refunds and financial adjustments.

### Reconciliation

Identify differences between commerce records and provider settlement activity.

### Compliance

Assess applicable payment security, privacy, and legal requirements.

### Cost Control

Understand processing fees and ongoing operating expenses.

---

## Current Payment Baseline

### Existing Merchandise Presentation

The website currently presents an external merchandise shopping experience.

### Existing Checkout

Payment behavior is associated with the external merchandise workflow and requires verification.

### Existing Payment Provider

The specific provider and merchant account arrangement have not been established in this documentation.

### Native Merchandise Payments

No native merchandise payment integration has been established as implemented.

### Native Payment Records

No merchandise-specific payment schema has been established as implemented in Supabase.

### Native Refund Interface

No custom merchandise refund administration has been established as implemented.

### Current Operational Responsibility

The existing external storefront's payment and refund responsibilities require discovery.

### Discovery Actions

Confirm the current provider, merchant ownership, settlement destination, fee structure, refund process, and dispute procedures.

### Preservation

Do not interrupt the existing external merchandise purchasing experience during architecture evaluation.

---

## Scope and System Boundaries

### Merchandise Payments

Apply to approved merchandise purchases only.

### Restaurant Food Ordering

Remains a separate Toast ordering and payment workflow.

### Restaurant Reservations

Remain separate from merchandise checkout.

### Payment Provider

Handles authorized payment operations according to the selected architecture.

### Commerce Backend

Validates purchases and maintains appropriate order state.

### Inventory Authority

Coordinates stock availability with confirmed orders.

### Fulfillment

Processes merchandise orders according to the approved operating model.

### Supabase

May store approved non-sensitive transaction references.

### Restaurant Finance

Reviews settlement, refunds, and reconciliation.

### Critical Restriction

Do not assume Toast restaurant payment credentials or settlement arrangements can be reused for merchandise commerce.

---

## Payment Architecture Options

### Option A — Existing External Storefront

Retain the current provider-managed checkout.

**Potential advantages:**

- Minimal new payment integration.
- Existing provider responsibilities.
- Reduced custom implementation scope.

**Considerations:**

- Verify current merchant ownership.
- Confirm refund and settlement access.
- Review guest experience and costs.

### Option B — Hosted Commerce Checkout

A selected commerce platform manages checkout and integrates with its supported payment services.

### Option C — Hosted Payment Checkout

The website creates an approved checkout session and redirects guests to a provider-controlled payment interface.

### Option D — Embedded Provider Components

Use officially supported provider components within the website.

### Option E — Custom Payment Orchestration

Implement more extensive server-side coordination around approved payment APIs.

### Architecture Decision

Select the simplest supported option that satisfies product, inventory, fulfillment, and financial requirements.

### Important Limitation

A custom user interface does not eliminate the underlying payment provider's security and compliance obligations.

---

## Payment Provider Evaluation

The payment provider must be evaluated before implementation.

### Supported Business Model

Confirm that the provider supports the intended merchandise transactions.

### Merchant Eligibility

Verify the restaurant or operating entity can open and maintain the required account.

### Payment Methods

Confirm available payment options.

### Checkout Integration

Review supported hosted or embedded checkout mechanisms.

### Order References

Verify transaction and order association capabilities.

### Refunds

Confirm full and partial refund support.

### Disputes

Review dispute management features.

### Settlement

Confirm payout timing and reporting capabilities.

### Webhooks

Verify supported event notifications and authentication mechanisms.

### Pricing

Obtain current written fee information.

### Decision Evidence

Record verified capabilities, limitations, contractual terms, and approving stakeholders.

---

## Merchant Account and Settlement Ownership

### Legal Entity

Confirm the organization authorized to receive merchandise payments.

### Merchant Account

Determine whether a new or existing merchant account is appropriate.

### Bank Account

Verify the approved settlement destination.

### Business Verification

Complete provider-required identity and business verification.

### Authorized Representatives

Limit account administration to approved personnel.

### Payout Schedule

Document the actual provider settlement schedule.

### Currency

Confirm the supported settlement currency.

### Accounting Responsibility

Assign ownership for transaction reconciliation.

### Provider Fees

Identify how fees are deducted or invoiced.

### Change Control

Require appropriate approval for changes to payout accounts or merchant ownership.

---

## Supported Payment Methods

Payment methods depend on the selected provider.

### Credit Cards

Evaluate supported card brands and regions.

### Debit Cards

Confirm supported debit transactions.

### Digital Wallets

Consider provider-supported wallet payments.

### Alternative Methods

Evaluate only when commercially justified.

### International Payments

Determine whether international orders are supported.

### Currency Conversion

Review provider handling if multiple currencies are approved.

### Refund Compatibility

Confirm refund behavior for each method.

### Authentication

Use provider-supported payment authentication when applicable.

### Accessibility

Ensure guests can understand available payment options.

### Implementation Rule

Do not advertise a payment method before provider support and merchant eligibility are verified.

---

## Checkout and Payment Session Creation

### Validated Cart

Start with a verified merchandise cart.

### Product Identity

Confirm each selected product and variant.

### Quantity

Validate requested quantities.

### Inventory

Check availability through the authoritative stock system.

### Price

Retrieve approved current prices.

### Shipping

Calculate supported fulfillment charges.

### Taxes

Apply the approved tax calculation process.

### Payment Amount

Derive the final amount from authoritative data.

### Session Creation

Use the selected provider's documented server-side or supported checkout mechanism.

### Session Reference

Preserve an appropriate non-sensitive identifier for reconciliation.

---

## Authoritative Pricing and Payment Amounts

### Unit Prices

Use the authoritative product catalog or commerce provider.

### Variant Prices

Apply approved prices for selected configurations.

### Quantities

Validate positive supported quantities.

### Subtotal

Calculate merchandise line-item totals accurately.

### Discounts

Apply only valid approved promotions.

### Shipping Charges

Include supported shipping fees.

### Sales Tax

Calculate applicable tax using the approved process.

### Currency

Use consistent currency handling.

### Monetary Precision

Represent monetary amounts using safe decimal or integer-minor-unit conventions as required by the selected provider.

### Critical Rule

Never accept a browser-submitted payment total as authoritative.

---

## Payment Authorization and Capture

### Authorization

A provider may authorize payment before final capture.

### Capture

Capture may occur immediately or later depending on the supported workflow.

### Immediate Capture

May be appropriate for certain merchandise operating models.

### Delayed Capture

Requires verification of provider support and authorization expiration rules.

### Inventory Coordination

Ensure the selected lifecycle aligns with available merchandise.

### Fulfillment Coordination

Determine whether orders may be fulfilled before capture.

### Failed Capture

Provide a documented recovery process.

### Partial Capture

Use only if required and supported.

### Refund Distinction

A refund is not the same as canceling an uncaptured authorization.

### Provider Authority

Follow the selected provider's actual payment lifecycle and terminology.

---

## Payment Transaction States

The following states are conceptual.

### Created

A payment attempt has been initiated.

### Pending

The provider has not yet reported a final outcome.

### Requires Action

Additional guest action may be required.

### Authorized

Payment has been authorized but may not yet be captured.

### Captured

The provider confirms capture according to its lifecycle.

### Failed

The attempt did not complete successfully.

### Canceled

The attempt was canceled through an approved process.

### Partially Refunded

A portion of the captured amount has been refunded.

### Refunded

The applicable captured amount has been refunded.

### Disputed

The transaction is subject to a payment dispute.

### Qualification

These are planning concepts, not an implemented database enum or universal provider state model.

---

## Payment Confirmation and Order Creation

### Browser Return

A checkout return page may display the result of a purchase attempt.

### Verification

The backend must establish the authoritative payment outcome.

### Order Authority

Determine which system creates the merchandise order.

### Payment Reference

Associate the correct provider transaction reference.

### Amount Verification

Confirm the transaction matches the intended purchase.

### Currency Verification

Confirm the expected currency.

### Customer Association

Protect the relationship between the payment and customer order.

### Inventory

Commit stock according to the approved order lifecycle.

### Confirmation

Present the verified order reference.

### Critical Rule

Do not create a paid order solely because a guest reached a success URL.

---

## Payment Events and Webhooks

### Event Support

Verify whether the selected provider supports payment event notifications.

### Endpoint Security

Expose only approved, protected webhook endpoints.

### Signature Verification

Validate authenticity using the provider's documented mechanism.

### Raw Request Handling

Preserve any request representation required by the provider's verification process.

### Event Identity

Track unique provider event identifiers where supported.

### Duplicate Delivery

Process repeated notifications safely.

### Event Ordering

Do not assume events arrive in chronological order.

### Acknowledgment

Follow the provider's documented response requirements.

### Recovery

Provide reconciliation when notifications are delayed or missed.

### Important Boundary

No specific webhook URL, event type, or signature algorithm is assumed to be implemented.

---

## Idempotency and Duplicate Charge Prevention

### Duplicate Requests

Guests may click checkout controls repeatedly.

### Network Retries

A timeout may occur after a provider successfully processes a request.

### Stable Attempt Identity

Associate retries with the same logical purchase where appropriate.

### Provider Idempotency

Use officially documented idempotency mechanisms when supported.

### Server-Side Protection

Avoid creating multiple checkout sessions unnecessarily.

### Payment Events

Deduplicate repeated event deliveries.

### Order Creation

Prevent multiple paid orders from one confirmed transaction.

### Refunds

Avoid issuing duplicate refunds.

### Inventory

Prevent duplicate stock deductions.

### Critical Rule

Never assume a timed-out payment request failed without checking the authoritative provider state.

---

## Payment Failures and Recovery

### Card Decline

Display a suitable payment failure message.

### Authentication Failure

Allow an appropriate supported retry.

### Expired Session

Create a new valid checkout attempt when required.

### Provider Timeout

Reconcile the existing attempt before retrying.

### Network Interruption

Preserve a safe recovery path.

### Unknown Outcome

Do not automatically submit a second charge.

### Insufficient Inventory

Resolve availability before accepting payment.

### Price Change

Require review of updated totals.

### Provider Outage

Provide accurate unavailable messaging.

### Escalation

Define a support procedure for unresolved payment states.

---

## Inventory and Payment Coordination

### Inventory Authority

Determine which system owns available stock.

### Checkout Validation

Confirm product availability before payment.

### Reservations

Use supported stock reservations where appropriate.

### Payment Pending

Avoid indefinitely reserving merchandise.

### Payment Success

Commit inventory according to the approved lifecycle.

### Payment Failure

Release reservations when appropriate.

### Payment Reversal

Determine whether stock restoration is justified.

### Fulfillment

Coordinate stock deduction with actual order processing.

### Concurrent Purchases

Prevent overselling.

### System Boundary

Do not assume inventory and payment operations across independent providers form a single database transaction.

---

## Refund Processing

### Refund Eligibility

Follow the approved merchandise return policy.

### Authorization

Restrict refund actions to approved personnel.

### Transaction Reference

Identify the correct original payment.

### Refund Amount

Validate the approved amount.

### Provider Operation

Use the provider's supported refund mechanism.

### Refund Status

Track the authoritative outcome.

### Guest Communication

Provide accurate refund information.

### Inventory

Coordinate restocking independently from financial refund completion.

### Accounting

Include refunds in reconciliation.

### Audit

Record the authorized reason and resulting action.

---

## Cancellations and Partial Refunds

### Pre-Payment Cancellation

Terminate an unfinished checkout through the supported workflow.

### Authorization Cancellation

Use the provider's supported cancellation or void process.

### Captured Payment

Determine whether a refund is required.

### Fulfillment Status

Check whether merchandise has shipped.

### Partial Cancellation

Identify affected line items.

### Partial Refund

Verify provider support and approved calculations.

### Taxes

Use appropriate tax reversal handling.

### Shipping Charges

Apply the approved shipping refund policy.

### Inventory

Restore stock only when justified.

### Duplicate Prevention

Avoid repeated financial adjustments.

---

## Disputes and Chargebacks

### Dispute Notification

Identify provider notices promptly.

### Ownership

Assign responsibility to an authorized finance or operations representative.

### Evidence

Retain appropriate order and fulfillment records.

### Shipping Proof

Maintain relevant shipment tracking where available.

### Guest Communication

Follow approved customer service procedures.

### Deadlines

Respect provider dispute response deadlines.

### Financial Exposure

Account for disputed amounts and applicable fees.

### Inventory

Do not automatically restore stock because a dispute was opened.

### Reporting

Track dispute frequency and outcomes.

### Security

Protect customer information used in dispute evidence.

---

## Fraud Prevention

### Provider Controls

Review available fraud detection features.

### Payment Authentication

Use supported authentication mechanisms.

### Velocity Checks

Consider suspicious repeated purchase attempts.

### Address Signals

Use only appropriate provider-supported verification.

### High-Risk Orders

Define a review process when justified.

### Manual Review

Restrict sensitive decisions to authorized personnel.

### False Positives

Avoid unnecessary rejection of legitimate guests.

### Chargebacks

Use dispute trends to improve controls.

### Privacy

Avoid excessive collection of personal data.

### Approval

Select fraud controls based on actual transaction volume and risk.

---

## PCI DSS and Payment Security

### Payment Architecture

Determine whether payment entry is hosted, embedded, or directly integrated.

### Cardholder Data

Do not store raw card numbers, security codes, or other prohibited sensitive authentication data in Supabase.

### Provider Responsibility

Review the selected provider's documented security responsibilities.

### Merchant Responsibility

Determine the restaurant's applicable PCI DSS obligations.

### Hosted Checkout

May reduce direct card-data handling but does not automatically eliminate merchant obligations.

### Embedded Components

Review the provider's actual integration and compliance requirements.

### Credentials

Protect privileged payment API keys.

### Transport Security

Use appropriate encrypted communications.

### Access Controls

Restrict payment administration.

### Formal Review

Complete an appropriate compliance assessment before production launch.

---

## Customer Privacy and Data Retention

### Data Minimization

Collect only information required for legitimate commerce operations.

### Contact Information

Protect customer email and phone information.

### Shipping Addresses

Restrict access to authorized fulfillment personnel.

### Transaction References

Store only appropriate non-sensitive payment identifiers.

### Retention

Define retention periods based on legal and operational needs.

### Deletion Requests

Establish procedures consistent with applicable obligations.

### Logging

Avoid storing sensitive information in application logs.

### Analytics

Use approved privacy practices.

### Customer Communications

Obtain appropriate consent for optional marketing messages.

### SMS Boundary

Reservation SMS consent does not automatically authorize merchandise marketing messages.

---

## Supabase and Infrastructure Planning

### Existing Stack

Next.js App Router, TypeScript, Vercel, and Supabase.

### Potential Payment References

Store appropriate provider transaction identifiers.

### Potential Checkout Attempts

Track non-sensitive attempt state where required.

### Potential Refund References

Associate authorized refunds with orders.

### Potential Event Processing Records

Support webhook deduplication if necessary.

### Potential Reconciliation Records

Document financial discrepancies and resolution.

### Row Level Security

Restrict access to customer and financial records.

### Server-Side Operations

Protect privileged payment actions.

### Environment Variables

Use secure server-side configuration.

### Schema Boundary

No payment tables, routes, or database migrations are asserted as implemented.

---

## Financial Reconciliation

### Purpose

Verify that merchandise transactions match provider financial records.

### Order Records

Identify authoritative completed merchandise orders.

### Payment Records

Review provider-confirmed transactions.

### Refunds

Include completed refund activity.

### Disputes

Identify chargeback adjustments.

### Fees

Account for provider deductions.

### Settlements

Compare expected and actual payouts.

### Timing

Account for differences between transaction and settlement dates.

### Exceptions

Investigate unmatched or inconsistent records.

### Approval

Assign responsibility for reviewing and resolving discrepancies.

---

## Payment Fees and Cost Analysis

### Transaction Fees

Obtain the provider's current pricing.

### Fixed Fees

Review any per-transaction fixed charges.

### Platform Subscription

Include relevant commerce platform expenses.

### Refund Fees

Verify whether fees are retained or additional charges apply.

### Chargeback Fees

Review dispute-related costs.

### Currency Conversion

Include applicable international processing expenses.

### Payout Fees

Review any settlement-related charges.

### Development

Estimate integration and testing work.

### Maintenance

Account for ongoing operational support.

### Financial Decision

Evaluate total payment ownership cost rather than advertised processing rates alone.

---

## Taxes and Financial Reporting

### Merchandise Sales Tax

Determine applicable tax obligations for the intended sales jurisdictions.

### Tax Calculation

Select an approved calculation process.

### Shipping Taxability

Review treatment of shipping charges where relevant.

### Discounts

Apply the correct tax treatment for promotions.

### Refunds

Account for tax adjustments when applicable.

### Tax Reporting

Assign responsibility for financial records.

### Provider Reports

Review available transaction and tax exports.

### Settlement Reports

Distinguish gross sales from net payouts.

### Restaurant Sales Separation

Maintain appropriate distinctions between merchandise and food ordering revenue.

### Professional Review

Obtain qualified tax and accounting guidance for the actual business arrangement.

---

## Manager Permissions and Operational Controls

### Merchant Account Administration

Restrict access to approved representatives.

### Payment Visibility

Allow authorized personnel to view appropriate transaction information.

### Refund Permissions

Grant refund capabilities only to designated roles.

### Settlement Changes

Require stronger controls for payout destination changes.

### Reconciliation

Assign finance review responsibilities.

### Audit Logs

Record material payment administration actions.

### Authentication

Use approved account security controls.

### Existing Manager System

The website currently uses protected manager authorization patterns.

### Future Integration

Determine whether merchandise payment administration belongs in the website dashboard or the provider portal.

### Important Boundary

Do not assume the existing `/admin/menu` permissions automatically authorize refunds or merchant account changes.

---

## Monitoring and Incident Response

### Payment Failures

Monitor abnormal failure rates.

### Unknown Transactions

Identify unresolved payment outcomes.

### Duplicate Charges

Detect suspected duplicate processing.

### Webhook Failures

Monitor event verification and processing errors.

### Refund Exceptions

Identify failed or repeated refunds.

### Settlement Discrepancies

Track unmatched financial activity.

### Fraud Signals

Review suspicious transaction patterns.

### Credential Exposure

Define immediate containment procedures.

### Provider Outage

Provide accurate checkout availability messaging.

### Recovery

Document escalation, reconciliation, and guest support procedures.

---

## Testing and Sandbox Validation

### Environment Separation

Use provider-supported test and production environments.

### Test Credentials

Keep test and production secrets separate.

### Successful Payment

Verify a supported successful transaction.

### Declined Payment

Test an unsuccessful payment.

### Authentication Challenge

Test supported additional authentication flows.

### Network Failure

Simulate interrupted requests.

### Duplicate Submission

Verify idempotent handling.

### Webhook Replay

Test repeated events where supported.

### Refund

Test approved refund operations.

### Reconciliation

Verify that provider records can be matched to merchandise orders.

---

## Implementation Roadmap

### Phase 0 — Current-State Discovery

Review the existing external merchandise payment workflow.

### Phase 1 — Requirements

Confirm payment methods, settlement, refund, and reporting needs.

### Phase 2 — Provider Evaluation

Compare verified supported payment options.

### Phase 3 — Merchant Approval

Confirm merchant ownership and financial arrangements.

### Phase 4 — Architecture Selection

Approve checkout and payment responsibilities.

### Phase 5 — Security Review

Establish the payment data boundary and applicable compliance obligations.

### Phase 6 — Checkout Integration

Implement or configure the approved provider workflow.

### Phase 7 — Order Coordination

Associate verified payments with merchandise orders.

### Phase 8 — Refund and Reconciliation

Establish financial operations and controls.

### Phase 9 — Testing

Complete supported sandbox and failure testing.

### Phase 10 — Staff Acceptance

Confirm operational readiness.

### Phase 11 — Production Launch

Activate only after authorized approval.

### Phase 12 — Monitoring

Review actual performance, fees, disputes, and reconciliation.

---

## Acceptance Criteria

### Provider and Merchant

- [ ] Payment provider selected.
- [ ] Merchant account ownership verified.
- [ ] Settlement destination approved.
- [ ] Current fees documented.

### Security

- [ ] Payment data boundaries reviewed.
- [ ] Applicable PCI DSS responsibilities assessed.
- [ ] Privileged credentials protected.
- [ ] Refund permissions approved.

### Checkout

- [ ] Payment amounts are authoritative.
- [ ] Supported payment methods tested.
- [ ] Successful payments verified.
- [ ] Declines and unknown outcomes handled.
- [ ] Duplicate charges prevented.

### Operations

- [ ] Refund workflow tested.
- [ ] Dispute ownership assigned.
- [ ] Reconciliation procedures documented.
- [ ] Monitoring and escalation established.

### Production

- [ ] End-to-end testing completed.
- [ ] Staff acceptance documented.
- [ ] Rollback procedures reviewed.
- [ ] Restaurant ownership approves launch.

---

## Implementation Status

| Component | Status |
|---|---|
| Existing external merchandise experience | Established |
| Current merchandise payment provider | Unverified |
| Merchant account ownership | Pending verification |
| Native payment architecture | Planning |
| Payment provider selection | Pending |
| Supported payment methods | Pending |
| Hosted checkout integration | Proposed option |
| Embedded checkout integration | Proposed option |
| Payment session creation | Not implemented |
| Authoritative payment amount validation | Proposed |
| Payment authorization and capture | Pending provider |
| Payment state tracking | Proposed |
| Verified order confirmation | Proposed |
| Payment webhooks | Unconfirmed |
| Idempotency controls | Proposed |
| Payment failure recovery | Proposed |
| Inventory coordination | Pending architecture |
| Merchandise refund integration | Proposed |
| Partial refunds | Pending provider |
| Dispute management | Pending operating model |
| Fraud controls | Pending evaluation |
| PCI DSS assessment | Pending |
| Supabase payment references | Not established |
| Settlement reconciliation | Proposed |
| Payment cost analysis | Pending |
| Payment monitoring | Proposed |
| Sandbox testing | Not started |
| Production payment integration | Not approved |

### Overall Assessment

Merchandise payment processing remains in the planning stage.

The existing external merchandise checkout should remain the baseline until the business selects an approved commerce and payment architecture.

No production payment credentials, financial account settings, or live checkout behavior should be changed as part of this documentation phase.

---

## Related Documentation

### Merchandise Commerce

- [Merchandise Commerce Overview](README.md)
- [Commerce Architecture Overview](commerce-overview.md)
- [Product Catalog](product-catalog.md)
- [Inventory Management](inventory-management.md)
- [Cart and Checkout](cart-and-checkout.md)
- [Shipping and Fulfillment](shipping-and-fulfillment.md)
- [Platform Evaluation](platform-evaluation.md)
- [Cost Analysis](cost-analysis.md)
- [Implementation Roadmap](implementation-roadmap.md)

### Existing Website Merchandise

- [Merchandise Overview](../02-website/merch/README.md)
- [Storefront Overview](../02-website/merch/storefront-overview.md)
- [Shopping Cart Planning](../02-website/merch/shopping-cart.md)

### Administration and Database

- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Merchandise Administration](../04-admin-dashboard/merch-management.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Supabase Authentication](../05-authentication/supabase-auth.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)

### Deployment and Operations

- [Project Architecture](../01-project-overview/architecture.md)
- [Technology Stack](../01-project-overview/technology-stack.md)
- [Vercel Deployment](../07-deployment/vercel-deployment.md)
- [Rollback Procedures](../07-deployment/rollback-procedures.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Testing Checklists](../08-operations/testing-checklists.md)

### Separate Restaurant Ordering

- [Toast POS Integration Overview](../10-toast-pos-integration/README.md)
- [Toast Payment Processing](../10-toast-pos-integration/payment-processing.md)
- [Toast Security and Compliance](../10-toast-pos-integration/security-and-compliance.md)

### Master Index

- [Master Documentation Index](../README.md)

---

[Back to Merchandise Commerce Overview](README.md)
