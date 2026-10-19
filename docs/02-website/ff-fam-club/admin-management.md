# F&F FAM CLUB — Admin Management

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Planned; requirements and approvals pending

**Administrative Area:** Future manager dashboard feature

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Administrative Scope](#administrative-scope)
3. [Current Implementation](#current-implementation)
4. [Manager Access and Permissions](#manager-access-and-permissions)
5. [Proposed Dashboard](#proposed-dashboard)
6. [Program Configuration](#program-configuration)
7. [Membership Administration](#membership-administration)
8. [Rewards Management](#rewards-management)
9. [Promotions and SPECIALS](#promotions-and-specials)
10. [Communications Management](#communications-management)
11. [Consent and Privacy](#consent-and-privacy)
12. [Reporting and Analytics](#reporting-and-analytics)
13. [Database and Integrations](#database-and-integrations)
14. [Audit and Security Controls](#audit-and-security-controls)
15. [Operational Workflows](#operational-workflows)
16. [Development Dependencies](#development-dependencies)
17. [Testing and Verification](#testing-and-verification)
18. [Implementation Status](#implementation-status)
19. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the proposed
administrative management capabilities
for F&F FAM CLUB.

The objective is to establish a
future management framework that
supports approved customer loyalty
and engagement activities.

The document distinguishes between:

- Existing administrative infrastructure.
- Proposed loyalty management tools.
- Business rules requiring approval.
- Technical integrations under evaluation.
- Security and operational requirements.

No new loyalty management functionality
is considered operational solely
because it appears in this document.

## Administrative Scope

The future management interface
may allow authorized restaurant
staff to oversee:

- Program configuration.
- Membership records.
- Approved member benefits.
- Promotions.
- Customer communications.
- Membership reporting.
- Customer support requests.

The final feature set must be
approved before implementation.

### Administrative Goals

The interface should:

- Simplify routine management.
- Protect customer information.
- Reduce manual errors.
- Enforce approved business rules.
- Provide clear operational feedback.
- Support mobile and desktop use.

## Current Implementation

The website includes an existing
F&F FAM CLUB public presentation.

The project also has an established
manager dashboard and authorization
infrastructure.

### Existing Administrative Foundation

Established route:

    /admin

Established authorization helper:

    src/lib/auth/require-manager.ts

The helper verifies an authenticated
user and requires an active
manager role.

### Current Limitations

A dedicated F&F FAM CLUB
administrative interface
has not been established
as operational.

The following must not be assumed:

- Native membership database.
- Member search.
- Reward configuration.
- Loyalty transaction processing.
- Automated promotional messaging.
- Membership analytics.
- POS-linked reward redemption.

These capabilities require
separate implementation
and verification.

## Manager Access and Permissions

The proposed interface must
use the established manager
authorization model.

### Existing Role System

The project uses Supabase Auth
and the `staff_roles` table.

The existing authorization
helper requires:

    role = manager

and:

    is_active = true

### Server-Side Enforcement

Protected routes and operations
must enforce authorization
on the server.

Hiding navigation controls
is not sufficient protection.

### Permission Design

Future requirements should define
whether all managers can:

- View member information.
- Update member status.
- Create promotions.
- Approve rewards.
- Send communications.
- Export reports.

Additional permission levels
should not be introduced
without an approved design.

### Access Revocation

Deactivated or unauthorized
staff must not retain
administrative access.

## Proposed Dashboard

**Status:** Planned

A future dashboard may provide
a high-level overview of
F&F FAM CLUB activity.

### Potential Summary Information

- Total registered members.
- Active memberships.
- Recent enrollments.
- Pending membership issues.
- Active approved promotions.
- Communication activity.
- Reward activity, if supported.

### Data Accuracy

Metrics must come from
verified data sources.

The interface must not
display fabricated counts
or unsupported estimates.

### Dashboard Navigation

Potential sections include:

- Overview.
- Members.
- Program Settings.
- Rewards.
- Promotions.
- Communications.
- Reports.

These are conceptual sections,
not established application routes.

## Program Configuration

**Status:** Planned

Authorized managers may eventually
maintain approved program settings.

### Potential Settings

- Public program description.
- Enrollment availability.
- Membership eligibility.
- Approved terms.
- Benefit descriptions.
- Program status.

### Ownership Approval

Business-critical changes
should follow restaurant
ownership approval procedures.

### Public Content

Changes to public program
messaging must not introduce
unapproved benefits or promises.

### Configuration History

The project should evaluate
recording changes to
important program settings.

## Membership Administration

**Status:** Planned

A future membership management
interface may support:

- Searching members.
- Reviewing membership status.
- Viewing approved profile fields.
- Correcting permitted information.
- Reviewing enrollment history.
- Managing deactivation requests.
- Assisting with account issues.

### Member Search

Search functionality should
limit access to authorized staff.

### Member Details

Only information required
for approved operational
purposes should be displayed.

### Member Updates

Updates should:

1. Validate the manager's access.
2. Validate submitted information.
3. Apply approved business rules.
4. Save changes securely.
5. Return clear feedback.
6. Record important changes
   when audit functionality exists.

### Duplicate Memberships

The system should establish
a safe procedure for handling
duplicate records.

### Account Closure

Membership closure and deletion
must follow approved retention
and privacy procedures.

## Rewards Management

**Status:** Under Evaluation

Potential reward administration
may include:

- Creating approved benefits.
- Configuring eligibility.
- Defining expiration.
- Managing redemption rules.
- Reviewing reward activity.
- Disabling expired offers.

### Reward Approval

Managers must not create
unapproved discounts
or financial commitments.

### Points-Based Rewards

A points system is not
assumed to exist.

If selected, administration
would require controls for:

- Earning rules.
- Balance adjustments.
- Redemption transactions.
- Fraud prevention.
- Adjustment history.
- Dispute resolution.

### Manual Adjustments

Any manual reward adjustment
must require appropriate
authorization and traceability.

## Promotions and SPECIALS

**Status:** Planned; integration dependent

The loyalty program may eventually
coordinate with the planned
SPECIALS management system.

### Potential Capabilities

- Select an approved special.
- Identify member eligibility.
- Schedule promotional visibility.
- Publish member announcements.
- Review promotion status.

### Pricing Integrity

Promotional prices must
remain consistent with
approved restaurant pricing.

### Existing Menu Special Flag

The menu editor includes:

    is_five_dollar_special

This existing field is separate
from the proposed recurring
SPECIALS scheduling system.

### Promotion Approval

Managers should not publish
unapproved promotional offers.

### Scheduling

Scheduled promotions must
respect approved dates,
times, and eligibility.

## Communications Management

**Status:** Planned; compliance dependent

Future administration may
support approved member messaging.

### Potential Communication Types

- Restaurant announcements.
- Member program updates.
- Approved specials.
- Event notifications.
- Promotional campaigns.

### Communication Channels

Potential channels include:

- Email.
- SMS.
- External loyalty services.

No provider is selected
by this document.

### Campaign Preparation

A future workflow may include:

1. Select communication type.
2. Define the eligible audience.
3. Prepare approved content.
4. Validate recipient consent.
5. Review message details.
6. Obtain required approval.
7. Schedule or send.
8. Review supported delivery results.

### Consent Requirements

Reservation SMS consent
must not be reused as
marketing consent.

### Opt-Out Handling

Promotional messaging must
respect applicable unsubscribe
and suppression requirements.

### Delivery Reporting

Message submission does not
guarantee delivery.

The interface should represent
provider delivery states accurately.

## Consent and Privacy

Customer membership data
requires appropriate protection.

### Consent Records

The future system should
retain relevant information
about approved consent.

Potential records include:

- Consent purpose.
- Consent status.
- Collection date.
- Source.
- Preference changes.

The final data model
requires approval.

### Data Minimization

Administrative screens should
display only information
needed for authorized work.

### Data Retention

Retention and deletion
procedures must be established
before storing membership data.

### Sensitive Exports

Member data exports should
be restricted and logged
where supported.

### Privacy Requests

The restaurant must define
how staff handle requests
to access, correct, or delete
membership information.

## Reporting and Analytics

**Status:** Planned

Potential reporting includes:

- Membership growth.
- Enrollment activity.
- Active member counts.
- Member engagement.
- Promotion participation.
- Communication performance.
- Reward redemption, if supported.

### Reporting Accuracy

Metrics must be based
on actual recorded activity.

### Date Filtering

Reports may support
approved date ranges.

### Data Exports

Exports require appropriate
permissions and privacy controls.

### Integration Dependencies

Purchase-linked analytics
may require an approved
Toast POS integration.

## Database and Integrations

**Status:** Requirements pending

The website uses Supabase
as its application database.

### Membership Schema

A dedicated membership schema
must not be assumed to exist.

Potential future entities include:

- Members.
- Membership statuses.
- Consent records.
- Program settings.
- Benefits.
- Reward transactions.
- Communication campaigns.
- Communication events.

These are conceptual entities,
not confirmed database tables.

### Row-Level Security

Any new tables must receive
appropriate access policies.

### Toast POS

Purchase-linked loyalty features
depend on Toast API feasibility
and approved access.

### Messaging Providers

Promotional messaging providers
must be evaluated separately
from the existing reservation
SMS workflow.

### External Loyalty Platform

The project may retain
or integrate with an
external loyalty provider.

The current public component
must be inspected before
selecting an approach.

## Audit and Security Controls

The future management interface
must protect membership data
and business operations.

### Authorization

Every protected operation
must verify manager access.

### Input Validation

All administrative inputs
must be validated.

### Audit Records

Important actions may include:

- Membership status changes.
- Reward adjustments.
- Program configuration changes.
- Campaign publication.
- Consent preference updates.

Audit design requires
technical approval.

### Credential Protection

API keys, service credentials,
and private tokens must not
be exposed to browsers
or committed to Git.

### Least Privilege

External services should
receive only the access
required for approved tasks.

### Error Handling

Administrative errors should
not reveal sensitive
internal information.

## Operational Workflows

Future workflows should
be documented before launch.

### Member Assistance

1. Confirm staff authorization.
2. Locate the relevant member.
3. Verify permitted identity information.
4. Review the issue.
5. Apply an approved resolution.
6. Record the outcome when supported.

### Promotion Publication

1. Review proposed offer.
2. Verify pricing.
3. Verify eligibility.
4. Confirm ownership approval.
5. Configure schedule.
6. Publish.
7. Verify public presentation.

### Communication Publication

1. Review message purpose.
2. Verify recipient consent.
3. Confirm approved content.
4. Confirm sending schedule.
5. Send through an approved provider.
6. Review delivery and opt-out results.

### Incident Handling

Staff should have procedures
for responding to:

- Unauthorized access.
- Incorrect member information.
- Invalid promotions.
- Messaging failures.
- Data exposure concerns.
- Integration outages.

## Development Dependencies

The following decisions
are required before development.

### Business Decisions

- Final program rules.
- Eligibility requirements.
- Approved benefits.
- Manager responsibilities.
- Promotional approval process.

### Technical Decisions

- Native versus external platform.
- Database design.
- Authentication model.
- Consent storage.
- Reporting requirements.
- Integration architecture.

### Compliance Decisions

- Privacy disclosures.
- Marketing consent.
- Messaging registration.
- Data retention.
- Unsubscribe procedures.

### Implementation Sequence

A potential sequence is:

1. Verify the current public component.
2. Confirm program requirements.
3. Evaluate platform options.
4. Approve data architecture.
5. Implement secure enrollment.
6. Implement basic manager controls.
7. Add approved benefits.
8. Add compliant communications.
9. Evaluate POS-linked functionality.
10. Complete testing before release.

This is a proposed sequence,
not a committed delivery schedule.

## Testing and Verification

### Authorization

- Verify unauthenticated access is denied.
- Verify unauthorized roles are denied.
- Verify inactive managers are denied.
- Verify active managers can access
  approved features.

### Membership Operations

If implemented:

- Verify member search.
- Verify permitted profile updates.
- Verify membership status changes.
- Verify duplicate handling.
- Verify account closure procedures.

### Rewards

If implemented:

- Verify approved reward rules.
- Verify eligibility.
- Verify expiration.
- Verify manual adjustment controls.
- Verify transaction records.

### Communications

If implemented:

- Verify recipient consent.
- Verify opt-out suppression.
- Verify campaign approval.
- Verify message scheduling.
- Verify delivery status handling.

### Data Protection

- Verify database access policies.
- Verify sensitive data restrictions.
- Verify secure service credentials.
- Verify export permissions.
- Verify error handling.

### Integration Testing

If integrations are implemented:

- Verify provider authentication.
- Verify expected data mapping.
- Verify failure recovery.
- Verify duplicate prevention.
- Verify reconciliation procedures.

## Implementation Status

| Capability | Status |
|---|---|
| Existing manager authentication | Implemented |
| Existing admin dashboard | Implemented |
| Public F&F FAM CLUB presentation | Implemented |
| Dedicated FAM CLUB admin page | Planned |
| Program settings editor | Planned |
| Membership database | Not verified |
| Member search and management | Planned |
| Reward configuration | Under Evaluation |
| Points administration | Under Evaluation |
| Member promotion management | Planned |
| Promotional communications | Planned; compliance dependent |
| Consent management | Requirements pending |
| Membership reporting | Planned |
| Audit trail | Under Evaluation |
| Toast-linked loyalty | Under Evaluation |
| Full administrative testing | Pending implementation |

## Related Documentation

- [F&F FAM CLUB Overview](README.md)
- [Program Overview](program-overview.md)
- [Member Experience](member-experience.md)
- [Website Overview](../README.md)
- [SPECIALS](../specials/README.md)
- [Admin Dashboard](../../04-admin-dashboard/README.md)
- [FAM CLUB Admin Category](../../04-admin-dashboard/fam-club-management.md)
- [Manager Permissions](../../04-admin-dashboard/manager-permissions.md)
- [Authentication](../../05-authentication/README.md)
- [Database & Storage](../../06-database/README.md)
- [Toast POS Integration](../../10-toast-pos-integration/README.md)
- [Master Documentation Index](../../README.md)

---

[Back to F&F FAM CLUB Overview](README.md)
