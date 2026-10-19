# TOAST POS INTEGRATION — Menu Synchronization

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** Planning and Feasibility Evaluation

**Audience:** Restaurant Ownership, Managers, Developers, Database Administrators, and Integration Partners

**Implementation Status:** Website menu management implemented; direct Toast synchronization under evaluation

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Synchronization Objectives](#synchronization-objectives)
3. [Current Implementation](#current-implementation)
4. [Synchronization Architecture](#synchronization-architecture)
5. [Integration Prerequisites](#integration-prerequisites)
6. [Source-of-Truth Strategy](#source-of-truth-strategy)
7. [Synchronization Models](#synchronization-models)
8. [Menu Data Inventory](#menu-data-inventory)
9. [Item Identity and Mapping](#item-identity-and-mapping)
10. [Categories and Subcategories](#categories-and-subcategories)
11. [Menu Item Names and Descriptions](#menu-item-names-and-descriptions)
12. [Base Pricing](#base-pricing)
13. [Market-Price Items](#market-price-items)
14. [Modifier Groups and Options](#modifier-groups-and-options)
15. [Item Availability](#item-availability)
16. [SPECIALS and Promotions](#specials-and-promotions)
17. [Menu Images](#menu-images)
18. [Data Transformation](#data-transformation)
19. [Initial Synchronization](#initial-synchronization)
20. [Incremental Synchronization](#incremental-synchronization)
21. [Synchronization Scheduling](#synchronization-scheduling)
22. [Conflict Detection and Resolution](#conflict-detection-and-resolution)
23. [Deleted and Discontinued Items](#deleted-and-discontinued-items)
24. [Database Design Considerations](#database-design-considerations)
25. [API Integration Layer](#api-integration-layer)
26. [Caching and Data Freshness](#caching-and-data-freshness)
27. [Security and Authorization](#security-and-authorization)
28. [Error Handling and Recovery](#error-handling-and-recovery)
29. [Monitoring and Audit History](#monitoring-and-audit-history)
30. [Manager Workflows](#manager-workflows)
31. [Testing and Acceptance](#testing-and-acceptance)
32. [Operational Risks](#operational-risks)
33. [Implementation Roadmap](#implementation-roadmap)
34. [Implementation Status](#implementation-status)
35. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed approach for synchronizing menu information between the Fin & Feathers Las Vegas website and Toast POS.

The website currently maintains menu information through its own protected administrative interface.

Toast provides the restaurant's existing external online ordering experience.

These systems should not be assumed to share a common menu database.

A future integration may allow approved menu information to move between the systems, reducing duplicated administrative work and improving consistency.

However, synchronization introduces significant risks when item identifiers, prices, modifier rules, availability, and promotional settings differ.

The synchronization architecture must therefore be designed around verified Toast capabilities, explicit data ownership, controlled transformations, and recoverable operations.

No automated Toast menu synchronization is established as deployed.

## Synchronization Objectives

### Reduce Duplicate Work

Minimize repeated entry of approved menu information.

### Improve Accuracy

Reduce discrepancies between the website and Toast.

### Preserve Restaurant Taxonomy

Maintain approved website categories and subcategories.

### Protect Pricing

Avoid unintended changes to base prices and surcharges.

### Support Availability

Evaluate synchronization of item availability where authorized.

### Preserve Photography

Maintain approved website food images.

### Coordinate Promotions

Evaluate how SPECIALS can coexist with Toast pricing.

### Prevent Data Loss

Avoid destructive overwrites and accidental deletion.

### Provide Traceability

Track meaningful synchronization actions.

### Maintain Reliability

Ensure a synchronization failure does not interrupt existing ordering.

## Current Implementation

### Website

    https://finandfeatherslv.live

### Application

    Next.js App Router

### Database

    Supabase PostgreSQL

### Storage

    Supabase Storage

### Administrative Menu

    /admin/menu

### Authentication

    Supabase Auth

### Manager Authorization

    requireManager()

### Current Ordering

External Toast online ordering.

### Existing Capabilities

- Menu item creation.
- Menu item editing.
- Protected manager access.
- Menu image uploads.
- 4:3 WebP image processing.
- Existing $5 specials toggle.

### Current Integration Boundary

No direct Toast synchronization has been confirmed as implemented.

## Synchronization Architecture

A proposed architecture places a controlled integration layer between the website database and an authorized Toast interface.

### Conceptual Flow

    Toast POS
        |
        v
    Authorized Toast API
        |
        v
    Next.js Server Integration
        |
        v
    Validation and Mapping
        |
        v
    Supabase PostgreSQL
        |
        v
    Public Website Menu

### Reverse Updates

Website-to-Toast updates would require separate authorization and supported write capabilities.

### Server Boundary

Privileged API operations must run in trusted server-side code.

### Validation

External data must be validated before database mutation.

### Mapping

Toast identifiers must be associated with the correct website records.

### Publishing

Synchronization and public visibility should be treated as distinct operations.

### Qualification

This diagram represents a proposed design, not a confirmed supported Toast API workflow.

## Integration Prerequisites

Synchronization development requires several confirmed prerequisites.

### Restaurant Eligibility

Confirm the restaurant's access to the appropriate Toast integration program.

### API Documentation

Review current official Toast documentation.

### Credentials

Obtain authorized credentials through the approved process.

### Menu Access

Confirm that the restaurant's menu data can be retrieved.

### Field Availability

Determine which required menu attributes are exposed.

### Update Permissions

Confirm whether any Toast write operations are supported.

### Rate Limits

Review applicable API restrictions.

### Testing Environment

Obtain authorized nonproduction access where available.

### Commercial Approval

Review integration costs and contractual requirements.

### Decision Gate

Do not implement production synchronization until the required capabilities are confirmed.

## Source-of-Truth Strategy

Each synchronized field must have an explicitly designated owner.

### Possible Ownership Model

| Data | Proposed Authority | Verification |
|---|---|---|
| Toast ordering identifiers | Toast | Pending |
| Orderable items | Toast | Pending |
| Checkout prices | Toast | Pending |
| Ordering modifiers | Toast | Pending |
| Item availability | Toast | Pending |
| Website descriptions | Restaurant-approved website data | Pending |
| Website categories | Approved spreadsheet | Established business rule |
| Website food images | Website media management | Established |
| Website presentation order | Website configuration | Pending |
| SPECIALS presentation | Restaurant-approved settings | Pending |
| Checkout discounts | Supported ordering system | Pending |

### Important Qualification

The table proposes a field-ownership model.

It does not establish which Toast fields are currently accessible.

### Ownership Rule

Only the designated authority should automatically update a field.

### Override Rule

Manual overrides require explicit policies.

### Conflict Rule

Unresolved conflicts should be reported rather than silently overwritten.

## Synchronization Models

Several synchronization approaches are possible.

### Toast-to-Website

Toast provides selected menu information to the website.

### Website-to-Toast

Website changes are submitted to Toast if authorized write operations exist.

### Bidirectional

Both systems exchange updates under controlled ownership rules.

### Reconciliation Only

The systems are compared, but changes require manager approval.

### Hybrid

Selected fields synchronize automatically while others remain manually managed.

### Initial Preference for Evaluation

A read-only or reconciliation-first approach reduces mutation risk.

### Tradeoff

Read-only integration cannot eliminate every administrative task.

### Decision

Select the model after reviewing API capabilities and restaurant operations.

## Menu Data Inventory

Before synchronization, document the current menu structures.

### Item Identity

Record how the website identifies each item.

### Name

Identify the guest-facing title.

### Description

Identify the approved description.

### Category

Record the assigned category.

### Subcategory

Record any approved secondary grouping.

### Price

Identify fixed or variable pricing behavior.

### Modifiers

Record associated options and charges.

### Image

Identify the approved media reference.

### Availability

Determine whether a supported status exists.

### Specials

Identify current promotional settings.

### Audit

Confirm actual database fields before building transformations.

## Item Identity and Mapping

Stable item identity is essential.

### Website Identifier

The existing database uses an item identifier whose exact schema must be verified.

### Toast Identifier

Toast may expose one or more identifiers for menu objects.

### Mapping Requirement

Each synchronized website record must reference the intended Toast object.

### Uniqueness

Avoid multiple website records unintentionally mapping to the same ordering item.

### Duplicate Names

Do not use item names alone as authoritative identifiers.

### Renamed Items

Preserve identity when a title changes.

### Unmatched Records

Flag items without a confirmed mapping.

### Retired Identifiers

Handle discontinued Toast objects safely.

### Review

Require approval before ambiguous mappings are activated.

### Acceptance

Verify representative item mappings against authorized Toast data.

## Categories and Subcategories

The approved restaurant spreadsheet governs public menu organization.

### Current Business Rule

Use only approved categories and subcategories.

### HOOKAH

Do not introduce a HOOKAH category filter.

### COCKTAILS

Preserve the approved category structure.

### Toast Categories

Toast's menu groupings may differ from website navigation.

### Mapping Table

A future integration may require a mapping between Toast groups and website categories.

### Unmapped Group

Do not automatically create a public category.

### Category Rename

Require restaurant approval.

### Subcategory Relationships

Preserve approved parent-child relationships.

### Display Order

Retain the intended public navigation order.

### Testing

Verify category filters after every mapping change.

## Menu Item Names and Descriptions

Text synchronization requires careful ownership rules.

### Names

Toast and the website may use different item titles.

### Guest Presentation

The website should use approved restaurant-facing wording.

### Kitchen Terminology

Toast may use operational naming conventions.

### Descriptions

Determine whether Toast descriptions are available and suitable.

### Manual Overrides

Allow approved website-specific copy if the selected architecture supports it.

### Formatting

Normalize whitespace and supported characters.

### Truncation

Avoid silently cutting off descriptions.

### Missing Fields

Preserve approved content according to the defined ownership policy.

### Change Detection

Compare values before applying updates.

### Verification

Review representative public menu entries.

## Base Pricing

Pricing is a high-priority synchronization concern.

### Website Price

The current menu may display a restaurant-approved base amount.

### Toast Price

Toast's ordering configuration determines prices used in its checkout experience.

### Authority

Define the authoritative price source for each use case.

### Fixed Prices

Map supported monetary values accurately.

### Currency

Use an explicit currency convention.

### Precision

Avoid floating-point rounding errors in monetary calculations.

### Missing Price

Do not substitute zero without an approved business rule.

### Changed Price

Flag differences before applying sensitive updates.

### Public Verification

Confirm that displayed prices match approved expectations.

### Checkout Verification

Test actual ordering totals separately.

## Market-Price Items

Some menu items use variable pricing.

### Historical Examples

The initial menu included market-price offerings such as Snow Crab Legs, Lobster Tails, and Lobster & Grits.

### Display Convention

    MKT

### Current Authority

Use the latest approved menu information.

### Synchronization Concern

Toast may represent variable pricing differently from the website.

### Fixed Price Conversion

Do not automatically convert MKT to an arbitrary fixed amount.

### Missing Values

Distinguish intentionally variable prices from data errors.

### Ordering

Confirm whether the item can be ordered online.

### Manager Review

Require approval for changes in pricing representation.

### Acceptance

Verify both public presentation and supported ordering behavior.

## Modifier Groups and Options

Modifiers require structured mapping.

### Modifier Group

Represents a set of related choices.

### Modifier Option

Represents an individual selection.

### Required Selection

Some groups may require at least one choice.

### Optional Selection

Some groups allow additions.

### Minimum

Respect the authoritative minimum selection count.

### Maximum

Respect the authoritative maximum selection count.

### Price Adjustment

Map supported surcharges.

### Shared Groups

Avoid unintended changes to multiple items.

### Unmapped Options

Flag unknown modifiers.

### Acceptance

Test items with multiple modifier combinations.

## Item Availability

Availability can change independently of menu publication.

### Published Item

An item displayed on the website.

### Orderable Item

An item currently accepted by the ordering system.

### Sold-Out Item

An item temporarily unavailable.

### Discontinued Item

An item no longer offered.

### Authority

Identify which system determines orderability.

### Refresh

Choose an appropriate availability refresh strategy.

### Stale Data

Prevent outdated availability from causing misleading ordering behavior.

### Public Presentation

Define whether unavailable items are hidden or labeled.

### Cart Validation

Recheck orderability at the supported submission stage.

### Qualification

Real-time Toast availability access has not been confirmed.

## SPECIALS and Promotions

SPECIALS require separate mapping rules.

### Existing Website Capability

The menu editor includes a $5 specials toggle.

### Exact Toggle Behavior

Requires source-code verification.

### Planned Feature

Recurring day-of-week SPECIALS scheduling.

### Example

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

### Website Promotion

Controls promotional presentation where supported.

### Toast Promotion

Controls ordering discounts according to supported Toast configuration.

### Critical Distinction

Displaying a special does not automatically apply a checkout discount.

### Conflict Prevention

Avoid simultaneous incompatible discounts.

### Timezone

Use the restaurant's local operating timezone.

### Acceptance

Verify promotional prices in the authoritative checkout.

## Menu Images

The website maintains approved food photography.

### Storage Provider

    Supabase Storage

### Bucket

    website-media

### Prefix

    menu/

### Output Format

    WebP

### Aspect Ratio

    4:3

### Proposed Ownership

Keep website media under the established image-management workflow unless a different approach is approved.

### Toast Images

Evaluate availability and permitted use before importing vendor-hosted media.

### COCKTAILS

Do not require cocktail images.

### Replacement

Avoid overwriting approved photography automatically.

### Verification

Confirm image associations remain correct after synchronization.

## Data Transformation

Toast data may not match the website schema directly.

### Transformation Layer

Convert authorized external data into validated website representations.

### Type Validation

Check strings, numbers, identifiers, and collections.

### Null Handling

Define behavior for missing values.

### Category Mapping

Use approved relationships.

### Modifier Mapping

Preserve supported option constraints.

### Price Conversion

Use safe monetary representations.

### Text Normalization

Preserve meaningful punctuation and approved names.

### Unknown Fields

Ignore or record unsupported fields according to policy.

### Invalid Records

Reject unsafe transformations.

### Testing

Use representative fixtures based on authorized API responses.

## Initial Synchronization

The first synchronization requires additional safeguards.

### Step 1 — Backup

Establish an approved recovery point.

### Step 2 — Inventory

Export or inspect current website menu records.

### Step 3 — Retrieve

Obtain authorized Toast menu data.

### Step 4 — Normalize

Validate and transform source records.

### Step 5 — Match

Map Toast items to website items.

### Step 6 — Review

Identify duplicates, missing records, and conflicts.

### Step 7 — Dry Run

Generate a proposed change report without mutation.

### Step 8 — Approve

Obtain restaurant authorization.

### Step 9 — Apply

Perform controlled changes if approved.

### Step 10 — Verify

Confirm database and public menu accuracy.

## Incremental Synchronization

Incremental updates reduce unnecessary processing.

### Change Detection

Determine whether Toast supports timestamps, version identifiers, or change events.

### Polling

Periodic retrieval may be appropriate if authorized.

### Events

Webhook-driven updates may be possible if supported.

### Comparison

Compare incoming values with current mapped records.

### Field Ownership

Update only fields assigned to the source.

### Idempotency

Repeated processing should not create duplicate records.

### Transactions

Use appropriate database consistency safeguards.

### Failure

Preserve the last verified state when an update cannot be applied.

### Reporting

Record failed or skipped changes.

### Qualification

No incremental synchronization mechanism is currently confirmed as implemented.

## Synchronization Scheduling

Scheduling affects freshness and API usage.

### Manual

An authorized administrator initiates synchronization.

### Periodic

A scheduled job checks for changes.

### Event-Driven

Supported events trigger updates.

### Hybrid

Scheduled reconciliation supplements event updates.

### Frequency

Choose a cadence based on operational needs and vendor limits.

### Availability

Fast-changing availability may require a different strategy from descriptions.

### Pricing

Price changes may require prompt verification.

### Timezone

Use the restaurant's local timezone for business schedules.

### Monitoring

Detect missed or failed runs.

### Implementation Boundary

No production Toast synchronization schedule is established.

## Conflict Detection and Resolution

Conflicts occur when systems disagree.

### Price Conflict

Website and Toast amounts differ.

### Name Conflict

Item titles do not match.

### Category Conflict

Toast grouping differs from approved website navigation.

### Modifier Conflict

Option sets differ.

### Availability Conflict

One system marks an item unavailable.

### Promotion Conflict

Discount settings differ.

### Ownership Rule

Prefer the designated authoritative source.

### Manual Review

Escalate conflicts without a safe automatic resolution.

### Audit

Record the previous and proposed values.

### Recovery

Support approved correction if a bad update is applied.

## Deleted and Discontinued Items

Deletion must be handled conservatively.

### Missing Toast Item

An item may be omitted for reasons other than permanent deletion.

### Temporary Unavailability

Do not treat sold-out items as deleted records.

### Discontinued Item

Confirm that the restaurant no longer offers the item.

### Website Record

Avoid immediate destructive removal.

### Historical References

Consider relationships to prior data.

### Image References

Check associated media before cleanup.

### Approval

Require authorization for permanent deletion.

### Soft Deactivation

Evaluate a non-destructive approach where supported.

### Recovery

Maintain a process for restoring incorrectly retired items.

### Acceptance

Verify public presentation after approved changes.

## Database Design Considerations

The existing Supabase schema must be inspected before modifications.

### Existing Records

Preserve current menu identifiers and relationships.

### Mapping Storage

A future integration may need Toast-to-website identifier mappings.

### Synchronization State

Track the last verified synchronization where appropriate.

### Conflict Records

Store unresolved differences if required.

### Audit Records

Track approved changes and failures.

### Versioning

Evaluate version identifiers for safe updates.

### Constraints

Prevent duplicate mappings.

### RLS

Restrict sensitive synchronization metadata.

### Migration Safety

Use reviewed database migrations.

### Important Boundary

No new table names or columns are asserted as existing here.

## API Integration Layer

A secure integration layer would coordinate Toast communication.

### Framework

    Next.js App Router

### Server Execution

Privileged API requests must execute server-side.

### Authentication

Use the approved Toast credential mechanism.

### Request Validation

Validate integration inputs.

### Response Validation

Treat external responses as untrusted data.

### Mapping

Convert data through explicit transformation functions.

### Persistence

Use authorized database operations.

### Errors

Distinguish vendor failures from local validation failures.

### Logging

Redact credentials and sensitive data.

### Testing

Mock or use authorized test responses.

## Caching and Data Freshness

Synchronization does not guarantee immediate public updates.

### Source Freshness

Determine how recently Toast data was retrieved.

### Database Freshness

Confirm when mapped values were persisted.

### Public Cache

Inspect the website's actual Next.js caching behavior.

### Media Cache

Consider image caching separately.

### Price Freshness

Avoid presenting stale authoritative prices.

### Availability Freshness

Treat time-sensitive orderability carefully.

### Revalidation

Use the application-specific strategy after verification.

### Diagnostics

Record source and update timestamps where appropriate.

### Manager Communication

Explain known synchronization delays.

### Acceptance

Measure actual update visibility during testing.

## Security and Authorization

Synchronization must protect both systems.

### Toast Credentials

Keep credentials server-side.

### Supabase Credentials

Protect privileged database access.

### Environment Variables

Use approved configuration.

### Source Control

Do not commit `.env.local`.

### Least Privilege

Use only required API scopes.

### Manager Authorization

Preserve protected administrative access.

### RLS

Enforce database access policies.

### Input Validation

Validate external data before persistence.

### Audit

Record privileged synchronization actions.

### Incident Response

Provide a process for disabling compromised integration access.

## Error Handling and Recovery

Synchronization failures must not silently corrupt menu data.

### Authentication Failure

Stop protected operations and report the problem.

### API Timeout

Determine whether the request can be retried safely.

### Rate Limit

Follow vendor-approved retry guidance.

### Invalid Response

Reject malformed data.

### Missing Mapping

Flag the item for review.

### Database Failure

Avoid partially applied updates where consistency requires atomicity.

### Conflict

Preserve the last verified value pending review.

### Duplicate

Prevent repeated creation.

### Recovery

Restore approved data through documented procedures.

### Fallback

Keep existing external Toast ordering available.

## Monitoring and Audit History

A production integration requires observable behavior.

### Run Identifier

Associate related operations with a synchronization attempt.

### Start and End

Record execution timing.

### Source

Identify the authorized data source.

### Result

Track success, partial success, or failure.

### Record Counts

Track examined, changed, skipped, and rejected items.

### Conflicts

Report unresolved differences.

### Errors

Capture sanitized diagnostic information.

### Alerts

Notify responsible personnel of material failures.

### Retention

Define an appropriate log-retention policy.

### Review

Periodically inspect synchronization health.

## Manager Workflows

### Workflow A — New Menu Item

1. Confirm the approved item.
2. Identify its authoritative source.
3. Review the proposed mapping.
4. Validate price and modifiers.
5. Approve the change.
6. Verify the website.
7. Check Toast ordering separately.

### Workflow B — Price Change

1. Confirm the approved amount.
2. Identify the authoritative pricing system.
3. Review the proposed update.
4. Apply through the approved process.
5. Confirm persistence.
6. Verify guest-facing pricing.
7. Verify checkout pricing.

### Workflow C — Item Unavailable

1. Confirm the operational status.
2. Identify the availability authority.
3. Apply supported changes.
4. Check the website.
5. Check the ordering experience.
6. Report inconsistencies.

### Workflow D — Synchronization Conflict

1. Review the affected item.
2. Compare both systems.
3. Identify the authoritative field.
4. Obtain approval.
5. Apply the correction.
6. Verify both systems.
7. Record the resolution.

## Testing and Acceptance

### Access

- [ ] Toast eligibility confirmed.
- [ ] Required API permissions confirmed.
- [ ] Authorized testing environment available.

### Mapping

- [ ] Stable item mapping verified.
- [ ] Duplicate names handled.
- [ ] Missing identifiers handled.
- [ ] Category mappings approved.

### Data

- [ ] Descriptions validated.
- [ ] Base prices verified.
- [ ] Market-price behavior verified.
- [ ] Modifier groups validated.
- [ ] Availability handling tested.

### Synchronization

- [ ] Initial dry run completed.
- [ ] Conflicts detected.
- [ ] Repeated runs do not duplicate items.
- [ ] Partial failures handled.
- [ ] Recovery procedure tested.

### Presentation

- [ ] Public menu verified.
- [ ] Mobile and desktop verified.
- [ ] Images remain correct.
- [ ] COCKTAILS display without images.

### Evidence

Record actual results before declaring acceptance.

## Operational Risks

### Incorrect Mapping

An item may become associated with the wrong Toast object.

### Price Drift

The website may display an outdated amount.

### Modifier Drift

Ordering options may differ from advertised options.

### Unavailable Items

Stale data may imply that sold-out items are orderable.

### Duplicate Items

Repeated imports may create redundant records.

### Destructive Updates

An incorrect synchronization rule may overwrite approved data.

### API Outage

Toast data may temporarily become unavailable.

### Credential Failure

Expired or revoked credentials may interrupt synchronization.

### Uncontrolled Changes

Bidirectional updates may create conflicts.

### Mitigation

Use read-only evaluation, dry runs, explicit ownership, monitoring, and recoverable changes.

## Implementation Roadmap

### Stage 1 — Confirm Toast Eligibility

Establish authorized integration access.

### Stage 2 — Inspect Existing Schema

Review the current website menu data model.

### Stage 3 — Inventory Menu Data

Document fields and relationships.

### Stage 4 — Define Ownership

Approve field-level source-of-truth rules.

### Stage 5 — Design Mapping

Define item and category identity relationships.

### Stage 6 — Prototype Retrieval

Test authorized Toast menu access.

### Stage 7 — Build Transformations

Validate incoming data.

### Stage 8 — Implement Dry Run

Generate proposed changes without mutation.

### Stage 9 — Review Conflicts

Establish approval and resolution procedures.

### Stage 10 — Controlled Synchronization

Apply approved updates in a safe environment.

### Stage 11 — Verify Public Rendering

Test pricing, modifiers, categories, and images.

### Stage 12 — Operational Acceptance

Confirm reliability, recovery, and manager workflows.

## Implementation Status

| Capability | Status |
|---|---|
| Website menu administration | Implemented |
| Supabase menu database | Implemented |
| Supabase Storage images | Implemented |
| Manager authentication | Implemented |
| Manager authorization | Implemented |
| Existing $5 specials toggle | Implemented |
| Approved category taxonomy | Established business requirement |
| Toast API eligibility | Unconfirmed |
| Toast menu API access | Unconfirmed |
| Toast item identifiers | Pending verification |
| Toast modifier access | Unconfirmed |
| Toast availability access | Unconfirmed |
| Toast promotion access | Unconfirmed |
| Field ownership matrix | Proposed |
| Identifier mapping | Proposed |
| Initial synchronization | Not implemented |
| Incremental synchronization | Not implemented |
| Scheduled synchronization | Not implemented |
| Bidirectional synchronization | Not implemented |
| Conflict detection | Proposed |
| Synchronization audit history | Proposed |
| Dry-run preview | Proposed |
| Automated recovery | Proposed |
| Production synchronization acceptance | Pending |
| Existing external Toast ordering | Established |

## Related Documentation

- [Toast POS Integration Overview](README.md)
- [Integration Architecture](integration-overview.md)
- [API Feasibility](api-feasibility.md)
- [Cart and Checkout](cart-and-checkout.md)
- [Order Submission](order-submission.md)
- [Payment Processing](payment-processing.md)
- [Security and Compliance](security-and-compliance.md)
- [Cost Analysis](cost-analysis.md)
- [Implementation Roadmap](implementation-roadmap.md)
- [Website Menu System](../02-website/menu-system.md)
- [Website SPECIALS Overview](../02-website/specials/specials-overview.md)
- [Admin Menu Management](../04-admin-dashboard/menu-management.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Database Storage](../06-database/storage.md)
- [Menu Management Overview](../09-menu-management/README.md)
- [Categories and Subcategories](../09-menu-management/categories-and-subcategories.md)
- [Pricing and Modifiers](../09-menu-management/pricing-and-modifiers.md)
- [Menu Images](../09-menu-management/menu-images.md)
- [SPECIALS Management](../09-menu-management/specials-management.md)
- [Publishing Updates](../09-menu-management/publishing-updates.md)
- [Master Documentation Index](../README.md)

---

[Back to Toast POS Integration Overview](README.md)
