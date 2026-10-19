# SPECIALS — Admin Management

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Planned; administrative feature not yet implemented

**Feature:** SPECIALS Manager Administration

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Administrative Objectives](#administrative-objectives)
3. [Current Administrative Foundation](#current-administrative-foundation)
4. [Proposed Manager Interface](#proposed-manager-interface)
5. [SPECIALS List and Dashboard](#specials-list-and-dashboard)
6. [Creating a Special](#creating-a-special)
7. [Editing a Special](#editing-a-special)
8. [Menu Item Association](#menu-item-association)
9. [Promotional Pricing](#promotional-pricing)
10. [Scheduling Controls](#scheduling-controls)
11. [Approval and Publication](#approval-and-publication)
12. [Disabling and Archiving](#disabling-and-archiving)
13. [Preview and Public Verification](#preview-and-public-verification)
14. [Authorization and Security](#authorization-and-security)
15. [Database and Storage](#database-and-storage)
16. [Operational Workflows](#operational-workflows)
17. [Error Handling and Recovery](#error-handling-and-recovery)
18. [Testing and Verification](#testing-and-verification)
19. [Implementation Status](#implementation-status)
20. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed
administrative interface for managing
restaurant SPECIALS.

The interface is intended to allow
authorized managers to maintain
approved promotional offerings
without requiring routine
developer intervention.

This document describes planned
functionality and does not establish
that a dedicated SPECIALS
administration page already exists.

## Administrative Objectives

The proposed interface should:

- Simplify promotional management.
- Reuse existing menu information.
- Protect regular menu prices.
- Support recurring schedules.
- Prevent invalid publication.
- Provide clear status information.
- Allow operational overrides.
- Maintain consistent public content.
- Enforce manager authorization.
- Support mobile and desktop use.

### Business Approval

Promotional offers, prices,
eligibility rules, and publication
authority must be approved
by restaurant ownership.

## Current Administrative Foundation

The website has an existing
manager dashboard.

Established route:

    /admin

Existing menu management route:

    /admin/menu

Existing authorization helper:

    src/lib/auth/require-manager.ts

### Existing Menu Management

The menu editor supports
administration of existing
menu items.

The menu data model includes:

    is_five_dollar_special

This field is separate
from the proposed
SPECIALS management system.

### Not Yet Implemented

A dedicated SPECIALS interface
has not been established
as operational.

The following remain planned:

- SPECIALS records.
- Scheduling controls.
- Approval workflow.
- Automatic availability.
- Conflict warnings.
- Special-specific pricing.
- Dedicated promotional reporting.

## Proposed Manager Interface

**Status:** Planned

The manager dashboard may
eventually include a
SPECIALS management entry.

### Potential Navigation

A future interface may contain:

- Specials Overview.
- All Specials.
- Create Special.
- Scheduled Specials.
- Active Specials.
- Archived Specials.

These are conceptual navigation
areas, not confirmed routes.

### Interface Principles

The interface should be:

- Clear.
- Responsive.
- Accessible.
- Consistent with existing admin styling.
- Designed for routine staff use.

### Implementation Requirement

Existing dashboard functionality
must remain intact when
SPECIALS management is added.

## SPECIALS List and Dashboard

**Status:** Planned

The primary manager view
may display promotional records.

### Potential Columns

- Special title.
- Linked menu item.
- Promotional price.
- Recurrence.
- Schedule.
- Publication status.
- Current availability.
- Last updated.

### Filtering

Potential filters include:

- Draft.
- Scheduled.
- Currently active.
- Expired.
- Disabled.
- Archived.

### Searching

Managers may search by
special title or
associated menu item.

### Sorting

Potential sorting options include:

- Name.
- Start date.
- End date.
- Status.
- Last updated.

### Availability Accuracy

Current availability must
be calculated from approved
scheduling rules.

A stored publication status
must not be confused with
real-time availability.

## Creating a Special

**Status:** Planned

Managers may eventually
create promotional records
through a dedicated form.

### Proposed Workflow

1. Open SPECIALS management.
2. Select Create Special.
3. Select an existing menu item.
4. Enter the promotional title.
5. Enter an approved description.
6. Configure promotional pricing.
7. Select scheduling options.
8. Configure publication settings.
9. Review validation messages.
10. Preview the special.
11. Obtain required approval.
12. Save or publish.

### Potential Form Fields

- Linked menu item.
- Special title.
- Description.
- Promotional price.
- Recurrence type.
- Selected weekdays.
- Start date.
- End date.
- Start time.
- End time.
- Publication status.
- Optional approved image.

### Validation

The form should reject:

- Missing required information.
- Invalid prices.
- Invalid date ranges.
- Unsupported recurrence settings.
- Invalid menu references.
- Unauthorized publication.

### Draft Saving

Managers may need to save
incomplete promotions as drafts.

The final draft rules
require approval.

## Editing a Special

**Status:** Planned

Managers may eventually
edit existing promotional records.

### Editable Information

Potential changes include:

- Title.
- Description.
- Promotional price.
- Linked menu item.
- Recurrence.
- Dates.
- Time windows.
- Publication status.

### Active Promotion Changes

The system must define
whether changes to active
specials take effect immediately
or require renewed approval.

### Validation

Edits must pass the same
business and security checks
as new records.

### Update Feedback

Managers should receive
clear confirmation only
after the update succeeds.

### Change History

The project should evaluate
recording important changes
to published promotions.

## Menu Item Association

**Status:** Planned

SPECIALS should support
relationships with existing
restaurant menu items.

### Menu Selection

Managers may choose
an eligible menu item
from the established menu data.

### Reused Information

The interface may reuse:

- Menu item name.
- Description.
- Standard price.
- Category.
- Food image.
- Availability status.

### Special Overrides

Approved promotional details
may override selected display
fields without permanently
changing the menu record.

### Inactive Menu Items

The system must define
whether inactive menu items
can remain linked to
published specials.

### Deleted Menu Items

Database relationships
must prevent invalid
or orphaned promotional records.

### Category Consistency

Only approved menu categories
and subcategories should be used.

Do not introduce
a HOOKAH category filter.

COCKTAILS must follow
the established no-image rule.

## Promotional Pricing

**Status:** Planned

The manager interface should
clearly distinguish regular
menu prices from
promotional prices.

### Standard Price

The standard menu price
should be displayed
as a reference.

### Special Price

The promotional price
must be entered according
to approved business rules.

### Pricing Validation

The system should reject
invalid or unsupported values.

### Market-Priced Items

Items marked MKT
require explicit
pricing decisions.

The interface must not
invent a regular price.

### Modifier Pricing

Applicable add-ons and modifiers
must be considered when
presenting promotional prices.

### Expiration Behavior

Ending a special must not
change the original
menu item's standard price.

### Toast Consistency

A website special does not
automatically establish
a matching Toast checkout price.

Any ordering integration
requires separate verification.

## Scheduling Controls

**Status:** Planned

Managers should be able
to configure approved
availability rules.

### Recurrence Type

Potential choices include:

- One-time.
- Weekly recurring.
- Limited date range.

### Weekday Selection

Recurring promotions may
support one or more weekdays.

### Date Range

Managers may specify
start and end dates.

### Time Window

Optional start and end
times may be supported.

### Restaurant Time Zone

Scheduling should use:

    America/Los_Angeles

### Scheduling Validation

The interface must identify:

- Invalid date ranges.
- Invalid time windows.
- Unsupported recurrence settings.
- Missing required weekdays.
- Potential conflicts.

### Schedule Preview

A future preview may show
the next eligible occurrences.

### Overnight Scheduling

Support for windows crossing
midnight requires a
separate approved specification.

## Approval and Publication

**Status:** Planned; business rules pending

Publication should follow
approved restaurant procedures.

### Proposed Publication States

- Draft.
- Approved.
- Scheduled.
- Disabled.
- Archived.

Time-based availability
may be calculated separately.

### Approval Authority

Ownership must determine
whether managers can
publish directly or
require additional approval.

### Publication Checks

Before publication,
the system should verify:

1. Required information.
2. Approved promotional pricing.
3. Valid menu relationship.
4. Valid schedule.
5. Conflict handling.
6. Publication authorization.

### Scheduled Publication

An approved future special
should become eligible
according to its schedule.

### Publication Feedback

The interface should distinguish
between successfully saving
a record and the special
actually becoming public.

## Disabling and Archiving

**Status:** Planned

Managers may need to
remove specials from
public availability.

### Disable

Disabling a special should
prevent it from appearing
as currently available.

### Archive

Archiving may preserve
historical records while
removing them from
routine management views.

### Delete

Whether permanent deletion
is allowed requires approval.

### Operational Override

Managers may need to
disable a special because of:

- Item unavailability.
- Pricing error.
- Restaurant closure.
- Promotional cancellation.
- Operational changes.

### Auditability

Important disable,
archive, and delete actions
should be traceable
where supported.

## Preview and Public Verification

**Status:** Planned

The administrative interface
may provide a preview
before publication.

### Preview Content

A preview may display:

- Special title.
- Menu item.
- Description.
- Promotional price.
- Availability.
- Image.
- Restrictions.

### Preview Limitations

A preview does not prove
that a special has been
successfully published.

### Public Verification

After publication,
managers should confirm
that the public website
shows the correct information.

### Device Testing

Verification should include
mobile and desktop layouts.

### Schedule Verification

Managers should verify
that the special appears
during approved periods
and is not presented
as active outside them.

## Authorization and Security

All administrative actions
must be protected.

### Existing Authorization

The project uses Supabase Auth
and the `staff_roles` table.

Existing helper:

    src/lib/auth/require-manager.ts

### Manager Requirements

The existing helper requires:

    role = manager

and:

    is_active = true

### Server-Side Enforcement

Protected reads and writes
must verify authorization
on the server.

### Database Security

New promotional tables
must use appropriate
access policies.

### Input Validation

Validate all submitted
prices, dates, times,
identifiers, and states.

### Sensitive Credentials

Private service credentials
must remain outside
client-side application code
and Git history.

### Least Privilege

Managers should receive
only approved capabilities.

## Database and Storage

**Status:** Planned; schema pending

The project uses Supabase.

### Potential SPECIALS Records

A future data model
may store:

- Special ID.
- Menu item reference.
- Promotional content.
- Promotional price.
- Scheduling configuration.
- Publication status.
- Created timestamp.
- Updated timestamp.

These are proposed fields,
not verified existing columns.

### Data Relationships

Menu item references
must be validated.

### Public Access

Public queries should expose
only approved promotional
information.

### Administrative Access

Writes must be restricted
to authorized managers.

### Image Storage

The website uses the
Supabase Storage bucket:

    website-media

Future promotional images
may reuse existing
approved menu images.

Additional storage paths
must be designed before use.

### Image Rules

Food images should follow
the established menu
presentation requirements.

COCKTAILS should not
receive menu item images.

## Operational Workflows

The system should support
repeatable staff procedures.

### Weekly Promotion Setup

1. Select the menu item.
2. Confirm the approved offer.
3. Enter promotional pricing.
4. Select recurrence weekdays.
5. Configure dates and hours.
6. Review potential conflicts.
7. Obtain approval.
8. Publish.
9. Verify public presentation.

### Same-Day Correction

1. Open the affected special.
2. Review the incorrect information.
3. Confirm the approved correction.
4. Save the change.
5. Verify the public result.
6. Record the correction
   where audit support exists.

### Promotion Cancellation

1. Locate the promotion.
2. Confirm cancellation authority.
3. Disable the special.
4. Verify public removal.
5. Communicate operational changes
   through approved channels.

### Promotion Renewal

1. Review the previous special.
2. Confirm current business approval.
3. Update pricing if necessary.
4. Configure the new schedule.
5. Verify eligibility.
6. Publish.

## Error Handling and Recovery

The interface should provide
clear and safe error handling.

### Validation Errors

Explain which fields
require correction.

### Authorization Errors

Deny unauthorized operations
without exposing sensitive
internal information.

### Database Errors

Do not report success
when a save fails.

### Scheduling Errors

Identify invalid
or unsupported schedules.

### Conflict Errors

Explain conflicts according
to approved precedence rules.

### Integration Failures

If future Toast integration
fails, do not promise
unsupported checkout pricing.

### Recovery Procedures

Managers should have
a documented way to:

- Retry failed operations.
- Correct invalid records.
- Disable incorrect specials.
- Escalate technical problems.
- Verify successful recovery.

## Testing and Verification

### Manager Access

- Verify unauthenticated users are denied.
- Verify unauthorized roles are denied.
- Verify inactive managers are denied.
- Verify active managers can access
  approved features.

### Create and Edit

- Create a valid special.
- Reject invalid data.
- Edit an existing special.
- Verify save confirmation.
- Verify failed save handling.

### Menu Integration

- Verify menu item selection.
- Verify linked item information.
- Verify inactive item behavior.
- Verify regular price protection.
- Verify image rules.

### Scheduling

- Test one-time specials.
- Test recurring weekdays.
- Test date ranges.
- Test time windows.
- Test daylight saving transitions.
- Test schedule conflicts.

### Publication

- Verify drafts remain private.
- Verify approved future specials.
- Verify currently active specials.
- Verify disabled specials.
- Verify expired specials.
- Verify archive behavior.

### Public Presentation

- Verify promotional titles.
- Verify approved prices.
- Verify correct availability.
- Verify mobile layout.
- Verify desktop layout.
- Verify accessibility.

### Security

- Verify server-side authorization.
- Verify database access policies.
- Verify input validation.
- Verify sensitive data handling.
- Verify audit behavior if implemented.

## Implementation Status

| Capability | Status |
|---|---|
| Existing manager authentication | Implemented |
| Existing admin dashboard | Implemented |
| Existing menu editor | Implemented |
| Existing $5 special flag | Implemented |
| Dedicated SPECIALS admin interface | Planned |
| Specials list and filters | Planned |
| Create and edit specials | Planned |
| Menu item association | Planned |
| Promotional pricing controls | Planned |
| Recurring scheduling controls | Planned |
| Schedule conflict warnings | Under Evaluation |
| Approval workflow | Requirements pending |
| Draft and publication states | Planned |
| Disable and archive controls | Planned |
| Public preview | Planned |
| SPECIALS database schema | Planned |
| Audit history | Under Evaluation |
| Toast promotion integration | Under Evaluation |
| End-to-end admin testing | Pending implementation |

## Related Documentation

- [SPECIALS Overview](README.md)
- [System Overview](specials-overview.md)
- [Scheduling](scheduling.md)
- [Website Overview](../README.md)
- [Menu System](../menu-system.md)
- [F&F FAM CLUB](../ff-fam-club/README.md)
- [Admin Dashboard](../../04-admin-dashboard/README.md)
- [SPECIALS Admin Category](../../04-admin-dashboard/specials-management.md)
- [Manager Permissions](../../04-admin-dashboard/manager-permissions.md)
- [Menu Management](../../09-menu-management/README.md)
- [Database & Storage](../../06-database/README.md)
- [Toast POS Integration](../../10-toast-pos-integration/README.md)
- [Master Documentation Index](../../README.md)

---

[Back to SPECIALS Overview](README.md)
