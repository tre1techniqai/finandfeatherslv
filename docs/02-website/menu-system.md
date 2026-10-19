# Public Menu System

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Implemented; source and data verification pending

**Public Access:** Homepage FULL MENU action

**Data Platform:** Supabase

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Menu System Overview](#menu-system-overview)
3. [Customer Experience](#customer-experience)
4. [Menu Data Architecture](#menu-data-architecture)
5. [Categories and Subcategories](#categories-and-subcategories)
6. [Menu Item Information](#menu-item-information)
7. [Pricing and Modifiers](#pricing-and-modifiers)
8. [Menu Images](#menu-images)
9. [Item Visibility and Ordering](#item-visibility-and-ordering)
10. [Menu Presentation and Accessibility](#menu-presentation-and-accessibility)
11. [Administrative Management](#administrative-management)
12. [Specials and Promotions](#specials-and-promotions)
13. [Toast POS Integration](#toast-pos-integration)
14. [Data Integrity and Security](#data-integrity-and-security)
15. [Testing and Verification](#testing-and-verification)
16. [Implementation Status](#implementation-status)
17. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the customer-facing
restaurant menu system.

It explains:

- How customers access the menu.
- How menu information is organized.
- How categories and subcategories are used.
- How prices and modifiers are presented.
- How menu images are managed.
- How administrative changes affect the menu.
- Which enhancements remain planned.

Implementation-specific details require
verification against the current source code
and Supabase database.

## Menu System Overview

The website provides an interactive
restaurant menu experience.

The menu is accessible through
the homepage and navigation controls.

The established implementation uses
a menu modal.

Menu content is managed through
the project's Supabase-backed
administrative infrastructure.

The public menu and manager editor
serve different purposes.

### Public Menu

The public menu allows customers
to browse restaurant offerings.

### Manager Menu Editor

The manager interface allows
authorized staff to maintain
menu information.

The menu system should maintain
consistency between the data
stored in Supabase and the
information presented to customers.

## Customer Experience

The primary customer entry point is:

    FULL MENU

The menu interface should allow
customers to:

- Browse available menu categories.
- Navigate supported subcategories.
- View item names.
- Read item descriptions.
- View prices.
- Identify available modifiers.
- View applicable item tags.
- View images where supported.
- Understand special pricing.
- Close the menu and return to the website.

The exact current interaction
patterns require source verification.

### Modal Behavior

The menu was established as
a modal-based experience.

The interface should support:

- A visible close control.
- Keyboard accessibility.
- Appropriate focus management.
- Responsive scrolling.
- Readable item information.
- Touch-friendly navigation.

Actual modal dismissal and
focus behavior must be tested.

## Menu Data Architecture

The menu system uses Supabase
as its application data platform.

The established menu table is:

    menu_items

The administrative editor
supports operations such as:

- Creating items.
- Editing items.
- Updating prices.
- Managing categories.
- Managing subcategories.
- Updating images.
- Changing visibility.
- Changing display order.

### Data Flow

The intended relationship is:

    Authorized Manager
            |
            v
    Admin Menu Editor
            |
            v
    Supabase menu_items
            |
            v
    Public Menu Presentation
            |
            v
         Customer

This is a conceptual data flow.

The exact query implementation,
caching behavior, and update
refresh strategy require verification.

### Source of Truth

The approved menu spreadsheet
provides the established business
reference for menu organization.

Supabase stores the application
records used by the menu system.

The project must verify that
database categories, subcategories,
and item information remain aligned
with the approved spreadsheet.

## Categories and Subcategories

Menu categories and subcategories
must follow the approved
restaurant menu spreadsheet.

### Category Requirements

- Use only approved categories.
- Use only approved subcategories.
- Preserve the intended category hierarchy.
- Avoid introducing unsupported filters.
- Maintain consistent display labels.
- Preserve the approved display order
  where specified.

### HOOKAH Exclusion

Do not add a HOOKAH category filter.

A HOOKAH category or filter must
not be introduced without a
separately approved change
to the menu requirements.

### Category Verification

The current category list must
be obtained from the latest
approved spreadsheet or verified
database records.

Historical category examples
must not be treated as the
current authoritative list.

### Subcategory Verification

Subcategories must be verified
against the approved spreadsheet.

The public interface should not
invent additional groupings
based solely on item descriptions.

## Menu Item Information

Menu items may include:

- Item name.
- Description.
- Category.
- Subcategory.
- Price.
- Market-price designation.
- Modifier information.
- Dietary or promotional tags.
- Image.
- Active status.
- Display order.

The exact database columns
must be confirmed through
schema inspection.

### Item Names and Descriptions

Names and descriptions should
reflect approved restaurant content.

Administrative changes must
preserve customer-facing accuracy.

### Item Tags

Established tag concepts include:

- Spicy.
- Chef's Special.
- Vegetarian.
- Vegan.

The currently supported tag
values and presentation rules
require verification.

Tags must not imply dietary
or allergen guarantees
without restaurant approval.

## Pricing and Modifiers

Menu pricing may include:

- Fixed item prices.
- Market-price items.
- Additional charges.
- Protein upgrades.
- Sauce selections.
- Other approved modifiers.

### Fixed Pricing

Fixed prices should be displayed
clearly and consistently.

### Market Pricing

Items without a fixed price
may use an approved market-price
designation.

The exact label and formatting
must follow restaurant requirements.

### Modifiers

Modifiers may affect:

- Item preparation.
- Protein selection.
- Sauce selection.
- Additional charges.
- Available options.

Modifier values and prices
must match the approved menu data.

### Pricing Integrity

The public menu must not display
unapproved or outdated prices.

Changes should be verified
after administrative updates.

### Ordering Limitations

Displaying menu modifiers
does not establish a native
online ordering capability.

The existing online ordering
experience is separate from
the public menu presentation.

## Menu Images

Menu images support the
visual presentation of food items.

### Established Storage

The project uses Supabase Storage.

The established bucket is:

    website-media

Previously established menu image
organization includes:

    menu/

The exact current object paths
must be verified.

### Image Processing

The established manager workflow
includes:

- Image selection.
- Image processing.
- 4:3 aspect ratio.
- WebP output.
- Storage upload.

Exact compression settings,
size limits, and replacement
behavior require source verification.

### COCKTAILS Image Exclusion

Menu items in the COCKTAILS
category must not display images.

This is a presentation requirement
even if an image reference exists
in the underlying data.

The exact category naming and
comparison behavior must be
verified against the approved
menu spreadsheet.

### Image Fallbacks

The public interface should
handle missing or unavailable
images gracefully.

It should avoid broken images
and unnecessary layout shifts.

### Image Accessibility

Food images should use
appropriate alternative text
when they convey information.

Decorative images should not
create redundant announcements.

## Item Visibility and Ordering

The administrative menu editor
supports item visibility
and display ordering.

### Active Status

Inactive menu items should not
appear as available customer
offerings unless a separately
approved business rule requires it.

The actual public query behavior
must be verified.

### Display Order

Menu items should appear in
the intended restaurant-defined order.

Ordering may depend on:

- Category.
- Subcategory.
- Item display position.

The exact ordering fields
require database verification.

### Data Refresh

After a manager changes
a menu item, the public
menu should reflect the
approved update.

The current refresh,
caching, and revalidation
mechanisms require verification.

## Menu Presentation and Accessibility

The menu interface should
support mobile-first browsing.

### Mobile Requirements

- Readable item names.
- Clear prices.
- Touch-friendly filters.
- Responsive images.
- Usable scrolling.
- Accessible modal controls.

### Desktop Requirements

- Efficient category navigation.
- Readable descriptions.
- Consistent item alignment.
- Appropriate image sizing.
- Clear modifier information.

### Accessibility Requirements

- Keyboard navigation.
- Visible focus indicators.
- Accessible filter labels.
- Appropriate dialog semantics.
- Sufficient color contrast.
- Clear interactive states.
- Readable text at browser zoom.

### Performance Requirements

- Efficient menu queries.
- Appropriate image optimization.
- Minimal unnecessary data transfer.
- Graceful loading behavior.
- Error handling.

## Administrative Management

The manager menu interface
is established under:

    /admin/menu

The existing authorization
helper is:

    src/lib/auth/require-manager.ts

The helper requires an active
manager role.

### Manager Capabilities

Established functionality includes:

- Creating menu items.
- Editing menu items.
- Managing prices.
- Managing descriptions.
- Assigning categories and subcategories.
- Managing tags.
- Uploading item images.
- Controlling active status.
- Adjusting display order.

The current editor behavior
requires detailed verification.

### Administrative Security

Menu write operations must
enforce appropriate permissions.

Client-side interface restrictions
must not be the sole authorization
mechanism.

Database policies and storage
permissions require verification.

### Detailed Manager Documentation

See:

[Menu Management](../09-menu-management/README.md)

## Specials and Promotions

The menu editor includes
an established special flag:

    is_five_dollar_special

This existing field is distinct
from the proposed SPECIALS
scheduling system.

### Future SPECIALS

Planned capabilities include:

- Selecting existing menu items.
- Configuring promotional prices.
- Daily promotions.
- Weekly promotions.
- Recurring schedules.
- Start and end dates.
- Promotion visibility.

### Promotional Pricing

The system must distinguish:

- Standard menu price.
- Promotional price.
- Promotion eligibility.
- Promotion schedule.

A planned promotion must not
be displayed as active
before its approved conditions
are satisfied.

### Current Status

Advanced SPECIALS scheduling
remains planned.

## Toast POS Integration

The public menu and the
external Toast ordering
experience are currently
separate workflows.

### Current Ordering

The website includes an
ORDER ONLINE action.

This directs customers to
the established external
Toast ordering experience.

### Proposed Integration

Future evaluation may consider:

- Toast menu synchronization.
- Price synchronization.
- Modifier synchronization.
- Availability synchronization.
- Native shopping cart.
- Order submission.
- Payment processing.

### Dependencies

Direct integration depends on:

- Toast API eligibility.
- Supported API operations.
- Account permissions.
- Integration costs.
- Approved architecture.
- Ownership approval.

No direct Toast API integration
is assumed to be operational.

## Data Integrity and Security

The menu system must protect
the accuracy and integrity
of restaurant information.

### Data Validation

Administrative updates should
validate:

- Required item information.
- Supported category values.
- Supported subcategory values.
- Price formats.
- Modifier values.
- Image references.
- Visibility settings.

### Authorization

Only authorized staff should
be able to modify menu data.

### Public Access

Customers should only receive
information intended for
public menu presentation.

### Storage Security

Image uploads and deletions
must follow approved
storage access policies.

### Auditability

The project should evaluate
appropriate change tracking
for menu administration.

The existence of a complete
audit log must not be assumed.

## Testing and Verification

### Category Testing

- Verify all approved categories.
- Verify approved subcategories.
- Verify category ordering.
- Confirm no HOOKAH filter.
- Verify category selection behavior.

### Menu Item Testing

- Verify item names.
- Verify descriptions.
- Verify prices.
- Verify market-price labels.
- Verify tags.
- Verify modifiers.
- Verify display order.

### Image Testing

- Verify supported food images.
- Verify image aspect ratios.
- Verify missing-image handling.
- Confirm COCKTAILS have no images.
- Verify responsive image behavior.

### Administrative Testing

- Create a test menu item.
- Edit a test menu item.
- Change its price.
- Change its visibility.
- Change its display order.
- Verify public presentation.
- Verify unauthorized access is blocked.

Test records must be handled
carefully and should not
disrupt the production menu.

### Responsive Testing

- Mobile.
- Tablet.
- Desktop.
- Browser zoom.
- Keyboard navigation.

### Data Verification

- Compare menu data with the
  latest approved spreadsheet.
- Inspect relevant database fields.
- Verify storage references.
- Confirm the public query
  respects active status.
- Verify caching and refresh behavior.

## Implementation Status

| Capability | Status |
|---|---|
| Public menu presentation | Implemented |
| Homepage menu trigger | Implemented |
| Menu modal | Implemented |
| Supabase menu data | Implemented |
| Menu category navigation | Implemented; verification pending |
| Menu subcategories | Implemented; verification pending |
| Menu item pricing | Implemented |
| Menu modifiers | Implemented; verification pending |
| Menu item tags | Implemented; verification pending |
| Menu images | Implemented |
| COCKTAILS image exclusion | Required; implementation verification pending |
| HOOKAH filter exclusion | Required; implementation verification pending |
| Active item visibility | Implemented; verification pending |
| Menu display ordering | Implemented; verification pending |
| Manager menu editor | Implemented |
| Existing $5 special flag | Implemented |
| Scheduled SPECIALS | Planned |
| Direct Toast API integration | Under Evaluation |
| Native website ordering cart | Planned; feasibility dependent |

## Related Documentation

- [Website Overview](README.md)
- [Homepage](homepage.md)
- [Reservation Form](reservation-form.md)
- [SPECIALS](specials/README.md)
- [Menu Management](../09-menu-management/README.md)
- [Categories and Subcategories](../09-menu-management/categories-and-subcategories.md)
- [Pricing and Modifiers](../09-menu-management/pricing-and-modifiers.md)
- [Menu Images](../09-menu-management/menu-images.md)
- [Toast POS Integration](../10-toast-pos-integration/README.md)
- [Database & Storage](../06-database/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Website Overview](README.md)
