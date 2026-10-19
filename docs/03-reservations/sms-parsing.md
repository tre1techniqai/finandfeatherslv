# RESERVATIONS — SMS Parsing

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Parser implemented, locally tested, and deployed; live end-to-end verification pending

**Feature:** Reservation SMS Message Parsing

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Parsing Objectives](#parsing-objectives)
3. [Current Implementation](#current-implementation)
4. [Parsing Architecture](#parsing-architecture)
5. [Incoming Message Format](#incoming-message-format)
6. [Parser Endpoint](#parser-endpoint)
7. [Guest Name Parsing](#guest-name-parsing)
8. [Reservation Date Parsing](#reservation-date-parsing)
9. [Reservation Time Parsing](#reservation-time-parsing)
10. [Party Size Parsing](#party-size-parsing)
11. [Occasion Parsing](#occasion-parsing)
12. [Structured Parser Output](#structured-parser-output)
13. [Twilio Studio Field Mapping](#twilio-studio-field-mapping)
14. [Legacy Message Compatibility](#legacy-message-compatibility)
15. [Input Validation](#input-validation)
16. [Malformed and Incomplete Messages](#malformed-and-incomplete-messages)
17. [Security and Privacy](#security-and-privacy)
18. [Error Handling and Recovery](#error-handling-and-recovery)
19. [Testing Strategy](#testing-strategy)
20. [Deployment and Change Management](#deployment-and-change-management)
21. [Operational Monitoring](#operational-monitoring)
22. [Implementation Status](#implementation-status)
23. [Related Documentation](#related-documentation)

---

## Purpose

This document describes
the SMS parsing component
used by the Fin & Feathers
Las Vegas reservation system.

The parser processes
incoming reservation messages
and extracts information
for the Twilio Studio
staff notification workflow.

The document covers:

- Message structure.
- Guest name parsing.
- Reservation date.
- Reservation time.
- Party size.
- Occasion.
- Structured output.
- Legacy compatibility.
- Validation.
- Error handling.
- Testing.
- Deployment.

The parser processes
reservation requests.

It does not independently
confirm restaurant availability.

## Parsing Objectives

The parser should transform
a guest's reservation
message into reliable
structured information.

### Primary Objectives

- Extract guest details.
- Preserve reservation intent.
- Support the current form format.
- Maintain legacy compatibility.
- Handle unexpected messages safely.
- Supply values to Twilio Studio.
- Avoid misleading staff notifications.

### Data Accuracy

Parsed values should
reflect the information
actually provided
by the guest.

### Failure Safety

Missing or ambiguous
information must not
be silently invented.

### Maintainability

Changes to website
message formatting
should be coordinated
with parser updates.

## Current Implementation

**Status:** Implemented

The project has
an established
reservation parser.

### Endpoint

    /parse-reservation

### Current Name Support

The parser supports
separate first-name
and last-name fields.

### Legacy Support

The parser also
supports the earlier
combined `name` field.

### Twilio Integration

The parser is used
within the Twilio
Studio reservation workflow.

### Local Testing

Local parser tests
have been completed.

### Deployment

The parser has
been deployed.

### Verification Outstanding

The complete live
SMS-to-staff-notification
workflow remains
unverified end to end.

### Source Review

Exact parsing rules,
response field names,
and error codes
should be verified
against the deployed
source before being
treated as a formal
API contract.

## Parsing Architecture

The parser sits
between inbound SMS
processing and
staff notification.

### Workflow

1. Guest sends a reservation SMS.
2. Twilio receives the message.
3. Twilio Studio invokes the parser.
4. Parser reads the message content.
5. Parser extracts reservation fields.
6. Parser returns structured values.
7. Studio maps the returned fields.
8. Staff notification uses those values.

### Integration Boundary

The parser extracts
request information.

### Not a Booking Engine

The parser does not:

- Check live table availability.
- Create a Yelp reservation.
- Confirm a guest reservation.
- Process payments.

### Staff Responsibility

Staff remain responsible
for reviewing and
confirming requests.

## Incoming Message Format

The website prepares
a structured SMS
from validated
reservation form data.

### Expected Information

- First name.
- Last name.
- Date.
- Time.
- Party size.
- Occasion.

### Current Format

The current form
uses separate guest
name fields.

### Legacy Format

Older messages may
contain a single
combined name field.

### Format Stability

Changes to labels,
field order,
punctuation,
or line breaks
may affect parsing.

### Canonical Examples

The exact current
message template
should be copied
from the application
source during
API-contract verification.

### Important Constraint

Do not invent
a canonical message
format based solely
on documentation.

## Parser Endpoint

The established
parser endpoint is:

    /parse-reservation

### Endpoint Responsibility

The endpoint accepts
the message content
through the configured
integration request.

### Request Method

The exact HTTP method
and request-body schema
must be verified
against source code.

### Response

The endpoint returns
values used by
Twilio Studio.

### Response Contract

Exact JSON keys,
value types,
and failure responses
require source verification.

### Availability

The endpoint must
remain reachable
from the configured
Twilio workflow.

### HTTPS

Production integration
traffic should use
HTTPS.

### Security

Inbound requests
must be treated
as untrusted
until appropriately
validated.

## Guest Name Parsing

Guest name parsing
supports both current
and legacy formats.

### Current Fields

The current reservation
workflow uses:

- First name.
- Last name.

### First Name

Represents the
guest's given name.

### Last Name

Represents the
guest's family name.

### Legacy Field

The earlier workflow
used a combined:

    name

### Compatibility

The parser supports
the legacy combined
name format.

### Ambiguous Names

Names may contain:

- Multiple words.
- Hyphens.
- Apostrophes.
- Additional family-name components.

### Data Integrity

The parser should
not assume that
every guest name
contains exactly
two words.

### Missing Names

Missing name fields
must be handled
according to the
verified parser contract.

### Staff Notification

Parsed name fields
must map correctly
into Studio notifications.

## Reservation Date Parsing

The parser extracts
the requested
reservation date.

### Date Source

The date originates
from the website's
reservation form.

### Local Interpretation

The date should
represent the restaurant's
local calendar date.

### Date Formatting

The exact accepted
date format must
be verified in
the parser source.

### Invalid Dates

Malformed or impossible
dates should not
be treated as
valid reservations.

### Booking Window

The website currently
uses a 90-calendar-day
booking horizon.

### Validation Boundary

Website validation
does not eliminate
the need for safe
server-side parsing.

### Staff Review

Staff must still
verify actual availability.

## Reservation Time Parsing

The parser extracts
the guest's requested
reservation time.

### Website Time Window

Established reservation
time range:

    10:00 AM–10:00 PM

### Time Increments

The website uses
30-minute increments.

### Minimum Lead Time

The website enforces
a two-hour
minimum lead time.

### Accepted Format

The exact accepted
SMS time format
must be confirmed
from parser source.

### Ambiguous Times

Messages with
unclear time values
should not produce
invented confirmations.

### Time Zone

The request must
be interpreted
in the restaurant's
local time.

### Staff Responsibility

Staff review the
requested time
against availability.

## Party Size Parsing

The parser extracts
the requested
number of guests.

### Website Range

The established
party-size range is:

    1–20

### Expected Value

Party size should
represent a valid
whole number.

### Invalid Values

Invalid values
must not be
silently accepted.

### Missing Values

Missing party size
should be handled
as an incomplete
reservation request.

### Staff Notification

The notification
should accurately
display the
requested party size.

### Availability

Party size may
affect available
reservation options.

## Occasion Parsing

The parser extracts
the guest's
selected occasion.

### Required Website Field

The reservation form
requires an occasion.

### Approved Options

The website uses
an approved list
of occasion values.

### Parser Responsibility

The parser should
preserve the
guest's selected
occasion accurately.

### Unexpected Values

Unexpected occasion
text should be
handled safely.

### Missing Occasion

Missing values
should not be
invented.

### Staff Context

Occasion information
supports staff
reservation preparation.

## Structured Parser Output

The parser returns
structured values
to the Twilio
Studio workflow.

### Conceptual Fields

The integration requires
information representing:

- First name.
- Last name.
- Date.
- Time.
- Party size.
- Occasion.

### Legacy Compatibility

The parser also
supports the legacy
combined-name input.

### Exact Field Names

The deployed output
field names must
be verified from
the source code.

### Data Types

Expected data types
must be confirmed
before documenting
a strict schema.

### Missing Values

The parser must
define how absent
or invalid values
are represented.

### No Fabricated Data

The parser should
not manufacture
reservation details
that were not supplied.

### Response Stability

Changing output keys
may break Studio
field mappings.

## Twilio Studio Field Mapping

Twilio Studio consumes
the parser's
structured response.

### Current Integration

Studio has been
updated to use
separate guest
name values.

### Mapped Information

- Guest first name.
- Guest last name.
- Reservation date.
- Reservation time.
- Party size.
- Occasion.

### Field References

The exact Studio
variable references
should be verified
against the published
Studio flow.

### Compatibility

Parser output changes
must be coordinated
with Studio configuration.

### Deployment Sequence

Changes should be
tested together
before production
activation.

### Staff Verification

A live test must
confirm that the
notification displays
correct values.

## Legacy Message Compatibility

**Status:** Implemented

The parser supports
an earlier message
format containing
a combined name.

### Reason

Legacy support reduces
the risk that
older prepared messages
will fail unexpectedly.

### Current Format

The current website
uses separate
first and last names.

### Legacy Format

The previous workflow
used the combined
`name` field.

### Compatibility Testing

Tests should include
both message formats.

### Removal Policy

Legacy support
should not be removed
without evaluating
remaining dependencies.

### Documentation

Any compatibility
changes must be
recorded in
deployment documentation.

## Input Validation

Incoming SMS content
must be treated
as untrusted input.

### Message Presence

Verify that the
expected message
content is available.

### Field Extraction

Extract only values
supported by the
message structure.

### Name Validation

Handle missing or
unexpected name content.

### Date Validation

Reject or flag
invalid date values.

### Time Validation

Reject or flag
invalid time values.

### Party Size Validation

Reject or flag
invalid party sizes.

### Occasion Validation

Handle missing or
unexpected occasion values.

### Length Limits

The implementation
should evaluate
reasonable input limits.

### Error Contract

The exact validation
behavior must be
verified from
deployed source.

## Malformed and Incomplete Messages

Not every incoming
message will match
the expected template.

### Potential Cases

- Empty message.
- Missing name.
- Missing date.
- Missing time.
- Missing party size.
- Missing occasion.
- Unexpected field labels.
- Extra unrelated text.
- Unsupported date format.
- Unsupported time format.

### Parser Response

The parser should
return a predictable
result for invalid
or incomplete input.

### Staff Review

Incomplete messages
may require manual
follow-up.

### False Positives

The parser must
avoid treating
unrelated SMS messages
as valid reservations.

### Error Visibility

Failures should be
visible through
appropriate operational
logs or workflow results.

### No Automatic Confirmation

Malformed requests
must never result
in automatic
reservation confirmation.

## Security and Privacy

Reservation messages
contain guest information.

### Data Minimization

Process only information
needed for the
reservation workflow.

### Untrusted Content

Do not execute
instructions contained
inside SMS messages.

### Injection Safety

Message content
must not be treated
as executable code
or trusted query syntax.

### Request Authentication

Twilio webhook
validation requirements
must be reviewed
against the deployed
integration architecture.

### Credentials

Private Twilio
credentials must
remain server-side.

### Logging

Avoid unnecessary
storage of guest
names, phone numbers,
and message bodies.

### Error Responses

Do not expose
private application
configuration.

### Retention

Data retention
must follow approved
privacy requirements.

## Error Handling and Recovery

### Missing Message Body

Return the
appropriate verified
error or incomplete
result.

### Invalid Format

Do not fabricate
missing reservation fields.

### Parser Exception

The endpoint should
fail predictably.

### Studio Mapping Failure

Investigate response
keys and Studio
variable references.

### Parser Unavailable

Twilio Studio must
not assume the
parser succeeded.

### Duplicate Messages

Repeated messages
should not automatically
create duplicate
confirmed reservations.

### Manual Review

Staff should have
an approved way
to handle messages
that cannot be parsed.

### Incident Documentation

Recurring failures
should be documented
for investigation.

## Testing Strategy

### Current-Format Tests

- Separate first name.
- Separate last name.
- Valid date.
- Valid time.
- Valid party size.
- Valid occasion.

### Legacy Tests

- Combined name.
- Compatibility with previous formatting.
- Correct staff notification mapping.

### Name Edge Cases

- Hyphenated names.
- Apostrophes.
- Multiword names.
- Missing name fields.

### Date Tests

- Valid date.
- Invalid date.
- Missing date.
- Unexpected format.

### Time Tests

- Valid time.
- Invalid time.
- Missing time.
- Unexpected format.

### Party Size Tests

- Valid party size.
- Missing party size.
- Non-numeric value.
- Out-of-range value.

### Occasion Tests

- Approved occasion.
- Missing occasion.
- Unexpected occasion text.

### Message Robustness

- Empty message.
- Extra whitespace.
- Unexpected line breaks.
- Unrelated SMS content.
- Very long message.

### Integration Tests

- Studio invokes parser.
- Parser returns expected values.
- Studio maps output correctly.
- Staff notification displays correct details.

### Live End-to-End Test

1. Complete the website form.
2. Send the prepared SMS.
3. Verify Twilio reception.
4. Verify Studio execution.
5. Verify parser invocation.
6. Verify structured output.
7. Verify staff notification delivery.
8. Verify staff review and confirmation.

### Current Verification

Local parser testing
has been completed.

The live end-to-end
test remains pending.

## Deployment and Change Management

### Parser Deployment

The parser has
been deployed.

### Website Dependency

Website message formatting
is a parser dependency.

### Studio Dependency

Studio output mappings
depend on the
parser response.

### Coordinated Changes

Changes affecting
message format
or response fields
must be tested
across all components.

### Compatibility Testing

Preserve legacy support
unless its removal
is approved.

### Deployment Verification

After changes:

1. Verify endpoint availability.
2. Test current message format.
3. Test legacy message format.
4. Verify Studio mappings.
5. Verify staff notification.
6. Record test results.

### Rollback

Maintain an approved
rollback procedure
for incompatible changes.

## Operational Monitoring

### Parser Availability

Monitor whether
the endpoint
responds reliably.

### Error Frequency

Track recurring
parsing failures.

### Message Format Changes

Investigate unexpected
incoming formats.

### Studio Failures

Review Studio
execution history
when parsing
or mapping fails.

### Staff Notification Failures

Confirm that
parsed messages
reach staff.

### Sensitive Information

Operational logs
must avoid unnecessary
exposure of
guest information.

### Ownership

The project should
define responsibility
for parser monitoring
and incident response.

## Implementation Status

| Capability | Status |
|---|---|
| Reservation parser endpoint | Implemented |
| Current structured message parsing | Implemented |
| Separate first-name parsing | Implemented |
| Separate last-name parsing | Implemented |
| Legacy combined-name compatibility | Implemented |
| Reservation date extraction | Implemented |
| Reservation time extraction | Implemented |
| Party-size extraction | Implemented |
| Occasion extraction | Implemented |
| Twilio Studio integration | Implemented |
| Studio field mapping | Implemented |
| Local parser tests | Verified |
| Parser deployment | Implemented |
| Exact API contract documentation | Verification pending |
| Production webhook security review | Verification pending |
| Live Twilio invocation | Verification pending |
| Live staff notification | Verification pending |
| Full end-to-end acceptance test | Verification pending |
| Operational monitoring policy | Under Evaluation |

## Related Documentation

- [Reservations Overview](README.md)
- [Reservation Workflow](reservation-workflow.md)
- [Twilio Integration](twilio-integration.md)
- [Admin Reservations](admin-reservations.md)
- [A2P Compliance](a2p-compliance.md)
- [Website Reservation Form](../02-website/reservation-form.md)
- [Twilio Deployment](../07-deployment/twilio-deployment.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Troubleshooting](../08-operations/troubleshooting.md)
- [Master Documentation Index](../README.md)

---

[Back to Reservations Overview](README.md)
