# AUTHENTICATION — Supabase Auth

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Supabase authentication and manager authorization foundation implemented; complete authentication flow verification ongoing

**Feature:** Administrative Authentication and Session Management

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Authentication Objectives](#authentication-objectives)
3. [Current Implementation](#current-implementation)
4. [Authentication Architecture](#authentication-architecture)
5. [Supabase Auth](#supabase-auth)
6. [Supabase Client Configuration](#supabase-client-configuration)
7. [Manager Sign-In](#manager-sign-in)
8. [Authentication Claims](#authentication-claims)
9. [Manager Role Authorization](#manager-role-authorization)
10. [Protected Administrative Routes](#protected-administrative-routes)
11. [Session Management](#session-management)
12. [Authentication State and Redirects](#authentication-state-and-redirects)
13. [Sign-Out](#sign-out)
14. [Password Recovery](#password-recovery)
15. [Manager Invitations](#manager-invitations)
16. [Database Access Policies](#database-access-policies)
17. [Security Requirements](#security-requirements)
18. [Environment Configuration](#environment-configuration)
19. [Error Handling and Recovery](#error-handling-and-recovery)
20. [Testing and Verification](#testing-and-verification)
21. [Operational Procedures](#operational-procedures)
22. [Future Enhancements](#future-enhancements)
23. [Implementation Status](#implementation-status)
24. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the Supabase authentication architecture used by the Fin & Feathers Las Vegas administrative application.

Authentication establishes the identity of a user attempting to access protected administrative functionality.

Authorization determines whether the authenticated user is permitted to perform a particular action.

These are separate responsibilities.

The document covers:

- Supabase Auth.
- Administrative sign-in.
- Authentication claims.
- Manager role verification.
- Protected routes.
- Session management.
- Redirect behavior.
- Sign-out.
- Password recovery.
- Manager invitations.
- Database policies.
- Security.
- Operational testing.

This document describes the implemented foundation and identifies functionality requiring further verification.

## Authentication Objectives

The authentication system should protect administrative functionality while providing a reliable manager experience.

### Identity Verification

Users must authenticate before accessing protected administrative resources.

### Role Enforcement

Authentication alone must not grant manager access.

### Active Staff Requirement

Only users with an approved active manager role may access manager-only functions.

### Server-Side Protection

Authorization must be enforced on the server.

### Session Reliability

Valid sessions should remain usable according to approved authentication settings.

### Safe Failure

Unauthenticated and unauthorized users must not receive protected administrative data.

### Recoverability

Approved managers should have a secure process for recovering access.

### Auditability

Significant authentication and authorization events may require appropriate monitoring.

## Current Implementation

**Status:** Implemented foundation

The application uses Supabase Auth for administrative authentication.

### Established Authorization Source

    src/lib/auth/require-manager.ts

### Established Administrative Dashboard

    src/app/admin/page.tsx

### Established Login Destination

    /admin/login

### Manager Role Source

    staff_roles

### Existing Authorization Helper

    requireManager()

### Verified Helper Behavior

The helper:

1. Creates a server-side Supabase client.
2. Reads authenticated user claims.
3. Extracts the authenticated user identifier.
4. Redirects unauthenticated users to the admin login page.
5. Queries the staff role record.
6. Requires an active manager role.
7. Redirects unauthorized users.
8. Returns the Supabase client and user identifier for authorized managers.

### Source Verification Boundary

The exact current login form, password recovery implementation, sign-out controls, and invitation workflow require separate source inspection.

### Important Distinction

The existence of an authentication provider does not establish that every account management workflow has been fully tested.

## Authentication Architecture

The application uses a server-oriented authentication architecture.

### Framework

    Next.js App Router

### Authentication Provider

    Supabase Auth

### Database

    Supabase PostgreSQL

### Administrative Authorization

    requireManager()

### Hosting

    Vercel

### General Flow

1. User opens an administrative page.
2. Application establishes the current authentication state.
3. Supabase validates the user's identity.
4. Application retrieves the user's staff role.
5. Application checks manager authorization.
6. Authorized content is rendered.
7. Unauthorized access is redirected or rejected.

### Authentication Boundary

Supabase Auth identifies the user.

### Authorization Boundary

The application checks the user's approved staff role.

### Data Boundary

Database access policies must protect underlying data independently.

### Implementation Principle

No single browser-side visibility check should be treated as sufficient security.

## Supabase Auth

Supabase Auth provides the project's authentication infrastructure.

### Identity

Each authenticated user has an identity managed by Supabase.

### User Identifier

The existing manager helper extracts the user identifier from authentication claims.

### Authentication Methods

The exact enabled sign-in methods must be confirmed from the project's Supabase configuration.

### Email and Password

If enabled, email-and-password authentication must follow the approved security configuration.

### Invitations

Manager account provisioning may use approved invitation procedures.

### Password Recovery

Recovery flows depend on Supabase Auth settings and application routes.

### Session State

Supabase maintains authentication state through the configured client integration.

### Configuration Boundary

Do not assume optional providers, multi-factor authentication, or other advanced settings are enabled without verification.

## Supabase Client Configuration

The application uses a server-side Supabase client for protected operations.

### Established Import

    @/lib/supabase/server

### Established Factory

    createSupabaseServerClient()

### Manager Helper Usage

The helper creates a Supabase server client before reading authentication claims.

### Server Context

The client must operate within the appropriate Next.js server context.

### Session Handling

The client configuration must correctly support the application's authentication session strategy.

### Environment Variables

Supabase connection configuration must use approved environment settings.

### Privileged Credentials

Service-role credentials must not be exposed to browser code.

### Client Separation

Browser-facing and server-only Supabase clients should follow their intended security boundaries.

### Source Verification

The complete Supabase client implementation should be inspected before documenting exact cookie or token handling.

## Manager Sign-In

**Status:** Authentication foundation implemented; detailed UI verification pending

Managers access the administrative authentication experience through the approved login route.

### Login Destination

    /admin/login

### Intended Flow

1. Manager opens the login page.
2. Manager enters approved credentials.
3. Supabase processes authentication.
4. Application establishes the session.
5. Manager accesses the protected dashboard.
6. Server-side authorization confirms the active manager role.

### Authentication Success

Successful authentication establishes identity.

### Authorization Requirement

A successfully authenticated user may still be denied manager access.

### Invalid Credentials

The interface should display an appropriate error without revealing sensitive account details.

### Unauthorized Staff Role

A valid user without an active manager role must not enter protected manager pages.

### Login Form Verification

Exact form fields, validation, and post-login navigation require source inspection.

### Security

Login failures must not expose credentials, session tokens, or private database details.

## Authentication Claims

The established manager helper reads authenticated user claims.

### Supabase Operation

    supabase.auth.getClaims()

### User Identifier

The helper reads:

    claimsData?.claims?.sub

### Authentication Failure

If claims cannot be validated or the user identifier is unavailable, access is denied.

### Redirect

The helper redirects unauthenticated users to:

    /admin/login

### Claims Purpose

Claims establish the authenticated user's identity.

### Authorization Limitation

Claims alone do not establish an approved active manager role.

### Role Lookup

The application performs a separate database query to verify staff authorization.

### Token Handling

Authentication tokens must be handled securely.

### Logging

Raw tokens and sensitive claim contents should not be unnecessarily logged.

## Manager Role Authorization

The existing application uses database-backed manager authorization.

### Established Table

    staff_roles

### Queried Fields

    user_id
    role
    is_active

### User Match

The helper filters staff records by the authenticated user identifier.

### Active Filter

The query requires:

    is_active = true

### Role Requirement

The returned role must equal:

    manager

### Authorized Result

The helper returns:

    supabase
    userId

### Unauthorized Result

The helper redirects to:

    /admin/login?error=unauthorized

### Missing Role

An authenticated user without an approved active staff role is denied access.

### Inactive Role

An inactive manager is denied access.

### Unexpected Role

A role other than manager is denied access.

### Database Error

A failed role lookup does not grant access.

### Security Principle

Authorization fails closed.

## Protected Administrative Routes

Administrative pages must enforce authorization before protected content is returned.

### Established Dashboard Route

    /admin

### Established Dashboard Source

    src/app/admin/page.tsx

### Established Menu Route

    /admin/menu

### Established Menu Source

    src/app/admin/menu/page.tsx

### Authorization Requirement

Protected routes should call the established manager helper or an equivalent approved server-side authorization function.

### Direct Navigation

Users must not bypass authorization by entering a protected URL directly.

### Nested Routes

Future administrative pages require the same protection.

### Server Actions

Mutations must independently enforce authorization.

### API Routes

Protected API endpoints must independently verify authorization.

### Client Navigation

Client-side navigation controls are not an authorization boundary.

### Future Documentation Viewer

The planned:

    /admin/docs

must be protected by the same manager authorization model.

## Session Management

Session management determines how authenticated users maintain access over time.

### Supabase Session

Supabase Auth provides session infrastructure.

### Server Verification

Protected pages should verify the current authentication state.

### Session Expiration

Expired or invalid sessions must not continue granting protected access.

### Session Refresh

The exact refresh behavior depends on the project's Supabase client configuration.

### Browser State

The browser may maintain authentication state through approved session mechanisms.

### Server State

Server-side authorization must not rely solely on stale browser state.

### Role Changes

An existing authenticated session must not override an inactive or unauthorized staff role.

### Session Revocation

Account deactivation and session revocation require appropriate operational procedures.

### Source Verification

Exact cookie configuration, refresh middleware, and session lifecycle behavior require inspection.

## Authentication State and Redirects

The manager helper establishes specific redirect behavior.

### Unauthenticated User

Destination:

    /admin/login

### Unauthorized User

Destination:

    /admin/login?error=unauthorized

### Authentication Error

An error reading claims results in denial of protected access.

### Missing Staff Role

A missing staff role results in denial of manager access.

### Inactive Staff Role

An inactive staff role results in denial of manager access.

### Valid Active Manager

The helper returns the authenticated context to the protected page.

### Redirect Safety

Redirect destinations should remain controlled by the application.

### User Experience

The login page should provide clear but appropriately limited error messaging.

### Source Verification

The exact UI behavior for redirect query parameters must be confirmed.

## Sign-Out

**Status:** Source verification pending

Managers must have a reliable way to end their authenticated session.

### Intended Behavior

1. Manager selects sign-out.
2. Application invokes the approved Supabase sign-out process.
3. Authentication state is cleared according to the configured client behavior.
4. Manager is returned to an appropriate public or login page.
5. Protected pages reject unauthenticated access.

### Security Requirement

Sign-out must not leave protected content accessible through unauthorized requests.

### Multiple Sessions

The business may need a policy for concurrent sessions.

### Shared Devices

Managers should sign out of shared administrative devices.

### Failure Handling

A failed sign-out operation should not be reported as successful.

### Source Verification

The current sign-out component and action must be inspected before documenting their exact implementation.

## Password Recovery

Password recovery is documented separately.

### Purpose

Allow an authorized user to regain account access without exposing credentials.

### Provider

Supabase Auth supports password recovery capabilities.

### Application Integration

The exact recovery routes and UI must be verified.

### Recovery Link

Recovery links should use approved application redirect destinations.

### Token Security

Recovery tokens must be protected and time-limited according to provider configuration.

### Password Requirements

New passwords must satisfy the approved authentication policy.

### User Feedback

The interface should avoid unnecessary account enumeration.

### Recovery Completion

The user should be able to authenticate with the updated credentials after successful recovery.

### Authorization Boundary

Password recovery does not automatically grant manager authorization.

### Related Document

See:

    password-recovery.md

## Manager Invitations

Manager provisioning is a separate administrative workflow.

### Purpose

Create or authorize staff accounts for approved managers.

### Identity Creation

The process may use Supabase Auth invitation functionality.

### Role Assignment

An invited user must receive the appropriate staff role through an authorized process.

### Active Status

Manager access requires an active staff role.

### Invitation Security

Invitations should be sent only to approved recipients.

### Expiration

Invitation expiration and recovery behavior require verification.

### Duplicate Invitations

The workflow should handle existing accounts safely.

### Deactivation

Staff who no longer require access should have their authorization revoked.

### Source Verification

The current invitation implementation must be inspected before identifying exact routes, tables, or operational controls.

### Related Document

See:

    manager-invitations.md

## Database Access Policies

Authentication and application authorization must be reinforced by database security.

### Supabase PostgreSQL

The project uses Supabase PostgreSQL.

### Row-Level Security

Applicable tables should enforce appropriate access policies.

### Staff Roles

The staff role table is part of the manager authorization model.

### Protected Data

Administrative data must not be exposed to unauthorized users.

### Browser Queries

Browser-accessible database operations must respect applicable policies.

### Server Operations

Server-side operations must enforce appropriate authorization.

### Service Credentials

Privileged credentials require strict server-side protection.

### Storage Policies

Administrative media uploads require appropriate storage access controls.

### Policy Verification

Actual database and storage policies must be inspected and tested.

### Important Boundary

Application redirects alone do not replace database security.

## Security Requirements

Authentication security requires multiple controls.

### Secure Credentials

Passwords and private credentials must not be committed to Git.

### HTTPS

Production authentication should use secure HTTPS connections.

### Session Protection

Authentication tokens and session cookies must be protected.

### Role Validation

Manager authorization must be checked on the server.

### Least Privilege

Users should receive only the access required for their duties.

### Account Deactivation

Inactive staff must not retain manager authorization.

### Brute-Force Protection

Provider and application protections should be reviewed.

### Multi-Factor Authentication

MFA may be evaluated for administrative accounts.

### Audit Logging

Significant security events may require monitoring.

### Error Messages

Errors should not expose sensitive implementation details.

### Dependency Security

Authentication libraries should be maintained appropriately.

### Incident Response

Suspected account compromise should follow an approved response procedure.

## Environment Configuration

Authentication depends on correct Supabase configuration.

### Local Development

The project uses environment configuration for local development.

### Local Environment File

    .env.local

### Deployment Environment

Production environment variables are configured through the approved Vercel project.

### Public Configuration

Only values intended for browser exposure should use public environment variable prefixes.

### Private Configuration

Privileged credentials must remain server-side.

### Git Security

Do not commit:

    .env.local

### Redirect URLs

Supabase authentication redirect destinations must match approved application domains.

### Production Domain

    https://finandfeatherslv.live

### Preview Environments

Preview deployments may require separately approved authentication redirect configuration.

### Secret Rotation

Credential rotation should follow approved procedures.

### Documentation

Do not place actual secret values in project documentation.

## Error Handling and Recovery

### Invalid Credentials

Display an appropriate authentication failure message.

### Missing Session

Redirect to the approved login route.

### Invalid Claims

Deny protected access.

### Missing Staff Role

Deny manager access.

### Inactive Staff Role

Deny manager access.

### Unexpected Role

Deny manager access.

### Database Lookup Failure

Do not grant access when role verification fails.

### Session Expiration

Require reauthentication when appropriate.

### Recovery Link Failure

Provide an approved recovery retry path.

### Invitation Failure

Allow authorized administrators to investigate without exposing private account details.

### Configuration Error

Review Supabase environment and redirect settings.

### Provider Outage

Provide an appropriate operational fallback and escalation procedure.

### Security Incident

Revoke affected access and investigate through approved procedures.

## Testing and Verification

### Authentication Tests

- Valid manager credentials.
- Invalid credentials.
- Missing session.
- Expired session.
- Invalid authentication claims.

### Authorization Tests

- Active manager.
- Inactive manager.
- User without staff role.
- User with non-manager role.
- Staff role lookup failure.

### Route Tests

- Direct access to `/admin`.
- Direct access to `/admin/menu`.
- Protected nested routes.
- Protected server actions.
- Protected API endpoints.

### Redirect Tests

- Unauthenticated redirect.
- Unauthorized redirect.
- Login success navigation.
- Expired session behavior.

### Session Tests

- Session persistence.
- Session expiration.
- Session refresh.
- Sign-out.
- Access after sign-out.

### Recovery Tests

- Valid recovery request.
- Expired recovery link.
- Invalid recovery link.
- Password update.
- Authorization after recovery.

### Invitation Tests

- Approved invitation.
- Invalid invitation.
- Expired invitation.
- Existing account.
- Role activation.
- Role deactivation.

### Database Tests

- Unauthorized staff role access.
- Protected administrative data.
- Row-level security.
- Storage access policies.

### Production Tests

- Correct environment configuration.
- Correct redirect URLs.
- HTTPS.
- No exposed secrets.
- Protected preview deployments.

## Operational Procedures

### Manager Sign-In

1. Open the approved administrative login page.
2. Enter authorized credentials.
3. Complete authentication.
4. Verify access to the protected dashboard.
5. Report unexpected authorization failures.

### Manager Sign-Out

1. Use the approved sign-out control.
2. Confirm the session ends.
3. Avoid leaving shared devices authenticated.

### Access Problems

1. Verify the intended account.
2. Confirm authentication succeeds.
3. Check whether the staff role is active.
4. Review the approved manager authorization process.
5. Escalate unresolved issues.

### Account Deactivation

1. Confirm the access removal request is authorized.
2. Deactivate the appropriate staff role.
3. Apply any required session or account revocation.
4. Verify protected access is denied.
5. Record the action appropriately.

### Password Recovery

Use the approved recovery workflow rather than sharing passwords.

### Security Escalation

Suspected unauthorized access should be escalated promptly.

## Future Enhancements

### Multi-Factor Authentication

Evaluate MFA for manager accounts.

### Granular Roles

Consider additional staff roles with narrower permissions.

### Session Monitoring

Improve visibility into active administrative sessions if required.

### Authentication Audit History

Record significant access events where appropriate.

### Centralized Account Administration

Provide approved controls for invitations, deactivation, and role changes.

### Improved Recovery Experience

Enhance password recovery and account support after source review.

### Automated Security Testing

Expand tests for authentication and authorization boundaries.

### Approval

Future enhancements require appropriate technical and business review.

## Implementation Status

| Capability | Status |
|---|---|
| Supabase Auth integration | Implemented |
| Server-side Supabase client | Implemented |
| Manager authorization helper | Implemented |
| Authentication claims verification | Implemented |
| Staff role lookup | Implemented |
| Active manager requirement | Implemented |
| Unauthenticated redirect | Implemented |
| Unauthorized redirect | Implemented |
| Protected Admin Dashboard | Implemented |
| Protected Menu Management | Implemented |
| Login page behavior | Source verification pending |
| Sign-out behavior | Source verification pending |
| Session refresh configuration | Source verification pending |
| Password recovery flow | Source verification pending |
| Manager invitation workflow | Source verification pending |
| Database RLS policy audit | Verification pending |
| Storage policy audit | Verification pending |
| Multi-factor authentication | Under Evaluation |
| Granular staff permissions | Planned expansion |
| Comprehensive authentication acceptance testing | Verification pending |

## Related Documentation

- [Authentication Overview](README.md)
- [Manager Invitations](manager-invitations.md)
- [Password Recovery](password-recovery.md)
- [Admin Dashboard Overview](../04-admin-dashboard/README.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Dashboard Overview](../04-admin-dashboard/dashboard-overview.md)
- [Database Overview](../06-database/README.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Deployment Overview](../07-deployment/README.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Master Documentation Index](../README.md)

---

[Back to Authentication Overview](README.md)
