# ADMIN DASHBOARD — SPECIALS Management

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Menu item special-related setting implemented; dedicated SPECIALS management and scheduling interface planned

**Feature:** Manager SPECIALS Administration

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Business Objectives](#business-objectives)
3. [Current Implementation](#current-implementation)
4. [Administrative Architecture](#administrative-architecture)
5. [Manager Authorization](#manager-authorization)
6. [SPECIALS Management Dashboard](#specials-management-dashboard)
7. [Menu Item Relationships](#menu-item-relationships)
8. [Creating a Special](#creating-a-special)
9. [Editing a Special](#editing-a-special)
10. [Daily and Weekly Scheduling](#daily-and-weekly-scheduling)
11. [Date Ranges and Time Windows](#date-ranges-and-time-windows)
12. [Pricing and Promotional Rules](#pricing-and-promotional-rules)
13. [Publication and Visibility](#publication-and-visibility)
14. [Public Website Integration](#public-website-integration)
15. [Database and Persistence](#database-and-persistence)
16. [Validation and Conflict Prevention](#validation-and-conflict-prevention)
17. [Security and Privacy](#security-and-privacy)
18. [Error Handling and Recovery](#error-handling-and-recovery)
19. [Manager Operating Procedures](#manager-operating-procedures)
20. [Testing and Verification](#testing-and-verification)
21. [Implementation Roadmap](#implementation-roadmap)
22. [Implementation Status](#implementation-status)
23. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed administrative management interface for restaurant SPECIALS at Fin & Feathers Las Vegas.

The objective is to allow authorized managers to configure promotional menu offerings and control when they appear on the public website.

The document covers:

- SPECIALS administration.
- Menu item selection.
- Promotional descriptions.
- Recurring schedules.
- Date-specific promotions.
- Promotional pricing.
- Publication controls.
- Public website integration.
- Database requirements.
- Authorization.
- Validation.
- Operational testing.

This document is an implementation and operational planning reference.

It does not establish that the complete SPECIALS management module currently exists.

## Business Objectives

The SPECIALS system should allow restaurant managers to promote approved menu offerings without requiring developers to manually change website content.

### Recurring Promotions

Managers should eventually be able to schedule specials for particular days of the week.

### Example

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

### Menu Integration

SPECIALS should maintain a relationship with the restaurant's approved menu catalog.

### Operational Flexibility

Managers should be able to activate, update, suspend, or end promotions.

### Accurate Presentation

The public website should display the correct special for the applicable date and time.

### Pricing Accuracy

Promotional prices must be approved before publication.

### Manager Independence

Routine scheduling changes should be possible through the administrative interface once implemented.

### Consistent Branding

SPECIALS presentation should follow the website's existing visual design.

## Current Implementation

**Status:** Partial foundation implemented

The project includes an administrative menu editor.

### Existing Route

    /admin/menu

### Existing Source

    src/app/admin/menu/page.tsx

### Established Menu Controls

Previously inspected implementation includes a special-related setting associated with menu items.

### Existing Price-Related Setting

A $5 special-related setting has been referenced in the menu administration implementation.

### Important Distinction

An item-level special setting is not equivalent to a complete SPECIALS scheduling system.

### Not Yet Established

The following capabilities have not been verified as implemented:

- Dedicated SPECIALS dashboard.
- Recurring weekday schedules.
- Date-specific activation.
- Automatic scheduled publication.
- Conflict detection.
- SPECIALS preview workflow.
- SPECIALS change history.

### Source Verification

The latest menu editor source must be inspected before defining how existing special-related fields will integrate with the future module.

## Administrative Architecture

The SPECIALS management module is planned as part of the existing Next.js administrative application.

### Application Framework

    Next.js App Router

### Language

    TypeScript

### Styling

    Tailwind CSS

### Authentication

    Supabase Auth

### Database

    Supabase PostgreSQL

### Hosting

    Vercel

### Proposed Architecture

1. Manager opens SPECIALS management.
2. Manager selects an approved menu item.
3. Manager configures promotional information.
4. Manager defines the schedule.
5. Server validates the configuration.
6. Database persists the approved settings.
7. Public website evaluates applicable specials.
8. Visitors see the correct active promotion.

### Integration Boundary

This describes the intended architecture.

The actual future routes, database tables, and rendering strategy require implementation approval.

### Time Zone

Scheduling should use the restaurant's local Las Vegas time zone.

## Manager Authorization

SPECIALS management must be restricted to authorized managers.

### Established Helper

    requireManager()

### Source

    src/lib/auth/require-manager.ts

### Staff Role Source

    staff_roles

### Required Role

    manager

### Active Status

The staff role must be active.

### Protected Operations

Potential protected actions include:

- Create special.
- Edit special.
- Set schedule.
- Change price.
- Publish special.
- Suspend special.
- Delete special.

### Server-Side Enforcement

Every administrative mutation must verify authorization on the server.

### Database Policies

SPECIALS records should have appropriate database access policies.

### Future Roles

More granular publishing permissions may be considered but are not established as implemented.

## SPECIALS Management Dashboard

**Status:** Planned

A dedicated management page may provide a consolidated view of promotions.

### Proposed Dashboard Sections

- Active specials.
- Upcoming specials.
- Recurring specials.
- Inactive specials.
- Expired specials.
- Special editor.

### Summary Information

Each special may display:

- Promotion title.
- Linked menu item.
- Applicable weekday.
- Start date.
- End date.
- Promotional price.
- Publication status.

### Status Indicators

The interface should clearly distinguish scheduled, active, inactive, and expired promotions.

### Manager Actions

Potential actions include:

- Create.
- Edit.
- Preview.
- Activate.
- Deactivate.
- Duplicate configuration.
- Remove.

### Empty State

When no specials are configured, the dashboard should provide a clear empty state.

### Loading State

The interface should distinguish loading from an empty result.

### Error State

Failed data retrieval must not be presented as a successful empty list.

### Mobile Experience

The dashboard should remain usable on mobile devices.

## Menu Item Relationships

SPECIALS should be associated with approved menu items.

### Approved Menu Source

The current restaurant menu is governed by the approved spreadsheet.

### Existing Item Selection

Managers should select an existing eligible menu item where applicable.

### Example Relationship

A Tuesday promotional platter may reference the corresponding approved menu item.

### Category Consistency

SPECIALS must not introduce unauthorized menu categories or subcategories.

### HOOKAH Restriction

Do not introduce a HOOKAH category filter.

### COCKTAIL Image Restriction

Do not introduce menu images for COCKTAILS.

### Item Identity

A stable menu item identifier should be used where supported.

### Item Updates

The system must define how changes to a linked menu item affect an existing special.

### Item Deactivation

The system must define whether specials referencing inactive items remain eligible for publication.

### Item Deletion

Deleting a menu item should not silently leave invalid promotional references.

### Data Integrity

Menu relationships should be validated before a special is saved or published.

## Creating a Special

**Status:** Planned workflow

The proposed creation process should be clear and controlled.

### Step 1 — Open Management

Manager navigates to the future SPECIALS management page.

### Step 2 — Start Creation

Manager selects the create-special action.

### Step 3 — Select Menu Item

Choose an approved existing menu item.

### Step 4 — Enter Title

Enter the approved promotional title.

### Step 5 — Add Description

Provide an accurate promotional description.

### Step 6 — Configure Pricing

Set any approved promotional price or offer rules.

### Step 7 — Define Schedule

Choose recurring weekdays or applicable dates.

### Step 8 — Configure Visibility

Set the appropriate publication state.

### Step 9 — Preview

Review the proposed public presentation.

### Step 10 — Save

Submit the configuration through an authorized server operation.

### Step 11 — Verify

Confirm persistence and the intended schedule.

### Step 12 — Review Public Display

Check the website when the promotion becomes active.

### Implementation Boundary

These are proposed workflow steps, not confirmed existing controls.

## Editing a Special

Managers may need to update promotions after creation.

### Potential Editable Fields

- Title.
- Description.
- Linked menu item.
- Promotional price.
- Weekday schedule.
- Date range.
- Time window.
- Visibility.
- Display order.

### Editing Workflow

1. Locate the intended special.
2. Review the existing configuration.
3. Make approved changes.
4. Validate the schedule.
5. Save.
6. Verify persistence.
7. Check the public website.

### Active Promotion Changes

Editing an active promotion should not create unintended inconsistencies.

### Historical Information

The business should determine whether completed promotions retain their original details.

### Auditability

Significant changes may require a history record.

### Approval

Pricing and promotional terms must follow approved business rules.

## Daily and Weekly Scheduling

Recurring scheduling is a core proposed feature.

### Weekly Recurrence

Managers should be able to assign promotions to approved weekdays.

### Example

    Tuesday — F&F Taco Tuesday Platter

### Day Selection

The interface may allow one or more weekdays per special.

### Local Calendar

Weekday evaluation must use the restaurant's local calendar.

### Time Zone

    America/Los_Angeles

### Daylight Saving Time

The scheduling implementation must account for daylight saving transitions.

### Midnight Boundaries

A promotion should not switch to the next day based on an unrelated server time zone.

### Recurrence Rules

The business must approve whether a special repeats indefinitely or only within a specified date range.

### Multiple Specials

The system must define whether several promotions may be active on the same day.

### Scheduling Approval

Final recurrence rules require business approval.

## Date Ranges and Time Windows

**Status:** Planned

Some promotions may run only during specific dates or hours.

### Start Date

A promotion may have an approved starting date.

### End Date

A promotion may have an approved ending date.

### Open-Ended Schedules

The business must decide whether recurring specials may have no ending date.

### Time Windows

Some promotions may require specific operating hours.

### Example

A promotion may be offered during an approved dinner service period.

### Time Zone

Date and time comparisons should use the restaurant's local time zone.

### Overnight Windows

The system must define how promotions spanning midnight are handled.

### Expiration

Expired promotions should not continue appearing as active.

### Manual Override

Managers may need a way to suspend a promotion before its scheduled end.

### Validation

Start dates, end dates, and time windows must be logically valid.

## Pricing and Promotional Rules

SPECIALS may include approved promotional pricing.

### Standard Price

The linked menu item may have a regular price.

### Promotional Price

The special may have an approved promotional price.

### Price Authority

Restaurant management must approve all promotional prices.

### Existing Special Setting

The current menu editor includes a special-related setting that must be reviewed before integration.

### No Assumed Global Rule

Do not assume every special uses the same discount or price.

### Market Price Items

Market-price items require an approved promotional representation.

### Modifier Charges

The business must determine whether normal modifier charges apply during specials.

### Tax and Service Policies

Promotional messaging must not contradict applicable restaurant policies.

### Existing Service Policy

The restaurant's documented house rules include a 20% service charge for checks over $100 and parties of six or more.

### Price Display

The public website must display promotional pricing accurately.

### Future POS Integration

Toast POS price synchronization requires separate feasibility and mapping work.

## Publication and Visibility

Managers should control whether a configured special is publicly visible.

### Proposed States

- Draft.
- Scheduled.
- Active.
- Paused.
- Expired.

These are conceptual states, not verified database enum values.

### Draft

A draft should not appear publicly.

### Scheduled

A scheduled special becomes eligible for display during its approved window.

### Active

An active special is eligible for public presentation.

### Paused

A paused special should not appear publicly.

### Expired

An expired special should no longer be presented as current.

### Manual Controls

Managers may need activation and deactivation controls.

### Publication Verification

The interface must not report publication success before persistence succeeds.

### Cache Considerations

The public website may require an approved cache or revalidation strategy.

### Scheduling Consistency

Publication state and schedule rules must be evaluated together.

## Public Website Integration

The public website is expected to display current approved specials.

### Website Placement

The exact presentation location and component architecture require implementation review.

### Promotional Content

A public special may include:

- Title.
- Menu item.
- Description.
- Promotional price.
- Applicable day.
- Approved image.

### Image Reuse

Where appropriate, the special may reuse the linked menu item's approved image.

### No COCKTAIL Images

The COCKTAIL image restriction remains applicable.

### Mobile-First Presentation

SPECIALS should display correctly on mobile screens.

### Expired Promotions

Expired promotions must not be presented as current.

### Empty State

When no special is active, the website should use an approved fallback.

### Performance

Scheduling checks should avoid unnecessary public page delays.

### Accessibility

Promotional content should remain readable and accessible.

### Verification

Public rendering must be tested against the configured restaurant-local schedule.

## Database and Persistence

**Status:** Design and schema approval required

Supabase PostgreSQL is the project's database platform.

### Proposed Data Requirements

A future SPECIALS record may contain:

- Special identifier.
- Linked menu item identifier.
- Title.
- Description.
- Promotional price.
- Recurrence configuration.
- Start date.
- End date.
- Time window.
- Publication state.
- Display order.
- Creation timestamp.
- Update timestamp.

These are conceptual fields, not verified existing columns.

### Menu Relationship

The data model should preserve a valid relationship to approved menu items.

### Recurrence Storage

The project must choose an appropriate representation for weekday scheduling.

### Time Zone

Time zone handling must be explicit.

### Access Policies

Only authorized users should create or modify specials.

### Public Reads

Public website access should be limited to appropriate published information.

### Audit History

A change history may be required.

### Schema Verification

Actual tables and columns must be confirmed before implementation.

## Validation and Conflict Prevention

The SPECIALS editor must validate promotional configurations.

### Required Fields

Required title, menu item, and scheduling information should be validated.

### Menu Item Validity

The linked menu item must exist and be eligible.

### Price Validity

Promotional prices must follow approved rules.

### Date Range

The ending date must not precede the starting date.

### Time Window

Time ranges must be valid.

### Weekday Selection

Recurring promotions must have appropriate weekday rules.

### Overlapping Promotions

The business must decide whether multiple specials may overlap.

### Duplicate Scheduling

Accidental duplicate schedules should be prevented where appropriate.

### Inactive Menu Items

The system must define how specials behave when linked items become inactive.

### Server Validation

Validation must be enforced on the server.

### Consistency

Failed operations must not leave incomplete or contradictory schedule records.

## Security and Privacy

SPECIALS management is an administrative capability.

### Authentication

Require a valid Supabase session.

### Authorization

Require the active manager role.

### Server-Side Protection

Protect all administrative reads and mutations.

### Database Policies

Apply appropriate access policies to SPECIALS records.

### Input Validation

Treat browser input as untrusted.

### Media Security

Any image uploads must use approved storage and validation procedures.

### Credentials

Never expose private service credentials.

### Auditability

Significant promotional changes may require audit records.

### Public Data

Only approved published information should be exposed publicly.

### Least Privilege

Future staff permission expansion should restrict publishing rights appropriately.

## Error Handling and Recovery

### Failed Load

Display a retrieval error rather than an empty successful state.

### Failed Save

Do not report success if persistence fails.

### Invalid Schedule

Reject logically invalid dates or times.

### Missing Menu Item

Prevent publication of a special with an invalid menu reference.

### Duplicate Schedule

Warn about conflicting or duplicate configurations where required.

### Time Zone Error

Avoid publishing the wrong day's promotion.

### Image Failure

Use approved fallback behavior.

### Publication Failure

Keep the public website consistent with the actual saved state.

### Concurrent Changes

Consider conflicting edits by multiple managers.

### Manual Recovery

Provide a way to disable an incorrect promotion.

### Escalation

Unresolved problems should be referred to the technical maintainer.

## Manager Operating Procedures

### Creating a Recurring Special

1. Open the approved SPECIALS management interface.
2. Select the eligible menu item.
3. Enter the approved promotion title.
4. Configure promotional pricing.
5. Choose applicable weekdays.
6. Set any date restrictions.
7. Review the configuration.
8. Save.
9. Verify the schedule.
10. Confirm public display when active.

### Editing an Existing Special

1. Locate the correct promotion.
2. Review the existing schedule.
3. Make approved changes.
4. Validate pricing and dates.
5. Save.
6. Verify persistence.
7. Review public presentation.

### Suspending a Special

1. Identify the promotion.
2. Confirm the suspension decision.
3. Change the approved visibility state.
4. Save.
5. Verify that the public website no longer presents it as active.

### Ending a Promotion

1. Review the current schedule.
2. Set the approved ending date or deactivate the promotion.
3. Save.
4. Verify the result.

### Correcting an Incorrect Promotion

1. Disable the affected promotion if necessary.
2. Review the underlying configuration.
3. Correct the data.
4. Save.
5. Verify public presentation.
6. Document the issue appropriately.

### Current Operational Boundary

Until the dedicated module is implemented, these steps describe the intended future workflow rather than an available set of controls.

## Testing and Verification

### Authorization

- Valid active manager.
- Unauthenticated user.
- Inactive manager.
- Unauthorized role.
- Direct route access.
- Unauthorized mutation attempt.

### Creation

- Create valid special.
- Reject missing required fields.
- Reject invalid menu item.
- Reject invalid price.
- Reject invalid schedule.

### Editing

- Update title.
- Update description.
- Update linked item.
- Update price.
- Update recurrence.
- Update visibility.

### Scheduling

- Correct weekday selection.
- Correct local date.
- Correct local time.
- Start date enforcement.
- End date enforcement.
- Midnight boundary.
- Daylight saving transitions.

### Publication

- Draft hidden.
- Scheduled promotion activates correctly.
- Paused promotion hidden.
- Expired promotion hidden.
- Manual deactivation reflected publicly.

### Data Integrity

- Valid menu relationships.
- No unintended duplicate records.
- Consistent status.
- Correct saved values.
- Appropriate database policies.

### Public Website

- Correct title.
- Correct price.
- Correct image.
- Correct active day.
- Correct mobile layout.
- Approved empty state.

### Failure Handling

- Database failure.
- Network interruption.
- Invalid input.
- Concurrent edit.
- Incorrect time zone.
- Publication mismatch.

## Implementation Roadmap

### Stage 1 — Inspect Existing Menu Controls

Review the current special-related menu fields and their behavior.

### Stage 2 — Approve Business Rules

Confirm:

- Eligible menu items.
- Promotional price rules.
- Recurring weekday behavior.
- Date range behavior.
- Multiple active specials.
- Manual override rules.

### Stage 3 — Design Data Model

Define approved SPECIALS tables, relationships, and constraints.

### Stage 4 — Implement Protected Management

Build the manager-only SPECIALS interface.

### Stage 5 — Implement Scheduling

Add weekday recurrence, date ranges, and local time evaluation.

### Stage 6 — Integrate Public Display

Connect approved active specials to the public website.

### Stage 7 — Test

Verify authorization, scheduling, publication, and failure recovery.

### Stage 8 — Operational Handoff

Provide manager instructions and approved testing procedures.

### Scheduling

This sequence is proposed and does not establish a committed delivery date.

## Implementation Status

| Capability | Status |
|---|---|
| Existing admin dashboard | Implemented |
| Manager authentication | Implemented |
| Active manager authorization | Implemented |
| Menu administration route | Implemented |
| Menu item special-related setting | Implemented |
| Existing special setting source review | Verification pending |
| Dedicated SPECIALS dashboard | Planned |
| Special creation and editing | Planned |
| Recurring weekday scheduling | Planned |
| Date range scheduling | Planned |
| Time-window scheduling | Under Evaluation |
| Promotional pricing rules | Pending Approval |
| Conflict detection | Planned |
| Publication controls | Planned |
| Public scheduled SPECIALS integration | Planned |
| SPECIALS database schema | Design pending |
| Administrative change history | Under Evaluation |
| End-to-end scheduling tests | Pending implementation |
| Manager operational training | Planned |

## Related Documentation

- [Admin Dashboard Overview](README.md)
- [Dashboard Overview](dashboard-overview.md)
- [Manager Permissions](manager-permissions.md)
- [Menu Management](menu-management.md)
- [Website SPECIALS Overview](../02-website/specials/README.md)
- [SPECIALS Program Overview](../02-website/specials/specials-overview.md)
- [SPECIALS Scheduling](../02-website/specials/scheduling.md)
- [Website SPECIALS Administration](../02-website/specials/admin-management.md)
- [Menu Management Overview](../09-menu-management/README.md)
- [Menu SPECIALS Management](../09-menu-management/specials-management.md)
- [Database Overview](../06-database/README.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Master Documentation Index](../README.md)

---

[Back to Admin Dashboard Overview](README.md)
