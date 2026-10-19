# DATABASE — Access Policies

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Manager authorization implemented; comprehensive database and Storage policy audit pending

**Feature:** Supabase Database Authorization and Row-Level Security

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Security Objectives](#security-objectives)
3. [Current Implementation](#current-implementation)
4. [Security Architecture](#security-architecture)
5. [Authentication Versus Authorization](#authentication-versus-authorization)
6. [Manager Authorization](#manager-authorization)
7. [Supabase Row-Level Security](#supabase-row-level-security)
8. [Database Roles and Privileges](#database-roles-and-privileges)
9. [Public Website Data Access](#public-website-data-access)
10. [Menu Management Policies](#menu-management-policies)
11. [Staff Role Policies](#staff-role-policies)
12. [Reservation Data Policies](#reservation-data-policies)
13. [SPECIALS Policies](#specials-policies)
14. [FAM CLUB Policies](#fam-club-policies)
15. [GALLERY Policies](#gallery-policies)
16. [MERCH Commerce Policies](#merch-commerce-policies)
17. [Toast POS Integration Policies](#toast-pos-integration-policies)
18. [Supabase Storage Policies](#supabase-storage-policies)
19. [Server Actions and API Routes](#server-actions-and-api-routes)
20. [Service Role and Privileged Credentials](#service-role-and-privileged-credentials)
21. [Policy Design Standards](#policy-design-standards)
22. [Policy Auditing](#policy-auditing)
23. [Testing and Verification](#testing-and-verification)
24. [Incident Response and Recovery](#incident-response-and-recovery)
25. [Implementation Roadmap](#implementation-roadmap)
26. [Implementation Status](#implementation-status)
27. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the intended database access security model for the Fin & Feathers Las Vegas website and administrative application.

The project uses Supabase PostgreSQL for application data and Supabase Storage for media assets.

The security model must protect private data while allowing approved public website functionality.

This document addresses:

- Authentication.
- Manager authorization.
- Database privileges.
- Row-Level Security.
- Public data access.
- Administrative mutations.
- Staff role protection.
- Reservation privacy.
- Future membership data.
- Future commerce data.
- Storage access.
- Server-side operations.
- Privileged credentials.
- Policy testing.
- Security incident handling.

This document is an architectural and operational reference.

It does not claim that every described policy is currently deployed.

## Security Objectives

Database access controls should support the principle of least privilege.

### Confidentiality

Private business and guest information must not be disclosed to unauthorized users.

### Integrity

Unauthorized users must not modify application data.

### Availability

Approved application operations should remain available to authorized users.

### Separation of Responsibilities

Authentication, application authorization, and database policies should reinforce one another.

### Public Access

Public website features should expose only approved information.

### Administrative Access

Manager-only operations must require valid authorization.

### Privileged Access

Highly privileged credentials and operations must remain restricted.

### Auditability

Security-sensitive changes should be reviewable where appropriate.

### Fail-Closed Behavior

Authorization failures must not grant access.

## Current Implementation

**Status:** Manager authorization foundation verified

### Database Platform

    Supabase PostgreSQL

### Authentication Provider

    Supabase Auth

### Authorization Helper

    src/lib/auth/require-manager.ts

### Established Helper

    requireManager()

### Staff Role Table

    staff_roles

### Referenced Staff Role Fields

    user_id
    role
    is_active

### Required Role

    manager

### Required Active State

    is_active = true

### Existing Administrative Routes

    /admin
    /admin/menu

### Established Storage Bucket

    website-media

### Verification Boundary

The complete database policy inventory, Storage policy definitions, table grants, and privileged database functions have not yet been audited.

### Important Distinction

A protected administrative page does not automatically establish that its underlying database tables have correctly configured RLS.

## Security Architecture

The application uses multiple security boundaries.

### Layer 1 — Authentication

Supabase Auth establishes the user's identity.

### Layer 2 — Application Authorization

The application verifies the user's approved staff role.

### Layer 3 — Database Authorization

Database privileges and RLS policies control permitted data operations.

### Layer 4 — Storage Authorization

Storage policies govern access to stored files and related metadata.

### Layer 5 — Integration Security

External API credentials and webhook endpoints require appropriate protections.

### Application Framework

    Next.js App Router

### Hosting

    Vercel

### Database

    Supabase PostgreSQL

### Storage

    Supabase Storage

### Security Principle

No single layer should be treated as a substitute for all other layers.

## Authentication Versus Authorization

Authentication and authorization are separate concerns.

### Authentication

Authentication establishes who the user is.

### Provider

    Supabase Auth

### Authorization

Authorization establishes what the user may access or change.

### Existing Application Model

The application verifies the authenticated identity and then queries the staff role.

### Authentication Claims

The manager helper uses:

    supabase.auth.getClaims()

### User Identifier

The helper reads:

    claimsData?.claims?.sub

### Staff Role Lookup

The helper queries the `staff_roles` table.

### Manager Requirement

The role must be `manager` and active.

### Database Policies

RLS must independently enforce appropriate data access rules.

### Security Boundary

A valid Supabase session does not automatically confer manager privileges.

## Manager Authorization

The established manager helper provides a server-side authorization boundary.

### Source

    src/lib/auth/require-manager.ts

### Client

    createSupabaseServerClient()

### Claims

The helper reads the current authenticated user's claims.

### Staff Role Query

The helper queries:

    staff_roles

### Selected Fields

    user_id
    role
    is_active

### User Filter

The query matches the authenticated user identifier.

### Active Filter

The query requires an active role.

### Role Verification

The returned role must equal:

    manager

### Authorized Result

The helper returns the Supabase client and authenticated user identifier.

### Unauthenticated Redirect

    /admin/login

### Unauthorized Redirect

    /admin/login?error=unauthorized

### Fail-Closed Behavior

Missing claims, failed role queries, inactive roles, and incorrect roles do not grant access.

### Important Limitation

This helper does not replace the need to verify database policies and server mutation authorization.

## Supabase Row-Level Security

PostgreSQL Row-Level Security can restrict access to individual table rows.

### RLS Purpose

RLS controls which rows may be read, inserted, updated, or deleted under a particular database role and policy context.

### SELECT

Policies may restrict which records can be read.

### INSERT

Policies may restrict which records can be created.

### UPDATE

Policies may restrict which existing records can be modified and which resulting records are allowed.

### DELETE

Policies may restrict which records can be removed.

### Authentication Context

Policies may use the authenticated user's identity where appropriate.

### Public Context

Public access must be explicitly designed and limited.

### Administrative Context

Manager operations require approved authorization rules.

### Table Coverage

Each exposed application table should receive a deliberate RLS review.

### Verification

Actual RLS enablement and policy definitions must be inspected directly.

### Critical Boundary

Do not assume RLS is enabled or correctly configured merely because Supabase is the database provider.

## Database Roles and Privileges

PostgreSQL access control includes database roles and privileges.

### Anonymous Access

Public website requests may operate without an authenticated user.

### Authenticated Access

Signed-in users may have a Supabase authenticated request context.

### Privileged Access

Administrative database credentials may have broader capabilities.

### Least Privilege

Grant only the operations required by each access context.

### Table Grants

Table privileges must be reviewed alongside RLS policies.

### Function Execution

Database functions require deliberate execution permissions.

### Schema Exposure

Only intended schemas and objects should be accessible through application APIs.

### Privilege Escalation

Functions and policies must not unintentionally permit unauthorized privilege changes.

### Verification Boundary

The deployed grants and database role configuration require direct inspection.

## Public Website Data Access

The public website needs access to approved public content.

### Public Menu

Guests should be able to view approved menu information.

### Public SPECIALS

When implemented, approved active specials may be displayed publicly.

### Public GALLERY

Approved gallery images should be accessible through the intended delivery mechanism.

### Public MERCH

The current merchandise presentation links to an external storefront.

### Private Data

Public access must not expose:

- Staff role records.
- Private reservation details.
- Administrative audit data.
- Membership information.
- Customer order records.
- Integration credentials.

### Public Read Policies

Public reads should be limited to approved records and fields.

### Public Writes

Anonymous write operations require explicit business justification and abuse protections.

### Data Minimization

Avoid exposing unnecessary internal metadata.

### Verification

Test actual public requests using the same access context as an unauthenticated visitor.

## Menu Management Policies

**Status:** Menu Management implemented; policy audit pending

The administrative menu editor performs menu-related operations.

### Administrative Route

    /admin/menu

### Manager Requirement

Administrative changes must require authorized manager access.

### Public Menu Reads

The public website needs approved menu content.

### Menu Writes

Create, update, and delete operations should be restricted.

### Pricing

Unauthorized users must not modify menu prices.

### Categories

Unauthorized users must not introduce or change menu classifications.

### Availability

Visibility and availability controls must be protected.

### Images

Menu image metadata and Storage operations require appropriate permissions.

### Specials

Special-related menu controls require manager authorization.

### Policy Verification

Inspect the actual menu tables, grants, and RLS definitions before identifying deployed policies.

### Important Boundary

The existing protected editor is not evidence that all menu tables have complete RLS coverage.

## Staff Role Policies

The `staff_roles` table is central to administrative authorization.

### Established Table

    staff_roles

### Referenced Fields

    user_id
    role
    is_active

### Security Importance

Unauthorized role changes could grant administrative access.

### Self-Escalation Risk

Users must not be able to assign themselves manager privileges.

### Activation Risk

Users must not be able to reactivate their own revoked manager access without approval.

### Read Access

Role lookup permissions must support the approved authorization flow.

### Write Access

Role creation, modification, and deactivation must be restricted to approved provisioning operations.

### Database Functions

Any privileged role-management function requires a separate security review.

### Identity Binding

Role records must reference the intended authenticated user.

### Audit

Manager role changes should be traceable.

### Verification

Inspect actual staff role policies and grants.

### Critical Principle

The staff authorization table requires stronger controls than ordinary public content.

## Reservation Data Policies

Reservation information may include guest personal data.

### Existing Reservation Workflow

The public website prepares an SMS reservation request.

### Guest Action

The guest sends the SMS message.

### Staff Confirmation

Staff confirms the reservation through the approved operational process.

### Database Boundary

A persistent reservation database schema has not been comprehensively verified.

### Potential Private Data

- Guest name.
- Contact number.
- Requested date.
- Requested time.
- Party size.
- Occasion.
- Consent information.
- Staff notes.

### Public Reads

Guest reservation records must not be publicly readable.

### Administrative Reads

Access should be limited to authorized personnel.

### Updates

Reservation status changes require approved authorization.

### External Providers

Twilio and Yelp Reservations have separate operational and security boundaries.

### Retention

Guest data retention requires an approved policy.

### Future Policies

Any new reservation table must receive an explicit RLS and privacy review before deployment.

## SPECIALS Policies

**Status:** Advanced administrative management planned

SPECIALS may promote existing menu items on particular days.

### Public Access

Guests may read approved, currently active specials.

### Administrative Access

Managers may create or modify specials through an approved interface.

### Scheduling

Start and end times must be protected from unauthorized changes.

### Pricing

Special prices require authorized modification.

### Publication

Only approved specials should become publicly visible.

### Menu Relationship

SPECIALS should reference valid approved menu items where appropriate.

### Database Boundary

A dedicated scheduling schema has not been established as deployed.

### Policy Requirement

Future tables must distinguish public reads from privileged writes.

### Verification

Test anonymous, authenticated non-manager, and manager access contexts.

## FAM CLUB Policies

**Status:** Administrative membership system planned

FAM CLUB may eventually store member information and program activity.

### Private Member Data

Membership records must not be publicly accessible.

### Member Access

Any future self-service member access requires identity-bound policies.

### Manager Access

Administrative member management must be restricted to approved staff.

### Reward Data

Reward eligibility and redemption records require integrity protections.

### Consent

Communication preferences and consent information require careful access controls.

### Cross-Member Isolation

One member must not access another member's private records.

### Data Export

Bulk export operations require additional authorization review.

### Database Boundary

The complete FAM CLUB membership schema is not established as deployed.

### Policy Requirement

Privacy-focused RLS policies must be designed before member data is stored.

## GALLERY Policies

**Status:** Public gallery implemented; administrative management planned

The website displays public gallery images.

### Current Public Experience

The gallery includes navigation and a full-image modal.

### Future Administration

Managers may eventually upload, reorder, hide, and replace images.

### Public Reads

Only approved published gallery content should be exposed.

### Administrative Writes

Gallery metadata changes must require manager authorization.

### Storage Uploads

Uploads must be restricted to approved users.

### Storage Deletes

Deletion requires deliberate authorization.

### Metadata Integrity

Database records and stored files must remain consistent.

### Database Boundary

A native gallery metadata table has not been established as deployed.

### Policy Verification

Future gallery management requires both database and Storage policy testing.

## MERCH Commerce Policies

**Status:** Native commerce under evaluation

The current website opens an external merchandise storefront.

### Existing Commerce Boundary

The external provider may remain responsible for catalog, checkout, orders, and payment.

### Native Commerce Possibility

A future native system may store product and order records.

### Public Product Access

Approved published product information may be public.

### Inventory Writes

Stock adjustments must be restricted.

### Pricing Writes

Product price changes must require authorization.

### Customer Orders

Order records must not be exposed to unrelated customers.

### Payment References

Payment identifiers and transaction metadata require restricted access.

### Sensitive Card Data

Raw payment card details must not be stored directly in the application database.

### Refunds

Refund operations require approved authorization and payment-provider controls.

### Architecture Boundary

Commerce platform selection must precede final policy design.

## Toast POS Integration Policies

**Status:** Under Evaluation

Toast POS integration may require access to restaurant operational data.

### Potential Data

- Menu items.
- Prices.
- Availability.
- External identifiers.
- Orders.
- Order status.

### Integration Credentials

API credentials must remain server-side.

### Provider Authorization

Actual Toast API access must be confirmed.

### Database Access

Integration services should receive only the access required for approved operations.

### Synchronization

Write permissions must reflect the chosen source-of-truth model.

### Order Integrity

External order updates require validation and duplicate protection.

### Auditability

Important synchronization failures and changes should be traceable.

### Architecture Boundary

No specific Toast integration database policy is established as deployed.

## Supabase Storage Policies

The project uses Supabase Storage.

### Established Bucket

    website-media

### Existing Uses

Website media and menu images are part of the project's Storage workflow.

### Public Media

Approved public assets may require public read access.

### Upload Permissions

Administrative uploads should be restricted to authorized personnel.

### Update Permissions

Replacing media requires approved authorization.

### Delete Permissions

File deletion must be carefully controlled.

### Path Organization

Storage paths should follow an approved organizational structure.

### Content Validation

Uploads should be validated for type, size, and intended usage.

### Database Consistency

Media references must remain consistent with stored files.

### Private Assets

Sensitive files must not be placed in publicly readable locations.

### Verification Boundary

The bucket's complete deployed policies and object-level access rules require inspection.

## Server Actions and API Routes

Administrative mutations may be implemented through server actions or API routes.

### Server Authorization

Each protected mutation must verify the caller's authorization.

### Page Protection

Protecting a page does not automatically protect every callable endpoint.

### Input Validation

Server operations must validate submitted values.

### Database Operations

Queries must use the intended authenticated or privileged context.

### Storage Operations

Uploads and deletions require authorization.

### External Requests

Webhook endpoints require their own authentication or signature verification strategy.

### Error Responses

Errors must not expose private database information.

### Logging

Operational logs should exclude secrets and unnecessary personal data.

### Testing

Attempt direct unauthorized invocation of protected operations.

### Important Principle

Security must be enforced where the operation executes.

## Service Role and Privileged Credentials

Privileged Supabase credentials require strict protection.

### Service Role

A service-role credential may bypass ordinary RLS enforcement.

### Browser Restriction

Never expose a service-role credential to client-side code.

### Environment Variables

Store privileged credentials in approved server-side environment configuration.

### Git Security

Never commit secrets to source control.

### Logging

Do not print credentials in application logs.

### Access Scope

Use privileged credentials only where necessary.

### Application Authorization

Privileged database access must not be exposed through an unauthenticated endpoint.

### Rotation

Credential rotation requires an approved operational procedure.

### Incident Response

Suspected credential exposure requires prompt investigation and rotation.

### Verification

Review the application bundle and deployment configuration for accidental exposure.

## Policy Design Standards

Database policies should follow consistent security principles.

### Least Privilege

Grant the minimum required access.

### Explicit Authorization

Use deliberate conditions rather than broad access rules.

### Fail Closed

Missing identity or authorization should not grant access.

### Separate Read and Write

Public read requirements should not imply public write permissions.

### Protect Role Management

Users must not elevate their own privileges.

### Avoid Circular Dependencies

Authorization policy design must account for role lookup behavior.

### Review Privileged Functions

Security-definer functions and privileged procedures require careful review.

### Validate Ownership

User-specific records must be bound to the correct authenticated identity.

### Restrict Bulk Operations

Bulk changes and exports may require stronger controls.

### Test Real Contexts

Policies must be tested under the actual anonymous and authenticated roles used by the application.

### Document Exceptions

Any privileged exception requires an explicit rationale and approval.

## Policy Auditing

A complete access policy audit should inspect deployed database configuration.

### Table Inventory

Identify all application tables.

### RLS Status

Confirm whether RLS is enabled for each relevant table.

### Policy Inventory

Record the actual policies and their operations.

### Table Grants

Inspect applicable database privileges.

### Function Grants

Review execution privileges for database functions.

### Staff Roles

Review role-management access paths.

### Storage

Inspect bucket and object access policies.

### Public Exposure

Identify tables and objects accessible without authentication.

### Privileged Operations

Review service-role usage and other privileged execution paths.

### Application Queries

Map each important query to its authorization context.

### Audit Output

Record findings, required corrections, and verification evidence.

### Important Boundary

This document does not claim that the live audit has already been completed.

## Testing and Verification

### Authentication Contexts

- Anonymous visitor.
- Authenticated non-manager.
- Active manager.
- Inactive manager.
- Missing staff role.
- Invalid session.

### Public Data

- Public menu read.
- Unauthorized menu write.
- Public gallery read.
- Private record read rejection.

### Staff Roles

- Approved manager lookup.
- Unauthorized role creation.
- Unauthorized role update.
- Unauthorized self-activation.
- Inactive manager denial.

### Menu Management

- Authorized create.
- Authorized update.
- Authorized delete where supported.
- Unauthorized mutation rejection.
- Image upload authorization.

### Storage

- Public asset read.
- Unauthorized upload.
- Unauthorized overwrite.
- Unauthorized delete.
- Invalid file rejection.

### Future Features

When implemented:

- Reservation privacy.
- SPECIALS writes.
- FAM CLUB member isolation.
- GALLERY administration.
- MERCH order privacy.
- Toast integration access.

### Direct Endpoint Tests

Attempt protected operations without using the normal administrative interface.

### Privileged Credential Tests

Verify private credentials are not exposed in browser bundles.

### Policy Regression

Repeat authorization tests after relevant schema or application changes.

## Incident Response and Recovery

### Unauthorized Data Exposure

Restrict affected access and investigate promptly.

### Incorrect Policy

Apply an approved correction and verify the result.

### Role Escalation

Review unauthorized staff role changes and revoke inappropriate access.

### Exposed Credential

Rotate the affected credential according to approved procedures.

### Suspicious Activity

Review available logs and relevant records.

### Data Modification

Determine whether unauthorized changes occurred.

### Restoration

Use approved database recovery procedures where necessary.

### Communication

Follow applicable business and legal notification requirements.

### Documentation

Record the incident, remediation, and verification outcome.

### Prevention

Update tests and operational controls to reduce recurrence.

## Implementation Roadmap

### Stage 1 — Inventory Database Objects

Identify deployed tables, views, functions, and Storage buckets.

### Stage 2 — Audit RLS

Inspect actual policies and enabled states.

### Stage 3 — Audit Grants

Review database privileges and function execution rights.

### Stage 4 — Review Application Access

Map queries, server actions, and API routes to their authorization contexts.

### Stage 5 — Review Privileged Credentials

Confirm server-only handling and least-privilege usage.

### Stage 6 — Correct Gaps

Implement approved policy changes through a controlled migration process.

### Stage 7 — Test Access Contexts

Verify anonymous, authenticated, manager, and unauthorized scenarios.

### Stage 8 — Document Findings

Record the deployed policies and supporting verification evidence.

### Stage 9 — Maintain Security

Repeat audits after significant database or authorization changes.

### Scheduling

This roadmap does not establish a committed delivery date.

## Implementation Status

| Capability | Status |
|---|---|
| Supabase Auth integration | Implemented |
| Server-side Supabase client | Implemented |
| Manager authorization helper | Implemented |
| Active manager role requirement | Implemented |
| Unauthorized manager redirect | Implemented |
| `staff_roles` source references | Verified |
| Menu Management authorization foundation | Implemented |
| Complete database table inventory | Verification pending |
| RLS enablement audit | Verification pending |
| Deployed RLS policy inventory | Verification pending |
| Database grants audit | Verification pending |
| Database function privilege audit | Verification pending |
| Staff role policy audit | Verification pending |
| Public menu policy audit | Verification pending |
| Reservation privacy policy audit | Verification pending |
| SPECIALS policies | Planned |
| FAM CLUB policies | Planned |
| GALLERY administration policies | Planned |
| Native MERCH commerce policies | Under Evaluation |
| Toast POS integration policies | Under Evaluation |
| Supabase Storage policy audit | Verification pending |
| Privileged credential exposure review | Verification pending |
| Direct endpoint authorization tests | Verification pending |
| Comprehensive security regression testing | Verification pending |

## Related Documentation

- [Database Overview](README.md)
- [Database Schema](schema.md)
- [Database Storage](storage.md)
- [Supabase Authentication](../05-authentication/supabase-auth.md)
- [Manager Invitations](../05-authentication/manager-invitations.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Dashboard Overview](../04-admin-dashboard/dashboard-overview.md)
- [Menu Management](../04-admin-dashboard/menu-management.md)
- [Reservation Workflow](../03-reservations/reservation-workflow.md)
- [SPECIALS Administration](../04-admin-dashboard/specials-management.md)
- [FAM CLUB Administration](../04-admin-dashboard/fam-club-management.md)
- [GALLERY Administration](../04-admin-dashboard/gallery-management.md)
- [MERCH Administration](../04-admin-dashboard/merch-management.md)
- [Toast POS Integration Overview](../10-toast-pos-integration/integration-overview.md)
- [Deployment Overview](../07-deployment/README.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Master Documentation Index](../README.md)

---

[Back to Database Overview](README.md)
