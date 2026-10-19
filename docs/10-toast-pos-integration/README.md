# TOAST POS INTEGRATION

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** Planning and Feasibility Evaluation

**Audience:** Restaurant Ownership, Managers, Developers, Technical Administrators, and Integration Partners

**Implementation Status:** External Toast ordering established; direct Toast POS integration under evaluation

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Integration Objectives](#integration-objectives)
3. [Current Website Architecture](#current-website-architecture)
4. [Current Ordering Workflow](#current-ordering-workflow)
5. [Proposed Integration Vision](#proposed-integration-vision)
6. [Integration Scope](#integration-scope)
7. [Toast API Feasibility](#toast-api-feasibility)
8. [Menu Synchronization](#menu-synchronization)
9. [Cart and Checkout](#cart-and-checkout)
10. [Order Submission](#order-submission)
11. [Payment Processing](#payment-processing)
12. [Security and Compliance](#security-and-compliance)
13. [Operational Dependencies](#operational-dependencies)
14. [Cost Considerations](#cost-considerations)
15. [Implementation Strategy](#implementation-strategy)
16. [Risks and Constraints](#risks-and-constraints)
17. [Decision Criteria](#decision-criteria)
18. [Documentation Directory](#documentation-directory)
19. [Implementation Status](#implementation-status)
20. [Related Documentation](#related-documentation)

---

## Purpose

This section documents the evaluation and potential implementation of a direct integration between the Fin & Feathers Las Vegas website and Toast POS.

The current website provides an ORDER ONLINE action that directs guests to Toast's external ordering experience.

The restaurant is considering whether a more integrated ordering experience would improve guest convenience, menu consistency, operational efficiency, and control over the restaurant's digital presentation.

Before pursuing development, the project must determine which Toast integration capabilities are available to the restaurant, what permissions and commercial arrangements are required, and which responsibilities must remain within Toast.

This documentation establishes a structured process for answering those questions.

It does not assume that Toast API credentials, integration approval, payment access, or direct order-submission permissions have been obtained.

## Integration Objectives

### Guest Experience

Evaluate whether guests can begin ordering without leaving the restaurant's branded website.

### Menu Consistency

Reduce discrepancies between website menu content and Toast ordering information.

### Operational Reliability

Ensure submitted orders reach the intended restaurant workflow.

### Payment Security

Avoid unnecessary exposure to sensitive payment information.

### Manager Efficiency

Reduce duplicate administrative work where practical.

### Availability Accuracy

Investigate synchronization of item and modifier availability.

### Promotional Coordination

Evaluate how restaurant SPECIALS could interact with ordering.

### Cost Transparency

Understand development, maintenance, licensing, and transaction costs.

### Vendor Compatibility

Respect Toast's supported integration models.

### Phased Delivery

Avoid disrupting the existing ordering workflow while feasibility is evaluated.

## Current Website Architecture

The website uses the following established technologies.

| Component | Technology |
|---|---|
| Application | Next.js App Router |
| Language | TypeScript |
| Hosting | Vercel |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL |
| Media Storage | Supabase Storage |
| Administrative interface | Protected manager dashboard |
| Menu administration | `/admin/menu` |
| Current online ordering | External Toast ordering |
| Production domain | `https://finandfeatherslv.live` |

### Current Development Phase

Phase 1 focuses on the restaurant website and its foundational administrative functionality.

### Menu Data

The website maintains menu information through its established menu management system.

### Images

Menu images use Supabase Storage.

### Manager Authorization

Protected administrative operations use manager-role checks.

### Integration Boundary

No direct Toast API integration is established as deployed.

## Current Ordering Workflow

The current ordering approach uses Toast as an external service.

### Step 1 — Guest Visits Website

The guest opens the Fin & Feathers Las Vegas website.

### Step 2 — Guest Selects ORDER ONLINE

The website provides an ordering link.

### Step 3 — Guest Opens Toast

The guest continues to the external Toast ordering experience.

### Step 4 — Guest Selects Items

Menu selection occurs through Toast.

### Step 5 — Guest Completes Checkout

The checkout experience is managed by Toast.

### Step 6 — Restaurant Receives Order

Order handling follows the restaurant's configured Toast workflow.

### Current Advantages

- Existing operational approach.
- No custom website payment collection.
- No custom order-submission integration required.
- Reduced integration complexity.

### Current Limitations

- The guest leaves the branded website.
- Website and Toast menu information may require separate updates.
- Promotional settings may require coordination across systems.

### Verification

Exact current Toast configuration and operational settings should be confirmed with restaurant management.

## Proposed Integration Vision

The long-term vision is to evaluate a more connected ordering experience.

### Potential Guest Journey

1. Guest visits the restaurant website.
2. Guest browses the menu.
3. Guest selects an item.
4. Guest configures supported modifiers.
5. Guest adds the item to a cart.
6. Guest reviews the order.
7. Guest completes an approved checkout process.
8. Order reaches the restaurant's supported Toast workflow.

### Important Qualification

This journey is a proposed experience, not a confirmed supported Toast integration flow.

### Alternative Models

The project may evaluate:

- Retaining external Toast ordering.
- Using an officially supported embedded ordering experience.
- Integrating selected Toast menu data.
- Building a custom cart with an approved order-submission integration.
- Using a Toast-supported hosted checkout flow.

### Selection

The final approach depends on confirmed Toast capabilities, permissions, cost, and restaurant requirements.

## Integration Scope

Potential integration work falls into several categories.

### Menu Retrieval

Retrieve approved menu information from Toast if supported.

### Modifier Retrieval

Access supported modifier groups and selections.

### Availability

Determine whether item availability can be retrieved.

### Pricing

Evaluate access to current prices and applicable charges.

### Cart

Maintain guest selections within the intended ordering interface.

### Checkout

Use an approved checkout method.

### Order Submission

Submit valid orders through a supported integration.

### Order Status

Retrieve order progress where supported.

### Payments

Use an authorized payment processing model.

### Administration

Coordinate website and Toast menu management.

### Exclusions

Do not assume unrestricted access to POS operations or sensitive payment information.

## Toast API Feasibility

API feasibility is a prerequisite for direct integration.

### Questions to Resolve

- Does the restaurant have access to the required Toast integration program?
- Which APIs are available for its account?
- Are approved partner credentials required?
- Can menu data be retrieved?
- Can modifier information be retrieved?
- Can availability be synchronized?
- Can orders be created through an authorized API?
- What checkout and payment models are supported?
- Are there additional fees?
- What testing environments are available?

### Authentication

Any approved integration must follow Toast's documented authentication requirements.

### API Limits

Rate limits and usage restrictions must be reviewed.

### Versioning

Supported API versions must be confirmed.

### Documentation

Use current official Toast integration documentation during feasibility review.

### Decision

Do not begin production order-submission development before access and capabilities are confirmed.

## Menu Synchronization

Menu synchronization could reduce duplicate administration.

### Current State

The website maintains its own menu information.

### Potential Future State

Approved Toast menu information may be retrieved and mapped to website records.

### Synchronization Direction

Possible approaches include:

- Toast to website.
- Website to Toast, only if supported and authorized.
- A controlled reconciliation process.

### Source of Truth

The restaurant must define which system controls each field.

### Categories

Preserve the approved restaurant menu taxonomy.

### Modifiers

Map supported option groups and charges carefully.

### Images

The website may continue managing approved food photography.

### Market Pricing

Market-price items require special handling.

### SPECIALS

Promotional synchronization requires separate feasibility review.

### Safety

Avoid automatic overwrites before mapping and conflict rules are approved.

## Cart and Checkout

A custom cart would introduce additional application responsibilities.

### Cart State

Maintain selected items and quantities.

### Modifiers

Capture valid guest choices.

### Price Calculation

Use an approved authoritative pricing model.

### Availability

Prevent selection of unavailable items where supported.

### Order Review

Present a clear order summary.

### Taxes and Fees

Use an approved calculation source.

### Fulfillment

Support only confirmed fulfillment options.

### Checkout

Follow a Toast-supported payment and order workflow.

### Error Handling

Handle expired selections, invalid prices, and unavailable items.

### Implementation Boundary

A native website cart and checkout system is not established as deployed.

## Order Submission

Direct order submission requires confirmed Toast support.

### Required Capabilities

The integration must determine whether the restaurant can submit orders through an approved interface.

### Order Identity

Each submitted order should have a reliable identifier.

### Menu Mapping

Submitted items must reference valid ordering-system products.

### Modifiers

Selected options must match supported POS configurations.

### Pricing

Order totals must use the authoritative checkout calculation.

### Availability

Unavailable products must be handled safely.

### Duplicate Prevention

Network retries must not create duplicate restaurant orders.

### Confirmation

Guests should receive confirmation only after the authoritative ordering system accepts the order.

### Failure Handling

Rejected or uncertain submissions require clear recovery procedures.

### Implementation Boundary

Direct Toast order submission is not established as implemented.

## Payment Processing

Payment processing is a high-risk integration area.

### Current State

The existing external Toast ordering experience handles checkout.

### Proposed Integration

A future ordering flow must use an authorized payment approach.

### Payment Credentials

Sensitive payment credentials must not be exposed in public code.

### Card Data

Avoid collecting or storing cardholder data within the website unless a fully approved compliant architecture requires it.

### PCI Considerations

Payment design must be reviewed for applicable compliance responsibilities.

### Refunds

Refund and adjustment workflows must be defined.

### Failed Payments

Guest-facing error handling must be reliable.

### Duplicate Charges

Retries must not produce duplicate payment transactions.

### Reconciliation

Payment records must align with accepted orders.

### Implementation Boundary

No native website payment processing for restaurant orders is established as deployed.

## Security and Compliance

Security requirements apply throughout the integration.

### Server-Side Credentials

Keep privileged API credentials server-side.

### Environment Variables

Use approved environment configuration.

### Source Control

Do not commit `.env.local` or secrets.

### Authentication

Use supported integration authentication.

### Authorization

Restrict administrative actions.

### Input Validation

Validate cart and order data server-side.

### Transport Security

Use secure network connections.

### Data Minimization

Collect only necessary guest information.

### Logging

Avoid logging sensitive payment or personal information.

### Audit

Review relevant integration actions.

### Vendor Requirements

Follow Toast's applicable technical and contractual requirements.

## Operational Dependencies

A direct integration affects restaurant operations.

### Menu Ownership

Determine who maintains authoritative menu data.

### Pricing Approval

Establish responsibility for price changes.

### Modifier Configuration

Ensure ordering choices match kitchen capabilities.

### Availability

Determine how sold-out items are handled.

### SPECIALS

Coordinate promotional pricing and schedules.

### Order Routing

Confirm how orders reach restaurant staff.

### Fulfillment

Define pickup or other supported service options.

### Support

Establish responsibility for failed orders.

### Training

Prepare managers and staff for workflow changes.

### Fallback

Retain a reliable ordering alternative during failures.

## Cost Considerations

Integration decisions require a complete cost assessment.

### Development

Estimate engineering and testing effort.

### Vendor Access

Determine whether Toast integration access involves fees.

### Licensing

Review applicable subscriptions or agreements.

### Transactions

Identify payment and ordering fees.

### Hosting

Estimate incremental Vercel usage.

### Database

Estimate additional Supabase usage.

### Monitoring

Account for operational diagnostics.

### Maintenance

Budget for API changes and ongoing support.

### Compliance

Evaluate security and payment-related obligations.

### Comparison

Compare total cost against retaining external Toast ordering.

### Important Qualification

No Toast integration pricing or API access terms are confirmed in this document.

## Implementation Strategy

A phased approach reduces risk.

### Phase A — Feasibility

Confirm Toast integration eligibility and available APIs.

### Phase B — Requirements

Define restaurant ordering requirements.

### Phase C — Architecture

Select the approved integration model.

### Phase D — Data Mapping

Map menu items, categories, modifiers, and prices.

### Phase E — Prototype

Build a controlled proof of concept if authorized.

### Phase F — Order Workflow

Implement supported cart and order operations.

### Phase G — Payments

Integrate only through an approved payment model.

### Phase H — Testing

Perform end-to-end validation.

### Phase I — Staff Training

Prepare restaurant personnel.

### Phase J — Release

Deploy only after operational acceptance.

### Fallback

Maintain the existing Toast ordering link until the replacement is approved.

## Risks and Constraints

### API Access

Required capabilities may not be available.

### Vendor Approval

Toast may require authorization or a commercial agreement.

### Pricing Discrepancies

Two menu systems may contain different values.

### Modifier Complexity

Website options may not map directly to Toast.

### Availability

Real-time availability may be difficult to synchronize.

### Payment Compliance

Custom checkout may introduce significant obligations.

### Duplicate Orders

Network retries can create operational problems.

### Vendor Changes

API behavior or availability may change.

### Maintenance

A custom integration requires ongoing support.

### Guest Disruption

Failures could interrupt ordering.

### Mitigation

Use confirmed capabilities, controlled testing, and a reliable fallback.

## Decision Criteria

The project should evaluate several alternatives before committing.

### Guest Experience

Does the approach improve ordering convenience?

### Technical Feasibility

Are the required capabilities available?

### Cost

Is the investment justified?

### Reliability

Can the system handle errors safely?

### Security

Does the architecture minimize sensitive-data exposure?

### Operational Fit

Does it align with restaurant staff workflows?

### Maintainability

Can the integration be supported over time?

### Menu Accuracy

Does it improve consistency?

### Vendor Support

Is the integration officially supported?

### Fallback

Can guests still order if the integration fails?

### Decision Record

Document the selected approach and reasons.

## Documentation Directory

This section contains the following documents.

| Document | Purpose |
|---|---|
| [Integration Overview](integration-overview.md) | Detailed integration concepts and architecture |
| [API Feasibility](api-feasibility.md) | Toast access, capabilities, and constraints |
| [Menu Synchronization](menu-synchronization.md) | Menu mapping and data consistency |
| [Cart and Checkout](cart-and-checkout.md) | Proposed guest ordering experience |
| [Order Submission](order-submission.md) | Supported order creation and confirmation |
| [Payment Processing](payment-processing.md) | Payment architecture and compliance boundaries |
| [Security and Compliance](security-and-compliance.md) | Credentials, data protection, and vendor requirements |
| [Cost Analysis](cost-analysis.md) | Financial and operational comparison |
| [Implementation Roadmap](implementation-roadmap.md) | Phased development and decision gates |

### Navigation

Use the documents in sequence when evaluating direct integration.

### Documentation Status

Individual documents will be created and verified through the established documentation workflow.

## Implementation Status

| Capability | Status |
|---|---|
| External Toast ordering link | Established |
| Website menu administration | Implemented |
| Supabase menu database | Implemented |
| Manager authentication | Implemented |
| Manager authorization | Implemented |
| Menu image management | Implemented |
| Toast API eligibility confirmation | Pending |
| Toast API credential access | Not confirmed |
| Official integration model selection | Pending |
| Menu synchronization | Under evaluation |
| Modifier synchronization | Under evaluation |
| Availability synchronization | Under evaluation |
| Native website cart | Proposed |
| Native website checkout | Proposed |
| Direct order submission | Under evaluation |
| Native restaurant-order payment processing | Not implemented |
| Payment compliance review | Pending |
| Integration cost assessment | Pending |
| Proof of concept | Not started |
| End-to-end acceptance testing | Not started |
| Production direct integration | Not implemented |

## Related Documentation

- [Master Documentation Index](../README.md)
- [Project Architecture](../01-project-overview/architecture.md)
- [Technology Stack](../01-project-overview/technology-stack.md)
- [Development Roadmap](../01-project-overview/development-roadmap.md)
- [Website Overview](../02-website/README.md)
- [Website Menu System](../02-website/menu-system.md)
- [Admin Dashboard Overview](../04-admin-dashboard/README.md)
- [Admin Menu Management](../04-admin-dashboard/menu-management.md)
- [Database Overview](../06-database/README.md)
- [Database Schema](../06-database/schema.md)
- [Deployment Overview](../07-deployment/README.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Menu Management Overview](../09-menu-management/README.md)
- [Pricing and Modifiers](../09-menu-management/pricing-and-modifiers.md)
- [SPECIALS Management](../09-menu-management/specials-management.md)
- [Publishing Updates](../09-menu-management/publishing-updates.md)

---

[Back to Master Documentation Index](../README.md)
