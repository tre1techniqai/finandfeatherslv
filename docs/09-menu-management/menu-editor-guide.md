# MENU MANAGEMENT — Menu Editor Guide

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Audience:** Authorized Restaurant Managers, Technical Administrators, and Developers

**Implementation Status:** Administrative Menu Management implemented; individual controls and production acceptance require verification against the current application

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Editor Objectives](#editor-objectives)
3. [Current Implementation](#current-implementation)
4. [System Architecture](#system-architecture)
5. [Manager Access](#manager-access)
6. [Opening the Menu Editor](#opening-the-menu-editor)
7. [Editor Interface Overview](#editor-interface-overview)
8. [Menu Data Structure](#menu-data-structure)
9. [Categories and Subcategories](#categories-and-subcategories)
10. [Menu Item Fields](#menu-item-fields)
11. [Adding a Menu Item](#adding-a-menu-item)
12. [Editing a Menu Item](#editing-a-menu-item)
13. [Removing a Menu Item](#removing-a-menu-item)
14. [Menu Item Availability](#menu-item-availability)
15. [Pricing Management](#pricing-management)
16. [Modifiers and Options](#modifiers-and-options)
17. [Special Pricing](#special-pricing)
18. [Menu Image Management](#menu-image-management)
19. [Image Processing and Storage](#image-processing-and-storage)
20. [Form Validation](#form-validation)
21. [Saving and Publishing Changes](#saving-and-publishing-changes)
22. [Public Menu Verification](#public-menu-verification)
23. [Authorization and Security](#authorization-and-security)
24. [Database and Storage Dependencies](#database-and-storage-dependencies)
25. [Common Manager Workflows](#common-manager-workflows)
26. [Troubleshooting](#troubleshooting)
27. [Testing and Acceptance](#testing-and-acceptance)
28. [Future Enhancements](#future-enhancements)
29. [Implementation Roadmap](#implementation-roadmap)
30. [Implementation Status](#implementation-status)
31. [Related Documentation](#related-documentation)

---

## Purpose

This document explains the administrative menu editor for the Fin & Feathers Las Vegas website.

The menu editor allows authorized staff to maintain the restaurant's digital menu without requiring a source-code change for every supported content update.

The guide covers:

- Accessing Menu Management.
- Understanding menu records.
- Selecting approved categories.
- Adding menu items.
- Editing existing items.
- Managing prices.
- Configuring supported modifiers.
- Managing menu images.
- Understanding special pricing.
- Saving changes.
- Verifying the public menu.
- Handling errors.
- Protecting administrative access.

The guide also identifies functionality that requires further verification or future development.

It does not establish that every proposed menu management capability is currently available.

## Editor Objectives

### Accurate Menu Information

The public menu should reflect approved restaurant offerings.

### Manager Independence

Authorized managers should be able to complete supported menu changes without developer intervention.

### Consistent Structure

Items should follow the approved category and subcategory organization.

### Reliable Pricing

Base prices and additional charges should remain accurate.

### Visual Quality

Food photography should follow established image standards.

### Secure Administration

Only authorized managers should perform restricted menu changes.

### Data Integrity

Edits should not unintentionally corrupt unrelated menu records.

### Public Verification

Managers should confirm that saved changes appear correctly.

### Operational Traceability

Significant changes should be documented through the appropriate process.

### Future Extensibility

The menu architecture should accommodate approved enhancements without disrupting existing functionality.

## Current Implementation

**Status:** Implemented with additional verification required

### Framework

    Next.js App Router

### Language

    TypeScript

### Authentication

    Supabase Auth

### Database

    Supabase PostgreSQL

### Media Storage

    Supabase Storage

### Menu Administration Route

    /admin/menu

### Administrative Dashboard

    /admin

### Manager Authorization

    requireManager()

### Existing Capabilities

The project includes:

- Protected Menu Management.
- Menu item administration.
- Menu image uploads.
- WebP image processing.
- 4:3 image output.
- An existing $5 specials toggle.

### Verification Boundary

The exact deployed field controls, deletion behavior, availability controls, and publishing behavior should be confirmed against the current application.

## System Architecture

The menu editor operates across several application layers.

### Administrative Interface

Managers interact with protected Next.js pages and components.

### Authentication Layer

Supabase Auth identifies the signed-in user.

### Authorization Layer

The application checks manager permissions.

### Database Layer

Supabase PostgreSQL stores menu-related data.

### Storage Layer

Supabase Storage holds menu photography.

### Public Presentation

The public menu reads approved menu data.

### Hosting

Vercel hosts the application.

### Dependency Principle

A successful editor operation may depend on both database permissions and application authorization.

### Media Principle

An image record and its corresponding Storage object must remain consistent.

### Release Principle

Administrative content updates should be distinguished from source-code deployments.

## Manager Access

The editor is intended for authorized managers.

### Authentication Provider

    Supabase Auth

### Role Table

    staff_roles

### Required Role

    manager

### Required State

    is_active = true

### Authorization Helper

    requireManager()

### Login Route

    /admin/login

### Protected Menu Route

    /admin/menu

### Anonymous Access

Anonymous visitors must not be able to perform restricted menu operations.

### Non-Manager Access

Authenticated non-managers must not receive manager privileges.

### Inactive Accounts

Inactive manager accounts must not retain administrative access.

### Security Boundary

UI visibility alone is not sufficient authorization enforcement.

## Opening the Menu Editor

### Step 1 — Open the Website

Visit:

    https://finandfeatherslv.live

### Step 2 — Open Admin Login

Navigate to:

    /admin/login

### Step 3 — Sign In

Use an approved manager account.

### Step 4 — Open Dashboard

Navigate to:

    /admin

### Step 5 — Select Menu Management

Open:

    /admin/menu

### Step 6 — Confirm Access

Verify that the menu editor loads.

### Step 7 — Review Current Menu

Inspect existing records before making changes.

### Troubleshooting

If access is denied, verify the account's active manager role through the approved administrative process.

### Security

Do not share credentials or bypass access controls.

## Editor Interface Overview

The editor presents controls for supported menu operations.

### Menu Records

Existing menu items can be reviewed.

### Item Selection

A manager selects the intended record.

### Add Action

The interface provides supported item-creation functionality.

### Edit Action

The interface provides supported item-editing functionality.

### Delete Action

Deletion behavior must be verified against the current implementation before being documented as an approved manager workflow.

### Image Controls

The application includes menu image upload functionality.

### Pricing Controls

Supported fields allow menu pricing to be maintained.

### Special Toggle

An existing $5 specials toggle is available.

### Feedback

Save and validation feedback should be reviewed.

### Verification

Control labels and exact screen layout should be checked during manager training.

## Menu Data Structure

Menu items are represented by structured application data.

### Core Information

A menu record may contain:

- Item identifier.
- Name.
- Description.
- Category.
- Subcategory.
- Price.
- Image reference.
- Availability or visibility state.
- Modifier information.
- Special-related settings.

### Schema Boundary

The exact database columns must be confirmed from the current schema.

### Item Identifier

The identifier distinguishes a record from other menu items.

### Category Relationship

Items should belong to an approved category.

### Pricing

Price representation must support the approved restaurant pricing model.

### Images

Image references should resolve to the intended media asset.

### Modifiers

Optional selections and additional charges require consistent representation.

### Public Display

The guest-facing menu should accurately interpret stored data.

## Categories and Subcategories

Menu organization must follow the approved spreadsheet.

### Source of Truth

The imported menu spreadsheet defines approved categories and subcategories.

### Category Selection

Managers should select the correct established category.

### Subcategory Selection

Use an approved subcategory when applicable.

### Category Consistency

Avoid inconsistent naming or duplicate categories.

### Existing Menu Areas

The original menu data includes restaurant food and brunch groupings.

### COCKTAILS

COCKTAILS may appear as an approved menu category or subcategory where supported by the source data.

### Cocktail Images

No images are required for COCKTAILS.

### HOOKAH

Do not create a HOOKAH category filter.

### New Categories

Do not introduce unapproved categories through administrative changes.

### Verification

Confirm the public menu displays the intended category structure.

## Menu Item Fields

Menu records require accurate guest-facing information.

### Name

Use the approved restaurant item name.

### Description

Describe the dish accurately and clearly.

### Category

Choose an approved category.

### Subcategory

Choose an approved subcategory where applicable.

### Price

Use the approved price.

### Market Price

Use the supported market-price representation when applicable.

### Modifiers

Configure supported choices and additional charges.

### Image

Associate approved food photography where appropriate.

### Special Setting

Review the existing special-related control when relevant.

### Availability

Use only availability controls confirmed in the current implementation.

### Validation

Required fields must satisfy the application's rules.

## Adding a Menu Item

### Step 1 — Confirm Approval

Ensure the new item is an approved restaurant offering.

### Step 2 — Open Menu Management

Navigate to:

    /admin/menu

### Step 3 — Select Add Item

Use the editor's supported creation action.

### Step 4 — Enter Name

Use the approved item name.

### Step 5 — Enter Description

Provide accurate guest-facing text.

### Step 6 — Select Category

Choose the appropriate approved category.

### Step 7 — Select Subcategory

Use the correct subcategory if supported.

### Step 8 — Set Price

Enter the approved price or market-price designation.

### Step 9 — Configure Options

Add supported modifiers where applicable.

### Step 10 — Select Image

Upload approved photography if appropriate.

### Step 11 — Review

Check all entered values.

### Step 12 — Save

Submit the item through the editor.

### Step 13 — Verify

Confirm the item appears correctly on the public menu.

## Editing a Menu Item

### Step 1 — Identify the Item

Locate the intended existing record.

### Step 2 — Open Edit

Use the supported edit action.

### Step 3 — Review Existing Values

Inspect all relevant fields.

### Step 4 — Make Approved Changes

Update only the intended information.

### Step 5 — Review Category

Confirm category and subcategory remain correct.

### Step 6 — Review Price

Verify the approved price.

### Step 7 — Review Modifiers

Check optional choices and additional charges.

### Step 8 — Review Image

Confirm the intended media asset.

### Step 9 — Review Special Setting

Check the existing specials toggle where relevant.

### Step 10 — Save

Complete the editor's save operation.

### Step 11 — Confirm Persistence

Reopen the item if needed.

### Step 12 — Verify Public Display

Confirm the guest-facing menu reflects the intended update.

## Removing a Menu Item

Removing menu records can affect data integrity.

### Implementation Boundary

The current deletion interface and database behavior require verification.

### Operational Preference

Where supported, hiding an unavailable item may be safer than permanent deletion.

### Before Removal

Confirm:

- Correct item.
- Restaurant approval.
- Related records.
- Associated images.
- Potential references from specials.
- Recovery options.

### Permanent Deletion

Use only the implemented and approved deletion workflow.

### Database Effects

Determine whether related records are affected.

### Storage Effects

Deleting a database record does not necessarily delete its image.

### Verification

Confirm the public menu no longer presents the item as active.

### Documentation

Record significant removals through the appropriate operational process.

## Menu Item Availability

Availability determines whether an item should be offered to guests.

### Temporary Unavailability

An item may be unavailable for a limited period.

### Permanent Removal

A discontinued item may require a different administrative action.

### Visibility

Visibility and availability may be distinct application settings.

### Implementation Boundary

The exact availability controls must be confirmed from the current editor.

### Manager Responsibility

Avoid displaying unavailable items as orderable where the application supports availability management.

### Toast Ordering

The external Toast ordering system may maintain its own availability information.

### Synchronization

Direct Toast POS synchronization is not established as implemented.

### Public Verification

Check the menu after changing any supported availability setting.

### Data Integrity

Preserve historical information where required.

## Pricing Management

Accurate prices are essential to guest trust.

### Base Price

Use the approved menu price.

### Additional Charges

Verify all supported modifier surcharges.

### Market Price

Use the application's supported market-price designation.

### Decimal Precision

Avoid unintended rounding.

### Price Approval

Do not publish unapproved price changes.

### Specials

Distinguish standard pricing from special pricing.

### Public Menu

Verify the displayed amount.

### External Ordering

Website prices do not automatically establish prices in Toast.

### Discrepancies

Escalate material pricing differences.

### Recordkeeping

Significant pricing changes should be traceable.

## Modifiers and Options

Some menu items offer configurable choices.

### Sauce Choices

Wings and tenders may offer multiple sauces.

### Protein Choices

Certain items support optional protein additions.

### Add-On Charges

Some options carry additional costs.

### Item-Specific Rules

Do not assume all modifiers apply to every item.

### Approved Source

Use the imported menu data and restaurant-approved updates.

### Price Accuracy

Confirm the correct additional charge.

### Display

Guest-facing descriptions should communicate options clearly.

### Validation

Unsupported or incomplete modifiers should not be saved.

### Editing

Review existing modifiers when changing an item.

### Future Integration

Toast synchronization would require an approved modifier-mapping design.

## Special Pricing

The existing menu editor includes a $5 specials toggle.

### Current Capability

The toggle is part of the established menu administration implementation.

### Verification

Confirm its exact behavior in the current editor before using it operationally.

### Standard Price

Preserve the approved standard price where the data model requires it.

### Special Price

Use only approved special pricing.

### Display

Verify how the public menu represents special status.

### Scheduling

Advanced day-specific SPECIALS scheduling is planned.

### Example Future Special

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

### Manager Approval

Specials must follow restaurant pricing policy.

### Implementation Boundary

Do not assume advanced scheduling is already available.

## Menu Image Management

Menu images support the restaurant's visual presentation.

### Image Selection

Choose photography representing the actual dish.

### Quality

Use clear, well-lit images.

### Consistency

Maintain a consistent presentation style.

### Aspect Ratio

    4:3

### Output Format

    WebP

### Storage

Images are stored through Supabase Storage.

### Replacement

Verify that replacing an image updates the intended menu item.

### Missing Images

An item should remain understandable without an image where supported.

### COCKTAILS

Do not require images for COCKTAILS.

### Permissions

Only authorized staff should upload or replace menu media.

## Image Processing and Storage

The menu upload workflow processes images before or during storage.

### Storage Provider

    Supabase Storage

### Bucket

    website-media

### Menu Prefix

    menu/

### Image Output

    WebP

### Aspect Ratio

    4:3

### Processing Objective

Produce consistent, web-appropriate menu images.

### Upload Validation

Unsupported source files should be rejected safely.

### Storage Authorization

Upload permissions must follow the approved security model.

### Object References

Database records must point to the intended stored objects.

### Replacement Safety

Avoid unintentionally deleting images referenced by other records.

### Recovery

Keep appropriate original or recoverable source assets.

## Form Validation

Validation helps prevent invalid menu records.

### Required Fields

The application should enforce the required fields established by its schema and UI.

### Name

Reject invalid or missing names where required.

### Description

Validate according to the implemented data model.

### Category

Require an approved category.

### Subcategory

Validate supported category relationships.

### Price

Reject invalid numeric values.

### Modifiers

Validate supported option structures.

### Image

Validate supported upload types and sizes.

### Special Setting

Ensure the selected state is valid.

### Server Validation

Server-side checks must not rely exclusively on client-side controls.

### Error Feedback

Managers should receive actionable feedback when a save fails.

## Saving and Publishing Changes

Saving a record and publishing a website release are different operations.

### Administrative Save

The menu editor persists supported data changes.

### Source Deployment

Vercel deploys application code changes.

### Database Persistence

Confirm the record was saved.

### Public Visibility

Verify the public menu displays the intended result.

### Caching

Consider whether caching affects when updates become visible.

### Implementation Boundary

The exact revalidation or caching behavior requires confirmation from the current code.

### Save Failure

Do not assume a failed operation made no changes.

### Duplicate Submission

Check for partial success before repeating a save.

### Operational Approval

Only approved content changes should be published.

### Verification

Record important public-facing changes when appropriate.

## Public Menu Verification

Managers should verify important edits from the guest's perspective.

### Step 1 — Open Public Website

Visit:

    https://finandfeatherslv.live

### Step 2 — Open Full Menu

Use the public menu control.

### Step 3 — Find the Category

Locate the intended category.

### Step 4 — Find the Item

Confirm the correct item appears.

### Step 5 — Verify Name

Check spelling and formatting.

### Step 6 — Verify Description

Confirm accuracy.

### Step 7 — Verify Price

Check the approved amount.

### Step 8 — Verify Modifiers

Confirm applicable options and surcharges.

### Step 9 — Verify Image

Check that the intended photo loads.

### Step 10 — Test Mobile

Confirm the item is readable on mobile.

### Step 11 — Record Issues

Report any discrepancy.

## Authorization and Security

Menu administration is restricted functionality.

### Authentication

Supabase Auth identifies the user.

### Authorization

The application verifies manager access.

### Staff Role

    manager

### Active State

    is_active = true

### Database Security

RLS policies protect restricted records.

### Storage Security

Upload permissions must be enforced.

### Direct Requests

Unauthorized users must not bypass the interface through direct requests.

### Secrets

Privileged credentials must remain server-side.

### Logs

Avoid exposing sensitive information.

### Access Review

Remove access when staff authorization ends.

### Testing

Verify anonymous, non-manager, active-manager, and inactive-manager behavior.

## Database and Storage Dependencies

The menu editor depends on consistent application data.

### Database

Supabase PostgreSQL stores menu records.

### Schema

Actual table and column definitions are documented separately.

### Relationships

Categories, modifiers, images, and specials may involve related records.

### RLS

Policies determine permitted operations.

### Storage

Supabase Storage holds uploaded media.

### References

Image references must remain valid.

### Migration Changes

Database schema changes may require coordinated application updates.

### Backups

Backup and restoration capabilities require verification.

### Data Recovery

Do not assume that reverting application code restores deleted records.

### Testing

Use controlled test records for destructive or high-risk scenarios.

## Common Manager Workflows

### Workflow A — Add a New Dish

1. Confirm restaurant approval.
2. Open Menu Management.
3. Add the item.
4. Select the approved category.
5. Enter description and price.
6. Configure supported options.
7. Add approved photography.
8. Save.
9. Verify public display.

### Workflow B — Update a Price

1. Confirm the approved price.
2. Locate the item.
3. Open editing controls.
4. Update the price.
5. Review modifiers.
6. Save.
7. Verify public display.

### Workflow C — Replace an Image

1. Locate the item.
2. Select the image control.
3. Choose approved photography.
4. Complete upload.
5. Save if required.
6. Verify the public image.

### Workflow D — Correct a Description

1. Locate the item.
2. Review the current description.
3. Enter approved text.
4. Save.
5. Verify the public menu.

### Workflow E — Review a Special

1. Identify the intended item.
2. Confirm the approved promotion.
3. Review the existing specials control.
4. Use only verified supported behavior.
5. Save when appropriate.
6. Verify public presentation.

## Troubleshooting

### Editor Does Not Load

Confirm manager authentication and review application errors.

### Access Denied

Verify active manager authorization.

### Item Does Not Save

Review validation feedback and server errors.

### Incorrect Price

Inspect the saved record and public display.

### Missing Category

Compare the available categories with the approved spreadsheet.

### Modifier Not Displaying

Review the item's stored options and public rendering.

### Image Upload Fails

Check file format, upload feedback, and Storage permissions.

### Image Does Not Display

Verify the object path and public access.

### Special Toggle Unexpected

Confirm the current implementation before making additional changes.

### Duplicate Item

Check whether a previous save succeeded.

### Persistent Failure

Escalate with sanitized evidence.

## Testing and Acceptance

Menu Management requires both functional and security testing.

### Access

- [ ] Authorized manager can open the editor.
- [ ] Anonymous access is rejected.
- [ ] Non-manager access is rejected.
- [ ] Inactive manager access is rejected.

### Item Management

- [ ] Valid item creation works.
- [ ] Valid item editing works.
- [ ] Required field validation works.
- [ ] Duplicate submissions are handled appropriately.

### Pricing

- [ ] Base prices save correctly.
- [ ] Supported modifier charges save correctly.
- [ ] Market-price behavior is correct.

### Images

- [ ] Approved upload succeeds.
- [ ] WebP processing works.
- [ ] 4:3 output is correct.
- [ ] Public image loads.

### Public Menu

- [ ] Updated item appears correctly.
- [ ] Category placement is correct.
- [ ] Mobile display is usable.

### Special Pricing

- [ ] Existing $5 specials toggle behaves as implemented.

### Verification

Record actual test results rather than assuming completion.

## Future Enhancements

Potential future improvements include:

### Advanced SPECIALS Scheduling

Day-specific promotional scheduling.

### Expanded Availability

Additional item visibility and availability controls where approved.

### Bulk Editing

Controlled updates across multiple items.

### Menu History

Audit records for significant changes.

### Draft and Publish

Separate editing from public publication if required.

### Media Library

Improved asset reuse and organization.

### Manager Activity Logs

Track authorized administrative changes.

### Toast POS Synchronization

Potential menu and modifier synchronization.

### Operational Reporting

Identify stale items and missing information.

### Implementation Boundary

These enhancements are proposals, not confirmed deployed features.

## Implementation Roadmap

### Stage 1 — Audit Current Editor

Inspect the current application and confirm all available controls.

### Stage 2 — Validate Data Model

Review menu schema and relationships.

### Stage 3 — Verify Security

Test manager authorization and RLS.

### Stage 4 — Verify Core Operations

Test creation, editing, pricing, and supported removal behavior.

### Stage 5 — Verify Media

Test WebP processing, aspect ratio, and Storage references.

### Stage 6 — Verify Specials

Confirm the existing $5 specials toggle.

### Stage 7 — Train Managers

Provide approved operational instructions.

### Stage 8 — Improve Traceability

Evaluate content audit logging.

### Stage 9 — Expand Features

Implement approved enhancements in later phases.

### Scheduling

This roadmap does not establish committed delivery dates.

## Implementation Status

| Capability | Status |
|---|---|
| Protected Menu Management route | Implemented |
| Supabase Auth integration | Implemented |
| Manager authorization | Implemented |
| Menu item administration | Implemented |
| Menu item creation | Implemented |
| Menu item editing | Implemented |
| Menu image upload | Implemented |
| WebP image processing | Implemented |
| 4:3 image output | Implemented |
| Supabase Storage integration | Implemented |
| Existing $5 specials toggle | Implemented |
| Exact deletion behavior | Verification pending |
| Exact availability controls | Verification pending |
| Exact menu schema audit | Verification pending |
| Exact publishing and cache behavior | Verification pending |
| Complete manager acceptance tests | Pending |
| Comprehensive RLS acceptance tests | Pending |
| Advanced SPECIALS scheduling | Planned |
| Bulk menu editing | Proposed |
| Menu change audit history | Proposed |
| Draft-and-publish workflow | Proposed |
| Direct Toast POS synchronization | Under evaluation |
| Formal manager training | Planned operational process |

## Related Documentation

- [Menu Management Overview](README.md)
- [Categories and Subcategories](categories-and-subcategories.md)
- [Adding and Editing Items](adding-editing-items.md)
- [Pricing and Modifiers](pricing-and-modifiers.md)
- [Menu Images](menu-images.md)
- [SPECIALS Management](specials-management.md)
- [Publishing Updates](publishing-updates.md)
- [Menu Troubleshooting](troubleshooting.md)
- [Website Menu System](../02-website/menu-system.md)
- [Admin Menu Management](../04-admin-dashboard/menu-management.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Supabase Authentication](../05-authentication/supabase-auth.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Database Storage](../06-database/storage.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Operations Troubleshooting](../08-operations/troubleshooting.md)
- [Changelog](../08-operations/changelog.md)
- [Toast POS Integration Overview](../10-toast-pos-integration/integration-overview.md)
- [Master Documentation Index](../README.md)

---

[Back to Menu Management Overview](README.md)
