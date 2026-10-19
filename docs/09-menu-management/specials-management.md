# MENU MANAGEMENT — SPECIALS Management

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Audience:** Restaurant Managers, Menu Administrators, Developers, and QA Reviewers

**Implementation Status:** Existing $5 specials toggle implemented; advanced daily scheduling and production acceptance require further development and verification

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [SPECIALS Objectives](#specials-objectives)
3. [Current Implementation](#current-implementation)
4. [SPECIALS Architecture](#specials-architecture)
5. [Business Requirements](#business-requirements)
6. [Existing $5 Specials Toggle](#existing-5-specials-toggle)
7. [Current Capability Boundaries](#current-capability-boundaries)
8. [Future Daily SPECIALS System](#future-daily-specials-system)
9. [Existing Menu Item Relationships](#existing-menu-item-relationships)
10. [SPECIALS Data Model](#specials-data-model)
11. [Day-of-Week Scheduling](#day-of-week-scheduling)
12. [Date-Based Scheduling](#date-based-scheduling)
13. [SPECIALS Pricing](#specials-pricing)
14. [SPECIALS Naming and Descriptions](#specials-naming-and-descriptions)
15. [SPECIALS Images](#specials-images)
16. [Manager Authorization](#manager-authorization)
17. [Creating a Daily Special](#creating-a-daily-special)
18. [Editing a Scheduled Special](#editing-a-scheduled-special)
19. [Disabling a Special](#disabling-a-special)
20. [Scheduling Conflicts](#scheduling-conflicts)
21. [Public SPECIALS Presentation](#public-specials-presentation)
22. [Mobile and Desktop Behavior](#mobile-and-desktop-behavior)
23. [Publishing and Activation](#publishing-and-activation)
24. [Timezone and Calendar Rules](#timezone-and-calendar-rules)
25. [Database and Security](#database-and-security)
26. [Toast POS Integration Boundaries](#toast-pos-integration-boundaries)
27. [Common Manager Workflows](#common-manager-workflows)
28. [Troubleshooting](#troubleshooting)
29. [Testing and Acceptance](#testing-and-acceptance)
30. [Future Enhancements](#future-enhancements)
31. [Implementation Roadmap](#implementation-roadmap)
32. [Implementation Status](#implementation-status)
33. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the operational and technical requirements for SPECIALS management on the Fin & Feathers Las Vegas website.

SPECIALS allow the restaurant to promote selected menu items through approved promotional pricing or featured placement.

The established business direction includes daily specials associated with existing menu items.

An example is:

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

The project currently includes an existing $5 specials toggle within Menu Management.

A more advanced system for managing scheduled, day-specific specials is planned.

This document separates those two capabilities and explains the intended future administration model.

It does not represent planned scheduling functionality as currently deployed.

## SPECIALS Objectives

### Promotional Visibility

Highlight approved restaurant offerings.

### Manager Control

Allow authorized managers to maintain promotions.

### Menu Consistency

Reference existing menu items where applicable.

### Pricing Accuracy

Present approved promotional prices.

### Scheduling

Support predictable day-of-week promotions in a future phase.

### Automatic Activation

Activate approved specials at the intended time when scheduling is implemented.

### Automatic Expiration

End promotions when their scheduled window closes.

### Mobile Presentation

Make specials easy to discover on mobile.

### Security

Restrict promotional administration to authorized staff.

### Operational Verification

Confirm public display and pricing before promotions are advertised.

## Current Implementation

**Status:** Basic special-related control implemented

### Administrative Route

    /admin/menu

### Existing Capability

    $5 specials toggle

### Application Framework

    Next.js App Router

### Database

    Supabase PostgreSQL

### Authentication

    Supabase Auth

### Authorization

    requireManager()

### Public Menu

The website includes the established menu presentation system.

### Verification Boundary

The exact effect of the existing $5 specials toggle requires verification against current application code and public behavior.

### Planned Capability

Advanced day-of-week scheduling is not established as implemented.

## SPECIALS Architecture

SPECIALS involve several application layers.

### Menu Data

Existing menu records identify restaurant offerings.

### Promotional Data

Special-related information identifies the intended promotion.

### Manager Interface

Authorized staff configure supported settings.

### Authorization

Manager permissions protect administrative operations.

### Database

Supabase PostgreSQL stores supported menu and promotional information.

### Scheduling

A future scheduler determines active promotions.

### Public Website

The guest-facing interface presents active specials.

### External Ordering

Toast may require separate promotion configuration.

### Verification

Each layer must be tested before automated scheduling is introduced.

## Business Requirements

The restaurant intends to promote approved menu items on selected days.

### Existing Items

SPECIALS should be associated with existing menu offerings when applicable.

### Day-Specific Promotions

A promotion may apply to a particular weekday.

### Example

    Tuesday — F&F Taco Tuesday Platter

### Featured Presentation

The website should communicate the current promotion clearly.

### Price Approval

Restaurant management must approve promotional pricing.

### Schedule Approval

Managers should confirm the intended active period.

### Consistency

Promotional information should not contradict standard menu information.

### External Ordering

Promotional pricing must be coordinated with Toast when applicable.

### Operational Boundary

A website promotion does not automatically modify external checkout pricing.

## Existing $5 Specials Toggle

The menu editor includes a special-related toggle.

### Status

Implemented.

### Administrative Location

    /admin/menu

### Established Description

    $5 specials toggle

### Manager Access

The control is within protected menu administration.

### Intended Use

Special-related menu administration.

### Important Verification

The precise meaning of the $5 amount and the toggle's database and public-display effects must be verified.

### Do Not Assume

Do not assume the toggle:

- Schedules a promotion.
- Changes Toast pricing.
- Creates a separate specials record.
- Expires automatically.
- Changes the base price.
- Supports multiple promotional prices.

### Acceptance

Confirm actual behavior through controlled testing.

## Current Capability Boundaries

The current and planned capabilities must remain distinct.

### Implemented

- Protected Menu Management.
- Existing $5 specials toggle.
- Menu item administration.
- Supabase-backed menu data.

### Requires Verification

- Exact toggle behavior.
- Special pricing persistence.
- Public special display.
- Deactivation behavior.
- Any existing time-related logic.

### Planned

- Day-of-week scheduling.
- Date-based scheduling.
- Automatic activation.
- Automatic expiration.
- Conflict detection.
- Dedicated SPECIALS administration.

### Not Established

- Direct Toast promotion synchronization.
- Automated POS discount creation.
- Production scheduling acceptance.

### Documentation Principle

Do not describe planned features as available manager controls.

## Future Daily SPECIALS System

A future SPECIALS system should support recurring promotions.

### Daily Promotion

Associate a promotion with a selected weekday.

### Existing Menu Item

Reference an approved item.

### Promotional Name

Display an approved promotional title.

### Promotional Price

Use the approved special price.

### Active State

Determine whether the promotion is enabled.

### Effective Window

Define when the promotion applies.

### Recurrence

Support approved recurring schedules.

### Expiration

End the promotion appropriately.

### Manager Interface

Provide a dedicated administration workflow.

### Public Presentation

Display the current special prominently.

### Implementation Boundary

These are future requirements rather than deployed capabilities.

## Existing Menu Item Relationships

SPECIALS should reference existing menu items where applicable.

### Parent Item

Identify the approved menu record.

### Item Name

Preserve the intended menu identity.

### Description

Reuse or supplement approved item information.

### Standard Price

Retain the normal price.

### Special Price

Store or derive the approved promotional price separately.

### Category

Preserve the item's approved category.

### Modifiers

Retain applicable item options.

### Image

Reuse approved item photography where appropriate.

### Availability

Do not feature unavailable items without approval.

### Data Integrity

Prevent broken references to removed items.

## SPECIALS Data Model

A future scheduling system requires an approved data model.

### Conceptual Fields

Potential fields include:

- Special identifier.
- Related menu item identifier.
- Promotional title.
- Promotional description.
- Special price.
- Active status.
- Day of week.
- Start date.
- End date.
- Start time.
- End time.
- Created by.
- Updated by.
- Created timestamp.
- Updated timestamp.

### Important Qualification

These are proposed fields, not confirmed current database columns.

### Relationships

A special should reference a valid menu item.

### Constraints

Prevent invalid pricing and schedules.

### Authorization

Restrict administrative writes.

### Migration

Implement schema changes through approved migrations.

### Recovery

Database rollback requires separate planning.

## Day-of-Week Scheduling

Recurring promotions may be assigned to weekdays.

### Monday

Support an approved Monday promotion.

### Tuesday

Support an approved Tuesday promotion.

### Wednesday

Support an approved Wednesday promotion.

### Thursday

Support an approved Thursday promotion.

### Friday

Support an approved Friday promotion.

### Saturday

Support an approved Saturday promotion.

### Sunday

Support an approved Sunday promotion.

### Multiple Promotions

Define whether more than one special may be active on a given day.

### Priority

Establish display priority when multiple specials are approved.

### Implementation Boundary

Weekday scheduling remains planned.

## Date-Based Scheduling

Some promotions may require date restrictions.

### Start Date

The first date on which the promotion may apply.

### End Date

The final applicable date.

### Recurrence

A promotion may recur within a date range.

### One-Time Special

A promotion may apply to a single date.

### Seasonal Special

A promotion may apply during a defined season.

### Holiday Exception

Special operating dates may override recurring rules.

### Expiration

The system should stop displaying expired promotions.

### Validation

End dates must not precede start dates.

### Manager Approval

Dates require operational approval.

### Implementation Boundary

Date-based scheduling is not established as implemented.

## SPECIALS Pricing

Promotional pricing must be approved and accurate.

### Standard Price

The normal menu price.

### Promotional Price

The approved temporary price.

### Existing Toggle

The current $5 specials control requires behavioral verification.

### Price Preservation

Do not overwrite standard pricing unintentionally.

### Modifier Charges

Determine whether normal surcharges still apply.

### Market Price

Market-priced items require special handling.

### Tax

Tax is not established as part of the website's specials calculation.

### Service Charges

Restaurant service-charge policy remains separate from item pricing.

### Toast

External checkout may use different promotional settings.

### Verification

Confirm the public presentation and actual ordering price separately.

## SPECIALS Naming and Descriptions

SPECIALS should use clear promotional language.

### Promotional Title

Use the approved restaurant wording.

### Example

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

### Item Identity

Do not misrepresent the underlying dish.

### Description

Communicate the offering accurately.

### Price

Display approved promotional pricing.

### Availability

Avoid advertising expired or unavailable promotions.

### Capitalization

Use consistent presentation.

### Length

Keep titles readable on mobile.

### Approval

Management should approve promotional copy.

### Verification

Review public text before activation.

## SPECIALS Images

SPECIALS may use existing menu photography.

### Existing Item Image

Reuse the approved image where appropriate.

### Accuracy

The image should represent the featured dish.

### Aspect Ratio

    4:3

### Output Format

    WebP

### Storage

    Supabase Storage

### Dedicated Promotional Images

A future system may support separate campaign imagery.

### Approval

Promotional graphics require restaurant approval.

### Missing Image

The special should remain understandable without photography.

### COCKTAILS

Do not introduce an image requirement for COCKTAILS.

### Implementation Boundary

Dedicated promotional-image administration is not established as deployed.

## Manager Authorization

SPECIALS administration is a restricted function.

### Authentication

    Supabase Auth

### Authorization

    requireManager()

### Role Table

    staff_roles

### Required Role

    manager

### Required State

    is_active = true

### Current Control

The existing specials toggle is within protected Menu Management.

### Future Administration

Dedicated SPECIALS controls must enforce authorization.

### Server Security

Restricted mutations must be checked server-side.

### Database Security

RLS must protect promotional records.

### Verification

Test authorized and unauthorized operations.

## Creating a Daily Special

**Status:** Planned workflow

The following procedure describes intended future functionality.

### Step 1 — Confirm Promotion

Obtain restaurant approval.

### Step 2 — Select Existing Item

Choose the intended menu record.

### Step 3 — Enter Promotional Title

Use approved wording.

### Step 4 — Enter Description

Provide accurate promotional information.

### Step 5 — Set Special Price

Enter the approved amount.

### Step 6 — Select Weekday

Choose the intended day.

### Step 7 — Set Date Range

Configure dates if applicable.

### Step 8 — Review Availability

Confirm the item can be offered.

### Step 9 — Review Conflicts

Check for overlapping promotions.

### Step 10 — Save

Persist the future promotional record.

### Step 11 — Verify

Confirm activation and public display when implemented.

## Editing a Scheduled Special

**Status:** Planned workflow

### Step 1 — Locate Promotion

Find the intended special.

### Step 2 — Review Current Configuration

Inspect title, item, price, and schedule.

### Step 3 — Confirm Approval

Verify the requested change.

### Step 4 — Edit Fields

Update the intended values.

### Step 5 — Review Item Relationship

Ensure the correct menu item remains associated.

### Step 6 — Review Schedule

Check the active window.

### Step 7 — Check Conflicts

Identify overlapping promotions.

### Step 8 — Save

Persist the update.

### Step 9 — Verify Public Display

Check the intended active period.

### Step 10 — Record Change

Document significant revisions.

## Disabling a Special

**Status:** Planned scheduled-special workflow

### Temporary Deactivation

Allow a manager to pause an approved promotion.

### Permanent Expiration

End a promotion that will no longer recur.

### Preserve Standard Price

Do not modify the underlying regular price unnecessarily.

### Public Display

Remove inactive promotions from active presentation.

### Existing Toggle

Current toggle deactivation behavior requires verification.

### Scheduling

Future scheduled specials should expire according to their rules.

### Database

Preserve historical information where required.

### Manager Authorization

Only approved staff should deactivate promotions.

### Verification

Confirm the public website reflects the intended state.

### Recovery

Support approved reactivation where appropriate.

## Scheduling Conflicts

Automated scheduling must handle overlapping promotions.

### Same Item

Two specials may target the same menu item.

### Same Day

Multiple specials may be active on one weekday.

### Different Prices

Conflicting prices require resolution.

### Date Overlap

Recurring date ranges may overlap.

### Time Overlap

Two promotions may share an active time window.

### Priority

Define which promotion takes precedence.

### Validation

Warn managers about unsupported conflicts.

### Approval

Restaurant management should approve exceptions.

### Logging

Record significant overrides.

### Implementation Boundary

Conflict detection is planned, not confirmed implemented.

## Public SPECIALS Presentation

The public website should communicate active promotions clearly.

### Featured Area

A future dedicated SPECIALS section may highlight the current promotion.

### Title

Display the approved promotional name.

### Day

Communicate the applicable weekday.

### Description

Present accurate item information.

### Price

Show approved special pricing.

### Image

Use approved imagery where appropriate.

### Availability

Do not present expired promotions as active.

### Navigation

Allow guests to locate the underlying menu item.

### Accessibility

Do not rely on color alone to communicate promotional status.

### Implementation Boundary

The final future presentation design requires approval.

## Mobile and Desktop Behavior

SPECIALS should work across screen sizes.

### Mobile Priority

The website follows a mobile-first approach.

### Title Readability

Avoid truncating important promotional information.

### Price Visibility

Keep the special price clear.

### Image Layout

Preserve approved proportions.

### Buttons

Use accessible controls where applicable.

### Touch Targets

Provide appropriate mobile interaction sizes.

### Desktop

Support wider layouts without excessive whitespace.

### Responsive Testing

Verify common viewport sizes.

### Loading

Avoid unnecessary layout shifts.

### Future Design

Confirm exact presentation during implementation.

## Publishing and Activation

Publishing must distinguish content saving from promotion activation.

### Save

Store the approved promotional configuration.

### Activation

Make the promotion eligible for public display.

### Scheduled Activation

A future scheduler may activate promotions automatically.

### Expiration

A future scheduler may deactivate expired promotions.

### Public Cache

Consider data caching and revalidation.

### Timezone

Use the restaurant's intended local time.

### Manual Override

Define controlled manager intervention where needed.

### Verification

Confirm the correct promotion appears.

### External Ordering

Toast promotion configuration remains separate unless integrated.

### Implementation Boundary

Automated publishing is planned.

## Timezone and Calendar Rules

The restaurant operates in Las Vegas, Nevada.

### Local Timezone

    America/Los_Angeles

### Daylight Saving Time

The timezone observes daylight saving transitions.

### Weekday Determination

Use the restaurant's local date.

### Midnight Transition

Define when one day's special ends and the next begins.

### Business Hours

Promotions may require business-hour restrictions.

### Overnight Hours

Handle promotions crossing midnight explicitly.

### Start and End Dates

Interpret dates in the intended local timezone.

### Server Time

Do not assume server UTC dates match restaurant-local dates.

### Testing

Test weekday transitions and daylight saving boundaries.

### Implementation Boundary

These are requirements for the future scheduler.

## Database and Security

SPECIALS data must be protected.

### Database Provider

    Supabase PostgreSQL

### Existing Menu Data

Use the current menu schema.

### Future Promotional Data

Add approved tables or fields only when necessary.

### Authentication

Supabase Auth identifies managers.

### Authorization

Manager permissions protect writes.

### RLS

Policies must restrict unauthorized modifications.

### Validation

Reject invalid dates, prices, and item references.

### Audit

Consider tracking promotional changes.

### Migrations

Use controlled schema migrations.

### Recovery

Coordinate database recovery separately from application rollback.

## Toast POS Integration Boundaries

The website currently uses external Toast online ordering.

### Existing Ordering

Guests follow the external Toast ordering destination.

### Direct Integration

A direct Toast POS API integration is under evaluation.

### Website SPECIALS

The website may advertise approved promotions.

### Toast Pricing

Toast may require separate promotional configuration.

### Checkout

A website promotion does not guarantee a matching checkout discount.

### Manager Coordination

Confirm operational pricing across systems.

### Modifier Pricing

Check whether normal surcharges apply.

### Future Synchronization

Automated promotion mapping requires separate design and approval.

### Security

Do not expose POS credentials in public application code.

### Verification

Test the actual guest ordering experience separately.

## Common Manager Workflows

### Workflow A — Review Existing $5 Toggle

1. Sign in as an authorized manager.
2. Open Menu Management.
3. Locate the intended item.
4. Review the existing special-related control.
5. Confirm approved promotional intent.
6. Use only verified functionality.
7. Save if appropriate.
8. Verify public behavior.

### Workflow B — Plan a Tuesday Special

1. Identify the approved menu item.
2. Confirm promotional pricing.
3. Prepare the title.
4. Define Tuesday recurrence.
5. Determine the effective date range.
6. Review operational availability.
7. Coordinate Toast pricing.
8. Retain the plan until scheduling functionality is implemented.

### Workflow C — Review Active Promotions

1. Confirm the intended promotion.
2. Verify the public title.
3. Verify pricing.
4. Confirm availability.
5. Check mobile presentation.
6. Check Toast separately.

### Workflow D — Correct an Incorrect Promotion

1. Identify the discrepancy.
2. Confirm the approved information.
3. Use the supported current controls.
4. Avoid unverified direct database changes.
5. Verify public correction.
6. Record the incident if material.

## Troubleshooting

### Special Does Not Appear

Check current implemented behavior before assuming scheduling support.

### Wrong Special Price

Review approved pricing and the current toggle.

### Promotion Does Not Expire

Automatic expiration is not established as implemented.

### Wrong Weekday

Day-of-week scheduling is planned.

### Wrong Menu Item

Review the intended item relationship.

### Duplicate Promotion

Check for conflicting promotional records or settings.

### Toast Price Differs

Verify external Toast configuration separately.

### Save Failure

Review validation, authorization, and database errors.

### Unauthorized Access

Escalate as a security issue.

### Stale Public Display

Investigate current caching behavior.

### Persistent Problem

Escalate with sanitized evidence.

## Testing and Acceptance

### Existing Functionality

- [ ] Authorized manager can access the existing specials toggle.
- [ ] Exact toggle behavior is documented.
- [ ] Saved state persists correctly.
- [ ] Public presentation matches implemented behavior.

### Security

- [ ] Anonymous special changes are rejected.
- [ ] Non-manager changes are rejected.
- [ ] Inactive manager changes are rejected.

### Future Scheduling

- [ ] Weekday recurrence works.
- [ ] Date ranges work.
- [ ] Automatic activation works.
- [ ] Automatic expiration works.
- [ ] Conflicts are handled.
- [ ] Local timezone behavior is correct.
- [ ] Daylight saving transitions are handled.

### Public Display

- [ ] Mobile presentation is correct.
- [ ] Desktop presentation is correct.
- [ ] Prices are accurate.
- [ ] Inactive specials are not presented as active.

### External Ordering

- [ ] Toast pricing is verified separately.

### Evidence

Record actual results before declaring acceptance.

## Future Enhancements

Potential future capabilities include:

### Dedicated SPECIALS Dashboard

Centralized promotion management.

### Weekly Calendar

Visual scheduling by weekday.

### Recurring Promotions

Repeat approved specials automatically.

### Date Exceptions

Override recurrence on selected dates.

### Time-Based Promotions

Support approved promotional hours.

### Conflict Warnings

Identify overlapping schedules.

### Approval Workflow

Require manager approval before publication.

### Audit History

Track promotional changes.

### Performance Reporting

Measure promotional engagement.

### Toast Synchronization

Evaluate approved POS promotion integration.

### Implementation Boundary

These enhancements are not confirmed deployed features.

## Implementation Roadmap

### Stage 1 — Audit Existing Toggle

Inspect current special-related application behavior.

### Stage 2 — Define Business Rules

Confirm pricing, scheduling, and display requirements.

### Stage 3 — Design Data Model

Establish approved promotional relationships.

### Stage 4 — Implement Manager Interface

Build dedicated SPECIALS administration.

### Stage 5 — Implement Scheduling

Add recurring and date-based activation logic.

### Stage 6 — Implement Public Presentation

Display the correct active promotions.

### Stage 7 — Verify Timezone Rules

Test Las Vegas local-date behavior.

### Stage 8 — Verify Security

Test authorization and RLS.

### Stage 9 — Test Operations

Validate activation, expiration, and conflicts.

### Stage 10 — Train Managers

Document the approved operating process.

### Stage 11 — Evaluate Toast Integration

Assess direct promotion synchronization.

### Scheduling

No committed release dates are established by this roadmap.

## Implementation Status

| Capability | Status |
|---|---|
| Protected Menu Management | Implemented |
| Existing $5 specials toggle | Implemented |
| Manager authentication | Implemented |
| Manager authorization | Implemented |
| Supabase menu data integration | Implemented |
| Exact $5 toggle behavior audit | Pending |
| Existing special display acceptance | Pending |
| Existing deactivation behavior audit | Pending |
| Dedicated SPECIALS administration | Planned |
| Day-of-week scheduling | Planned |
| Date-based scheduling | Planned |
| Automatic activation | Planned |
| Automatic expiration | Planned |
| Scheduling conflict detection | Planned |
| Las Vegas timezone handling | Planned |
| Dedicated SPECIALS public display | Planned |
| Promotional approval workflow | Proposed |
| Promotional audit history | Proposed |
| Toast POS promotion synchronization | Under evaluation |
| End-to-end scheduled SPECIALS testing | Not started |
| Formal manager training | Planned |

## Related Documentation

- [Menu Management Overview](README.md)
- [Menu Editor Guide](menu-editor-guide.md)
- [Categories and Subcategories](categories-and-subcategories.md)
- [Adding and Editing Items](adding-editing-items.md)
- [Pricing and Modifiers](pricing-and-modifiers.md)
- [Menu Images](menu-images.md)
- [Publishing Updates](publishing-updates.md)
- [Menu Troubleshooting](troubleshooting.md)
- [Website SPECIALS Overview](../02-website/specials/specials-overview.md)
- [SPECIALS Scheduling](../02-website/specials/scheduling.md)
- [Website SPECIALS Administration](../02-website/specials/admin-management.md)
- [Admin SPECIALS Management](../04-admin-dashboard/specials-management.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Operations Troubleshooting](../08-operations/troubleshooting.md)
- [Changelog](../08-operations/changelog.md)
- [Toast POS Integration Overview](../10-toast-pos-integration/integration-overview.md)
- [Master Documentation Index](../README.md)

---

[Back to Menu Management Overview](README.md)
