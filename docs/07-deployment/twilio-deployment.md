# DEPLOYMENT — Twilio Deployment

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Twilio reservation messaging infrastructure established; incoming SMS processing and parser deployed; live end-to-end verification and A2P compliance approval pending

**Feature:** SMS Reservation Infrastructure, Webhooks, Compliance, and Production Operations

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Deployment Objectives](#deployment-objectives)
3. [Current Implementation](#current-implementation)
4. [Twilio Architecture](#twilio-architecture)
5. [Reservation SMS Workflow](#reservation-sms-workflow)
6. [Twilio Account and Phone Number](#twilio-account-and-phone-number)
7. [Twilio Studio Integration](#twilio-studio-integration)
8. [Reservation Parsing Endpoint](#reservation-parsing-endpoint)
9. [Incoming Webhook Configuration](#incoming-webhook-configuration)
10. [Webhook Security](#webhook-security)
11. [Message Parsing and Validation](#message-parsing-and-validation)
12. [Reservation Data Handling](#reservation-data-handling)
13. [Guest Consent and Messaging Compliance](#guest-consent-and-messaging-compliance)
14. [A2P 10DLC Compliance](#a2p-10dlc-compliance)
15. [Environment Variables and Credentials](#environment-variables-and-credentials)
16. [Vercel Deployment Integration](#vercel-deployment-integration)
17. [Testing Environments](#testing-environments)
18. [End-to-End Testing](#end-to-end-testing)
19. [Monitoring and Logging](#monitoring-and-logging)
20. [Error Handling and Retries](#error-handling-and-retries)
21. [Operational Security and Privacy](#operational-security-and-privacy)
22. [Failure Recovery](#failure-recovery)
23. [Production Readiness Checklist](#production-readiness-checklist)
24. [Manager Operations](#manager-operations)
25. [Implementation Roadmap](#implementation-roadmap)
26. [Implementation Status](#implementation-status)
27. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the deployment architecture and operational requirements for Twilio messaging within the Fin & Feathers Las Vegas website.

Twilio supports the restaurant's reservation request workflow.

The website prepares an SMS message containing the guest's requested reservation information.

The guest must send that message.

Incoming messages are processed through the established Twilio infrastructure.

The restaurant staff remains responsible for confirming reservations through the approved operational process.

This document addresses:

- Twilio infrastructure.
- Reservation SMS handoff.
- Twilio Studio.
- Incoming message webhooks.
- Reservation parsing.
- Message validation.
- Guest consent.
- A2P 10DLC compliance.
- Environment configuration.
- Vercel integration.
- Testing.
- Monitoring.
- Error handling.
- Security.
- Production readiness.
- Recovery.

This document does not represent a reservation request as a confirmed booking.

## Deployment Objectives

The Twilio integration should support reliable and compliant reservation communication.

### Reliable Message Handoff

Guests should be able to initiate the intended SMS reservation request.

### Accurate Processing

Incoming messages should be interpreted without changing the guest's intended details.

### Operational Clarity

Staff should understand which requests require review or confirmation.

### Security

Webhook requests and messaging credentials must be protected.

### Compliance

Messaging behavior must follow applicable consent and carrier requirements.

### Traceability

Processing failures should be diagnosable.

### Privacy

Guest contact information should be handled appropriately.

### Recovery

The restaurant should have an approved procedure when automated messaging fails.

### Honest Confirmation

The website must not imply that an SMS request guarantees a reservation.

## Current Implementation

**Status:** Messaging infrastructure established; production acceptance pending

### Messaging Provider

    Twilio

### Reservation SMS Number

    (702) 546-6394

### Public Reservation Interface

The website includes a reservation request modal.

### Guest Handoff

The modal prepares an SMS message for the guest to send.

### Incoming Processing

Twilio Studio is part of the incoming message workflow.

### Reservation Parser

A reservation parsing endpoint has been deployed.

### Established Parser Path

    /parse-reservation

### Local Verification

Parser functionality has undergone local testing.

### Production Verification

Complete live end-to-end verification remains pending.

### A2P Compliance

Approval remains pending.

### Staff Confirmation

Staff confirms reservations through the established operational process involving Yelp Reservations.

### Important Boundary

A deployed endpoint and successful local parser tests do not establish that every production SMS scenario works.

## Twilio Architecture

The reservation messaging workflow spans multiple systems.

### Public Website

    Next.js App Router

### Hosting

    Vercel

### Messaging Provider

    Twilio

### Incoming Workflow

    Twilio Studio

### Parsing Service

    /parse-reservation

### Staff Reservation Operations

    Yelp Reservations

### Guest Device

The guest's messaging application sends the prepared SMS.

### Operational Flow

    Guest Reservation Form
            |
            v
    Prepared SMS Message
            |
            v
    Guest Sends Message
            |
            v
    Twilio Phone Number
            |
            v
    Twilio Studio Workflow
            |
            v
    Reservation Parsing Endpoint
            |
            v
    Processing Result / Staff Workflow
            |
            v
    Staff Reviews and Confirms

### Architecture Boundary

The exact downstream staff notification and persistence behavior requires live configuration and source verification.

## Reservation SMS Workflow

The website provides a reservation request form.

### Required Information

The form includes:

- First name.
- Last name.
- Reservation date.
- Reservation time.
- Party size.
- Occasion.
- SMS consent.

### Time Increments

    30 minutes

### Reservation Hours

    10:00 AM–10:00 PM

### Minimum Lead Time

    2 hours

### Maximum Advance Window

    90 calendar days

### Party Size

    1–20 guests

### Seating Duration

    Maximum 2 hours

### Message Preparation

The website creates a formatted reservation request.

### Guest Action

The guest must send the SMS message.

### Staff Action

The restaurant reviews and confirms the request.

### Confirmation Boundary

A submitted SMS is not an automatically confirmed reservation.

## Twilio Account and Phone Number

The messaging infrastructure depends on an approved Twilio account.

### Provider

    Twilio

### Established Number

    (702) 546-6394

### Number Ownership

The number must remain associated with the intended restaurant messaging account.

### Account Access

Only authorized personnel should administer the Twilio account.

### Billing

The account must remain in good standing.

### Messaging Capabilities

The actual enabled number capabilities should be verified.

### Incoming Messages

Incoming SMS routing must point to the approved Studio workflow or webhook configuration.

### Outbound Messages

Any automated outbound messages require approved functionality and compliance.

### Number Changes

Changing the number affects the website and messaging configuration.

### Verification

Confirm the number, account, and incoming routing directly in Twilio.

## Twilio Studio Integration

Twilio Studio provides configurable messaging workflows.

### Existing Integration

The project uses Twilio Studio for incoming reservation messages.

### Incoming Trigger

An incoming message starts the configured processing workflow.

### Processing

The workflow may pass message content to the reservation parser.

### Branching

Workflow decisions should follow approved parsing outcomes.

### Error Handling

Unexpected processing results require defined handling.

### Staff Routing

Any staff-facing notification behavior must be verified from the actual Studio configuration.

### Publishing

Changes to a Studio flow must be published through the approved process.

### Version Awareness

A draft flow may differ from the published flow.

### Logging

Studio execution logs may assist troubleshooting.

### Verification Boundary

The complete published Studio flow and widget configuration require direct inspection.

## Reservation Parsing Endpoint

The application includes a reservation parsing endpoint.

### Established Path

    /parse-reservation

### Hosting

The parser is deployed within the application's production infrastructure.

### Purpose

Interpret incoming reservation message content.

### Expected Input

The parser receives messaging data through the configured integration.

### Output

The parser should return a result compatible with the calling workflow.

### Validation

Required reservation fields must be validated.

### Error Handling

Malformed messages must produce a controlled outcome.

### Sensitive Data

Incoming message content may include guest personal information.

### Logging

Avoid unnecessary exposure of guest details.

### Runtime

The exact route file, request schema, and runtime configuration require source inspection.

### Important Boundary

The existence of the deployed endpoint does not prove that its production webhook is correctly authenticated or configured.

## Incoming Webhook Configuration

Twilio must send incoming message events to the intended destination.

### Entry Point

The restaurant's Twilio phone number receives an SMS.

### Studio Routing

Incoming messages are processed through the configured Studio workflow.

### Parser Invocation

The workflow invokes the reservation parsing endpoint as configured.

### Production URL

The complete webhook URL must be confirmed from the deployed configuration.

### HTTPS

Webhook requests should use HTTPS.

### Request Method

The configured HTTP method must match the endpoint implementation.

### Content Format

The parser must handle the actual request format sent by Twilio or Studio.

### Timeouts

The endpoint must respond within the calling workflow's operational limits.

### Error Responses

Failure responses should be handled deliberately.

### Verification

Inspect the live Studio configuration and perform controlled production tests.

## Webhook Security

Webhook endpoints require explicit security controls.

### Trust Boundary

A publicly reachable URL is not inherently a trusted Twilio request.

### Request Authentication

Use an approved mechanism to authenticate the webhook caller.

### Twilio Signatures

Where applicable, verify Twilio request signatures using the provider's documented method.

### Studio HTTP Requests

Studio-originated HTTP requests may require a different authentication design depending on the actual request mechanism.

### Configuration Review

Confirm which security mechanism the deployed Studio invocation supports.

### Secret Handling

Keep webhook authentication secrets server-side.

### Input Validation

Treat all incoming fields as untrusted.

### Replay Protection

Evaluate duplicate and replayed request handling.

### Error Disclosure

Do not reveal credentials or sensitive internal details.

### Verification Boundary

The deployed webhook authentication implementation requires direct source and configuration inspection.

## Message Parsing and Validation

Incoming reservation messages must be parsed consistently.

### Required Fields

The intended reservation request includes:

- Guest identity.
- Requested date.
- Requested time.
- Party size.
- Occasion.

### Message Format

The parser should recognize the actual message format generated by the website.

### Date Validation

Dates must be interpreted correctly.

### Time Validation

Time values must be unambiguous.

### Party Size Validation

Invalid party sizes should be rejected or flagged.

### Missing Fields

Incomplete messages require a controlled result.

### Unexpected Content

Additional text should not silently alter reservation details.

### Duplicate Messages

Repeated messages should not produce unintended duplicate operational actions.

### Parser Errors

Failures should be visible to the appropriate operational process.

### Testing

Use representative valid, incomplete, malformed, and duplicate messages.

## Reservation Data Handling

Reservation messages may contain personal information.

### Guest Name

Names are required for reservation processing.

### Phone Number

The sender's number may be available through Twilio message metadata.

### Requested Date

The request includes a desired reservation date.

### Requested Time

The request includes a desired time.

### Party Size

The request includes the number of guests.

### Occasion

The request includes the selected occasion.

### Consent

The website requires SMS consent during request preparation.

### Storage

The exact persistence architecture must be verified.

### Retention

An approved data retention policy is required.

### Access

Only authorized staff should access private reservation details.

### External Services

Twilio and Yelp Reservations have their own data handling boundaries.

### Important Boundary

Do not assume incoming messages are persisted in Supabase without verifying the deployed implementation.

## Guest Consent and Messaging Compliance

Messaging must respect guest consent and applicable rules.

### Website Consent

The reservation form includes a required SMS consent checkbox.

### Guest-Initiated Message

The guest sends the prepared reservation request.

### Disclosure

The interface should clearly explain the messaging purpose.

### Message Frequency

Any automated follow-up messaging requires appropriate disclosure.

### Opt-Out

Automated messaging must honor applicable opt-out requirements.

### Help Requests

Where required, messaging programs should provide appropriate help information.

### Terms

Mobile messaging terms should remain accessible.

### Privacy Policy

The privacy policy should describe relevant information handling.

### Consent Records

Any stored consent records require an approved data model.

### Compliance Review

The business must verify applicable requirements before enabling additional outbound messaging.

## A2P 10DLC Compliance

A2P 10DLC is relevant to business messaging over U.S. long-code numbers.

### Current Status

    Approval pending

### Brand Registration

The applicable business registration must be reviewed.

### Campaign Registration

The messaging use case must be accurately described.

### Message Samples

Submitted samples should reflect actual intended messaging.

### Consent Description

Registration details should accurately describe how users opt in.

### Opt-Out Handling

The messaging program must support required opt-out behavior.

### Help Handling

Required help responses must be addressed.

### Carrier Review

Carrier approval and filtering behavior are outside the application's direct control.

### Deployment Boundary

A working application endpoint does not establish A2P approval.

### Verification

Confirm the current registration status directly in Twilio before relying on production outbound messaging.

## Environment Variables and Credentials

Twilio integrations may require private configuration.

### Account Credentials

Credentials must remain server-side.

### Authentication Tokens

Never expose private authentication tokens in browser code.

### Webhook Secrets

Store any webhook authentication secrets securely.

### Local Development

Use approved local environment configuration.

### Vercel

Use environment-specific server-side settings.

### Git

Do not commit credentials to source control.

### Logs

Do not print secret values.

### Rotation

Credential rotation requires coordinated configuration updates.

### Least Privilege

Use only the permissions required for the integration.

### Verification Boundary

Exact deployed environment variable names and scopes require source and Vercel inspection.

## Vercel Deployment Integration

The reservation parser is part of the deployed application infrastructure.

### Hosting Provider

    Vercel

### Framework

    Next.js App Router

### Production Domain

    https://finandfeatherslv.live

### Parser Path

    /parse-reservation

### Build

Changes to the parser require successful application deployment.

### Environment Configuration

Required private variables must be available in the target environment.

### Routing

The actual deployed route must be confirmed.

### Runtime Logs

Vercel logs may help diagnose parser failures.

### Studio Configuration

Twilio Studio must invoke the intended deployment URL.

### Version Coordination

Changes to the parser and Studio request format should be coordinated.

### Verification

Test the full integration after relevant deployments.

## Testing Environments

Messaging tests should avoid unintended guest communications.

### Local Testing

Parser logic can be tested with representative inputs.

### Preview Testing

Preview deployments may support endpoint testing.

### Production Testing

Live tests are required to verify actual Twilio routing.

### Test Phone Numbers

Use approved test numbers and participants.

### Test Data

Avoid using unnecessary real guest information.

### Studio Drafts

Draft workflow behavior may differ from published behavior.

### Credentials

Do not expose production credentials in shared test output.

### Message Charges

Live messages may incur provider charges.

### Compliance

Test traffic must respect applicable messaging requirements.

### Verification Boundary

The current project's formal test environment separation requires inspection.

## End-to-End Testing

Complete end-to-end testing is required before production acceptance.

### Test 1 — Website Form

Open the reservation modal.

### Test 2 — Required Fields

Verify all required inputs.

### Test 3 — Time Rules

Check valid and invalid booking times.

### Test 4 — Party Size

Verify the allowed range.

### Test 5 — Consent

Confirm the required checkbox behavior.

### Test 6 — SMS Preparation

Verify the generated message content.

### Test 7 — Guest Send

Send the message from an approved test device.

### Test 8 — Twilio Receipt

Confirm Twilio received the message.

### Test 9 — Studio Execution

Confirm the published Studio flow executed.

### Test 10 — Parser Invocation

Confirm the intended endpoint received the request.

### Test 11 — Parsing Result

Verify the parsed reservation details.

### Test 12 — Staff Workflow

Confirm the intended operational result reached the appropriate staff process.

### Test 13 — Error Cases

Test malformed and incomplete messages.

### Test 14 — Duplicate Handling

Check repeated message behavior.

### Test 15 — Documentation

Record the outcome and any unresolved issues.

## Monitoring and Logging

Messaging failures require operational visibility.

### Twilio Message Logs

Review message status and provider errors.

### Studio Execution Logs

Inspect workflow executions.

### Vercel Function Logs

Inspect parser execution errors.

### Correlation

Where practical, associate related events through safe identifiers.

### Personal Information

Avoid unnecessary logging of guest names and phone numbers.

### Delivery Failures

Investigate rejected or undelivered messages.

### Parsing Failures

Record enough diagnostic information to support troubleshooting.

### Repeated Failures

Recurring errors may require an operational alert.

### Compliance

Monitor relevant A2P and messaging status.

### Verification Boundary

The actual monitoring and alerting configuration requires inspection.

## Error Handling and Retries

Messaging systems must handle failures safely.

### Invalid Message

Return a controlled parsing outcome.

### Missing Data

Flag incomplete reservation details.

### Endpoint Unavailable

Define the Studio workflow's failure behavior.

### Timeout

Handle requests that exceed operational limits.

### Provider Error

Record the failure without exposing credentials.

### Duplicate Webhook

Avoid unintended duplicate processing.

### Retry Behavior

Confirm whether Twilio or Studio retries the relevant request type.

### Idempotency

Use an approved deduplication strategy where persistent actions are performed.

### Partial Success

Distinguish a received SMS from a successfully processed reservation request.

### Staff Escalation

Provide a defined manual review path when automation fails.

### Verification

Actual retry and fallback behavior must be confirmed from the deployed configuration.

## Operational Security and Privacy

Twilio deployment security extends beyond the parser.

### Account Access

Restrict Twilio administrative access.

### Credential Protection

Keep tokens and secrets private.

### Webhook Authentication

Validate the intended caller.

### Input Validation

Treat message content as untrusted.

### Data Minimization

Collect only required reservation information.

### Guest Privacy

Restrict access to personal information.

### Retention

Define appropriate retention and deletion practices.

### Logging

Avoid unnecessary personal data exposure.

### Incident Response

Investigate suspicious messaging activity promptly.

### Credential Rotation

Rotate compromised credentials.

### Compliance

Review messaging obligations when the workflow changes.

## Failure Recovery

### Website Failure

The restaurant may need an approved alternative reservation contact method.

### SMS Handoff Failure

Provide appropriate user guidance without claiming the message was sent.

### Twilio Delivery Failure

Review provider logs and account status.

### Studio Failure

Inspect the published workflow.

### Parser Failure

Review the deployed endpoint and runtime logs.

### Credential Failure

Verify configuration and rotate credentials if necessary.

### Compliance Restriction

Review the relevant registration or carrier status.

### Staff Workflow Failure

Escalate requests through the approved manual process.

### Recovery Verification

Retest the affected workflow after correction.

### Incident Record

Document the failure and corrective action.

### Important Boundary

The website must not claim reservation confirmation when the underlying workflow fails.

## Production Readiness Checklist

### Website

- Reservation modal opens.
- Required fields work.
- Date and time restrictions work.
- Party size validation works.
- Consent is required.
- SMS content is correct.
- Guest handoff is clear.

### Twilio

- Correct account.
- Correct phone number.
- Incoming SMS routing verified.
- Published Studio flow verified.
- Provider logs accessible.

### Parser

- Correct production endpoint.
- Valid requests handled.
- Invalid requests handled.
- Errors logged safely.
- Caller authentication reviewed.

### Security

- Credentials server-side.
- Webhook protection verified.
- Personal data protected.
- Duplicate processing controlled.

### Compliance

- Messaging disclosures reviewed.
- Terms accessible.
- Privacy policy accessible.
- A2P status verified.
- Opt-out requirements addressed.

### Operations

- Staff workflow documented.
- Manual fallback documented.
- Error escalation documented.
- Live test completed.

## Manager Operations

Restaurant managers need clear reservation handling procedures.

### Reservation Request

An SMS represents a guest request.

### Confirmation

Staff must confirm the reservation through the approved process.

### Yelp Reservations

Yelp Reservations remains part of the established confirmation workflow.

### Alternate Times

Staff may propose an alternative when the requested time is unavailable.

### Guest Communication

Communication should clearly distinguish requests from confirmed bookings.

### Incomplete Requests

Staff may need to request missing information.

### Duplicate Requests

Staff should avoid treating duplicate messages as separate reservations.

### Service Failure

Managers should follow the approved manual fallback procedure.

### Privacy

Guest information must remain restricted.

### Escalation

Persistent technical issues should be referred to the appropriate technical administrator.

## Implementation Roadmap

### Stage 1 — Verify Twilio Configuration

Inspect the account, phone number, and incoming routing.

### Stage 2 — Audit Studio Workflow

Review the published flow and parser invocation.

### Stage 3 — Inspect Parser

Verify request handling, validation, and authentication.

### Stage 4 — Review Credentials

Confirm secure server-side configuration.

### Stage 5 — Complete Compliance

Resolve applicable A2P approval and messaging requirements.

### Stage 6 — Perform Live Testing

Verify the complete guest-to-staff workflow.

### Stage 7 — Establish Monitoring

Define log review and failure escalation procedures.

### Stage 8 — Approve Recovery

Document manual fallback and incident response.

### Stage 9 — Maintain Documentation

Update this guide when messaging behavior changes.

### Scheduling

This roadmap does not establish a committed delivery date.

## Implementation Status

| Capability | Status |
|---|---|
| Twilio account integration | Established |
| Reservation SMS number | Established |
| Website reservation form | Implemented |
| SMS handoff | Implemented |
| Required SMS consent | Implemented |
| Twilio Studio workflow | Established |
| Reservation parser endpoint | Deployed |
| Local parser testing | Previously completed |
| Published Studio configuration audit | Verification pending |
| Production webhook URL audit | Verification pending |
| Webhook authentication audit | Verification pending |
| Parser request schema audit | Verification pending |
| Live Twilio-to-parser test | Pending |
| Complete guest-to-staff end-to-end test | Pending |
| Duplicate handling verification | Pending |
| Retry and fallback verification | Pending |
| A2P 10DLC approval | Pending |
| Messaging compliance review | In Development |
| Operational monitoring review | Verification pending |
| Manual recovery procedure | In Development |
| Comprehensive production acceptance | Pending |

## Related Documentation

- [Deployment Overview](README.md)
- [GitHub Workflow](github-workflow.md)
- [Vercel Deployment](vercel-deployment.md)
- [Rollback Procedures](rollback-procedures.md)
- [Reservation Workflow](../03-reservations/reservation-workflow.md)
- [Twilio Integration](../03-reservations/twilio-integration.md)
- [SMS Parsing](../03-reservations/sms-parsing.md)
- [Admin Reservations](../03-reservations/admin-reservations.md)
- [A2P Compliance](../03-reservations/a2p-compliance.md)
- [Reservation Form](../02-website/reservation-form.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Troubleshooting](../08-operations/troubleshooting.md)
- [Changelog](../08-operations/changelog.md)
- [Master Documentation Index](../README.md)

---

[Back to Deployment Overview](README.md)
