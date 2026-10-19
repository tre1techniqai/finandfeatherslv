# SPECIALS — System Overview

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Planned; requirements and approvals pending

**Feature:** Restaurant SPECIALS

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [SPECIALS System Vision](#specials-system-vision)
3. [Current Implementation](#current-implementation)
4. [Proposed System Architecture](#proposed-system-architecture)
5. [Types of Specials](#types-of-specials)
6. [Menu Item Relationships](#menu-item-relationships)
7. [Promotional Pricing](#promotional-pricing)
8. [Recurring Scheduling](#recurring-scheduling)
9. [Special Availability and Visibility](#special-availability-and-visibility)
10. [Customer-Facing Presentation](#customer-facing-presentation)
11. [Manager Administration](#manager-administration)
12. [Database Requirements](#database-requirements)
13. [Toast POS Considerations](#toast-pos-considerations)
14. [F&F FAM CLUB Integration](#ff-fam-club-integration)
15. [Security and Business Rules](#security-and-business-rules)
16. [Testing and Verification](#testing-and-verification)
17. [Implementation Status](#implementation-status)
18. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed
SPECIALS system for Fin & Feathers
Las Vegas.

The system is intended to allow
authorized restaurant managers
to create, schedule, and manage
approved promotional menu offerings.

The documentation distinguishes:

- Existing menu functionality.
- Proposed promotional capabilities.
- Scheduling requirements.
- Administrative responsibilities.
- Database requirements.
- Potential external integrations.

The SPECIALS system is a
planned feature.

This document does not indicate
that recurring specials scheduling
is already operational.

## SPECIALS System Vision

The proposed SPECIALS system
will support promotional offerings
that are displayed according
to approved schedules.

A central requirement is
the ability to place existing
menu items on special.

### Example

A restaurant may offer:

    Today's Special (Tuesday)
    F&F Taco Tuesday Platter

This is an illustrative
weekday promotion.

The exact menu item,
price, and availability
must be approved before
publication.

### Business Objectives

The system may help:

- Promote specific menu items.
- Encourage repeat visits.
- Highlight weekday offerings.
- Communicate limited-time deals.
- Simplify manager updates.
- Reduce manual website changes.
- Coordinate approved promotions.

### Core Design Principle

Specials should be managed
through structured data
rather than requiring
developers to edit website
source code for routine
promotional changes.

## Current Implementation

The existing website includes
a menu management system.

Established administrative route:

    /admin/menu

The menu editor supports
menu item administration.

### Existing Special Flag

The current menu data model
includes:

    is_five_dollar_special

This field supports an
existing $5 special designation.

### Important Distinction

The existing $5 special flag
is not equivalent to
a complete SPECIALS system.

It does not, by itself,
establish support for:

- Recurring weekday schedules.
- Promotional start and end dates.
- Time-limited availability.
- Multiple promotional prices.
- Special-specific descriptions.
- Automatic daily publication.
- Promotional reporting.

Those capabilities require
separate design and verification.

### Current Source Verification

The current menu editor
and database schema should
be inspected before
implementation begins.

## Proposed System Architecture

**Status:** Planned

The proposed system may include
four primary components.

### 1. Menu Data

Existing menu items remain
the primary source for
standard item information.

### 2. SPECIALS Records

Separate records define
promotional details.

### 3. Scheduling Logic

Scheduling rules determine
when specials are eligible
to appear.

### 4. Public Presentation

The website displays
currently eligible
approved specials.

### Administrative Interface

Authorized managers create
and maintain promotional records.

### Architectural Objective

Separate standard menu
information from temporary
promotional information.

This reduces the risk
of permanently changing
menu prices when a
promotion ends.

## Types of Specials

The system may support
multiple promotional types.

### Daily Specials

Promotions available
on a particular date.

### Weekly Recurring Specials

Promotions associated
with specific weekdays.

For example:

- Monday special.
- Tuesday special.
- Wednesday special.
- Thursday special.
- Friday special.
- Saturday special.
- Sunday special.

These are scheduling
categories, not confirmed
restaurant promotions.

### Limited-Time Specials

Promotions active during
an approved date range.

### Time-Specific Specials

Promotions available
during designated hours.

### Event Specials

Promotions associated
with approved restaurant
events or occasions.

### Member-Only Specials

Potential future promotions
for eligible F&F FAM CLUB
members.

Member-specific pricing
requires separate approval
and technical implementation.

## Menu Item Relationships

A central design requirement
is the ability to associate
specials with existing
menu items.

### Existing Menu Items

A special may reference
an item already managed
through the menu editor.

### Relationship Benefits

Using existing menu records
may provide:

- Consistent item names.
- Consistent descriptions.
- Existing food images.
- Category information.
- Standard pricing reference.
- Reduced duplicate data.

### Proposed Relationship

A future SPECIALS record
may contain a reference
to an existing menu item.

The exact database
relationship must be
designed and approved.

### Special-Specific Overrides

The system may allow
approved overrides for:

- Promotional title.
- Promotional description.
- Promotional price.
- Promotional image.
- Availability schedule.

Overrides should not
silently change the
standard menu item.

### New Promotional Items

Whether managers may create
specials that are not linked
to existing menu items
requires a business decision.

### Item Deactivation

The system must define
what happens when a
linked menu item becomes
inactive or unavailable.

## Promotional Pricing

**Status:** Planned

The system should distinguish
standard menu pricing
from promotional pricing.

### Standard Price

The regular price remains
associated with the
original menu item.

### Promotional Price

An approved special
may specify a temporary
promotional price.

### Price Display

The public interface
may show:

- Promotional price.
- Regular price.
- Savings information.
- Special conditions.

The exact display rules
require approval.

### Market Pricing

Items marked MKT
require special handling.

The system must not
invent a fixed price
for market-priced items.

### Modifier Pricing

Promotional pricing must
account for applicable
menu modifiers and add-ons.

### Pricing Approval

Only approved promotional
prices should be published.

### Promotion Expiration

Ending a promotion
must not overwrite
the standard menu price.

## Recurring Scheduling

**Status:** Planned

Recurring scheduling is
a primary system requirement.

### Weekday Selection

Managers may eventually
select one or more
weekdays for a special.

### Start and End Dates

The system may support
a date range controlling
when recurrence is valid.

### Time Windows

Optional time windows
may control availability
during a particular day.

### Restaurant Time Zone

Scheduling must use
the restaurant's local
time zone.

Fin & Feathers Las Vegas
operates in Nevada.

The implementation must
handle daylight saving
time correctly.

### Example Schedule

An approved promotion
might be configured as:

    Special: F&F Taco Tuesday Platter
    Day: Tuesday
    Start Time: To be approved
    End Time: To be approved
    Promotional Price: To be approved

This is a planning example,
not an active promotion.

### Automatic Visibility

Eligible specials should
appear according to
their approved schedules.

Expired or inactive specials
should no longer appear
as currently available.

## Special Availability and Visibility

A future system must
distinguish several states.

### Draft

A special is being prepared
and is not public.

### Scheduled

A special has been approved
for a future time.

### Active

A special is eligible
for public display.

### Expired

The approved availability
window has ended.

### Disabled

A manager has intentionally
removed the special
from public availability.

### State Model

These are proposed states.

The final implementation
may use a different
approved data model.

### Manual Overrides

Managers may need
the ability to disable
a promotion early.

Any override must respect
approved permissions.

## Customer-Facing Presentation

**Status:** Planned

The website may introduce
a dedicated SPECIALS section.

### Potential Content

Each special may display:

- Promotional title.
- Associated menu item.
- Description.
- Promotional price.
- Availability day.
- Availability hours.
- Approved food image.
- Relevant restrictions.

### Today's Special

The interface may highlight
promotions available
on the current day.

### Weekly Specials

A future view may display
approved recurring
weekday promotions.

### Mobile Presentation

The presentation must
follow the site's
mobile-first design.

### Menu Consistency

Specials should use
the approved menu
category structure.

No HOOKAH category filter
should be introduced.

COCKTAILS should not
receive item images
under the established
menu presentation rules.

### Availability Messaging

A special should not
appear as currently
available outside its
approved schedule.

## Manager Administration

**Status:** Planned

A future manager interface
may support:

- Creating specials.
- Selecting menu items.
- Editing promotional details.
- Setting promotional prices.
- Selecting weekdays.
- Configuring date ranges.
- Configuring time windows.
- Enabling or disabling specials.
- Previewing public presentation.

### Manager Authorization

Administrative access
must use the established
manager authorization system.

Existing helper:

    src/lib/auth/require-manager.ts

### Approval Workflow

Restaurant ownership
must define which
promotional changes
require approval.

### Validation

Administrative forms
must reject invalid
or incomplete data.

### Operational Feedback

Managers should receive
clear success and
failure messages.

## Database Requirements

**Status:** Planned; schema pending

The website uses Supabase.

A future SPECIALS system
may require additional
database tables or fields.

### Potential Data Fields

- Special identifier.
- Linked menu item identifier.
- Promotional title.
- Promotional description.
- Promotional price.
- Start date.
- End date.
- Recurring weekdays.
- Start time.
- End time.
- Publication status.
- Created timestamp.
- Updated timestamp.

These are conceptual fields,
not an existing confirmed schema.

### Data Relationships

Menu item relationships
must be validated.

### Access Policies

Any new tables must
use appropriate database
access controls.

### Public Queries

Public visitors should
only receive approved
publicly eligible specials.

### Administrative Writes

Only authorized staff
should modify specials.

### Scheduling Reliability

Scheduling must not depend
solely on a visitor's
device clock.

Server-side eligibility
should be evaluated
using an approved
time-zone-aware approach.

## Toast POS Considerations

**Status:** Under Evaluation

The restaurant uses
Toast for online ordering.

The website currently
links to an external
Toast ordering experience.

### Potential Future Integration

The SPECIALS system may
eventually coordinate
with Toast menu data
or promotional pricing.

### Required Evaluation

Before integration,
the project must confirm:

- Available Toast APIs.
- Required account permissions.
- Menu item identifiers.
- Pricing capabilities.
- Promotion support.
- Synchronization requirements.
- Operational costs.

### Important Limitation

A special displayed
on the website does not
automatically mean that
Toast checkout will
honor the same price.

### Pricing Consistency

Any future ordering
integration must prevent
mismatched customer
pricing expectations.

## F&F FAM CLUB Integration

**Status:** Planned; approval dependent

The SPECIALS system may
eventually coordinate
with F&F FAM CLUB.

### Potential Uses

- Promoting approved specials.
- Announcing member offers.
- Highlighting upcoming promotions.
- Supporting member-only benefits.

### Eligibility

Member-only promotions
require approved
eligibility rules.

### Consent

Promotional SMS or email
must use appropriate
marketing consent.

Reservation messaging consent
must not automatically
authorize marketing messages.

### Implementation Dependency

The F&F FAM CLUB
membership architecture
must be established
before implementing
member-specific pricing.

## Security and Business Rules

The SPECIALS system
must protect business
pricing and operations.

### Authorization

Only authorized managers
may modify promotional data.

### Input Validation

Validate:

- Promotional prices.
- Linked menu items.
- Dates.
- Times.
- Weekday selections.
- Publication states.

### Price Integrity

The system must not
silently overwrite
regular menu prices.

### Data Consistency

Linked menu items
must remain valid.

### Auditability

The project should
evaluate recording
important promotional
changes.

### Secret Management

Private service credentials
must not appear in
public code or documentation.

### Approval

Unapproved specials
must not be published.

## Testing and Verification

### Existing Menu Integration

- Verify menu item selection.
- Verify item names.
- Verify standard prices.
- Verify active item behavior.
- Verify modifiers.
- Verify image rules.

### Scheduling

- Test each weekday.
- Test start dates.
- Test end dates.
- Test time windows.
- Test recurring schedules.
- Test daylight saving changes.
- Test expired promotions.

### Pricing

- Verify approved special prices.
- Verify regular prices remain unchanged.
- Verify modifier pricing.
- Verify market-priced items.
- Verify expiration behavior.

### Administrative Security

- Verify unauthenticated access is denied.
- Verify unauthorized roles are denied.
- Verify inactive managers are denied.
- Verify authorized manager access.
- Verify invalid data is rejected.

### Public Presentation

- Verify today's specials.
- Verify weekly specials.
- Verify mobile layout.
- Verify desktop layout.
- Verify accessibility.
- Verify unavailable specials are hidden.

### Integrations

If implemented:

- Verify Toast price consistency.
- Verify FAM CLUB eligibility.
- Verify promotional consent.
- Verify synchronization failures.

## Implementation Status

| Capability | Status |
|---|---|
| Existing menu management | Implemented |
| Existing $5 special flag | Implemented |
| Dedicated SPECIALS data model | Planned |
| Menu item association | Planned |
| Promotional pricing | Planned |
| Recurring weekday scheduling | Planned |
| Date-range scheduling | Planned |
| Time-window scheduling | Planned |
| Automatic visibility | Planned |
| Draft and publication states | Planned |
| Manager SPECIALS interface | Planned |
| Public SPECIALS section | Planned |
| Toast promotion integration | Under Evaluation |
| FAM CLUB promotional integration | Planned; approval dependent |
| Audit history | Under Evaluation |
| End-to-end SPECIALS testing | Pending implementation |

## Related Documentation

- [SPECIALS Overview](README.md)
- [Scheduling](scheduling.md)
- [Admin Management](admin-management.md)
- [Website Overview](../README.md)
- [Menu System](../menu-system.md)
- [F&F FAM CLUB](../ff-fam-club/README.md)
- [Menu Management](../../09-menu-management/README.md)
- [Admin Dashboard](../../04-admin-dashboard/README.md)
- [SPECIALS Admin Category](../../04-admin-dashboard/specials-management.md)
- [Database & Storage](../../06-database/README.md)
- [Toast POS Integration](../../10-toast-pos-integration/README.md)
- [Master Documentation Index](../../README.md)

---

[Back to SPECIALS Overview](README.md)
