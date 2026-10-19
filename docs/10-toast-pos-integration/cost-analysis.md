# TOAST POS INTEGRATION — Cost Analysis

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** Financial Planning and Feasibility Evaluation

**Audience:** Restaurant Ownership, Financial Decision-Makers, Developers, Technical Administrators, and Integration Partners

**Implementation Status:** External Toast ordering established; direct integration costs and commercial eligibility unconfirmed

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Financial Evaluation Objectives](#financial-evaluation-objectives)
3. [Current Ordering Baseline](#current-ordering-baseline)
4. [Cost Analysis Principles](#cost-analysis-principles)
5. [Integration Models Under Evaluation](#integration-models-under-evaluation)
6. [Toast API Eligibility and Access Costs](#toast-api-eligibility-and-access-costs)
7. [Toast Subscription and Licensing Costs](#toast-subscription-and-licensing-costs)
8. [Integration Partner Costs](#integration-partner-costs)
9. [Initial Development Costs](#initial-development-costs)
10. [Menu Synchronization Costs](#menu-synchronization-costs)
11. [Cart and Checkout Development Costs](#cart-and-checkout-development-costs)
12. [Order Submission Development Costs](#order-submission-development-costs)
13. [Payment Processing Costs](#payment-processing-costs)
14. [Transaction and Per-Order Fees](#transaction-and-per-order-fees)
15. [Hosting and Infrastructure Costs](#hosting-and-infrastructure-costs)
16. [Database and Storage Costs](#database-and-storage-costs)
17. [Monitoring and Logging Costs](#monitoring-and-logging-costs)
18. [Security and Compliance Costs](#security-and-compliance-costs)
19. [Testing and Quality Assurance Costs](#testing-and-quality-assurance-costs)
20. [Maintenance and Support Costs](#maintenance-and-support-costs)
21. [Operational Labor Costs](#operational-labor-costs)
22. [Training and Change Management Costs](#training-and-change-management-costs)
23. [Refunds, Disputes, and Financial Exceptions](#refunds-disputes-and-financial-exceptions)
24. [Cost Classification and Evidence](#cost-classification-and-evidence)
25. [Financial Modeling Assumptions](#financial-modeling-assumptions)
26. [One-Time Cost Model](#one-time-cost-model)
27. [Recurring Cost Model](#recurring-cost-model)
28. [Transaction Volume Scenarios](#transaction-volume-scenarios)
29. [Total Cost of Ownership](#total-cost-of-ownership)
30. [Return on Investment](#return-on-investment)
31. [Break-Even Analysis](#break-even-analysis)
32. [Qualitative Benefits and Tradeoffs](#qualitative-benefits-and-tradeoffs)
33. [Vendor Questions and Required Evidence](#vendor-questions-and-required-evidence)
34. [Financial Decision Gates](#financial-decision-gates)
35. [Implementation Roadmap](#implementation-roadmap)
36. [Implementation Status](#implementation-status)
37. [Related Documentation](#related-documentation)

---

## Purpose

This document establishes a financial evaluation framework for a potential integration between the Fin & Feathers Las Vegas website and Toast POS.

The restaurant currently uses an external Toast online ordering experience.

A future integration may provide menu synchronization, native cart functionality, improved checkout continuity, or direct order submission.

Each option introduces different implementation costs, operating expenses, vendor dependencies, and financial risks.

The purpose of this analysis is to help restaurant ownership determine whether the expected benefits justify the full cost of implementation and ongoing maintenance.

The analysis must compare proposed integration models against the existing external ordering workflow rather than assuming a custom integration is automatically preferable.

### Important Financial Boundary

No Toast API access fee, licensing rate, payment-processing percentage, integration partner charge, or contractual commitment is established as verified in this document.

Any amounts introduced during future financial modeling must be identified as documented actuals, written vendor quotes, or explicitly labeled assumptions.

## Financial Evaluation Objectives

### Establish Baseline Costs

Identify the restaurant's existing ordering-related expenses.

### Estimate Investment

Determine the initial cost of each proposed integration model.

### Measure Recurring Expenses

Identify costs that continue after launch.

### Evaluate Transaction Economics

Determine how order volume influences total expense.

### Quantify Operational Benefits

Estimate reductions in duplicated work and other measurable improvements.

### Identify Hidden Costs

Include security, testing, maintenance, incident response, and vendor support.

### Compare Alternatives

Evaluate retaining external ordering against more integrated options.

### Support Budget Approval

Provide evidence for an informed investment decision.

### Protect Profitability

Avoid changes that increase costs without sufficient benefits.

### Support Phased Delivery

Allow ownership to approve individual stages rather than committing to a full integration prematurely.

## Current Ordering Baseline

### Website

    https://finandfeatherslv.live

### Current Ordering Model

The website provides an ORDER ONLINE link to the external Toast ordering experience.

### Website Framework

    Next.js App Router

### Hosting

    Vercel

### Database

    Supabase PostgreSQL

### Media Storage

    Supabase Storage

### Current Menu Administration

Protected manager menu editor.

### Existing Website Capabilities

- Menu presentation.
- Menu item editing.
- Approved category and subcategory organization.
- Food image management.
- Existing $5 specials toggle.

### Current Financial Baseline

The restaurant's actual Toast subscription, online ordering, processing, and support costs have not been supplied for this analysis.

### Required Evidence

Obtain recent invoices, applicable merchant agreements, and transaction reports before calculating the current cost baseline.

## Cost Analysis Principles

### Compare Incremental Costs

Distinguish expenses already incurred from additional expenses caused by the integration.

### Avoid Double Counting

Do not count an existing subscription as a new expense unless the proposed model increases it.

### Use Verified Pricing

Prefer current written vendor quotations and merchant statements.

### Separate Fixed and Variable Costs

Fixed expenses remain relatively stable; variable expenses depend on activity.

### Include Labor

Account for development, administration, support, and training time.

### Include Risk

Consider the cost of failures, rework, and operational interruptions.

### Model Multiple Scenarios

Evaluate different order volumes and implementation scopes.

### Preserve Assumptions

Document where every estimate originated.

### Review Periodically

Update the model when vendor terms or business needs change.

### Approval

Ownership should approve the final financial assumptions before committing funds.

## Integration Models Under Evaluation

### Model A — Retain External Toast Ordering

Continue using the existing ORDER ONLINE link.

**Potential advantages:**

- No new custom checkout implementation.
- Established restaurant workflow.
- Lower custom integration maintenance.
- Fewer payment-security responsibilities for the website.

**Potential limitations:**

- Guest leaves the restaurant website.
- Menu updates may require work in separate systems.
- Less control over the external ordering interface.

### Model B — Menu Synchronization Only

Use authorized Toast menu data to improve website consistency.

### Model C — Enhanced Ordering Handoff

Explore an officially supported checkout transition.

### Model D — Native Website Cart

Provide custom cart interactions with an approved checkout integration.

### Model E — Direct Order Submission

Submit supported orders through authorized Toast interfaces.

### Model F — Hybrid Integration

Combine selected synchronization and ordering features while retaining external Toast checkout.

### Evaluation Rule

Do not assume Models B through F are technically or commercially available until verified.

## Toast API Eligibility and Access Costs

Toast integration eligibility is a prerequisite to meaningful cost estimates.

### Access Requirements

Determine whether the restaurant may obtain the required API access.

### Program Enrollment

Identify any required partner or developer arrangements.

### Application Registration

Determine whether registration or approval is necessary.

### Merchant Authorization

Confirm restaurant approval requirements.

### Access Fees

Request written confirmation of any applicable fees.

### Usage Fees

Determine whether requests or transactions incur additional charges.

### Minimum Commitments

Review minimum volume or contractual commitments.

### Testing Access

Confirm whether sandbox or nonproduction access has a cost.

### Restrictions

Identify features unavailable under the proposed arrangement.

### Financial Decision

Do not budget a specific API access fee until the applicable commercial terms are documented.

## Toast Subscription and Licensing Costs

Existing Toast subscription costs should be separated from new integration expenses.

### Current Subscription

Document the restaurant's actual subscription.

### Online Ordering

Identify existing ordering-related charges.

### Additional Modules

Determine whether integration requires additional products or services.

### Location Licensing

Review location-based pricing if applicable.

### User Licensing

Determine whether additional administrative access creates fees.

### Contract Changes

Identify any required changes to the merchant agreement.

### Renewal Terms

Review renewal pricing and notice periods.

### Cancellation

Document applicable termination obligations.

### Incremental Cost

Count only the additional cost attributable to the proposed integration.

### Evidence

Use current invoices and written Toast commercial documentation.

## Integration Partner Costs

An approved third-party partner may be necessary or advantageous.

### Discovery

Determine whether Toast requires an integration partner.

### Setup

Request an implementation quote.

### Development

Identify any partner-specific engineering charges.

### Configuration

Include restaurant account configuration.

### Certification

Determine whether validation or approval incurs fees.

### Monthly Service

Identify recurring partner charges.

### Transaction Charges

Determine whether the partner charges per order.

### Support

Review support coverage and response times.

### Ownership

Clarify who maintains the integration.

### Exit Strategy

Identify costs associated with changing or discontinuing the partner.

## Initial Development Costs

Initial development expenses depend on the selected architecture.

### Requirements

Document approved functionality.

### Technical Discovery

Inspect current application and database structures.

### API Research

Confirm supported Toast operations.

### Architecture

Design integration boundaries.

### Authentication

Implement authorized server-side access.

### Mapping

Create necessary identifier relationships.

### Validation

Protect menu and order data integrity.

### User Interface

Build only the approved guest-facing components.

### Testing

Verify supported workflows.

### Deployment

Release through the existing controlled process.

### Estimation

Estimate work by task and responsible role rather than using an unsupported flat project price.

## Menu Synchronization Costs

Menu synchronization may reduce repeated administrative work.

### Data Inventory

Inspect existing website menu records.

### Toast Mapping

Associate authorized Toast objects with website records.

### Categories

Preserve approved spreadsheet taxonomy.

### Modifiers

Map required option groups and surcharges.

### Pricing

Establish field ownership and validation.

### Availability

Evaluate supported availability data.

### SPECIALS

Determine whether promotional data can be coordinated.

### Images

Preserve approved website food photography.

### Monitoring

Detect synchronization failures.

### Recovery

Provide rollback and conflict resolution procedures.

### Financial Benefit

Estimate manager time saved from eliminating duplicate updates.

## Cart and Checkout Development Costs

A native cart introduces substantial application work.

### Item Selection

Build supported item-selection interfaces.

### Modifiers

Implement valid option controls.

### Cart State

Manage quantities and selections.

### Persistence

Determine whether cart recovery is necessary.

### Pricing

Integrate authoritative totals.

### Availability

Handle unavailable items.

### Fulfillment

Support approved pickup or delivery workflows.

### Checkout

Implement the authorized payment handoff.

### Accessibility

Test keyboard, screen-reader, and mobile usability.

### Maintenance

Budget for future menu and API changes.

## Order Submission Development Costs

Direct submission requires stronger reliability controls.

### Request Validation

Validate orders on the server.

### Restaurant Mapping

Confirm the correct location.

### Item Mapping

Use valid Toast identifiers.

### Idempotency

Prevent duplicate orders.

### Timeouts

Handle uncertain submission outcomes.

### Status Retrieval

Use authorized reconciliation mechanisms where available.

### Logging

Record safe diagnostic information.

### Monitoring

Detect failed and unresolved orders.

### Staff Escalation

Provide operational recovery procedures.

### Testing

Include failures, duplicates, and interrupted requests.

### Feasibility

Do not estimate implementation as approved until direct submission access is confirmed.

## Payment Processing Costs

Payment-related expenses require separate evaluation.

### Existing Processing

Document current merchant processing charges.

### Proposed Processing

Determine whether the new architecture changes those charges.

### Provider Fees

Identify applicable fixed and percentage-based fees.

### Authorization

Confirm any separate authorization costs.

### Capture

Determine whether additional capture fees apply.

### Refunds

Review refund-related charges.

### Disputes

Identify chargeback and dispute costs.

### Compliance

Budget for applicable security obligations.

### Reconciliation

Account for additional financial administration.

### Critical Boundary

A native website payment flow is not currently implemented.

## Transaction and Per-Order Fees

Transaction economics may determine whether an integration is financially attractive.

### Percentage-Based Charges

Record the applicable percentage of transaction value.

### Fixed Charges

Record any fixed amount per transaction.

### Ordering Fees

Identify ordering-platform charges.

### Integration Fees

Identify per-order integration charges.

### Delivery Fees

Include only where applicable.

### Refund Effects

Determine how refunds affect net processing costs.

### Tips

Clarify whether tip amounts affect fee calculations.

### Discounts

Consider how promotions affect revenue and processing costs.

### Effective Rate

Calculate total transaction-related fees divided by the relevant transaction volume.

### Evidence

Use merchant statements and written vendor terms.

## Hosting and Infrastructure Costs

The website currently uses Vercel.

### Existing Hosting

Document the current hosting plan and actual charges.

### Server Requests

Estimate additional integration request volume.

### Execution

Consider server-side processing costs.

### Background Jobs

Evaluate any approved scheduled synchronization infrastructure.

### Network Usage

Estimate additional data transfer.

### Environments

Include development or staging expenses where applicable.

### Monitoring

Account for service diagnostics.

### Scaling

Model higher ordering volumes.

### Incremental Cost

Include only hosting increases attributable to the integration.

### Verification

Use actual Vercel usage and pricing information.

## Database and Storage Costs

Supabase provides the existing database and media storage.

### Current Plan

Record actual Supabase expenses.

### Mapping Data

Estimate any additional synchronization records.

### Order Metadata

Include only approved non-sensitive tracking information.

### Audit History

Consider storage for operational records.

### Backups

Review recovery requirements.

### Database Operations

Estimate additional reads and writes.

### Media

Preserve the established menu image workflow.

### Retention

Limit unnecessary long-term storage.

### Growth

Model increased activity over time.

### Incremental Cost

Determine whether the integration changes the current Supabase cost tier.

## Monitoring and Logging Costs

Production integrations require reliable diagnostics.

### Application Logs

Track relevant server errors.

### Submission Monitoring

Identify failed and uncertain orders.

### Synchronization Monitoring

Detect stale menu data.

### Alerts

Notify responsible personnel.

### Log Storage

Account for retained diagnostic records.

### Third-Party Tools

Identify any additional monitoring subscriptions.

### Support Access

Provide appropriate authorized visibility.

### Retention

Apply reasonable log-retention periods.

### Security

Avoid storing secrets or raw cardholder data.

### Cost Evaluation

Compare native platform capabilities with external monitoring services.

## Security and Compliance Costs

Security requirements may introduce additional expenses.

### Architecture Review

Evaluate integration trust boundaries.

### Credential Management

Implement protected secret handling.

### Access Review

Verify manager and API permissions.

### Database Security

Review Supabase policies.

### Payment Scope

Assess PCI DSS responsibilities.

### Privacy

Review guest-data collection and retention.

### Vulnerability Testing

Perform appropriate security validation.

### Incident Response

Develop recovery procedures.

### External Review

Include qualified professional services where required.

### Recurring Cost

Account for ongoing security maintenance.

## Testing and Quality Assurance Costs

Testing must cover more than successful orders.

### Functional Testing

Validate approved guest workflows.

### Menu Testing

Verify items, categories, and modifiers.

### Pricing Testing

Confirm authoritative totals.

### Payment Testing

Use authorized payment test methods.

### Duplicate Testing

Test repeated submission attempts.

### Timeout Testing

Verify unknown-outcome handling.

### Security Testing

Test unauthorized access and tampered requests.

### Mobile Testing

Validate representative devices.

### Regression Testing

Ensure existing website features continue working.

### Staff Acceptance

Include restaurant personnel in final validation.

## Maintenance and Support Costs

Integration costs continue after deployment.

### API Changes

Review vendor interface updates.

### Dependency Updates

Maintain application packages.

### Credential Rotation

Manage expiring or revoked access.

### Menu Changes

Maintain identifier mappings.

### Error Investigation

Resolve failed synchronization or submission attempts.

### Payment Issues

Coordinate with authorized providers.

### Monitoring

Review operational alerts.

### Documentation

Update procedures when behavior changes.

### Staff Questions

Provide ongoing support.

### Budget

Assign an estimated monthly maintenance allowance supported by a staffing plan.

## Operational Labor Costs

Operational savings are a potential benefit of integration.

### Current Menu Work

Measure time spent maintaining the website menu.

### Toast Menu Work

Measure time spent maintaining Toast separately.

### Duplicate Entry

Identify tasks repeated across both systems.

### Error Correction

Measure time spent resolving inconsistencies.

### Order Support

Measure time spent investigating ordering issues.

### Training

Include time required to learn new workflows.

### Monitoring

Account for recurring administrative checks.

### Savings Calculation

    Monthly Labor Savings =
        Monthly Hours Saved
        × Loaded Hourly Labor Cost

### Important Qualification

Estimated time savings are not guaranteed cash savings unless staffing costs or paid hours actually decrease.

### Evidence

Use representative operational observations.

## Training and Change Management Costs

A new ordering system changes staff responsibilities.

### Manager Training

Teach approved menu and integration workflows.

### Front-of-House Training

Explain guest checkout behavior.

### Order Support Training

Provide guidance for missing or duplicate orders.

### Payment Training

Review approved payment and refund procedures.

### Documentation

Maintain clear instructions.

### Transition

Allow time for staff adaptation.

### Parallel Operation

Evaluate temporary overlap with existing workflows.

### Support

Plan assistance during launch.

### Refresher Training

Account for staff turnover.

### Acceptance

Confirm staff readiness before production activation.

## Refunds, Disputes, and Financial Exceptions

Financial exceptions create direct and indirect costs.

### Refund Processing

Determine applicable provider charges.

### Duplicate Charges

Account for investigation and correction.

### Missing Orders

Consider support and customer recovery costs.

### Chargebacks

Identify applicable dispute fees.

### Fraud

Review exposure under the selected payment model.

### Reconciliation

Estimate staff time required.

### Documentation

Maintain appropriate evidence.

### Customer Support

Include time spent resolving guest concerns.

### Reporting

Track exception frequency and cost.

### Risk Adjustment

Consider realistic contingency allowances without inventing historical incident rates.

## Cost Classification and Evidence

Every financial input should be assigned a confidence classification.

| Classification | Meaning | Appropriate Use |
|---|---|---|
| Verified actual | Supported by a current invoice or transaction statement | Baseline calculation |
| Written vendor quote | Documented offer with applicable conditions | Proposed cost estimate |
| Internal estimate | Based on documented staffing and work scope | Planning scenario |
| Modeling assumption | Hypothetical value for sensitivity analysis | Scenario comparison |
| Unknown | Not yet established | Open decision dependency |

### Evidence Register

For each input, record:

- Cost description.
- Responsible vendor or team.
- Amount and currency.
- Billing frequency.
- Evidence classification.
- Source document.
- Effective date.
- Expiration or renewal date.
- Owner responsible for verification.

### Rule

Do not convert an unknown into a zero-cost assumption.

## Financial Modeling Assumptions

A useful financial model requires explicit assumptions.

### Monthly Order Volume

Use actual Toast reports where available.

### Average Order Value

Calculate from representative completed transactions.

### Transaction Fees

Use documented merchant terms.

### Development Hours

Estimate from approved work packages.

### Labor Rates

Use actual or approved internal planning rates.

### Maintenance Hours

Estimate recurring support effort.

### Infrastructure Growth

Model additional resource consumption.

### Conversion Improvement

Treat potential improvement as a hypothesis until measured.

### Evaluation Horizon

Compare alternatives over the same time period.

### Sensitivity

Test how results change when key assumptions vary.

## One-Time Cost Model

Initial implementation cost should be calculated by workstream.

| Workstream | Estimated Cost | Evidence Status |
|---|---|---|
| Vendor discovery and eligibility | TBD | Pending |
| Requirements and architecture | TBD | Pending |
| Menu mapping | TBD | Pending |
| Menu synchronization | TBD | Pending |
| Cart development | TBD | Pending |
| Checkout integration | TBD | Pending |
| Order submission | TBD | Pending |
| Payment architecture | TBD | Pending |
| Security review | TBD | Pending |
| Testing and acceptance | TBD | Pending |
| Staff training | TBD | Pending |
| Launch preparation | TBD | Pending |

### Formula

    Total One-Time Cost =
        Sum of Approved Implementation Costs
        + Approved Contingency

### Contingency

Set a documented contingency based on the uncertainty of the selected integration.

### Approval

Ownership should approve the one-time budget before implementation begins.

## Recurring Cost Model

Recurring expenses should be evaluated monthly and annually.

| Expense | Monthly Amount | Evidence Status |
|---|---|---|
| Incremental Toast licensing | TBD | Pending |
| Integration partner subscription | TBD | Pending |
| Additional per-order fees | TBD | Pending |
| Incremental Vercel usage | TBD | Pending |
| Incremental Supabase usage | TBD | Pending |
| Monitoring and logging | TBD | Pending |
| Maintenance labor | TBD | Pending |
| Operational support | TBD | Pending |
| Security and compliance | TBD | Pending |

### Formula

    Monthly Recurring Cost =
        Fixed Monthly Integration Costs
        + Variable Monthly Integration Costs
        + Ongoing Support Costs

### Annualization

    Annual Recurring Cost =
        Monthly Recurring Cost × 12
        + Nonmonthly Annual Expenses

### Baseline Adjustment

Subtract costs that the new architecture demonstrably replaces.

## Transaction Volume Scenarios

Transaction volume can substantially change the economics.

### Scenario A — Low Volume

Evaluate the model using a conservative monthly order count.

### Scenario B — Expected Volume

Use a representative actual order count.

### Scenario C — High Volume

Evaluate increased order activity.

### Scenario D — Stress Case

Consider higher costs without proportional revenue growth.

### Required Inputs

- Monthly order count.
- Average order value.
- Percentage-based processing fees.
- Fixed per-order charges.
- Integration per-order charges.
- Refund and dispute assumptions.

### Formula

    Monthly Gross Order Value =
        Monthly Orders × Average Order Value

### Variable Cost Formula

    Monthly Variable Cost =
        Monthly Orders × Applicable Per-Order Cost
        + Percentage-Based Charges

### Qualification

No actual restaurant order volume is established in this document.

## Total Cost of Ownership

Total Cost of Ownership measures the complete financial commitment.

### Evaluation Period

Use an approved horizon such as one, two, or three years.

### Initial Investment

Include all approved one-time costs.

### Recurring Expense

Include ongoing platform and support costs.

### Variable Charges

Model transaction-dependent expenses.

### Security and Maintenance

Include ongoing compliance and technical support.

### Replacements

Subtract only verified expenses that will be eliminated.

### Formula

    Total Cost of Ownership =
        One-Time Implementation Cost
        + Recurring Operating Costs Over Horizon
        + Variable Transaction Costs Over Horizon
        + Expected Approved Risk Costs
        - Verified Avoided Costs

### Comparison

Calculate the same measure for each feasible integration model.

### Decision

Compare incremental ownership cost against measurable incremental benefits.

## Return on Investment

Return on Investment evaluates whether expected financial benefits justify the investment.

### Potential Benefits

- Reduced duplicated menu administration.
- Reduced correction work.
- Improved menu accuracy.
- Possible checkout conversion improvements.
- Possible higher order volume.
- Potentially improved guest retention.

### Evidence Requirement

Use actual measurements or clearly labeled assumptions.

### Net Benefit

    Net Benefit =
        Incremental Financial Benefits
        - Incremental Costs

### ROI Formula

    ROI =
        (Net Benefit ÷ Investment Cost) × 100

### Time Horizon

Use the same evaluation period for benefits and costs.

### Attribution

Avoid attributing all online sales growth to the integration without supporting evidence.

### Important Distinction

Higher sales revenue is not equivalent to higher profit.

## Break-Even Analysis

Break-even analysis determines when benefits recover the investment.

### One-Time Investment

Use the approved implementation cost.

### Monthly Net Benefit

Subtract recurring integration expenses from measurable monthly benefits.

### Simple Payback Formula

    Payback Months =
        One-Time Investment
        ÷ Positive Monthly Net Benefit

### Limitation

If monthly net benefit is zero or negative, this simple payback calculation does not produce a finite recovery period.

### Contribution Margin

Use incremental contribution margin rather than gross sales when estimating benefits from additional orders.

### Volume Threshold

Determine how many additional profitable orders are needed to cover recurring costs.

### Sensitivity

Test optimistic, expected, and conservative cases.

### Risk

Account for implementation delays and unexpected support requirements.

### Decision

Do not approve the project solely on an unsupported conversion improvement assumption.

## Qualitative Benefits and Tradeoffs

Not every benefit is easily converted into dollars.

### Brand Continuity

A more integrated ordering experience may feel more consistent.

### Guest Convenience

Reduced navigation may improve usability.

### Manager Efficiency

Synchronization may simplify updates.

### Data Consistency

A single controlled source may reduce errors.

### Operational Control

A custom integration may provide additional flexibility.

### Vendor Dependency

Greater integration may increase reliance on Toast APIs.

### Maintenance Burden

Custom functionality creates ongoing technical responsibilities.

### Payment Risk

More complex checkout flows may increase operational exposure.

### Fallback Reliability

The existing external ordering path offers a simpler alternative.

### Evaluation

Consider qualitative benefits alongside documented financial outcomes.

## Vendor Questions and Required Evidence

Before a final financial decision, request answers to the following.

### Access

1. Is the restaurant eligible for the required Toast APIs?
2. Are additional agreements necessary?
3. Are there application registration or access fees?

### Functionality

4. Which menu operations are available?
5. Can the restaurant retrieve orderable items and modifiers?
6. Is direct order submission permitted?
7. Is a supported hosted checkout handoff available?
8. What payment integration models are permitted?

### Commercial Terms

9. Are additional subscription fees required?
10. Are there per-order integration charges?
11. Do existing processing rates change?
12. Are minimum commitments applicable?
13. Are there setup, certification, or partner fees?
14. What are the termination conditions?

### Support

15. What testing environment is available?
16. What production support is included?
17. Who handles payment and order discrepancies?
18. How are integration changes communicated?

### Evidence

Request current written documentation rather than relying solely on informal estimates.

## Financial Decision Gates

### Gate 1 — Eligibility

Confirm the restaurant can access the necessary integration capabilities.

### Gate 2 — Technical Feasibility

Confirm the selected functionality is supported.

### Gate 3 — Commercial Feasibility

Obtain written cost and contractual information.

### Gate 4 — Baseline Verification

Document current ordering expenses and activity.

### Gate 5 — Development Estimate

Approve a scoped engineering estimate.

### Gate 6 — Security and Compliance

Identify additional required expenses.

### Gate 7 — Business Case

Calculate incremental cost, expected benefits, and sensitivity.

### Gate 8 — Operational Readiness

Confirm support and training responsibilities.

### Gate 9 — Budget Approval

Obtain restaurant ownership authorization.

### Gate 10 — Production Investment

Proceed only after the relevant gates are satisfied.

## Implementation Roadmap

### Stage 1 — Collect Current Costs

Obtain existing Toast invoices and transaction statements.

### Stage 2 — Verify Vendor Eligibility

Confirm available integration programs.

### Stage 3 — Request Commercial Terms

Obtain current written pricing.

### Stage 4 — Define Integration Scope

Identify the minimum functionality worth evaluating.

### Stage 5 — Estimate Engineering Work

Calculate development and testing requirements.

### Stage 6 — Estimate Operating Costs

Include hosting, monitoring, maintenance, and support.

### Stage 7 — Model Transaction Economics

Use actual restaurant order activity.

### Stage 8 — Compare Alternatives

Evaluate external ordering, synchronization, and more advanced models.

### Stage 9 — Perform Sensitivity Analysis

Test different order volumes and cost assumptions.

### Stage 10 — Review Risks

Account for vendor limitations and operational complexity.

### Stage 11 — Obtain Ownership Approval

Approve only the justified scope and budget.

### Stage 12 — Reassess After Deployment

Compare actual costs and benefits with the approved model.

## Implementation Status

| Financial Component | Status |
|---|---|
| External Toast ordering | Established |
| Existing website hosting | Established |
| Existing Supabase infrastructure | Established |
| Current Toast invoice analysis | Pending |
| Current transaction fee analysis | Pending |
| Monthly online order volume | Not supplied |
| Average online order value | Not supplied |
| Toast API eligibility | Unconfirmed |
| Toast API access pricing | Unconfirmed |
| Additional Toast licensing | Unconfirmed |
| Integration partner requirements | Unconfirmed |
| Integration partner pricing | Unconfirmed |
| Menu synchronization development estimate | Pending |
| Native cart development estimate | Pending |
| Checkout integration estimate | Pending |
| Direct order submission estimate | Pending |
| Payment processing changes | Unconfirmed |
| Incremental infrastructure cost | Pending |
| Security and compliance budget | Pending |
| Maintenance budget | Pending |
| Staff training budget | Pending |
| Financial scenario model | Framework documented |
| Total Cost of Ownership | Awaiting inputs |
| ROI calculation | Awaiting inputs |
| Break-even calculation | Awaiting inputs |
| Ownership budget approval | Pending |
| Production integration investment | Not approved |

## Related Documentation

- [Toast POS Integration Overview](README.md)
- [Integration Architecture](integration-overview.md)
- [API Feasibility](api-feasibility.md)
- [Menu Synchronization](menu-synchronization.md)
- [Cart and Checkout](cart-and-checkout.md)
- [Order Submission](order-submission.md)
- [Payment Processing](payment-processing.md)
- [Security and Compliance](security-and-compliance.md)
- [Implementation Roadmap](implementation-roadmap.md)
- [Project Architecture](../01-project-overview/architecture.md)
- [Technology Stack](../01-project-overview/technology-stack.md)
- [Development Roadmap](../01-project-overview/development-roadmap.md)
- [Website Menu System](../02-website/menu-system.md)
- [Admin Menu Management](../04-admin-dashboard/menu-management.md)
- [Database Schema](../06-database/schema.md)
- [Database Storage](../06-database/storage.md)
- [Vercel Deployment](../07-deployment/vercel-deployment.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Menu Management Overview](../09-menu-management/README.md)
- [SPECIALS Management](../09-menu-management/specials-management.md)
- [Master Documentation Index](../README.md)

---

[Back to Toast POS Integration Overview](README.md)
