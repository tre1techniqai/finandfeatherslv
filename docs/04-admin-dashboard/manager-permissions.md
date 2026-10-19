# ADMIN DASHBOARD — Manager Permissions

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Manager authentication and role-based route protection implemented; granular permissions and comprehensive access auditing under evaluation

**Feature:** Administrative Authentication, Authorization, and Permissions

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Permission Model Overview](#permission-model-overview)
3. [Current Implementation](#current-implementation)
4. [Authentication Architecture](#authentication-architecture)
5. [Manager Authorization Helper](#manager-authorization-helper)
6. [Staff Roles](#staff-roles)
7. [Manager Access Requirements](#manager-access-requirements)
8. [Protected Administrative Routes](#protected-administrative-routes)
9. [Server-Side Authorization](#server-side-authorization)
10. [Database Access Policies](#database-access-policies)
11. [Administrative Mutations](#administrative-mutations)
12. [Manager Invitations and Provisioning](#manager-invitations-and-provisioning)
13. [Account Deactivation and Access Revocation](#account-deactivation-and-access-revocation)
14. [Session Management](#session-management)
15. [Future Permission Expansion](#future-permission-expansion)
16. [Module Permission Requirements](#module-permission-requirements)
17. [Security and Privacy](#security-and-privacy)
18. [Audit Logging and Accountability](#audit-logging-and-accountability)
19. [Testing and Verification](#testing-and-verification)
20. [Operational Procedures](#operational-procedures)
21. [Implementation Status](#implementation-status)
22. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the manager access and permission model used by the Fin & Feathers Las Vegas administrative system.

It establishes the distinction between authentication, authorization, database security, and administrative operations.

The document covers:

- Supabase authentication.
- Manager role verification.
- Active staff status.
- Protected administrative routes.
- Server-side authorization.
- Database access policies.
- Administrative data mutations.
- Manager account provisioning.
- Access revocation.
- Session security.
- Future permission expansion.
- Testing and operational procedures.

The existing manager authorization implementation is the foundation for future administrative modules.

## Permission Model Overview

Administrative access requires more than a successful login.

### Authentication

Authentication determines whether the user has a valid identity and session.

### Authorization

Authorization determines whether the authenticated user is permitted to access a protected resource.

### Active Staff Status

The existing manager model also requires the staff role to be active.

### Database Authorization

Database access must be protected independently through appropriate application authorization and database policies.

### Current Model

The established administrative helper authorizes users with the active `manager` role.

### Future Model

More granular permissions may be introduced when additional staff workflows require them.

### Core Principle

A user who can sign in is not automatically authorized to manage restaurant operations.

## Current Implementation

**Status:** Implemented foundation

The project uses Supabase Auth for administrative authentication.

### Established Authorization File

    src/lib/auth/require-manager.ts

### Established Dashboard Route

    /admin

### Dashboard Source

    src/app/admin/page.tsx

### Existing Menu Administration Route

    /admin/menu

### Menu Administration Source

    src/app/admin/menu/page.tsx

### Staff Role Table

    staff_roles

### Current Authorization Conditions

The manager helper requires:

1. Valid authentication claims.
2. An authenticated user identifier.
3. A matching staff role record.
4. An active staff role.
5. The `manager` role.

### Unauthorized Access

The helper redirects users who fail the required checks.

### Important Boundary

The presence of this helper does not prove that every administrative route, API endpoint, server action, or database policy has been independently audited.

## Authentication Architecture

Supabase Auth provides the identity foundation for administrative access.

### Authentication Provider

    Supabase Auth

### Server Client

The existing helper uses the application's server-side Supabase client.

### Established Import

    @/lib/supabase/server

### Claims Verification

The helper calls:

    supabase.auth.getClaims()

### Authenticated User Identifier

The helper reads the authenticated subject identifier from the returned claims.

### Missing Session

When valid authentication claims are unavailable, the user is redirected to the admin login page.

### Authentication Failure

An invalid or expired session must not grant access to administrative data.

### Authentication Boundary

Authentication establishes identity.

It does not establish manager permission without the staff role check.

## Manager Authorization Helper

The established helper is:

    requireManager()

### Source

    src/lib/auth/require-manager.ts

### Purpose

Require a valid authenticated user with an active manager role.

### Authentication Check

The helper obtains the Supabase server client and verifies authentication claims.

### User Identifier

The authenticated user identifier is taken from the claims subject.

### Role Query

The helper queries:

    staff_roles

### Selected Role Information

The established query selects:

- `user_id`
- `role`
- `is_active`

### User Matching

The query matches the authenticated user identifier.

### Active Status Filter

The query requires:

    is_active = true

### Role Requirement

The resulting record must have:

    role = manager

### Missing Role

If the role record is missing, invalid, or unauthorized, the helper redirects the user.

### Authorized Result

On successful authorization, the helper returns the Supabase client and authenticated user identifier.

### Established Return Values

- `supabase`
- `userId`

### Redirect Behavior

Unauthenticated users are redirected to:

    /admin/login

Unauthorized users are redirected to:

    /admin/login?error=unauthorized

### Security Requirement

Future protected management routes should follow the established authorization pattern.

## Staff Roles

The application uses the `staff_roles` table to determine manager authorization.

### Established Table

    staff_roles

### Established Columns Used by the Helper

- `user_id`
- `role`
- `is_active`

These columns are verified from the existing authorization helper.

### User Identifier

The `user_id` field associates a staff role with an authenticated Supabase user.

### Role

The `role` field identifies the user's administrative role.

### Active Status

The `is_active` field determines whether the role is active.

### Current Required Role

    manager

### Additional Columns

Other table columns, indexes, constraints, and relationships require schema inspection.

### Additional Roles

Do not assume other role values exist without reviewing the database schema.

### Role Record Integrity

Role records should be created and modified only through authorized administrative processes.

### Security Boundary

Users must not be able to assign themselves the manager role.

## Manager Access Requirements

A user must satisfy all established manager authorization requirements.

### Requirement 1 — Authenticated Identity

The user must have valid Supabase authentication claims.

### Requirement 2 — Valid User Identifier

The claims must contain a usable authenticated subject identifier.

### Requirement 3 — Matching Staff Record

The `staff_roles` table must contain the appropriate staff record.

### Requirement 4 — Active Status

The role must be active.

### Requirement 5 — Manager Role

The role must equal `manager`.

### Failure Handling

Failure of any required condition prevents access through the established helper.

### Example — Authenticated Without Role

A user may have a valid session but no staff role.

The user must not gain manager access.

### Example — Inactive Manager

A user may have the manager role but an inactive staff record.

The user must not gain manager access.

### Example — Different Role

A user with a role other than manager must not pass the existing manager authorization check.

## Protected Administrative Routes

Administrative routes must enforce authorization.

### Existing Dashboard

    /admin

### Existing Menu Management

    /admin/menu

### Planned Documentation Viewer

    /admin/docs

### Future Management Modules

Potential protected routes may support:

- Reservations.
- SPECIALS.
- FAM CLUB.
- GALLERY.
- MERCH.

### Server Protection

Every protected route must perform the appropriate server-side authorization check.

### Nested Routes

Authorization must not rely solely on protection applied to a parent navigation page.

### Direct Navigation

Users may attempt to open administrative URLs directly.

Direct access must remain protected.

### API Routes

Administrative API routes require independent authorization where applicable.

### Server Actions

Administrative server actions must validate the caller's permission before making changes.

### Verification

Route-level authorization must be tested for every implemented module.

## Server-Side Authorization

Server-side authorization is the primary enforcement mechanism.

### Existing Pattern

    requireManager()

### Protected Page Flow

1. Request reaches an administrative route.
2. Server validates the authenticated user.
3. Server checks the staff role.
4. Unauthorized users are redirected.
5. Authorized users receive the protected page.

### Mutation Flow

1. Client submits an administrative operation.
2. Server verifies authentication.
3. Server verifies authorization.
4. Server validates input.
5. Server performs the permitted operation.
6. Server returns the actual result.

### Client-Side Controls

Client-side checks can improve usability but cannot replace server authorization.

### Security Rule

Never trust an administrative role supplied directly by the browser.

### Error Handling

Authorization failures should not disclose sensitive application details.

## Database Access Policies

Supabase database security is an additional protection layer.

### Row-Level Security

Supabase PostgreSQL supports row-level security policies.

### Policy Objective

Restrict access to protected records according to the approved authorization model.

### Staff Role Data

The `staff_roles` table requires appropriate protection.

### Manager Access

Manager reads and writes should be permitted only where explicitly authorized.

### Public Website Access

Public website visitors should not gain access to administrative records.

### Future Modules

New administrative tables may require policies for:

- Reservation requests.
- Menu changes.
- SPECIALS schedules.
- FAM CLUB member information.
- GALLERY metadata.
- MERCH catalog and orders.

### Service Credentials

Privileged service credentials must not be exposed to the browser.

### Verification Boundary

The actual database policy definitions must be inspected before documenting them as verified.

### Defense in Depth

Server-side checks and database policies should reinforce each other.

## Administrative Mutations

Administrative mutations change application data or configuration.

### Examples

- Create menu item.
- Update menu item.
- Change item visibility.
- Upload media.
- Delete media.
- Schedule a special.
- Update member settings.
- Modify product details.
- Change reservation status.

### Authorization

Each mutation must verify that the caller has permission.

### Validation

Submitted values must be validated before persistence.

### Database Result

The interface should report success only after the database operation succeeds.

### File Uploads

Uploads require appropriate file validation and storage authorization.

### Destructive Operations

Deletion and other irreversible actions should include safeguards.

### Auditability

Important changes may require an audit record.

### Concurrency

Future tools should consider conflicting changes from multiple managers.

### Failure Recovery

Failed operations must not be presented as completed.

## Manager Invitations and Provisioning

Manager account provisioning requires controlled procedures.

### Identity Creation

A manager must have an appropriate Supabase Auth identity.

### Staff Role Assignment

The identity must be associated with an authorized active manager role.

### Approval

Only an authorized person should approve manager access.

### Invitation Workflow

The project's invitation implementation is documented separately.

### Security

Invitations must not permit unauthorized users to grant themselves administrative access.

### Duplicate Accounts

Provisioning should avoid accidental duplicate identities.

### Initial Access

Managers should follow the approved first-login process.

### Password Setup

Password setup and recovery should use approved authentication mechanisms.

### Verification

The exact invitation and role-provisioning implementation must be verified from source before being described as fully operational.

## Account Deactivation and Access Revocation

Manager access must be removable when no longer authorized.

### Active Status

The established helper checks:

    is_active

### Inactive Staff

A staff record that does not meet the active requirement fails the manager check.

### Revocation Procedure

The restaurant should establish an approved process to revoke access.

### Role Removal

Removing or changing a manager role should prevent future manager authorization.

### Session Considerations

The business should review how quickly existing sessions lose effective access after role changes.

### Server Revalidation

Protected requests should revalidate the user's authorization.

### Offboarding

Offboarding procedures should consider:

- Account access.
- Staff role status.
- Shared credentials.
- Connected services.
- Device access.
- Outstanding operational responsibilities.

### Audit

Revocation events may require operational records.

## Session Management

Authentication sessions require appropriate security controls.

### Session Validity

The server must verify valid authentication claims.

### Session Expiration

Expired sessions must not continue to authorize protected operations.

### Logout

The administrative interface should provide an approved logout workflow.

### Shared Devices

Managers should avoid leaving authenticated sessions unattended.

### Role Changes

Server-side role verification helps enforce changes to manager access.

### Session Storage

Session handling should follow the application's established Supabase integration.

### Browser Security

Sensitive credentials should not be exposed through browser code.

### Testing

Session expiration, logout, and revoked-role behavior require verification.

## Future Permission Expansion

**Status:** Under Evaluation

The current established authorization helper uses a manager role check.

### Potential Need

Future administrative modules may require more granular access.

### Possible Permission Areas

- View reservations.
- Manage reservations.
- Edit menu.
- Publish specials.
- Manage gallery.
- Manage loyalty settings.
- Manage merchandise.
- Read internal documentation.

### Conceptual Roles

The business may eventually consider different staff access levels.

These are planning concepts, not confirmed existing roles.

### Principle of Least Privilege

Users should receive only the permissions required for their duties.

### Authorization Design

Future permission checks should be enforced on the server.

### Database Alignment

Permission rules should align with database access policies.

### Migration

Any role-model expansion requires review of existing manager accounts and protected routes.

### Approval

The business must approve additional roles and their capabilities before implementation.

## Module Permission Requirements

Different management modules may require different permissions.

### Reservations

Potential permissions:

- View requests.
- Review requests.
- Record outcomes.
- Manage guest communication.

### Menu

Potential permissions:

- View menu items.
- Create items.
- Edit items.
- Change availability.
- Upload images.

### SPECIALS

Potential permissions:

- Create specials.
- Edit schedules.
- Publish specials.
- Deactivate specials.

### FAM CLUB

Potential permissions:

- View approved member information.
- Manage program settings.
- Support member operations.

### GALLERY

Potential permissions:

- Upload images.
- Edit metadata.
- Reorder images.
- Remove images.

### MERCH

Potential permissions:

- Manage products.
- Manage pricing.
- Manage inventory.
- Review orders.

### Documentation

Potential permission:

- Read internal documentation.

### Implementation Boundary

These are proposed permission categories.

They do not establish existing permission flags or database columns.

## Security and Privacy

Administrative access must protect restaurant and guest information.

### Authentication

Require valid identity verification.

### Authorization

Require an approved active role.

### Data Minimization

Expose only information needed for the authorized task.

### Guest Information

Reservation data may include names, contact details, and visit information.

### Member Information

Future FAM CLUB data requires appropriate privacy protection.

### Commerce Information

Future MERCH operations may include order and customer information.

### Credential Protection

Never expose Supabase service credentials or other private secrets.

### Input Validation

Treat client-provided values as untrusted.

### File Security

Validate uploads and restrict administrative storage operations.

### Logging

Avoid recording unnecessary personal information or credentials.

### Incident Response

Unauthorized access attempts should be investigated through approved procedures.

## Audit Logging and Accountability

**Status:** Under Evaluation

Administrative actions may require audit records.

### Potential Audit Events

- Manager invitation.
- Role assignment.
- Role deactivation.
- Menu item creation.
- Menu item update.
- Menu item deletion.
- SPECIALS publication.
- GALLERY removal.
- Reservation status change.
- MERCH product changes.

### Potential Audit Fields

- Actor identifier.
- Action.
- Affected resource.
- Timestamp.
- Result.

These are conceptual fields, not verified database columns.

### Sensitive Data

Audit logs should avoid unnecessary guest or member information.

### Tamper Resistance

Audit records should not be freely editable by ordinary administrative users.

### Retention

The business must approve an appropriate retention policy.

### Current Status

A comprehensive administrative audit logging implementation has not been established as verified.

## Testing and Verification

### Authentication Tests

- Valid manager login.
- Missing session.
- Expired session.
- Invalid claims.
- Logout behavior.

### Role Tests

- Active manager.
- Inactive manager.
- Authenticated user without staff role.
- Authenticated user with a different role.
- Missing staff record.
- Role query failure.

### Route Tests

- Protected dashboard access.
- Protected menu access.
- Direct URL access.
- Nested administrative routes.
- Future documentation route.

### Mutation Tests

- Authorized create.
- Authorized update.
- Authorized delete.
- Unauthorized create.
- Unauthorized update.
- Unauthorized delete.
- Invalid input.
- Database failure.

### Database Tests

- Verify applicable row-level security.
- Verify public access restrictions.
- Verify staff role protections.
- Verify storage permissions.

### Session Tests

- Session expiration.
- Role deactivation.
- Account revocation.
- Reauthentication.

### Future Module Tests

- SPECIALS authorization.
- FAM CLUB authorization.
- GALLERY authorization.
- MERCH authorization.
- Documentation viewer authorization.

### Acceptance Requirement

A feature should not be marked verified until its authorization and failure behavior have been tested.

## Operational Procedures

### Granting Manager Access

1. Obtain authorized approval.
2. Verify the intended user identity.
3. Follow the approved account provisioning workflow.
4. Assign the appropriate staff role.
5. Verify active status.
6. Test manager access.
7. Record the outcome appropriately.

### Revoking Manager Access

1. Confirm the authorization to revoke access.
2. Update the approved staff role record.
3. Verify protected routes reject the user.
4. Review relevant session and service access.
5. Document completion.

### Investigating Access Denial

1. Verify authentication status.
2. Verify the authenticated user identifier.
3. Check the staff role record.
4. Check active status.
5. Check the required role.
6. Review server-side errors.
7. Escalate unresolved issues.

### Reviewing Permissions

The restaurant should periodically review active manager accounts and their business need for access.

### Responding to Suspicious Activity

1. Restrict affected access when appropriate.
2. Preserve relevant operational evidence.
3. Review authentication and authorization events.
4. Rotate affected credentials if required.
5. Document the incident.
6. Restore access only after approval.

## Implementation Status

| Capability | Status |
|---|---|
| Supabase administrative authentication | Implemented |
| Server-side Supabase client | Implemented |
| Authentication claims verification | Implemented |
| Authenticated user identifier extraction | Implemented |
| `staff_roles` authorization lookup | Implemented |
| Active staff role requirement | Implemented |
| Manager role requirement | Implemented |
| `requireManager()` helper | Implemented |
| Admin Dashboard authorization | Implemented |
| Existing menu administration authorization pattern | Implemented |
| Manager invitation workflow details | Source verification pending |
| Database RLS policy inventory | Verification pending |
| All administrative mutation authorization audit | Verification pending |
| Account revocation operational checklist | Planned |
| Granular module permissions | Under Evaluation |
| Additional staff role tiers | Under Evaluation |
| Comprehensive administrative audit logging | Under Evaluation |
| Documentation viewer manager protection | Planned |

## Related Documentation

- [Admin Dashboard Overview](README.md)
- [Dashboard Overview](dashboard-overview.md)
- [Reservation Management](reservation-management.md)
- [Menu Management](menu-management.md)
- [SPECIALS Management](specials-management.md)
- [FAM CLUB Management](fam-club-management.md)
- [GALLERY Management](gallery-management.md)
- [MERCH Management](merch-management.md)
- [Authentication Overview](../05-authentication/README.md)
- [Supabase Authentication](../05-authentication/supabase-auth.md)
- [Manager Invitations](../05-authentication/manager-invitations.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Master Documentation Index](../README.md)

---

[Back to Admin Dashboard Overview](README.md)
