# MERCH

**Category:** Website / Merchandise

**Documentation Status:** In Development

**Public Merchandise Presentation:** Implemented; verification pending

**Admin Management Status:** Planned

**Direct Commerce Status:** Under Evaluation

---

## Table of Contents

1. [Overview](#overview)
2. [Current Website Implementation](#current-website-implementation)
3. [Future Product Display](#future-product-display)
4. [Shopping Cart and Checkout](#shopping-cart-and-checkout)
5. [Future Admin Management](#future-admin-management)
6. [Inventory and Fulfillment](#inventory-and-fulfillment)
7. [Platform Evaluation](#platform-evaluation)
8. [Security and Compliance](#security-and-compliance)
9. [Implementation Status](#implementation-status)
10. [Related Documentation](#related-documentation)

---

## Overview

The MERCH section promotes Fin & Feathers Las Vegas
branded merchandise.

The current website provides a merchandise presentation
and access to an external merchandise storefront.

A future development objective is to allow customers
to browse and purchase merchandise directly through
the restaurant website.

The final commerce architecture has not been selected.

## Current Website Implementation

The initial website implementation includes a
merchandise presentation component.

Previously implemented behavior includes:

- Merchandise promotional imagery.
- A merchandise storefront link.
- A modal containing an embedded external storefront.

The original promotional image was:

fin-feathers-merch-thumb.png

The current component, storefront URL, and embedded
storefront behavior require verification against
the latest application code.

## Future Product Display

A future integrated merchandise storefront may
support:

- Product images and descriptions.
- Product categories.
- Product variants such as size and color.
- Product pricing.
- Product availability.
- Featured merchandise.
- Promotional pricing.
- Mobile-friendly product browsing.

Product information should be manageable without
requiring manual source code changes.

## Shopping Cart and Checkout

The future storefront may include:

- Add-to-cart functionality.
- Cart quantity adjustments.
- Product variant selection.
- Checkout and order confirmation.
- Tax and shipping calculations.
- Secure payment processing.
- Order status notifications.

The final checkout approach will depend on the
selected commerce platform and payment provider.

No direct checkout implementation is assumed
at this stage.

## Future Admin Management

The planned merchandise management interface
may allow authorized managers to:

- Create and edit merchandise products.
- Upload and manage product images.
- Configure prices and variants.
- Track inventory availability.
- Activate or deactivate products.
- Review merchandise orders.
- Manage promotional offers.
- Access sales and inventory reports.

The precise capabilities will depend on
the selected commerce architecture.

## Inventory and Fulfillment

Future merchandise operations must address:

- Product inventory quantities.
- Size and color variations.
- Inventory adjustments.
- Out-of-stock behavior.
- Order processing.
- Shipping and pickup options.
- Returns and exchanges.
- Refund procedures.

Ownership should approve operational policies
before the system is implemented.

## Platform Evaluation

Potential approaches include:

- Integrating an established commerce platform.
- Using a hosted checkout solution.
- Building a custom storefront backed by
  a third-party commerce service.

The evaluation should consider:

- Setup costs.
- Monthly platform fees.
- Transaction fees.
- Payment processing fees.
- Development and maintenance costs.
- Inventory capabilities.
- Shipping integrations.
- Security and compliance responsibilities.

See the dedicated
[Merchandise Commerce Documentation](../../11-merch-commerce/README.md).

## Security and Compliance

Future commerce development must consider:

- Manager authorization.
- Secure payment processing.
- Customer data protection.
- Order access permissions.
- Inventory update permissions.
- Refund authorization.
- Audit logging.
- Payment provider compliance requirements.

Sensitive payment card information should not
be stored directly in the application database.

## Implementation Status

| Capability | Status |
|---|---|
| Public merchandise presentation | Implemented; verification pending |
| External storefront access | Implemented; verification pending |
| Embedded storefront modal | Implemented; verification pending |
| Native product catalog | Planned |
| Manager product editor | Planned |
| Product variants | Planned |
| Inventory management | Planned |
| Shopping cart | Under Evaluation |
| Direct website checkout | Under Evaluation |
| Payment processing | Under Evaluation |
| Shipping and fulfillment integration | Under Evaluation |
| Sales reporting | Planned |

## Related Documentation

- [Website Overview](../README.md)
- [Merchandise Commerce](../../11-merch-commerce/README.md)
- [Admin Dashboard](../../04-admin-dashboard/README.md)
- [Database & Storage](../../06-database/README.md)
- [Authentication](../../05-authentication/README.md)
- [Master Documentation Index](../../README.md)

---

[Back to Website Documentation](../README.md)
