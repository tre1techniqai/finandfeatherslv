# Reservation Request Form

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Implemented; live SMS verification pending

**Public Access:** Homepage RESERVATIONS action

**Reservation Method:** Guest-initiated SMS request

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Reservation System Overview](#reservation-system-overview)
3. [Customer Reservation Workflow](#customer-reservation-workflow)
4. [Form Fields](#form-fields)
5. [Date and Time Rules](#date-and-time-rules)
6. [Party Size and Occasion](#party-size-and-occasion)
7. [SMS Consent](#sms-consent)
8. [Reservation Policies](#reservation-policies)
9. [Mobile SMS Handoff](#mobile-sms-handoff)
10. [Desktop Fallback](#desktop-fallback)
11. [Reservation Modal Behavior](#reservation-modal-behavior)
12. [Staff Confirmation](#staff-confirmation)
13. [Twilio Integration](#twilio-integration)
14. [Error Handling](#error-handling)
15. [Accessibility and Responsive Design](#accessibility-and-responsive-design)
16. [Security and Privacy](#security-and-privacy)
17. [Testing and Verification](#testing-and-verification)
18. [Implementation Status](#implementation-status)
19. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the public
reservation request form used by
Fin & Feathers Las Vegas customers.

The form allows guests to prepare
and send a reservation request
through SMS.

It is important to distinguish
a reservation request from
a confirmed reservation.

The form does not independently
guarantee table availability.

Restaurant staff must review
and confirm each request.

## Reservation System Overview

The public website includes
a RESERVATIONS action.

This opens a reservation modal.

The form collects the information
needed to prepare a structured
reservation request.

The guest then sends the request
using an SMS-capable device.

The established workflow uses
the restaurant's reservation
messaging number:

    (702) 546-6394

The current destination and
production messaging configuration
require verification.

### Core Principle

Submitting or preparing a request
does not confirm a reservation.

Guests must receive confirmation
from restaurant staff.

### System Responsibilities

The website is responsible for:

- Collecting guest information.
- Validating required fields.
- Enforcing booking rules.
- Preparing the SMS message.
- Explaining the confirmation process.

Twilio supports processing
incoming SMS requests.

Restaurant staff is responsible
for reviewing availability
and confirming arrangements.

## Customer Reservation Workflow

The established workflow is:

1. The guest selects RESERVATIONS.
2. The reservation modal opens.
3. The guest enters their name.
4. The guest selects a date.
5. The guest selects a time.
6. The guest selects party size.
7. The guest selects an occasion.
8. The guest accepts the required
   SMS consent checkbox.
9. The form validates the request.
10. The application prepares an SMS.
11. The guest sends the message.
12. Restaurant staff reviews the request.
13. Staff confirms the reservation
    or proposes an alternative.

The final confirmation is
a separate staff action.

## Form Fields

The established form includes
the following information.

| Field | Requirement |
|---|---|
| First name | Required |
| Last name | Required |
| Reservation date | Required |
| Reservation time | Required |
| Party size | Required |
| Occasion | Required |
| SMS consent | Required |

### First Name

The guest enters their first name.

The value must be validated
before generating the SMS request.

### Last Name

The guest enters their last name.

The current form uses separate
first-name and last-name fields.

The Twilio parser also supports
a legacy combined-name format.

### Reservation Date

The guest selects a date
using a calendar interface.

The selected date must satisfy
the booking window requirements.

### Reservation Time

The guest selects an available
time option.

Time selections use
30-minute increments.

### Party Size

The guest selects the
number of people attending.

The established supported
range is 1 through 20.

### Occasion

The occasion field is required.

The exact list of occasion
options must be verified
against the current form source.

### SMS Consent

The guest must explicitly accept
the required messaging consent.

Consent must not be assumed
from opening the modal.

## Date and Time Rules

The form enforces booking
date and time constraints.

### Minimum Lead Time

Reservation requests must be
at least two hours in advance.

### Maximum Booking Window

The established maximum
booking window is 90 calendar days.

### Time Increments

Reservation times are offered
in 30-minute increments.

### Reservation Hours

The previously established
time selection range is:

    10:00 AM through 10:00 PM

The current operating hours
and time selection implementation
require verification.

### Time Zone

Reservation dates and times
must be interpreted according
to the restaurant's local time.

The restaurant is located
in Las Vegas, Nevada.

Time-zone handling must account
for daylight saving time
where applicable.

### Date Validation

The form should reject:

- Past dates.
- Times inside the minimum
  lead-time window.
- Dates beyond the maximum
  booking window.
- Invalid date values.
- Invalid time selections.

The exact current validation
implementation requires verification.

## Party Size and Occasion

### Party Size Rules

The established party-size
range is:

    1 to 20 guests

Requests outside this range
must not be accepted through
the standard form.

Larger parties may require
a separately approved
restaurant contact workflow.

### Occasion Selection

The occasion field allows
the guest to identify
the purpose of the visit.

The current approved options
must be verified from the source.

Occasion selection should
not imply special arrangements
are automatically confirmed.

## SMS Consent

SMS consent is a required
part of the reservation workflow.

### Consent Requirements

The consent checkbox must:

- Be visible.
- Be clearly labeled.
- Require an explicit action.
- Remain unchecked by default.
- Be validated before SMS handoff.

### Messaging Disclosures

The form includes links
to messaging-related documents.

Established documents include:

- Mobile Messaging Terms of Service.
- Privacy Policy.

The exact current disclosure
language and destinations
require verification.

### Compliance

SMS messaging must follow
applicable consent and
messaging requirements.

Production messaging behavior
depends on the approved
Twilio configuration.

## Reservation Policies

### Two-Hour Seating Policy

The established restaurant policy
limits reservations to a
maximum two-hour seating period.

The period begins at the
scheduled reservation time
or the first guest's arrival,
according to the approved policy.

The exact published wording
must be verified against
the current reservation interface.

### Reservation Confirmation

A reservation request is
not a confirmed reservation.

Staff must confirm availability.

### Alternative Arrangements

If the requested date or time
cannot be accommodated,
staff may propose an alternative.

### Restaurant House Rules

The established house rules include:

**Age Requirement**

The restaurant is a 21+
establishment after 9:00 PM.

Guests should have valid
government-issued identification.

**Service Policy**

A 20% service charge applies
to checks over $100 and
parties of six or more.

These rules must be checked
against current approved
restaurant policy before
publication or modification.

## Mobile SMS Handoff

On compatible mobile devices,
the reservation form prepares
a text message for the guest.

### Expected Behavior

1. Validate all required fields.
2. Format the reservation details.
3. Open the device's SMS application.
4. Populate the destination number.
5. Populate the prepared message.
6. Allow the guest to send it.

### Important Limitation

Opening an SMS application
does not prove that a
message was sent.

The website must not treat
SMS handoff as successful
message delivery.

### Modal Persistence

The established design keeps
the reservation modal open
after initiating the SMS handoff.

The interface reminds the guest
to send the message and
wait for confirmation.

### Device Compatibility

SMS URI handling may vary
between mobile browsers
and operating systems.

Supported behavior must
be tested on actual devices.

## Desktop Fallback

Desktop browsers may not
support the same SMS handoff
as mobile devices.

The established fallback
provides an alternative way
to use the prepared message.

### Copy-to-Clipboard

The guest may copy
the formatted reservation
request.

### Manual Sending

The guest can send the message
using an available SMS-capable
application or device.

### Fallback Requirements

The desktop experience should:

- Display the prepared request.
- Provide clear instructions.
- Allow copying the message.
- Preserve entered information.
- Explain that staff confirmation
  is still required.

Clipboard failures should
be handled gracefully.

## Reservation Modal Behavior

The reservation form is
presented in a modal.

### Opening

The modal opens through
the RESERVATIONS action.

### Closing

The established behavior supports:

- A visible close button.
- The Escape key.

The modal should not close
when the guest clicks
the backdrop.

### Form Persistence

Form values should not be
discarded unexpectedly
during the SMS handoff.

### Keyboard Behavior

The modal should support:

- Keyboard navigation.
- Accessible labels.
- Appropriate focus management.
- A visible close control.
- Escape-key dismissal.

The exact implementation
requires source verification.

## Staff Confirmation

Restaurant staff reviews
incoming reservation requests.

### Staff Responsibilities

Staff may:

- Review the guest's details.
- Check reservation availability.
- Confirm the requested time.
- Propose an alternative.
- Communicate the final decision.

### Reservation Platform

The established operational
workflow references Yelp
Reservations for staff confirmation.

The current platform and
staff procedures require verification.

### Confirmation Requirement

The guest must not assume
the reservation is confirmed
until staff explicitly
communicates confirmation.

## Twilio Integration

Twilio supports the processing
of incoming reservation SMS messages.

### Existing Components

The established implementation includes:

- Twilio messaging.
- Twilio Studio.
- Reservation parsing.
- Staff notification processing.

### Reservation Parser

The established parser path is:

    twilio/functions/parse-reservation.js

The parser supports:

- Separate first and last names.
- Legacy combined-name input.
- Structured reservation fields.

The precise parser behavior
must be documented in the
Reservations category.

### Production Status

The parser has undergone
local testing and deployment.

Live end-to-end messaging
verification remains pending.

### A2P Compliance

Required A2P registration
and approval must be
verified before relying
on production SMS delivery.

## Error Handling

The reservation interface
should handle:

- Missing required fields.
- Invalid dates.
- Invalid times.
- Invalid party sizes.
- Missing SMS consent.
- Unsupported SMS handoff.
- Clipboard failures.
- Interrupted user actions.

### Validation Feedback

Validation messages should
identify the field or
condition requiring correction.

### Message Delivery

The website cannot reliably
confirm SMS delivery merely
by opening the SMS application.

The guest must receive
separate staff confirmation.

### Data Preservation

Recoverable errors should
not unnecessarily erase
the guest's entered information.

## Accessibility and Responsive Design

### Mobile

The form should provide:

- Touch-friendly controls.
- Readable field labels.
- Appropriate keyboard types.
- Usable date selection.
- Clear validation messages.
- Responsive modal dimensions.

### Desktop

The form should provide:

- Accessible keyboard navigation.
- A usable date picker.
- Readable consent language.
- Copy-to-clipboard fallback.
- Clear sending instructions.

### Accessibility

The form should support:

- Explicit field labels.
- Required-field indicators.
- Accessible error messages.
- Visible keyboard focus.
- Appropriate dialog semantics.
- Logical tab order.
- Accessible consent controls.

### Reduced Motion

Any modal animations should
respect reduced-motion
preferences where applicable.

## Security and Privacy

Reservation information
may contain personal data.

### Data Minimization

The form should collect
only information needed
for the reservation request.

### Consent Protection

Messaging consent must
be explicitly obtained.

### Secure Configuration

Twilio credentials must
remain outside public code.

### Logging

Sensitive guest information
should not be unnecessarily
exposed in logs.

### Staff Access

Any stored reservation data
must be protected through
appropriate authorization.

### Privacy Documentation

The messaging terms and
privacy policy should
accurately describe the
approved reservation workflow.

## Testing and Verification

### Form Validation

- Submit with missing first name.
- Submit with missing last name.
- Submit with missing date.
- Submit with missing time.
- Submit with missing party size.
- Submit with missing occasion.
- Submit without SMS consent.

### Booking Rules

- Test the two-hour lead time.
- Test the 90-day booking window.
- Test 30-minute time increments.
- Test the 1–20 party-size range.
- Test invalid dates and times.
- Verify local time-zone behavior.

### Mobile SMS

- Test supported mobile browsers.
- Verify destination number.
- Verify message formatting.
- Verify separate name fields.
- Verify modal persistence.
- Verify confirmation reminder.

### Desktop Fallback

- Verify formatted message display.
- Verify copy-to-clipboard behavior.
- Verify manual sending instructions.
- Verify clipboard error handling.

### Modal Behavior

- Open the modal.
- Close using the close button.
- Close using Escape.
- Confirm backdrop clicks
  do not dismiss the modal.
- Verify keyboard focus behavior.

### Policy and Consent

- Verify seating policy wording.
- Verify consent checkbox.
- Verify messaging terms link.
- Verify privacy policy link.
- Verify approved house rules.

### Twilio Verification

- Verify parser input handling.
- Verify structured field extraction.
- Verify Studio field mapping.
- Verify staff notification formatting.
- Complete approved live testing
  when messaging compliance permits.

## Implementation Status

| Capability | Status |
|---|---|
| Reservation modal | Implemented |
| First and last name fields | Implemented |
| Date selection | Implemented |
| Time selection | Implemented |
| Party size selection | Implemented |
| Occasion selection | Implemented |
| Required SMS consent | Implemented |
| Two-hour lead-time rule | Implemented; verification pending |
| 90-day booking window | Implemented; verification pending |
| Thirty-minute time increments | Implemented |
| Two-hour seating policy | Implemented; wording verification pending |
| Mobile SMS handoff | Implemented; device verification pending |
| Desktop fallback | Implemented; verification pending |
| Modal persistence after SMS handoff | Implemented; verification pending |
| Staff confirmation workflow | Established; operational verification pending |
| Twilio parser | Implemented and locally tested |
| Twilio Studio integration | Implemented; verification pending |
| A2P approval | Pending verification |
| Live end-to-end SMS delivery | Not yet verified |

## Related Documentation

- [Website Overview](README.md)
- [Homepage](homepage.md)
- [Menu System](menu-system.md)
- [Animations](animations.md)
- [Reservations Overview](../03-reservations/README.md)
- [Reservation Workflow](../03-reservations/reservation-workflow.md)
- [Twilio Integration](../03-reservations/twilio-integration.md)
- [SMS Parsing](../03-reservations/sms-parsing.md)
- [A2P Compliance](../03-reservations/a2p-compliance.md)
- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Website Overview](README.md)
