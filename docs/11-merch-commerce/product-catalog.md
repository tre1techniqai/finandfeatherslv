# MERCHANDISE COMMERCE — Product Catalog

**Project:** Fin & Feathers Las Vegas

**Website:** https://finandfeatherslv.live

**Documentation Status:** Product Data and Administration Planning

**Audience:** Restaurant Ownership, Merchandise Managers, Developers, Content Administrators, and Commerce Operators

**Implementation Status:** Existing external merchandise experience; native product catalog proposed

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Catalog Objectives](#catalog-objectives)
3. [Current Merchandise Baseline](#current-merchandise-baseline)
4. [Catalog Architecture Options](#catalog-architecture-options)
5. [Product Data Ownership](#product-data-ownership)
6. [Product Identity](#product-identity)
7. [Product Categories and Collections](#product-categories-and-collections)
8. [Product Names and Descriptions](#product-names-and-descriptions)
9. [Product Variants](#product-variants)
10. [SKUs and Product Identifiers](#skus-and-product-identifiers)
11. [Product Pricing](#product-pricing)
12. [Promotions and Discounts](#promotions-and-discounts)
13. [Product Availability](#product-availability)
14. [Inventory Relationships](#inventory-relationships)
15. [Product Images and Media](#product-images-and-media)
16. [Product Specifications](#product-specifications)
17. [Product Publication States](#product-publication-states)
18. [Product Detail Pages](#product-detail-pages)
19. [Catalog Browsing and Navigation](#catalog-browsing-and-navigation)
20. [Search and Filtering](#search-and-filtering)
21. [Manager Catalog Administration](#manager-catalog-administration)
22. [Product Creation Workflow](#product-creation-workflow)
23. [Product Editing Workflow](#product-editing-workflow)
24. [Product Archiving and Removal](#product-archiving-and-removal)
25. [Database and Schema Planning](#database-and-schema-planning)
26. [External Platform Synchronization](#external-platform-synchronization)
27. [Security and Permissions](#security-and-permissions)
28. [SEO and Product Discoverability](#seo-and-product-discoverability)
29. [Mobile Experience and Accessibility](#mobile-experience-and-accessibility)
30. [Performance and Media Optimization](#performance-and-media-optimization)
31. [Catalog Quality Assurance](#catalog-quality-assurance)
32. [Operational Procedures](#operational-procedures)
33. [Implementation Roadmap](#implementation-roadmap)
34. [Acceptance Criteria](#acceptance-criteria)
35. [Implementation Status](#implementation-status)
36. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed product catalog architecture for a future Fin & Feathers Las Vegas merchandise storefront.

The catalog is the foundation of the merchandise shopping experience.

It determines how products are identified, described, priced, displayed, organized, and made available for purchase.

A reliable catalog must support both guest-facing presentation and authorized administrative workflows.

The proposed catalog may eventually include:

- Product names.
- Product descriptions.
- Merchandise categories.
- Product images.
- Product variants.
- Stock-keeping units.
- Selling prices.
- Inventory availability.
- Publication status.
- Product specifications.
- Shopping cart references.
- Commerce platform synchronization.

The exact data model depends on the selected commerce architecture.

### Important Boundary

This document describes proposed functionality.

It does not establish that native merchandise product tables, manager catalog controls, or product detail routes currently exist.

## Catalog Objectives

### Accurate Product Information

Provide clear, approved product details.

### Consistent Brand Presentation

Maintain the Fin & Feathers visual identity.

### Flexible Product Structure

Support merchandise with or without variants.

### Reliable Pricing

Display authoritative selling prices.

### Inventory Compatibility

Associate purchasable configurations with stock information.

### Easy Administration

Allow authorized personnel to maintain the catalog.

### Clear Publication Control

Prevent unfinished products from appearing publicly.

### Mobile Usability

Support product discovery on phones.

### Platform Compatibility

Avoid unnecessary dependence on unsupported commerce features.

### Maintainability

Use consistent structures that can evolve as merchandise offerings change.

## Current Merchandise Baseline

### Website

    https://finandfeatherslv.live

### Existing Merchandise Presentation

The website includes a merchandise thumbnail or promotional image.

### Existing Interaction

The merchandise component presents an external storefront through a modal-based experience.

### Current Product Authority

The authoritative product catalog provider has not been verified in this documentation.

### Existing Product Records

No native merchandise catalog database schema has been established as implemented.

### Existing Product Administration

No native merchandise manager catalog workflow has been established as implemented.

### Existing Commerce Checkout

The website is not documented as directly processing merchandise payments.

### Discovery Requirement

Inspect the current external merchandise storefront and business administration process.

### Preservation Requirement

Keep the existing merchandise experience functional until an approved replacement is ready.

## Catalog Architecture Options

### Option A — External Platform Catalog

The current merchandise provider remains responsible for product information.

### Option B — Hosted Commerce Catalog

A selected hosted commerce platform manages products and variants.

### Option C — Headless Commerce Catalog

A commerce backend supplies product data to the Next.js storefront.

### Option D — Supabase-Native Catalog

Approved custom tables manage products and variants.

### Option E — Hybrid Catalog

A provider owns authoritative commerce records while the website maintains approved presentation metadata.

### Evaluation Factors

- Product volume.
- Variant complexity.
- Inventory requirements.
- Administrative usability.
- Checkout compatibility.
- API capabilities.
- Development cost.
- Recurring cost.
- Data portability.
- Maintenance responsibilities.

### Decision Rule

Select catalog architecture only after identifying the intended commerce platform and operating model.

## Product Data Ownership

Each field should have one authoritative source.

### Product Identity

Determine which system assigns canonical product identifiers.

### Product Name

Define who approves and maintains the displayed name.

### Description

Determine whether content is maintained locally or by a commerce provider.

### Price

Identify the authoritative selling price.

### Variant Structure

Determine which system defines valid options.

### Inventory

Identify the authoritative stock system.

### Media

Determine where approved images are managed.

### Publication Status

Define which system controls product visibility.

### Fulfillment Attributes

Determine who maintains shipping-related information.

### Conflict Resolution

Document how inconsistent records are reconciled.

### Critical Principle

Do not establish competing authoritative values without a defined synchronization strategy.

## Product Identity

Every product should have a stable identity.

### Internal Identifier

A unique identifier may be assigned by the selected system.

### External Identifier

A hosted provider may supply its own identifier.

### Product Handle

A readable identifier may support URLs.

### Display Name

The customer-facing name may change without changing the underlying identity.

### Variants

Variants should reference the correct parent product.

### Orders

Completed orders must retain enough product information to explain the purchase.

### Historical Integrity

Product edits should not silently rewrite completed order records.

### Deletion

Avoid removing identifiers still required for historical order references.

### Mapping

Document external-to-internal mappings when necessary.

### Qualification

No particular identifier format or database column is prescribed as existing.

## Product Categories and Collections

Merchandise may be organized into categories or curated collections.

### Categories

Group products by an approved merchandise classification.

### Collections

Present selected products for campaigns or seasonal promotions.

### Featured Products

Highlight approved items.

### Seasonal Merchandise

Allow temporary collections where useful.

### Category Names

Use clear customer-facing terminology.

### Product Membership

Determine whether a product may belong to multiple collections.

### Navigation

Keep the category structure understandable.

### Manager Approval

Restaurant ownership should approve the initial taxonomy.

### Menu Separation

Merchandise categories are independent of restaurant menu categories.

### Important Rule

Do not reuse food menu categories as merchandise classifications.

## Product Names and Descriptions

### Product Name

Use an accurate, concise title.

### Product Summary

Provide a short overview where useful.

### Detailed Description

Explain relevant product characteristics.

### Materials

Describe materials when verified.

### Fit

Provide apparel fit information when applicable.

### Care Instructions

Include approved care guidance.

### Dimensions

Provide relevant measurements.

### Brand Voice

Maintain consistent Fin & Feathers presentation.

### Accuracy

Avoid unsupported claims about materials or product characteristics.

### Content Review

Require approval before publication.

## Product Variants

Variants represent purchasable configurations of a product.

### Size

An apparel product may offer multiple sizes.

### Color

A product may be available in different colors.

### Style

A product may offer alternate designs.

### Variant Combination

A purchasable configuration may combine multiple options.

### Variant Identifier

Each configuration should have a stable identity.

### Variant Price

Prices may differ by configuration.

### Variant Inventory

Stock may be tracked independently.

### Variant Media

Some configurations may require distinct images.

### Unavailable Combinations

Prevent selection of invalid configurations.

### Optionality

Products without variants should remain supported.

## SKUs and Product Identifiers

A stock-keeping unit helps distinguish purchasable merchandise.

### SKU Purpose

Support inventory, fulfillment, and reporting.

### Uniqueness

Define whether SKUs must be unique across the catalog.

### Variant SKU

Each stock-tracked variant may require its own SKU.

### Provider SKU

A hosted platform may already maintain SKUs.

### Internal SKU

A custom system may assign its own format.

### Consistency

Avoid changing identifiers unnecessarily.

### Labeling

Use identifiers that support operational handling.

### Imports

Validate duplicate or missing SKUs.

### Historical Orders

Preserve purchased SKU references when necessary.

### Decision

The SKU format should be approved after platform selection.

## Product Pricing

Pricing must be authoritative and predictable.

### Base Price

Define the standard selling price.

### Variant Price

Allow approved differences where supported.

### Currency

Use a consistent supported currency.

### Price Precision

Avoid unsafe floating-point monetary calculations.

### Display

Format prices consistently.

### Price Changes

Require appropriate authorization.

### Checkout Validation

Recalculate totals using the authoritative commerce system.

### Historical Orders

Preserve the price paid at the time of purchase.

### Taxes

Apply the approved tax calculation workflow.

### Shipping

Keep merchandise shipping charges distinguishable from item prices.

## Promotions and Discounts

Promotional pricing requires an approved business policy.

### Sale Price

A product may have a temporary approved price.

### Discount Code

A provider may support promotional codes.

### Collection Promotion

A campaign may apply to selected merchandise.

### Eligibility

Define which products qualify.

### Expiration

Respect approved promotional dates.

### Combination Rules

Determine whether discounts may be combined.

### Checkout Authority

Apply discounts through the approved commerce system.

### Reporting

Track the financial impact of promotions.

### Restaurant SPECIALS Separation

The existing menu $5 specials toggle does not automatically apply to merchandise.

### Implementation Rule

Do not invent promotional logic without an approved commerce model.

## Product Availability

Product visibility and purchase availability are separate concepts.

### Published

The product is approved for public presentation.

### Unpublished

The product is not available to public browsing.

### In Stock

The selected variant is purchasable according to the authoritative inventory system.

### Out of Stock

The product or variant is unavailable for purchase.

### Discontinued

The product is no longer offered.

### Coming Soon

A product may be displayed without allowing purchase, if approved.

### Preorder

Offer only if the business and platform support it.

### Backorder

Offer only with explicit policy approval.

### Checkout

Revalidate availability before completing a purchase.

### Messaging

Explain unavailable selections clearly.

## Inventory Relationships

The catalog must integrate with the selected inventory model.

### Product Reference

Inventory records should identify the correct product.

### Variant Reference

Stock-tracked variants require precise identification.

### Quantity

Use the authoritative available quantity.

### Reservation

Determine whether checkout temporarily reserves stock.

### Adjustment

Support authorized stock corrections.

### Cancellation

Define inventory restoration behavior.

### Returns

Define whether returned items become available again.

### Fulfillment

Reduce or confirm stock according to the approved lifecycle.

### External Authority

Avoid maintaining duplicate stock records when a provider owns inventory.

### Reconciliation

Provide a procedure for resolving discrepancies.

## Product Images and Media

### Primary Image

Each published product should have an approved primary image.

### Alternate Images

Show additional views where useful.

### Variant Images

Associate relevant images with specific options.

### File Format

Choose appropriate web-compatible image formats.

### Image Dimensions

Establish a consistent merchandise-specific standard.

### Compression

Optimize files without unacceptable quality loss.

### Accessibility

Provide meaningful alternative text.

### Media Rights

Use authorized imagery.

### Storage

Evaluate Supabase Storage or the selected platform's media service.

### Upload Security

Validate file type, size, and administrative permissions.

## Product Specifications

Some products require structured details beyond a description.

### Material

Document verified composition.

### Dimensions

Include relevant measurements.

### Weight

Store shipping weight where required.

### Size Guide

Provide accurate apparel sizing information.

### Care Instructions

Include approved care guidance.

### Manufacturer Information

Include where applicable.

### Country of Origin

Include when required or appropriate.

### Packaging

Record relevant packaging attributes.

### Fulfillment Restrictions

Identify shipping constraints.

### Optional Fields

Do not require irrelevant specifications for every product.

## Product Publication States

Publication controls protect catalog quality.

### Draft

The product is being prepared.

### Ready for Review

The product awaits approval.

### Published

The product is approved for public presentation.

### Hidden

The product is not displayed publicly.

### Archived

The product is retained for historical or administrative purposes.

### Sold Out

Purchase availability is restricted by stock.

### State Ownership

Define whether the commerce platform or website controls publication.

### Authorization

Restrict state changes appropriately.

### Scheduling

Scheduled publication may be considered later.

### Qualification

These are conceptual states, not a confirmed database enum.

## Product Detail Pages

A future product detail experience should provide clear information.

### Product Name

Display the approved title.

### Images

Show primary and supporting imagery.

### Description

Provide relevant product details.

### Price

Display authoritative pricing.

### Variant Controls

Present valid options.

### Availability

Communicate purchase eligibility.

### Quantity

Allow supported quantity selection.

### Cart Action

Add the exact selected configuration.

### Shipping Information

Provide applicable fulfillment guidance.

### Policies

Link to approved return and support information.

## Catalog Browsing and Navigation

### Merchandise Entry Point

Provide clear access from the existing website.

### Product Grid

Display merchandise in a responsive layout.

### Categories

Support approved merchandise classifications.

### Collections

Highlight curated products where appropriate.

### Featured Items

Present selected products prominently.

### Product Cards

Show consistent imagery, names, and prices.

### Availability

Avoid misleading purchase controls.

### Pagination

Evaluate pagination or incremental loading as catalog size grows.

### Navigation

Allow guests to return to browsing easily.

### Mobile

Prioritize touch-friendly interaction.

## Search and Filtering

Search functionality should match actual catalog complexity.

### Search

Consider product name and relevant description matching.

### Category Filter

Filter by approved merchandise categories.

### Size Filter

Use only available sizes.

### Color Filter

Use only supported colors.

### Price Filter

Use authoritative product prices.

### Availability Filter

Distinguish purchasable items.

### Sorting

Consider price or featured order.

### Empty Results

Provide helpful messaging.

### Accessibility

Ensure filters work with keyboard navigation.

### Scope

Do not add unnecessary search complexity for a small catalog.

## Manager Catalog Administration

Future manager controls may extend the existing admin dashboard.

### Product Listing

Display manageable product records.

### Product Creation

Add new merchandise.

### Product Editing

Update approved fields.

### Variants

Manage available configurations.

### Pricing

Restrict price changes to authorized personnel.

### Images

Manage approved product media.

### Publication

Control visibility.

### Inventory

Provide appropriate stock controls.

### Audit

Record material changes.

### Authorization

Apply server-side manager permissions.

## Product Creation Workflow

### Step 1 — Confirm Product

Verify that the merchandise is approved for sale.

### Step 2 — Choose Category

Select an approved merchandise classification.

### Step 3 — Enter Name

Use the approved product title.

### Step 4 — Enter Description

Provide accurate product information.

### Step 5 — Define Variants

Add required options.

### Step 6 — Assign Identifiers

Use the selected platform's approved identity model.

### Step 7 — Set Pricing

Enter authorized selling prices.

### Step 8 — Configure Inventory

Associate the correct stock authority.

### Step 9 — Add Media

Upload approved product images.

### Step 10 — Review

Validate completeness and accuracy.

### Step 11 — Publish

Make the product available only after approval.

## Product Editing Workflow

### Locate Product

Identify the correct record.

### Review Current Values

Inspect existing details before changing them.

### Edit Description

Update approved product information.

### Edit Variants

Preserve identifier integrity.

### Edit Pricing

Require authorized price changes.

### Edit Images

Avoid breaking existing media references.

### Edit Availability

Respect inventory authority.

### Validate

Check required fields.

### Save

Use the selected platform's supported update mechanism.

### Verify

Confirm the guest-facing result.

### Historical Orders

Do not alter completed transaction records retroactively.

## Product Archiving and Removal

Products may need to be withdrawn from sale.

### Unpublish

Remove the product from public browsing.

### Disable Purchasing

Prevent new purchases.

### Archive

Retain necessary historical references.

### Inventory

Resolve remaining stock appropriately.

### Orders

Preserve information required for completed purchases.

### Media

Review whether associated assets remain necessary.

### External Platforms

Coordinate removal with the authoritative provider.

### Authorization

Restrict destructive actions.

### Recovery

Provide a supported restoration procedure.

### Deletion Rule

Avoid permanent deletion when it would damage historical order integrity.

## Database and Schema Planning

The final schema depends on platform selection.

### Potential Product Entity

Stores approved product metadata.

### Potential Variant Entity

Stores purchasable configurations.

### Potential Category Entity

Stores merchandise taxonomy.

### Potential Media Entity

Associates images with products.

### Potential Inventory Entity

Tracks stock where Supabase is authoritative.

### Potential Price Records

Supports the approved pricing model.

### Potential Publication Metadata

Tracks visibility and review status.

### External Mapping

Associates provider identifiers where necessary.

### Audit History

Records material administrative changes.

### Important Qualification

These are conceptual entities, not confirmed existing tables or migrations.

## External Platform Synchronization

A hosted commerce provider may own catalog records.

### API Eligibility

Verify supported product access.

### Authentication

Use approved server-side credentials.

### Product Mapping

Associate stable identifiers.

### Variant Mapping

Preserve configuration relationships.

### Pricing Authority

Avoid conflicting prices.

### Inventory Authority

Avoid conflicting stock values.

### Publication

Define which system controls visibility.

### Error Handling

Detect failed synchronization.

### Conflict Resolution

Establish approved rules.

### Feasibility

Do not assume a provider exposes the required APIs.

## Security and Permissions

### Manager Authentication

Use established approved authentication.

### Authorization

Protect catalog changes server-side.

### Least Privilege

Grant only necessary permissions.

### Input Validation

Validate names, prices, quantities, and options.

### Media Uploads

Restrict and validate files.

### Secrets

Keep privileged credentials outside client code.

### Source Control

Do not commit `.env.local`.

### Database

Apply appropriate RLS policies.

### Audit

Record significant administrative activity.

### Payment Separation

Do not store cardholder data in product catalog records.

## SEO and Product Discoverability

Product pages may benefit from search visibility.

### Page Titles

Use descriptive product names.

### Descriptions

Provide accurate summaries.

### URLs

Use stable readable paths where supported.

### Canonical URLs

Avoid unnecessary duplicate product pages.

### Image Text

Provide meaningful alternative text.

### Structured Data

Evaluate applicable product metadata after the architecture is selected.

### Availability

Keep public availability information accurate.

### Performance

Optimize loading speed.

### Indexing

Avoid indexing unfinished products.

### Platform Constraints

Confirm which SEO controls the selected commerce model supports.

## Mobile Experience and Accessibility

### Responsive Layout

Support mobile and desktop widths.

### Product Cards

Keep names and prices readable.

### Images

Use appropriately sized media.

### Variant Controls

Make options easy to select.

### Touch Targets

Provide comfortable interactive controls.

### Color Selection

Do not rely on color alone to convey an option.

### Forms

Use descriptive labels.

### Keyboard Navigation

Support keyboard interaction.

### Screen Readers

Provide meaningful announcements.

### Error Messages

Explain invalid or unavailable selections.

## Performance and Media Optimization

### Image Compression

Reduce unnecessary file size.

### Responsive Images

Serve suitable dimensions.

### Lazy Loading

Defer noncritical images where appropriate.

### Caching

Use appropriate caching for catalog data.

### Price Freshness

Revalidate prices before checkout.

### Availability Freshness

Recheck inventory before purchase.

### Database Queries

Avoid unnecessary repeated requests.

### External APIs

Use bounded calls and safe error handling.

### Monitoring

Measure catalog performance.

### Testing

Review representative mobile network conditions.

## Catalog Quality Assurance

### Product Identity

- [ ] Every product has a stable identifier.
- [ ] Variants reference the correct product.
- [ ] Duplicate SKUs are handled according to policy.

### Content

- [ ] Names are approved.
- [ ] Descriptions are accurate.
- [ ] Specifications are verified.
- [ ] Images are authorized.

### Pricing

- [ ] Prices match the authoritative system.
- [ ] Variant pricing is correct.
- [ ] Promotions follow approved rules.

### Availability

- [ ] Unavailable variants cannot be purchased.
- [ ] Publication states behave correctly.
- [ ] Archived products remain appropriately protected.

### Operations

- [ ] Manager permissions are tested.
- [ ] Product edits are verified.
- [ ] Historical order references remain intact.

## Operational Procedures

### New Product Intake

Collect approved merchandise information.

### Photography

Prepare authorized product images.

### Pricing Approval

Confirm selling prices.

### Inventory Setup

Verify initial stock.

### Product Review

Check content and variants.

### Publication

Release the product through the approved workflow.

### Routine Updates

Maintain descriptions, prices, and availability.

### Seasonal Changes

Archive or hide discontinued products.

### Error Correction

Resolve inaccurate catalog information promptly.

### Staff Training

Document the manager procedures.

## Implementation Roadmap

### Phase 0 — Discovery

Inspect the existing external merchandise catalog.

### Phase 1 — Requirements

Confirm product types and expected catalog size.

### Phase 2 — Platform Selection

Choose the approved commerce architecture.

### Phase 3 — Data Ownership

Define authoritative product, price, and inventory systems.

### Phase 4 — Schema or Platform Configuration

Establish the approved product model.

### Phase 5 — Manager Workflows

Implement or configure authorized administration.

### Phase 6 — Product Media

Establish image management.

### Phase 7 — Storefront Presentation

Build approved catalog browsing.

### Phase 8 — Cart Integration

Connect purchasable variants to the merchandise cart.

### Phase 9 — Testing

Verify content, prices, variants, and availability.

### Phase 10 — Launch

Publish only after operational approval.

## Acceptance Criteria

### Architecture

- [ ] Commerce platform selected.
- [ ] Product authority documented.
- [ ] Inventory authority documented.
- [ ] External integration requirements confirmed.

### Catalog

- [ ] Product identifiers are stable.
- [ ] Variants are accurately represented.
- [ ] Pricing is authoritative.
- [ ] Product media is approved.

### Administration

- [ ] Authorized managers can maintain products.
- [ ] Unauthorized users cannot change catalog data.
- [ ] Publication controls work.
- [ ] Material edits are auditable.

### Guest Experience

- [ ] Product browsing works on mobile.
- [ ] Product details are accurate.
- [ ] Unavailable products are handled.
- [ ] Selected variants transfer correctly to checkout.

### Production

- [ ] Testing completed.
- [ ] Staff procedures documented.
- [ ] Rollback plan reviewed.
- [ ] Ownership approves launch.

## Implementation Status

| Capability | Status |
|---|---|
| Existing merchandise presentation | Established |
| External merchandise catalog | Exists as part of external experience; provider details require review |
| Native catalog architecture | Proposed |
| Commerce platform selection | Pending |
| Product taxonomy | Pending approval |
| Native product records | Not established |
| Native variant records | Not established |
| SKU policy | Pending |
| Product pricing authority | Pending |
| Merchandise promotions | Proposed |
| Native inventory relationship | Proposed |
| Product media workflow | Proposed |
| Publication controls | Proposed |
| Native product detail pages | Proposed |
| Catalog browsing interface | Proposed |
| Search and filtering | Optional future feature |
| Manager product administration | Proposed |
| Product synchronization | Unconfirmed |
| Supabase commerce schema | Not established |
| Security review | Pending |
| Catalog testing | Not started |
| Native catalog production launch | Not approved |

### Overall Assessment

The merchandise catalog remains in the planning stage.

The current external merchandise experience should remain available until a selected architecture and replacement workflow have passed approval and testing.

## Related Documentation

### Merchandise Commerce

- [Merchandise Commerce Overview](README.md)
- [Commerce Architecture Overview](commerce-overview.md)
- [Inventory Management](inventory-management.md)
- [Cart and Checkout](cart-and-checkout.md)
- [Payment Processing](payment-processing.md)
- [Shipping and Fulfillment](shipping-and-fulfillment.md)
- [Platform Evaluation](platform-evaluation.md)
- [Cost Analysis](cost-analysis.md)
- [Implementation Roadmap](implementation-roadmap.md)

### Existing Website Merchandise

- [Merchandise Overview](../02-website/merch/README.md)
- [Storefront Overview](../02-website/merch/storefront-overview.md)
- [Product Display](../02-website/merch/product-display.md)
- [Shopping Cart Planning](../02-website/merch/shopping-cart.md)

### Administration and Database

- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Merchandise Administration](../04-admin-dashboard/merch-management.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Database Storage](../06-database/storage.md)

### Project and Deployment

- [Project Architecture](../01-project-overview/architecture.md)
- [Technology Stack](../01-project-overview/technology-stack.md)
- [Vercel Deployment](../07-deployment/vercel-deployment.md)
- [Rollback Procedures](../07-deployment/rollback-procedures.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Master Documentation Index](../README.md)

---

[Back to Merchandise Commerce Overview](README.md)
