# Application Architecture

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Architecture:** Next.js App Router with Supabase and external service integrations

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Architecture Overview](#architecture-overview)
3. [System Components](#system-components)
4. [Public Website](#public-website)
5. [Administrative Interface](#administrative-interface)
6. [Authentication and Authorization](#authentication-and-authorization)
7. [Database and Storage](#database-and-storage)
8. [Reservation Architecture](#reservation-architecture)
9. [External Integrations](#external-integrations)
10. [Deployment Architecture](#deployment-architecture)
11. [Security Boundaries](#security-boundaries)
12. [Future Architecture](#future-architecture)
13. [Architecture Verification](#architecture-verification)
14. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the application architecture
of the Fin & Feathers Las Vegas website.

Its objectives are to:

- Identify major application components.
- Explain how components interact.
- Document important system boundaries.
- Distinguish existing and planned capabilities.
- Support future development and maintenance.
- Provide a reference for technical administrators.

Architecture details that have not been verified
against the current source code or service
configuration are identified accordingly.

## Architecture Overview

The application uses Next.js with the App Router.

The main system consists of:

1. A public restaurant website.
2. A manager-only administrative interface.
3. Supabase authentication.
4. Supabase PostgreSQL.
5. Supabase Storage.
6. Twilio reservation processing.
7. External restaurant services.
8. GitHub and Vercel deployment infrastructure.

### Conceptual Architecture

    Website Visitors
           |
           v
    Next.js Application
           |
           +----------------------+
           |                      |
           v                      v
    Public Website          Admin Dashboard
           |                      |
           |                      v
           |               Manager Authorization
           |                      |
           +-----------+----------+
                       |
                       v
                    Supabase
                 /     |      \
                /      |       \
             Auth   PostgreSQL  Storage

    Reservation SMS Workflow
              |
              v
            Twilio
              |
              v
       Reservation Processing
              |
              v
       Staff Review / Response

    External Services
       |
       +-- Toast Online Ordering
       +-- External Merchandise Storefront
       +-- Other Approved Website Links

This diagram is conceptual.

It does not establish the exact runtime
connection method for every integration.

## System Components

| Component | Technology | Status |
|---|---|---|
| Application framework | Next.js App Router | Implemented |
| Programming language | TypeScript | Implemented |
| Website styling | Tailwind CSS | Implemented |
| Authentication | Supabase Auth | Implemented |
| Application database | Supabase PostgreSQL | Implemented |
| Media storage | Supabase Storage | Implemented |
| Manager authorization | requireManager() | Implemented |
| Reservation SMS processing | Twilio | Implemented; live verification pending |
| Source control | GitHub | Implemented |
| Application hosting | Vercel | Implemented |
| Native Toast POS integration | Under evaluation | Not implemented |
| Native merchandise checkout | Under evaluation | Not implemented |

## Public Website

The public website provides restaurant
information and customer-facing functionality.

Major features include:

- Restaurant branding.
- Homepage animations.
- Restaurant menu.
- Reservation request interface.
- Online ordering link.
- Customer review link.
- Virtual tour.
- Food video presentation.
- Image gallery.
- Social media links.
- Merchandise promotion.
- Loyalty program presentation.
- Careers, contact, and events content.

The public website is designed with
a mobile-first approach.

### Public Website Components

The application organizes functionality
using reusable React components.

Examples from the established project include:

- Site header.
- Site footer.
- Menu modal.
- Reservation modal.
- Image gallery.
- Virtual tour modal.
- Merchandise modal.
- Loyalty program.
- Scroll reveal animations.

The exact current component filenames
and dependencies require source verification.

### Public Data Access

Public website features may retrieve
restaurant information from Supabase.

Public data access must expose only
information approved for customer viewing.

Database access policies and server-side
query behavior require separate verification.

## Administrative Interface

The administrative interface is located
under the /admin route hierarchy.

The Admin Dashboard currently provides
manager-facing functionality for:

- Reservation management.
- Menu management.

Additional management capabilities are planned.

### Administrative Routes

Known application routes include:

    /admin
    /admin/menu

The existing project also includes
administrative authentication routes.

The complete route inventory must be
verified against the current application.

### Menu Management

The menu editor uses Supabase to manage
restaurant menu information.

Its capabilities include:

- Creating menu items.
- Editing existing items.
- Managing descriptions and pricing.
- Assigning categories and subcategories.
- Managing item tags.
- Uploading menu images.
- Managing item visibility.
- Adjusting display order.

The primary table referenced by the
menu management implementation is:

    menu_items

### Planned Documentation Viewer

A future manager-only documentation center
is planned at:

    /admin/docs

The viewer will present Markdown files
maintained within the project.

Documentation source files reside under:

    docs/

The documentation directory must remain
outside the public asset directory.

The viewer must enforce manager
authorization before exposing content.

The viewer has not yet been implemented.

## Authentication and Authorization

The application uses Supabase Auth
for administrative authentication.

Manager authorization is enforced
through the existing helper:

    src/lib/auth/require-manager.ts

The helper performs the following checks:

1. Creates a server-side Supabase client.
2. Retrieves authenticated user claims.
3. Identifies the authenticated user.
4. Queries the staff_roles table.
5. Requires an active staff role.
6. Requires the role value manager.
7. Redirects unauthorized requests.

The authorization query references:

    staff_roles

Known fields include:

    user_id
    role
    is_active

The helper uses the authenticated user ID
to identify the corresponding staff role.

### Authorization Principle

Administrative pages must not rely
solely on client-side visibility controls.

Server-side authorization must protect
manager-only functionality.

Database and storage policies provide
additional protection where configured.

The exact RLS policies require verification.

## Database and Storage

Supabase provides the application's
relational database and media storage.

### PostgreSQL

Known application tables include:

    staff_roles
    menu_items

Additional reservation-related tables
and relationships require verification.

The complete schema will be documented
in the Database & Storage category.

### Supabase Storage

The established storage bucket is:

    website-media

The bucket supports website media,
including menu images.

The menu image workflow includes
4:3 WebP image processing.

Storage permissions, object paths,
and upload limits require verification.

## Reservation Architecture

The reservation experience is based
on a customer request workflow.

A submitted request is not automatically
a confirmed restaurant reservation.

### Customer Workflow

1. The guest opens the reservation form.
2. The guest enters reservation details.
3. The form validates required information.
4. The application prepares an SMS message.
5. The guest sends the SMS request.
6. Restaurant staff reviews the request.
7. Staff confirms availability or proposes
   an alternative arrangement.

### Reservation Form Data

The established reservation form includes:

- First name.
- Last name.
- Requested date.
- Requested time.
- Party size.
- Occasion.
- Required SMS consent.

The booking rules include:

- A minimum two-hour lead time.
- A maximum 90-calendar-day booking window.
- Thirty-minute time increments.
- Party sizes from 1 through 20.
- A two-hour seating policy.

These requirements should be checked
against the current reservation form
during detailed implementation verification.

### Twilio Processing

Twilio supports incoming reservation
message processing.

The project includes a reservation
parsing function at:

    twilio/functions/parse-reservation.js

The existing workflow also uses
Twilio Studio configuration.

The parser supports structured
reservation information.

The precise production workflow,
data persistence, and staff notification
behavior require verification.

### Compliance Status

Live SMS end-to-end verification remains
dependent on the required A2P approval.

Local testing and successful deployment
must not be treated as proof of
production SMS delivery.

## External Integrations

### Toast Online Ordering

The public website includes an
external online ordering action.

A future direct Toast POS integration
is under evaluation.

Potential future capabilities include:

- Menu synchronization.
- Modifier synchronization.
- Shopping cart.
- Order submission.
- Payment processing.

No direct Toast API integration
is assumed to be operational.

### Merchandise Storefront

The website includes a merchandise
promotional experience connected
to an external storefront.

A future native commerce system
is under evaluation.

Potential capabilities include:

- Product catalogs.
- Product variants.
- Inventory management.
- Shopping cart.
- Secure checkout.
- Order management.
- Shipping and fulfillment.

### Other Website Integrations

The website also provides links
or embedded experiences for:

- Restaurant reviews.
- Social media.
- Virtual tour content.
- Loyalty program information.
- External ordering and merchandise.

Current service URLs and embedding
behavior require source verification.

## Deployment Architecture

The application source is maintained
in GitHub.

The established repository is:

    tre1techniqai/finandfeatherslv

Vercel hosts the Next.js application.

The production domain is:

    https://finandfeatherslv.live

### Deployment Responsibilities

GitHub manages source code history.

Vercel manages application builds
and deployments.

Supabase manages authentication,
database services, and storage.

Twilio manages the deployed
SMS processing components.

These services have separate
configuration and operational boundaries.

### Environment Configuration

Application configuration uses
environment variables.

Sensitive values must remain outside
committed source code and documentation.

The local .env.local file must not
be committed to Git.

The current production environment
configuration requires verification.

## Security Boundaries

The architecture must protect
several distinct trust boundaries.

### Public and Administrative Access

Public website users must not gain
unauthorized access to manager functions.

### Server and Client Code

Server-only credentials must never
be exposed to browser-delivered code.

### Database Access

Database permissions must restrict
unauthorized reads and writes.

### Storage Access

Media upload and deletion permissions
must be limited appropriately.

### External Integrations

Twilio, Toast, and commerce credentials
must be protected.

### Customer Information

Reservation and future commerce data
must be handled according to applicable
privacy and security requirements.

### Documentation Access

Future administrative documentation
must be protected through server-side
manager authorization.

Documentation files must not contain
secrets or sensitive customer records.

## Future Architecture

The proposed development roadmap includes
additional administrative capabilities.

### SPECIALS

A scheduling system for promotions
based on existing menu items.

### F&F FAM CLUB

Expanded loyalty program presentation
and manager-facing controls.

### GALLERY

Administrative image management,
ordering, and visibility controls.

### MERCH

Potential native merchandise
catalog and commerce capabilities.

### Toast POS

Potential menu synchronization
and native online ordering integration.

### Documentation Center

A manager-only Markdown documentation
viewer at /admin/docs.

These capabilities remain planned
or under evaluation unless separately
verified as implemented.

## Architecture Verification

The following items require detailed
source or service inspection:

- Complete Next.js route inventory.
- Current component inventory.
- Server and client component boundaries.
- Supabase client initialization patterns.
- Complete PostgreSQL schema.
- Row Level Security policies.
- Storage bucket access policies.
- Reservation persistence and status handling.
- Active Twilio Studio configuration.
- Production environment variable names.
- Vercel deployment configuration.
- External integration URLs.
- Error handling and logging architecture.

Verification results should be incorporated
into the detailed documentation.

Unverified assumptions must not
be presented as implemented features.

## Related Documentation

- [Project Overview](README.md)
- [Technology Stack](technology-stack.md)
- [Development Roadmap](development-roadmap.md)
- [Website](../02-website/README.md)
- [Reservations](../03-reservations/README.md)
- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Authentication](../05-authentication/README.md)
- [Database & Storage](../06-database/README.md)
- [Deployment](../07-deployment/README.md)
- [Toast POS Integration](../10-toast-pos-integration/README.md)
- [Merchandise Commerce](../11-merch-commerce/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Project Overview](README.md)
