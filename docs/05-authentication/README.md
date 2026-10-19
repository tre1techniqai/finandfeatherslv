# 05. Authentication

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Authentication Provider:** Supabase Auth

**Manager Authorization:** Implemented

---

## Table of Contents

1. [Authentication Overview](#authentication-overview)
2. [Manager Authentication](#manager-authentication)
3. [Manager Roles and Authorization](#manager-roles-and-authorization)
4. [Manager Invitations](#manager-invitations)
5. [Password Recovery](#password-recovery)
6. [Session Management](#session-management)
7. [Security Requirements](#security-requirements)
8. [Implementation Status](#implementation-status)
9. [Detailed Documentation](#detailed-documentation)
10. [Related Documentation](#related-documentation)

---

## Authentication Overview

The Fin & Feathers Las Vegas administration system
uses Supabase Auth to authenticate authorized staff.

Authentication establishes the user's identity.

Authorization determines whether the authenticated
user has permission to access manager-only features.

These are separate security requirements.

## Manager Authentication

The administrative login interface is located at:

/admin/login

The existing authentication implementation includes:

- Supabase Auth integration.
- Administrative login interface.
- Server-side authentication checks.
- Redirects for unauthenticated users.
- Manager role validation.

The login implementation and error handling
should be documented in greater detail after
reviewing the current application files.

## Manager Roles and Authorization

Manager access is controlled through the
staff_roles database table.

The existing authorization helper is located at:

src/lib/auth/require-manager.ts

The requireManager() function:

1. Creates a Supabase server client.
2. Retrieves the authenticated user's claims.
3. Identifies the authenticated user.
4. Queries the staff_roles table.
5. Requires an active staff role.
6. Verifies that the role is manager.
7. Redirects unauthorized users.

Only users with an active manager role should
be permitted to access protected administration
features.

The current implementation uses the following
role-related fields:

- user_id
- role
- is_active

Detailed database constraints and access policies
require separate verification.

## Manager Invitations

The project includes a planned workflow for
inviting restaurant owners or authorized staff
to access the Admin Dashboard.

The intended process includes:

- Creating or inviting a Supabase Auth user.
- Associating the user with a manager role.
- Ensuring the manager role is active.
- Allowing the invited user to establish credentials.
- Verifying successful manager access.

The invitation workflow must be reviewed before
being documented as production-ready.

Invitation links, authentication credentials,
and administrative secrets must never be
included in repository documentation.

## Password Recovery

The application contains routes for:

- /admin/forgot-password
- /admin/reset-password

These routes support the development of
administrative password recovery.

The complete recovery process must be verified
before being marked production-ready.

Verification should include:

- Recovery request submission.
- Email delivery.
- Recovery link handling.
- Password update.
- Expired or invalid recovery links.
- Successful login after recovery.

## Session Management

Manager sessions are handled through the
Supabase authentication integration.

Protected routes must validate authentication
and authorization on the server.

Important considerations include:

- Session expiration.
- Session refresh.
- Sign-out behavior.
- Revoked manager access.
- Inactive staff roles.
- Unauthorized route access.

The current session handling implementation
should be reviewed before documenting
specific expiration or refresh behavior.

## Security Requirements

Authentication and authorization must enforce:

- Server-side manager validation.
- Secure session handling.
- Appropriate Supabase access policies.
- Protection of authentication credentials.
- Safe handling of recovery links.
- Controlled manager invitations.
- Validation of administrative operations.
- Revocation of inactive manager access.

Sensitive credentials, access tokens,
service-role keys, and recovery links
must not be stored in documentation files.

Client-side navigation controls must not
be treated as authorization enforcement.

## Implementation Status

| Capability | Status |
|---|---|
| Supabase Auth integration | Implemented |
| Administrative login route | Implemented |
| Server-side manager authorization | Implemented |
| Active manager role verification | Implemented |
| Unauthorized access redirects | Implemented |
| Manager invitation workflow | Planned; verification pending |
| Forgot-password route | Implemented; workflow verification pending |
| Reset-password route | Implemented; workflow verification pending |
| Session expiration and refresh handling | Verification pending |
| Manager access revocation procedures | Documentation pending |

## Detailed Documentation

The following documents will provide
implementation-specific information:

- [Supabase Authentication](supabase-auth.md)
- [Manager Invitations](manager-invitations.md)
- [Password Recovery](password-recovery.md)

These documents will be created and verified
in subsequent documentation steps.

## Related Documentation

- [Project Overview](../01-project-overview/README.md)
- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Database & Storage](../06-database/README.md)
- [Deployment](../07-deployment/README.md)
- [Operations](../08-operations/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Master Documentation Index](../README.md)
