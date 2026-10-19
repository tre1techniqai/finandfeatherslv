# TOAST POS INTEGRATION — API Feasibility

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** Planning and Feasibility Evaluation

**Audience:** Restaurant Ownership, Managers, Developers, Technical Administrators, and Integration Partners

**Implementation Status:** Toast API access, eligibility, and required capabilities not yet confirmed

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Feasibility Objectives](#feasibility-objectives)
3. [Current Integration Baseline](#current-integration-baseline)
4. [Feasibility Assessment Scope](#feasibility-assessment-scope)
5. [Official Toast Documentation](#official-toast-documentation)
6. [Restaurant Account Eligibility](#restaurant-account-eligibility)
7. [Integration Program Requirements](#integration-program-requirements)
8. [API Credentials and Authentication](#api-credentials-and-authentication)
9. [API Permissions and Access Scope](#api-permissions-and-access-scope)
10. [Restaurant and Location Identification](#restaurant-and-location-identification)
11. [Menu API Feasibility](#menu-api-feasibility)
12. [Category and Modifier Feasibility](#category-and-modifier-feasibility)
13. [Pricing and Availability Feasibility](#pricing-and-availability-feasibility)
14. [SPECIALS and Promotions Feasibility](#specials-and-promotions-feasibility)
15. [Order Submission Feasibility](#order-submission-feasibility)
16. [Order Status and Confirmation](#order-status-and-confirmation)
17. [Checkout and Payment Feasibility](#checkout-and-payment-feasibility)
18. [Guest Information and Fulfillment](#guest-information-and-fulfillment)
19. [Sandbox and Testing Environments](#sandbox-and-testing-environments)
20. [API Limits and Performance](#api-limits-and-performance)
21. [Webhooks and Event Notifications](#webhooks-and-event-notifications)
22. [Security and Compliance Requirements](#security-and-compliance-requirements)
23. [Commercial and Contractual Requirements](#commercial-and-contractual-requirements)
24. [Technical Proof of Concept](#technical-proof-of-concept)
25. [Feasibility Risks](#feasibility-risks)
26. [Alternative Integration Models](#alternative-integration-models)
27. [Vendor Questions and Evidence](#vendor-questions-and-evidence)
28. [Feasibility Decision Gates](#feasibility-decision-gates)
29. [Testing and Acceptance](#testing-and-acceptance)
30. [Implementation Roadmap](#implementation-roadmap)
31. [Implementation Status](#implementation-status)
32. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the feasibility assessment for a potential direct integration between the Fin & Feathers Las Vegas website and Toast POS.

The restaurant currently uses external Toast online ordering.

A direct integration is being considered to improve menu consistency, guest experience, and ordering workflow coordination.

Before building any API-dependent functionality, the project must determine whether the restaurant can obtain the necessary authorization and whether Toast supports the specific operations required.

This assessment must distinguish:

- Publicly documented API capabilities.
- Capabilities available to approved integration partners.
- Capabilities enabled for the restaurant's specific account.
- Capabilities confirmed through authorized testing.
- Capabilities not available or not permitted.

No direct API access, credential approval, or order-submission permission is established by this document.

## Feasibility Objectives

### Confirm Eligibility

Determine whether the restaurant qualifies for the necessary Toast integration access.

### Confirm Capabilities

Identify which API operations are supported.

### Confirm Authorization

Establish which operations the restaurant or its approved integration partner may perform.

### Confirm Commercial Requirements

Identify fees, contracts, and ongoing obligations.

### Confirm Technical Compatibility

Determine whether supported operations fit the Next.js architecture.

### Confirm Ordering Support

Establish whether direct order creation is permitted.

### Confirm Payment Boundaries

Identify supported checkout and payment arrangements.

### Confirm Testing Access

Determine whether a suitable nonproduction environment is available.

### Assess Risks

Identify technical and operational limitations.

### Support a Decision

Produce evidence sufficient to select or reject an integration approach.

## Current Integration Baseline

### Production Website

    https://finandfeatherslv.live

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

### Storage

    Supabase Storage

### Menu Administration

    /admin/menu

### Current Ordering

Guests follow the ORDER ONLINE link to the external Toast ordering experience.

### Current Integration Status

No direct Toast API integration is established as deployed.

### Operational Requirement

Preserve external ordering until an alternative has been formally accepted.

## Feasibility Assessment Scope

The assessment covers both business and technical requirements.

### Account Eligibility

Can the restaurant participate in the required integration arrangement?

### API Access

Which credentials and permissions are available?

### Menu Data

Can the website retrieve supported menu information?

### Modifiers

Can the integration access valid ordering options?

### Pricing

Can it obtain authoritative prices?

### Availability

Can it determine which items may be ordered?

### Orders

Can it create orders through an approved API?

### Payments

Can it support an authorized checkout model?

### Notifications

Can it obtain reliable order status?

### Costs

What financial commitments are required?

### Support

Who maintains and troubleshoots the integration?

## Official Toast Documentation

Feasibility must be grounded in current official vendor information.

### Primary Reference

Toast's official developer and integration resources.

### Starting Point

    https://doc.toasttab.com/

### Documentation Review

Confirm that the documentation applies to the proposed integration program and authorized account.

### API Availability

Do not assume every documented endpoint is available to every restaurant.

### API Versions

Record the applicable supported versions.

### Authentication

Use the vendor's current requirements.

### Permissions

Identify the scopes or approvals needed for each operation.

### Deprecation

Check for documented changes or discontinued functionality.

### Evidence

Record documentation URLs and review dates.

### Qualification

This document does not claim that the latest Toast API specifications have been independently verified.

## Restaurant Account Eligibility

The restaurant's eligibility is a critical prerequisite.

### Account Ownership

Identify the authorized restaurant account owner.

### Location

Confirm the intended Las Vegas restaurant location.

### Current Toast Services

Document which Toast products the restaurant currently uses.

### Integration Access

Determine whether direct API access is available.

### Partner Requirement

Confirm whether an approved integration partner is necessary.

### Account Permissions

Determine which account roles can approve integration access.

### Additional Products

Identify any Toast services required for the desired functionality.

### Restrictions

Review account-specific limitations.

### Approval

Obtain explicit authorization before connecting production systems.

### Evidence

Retain confirmation of the permitted integration model.

## Integration Program Requirements

Toast may impose program-specific requirements.

### Integration Category

Determine the appropriate program or integration type.

### Application Registration

Confirm whether the proposed application must be registered.

### Partner Approval

Identify any partner approval requirements.

### Business Review

Determine whether Toast requires business or technical review.

### Technical Certification

Confirm whether testing or certification is required.

### Security Review

Identify applicable vendor security requirements.

### Production Approval

Determine what is required before live API use.

### Support Terms

Clarify who provides integration support.

### Changes

Understand whether expanded capabilities require additional approval.

### Decision Gate

Do not treat exploratory documentation access as authorization for production integration.

## API Credentials and Authentication

Authentication must follow the approved Toast integration model.

### Credential Availability

Confirm whether credentials can be issued.

### Credential Type

Use the mechanism documented for the approved program.

### Token Management

Follow vendor requirements for obtaining and refreshing tokens.

### Credential Storage

Keep secrets in approved server-side configuration.

### Local Development

Do not commit `.env.local`.

### Production

Use protected Vercel environment variables where applicable.

### Browser Security

Never expose privileged API credentials in public client code.

### Logging

Redact authorization headers and tokens.

### Rotation

Document supported credential rotation.

### Revocation

Define how compromised credentials can be disabled.

### Verification

Test authentication only after access is approved.

## API Permissions and Access Scope

Credentials may grant only selected operations.

### Read Access

Determine whether menu information can be retrieved.

### Write Access

Determine whether any menu mutations are permitted.

### Order Creation

Confirm whether order submission is authorized.

### Order Retrieval

Confirm whether order status can be retrieved.

### Payments

Determine which payment-related operations, if any, are available.

### Locations

Confirm which restaurant locations are accessible.

### Least Privilege

Request only necessary permissions.

### Permission Testing

Verify authorized and rejected operations.

### Documentation

Maintain an approved permission matrix.

### Important Boundary

Successful authentication does not prove authorization for every endpoint.

## Restaurant and Location Identification

Integration requests must target the correct restaurant.

### Restaurant Identity

Confirm the authoritative Toast restaurant identifier.

### Location Identity

Confirm the correct location identifier where required.

### Multi-Location Considerations

Avoid assumptions about shared account access.

### Configuration

Store approved identifiers in protected configuration.

### Validation

Check that responses belong to the intended restaurant.

### Orders

Never submit an order to an unverified location.

### Menu

Confirm menu information corresponds to the intended restaurant.

### Testing

Use approved nonproduction identifiers where available.

### Documentation

Record identifier purposes without publishing secrets.

### Acceptance

Verify location mapping before production use.

## Menu API Feasibility

Menu retrieval is a potential early integration milestone.

### Core Question

Can an authorized application retrieve the restaurant's menu?

### Items

Determine whether item records are available.

### Descriptions

Confirm supported descriptive fields.

### Prices

Identify the returned pricing representation.

### Categories

Determine whether menu groups are accessible.

### Modifiers

Confirm whether option relationships are included.

### Availability

Determine whether relevant availability information is returned.

### Identifiers

Record how Toast identifies menu objects.

### Changes

Determine how menu updates can be detected.

### Acceptance

Validate representative real menu records through authorized testing.

## Category and Modifier Feasibility

The website uses an approved restaurant menu taxonomy.

### Categories

Determine how Toast organizes menu groups.

### Subcategories

Identify whether the website hierarchy maps directly.

### HOOKAH

Do not introduce a HOOKAH category filter.

### COCKTAILS

Preserve the approved no-image presentation.

### Modifier Groups

Determine whether Toast exposes option groups.

### Required Options

Identify minimum selection requirements.

### Maximum Selections

Identify applicable selection limits.

### Surcharges

Confirm how option prices are represented.

### Mapping

Document differences between website and Toast structures.

### Acceptance

Test representative items with complex modifiers.

## Pricing and Availability Feasibility

Accurate ordering depends on authoritative data.

### Base Prices

Determine whether current item prices are accessible.

### Modifier Prices

Confirm surcharge representation.

### Variable Prices

Identify how market-price items are handled.

### Taxes

Determine whether applicable totals can be calculated through supported services.

### Fees

Identify any ordering-specific charges.

### Availability

Determine whether sold-out or unavailable states are accessible.

### Timing

Identify how quickly updates become available.

### Validation

Check prices again at the appropriate ordering stage.

### Authority

Define which system controls final order totals.

### Acceptance

Compare retrieved values with the approved Toast ordering experience.

## SPECIALS and Promotions Feasibility

SPECIALS require separate feasibility review.

### Current Website Capability

An existing $5 specials toggle is present in Menu Management.

### Planned Capability

Day-of-week SPECIALS scheduling.

### Example

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

### Promotion Retrieval

Determine whether Toast exposes relevant promotion information.

### Discount Rules

Confirm which discount operations are supported.

### Scheduling

Identify any vendor-side promotion scheduling capability.

### Checkout Pricing

Verify that promotions apply correctly to authoritative totals.

### Conflicts

Determine how overlapping discounts are handled.

### Timezone

Use the restaurant's local operating timezone.

### Important Boundary

A website SPECIALS setting does not automatically create a Toast discount.

## Order Submission Feasibility

Direct order creation is a major architectural decision gate.

### Core Question

Can the approved integration submit a valid restaurant order?

### Eligibility

Confirm account and program authorization.

### Endpoint Support

Identify the vendor-supported submission interface.

### Item Identifiers

Verify valid ordering identifiers.

### Modifiers

Confirm required option structures.

### Fulfillment

Identify supported pickup or other fulfillment modes.

### Guest Information

Determine required customer fields.

### Pricing

Confirm authoritative calculation rules.

### Idempotency

Identify supported duplicate-prevention mechanisms.

### Acceptance

Submit test orders only in an authorized testing environment.

## Order Status and Confirmation

A guest must receive accurate order status.

### Accepted

The authoritative system confirms order acceptance.

### Rejected

The authoritative system rejects the order.

### Pending

The submission has not reached a confirmed outcome.

### Unknown

A timeout or network failure leaves the result uncertain.

### Retrieval

Determine whether order status can be queried.

### Identifiers

Confirm available order reference fields.

### Updates

Determine whether polling or notifications are supported.

### Retry Safety

Do not resubmit uncertain orders blindly.

### Guest Messaging

Avoid false confirmations.

### Acceptance

Test success, rejection, and uncertain submission scenarios.

## Checkout and Payment Feasibility

Payment feasibility must be established independently of order creation.

### Current State

External Toast ordering handles checkout.

### Hosted Checkout

Determine whether an approved hosted model exists.

### Embedded Checkout

Confirm whether embedding is permitted.

### Custom Checkout

Identify whether direct payment operations are available and authorized.

### Payment Provider

Confirm which party processes the transaction.

### Cardholder Data

Avoid collecting raw payment details within the website.

### PCI Scope

Review applicable compliance obligations.

### Refunds

Determine how refunds are managed.

### Reconciliation

Confirm how payments relate to accepted orders.

### Decision Gate

Do not build a native payment flow before the supported model is confirmed.

## Guest Information and Fulfillment

Ordering requirements extend beyond menu items.

### Guest Identity

Determine what customer information is required.

### Contact Information

Collect only necessary fields.

### Pickup

Confirm whether pickup ordering is supported.

### Delivery

Confirm availability before offering delivery.

### Scheduling

Determine whether future pickup times are supported.

### Instructions

Identify supported special-instruction fields.

### Consent

Apply relevant privacy and messaging requirements.

### Validation

Reject incomplete or unsupported requests.

### Data Retention

Avoid unnecessary storage of personal information.

### Acceptance

Test each approved fulfillment mode.

## Sandbox and Testing Environments

Safe testing requires an authorized environment.

### Availability

Determine whether Toast provides a suitable test environment.

### Credentials

Use dedicated test credentials if supported.

### Restaurant Data

Determine whether representative menu data is available.

### Test Orders

Confirm how test submissions are handled.

### Payments

Use approved payment testing methods.

### Isolation

Avoid unintended production orders.

### Cleanup

Document test-data cleanup requirements.

### Logging

Capture non-sensitive diagnostic evidence.

### Limitations

Identify differences between testing and production.

### Decision Gate

Do not perform exploratory live transactions without explicit authorization.

## API Limits and Performance

Integration reliability depends on vendor constraints.

### Rate Limits

Confirm applicable request limits.

### Burst Limits

Identify short-window restrictions.

### Pagination

Determine how large datasets are retrieved.

### Timeouts

Establish safe request timeouts.

### Retries

Follow vendor guidance for retryable operations.

### Caching

Define which responses may be cached.

### Freshness

Avoid stale prices or availability.

### Concurrency

Evaluate simultaneous guest requests.

### Monitoring

Track errors and latency.

### Acceptance

Test within authorized usage limits.

## Webhooks and Event Notifications

Event-driven integration may improve synchronization.

### Availability

Determine whether relevant Toast webhooks are supported.

### Menu Events

Check for supported menu-change notifications.

### Order Events

Check for supported order-status events.

### Authentication

Verify event authenticity using vendor-approved methods.

### Replay Protection

Prevent duplicate event processing.

### Delivery Failures

Plan safe retries and reconciliation.

### Ordering

Do not assume events arrive in sequence.

### Data Minimization

Store only necessary event information.

### Fallback

Use an approved alternative when events are unavailable.

### Qualification

Webhook availability is not confirmed for the proposed integration.

## Security and Compliance Requirements

Security review is mandatory before production access.

### Secrets

Protect API credentials.

### Transport

Use secure connections.

### Authorization

Enforce approved API scopes.

### Input Validation

Validate all guest and administrative input.

### Pricing Integrity

Do not trust browser-provided totals.

### Payment Security

Use an approved payment architecture.

### Privacy

Limit personal information collection.

### Logging

Exclude sensitive credentials and payment details.

### Rate Limiting

Protect integration endpoints.

### Vendor Terms

Comply with applicable Toast requirements.

### Review

Complete a documented security assessment before release.

## Commercial and Contractual Requirements

Technical availability does not establish commercial permission.

### Account Agreement

Review the restaurant's current Toast agreement.

### Integration Fees

Identify any additional charges.

### Partner Fees

Determine whether partner participation introduces costs.

### Transaction Fees

Confirm relevant ordering and payment charges.

### Licensing

Review required products or subscriptions.

### Usage Charges

Determine whether API activity has associated costs.

### Support

Clarify vendor and developer support obligations.

### Termination

Understand the effect of losing integration access.

### Ownership

Determine who owns and maintains the integration.

### Evidence

Obtain written confirmation of material terms.

## Technical Proof of Concept

A proof of concept should validate the most important assumptions.

### Prerequisite

Obtain authorized test access.

### Objective

Confirm that the selected integration model is technically viable.

### Test 1

Authenticate successfully.

### Test 2

Identify the intended restaurant.

### Test 3

Retrieve representative menu data.

### Test 4

Inspect modifier relationships.

### Test 5

Verify pricing information.

### Test 6

Test availability retrieval if supported.

### Test 7

Validate authorized order submission if permitted.

### Test 8

Inspect confirmation behavior.

### Test 9

Test error and timeout handling.

### Completion

Record actual results and unresolved limitations.

## Feasibility Risks

### Restricted Access

The required APIs may not be available.

### Program Approval

Vendor approval may be required.

### Missing Capabilities

Supported APIs may not cover the desired guest experience.

### Menu Complexity

Modifiers may be difficult to map.

### Pricing Inconsistency

Website and Toast values may differ.

### Availability Delay

Retrieved data may be stale.

### Payment Restrictions

Custom checkout may be impractical.

### Duplicate Orders

Retries may cause operational incidents.

### Vendor Changes

API contracts may evolve.

### Cost

Integration expenses may exceed the expected benefit.

### Mitigation

Use explicit decision gates and preserve external ordering as a fallback.

## Alternative Integration Models

Feasibility may favor a simpler solution.

### Option A — External Toast Ordering

Retain the current operational workflow.

### Option B — Official Hosted Experience

Use a supported Toast-hosted ordering model, if available.

### Option C — Embedded Experience

Evaluate an officially permitted embedded approach.

### Option D — Menu-Only Integration

Synchronize approved menu data while retaining Toast checkout.

### Option E — Custom Ordering

Implement a native ordering interface using authorized APIs.

### Comparison

Evaluate cost, permissions, security, reliability, and maintenance.

### Important Boundary

These are alternatives to investigate, not confirmed available products or permissions.

### Decision

Select the least complex model that satisfies approved business requirements.

## Vendor Questions and Evidence

The feasibility review should produce a written vendor-question record.

### Account Access

Is direct integration available to this restaurant?

### Program Eligibility

What approval process applies?

### Menu API

Can authorized applications retrieve menu items and modifiers?

### Pricing

Which source provides authoritative totals?

### Availability

Can item availability be retrieved?

### Orders

Can approved applications submit orders?

### Payments

Which checkout methods are supported?

### Testing

Is a sandbox available?

### Costs

What additional fees apply?

### Support

What technical support is available?

### Evidence

Record answers, source URLs, dates, and any account-specific confirmation.

## Feasibility Decision Gates

Each gate must be resolved before proceeding.

### Gate 1 — Business Approval

Restaurant ownership approves the feasibility effort.

### Gate 2 — Vendor Eligibility

Toast confirms the required integration arrangement.

### Gate 3 — API Capabilities

Required operations are confirmed.

### Gate 4 — Commercial Terms

Costs and obligations are acceptable.

### Gate 5 — Security

The proposed architecture passes security review.

### Gate 6 — Prototype

Authorized testing validates critical operations.

### Gate 7 — Operational Fit

Restaurant staff confirm the proposed workflow.

### Gate 8 — Implementation Decision

Stakeholders approve development.

### Failed Gate

Revise the approach or retain external ordering.

### Documentation

Record decisions and supporting evidence.

## Testing and Acceptance

### Vendor Eligibility

- [ ] Restaurant eligibility confirmed.
- [ ] Required integration permissions confirmed.
- [ ] Commercial terms reviewed.

### Authentication

- [ ] Authorized credentials obtained.
- [ ] Authentication tested safely.
- [ ] Credential storage reviewed.

### Menu

- [ ] Menu retrieval tested.
- [ ] Category mapping tested.
- [ ] Modifier mapping tested.
- [ ] Pricing representation verified.

### Orders

- [ ] Order creation permission confirmed.
- [ ] Test order submission completed if authorized.
- [ ] Duplicate-prevention behavior evaluated.
- [ ] Unknown order states handled.

### Payments

- [ ] Approved checkout model identified.
- [ ] Compliance requirements assessed.

### Operations

- [ ] Staff workflow reviewed.
- [ ] Failure fallback identified.
- [ ] Support responsibilities assigned.

### Evidence

Do not mark any item complete without actual verification.

## Implementation Roadmap

### Stage 1 — Collect Requirements

Document the desired guest ordering experience.

### Stage 2 — Confirm Account Details

Identify the authorized Toast restaurant account.

### Stage 3 — Review Vendor Documentation

Examine current official integration resources.

### Stage 4 — Contact Toast

Confirm eligibility and required approvals.

### Stage 5 — Establish Capability Matrix

Map business requirements to authorized APIs.

### Stage 6 — Evaluate Commercial Terms

Review costs and contractual obligations.

### Stage 7 — Review Security

Identify credential, privacy, and payment responsibilities.

### Stage 8 — Obtain Test Access

Use an approved nonproduction environment.

### Stage 9 — Build Proof of Concept

Validate the most critical integration assumptions.

### Stage 10 — Compare Alternatives

Evaluate external, hybrid, and custom models.

### Stage 11 — Record Decision

Approve, revise, or decline direct integration.

### Stage 12 — Plan Implementation

Proceed only after the required gates pass.

## Implementation Status

| Capability | Status |
|---|---|
| External Toast ordering | Established |
| Website menu administration | Implemented |
| Supabase menu database | Implemented |
| Manager authentication | Implemented |
| Toast account eligibility review | Pending |
| Integration program identification | Pending |
| Toast API credentials | Not confirmed |
| Toast API permission matrix | Pending |
| Restaurant identifier verification | Pending |
| Menu API access | Unconfirmed |
| Modifier API access | Unconfirmed |
| Pricing API access | Unconfirmed |
| Availability API access | Unconfirmed |
| Promotion API access | Unconfirmed |
| Direct order submission | Unconfirmed |
| Order-status retrieval | Unconfirmed |
| Checkout integration | Unconfirmed |
| Payment integration | Unconfirmed |
| Sandbox access | Unconfirmed |
| Webhook support | Unconfirmed |
| Rate-limit assessment | Pending |
| Security assessment | Pending |
| Commercial terms review | Pending |
| Technical proof of concept | Not started |
| Feasibility decision | Pending |
| Production direct integration | Not implemented |

## Related Documentation

- [Toast POS Integration Overview](README.md)
- [Integration Architecture](integration-overview.md)
- [Menu Synchronization](menu-synchronization.md)
- [Cart and Checkout](cart-and-checkout.md)
- [Order Submission](order-submission.md)
- [Payment Processing](payment-processing.md)
- [Security and Compliance](security-and-compliance.md)
- [Cost Analysis](cost-analysis.md)
- [Implementation Roadmap](implementation-roadmap.md)
- [Project Architecture](../01-project-overview/architecture.md)
- [Technology Stack](../01-project-overview/technology-stack.md)
- [Website Menu System](../02-website/menu-system.md)
- [Admin Menu Management](../04-admin-dashboard/menu-management.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Menu Management Overview](../09-menu-management/README.md)
- [Categories and Subcategories](../09-menu-management/categories-and-subcategories.md)
- [Pricing and Modifiers](../09-menu-management/pricing-and-modifiers.md)
- [SPECIALS Management](../09-menu-management/specials-management.md)
- [Master Documentation Index](../README.md)

---

[Back to Toast POS Integration Overview](README.md)
