# ADMIN DASHBOARD — FAM CLUB Management

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Public-facing loyalty section exists; dedicated FAM CLUB administrative management, membership infrastructure, and rewards operations planned

**Feature:** Manager FAM CLUB Administration

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Program Management Objectives](#program-management-objectives)
3. [Current Implementation](#current-implementation)
4. [Administrative Architecture](#administrative-architecture)
5. [Manager Authorization](#manager-authorization)
6. [FAM CLUB Management Dashboard](#fam-club-management-dashboard)
7. [Membership Records](#membership-records)
8. [Member Enrollment](#member-enrollment)
9. [Member Profiles](#member-profiles)
10. [Program Configuration](#program-configuration)
11. [Rewards and Benefits](#rewards-and-benefits)
12. [Member Activity and History](#member-activity-and-history)
13. [Member Communications](#member-communications)
14. [Search and Filtering](#search-and-filtering)
15. [Reporting and Analytics](#reporting-and-analytics)
16. [Database and Persistence](#database-and-persistence)
17. [External Integrations](#external-integrations)
18. [Security and Privacy](#security-and-privacy)
19. [Error Handling and Recovery](#error-handling-and-recovery)
20. [Manager Operating Procedures](#manager-operating-procedures)
21. [Testing and Verification](#testing-and-verification)
22. [Implementation Roadmap](#implementation-roadmap)
23. [Implementation Status](#implementation-status)
24. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed administrative management experience for the Fin & Feathers Las Vegas FAM CLUB program.

The FAM CLUB is intended to support ongoing relationships between the restaurant and participating guests.

The administrative system should eventually provide authorized managers with appropriate tools to operate the program.

This document covers:

- Administrative access.
- Membership management.
- Enrollment review.
- Member profiles.
- Program configuration.
- Rewards and benefits.
- Member activity.
- Communications.
- Reporting.
- Database requirements.
- External integrations.
- Privacy and security.
- Operational procedures.

The document is a planning and implementation reference.

It does not establish that a complete membership or rewards administration platform currently exists.

## Program Management Objectives

The administrative system should help restaurant managers operate an approved loyalty and guest engagement program.

### Centralized Administration

Authorized managers should be able to access relevant program information through one protected interface.

### Membership Visibility

The interface should provide appropriate visibility into membership records.

### Operational Consistency

Program rules should be applied consistently.

### Guest Experience

Member benefits and communications should be accurate and clearly explained.

### Privacy Protection

Personal information must be accessible only to authorized personnel.

### Controlled Configuration

Changes to rewards or benefits should follow approved business procedures.

### Accountability

Important administrative actions should be traceable where appropriate.

### Expandability

The system should accommodate approved future integrations without assuming that those integrations are already available.

## Current Implementation

**Status:** Public-facing foundation exists; administrative module planned

The website includes a loyalty program component.

### Existing Website Component

    loyalty-program

### Public Website Role

The component provides a public-facing FAM CLUB or loyalty program presentation area.

### Administrative Foundation

The application includes a protected Admin Dashboard.

### Existing Admin Route

    /admin

### Manager Authorization

The established manager authorization helper is:

    src/lib/auth/require-manager.ts

### Not Established as Implemented

The following have not been verified as operational:

- Dedicated FAM CLUB administration route.
- Complete membership database.
- Member enrollment processing.
- Rewards balance management.
- Redemption engine.
- Membership reporting dashboard.
- Automated member messaging.
- External loyalty platform synchronization.

### Source Verification

The current loyalty component and related application routes should be inspected before documenting their exact behavior.

### Important Boundary

A public loyalty promotion does not establish a fully functional membership administration system.

## Administrative Architecture

The proposed FAM CLUB management module would operate within the existing Next.js application.

### Application Framework

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

### Proposed Architecture

1. Guest interacts with the public FAM CLUB experience.
2. Approved enrollment information is submitted.
3. Server validates the enrollment.
4. Approved membership data is persisted.
5. Authorized managers access appropriate records.
6. Program activity is recorded.
7. Approved benefits are managed.
8. Member-facing information reflects the authoritative program state.

### Architectural Boundary

This is a proposed model.

The exact enrollment mechanism, database tables, rewards provider, and program rules require separate approval.

### External Services

Third-party loyalty or messaging services may be considered during implementation.

## Manager Authorization

FAM CLUB administration must be restricted to authorized personnel.

### Established Authorization Helper

    requireManager()

### Source

    src/lib/auth/require-manager.ts

### Staff Role Table

    staff_roles

### Required Role

    manager

### Active Status

The staff role must be active.

### Protected Operations

Potential administrative actions include:

- View member records.
- Review enrollment.
- Update approved profile information.
- Configure benefits.
- Review activity.
- Manage communications.
- Export approved reports.

### Server Enforcement

All protected operations must enforce authorization on the server.

### Database Security

Membership records require appropriate database access policies.

### Future Permissions

More granular FAM CLUB permissions may be introduced if approved.

### Least Privilege

Managers should access only the information needed for authorized operations.

## FAM CLUB Management Dashboard

**Status:** Planned

A dedicated FAM CLUB dashboard may provide a consolidated view of membership operations.

### Proposed Dashboard Sections

- Membership overview.
- Member directory.
- Enrollment activity.
- Program settings.
- Rewards and benefits.
- Member activity.
- Communications.
- Reporting.

### Summary Information

Potential summary metrics include:

- Total members.
- New enrollments.
- Active members.
- Program participation.
- Reward activity.

These metrics are proposed, not established existing dashboard values.

### Operational Notices

The interface may highlight:

- Pending enrollment issues.
- Failed operations.
- Incomplete member records.
- Program configuration changes.

### Navigation

Managers should be able to move between the overview and detailed management areas.

### Mobile Experience

The interface should remain usable on mobile devices.

### Empty States

An empty member directory should not be confused with a failed data retrieval.

### Error States

Database and integration failures should be clearly communicated.

## Membership Records

**Status:** Proposed data requirements

Membership records may be required to support program operations.

### Potential Information

- Member identifier.
- First name.
- Last name.
- Approved contact information.
- Enrollment date.
- Membership status.
- Communication preferences.
- Program participation information.

### Data Minimization

Only information necessary for the approved program should be collected.

### Contact Information

Email or telephone information must be handled according to the program's privacy and consent requirements.

### Membership Status

The business must approve possible membership states.

### Duplicate Records

The enrollment workflow should address duplicate membership attempts.

### Data Accuracy

Managers should have an approved process for correcting inaccurate records.

### Retention

Membership data retention requires an approved policy.

### Schema Boundary

These are conceptual attributes, not verified Supabase database columns.

## Member Enrollment

**Status:** Planned or source verification required

The program must establish an approved enrollment process.

### Public Enrollment

The business may allow guests to enroll through the website.

### Enrollment Information

Required information should be limited to approved program needs.

### Consent

Enrollment must include any required acknowledgments and communications consent.

### Validation

Submitted information should be validated on the server.

### Duplicate Prevention

The system should identify potential duplicate accounts.

### Confirmation

Enrollment success should be communicated only after the required operation succeeds.

### Manager Visibility

Authorized managers may need to review enrollment outcomes.

### Enrollment Failure

Failed submissions should provide an appropriate recovery path.

### Source Verification

The exact current public loyalty component behavior must be inspected before identifying an existing enrollment implementation.

## Member Profiles

**Status:** Planned

A member profile interface may provide authorized access to approved membership information.

### Potential Profile Sections

- Member identity.
- Enrollment information.
- Membership status.
- Communication preferences.
- Approved activity history.
- Rewards information.

### Profile Editing

Only authorized fields should be editable.

### Identity Verification

Sensitive profile changes may require additional verification.

### Contact Updates

Changes to contact details must follow approved procedures.

### Duplicate Profiles

Potential duplicate accounts should be reviewed before merging.

### Privacy

Do not expose unrelated guest information.

### Auditability

Important profile changes may require an audit record.

### Deletion

Member deletion or deactivation must follow approved retention and privacy requirements.

## Program Configuration

The future administrative system may allow managers to maintain approved FAM CLUB settings.

### Potential Configuration Areas

- Program name.
- Public description.
- Enrollment eligibility.
- Membership terms.
- Benefit descriptions.
- Participation rules.
- Communication preferences.
- Program availability.

### Approval

Program settings must be approved by restaurant management.

### Versioning

Significant changes to program terms may require version tracking.

### Publication

Changes should not appear publicly until the approved save or publish operation succeeds.

### Consistency

Public-facing program descriptions must match approved operating rules.

### Sensitive Settings

Managers should not be able to alter protected system configuration without appropriate authorization.

### Future Expansion

Additional settings may be introduced as the program evolves.

## Rewards and Benefits

**Status:** Business rules pending approval

A future FAM CLUB program may offer approved member benefits.

### Possible Benefit Types

- Member-only promotions.
- Special event announcements.
- Exclusive offers.
- Approved loyalty rewards.
- Birthday or occasion benefits.

These are possibilities, not confirmed program entitlements.

### Earning Rules

If the program uses points or credits, earning rules must be formally defined.

### Redemption Rules

If redemption is supported, eligibility and redemption procedures must be approved.

### Expiration

Any expiration rules must be disclosed clearly.

### Balance Accuracy

A future rewards system must maintain accurate authoritative balances.

### Duplicate Redemption

The system must prevent unintended duplicate benefit redemption.

### Manual Adjustments

Manual balance or benefit adjustments require controlled authorization and auditability.

### Payment Integration

Any connection to purchases or payments requires separate technical and compliance review.

### Current Boundary

Do not assume an operational rewards ledger or redemption engine exists.

## Member Activity and History

**Status:** Planned

Managers may need to review approved member activity.

### Potential Activity Types

- Enrollment.
- Profile update.
- Program participation.
- Reward issuance.
- Reward redemption.
- Communication preference update.
- Account deactivation.

### Activity Visibility

Only authorized staff should access member history.

### Event Accuracy

Activity records should reflect completed events rather than attempted operations.

### Timestamps

Activity records should use consistent timestamp handling.

### Source Attribution

Events may need to identify their originating system.

### Corrections

The system should define how erroneous activity records are corrected.

### Retention

Activity history retention requires approval.

### Implementation Boundary

No complete member activity history implementation has been established as verified.

## Member Communications

Member communications require approved content and consent handling.

### Possible Channels

- Email.
- SMS.
- Website messaging.

### Consent

Marketing messages must not be sent without the required consent.

### Transactional Messages

Operational messages should be distinguished from promotional messages.

### Opt-Out

Recipients must have appropriate ways to withdraw applicable messaging consent.

### Preference Management

Members may need to manage their communication preferences.

### Templates

Customer-facing templates require approval.

### Delivery Tracking

A future system may track delivery status.

### Privacy

Communication history must be protected from unauthorized access.

### Twilio Boundary

The existing Twilio reservation workflow does not automatically establish a FAM CLUB marketing messaging system.

### Compliance Review

Messaging integrations require separate legal, provider, and operational review.

## Search and Filtering

**Status:** Planned

A member directory may require search and filtering tools.

### Search

Potential search fields include:

- Member name.
- Approved contact reference.
- Member identifier.

### Filters

Potential filters include:

- Membership status.
- Enrollment date.
- Participation status.
- Communication preferences.

### Sorting

Potential options include:

- Newest enrollment.
- Oldest enrollment.
- Name.
- Last activity.

### Pagination

Large member datasets may require server-side pagination.

### Data Protection

Search results must not expose records to unauthorized users.

### Empty Results

The interface should distinguish no matches from data retrieval errors.

### Performance

Search operations should remain responsive as membership grows.

## Reporting and Analytics

**Status:** Planned

Reporting may help management evaluate FAM CLUB performance.

### Potential Metrics

- Membership growth.
- Enrollment trends.
- Participation rates.
- Benefit usage.
- Member retention.
- Campaign engagement.

### Data Accuracy

Metrics must be based on verified underlying records.

### Definitions

Each metric requires a consistent business definition.

### Time Periods

Reports should identify their reporting period.

### Data Privacy

Reports should avoid unnecessary exposure of personal information.

### Export Controls

Any export feature must enforce appropriate permissions.

### Financial Reporting

Reward-related financial implications require business and accounting review.

### Current Boundary

Do not present proposed analytics as existing dashboard metrics.

## Database and Persistence

**Status:** Design pending

The application uses Supabase PostgreSQL.

### Potential Data Structures

A future program may require data for:

- Membership records.
- Program settings.
- Member activity.
- Rewards.
- Communication preferences.
- Administrative actions.

### Schema Boundary

These are conceptual data areas, not verified table names.

### Identity Relationships

The program must define how membership identities relate to Supabase Auth users, if at all.

### Guest Accounts

The business must decide whether FAM CLUB membership requires website authentication.

### Data Integrity

Relationships should be enforced through appropriate database constraints.

### Database Policies

Membership records require appropriate access controls.

### Public Access

Public visitors should not be able to read private member records.

### Data Retention

Retention and deletion policies must be approved.

### Backup and Recovery

Critical program records should follow approved recovery procedures.

## External Integrations

**Status:** Under Evaluation

The FAM CLUB may eventually integrate with external services.

### Potential Integration Categories

- Loyalty platforms.
- POS systems.
- Email providers.
- SMS providers.
- Analytics tools.
- Customer relationship management systems.

### Toast POS

Potential purchase-based rewards would require Toast integration feasibility analysis.

### Messaging Providers

Marketing communications require consent, provider configuration, and compliance review.

### Data Ownership

The business must determine which system is authoritative for membership and rewards data.

### Synchronization

Any integration must define synchronization frequency and error recovery.

### Security

Integration credentials must remain server-side.

### Cost

Subscription, usage, and development costs require evaluation.

### Approval

No external FAM CLUB integration should be treated as approved until the business selects the provider and operating model.

## Security and Privacy

FAM CLUB administration involves personal information.

### Authentication

Require valid administrative authentication.

### Authorization

Require an active manager role.

### Server-Side Enforcement

Protect member reads and administrative mutations.

### Database Policies

Use appropriate row-level security and access controls.

### Data Minimization

Collect and display only necessary information.

### Contact Information

Protect email addresses, phone numbers, and related identifiers.

### Consent Records

Maintain required evidence of messaging consent when applicable.

### Credentials

Do not expose privileged service credentials.

### Logging

Avoid storing unnecessary personal information in logs.

### Data Export

Restrict bulk member data exports.

### Retention

Define approved retention and deletion procedures.

### Incident Response

Investigate suspected unauthorized access through approved procedures.

## Error Handling and Recovery

### Failed Member Load

Show a retrieval error rather than an empty successful result.

### Enrollment Failure

Do not report successful enrollment before persistence succeeds.

### Duplicate Membership

Use an approved duplicate handling process.

### Profile Update Failure

Preserve the previous valid state when an update fails.

### Reward Error

Do not issue duplicate benefits during retries.

### Communication Failure

Distinguish failed delivery from successful delivery.

### External Integration Failure

Provide an appropriate operational fallback.

### Unauthorized Operation

Reject access without exposing protected information.

### Concurrent Updates

Consider conflicts when multiple managers edit the same record.

### Data Inconsistency

Investigate differences between integrated systems.

### Recovery

Follow approved backup, correction, and escalation procedures.

## Manager Operating Procedures

The following workflows are proposed for the future administrative module.

### Reviewing Membership

1. Sign in as an authorized manager.
2. Open the FAM CLUB management interface.
3. Review the membership overview.
4. Locate the relevant member.
5. Access only information needed for the task.
6. Record any approved action.

### Reviewing Enrollment Issues

1. Identify the failed or incomplete enrollment.
2. Review available error information.
3. Verify the intended member identity.
4. Correct authorized data when appropriate.
5. Retry through the approved process.
6. Confirm the result.

### Updating Program Settings

1. Obtain approval for the change.
2. Review existing settings.
3. Apply the approved update.
4. Validate the configuration.
5. Save.
6. Verify persistence.
7. Review the public-facing program description.

### Managing Benefits

1. Verify the approved benefit rules.
2. Locate the applicable member or program setting.
3. Apply the authorized action.
4. Confirm the operation.
5. Verify the resulting program state.
6. Record the action where required.

### Handling Privacy Requests

1. Verify the request through an approved process.
2. Identify applicable records.
3. Follow the approved privacy procedure.
4. Avoid unauthorized disclosure.
5. Document completion appropriately.

### Current Operational Boundary

These procedures describe the intended future workflow, not confirmed existing administrative controls.

## Testing and Verification

### Authorization

- Valid active manager.
- Unauthenticated user.
- Inactive manager.
- Unauthorized role.
- Direct route access.
- Unauthorized mutation attempt.

### Enrollment

- Valid enrollment.
- Missing required information.
- Duplicate enrollment.
- Invalid contact information.
- Consent validation.
- Persistence failure.

### Member Profiles

- Correct member retrieval.
- Authorized edits.
- Invalid edits.
- Profile update failure.
- Data access restrictions.

### Program Configuration

- Valid settings.
- Invalid settings.
- Save confirmation.
- Public consistency.
- Permission enforcement.

### Rewards

If implemented:

- Correct earning.
- Correct redemption.
- Duplicate prevention.
- Expiration handling.
- Manual adjustment authorization.

### Communications

- Consent enforcement.
- Preference handling.
- Approved templates.
- Opt-out behavior.
- Delivery failure.

### Reporting

- Accurate metrics.
- Correct date range.
- Appropriate access.
- Safe exports.
- Empty datasets.

### Security

- Database policies.
- Input validation.
- Data minimization.
- Session expiration.
- Secret protection.

### Recovery

- Database outage.
- Network interruption.
- Integration failure.
- Duplicate submission.
- Concurrent changes.

## Implementation Roadmap

### Stage 1 — Confirm Program Requirements

Define:

- Membership eligibility.
- Enrollment method.
- Member benefits.
- Rewards rules.
- Communications.
- Privacy requirements.

### Stage 2 — Inspect Existing Public Experience

Review the current loyalty component and any associated routes or data integrations.

### Stage 3 — Select Program Architecture

Determine whether the program will use:

- Custom Supabase-backed membership management.
- An external loyalty provider.
- A hybrid architecture.

### Stage 4 — Design Data and Security

Define approved database structures, access policies, consent records, and retention rules.

### Stage 5 — Implement Manager Interface

Build protected membership and program configuration tools.

### Stage 6 — Implement Approved Operations

Add enrollment management, benefits, and activity tracking as required.

### Stage 7 — Integrate Communications

Connect approved messaging services with appropriate consent enforcement.

### Stage 8 — Test

Verify authentication, authorization, data integrity, privacy, and operational recovery.

### Stage 9 — Operational Handoff

Provide manager instructions and support procedures.

### Scheduling

This is a proposed sequence, not a committed delivery schedule.

## Implementation Status

| Capability | Status |
|---|---|
| Public loyalty component | Implemented |
| Admin Dashboard foundation | Implemented |
| Manager authentication | Implemented |
| Active manager authorization | Implemented |
| Public FAM CLUB behavior inventory | Source verification pending |
| Dedicated FAM CLUB admin route | Planned |
| Membership database schema | Design pending |
| Member enrollment management | Planned |
| Member profile management | Planned |
| Program settings management | Planned |
| Rewards and benefit rules | Pending Approval |
| Rewards balance and redemption engine | Under Evaluation |
| Member activity history | Planned |
| Member communications | Under Evaluation |
| Member search and filtering | Planned |
| Membership reporting | Planned |
| External loyalty platform | Under Evaluation |
| Toast POS loyalty integration | Under Evaluation |
| Comprehensive privacy and consent review | Pending Approval |
| End-to-end operational testing | Pending implementation |

## Related Documentation

- [Admin Dashboard Overview](README.md)
- [Dashboard Overview](dashboard-overview.md)
- [Manager Permissions](manager-permissions.md)
- [Website FAM CLUB Overview](../02-website/ff-fam-club/README.md)
- [FAM CLUB Program Overview](../02-website/ff-fam-club/program-overview.md)
- [FAM CLUB Member Experience](../02-website/ff-fam-club/member-experience.md)
- [Website FAM CLUB Administration](../02-website/ff-fam-club/admin-management.md)
- [Authentication Overview](../05-authentication/README.md)
- [Database Overview](../06-database/README.md)
- [Access Policies](../06-database/access-policies.md)
- [Toast POS Integration Overview](../10-toast-pos-integration/README.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Master Documentation Index](../README.md)

---

[Back to Admin Dashboard Overview](README.md)
