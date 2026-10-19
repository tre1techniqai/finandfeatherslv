# 02. Website

**Project:** Fin & Feathers Las Vegas

**Website:** https://finandfeatherslv.live

**Documentation Status:** In Development

---

## Table of Contents

1. [Website Overview](#website-overview)
2. [Core Website Features](#core-website-features)
3. [F&F FAM CLUB](#ff-fam-club)
4. [SPECIALS](#specials)
5. [GALLERY](#gallery)
6. [MERCH](#merch)
7. [Future Enhancements](#future-enhancements)
8. [Related Documentation](#related-documentation)

---

## Website Overview

The Fin & Feathers Las Vegas website is a mobile-first
Next.js application designed to showcase the restaurant,
provide access to restaurant services, and support
future online commerce functionality.

The website is deployed through Vercel and uses
Supabase for database and media storage services.

## Core Website Features

### Homepage

The homepage presents restaurant branding, navigation,
promotional content, and access to restaurant services.

Planned documentation:
- Homepage layout and responsive behavior.
- Navigation and primary action buttons.
- Restaurant branding and visual design.
- Virtual tour and video presentation.

### Menu

The public menu displays restaurant food and drink
items organized by their assigned categories.

Menu content is managed through the protected
Admin Dashboard.

See [Menu Management](../09-menu-management/README.md).

### Reservations

The reservation form allows customers to prepare
an SMS reservation request.

Current form requirements include:
- Separate first and last name fields.
- Preferred date and time.
- Party size and occasion.
- Required consent acknowledgments.
- Two-hour minimum advance notice.
- Ninety-calendar-day booking window.

The SMS workflow requires the customer to send the
prepared message. A submitted request is not an
automatically confirmed reservation.

See [Reservations](../03-reservations/README.md).

### Animations

The website includes branded entrance and scroll-based
animations designed to enhance the guest experience.

Animation documentation will cover:
- Logo entrance effects.
- Slogan and subheading reveals.
- Button entrance sequences.
- Scroll-triggered section transitions.
- Reduced-motion accessibility considerations.

## F&F FAM CLUB

The F&F FAM CLUB section presents the restaurant's
loyalty program.

Future management capabilities may include program
content administration and authorized member operations.

See [F&F FAM CLUB Documentation](ff-fam-club/README.md).

**Admin Management Status:** Planned.

## SPECIALS

The SPECIALS section will support restaurant promotions,
including daily and weekly specials associated with
existing menu items.

Future manager capabilities may include:
- Creating and editing specials.
- Associating specials with menu items.
- Configuring promotional prices.
- Scheduling specials by day or date.
- Activating and deactivating promotions.

See [SPECIALS Documentation](specials/README.md).

See also [Specials Management](../09-menu-management/README.md).

**Admin Management Status:** Planned.

## GALLERY

The GALLERY section showcases restaurant photography.

Future manager capabilities may include:
- Uploading images.
- Replacing existing images.
- Reordering gallery items.
- Managing image visibility.
- Removing outdated content.

See [GALLERY Documentation](gallery/README.md).

**Admin Management Status:** Planned.

## MERCH

The MERCH section provides access to restaurant-branded
merchandise.

Future development may include direct merchandise
purchases through the restaurant website.

Potential management capabilities include:
- Product catalog administration.
- Product images and descriptions.
- Pricing and variants.
- Inventory availability.
- Order and fulfillment management.

See [MERCH Documentation](merch/README.md).

For commerce feasibility and implementation planning,
see [Merchandise Commerce](../11-merch-commerce/README.md).

**Direct Commerce Status:** Under Evaluation.

## Future Enhancements

Potential future website enhancements include:
- Toast POS-connected online food ordering.
- Menu item shopping cart functionality.
- Integrated food checkout.
- Direct merchandise checkout.
- Expanded manager-controlled website content.

See [Toast POS Integration](../10-toast-pos-integration/README.md).

These capabilities are not considered implemented
until development and verification are complete.

## Related Documentation

- [Project Overview](../01-project-overview/README.md)
- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Menu Management](../09-menu-management/README.md)
- [Reservations](../03-reservations/README.md)
- [Database & Storage](../06-database/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Master Documentation Index](../README.md)
