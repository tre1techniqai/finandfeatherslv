# ADMIN DASHBOARD — Menu Management

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Administrative menu editor implemented; detailed source verification and operational acceptance testing ongoing

**Feature:** Manager Menu Administration

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Menu Management Objectives](#menu-management-objectives)
3. [Current Implementation](#current-implementation)
4. [Administrative Architecture](#administrative-architecture)
5. [Manager Authorization](#manager-authorization)
6. [Menu Data Model](#menu-data-model)
7. [Categories and Subcategories](#categories-and-subcategories)
8. [Menu Item Creation](#menu-item-creation)
9. [Menu Item Editing](#menu-item-editing)
10. [Pricing and Modifiers](#pricing-and-modifiers)
11. [Menu Item Images](#menu-item-images)
12. [Visibility and Display Order](#visibility-and-display-order)
13. [SPECIALS Integration](#specials-integration)
14. [Public Menu Synchronization](#public-menu-synchronization)
15. [Validation and Data Integrity](#validation-and-data-integrity)
16. [Security and Privacy](#security-and-privacy)
17. [Error Handling and Recovery](#error-handling-and-recovery)
18. [Manager Operating Procedures](#manager-operating-procedures)
19. [Testing and Verification](#testing-and-verification)
20. [Future Enhancements](#future-enhancements)
21. [Implementation Status](#implementation-status)
22. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the administrative menu management system for the Fin & Feathers Las Vegas website.

The menu editor enables authorized managers to maintain restaurant menu information through the existing administrative application.

This document covers:

- Administrative menu access.
- Menu item creation.
- Menu item editing.
- Category organization.
- Pricing.
- Modifiers.
- Menu images.
- Item visibility.
- Display ordering.
- SPECIALS relationships.
- Public website consistency.
- Security and validation.
- Operational procedures.

It documents the established implementation while identifying functionality that requires additional source verification or development.

## Menu Management Objectives

The administrative menu editor should make routine menu updates possible without requiring direct source-code changes.

### Operational Control

Managers should be able to maintain approved menu content through a protected interface.

### Data Accuracy

Menu descriptions, prices, and availability should reflect approved restaurant information.

### Consistent Organization

All categories and subcategories must follow the approved menu spreadsheet.

### Image Quality

Food images should follow consistent processing and presentation requirements.

### Public Consistency

Changes should appear correctly in the customer-facing menu.

### Safe Editing

Administrative operations should validate input and report failures accurately.

### Future Compatibility

The menu data model should support approved future integrations without requiring unplanned changes to the public menu structure.

## Current Implementation

**Status:** Implemented foundation

The application includes a manager-facing menu administration page.

### Established Route

    /admin/menu

### Established Source

    src/app/admin/menu/page.tsx

### Dashboard Entry Point

The Admin Dashboard includes Menu Management navigation.

### Existing Capabilities

Previously inspected implementation includes:

- Menu item management.
- Item creation and editing.
- Active status controls.
- Display ordering.
- Image processing and upload.
- Special-related item settings.

### Database

Menu administration uses the application's Supabase data infrastructure.

### Media Storage

Menu image handling integrates with Supabase Storage.

### Source Verification Boundary

Exact database columns, component boundaries, validation rules, and publishing behavior must be confirmed against the latest application source.

### Operational Verification

A feature should not be marked fully verified until its save, retrieval, and public display behavior have been tested.

## Administrative Architecture

The menu management interface is part of the Next.js application.

### Framework

    Next.js App Router

### Language

    TypeScript

### Styling

    Tailwind CSS

### Authentication

    Supabase Auth

### Database

    Supabase PostgreSQL

### Media Storage

    Supabase Storage

### Hosting

    Vercel

### Administrative Layer

The manager-facing page provides editing controls.

### Data Layer

Supabase stores the menu information used by the application.

### Public Layer

The public menu presents approved menu content to website visitors.

### Architectural Requirement

Administrative changes must not bypass authorization, validation, or approved menu structure rules.

## Manager Authorization

Menu management is a protected administrative function.

### Existing Authorization Helper

    requireManager()

### Established Source

    src/lib/auth/require-manager.ts

### Authentication Requirement

The user must have valid Supabase authentication claims.

### Staff Role Requirement

The existing helper checks:

    staff_roles

### Required Role

    manager

### Active Status

The staff role must be active.

### Protected Operations

Authorization must apply to:

- Menu reads requiring manager access.
- Item creation.
- Item updates.
- Item deletion.
- Image uploads.
- Visibility changes.
- Display ordering.

### Server Enforcement

Client-side controls must not be the sole permission boundary.

### Database Security

Applicable database and storage policies must reinforce authorized access.

## Menu Data Model

The menu system uses structured data to represent restaurant offerings.

### Conceptual Menu Information

A menu item may include:

- Item identifier.
- Name.
- Description.
- Category.
- Subcategory.
- Price.
- Market-price indicator.
- Modifier information.
- Dietary or special tags.
- Image reference.
- Active status.
- Display order.
- Special-related settings.

### Schema Boundary

These are conceptual menu attributes.

The exact Supabase column names and data types must be verified from the actual schema.

### Item Identity

Each menu item should have a stable identifier.

### Category Relationship

Every item should belong to an approved category and, where applicable, subcategory.

### Price Representation

The system must distinguish fixed prices from market-price items.

### Image Reference

The image reference should point to an approved media asset.

### Active Status

Inactive items should follow the approved public visibility behavior.

### Data Integrity

Editing must preserve valid relationships between items, categories, modifiers, and images.

## Categories and Subcategories

The approved spreadsheet is the authoritative source for menu categories and subcategories.

### Core Requirement

Do not invent new categories or subcategories during administrative development.

### Existing Menu Areas

The documented menu includes areas such as:

- Starters.
- Entrees.
- Sandwiches.
- Salads.
- Sides.
- Brunch.
- Brunch Sides.
- Brunch Drinks.

### Extended Menu Content

Additional approved categories and subcategories must be taken directly from the latest approved spreadsheet.

### HOOKAH Restriction

Do not add a HOOKAH category filter.

### COCKTAIL Image Restriction

Do not introduce menu images for COCKTAILS.

### Category Labels

Administrative labels should match approved public menu terminology.

### Subcategory Relationships

Subcategories should appear only under their approved parent categories.

### Category Ordering

Category display order should follow approved restaurant requirements.

### Data Migration

Any category restructuring requires a review of existing menu items and public navigation.

### Verification

Compare the administrative category options against the approved spreadsheet before publishing changes.

## Menu Item Creation

The administrative editor supports menu item creation.

### Manager Workflow

1. Open Menu Management.
2. Start the item creation process.
3. Enter the approved item name.
4. Enter the approved description.
5. Select the approved category.
6. Select the appropriate subcategory, if applicable.
7. Enter pricing information.
8. Configure applicable item settings.
9. Add an approved image when appropriate.
10. Save the item.
11. Verify the saved record.
12. Review the public menu.

### Required Information

The application must validate required fields according to the implemented schema.

### Category Validation

Only approved category and subcategory combinations should be accepted.

### Price Validation

Fixed prices must be represented accurately.

### Market Price

Market-price items should not be assigned an invented fixed price.

### Duplicate Prevention

Managers should check whether an item already exists before creating another record.

### Save Confirmation

The interface should report success only after persistence succeeds.

### Verification

Exact current form fields and creation behavior require source inspection.

## Menu Item Editing

The existing administrative interface supports editing menu information.

### Typical Updates

- Item name.
- Description.
- Price.
- Category.
- Subcategory.
- Image.
- Active status.
- Display order.
- Special-related settings.

### Manager Workflow

1. Open the menu editor.
2. Locate the intended item.
3. Review the current values.
4. Make the approved changes.
5. Save the item.
6. Verify persistence.
7. Review public presentation.

### Editing Safeguards

Managers should confirm the correct item before making changes.

### Price Changes

Price updates should be checked carefully before publication.

### Category Changes

Moving an item must preserve valid category relationships.

### Image Changes

Replacing an image should not leave broken public references.

### Concurrent Editing

Future improvements may address conflicting edits by multiple managers.

### Verification

Current field-level behavior must be confirmed against the latest source.

## Pricing and Modifiers

Menu pricing may include fixed prices, market prices, and approved add-on charges.

### Fixed Prices

Examples from the documented menu include:

- Catfish Nuggets — $15.
- Shrimp & Grits — $26.
- Malibu Ribeye — $42.
- Mac & Cheese — $8.

These are documentation examples, not a guarantee of current restaurant pricing.

### Market Prices

Some menu items use:

    MKT

### Examples

- Snow Crab Legs.
- Lobster Tails.
- Certain lobster dishes.

### Modifier Examples

Documented modifier concepts include:

- Sauce selections.
- Protein substitutions.
- Add-on proteins.
- Optional cheese.
- Other approved enhancements.

### Example — Wings

Approved sauce options may include:

- Lemon pepper.
- BBQ.
- Mild.
- Hot.
- Honey hot with an additional charge.

### Example — Tacos

Approved protein upgrades may carry an additional charge.

### Modifier Integrity

Modifiers must not introduce unapproved pricing or options.

### Data Representation

The current implementation's exact modifier storage and editing capabilities require source verification.

### Future Integration

Toast POS synchronization would require an explicit mapping between website modifiers and the POS catalog.

## Menu Item Images

The administrative menu implementation includes image handling.

### Established Image Processing

Previously inspected implementation includes 4:3 WebP image processing.

### Media Storage

Images are stored through Supabase Storage.

### Approved Storage Infrastructure

The project uses the website media storage infrastructure.

### Image Objectives

- Consistent aspect ratio.
- Reasonable file size.
- Clear food presentation.
- Reliable public loading.
- Mobile-friendly performance.

### Upload Workflow

1. Select an approved image.
2. Validate the source file.
3. Process the image.
4. Upload the processed asset.
5. Associate the image with the correct menu item.
6. Save the item.
7. Verify public display.

### Image Replacement

Replacing an image should preserve data integrity.

### Missing Images

Items without images should follow the approved public menu presentation.

### COCKTAIL Restriction

COCKTAILS do not require menu images.

### Security

File uploads must validate content and enforce appropriate storage permissions.

### Source Verification

Exact storage paths, image naming, and upload limits must be verified from the latest implementation.

## Visibility and Display Order

The administrative editor includes controls related to menu item visibility and ordering.

### Active Status

The current implementation includes an active status field.

### Public Behavior

The public menu should respect the approved visibility rules.

### Display Order

The current implementation includes display ordering.

### Ordering Objectives

- Consistent item sequence.
- Predictable public presentation.
- Approved category organization.
- Stable mobile navigation.

### Inactive Items

Inactive items should not be presented as available when the public menu is configured to hide them.

### Save Verification

Managers should confirm that status and ordering changes persist.

### Public Verification

After editing, verify that the customer-facing menu reflects the intended result.

### Concurrency

Future work may improve handling of simultaneous ordering changes.

## SPECIALS Integration

The menu editor includes special-related item settings.

### Existing Foundation

Previously inspected implementation includes a special-related checkbox or setting associated with menu items.

### Documented Price Concept

A $5 special-related setting has been referenced in the current menu administration implementation.

### Important Boundary

The existence of an item-level special setting does not establish a complete scheduled SPECIALS management system.

### Future SPECIALS Model

The restaurant intends to feature selected menu items on specific days.

### Example

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

### Future Capabilities

- Select eligible menu items.
- Configure promotional details.
- Assign weekdays.
- Set date ranges.
- Control visibility.
- Preview publication.

### Data Relationship

SPECIALS should maintain a clear relationship to approved menu items.

### Price Accuracy

Promotional pricing must be explicitly approved.

### Scheduling

Scheduling should use the restaurant's local time zone.

### Detailed Documentation

See the dedicated SPECIALS management documents.

## Public Menu Synchronization

Administrative changes must remain consistent with the public website.

### Public Menu

The customer-facing menu is documented separately.

### Update Flow

The intended flow is:

1. Manager edits approved menu information.
2. Application validates the change.
3. Supabase persists the change.
4. Public menu retrieves or receives updated data.
5. Manager verifies public presentation.

### Rendering Behavior

The actual current data fetching, caching, and revalidation implementation must be verified from source.

### Publishing

Do not assume a separate draft-and-publish workflow exists unless confirmed.

### Cache Considerations

If caching is used, updates must become visible through the approved revalidation mechanism.

### Image References

Public image URLs must remain valid after updates.

### Category Consistency

Public filters must use approved categories and subcategories.

### Mobile Verification

Review menu changes on mobile layouts.

### Failure Handling

A failed update must not be reported as published.

## Validation and Data Integrity

Menu data should be validated before persistence.

### Required Fields

Validate required values according to the approved schema.

### Names

Prevent empty or invalid item names.

### Descriptions

Preserve readable, accurate descriptions.

### Prices

Validate fixed prices and market-price representations.

### Categories

Reject unapproved category values.

### Subcategories

Reject invalid category and subcategory combinations.

### Modifiers

Use approved modifier options and charges.

### Images

Validate image type, dimensions, and size.

### Ordering

Validate display order values.

### Duplicate Records

Prevent accidental duplicate item creation where practical.

### Server Validation

Do not rely exclusively on browser-side validation.

### Data Consistency

Failed operations must not leave incomplete or contradictory menu records.

## Security and Privacy

Menu administration is restricted to authorized managers.

### Authentication

Require a valid Supabase session.

### Authorization

Require the active manager role.

### Server-Side Enforcement

Protect administrative reads and mutations.

### Database Policies

Use appropriate Supabase access policies.

### Storage Policies

Restrict unauthorized image uploads and modifications.

### Input Validation

Treat all client-provided values as untrusted.

### File Security

Reject unsafe or unsupported uploads.

### Credentials

Do not expose service credentials in browser code.

### Logging

Avoid recording secrets or unnecessary sensitive information.

### Auditability

Important menu changes may require an audit history.

### Least Privilege

Future staff roles should receive only the permissions required for their duties.

## Error Handling and Recovery

### Failed Item Load

Display a retrieval error rather than a misleading empty state.

### Failed Save

Do not report success when persistence fails.

### Invalid Category

Reject unapproved category or subcategory values.

### Invalid Price

Display a clear validation error.

### Image Upload Failure

Keep the item state consistent and allow safe retry.

### Missing Image

Provide an approved fallback presentation.

### Duplicate Submission

Avoid accidental duplicate item creation.

### Concurrent Changes

Consider conflicting edits by multiple managers.

### Public Display Mismatch

Verify data fetching, caching, and image references.

### Recovery

Use approved correction or rollback procedures.

### Escalation

Unresolved failures should be referred to the technical maintainer.

## Manager Operating Procedures

### Adding an Item

1. Open Menu Management.
2. Select the item creation action.
3. Enter approved information.
4. Select approved categories.
5. Configure price and modifiers.
6. Add an image when appropriate.
7. Save.
8. Verify the public menu.

### Editing an Item

1. Locate the correct item.
2. Review existing values.
3. Apply approved changes.
4. Save.
5. Confirm persistence.
6. Review public display.

### Updating Pricing

1. Confirm the approved new price.
2. Edit the item.
3. Save the change.
4. Verify the database result.
5. Check the public menu.

### Updating Images

1. Select an approved image.
2. Upload through the editor.
3. Confirm processing.
4. Save the item.
5. Check the public image.

### Changing Visibility

1. Locate the item.
2. Update its active status.
3. Save.
4. Verify public behavior.

### Reordering Items

1. Review the approved order.
2. Apply the ordering changes.
3. Save.
4. Verify public presentation.

### Escalating Problems

Record the affected item, attempted action, observed error, and relevant time without exposing credentials.

## Testing and Verification

### Authorization

- Valid active manager.
- Unauthenticated user.
- Inactive manager.
- Unauthorized role.
- Direct route access.
- Unauthorized mutation attempt.

### Item Creation

- Create valid item.
- Reject missing required fields.
- Reject invalid category.
- Reject invalid price.
- Prevent unintended duplicates.

### Item Editing

- Update name.
- Update description.
- Update price.
- Update category.
- Update visibility.
- Update ordering.

### Images

- Upload supported image.
- Verify 4:3 processing.
- Verify WebP output.
- Verify storage result.
- Verify public image loading.
- Handle failed upload.

### Modifiers

- Verify approved options.
- Verify additional charges.
- Verify market-price items.
- Reject invalid modifier data.

### Public Menu

- Verify category filters.
- Verify subcategories.
- Verify item ordering.
- Verify active status.
- Verify updated pricing.
- Verify image changes.
- Verify mobile presentation.

### Special Requirements

- No HOOKAH category filter.
- No COCKTAIL images.
- Approved spreadsheet categories only.
- No unapproved modifier options.

### Failure Tests

- Database failure.
- Network interruption.
- Invalid input.
- Duplicate submission.
- Storage failure.
- Public display mismatch.

## Future Enhancements

### Improved Category Management

Potential tools may simplify approved category and subcategory administration.

### Modifier Editor

A structured modifier editor may improve management of add-ons and substitutions.

### Bulk Updates

Managers may eventually update multiple items in one operation.

### Draft and Publish

A future workflow may separate editing from publication.

### Change History

Audit records may support review and rollback.

### Image Library

Managers may benefit from reusable approved menu images.

### SPECIALS Scheduling

A dedicated module may manage recurring and date-specific promotions.

### Toast POS Integration

Future integration may synchronize approved menu information with Toast POS.

### Integration Boundary

Toast API access, feasibility, cost, and synchronization rules require separate evaluation.

### Approval

Future features must be approved before implementation.

## Implementation Status

| Capability | Status |
|---|---|
| Admin Menu Management route | Implemented |
| Dashboard menu navigation | Implemented |
| Supabase manager authorization | Implemented |
| Menu item management foundation | Implemented |
| Item creation and editing | Implemented |
| Active status control | Implemented |
| Display ordering | Implemented |
| Menu image processing | Implemented |
| Supabase image upload integration | Implemented |
| Special-related item setting | Implemented |
| Exact database schema inventory | Source verification pending |
| Complete modifier editor capabilities | Source verification pending |
| Public menu cache/revalidation behavior | Source verification pending |
| Full administrative acceptance testing | Verification pending |
| Scheduled SPECIALS management | Planned |
| Bulk menu operations | Under Evaluation |
| Draft and publish workflow | Under Evaluation |
| Comprehensive change history | Under Evaluation |
| Toast POS synchronization | Under Evaluation |

## Related Documentation

- [Admin Dashboard Overview](README.md)
- [Dashboard Overview](dashboard-overview.md)
- [Manager Permissions](manager-permissions.md)
- [SPECIALS Management](specials-management.md)
- [Website Menu System](../02-website/menu-system.md)
- [Website SPECIALS Overview](../02-website/specials/specials-overview.md)
- [Menu Management Overview](../09-menu-management/README.md)
- [Menu Editor Guide](../09-menu-management/menu-editor-guide.md)
- [Categories and Subcategories](../09-menu-management/categories-and-subcategories.md)
- [Pricing and Modifiers](../09-menu-management/pricing-and-modifiers.md)
- [Menu Images](../09-menu-management/menu-images.md)
- [Toast POS Integration Overview](../10-toast-pos-integration/README.md)
- [Database Overview](../06-database/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Admin Dashboard Overview](README.md)
