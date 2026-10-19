# TOAST POS INTEGRATION — Implementation Roadmap

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** Strategic Planning and Feasibility Evaluation

**Audience:** Restaurant Ownership, Managers, Developers, Technical Administrators, Financial Decision-Makers, and Integration Partners

**Implementation Status:** External Toast ordering established; direct integration remains proposed and unapproved

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Executive Implementation Strategy](#executive-implementation-strategy)
3. [Current Project Baseline](#current-project-baseline)
4. [Implementation Principles](#implementation-principles)
5. [Scope and Boundaries](#scope-and-boundaries)
6. [Target Integration Capabilities](#target-integration-capabilities)
7. [Dependencies and Prerequisites](#dependencies-and-prerequisites)
8. [Project Governance](#project-governance)
9. [Phase 0 — Discovery and Baseline Assessment](#phase-0--discovery-and-baseline-assessment)
10. [Phase 1 — Toast Eligibility and API Feasibility](#phase-1--toast-eligibility-and-api-feasibility)
11. [Phase 2 — Requirements and Architecture Approval](#phase-2--requirements-and-architecture-approval)
12. [Phase 3 — Menu Data Mapping](#phase-3--menu-data-mapping)
13. [Phase 4 — Menu Synchronization Prototype](#phase-4--menu-synchronization-prototype)
14. [Phase 5 — Menu Synchronization Production Readiness](#phase-5--menu-synchronization-production-readiness)
15. [Phase 6 — Cart and Checkout Feasibility](#phase-6--cart-and-checkout-feasibility)
16. [Phase 7 — Cart and Checkout Development](#phase-7--cart-and-checkout-development)
17. [Phase 8 — Order Submission Integration](#phase-8--order-submission-integration)
18. [Phase 9 — Payment Architecture and Integration](#phase-9--payment-architecture-and-integration)
19. [Phase 10 — Security and Compliance Review](#phase-10--security-and-compliance-review)
20. [Phase 11 — End-to-End Testing](#phase-11--end-to-end-testing)
21. [Phase 12 — Restaurant Staff Acceptance](#phase-12--restaurant-staff-acceptance)
22. [Phase 13 — Production Rollout](#phase-13--production-rollout)
23. [Phase 14 — Monitoring and Optimization](#phase-14--monitoring-and-optimization)
24. [Integration Architecture Decisions](#integration-architecture-decisions)
25. [Database and Infrastructure Planning](#database-and-infrastructure-planning)
26. [Security and Credential Management](#security-and-credential-management)
27. [Operational Workflows](#operational-workflows)
28. [Financial Planning and Budget Approval](#financial-planning-and-budget-approval)
29. [Testing Strategy](#testing-strategy)
30. [Risk Management](#risk-management)
31. [Rollback and Fallback Strategy](#rollback-and-fallback-strategy)
32. [Milestones and Deliverables](#milestones-and-deliverables)
33. [Decision Gates and Acceptance Criteria](#decision-gates-and-acceptance-criteria)
34. [Project Dependencies](#project-dependencies)
35. [Timeline and Scheduling](#timeline-and-scheduling)
36. [Implementation Status](#implementation-status)
37. [Next Actions](#next-actions)
38. [Related Documentation](#related-documentation)

---

## Purpose

This document establishes a phased implementation roadmap for a potential direct integration between the Fin & Feathers Las Vegas website and Toast POS.

The restaurant currently uses Toast as its external online ordering destination.

The proposed integration may eventually provide:

- More consistent menu information.
- Reduced duplication of menu administration.
- Menu availability synchronization.
- Improved guest ordering continuity.
- A native website cart.
- An officially supported checkout experience.
- Authorized direct order submission.
- Improved ordering diagnostics and operational visibility.

These capabilities must be evaluated individually.

A direct Toast integration is not automatically necessary to achieve every business objective.

For example, menu synchronization may deliver meaningful operational benefits without requiring a native cart or payment integration.

The roadmap therefore uses incremental discovery, development, testing, and approval stages.

### Primary Objective

Determine the smallest technically supported and financially justified integration that improves restaurant operations and guest experience.

### Implementation Boundary

This document is a plan.

It does not authorize development spending, grant Toast API access, establish vendor functionality, or activate production integration services.

---

## Executive Implementation Strategy

The recommended strategy is to evaluate integration capabilities in increasing order of complexity.

### First Priority — Preserve Existing Ordering

Keep the established Toast ordering experience available.

### Second Priority — Confirm Vendor Access

Determine which Toast integration capabilities the restaurant can actually use.

### Third Priority — Evaluate Menu Synchronization

Investigate whether menu information can be coordinated reliably.

### Fourth Priority — Evaluate Checkout Improvements

Determine whether Toast supports an authorized cart or hosted checkout handoff.

### Fifth Priority — Consider Direct Submission

Proceed only if direct order creation is permitted and justified.

### Sixth Priority — Evaluate Payment Requirements

Avoid unnecessary expansion of payment-processing responsibilities.

### Seventh Priority — Validate Operational Readiness

Require restaurant staff acceptance before any production transition.

### Eighth Priority — Maintain a Fallback

Preserve the external ordering path until an alternative is proven reliable.

### Strategic Rule

The restaurant may stop after any successful phase if further integration does not offer sufficient value.

---

## Current Project Baseline

### Website

    https://finandfeatherslv.live

### Repository

    tre1techniqai/finandfeatherslv

### Application Framework

    Next.js App Router

### Language

    TypeScript

### Deployment

    Vercel

### Database

    Supabase PostgreSQL

### Authentication

    Supabase Auth

### Media Storage

    Supabase Storage

### Existing Manager Routes

    /admin/login
    /admin
    /admin/menu

### Existing Menu Features

- Protected manager menu administration.
- Menu categories and subcategories.
- Item descriptions and pricing.
- Modifier-related menu information.
- Food image management.
- Existing $5 specials toggle.

### Ordering

The ORDER ONLINE action currently directs guests to Toast's external ordering experience.

### Integration Status

Direct Toast API integration has not been established as implemented.

### Preservation Requirement

All existing website functionality must remain operational throughout feasibility evaluation and any later integration work.

---

## Implementation Principles

### 1. Documentation Before Development

Define requirements before modifying production code.

### 2. Vendor Authorization First

Use only officially supported and authorized Toast interfaces.

### 3. Mobile-First Design

Maintain the existing mobile-first website direction.

### 4. Incremental Delivery

Develop and approve independent capabilities where practical.

### 5. Authoritative Data

Define the source of truth for menu, pricing, availability, and orders.

### 6. Server-Side Security

Keep privileged integrations outside public browser code.

### 7. Reliable Ordering

Never treat an unverified submission as an accepted restaurant order.

### 8. Payment Separation

Prefer approved provider-controlled payment workflows.

### 9. Operational Simplicity

Avoid creating unnecessary administrative responsibilities.

### 10. Reversible Deployment

Provide a practical rollback or fallback for every production change.

---

## Scope and Boundaries

### Potentially In Scope

- Toast API eligibility assessment.
- Integration architecture.
- Menu identifier mapping.
- Menu synchronization.
- Availability synchronization where supported.
- Native cart feasibility.
- Supported checkout handoff.
- Direct order submission where authorized.
- Payment workflow evaluation.
- Monitoring and operational support.

### Not Automatically In Scope

- Replacing the restaurant's POS.
- Rebuilding Toast's entire ordering platform.
- Creating a custom payment processor.
- Collecting raw cardholder information.
- Changing restaurant menu prices.
- Changing published service policies.
- Implementing unsupported Toast features.
- Replacing the existing manager dashboard.
- Integrating unrelated commerce systems.

### Separate Project Boundary

The future merchandise storefront has its own commerce roadmap.

Restaurant food ordering and merchandise purchasing must not be assumed to share the same checkout or fulfillment workflow.

### Scope Approval

Any additional functionality requires separate requirements and authorization.

---

## Target Integration Capabilities

| Capability | Potential Business Benefit | Feasibility |
|---|---|---|
| Toast menu retrieval | Reduce duplicate menu administration | Unconfirmed |
| Menu item mapping | Maintain consistent item identity | Proposed |
| Modifier synchronization | Reduce option inconsistencies | Unconfirmed |
| Pricing synchronization | Improve displayed price accuracy | Unconfirmed |
| Availability synchronization | Reduce unavailable selections | Unconfirmed |
| SPECIALS coordination | Improve promotional consistency | Unconfirmed |
| Native cart | Improve ordering continuity | Proposed |
| Hosted checkout handoff | Reduce checkout navigation | Unconfirmed |
| Direct order submission | Support integrated ordering | Unconfirmed |
| Order status retrieval | Improve confirmation accuracy | Unconfirmed |
| Payment integration | Support approved checkout architecture | Unconfirmed |
| Refund integration | Improve financial operations | Unconfirmed |
| Webhooks | Support event-driven updates | Unconfirmed |

### Prioritization

Business value, vendor eligibility, implementation effort, security exposure, and ongoing cost should determine priority.

---

## Dependencies and Prerequisites

The roadmap depends on several external and internal conditions.

### Toast Eligibility

Confirm that the restaurant qualifies for the required API capabilities.

### Merchant Authorization

Obtain approval from the appropriate restaurant representative.

### Official Documentation

Review the applicable Toast API contract.

### Test Environment

Obtain authorized testing access.

### Current Menu Inventory

Identify website menu records and their approved taxonomy.

### Restaurant Workflow

Document pickup, payment, and order-acceptance procedures.

### Technical Access

Confirm appropriate repository, Vercel, and Supabase access.

### Financial Approval

Approve estimated development and operating costs.

### Security Review

Identify credentials, data flows, and payment obligations.

### Dependency Rule

Do not begin production implementation when a critical prerequisite remains unresolved.

---

## Project Governance

### Restaurant Ownership

Approves business objectives, budget, and production launch.

### Restaurant Managers

Validate menu information and operational workflows.

### Development Team

Designs, implements, tests, and documents approved functionality.

### Technical Administrator

Manages authorized infrastructure and credentials.

### Toast or Approved Partner

Provides supported integration capabilities and applicable technical guidance.

### Financial Reviewer

Evaluates processing costs and return on investment.

### Security Reviewer

Assesses integration and payment risks.

### Decision Record

Maintain a record of major architecture and vendor decisions.

### Change Control

Changes to approved scope should be reviewed before implementation.

---

## Phase 0 — Discovery and Baseline Assessment

**Status:** Planning.

### Objective

Document the existing website, menu, and ordering environment.

### Activities

1. Inspect the current application structure.
2. Review the menu data model.
3. Inspect the manager menu editor.
4. Identify existing Toast ordering links.
5. Document the current restaurant ordering workflow.
6. Review current menu update procedures.
7. Identify duplicate administrative tasks.
8. Obtain current Toast invoices and relevant reports.
9. Identify responsible restaurant personnel.
10. Record existing operational pain points.

### Deliverables

- Current-state architecture.
- Menu inventory.
- Ordering workflow baseline.
- Initial cost baseline.
- Business requirements register.

### Exit Criteria

The team understands the existing environment sufficiently to evaluate integration options.

### Restriction

Discovery must not alter production ordering behavior.

---

## Phase 1 — Toast Eligibility and API Feasibility

**Status:** Not confirmed.

### Objective

Determine which Toast integration capabilities are available to the restaurant.

### Activities

1. Contact Toast through an appropriate official channel.
2. Confirm merchant integration eligibility.
3. Determine whether partner enrollment is required.
4. Request applicable API documentation.
5. Verify menu retrieval permissions.
6. Verify modifier and pricing access.
7. Verify availability support.
8. Verify direct order-creation permissions.
9. Verify checkout and payment options.
10. Determine whether status retrieval or webhooks are supported.
11. Obtain written commercial terms.
12. Confirm authorized testing procedures.

### Deliverables

- API capability matrix.
- Eligibility confirmation.
- Vendor requirements.
- Preliminary security obligations.
- Commercial terms summary.

### Exit Criteria

Each desired capability is classified as supported, unsupported, restricted, or unresolved.

### Stop Condition

If the required APIs are unavailable, do not attempt an unsupported workaround.

---

## Phase 2 — Requirements and Architecture Approval

**Status:** Proposed.

### Objective

Select the integration model justified by confirmed capabilities.

### Activities

1. Review Phase 1 findings.
2. Prioritize restaurant business needs.
3. Identify minimum viable functionality.
4. Define source-of-truth rules.
5. Select an integration architecture.
6. Identify server-side boundaries.
7. Define database requirements.
8. Evaluate payment responsibilities.
9. Estimate development and operating costs.
10. Document operational risks.
11. Define acceptance criteria.
12. Obtain ownership approval.

### Deliverables

- Approved scope.
- Architecture decision record.
- Requirements specification.
- Initial technical design.
- Cost estimate.
- Acceptance checklist.

### Exit Criteria

Ownership approves a feasible and financially justified scope.

### Alternative Outcome

Continue using external Toast ordering without additional integration.

---

## Phase 3 — Menu Data Mapping

**Status:** Proposed.

### Objective

Establish reliable relationships between website menu records and authorized Toast data.

### Activities

1. Inventory existing website items.
2. Review approved spreadsheet categories.
3. Identify Toast item identifiers.
4. Identify modifier group relationships.
5. Compare item names and descriptions.
6. Review base prices.
7. Identify market-price items.
8. Review availability information.
9. Define SPECIALS handling.
10. Record mapping conflicts.
11. Validate mappings with restaurant management.
12. Document unresolved differences.

### Menu Rules

Use only approved categories and subcategories.

Do not introduce a HOOKAH category filter.

Do not require images for COCKTAILS.

### Deliverables

- Item mapping specification.
- Modifier mapping specification.
- Field ownership matrix.
- Exception register.

### Exit Criteria

Representative menu items and modifiers have verified mappings.

---

## Phase 4 — Menu Synchronization Prototype

**Status:** Conditional on API feasibility.

### Objective

Test synchronization without risking production menu integrity.

### Activities

1. Establish authorized test access.
2. Implement protected server-side authentication.
3. Retrieve permitted menu data.
4. Validate response structures.
5. Apply documented field transformations.
6. Compare Toast data with website records.
7. Identify missing or conflicting items.
8. Test price and modifier handling.
9. Test availability behavior if supported.
10. Record synchronization diagnostics.
11. Evaluate data freshness.
12. Review results with managers.

### Prototype Boundary

Prefer a read-only comparison before allowing automated writes.

### Deliverables

- Controlled prototype.
- Mapping test results.
- Data comparison report.
- Synchronization risk assessment.

### Exit Criteria

The team demonstrates accurate, authorized data retrieval and mapping.

---

## Phase 5 — Menu Synchronization Production Readiness

**Status:** Proposed.

### Objective

Prepare an approved synchronization workflow for reliable operation.

### Activities

1. Approve field ownership.
2. Define synchronization direction.
3. Establish conflict-resolution rules.
4. Define update frequency.
5. Implement safe error handling.
6. Protect manager overrides where required.
7. Define rollback behavior.
8. Establish monitoring.
9. Test deleted or discontinued items.
10. Test stale data.
11. Review manager workflows.
12. Obtain production approval.

### SPECIALS

Do not assume the existing $5 specials toggle creates a Toast promotion.

### Images

Preserve the approved 4:3 WebP menu image workflow.

### Deliverables

- Synchronization runbook.
- Production readiness checklist.
- Monitoring requirements.
- Manager acceptance record.

### Exit Criteria

Synchronization can operate without uncontrolled changes to restaurant menu information.

---

## Phase 6 — Cart and Checkout Feasibility

**Status:** Unconfirmed.

### Objective

Determine whether a native website cart would provide sufficient value and is technically supported.

### Options

- Continue external Toast ordering.
- Use an officially supported hosted checkout handoff.
- Use an officially supported embedded checkout.
- Build a custom cart with an approved integration.
- Use a hybrid model.

### Activities

1. Confirm supported checkout mechanisms.
2. Determine whether cart data can be transferred.
3. Review modifier compatibility.
4. Review authoritative pricing.
5. Confirm fulfillment options.
6. Evaluate guest information requirements.
7. Review mobile usability.
8. Assess payment-security implications.
9. Estimate development costs.
10. Compare alternatives against the current experience.

### Deliverables

- Checkout feasibility report.
- Guest journey proposal.
- Cost comparison.
- Architecture recommendation.

### Exit Criteria

An officially supported and justified checkout model is selected.

### Stop Condition

Do not build a native cart solely on the assumption that Toast accepts transferred cart contents.

---

## Phase 7 — Cart and Checkout Development

**Status:** Conditional.

### Objective

Implement the approved guest ordering interface.

### Activities

1. Design mobile-first item selection.
2. Implement supported modifier controls.
3. Implement cart state.
4. Add quantity editing.
5. Add item removal.
6. Define cart persistence.
7. Integrate authoritative pricing.
8. Handle unavailable items.
9. Implement supported fulfillment options.
10. Implement approved checkout handoff.
11. Provide accessible error messages.
12. Test the complete guest journey.

### Security

Never trust browser-submitted prices.

### Payment

Avoid direct cardholder-data collection.

### Deliverables

- Approved cart interface.
- Checkout integration.
- Accessibility test results.
- Guest acceptance checklist.

### Exit Criteria

The complete cart and checkout workflow passes authorized testing.

---

## Phase 8 — Order Submission Integration

**Status:** Conditional on authorized API support.

### Objective

Submit valid restaurant orders reliably.

### Activities

1. Confirm order-creation permission.
2. Validate restaurant identifiers.
3. Validate item mappings.
4. Validate modifier selections.
5. Confirm authoritative pricing.
6. Define submission states.
7. Implement duplicate-prevention controls.
8. Handle vendor rejections.
9. Handle network timeouts.
10. Reconcile unknown outcomes.
11. Implement authoritative confirmation.
12. Establish staff escalation procedures.

### Critical Rule

A timeout does not prove that an order was rejected.

### Duplicate Prevention

Use vendor-supported idempotency mechanisms where available.

### Deliverables

- Authorized submission integration.
- Submission-state specification.
- Recovery procedures.
- Test evidence.

### Exit Criteria

Accepted, rejected, duplicate, and unknown submission outcomes are handled safely.

---

## Phase 9 — Payment Architecture and Integration

**Status:** Unconfirmed.

### Objective

Establish a secure and operationally consistent payment workflow.

### Activities

1. Confirm supported payment options.
2. Identify the authorized payment processor.
3. Define authorization and capture behavior.
4. Coordinate payment and order acceptance.
5. Define duplicate-charge safeguards.
6. Define refund procedures.
7. Define dispute responsibilities.
8. Establish reconciliation.
9. Review payment-data boundaries.
10. Determine PCI DSS obligations.
11. Conduct authorized payment tests.
12. Obtain finance and ownership approval.

### Preferred Boundary

Use provider-controlled payment collection when practical and supported.

### Important Restriction

Do not store raw cardholder data in Supabase.

### Deliverables

- Approved payment architecture.
- Financial reconciliation workflow.
- Security assessment.
- Payment acceptance record.

### Exit Criteria

Payment and order outcomes can be verified and reconciled.

---

## Phase 10 — Security and Compliance Review

**Status:** Pending.

### Objective

Verify that the selected integration meets applicable security and contractual requirements.

### Activities

1. Review API authentication.
2. Verify credential storage.
3. Confirm least-privilege permissions.
4. Inspect server-side authorization.
5. Review Supabase RLS policies.
6. Validate guest-input handling.
7. Verify pricing integrity.
8. Assess payment-data exposure.
9. Review webhook authenticity if applicable.
10. Inspect logging for sensitive data.
11. Review vendor requirements.
12. Document incident response.

### Credential Rule

Keep `.env.local` and privileged credentials out of Git.

### Deliverables

- Security checklist.
- Remediation register.
- Credential management procedure.
- Incident response plan.

### Exit Criteria

Material security findings are resolved or formally addressed before production release.

---

## Phase 11 — End-to-End Testing

**Status:** Not started.

### Objective

Validate complete guest and restaurant workflows.

### Menu Tests

- Approved items appear correctly.
- Modifiers are valid.
- Prices are accurate.
- Availability is handled.
- Category rules remain intact.

### Cart Tests

- Items can be added and removed.
- Quantities can be changed.
- Invalid selections are rejected.
- Cart state remains consistent.

### Order Tests

- Valid orders reach the intended restaurant.
- Rejected orders are reported accurately.
- Repeated requests do not create duplicates.
- Unknown outcomes are reconciled.

### Payment Tests

- Approved payment methods work.
- Declines are handled.
- Duplicate charges are prevented.
- Refund workflows are verified.

### Reliability Tests

- Network interruptions.
- Vendor outages.
- Stale menu data.
- Invalid credentials.
- Deployment rollback.

### Deliverables

- Test results.
- Defect register.
- Remediation evidence.
- Final technical acceptance report.

---

## Phase 12 — Restaurant Staff Acceptance

**Status:** Pending.

### Objective

Ensure the restaurant can operate and support the approved integration.

### Manager Review

Verify menu administration.

### Kitchen Review

Confirm accepted orders appear in the expected workflow.

### Guest Support

Review missing-order procedures.

### Duplicate Orders

Establish investigation and correction steps.

### Payments

Review authorized refund and reconciliation processes.

### Outages

Train staff on fallback procedures.

### Documentation

Provide current operating instructions.

### Training

Conduct role-appropriate training.

### Acceptance

Obtain confirmation from designated restaurant representatives.

### Exit Criteria

Staff can operate and support the integration without relying on undocumented procedures.

---

## Phase 13 — Production Rollout

**Status:** Not approved.

### Objective

Release the integration through a controlled deployment.

### Prelaunch

1. Confirm vendor authorization.
2. Confirm security approval.
3. Confirm staff readiness.
4. Verify production configuration.
5. Verify the intended restaurant location.
6. Confirm monitoring.
7. Confirm rollback procedures.
8. Preserve external Toast ordering.

### Deployment

Use the existing GitHub and Vercel workflow.

### Initial Monitoring

Observe authorized transactions and integration errors.

### Guest Messaging

Display accurate availability and status information.

### Stop Conditions

Suspend the new workflow if material ordering or payment errors occur.

### Exit Criteria

Production functionality operates reliably and the restaurant approves continued use.

---

## Phase 14 — Monitoring and Optimization

**Status:** Future.

### Objective

Maintain operational reliability and evaluate business value.

### Monitor

- Menu synchronization success.
- Data freshness.
- Cart errors.
- Checkout failures.
- Order submission outcomes.
- Unknown transactions.
- Duplicate attempts.
- Payment discrepancies.
- Vendor availability.
- Support incidents.

### Financial Review

Compare actual costs against the approved budget.

### Guest Experience

Evaluate measurable checkout usability improvements.

### Manager Feedback

Identify unnecessary administrative work.

### Maintenance

Review vendor API changes and dependencies.

### Documentation

Update operational procedures.

### Expansion

Consider additional capabilities only after stable operation.

### Exit Criteria

The integration demonstrates sustainable operational and financial value.

---

## Integration Architecture Decisions

Several architecture decisions must be recorded.

### Decision A — Integration Scope

Menu synchronization only or broader ordering integration?

### Decision B — Source of Truth

Which system owns each menu field?

### Decision C — Synchronization Direction

One-way or bidirectional, if supported?

### Decision D — Checkout Model

External, hosted, embedded, or custom?

### Decision E — Payment Responsibility

Which provider owns payment collection?

### Decision F — Order Submission

Is direct order creation required and authorized?

### Decision G — Status Retrieval

How are uncertain outcomes reconciled?

### Decision H — Failure Recovery

What happens during a Toast outage?

### Decision I — Data Retention

Which integration records must be stored?

### Decision J — Production Rollback

How is the previous ordering workflow restored?

### Decision Record Format

For each decision, record:

- Decision identifier.
- Business requirement.
- Alternatives considered.
- Verified vendor capability.
- Security impact.
- Financial impact.
- Selected approach.
- Approving party.
- Date.
- Review conditions.

---

## Database and Infrastructure Planning

The existing infrastructure should be reused where appropriate.

### Next.js

Provide trusted server-side integration functionality.

### Vercel

Host approved server operations.

### Supabase PostgreSQL

Store only necessary application records.

### Supabase Auth

Continue using established authentication.

### Manager Authorization

Preserve the existing `requireManager()` pattern.

### Potential Data Requirements

- External item mappings.
- Synchronization metadata.
- Error classifications.
- Approved audit history.
- Non-sensitive order submission references.

### Schema Boundary

These are proposed requirements, not claims about existing database tables.

### Database Security

Apply appropriate RLS and server-side authorization.

### Storage

Preserve the existing approved menu image workflow.

### Infrastructure Approval

Review any additional recurring costs before deployment.

---

## Security and Credential Management

### Vendor Credentials

Obtain only through approved Toast procedures.

### Server Storage

Keep privileged secrets in protected server configuration.

### Local Development

Use `.env.local` without committing it.

### Vercel

Use protected deployment environment variables.

### Browser

Never expose privileged Toast tokens.

### Authorization

Restrict integration operations to necessary permissions.

### Manager Actions

Apply server-side access controls.

### Guest Data

Collect and retain only necessary information.

### Payment Data

Avoid raw cardholder-data handling.

### Monitoring

Redact credentials and sensitive personal information.

### Incident Response

Document rotation, revocation, containment, and recovery.

---

## Operational Workflows

A technically functional integration is insufficient without clear restaurant procedures.

### Menu Update Workflow

Define how managers publish changes.

### Synchronization Workflow

Define how errors and conflicts are resolved.

### Unavailable Item Workflow

Define how sold-out items are handled.

### SPECIALS Workflow

Coordinate website promotions with actual ordering-system rules.

### Guest Checkout Workflow

Explain the approved checkout process.

### Missing Order Workflow

Verify authoritative order status before taking corrective action.

### Duplicate Order Workflow

Investigate repeated submissions and charges.

### Refund Workflow

Use approved payment-provider procedures.

### Vendor Outage Workflow

Restore the supported ordering fallback.

### Escalation Workflow

Assign responsibility for unresolved incidents.

---

## Financial Planning and Budget Approval

Financial approval should precede each material implementation commitment.

### Current Costs

Collect actual Toast subscription and transaction expenses.

### Vendor Costs

Obtain written integration pricing.

### Development

Estimate engineering effort by workstream.

### Testing

Budget for authorized integration and payment testing.

### Infrastructure

Estimate incremental Vercel and Supabase usage.

### Security

Include applicable reviews and compliance work.

### Maintenance

Estimate ongoing technical support.

### Operations

Account for manager and staff time.

### Benefits

Measure potential administrative savings and incremental profit.

### Approval

Ownership should approve scope, budget, and expected benefits.

### Important Rule

Unknown vendor fees must not be treated as zero.

---

## Testing Strategy

Testing should be progressive.

### Level 1 — Static Review

Inspect requirements, mappings, and architecture.

### Level 2 — Unit Tests

Validate transformation and business logic.

### Level 3 — Integration Tests

Test authorized Toast interfaces.

### Level 4 — Failure Tests

Simulate errors and interrupted requests.

### Level 5 — Security Tests

Validate trust boundaries and permissions.

### Level 6 — Payment Tests

Use authorized payment testing procedures.

### Level 7 — End-to-End Tests

Verify complete ordering flows.

### Level 8 — Staff Acceptance

Confirm restaurant operational behavior.

### Level 9 — Production Verification

Check controlled real-world operation after approval.

### Evidence

Record actual results rather than marking untested functionality complete.

---

## Risk Management

| Risk | Potential Impact | Mitigation |
|---|---|---|
| Toast API access unavailable | Integration cannot proceed | Confirm eligibility first |
| Unsupported checkout handoff | Native cart cannot transfer selections | Retain external ordering |
| Incorrect item mapping | Wrong items submitted | Verify stable identifiers |
| Pricing mismatch | Incorrect guest charges | Authoritative pricing |
| Duplicate order submission | Repeated orders | Idempotency and reconciliation |
| Unknown submission result | Missing or duplicated order | Authoritative status verification |
| Payment/order mismatch | Financial discrepancy | Approved reconciliation process |
| Credential exposure | Unauthorized access | Server-only secret management |
| Vendor outage | Interrupted ordering | Monitoring and fallback |
| Unexpected costs | Budget overrun | Written quotes and phased approval |
| Staff unprepared | Operational errors | Training and acceptance testing |
| Difficult rollback | Extended disruption | Reversible release plan |

### Risk Review

Update the risk register at every major decision gate.

### Risk Ownership

Assign a responsible party for each material risk.

### Acceptance

Do not accept unresolved critical ordering or payment risks without explicit review.

---

## Rollback and Fallback Strategy

The current external Toast ordering experience is the primary fallback.

### Before Deployment

Document the existing ordering link and configuration.

### Feature Isolation

Where practical, introduce new functionality behind controlled activation.

### Menu Synchronization Failure

Stop unsafe updates and restore the approved source of truth.

### Checkout Failure

Disable the new checkout entry point.

### Order Submission Failure

Stop direct submission when authoritative outcomes cannot be determined safely.

### Payment Failure

Follow the approved provider recovery process.

### Vendor Outage

Direct guests to the supported operational ordering experience where available.

### Deployment Rollback

Use the existing documented Vercel rollback process.

### Database Changes

Plan reversible migrations where practical.

### Incident Closure

Verify normal ordering behavior after recovery.

### Important Qualification

The fallback itself depends on Toast's external ordering service remaining available.

---

## Milestones and Deliverables

| Milestone | Required Deliverable | Approval |
|---|---|---|
| M0 — Baseline complete | Current-state assessment | Project owner |
| M1 — Eligibility confirmed | Toast capability matrix | Project owner |
| M2 — Architecture selected | Approved technical design | Ownership and technical lead |
| M3 — Menu mapping verified | Mapping specification | Restaurant manager |
| M4 — Synchronization tested | Prototype results | Technical lead |
| M5 — Synchronization ready | Operational acceptance | Restaurant manager |
| M6 — Checkout feasible | Checkout decision record | Ownership |
| M7 — Cart tested | Guest experience test results | Technical lead |
| M8 — Submission validated | Authorized order test evidence | Restaurant and technical leads |
| M9 — Payment approved | Payment and compliance review | Ownership and finance |
| M10 — Security accepted | Security review record | Designated reviewer |
| M11 — End-to-end accepted | Final test report | Technical lead |
| M12 — Staff trained | Staff acceptance record | Restaurant manager |
| M13 — Production approved | Launch authorization | Ownership |
| M14 — Performance reviewed | Operational and financial report | Ownership |

### Conditional Milestones

Not every integration model requires every milestone.

### Example

A menu-synchronization-only project does not require native payment implementation.

---

## Decision Gates and Acceptance Criteria

### Gate A — Vendor Eligibility

- [ ] Toast access requirements verified.
- [ ] Merchant authorization confirmed.
- [ ] Applicable vendor restrictions documented.

### Gate B — Business Case

- [ ] Business objectives approved.
- [ ] Current operating costs reviewed.
- [ ] Development costs estimated.
- [ ] Ongoing costs estimated.

### Gate C — Architecture

- [ ] Supported integration model selected.
- [ ] Data ownership defined.
- [ ] Security boundaries documented.
- [ ] Fallback identified.

### Gate D — Technical Feasibility

- [ ] Authorized test environment available.
- [ ] Required item mappings verified.
- [ ] Required APIs tested.
- [ ] Unsupported capabilities excluded.

### Gate E — Operational Readiness

- [ ] Staff workflows documented.
- [ ] Error handling tested.
- [ ] Monitoring established.
- [ ] Recovery procedures verified.

### Gate F — Production Approval

- [ ] Security review accepted.
- [ ] Payment requirements accepted where applicable.
- [ ] End-to-end tests passed.
- [ ] Ownership approval recorded.

### Rule

A failed gate pauses or reduces the implementation scope.

---

## Project Dependencies

### Vendor Dependencies

- Toast integration eligibility.
- Authorized API access.
- Current technical documentation.
- Supported testing environment.
- Applicable commercial terms.

### Restaurant Dependencies

- Ownership approval.
- Menu verification.
- Ordering policy decisions.
- Staff participation.
- Budget approval.

### Technical Dependencies

- Existing Next.js application.
- Supabase configuration.
- Vercel deployment.
- GitHub repository.
- Protected secrets.
- Reliable monitoring.

### Financial Dependencies

- Actual baseline expenses.
- Vendor quotations.
- Approved implementation estimate.
- Maintenance budget.

### Security Dependencies

- Appropriate access controls.
- Protected credentials.
- Payment boundary review.
- Incident response procedures.

### Dependency Tracking

Record each dependency, owner, status, and resolution evidence.

---

## Timeline and Scheduling

A reliable project schedule cannot be finalized before Toast eligibility and the approved integration scope are known.

### Recommended Scheduling Method

Estimate work after completing discovery and vendor feasibility.

### Planning Sequence

    Discovery
       |
       v
    Vendor Eligibility
       |
       v
    Requirements and Architecture
       |
       v
    Approved Implementation Scope
       |
       v
    Development and Testing
       |
       v
    Security and Staff Acceptance
       |
       v
    Production Approval
       |
       v
    Monitoring and Optimization

### Parallel Work

Documentation, menu inventory, and financial baseline collection may proceed while vendor eligibility is being investigated.

### Conditional Work

Cart, order submission, and payment development must wait for the relevant vendor and architecture decisions.

### Scheduling Inputs

- Approved feature scope.
- Developer availability.
- Vendor response times.
- Testing environment availability.
- Restaurant review cycles.
- Security requirements.
- Staff training needs.

### Timeline Rule

Do not publish unsupported completion dates or assume vendor approval times.

---

## Implementation Status

| Workstream | Current Status |
|---|---|
| Section 10 integration documentation | In progress; roadmap being documented |
| External Toast ordering | Established |
| Website menu presentation | Implemented |
| Protected menu administration | Implemented |
| Supabase menu infrastructure | Implemented |
| Current-state technical audit | Pending |
| Toast integration eligibility | Unconfirmed |
| Toast API access | Unconfirmed |
| Merchant integration authorization | Pending |
| Vendor commercial terms | Unconfirmed |
| Integration architecture selection | Pending |
| Menu item mapping | Proposed |
| Modifier mapping | Proposed |
| Menu synchronization prototype | Not started |
| Production menu synchronization | Not implemented |
| Availability synchronization | Unconfirmed |
| SPECIALS synchronization | Unconfirmed |
| Native website cart | Proposed |
| Hosted checkout handoff | Unconfirmed |
| Embedded checkout | Unconfirmed |
| Direct order submission | Not implemented |
| Order-status retrieval | Unconfirmed |
| Payment integration | Not implemented |
| Payment compliance assessment | Pending |
| Integration security review | Pending |
| Financial model | Framework documented; inputs pending |
| Staff training | Pending |
| End-to-end integration testing | Not started |
| Production rollout | Not approved |
| Operational monitoring | Proposed |
| Post-launch optimization | Future |

### Overall Assessment

The existing external Toast ordering workflow remains the operational baseline.

No direct Toast integration should be described as production-ready until vendor eligibility, implementation, testing, and approval have been completed.

---

## Next Actions

### Immediate Documentation Actions

1. Complete the Section 10 documentation set.
2. Verify internal documentation links.
3. Review terminology for consistency.
4. Confirm that unimplemented capabilities are labeled accurately.
5. Identify outstanding vendor questions.

### Restaurant Discovery Actions

1. Confirm the current Toast merchant configuration.
2. Identify the restaurant's authorized Toast contact.
3. Obtain current ordering and processing cost information.
4. Document the menu update workflow.
5. Identify the highest-value integration objectives.

### Technical Discovery Actions

1. Inspect the existing menu database structure.
2. Inspect the current menu editor implementation.
3. Document item and modifier identifiers.
4. Review existing security boundaries.
5. Identify the minimum required API capabilities.

### Vendor Feasibility Actions

1. Confirm API eligibility.
2. Request official integration documentation.
3. Confirm menu and modifier access.
4. Confirm checkout and order-submission capabilities.
5. Request applicable commercial terms.

### Decision

After discovery, choose whether to:

- Retain external Toast ordering.
- Implement an approved menu synchronization feature.
- Evaluate a supported checkout enhancement.
- Proceed toward a broader integration.

### Final Principle

**Implement only the capabilities that are officially supported, operationally useful, financially justified, and approved by restaurant ownership.**

---

## Related Documentation

### Toast POS Integration

- [Toast POS Integration Overview](README.md)
- [Integration Architecture](integration-overview.md)
- [API Feasibility](api-feasibility.md)
- [Menu Synchronization](menu-synchronization.md)
- [Cart and Checkout](cart-and-checkout.md)
- [Order Submission](order-submission.md)
- [Payment Processing](payment-processing.md)
- [Security and Compliance](security-and-compliance.md)
- [Cost Analysis](cost-analysis.md)

### Project Overview

- [Project Overview](../01-project-overview/README.md)
- [Project Architecture](../01-project-overview/architecture.md)
- [Technology Stack](../01-project-overview/technology-stack.md)
- [Development Roadmap](../01-project-overview/development-roadmap.md)

### Website and Administration

- [Website Overview](../02-website/README.md)
- [Website Menu System](../02-website/menu-system.md)
- [Website SPECIALS Overview](../02-website/specials/specials-overview.md)
- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Admin Menu Management](../04-admin-dashboard/menu-management.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)

### Database and Deployment

- [Database Overview](../06-database/README.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [GitHub Workflow](../07-deployment/github-workflow.md)
- [Vercel Deployment](../07-deployment/vercel-deployment.md)
- [Rollback Procedures](../07-deployment/rollback-procedures.md)

### Operations and Menu Management

- [Operations Overview](../08-operations/README.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Troubleshooting](../08-operations/troubleshooting.md)
- [Menu Management Overview](../09-menu-management/README.md)
- [Pricing and Modifiers](../09-menu-management/pricing-and-modifiers.md)
- [SPECIALS Management](../09-menu-management/specials-management.md)
- [Publishing Updates](../09-menu-management/publishing-updates.md)

### Master Index

- [Master Documentation Index](../README.md)

---

[Back to Toast POS Integration Overview](README.md)
