# MERCH — Product Display

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Native product display planned; existing external merchandise entry point implemented

**Feature:** Merchandise Product Presentation

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Product Display Objectives](#product-display-objectives)
3. [Current Implementation](#current-implementation)
4. [Proposed Product Display Architecture](#proposed-product-display-architecture)
5. [Product Catalog Layout](#product-catalog-layout)
6. [Product Cards](#product-cards)
7. [Product Detail Presentation](#product-detail-presentation)
8. [Product Images](#product-images)
9. [Product Information](#product-information)
10. [Product Pricing](#product-pricing)
11. [Product Variants](#product-variants)
12. [Inventory and Availability](#inventory-and-availability)
13. [Product Categories and Filtering](#product-categories-and-filtering)
14. [Add-to-Cart Interaction](#add-to-cart-interaction)
15. [Responsive Design](#responsive-design)
16. [Accessibility](#accessibility)
17. [Performance and Loading](#performance-and-loading)
18. [Manager Content Controls](#manager-content-controls)
19. [Security and Data Integrity](#security-and-data-integrity)
20. [Testing and Verification](#testing-and-verification)
21. [Implementation Status](#implementation-status)
22. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed
product presentation requirements
for the Fin & Feathers Las Vegas
MERCH storefront.

It describes how merchandise
products may eventually appear
within an integrated shopping
experience.

This document does not establish
that native merchandise product
pages currently exist.

The final implementation depends
on the selected commerce platform.

## Product Display Objectives

The proposed product experience
should help customers:

- Discover available merchandise.
- Understand product details.
- Review approved pricing.
- View product photographs.
- Select available variants.
- Identify stock availability.
- Add eligible products to a cart.
- Proceed toward secure checkout.

### Brand Presentation

Merchandise should reinforce
the restaurant's established
visual identity.

### Business Accuracy

Product information must reflect
approved merchandise inventory.

### Customer Clarity

The interface should avoid
ambiguous pricing, availability,
or product-option information.

## Current Implementation

**Status:** Existing entry point implemented

The website currently includes
a merchandise section.

Established thumbnail:

    fin-feathers-merch-thumb.png

### Existing Behavior

Selecting the merchandise
thumbnail opens an external
storefront through a
modal iframe.

### Current Product Display

The existing external
commerce provider controls
its own product presentation.

### Not Yet Established

The project has not
established verified native:

- Product listing pages.
- Product detail pages.
- Variant selectors.
- Inventory indicators.
- Product-specific carts.
- Native checkout.

These remain planned
or under evaluation.

### Source Verification

The existing merchandise
component and external
storefront destination
should be inspected
before implementation.

## Proposed Product Display Architecture

**Status:** Under Evaluation

The product display
architecture depends on
the selected commerce platform.

### External Platform Rendering

The website may continue
sending customers to
an external storefront.

### Embedded Product Experience

Supported provider components
may be embedded in the
restaurant website.

### Native Product Interface

The website may render
product data through
custom Next.js components.

### Authoritative Product Data

Product details must come
from an approved source.

Potential sources include:

- A connected commerce platform.
- An approved product database.
- A supported commerce API.

### Data Ownership

The project must determine
which system owns:

- Product identifiers.
- Product descriptions.
- Prices.
- Variants.
- Inventory.
- Publication status.

### Integration Constraint

A custom interface must
not imply that ordering
or payment functionality
exists before the supporting
integration is operational.

## Product Catalog Layout

**Status:** Planned

A future catalog may
display available products
in a responsive grid.

### Catalog Information

The catalog may present:

- Product image.
- Product name.
- Starting or standard price.
- Availability.
- Short description.
- Product category.

### Product Ordering

The business may define
a preferred display order.

### Featured Products

A featured-product option
may be considered.

### Empty Catalog

If no products are
available, the interface
should display a clear
and appropriate message.

### Product Selection

Selecting a product
may open a dedicated
product detail view.

### Layout Consistency

Product cards should
use consistent spacing,
image presentation,
and typography.

## Product Cards

**Status:** Planned

Product cards should provide
a concise product summary.

### Potential Card Elements

- Product image.
- Product name.
- Price.
- Availability indicator.
- Product detail action.

### Image Presentation

Images should maintain
consistent proportions
without unacceptable cropping.

### Product Names

Names should remain readable
on narrow screens.

### Price Presentation

Prices must reflect
the authoritative
commerce data.

### Unavailable Products

Out-of-stock items
should not appear
purchasable when
inventory is unavailable.

### Interactive Behavior

The entire card or
a clearly labeled control
may open product details.

### Accessibility

Product actions should
be keyboard accessible
and clearly labeled.

## Product Detail Presentation

**Status:** Planned

A product detail view
may provide the information
needed before purchase.

### Potential Content

- Product title.
- Product description.
- Product photographs.
- Current price.
- Variant selectors.
- Stock availability.
- Quantity control.
- Add-to-cart action.
- Shipping information.
- Return information.

### Product Description

Descriptions should
accurately represent
the approved product.

### Variant Selection

Required options must
be selected before
cart submission.

### Price Updates

Changing variants
may change the
displayed price.

### Availability Updates

Changing variants
may change the
availability state.

### Product Restrictions

Any relevant purchase
restrictions should
be displayed clearly.

## Product Images

**Status:** Planned

Product photography is
a primary part of
the shopping experience.

### Image Requirements

Images should:

- Accurately represent products.
- Use approved branding.
- Be sufficiently detailed.
- Load efficiently.
- Display responsively.

### Multiple Views

Products may benefit from:

- Front view.
- Back view.
- Detail view.
- Alternate angle.

These are examples,
not mandatory product assets.

### Image Gallery

A product detail page
may support multiple
product photographs.

### Alternative Text

Product images should
have meaningful
alternative text.

### Image Storage

The final storage location
depends on the selected
commerce architecture.

### Image Ownership

The restaurant must
have appropriate rights
to use published images.

### Broken Images

The interface should
handle unavailable
image resources gracefully.

## Product Information

**Status:** Planned

A future product record
may contain:

- Product identifier.
- Product name.
- Description.
- Category.
- Image references.
- Price information.
- Variant definitions.
- Availability.
- Publication status.

These are conceptual fields,
not confirmed existing
database columns.

### Accurate Descriptions

Product descriptions
must be approved
and current.

### Product Attributes

Attributes should reflect
the actual merchandise.

### Product Identifiers

Stable identifiers
should be used
for commerce integration.

### Public Information

Internal administrative
notes must not be
included in public
product responses.

### Updates

Product changes should
be reflected consistently
across catalog, details,
cart, and checkout.

## Product Pricing

**Status:** Planned

Pricing must be consistent
with the authoritative
commerce platform.

### Base Price

Display the approved
base product price.

### Variant Price

A selected variant
may affect the price.

### Sale Price

Promotional pricing
may be supported
if the commerce platform
and business rules permit it.

### Price Formatting

Currency presentation
should be consistent.

### Taxes

The storefront must
not misrepresent
whether taxes are included.

### Shipping Charges

Shipping costs should
be disclosed according
to the approved
checkout experience.

### Price Validation

The displayed price
must not be trusted
as the final authority
for order submission.

### Checkout Consistency

The commerce provider
must verify the final
chargeable amount.

## Product Variants

**Status:** Planned

Some merchandise products
may have selectable variants.

### Potential Variant Types

- Size.
- Color.
- Style.

These are illustrative,
not confirmed inventory fields.

### Variant Selection

Customers should be
able to choose
available combinations.

### Invalid Combinations

Unsupported combinations
must not be purchasable.

### Variant-Specific Pricing

Prices may differ
between variants.

### Variant-Specific Inventory

Stock availability
may differ by variant.

### Default Selection

The interface must define
whether a default variant
is selected automatically.

### Selection Feedback

The customer should
see the currently
selected options.

## Inventory and Availability

**Status:** Planned

Product availability
must reflect the
approved inventory system.

### Available

The selected product
or variant may
be purchased.

### Out of Stock

The selected product
or variant cannot
currently be purchased.

### Unpublished

An unpublished product
should not appear
in the public catalog.

### Limited Inventory

The business may
choose to display
limited-stock messaging.

### Inventory Authority

The selected commerce
platform should be
the inventory authority
unless another architecture
is explicitly approved.

### Checkout Revalidation

Inventory must be
revalidated before
an order is accepted.

### Overselling Prevention

The system should
not rely solely
on cached product
availability.

## Product Categories and Filtering

**Status:** Under Evaluation

A future storefront
may organize products
into approved categories.

### Category Definition

Categories must be
based on actual
merchandise inventory.

### Potential Filters

- Category.
- Availability.
- Price range.
- Product attributes.

### Sorting

Potential sorting options:

- Featured order.
- Price.
- Product name.
- Newest products.

### Search

Product search may
be considered if
catalog size warrants it.

### Empty Results

Filtering should
provide a useful
empty-results message.

### Scope

Do not introduce
unapproved merchandise
categories or products.

## Add-to-Cart Interaction

**Status:** Planned

A future product detail
view may include
an Add to Cart action.

### Required Validation

Before adding an item,
the system should verify:

- Product identifier.
- Selected variants.
- Requested quantity.
- Current availability.
- Valid cart configuration.

### User Feedback

The interface should
indicate whether
the action succeeded.

### Invalid Selection

Customers should
receive clear feedback
when required options
are missing.

### Quantity Rules

The system must define
per-item quantity limits.

### Cart Updates

Adding a product
should update the
cart consistently.

### Commerce Authority

Final prices and
availability must be
validated by the
approved commerce system.

## Responsive Design

The storefront should
follow a mobile-first
design approach.

### Mobile Catalog

Product cards should
remain readable
on narrow screens.

### Desktop Catalog

Larger screens may
support multi-column
product layouts.

### Product Detail Layout

Product imagery and
purchase controls
should adapt to
screen width.

### Touch Targets

Variant selectors,
quantity controls,
and cart actions
should be touch friendly.

### Modal Behavior

If product details
use modals, their
focus and dismissal
behavior must be
accessible and predictable.

### External Provider Limits

Embedded or external
commerce experiences
may have styling
limitations outside
the restaurant's control.

## Accessibility

Product display
must support
accessible interaction.

### Keyboard Navigation

Customers should
be able to navigate
product controls
without a mouse.

### Labels

Variant selectors
and quantity controls
need clear labels.

### Image Descriptions

Product images
should have suitable
alternative text.

### Error Messaging

Validation errors
must be understandable
and associated with
relevant controls.

### Focus Management

Navigation and modal
transitions should
maintain logical focus.

### Color Contrast

Pricing and availability
must remain readable.

### Reduced Motion

Animations should
respect reduced-motion
preferences.

## Performance and Loading

Product interfaces
should remain responsive
under normal
network conditions.

### Image Optimization

Use appropriately
sized product images.

### Lazy Loading

Offscreen product images
may load later.

### Layout Stability

Reserve image space
to avoid unnecessary
layout shifts.

### Loading States

Show clear feedback
while product information
is loading.

### Failed Requests

Handle unavailable
commerce data gracefully.

### Caching

Product content
may be cached,
but pricing and
inventory must be
revalidated when required.

### Provider Availability

External service outages
should not break
unrelated website
functionality.

## Manager Content Controls

**Status:** Planned

Future product management
may occur through
the selected commerce
provider or a native
administrative interface.

### Potential Manager Actions

- Add products.
- Edit product names.
- Edit descriptions.
- Upload product images.
- Configure variants.
- Update prices.
- Update availability.
- Publish or hide products.

### Existing Manager Authorization

The website uses:

    src/lib/auth/require-manager.ts

### Administrative Security

Any native product
management actions
must verify authorization
on the server.

### Data Ownership

The project must avoid
conflicting updates
between multiple
product data systems.

### Auditability

Important product
changes should be
traceable where supported.

## Security and Data Integrity

Commerce product data
must be handled securely.

### Trusted Data

Do not trust
client-submitted prices
as authoritative.

### Product Identifiers

Validate identifiers
before retrieving
or modifying products.

### Inventory Integrity

Stock availability
must be verified
through the approved
inventory authority.

### Manager Authorization

Protect administrative
product changes.

### API Credentials

Private provider
credentials must remain
server-side.

### Customer Data

Product browsing
should not expose
private customer data.

### Error Handling

Internal provider
errors should not
expose credentials
or sensitive configuration.

## Testing and Verification

### Existing Merchandise Entry

- Verify thumbnail display.
- Verify external storefront opening.
- Verify mobile behavior.
- Verify desktop behavior.
- Verify fallback navigation.

### Product Catalog

If implemented:

- Verify product names.
- Verify approved descriptions.
- Verify product images.
- Verify pricing.
- Verify publication status.
- Verify empty states.

### Product Details

If implemented:

- Verify image galleries.
- Verify descriptions.
- Verify product attributes.
- Verify variant selectors.
- Verify availability.
- Verify responsive layouts.

### Pricing

- Verify base prices.
- Verify variant prices.
- Verify sale prices if supported.
- Verify currency formatting.
- Verify checkout price consistency.

### Cart Integration

- Verify valid additions.
- Reject missing variants.
- Reject invalid quantities.
- Reject unavailable products.
- Verify cart updates.

### Accessibility

- Verify keyboard access.
- Verify image descriptions.
- Verify form labels.
- Verify focus management.
- Verify readable error messages.

### Security

- Verify manager authorization.
- Verify product identifier validation.
- Verify price revalidation.
- Verify inventory revalidation.
- Verify credential protection.

## Implementation Status

| Capability | Status |
|---|---|
| Existing merchandise thumbnail | Implemented |
| External storefront iframe | Implemented |
| Native product catalog | Planned |
| Native product cards | Planned |
| Native product detail pages | Planned |
| Product image gallery | Planned |
| Product descriptions | Planned |
| Variant selectors | Planned |
| Variant-specific pricing | Planned |
| Inventory availability display | Planned |
| Product categories and filters | Under Evaluation |
| Product search | Under Evaluation |
| Add-to-cart interaction | Planned |
| Cart and checkout integration | Planned |
| Product management interface | Planned |
| Commerce platform selection | Under Evaluation |
| Native product display testing | Pending implementation |

## Related Documentation

- [MERCH Overview](README.md)
- [Storefront Overview](storefront-overview.md)
- [Shopping Cart](shopping-cart.md)
- [Website Overview](../README.md)
- [Homepage](../homepage.md)
- [Admin Dashboard](../../04-admin-dashboard/README.md)
- [MERCH Admin Category](../../04-admin-dashboard/merch-management.md)
- [MERCH Commerce Overview](../../11-merch-commerce/README.md)
- [Product Catalog](../../11-merch-commerce/product-catalog.md)
- [Inventory Management](../../11-merch-commerce/inventory-management.md)
- [Cart and Checkout](../../11-merch-commerce/cart-and-checkout.md)
- [Platform Evaluation](../../11-merch-commerce/platform-evaluation.md)
- [Master Documentation Index](../../README.md)

---

[Back to MERCH Overview](README.md)
