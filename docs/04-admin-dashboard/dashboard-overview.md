# ADMIN DASHBOARD — Dashboard Overview

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Administrative foundation implemented; additional management modules planned

**Feature:** Manager Administration Dashboard

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Administrative Vision](#administrative-vision)
3. [Current Implementation](#current-implementation)
4. [Dashboard Architecture](#dashboard-architecture)
5. [Manager Authentication](#manager-authentication)
6. [Manager Authorization](#manager-authorization)
7. [Dashboard Navigation](#dashboard-navigation)
8. [Reservation Management](#reservation-management)
9. [Menu Management](#menu-management)
10. [SPECIALS Management](#specials-management)
11. [FAM CLUB Management](#fam-club-management)
12. [GALLERY Management](#gallery-management)
13. [MERCH Management](#merch-management)
14. [Documentation Viewer](#documentation-viewer)
15. [Dashboard User Experience](#dashboard-user-experience)
16. [Data Architecture](#data-architecture)
17. [Security and Privacy](#security-and-privacy)
18. [Operational Reliability](#operational-reliability)
19. [Testing and Verification](#testing-and-verification)
20. [Development Roadmap](#development-roadmap)
21. [Implementation Status](#implementation-status)
22. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the administrative dashboard for the Fin & Feathers Las Vegas website.

The dashboard provides a central entry point for authorized restaurant managers to access website and operational management tools.

It covers:

- Dashboard architecture.
- Authentication and authorization.
- Administrative navigation.
- Reservation management.
- Menu management.
- Future SPECIALS management.
- Future FAM CLUB management.
- Future GALLERY management.
- Future MERCH management.
- Planned documentation access.
- Security and operational requirements.

This document distinguishes existing application functionality from proposed future capabilities.

It does not imply that every management module is currently available.

## Administrative Vision

The long-term objective is to provide restaurant managers with a centralized, secure interface for maintaining website content and supporting restaurant operations.

### Centralized Management

Managers should eventually be able to access authorized management functions without editing application source code.

### Operational Independence

Routine business updates should not require a developer when an approved administrative tool exists.

### Controlled Permissions

Administrative actions must be restricted to users with appropriate permissions.

### Reliable Updates

Changes should be validated before they affect the public website.

### Clear Feedback

The interface should distinguish successful changes from pending, failed, or unverified operations.

### Maintainability

Management features should share consistent navigation, authorization, error handling, and interface patterns.

### Incremental Development

The dashboard will expand in phases.

Planned functionality must remain clearly labeled until implemented and verified.

## Current Implementation

**Status:** Administrative foundation implemented

The project includes an existing administrative dashboard.

### Established Route

    /admin

### Dashboard Source

    src/app/admin/page.tsx

### Existing Navigation

The dashboard provides entry points for:

- Reservations.
- Menu Management.

### Existing Menu Administration

The project includes a menu management route.

    /admin/menu

Established source:

    src/app/admin/menu/page.tsx

### Authentication

The dashboard uses Supabase Auth.

### Authorization

Manager access is protected through the established server-side helper.

    src/lib/auth/require-manager.ts

### Current Development Boundary

The existence of dashboard navigation does not establish that all reservation-management capabilities are complete.

Likewise, the existence of planned management categories does not establish that their corresponding routes or database schemas have been implemented.

### Verification

The exact current functionality of each administrative route should be verified against the application source before being marked fully operational.

## Dashboard Architecture

The administrative dashboard is part of the existing Next.js application.

### Framework

    Next.js App Router

### Language

    TypeScript

### Styling

    Tailwind CSS

### Authentication Provider

    Supabase Auth

### Application Database

    Supabase PostgreSQL

### Media Storage

    Supabase Storage

### Hosting

    Vercel

### Server Components

Protected administrative pages can use server-side rendering and authorization checks.

### Client Components

Interactive forms and management controls may use client components where required.

### Server Operations

Sensitive reads and mutations must enforce authorization on the server.

### Architectural Principle

A visible administrative interface is not a substitute for server-side access control.

## Manager Authentication

The dashboard relies on the established Supabase authentication system.

### Sign-In

Managers authenticate through the administrative login workflow.

### Session Validation

Protected routes must verify that the request belongs to an authenticated user.

### Authentication Helper

The application uses a Supabase server client to validate authentication information.

### Claims

The existing manager authorization helper obtains the authenticated user identifier from verified claims.

### Missing Authentication

Unauthenticated users are redirected to the administrative login route.

### Session Expiration

Expired or invalid sessions must not provide continued access to protected data.

### Password Recovery

Password recovery is documented separately in the authentication category.

### Security Boundary

Authentication confirms user identity.

It does not independently establish manager authorization.

## Manager Authorization

The existing authorization helper is:

    src/lib/auth/require-manager.ts

### Role Source

Manager permissions are checked against:

    staff_roles

### Established Requirements

The helper requires:

- A valid authenticated user.
- A matching staff role record.
- An active staff role.
- The `manager` role.

### Authorization Failure

Users without the required active manager role are redirected away from the protected dashboard.

### Server Enforcement

Administrative pages and mutations must enforce appropriate authorization.

### Client-Side Navigation

Hiding management links does not prevent unauthorized access to underlying routes or APIs.

### Permission Expansion

More granular staff permissions may be considered in future development.

### Current Role Model

The currently established helper authorizes the manager role.

Do not assume additional roles or permission tiers exist without source verification.

## Dashboard Navigation

The dashboard acts as a central navigation surface.

### Current Navigation

Established administrative categories include:

- Reservations.
- Menu Management.

### Planned Categories

Potential future categories include:

- SPECIALS.
- FAM CLUB.
- GALLERY.
- MERCH.
- Documentation.

### Navigation Objectives

Navigation should be:

- Clear.
- Consistent.
- Accessible.
- Mobile-friendly.
- Restricted by permission.
- Easy to extend.

### Category Cards

The dashboard may use cards to introduce management functions.

### Status Visibility

Features that are not yet available should not be presented as fully operational.

### Deep Links

Each implemented management category should have a stable route.

### Return Navigation

Managers should be able to return to the dashboard from individual management pages.

## Reservation Management

**Status:** Existing dashboard entry point; expanded capabilities require verification

The reservation workflow begins with guest SMS requests.

### Existing Reservation Infrastructure

The project includes:

- Public reservation form.
- SMS request preparation.
- Twilio integration.
- Reservation parser.
- Twilio Studio notification configuration.

### Staff Workflow

Staff review requests and confirm availability through the approved restaurant process, including Yelp Reservations.

### Dashboard Role

The administrative dashboard provides a Reservations entry point.

### Future Management Objectives

Potential capabilities include:

- Reservation request listing.
- Request details.
- Review status.
- Guest communication tracking.
- Alternative proposals.
- Search and filtering.
- Audit history.

### Integration Boundary

Do not assume incoming Twilio messages automatically create Supabase reservation records.

### Confirmation Boundary

A request must not be displayed as confirmed solely because the SMS was received.

### Detailed Documentation

See the dedicated reservation management documentation.

## Menu Management

**Status:** Existing administrative implementation

The application includes an administrative menu management route.

### Established Route

    /admin/menu

### Established Source

    src/app/admin/menu/page.tsx

### Existing Capabilities

The current menu administration implementation includes functionality for managing menu items.

Previously inspected capabilities include:

- Menu item editing.
- Menu item creation and updates.
- Active status.
- Display order.
- Menu item images.
- Special-related item settings.

### Image Handling

The established implementation includes menu image processing and storage integration.

### Approved Menu Structure

The menu must use categories and subcategories from the approved spreadsheet.

### Category Restriction

Do not introduce a HOOKAH category filter.

### Cocktail Images

The established content direction does not require images for COCKTAILS.

### Verification

Exact current fields, database operations, and publishing behavior must be verified against the latest source before changing the implementation.

### Detailed Documentation

See the dedicated Menu Management category.

## SPECIALS Management

**Status:** Planned expansion

The restaurant intends to promote selected menu items as daily or scheduled specials.

### Business Model

A special may feature an existing menu item on a particular day of the week.

### Example

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

### Proposed Management Functions

- Select eligible menu items.
- Configure special details.
- Assign applicable days.
- Define active dates.
- Set visibility.
- Preview scheduled specials.
- Publish or deactivate specials.

### Menu Relationship

SPECIALS should reference the approved menu catalog rather than silently creating unrelated menu categories.

### Scheduling

The system should handle restaurant-local dates and times.

### Status

The complete SPECIALS administration workflow is not established as implemented.

### Detailed Documentation

See the SPECIALS administration and scheduling documents.

## FAM CLUB Management

**Status:** Planned expansion

The FAM CLUB is a future management area for the restaurant's loyalty and member experience.

### Proposed Objectives

- Manage approved program settings.
- Review appropriate member information.
- Support membership operations.
- Manage program communications.
- Track authorized program activity.

### Privacy

Member data requires appropriate privacy and access controls.

### Permissions

Only authorized staff should access sensitive membership information.

### Program Rules

Earning, redemption, and benefit rules must be approved before implementation.

### Integration

Any external loyalty provider or payment relationship requires separate evaluation.

### Status

Do not assume a completed member management system exists.

### Detailed Documentation

See the FAM CLUB administration documentation.

## GALLERY Management

**Status:** Planned expansion

The public website includes an image gallery.

### Current Public Experience

The gallery supports image browsing and full-image presentation.

### Administrative Objective

Managers may eventually maintain approved gallery content without developer intervention.

### Proposed Functions

- Upload images.
- Review images.
- Edit metadata.
- Change display order.
- Activate or deactivate images.
- Remove obsolete content.

### Storage

The application uses Supabase Storage for website media.

### Media Processing

Image format, dimensions, and file size must follow approved requirements.

### Publishing

New images should not become publicly visible until the appropriate save or publish operation succeeds.

### Status

The complete gallery administration interface remains a planned capability.

## MERCH Management

**Status:** Planned expansion

The website currently provides an external merchandise storefront entry point.

### Existing Experience

A merchandise thumbnail opens the external storefront through a modal iframe.

### Future Management Objectives

Potential capabilities include:

- Product catalog management.
- Product images.
- Product variants.
- Pricing.
- Inventory.
- Product visibility.
- Order operations.

### Commerce Platform

The platform for future native merchandise commerce has not been finalized.

### Payment Boundary

The website must not handle raw payment card information outside an approved payment architecture.

### Inventory Authority

The selected commerce system must define the authoritative inventory source.

### Status

Do not describe a native merchandise checkout or complete administrative product catalog as implemented.

### Detailed Documentation

See the MERCH Commerce category.

## Documentation Viewer

**Status:** Planned

The project documentation is maintained as Markdown source files.

### Documentation Directory

    docs/

### Planned Administrative Route

    /admin/docs

### Objective

Provide authorized managers with a convenient way to read project and operational documentation.

### Source Files

The documentation viewer should read from the project-private documentation directory.

### Public Access Restriction

Documentation must not be moved into the public static asset directory merely to make it accessible.

### Authorization

The documentation route must enforce server-side manager authorization.

### Existing Pattern

Use the established manager authorization helper.

### Viewer Capabilities

Potential features include:

- Category navigation.
- Markdown rendering.
- Internal documentation links.
- Table of contents.
- Back navigation.
- Responsive reading layout.

### Markdown Security

The renderer must handle Markdown safely and avoid unsafe execution of untrusted content.

### Implementation Sequence

Complete and review the documentation source before building the viewer.

### Current Status

The documentation viewer has not yet been implemented.

## Dashboard User Experience

The administrative interface should remain consistent with the website's design system.

### Mobile-First Design

Managers may access the dashboard from mobile devices.

### Responsive Layout

Navigation and management forms should adapt to different screen sizes.

### Clear Hierarchy

Important actions should be easy to identify.

### Loading States

Long-running operations should display appropriate progress feedback.

### Save Confirmation

The interface should confirm success only after the underlying operation succeeds.

### Error States

Errors should be specific enough to guide recovery.

### Empty States

Empty tables or content areas should provide meaningful explanations.

### Accessibility

Controls should support:

- Keyboard navigation.
- Visible focus.
- Accessible labels.
- Clear validation.
- Appropriate contrast.

### Destructive Actions

Delete and irreversible operations should include suitable safeguards.

## Data Architecture

The dashboard uses the existing application data infrastructure.

### Supabase

Supabase provides authentication, database, and storage capabilities.

### Staff Roles

The established manager authorization model uses:

    staff_roles

### Menu Data

The menu management implementation interacts with application menu data.

### Future Data Models

Additional features may require new tables or relationships for:

- SPECIALS scheduling.
- FAM CLUB operations.
- GALLERY management.
- MERCH commerce.
- Reservation request tracking.

### Schema Approval

Future schemas must be reviewed before implementation.

### Database Policies

Appropriate row-level security and server-side authorization must protect administrative data.

### Storage

Media uploads should use approved storage locations and access policies.

### Data Consistency

Administrative updates must not leave related public website content in an inconsistent state.

## Security and Privacy

Administrative access presents elevated security responsibilities.

### Authentication

Require a valid authenticated session.

### Authorization

Require the appropriate active staff role.

### Server-Side Enforcement

Protect both page access and data mutations.

### Database Security

Use appropriate Supabase access policies.

### Secrets

Do not expose service credentials in browser code or documentation.

### Sensitive Data

Protect guest, member, and operational information.

### Input Validation

Validate administrative input on the server.

### File Uploads

Validate uploaded files and prevent unsafe content.

### Auditability

Important administrative changes may require audit records.

### Session Management

Expired or revoked sessions must not retain access.

### Least Privilege

Future roles should receive only the permissions required for their duties.

## Operational Reliability

Management tools should behave predictably during normal use and failures.

### Database Errors

Do not report an update as saved when a database operation fails.

### Network Interruptions

Provide clear retry or recovery instructions.

### Duplicate Submissions

Prevent accidental duplicate operations where appropriate.

### Concurrent Editing

Future tools should consider conflicting changes by multiple managers.

### External Services

Twilio, Yelp, commerce providers, and other external systems may experience outages.

### Monitoring

Important failures should be observable through appropriate operational logs.

### Recovery

Changes should have an appropriate rollback or correction procedure.

### Documentation

Operational procedures should be maintained alongside the application.

## Testing and Verification

### Authentication

- Verify successful manager login.
- Reject unauthenticated users.
- Reject unauthorized roles.
- Reject inactive staff roles.
- Verify session expiration behavior.

### Dashboard Navigation

- Verify current navigation links.
- Verify protected destinations.
- Verify mobile navigation.
- Verify keyboard navigation.
- Verify return-to-dashboard behavior.

### Reservations

- Verify existing entry point.
- Inspect the current reservation route.
- Verify any implemented request management.
- Verify staff workflow boundaries.

### Menu Management

- Verify authorized access.
- Verify menu item editing.
- Verify image operations.
- Verify active status.
- Verify display ordering.
- Verify approved category structure.

### Future Modules

When implemented:

- Verify SPECIALS scheduling.
- Verify FAM CLUB permissions.
- Verify GALLERY uploads.
- Verify MERCH catalog management.
- Verify documentation viewer authorization.

### Security

- Test direct route access.
- Test unauthorized mutations.
- Verify database policies.
- Verify file upload restrictions.
- Verify secret handling.

### Error Recovery

- Test database failures.
- Test network interruptions.
- Test invalid input.
- Test duplicate submissions.
- Test external service failures.

## Development Roadmap

The dashboard should expand through controlled development phases.

### Phase 1 — Existing Foundation

Established:

- Admin Dashboard.
- Manager authentication.
- Manager authorization.
- Reservations navigation.
- Menu Management navigation.
- Existing menu administration functionality.

### Phase 2 — Documentation Access

Planned:

- Complete Markdown documentation.
- Implement protected `/admin/docs`.
- Add dashboard documentation navigation.
- Verify manager-only access.

### Phase 3 — Operational Management Expansion

Potential priorities:

- Reservation workflow improvements.
- SPECIALS scheduling.
- GALLERY management.
- FAM CLUB administration.

### Phase 4 — Commerce Expansion

Potential capabilities:

- MERCH catalog management.
- Inventory integration.
- Cart and checkout administration.
- Order operations.

### Phase 5 — Additional Integrations

Potential integrations require separate feasibility and cost evaluation.

### Scheduling

These phases describe a proposed direction, not an approved release schedule.

## Implementation Status

| Capability | Status |
|---|---|
| Admin Dashboard route | Implemented |
| Manager authentication | Implemented |
| Manager authorization helper | Implemented |
| Active staff role verification | Implemented |
| Reservations dashboard entry point | Implemented |
| Menu Management dashboard entry point | Implemented |
| Menu administration route | Implemented |
| Menu item management foundation | Implemented |
| Reservation administration capabilities | Source verification pending |
| SPECIALS management module | Planned |
| FAM CLUB management module | Planned |
| GALLERY management module | Planned |
| MERCH management module | Planned |
| Markdown documentation source | In Development |
| Protected documentation viewer | Planned |
| Additional staff permission tiers | Under Evaluation |
| Administrative audit history | Under Evaluation |
| Cross-module management reporting | Under Evaluation |

## Related Documentation

- [Admin Dashboard Overview](README.md)
- [Manager Permissions](manager-permissions.md)
- [Reservation Management](reservation-management.md)
- [Menu Management](menu-management.md)
- [SPECIALS Management](specials-management.md)
- [FAM CLUB Management](fam-club-management.md)
- [GALLERY Management](gallery-management.md)
- [MERCH Management](merch-management.md)
- [Reservations Overview](../03-reservations/README.md)
- [Authentication Overview](../05-authentication/README.md)
- [Database Overview](../06-database/README.md)
- [Menu Management Overview](../09-menu-management/README.md)
- [MERCH Commerce Overview](../11-merch-commerce/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Admin Dashboard Overview](README.md)
