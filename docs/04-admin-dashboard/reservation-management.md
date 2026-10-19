# ADMIN DASHBOARD — Reservation Management

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Admin Dashboard entry point implemented; full reservation management interface requires source verification and additional development

**Feature:** Administrative Reservation Management Interface

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Management Objectives](#management-objectives)
3. [Current Implementation](#current-implementation)
4. [Administrative Architecture](#administrative-architecture)
5. [Manager Authorization](#manager-authorization)
6. [Reservation Management Interface](#reservation-management-interface)
7. [Reservation Request Data](#reservation-request-data)
8. [Request Status Model](#request-status-model)
9. [Request Review Workflow](#request-review-workflow)
10. [Availability Verification](#availability-verification)
11. [Guest Communication](#guest-communication)
12. [Alternate Reservation Management](#alternate-reservation-management)
13. [Search, Filtering, and Sorting](#search-filtering-and-sorting)
14. [Twilio and SMS Integration](#twilio-and-sms-integration)
15. [Database and Persistence](#database-and-persistence)
16. [Administrative Actions](#administrative-actions)
17. [Security and Privacy](#security-and-privacy)
18. [Error Handling and Recovery](#error-handling-and-recovery)
19. [Testing and Verification](#testing-and-verification)
20. [Implementation Roadmap](#implementation-roadmap)
21. [Implementation Status](#implementation-status)
22. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the administrative reservation management experience for Fin & Feathers Las Vegas.

It describes the existing dashboard foundation and the requirements for a future centralized reservation management interface.

The document covers:

- Administrative navigation.
- Manager authorization.
- Reservation request presentation.
- Request status tracking.
- Availability verification.
- Guest communication.
- Alternate reservation proposals.
- Search and filtering.
- Twilio integration.
- Database persistence.
- Security.
- Operational recovery.

This document is an administrative interface specification and implementation reference.

It does not claim that every described feature is currently implemented.

## Management Objectives

The reservation management interface should support authorized restaurant staff in reviewing and processing incoming reservation requests.

### Centralized Visibility

Managers should be able to identify incoming and unresolved requests.

### Reliable Review

Reservation details should be presented clearly and accurately.

### Status Clarity

A request awaiting review must not appear to be confirmed.

### Operational Efficiency

Managers should be able to prioritize requests by date, time, and status.

### Guest Communication

Staff should have a clear process for confirming reservations or proposing alternatives.

### Accountability

Important administrative actions should be traceable where supported.

### Data Integrity

The administrative interface must not conflict with the restaurant's authoritative reservation system.

### Incremental Implementation

New capabilities should be implemented and verified in controlled phases.

## Current Implementation

**Status:** Existing foundation; expanded management pending

The project includes an administrative dashboard.

### Established Route

    /admin

### Established Dashboard Source

    src/app/admin/page.tsx

### Existing Navigation

The dashboard includes a Reservations entry point.

### Authentication

Administrative access uses Supabase Auth.

### Authorization

The existing manager helper is:

    src/lib/auth/require-manager.ts

### Reservation Infrastructure

The public reservation workflow includes:

- Reservation form.
- SMS message preparation.
- Twilio message reception.
- Twilio Studio workflow.
- Reservation parser.
- Staff notification configuration.

### Parser Status

The parser has been locally tested and deployed.

### Live Verification

The complete live SMS-to-staff workflow remains pending verification.

### Administrative Boundary

The existence of a Reservations navigation card does not establish a completed reservation request dashboard.

### Source Inspection

The current reservation route and any associated components must be inspected before documenting exact implemented management capabilities.

## Administrative Architecture

The proposed interface sits within the existing Next.js application.

### Framework

    Next.js App Router

### Language

    TypeScript

### Styling

    Tailwind CSS

### Authentication

    Supabase Auth

### Database

    Supabase PostgreSQL

### Hosting

    Vercel

### External Messaging

    Twilio

### Reservation Operations

    Yelp Reservations

### Architectural Layers

1. Public reservation request.
2. Incoming SMS processing.
3. Structured reservation extraction.
4. Staff notification.
5. Administrative request review.
6. Availability verification.
7. Guest communication.
8. Reservation outcome recording.

### Important Boundary

These layers are conceptual.

The existing implementation does not establish that all layers are connected through a persistent database-backed workflow.

## Manager Authorization

Reservation administration must be protected from unauthorized access.

### Established Helper

    requireManager()

### Source

    src/lib/auth/require-manager.ts

### Authentication Check

The helper validates the authenticated user through Supabase.

### Staff Role Check

The helper queries:

    staff_roles

### Required Role

    manager

### Active Status

The staff role must be active.

### Route Protection

Every implemented reservation management route should enforce server-side authorization.

### Mutation Protection

Any future request updates must independently verify manager permission.

### Client-Side Controls

Hiding controls in the browser is not sufficient authorization.

### Database Policies

Database access must be protected by appropriate policies and server-side controls.

## Reservation Management Interface

**Status:** Proposed expanded interface

The future interface may provide a structured list of reservation requests.

### Page Objectives

- Display incoming requests.
- Identify pending reviews.
- Show reservation details.
- Support authorized status changes.
- Provide operational search.
- Surface incomplete requests.

### Potential Page Sections

- Summary.
- Request list.
- Request details.
- Review actions.
- Filters.
- Operational notices.

### Request List

Each entry may display:

- Guest name.
- Requested date.
- Requested time.
- Party size.
- Occasion.
- Request status.

### Detail View

Selecting a request may reveal additional authorized information.

### Empty State

The interface should clearly indicate when no requests are available.

### Loading State

Data loading should be communicated without displaying misleading placeholder records.

### Error State

A failed request load should not be presented as an empty successful result.

### Responsive Design

The interface should remain usable on mobile devices.

## Reservation Request Data

**Status:** Conceptual data requirements

A reservation request may require the following information.

### Request Identifier

A stable identifier for the request.

### Guest First Name

The guest's given name.

### Guest Last Name

The guest's family name.

### Guest Contact

Contact information needed for approved communication.

### Reservation Date

The requested calendar date.

### Reservation Time

The requested seating time.

### Party Size

The requested number of guests.

### Occasion

The guest's selected occasion.

### Source

The channel through which the request was received.

### Request Status

The current review or confirmation state.

### Staff Notes

Operational notes, if approved.

### Timestamps

Creation and update times, if persisted.

### Source Message Reference

A provider message identifier may be useful for reconciliation.

### Schema Boundary

These are proposed data fields, not verified Supabase columns.

Actual table definitions require database inspection.

## Request Status Model

**Status:** Proposed

The future interface may use a structured request status model.

### New

The request has arrived and has not been reviewed.

### Pending Review

The request requires staff availability verification.

### Clarification Required

The request is missing information needed for review.

### Alternative Proposed

Staff have offered a different reservation arrangement.

### Confirmed

Staff have explicitly confirmed the reservation.

### Declined

The requested reservation cannot be accommodated.

### Cancelled

The request or confirmed reservation has been cancelled.

### Completed

The reservation visit has occurred, if the business adopts this status.

### Status Rules

Status changes should reflect actual operational events.

### Confirmation Rule

Incoming SMS receipt is not equivalent to reservation confirmation.

### Approval

Final statuses and transitions require business approval.

### Persistence

A future database implementation must define valid transitions and audit requirements.

## Request Review Workflow

The administrative interface should support a consistent staff review process.

### Step 1 — Identify Request

Locate the incoming reservation request.

### Step 2 — Review Details

Confirm:

- Guest name.
- Requested date.
- Requested time.
- Party size.
- Occasion.

### Step 3 — Check Completeness

Identify missing or ambiguous information.

### Step 4 — Check Availability

Use the approved reservation management process.

### Step 5 — Determine Outcome

Possible outcomes:

- Confirm requested arrangement.
- Request clarification.
- Propose an alternative.
- Decline the request.

### Step 6 — Communicate

Send the appropriate guest response.

### Step 7 — Record Outcome

Update the authoritative reservation system.

### Step 8 — Update Supporting Records

If an admin database exists, keep its status consistent with the actual outcome.

### Step 9 — Prevent Duplicate Handling

Verify the request has not already been processed.

## Availability Verification

Availability must be confirmed through the approved restaurant process.

### Established Operating System

The restaurant uses Yelp Reservations.

### Staff Responsibility

Staff check whether the requested date, time, and party size can be accommodated.

### No Automatic Confirmation

The public reservation form does not automatically confirm bookings.

### External System Boundary

An automated Yelp booking API integration has not been established as implemented.

### Authoritative Availability

The restaurant must define which system provides the authoritative availability information.

### Conflicting Information

If the admin interface and the authoritative system disagree, staff must resolve the conflict before confirming.

### Future Integration

Direct availability synchronization would require separate feasibility and implementation work.

### Verification

A confirmed reservation should be supported by the approved operational record.

## Guest Communication

Staff communication is part of the reservation workflow.

### Incoming Request

The guest sends the prepared reservation SMS.

### Review Response

Staff communicate the outcome of availability review.

### Confirmation

A confirmation should identify the agreed reservation details.

### Clarification

Staff may request missing information.

### Alternative Proposal

An alternative must be clearly distinguished from an accepted booking.

### Cancellation

Cancellation messages should follow approved procedures.

### Messaging Approval

Customer-facing templates require business and messaging compliance review.

### Communication History

A future administrative interface may display relevant communication history.

### Privacy

Only authorized staff should access guest communications.

### Implementation Boundary

Do not assume two-way SMS conversation history is currently stored in Supabase.

## Alternate Reservation Management

A requested reservation may be unavailable.

### Alternative Types

Staff may propose:

- Earlier time.
- Later time.
- Different date.
- Other suitable arrangement.

### Guest Agreement

An alternative is not confirmed until the guest accepts and staff complete the approved booking process.

### Proposed Status

A future interface may use:

    Alternative Proposed

### Request Updates

The final accepted arrangement should be recorded accurately.

### Communication

Staff should explain the proposed alternative clearly.

### Declined Alternatives

A declined proposal should not remain displayed as confirmed.

### Operational Consistency

Supporting administrative records must match the authoritative reservation record.

## Search, Filtering, and Sorting

**Status:** Planned

A reservation management interface may require search and filtering tools.

### Search Fields

Potential fields include:

- Guest name.
- Reservation date.
- Request identifier.
- Approved contact reference.

### Status Filters

Potential filters include:

- New.
- Pending Review.
- Clarification Required.
- Alternative Proposed.
- Confirmed.
- Cancelled.

### Date Filters

Managers may need to filter by reservation date.

### Sorting

Potential sorting options include:

- Most recent request.
- Earliest reservation date.
- Latest reservation date.
- Last updated.

### Pagination

Large datasets may require server-side pagination.

### Search Security

Search must not expose private records to unauthorized users.

### Empty Results

The interface should distinguish no matching records from loading or retrieval failures.

## Twilio and SMS Integration

The existing reservation request workflow uses Twilio.

### Restaurant SMS Destination

    (702) 546-6394

### Incoming Message

Twilio receives the guest's SMS request.

### Studio Workflow

Twilio Studio coordinates message processing.

### Parser Endpoint

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

The parser supports the earlier combined `name` format.

### Staff Notification

Studio uses parsed values in the staff notification workflow.

### Administrative Data

A future interface may use structured request records.

### Integration Boundary

Do not assume that incoming Twilio messages currently create Supabase reservation records.

### Live Verification

The complete SMS-to-staff workflow still requires end-to-end verification.

## Database and Persistence

**Status:** Source verification and design required

The application uses Supabase PostgreSQL.

### Reservation Data Model

A future reservation management interface may require persistent request records.

### Potential Tables

Possible data structures may support:

- Requests.
- Request statuses.
- Staff notes.
- Communication references.
- Status history.

These are design concepts, not verified existing table names.

### Schema Inspection

The actual database schema must be inspected before implementation.

### Data Ownership

The project must determine whether Supabase stores request records, confirmed bookings, or both.

### External Consistency

Database records must not contradict the authoritative reservation system.

### Access Policies

Protected reservation data requires appropriate access policies.

### Retention

Guest data retention requires business approval.

### Auditability

Important status changes may require an audit trail.

## Administrative Actions

**Status:** Proposed capabilities

Future administrative controls may support the following actions.

### Open Request

Display the details of a selected request.

### Mark Reviewed

Record that staff have reviewed a request.

### Request Clarification

Identify information required from the guest.

### Propose Alternative

Record an alternative reservation proposal.

### Mark Confirmed

Record an explicitly confirmed reservation.

### Mark Declined

Record that the request cannot be accommodated.

### Mark Cancelled

Record an approved cancellation.

### Add Notes

Store authorized operational notes.

### Action Validation

Each action must enforce valid input and permitted status transitions.

### Authorization

Administrative mutations must verify the manager's role on the server.

### Success Feedback

The interface must not report success before persistence succeeds.

### Audit

Important actions should be traceable where supported.

## Security and Privacy

Reservation management involves guest personal information.

### Authentication

Require a valid Supabase session.

### Authorization

Require the approved active manager role.

### Server-Side Checks

Protect both page access and administrative mutations.

### Database Security

Apply appropriate database access policies.

### Data Minimization

Display only information needed for restaurant operations.

### Guest Contact Information

Protect phone numbers and other personal information.

### Messaging Privacy

SMS is not end-to-end encrypted.

### Sensitive Information

Do not collect payment card information through reservation SMS.

### Logging

Avoid unnecessary guest information in logs.

### Retention

Define approved retention and deletion procedures.

### Auditing

Consider audit records for significant administrative changes.

## Error Handling and Recovery

### Request Retrieval Failure

Show a clear error rather than an empty successful state.

### Database Update Failure

Do not mark a status change as saved when persistence fails.

### Unauthorized Access

Reject the operation without exposing protected information.

### Missing Request Details

Require clarification before confirmation.

### Duplicate Requests

Avoid creating duplicate confirmed reservations.

### Notification Failure

Investigate Twilio and staff notification routing.

### External Availability Failure

Do not claim a reservation is confirmed without availability verification.

### Concurrent Changes

Consider conflicts when multiple managers edit the same request.

### Recovery

Provide an approved manual workflow when the administrative system is unavailable.

### Incident Documentation

Record significant operational failures appropriately.

## Testing and Verification

### Authorization Tests

- Valid active manager.
- Unauthenticated user.
- Inactive manager.
- Unauthorized role.
- Direct route access.
- Unauthorized mutation attempt.

### Request List Tests

When implemented:

- Load request records.
- Display guest details.
- Display status.
- Display empty state.
- Display retrieval errors.

### Request Detail Tests

- Correct guest name.
- Correct date.
- Correct time.
- Correct party size.
- Correct occasion.
- Correct request identifier.

### Status Tests

- Valid transitions.
- Invalid transitions.
- Persistence success.
- Persistence failure.
- Concurrent updates.

### Search Tests

- Guest name search.
- Date filtering.
- Status filtering.
- Sorting.
- Empty results.
- Pagination if implemented.

### Twilio Tests

- Live incoming SMS.
- Parser execution.
- Studio field mapping.
- Staff notification delivery.
- Database integration if implemented.

### Operational Tests

- Availability review.
- Confirmation workflow.
- Alternative proposal.
- Guest clarification.
- Cancellation.
- Duplicate handling.

### Security Tests

- Protected data access.
- Database policies.
- Input validation.
- Safe logging.
- Session expiration.

## Implementation Roadmap

### Stage 1 — Source Inventory

Inspect:

- Current admin routes.
- Reservation components.
- Supabase reservation schema.
- Twilio Studio workflow.
- Parser output.
- Staff operating procedures.

### Stage 2 — Data Architecture

Define:

- Authoritative data source.
- Request record schema.
- Status model.
- Data retention.
- Access policies.
- Audit requirements.

### Stage 3 — Read-Only Interface

Implement a protected request list and detail view using verified data sources.

### Stage 4 — Administrative Actions

Add authorized request review and status management.

### Stage 5 — Operational Tools

Consider:

- Search.
- Filtering.
- Staff notes.
- Communication references.
- Duplicate detection.

### Stage 6 — Integration Testing

Verify the complete workflow from guest request to staff confirmation.

### Stage 7 — Production Review

Confirm:

- Manager authorization.
- Database policies.
- Privacy requirements.
- Failure handling.
- Operational training.

### Scheduling

This roadmap is a proposed implementation sequence, not an approved delivery schedule.

## Implementation Status

| Capability | Status |
|---|---|
| Admin Dashboard route | Implemented |
| Reservations navigation entry point | Implemented |
| Supabase authentication | Implemented |
| Active manager authorization | Implemented |
| Public reservation request form | Implemented |
| Twilio reservation processing workflow | Implemented |
| Reservation parser | Implemented |
| Parser deployment | Implemented |
| Local parser testing | Verified |
| Live end-to-end SMS workflow | Verification pending |
| Current admin reservation route capabilities | Source verification pending |
| Persistent reservation request records | Source verification pending |
| Request list and detail interface | Planned expansion |
| Request status management | Planned expansion |
| Search and filtering | Planned |
| Communication history | Under Evaluation |
| Administrative audit trail | Under Evaluation |
| Automated Yelp reservation creation | Not implemented |
| Full administrative acceptance testing | Pending implementation |

## Related Documentation

- [Admin Dashboard Overview](README.md)
- [Dashboard Overview](dashboard-overview.md)
- [Manager Permissions](manager-permissions.md)
- [Menu Management](menu-management.md)
- [Reservations Overview](../03-reservations/README.md)
- [Reservation Workflow](../03-reservations/reservation-workflow.md)
- [Admin Reservations](../03-reservations/admin-reservations.md)
- [Twilio Integration](../03-reservations/twilio-integration.md)
- [SMS Parsing](../03-reservations/sms-parsing.md)
- [Database Overview](../06-database/README.md)
- [Access Policies](../06-database/access-policies.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Master Documentation Index](../README.md)

---

[Back to Admin Dashboard Overview](README.md)
