# RESERVATIONS — Twilio Integration

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Integration implemented and parser deployed; live end-to-end SMS verification pending

**Feature:** Twilio SMS Reservation Integration

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Integration Overview](#integration-overview)
3. [Current Implementation](#current-implementation)
4. [System Architecture](#system-architecture)
5. [Twilio Phone Number](#twilio-phone-number)
6. [Website SMS Handoff](#website-sms-handoff)
7. [Inbound Message Reception](#inbound-message-reception)
8. [Twilio Studio Workflow](#twilio-studio-workflow)
9. [Reservation Parser Integration](#reservation-parser-integration)
10. [Structured Reservation Fields](#structured-reservation-fields)
11. [Staff Notification Workflow](#staff-notification-workflow)
12. [Message Delivery and Status](#message-delivery-and-status)
13. [Webhook Security](#webhook-security)
14. [Credentials and Environment Configuration](#credentials-and-environment-configuration)
15. [Error Handling](#error-handling)
16. [Logging and Monitoring](#logging-and-monitoring)
17. [A2P Compliance](#a2p-compliance)
18. [Deployment and Configuration Management](#deployment-and-configuration-management)
19. [Testing and Verification](#testing-and-verification)
20. [Operational Procedures](#operational-procedures)
21. [Implementation Status](#implementation-status)
22. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the
Twilio integration used
by the Fin & Feathers
Las Vegas reservation
request workflow.

The integration supports
receiving guest SMS
reservation requests,
extracting reservation details,
and preparing structured
notifications for restaurant staff.

The document covers:

- Website SMS preparation.
- Twilio message reception.
- Twilio Studio.
- Reservation parsing.
- Structured message fields.
- Staff notification.
- Delivery verification.
- Security.
- Deployment.
- Compliance.
- Operational monitoring.

This document distinguishes
implemented integration
components from verification
and compliance work
that remains outstanding.

## Integration Overview

The reservation workflow
begins on the website.

### High-Level Flow

1. Guest opens the reservation form.
2. Guest enters reservation details.
3. Website validates the request.
4. Website prepares an SMS message.
5. Guest sends the SMS.
6. Twilio receives the message.
7. Twilio Studio processes the message.
8. The reservation parser extracts fields.
9. Studio uses the parsed values.
10. Staff receive a reservation notification.
11. Staff review availability.
12. Staff confirm or propose an alternative.

### Important Distinction

Twilio receives and
processes reservation requests.

Twilio does not independently
guarantee restaurant availability.

### Confirmation Authority

Restaurant staff remain
responsible for confirming
the requested reservation
through the approved
reservation management process.

## Current Implementation

**Status:** Implemented; verification pending

The project has established
the following components:

- Website reservation form.
- Prepared SMS message.
- Restaurant SMS destination.
- Twilio message workflow.
- Reservation parsing endpoint.
- Separate first and last name parsing.
- Legacy combined-name compatibility.
- Twilio Studio field mapping.
- Staff notification configuration.

### Parser Testing

The parser has been
tested locally.

### Parser Deployment

The parser has been
deployed.

### Verification Outstanding

The complete production
workflow has not yet
been verified through
a confirmed live
end-to-end SMS test.

### Compliance Outstanding

Final A2P messaging
language and related
approval requirements
remain pending.

## System Architecture

The integration connects
multiple independent
systems.

### Public Website

Technology:

    Next.js

The website prepares
the reservation request.

### Guest SMS Application

The guest's device
sends the prepared
text message.

### Twilio Messaging

Twilio receives
the incoming SMS.

### Twilio Studio

Studio orchestrates
the message-processing
and notification workflow.

### Reservation Parser

Established endpoint:

    /parse-reservation

The parser extracts
structured reservation
information.

### Staff Notification

The Studio workflow
uses parsed values
in the notification
sent to staff.

### Reservation Management

Staff use the approved
reservation process,
including Yelp Reservations,
to review availability.

### Architecture Boundary

The SMS integration
must not be described
as an automatic
Yelp reservation
creation system.

## Twilio Phone Number

The established
reservation SMS
destination is:

    (702) 546-6394

### Website Configuration

The website uses
this destination
when preparing
the guest's SMS.

### Message Routing

The Twilio configuration
must route incoming
messages to the
approved processing workflow.

### Number Ownership

The restaurant must
maintain access to
the relevant Twilio
account and number.

### Operational Verification

Confirm that:

- The number is active.
- Incoming SMS is supported.
- The correct Studio flow is connected.
- Staff notification routing is current.

### Change Management

Changing the destination
number requires coordinated
updates to website
configuration, Twilio,
and operational documentation.

## Website SMS Handoff

The website prepares
an SMS request
from validated form data.

### Required Guest Details

- First name.
- Last name.
- Reservation date.
- Reservation time.
- Party size.
- Occasion.

### Mobile Devices

On compatible devices,
the SMS application
opens with the
prepared message.

### Guest Action

The guest must
send the message.

### Desktop Devices

The website provides
a prepared-message
fallback for manual sending.

### Important Limitation

Opening an SMS
application does not
prove the message
was sent or delivered.

### Modal Reminder

The reservation modal
remains open after
the mobile handoff
and reminds the guest
to send the request
and await confirmation.

## Inbound Message Reception

Twilio receives SMS
messages sent to
the restaurant's
reservation number.

### Incoming Payload

An inbound message
may include:

- Sender phone number.
- Destination phone number.
- Message body.
- Message identifier.
- Message metadata.

The exact fields
available depend
on the Twilio
workflow configuration.

### Message Routing

Incoming messages
must be routed
to the correct
Studio workflow.

### Unexpected Messages

Not every inbound
SMS will necessarily
match the reservation
message format.

### Invalid Requests

Unexpected messages
must be handled
without producing
false reservation details.

### Duplicate Delivery

The system should
consider duplicate
message processing.

### Delivery Delays

Carrier and provider
delays may affect
message arrival.

## Twilio Studio Workflow

Twilio Studio is used
to coordinate incoming
reservation message processing.

### Established Role

Studio receives
incoming message data,
uses the parser output,
and prepares staff
notification values.

### Parser Invocation

The workflow calls
the reservation
parsing endpoint.

### Structured Fields

Studio maps parser
results to the
notification workflow.

### Name Field Update

The current workflow
uses separate
first-name and
last-name fields.

### Legacy Compatibility

The parser supports
the previous combined
name format.

### Configuration Verification

The deployed Studio
flow should be inspected
to confirm its current
widget configuration
and field mappings.

### Publication

Changes to Studio
must be published
through the approved
Twilio workflow.

### Version Control

Studio configuration
changes should be
documented and
reviewed before
production activation.

## Reservation Parser Integration

The parser converts
incoming SMS text
into structured
reservation values.

### Established Endpoint

    /parse-reservation

### Primary Function

Extract the guest's
reservation details
from the incoming
message body.

### Supported Names

The parser supports:

- First name.
- Last name.
- Legacy combined name.

### Additional Fields

The parser is intended
to extract:

- Date.
- Time.
- Party size.
- Occasion.

### Response Contract

The parser response
must remain compatible
with Twilio Studio's
configured field references.

### Error Handling

Malformed messages
must not be silently
converted into
confirmed reservation details.

### Testing

Parser changes require
local validation
and integration testing.

### Deployment

Parser deployment
must be coordinated
with any corresponding
Studio changes.

## Structured Reservation Fields

Structured fields
allow staff notifications
to display request details.

### First Name

Represents the guest's
given name.

### Last Name

Represents the guest's
family name.

### Date

Represents the requested
reservation date.

### Time

Represents the requested
reservation time.

### Party Size

Represents the number
of requested guests.

### Occasion

Represents the guest's
selected occasion.

### Legacy Name

The combined `name`
field remains supported
for compatibility.

### Field Consistency

Website message formatting,
parser output,
and Studio mappings
must remain aligned.

### Missing Values

Missing or invalid
fields should be
handled explicitly.

### Date Interpretation

Dates and times
must be interpreted
using the restaurant's
local time conventions.

## Staff Notification Workflow

The integration supports
staff notification
for incoming requests.

### Notification Objective

Provide sufficient
reservation information
for staff review.

### Expected Information

- Guest name.
- Requested date.
- Requested time.
- Party size.
- Occasion.
- Available sender context.

### Staff Responsibility

Staff must verify
the request and
check actual availability.

### Notification Delivery

A successful parser
response does not
prove that the
notification reached staff.

### Delivery Verification

Live testing must
confirm the notification
arrives through
the configured channel.

### Duplicate Notifications

Operational procedures
should account for
duplicate messages.

### Missed Notifications

The restaurant should
define a recovery
procedure for missed
or delayed notifications.

## Message Delivery and Status

SMS delivery involves
multiple independent events.

### Message Prepared

The website generates
the outgoing message.

### Message Sent

The guest sends
the SMS through
their messaging application.

### Message Received

Twilio receives
the inbound message.

### Message Parsed

The parser extracts
reservation values.

### Staff Notified

The notification
reaches the configured
staff destination.

### Reservation Reviewed

Staff check availability.

### Reservation Confirmed

Staff explicitly confirm
the reservation.

### Status Boundaries

These events must
not be treated
as interchangeable.

### Delivery Verification

Provider message logs
and workflow execution
records should be
used when investigating
delivery problems.

## Webhook Security

Twilio integrations
must protect
inbound webhook processing.

### Request Validation

Inbound Twilio requests
should be validated
using the provider's
supported request
verification mechanism.

### Trusted Origin

Do not assume
a request is trusted
solely because it
targets a Twilio-related
endpoint.

### Transport Security

Production webhook
traffic should use HTTPS.

### Replay and Duplicate Handling

The implementation
should evaluate
idempotency and
duplicate-processing safeguards.

### Input Validation

Incoming message
content must be
treated as untrusted.

### Error Responses

Webhook errors
should not reveal
private configuration.

### Verification Requirement

The current webhook
validation implementation
must be inspected
before marking
this control verified.

## Credentials and Environment Configuration

Twilio credentials
must be protected.

### Private Configuration

Potential private values
may include:

- Twilio account credentials.
- Authentication tokens.
- Service API keys.
- Private webhook configuration.

### Environment Variables

Private values should
be stored through
approved environment
configuration.

### Source Control

Credentials must not
be committed to Git.

### Browser Exposure

Private Twilio
credentials must never
be included in
public browser bundles.

### Deployment Environments

Development, preview,
and production
configuration should
be reviewed separately.

### Credential Rotation

The project should
define a procedure
for rotating credentials.

### Documentation

Documentation must
describe configuration
requirements without
recording secret values.

## Error Handling

The integration must
handle failures
without misleading
guests or staff.

### Invalid SMS Format

The parser should
handle unexpected
message formats safely.

### Parser Unavailable

Studio should not
assume parsing succeeded
when the endpoint fails.

### Missing Fields

Incomplete requests
should be flagged
for appropriate review.

### Notification Failure

Staff must have
a way to investigate
missed notifications.

### Twilio Service Interruption

The restaurant should
maintain an approved
fallback communication
procedure.

### Duplicate Processing

Repeated processing
should not create
duplicate confirmed
reservations.

### Guest Expectations

Guests must be
reminded that sending
an SMS does not
guarantee confirmation.

## Logging and Monitoring

Operational visibility
is important for
reservation reliability.

### Twilio Logs

Provider logs may
help investigate
incoming message events.

### Studio Execution History

Studio execution
records may help
identify processing
or mapping failures.

### Parser Logs

Application logs
may help diagnose
parser errors.

### Privacy

Logs should avoid
unnecessary exposure
of guest information.

### Credentials

Never log private
authentication tokens
or service secrets.

### Monitoring Requirements

The project should
define how staff
or developers detect:

- Parser failures.
- Studio failures.
- Notification failures.
- Unexpected message volume.
- Repeated malformed requests.

### Retention

Log retention
requires an approved
operational policy.

## A2P Compliance

**Status:** Pending Approval

Application-to-person
messaging requirements
must be addressed
before treating
the messaging program
as fully verified.

### Consent

The website requires
SMS consent.

### Policy Links

The reservation form
provides links to:

- Mobile Messaging Terms of Service.
- Privacy Policy.

### Message Language

The final consent
and messaging language
requires approval.

### Provider Requirements

Applicable Twilio
and carrier requirements
must be reviewed.

### Registration

Any required messaging
registration must be
completed and verified.

### Compliance Documentation

Detailed requirements
are documented in:

    a2p-compliance.md

### Important Boundary

A working parser
or successful SMS
test does not establish
full messaging compliance.

## Deployment and Configuration Management

The Twilio integration
has multiple deployment
surfaces.

### Website Deployment

Website changes
are deployed through
the existing
Vercel workflow.

### Parser Deployment

The reservation parser
has been deployed.

### Studio Configuration

Studio changes require
appropriate configuration
and publication.

### Environment Configuration

Production credentials
and endpoint references
must be verified.

### Coordinated Changes

Updates to SMS formatting,
parser output,
or Studio field mappings
should be deployed
as coordinated changes.

### Compatibility

The parser supports
legacy combined-name
input to reduce
compatibility risk.

### Rollback Planning

Changes should have
a documented recovery
or rollback path.

### Post-Deployment Verification

Each deployment should
be followed by
appropriate integration
testing.

## Testing and Verification

### Website Message Preparation

- Verify destination number.
- Verify first-name field.
- Verify last-name field.
- Verify date.
- Verify time.
- Verify party size.
- Verify occasion.
- Verify mobile SMS handoff.
- Verify desktop fallback.

### Inbound Twilio

- Send a real SMS.
- Verify message reception.
- Verify correct number routing.
- Verify Studio execution.
- Verify parser invocation.

### Parser

- Test separate name fields.
- Test legacy combined name.
- Test missing values.
- Test malformed messages.
- Test unexpected content.
- Test parser failure behavior.

### Studio Mapping

- Verify parsed first name.
- Verify parsed last name.
- Verify date mapping.
- Verify time mapping.
- Verify party-size mapping.
- Verify occasion mapping.

### Staff Notification

- Verify actual delivery.
- Verify message content.
- Verify guest details.
- Verify handling of incomplete requests.
- Verify duplicate message behavior.

### Security

- Verify webhook request validation.
- Verify HTTPS.
- Verify credential protection.
- Verify untrusted input handling.
- Verify safe logging.

### Compliance

- Verify consent language.
- Verify policy links.
- Verify required registration.
- Verify approved messaging language.

### End-to-End Acceptance

A complete live test
should demonstrate:

1. Valid website form submission.
2. Guest SMS successfully sent.
3. Twilio inbound receipt.
4. Studio workflow execution.
5. Parser response.
6. Correct field mapping.
7. Staff notification delivery.
8. Staff availability review.
9. Explicit guest confirmation.

### Verification Status

This complete sequence
has not yet been
marked verified.

## Operational Procedures

### Investigating a Missing Request

1. Confirm whether the guest sent the SMS.
2. Check the destination number.
3. Review Twilio message records.
4. Review Studio execution history.
5. Review parser execution results.
6. Check staff notification routing.
7. Escalate unresolved failures.

### Updating Message Formatting

1. Review the current website message.
2. Review parser compatibility.
3. Review Studio field mappings.
4. Update affected components.
5. Test legacy formats if required.
6. Deploy coordinated changes.
7. Perform a live verification test.

### Updating Staff Notifications

1. Confirm the approved destination.
2. Update the Studio configuration.
3. Publish the workflow.
4. Send a test reservation request.
5. Verify actual delivery.

### Handling an Outage

1. Identify the affected component.
2. Avoid claiming requests are confirmed.
3. Use the approved fallback communication channel.
4. Restore service.
5. Reconcile missed requests.
6. Document the incident.

## Implementation Status

| Capability | Status |
|---|---|
| Website reservation SMS preparation | Implemented |
| Restaurant SMS destination | Implemented |
| Mobile SMS handoff | Implemented |
| Desktop message fallback | Implemented |
| Twilio incoming message workflow | Implemented |
| Twilio Studio integration | Implemented |
| Reservation parser endpoint | Implemented |
| Separate first and last name parsing | Implemented |
| Legacy combined-name compatibility | Implemented |
| Studio structured field mapping | Implemented |
| Staff notification configuration | Implemented |
| Local parser testing | Verified |
| Parser deployment | Implemented |
| Production webhook security review | Verification pending |
| Live inbound SMS verification | Verification pending |
| Live Studio execution verification | Verification pending |
| Live staff notification delivery | Verification pending |
| Full end-to-end acceptance test | Verification pending |
| A2P messaging language approval | Pending Approval |
| Required messaging registration review | Verification pending |
| Monitoring and alerting | Under Evaluation |

## Related Documentation

- [Reservations Overview](README.md)
- [Reservation Workflow](reservation-workflow.md)
- [SMS Parsing](sms-parsing.md)
- [Admin Reservations](admin-reservations.md)
- [A2P Compliance](a2p-compliance.md)
- [Website Reservation Form](../02-website/reservation-form.md)
- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Reservation Management](../04-admin-dashboard/reservation-management.md)
- [Deployment Overview](../07-deployment/README.md)
- [Twilio Deployment](../07-deployment/twilio-deployment.md)
- [Troubleshooting](../08-operations/troubleshooting.md)
- [Master Documentation Index](../README.md)

---

[Back to Reservations Overview](README.md)
