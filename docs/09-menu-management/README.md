# 09. Menu Management

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Admin Route:** /admin/menu

**Current Implementation:** Implemented; operational verification ongoing

**Access Requirement:** Authenticated user with an active manager role

---

## Table of Contents

1. [Overview](#overview)
2. [Menu Management Architecture](#menu-management-architecture)
3. [Access and Permissions](#access-and-permissions)
4. [Menu Editor](#menu-editor)
5. [Categories and Subcategories](#categories-and-subcategories)
6. [Adding and Editing Items](#adding-and-editing-items)
7. [Pricing and Modifiers](#pricing-and-modifiers)
8. [Menu Images](#menu-images)
9. [Specials Management](#specials-management)
10. [Publishing Updates](#publishing-updates)
11. [Testing and Troubleshooting](#testing-and-troubleshooting)
12. [Future Enhancements](#future-enhancements)
13. [Implementation Status](#implementation-status)
14. [Detailed Documentation](#detailed-documentation)
15. [Related Documentation](#related-documentation)

---

## Overview

The Fin & Feathers Las Vegas Menu Management
system allows authorized restaurant managers
to maintain menu information through the
Admin Dashboard.

The primary objective is to allow menu updates
without requiring changes to application
source code.

The existing interface supports menu item
creation, editing, pricing, images, visibility,
and display ordering.

The system uses Supabase for menu data
and media storage.

## Menu Management Architecture

The menu management implementation uses:

- Next.js App Router.
- Supabase PostgreSQL.
- Supabase Storage.
- Server-side manager authorization.
- Administrative menu editing components.
- Public website menu presentation.

The primary database table is:

menu_items

The administrative interface is located at:

/admin/menu

The detailed implementation will be documented
after reviewing the current application files.

## Access and Permissions

Menu Management is restricted to authenticated
users with an active manager role.

The existing application uses the
requireManager() authorization helper.

Managers should be permitted to perform
approved menu operations.

Unauthorized users must not be able to
create, modify, or delete menu information.

Database and storage access policies must
be verified separately.

## Menu Editor

The existing menu editor supports:

- Viewing menu items.
- Creating new items.
- Editing existing items.
- Managing descriptions.
- Updating pricing information.
- Assigning menu categories.
- Assigning subcategories.
- Managing item tags.
- Uploading item images.
- Setting active or inactive status.
- Adjusting display order.
- Managing the existing $5 special flag.

The exact field validation and save behavior
will be covered in the detailed editor guide.

## Categories and Subcategories

Menu items are organized using category
and subcategory information.

The menu structure must follow the approved
restaurant menu data.

Categories and subcategories should not be
invented or introduced without approval.

The original menu organization includes:

- Starters.
- Entrees.
- Sandwiches.
- Salads.
- Sides.
- Brunch.
- Brunch Sides.
- Brunch Drinks.

The current database-driven category and
subcategory structure must be verified
against the latest menu implementation.

The approved spreadsheet remains the
reference for authorized menu organization.

## Adding and Editing Items

The menu editor allows managers to create
and update menu items.

Item information may include:

- Item name.
- Description.
- Menu category.
- Subcategory.
- Price.
- Price and option notes.
- Tags.
- Image.
- Active status.
- Display order.
- Existing $5 special designation.

Managers should verify all changes before
making updated menu information available
to customers.

## Pricing and Modifiers

The menu supports standard prices and
additional pricing information.

Examples include:

- Fixed item prices.
- Market-price items.
- Protein additions.
- Sauce upcharges.
- Optional add-ons.
- Preparation options.

The current menu implementation includes
a price_options_notes field.

The exact handling of structured modifiers,
price calculations, and customer selections
must be verified before documenting them
as implemented capabilities.

A future Toast POS integration may require
a more structured modifier model.

## Menu Images

The existing Menu Management interface
supports menu image uploads.

The image workflow includes:

- Image selection.
- Image processing.
- 4:3 aspect ratio.
- WebP output.
- Supabase Storage uploads.
- Updating the menu item's image reference.

Menu images are stored using the project's
Supabase Storage configuration.

The current upload limits, file naming rules,
and storage permissions require verification.

## Specials Management

The existing menu editor includes an
is_five_dollar_special field.

This flag is distinct from the proposed
comprehensive SPECIALS management system.

Future specials functionality may support:

- Selecting existing menu items.
- Setting promotional prices.
- Scheduling daily specials.
- Scheduling weekly specials.
- Configuring start and expiration dates.
- Managing recurring promotions.
- Automatically displaying active specials.

The future scheduling system is planned
and must not be treated as implemented.

See [SPECIALS Documentation](../02-website/specials/README.md).

## Publishing Updates

Menu changes should follow a controlled
review and verification process.

The intended workflow includes:

1. Sign in to the Admin Dashboard.
2. Open Menu Management.
3. Select or create a menu item.
4. Update the appropriate fields.
5. Review pricing and descriptions.
6. Save the changes.
7. Verify the public menu presentation.
8. Correct any errors.

Whether updates appear immediately or
require a separate publishing action
must be verified against the current code.

## Testing and Troubleshooting

Menu Management testing should include:

- Creating a menu item.
- Editing an existing item.
- Updating item pricing.
- Updating category assignments.
- Uploading an image.
- Replacing an image.
- Changing active status.
- Adjusting display order.
- Verifying public menu changes.
- Testing unauthorized access.

Troubleshooting documentation should address:

- Failed saves.
- Invalid field values.
- Image upload errors.
- Missing menu items.
- Incorrect pricing.
- Category assignment problems.
- Database permission errors.
- Public menu display inconsistencies.

## Future Enhancements

Potential enhancements include:

### Advanced SPECIALS

Recurring promotional schedules
and promotional pricing.

### Toast POS Integration

Possible menu synchronization,
modifier mapping, and ordering integration.

### Reporting

Menu performance and promotional
reporting, subject to available data.

### Administrative Improvements

Additional validation, audit history,
and operational controls.

These enhancements are planned or
under evaluation.

## Implementation Status

| Capability | Status |
|---|---|
| Manager-only menu route | Implemented |
| Menu item listing | Implemented |
| Create menu item | Implemented |
| Edit menu item | Implemented |
| Category and subcategory assignment | Implemented |
| Item descriptions | Implemented |
| Price and option notes | Implemented |
| Menu tags | Implemented |
| Menu image uploads | Implemented |
| 4:3 WebP image processing | Implemented |
| Active/inactive item controls | Implemented |
| Display ordering | Implemented |
| $5 special flag | Implemented |
| Public menu update verification | Verification ongoing |
| Structured modifier management | Under Evaluation |
| Scheduled SPECIALS management | Planned |
| Toast POS menu synchronization | Under Evaluation |
| Menu reporting | Planned |

## Detailed Documentation

The following documents will provide
implementation-specific information:

- [Menu Editor Guide](menu-editor-guide.md)
- [Categories and Subcategories](categories-and-subcategories.md)
- [Adding and Editing Items](adding-editing-items.md)
- [Pricing and Modifiers](pricing-and-modifiers.md)
- [Menu Images](menu-images.md)
- [Specials Management](specials-management.md)
- [Publishing Updates](publishing-updates.md)
- [Troubleshooting](troubleshooting.md)

These documents will be created and verified
in subsequent documentation steps.

## Related Documentation

- [Website](../02-website/README.md)
- [Public Menu System](../02-website/menu-system.md)
- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Authentication](../05-authentication/README.md)
- [Database & Storage](../06-database/README.md)
- [Operations](../08-operations/README.md)
- [Toast POS Integration](../10-toast-pos-integration/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Master Documentation Index](../README.md)
