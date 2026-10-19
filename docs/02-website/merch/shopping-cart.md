# MERCH — Shopping Cart

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Planned; native merchandise shopping cart not yet implemented

**Feature:** Merchandise Shopping Cart

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Cart Objectives](#cart-objectives)
3. [Current Implementation](#current-implementation)
4. [Proposed Cart Architecture](#proposed-cart-architecture)
5. [Customer Cart Experience](#customer-cart-experience)
6. [Cart Data Model](#cart-data-model)
7. [Adding Products](#adding-products)
8. [Product Variants](#product-variants)
9. [Quantity Management](#quantity-management)
10. [Removing Products](#removing-products)
11. [Pricing and Totals](#pricing-and-totals)
12. [Inventory Validation](#inventory-validation)
13. [Cart Persistence](#cart-persistence)
14. [Checkout Handoff](#checkout-handoff)
15. [Payment and Order Confirmation](#payment-and-order-confirmation)
16. [Responsive Design and Accessibility](#responsive-design-and-accessibility)
17. [Security and Data Integrity](#security-and-data-integrity)
18. [Error Handling and Recovery](#error-handling-and-recovery)
19. [Operational Considerations](#operational-considerations)
20. [Testing and Verification](#testing-and-verification)
21. [Implementation Dependencies](#implementation-dependencies)
22. [Implementation Status](#implementation-status)
23. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed
customer-facing shopping cart
for the Fin & Feathers
Las Vegas MERCH storefront.

It describes how customers
may eventually select,
review, modify, and purchase
approved merchandise.

The document covers:

- Cart item management.
- Product variants.
- Quantities.
- Pricing.
- Inventory.
- Cart persistence.
- Checkout handoff.
- Payment confirmation.
- Security.
- Error recovery.

This document does not
establish that a native
shopping cart currently exists.

## Cart Objectives

The proposed cart should:

- Provide a clear shopping experience.
- Support multiple merchandise items.
- Preserve selected product variants.
- Allow quantity changes.
- Display accurate pricing.
- Prevent invalid purchases.
- Support secure checkout.
- Handle provider failures.
- Work on mobile and desktop.

### Customer Clarity

Customers should understand
which products and variants
they are preparing to purchase.

### Business Accuracy

Cart information must remain
consistent with the approved
commerce platform.

### Operational Reliability

The cart must not promise
pricing or inventory that
cannot be fulfilled.

## Current Implementation

**Status:** Native cart not implemented

The website currently
includes a merchandise
entry point.

Established thumbnail:

    fin-feathers-merch-thumb.png

### Existing Behavior

Selecting the merchandise
thumbnail opens an external
merchandise storefront
through a modal iframe.

### Existing Commerce Boundary

Any cart functionality
inside that external
storefront belongs to
the external provider.

### Not Yet Established

The restaurant website
has not established
verified native:

- Cart state.
- Cart item storage.
- Variant management.
- Quantity controls.
- Checkout sessions.
- Payment confirmation.
- Order creation.

### Future Development

A native cart requires
an approved commerce
architecture before
implementation.

## Proposed Cart Architecture

**Status:** Under Evaluation

The cart architecture
depends on the selected
commerce platform.

### Option A — Provider-Owned Cart

The external commerce
provider manages:

- Cart items.
- Quantities.
- Product variants.
- Pricing.
- Checkout.

The restaurant website
links or embeds
the provider experience.

### Option B — Provider API Cart

The website displays
a custom cart while
the commerce provider
maintains authoritative
cart and checkout data.

### Option C — Application Cart

The website manages
temporary cart state
and submits validated
items to an approved
commerce provider.

### Architecture Decision

The project must determine:

- Where cart state is stored.
- Who validates prices.
- Who validates inventory.
- Who creates orders.
- Who processes payments.
- How checkout sessions work.

### Preferred Principle

The selected commerce
provider should remain
authoritative for pricing,
inventory, and order
acceptance unless another
architecture is explicitly approved.

## Customer Cart Experience

**Status:** Planned

A future customer
may interact with
the cart through
the MERCH storefront.

### Proposed Journey

1. Browse merchandise.
2. Select a product.
3. Choose required variants.
4. Select quantity.
5. Add the item to the cart.
6. Review cart contents.
7. Update or remove items.
8. Review estimated totals.
9. Proceed to checkout.
10. Complete payment through
    the approved provider.

### Cart Entry Point

The storefront may display
a cart icon or
clearly labeled cart action.

### Cart Count

The interface may show
the number of items
currently in the cart.

### Empty Cart

An empty cart should
display a useful message
and a way to continue shopping.

### Cart Review

Customers should be able
to review their selections
before checkout.

## Cart Data Model

**Status:** Planned; schema pending

A future cart may contain:

- Cart identifier.
- Product identifier.
- Variant identifier.
- Quantity.
- Product display name.
- Product image reference.
- Price information.
- Cart creation timestamp.
- Last updated timestamp.

These are conceptual fields,
not verified database columns.

### Cart Items

Each cart item
represents a selected
product configuration.

### Product Identity

Use stable product
and variant identifiers.

### Display Snapshots

Product names and images
may be cached for
display purposes.

### Authoritative Values

Cached prices and
availability must not
be trusted as final
checkout values.

### Data Ownership

The selected commerce
platform must define
which cart fields
are authoritative.

## Adding Products

**Status:** Planned

Customers may eventually
add eligible merchandise
to the cart.

### Required Information

An add-to-cart action
may require:

- Product identifier.
- Variant identifier.
- Quantity.

### Validation

Before accepting an item,
the system should verify:

- Product exists.
- Product is published.
- Required variants are selected.
- Quantity is valid.
- Product is eligible for purchase.

### Duplicate Items

The system must decide
whether identical product
configurations merge
into one cart line.

### Success Feedback

The customer should
receive clear feedback
when an item is added.

### Failure Feedback

Invalid selections
must produce useful
error messages.

## Product Variants

**Status:** Planned

Some products may require
variant selection.

### Potential Variants

- Size.
- Color.
- Style.

These are examples,
not confirmed
inventory attributes.

### Variant Identity

Each purchasable
configuration should
have an appropriate
identifier.

### Variant Pricing

Different variants
may have different prices.

### Variant Inventory

Availability may vary
by selected configuration.

### Cart Display

The cart should show
the selected variants
for each item.

### Variant Changes

Changing a variant
may require a new
price and availability check.

### Invalid Combinations

Unsupported variant
combinations must not
be accepted.

## Quantity Management

**Status:** Planned

Customers should be
able to adjust quantities.

### Increasing Quantity

The system should verify
the requested quantity
is permitted.

### Decreasing Quantity

Customers should be
able to reduce
item quantities.

### Minimum Quantity

A cart line should
have a valid
minimum quantity.

### Maximum Quantity

The business or
commerce provider
may enforce purchase limits.

### Stock Restrictions

Requested quantities
must not exceed
available inventory.

### Recalculation

Changing quantity
should update
displayed totals.

### Save Feedback

Quantity changes
must not be reported
as saved until
the cart update succeeds.

## Removing Products

**Status:** Planned

Customers should be
able to remove
individual cart items.

### Remove Action

Each cart line
should provide
a clear removal control.

### Immediate Feedback

The cart should
update after
successful removal.

### Failed Removal

The interface should
restore or retain
the last confirmed state
when an operation fails.

### Empty State

Removing the final item
should display
the empty-cart experience.

### Undo

An undo action
may be evaluated
for usability.

## Pricing and Totals

**Status:** Planned

The cart should display
pricing clearly.

### Line Item Price

Each item should
show the approved
price for its
selected configuration.

### Quantity Subtotal

Line totals should
reflect selected quantities.

### Cart Subtotal

The cart may display
a subtotal before
taxes and shipping.

### Taxes

Tax calculation must
follow the approved
commerce platform
and applicable rules.

### Shipping

Shipping costs may
depend on destination,
items, and fulfillment method.

### Discounts

Discounts require
approved business
and platform rules.

### Estimated Totals

If taxes or shipping
are not yet known,
the interface must
clearly identify
totals as estimates.

### Final Price Authority

The checkout provider
must validate the
final chargeable amount.

### Price Changes

If a product price
changes before checkout,
the customer should
receive clear notice.

## Inventory Validation

**Status:** Planned

Inventory validation
is required to avoid
invalid purchases.

### Add-to-Cart Check

The system may check
availability when
an item is added.

### Cart Review Check

The cart should identify
items that become
unavailable.

### Checkout Check

Availability must
be revalidated before
order acceptance.

### Out-of-Stock Items

Unavailable items
should not proceed
to successful purchase.

### Quantity Limits

The system must reject
quantities exceeding
approved limits.

### Inventory Authority

The chosen commerce
platform should remain
the inventory authority
unless otherwise approved.

### Concurrent Purchases

The implementation
must account for
inventory changing
while multiple
customers shop.

## Cart Persistence

**Status:** Under Evaluation

The project must decide
whether carts persist
between visits.

### Session Cart

A cart may exist
only during the
current shopping session.

### Browser Persistence

A cart may be stored
locally for
returning visitors.

### Provider Persistence

A commerce provider
may maintain carts
using its own
session identifiers.

### Account-Based Cart

An authenticated
customer cart may
be considered later.

### Privacy

Cart persistence
must not expose
private customer
or payment information.

### Expiration

The system must define
when inactive carts
expire.

### Recovery

Customers may need
to recover a cart
after a page refresh
or temporary interruption.

## Checkout Handoff

**Status:** Under Evaluation

The cart must connect
to an approved
checkout system.

### Checkout Readiness

Before checkout,
the system should verify:

- Valid cart items.
- Required variants.
- Permitted quantities.
- Current product availability.
- Current pricing.

### Hosted Checkout

The customer may
be redirected to
a provider-hosted
checkout page.

### Embedded Checkout

An embedded checkout
may be possible
if supported by
the selected provider.

### Checkout Session

The provider may
create a checkout
session or equivalent
transaction object.

### Session Security

Checkout session
identifiers must be
handled securely.

### Checkout Failure

Customers should
receive clear feedback
if checkout cannot start.

### Checkout Cancellation

Returning from a
cancelled checkout
should not falsely
mark an order as paid.

## Payment and Order Confirmation

**Status:** Under Evaluation

The final payment
architecture has not
been selected.

### Payment Provider

An approved provider
must handle payment
processing.

### Sensitive Card Data

The ordinary website
application must not
store raw card
numbers or security codes.

### Payment Success

Payment success
must be verified
through the provider's
trusted confirmation mechanism.

### Browser Redirects

A successful browser
redirect alone must
not be treated
as proof of payment.

### Order Creation

The approved commerce
system must define
when an order
is officially created.

### Failed Payment

Failed payments must
not create
paid-order records.

### Duplicate Submissions

The integration should
prevent accidental
duplicate charges
and orders.

### Customer Confirmation

Confirmation messages
must reflect
verified order status.

## Responsive Design and Accessibility

The cart should follow
the website's
mobile-first design.

### Mobile Layout

The cart should provide:

- Readable item names.
- Clear variant information.
- Accessible quantity controls.
- Visible pricing.
- Easy removal.
- Clear checkout action.

### Desktop Layout

Larger screens may
provide a multi-column
cart summary.

### Keyboard Accessibility

Cart controls must
support keyboard interaction.

### Accessible Labels

Quantity and removal
controls should
have meaningful labels.

### Error Messaging

Errors should be
clear and associated
with affected items.

### Focus Management

Cart dialogs and
checkout transitions
should manage focus
appropriately.

### Reduced Motion

Cart animations should
respect reduced-motion
preferences.

## Security and Data Integrity

Commerce carts require
careful validation.

### Untrusted Client State

Browser cart values
must not be trusted
as authoritative.

### Price Manipulation

Client-submitted prices
must not determine
the final charge.

### Inventory Manipulation

Stock limits must
be enforced by
the authoritative system.

### Product Validation

Only valid and
published products
may be purchased.

### API Credentials

Private commerce
credentials must
remain server-side.

### Customer Privacy

Cart data should
not expose private
customer information.

### Session Protection

Cart and checkout
session identifiers
must be protected
against unauthorized use.

### Logging

Do not log
payment credentials
or sensitive customer data.

## Error Handling and Recovery

The cart should
handle failures
without misleading
the customer.

### Product Unavailable

Explain when an item
is no longer purchasable.

### Price Changed

Notify the customer
when the authoritative
price differs.

### Quantity Invalid

Explain applicable
quantity limits.

### Cart Update Failed

Retain or restore
the last confirmed
cart state.

### Network Failure

Provide a safe
retry path.

### Provider Unavailable

Explain when checkout
is temporarily unavailable.

### Expired Session

Handle expired carts
or checkout sessions
without assuming
an order was completed.

### Duplicate Action

Avoid duplicate
checkout submissions
when a customer
repeatedly selects
the checkout control.

## Operational Considerations

The restaurant must
define how merchandise
orders are managed.

### Inventory Ownership

Who maintains
merchandise stock?

### Price Updates

Who approves
price changes?

### Fulfillment

Who processes
completed orders?

### Shipping

Who handles
shipping and tracking?

### Refunds

Who handles
refund requests?

### Customer Support

Who responds to
cart and checkout
questions?

### Order Reconciliation

How are completed
payments matched
to accepted orders?

### Platform Responsibilities

The selected provider
must have clearly
defined responsibilities.

## Testing and Verification

### Cart Creation

- Add a valid product.
- Reject an invalid product.
- Reject an unpublished product.
- Verify selected variants.
- Verify initial quantity.

### Cart Updates

- Increase quantity.
- Decrease quantity.
- Remove an item.
- Remove the final item.
- Verify subtotal updates.
- Verify failed update recovery.

### Product Variants

- Select valid variants.
- Reject missing required variants.
- Reject invalid combinations.
- Verify variant-specific prices.
- Verify variant-specific inventory.

### Pricing

- Verify line totals.
- Verify cart subtotal.
- Verify price changes.
- Verify estimated taxes.
- Verify shipping disclosure.
- Verify final checkout pricing.

### Inventory

- Reject unavailable items.
- Reject excessive quantities.
- Verify checkout revalidation.
- Test concurrent stock changes.

### Persistence

If implemented:

- Refresh the page.
- Restore an active cart.
- Handle expired carts.
- Verify session isolation.

### Checkout

If implemented:

- Start checkout.
- Cancel checkout.
- Complete checkout.
- Fail payment.
- Verify trusted confirmation.
- Prevent duplicate orders.

### Accessibility

- Test keyboard controls.
- Test screen-reader labels.
- Test error announcements.
- Test focus management.
- Test mobile usability.

### Security

- Reject manipulated prices.
- Reject invalid product identifiers.
- Enforce inventory limits.
- Protect checkout sessions.
- Protect private credentials.
- Avoid sensitive data exposure.

## Implementation Dependencies

Before development begins,
the project must confirm:

1. Commerce platform selection.
2. Product catalog authority.
3. Variant data structure.
4. Inventory ownership.
5. Cart architecture.
6. Cart persistence requirements.
7. Pricing and discount rules.
8. Tax and shipping responsibilities.
9. Checkout provider.
10. Payment confirmation mechanism.
11. Order creation workflow.
12. Customer support responsibilities.
13. Security and compliance requirements.
14. Testing and rollback procedures.

### Proposed Development Sequence

1. Select the commerce platform.
2. Define product and variant models.
3. Establish inventory integration.
4. Design cart state management.
5. Implement add-to-cart behavior.
6. Implement quantity and removal controls.
7. Implement pricing validation.
8. Implement inventory revalidation.
9. Connect secure checkout.
10. Implement trusted order confirmation.
11. Test failure and recovery paths.
12. Deploy and verify.

This is a proposed sequence,
not an approved delivery schedule.

## Implementation Status

| Capability | Status |
|---|---|
| Existing external merchandise storefront | Implemented |
| Native cart state | Planned |
| Add-to-cart controls | Planned |
| Product variant selection | Planned |
| Quantity controls | Planned |
| Remove-item controls | Planned |
| Cart subtotal calculation | Planned |
| Price revalidation | Planned |
| Inventory revalidation | Planned |
| Cart persistence | Under Evaluation |
| Cart session management | Under Evaluation |
| Checkout handoff | Under Evaluation |
| Payment provider integration | Under Evaluation |
| Trusted payment confirmation | Planned; dependent on provider |
| Order creation | Under Evaluation |
| Duplicate-order protection | Planned |
| Cart accessibility testing | Pending implementation |
| End-to-end checkout testing | Pending implementation |

## Related Documentation

- [MERCH Overview](README.md)
- [Storefront Overview](storefront-overview.md)
- [Product Display](product-display.md)
- [Website Overview](../README.md)
- [Homepage](../homepage.md)
- [MERCH Commerce Overview](../../11-merch-commerce/README.md)
- [Commerce Architecture](../../11-merch-commerce/commerce-overview.md)
- [Product Catalog](../../11-merch-commerce/product-catalog.md)
- [Inventory Management](../../11-merch-commerce/inventory-management.md)
- [Cart and Checkout](../../11-merch-commerce/cart-and-checkout.md)
- [Payment Processing](../../11-merch-commerce/payment-processing.md)
- [Security and Compliance](../../11-merch-commerce/platform-evaluation.md)
- [Master Documentation Index](../../README.md)

---

[Back to MERCH Overview](README.md)
