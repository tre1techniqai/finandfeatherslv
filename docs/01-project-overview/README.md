# 01. Project Overview

**Project:** Fin & Feathers Las Vegas Website & Management Platform

**Website:** https://finandfeatherslv.live

**Documentation Status:** In Development

---

## Table of Contents

1. [Project Summary](#project-summary)
2. [Project Objectives](#project-objectives)
3. [Technology Stack](#technology-stack)
4. [Development Phases](#development-phases)
5. [System Architecture](#system-architecture)
6. [Future Integrations](#future-integrations)
7. [Related Documentation](#related-documentation)

---

## Project Summary

Fin & Feathers Las Vegas is developing a mobile-first
restaurant website with an integrated management platform.

The platform is designed to support public-facing restaurant
services while providing authorized managers with tools
to administer restaurant content and operations.

The project is being developed incrementally, with
features tested and deployed in phases.

## Project Objectives

The primary objectives are:

- Establish a professional, mobile-first restaurant website.
- Present menus, imagery, and restaurant information.
- Provide a customer reservation request workflow.
- Build a secure, manager-only administration interface.
- Enable authorized staff to maintain website content.
- Support future restaurant commerce capabilities.
- Maintain detailed technical and operational documentation.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend Framework | Next.js 16 |
| UI Library | React 19 |
| Programming Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL |
| Media Storage | Supabase Storage |
| SMS Workflow | Twilio |
| Hosting & Deployment | Vercel |
| Version Control | Git / GitHub |
| Development Environment | VS Code / Ubuntu WSL |

For deployment procedures, see the
[Deployment Documentation](../07-deployment/README.md).

## Development Phases

### Phase 1 — Public Website Foundation

Initial website features include:

- Responsive homepage.
- Restaurant branding and animations.
- Public menu.
- Reservation request form.
- Image gallery.
- Loyalty program presentation.
- Merchandise presentation and external links.

### Phase 2 — Manager Administration

Management capabilities include:

- Manager authentication and authorization.
- Menu item management.
- Reservation management.
- Protected documentation access.
- Additional content management features.

Individual features may be implemented at different
times within this phase.

### Phase 3 — Expanded Content Management

Planned capabilities include:

- F&F FAM CLUB administration.
- Daily and weekly specials management.
- Gallery image management.
- Merchandise catalog administration.

### Phase 4 — Commerce Integrations

Potential future capabilities include:

- Toast POS integration.
- Menu synchronization.
- Online food ordering.
- Shopping cart and checkout.
- Direct merchandise purchases.
- Payment processing and fulfillment.

These integrations require feasibility evaluation,
owner approval, and cost analysis before implementation.

## System Architecture

The platform uses a Next.js application deployed
through Vercel.

Supabase provides authentication, database services,
and media storage.

Twilio supports the SMS reservation request workflow.

Manager-facing application routes use server-side
authorization to restrict access to active managers.

For additional information, see:

- [Authentication](../05-authentication/README.md)
- [Database & Storage](../06-database/README.md)
- [Reservations](../03-reservations/README.md)
- [Admin Dashboard](../04-admin-dashboard/README.md)

## Future Integrations

### Toast POS

Potential integration with the restaurant's Toast POS
for menu synchronization and direct online ordering.

See [Toast POS Integration](../10-toast-pos-integration/README.md).

### Merchandise Commerce

Potential direct merchandise sales through the
restaurant website.

See [Merchandise Commerce](../11-merch-commerce/README.md).

## Related Documentation

- [Website](../02-website/README.md)
- [Menu Management](../09-menu-management/README.md)
- [Operations](../08-operations/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Master Documentation Index](../README.md)
