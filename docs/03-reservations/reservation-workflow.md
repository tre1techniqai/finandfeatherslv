# RESERVATIONS — Reservation Workflow

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Guest request workflow implemented; live end-to-end SMS verification pending

**Feature:** Guest Reservations and Staff Confirmation

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Reservation Operating Model](#reservation-operating-model)
3. [System Components](#system-components)
4. [Guest Entry Points](#guest-entry-points)
5. [Reservation Form](#reservation-form)
6. [Date and Time Rules](#date-and-time-rules)
7. [Party Size and Occasion](#party-size-and-occasion)
8. [SMS Consent](#sms-consent)
9. [Reservation Message Preparation](#reservation-message-preparation)
10. [Mobile SMS Handoff](#mobile-sms-handoff)
11. [Desktop Fallback](#desktop-fallback)
12. [Twilio Message Reception](#twilio-message-reception)
13. [Reservation Parsing](#reservation-parsing)
14. [Staff Notification](#staff-notification)
15. [Reservation Review](#reservation-review)
16. [Yelp Reservations Confirmation](#yelp-reservations-confirmation)
17. [Alternate Availability](#alternate-availability)
18. [Guest Communication](#guest-communication)
19. [Reservation Status Model](#reservation-status-model)
20. [Failure and Recovery Scenarios](#failure-and-recovery-scenarios)
21. [Security and Privacy](#security-and-privacy)
22. [Testing and Verification](#testing-and-verification)
23. [Implementation Status](#implementation-status)
24. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the
Fin & Feathers Las Vegas
reservation request workflow.

It explains how guests
submit reservation requests,
how the request is
transmitted through SMS,
and how restaurant staff
review and confirm
requested reservations.

The workflow includes:

- Website reservation form.
- Form validation.
- SMS message preparation.
- Mobile SMS handoff.
- Desktop message fallback.
- Twilio message reception.
- Reservation parsing.
- Staff notification.
- Yelp Reservations review.
- Guest confirmation.

This document distinguishes
implemented components from
verification work that
remains outstanding.

## Reservation Operating Model

The website uses a
**reservation request**
model.

### Important Business Rule

Submitting the website form
does not automatically
confirm a reservation.

The guest prepares
and sends a text message
requesting a reservation.

Restaurant staff must
review the request.

### Confirmation Authority

Staff confirm availability
using the restaurant's
reservation management process,
including Yelp Reservations.

### Guest Confirmation

A reservation is confirmed
only after staff communicate
an explicit confirmation
to the guest.

### Alternate Availability

When the requested time
cannot be accommodated,
staff may propose
an alternative.

### Operational Principle

The website must not
represent an unreviewed
request as a confirmed
reservation.

## System Components

The workflow involves
several systems.

### Public Website

The Next.js website
presents the reservation
request form.

### Reservation Modal

The reservation interface
collects guest information
and prepares the SMS message.

### Guest Messaging Application

On compatible devices,
the guest's SMS application
opens with a prepared message.

### Twilio

Twilio receives
the incoming SMS
and supports the
message-processing workflow.

### Reservation Parser

The parsing endpoint
extracts structured
reservation information
from incoming messages.

Established endpoint:

    /parse-reservation

### Twilio Studio

The Studio workflow
uses parsed values
for staff notifications.

### Staff Review

Restaurant staff
review incoming requests.

### Yelp Reservations

Staff use the approved
reservation management
process to confirm
or propose alternatives.

## Guest Entry Points

Guests may access
the reservation form
through the public website.

### Primary Reservation Action

The homepage includes
a reservation button.

### Navigation

The website header
also provides access
to reservations.

### Modal Presentation

The reservation form
opens in a modal.

### Modal Dismissal

Established behavior:

- Close button.
- Escape key.

Backdrop clicking
does not dismiss
the reservation modal.

### User Experience

The guest should
understand that the
form initiates an
SMS reservation request.

## Reservation Form

The form collects
information needed
to prepare a request.

### Required Fields

- First name.
- Last name.
- Reservation date.
- Reservation time.
- Party size.
- Occasion.
- SMS consent.

### Name Fields

The current workflow
uses separate
first-name and
last-name values.

### Date Selection

The guest chooses
a date using
the calendar interface.

### Time Selection

Available time options
follow the approved
reservation window.

### Party Size

The guest selects
the number of guests.

### Occasion

The guest selects
an occasion from
the approved options.

### Consent

The guest must
acknowledge the
required SMS consent.

### Submission

Valid form data
is used to prepare
the outgoing SMS.

## Date and Time Rules

The reservation form
enforces defined
booking constraints.

### Reservation Hours

The approved time window is:

    10:00 AM–10:00 PM

### Time Increments

Reservation options use
30-minute increments.

### Minimum Lead Time

A reservation request
must be at least
two hours ahead.

### Booking Horizon

The current booking window
extends up to
90 calendar days ahead.

### Date Validation

The interface must
prevent invalid
past dates.

### Time Validation

The interface must
prevent requests
outside the approved
time window.

### Time Zone

Reservation date and time
must be interpreted
using the restaurant's
local time.

### Boundary Conditions

Testing must include
the earliest and
latest permitted times,
the minimum lead time,
and the booking horizon.

## Party Size and Occasion

### Party Size

The established
party-size range is:

    1–20 guests

### Party Size Validation

The form must reject
values outside
the approved range.

### Large Parties

A submitted request
does not guarantee
availability for
larger parties.

### Occasion

The occasion field
is required.

### Occasion Options

The approved option list
must be maintained
consistently in the
reservation form.

### Staff Context

Occasion information
helps staff understand
the reservation request.

### Data Integrity

Party size and occasion
must remain consistent
between the form,
SMS message,
parser output,
and staff notification.

## SMS Consent

SMS consent is
a required part
of the guest workflow.

### Consent Checkbox

The guest must
acknowledge consent
before proceeding.

### Consent Messaging

Consent language must
accurately describe
the implemented
messaging experience.

### Policy Links

The reservation modal
includes links to:

- Mobile Messaging Terms of Service.
- Privacy Policy.

### Compliance Status

Final A2P messaging
language and compliance
requirements remain
subject to approval
and verification.

### Consent Boundaries

Consent must not
be inferred solely
from opening the form.

### Record Handling

Any retained consent
records must follow
approved privacy
and retention requirements.

## Reservation Message Preparation

After valid submission,
the website prepares
an SMS message.

### Destination Number

Established reservation
SMS destination:

    (702) 546-6394

### Message Content

The prepared request
includes the guest's
reservation details.

### Required Information

- First name.
- Last name.
- Date.
- Time.
- Party size.
- Occasion.

### Message Formatting

The message format
must remain compatible
with the reservation
parsing workflow.

### Consistency

Changes to form labels
or message formatting
must be evaluated
against parser behavior.

### Guest Action

Preparing a message
does not guarantee
that the guest
has sent it.

## Mobile SMS Handoff

On compatible
mobile devices,
the website opens
the device's SMS
application.

### Prepared Message

The SMS application
receives the
destination number
and prepared request.

### Guest Responsibility

The guest must
send the message
from the SMS application.

### Modal Persistence

The reservation modal
remains open after
the SMS handoff.

### Reminder

The interface reminds
the guest to send
the message and
await staff confirmation.

### Cancellation

The guest may leave
the messaging application
without sending.

### Important Limitation

The website cannot
assume that the SMS
was successfully sent
merely because the
messaging application opened.

## Desktop Fallback

Desktop browsers
may not provide
a usable SMS
application handoff.

### Alternative Workflow

The website supports
a prepared-message
fallback for desktop users.

### Copy Functionality

The guest may copy
the reservation message
for manual sending.

### Message Accuracy

The copied message
must include the
same required fields
as the mobile version.

### Guest Instructions

The interface should
clearly explain
how to send
the prepared request.

### Confirmation Reminder

The guest must still
await explicit
staff confirmation.

### Verification

Desktop fallback behavior
should be tested
across supported browsers.

## Twilio Message Reception

Incoming reservation
messages are received
through Twilio.

### Twilio Number

The established
reservation destination
is the restaurant's
SMS number.

### Incoming Message

Twilio receives
the guest's text
after it is sent.

### Workflow Trigger

The configured Twilio
messaging workflow
processes incoming
reservation requests.

### Delivery Conditions

The system must
account for:

- Carrier delivery delays.
- Invalid messages.
- Duplicate messages.
- Service interruptions.
- Unexpected message formats.

### Receipt Versus Confirmation

Twilio receiving a
message does not mean
the restaurant has
confirmed the reservation.

## Reservation Parsing

The reservation parser
extracts structured
values from incoming SMS.

### Established Endpoint

    /parse-reservation

### Name Parsing

The current parser
supports separate
first-name and
last-name values.

### Legacy Compatibility

The parser also
supports the legacy
combined `name`
format.

### Other Reservation Fields

The parser is intended
to extract:

- Reservation date.
- Reservation time.
- Party size.
- Occasion.

### Parsing Failures

Unexpected message
formats must be
handled safely.

### Validation

Parsed data should
be reviewed before
staff confirmation.

### Testing Status

The parser has been
locally tested
and deployed.

Live end-to-end
SMS verification
remains outstanding.

## Staff Notification

Twilio Studio supports
the staff notification
workflow.

### Structured Values

The Studio flow
uses parsed reservation
values in notifications.

### Name Fields

Staff notifications
use the current
first-name and
last-name structure.

### Notification Objective

Staff should receive
enough information
to review the request.

### Notification Delivery

Successful parsing
does not alone prove
that a staff notification
was delivered.

### Verification Requirement

The full incoming
SMS-to-staff notification
path must be tested
with real messages.

### Failure Handling

Operational procedures
must account for
missed or delayed
notifications.

## Reservation Review

Staff review
incoming reservation
requests.

### Required Review

Staff should verify:

- Guest name.
- Requested date.
- Requested time.
- Party size.
- Occasion.
- Actual availability.

### Data Quality

If a request is
incomplete or ambiguous,
staff should clarify
the details with
the guest.

### Duplicate Requests

Staff should consider
whether multiple messages
refer to the same request.

### Availability

Availability must be
checked through the
restaurant's approved
reservation process.

### Confirmation Decision

Staff determine
whether the request
can be accommodated.

## Yelp Reservations Confirmation

The restaurant uses
Yelp Reservations
as part of its
reservation confirmation
process.

### Staff Responsibility

Staff review availability
and manage the
reservation through
the approved process.

### Confirmation Requirement

The guest must receive
an explicit confirmation.

### Website Limitation

The website request
form does not itself
create a verified
Yelp reservation.

### External System

Any future direct
Yelp integration
requires separate
technical evaluation.

### Operational Accuracy

Staff should not
communicate a confirmation
before the reservation
is actually accepted
through the approved process.

## Alternate Availability

Requested times
may not be available.

### Staff Response

Staff may propose:

- A different time.
- A different date.
- Another suitable arrangement.

### Guest Agreement

An alternate arrangement
should not be treated
as accepted without
guest agreement.

### Updated Details

Staff should communicate
the final agreed
reservation details.

### Confirmation

The guest should
receive clear confirmation
after the alternative
is accepted and
recorded appropriately.

### Declined Alternatives

If the guest declines,
the original request
must not be represented
as confirmed.

## Guest Communication

Clear communication
is essential to
the reservation workflow.

### Request Acknowledgment

The website should
make clear that
the form prepares
an SMS request.

### After Sending

Guests should expect
staff review.

### Confirmation Message

A confirmation should
clearly identify:

- Reservation date.
- Reservation time.
- Party size.
- Guest name.

### Alternate Proposal

Alternative availability
should be clearly
distinguished from
confirmed arrangements.

### Failed Requests

Guests should be
given appropriate
instructions when
the request cannot
be processed.

### Communication Accuracy

No interface should
claim a reservation
is confirmed without
verified staff action.

## Reservation Status Model

The following statuses
describe the business
workflow conceptually.

They are not confirmed
database enum values.

### Prepared

The website has
generated an SMS message.

The guest may not
have sent it.

### Sent

The guest has
sent the message
through the messaging
application.

The website may not
be able to verify
this event directly.

### Received

Twilio has received
the incoming request.

### Pending Review

Staff have not yet
completed availability review.

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

A request or reservation
has been cancelled
through the approved process.

### Implementation Note

Any future persisted
status model requires
schema and operational approval.

## Failure and Recovery Scenarios

### SMS Application Does Not Open

Provide the desktop-style
manual sending fallback
where supported.

### Guest Does Not Send

Do not represent
the request as received.

### SMS Delivery Failure

The guest may need
to retry through
an approved channel.

### Parser Failure

Unexpected messages
should not produce
misleading structured data.

### Notification Failure

Staff must have
an approved method
to identify missed
incoming requests.

### Duplicate Message

Staff should avoid
creating duplicate
reservations.

### Invalid Reservation Date

The website should
reject invalid
date selections.

### Availability Conflict

Staff should propose
an alternative
when appropriate.

### Twilio Outage

The restaurant should
have an operational
fallback communication
procedure.

### Yelp Unavailable

Staff should avoid
claiming confirmed
availability until
the approved system
can be checked.

## Security and Privacy

Reservation information
contains guest data.

### Data Minimization

Collect only information
needed for the
reservation workflow.

### Phone Numbers

Phone numbers and
guest details must
be handled appropriately.

### SMS Limitations

SMS is not an
end-to-end encrypted
messaging channel.

### Sensitive Information

Do not request
payment card details
through reservation SMS.

### Twilio Credentials

Private Twilio credentials
must remain protected.

### Webhook Security

Inbound Twilio requests
should be validated
according to the
approved integration design.

### Administrative Access

Staff-facing reservation
data must be restricted
to authorized personnel.

### Logging

Application logs
should avoid exposing
unnecessary guest
personal information.

### Retention

Reservation message
retention must follow
approved business
and privacy requirements.

## Testing and Verification

### Website Form

- Verify first-name validation.
- Verify last-name validation.
- Verify date selection.
- Verify time selection.
- Verify party-size limits.
- Verify occasion selection.
- Verify SMS consent.
- Verify modal dismissal.

### Date Rules

- Test minimum two-hour lead time.
- Test 90-day booking horizon.
- Test earliest reservation time.
- Test latest reservation time.
- Test 30-minute increments.
- Test restaurant-local time.

### Mobile Handoff

- Verify SMS application opening.
- Verify destination number.
- Verify prepared message.
- Verify modal persistence.
- Verify guest reminder.

### Desktop Fallback

- Verify prepared message.
- Verify copy behavior.
- Verify instructions.
- Verify supported browsers.

### Twilio Reception

- Send a real SMS.
- Verify Twilio receipt.
- Verify Studio trigger.
- Verify parser invocation.
- Verify structured values.
- Verify staff notification.

### Parser Compatibility

- Test separate name fields.
- Test legacy combined name.
- Test missing fields.
- Test malformed messages.
- Test duplicate messages.

### Staff Confirmation

- Verify availability review.
- Verify Yelp workflow.
- Verify guest confirmation.
- Verify alternate proposals.
- Verify declined requests.

### Failure Scenarios

- Test SMS handoff failure.
- Test parser failure.
- Test notification failure.
- Test unavailable time.
- Test service interruption.

### Compliance

- Verify consent language.
- Verify policy links.
- Verify approved A2P wording.
- Verify privacy handling.

## Implementation Status

| Capability | Status |
|---|---|
| Public reservation form | Implemented |
| Separate first and last name fields | Implemented |
| Date and time validation | Implemented |
| 30-minute time increments | Implemented |
| Two-hour minimum lead time | Implemented |
| 90-day booking horizon | Implemented |
| Party size 1–20 | Implemented |
| Required occasion | Implemented |
| Required SMS consent | Implemented |
| Mobile SMS handoff | Implemented |
| Desktop message fallback | Implemented |
| Twilio parser endpoint | Implemented |
| First and last name parsing | Implemented |
| Legacy name compatibility | Implemented |
| Twilio Studio field mapping | Implemented |
| Local parser testing | Verified |
| Parser deployment | Implemented |
| Live inbound SMS testing | Verification pending |
| Live staff notification testing | Verification pending |
| Staff Yelp confirmation process | Established business workflow |
| Automated Yelp reservation creation | Not implemented |
| Final A2P compliance approval | Pending Approval |

## Related Documentation

- [Reservations Overview](README.md)
- [Twilio Integration](twilio-integration.md)
- [SMS Parsing](sms-parsing.md)
- [Admin Reservations](admin-reservations.md)
- [A2P Compliance](a2p-compliance.md)
- [Website Reservation Form](../02-website/reservation-form.md)
- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Reservation Management](../04-admin-dashboard/reservation-management.md)
- [Database & Storage](../06-database/README.md)
- [Operations](../08-operations/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Reservations Overview](README.md)
