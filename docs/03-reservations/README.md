# 03. Reservations

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Reservation Workflow Status:** Implemented; end-to-end verification pending

**A2P Compliance Status:** Pending Approval

---

## Table of Contents

1. [Reservations Overview](#reservations-overview)
2. [Customer Reservation Request](#customer-reservation-request)
3. [SMS Handoff](#sms-handoff)
4. [Twilio Integration](#twilio-integration)
5. [Reservation Processing](#reservation-processing)
6. [Manager Reservation Operations](#manager-reservation-operations)
7. [A2P Compliance](#a2p-compliance)
8. [Testing and Verification](#testing-and-verification)
9. [Implementation Status](#implementation-status)
10. [Detailed Documentation](#detailed-documentation)
11. [Related Documentation](#related-documentation)

---

## Reservations Overview

The Fin & Feathers Las Vegas reservation system
allows guests to prepare and send reservation
requests by SMS.

The workflow includes:

1. Guest completes the website reservation form.
2. Website prepares a formatted SMS message.
3. Guest sends the message from their device.
4. Twilio receives and processes the message.
5. Reservation information is made available
   for staff review.
6. Staff confirms the request or proposes
   an alternative arrangement.

A reservation request is not automatically
a confirmed reservation.

## Customer Reservation Request

The public reservation form collects:

- First name.
- Last name.
- Preferred reservation date.
- Preferred reservation time.
- Party size.
- Occasion.
- Required consent acknowledgments.

Current scheduling requirements include:

- A minimum two-hour advance notice.
- A maximum ninety-calendar-day booking window.
- Reservation times in thirty-minute increments.
- Party sizes from 1 to 20.
- A two-hour seating policy.

The current form behavior should be documented
in detail and verified against the application code.

## SMS Handoff

The reservation form prepares a formatted SMS
message using the information supplied by the guest.

The message includes separate first and last
name fields.

The guest must send the prepared message to
complete the SMS handoff.

Opening the device messaging application does
not mean the message has been sent.

Staff confirmation is required before a
reservation is considered confirmed.

## Twilio Integration

Twilio supports the reservation SMS workflow.

The existing integration includes:

- A reservation message parser.
- Twilio Studio workflow processing.
- Reservation information extraction.
- Staff-facing reservation details.
- Reservation ingestion functionality.

The parser supports separate first and last
name fields while maintaining compatibility
with the existing combined name format.

The exact Twilio configuration and deployed
function references should be documented
in the detailed integration guide.

## Reservation Processing

Reservation messages are parsed into structured
reservation information.

The processing workflow must account for:

- Required reservation details.
- Invalid or incomplete messages.
- Name field compatibility.
- Reservation date and time handling.
- Staff review.
- Reservation status changes.
- Duplicate or repeated requests.
- Error handling.

The precise handling of each scenario must
be verified against the current implementation.

## Manager Reservation Operations

The Admin Dashboard includes a Reservations
management area.

Current development has included:

- Reservation request review.
- Reservation detail views.
- Workflow preview and simulation routes.
- Staff-facing reservation information.

The production readiness of each operation
must be verified separately.

Future enhancements may include expanded
status management, reporting, and notifications.

## A2P Compliance

The SMS workflow is subject to applicable
messaging registration and compliance requirements.

Current project status:

- Owner approval of the proposed SMS conversation
  wording is pending.
- A2P submission or resubmission remains pending.
- Live SMS end-to-end testing must wait until
  the required approval is complete.

The documentation must not represent A2P
approval as complete until confirmed.

## Testing and Verification

Testing should distinguish between:

### Local and Simulated Testing

- Reservation form validation.
- SMS message formatting.
- Parser input and output.
- Simulated Twilio workflow scenarios.
- Admin Dashboard previews.

### Live End-to-End Testing

- Actual SMS submission.
- Twilio message receipt.
- Message parsing.
- Reservation ingestion.
- Staff notification.
- Staff confirmation workflow.

Live SMS testing must not proceed until
the necessary compliance approval is obtained.

## Implementation Status

| Capability | Status |
|---|---|
| Public reservation request form | Implemented |
| Separate first and last name fields | Verified |
| Ninety-calendar-day booking window | Verified |
| SMS message preparation | Verified |
| Twilio reservation parser | Implemented; locally tested |
| Twilio Studio integration | Implemented; live verification pending |
| Admin reservation views | In Development |
| Staff confirmation workflow | End-to-end verification pending |
| A2P approval | Pending Approval |
| Live SMS end-to-end test | Pending Approval |

## Detailed Documentation

The following documents will provide
implementation-specific information:

- [Reservation Workflow](reservation-workflow.md)
- [Twilio Integration](twilio-integration.md)
- [SMS Parsing](sms-parsing.md)
- [Admin Reservations](admin-reservations.md)
- [A2P Compliance](a2p-compliance.md)

These detailed documents will be created
and verified in subsequent documentation steps.

## Related Documentation

- [Website Overview](../02-website/README.md)
- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Authentication](../05-authentication/README.md)
- [Database & Storage](../06-database/README.md)
- [Deployment](../07-deployment/README.md)
- [Operations](../08-operations/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Master Documentation Index](../README.md)
