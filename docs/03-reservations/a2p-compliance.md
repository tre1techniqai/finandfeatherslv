# RESERVATIONS — A2P Compliance

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Consent interface implemented; final messaging language, registration review, and compliance verification pending

**Feature:** SMS Messaging Compliance and A2P 10DLC

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Compliance Scope](#compliance-scope)
3. [Current Messaging Model](#current-messaging-model)
4. [Current Implementation](#current-implementation)
5. [A2P 10DLC Overview](#a2p-10dlc-overview)
6. [Messaging Registration](#messaging-registration)
7. [Consent and Opt-In](#consent-and-opt-in)
8. [Reservation Form Consent Experience](#reservation-form-consent-experience)
9. [Messaging Terms and Privacy Policy](#messaging-terms-and-privacy-policy)
10. [Message Content Requirements](#message-content-requirements)
11. [Opt-Out and HELP Handling](#opt-out-and-help-handling)
12. [Consent Records and Retention](#consent-records-and-retention)
13. [Twilio Configuration](#twilio-configuration)
14. [Staff Messaging Procedures](#staff-messaging-procedures)
15. [Data Protection and Security](#data-protection-and-security)
16. [Compliance Testing](#compliance-testing)
17. [Approval and Verification Process](#approval-and-verification-process)
18. [Operational Monitoring](#operational-monitoring)
19. [Change Management](#change-management)
20. [Risks and Open Decisions](#risks-and-open-decisions)
21. [Implementation Status](#implementation-status)
22. [Related Documentation](#related-documentation)

---

## Purpose

This document describes
the messaging compliance
requirements and review
process for the
Fin & Feathers Las Vegas
SMS reservation workflow.

It provides a reference
for evaluating:

- Application-to-person messaging.
- A2P 10DLC registration.
- Customer consent.
- Messaging disclosures.
- Privacy policy requirements.
- Opt-out handling.
- HELP requests.
- Message content.
- Staff communication.
- Recordkeeping.
- Operational monitoring.

This document does not
establish legal or
carrier compliance.

Final requirements
must be verified
with current Twilio
guidance and applicable
legal and regulatory
requirements.

## Compliance Scope

The reservation system
uses SMS communication
between guests and
restaurant staff.

### Relevant Activities

- Guest-initiated reservation requests.
- Incoming SMS processing.
- Twilio Studio workflows.
- Staff reservation notifications.
- Staff responses to guests.
- Reservation confirmations.
- Alternative reservation proposals.

### Outbound Messaging

Messages sent from
the restaurant's
messaging number
may be subject
to application-to-person
messaging requirements.

### Inbound Messaging

Guest-initiated
messages also require
appropriate privacy
and operational handling.

### Scope Verification

The restaurant must
confirm which messages
are sent by software,
which are sent manually,
and which messaging
registration requirements apply.

### Compliance Ownership

The business should
designate an authorized
person to approve
messaging policies
and registration information.

## Current Messaging Model

The website uses
a reservation request
workflow.

### Guest Initiation

The guest completes
the reservation form.

### SMS Preparation

The website prepares
a text message
containing reservation
details.

### Guest Sending

The guest sends
the message through
their SMS application.

### Twilio Reception

Twilio receives
the incoming message.

### Staff Notification

The Twilio workflow
supports staff
notification.

### Staff Confirmation

Staff review availability
and communicate
confirmation or
alternative arrangements.

### Important Boundary

Submitting the form
does not automatically
confirm a reservation.

### Messaging Classification

The final classification
of all outbound
message types must
be reviewed against
current provider rules.

## Current Implementation

**Status:** Partially implemented

The website includes
a required SMS
consent checkbox.

### Existing Form Elements

- Required SMS consent.
- Mobile Messaging Terms of Service link.
- Privacy Policy link.

### Existing Integration

The project includes:

- Twilio messaging.
- Twilio Studio.
- Reservation parsing.
- Staff notification configuration.

### Current Verification

The parser has
been locally tested
and deployed.

### Outstanding Work

- Final consent wording approval.
- Registration status verification.
- Opt-out behavior verification.
- HELP behavior verification.
- Production messaging review.
- Live end-to-end SMS testing.

### Approval Boundary

Existing consent controls
must not be interpreted
as proof of
full compliance.

## A2P 10DLC Overview

A2P 10DLC refers
to application-to-person
messaging using
10-digit long-code
telephone numbers
in the United States.

### General Purpose

The framework supports
registration and
oversight of
business messaging
traffic.

### Registration Concepts

Depending on the
applicable program,
registration may involve:

- Business identity.
- Brand information.
- Messaging use case.
- Campaign description.
- Sample messages.
- Opt-in process.
- Opt-out process.
- HELP handling.

### Applicability

The restaurant must
confirm the applicable
requirements for
its messaging number,
traffic type,
and Twilio configuration.

### Current Guidance

Provider and carrier
requirements can change.

Do not treat
this document as
a substitute for
current registration guidance.

### Approval Requirement

The business must
review and approve
the submitted
registration information.

## Messaging Registration

**Status:** Verification pending

The project must
confirm the current
registration status
of the restaurant's
messaging program.

### Business Information

Registration may require
accurate legal and
business identity details.

### Messaging Use Case

The registration
should accurately
describe reservation-related
communication.

### Sample Messages

Submitted examples
must represent
the actual messaging
experience.

### Opt-In Description

The registration
should explain
how customers
provide consent.

### Policy References

The registration
may require accessible
terms and privacy
policy references.

### Registration Status

The current registration
status must be
verified directly
in the provider
account.

### Rejection Handling

If registration
is rejected,
the business should
review the reason
and correct the
underlying information.

### Documentation

Record registration
status and approval
dates without
exposing account
credentials.

## Consent and Opt-In

Consent requirements
must be evaluated
for the actual
messaging use case.

### Clear Disclosure

Customers should
understand what
messages they
are agreeing to receive.

### Voluntary Consent

Consent should not
be hidden or
misrepresented.

### Specific Purpose

Reservation-related
messaging should
be described accurately.

### Required Checkbox

The current website
requires SMS consent
before proceeding.

### Consent Language

The final wording
requires business
and compliance approval.

### Marketing Separation

Consent for
reservation communications
should not be
assumed to authorize
unrelated marketing.

### Consent Withdrawal

Customers must
have an appropriate
way to withdraw
consent from
covered messaging.

### Source Verification

The implemented
consent wording
must be compared
with approved
messaging disclosures.

## Reservation Form Consent Experience

The reservation modal
is the primary
website consent
interaction.

### Existing Elements

- SMS consent checkbox.
- Messaging terms link.
- Privacy policy link.

### Checkbox Requirement

The guest must
complete the
required consent
step before
message preparation.

### Visibility

The disclosure
should be readable
and accessible.

### Plain Language

Consent text should
clearly describe
the communication purpose.

### Message Frequency

Any frequency disclosure
must reflect
actual messaging behavior.

### Rates Disclosure

Applicable message
and data rate
language must be
reviewed for accuracy.

### Opt-Out Instructions

Any required opt-out
instructions must
be presented
appropriately.

### Verification

The final form
should be tested
on mobile and desktop.

## Messaging Terms and Privacy Policy

The website provides
links to messaging
terms and privacy
policy information.

### Mobile Messaging Terms

The terms should
accurately describe
the messaging program.

### Privacy Policy

The privacy policy
should describe
relevant personal
information handling.

### Potential Topics

- Messaging purpose.
- Contact information.
- Consent.
- Message frequency.
- Opt-out instructions.
- Data handling.
- Service providers.
- Customer support.
- Policy changes.

### Policy Accuracy

Policies must reflect
the actual implemented
workflow.

### Link Availability

Links should be
accessible before
consent is given.

### Approval

Final legal and
policy wording
requires approval
from the business
and appropriate
qualified reviewers.

### Versioning

Policy changes
should be dated
and documented.

## Message Content Requirements

Messages must
accurately represent
the restaurant
and the messaging purpose.

### Business Identification

Outbound messages
should identify
the sender as
required by the
applicable messaging program.

### Reservation Context

Messages should
remain consistent
with reservation
communication.

### Confirmation Accuracy

A message must
not claim that
a reservation
is confirmed
before staff
have verified it.

### Sample Message Review

Registration examples
should match
actual production
message content.

### Sensitive Information

Avoid requesting
payment card details
through SMS.

### Marketing Content

Unrelated promotional
content may require
separate consent
and registration review.

### Template Approval

Any standard
staff response
templates should
be reviewed before
production use.

## Opt-Out and HELP Handling

**Status:** Verification pending

The messaging program
must support
applicable customer
opt-out and
assistance requirements.

### STOP Requests

The restaurant must
verify how STOP
and equivalent
opt-out requests
are processed.

### HELP Requests

The restaurant must
verify the response
to HELP requests.

### Provider Behavior

Twilio may provide
messaging features
that assist with
keyword handling,
depending on
the configured service.

### Configuration Review

Do not assume
automatic keyword
handling is active
without verifying
the deployed settings.

### Staff Responsibility

Staff should not
continue prohibited
messaging after
an effective opt-out.

### Re-Opt-In

Any re-subscription
process must follow
applicable requirements.

### Testing

Test opt-out and
HELP behavior
using approved
test procedures.

### Documentation

Record the verified
behavior and
responsible system.

## Consent Records and Retention

Consent recordkeeping
must be appropriate
for the messaging
program.

### Potential Record Elements

- Consent source.
- Consent timestamp.
- Disclosure version.
- Messaging purpose.
- Relevant customer identifier.
- Opt-out status.

These are conceptual
requirements, not
confirmed database fields.

### Current Persistence

The existence of
a required checkbox
does not establish
that consent records
are stored.

### Source Verification

Inspect the actual
website and database
implementation before
documenting persistence.

### Retention Policy

The business must
approve an appropriate
retention period.

### Access Control

Consent records
must be restricted
to authorized users.

### Data Minimization

Do not retain
unnecessary personal
information.

### Auditability

Changes to consent
status may require
a traceable history.

## Twilio Configuration

The messaging workflow
uses Twilio.

### Established Number

    (702) 546-6394

### Relevant Components

- Twilio messaging number.
- Twilio Studio.
- Reservation parser.
- Staff notification routing.

### Configuration Review

Verify:

- Number capabilities.
- Messaging registration.
- Incoming message routing.
- Outbound messaging behavior.
- Opt-out handling.
- HELP handling.
- Staff notification destination.

### Credentials

Twilio credentials
must remain private.

### Environment Separation

Production configuration
should be reviewed
separately from
development and testing.

### Configuration Changes

Changes should be
documented and
verified after publication.

## Staff Messaging Procedures

Restaurant staff
participate directly
in reservation communication.

### Approved Purpose

Staff should use
the messaging system
for authorized
reservation-related
communication.

### Confirmation

Staff must verify
availability before
sending confirmation.

### Alternative Proposals

Proposed alternatives
must not be described
as accepted bookings.

### Opt-Out Awareness

Staff must respect
applicable customer
messaging preferences.

### Customer Support

Staff should know
how to handle
HELP and support
requests.

### Escalation

Unusual or
compliance-sensitive
messages should
be escalated
appropriately.

### Training

The restaurant should
provide staff with
approved messaging
procedures and templates.

## Data Protection and Security

Messaging data
contains personal
information.

### Data Minimization

Collect and process
only necessary
reservation information.

### Guest Phone Numbers

Phone numbers
must be protected
from unnecessary
disclosure.

### SMS Limitations

SMS is not
end-to-end encrypted.

### Sensitive Information

Do not solicit
payment card
credentials through
reservation messaging.

### Provider Access

Twilio account access
should be restricted
to authorized users.

### API Credentials

Private credentials
must remain server-side.

### Webhook Validation

Inbound webhook
security should
be verified.

### Logging

Avoid exposing
unnecessary guest
message content.

### Retention

Retention and deletion
procedures must
be approved.

## Compliance Testing

### Consent Interface

- Verify checkbox requirement.
- Verify disclosure visibility.
- Verify terms link.
- Verify privacy link.
- Verify mobile layout.
- Verify desktop layout.

### Message Content

- Verify sender identification.
- Verify reservation purpose.
- Verify confirmation wording.
- Verify approved templates.
- Verify no misleading claims.

### Opt-Out

- Verify STOP behavior.
- Verify equivalent opt-out handling.
- Verify suppression of prohibited messages.
- Verify re-opt-in rules if applicable.

### HELP

- Verify HELP response.
- Verify customer support information.
- Verify provider configuration.

### Registration

- Verify business registration.
- Verify campaign status.
- Verify approved use case.
- Verify sample messages.
- Verify opt-in description.

### Security

- Verify private credentials.
- Verify webhook protection.
- Verify authorized access.
- Verify safe logging.

### End-to-End

- Send a live reservation request.
- Verify Twilio receipt.
- Verify parsing.
- Verify staff notification.
- Verify approved guest response.
- Verify confirmation language.

## Approval and Verification Process

The messaging program
should follow a
formal review process.

### Step 1 — Inventory Messages

Identify all
reservation-related
inbound and outbound
message types.

### Step 2 — Review Consent

Compare the website
consent experience
with applicable
requirements.

### Step 3 — Review Policies

Confirm messaging
terms and privacy
policy accuracy.

### Step 4 — Verify Registration

Check the current
Twilio registration
and campaign status.

### Step 5 — Verify Keyword Handling

Confirm STOP,
HELP, and related
keyword behavior.

### Step 6 — Review Templates

Approve customer-facing
message language.

### Step 7 — Test

Perform the approved
compliance and
integration tests.

### Step 8 — Record Approval

Document the
responsible reviewer,
approval date,
and outstanding issues.

### Step 9 — Monitor

Review the program
after material
configuration changes.

## Operational Monitoring

The restaurant should
maintain oversight
of its messaging program.

### Potential Monitoring Areas

- Registration status.
- Delivery failures.
- Opt-out requests.
- HELP requests.
- Customer complaints.
- Carrier filtering.
- Unexpected message volume.
- Configuration changes.

### Provider Dashboard

Review relevant
Twilio account
information when
investigating issues.

### Staff Reporting

Staff should have
a clear process
for escalating
messaging problems.

### Incident Records

Material incidents
should be documented.

### Periodic Review

Consent language,
policies, and
provider requirements
should be reviewed
periodically.

### Responsibility

Assign a business
owner for messaging
compliance monitoring.

## Change Management

Messaging changes
can affect compliance.

### Changes Requiring Review

- New message types.
- Marketing additions.
- New phone numbers.
- Consent wording changes.
- Policy changes.
- New automation.
- New messaging providers.
- Changes to opt-out handling.

### Website Coordination

Changes to the
reservation form
may affect consent
and message formatting.

### Twilio Coordination

Studio and messaging
configuration changes
may affect customer
communication.

### Registration Coordination

Material use-case
changes may require
registration review
or updates.

### Approval

Changes should
receive appropriate
business approval.

### Verification

Perform relevant
tests after changes.

## Risks and Open Decisions

### Registration Status

Current registration
status requires
direct verification.

### Consent Language

Final wording
requires approval.

### Opt-Out Handling

Production STOP
behavior must
be verified.

### HELP Handling

Production HELP
behavior must
be verified.

### Consent Persistence

Actual storage
of consent records
requires source
verification.

### Staff Templates

Approved customer
response language
must be confirmed.

### Message Classification

The full outbound
message inventory
requires review.

### Policy Accuracy

Terms and privacy
language must match
actual operations.

### Legal Review

Applicable legal
requirements should
be reviewed by
qualified advisors
where appropriate.

## Implementation Status

| Capability | Status |
|---|---|
| Required SMS consent checkbox | Implemented |
| Mobile Messaging Terms link | Implemented |
| Privacy Policy link | Implemented |
| Reservation SMS preparation | Implemented |
| Twilio messaging integration | Implemented |
| Twilio Studio workflow | Implemented |
| Reservation parser | Implemented |
| Parser deployment | Implemented |
| Final consent wording | Pending Approval |
| Messaging terms review | Pending Approval |
| Privacy policy review | Pending Approval |
| A2P registration status | Verification pending |
| Campaign use-case review | Verification pending |
| STOP handling | Verification pending |
| HELP handling | Verification pending |
| Consent record persistence | Source verification pending |
| Staff message templates | Pending Approval |
| Live end-to-end SMS testing | Verification pending |
| Compliance monitoring procedure | Planned |
| Formal compliance sign-off | Pending Approval |

## Related Documentation

- [Reservations Overview](README.md)
- [Reservation Workflow](reservation-workflow.md)
- [Twilio Integration](twilio-integration.md)
- [SMS Parsing](sms-parsing.md)
- [Admin Reservations](admin-reservations.md)
- [Website Reservation Form](../02-website/reservation-form.md)
- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Twilio Deployment](../07-deployment/twilio-deployment.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Troubleshooting](../08-operations/troubleshooting.md)
- [Master Documentation Index](../README.md)

---

[Back to Reservations Overview](README.md)
