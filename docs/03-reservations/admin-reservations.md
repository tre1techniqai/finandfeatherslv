# RESERVATIONS — Admin Reservations

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Admin Dashboard foundation implemented; comprehensive reservation management requires source verification and further development

**Feature:** Administrative Reservation Management

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Administrative Objectives](#administrative-objectives)
3. [Current Administrative Foundation](#current-administrative-foundation)
4. [Reservation Management Architecture](#reservation-management-architecture)
5. [Manager Access and Authorization](#manager-access-and-authorization)
6. [Reservation Dashboard](#reservation-dashboard)
7. [Reservation Request Records](#reservation-request-records)
8. [Reservation Status Management](#reservation-status-management)
9. [Reservation Review Workflow](#reservation-review-workflow)
10. [Availability and Yelp Reservations](#availability-and-yelp-reservations)
11. [Guest Communication](#guest-communication)
12. [Alternate Reservation Proposals](#alternate-reservation-proposals)
13. [Reservation Search and Filtering](#reservation-search-and-filtering)
14. [Twilio Integration](#twilio-integration)
15. [Database and Persistence](#database-and-persistence)
16. [Privacy and Security](#privacy-and-security)
17. [Error Handling and Recovery](#error-handling-and-recovery)
18. [Operational Procedures](#operational-procedures)
19. [Testing and Verification](#testing-and-verification)
20. [Implementation Dependencies](#implementation-dependencies)
21. [Implementation Status](#implementation-status)
22. [Related Documentation](#related-documentation)

---

## Purpose

This document describes
administrative reservation
management for the
Fin & Feathers Las Vegas
website.

It covers the existing
administrative foundation
and proposed capabilities
for managing guest
reservation requests.

The document addresses:

- Manager authentication.
- Reservation request review.
- Reservation information.
- Request status tracking.
- Availability verification.
- Guest communication.
- Alternate arrangements.
- Twilio integration.
- Data persistence.
- Security and privacy.
- Operational procedures.

This document distinguishes
existing functionality from
planned administrative
capabilities.

## Administrative Objectives

The administrative reservation
experience should help
authorized restaurant staff
manage incoming requests
reliably and efficiently.

### Primary Objectives

- Identify incoming requests.
- Review guest details.
- Check reservation availability.
- Track review progress.
- Communicate with guests.
- Record confirmed arrangements.
- Identify unresolved requests.
- Prevent duplicate handling.
- Protect guest information.

### Operational Clarity

Staff should be able
to distinguish a
new request from
a confirmed reservation.

### Accountability

Reservation actions
should be attributable
to authorized staff
where supported.

### Consistency

Administrative information
must remain consistent
with the restaurant's
approved reservation process.

## Current Administrative Foundation

**Status:** Implemented foundation

The project includes
an administrative
dashboard.

### Established Route

    /admin

### Existing Dashboard

The dashboard includes
administrative navigation
for reservations
and menu management.

### Manager Authorization

The existing application
uses:

    src/lib/auth/require-manager.ts

### Authentication Provider

Manager authentication
uses Supabase Auth.

### Role Data

The manager authorization
helper checks the
staff role record.

Established role table:

    staff_roles

### Authorization Requirement

The helper requires:

- An authenticated user.
- An active staff role.
- The manager role.

### Important Boundary

An existing Reservations
dashboard entry point
does not establish
that every reservation
management feature
described below
is implemented.

### Source Verification

The current reservation
administration route
and associated components
must be inspected
before documenting
their exact capabilities.

## Reservation Management Architecture

**Status:** Existing foundation; expanded capabilities planned

The proposed system
connects several components.

### Guest Website

Guests prepare and send
reservation requests
through the public
reservation form.

### Twilio

Twilio receives
incoming SMS requests.

### Reservation Parser

The parser extracts
structured reservation data.

Established endpoint:

    /parse-reservation

### Staff Notification

Twilio Studio supports
the staff notification
workflow.

### Administrative Dashboard

The dashboard may
eventually provide
a consolidated view
of reservation requests.

### Yelp Reservations

Staff use the approved
reservation management
process to verify
actual availability.

### Data Ownership

The project must define
which system owns
the authoritative
reservation record.

### Integration Boundary

Do not assume that
Twilio messages
automatically create
records in the
admin database.

That behavior requires
source verification
or additional development.

## Manager Access and Authorization

Administrative reservation
information must be
restricted to
authorized personnel.

### Authentication

Managers sign in
through the established
admin authentication
workflow.

### Authorization Helper

    src/lib/auth/require-manager.ts

### Required Role

The existing helper
requires the role:

    manager

### Active Staff Record

The manager's
staff role must
be active.

### Server-Side Protection

Protected routes
and mutations
must enforce
authorization
on the server.

### Client-Side Controls

Hiding buttons
in the browser
is not sufficient
authorization.

### Access Failure

Unauthorized users
must not gain
access to private
reservation information.

### Role Changes

Revoked or inactive
staff access must
be respected.

## Reservation Dashboard

**Status:** Expanded experience planned

A future reservation
dashboard may display
incoming requests
and their current
review status.

### Potential Dashboard Information

- New requests.
- Pending requests.
- Requests requiring clarification.
- Alternative proposals.
- Confirmed reservations.
- Cancelled requests.

### Request Summary

Each entry may show:

- Guest name.
- Requested date.
- Requested time.
- Party size.
- Occasion.
- Request status.

### Operational Priorities

Unresolved requests
should be easy
to identify.

### Date Organization

Staff may need
to review requests
by reservation date.

### Refresh Behavior

The dashboard should
define how new
requests appear.

### Empty State

When no requests
are available,
the interface should
display a clear message.

### Verification

The exact current
dashboard capabilities
must be verified
from application source.

## Reservation Request Records

**Status:** Persistence requirements under evaluation

A future administrative
record may contain:

- Reservation request identifier.
- Guest first name.
- Guest last name.
- Guest contact information.
- Requested date.
- Requested time.
- Party size.
- Occasion.
- Request source.
- Request status.
- Staff notes.
- Creation timestamp.
- Last updated timestamp.

These are conceptual fields,
not verified existing
database columns.

### Request Identity

Each persisted request
should have a
stable identifier.

### Message Association

The system may need
to associate a request
with its original
Twilio message.

### Duplicate Detection

Repeated messages
should not automatically
create duplicate
confirmed reservations.

### Staff Notes

Notes should contain
only information
needed for operations.

### Data Minimization

Avoid collecting
unnecessary guest data.

### Record Ownership

The project must
define which system
is authoritative
for request records.

## Reservation Status Management

**Status:** Proposed workflow model

The following statuses
describe possible
administrative states.

They are not confirmed
database enum values.

### New

A request has
arrived but has
not been reviewed.

### Pending Review

Staff have not
completed availability
verification.

### Clarification Required

Additional information
is needed from
the guest.

### Alternative Proposed

Staff have offered
a different arrangement.

### Confirmed

Staff have explicitly
confirmed the reservation.

### Declined

The request cannot
be accommodated.

### Cancelled

The request or
reservation has
been cancelled.

### Completed

A confirmed reservation
may be marked completed
after the visit,
if approved by
the business.

### Status Integrity

A request must
not become confirmed
solely because
an SMS was received.

### Status History

An audit trail
may be required
for important changes.

## Reservation Review Workflow

Staff review each
incoming reservation
request.

### Step 1 — Identify Request

Locate the incoming
request or notification.

### Step 2 — Review Details

Confirm:

- Guest name.
- Requested date.
- Requested time.
- Party size.
- Occasion.

### Step 3 — Check Completeness

Determine whether
any required details
are missing.

### Step 4 — Verify Availability

Check the restaurant's
approved reservation
management system.

### Step 5 — Determine Outcome

Possible outcomes:

- Requested time available.
- Alternative needed.
- Additional information needed.
- Request cannot be accommodated.

### Step 6 — Communicate

Contact the guest
with the appropriate
response.

### Step 7 — Record Outcome

Update the approved
reservation record
or operational system.

### Step 8 — Avoid Duplication

Verify that the
same request
has not already
been handled.

## Availability and Yelp Reservations

The restaurant uses
Yelp Reservations
as part of its
reservation management
process.

### Availability Review

Staff must verify
actual availability
before confirmation.

### Request Versus Booking

A website SMS
request is not
an automatically
confirmed Yelp booking.

### Staff Responsibility

Staff use the
approved process
to accept or
propose alternatives.

### External System Boundary

The project has
not established
a verified automated
Yelp reservation
creation integration.

### Data Consistency

If future admin
records are introduced,
they must not
contradict the
authoritative
reservation system.

### Future Integration

Any direct integration
requires separate
technical and
business evaluation.

## Guest Communication

Staff communication
is a critical part
of reservation management.

### Initial Request

The guest sends
a reservation
request by SMS.

### Review Outcome

Staff communicate
whether the requested
arrangement can
be accommodated.

### Confirmation

A confirmation should
clearly identify:

- Guest name.
- Reservation date.
- Reservation time.
- Party size.

### Clarification

Staff may request
missing information.

### Alternative Proposal

An alternative
must be distinguished
from a confirmed
reservation.

### Cancellation

Cancellation procedures
must follow approved
business rules.

### Message Templates

Standard response
templates may be
considered.

### Approval Requirement

Customer-facing
message language
must follow approved
messaging and
compliance policies.

## Alternate Reservation Proposals

The requested
reservation time
may be unavailable.

### Alternative Options

Staff may propose:

- Another time.
- Another date.
- Another suitable arrangement.

### Guest Approval

An alternative
must not be
treated as accepted
without guest agreement.

### Record Updates

The final agreed
details should
be recorded
in the approved
reservation system.

### Status Tracking

A future admin
interface may use
an Alternative Proposed
status.

### Confirmation

The guest should
receive explicit
confirmation after
the arrangement
is accepted.

### Declined Alternatives

If the guest declines,
staff should update
the request outcome
appropriately.

## Reservation Search and Filtering

**Status:** Planned

A future admin
interface may support
search and filtering.

### Potential Search Fields

- Guest name.
- Reservation date.
- Contact reference.
- Request identifier.

### Potential Filters

- Request status.
- Reservation date.
- Party size.
- Review state.

### Sorting

Staff may need
to sort by:

- Request arrival time.
- Reservation date.
- Reservation time.
- Last updated time.

### Search Privacy

Search results
must remain restricted
to authorized users.

### Performance

Large request volumes
may require
server-side pagination.

### Empty Results

The interface should
clearly indicate
when no matching
requests are found.

## Twilio Integration

The reservation workflow
uses Twilio to
receive guest SMS.

### Incoming Messages

Twilio receives
reservation requests
sent to the restaurant
SMS destination.

### Parser

Established endpoint:

    /parse-reservation

### Structured Fields

The parser supports:

- First name.
- Last name.
- Date.
- Time.
- Party size.
- Occasion.

### Legacy Compatibility

The parser also
supports the previous
combined-name format.

### Studio Notifications

Twilio Studio uses
the parsed values
for staff notifications.

### Administrative Integration

A future dashboard
may display
persisted requests.

### Important Dependency

Displaying requests
in a dashboard
requires an approved
persistence or
provider integration.

### Verification

Do not assume
that Twilio Studio
currently writes
reservation records
to Supabase.

## Database and Persistence

**Status:** Requires source verification and architecture approval

The project uses
Supabase for
application data.

### Potential Reservation Storage

A future system
may persist
structured requests.

### Conceptual Fields

- Request identifier.
- Guest information.
- Reservation details.
- Status.
- Source message reference.
- Staff assignment.
- Timestamps.

### Schema Verification

Actual table names,
columns, and constraints
must be verified
against the database.

### Access Policies

Reservation data
must have appropriate
database access controls.

### Manager Reads

Authorized managers
may require access
to operational records.

### Manager Updates

Status changes
must enforce
server-side authorization.

### Data Retention

The restaurant must
approve retention
and deletion policies.

### External Consistency

Persisted request
status must not
be mistaken for
confirmed Yelp
reservation status
without verification.

## Privacy and Security

Reservation administration
involves guest
personal information.

### Protected Access

Only authorized
staff should access
private reservation data.

### Manager Authorization

Use the existing
server-side manager
authorization pattern.

### Database Security

Supabase access policies
must be appropriate
for the implemented
data model.

### Guest Information

Avoid exposing
unnecessary contact
information.

### SMS Privacy

SMS is not an
end-to-end encrypted
communication channel.

### Sensitive Data

Do not request
payment card information
through reservation SMS.

### Auditability

Important administrative
actions may require
audit records.

### Logging

Avoid logging
unnecessary guest
personal information.

### Retention

Follow approved
data retention
and privacy policies.

## Error Handling and Recovery

### Missing Request

Investigate the
incoming SMS,
Twilio processing,
and staff notification
workflow.

### Invalid Request

Flag incomplete
or malformed
reservation details.

### Duplicate Request

Avoid creating
duplicate confirmed
reservations.

### Database Failure

Do not claim
an update succeeded
if persistence fails.

### Authorization Failure

Prevent unauthorized
access or changes.

### Availability Conflict

Do not confirm
a request when
the approved system
shows no availability.

### Communication Failure

Provide an approved
staff follow-up
procedure.

### External System Outage

Avoid presenting
unverified availability
as confirmed.

### Recovery

Maintain clear
operational steps
for unresolved requests.

## Operational Procedures

### Daily Request Review

1. Access the approved staff workflow.
2. Identify new requests.
3. Review guest details.
4. Check reservation availability.
5. Respond to guests.
6. Record outcomes.
7. Follow up on unresolved requests.

### Handling Incomplete Requests

1. Identify missing details.
2. Contact the guest.
3. Obtain clarification.
4. Recheck availability.
5. Confirm or propose alternatives.

### Handling Duplicate Requests

1. Compare request details.
2. Review prior communication.
3. Verify existing bookings.
4. Avoid duplicate confirmations.
5. Document the outcome.

### Handling Cancellations

1. Verify the relevant reservation.
2. Follow approved cancellation procedures.
3. Update the authoritative system.
4. Communicate with the guest.
5. Update any supporting records.

### End-of-Day Review

The restaurant may
adopt a process
to identify requests
that remain unresolved.

## Testing and Verification

### Authentication

- Verify manager login.
- Reject unauthenticated access.
- Reject inactive staff roles.
- Reject unauthorized roles.

### Dashboard

If implemented:

- Display new requests.
- Display pending requests.
- Display confirmed requests.
- Display empty states.
- Refresh request information.

### Request Details

- Verify guest names.
- Verify requested date.
- Verify requested time.
- Verify party size.
- Verify occasion.
- Verify request source.

### Status Management

If implemented:

- Change request status.
- Reject unauthorized changes.
- Verify persistence.
- Verify audit records if supported.

### Twilio Integration

- Send a live SMS.
- Verify inbound receipt.
- Verify parsing.
- Verify staff notification.
- Verify any database integration.

### Yelp Workflow

- Verify availability review.
- Verify confirmed booking process.
- Verify alternate proposals.
- Verify guest confirmation.

### Failure Handling

- Test missing details.
- Test duplicate requests.
- Test database failures.
- Test notification failures.
- Test external system outages.

### Privacy

- Verify server authorization.
- Verify database policies.
- Verify protected guest information.
- Verify safe logging.

## Implementation Dependencies

Before expanding
reservation administration,
the project should verify:

1. Current admin reservation route.
2. Existing reservation components.
3. Actual Supabase reservation schema.
4. Existing reservation data sources.
5. Twilio Studio notification behavior.
6. Parser response contract.
7. Current staff workflow.
8. Yelp Reservations operating process.
9. Manager authorization requirements.
10. Guest communication rules.
11. Data retention requirements.
12. Audit and reporting requirements.

### Proposed Development Sequence

1. Inspect existing admin functionality.
2. Confirm authoritative data sources.
3. Define request persistence requirements.
4. Approve request status model.
5. Implement secure request listing.
6. Implement request details.
7. Implement authorized status updates.
8. Add filtering and search.
9. Establish operational reconciliation.
10. Test end-to-end request handling.

This is a proposed sequence,
not an approved
implementation schedule.

## Implementation Status

| Capability | Status |
|---|---|
| Admin Dashboard foundation | Implemented |
| Reservations dashboard entry point | Implemented |
| Supabase manager authentication | Implemented |
| Active manager role verification | Implemented |
| Server-side manager authorization helper | Implemented |
| Twilio reservation message reception workflow | Implemented |
| Reservation parser | Implemented |
| Twilio Studio staff notification configuration | Implemented |
| Live SMS-to-staff verification | Verification pending |
| Current reservation admin route capabilities | Source verification pending |
| Persistent reservation request records | Source verification pending |
| Consolidated request dashboard | Planned expansion |
| Request status management | Planned expansion |
| Reservation search and filtering | Planned |
| Manager audit trail | Under Evaluation |
| Automated Yelp booking integration | Not implemented |
| Administrative end-to-end testing | Pending implementation |

## Related Documentation

- [Reservations Overview](README.md)
- [Reservation Workflow](reservation-workflow.md)
- [Twilio Integration](twilio-integration.md)
- [SMS Parsing](sms-parsing.md)
- [A2P Compliance](a2p-compliance.md)
- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Reservation Management](../04-admin-dashboard/reservation-management.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Supabase Authentication](../05-authentication/supabase-auth.md)
- [Database Overview](../06-database/README.md)
- [Access Policies](../06-database/access-policies.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Master Documentation Index](../README.md)

---

[Back to Reservations Overview](README.md)
