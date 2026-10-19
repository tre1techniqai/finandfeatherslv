# Homepage

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Implemented; operational verification ongoing

**Public Route:** /

**Design Approach:** Mobile-first responsive design

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Homepage Overview](#homepage-overview)
3. [Page Architecture](#page-architecture)
4. [Branding and Visual Identity](#branding-and-visual-identity)
5. [Header and Navigation](#header-and-navigation)
6. [Hero Section](#hero-section)
7. [Primary Actions](#primary-actions)
8. [Virtual Tour](#virtual-tour)
9. [Food Video Presentation](#food-video-presentation)
10. [Image Gallery](#image-gallery)
11. [Social Media and Reviews](#social-media-and-reviews)
12. [Merchandise Promotion](#merchandise-promotion)
13. [Loyalty Program](#loyalty-program)
14. [Careers, Contact, and Events](#careers-contact-and-events)
15. [Responsive Design](#responsive-design)
16. [Animations and Accessibility](#animations-and-accessibility)
17. [Content and Media Management](#content-and-media-management)
18. [Testing and Verification](#testing-and-verification)
19. [Implementation Status](#implementation-status)
20. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the homepage
of the Fin & Feathers Las Vegas website.

The homepage introduces the restaurant,
communicates its brand identity,
and provides access to primary
customer-facing services.

The documentation covers:

- Homepage structure.
- Branding.
- Navigation.
- Customer actions.
- Media presentation.
- Responsive behavior.
- Accessibility considerations.
- Content management dependencies.

Exact implementation details must be
verified against the current source code.

## Homepage Overview

The homepage is the primary entry point
for the public restaurant website.

Production domain:

    https://finandfeatherslv.live

Public route:

    /

The homepage includes:

- Restaurant branding.
- Animated logo presentation.
- Restaurant slogan.
- Primary action buttons.
- Virtual tour.
- Food video.
- Image gallery.
- Social media links.
- Merchandise promotion.
- Loyalty program information.
- Careers, contact, and events content.

The homepage prioritizes mobile devices
while supporting desktop layouts.

## Page Architecture

The website uses Next.js App Router.

The established homepage source path is:

    src/app/page.tsx

The homepage is composed of reusable
React components.

Previously established components include:

- SiteHeader.
- SiteFooter.
- RibeyeVideo.
- VirtualTourModal.
- ImageGallery.
- SocialLinks.
- MerchModal.
- LoyaltyProgram.
- CareersContactEvents.
- ScrollReveal.

The current component imports,
filenames, and rendering structure
require source verification.

### Component Responsibilities

The homepage page component coordinates
the presentation of major sections.

Reusable components provide isolated
functionality for:

- Navigation.
- Modal interfaces.
- Media display.
- Social links.
- Loyalty content.
- Section animations.

This separation supports maintenance
and future feature development.

## Branding and Visual Identity

The homepage uses the restaurant's
established visual identity.

### Brand Name

Fin & Feathers Las Vegas

### Primary Slogan

ELEVATED DINING MEETS SOUTHERN SOUL

### Supporting Message

Every dish crafted with fresh ingredients
and genuine hospitality.

### Brand Color

The established primary red is:

    #ea1b24

This color is used in navigation
and primary action styling.

### Background Presentation

The established homepage design uses:

- A black base background.
- A desktop background image.
- A mobile background image.
- A semi-transparent background layer.

Previously established assets include:

    /img/fin-feathers-bg-mobile.jpg
    /img/fin-feathers-bg-desktop.jpg

The established background opacity
is approximately 50%.

Current styling and asset usage
require verification.

## Header and Navigation

The website includes a sticky header.

The header provides access to
primary restaurant services.

### Desktop Navigation

The established desktop navigation includes:

- FULL MENU.
- MAKE A RESERVATION.
- ORDER ONLINE.
- GET DIRECTIONS.

The navigation is aligned toward
the right side of the header.

### Mobile Navigation

The mobile header uses:

- Restaurant branding.
- The primary slogan.
- A navigation menu control.

The established mobile header logo asset is:

    fin-feathers-lv-logo-500.png

The exact current logo placement,
dimensions, and menu behavior
require verification.

### Header Styling

The established design uses:

- Primary red background.
- Approximately 40% background opacity.
- White navigation text.
- Responsive navigation behavior.

The dropdown background follows
the established header styling.

### Navigation Requirements

Navigation must:

- Work on mobile and desktop.
- Provide accessible controls.
- Preserve keyboard usability.
- Open the correct destinations.
- Avoid blocking page content.
- Remain usable while scrolling.

## Hero Section

The hero introduces the restaurant
and provides its primary branding.

### Restaurant Logo

Previously established logo assets include:

    /img/fin-feathers-lv-logo-500.png
    /img/fin-feathers-lv-logo-1000.png

The smaller asset is intended
for mobile presentation.

The larger asset is intended
for desktop presentation.

### Logo Presentation

The established design includes:

- Prominent centered branding.
- Responsive logo sizing.
- A neon-inspired entrance effect.
- A stable final logo appearance.

The exact animation implementation
is documented separately.

### Slogan

The primary slogan is:

    ELEVATED DINING MEETS SOUTHERN SOUL

The supporting message is:

    Every dish crafted with fresh ingredients
    and genuine hospitality.

The text is centered within
the hero presentation.

### Hero Layout

The desktop hero layout was designed
to coordinate branding with adjacent
media presentation.

The mobile layout prioritizes
vertical readability and touch access.

Exact grid and container dimensions
require source verification.

## Primary Actions

The homepage includes four
primary customer action buttons.

### FULL MENU

Opens the restaurant's
menu presentation.

### RESERVATIONS

Opens the reservation request interface.

The reservation workflow prepares
an SMS request.

It does not automatically confirm
a restaurant reservation.

### ORDER ONLINE

Opens the restaurant's external
online ordering destination.

The established ordering service
is Toast.

The current destination requires
verification.

### LEAVE A REVIEW

Opens the restaurant's
external review destination.

The established destination uses
Google Maps.

The current URL requires verification.

### Button Layout

The established responsive design uses:

- Four equal-width buttons on desktop.
- A two-column, two-row layout on mobile.

### Button Styling

The established styling includes:

- Primary red backgrounds.
- Rounded rectangular controls.
- Approximately 60% default opacity.
- Stronger opacity on hover.

Current CSS behavior must be verified.

## Virtual Tour

The homepage includes
a virtual tour presentation.

### Purpose

The virtual tour allows visitors
to preview the restaurant environment.

### Established Behavior

The virtual tour uses:

- A promotional image.
- A heading above the image.
- A modal presentation.
- Embedded external content.

The established heading is:

    TAKE A VIRTUAL TOUR

### Responsive Layout

The desktop presentation is positioned
alongside the hero content.

The established desktop maximum
media width was approximately 500px.

The mobile presentation appears
below the hero content.

The established mobile maximum
width was approximately 300px.

The embedded experience was designed
around a portrait 9:16 presentation.

Exact dimensions require verification.

### Operational Requirements

The virtual tour should:

- Open reliably.
- Display the intended content.
- Provide a visible close control.
- Support keyboard interaction.
- Remain usable on mobile devices.
- Handle unavailable external content.

## Food Video Presentation

The homepage includes a food video
featuring a ribeye presentation.

The established component is:

    RibeyeVideo

### Purpose

The video highlights the restaurant's
food presentation and dining experience.

### Established Implementation

The original implementation uses:

- An MP4 video.
- A cover image.
- Supabase media storage.
- Native browser video controls.

The original video size was
approximately 19 MB.

Current media paths and file sizes
require verification.

### Video Requirements

The video should:

- Load reliably.
- Provide appropriate controls.
- Display a useful poster image.
- Support mobile playback.
- Avoid unnecessary layout shifts.
- Respect browser playback restrictions.
- Provide an accessible description
  where appropriate.

### Performance Considerations

Video performance should be reviewed
for mobile network conditions.

Potential optimizations include:

- Appropriate preload behavior.
- Optimized video encoding.
- Poster image optimization.
- Lazy loading where appropriate.

Any optimization must preserve
the intended user experience.

## Image Gallery

The homepage includes an
interactive image gallery.

### Established Functionality

The gallery supports:

- Previous and next navigation.
- Image indicators.
- Image selection.
- Full-size image presentation.
- Modal viewing.

### Original Image Assets

The established gallery assets include:

    gallery-pic-01.jpg
    gallery-pic-02.jpg
    gallery-pic-03.jpg
    gallery-pic-04.jpg
    gallery-pic-05.jpg
    gallery-pic-06.jpg

The current image source and
storage configuration require verification.

### Future Management

A future manager interface may support:

- Uploading images.
- Replacing images.
- Reordering images.
- Hiding images.
- Removing images.

These administrative capabilities
remain planned.

## Social Media and Reviews

The homepage includes social
media and review destinations.

### Social Platforms

Established social links include:

- Facebook.
- Instagram.

### Customer Reviews

The primary review action
uses a Google Maps destination.

### Community Check-In

The established website design
includes a community check-in
experience presented in a modal.

The current destination and
embedding behavior require verification.

### Link Requirements

External links should:

- Open the intended destination.
- Use safe link attributes where applicable.
- Provide accessible labels.
- Work on mobile devices.
- Avoid exposing private configuration.

## Merchandise Promotion

The homepage includes a
merchandise promotional section.

### Existing Experience

The established implementation uses:

- A promotional image.
- A merchandise modal.
- An external storefront.

The original promotional image is:

    fin-feathers-merch-thumb.png

### Future Commerce

Potential future enhancements include:

- Native product catalog.
- Product variants.
- Inventory management.
- Shopping cart.
- Checkout.
- Payment processing.
- Order management.

These capabilities remain
under evaluation.

## Loyalty Program

The homepage includes an
F&F FAM CLUB presentation.

### Purpose

The loyalty section introduces
the restaurant's customer
engagement program.

### Existing Functionality

The website includes a
loyalty program component.

The current enrollment experience
and external service dependencies
require verification.

### Future Management

Potential enhancements include:

- Loyalty content administration.
- Enrollment management.
- Promotional communications.
- Member-facing improvements.

These features require further
requirements and approval.

## Careers, Contact, and Events

The homepage includes content
related to restaurant operations
and customer communication.

### Careers

The careers section may provide
employment information and
application destinations.

### Contact

The contact section provides
restaurant contact information
or contact actions.

### Events

The events section may provide
event-related information
or inquiry options.

The current fields, links,
and submission behavior
require source verification.

## Responsive Design

The website follows a
mobile-first design approach.

### Mobile

The mobile layout prioritizes:

- Readable branding.
- Compact navigation.
- Touch-friendly controls.
- Vertical content organization.
- Responsive media.
- Accessible modal interfaces.

### Tablet

Tablet layouts should adapt
spacing, columns, and media
to available screen width.

### Desktop

The desktop layout supports:

- Wider content containers.
- Horizontal navigation.
- Multi-column hero presentation.
- Side-by-side media placement.
- Larger branding assets.

### Responsive Verification

Testing should include:

- Narrow mobile screens.
- Standard mobile screens.
- Tablet widths.
- Desktop widths.
- Landscape orientation.
- Browser zoom.

## Animations and Accessibility

The homepage includes
custom entrance animations.

### Established Effects

- Neon logo flicker.
- Header fade-in.
- Slogan reveal.
- Staggered button entrances.
- Media entrance effects.
- Scroll-triggered section reveals.

### Accessibility

The established design includes
support for reduced-motion preferences.

The application should respect:

    prefers-reduced-motion

Animations should not prevent
access to content or controls.

### Detailed Documentation

Animation timing, keyframes,
scroll observer behavior,
and responsive differences
are documented in:

[Homepage Animations](animations.md)

## Content and Media Management

Homepage content currently comes
from a combination of:

- Application source code.
- Static public assets.
- Supabase-hosted media.
- External service destinations.

The precise source for each
homepage section must be verified.

### Future Administrative Management

Planned improvements include:

- Gallery management.
- Specials management.
- Loyalty content management.
- Merchandise presentation management.

Administrative editing must
enforce manager authorization.

## Testing and Verification

The homepage testing checklist includes:

### Branding

- Verify logo assets.
- Verify slogan text.
- Verify brand colors.
- Verify background images.

### Navigation

- Verify desktop navigation.
- Verify mobile navigation.
- Verify menu controls.
- Verify sticky header behavior.

### Primary Actions

- Open FULL MENU.
- Open RESERVATIONS.
- Test ORDER ONLINE.
- Test LEAVE A REVIEW.

### Media

- Open the virtual tour.
- Play the food video.
- Navigate gallery images.
- Open gallery image modal.
- Open merchandise promotion.

### Responsive Behavior

- Test mobile.
- Test tablet.
- Test desktop.
- Test landscape layouts.

### Accessibility

- Verify keyboard navigation.
- Verify visible focus states.
- Verify modal dismissal.
- Verify reduced-motion behavior.
- Verify accessible media controls.

### Performance

- Review image loading.
- Review video loading.
- Check layout stability.
- Inspect browser console errors.

## Implementation Status

| Capability | Status |
|---|---|
| Public homepage | Implemented |
| Mobile-first layout | Implemented |
| Restaurant branding | Implemented |
| Responsive logo presentation | Implemented |
| Sticky navigation | Implemented |
| Primary action buttons | Implemented |
| Restaurant menu access | Implemented |
| Reservation form access | Implemented |
| External online ordering | Implemented; link verification pending |
| Review link | Implemented; link verification pending |
| Virtual tour | Implemented |
| Food video | Implemented |
| Image gallery | Implemented |
| Social media links | Implemented |
| Merchandise promotion | Implemented |
| Loyalty program presentation | Implemented |
| Careers, contact, and events | Implemented |
| Homepage animations | Implemented |
| Reduced-motion support | Implemented; verification pending |
| Manager-controlled gallery | Planned |
| Manager-controlled specials | Planned |
| Manager-controlled loyalty content | Planned |
| Native merchandise commerce | Under Evaluation |

## Related Documentation

- [Website Overview](README.md)
- [Menu System](menu-system.md)
- [Reservation Form](reservation-form.md)
- [Animations](animations.md)
- [F&F FAM CLUB](ff-fam-club/README.md)
- [SPECIALS](specials/README.md)
- [GALLERY](gallery/README.md)
- [MERCH](merch/README.md)
- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Project Overview](../01-project-overview/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Website Overview](README.md)
