# SPECIALS

**Category:** Website / Restaurant Promotions

**Documentation Status:** In Development

**Admin Management Status:** Planned

**Toast POS Integration Status:** Under Evaluation

---

## Table of Contents

1. [Overview](#overview)
2. [Current Implementation](#current-implementation)
3. [Specials and Menu Items](#specials-and-menu-items)
4. [Promotional Pricing](#promotional-pricing)
5. [Scheduling and Availability](#scheduling-and-availability)
6. [Future Admin Management](#future-admin-management)
7. [Future Toast POS Integration](#future-toast-pos-integration)
8. [Implementation Status](#implementation-status)
9. [Related Documentation](#related-documentation)

---

## Overview

The SPECIALS feature is intended to promote selected
Fin & Feathers menu items through daily, weekly,
or date-specific restaurant promotions.

Specials should remain connected to the restaurant's
primary menu management system.

This will help maintain consistent item descriptions,
images, pricing references, and availability.

## Current Implementation

The existing Menu Management interface includes
an "is_five_dollar_special" field.

Managers can mark eligible menu items using the
"Show as a $5 Special" control.

This is an existing menu item attribute and should
not be confused with the proposed comprehensive
SPECIALS management system.

The full SPECIALS scheduling and administration
interface has not yet been implemented.

## Specials and Menu Items

The proposed architecture associates each special
with an existing menu item.

For example:

**Promotion:** Today's Special (Tuesday)

**Menu Item:** F&F Taco Tuesday Platter

**Schedule:** Tuesday

**Promotional Price:** To be configured by management

This association should allow the website to display
promotional information while preserving the original
menu item record.

Potential future data relationships include:

- Menu item identifier.
- Special identifier.
- Promotional title.
- Promotional description.
- Promotional price.
- Schedule or recurrence.
- Active status.
- Start and expiration dates.

The final database schema must be designed and
reviewed before implementation.

## Promotional Pricing

Specials may offer temporary promotional pricing
without permanently changing the standard menu price.

Future functionality should distinguish:

- Standard menu price.
- Promotional price.
- Effective dates.
- Applicable modifiers or add-ons.
- Any eligibility restrictions.

Pricing behavior must be verified against the
restaurant's business rules.

## Scheduling and Availability

Potential scheduling capabilities include:

- Daily specials.
- Weekly recurring specials.
- Specific calendar-date promotions.
- Start and end times.
- Automatic activation.
- Automatic expiration.
- Manual manager overrides.

Scheduling should use the restaurant's local
Las Vegas time zone.

The final scheduling rules remain subject
to owner approval.

## Future Admin Management

The planned Admin Dashboard SPECIALS interface
may allow authorized managers to:

- Select existing menu items.
- Create promotional titles and descriptions.
- Configure promotional prices.
- Define recurring schedules.
- Set promotion start and expiration dates.
- Activate or deactivate specials.
- Preview how promotions appear on the website.

All modifications must be protected by manager
authentication and appropriate database policies.

## Future Toast POS Integration

A future Toast POS integration may allow eligible
specials to participate in online food ordering.

Important considerations include:

- Matching website menu items to Toast menu items.
- Validating promotional prices.
- Supporting applicable item modifiers.
- Determining whether Toast accepts the promotion.
- Handling availability and order restrictions.
- Preventing mismatches between website and POS pricing.

No direct POS integration is currently assumed.

API availability, account permissions, costs,
and supported ordering workflows must be evaluated.

See the
[Toast POS Integration Documentation](../../10-toast-pos-integration/README.md).

## Implementation Status

| Capability | Status |
|---|---|
| Existing $5 special menu attribute | Implemented; verification pending |
| Dedicated SPECIALS website feature | Planned |
| Special-to-menu-item association | Planned |
| Promotional pricing | Planned |
| Recurring schedules | Planned |
| Manager SPECIALS editor | Planned |
| Automatic activation and expiration | Planned |
| Toast POS synchronization | Under Evaluation |
| Online ordering of specials | Under Evaluation |

## Related Documentation

- [Website Overview](../README.md)
- [Menu Management](../../09-menu-management/README.md)
- [Admin Dashboard](../../04-admin-dashboard/README.md)
- [Database & Storage](../../06-database/README.md)
- [Toast POS Integration](../../10-toast-pos-integration/README.md)
- [Master Documentation Index](../../README.md)

---

[Back to Website Documentation](../README.md)
