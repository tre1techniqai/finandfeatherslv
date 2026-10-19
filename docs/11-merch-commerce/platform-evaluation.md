# MERCHANDISE COMMERCE — Platform Evaluation

**Project:** Fin & Feathers Las Vegas

**Website:** https://finandfeatherslv.live

**Documentation Status:** Commerce Platform Research and Decision Framework

**Audience:** Restaurant Ownership, Merchandise Managers, Developers, Finance Personnel, Operations Managers, and Technical Administrators

**Implementation Status:** Platform evaluation proposed; no native commerce platform selected

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Executive Evaluation Summary](#executive-evaluation-summary)
3. [Current Merchandise Baseline](#current-merchandise-baseline)
4. [Business Objectives](#business-objectives)
5. [Evaluation Principles](#evaluation-principles)
6. [Business Requirements Discovery](#business-requirements-discovery)
7. [Commerce Architecture Candidates](#commerce-architecture-candidates)
8. [Option A — Existing External Storefront](#option-a--existing-external-storefront)
9. [Option B — Hosted Commerce Platform](#option-b--hosted-commerce-platform)
10. [Option C — Headless Commerce](#option-c--headless-commerce)
11. [Option D — Supabase-Native Commerce](#option-d--supabase-native-commerce)
12. [Option E — Hybrid Commerce Architecture](#option-e--hybrid-commerce-architecture)
13. [Representative Platform Research](#representative-platform-research)
14. [Product Catalog Evaluation](#product-catalog-evaluation)
15. [Inventory Management Evaluation](#inventory-management-evaluation)
16. [Shopping Cart Evaluation](#shopping-cart-evaluation)
17. [Checkout and Payment Evaluation](#checkout-and-payment-evaluation)
18. [Shipping and Fulfillment Evaluation](#shipping-and-fulfillment-evaluation)
19. [Manager Administration Evaluation](#manager-administration-evaluation)
20. [Next.js Integration Evaluation](#nextjs-integration-evaluation)
21. [Supabase Integration Evaluation](#supabase-integration-evaluation)
22. [Security and Compliance Evaluation](#security-and-compliance-evaluation)
23. [Guest Experience Evaluation](#guest-experience-evaluation)
24. [Branding and Customization Evaluation](#branding-and-customization-evaluation)
25. [Performance and Reliability Evaluation](#performance-and-reliability-evaluation)
26. [Reporting and Analytics Evaluation](#reporting-and-analytics-evaluation)
27. [Data Ownership and Portability](#data-ownership-and-portability)
28. [Vendor Dependence and Exit Strategy](#vendor-dependence-and-exit-strategy)
29. [Cost and Total Ownership Evaluation](#cost-and-total-ownership-evaluation)
30. [Weighted Evaluation Scorecard](#weighted-evaluation-scorecard)
31. [Proof-of-Concept Requirements](#proof-of-concept-requirements)
32. [Risk Assessment](#risk-assessment)
33. [Decision Gates and Approval Process](#decision-gates-and-approval-process)
34. [Recommended Evaluation Sequence](#recommended-evaluation-sequence)
35. [Implementation Roadmap](#implementation-roadmap)
36. [Acceptance Criteria](#acceptance-criteria)
37. [Implementation Status](#implementation-status)
38. [Related Documentation](#related-documentation)

---

## Purpose

This document establishes a structured framework for evaluating merchandise commerce platforms for the Fin & Feathers Las Vegas website.

The goal is to select an architecture that supports the restaurant's merchandise business without introducing unnecessary cost, complexity, or operational risk.

The evaluation must consider the complete merchandise transaction lifecycle.

That lifecycle includes:

- Product catalog administration.
- Product variants and SKUs.
- Inventory availability.
- Shopping cart management.
- Checkout.
- Payment processing.
- Merchandise order creation.
- Shipping and fulfillment.
- Returns and refunds.
- Customer communications.
- Administrative permissions.
- Financial reporting.
- Technical maintenance.

The platform decision should be based on verified business requirements and documented provider capabilities.

### Important Boundary

This document does not select a commerce provider.

It does not authorize payment integration, account creation, database migrations, or changes to the existing merchandise storefront.

---

## Executive Evaluation Summary

### Current Position

Fin & Feathers already provides access to an external merchandise shopping experience.

### Proposed Direction

Evaluate whether the existing storefront meets the restaurant's business needs before replacing it.

### Primary Decision

Determine which platform should own authoritative merchandise commerce records and operations.

### Key Considerations

- Guest shopping experience.
- Merchandise catalog complexity.
- Inventory and fulfillment model.
- Payment security.
- Administrative usability.
- Next.js compatibility.
- Total ownership cost.
- Vendor dependence.
- Long-term maintenance.

### Initial Evaluation Priority

Understand the current provider and its limitations.

### Preferred Decision Standard

Select the least complex architecture that reliably satisfies approved requirements.

### Qualification

No platform ranking is final until provider capabilities, pricing, and operating assumptions have been verified.

---

## Current Merchandise Baseline

### Website

    https://finandfeatherslv.live

### Application Framework

Next.js App Router with TypeScript.

### Hosting

Vercel.

### Database and Authentication

Supabase.

### Existing Merchandise Component

The website includes a merchandise promotional thumbnail.

### Existing Storefront Interaction

The merchandise component presents an external shopping experience through a modal-based interface.

### Current Commerce Provider

The specific platform and contractual arrangement require verification.

### Native Product Catalog

Not established as implemented.

### Native Merchandise Cart

Not established as implemented.

### Native Checkout

Not established as implemented.

### Native Order Management

Not established as implemented.

### Preservation Requirement

The existing merchandise experience must remain functional during evaluation.

---

## Business Objectives

### Merchandise Revenue

Support merchandise sales through a reliable purchasing experience.

### Brand Visibility

Strengthen the Fin & Feathers identity through branded products.

### Customer Convenience

Make merchandise easy to discover and purchase.

### Administrative Efficiency

Reduce unnecessary manual product and order maintenance.

### Operational Control

Provide appropriate visibility into merchandise availability and fulfillment.

### Financial Transparency

Understand gross sales, fees, refunds, and net proceeds.

### Scalability

Support reasonable merchandise growth.

### Mobile Shopping

Provide a responsive experience.

### Integration Compatibility

Fit the existing website architecture.

### Cost Discipline

Avoid building infrastructure that exceeds actual business requirements.

---

## Evaluation Principles

### Business Requirements First

Define operational needs before selecting technology.

### Existing Functionality Matters

Do not replace a functioning storefront without a justified benefit.

### Verify Provider Claims

Use current official documentation and account-specific information.

### Separate Commerce Responsibilities

Identify authoritative systems for products, inventory, orders, and payments.

### Minimize Payment Exposure

Prefer approved payment interfaces that reduce direct card-data handling.

### Preserve Operational Continuity

Plan migration and rollback before changing production behavior.

### Avoid Unsupported Assumptions

Do not assume API features, webhook access, or platform pricing.

### Consider Full Lifecycle Cost

Evaluate implementation, subscriptions, operations, and maintenance.

### Document Tradeoffs

Record limitations alongside advantages.

### Require Approval

Restaurant ownership must authorize the final architecture.

---

## Business Requirements Discovery

The evaluation begins with an approved requirements inventory.

### Merchandise Types

Identify which products the business intends to sell.

### Product Volume

Estimate the number of active products.

### Variant Complexity

Determine whether products require sizes, colors, or other options.

### Inventory Ownership

Confirm who controls merchandise stock.

### Production Model

Determine whether products are stocked or produced on demand.

### Fulfillment Model

Confirm whether the restaurant or a third party ships orders.

### Shipping Coverage

Define intended delivery destinations.

### Payment Methods

Identify required payment capabilities.

### Refund Policy

Confirm operational and financial expectations.

### Administrative Roles

Identify personnel responsible for products, inventory, and orders.

### Reporting Needs

Determine what information management requires.

### Budget

Establish acceptable startup and recurring costs.

---

## Commerce Architecture Candidates

The evaluation should consider five architecture categories.

| Option | Primary Concept | Principal Tradeoff |
|---|---|---|
| A | Retain existing external storefront | Limited website-native control |
| B | Adopt hosted commerce platform | Provider dependence |
| C | Use headless commerce backend | Greater integration complexity |
| D | Build Supabase-native commerce | Greater engineering responsibility |
| E | Combine provider commerce with website presentation | Synchronization and ownership complexity |

### Evaluation Scope

Each option must be assessed against the same approved requirements.

### No Automatic Winner

A more customizable architecture is not necessarily a better business decision.

### Documentation Rule

Record verified findings separately from preliminary assumptions.

---

## Option A — Existing External Storefront

### Description

Continue using the current external merchandise shopping experience.

### Potential Advantages

- Preserves an existing customer workflow.
- Minimizes immediate development.
- May retain existing product and order administration.
- Avoids premature payment integration.
- May already support fulfillment.

### Potential Limitations

- Less control over storefront presentation.
- Possible iframe or mobile usability constraints.
- Dependence on existing provider capabilities.
- Potential limitations in reporting or integration.

### Required Investigation

- Identify the actual provider.
- Confirm account ownership.
- Review product administration.
- Test mobile checkout.
- Verify payment and refund workflows.
- Confirm shipping and fulfillment responsibilities.
- Obtain current fee information.

### Decision Condition

Retain this option if it meets the business's approved needs at an acceptable cost.

---

## Option B — Hosted Commerce Platform

### Description

Use a managed commerce platform that provides catalog, checkout, and order-management functionality.

### Potential Advantages

- Established commerce workflows.
- Provider-supported payment integrations.
- Product and inventory administration.
- Order and fulfillment tooling.
- Potentially lower custom maintenance.

### Potential Limitations

- Subscription or transaction expenses.
- Provider-specific constraints.
- Limited control over certain checkout experiences.
- Dependence on platform policies and availability.

### Evaluation Questions

- Can the platform support the intended merchandise?
- Does it offer the required variant model?
- Can it manage the chosen fulfillment process?
- Does it support the desired website integration?
- Are checkout and payment arrangements acceptable?
- Can staff manage products without developer assistance?

### Decision Condition

Prefer this category when managed commerce capabilities satisfy requirements without excessive customization.

---

## Option C — Headless Commerce

### Description

Use a commerce backend while presenting products through a custom Next.js storefront.

### Potential Advantages

- Greater control over guest-facing design.
- Potential reuse of existing website components.
- Flexible product presentation.
- Separation of frontend and commerce backend.

### Potential Limitations

- Additional integration development.
- API dependencies.
- Cart and checkout coordination.
- Webhook and synchronization responsibilities.
- More extensive testing.

### Required Capabilities

- Product API access.
- Variant identification.
- Cart or checkout creation.
- Inventory availability.
- Order verification.
- Payment integration.
- Fulfillment updates.

### Critical Question

Does the selected provider officially support the required headless workflow?

### Decision Condition

Consider this approach when custom presentation offers meaningful value and the required APIs are verified.

---

## Option D — Supabase-Native Commerce

### Description

Develop custom commerce functionality using the existing Next.js and Supabase infrastructure.

### Potential Advantages

- Direct control over custom data structures.
- Flexible manager interfaces.
- Custom reporting.
- Integration with existing authentication.

### Potential Limitations

- Custom cart development.
- Inventory concurrency requirements.
- Order lifecycle complexity.
- Payment coordination.
- Refund and dispute operations.
- Security and compliance review.
- Ongoing maintenance burden.

### Required Engineering

- Product and variant records.
- Inventory model.
- Cart persistence.
- Server-authoritative pricing.
- Payment provider integration.
- Order creation.
- Webhook handling.
- Fulfillment integration.
- Administrative permissions.
- Financial reconciliation.

### Decision Condition

Use only when verified requirements justify the additional development and operating responsibilities.

---

## Option E — Hybrid Commerce Architecture

### Description

Use an external provider for authoritative commerce operations while the website maintains selected presentation or administrative functionality.

### Potential Advantages

- Flexible branded presentation.
- Provider-managed checkout.
- Potentially reduced custom payment exposure.
- Incremental integration opportunities.

### Potential Limitations

- Multiple systems.
- Synchronization complexity.
- Conflicting product or price records.
- External API dependency.
- Additional troubleshooting responsibilities.

### Authority Model

Identify one authoritative source for each critical field.

### Example Boundary

The provider may own product prices and inventory while Next.js displays approved catalog content.

### Required Safeguards

- Stable identifier mapping.
- Defined synchronization direction.
- Error monitoring.
- Conflict resolution.
- Checkout revalidation.

### Decision Condition

Choose only when the integration benefit outweighs the added complexity.

---

## Representative Platform Research

Specific providers may be considered during formal research.

### Shopify

Evaluate relevant storefront, catalog, checkout, inventory, and integration capabilities.

### WooCommerce

Evaluate hosting responsibilities, plugin dependencies, security maintenance, and checkout options.

### BigCommerce

Evaluate catalog management, APIs, checkout capabilities, and operating costs.

### Square

Evaluate merchandise commerce suitability, payment arrangements, and supported integrations.

### Print-on-Demand Providers

Evaluate production, product variants, fulfillment, branding, and shipping.

### Existing Storefront Provider

Include the current provider as a required baseline candidate.

### Research Requirements

For each candidate, verify:

- Current plan eligibility.
- Supported commerce features.
- Available APIs.
- Checkout customization.
- Payment requirements.
- Inventory capabilities.
- Shipping integrations.
- Fees.
- Data export.
- Support arrangements.

### Qualification

These names are research candidates, not recommendations or confirmed integrations.

---

## Product Catalog Evaluation

### Product Count

Can the platform support the expected catalog size?

### Variants

Can it represent sizes, colors, and valid combinations?

### SKUs

Does it support reliable SKU identification?

### Pricing

Can authorized personnel maintain prices?

### Categories

Can merchandise be organized appropriately?

### Collections

Can products be featured or grouped?

### Media

Can product images be managed efficiently?

### Publication

Can unfinished products remain hidden?

### Imports and Exports

Can product information be moved between systems?

### Historical Orders

Are completed orders protected from later catalog changes?

---

## Inventory Management Evaluation

### Inventory Authority

Which system owns available quantities?

### Variant Stock

Can quantities be tracked by SKU?

### Stock Adjustments

Can authorized personnel correct inventory?

### Receiving

Can incoming merchandise be recorded?

### Reservations

Does checkout support appropriate stock protection?

### Concurrent Purchases

How does the platform prevent overselling?

### Multiple Locations

Is multi-location support available if needed?

### Low-Stock Alerts

Can managers identify replenishment needs?

### External Fulfillment

Can the platform work with the selected provider?

### Reconciliation

Can stock changes be audited and corrected?

---

## Shopping Cart Evaluation

### Product Selection

Does the cart preserve exact variants?

### Quantity Changes

Can guests update quantities?

### Cart Persistence

Can a cart survive appropriate navigation or session changes?

### Mobile Experience

Does the cart work reliably on phones?

### Availability

Are unavailable items handled correctly?

### Pricing

Are totals authoritative?

### Shipping

Can relevant shipping options be presented?

### Discounts

Does the platform support approved promotions?

### Recovery

Can guests recover from checkout interruptions?

### Integration

Can the cart connect safely to the selected checkout workflow?

---

## Checkout and Payment Evaluation

### Hosted Checkout

Is a managed payment interface available?

### Embedded Checkout

Is an officially supported embedded option available?

### Payment Methods

Does the provider support required payment methods?

### Merchant Ownership

Can the correct business entity receive settlement?

### Payment Verification

Can authoritative transaction outcomes be established?

### Refunds

Are approved refunds supported?

### Disputes

Are dispute management tools available?

### Webhooks

Can payment events be verified?

### Idempotency

Can repeated requests be handled safely?

### Compliance

Are the merchant's payment security responsibilities documented?

---

## Shipping and Fulfillment Evaluation

### Fulfillment Ownership

Can the platform support the intended operating model?

### Shipping Regions

Can unsupported destinations be restricted?

### Shipping Rates

Can authoritative rates be calculated?

### Carrier Support

Are the required shipping services available?

### Labels

Can labels be generated where necessary?

### Tracking

Can tracking references be associated with orders?

### Partial Shipments

Can orders be split when appropriate?

### Local Pickup

Is pickup supported if approved?

### Returns

Can the platform coordinate returns and exchanges?

### Third-Party Providers

Are required fulfillment integrations supported?

---

## Manager Administration Evaluation

### Product Editor

Can authorized staff maintain merchandise listings?

### Variant Editor

Can staff manage product options?

### Pricing Permissions

Can sensitive price changes be restricted?

### Inventory Controls

Can stock be maintained appropriately?

### Order Review

Can staff inspect confirmed merchandise orders?

### Fulfillment Controls

Can authorized operators update fulfillment?

### Refund Controls

Can financial permissions be separated?

### Audit History

Are significant changes traceable?

### Staff Training

Can personnel use the interface effectively?

### Existing Dashboard

Determine whether integration with `/admin` is justified or whether the provider portal is preferable.

---

## Next.js Integration Evaluation

### Framework Compatibility

Verify support for the current Next.js App Router architecture.

### Server-Side Integration

Determine which operations require secure backend execution.

### Client Components

Review supported browser-facing storefront components.

### Checkout Navigation

Verify redirect or embedded checkout requirements.

### API Access

Confirm official API availability and restrictions.

### Authentication

Determine whether customer identity must be shared.

### Product Rendering

Review options for server-rendered catalog pages.

### Caching

Identify safe caching strategies.

### Error Handling

Plan for provider outages and unavailable data.

### Deployment

Confirm compatibility with the existing Vercel workflow.

---

## Supabase Integration Evaluation

### Existing Database

Supabase PostgreSQL is already part of the website architecture.

### Existing Authentication

Supabase Auth supports protected administration.

### Product Records

Determine whether local product storage is necessary.

### Inventory Records

Avoid duplicate authoritative stock systems.

### Cart Records

Evaluate whether custom persistence is justified.

### Order Records

Determine which system owns the authoritative order.

### Storage

Consider approved merchandise media storage.

### Row Level Security

Protect customer and administrative records.

### Provider Synchronization

Document any required external mappings.

### Architecture Rule

Existing infrastructure availability is not sufficient justification for rebuilding provider-managed commerce functionality.

---

## Security and Compliance Evaluation

### Payment Data

Determine whether the website directly encounters cardholder data.

### PCI DSS

Assess applicable merchant responsibilities.

### Authentication

Protect administrative access.

### Authorization

Restrict sensitive commerce operations.

### Customer Privacy

Protect contact and shipping information.

### Secrets

Keep privileged credentials server-side.

### Webhooks

Verify authenticity of provider events.

### Auditability

Record material administrative and financial changes.

### Incident Response

Define procedures for payment or customer data incidents.

### Vendor Review

Evaluate provider security documentation and contractual responsibilities.

---

## Guest Experience Evaluation

### Discovery

Can guests find merchandise easily?

### Product Detail

Are products and variants understandable?

### Cart Usability

Can guests review and change selections?

### Checkout Steps

Is the purchase process clear?

### Mobile Responsiveness

Does checkout work well on narrow screens?

### Payment Confidence

Does the interface clearly identify the payment process?

### Order Confirmation

Can guests verify the purchase outcome?

### Shipping Information

Are costs and expectations disclosed?

### Error Recovery

Can guests correct problems without unnecessary repetition?

### Support

Is assistance available for unresolved orders?

---

## Branding and Customization Evaluation

### Visual Identity

Can the experience reflect Fin & Feathers branding?

### Logo

Can approved brand assets be used?

### Typography

Can presentation remain consistent?

### Colors

Can the interface use the approved visual palette?

### Product Photography

Can imagery be presented effectively?

### Navigation

Can merchandise remain integrated with the main website?

### Modal Compatibility

Determine whether the existing modal approach remains appropriate.

### Checkout Branding

Review provider-supported customization.

### Accessibility

Ensure visual customization preserves usability.

### Tradeoff

Do not prioritize cosmetic control over secure, reliable commerce functionality.

---

## Performance and Reliability Evaluation

### Catalog Load Time

Assess product listing performance.

### Image Delivery

Evaluate responsive image optimization.

### Cart Responsiveness

Measure interaction reliability.

### Checkout Availability

Review provider service reliability.

### API Limits

Confirm applicable request limits.

### Caching

Determine which information can be safely cached.

### Inventory Freshness

Ensure checkout does not rely on stale stock.

### Price Freshness

Validate final prices.

### Provider Outages

Document fallback behavior.

### Monitoring

Determine how failures can be detected and investigated.

---

## Reporting and Analytics Evaluation

### Merchandise Sales

Can the platform report completed transactions?

### Product Performance

Can managers identify popular products?

### Variant Performance

Can sales be analyzed by size or color?

### Refunds

Are financial reversals visible?

### Discounts

Can promotional impact be measured?

### Shipping Costs

Can fulfillment expenses be reviewed?

### Payment Fees

Can processor costs be reconciled?

### Inventory

Can stock movement be reported?

### Customer Behavior

Can approved cart and checkout metrics be measured?

### Exports

Can reports be exported in useful formats?

---

## Data Ownership and Portability

### Product Export

Can product records be exported?

### Variant Export

Are SKU relationships preserved?

### Inventory Export

Can stock data be retrieved?

### Customer Data

Review lawful access and export capabilities.

### Order History

Determine whether completed orders can be exported.

### Payment References

Identify which transaction references are available.

### Media

Determine how product images can be retrieved.

### Data Format

Review supported export formats.

### Migration

Estimate the effort required to change platforms.

### Critical Principle

A platform should not be selected without understanding the practical consequences of leaving it.

---

## Vendor Dependence and Exit Strategy

### Contract Terms

Review applicable commitments and termination conditions.

### Subscription Changes

Consider future pricing increases.

### Feature Restrictions

Identify functions tied to higher-cost plans.

### API Dependence

Review integration stability and limitations.

### Payment Dependence

Determine whether merchant arrangements can be changed.

### Data Export

Verify access to essential commerce records.

### Domain and Branding

Ensure ownership of business-controlled assets.

### Operational Transition

Plan how existing orders would be completed during migration.

### Rollback

Determine whether the previous storefront can be restored.

### Exit Cost

Estimate time and expense required to leave the platform.

---

## Cost and Total Ownership Evaluation

Evaluate cost over an appropriate multi-year planning period.

### Subscription Fees

Include recurring platform charges.

### Transaction Fees

Include payment processing expenses.

### Platform Transaction Surcharges

Verify whether additional commerce fees apply.

### Development

Estimate implementation and integration work.

### Hosting

Include any additional infrastructure requirements.

### Plugins and Extensions

Account for paid integrations.

### Fulfillment

Include storage, packing, and shipping costs.

### Support

Estimate operational and technical maintenance.

### Migration

Include data transfer and training.

### Financial Comparison

Compare total ownership cost rather than headline subscription price.

---

## Weighted Evaluation Scorecard

Use a consistent scoring method after requirements are approved.

### Proposed Scoring Scale

| Score | Interpretation |
|---|---|
| 0 | Requirement unsupported or not verified |
| 1 | Major limitations |
| 2 | Partial support with significant work |
| 3 | Acceptable support |
| 4 | Strong support |
| 5 | Excellent verified support |

### Proposed Evaluation Weights

| Criterion | Weight |
|---|---:|
| Product catalog and variants | 10% |
| Inventory management | 10% |
| Cart and checkout | 15% |
| Payment security and reliability | 15% |
| Shipping and fulfillment | 10% |
| Manager administration | 10% |
| Next.js integration | 10% |
| Total ownership cost | 10% |
| Data portability | 5% |
| Support and reliability | 5% |
| **Total** | **100%** |

### Calculation

    Weighted Score =
        Sum of (Criterion Score / 5 × Criterion Weight)

### Evidence Requirement

Every score should reference verified provider capabilities or tested behavior.

### Unknown Capabilities

Do not award favorable scores to unverified features.

### Weight Approval

Restaurant ownership should approve weights before comparing finalists.

### Decision Rule

A high score does not override mandatory security, payment, or operational requirements.

---

## Proof-of-Concept Requirements

Shortlisted platforms should complete representative tests.

### Test Product

Create a sample merchandise product.

### Variants

Configure multiple sizes or colors.

### Inventory

Test availability for a limited-stock variant.

### Cart

Add and update the selected configuration.

### Checkout

Complete an authorized test transaction.

### Payment Failure

Test a declined or interrupted payment.

### Order Confirmation

Verify authoritative order creation.

### Fulfillment

Demonstrate the intended shipping or fulfillment handoff.

### Refund

Test the supported refund process.

### Administration

Have an authorized staff representative complete common management tasks.

---

## Risk Assessment

### Vendor Lock-In

The business may become dependent on provider-specific workflows.

### Cost Escalation

Subscriptions, transaction fees, and extensions may increase expenses.

### Integration Complexity

Custom APIs may require ongoing engineering work.

### Payment Security

Poorly designed integrations may increase security exposure.

### Inventory Inconsistency

Competing stock systems may cause overselling.

### Fulfillment Failures

Orders may not reach the responsible operator.

### Data Migration

Product and order records may be difficult to transfer.

### Administrative Complexity

Staff may struggle with unfamiliar workflows.

### Provider Outage

External services may become unavailable.

### Mitigation

Record a responsible owner and mitigation strategy for every material risk.

---

## Decision Gates and Approval Process

### Gate 1 — Requirements Approved

Business requirements are documented and accepted.

### Gate 2 — Existing Provider Reviewed

The current storefront's capabilities and costs are verified.

### Gate 3 — Candidate Shortlist Approved

Only viable platforms proceed to deeper evaluation.

### Gate 4 — Technical Feasibility Confirmed

Required integrations and workflows are supported.

### Gate 5 — Financial Review Completed

Total ownership costs are understood.

### Gate 6 — Security Review Completed

Payment and customer data responsibilities are acceptable.

### Gate 7 — Proof of Concept Passed

Critical workflows function in an approved test environment.

### Gate 8 — Operational Approval

Staff responsibilities and procedures are documented.

### Gate 9 — Ownership Decision

Restaurant ownership approves the selected platform.

### Gate 10 — Implementation Authorization

Production development proceeds only after formal approval.

---

## Recommended Evaluation Sequence

### Step 1 — Identify Existing Provider

Document the current storefront platform and account ownership.

### Step 2 — Review Current Performance

Assess existing merchandise operations and guest experience.

### Step 3 — Document Business Needs

Separate mandatory requirements from optional improvements.

### Step 4 — Establish Budget

Determine acceptable implementation and recurring expenses.

### Step 5 — Research Candidates

Review current official platform documentation.

### Step 6 — Verify Critical Features

Confirm checkout, payments, inventory, and fulfillment.

### Step 7 — Compare Costs

Prepare a consistent total ownership model.

### Step 8 — Run Proofs of Concept

Test representative merchandise workflows.

### Step 9 — Score Candidates

Apply the approved evaluation framework.

### Step 10 — Document Recommendation

Explain the preferred option and alternatives.

### Step 11 — Obtain Approval

Record the authorized decision.

### Step 12 — Plan Migration

Define implementation, testing, and rollback.

---

## Implementation Roadmap

### Phase 0 — Baseline Discovery

Inspect the existing external merchandise storefront.

### Phase 1 — Requirements

Document product, inventory, checkout, and fulfillment needs.

### Phase 2 — Platform Research

Evaluate relevant providers and architecture categories.

### Phase 3 — Shortlist

Select candidates meeting mandatory requirements.

### Phase 4 — Financial Comparison

Review implementation and operating expenses.

### Phase 5 — Technical Validation

Confirm integration feasibility.

### Phase 6 — Proof of Concept

Test representative product-to-fulfillment workflows.

### Phase 7 — Security Review

Assess payment, privacy, and administrative controls.

### Phase 8 — Platform Decision

Obtain ownership approval.

### Phase 9 — Detailed Architecture

Define system authorities and integration boundaries.

### Phase 10 — Implementation Planning

Prepare milestones, staffing, and rollback procedures.

### Phase 11 — Development

Begin approved production work.

### Phase 12 — Launch Review

Require acceptance testing before replacing existing functionality.

---

## Acceptance Criteria

### Discovery

- [ ] Existing merchandise provider identified.
- [ ] Current merchant account ownership verified.
- [ ] Current fulfillment process documented.
- [ ] Current fees obtained.

### Requirements

- [ ] Mandatory capabilities approved.
- [ ] Optional capabilities prioritized.
- [ ] Budget expectations established.
- [ ] Administrative responsibilities identified.

### Evaluation

- [ ] Viable architecture options compared.
- [ ] Provider claims verified.
- [ ] Security obligations reviewed.
- [ ] Total ownership costs evaluated.
- [ ] Data portability assessed.

### Decision

- [ ] Scorecard completed.
- [ ] Proof-of-concept results documented.
- [ ] Material risks reviewed.
- [ ] Restaurant ownership approves the platform.

### Implementation Readiness

- [ ] Integration architecture documented.
- [ ] Migration plan prepared.
- [ ] Rollback plan reviewed.
- [ ] Production work explicitly authorized.

---

## Implementation Status

| Evaluation Component | Status |
|---|---|
| Existing external merchandise storefront | Established |
| Existing provider identification | Pending verification |
| Existing merchant ownership | Pending verification |
| Current inventory model | Unverified |
| Current fulfillment model | Unverified |
| Business requirements | Planning |
| Product catalog requirements | Documented conceptually |
| Inventory requirements | Documented conceptually |
| Cart and checkout requirements | Documented conceptually |
| Payment requirements | Documented conceptually |
| Shipping requirements | Documented conceptually |
| Hosted commerce evaluation | Proposed |
| Headless commerce evaluation | Proposed |
| Supabase-native evaluation | Proposed |
| Hybrid architecture evaluation | Proposed |
| Representative provider research | Not completed |
| Official feature verification | Pending |
| Provider pricing comparison | Pending |
| Weighted scorecard | Proposed |
| Proof-of-concept testing | Not started |
| Security review | Pending |
| Data portability review | Pending |
| Final platform recommendation | Not issued |
| Ownership approval | Pending |
| Production implementation | Not authorized |

### Overall Assessment

The merchandise commerce platform decision remains open.

The existing external storefront is the required baseline for evaluation.

The next major decision is whether the business needs a different commerce platform at all.

A replacement should proceed only when documented benefits justify the costs and operational responsibilities.

---

## Related Documentation

### Merchandise Commerce

- [Merchandise Commerce Overview](README.md)
- [Commerce Architecture Overview](commerce-overview.md)
- [Product Catalog](product-catalog.md)
- [Inventory Management](inventory-management.md)
- [Cart and Checkout](cart-and-checkout.md)
- [Payment Processing](payment-processing.md)
- [Shipping and Fulfillment](shipping-and-fulfillment.md)
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

### Separate Restaurant Ordering

- [Toast POS Integration Overview](../10-toast-pos-integration/README.md)
- [Toast API Feasibility](../10-toast-pos-integration/api-feasibility.md)
- [Toast Cost Analysis](../10-toast-pos-integration/cost-analysis.md)

### Master Index

- [Master Documentation Index](../README.md)

---

[Back to Merchandise Commerce Overview](README.md)
