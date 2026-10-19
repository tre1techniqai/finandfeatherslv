# DATABASE — Schema Architecture

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Supabase PostgreSQL integrated; selected table and field references verified through application code; complete deployed schema audit pending

**Feature:** Database Structure, Relationships, Integrity, and Evolution

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Database Objectives](#database-objectives)
3. [Current Implementation](#current-implementation)
4. [Database Architecture](#database-architecture)
5. [Schema Verification Standards](#schema-verification-standards)
6. [Authentication and Staff Roles](#authentication-and-staff-roles)
7. [Menu Data](#menu-data)
8. [Menu Categories and Subcategories](#menu-categories-and-subcategories)
9. [Menu Pricing and Modifiers](#menu-pricing-and-modifiers)
10. [Menu Images and Media References](#menu-images-and-media-references)
11. [Reservation Data](#reservation-data)
12. [Reservation SMS Processing](#reservation-sms-processing)
13. [SPECIALS Data Model](#specials-data-model)
14. [FAM CLUB Data Model](#fam-club-data-model)
15. [GALLERY Data Model](#gallery-data-model)
16. [MERCH Commerce Data Model](#merch-commerce-data-model)
17. [Toast POS Integration Data](#toast-pos-integration-data)
18. [Relationships and Referential Integrity](#relationships-and-referential-integrity)
19. [Constraints and Validation](#constraints-and-validation)
20. [Row-Level Security](#row-level-security)
21. [Database Migrations](#database-migrations)
22. [Backup and Recovery](#backup-and-recovery)
23. [Performance and Indexing](#performance-and-indexing)
24. [Testing and Verification](#testing-and-verification)
25. [Implementation Roadmap](#implementation-roadmap)
26. [Implementation Status](#implementation-status)
27. [Related Documentation](#related-documentation)

---

## Purpose

This document provides a structured reference for the Fin & Feathers Las Vegas database architecture.

The application uses Supabase PostgreSQL for persistent application data.

The database supports existing administrative functionality and may eventually support additional operational features.

This document addresses:

- Authentication-related database references.
- Staff role authorization.
- Menu data.
- Categories and subcategories.
- Pricing and modifiers.
- Media references.
- Reservations.
- SMS processing.
- SPECIALS.
- FAM CLUB.
- GALLERY.
- MERCH commerce.
- Toast POS integration.
- Relationships.
- Constraints.
- Security.
- Migrations.
- Recovery.
- Performance.

The document is not a substitute for a verified database schema export.

## Database Objectives

The database architecture should support reliable restaurant operations.

### Data Integrity

Application records must remain internally consistent.

### Secure Access

Users should access only the data permitted by their authorization.

### Operational Reliability

Database operations should handle failures without corrupting records.

### Maintainability

Schema changes should be documented and reproducible.

### Feature Separation

Unrelated application features should not depend on accidental shared data structures.

### Scalability

The schema should accommodate approved future features without unnecessary complexity.

### Traceability

Important administrative changes may require audit history.

### Recovery

Critical data should have an approved backup and recovery strategy.

## Current Implementation

**Status:** Supabase integration implemented; complete schema audit pending

### Database Provider

    Supabase PostgreSQL

### Authentication Provider

    Supabase Auth

### Existing Administrative Capabilities

The application includes:

- Protected Admin Dashboard.
- Manager authorization.
- Menu Management.

### Verified Staff Role Reference

    staff_roles

### Verified Staff Role Fields

    user_id
    role
    is_active

These fields are referenced by the established manager authorization helper.

### Existing Menu Management

The administrative menu interface performs menu-related operations through Supabase.

### Menu Schema Boundary

Exact menu table names, field definitions, constraints, and relationships require a dedicated source and database inspection before being classified as verified.

### Storage

The project uses Supabase Storage for website media.

### Schema Audit Boundary

The current live database has not been comprehensively inventoried within this documentation workflow.

## Database Architecture

### Application Framework

    Next.js App Router

### Database Engine

    PostgreSQL

### Database Platform

    Supabase

### Authentication

    Supabase Auth

### Server Access

    Supabase server client

### Browser Access

Any browser-side database operations must comply with applicable Row-Level Security policies.

### Administrative Operations

Protected mutations must enforce server-side authorization.

### Storage

Supabase Storage manages media files separately from ordinary relational records.

### Deployment

The application is hosted on Vercel.

### Architectural Principle

Database schema, application authorization, and storage access policies must work together.

## Schema Verification Standards

Documentation must distinguish observed implementation from proposed architecture.

### Verified

A table or field is confirmed through an authoritative schema inspection or other sufficient direct evidence.

### Referenced in Source

Application code refers to a table or field, but its full database definition has not been inspected.

### Implemented — Verification Pending

A feature exists, but the complete deployed schema and behavior have not been audited.

### Planned

The feature or data structure has not been implemented.

### Under Evaluation

The business or technical team has not selected a final architecture.

### Pending Approval

A proposed design requires authorization before implementation.

### Source Review

Inspect:

- Application queries.
- Database migrations.
- SQL definitions.
- Supabase schema.
- Relevant access policies.

### Documentation Rule

Do not invent table names, column types, foreign keys, or constraints.

### Evidence Priority

Direct schema evidence should take precedence over inferred structures.

## Authentication and Staff Roles

**Status:** Selected fields referenced in verified application code

The application uses Supabase Auth to establish authenticated identity.

### Established Authorization Table

    staff_roles

### Referenced Fields

    user_id
    role
    is_active

### User Identifier

The authorization helper obtains the authenticated user identifier from Supabase claims.

### Role Lookup

The application searches for a matching staff role.

### Required Role

    manager

### Active Requirement

    is_active = true

### Unauthorized Access

A missing, inactive, or incorrect role does not grant manager access.

### Schema Verification Pending

The following require inspection:

- Primary key.
- Exact column types.
- Unique constraints.
- Foreign keys.
- Default values.
- Indexes.
- Row-Level Security policies.

### Important Boundary

The application query establishes referenced field names, not the complete table definition.

## Menu Data

**Status:** Menu Management implemented; complete schema verification pending

The administrative application includes menu management functionality.

### Existing Administrative Route

    /admin/menu

### Existing Source

    src/app/admin/menu/page.tsx

### Supported Operations

Previously reviewed functionality includes menu item administration and image upload.

### Conceptual Menu Item Attributes

A menu item may require:

- Stable identifier.
- Name.
- Description.
- Category.
- Subcategory.
- Base price.
- Availability.
- Display order.
- Image reference.
- Special eligibility or settings.

### Schema Boundary

These are conceptual data requirements.

They are not a verified list of deployed database columns.

### Menu Data Source

The approved menu spreadsheet is the reference for categories, subcategories, and menu content.

### Public Integration

Menu records must be presented consistently on the public website.

### Administrative Integrity

Menu edits must preserve approved pricing and category relationships.

## Menu Categories and Subcategories

The menu system must follow the approved menu structure.

### Category Authority

Use only categories and subcategories from the approved spreadsheet.

### Unsupported Categories

Do not introduce unapproved categories.

### Specific Restriction

There is no HOOKAH category filter.

### Category Relationships

Each item should be associated with its approved category and subcategory where applicable.

### Ordering

Category and item order should follow the approved presentation requirements.

### Normalization Decision

The implementation may store categories as relational records or controlled values.

### Schema Boundary

The actual representation must be confirmed from the current schema.

### Future Changes

New categories or subcategories require business approval.

### Validation

Administrative edits must not introduce unsupported menu classifications.

## Menu Pricing and Modifiers

Menu pricing may include base prices and approved modifications.

### Base Price

A menu item may have an established selling price.

### Market Pricing

Some items may use market-based pricing.

### Modifier Examples

Approved menu content includes certain protein additions and sauce upgrades.

### Pricing Integrity

Modifier charges must remain consistent with the approved menu.

### SPECIALS

The existing menu editor includes a special-related control with previously reviewed pricing behavior.

### Future Scheduling

Day-specific SPECIALS scheduling is a separate planned capability.

### Schema Considerations

A future model may require:

- Base price.
- Market-price indicator.
- Modifier groups.
- Modifier options.
- Additional charges.
- Special price.
- Effective dates.

### Schema Boundary

These are requirements for evaluation, not confirmed existing columns.

### Calculation

Prices should be calculated through approved application logic.

### Validation

Negative or invalid prices should be rejected unless explicitly supported by approved business rules.

## Menu Images and Media References

The project uses Supabase Storage for website media.

### Established Bucket

    website-media

### Existing Menu Image Workflow

The administrative menu editor includes an image upload process.

### Existing Processing Pattern

Previously reviewed menu image handling includes 4:3 WebP output.

### Storage Metadata

Database records may reference stored image paths or URLs.

### Schema Verification

The exact image reference columns must be inspected.

### Image Consistency

A menu item should not reference an unintentionally deleted image.

### Image Replacement

Replacement operations should avoid broken references.

### Storage Cleanup

Unused files require an approved cleanup strategy.

### Cocktail Images

No images are required for COCKTAILS.

### Security

Storage uploads and related database updates require appropriate authorization.

## Reservation Data

**Status:** Reservation request workflow implemented; persistent reservation schema verification pending

The public website includes a reservation request form.

### Reservation Process

The guest prepares a text message containing the reservation request.

### Guest Action

The guest must send the message.

### Confirmation

Restaurant staff confirms through the established operational process.

### Reservation Provider

Yelp Reservations is part of the staff confirmation workflow.

### Form Information

The public request includes:

- Guest first name.
- Guest last name.
- Requested date.
- Requested time.
- Party size.
- Occasion.
- SMS consent.

### Business Rules

- Thirty-minute time increments.
- Party size from 1 to 20.
- Booking window from 10:00 AM to 10:00 PM.
- Minimum two-hour lead time.
- Maximum 90-calendar-day booking horizon.
- Maximum two-hour seating duration.

### Database Boundary

The existence of a reservation form does not establish that all reservation requests are persisted in Supabase.

### Future Persistence

Any proposed reservation records require an approved schema and privacy review.

## Reservation SMS Processing

The project includes a Twilio-based incoming SMS workflow.

### Provider

    Twilio

### Parsing Endpoint

    /parse-reservation

### Processing Objective

Interpret incoming reservation request messages.

### Current Verification

Local parser testing has been performed.

### Production Verification

Complete live end-to-end behavior requires verification.

### Potential Data Requirements

A future persistent workflow may need:

- Message reference.
- Processing timestamp.
- Parsed reservation details.
- Processing outcome.
- Review status.
- Error category.

### Sensitive Information

Incoming messages may contain guest contact information.

### Retention

Message and reservation data retention requires an approved policy.

### Idempotency

Repeated webhook delivery must not create unintended duplicate reservations.

### Schema Boundary

No specific SMS processing database table is established by this document.

## SPECIALS Data Model

**Status:** Advanced scheduling and management planned

SPECIALS may promote existing menu items on particular days.

### Business Example

A Tuesday special may feature an approved taco platter.

### Existing Menu Relationship

SPECIALS should reference approved menu items where appropriate.

### Potential Attributes

- Special identifier.
- Related menu item.
- Display title.
- Description.
- Promotional price.
- Day of week.
- Start time.
- End time.
- Active status.
- Display order.

### Scheduling

Recurring weekly schedules may be required.

### Publication

Only currently eligible and approved specials should appear publicly.

### Timezone

Scheduling must use an approved restaurant-local timezone strategy.

### Conflict Handling

Overlapping or conflicting specials require defined rules.

### Schema Boundary

These are conceptual requirements, not verified deployed columns.

### Related Documentation

See the SPECIALS scheduling and administrative management documents.

## FAM CLUB Data Model

**Status:** Administrative membership system planned

The website includes a public-facing loyalty program component.

### Future Administrative Scope

The FAM CLUB system may manage:

- Membership.
- Member profiles.
- Rewards.
- Activity.
- Benefits.
- Communications.

### Potential Membership Attributes

- Member identifier.
- Enrollment timestamp.
- Membership status.
- Contact preferences.
- Program participation.

### Rewards

Reward definitions and redemption records may require separate structures.

### Member Activity

Activity history may require controlled event records.

### Communications

Communication preferences and consent require careful handling.

### Privacy

Member information must be protected.

### Data Minimization

Collect only the information required for approved operations.

### Schema Boundary

No native FAM CLUB membership table is established as deployed by this document.

## GALLERY Data Model

**Status:** Public gallery implemented; manager-driven metadata planned

The public website includes an image gallery.

### Existing Presentation

- Image slider.
- Previous and next navigation.
- Position indicators.
- Full-image modal.

### Existing Asset Names

    gallery-pic-01.jpg
    gallery-pic-02.jpg
    gallery-pic-03.jpg
    gallery-pic-04.jpg
    gallery-pic-05.jpg
    gallery-pic-06.jpg

### Future Metadata

A manager-driven gallery may require:

- Image identifier.
- Storage reference.
- Title.
- Alternative text.
- Display order.
- Visibility.
- Upload timestamp.

### Storage

Gallery images may use an approved location within Supabase Storage.

### Public Integration

Published gallery records should determine public image presentation.

### Schema Boundary

The current public gallery may use static assets.

A gallery metadata table has not been established as deployed.

## MERCH Commerce Data Model

**Status:** Native commerce under evaluation

The current website links visitors to an external merchandise storefront.

### Existing Presentation

A merchandise promotional image opens an external store in a modal iframe.

### Native Commerce

A native merchandise commerce system has not been established as implemented.

### Potential Product Data

- Products.
- Variants.
- Prices.
- Images.
- Inventory.

### Potential Transaction Data

- Carts.
- Orders.
- Order items.
- Payment references.
- Fulfillment.
- Refund references.

### External Platform Option

The external commerce provider may remain the authoritative source of merchandise data.

### Hybrid Option

Selected product information may eventually be synchronized.

### Security

Payment card data must not be stored directly in the application database.

### Architecture Decision

The business must select the commerce platform before approving a native schema.

## Toast POS Integration Data

**Status:** Under Evaluation

Toast POS integration may eventually support menu synchronization or online ordering.

### Potential Integration Areas

- Menu data.
- Product identifiers.
- Availability.
- Pricing.
- Cart handoff.
- Order submission.
- Payment coordination.

### Source of Truth

The integration must define which system owns each type of data.

### External Identifiers

A future integration may require mapping internal records to Toast identifiers.

### Synchronization

The design must address changes, conflicts, retries, and stale data.

### Order Integrity

External order references must be handled consistently.

### Security

API credentials must remain server-side.

### Feasibility

Actual Toast API access and capabilities require verification.

### Schema Boundary

No Toast integration mapping table is established as deployed by this document.

## Relationships and Referential Integrity

Relational integrity prevents inconsistent application data.

### Authentication Relationships

Staff role records must correspond to the intended authenticated identity.

### Menu Relationships

Menu items may relate to categories, modifiers, and specials.

### Media Relationships

Image references must correspond to valid media assets.

### Reservation Relationships

Future reservation records may relate to processing events and staff actions.

### Membership Relationships

Future FAM CLUB activity may relate to member identities and rewards.

### Commerce Relationships

Future orders may relate to products, variants, and fulfillment records.

### Foreign Keys

Actual foreign keys must be confirmed from database schema evidence.

### Delete Behavior

Cascading or restricted deletes require deliberate design.

### Orphaned Records

The system should prevent or detect orphaned relationships.

### Important Boundary

Conceptual relationships are not evidence of deployed foreign-key constraints.

## Constraints and Validation

Database constraints should reinforce application validation.

### Required Values

Mandatory fields should be protected by appropriate constraints.

### Unique Identifiers

Records should have stable identifiers.

### Role Values

Authorization roles should use approved values.

### Active Status

Role activation should follow the approved representation.

### Prices

Pricing values require appropriate validation.

### Ordering

Display-order values should follow defined rules.

### Dates and Times

Scheduled content requires consistent date and time handling.

### Inventory

Future inventory quantities must follow approved nonnegative and reservation rules.

### Referential Integrity

Relationships should be protected where appropriate.

### Schema Verification

Actual constraints must be inspected rather than inferred from application forms.

## Row-Level Security

Supabase supports PostgreSQL Row-Level Security.

### Purpose

RLS restricts which database records can be accessed by a given request.

### Authentication

Policies may use authenticated user context.

### Administrative Data

Protected management data requires appropriate policies.

### Staff Roles

Staff role records are security-sensitive.

### Public Menu

Public website queries may require approved read access.

### Private Reservations

Guest reservation information must not be exposed publicly.

### FAM CLUB

Member information requires privacy-focused access controls.

### MERCH

Customer order information requires restricted access.

### Server Authorization

Application-level manager checks remain necessary.

### Verification

Actual RLS enablement and policy definitions require direct inspection.

### Important Boundary

Do not assume a table is protected merely because the page that uses it requires login.

## Database Migrations

Schema changes should be managed through an approved migration process.

### Migration Purpose

Migrations make database changes reproducible.

### Potential Changes

- Create table.
- Add column.
- Add constraint.
- Add index.
- Add policy.
- Modify relationship.

### Source Control

Approved migration files should be committed to Git.

### Secrets

Database credentials must not be included in migration files.

### Review

Schema changes should be reviewed before production application.

### Testing

Migrations should be tested in an appropriate nonproduction environment.

### Rollback

Destructive changes require a specific recovery plan.

### Existing Data

Migrations must account for existing records.

### Schema Drift

The team should periodically compare the deployed schema with tracked definitions.

### Current Boundary

The project's exact migration workflow requires source inspection.

## Backup and Recovery

Database recovery is an operational requirement.

### Backup Strategy

The team must confirm the backup capabilities available under the actual Supabase plan.

### Backup Frequency

Frequency should reflect the importance and change rate of stored data.

### Recovery Point

The business should define an acceptable recovery point objective.

### Recovery Time

The business should define an acceptable recovery time objective.

### Schema Backup

Schema definitions should be reproducible.

### Data Backup

Critical operational records may require protected backups.

### Storage Files

Supabase Storage assets require separate recovery consideration.

### Recovery Testing

A backup is not considered operationally sufficient until restoration is tested.

### Access Control

Backup files must be protected.

### Production Changes

High-risk schema changes should have an approved rollback or restoration plan.

## Performance and Indexing

Database performance should be reviewed as application usage grows.

### Query Patterns

Indexes should reflect actual application queries.

### Staff Roles

Manager authorization performs a lookup by authenticated user identifier and active status.

### Menu Queries

Public and administrative menu queries may benefit from appropriate ordering and filtering indexes.

### SPECIALS

Future scheduled specials may require efficient date and time filtering.

### Reservations

Future reservation queries may filter by date, status, or processing outcome.

### FAM CLUB

Future member searches may require appropriate indexes.

### Commerce

Future order and inventory queries may require transactional performance review.

### Index Tradeoffs

Additional indexes increase storage and write overhead.

### Query Plans

Use database query plans when investigating performance.

### Verification

Actual indexes and query performance must be inspected before making optimization claims.

## Testing and Verification

### Schema Inventory

- List deployed tables.
- Inspect columns and types.
- Inspect primary keys.
- Inspect foreign keys.
- Inspect unique constraints.
- Inspect indexes.
- Inspect triggers.
- Inspect RLS policies.

### Authentication

- Valid manager role.
- Missing staff role.
- Inactive manager.
- Non-manager role.
- Failed role lookup.

### Menu

- Create item.
- Edit item.
- Validate category.
- Validate price.
- Update availability.
- Update display order.
- Update image reference.

### Storage Relationships

- Valid media reference.
- Missing media asset.
- Failed upload.
- Failed metadata update.
- Safe image replacement.

### Future Modules

When implemented, test:

- SPECIALS scheduling.
- FAM CLUB records.
- GALLERY ordering.
- MERCH inventory.
- Commerce transactions.
- Toast synchronization.

### Security

- Unauthorized reads.
- Unauthorized writes.
- RLS enforcement.
- Storage policies.
- Server-side authorization.

### Migrations

- Clean migration application.
- Existing-data compatibility.
- Failed migration recovery.
- Schema consistency.

### Recovery

- Backup availability.
- Restoration procedure.
- Data integrity after recovery.

## Implementation Roadmap

### Stage 1 — Inventory Existing Schema

Inspect the current Supabase project and tracked database definitions.

### Stage 2 — Record Verified Tables

Document exact table names, columns, types, constraints, and indexes.

### Stage 3 — Audit Security

Inspect RLS policies and privileged access paths.

### Stage 4 — Map Application Queries

Connect existing application operations to their actual database structures.

### Stage 5 — Identify Schema Gaps

Compare deployed structures against approved feature requirements.

### Stage 6 — Approve Future Models

Design new tables only for approved features.

### Stage 7 — Establish Migration Discipline

Confirm version control, testing, and rollback procedures.

### Stage 8 — Verify Recovery

Review backup and restoration capabilities.

### Stage 9 — Maintain Documentation

Update this document when schema changes are implemented and verified.

### Scheduling

This roadmap does not establish a committed delivery date.

## Implementation Status

| Capability | Status |
|---|---|
| Supabase PostgreSQL integration | Implemented |
| Supabase Auth integration | Implemented |
| `staff_roles` source reference | Verified |
| `staff_roles.user_id` source reference | Verified |
| `staff_roles.role` source reference | Verified |
| `staff_roles.is_active` source reference | Verified |
| Manager authorization query | Verified |
| Menu Management database integration | Implemented |
| Complete menu table definitions | Schema verification pending |
| Menu constraints and indexes | Schema verification pending |
| Supabase Storage integration | Implemented |
| Reservation persistence schema | Verification pending |
| SMS processing persistence schema | Verification pending |
| SPECIALS scheduling schema | Planned |
| FAM CLUB membership schema | Planned |
| GALLERY management schema | Planned |
| Native MERCH commerce schema | Under Evaluation |
| Toast POS integration schema | Under Evaluation |
| Complete foreign-key inventory | Verification pending |
| Complete RLS policy inventory | Verification pending |
| Database migration workflow | Source verification pending |
| Backup and restoration procedures | Verification pending |
| Comprehensive database acceptance testing | Verification pending |

## Related Documentation

- [Database Overview](README.md)
- [Database Access Policies](access-policies.md)
- [Database Storage](storage.md)
- [Supabase Authentication](../05-authentication/supabase-auth.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Menu Management](../04-admin-dashboard/menu-management.md)
- [Menu System](../02-website/menu-system.md)
- [Reservation Workflow](../03-reservations/reservation-workflow.md)
- [SMS Parsing](../03-reservations/sms-parsing.md)
- [SPECIALS Scheduling](../02-website/specials/scheduling.md)
- [FAM CLUB Administration](../02-website/ff-fam-club/admin-management.md)
- [GALLERY Administration](../02-website/gallery/admin-management.md)
- [MERCH Commerce Overview](../11-merch-commerce/commerce-overview.md)
- [Toast POS Integration Overview](../10-toast-pos-integration/integration-overview.md)
- [Deployment Overview](../07-deployment/README.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Master Documentation Index](../README.md)

---

[Back to Database Overview](README.md)
