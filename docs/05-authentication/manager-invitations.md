# AUTHENTICATION — Manager Invitations

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Manager role authorization implemented; invitation creation, delivery, acceptance, and lifecycle management require source verification

**Feature:** Administrative Account Provisioning and Manager Invitations

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Invitation Objectives](#invitation-objectives)
3. [Current Implementation](#current-implementation)
4. [Invitation Architecture](#invitation-architecture)
5. [Authorization and Ownership](#authorization-and-ownership)
6. [Manager Account Lifecycle](#manager-account-lifecycle)
7. [Creating an Invitation](#creating-an-invitation)
8. [Invitation Delivery](#invitation-delivery)
9. [Invitation Acceptance](#invitation-acceptance)
10. [Staff Role Assignment](#staff-role-assignment)
11. [Invitation Expiration](#invitation-expiration)
12. [Resending and Revoking Invitations](#resending-and-revoking-invitations)
13. [Existing Accounts and Duplicate Invitations](#existing-accounts-and-duplicate-invitations)
14. [Manager Activation and Deactivation](#manager-activation-and-deactivation)
15. [Invitation Administration Interface](#invitation-administration-interface)
16. [Database and Persistence](#database-and-persistence)
17. [Email and Redirect Configuration](#email-and-redirect-configuration)
18. [Security and Privacy](#security-and-privacy)
19. [Error Handling and Recovery](#error-handling-and-recovery)
20. [Operational Procedures](#operational-procedures)
21. [Testing and Verification](#testing-and-verification)
22. [Implementation Roadmap](#implementation-roadmap)
23. [Implementation Status](#implementation-status)
24. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the intended process for inviting, onboarding, authorizing, and deactivating administrative managers for the Fin & Feathers Las Vegas website.

The invitation process must establish an authenticated identity and associate that identity with approved manager authorization.

These are separate responsibilities.

An invitation should not be treated as proof that an individual already has access to protected administrative features.

This document covers:

- Invitation authorization.
- Account provisioning.
- Email delivery.
- Invitation acceptance.
- Staff role assignment.
- Activation.
- Expiration.
- Resending.
- Revocation.
- Duplicate accounts.
- Deactivation.
- Security.
- Operational testing.

This document distinguishes verified authorization code from invitation functionality that requires further source inspection.

## Invitation Objectives

The manager invitation process should provide secure and controlled administrative onboarding.

### Approved Access

Only explicitly approved individuals should receive manager access.

### Reliable Provisioning

The invitation workflow should establish the correct account identity.

### Role Consistency

Manager authorization should correspond to the intended authenticated user.

### Secure Delivery

Invitation links must be delivered through an approved mechanism.

### Clear Acceptance

Recipients should understand how to complete onboarding.

### Safe Failure

Failed or incomplete invitations must not accidentally grant administrative access.

### Recoverability

Expired or failed invitations should have an approved recovery process.

### Accountability

Significant provisioning and deactivation actions should be traceable.

## Current Implementation

**Status:** Manager authorization foundation verified

The application uses Supabase Auth.

### Established Authorization Source

    src/lib/auth/require-manager.ts

### Established Role Table

    staff_roles

### Established Role Fields

    user_id
    role
    is_active

### Required Manager Role

    manager

### Required Active State

    is_active = true

### Existing Login Destination

    /admin/login

### Verified Authorization Behavior

The application verifies the authenticated user identifier and checks for an active manager staff role.

### Invitation Implementation Boundary

The following have not yet been confirmed from the latest source:

- Invitation creation route.
- Invitation delivery mechanism.
- Invitation acceptance callback.
- Invitation status storage.
- Invitation resend controls.
- Invitation revocation controls.
- Manager onboarding interface.

### Source Review Requirement

Inspect the current authentication and administrative files before labeling any invitation workflow as implemented.

## Invitation Architecture

The invitation architecture should integrate with Supabase Auth and the existing staff authorization model.

### Authentication Provider

    Supabase Auth

### Application Framework

    Next.js App Router

### Database

    Supabase PostgreSQL

### Manager Authorization

    requireManager()

### Proposed Lifecycle

1. Authorized administrator approves a new manager.
2. Invitation process identifies the intended recipient.
3. Approved Supabase account provisioning begins.
4. Recipient receives an invitation.
5. Recipient completes the approved acceptance process.
6. Authenticated identity is confirmed.
7. Staff role is associated with the correct identity.
8. Manager authorization is verified.
9. Administrative access becomes available.

### Architectural Decision

The exact point at which the staff role is created or activated requires approval.

### Security Requirement

The system must avoid accidentally granting access to an unintended account.

### Implementation Boundary

This is a proposed lifecycle, not a verified existing invitation pipeline.

## Authorization and Ownership

Manager invitations are privileged administrative operations.

### Invitation Authority

The business must determine who may invite managers.

### Existing Manager Authorization

The established helper validates active managers.

### Additional Provisioning Permission

Invitation creation may require a more restrictive permission than ordinary manager access.

### Server-Side Enforcement

Invitation operations must be protected on the server.

### Supabase Administrative APIs

Privileged Supabase administrative operations must remain server-side.

### Browser Restriction

Service-role credentials must never be exposed to the browser.

### Approval

New manager access should require an authorized business decision.

### Accountability

Invitation creation and role assignment should identify the responsible administrator where appropriate.

### Separation of Duties

The business may require different permissions for operational managers and account administrators.

## Manager Account Lifecycle

A manager account may move through several conceptual stages.

### Proposed Stages

- Requested.
- Approved.
- Invited.
- Pending acceptance.
- Authenticated.
- Active manager.
- Inactive manager.
- Revoked.

These are conceptual lifecycle stages, not verified database status values.

### Requested

An individual has been proposed for manager access.

### Approved

The appropriate authority has approved access.

### Invited

An approved invitation has been initiated.

### Pending Acceptance

The recipient has not completed the required onboarding.

### Authenticated

The recipient has established a valid Supabase identity.

### Active Manager

The identity has an active manager staff role.

### Inactive Manager

The role is no longer active.

### Revoked

Access has been withdrawn according to approved procedures.

### Lifecycle Integrity

The system should prevent inconsistent or unauthorized transitions.

## Creating an Invitation

**Status:** Proposed workflow

### Step 1 — Obtain Approval

Confirm the individual is approved for administrative access.

### Step 2 — Verify Recipient

Confirm the intended recipient's email address through an approved process.

### Step 3 — Open Provisioning

Access the authorized manager invitation interface or approved administrative process.

### Step 4 — Enter Details

Provide the minimum required invitation information.

### Step 5 — Select Access

Choose the approved role.

### Step 6 — Review

Verify the recipient and intended access.

### Step 7 — Submit

Initiate the invitation through a protected server operation.

### Step 8 — Confirm Provider Result

Check whether the authentication provider accepted the operation.

### Step 9 — Record Outcome

Store any required invitation metadata.

### Step 10 — Verify Delivery

Review the delivery status where available.

### Step 11 — Await Acceptance

Do not assume the recipient has completed onboarding.

### Step 12 — Verify Authorization

Confirm the resulting account has the correct approved role and active status.

### Implementation Boundary

These steps describe the intended process, not verified current UI controls.

## Invitation Delivery

Invitation delivery should use an approved communication mechanism.

### Preferred Channel

Email may be used for manager invitations.

### Provider

Supabase Auth supports administrative invitation capabilities.

### Application Integration

The actual configured delivery workflow requires verification.

### Recipient Accuracy

The invitation must be sent to the intended approved address.

### Email Content

The message should clearly identify the invitation purpose.

### Link Security

Invitation links must be treated as sensitive.

### Delivery Failure

Failed delivery should not be reported as successful acceptance.

### Spam Filtering

Recipients may need guidance for locating expected invitation messages.

### Resending

Resending should follow approved limits and security procedures.

### Logging

Avoid logging complete invitation links or sensitive tokens.

## Invitation Acceptance

**Status:** Source verification pending

The acceptance process should establish the correct authenticated identity.

### Proposed Flow

1. Recipient opens the approved invitation link.
2. Application or provider validates the invitation.
3. Recipient completes required account setup.
4. Authentication state is established.
5. Application verifies the intended account identity.
6. Staff authorization is checked.
7. Approved access is granted only when all requirements are satisfied.

### Link Validation

Invalid or expired links must be rejected.

### Identity Matching

The resulting authenticated account must match the intended invitation recipient.

### Password Setup

If password setup is required, it must follow the approved authentication policy.

### Redirect

The recipient should reach an approved application destination.

### Authorization Boundary

Invitation acceptance alone must not bypass the active manager role requirement.

### Error Handling

The interface should explain failure without exposing sensitive account information.

## Staff Role Assignment

The application uses database-backed staff role authorization.

### Established Table

    staff_roles

### Established Fields

    user_id
    role
    is_active

### User Identifier

The role must reference the correct Supabase authenticated user identifier.

### Required Role

    manager

### Active Requirement

The staff role must be active before manager access is granted.

### Role Assignment Timing

The business and implementation must determine whether the role is created:

- Before invitation acceptance.
- During onboarding.
- After successful acceptance and approval.

### Duplicate Roles

The workflow should prevent unintended duplicate role records.

### Failed Provisioning

A failed invitation must not leave an unintended active manager authorization.

### Verification

The role should be tested through the actual protected authorization helper.

### Important Boundary

Role assignment behavior beyond the verified authorization query requires source and schema inspection.

## Invitation Expiration

Invitation links should follow the provider's configured expiration behavior.

### Expiration Policy

The applicable expiration period must be confirmed from Supabase configuration.

### Expired Link

An expired invitation must not be accepted.

### User Feedback

Recipients should receive a clear, non-sensitive error message.

### Recovery

An authorized administrator may need to issue a replacement invitation.

### Old Links

The implementation should determine whether previously issued links remain usable after resending.

### Account State

Invitation expiration should not create unintended manager access.

### Verification

Test expiration using the configured provider behavior.

### Documentation Boundary

Do not hardcode an invitation expiration duration without configuration evidence.

## Resending and Revoking Invitations

**Status:** Planned or source verification pending

Administrators may need to resend or cancel invitations.

### Resend Use Cases

- Original email was not received.
- Link expired.
- Recipient requires a replacement.
- Delivery failed.

### Resend Authorization

Only approved administrators should initiate resends.

### Rate Limits

The system should prevent excessive invitation sending.

### Revocation Use Cases

- Invitation sent to the wrong recipient.
- Manager access no longer approved.
- Suspected compromise.
- Duplicate invitation.

### Revocation Complexity

Revoking an invitation may require more than changing an application record.

### Provider State

The implementation must consider the authentication provider's actual invitation and account state.

### Role State

Any associated active manager role must be reviewed.

### Verification

Confirm revoked access cannot reach protected administrative resources.

## Existing Accounts and Duplicate Invitations

The invitation workflow must handle recipients who already have accounts.

### Existing Supabase User

An invitation attempt may target an email already associated with a Supabase identity.

### Existing Manager

The system should avoid duplicate provisioning for an already authorized manager.

### Existing Non-Manager

Granting manager access to an existing user requires explicit approval.

### Identity Verification

The correct authenticated user identifier must be used.

### Duplicate Requests

Repeated submissions should not create inconsistent role assignments.

### Email Changes

An email address change must not accidentally transfer authorization to another identity.

### Provider Behavior

Existing-user invitation behavior must be verified against the actual Supabase implementation.

### Security

Account existence should not be disclosed unnecessarily through public-facing errors.

## Manager Activation and Deactivation

Manager access depends on the staff role state.

### Active Manager

The existing authorization helper requires:

    role = manager
    is_active = true

### Deactivation

Removing active authorization should prevent manager access.

### Established Behavior

An inactive staff role does not satisfy `requireManager()`.

### Deactivation Procedure

1. Confirm the access removal is authorized.
2. Identify the correct authenticated user.
3. Update the approved staff role state.
4. Review active sessions as required.
5. Verify protected access is denied.
6. Document the action appropriately.

### Authentication Account

Deactivating the staff role does not necessarily delete the Supabase Auth identity.

### Session Revocation

Additional session revocation may be required depending on the security situation.

### Reinstatement

Reactivating a manager must require renewed approval.

### Auditability

Role activation and deactivation should be traceable.

## Invitation Administration Interface

**Status:** Planned or source verification pending

A future manager provisioning interface may display invitation information.

### Potential Sections

- Pending invitations.
- Accepted invitations.
- Expired invitations.
- Revoked invitations.
- Active managers.
- Inactive managers.

### Potential Fields

- Recipient email.
- Intended role.
- Invitation status.
- Invitation date.
- Expiration information.
- Inviting administrator.

### Administrative Actions

Potential actions include:

- Invite.
- Resend.
- Revoke.
- Review.
- Deactivate.

### Data Protection

Only authorized administrators should access provisioning information.

### Search

Search should be restricted to approved account information.

### Empty States

No invitations should not be confused with a retrieval failure.

### Implementation Boundary

These are proposed controls, not confirmed existing UI components.

## Database and Persistence

**Status:** Staff authorization table established; invitation persistence design pending

### Established Staff Role Table

    staff_roles

### Established Fields

    user_id
    role
    is_active

### Authentication Identity

Supabase Auth manages authenticated user identities.

### Potential Invitation Metadata

A future invitation record may include:

- Invitation identifier.
- Intended recipient.
- Requested role.
- Creation time.
- Status.
- Expiration reference.
- Inviting administrator.
- Acceptance reference.

### Schema Boundary

These are conceptual attributes, not verified existing invitation columns or tables.

### Identity Consistency

Invitation and staff role data must refer to the correct user identity.

### Database Policies

Invitation metadata must have appropriate access controls.

### Retention

Provisioning records require an approved retention policy.

### Audit History

Significant role and invitation changes may require audit records.

## Email and Redirect Configuration

Invitations depend on correct provider and application configuration.

### Production Domain

    https://finandfeatherslv.live

### Login Destination

    /admin/login

### Supabase Redirect Settings

Approved invitation redirect URLs must be configured correctly.

### Preview Deployments

Preview environments may require separately approved redirect destinations.

### Email Templates

Invitation email content should be reviewed for clarity and brand consistency.

### Sender Configuration

Email sender identity and delivery settings require verification.

### Link Expiration

The provider's configured expiration behavior must be confirmed.

### Environment Variables

Private credentials must remain server-side.

### Delivery Verification

Test actual invitation delivery in the intended environment.

### Security

Never place invitation tokens or privileged credentials in documentation.

## Security and Privacy

Manager invitations are high-privilege account operations.

### Authentication

Invitation administration must require valid authentication.

### Authorization

Provisioning must require explicit administrative authority.

### Server-Side Operations

Privileged invitation actions must run on the server.

### Service Credentials

Never expose service-role credentials to browser code.

### Recipient Verification

Confirm invitation recipient details before sending.

### Token Protection

Treat invitation links as sensitive credentials.

### Account Enumeration

Avoid unnecessarily revealing account existence.

### Least Privilege

Grant only the approved role.

### Active Status

Do not activate a manager role without appropriate approval.

### Logging

Avoid recording complete invitation tokens.

### Auditability

Record significant provisioning actions where required.

### Incident Response

Revoke affected authorization if an invitation or account is compromised.

## Error Handling and Recovery

### Invalid Recipient

Reject malformed or unapproved recipient information.

### Provider Failure

Do not report successful invitation creation when the provider rejects the request.

### Delivery Failure

Distinguish invitation creation from actual email delivery.

### Expired Invitation

Provide an approved replacement process.

### Invalid Token

Reject acceptance safely.

### Existing Account

Handle the provider's actual existing-user behavior.

### Duplicate Invitation

Prevent unintended duplicate provisioning.

### Role Assignment Failure

Do not grant access if role assignment fails.

### Incorrect Role

Correct authorization through an approved administrative process.

### Inactive Manager

Do not allow protected access.

### Redirect Failure

Review approved callback and redirect configuration.

### Partial Provisioning

Investigate accounts created without the intended completed onboarding.

### Recovery

Use documented administrative procedures rather than bypassing authorization checks.

## Operational Procedures

### Inviting a Manager

1. Obtain appropriate approval.
2. Verify the intended recipient.
3. Confirm the requested role.
4. Initiate the invitation through the approved system.
5. Confirm the provider accepted the operation.
6. Verify delivery where possible.
7. Await recipient acceptance.
8. Verify correct staff authorization.
9. Confirm protected dashboard access.

### Resending an Invitation

1. Verify the original invitation.
2. Confirm the recipient.
3. Check current account state.
4. Initiate an approved resend.
5. Confirm the new delivery outcome.
6. Verify the old invitation's status where applicable.

### Revoking an Invitation

1. Confirm the revocation request.
2. Identify the correct invitation.
3. Revoke through the approved process.
4. Review associated authentication and role state.
5. Verify unauthorized access is denied.
6. Document the result.

### Deactivating a Manager

1. Confirm access removal approval.
2. Identify the correct user.
3. Deactivate the staff role.
4. Review session revocation requirements.
5. Test protected access.
6. Record completion.

### Current Operational Boundary

These procedures are the intended operating model; actual invitation controls require source verification.

## Testing and Verification

### Invitation Creation

- Authorized invitation.
- Unauthorized invitation attempt.
- Invalid recipient.
- Missing required information.
- Provider failure.

### Delivery

- Correct recipient.
- Approved email content.
- Valid redirect.
- Failed delivery.
- Resend behavior.

### Acceptance

- Valid invitation.
- Expired invitation.
- Invalid invitation.
- Already-used invitation.
- Correct authenticated identity.

### Role Assignment

- Correct user identifier.
- Correct manager role.
- Correct active status.
- Missing role.
- Duplicate role prevention.

### Authorization

- Active manager can access dashboard.
- Inactive manager denied.
- Non-manager denied.
- Unauthenticated user denied.
- Role lookup failure denied.

### Existing Accounts

- Existing manager.
- Existing non-manager.
- Duplicate invitation.
- Incorrect recipient.
- Email identity mismatch.

### Revocation

- Pending invitation revocation.
- Role deactivation.
- Session behavior.
- Direct protected route access.

### Security

- No browser-exposed service credentials.
- Protected invitation actions.
- Safe error messages.
- Secure token handling.
- Appropriate database policies.

### Production

- Correct production redirects.
- Correct email sender.
- Valid invitation links.
- Expiration behavior.
- Complete onboarding.

## Implementation Roadmap

### Stage 1 — Inspect Existing Source

Review authentication routes, administrative account controls, and Supabase configuration.

### Stage 2 — Verify Provider Settings

Confirm invitation delivery, expiration, email templates, and redirect destinations.

### Stage 3 — Approve Provisioning Authority

Determine who may create, resend, revoke, and activate manager accounts.

### Stage 4 — Define Lifecycle

Approve account creation, acceptance, role assignment, and deactivation procedures.

### Stage 5 — Implement Missing Controls

Build only the invitation and account management capabilities not already present.

### Stage 6 — Apply Security Policies

Protect privileged operations and provisioning records.

### Stage 7 — Test End to End

Verify invitation delivery, acceptance, authorization, expiration, and revocation.

### Stage 8 — Operational Handoff

Provide approved onboarding and deactivation instructions.

### Scheduling

This sequence is proposed and does not establish a committed delivery date.

## Implementation Status

| Capability | Status |
|---|---|
| Supabase Auth foundation | Implemented |
| Server-side Supabase client | Implemented |
| Manager authorization helper | Implemented |
| Staff role lookup | Implemented |
| Active manager requirement | Implemented |
| Unauthorized manager access denial | Implemented |
| Invitation creation route | Source verification pending |
| Invitation email delivery | Configuration verification pending |
| Invitation acceptance callback | Source verification pending |
| Invitation expiration handling | Verification pending |
| Invitation resend | Source verification pending |
| Invitation revocation | Source verification pending |
| Staff role assignment workflow | Source verification pending |
| Existing-account handling | Verification pending |
| Manager deactivation enforcement | Implemented in authorization helper |
| Manager deactivation operating procedure | Planned |
| Invitation administration interface | Under Evaluation |
| Provisioning audit history | Under Evaluation |
| Comprehensive invitation acceptance tests | Verification pending |

## Related Documentation

- [Authentication Overview](README.md)
- [Supabase Authentication](supabase-auth.md)
- [Password Recovery](password-recovery.md)
- [Admin Dashboard Overview](../04-admin-dashboard/README.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Dashboard Overview](../04-admin-dashboard/dashboard-overview.md)
- [Database Overview](../06-database/README.md)
- [Access Policies](../06-database/access-policies.md)
- [Deployment Overview](../07-deployment/README.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Master Documentation Index](../README.md)

---

[Back to Authentication Overview](README.md)
