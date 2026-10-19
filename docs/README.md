# Fin & Feathers Las Vegas
## Project & Manager Documentation

**Website:** https://finandfeatherslv.live

**Documentation Status:** In Development

**Intended Audience:** Authorized restaurant managers and project administrators

**Application Access:** Manager role required

---

## Table of Contents

1. [Project Overview](#01-project-overview)
2. [Website](#02-website)
3. [Reservations](#03-reservations)
4. [Admin Dashboard](#04-admin-dashboard)
5. [Authentication](#05-authentication)
6. [Database & Storage](#06-database--storage)
7. [Deployment](#07-deployment)
8. [Operations](#08-operations)
9. [Menu Management](#09-menu-management)
10. [Toast POS Integration](#10-toast-pos-integration)
11. [Merchandise Commerce](#11-merchandise-commerce)
12. [Documentation Standards](#documentation-standards)

---

## 01. Project Overview

Architecture, technology stack, development phases, and roadmap.

- [Project Overview](01-project-overview/README.md)

## 02. Website

Public-facing website features and functionality.

- [Website Overview](02-website/README.md)
- [F&F FAM CLUB](02-website/ff-fam-club/README.md)
- [SPECIALS](02-website/specials/README.md)
- [GALLERY](02-website/gallery/README.md)
- [MERCH](02-website/merch/README.md)

## 03. Reservations

Reservation requests, SMS workflow, Twilio integration,
and manager reservation operations.

- [Reservations Overview](03-reservations/README.md)

## 04. Admin Dashboard

Manager-facing administration tools, permissions,
and feature development.

- [Admin Dashboard Overview](04-admin-dashboard/README.md)

## 05. Authentication

Supabase authentication, manager roles, invitations,
and password recovery.

- [Authentication Overview](05-authentication/README.md)

## 06. Database & Storage

Supabase database structure, access policies,
and media storage.

- [Database Overview](06-database/README.md)

## 07. Deployment

GitHub, Vercel, Twilio deployments, verification,
and rollback procedures.

- [Deployment Overview](07-deployment/README.md)

## 08. Operations

Manager procedures, testing, troubleshooting,
and change history.

- [Operations Overview](08-operations/README.md)

## 09. Menu Management

Menu item creation, editing, pricing, modifiers,
images, visibility, specials, and publishing.

- [Menu Management Overview](09-menu-management/README.md)

## 10. Toast POS Integration

Future online ordering integration, including menu
synchronization, shopping cart, checkout, order
submission, and feasibility analysis.

- [Toast POS Integration Overview](10-toast-pos-integration/README.md)

**Status:** Planned / Feasibility Evaluation

## 11. Merchandise Commerce

Future direct merchandise sales, including product
catalog, inventory, checkout, payments, and fulfillment.

- [Merchandise Commerce Overview](11-merch-commerce/README.md)

**Status:** Planned / Feasibility Evaluation

---

## Documentation Standards

### Organization

Each documentation category should contain a README.md
that serves as its local table of contents.

### Navigation

Use relative Markdown links for navigation between
documents and internal heading anchors.

### Implementation Status

Clearly identify functionality as one of the following:

- **Verified:** Implemented and successfully tested.
- **Implemented:** Code exists but verification is incomplete.
- **In Development:** Actively being developed.
- **Planned:** Approved direction but not implemented.
- **Under Evaluation:** Requires technical or business review.
- **Pending Approval:** Awaiting an external or owner decision.

### Security

The documentation viewer is intended to be accessible
only to authenticated users with an active manager role.

Manager authorization must be enforced server-side.

Do not store credentials, API tokens, passwords,
customer personal information, or other secrets
in documentation files.

Repository access is governed separately from
application manager authorization.

### Maintenance

Update the relevant documentation when functionality
is implemented, changed, verified, or deprecated.

Keep the development roadmap and operational procedures
consistent with the deployed application.

---

[Return to Table of Contents](#table-of-contents)
