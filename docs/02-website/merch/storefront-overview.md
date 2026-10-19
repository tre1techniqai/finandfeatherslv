# MERCH — Storefront Overview

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Existing merchandise entry point implemented; native commerce experience planned or under evaluation

**Feature:** Merchandise Storefront

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Storefront Vision](#storefront-vision)
3. [Current Implementation](#current-implementation)
4. [Existing Merchandise Entry Point](#existing-merchandise-entry-point)
5. [Proposed Storefront Architecture](#proposed-storefront-architecture)
6. [Customer Shopping Experience](#customer-shopping-experience)
7. [Product Catalog Presentation](#product-catalog-presentation)
8. [Product Detail Experience](#product-detail-experience)
9. [Product Variants and Availability](#product-variants-and-availability)
10. [Shopping Cart Integration](#shopping-cart-integration)
11. [Checkout and Payment Boundaries](#checkout-and-payment-boundaries)
12. [External Commerce Integration](#external-commerce-integration)
13. [Branding and Responsive Design](#branding-and-responsive-design)
14. [Accessibility and Performance](#accessibility-and-performance)
15. [Manager Administration](#manager-administration)
16. [Security and Customer Privacy](#security-and-customer-privacy)
17. [Operational Considerations](#operational-considerations)
18. [Testing and Verification](#testing-and-verification)
19. [Implementation Status](#implementation-status)
20. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the
Fin & Feathers Las Vegas
MERCH storefront experience.

It distinguishes between
the existing merchandise
entry point on the website
and potential future
native commerce capabilities.

The documentation covers:

- Merchandise discovery.
- Existing external storefront access.
- Product catalog presentation.
- Product detail pages.
- Product variants.
- Shopping cart integration.
- Checkout architecture.
- Customer experience.
- Administrative management.
- Security and privacy.

## Storefront Vision

The MERCH storefront is intended
to extend the restaurant brand
through approved merchandise.

### Business Objectives

- Increase merchandise visibility.
- Strengthen brand recognition.
- Provide convenient shopping.
- Support mobile customers.
- Simplify product updates.
- Enable future commerce growth.

### Customer Experience

Customers should be able
to discover merchandise
without unnecessary
navigation complexity.

### Long-Term Direction

The project may eventually
support a more integrated
shopping experience.

The final commerce platform
has not been selected.

## Current Implementation

**Status:** Existing entry point implemented

The website includes
a merchandise section.

### Existing Asset

Established merchandise
thumbnail:

    fin-feathers-merch-thumb.png

### Existing Interaction

The merchandise image
opens an external
merchandise website
through a modal iframe.

### Current Architecture

The website functions
as an entry point
to an external
merchandise experience.

### Verification Requirement

The current component,
external destination,
iframe behavior,
and mobile presentation
should be inspected
before changes are made.

### Not Yet Established

The project has not
established a verified
native implementation of:

- Product catalog management.
- Product detail pages.
- Product variants.
- Shopping cart.
- Native checkout.
- Payment processing.
- Inventory synchronization.
- Order management.

These capabilities remain
planned or under evaluation.

## Existing Merchandise Entry Point

The existing merchandise
section provides customers
with a direct way to
explore branded products.

### Homepage Placement

The entry point is
part of the public
website experience.

### Thumbnail Presentation

The merchandise thumbnail
acts as the primary
visual interaction.

### Modal Behavior

The current implementation
opens an external storefront
inside a modal iframe.

### External Dependencies

The shopping experience
depends on the external
merchandise provider.

### Iframe Compatibility

The external provider
must permit iframe
embedding for this
experience to work.

### Fallback Requirement

If iframe embedding
fails or is blocked,
customers should have
a reliable way to
open the storefront
directly.

The current fallback
behavior requires
source verification.

## Proposed Storefront Architecture

**Status:** Under Evaluation

Several architectures
may support future
merchandise sales.

### Option A — External Storefront

Continue using
an external commerce
provider.

The restaurant website
acts as a branded
entry point.

### Option B — Embedded Storefront

Embed supported
commerce functionality
inside the website.

This depends on
provider capabilities
and security requirements.

### Option C — Native Storefront

Develop native
product browsing
and cart interfaces.

Checkout and payments
would still require
an approved commerce
and payment architecture.

### Platform Selection

The final approach
must be evaluated
for cost, maintenance,
security, and
operational complexity.

## Customer Shopping Experience

**Status:** Planned

A future storefront
may provide a more
integrated shopping journey.

### Proposed Journey

1. Customer opens MERCH.
2. Customer browses products.
3. Customer selects a product.
4. Customer reviews details.
5. Customer selects available options.
6. Customer adds an item to the cart.
7. Customer reviews the cart.
8. Customer proceeds to checkout.
9. Customer receives confirmation
   from the approved commerce system.

### Guest Checkout

Whether customers
must create an account
requires a business decision.

### Mobile Experience

The shopping journey
should prioritize
mobile usability.

### Customer Confidence

Pricing, availability,
shipping, and return
information must be clear.

## Product Catalog Presentation

**Status:** Planned

A future catalog
may display approved
merchandise products.

### Potential Product Information

- Product name.
- Product image.
- Price.
- Short description.
- Availability.
- Product category.
- Available variants.

### Product Categories

Merchandise categories
must be defined
from approved inventory.

Do not assume
specific products
or categories exist.

### Product Images

Images should be
approved for public use.

### Sorting and Filtering

Potential capabilities include:

- Category filtering.
- Price sorting.
- Availability filtering.
- Featured products.

These require
separate approval.

### Empty Catalog

The storefront should
handle a catalog
with no available products.

## Product Detail Experience

**Status:** Planned

A future product detail
view may provide
additional information.

### Potential Content

- Product name.
- Product photographs.
- Description.
- Price.
- Available variants.
- Stock availability.
- Shipping information.
- Return information.

### Image Gallery

Product images
may require multiple
views of the item.

### Pricing Accuracy

Displayed prices
must match the
approved commerce system.

### Product Restrictions

Any product-specific
restrictions must be
clearly communicated.

### Add to Cart

The customer should
be able to select
valid product options
before adding the item.

## Product Variants and Availability

**Status:** Planned

Merchandise may require
variant selection.

### Potential Variants

Depending on approved
products, variants
may include:

- Size.
- Color.
- Style.

These are examples,
not confirmed
inventory attributes.

### Variant Pricing

Different variants
may have different prices.

### Variant Availability

Availability should
reflect the authoritative
inventory system.

### Out-of-Stock Items

Customers should not
be able to purchase
unavailable variants.

### Inventory Source

The project must determine
which platform owns
merchandise inventory.

### Overselling Protection

Checkout must revalidate
availability through
the approved provider.

## Shopping Cart Integration

**Status:** Planned

A future shopping cart
may support multiple
merchandise items.

### Potential Capabilities

- Add item.
- Remove item.
- Update quantity.
- Select variants.
- View subtotal.
- Proceed to checkout.

### Cart Persistence

The project must decide
whether carts persist
between sessions.

### Price Validation

Cart prices must be
validated against
the authoritative
commerce system.

### Inventory Validation

Availability should
be checked before
order submission.

### Cart Ownership

The chosen platform
must define how
cart data is stored
and managed.

### Related Documentation

Detailed cart behavior
is documented in:

    shopping-cart.md

## Checkout and Payment Boundaries

**Status:** Under Evaluation

Checkout architecture
requires careful selection.

### External Checkout

A third-party provider
may handle checkout
and payment collection.

### Hosted Checkout

Customers may be redirected
to a secure hosted
checkout experience.

### Native Checkout

A more integrated
checkout interface
may be possible
depending on the
chosen platform.

### Payment Security

The restaurant website
must not collect
or store raw payment
card information
without an appropriately
designed and compliant
payment environment.

### Final Decision

The payment provider,
checkout flow,
and compliance scope
remain under evaluation.

### Payment Confirmation

An order must not
be considered paid
solely because a customer
reaches a confirmation
screen without verified
provider confirmation.

## External Commerce Integration

**Status:** Existing external storefront; future integration under evaluation

The current merchandise
experience depends on
an external destination.

### Integration Considerations

- Provider availability.
- Iframe compatibility.
- Mobile responsiveness.
- Branding consistency.
- Product synchronization.
- Checkout behavior.
- Payment processing.
- Shipping configuration.
- Order notifications.

### Cross-Origin Restrictions

Browser security rules
may limit interaction
with embedded
third-party pages.

### Provider Changes

The website must
handle changes
to external storefront
URLs or embedding policies.

### Integration Strategy

Any future integration
must use supported
provider capabilities.

### Evaluation

Platform options,
costs, and operational
requirements are covered
in the broader
MERCH commerce documentation.

## Branding and Responsive Design

The storefront should
follow the established
Fin & Feathers
visual identity.

### Branding Objectives

- Consistent logo usage.
- Approved color palette.
- Clear product photography.
- Readable typography.
- Consistent navigation.

### Mobile-First Design

The interface should
work well on
smaller screens.

### Desktop Design

Larger layouts may
show additional
product information
and multiple columns.

### Touch Interactions

Controls should
be easy to use
on mobile devices.

### External Storefront Limitations

The restaurant may
have limited control
over an external
provider's interface.

## Accessibility and Performance

The shopping experience
should be accessible
and performant.

### Accessibility

Potential requirements:

- Keyboard navigation.
- Accessible controls.
- Meaningful image text.
- Clear form labels.
- Readable error messages.
- Logical focus order.

### Product Images

Images should be
optimized for their
display context.

### Page Performance

Avoid unnecessarily
large media downloads.

### Loading States

Customers should
receive clear feedback
while product data
is loading.

### Failure States

Unavailable products
or provider errors
should not cause
the entire website
to fail.

## Manager Administration

**Status:** Planned

The project may eventually
provide manager controls
for merchandise.

### Potential Capabilities

- View products.
- Add products.
- Edit product details.
- Manage images.
- Manage variants.
- Update availability.
- Review orders.
- Review inventory.

### Administrative Ownership

The project must determine
whether management
occurs in:

- The external commerce platform.
- The restaurant admin dashboard.
- A combination of both.

### Existing Authorization

The website uses:

    src/lib/auth/require-manager.ts

### Security

Any native administrative
actions must enforce
authorization on the server.

### Inventory Authority

The approved commerce
platform should remain
the authoritative source
for inventory unless
a different architecture
is explicitly approved.

## Security and Customer Privacy

Commerce introduces
additional security
and privacy requirements.

### Payment Data

Raw payment card
details should not
be handled by
ordinary website
application code.

### Customer Information

Only necessary
customer information
should be collected.

### Order Records

Order data must
be protected by
appropriate access controls.

### Administrative Access

Only authorized staff
should access
protected commerce data.

### External Providers

Provider agreements
and data-handling
practices require review.

### Credentials

Private API keys
and service credentials
must remain server-side
and outside Git history.

### Privacy Documentation

Customer-facing policies
must accurately describe
the implemented
commerce experience.

## Operational Considerations

The restaurant must
define responsibility
for commerce operations.

### Product Maintenance

Who updates product
names, prices,
and descriptions?

### Inventory Management

Who maintains
stock availability?

### Order Fulfillment

Who receives and
processes orders?

### Shipping

Which provider or
staff workflow
handles shipping?

### Returns

What return and
refund policies apply?

### Customer Support

Who responds to
merchandise inquiries?

### Reporting

What sales and
inventory reporting
is required?

### Operational Approval

These responsibilities
must be defined
before launching
native commerce.

## Testing and Verification

### Existing Storefront Entry

- Verify merchandise thumbnail.
- Verify click behavior.
- Verify modal presentation.
- Verify external storefront loading.
- Verify mobile compatibility.
- Verify desktop compatibility.
- Verify modal dismissal.
- Verify fallback behavior.

### Product Catalog

If implemented:

- Verify approved products.
- Verify prices.
- Verify product images.
- Verify categories.
- Verify availability.
- Verify empty states.

### Product Details

If implemented:

- Verify descriptions.
- Verify variants.
- Verify prices.
- Verify image presentation.
- Verify stock restrictions.

### Shopping Cart

If implemented:

- Add items.
- Remove items.
- Change quantities.
- Change variants.
- Revalidate prices.
- Revalidate inventory.

### Checkout

If implemented:

- Verify provider handoff.
- Verify successful checkout.
- Verify failed checkout.
- Verify cancellation.
- Verify order confirmation.
- Verify payment status handling.

### Security

- Verify manager authorization.
- Verify API credential protection.
- Verify customer data protection.
- Verify payment boundaries.
- Verify provider error handling.

## Implementation Status

| Capability | Status |
|---|---|
| Homepage merchandise entry point | Implemented |
| Merchandise thumbnail | Implemented |
| External storefront modal iframe | Implemented |
| Existing external storefront destination | Implemented; current URL requires verification |
| Native product catalog | Planned |
| Product detail views | Planned |
| Product variant selection | Planned |
| Native shopping cart | Planned |
| Cart persistence | Under Evaluation |
| Native checkout integration | Under Evaluation |
| Payment provider selection | Under Evaluation |
| Inventory synchronization | Under Evaluation |
| Merchandise admin management | Planned |
| Order management | Under Evaluation |
| Shipping integration | Under Evaluation |
| Commerce platform selection | Under Evaluation |
| End-to-end native commerce testing | Pending implementation |

## Related Documentation

- [MERCH Overview](README.md)
- [Product Display](product-display.md)
- [Shopping Cart](shopping-cart.md)
- [Website Overview](../README.md)
- [Homepage](../homepage.md)
- [Admin Dashboard](../../04-admin-dashboard/README.md)
- [MERCH Admin Category](../../04-admin-dashboard/merch-management.md)
- [MERCH Commerce Overview](../../11-merch-commerce/README.md)
- [Commerce Architecture](../../11-merch-commerce/commerce-overview.md)
- [Platform Evaluation](../../11-merch-commerce/platform-evaluation.md)
- [Payment Processing](../../11-merch-commerce/payment-processing.md)
- [Master Documentation Index](../../README.md)

---

[Back to MERCH Overview](README.md)
