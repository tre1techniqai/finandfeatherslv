# 06. Database & Storage

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Database Platform:** Supabase PostgreSQL

**Authentication:** Supabase Auth

**Media Storage:** Supabase Storage

---

## Table of Contents

1. [Overview](#overview)
2. [Database Architecture](#database-architecture)
3. [Known Database Tables](#known-database-tables)
4. [Authentication and Staff Roles](#authentication-and-staff-roles)
5. [Menu Data](#menu-data)
6. [Reservation Data](#reservation-data)
7. [Row Level Security](#row-level-security)
8. [Supabase Storage](#supabase-storage)
9. [Future Database Requirements](#future-database-requirements)
10. [Security and Maintenance](#security-and-maintenance)
11. [Implementation Status](#implementation-status)
12. [Detailed Documentation](#detailed-documentation)
13. [Related Documentation](#related-documentation)

---

## Overview

Fin & Feathers Las Vegas uses Supabase to support
application authentication, database operations,
and media storage.

The database supports the public website and
manager-facing administrative functionality.

Database documentation must distinguish between:

- Tables confirmed through application code.
- Columns confirmed through application queries.
- Database constraints verified through schema inspection.
- Planned tables and relationships.

## Database Architecture

The application uses Supabase PostgreSQL as
its primary relational database.

The Next.js application communicates with
Supabase through server-side and client-side
integration patterns, as appropriate.

Manager-facing operations must enforce
authentication, authorization, and applicable
database access policies.

The complete database schema requires
verification against the current Supabase project.

## Known Database Tables

The following tables have been referenced
in the existing application implementation:

| Table | Purpose | Verification |
|---|---|---|
| staff_roles | Administrative role authorization | Referenced in application code |
| menu_items | Restaurant menu content | Referenced in application code |

Reservation-related data storage is also part
of the application's development work.

The exact reservation table names, relationships,
and columns must be confirmed through code
and database schema inspection.

This list is not intended to represent
the complete database schema.

## Authentication and Staff Roles

The staff_roles table is used to determine
whether an authenticated user has permission
to access manager-only functionality.

The existing authorization helper references:

- user_id
- role
- is_active

The requireManager() helper requires an
authenticated user with an active manager role.

The following database details require verification:

- Primary key.
- Unique constraints.
- Foreign key relationships.
- Allowed role values.
- Row Level Security policies.
- Administrative role assignment procedures.

See [Authentication](../05-authentication/README.md).

## Menu Data

The existing Menu Management interface
queries the menu_items table.

Known fields referenced by the application include:

- id
- item_name
- description
- price
- price_options_notes
- menu_type
- subcategory
- is_five_dollar_special
- tags
- image_url
- is_active
- display_order

The interface supports creation, editing,
visibility controls, ordering, and menu imagery.

Column data types, defaults, constraints,
indexes, and relationships must be verified
against the current database schema.

See [Menu Management](../09-menu-management/README.md).

## Reservation Data

The reservation workflow includes SMS
processing and reservation ingestion.

Database documentation should identify:

- Reservation table names.
- Reservation identifiers.
- Customer information fields.
- Requested date and time fields.
- Party size and occasion fields.
- Reservation status values.
- Twilio message references.
- Staff action history.
- Creation and update timestamps.

These details require verification against
the current reservation implementation.

Customer reservation information must be
handled according to applicable privacy
and access requirements.

See [Reservations](../03-reservations/README.md).

## Row Level Security

Supabase Row Level Security policies
are an important part of the application's
database authorization model.

Policy documentation should identify:

- Which tables have RLS enabled.
- Which roles can read records.
- Which roles can insert records.
- Which roles can update records.
- Which roles can delete records.
- How manager access is validated.
- How public menu access is restricted
  to appropriate records.

The existence and exact behavior of each
policy must be confirmed through database
inspection before being marked verified.

Application-level authorization should
not replace database-level protections.

## Supabase Storage

The project uses a Supabase Storage bucket named:

website-media

This bucket supports public website media.

The existing menu image management workflow
uses Supabase Storage for uploaded images.

The menu image processing workflow includes
4:3 WebP output.

Future media management features may include:

- Gallery image uploads.
- Merchandise product images.
- Promotional imagery.
- Additional restaurant media.

Storage documentation should identify:

- Bucket configuration.
- Folder organization.
- Public and private access rules.
- Upload permissions.
- Deletion permissions.
- File size limits.
- Accepted file types.
- Image processing requirements.

These details require verification against
the current storage configuration.

## Future Database Requirements

Potential future database capabilities include:

### SPECIALS

- Special-to-menu-item relationships.
- Promotional pricing.
- Recurring schedules.
- Activation and expiration dates.

### F&F FAM CLUB

- Program content configuration.
- Enrollment integration.
- Member-related data, if supported
  by the selected loyalty platform.

### GALLERY

- Gallery image metadata.
- Display ordering.
- Visibility status.
- Storage object references.

### MERCH

- Product catalog.
- Product variants.
- Inventory.
- Orders.
- Fulfillment information.

### Toast POS Integration

- External menu item identifiers.
- Menu synchronization metadata.
- Order references.
- Integration status and error tracking.

These are planning considerations only.

No future table or column should be treated
as implemented until it has been created
and verified.

## Security and Maintenance

Database and storage administration should
follow these principles:

- Enforce least-privilege access.
- Protect Supabase service-role credentials.
- Use appropriate RLS policies.
- Restrict manager write operations.
- Validate uploaded files.
- Avoid exposing customer information.
- Document schema changes.
- Maintain migration and rollback procedures.
- Verify backups and recovery capabilities.

Do not place database credentials,
connection secrets, or customer records
inside repository documentation.

## Implementation Status

| Capability | Status |
|---|---|
| Supabase PostgreSQL integration | Implemented |
| Supabase Auth integration | Implemented |
| staff_roles authorization query | Implemented |
| menu_items integration | Implemented |
| Reservation data integration | In Development; schema verification pending |
| Complete database schema documentation | Pending |
| RLS policy documentation | Pending verification |
| website-media storage bucket | Implemented |
| Menu image storage | Implemented |
| Gallery database management | Planned |
| Merchandise database management | Planned |
| SPECIALS scheduling data | Planned |
| Toast POS synchronization data | Under Evaluation |

## Detailed Documentation

The following documents will provide
implementation-specific information:

- [Database Schema](schema.md)
- [Access Policies](access-policies.md)
- [Storage](storage.md)

These documents will be created and verified
in subsequent documentation steps.

## Related Documentation

- [Project Overview](../01-project-overview/README.md)
- [Authentication](../05-authentication/README.md)
- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Reservations](../03-reservations/README.md)
- [Menu Management](../09-menu-management/README.md)
- [Deployment](../07-deployment/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Master Documentation Index](../README.md)
