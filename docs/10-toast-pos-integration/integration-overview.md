# TOAST POS INTEGRATION — Integration Overview

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** Planning and Feasibility Evaluation

**Audience:** Restaurant Ownership, Managers, Developers, Technical Administrators, and Integration Partners

**Implementation Status:** External Toast ordering established; direct integration under evaluation

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Integration Vision](#integration-vision)
3. [Business Objectives](#business-objectives)
4. [Current Implementation](#current-implementation)
5. [Existing Ordering Experience](#existing-ordering-experience)
6. [Current Technology Architecture](#current-technology-architecture)
7. [Proposed Integration Architecture](#proposed-integration-architecture)
8. [Integration Models](#integration-models)
9. [External Ordering Model](#external-ordering-model)
10. [Embedded Ordering Model](#embedded-ordering-model)
11. [Custom Ordering Model](#custom-ordering-model)
12. [Hybrid Integration Model](#hybrid-integration-model)
13. [Toast API Access Requirements](#toast-api-access-requirements)
14. [System Responsibilities](#system-responsibilities)
15. [Menu Data Architecture](#menu-data-architecture)
16. [Menu Synchronization Strategy](#menu-synchronization-strategy)
17. [Categories and Subcategories](#categories-and-subcategories)
18. [Modifiers and Pricing](#modifiers-and-pricing)
19. [Item Availability](#item-availability)
20. [SPECIALS and Promotions](#specials-and-promotions)
21. [Cart Architecture](#cart-architecture)
22. [Checkout Architecture](#checkout-architecture)
23. [Order Submission Architecture](#order-submission-architecture)
24. [Payment Processing Boundaries](#payment-processing-boundaries)
25. [Order Confirmation and Status](#order-confirmation-and-status)
26. [Authentication and Authorization](#authentication-and-authorization)
27. [API Credentials and Secrets](#api-credentials-and-secrets)
28. [Security and Compliance](#security-and-compliance)
29. [Reliability and Error Handling](#reliability-and-error-handling)
30. [Monitoring and Operational Support](#monitoring-and-operational-support)
31. [Performance and Scalability](#performance-and-scalability)
32. [Cost and Maintenance Considerations](#cost-and-maintenance-considerations)
33. [Implementation Phases](#implementation-phases)
34. [Testing and Acceptance](#testing-and-acceptance)
35. [Integration Decision Framework](#integration-decision-framework)
36. [Implementation Status](#implementation-status)
37. [Related Documentation](#related-documentation)

---

## Purpose

This document provides a detailed architectural overview of a potential direct integration between the Fin & Feathers Las Vegas website and Toast POS.

The restaurant currently uses Toast's external online ordering experience.

The proposed integration would investigate whether guests could browse menu offerings, select items, configure modifiers, and complete an approved ordering workflow through a more cohesive branded experience.

Before development begins, the project must confirm:

- Available Toast integration capabilities.
- Restaurant eligibility and authorization.
- API access requirements.
- Menu synchronization options.
- Order submission capabilities.
- Supported payment arrangements.
- Security and compliance obligations.
- Integration costs.
- Operational support requirements.

This document describes architectural possibilities and decision criteria.

It does not assert that direct Toast API access or order-submission functionality has been approved.

## Integration Vision

The long-term vision is a convenient, reliable, restaurant-branded ordering experience.

### Guest Experience

Guests should be able to discover menu offerings and proceed through an intuitive ordering process.

### Restaurant Operations

Orders must reach the intended restaurant workflow accurately.

### Menu Accuracy

Prices, modifiers, and availability should remain consistent with the authoritative ordering system.

### Administrative Efficiency

Managers should avoid unnecessary duplicate work.

### Brand Consistency

The ordering experience should complement the existing Fin & Feathers website.

### Security

The architecture should minimize exposure to payment credentials and sensitive guest information.

### Reliability

An integration failure must not silently lose an accepted order.

### Fallback

The restaurant should retain an approved alternative ordering path.

### Implementation Boundary

The vision is a proposed future state, not the current production implementation.

## Business Objectives

### Reduce Guest Friction

Evaluate whether fewer transitions improve ordering convenience.

### Improve Menu Consistency

Reduce differences between website content and Toast ordering information.

### Simplify Administration

Identify opportunities for controlled menu synchronization.

### Improve Pricing Accuracy

Use an authoritative source for order calculations.

### Support Modifiers

Present valid item options.

### Support Availability

Avoid promoting unavailable ordering choices where possible.

### Coordinate Promotions

Investigate approved SPECIALS integration.

### Preserve Operational Reliability

Ensure staff receive valid orders.

### Control Costs

Compare integration investment with measurable benefits.

### Support Future Growth

Choose an architecture that can be maintained as the restaurant evolves.

## Current Implementation

**Status:** External Toast ordering established.

### Website

    https://finandfeatherslv.live

### Framework

    Next.js App Router

### Language

    TypeScript

### Hosting

    Vercel

### Authentication

    Supabase Auth

### Database

    Supabase PostgreSQL

### Storage

    Supabase Storage

### Administrative Menu

    /admin/menu

### Ordering

Guests use the website's ORDER ONLINE action to access external Toast ordering.

### Direct Integration

No deployed direct Toast API integration is established.

## Existing Ordering Experience

The existing workflow separates website browsing from Toast checkout.

### Step 1

Guest opens the restaurant website.

### Step 2

Guest selects ORDER ONLINE.

### Step 3

Guest proceeds to Toast.

### Step 4

Guest selects available items and options.

### Step 5

Guest completes checkout through Toast.

### Step 6

Toast handles the configured restaurant ordering workflow.

### Advantages

- Existing operational arrangement.
- Lower custom-development complexity.
- No native website payment processing.
- Toast remains responsible for its supported checkout functions.

### Limitations

- The ordering experience transitions away from the restaurant website.
- Menu changes may require separate administration.
- Promotional information may differ across systems.

### Operational Principle

Retain this workflow until a replacement has passed acceptance testing and received approval.

## Current Technology Architecture

The website already contains several relevant components.

### Public Website

Provides the guest-facing restaurant experience.

### Menu System

Displays restaurant menu information.

### Manager Dashboard

Supports protected administrative functionality.

### Supabase PostgreSQL

Stores application data.

### Supabase Storage

Stores website media.

### Supabase Auth

Handles manager authentication.

### Vercel

Hosts the Next.js application.

### Toast

Provides the current external ordering destination.

### Important Distinction

The website's menu database and Toast's ordering data should not be assumed to be synchronized.

### Architectural Requirement

Any future integration must explicitly define data ownership and update direction.

## Proposed Integration Architecture

A potential integration could introduce a secure server-side layer between the website and Toast.

### Conceptual Flow

    Guest Browser
         |
         v
    Fin & Feathers Website
         |
         v
    Next.js Server Integration Layer
         |
         v
    Authorized Toast Interface
         |
         v
    Restaurant Ordering Workflow

### Website Responsibilities

Present supported menu information and guest interactions.

### Server Responsibilities

Validate requests and protect integration credentials.

### Toast Responsibilities

Perform only those ordering functions officially supported by the selected integration.

### Database Responsibilities

Store approved website data and necessary non-sensitive integration metadata.

### Security Boundary

Privileged Toast credentials must not be sent to the guest's browser.

### Qualification

This is a conceptual architecture, not a verified Toast-supported implementation.

## Integration Models

Several approaches should be evaluated.

### Model A

External Toast ordering.

### Model B

Officially supported embedded or hosted ordering.

### Model C

Custom website ordering with authorized Toast APIs.

### Model D

Hybrid menu integration with external Toast checkout.

### Evaluation Criteria

- API availability.
- Restaurant eligibility.
- Guest experience.
- Development complexity.
- Security requirements.
- Operating cost.
- Reliability.
- Maintainability.

### Important Qualification

The availability of each model must be verified with Toast.

### Decision

Select an architecture only after confirming vendor capabilities.

## External Ordering Model

**Status:** Current operational baseline.

### Architecture

    Website
       |
       v
    Toast Ordering

### Website Role

Provide navigation to the ordering destination.

### Toast Role

Manage the supported ordering and checkout experience.

### Benefits

- Existing workflow.
- Limited custom ordering infrastructure.
- Reduced payment-processing responsibilities.
- Straightforward fallback.

### Limitations

- Separate branded experience.
- Potential menu duplication.
- Limited control over Toast's interface.

### Appropriate Use

Continue using this model while evaluating alternatives.

### Verification

Confirm that the current ordering destination remains functional.

## Embedded Ordering Model

**Status:** Feasibility not confirmed.

An embedded or hosted integration could potentially retain more of the restaurant's branded experience.

### Possible Approaches

- Official embedded ordering component.
- Vendor-hosted ordering experience.
- Supported redirect or handoff.

### Requirements

Confirm which approaches Toast officially supports.

### Branding

Determine available customization.

### Checkout

Use the supported vendor payment workflow.

### Authentication

Follow the vendor's approved session model.

### Mobile Experience

Verify responsive behavior.

### Limitations

Browser embedding, payment restrictions, and vendor policies may constrain implementation.

### Decision

Do not assume an iframe or embedded checkout is supported without vendor confirmation.

## Custom Ordering Model

**Status:** Proposed; subject to API eligibility.

A custom ordering model would provide greater control over the website interface.

### Potential Features

- Menu browsing.
- Item selection.
- Modifier selection.
- Cart management.
- Order review.
- Approved checkout.
- Order confirmation.

### Dependencies

- Authorized menu data access.
- Supported item identifiers.
- Modifier mappings.
- Pricing rules.
- Order submission.
- Payment handling.
- Error recovery.

### Complexity

Custom ordering introduces significant application and operational responsibilities.

### Critical Requirement

Toast must explicitly support the required order and payment workflows.

### Decision

Do not begin production implementation until feasibility is established.

## Hybrid Integration Model

**Status:** Proposed alternative.

A hybrid model may improve menu consistency without replacing Toast checkout.

### Possible Architecture

    Toast Menu Data
          |
          v
    Approved Integration Layer
          |
          v
    Fin & Feathers Website
          |
          v
    External Toast Checkout

### Potential Benefit

Reduce duplicated menu information.

### Ordering

Guests continue through Toast's supported checkout.

### Data Mapping

Website menu records must map to approved Toast identifiers.

### Limitations

Menu access may be restricted by Toast integration permissions.

### Media

Website food photography may remain in Supabase Storage.

### Evaluation

Compare hybrid synchronization costs with manual administration.

### Implementation Boundary

No hybrid synchronization is established as deployed.

## Toast API Access Requirements

API access must be confirmed before architectural commitments.

### Eligibility

Determine whether the restaurant qualifies for the required integration.

### Authorization

Identify required vendor approvals.

### Credentials

Confirm supported authentication methods.

### Documentation

Review current official Toast API documentation.

### Environments

Determine whether testing or sandbox access is available.

### Permissions

Confirm allowed menu and order operations.

### Limits

Review API usage restrictions.

### Commercial Terms

Identify licensing or partner fees.

### Support

Determine available integration support.

### Decision Gate

Proceed only when the required capabilities are confirmed.

## System Responsibilities

Each system must have clearly defined responsibilities.

### Website

- Guest-facing presentation.
- Restaurant branding.
- Supported menu navigation.
- Approved ordering interactions.

### Next.js Server

- Request validation.
- Protected integration calls.
- Error handling.
- Credential security.

### Supabase

- Website-specific data.
- Approved menu metadata.
- Media assets.
- Manager authorization.

### Toast

- Supported POS and ordering operations.
- Authoritative checkout functions where applicable.
- Restaurant order processing.

### Restaurant Management

- Menu approval.
- Pricing approval.
- Operational configuration.
- Staff training.

### Integration Provider

Any authorized integration partner must fulfill its contractual responsibilities.

## Menu Data Architecture

Menu data is central to the proposed integration.

### Current Website Menu

Maintained through the existing administrative system.

### Toast Menu

Used by the external ordering experience.

### Data Ownership

Each field needs an identified authoritative source.

### Item Identifiers

Records may require a mapping between website and Toast identifiers.

### Categories

Category mapping must preserve approved presentation requirements.

### Modifiers

Options must correspond to supported ordering selections.

### Prices

Order totals must use the approved checkout authority.

### Images

Website photography may remain separately managed.

### Availability

The integration must handle unavailable items.

### Verification

Confirm actual Toast data access before implementing mappings.

## Menu Synchronization Strategy

Synchronization should be controlled and auditable.

### Direction

Determine whether updates flow from Toast, the website, or both.

### Frequency

Choose an appropriate refresh strategy.

### Initial Import

Define how existing records are matched.

### Identity Mapping

Avoid creating duplicate items.

### Conflict Resolution

Define which system takes precedence.

### Missing Records

Handle deleted or unavailable items safely.

### Error Handling

Do not silently overwrite approved content.

### Logging

Record synchronization failures without exposing sensitive information.

### Rollback

Plan recovery from incorrect synchronization.

### Implementation Boundary

Automated menu synchronization is not established as implemented.

## Categories and Subcategories

The website follows the approved restaurant menu spreadsheet.

### Source of Truth

Use the latest approved category and subcategory structure.

### Toast Taxonomy

Toast may organize menu information differently.

### Mapping

An integration may require category mapping.

### Display

The public website should preserve approved navigation.

### HOOKAH

Do not introduce a HOOKAH category filter.

### COCKTAILS

Follow the approved taxonomy without requiring images.

### Unmapped Categories

Handle unexpected external groupings safely.

### Duplicate Groupings

Avoid creating redundant website filters.

### Validation

Test category relationships before publishing synchronized data.

### Approval

Changes to the restaurant's public taxonomy require authorization.

## Modifiers and Pricing

Modifiers can affect order validity and totals.

### Modifier Groups

Represent supported choices.

### Required Selections

Enforce applicable requirements.

### Optional Selections

Allow supported additions.

### Minimum Selections

Respect confirmed ordering constraints.

### Maximum Selections

Prevent invalid combinations.

### Surcharges

Use authoritative prices.

### Base Price

Preserve the correct item price.

### Market Pricing

Handle items without fixed public prices appropriately.

### Special Pricing

Coordinate promotional rules separately.

### Verification

Test representative modifier combinations.

## Item Availability

Availability can change during restaurant operations.

### Available Items

Items that may currently be ordered.

### Unavailable Items

Items temporarily or permanently unavailable.

### Sold-Out State

A product may be unavailable for the remainder of a service period.

### Availability Source

Identify the authoritative system.

### Synchronization

Determine whether supported updates can be retrieved.

### Stale Data

Avoid accepting invalid selections based on outdated availability.

### Cart Validation

Recheck availability before submission when supported.

### Error Messages

Explain unavailable items clearly.

### Recovery

Allow guests to revise affected selections.

### Implementation Boundary

Real-time Toast availability integration is not confirmed.

## SPECIALS and Promotions

The restaurant intends to feature approved menu promotions.

### Current Website Control

The menu editor includes an existing $5 specials toggle.

### Future Scheduling

Day-of-week SPECIALS scheduling is planned.

### Example

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

### Website Presentation

A special may be advertised on the public website.

### Toast Pricing

Actual ordering discounts must follow supported Toast configuration.

### Price Authority

Do not assume a website special automatically changes checkout pricing.

### Scheduling

Coordinate promotion dates and times.

### Timezone

Use the restaurant's local timezone.

### Testing

Verify promotional checkout behavior separately.

### Future Integration

Evaluate promotion synchronization only after API capabilities are confirmed.

## Cart Architecture

A native cart would be a new application feature.

### Cart Items

Represent selected menu products.

### Quantity

Support valid quantities.

### Modifiers

Preserve selected options.

### Price Display

Show an appropriate estimate or authoritative amount.

### Cart Updates

Support changes before checkout.

### Validation

Reject invalid selections.

### Availability

Handle unavailable items.

### Session State

Define cart persistence and expiration.

### Security

Do not trust browser-submitted prices.

### Implementation Boundary

A native restaurant-order cart is not established as deployed.

## Checkout Architecture

Checkout design depends on the selected Toast integration model.

### Hosted Checkout

May be appropriate if officially supported.

### Embedded Checkout

Requires explicit vendor confirmation.

### Custom Checkout

Requires approved payment and order-processing capabilities.

### Order Review

Show items, quantities, and applicable charges.

### Taxes

Use the authorized calculation source.

### Fees

Apply confirmed ordering-system rules.

### Fulfillment

Present only supported options.

### Guest Information

Collect only necessary details.

### Confirmation

Do not confirm an order before authoritative acceptance.

### Implementation Boundary

The current website relies on external Toast checkout.

## Order Submission Architecture

Order submission is a critical feasibility requirement.

### Authorized Interface

Use only a Toast-supported submission method.

### Item Mapping

Reference valid external item identifiers.

### Modifier Mapping

Submit supported option selections.

### Quantity

Validate quantities.

### Price Authority

Do not rely on untrusted client totals.

### Order Identifier

Track submission attempts reliably.

### Idempotency

Prevent duplicate orders where the API supports appropriate mechanisms.

### Failure State

Distinguish rejection from uncertain submission status.

### Confirmation

Show success only after authoritative acceptance.

### Implementation Boundary

Direct order submission has not been established as implemented.

## Payment Processing Boundaries

Payment architecture must minimize risk.

### Current Model

Toast handles checkout through its external ordering experience.

### Proposed Model

Use a vendor-supported payment arrangement.

### Cardholder Data

Avoid collecting or storing raw card information.

### Sensitive Credentials

Keep payment credentials out of browser code.

### PCI Scope

Review applicable compliance responsibilities.

### Payment Authorization

Confirm the approved payment flow.

### Capture

Determine which system captures payment.

### Refunds

Define supported refund handling.

### Duplicate Payments

Prevent unintended repeat charges.

### Reconciliation

Ensure payment and order records remain consistent.

### Implementation Boundary

Native website restaurant-order payment processing is not implemented.

## Order Confirmation and Status

Guest confirmation must reflect authoritative order state.

### Submission Pending

The request has not yet been confirmed.

### Accepted

The ordering system has accepted the order.

### Rejected

The order was not accepted.

### Unknown

The application cannot determine whether submission succeeded.

### Important Rule

Do not treat an unknown result as a confirmed order.

### Guest Messaging

Explain the status accurately.

### Order Identifier

Provide an appropriate reference when available.

### Status Updates

Use supported APIs or vendor mechanisms.

### Recovery

Investigate uncertain submissions before retrying.

### Implementation Boundary

Direct Toast order-status retrieval requires feasibility confirmation.

## Authentication and Authorization

Administrative and ordering authentication have different purposes.

### Manager Authentication

    Supabase Auth

### Manager Authorization

    requireManager()

### Role Table

    staff_roles

### Required Role

    manager

### Required Active State

    is_active = true

### Guest Ordering

Guest authentication requirements depend on the selected checkout model.

### Toast Authentication

Integration credentials must follow vendor requirements.

### Separation

Do not reuse manager authentication as an ordering-system credential mechanism.

### Server Enforcement

Restricted operations must be protected server-side.

### Testing

Verify both authorized and denied operations.

## API Credentials and Secrets

Integration credentials require careful management.

### Environment Variables

Use approved deployment configuration.

### Local Development

Keep `.env.local` out of Git.

### Server-Side Access

Access privileged credentials only from trusted server code.

### Browser Exposure

Never embed integration secrets in public JavaScript.

### Source Control

Do not commit credentials.

### Logging

Redact tokens and sensitive headers.

### Rotation

Follow vendor credential-rotation requirements.

### Permissions

Request only necessary scopes.

### Revocation

Maintain a process for compromised credentials.

### Verification

Review secret handling before production release.

## Security and Compliance

Security review is required before implementation.

### Authentication

Follow approved vendor methods.

### Authorization

Protect restricted operations.

### Transport Security

Use secure connections.

### Input Validation

Validate guest-submitted data.

### Pricing Integrity

Recalculate or verify totals through the authoritative system.

### Sensitive Data

Minimize collection and retention.

### Payment Security

Use a compliant supported payment model.

### Logging

Avoid sensitive information in application logs.

### Rate Limiting

Protect public integration endpoints.

### Dependency Security

Maintain supported packages.

### Vendor Compliance

Follow applicable Toast terms and requirements.

## Reliability and Error Handling

Ordering failures have direct operational consequences.

### Network Failure

Handle interrupted connections.

### Timeout

Distinguish timeout from confirmed rejection.

### API Unavailable

Provide an approved fallback.

### Invalid Item

Explain when a selection cannot be ordered.

### Invalid Modifier

Allow correction before submission.

### Price Change

Require appropriate guest review.

### Duplicate Submission

Use supported safeguards.

### Unknown Order State

Do not automatically resubmit without checking authoritative status.

### Logging

Record diagnostic information safely.

### Recovery

Define operational support procedures.

### Testing

Simulate failures before production deployment.

## Monitoring and Operational Support

A production integration requires ongoing monitoring.

### API Availability

Track relevant integration failures.

### Order Submission

Monitor rejected and uncertain submissions.

### Synchronization

Detect stale or failed menu updates.

### Pricing

Investigate recurring discrepancies.

### Credentials

Monitor authentication failures.

### Performance

Track relevant request latency.

### Alerts

Notify appropriate personnel of material failures.

### Logging

Preserve useful non-sensitive diagnostic information.

### Incident Response

Define escalation responsibilities.

### Vendor Support

Establish a process for Toast-related incidents.

### Maintenance

Review the integration after significant vendor or application changes.

## Performance and Scalability

Integration design should protect website responsiveness.

### Menu Loading

Avoid unnecessary blocking API calls.

### Caching

Use an approved strategy for menu data.

### Freshness

Balance performance with price and availability accuracy.

### Server Resources

Account for integration processing.

### API Limits

Respect confirmed vendor restrictions.

### Concurrency

Handle multiple simultaneous guests.

### Checkout Latency

Provide clear progress states.

### Timeouts

Avoid indefinite waiting.

### Retry Strategy

Use safe retries only.

### Mobile

Test on slower connections.

### Acceptance

Establish measurable performance criteria before release.

## Cost and Maintenance Considerations

Direct integration may introduce recurring expenses.

### Engineering

Initial architecture and development.

### Vendor Access

Potential Toast integration or partner costs.

### Hosting

Additional Vercel usage.

### Database

Additional Supabase storage and queries.

### Monitoring

Operational diagnostics and alerts.

### Testing

Sandbox and acceptance effort.

### Compliance

Security and payment reviews.

### Maintenance

API updates and dependency upgrades.

### Support

Order incident handling.

### Training

Staff onboarding.

### Financial Decision

Compare total ownership cost with the existing external ordering model.

## Implementation Phases

### Phase 1 — Feasibility

Confirm Toast access, eligibility, and supported APIs.

### Phase 2 — Requirements

Document the desired ordering experience.

### Phase 3 — Architecture Selection

Choose the approved integration model.

### Phase 4 — Data Mapping

Define item, category, modifier, and price relationships.

### Phase 5 — Prototype

Build a controlled proof of concept if authorized.

### Phase 6 — Cart and Checkout

Implement only supported ordering interactions.

### Phase 7 — Order Submission

Integrate authoritative order acceptance.

### Phase 8 — Security Review

Verify credentials, validation, and payment boundaries.

### Phase 9 — End-to-End Testing

Test successful and failed ordering scenarios.

### Phase 10 — Operational Training

Prepare restaurant staff.

### Phase 11 — Production Release

Deploy after formal acceptance.

### Fallback

Maintain external Toast ordering until replacement approval.

## Testing and Acceptance

### Feasibility

- [ ] Toast integration eligibility confirmed.
- [ ] Required API capabilities confirmed.
- [ ] Vendor terms reviewed.

### Menu

- [ ] Item mappings verified.
- [ ] Category mappings verified.
- [ ] Modifier mappings verified.
- [ ] Pricing authority established.

### Cart

- [ ] Valid selections are supported.
- [ ] Invalid selections are rejected.
- [ ] Quantity changes work.

### Orders

- [ ] Accepted orders reach the intended workflow.
- [ ] Rejected orders are handled.
- [ ] Duplicate submissions are prevented.
- [ ] Unknown submission states are handled safely.

### Payments

- [ ] Approved checkout architecture verified.
- [ ] Applicable compliance requirements reviewed.
- [ ] Duplicate payment scenarios tested.

### Operations

- [ ] Staff workflow verified.
- [ ] Monitoring established.
- [ ] Fallback tested.

### Evidence

Record actual test results before declaring production acceptance.

## Integration Decision Framework

The restaurant should evaluate the available approaches systematically.

| Criterion | External Toast | Hybrid Integration | Custom Integration |
|---|---|---|---|
| Current availability | Established | Unconfirmed | Unconfirmed |
| Branded experience | Limited by handoff | Potential improvement | Potentially extensive |
| Development complexity | Low | Moderate or variable | High |
| Menu synchronization | Separate today | Potential capability | Requires supported APIs |
| Checkout responsibility | Toast | Depends on model | Depends on approved architecture |
| Payment complexity | Lower for website | Depends on model | Potentially significant |
| Maintenance burden | Lower | Additional integration support | Substantial |
| API eligibility dependency | No new direct API access required | Yes, if using APIs | Yes |
| Production readiness | Current workflow | Not established | Not established |

### Decision Questions

1. Does Toast support the required integration model?
2. Is the restaurant eligible?
3. Are required permissions available?
4. Does the expected guest-experience improvement justify the cost?
5. Can the restaurant support ongoing maintenance?
6. Is payment compliance manageable?
7. Can the existing ordering link remain as a fallback?

### Recommendation Boundary

No final architecture should be selected before feasibility and cost evaluation.

## Implementation Status

| Capability | Status |
|---|---|
| External Toast ordering | Established |
| Next.js website | Implemented |
| Supabase menu database | Implemented |
| Manager menu editor | Implemented |
| Manager authentication | Implemented |
| Manager authorization | Implemented |
| Supabase image storage | Implemented |
| Toast integration eligibility | Unconfirmed |
| Toast API credentials | Not confirmed |
| Official API capability review | Pending |
| Integration model selection | Pending |
| Menu synchronization | Under evaluation |
| Modifier synchronization | Under evaluation |
| Availability synchronization | Under evaluation |
| SPECIALS synchronization | Under evaluation |
| Native ordering cart | Proposed |
| Native checkout | Proposed |
| Direct Toast order submission | Under evaluation |
| Order-status retrieval | Under evaluation |
| Native restaurant-order payments | Not implemented |
| Security and compliance review | Pending |
| Cost analysis | Pending |
| Proof of concept | Not started |
| Staff acceptance testing | Not started |
| Production direct integration | Not implemented |

## Related Documentation

- [Toast POS Integration Overview](README.md)
- [API Feasibility](api-feasibility.md)
- [Menu Synchronization](menu-synchronization.md)
- [Cart and Checkout](cart-and-checkout.md)
- [Order Submission](order-submission.md)
- [Payment Processing](payment-processing.md)
- [Security and Compliance](security-and-compliance.md)
- [Cost Analysis](cost-analysis.md)
- [Implementation Roadmap](implementation-roadmap.md)
- [Project Architecture](../01-project-overview/architecture.md)
- [Technology Stack](../01-project-overview/technology-stack.md)
- [Development Roadmap](../01-project-overview/development-roadmap.md)
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
