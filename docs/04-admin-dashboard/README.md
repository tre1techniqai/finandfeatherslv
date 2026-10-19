# 04. Admin Dashboard

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Access Requirement:** Authenticated user with an active manager role

---

## Table of Contents

1. [Dashboard Overview](#dashboard-overview)
2. [Manager Access and Permissions](#manager-access-and-permissions)
3. [Current Dashboard Features](#current-dashboard-features)
4. [Planned Management Features](#planned-management-features)
5. [Documentation Center](#documentation-center)
6. [Security Requirements](#security-requirements)
7. [Implementation Status](#implementation-status)
8. [Detailed Documentation](#detailed-documentation)
9. [Related Documentation](#related-documentation)

---

## Dashboard Overview

The Admin Dashboard provides a centralized management
interface for authorized Fin & Feathers Las Vegas staff.

The dashboard is designed to support restaurant
operations and website content administration.

The primary application route is:

/admin

The dashboard currently provides navigation to:

- Reservations.
- Menu Management.

Additional management sections will be introduced
as their functionality is developed and verified.

## Manager Access and Permissions

Administrative access is restricted to authenticated
users with an active manager role.

The existing authorization process uses:

- Supabase Auth.
- The staff_roles database table.
- Active role validation.
- Server-side authorization.

The requireManager() helper verifies the user's
authenticated identity and active manager role.

Unauthorized users are redirected to the
administrative login flow.

Detailed permission rules and database policies
will be documented separately.

## Current Dashboard Features

### Reservations

**Route:** /admin/reservations

The Reservations section supports ongoing
development of reservation management workflows.

Existing routes include:

- Reservation list.
- Individual reservation details.
- Workflow demonstrations.
- Reservation previews.

The production readiness of individual
reservation operations requires verification.

See [Reservations Documentation](../03-reservations/README.md).

### Menu Management

**Route:** /admin/menu

The Menu Management interface provides
administrative controls for restaurant menu items.

Implemented capabilities include:

- Creating menu items.
- Editing menu items.
- Managing item descriptions.
- Managing pricing and option notes.
- Assigning categories and subcategories.
- Managing tags.
- Uploading and updating menu images.
- Setting active or inactive status.
- Managing display order.
- Marking eligible items as $5 specials.

Menu images use Supabase Storage.

The current image workflow includes
4:3 WebP image processing.

See [Menu Management Documentation](../09-menu-management/README.md).

## Planned Management Features

### SPECIALS Management

Future functionality may allow managers to:

- Select existing menu items.
- Configure promotional pricing.
- Schedule recurring daily or weekly specials.
- Set promotional start and expiration dates.
- Manage active promotions.

See [SPECIALS](../02-website/specials/README.md).

### F&F FAM CLUB Management

Future functionality may support:

- Loyalty program content updates.
- Program announcements.
- Enrollment link management.
- Additional loyalty administration,
  subject to platform capabilities.

See [F&F FAM CLUB](../02-website/ff-fam-club/README.md).

### GALLERY Management

Future functionality may support:

- Gallery image uploads.
- Image replacement.
- Display ordering.
- Visibility controls.
- Image removal.

See [GALLERY](../02-website/gallery/README.md).

### MERCH Management

Future functionality may support:

- Product catalog administration.
- Product images and variants.
- Pricing and inventory.
- Order management.
- Merchandise reporting.

See [MERCH](../02-website/merch/README.md).

## Documentation Center

A manager-only documentation center is planned
for the Admin Dashboard.

**Planned Route:** /admin/docs

The documentation center will display Markdown
files maintained within the project's docs/
directory.

The intended capabilities include:

- Master documentation index.
- Category-level navigation.
- Detailed technical documentation.
- Relative links between documents.
- Internal heading navigation.
- Manager-only access enforcement.

Documentation source files must remain outside
the public/ directory.

The documentation viewer must enforce manager
authorization on the server before reading
or displaying protected content.

A Documentation navigation card will be added
to the Admin Dashboard when the viewer is ready.

## Security Requirements

Administrative functionality must enforce:

- Authentication.
- Active manager role validation.
- Server-side authorization.
- Appropriate Supabase database policies.
- Appropriate Supabase Storage policies.
- Validation of administrative inputs.
- Safe handling of uploaded files.
- Protection of sensitive customer information.

Client-side navigation visibility must not
be treated as an authorization mechanism.

## Implementation Status

| Capability | Status |
|---|---|
| Admin Dashboard route | Implemented |
| Supabase manager authentication | Implemented |
| Active manager role verification | Implemented |
| Reservations navigation | Implemented |
| Reservations management | In Development |
| Menu Management interface | Implemented |
| Menu image management | Implemented |
| Documentation Center | Planned |
| SPECIALS management | Planned |
| F&F FAM CLUB management | Planned |
| GALLERY management | Planned |
| MERCH management | Planned |

## Detailed Documentation

The following documents will provide
implementation-specific information:

- [Dashboard Overview](dashboard-overview.md)
- [Manager Permissions](manager-permissions.md)
- [Reservation Management](reservation-management.md)
- [Menu Management](menu-management.md)
- [SPECIALS Management](specials-management.md)
- [F&F FAM CLUB Management](fam-club-management.md)
- [GALLERY Management](gallery-management.md)
- [MERCH Management](merch-management.md)

These documents will be created and verified
in subsequent documentation steps.

## Related Documentation

- [Project Overview](../01-project-overview/README.md)
- [Website](../02-website/README.md)
- [Reservations](../03-reservations/README.md)
- [Authentication](../05-authentication/README.md)
- [Database & Storage](../06-database/README.md)
- [Menu Management](../09-menu-management/README.md)
- [Operations](../08-operations/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Master Documentation Index](../README.md)
