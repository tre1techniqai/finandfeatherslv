# SPECIALS — Scheduling

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Planned; scheduling engine not yet implemented

**Feature:** SPECIALS Scheduling

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Scheduling Objectives](#scheduling-objectives)
3. [Current Implementation](#current-implementation)
4. [Scheduling Model](#scheduling-model)
5. [One-Time Specials](#one-time-specials)
6. [Weekly Recurring Specials](#weekly-recurring-specials)
7. [Date-Range Scheduling](#date-range-scheduling)
8. [Time-Window Scheduling](#time-window-scheduling)
9. [Restaurant Time Zone](#restaurant-time-zone)
10. [Publication and Availability States](#publication-and-availability-states)
11. [Eligibility Evaluation](#eligibility-evaluation)
12. [Schedule Conflicts](#schedule-conflicts)
13. [Manager Scheduling Workflow](#manager-scheduling-workflow)
14. [Database and Technical Design](#database-and-technical-design)
15. [Public Website Behavior](#public-website-behavior)
16. [Operational Exceptions](#operational-exceptions)
17. [Testing and Verification](#testing-and-verification)
18. [Implementation Status](#implementation-status)
19. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed
scheduling requirements for the
Fin & Feathers Las Vegas
SPECIALS system.

The scheduling system is intended
to control when approved
promotional offerings become
available on the website.

It covers:

- One-time promotions.
- Weekly recurring specials.
- Start and end dates.
- Daily time windows.
- Restaurant-local time.
- Publication states.
- Automatic visibility.
- Scheduling conflicts.
- Administrative controls.
- Testing requirements.

This document describes
planned functionality.

It does not represent an
existing production scheduling
engine.

## Scheduling Objectives

The SPECIALS scheduling system
should allow authorized managers
to configure promotional
availability without requiring
routine source-code changes.

### Primary Objectives

- Support weekday specials.
- Support one-time promotions.
- Support date-limited campaigns.
- Support optional daily hours.
- Automatically determine availability.
- Prevent expired promotions
  from appearing as active.
- Preserve standard menu pricing.
- Allow authorized manual disabling.
- Provide predictable behavior
  across mobile and desktop.

### Business Accuracy

A special must not appear
as currently available
when its approved schedule
does not permit it.

### Operational Reliability

Availability should be
determined using trusted
application logic rather than
the customer's device clock.

## Current Implementation

The website has an established
menu management interface.

Administrative route:

    /admin/menu

The existing menu data model
includes:

    is_five_dollar_special

This flag is separate from
the proposed SPECIALS
scheduling system.

### Not Yet Established

The current project has not
established a verified
production implementation for:

- Recurring weekday schedules.
- Promotional date ranges.
- Time-window eligibility.
- Automatic daily activation.
- Schedule conflict detection.
- Scheduled publication controls.

These features remain planned.

### Implementation Prerequisite

The existing menu schema
and manager interface
must be inspected before
scheduling development begins.

## Scheduling Model

**Status:** Proposed

Each special may have
a scheduling configuration.

### Core Scheduling Dimensions

A configuration may include:

- Publication status.
- Recurrence type.
- Selected weekdays.
- Start date.
- End date.
- Start time.
- End time.
- Restaurant time zone.
- Manual availability override.

### Schedule Independence

A special's schedule
should be separate from
the standard menu item's
normal availability.

### Menu Relationship

The scheduling record
may reference an existing
menu item.

The exact relationship
requires database design.

### Optional Scheduling Fields

Some promotions may need
only a date.

Others may need a weekday,
date range, and time window.

The final form must define
which combinations are valid.

## One-Time Specials

**Status:** Planned

A one-time special is
available on a specific
approved date or during
a defined date interval.

### Example

    Promotion: One-Day Special
    Date: To be approved
    Time: To be approved
    Price: To be approved

This is a conceptual example,
not an active promotion.

### Required Behavior

The system should:

1. Identify the approved date.
2. Evaluate the current
   restaurant-local date.
3. Check optional time restrictions.
4. Verify publication approval.
5. Determine current eligibility.

### Expiration

After the approved window,
the special must no longer
appear as currently available.

### Reuse

Managers may need the ability
to duplicate a previous
promotion for a new date.

This capability requires
separate approval.

## Weekly Recurring Specials

**Status:** Planned

Weekly recurrence is a
primary business requirement.

### Weekday Selection

Managers may select
one or more weekdays.

Supported weekday choices
may include:

- Monday.
- Tuesday.
- Wednesday.
- Thursday.
- Friday.
- Saturday.
- Sunday.

### Example

    Promotion: F&F Taco Tuesday Platter
    Recurrence: Weekly
    Weekday: Tuesday
    Promotional Price: To be approved

This example illustrates
the intended scheduling
behavior.

It does not establish
an approved active special.

### Multiple Weekdays

The system may permit
one promotion to run
on several weekdays.

### Recurrence Duration

A recurring promotion
may have:

- A defined start date.
- A defined end date.
- An approved ongoing duration.

Whether open-ended
recurrence is permitted
requires a business decision.

### Recurrence Calculation

Eligibility must be based
on the current weekday
in the restaurant's
local time zone.

### Recurrence Exceptions

The system should evaluate
support for skipping
specific dates.

For example:

- Holidays.
- Private events.
- Temporary closures.
- Special operating schedules.

Exception handling is
not yet approved.

## Date-Range Scheduling

**Status:** Planned

A special may be valid
only within an approved
date range.

### Start Date

The earliest calendar date
on which the promotion
may become eligible.

### End Date

The final calendar date
on which the promotion
may become eligible.

### Inclusive Dates

The proposed interpretation
is that start and end
calendar dates are inclusive.

This must be confirmed
before implementation.

### Validation

The system must reject
an end date that occurs
before the start date.

### Recurring Date Ranges

A weekly promotion may
run only on selected
weekdays within a
specified date range.

### Expired Date Ranges

Promotions must stop
appearing as currently
available after the
approved end date.

## Time-Window Scheduling

**Status:** Planned

Specials may have
daily availability hours.

### Start Time

The earliest local time
at which the promotion
becomes eligible.

### End Time

The local time at which
the promotion stops
being eligible.

### Proposed Boundary Rule

A time window should
use a consistent rule.

For example:

- Start time is inclusive.
- End time is exclusive.

The exact rule must
be approved and tested.

### No Time Restriction

If no time window
is configured, a special
may be eligible throughout
the approved local date,
subject to restaurant
operating rules.

### Overnight Windows

A time window may
cross midnight.

For example:

    Start: 9:00 PM
    End: 1:00 AM

The system must define
whether such schedules
are supported.

Overnight behavior must
not be assumed without
an approved specification.

### Restaurant Hours

Scheduling should not
automatically imply
that the restaurant is open.

Coordination with approved
operating hours requires
a separate design decision.

## Restaurant Time Zone

The restaurant operates
in Las Vegas, Nevada.

### Required Time Zone

The proposed scheduling
implementation should use
the IANA time-zone identifier:

    America/Los_Angeles

### Why Time Zone Matters

Customer devices may
be located outside Nevada.

The current local date
and weekday on a visitor's
device may differ from
the restaurant's date.

### Daylight Saving Time

The scheduling system
must account for
daylight saving transitions.

### Date and Time Storage

The implementation must
define how to store:

- Local calendar dates.
- Local recurring weekdays.
- Local time-of-day values.
- Absolute timestamps
  where required.

### Avoiding Fixed Offsets

A fixed UTC offset
must not be treated
as equivalent to the
restaurant's time zone
throughout the year.

### Verification

Test schedules around
both daylight saving
transitions.

## Publication and Availability States

**Status:** Proposed

A future system may
distinguish administrative
publication status from
time-based availability.

### Draft

A promotion is being
prepared and is not
publicly available.

### Approved

A promotion has received
the required business approval.

### Scheduled

An approved promotion
has a future eligible window.

### Active

An approved promotion
is currently eligible
for public presentation.

### Expired

The approved schedule
has ended.

### Disabled

A manager has intentionally
disabled the promotion.

### Important Design Distinction

A stored publication status
and a calculated availability
state may be different.

For example, a promotion
may remain approved while
temporarily outside its
daily time window.

### Final State Model

The database representation
and transition rules
require technical approval.

## Eligibility Evaluation

**Status:** Planned

Eligibility evaluation
determines whether a
special should appear
as currently available.

### Proposed Evaluation Sequence

1. Confirm the promotion exists.
2. Confirm it is approved.
3. Confirm it is not disabled.
4. Confirm its linked menu item
   is eligible, if applicable.
5. Resolve current restaurant
   date and time.
6. Evaluate the date range.
7. Evaluate selected weekdays.
8. Evaluate the daily time window.
9. Apply approved exceptions.
10. Return the availability result.

### Server-Side Evaluation

The application should
evaluate public availability
using trusted server-side
or database-side logic.

### Device Independence

Customer device clocks
must not control whether
a promotion is eligible.

### Consistency

The same eligibility rules
should be used for:

- Homepage specials.
- Dedicated SPECIALS views.
- Menu promotional labels.
- Administrative previews,
  where appropriate.

### Revalidation

The application must
define how displayed
specials update when
a schedule boundary passes.

Potential approaches include
server refreshes, controlled
revalidation, or other
approved mechanisms.

### Caching

Caching must not cause
expired specials to
remain incorrectly active.

## Schedule Conflicts

**Status:** Requirements pending

Two or more promotions
may overlap.

### Potential Conflict Types

- Multiple specials for
  the same menu item.
- Different promotional prices
  during the same period.
- Overlapping date ranges.
- Overlapping time windows.
- Conflicting member eligibility.
- Conflicting publication states.

### Business Decisions

Ownership must determine:

- Whether overlapping specials
  are permitted.
- Whether one promotion
  takes precedence.
- Whether the lowest price
  should be displayed.
- Whether promotions
  may be combined.
- Whether conflicts
  should block publication.

### Administrative Warnings

The future interface
should identify conflicts
before publication.

### Pricing Protection

The system must not
silently select a
promotional price without
an approved precedence rule.

## Manager Scheduling Workflow

**Status:** Planned

Authorized managers may
eventually configure schedules
through the admin dashboard.

### Proposed Workflow

1. Open SPECIALS management.
2. Create or select a special.
3. Associate an approved menu item.
4. Enter promotional details.
5. Enter approved pricing.
6. Select recurrence type.
7. Select weekdays, if applicable.
8. Set start and end dates.
9. Set daily time windows,
   if applicable.
10. Review schedule conflicts.
11. Preview customer presentation.
12. Obtain required approval.
13. Save and publish.
14. Verify public availability.

### Manager Authorization

The existing helper is:

    src/lib/auth/require-manager.ts

Protected scheduling actions
must enforce authorization
on the server.

### Editing Active Specials

The system must define
whether changes take
effect immediately or
require renewed approval.

### Disabling a Special

Managers should be able
to disable an approved
promotion when operationally
necessary.

### Audit History

Recording important
schedule changes should
be evaluated.

## Database and Technical Design

**Status:** Planned; schema pending

The project uses Supabase.

### Potential Scheduling Fields

- Special identifier.
- Publication status.
- Recurrence type.
- Weekday selection.
- Start date.
- End date.
- Start time.
- End time.
- Time-zone identifier.
- Disabled flag.
- Created timestamp.
- Updated timestamp.

These are conceptual fields.

They are not confirmed
existing database columns.

### Database Constraints

The schema should enforce
valid scheduling data
where practical.

### Access Policies

Public users should not
be able to modify
scheduling records.

### Manager Operations

Only authorized staff
should create or
modify schedules.

### Query Design

Public queries should
return only information
appropriate for visitors.

### Scheduled Jobs

A scheduled background job
may not be necessary
if eligibility is calculated
when data is requested.

Whether background jobs
are required depends
on the final architecture.

### Reliability

The design should consider:

- Time-zone correctness.
- Concurrent updates.
- Caching.
- Database failures.
- Application deployments.
- Schedule-boundary transitions.

## Public Website Behavior

**Status:** Planned

The website may present
scheduled specials in
several contexts.

### Today's Specials

Show approved promotions
currently eligible
on the restaurant's
local date and time.

### Weekly Specials

A weekly view may
display future scheduled
weekday promotions.

### Upcoming Specials

The website may identify
approved future promotions.

### Expired Specials

Expired promotions
must not be labeled
as currently available.

### Disabled Specials

Disabled promotions
should not appear
as active offerings.

### Pricing

Promotional prices
must match approved
business rules.

### Responsive Design

Presentation must follow
the website's mobile-first
design system.

### Accessibility

Availability messaging
must remain readable
and accessible.

## Operational Exceptions

The scheduling system
should consider situations
outside normal operation.

### Restaurant Closure

An otherwise eligible
special may need to be
suppressed during
an unexpected closure.

### Menu Item Unavailability

A special linked to
an unavailable menu item
may need to be hidden.

### Early Termination

A manager may need
to stop a promotion
before its planned end.

### Holiday Overrides

Certain dates may require
special availability rules.

### Provider Outages

If future integrations
fail, the website must
not promise unsupported
checkout pricing.

### Recovery

The system should
provide a predictable
way to restore correct
availability after
an operational issue.

## Testing and Verification

### Weekday Recurrence

- Test Monday through Sunday.
- Test single weekday selection.
- Test multiple weekday selection.
- Test weekly recurrence.
- Test recurrence expiration.

### Date Boundaries

- Test before start date.
- Test on start date.
- Test on end date.
- Test after end date.
- Test invalid date ranges.

### Time Boundaries

- Test before start time.
- Test exactly at start time.
- Test during the window.
- Test exactly at end time.
- Test after end time.
- Test missing time restrictions.

### Time Zones

- Test restaurant-local dates.
- Test visitors in other zones.
- Test daylight saving transitions.
- Test server time differences.
- Test weekday boundaries.

### Publication States

- Test draft specials.
- Test scheduled specials.
- Test approved specials.
- Test disabled specials.
- Test expired specials.

### Conflicts

- Test overlapping promotions.
- Test competing prices.
- Test same-item conflicts.
- Test invalid recurrence rules.

### Administrative Security

- Test unauthenticated access.
- Test unauthorized roles.
- Test inactive managers.
- Test authorized managers.
- Test invalid submissions.

### Public Presentation

- Verify correct specials appear.
- Verify unavailable specials disappear.
- Verify correct prices.
- Verify responsive layouts.
- Verify accessible messaging.
- Verify cache expiration behavior.

## Implementation Status

| Capability | Status |
|---|---|
| Existing menu management | Implemented |
| Existing $5 special flag | Implemented |
| One-time scheduling | Planned |
| Weekly recurring scheduling | Planned |
| Multiple weekday selection | Planned |
| Start and end dates | Planned |
| Daily time windows | Planned |
| Overnight schedule handling | Requirements pending |
| Restaurant-local time evaluation | Planned |
| Daylight saving handling | Planned |
| Publication state model | Planned |
| Automatic availability calculation | Planned |
| Conflict detection | Under Evaluation |
| Manager scheduling interface | Planned |
| Public scheduled specials | Planned |
| Schedule exceptions | Under Evaluation |
| Scheduling audit history | Under Evaluation |
| End-to-end scheduling tests | Pending implementation |

## Related Documentation

- [SPECIALS Overview](README.md)
- [System Overview](specials-overview.md)
- [Admin Management](admin-management.md)
- [Website Overview](../README.md)
- [Menu System](../menu-system.md)
- [F&F FAM CLUB](../ff-fam-club/README.md)
- [Menu Management](../../09-menu-management/README.md)
- [Admin Dashboard](../../04-admin-dashboard/README.md)
- [Database & Storage](../../06-database/README.md)
- [Toast POS Integration](../../10-toast-pos-integration/README.md)
- [Master Documentation Index](../../README.md)

---

[Back to SPECIALS Overview](README.md)
