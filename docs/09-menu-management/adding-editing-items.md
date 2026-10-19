# MENU MANAGEMENT — Adding and Editing Items

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Audience:** Authorized Restaurant Managers, Menu Administrators, Developers, and QA Reviewers

**Implementation Status:** Menu item administration implemented; exact field controls, deletion behavior, and production acceptance require verification

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Operational Objectives](#operational-objectives)
3. [Current Implementation](#current-implementation)
4. [Manager Access Requirements](#manager-access-requirements)
5. [Menu Item Lifecycle](#menu-item-lifecycle)
6. [Preparing a New Menu Item](#preparing-a-new-menu-item)
7. [Opening Menu Management](#opening-menu-management)
8. [Creating a Menu Item](#creating-a-menu-item)
9. [Entering Item Names](#entering-item-names)
10. [Writing Item Descriptions](#writing-item-descriptions)
11. [Selecting Categories and Subcategories](#selecting-categories-and-subcategories)
12. [Setting Base Prices](#setting-base-prices)
13. [Configuring Modifiers](#configuring-modifiers)
14. [Assigning Menu Images](#assigning-menu-images)
15. [Configuring Special Pricing](#configuring-special-pricing)
16. [Reviewing and Saving New Items](#reviewing-and-saving-new-items)
17. [Finding Existing Items](#finding-existing-items)
18. [Editing Existing Items](#editing-existing-items)
19. [Changing Item Categories](#changing-item-categories)
20. [Updating Prices and Modifiers](#updating-prices-and-modifiers)
21. [Replacing Item Images](#replacing-item-images)
22. [Managing Availability](#managing-availability)
23. [Removing or Discontinuing Items](#removing-or-discontinuing-items)
24. [Handling Save Errors](#handling-save-errors)
25. [Avoiding Duplicate Records](#avoiding-duplicate-records)
26. [Public Menu Verification](#public-menu-verification)
27. [Database and Storage Integrity](#database-and-storage-integrity)
28. [Security and Permissions](#security-and-permissions)
29. [Common Manager Workflows](#common-manager-workflows)
30. [Testing and Acceptance](#testing-and-acceptance)
31. [Troubleshooting](#troubleshooting)
32. [Future Enhancements](#future-enhancements)
33. [Implementation Roadmap](#implementation-roadmap)
34. [Implementation Status](#implementation-status)
35. [Related Documentation](#related-documentation)

---

## Purpose

This document provides operating procedures for adding and editing menu items on the Fin & Feathers Las Vegas website.

Menu item administration is a protected manager function.

The objective is to maintain accurate guest-facing menu information while protecting the underlying application data.

This guide covers:

- Preparing menu content.
- Creating new items.
- Editing existing items.
- Assigning approved categories.
- Maintaining prices.
- Configuring modifiers.
- Uploading food images.
- Reviewing special pricing.
- Handling availability.
- Removing discontinued items.
- Verifying saved changes.
- Troubleshooting errors.
- Protecting administrative access.

The procedures distinguish established functionality from controls that require verification against the current deployed application.

## Operational Objectives

### Menu Accuracy

Maintain current, approved restaurant offerings.

### Consistent Presentation

Use consistent naming, descriptions, pricing, and photography.

### Manager Independence

Enable authorized staff to make supported content changes.

### Data Integrity

Prevent accidental duplication, corruption, or deletion.

### Pricing Reliability

Keep displayed prices aligned with approved restaurant pricing.

### Guest Clarity

Ensure that item information is understandable.

### Category Consistency

Follow the approved spreadsheet taxonomy.

### Security

Restrict administrative operations to authorized managers.

### Verification

Confirm that changes appear correctly on the public website.

### Operational Traceability

Record significant menu changes through the appropriate process.

## Current Implementation

**Status:** Core Menu Management implemented

### Application Framework

    Next.js App Router

### Database

    Supabase PostgreSQL

### Authentication

    Supabase Auth

### Storage

    Supabase Storage

### Administrative Route

    /admin/menu

### Manager Authorization

    requireManager()

### Established Capabilities

- Protected menu administration.
- Menu item creation.
- Menu item editing.
- Menu image uploads.
- WebP image processing.
- 4:3 image output.
- Existing $5 specials toggle.

### Verification Boundary

Exact item deletion, availability, and publication controls require inspection of the current application.

## Manager Access Requirements

Menu item administration is restricted.

### Login Route

    /admin/login

### Dashboard Route

    /admin

### Menu Management Route

    /admin/menu

### Authentication

Managers sign in through Supabase Auth.

### Role Table

    staff_roles

### Required Role

    manager

### Active Status

    is_active = true

### Authorization

The application uses the established manager authorization helper.

### Unauthorized Users

Anonymous visitors and non-manager users must not modify menu records.

### Security

Never share manager credentials or bypass the authorization process.

## Menu Item Lifecycle

A menu item may pass through several operational states.

### Proposed

A restaurant offering is being considered.

### Approved

Management has approved the item.

### Prepared

The name, description, price, category, and modifiers are ready.

### Created

The record has been saved through the supported editor.

### Published

The item is visible on the public menu.

### Updated

An existing record has been modified.

### Temporarily Unavailable

An item may be unavailable for a limited period.

### Discontinued

The restaurant no longer offers the item.

### Removed

The item has been removed through an approved process.

### Implementation Boundary

These are operational lifecycle concepts; they are not necessarily literal database status values.

## Preparing a New Menu Item

Prepare approved information before opening the editor.

### Item Name

Use the restaurant-approved name.

### Description

Prepare accurate guest-facing text.

### Category

Identify the approved category.

### Subcategory

Identify the approved subcategory when applicable.

### Base Price

Confirm the standard price.

### Market Price

Identify whether market-price presentation applies.

### Modifiers

List supported options and surcharges.

### Image

Prepare approved food photography where appropriate.

### Special Pricing

Confirm any approved promotional setting.

### Availability

Determine whether the item should appear immediately.

### Approval

Do not create unapproved menu offerings.

## Opening Menu Management

### Step 1 — Open the Website

Visit:

    https://finandfeatherslv.live

### Step 2 — Navigate to Login

Open:

    /admin/login

### Step 3 — Authenticate

Sign in with an authorized manager account.

### Step 4 — Open Dashboard

Navigate to:

    /admin

### Step 5 — Open Menu Management

Navigate to:

    /admin/menu

### Step 6 — Review Existing Records

Check the menu before making changes.

### Step 7 — Identify the Action

Choose the supported add or edit workflow.

### Access Failure

If access is denied, use the approved manager account support process.

## Creating a Menu Item

### Step 1 — Confirm Approval

Verify that management has approved the item.

### Step 2 — Check for Duplicates

Search or review existing records.

### Step 3 — Select Add Item

Use the implemented creation control.

### Step 4 — Enter Name

Use the approved item name.

### Step 5 — Enter Description

Provide the approved description.

### Step 6 — Select Category

Choose the correct category.

### Step 7 — Select Subcategory

Choose the correct subcategory when supported.

### Step 8 — Enter Price

Use the approved pricing model.

### Step 9 — Configure Modifiers

Add supported options.

### Step 10 — Assign Image

Upload approved photography if appropriate.

### Step 11 — Review Specials

Check any relevant promotional setting.

### Step 12 — Save

Submit the record.

### Step 13 — Confirm

Verify that the item was saved.

### Step 14 — Check Public Menu

Confirm guest-facing presentation.

## Entering Item Names

Names should be consistent and recognizable.

### Approved Terminology

Use the restaurant's approved menu wording.

### Spelling

Check spelling before saving.

### Capitalization

Follow the menu's established style.

### Punctuation

Use consistent punctuation.

### Abbreviations

Avoid unapproved abbreviations.

### Special Characters

Confirm that supported punctuation displays correctly.

### Duplicate Names

Check for existing records with the same name.

### Menu Identity

Do not rename a different item merely to reuse its record.

### Searchability

Use recognizable item names.

### Verification

Check the public display after saving.

## Writing Item Descriptions

Descriptions help guests understand the offering.

### Accuracy

Describe the actual dish.

### Ingredients

Include relevant approved ingredients.

### Preparation

Use accurate preparation terminology.

### Options

Describe supported choices clearly.

### Surcharges

Communicate additional charges where appropriate.

### Dietary Claims

Use only approved dietary descriptions.

### Spicy Labels

Apply supported labels accurately.

### Consistency

Use a consistent writing style.

### Length

Keep descriptions readable on mobile.

### Approval

Confirm substantive changes with restaurant management.

### Verification

Check the rendered description.

## Selecting Categories and Subcategories

The approved menu spreadsheet defines the taxonomy.

### Source of Truth

Use the current approved spreadsheet.

### Parent Category

Select the correct primary grouping.

### Subcategory

Select the correct child grouping where applicable.

### Historical Categories

The original import included:

- Starters.
- Entrees.
- Sandwiches.
- Salads.
- Sides.
- Brunch.
- Brunch Sides.
- Brunch Drinks.

### Current Inventory

The complete current taxonomy requires reconciliation with the approved spreadsheet.

### HOOKAH

Do not introduce a HOOKAH category filter.

### COCKTAILS

Follow the approved hierarchy.

### Verification

Confirm the item appears in the correct public menu grouping.

## Setting Base Prices

Prices must match restaurant approval.

### Standard Price

Use the approved base price.

### Currency

Follow the application's supported price representation.

### Decimal Precision

Avoid unintended rounding.

### Market Price

Use the supported market-price designation where appropriate.

### Invalid Values

Do not enter negative or malformed prices.

### Price Changes

Confirm approval before updating an existing price.

### Modifiers

Check whether additional charges apply.

### Specials

Keep standard pricing distinct from approved special pricing.

### Toast

Do not assume website price changes synchronize with Toast.

### Verification

Confirm the public menu displays the intended price.

## Configuring Modifiers

Modifiers represent supported item options.

### Examples

Certain menu items may support:

- Sauce selection.
- Protein additions.
- Preparation choices.
- Optional ingredients.
- Additional charges.

### Item-Specific Configuration

Do not apply every modifier to every item.

### Approved Source

Use the approved menu data.

### Modifier Name

Use clear guest-facing terminology.

### Modifier Price

Confirm the approved surcharge.

### Required Choices

Use required-choice behavior only when supported.

### Optional Choices

Use optional-choice behavior where appropriate.

### Validation

Avoid incomplete modifier definitions.

### Save

Verify modifier changes persist.

### Public Display

Confirm options and surcharges appear correctly.

## Assigning Menu Images

Menu photography should be accurate and consistent.

### Image Selection

Use an approved photo of the intended dish.

### Quality

Prefer clear, well-lit photography.

### Aspect Ratio

    4:3

### Output Format

    WebP

### Storage Provider

    Supabase Storage

### Bucket

    website-media

### Menu Prefix

    menu/

### Upload

Use the editor's supported upload workflow.

### Verification

Confirm the public menu loads the image.

### COCKTAILS

Images are not required for COCKTAILS.

## Configuring Special Pricing

The editor includes an existing $5 specials toggle.

### Current Capability

A special-related control is established.

### Approval

Only use approved promotions.

### Standard Price

Preserve the intended regular price.

### Special State

Verify the current toggle behavior.

### Public Presentation

Check how special pricing appears.

### Limitations

Do not assume the toggle provides advanced scheduling.

### Future Scheduling

Day-specific SPECIALS management is planned.

### Example Future Promotion

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

### Testing

Verify the effect of the existing control before operational use.

### Documentation

Record significant promotional changes where appropriate.

## Reviewing and Saving New Items

Review the complete item before saving.

### Name

Confirm the correct name.

### Description

Check accuracy and spelling.

### Category

Confirm the approved category.

### Subcategory

Confirm the correct subcategory.

### Price

Verify the base price.

### Modifiers

Check options and surcharges.

### Image

Confirm the intended photo.

### Special Setting

Review promotional state.

### Save Action

Submit the record through the editor.

### Confirmation

Check the displayed result.

### Public Verification

Open the guest-facing menu and confirm the item.

## Finding Existing Items

Before editing, identify the correct record.

### Item Name

Locate the approved menu item.

### Category

Use the item's current grouping.

### Similar Names

Check for items with similar names.

### Pricing

Compare the displayed price when needed.

### Description

Use the description to distinguish similar records.

### Image

Confirm the intended dish photograph.

### Item Identifier

Use the record identifier where available.

### Search Controls

Use only search or filtering controls present in the current editor.

### Duplicate Records

Investigate unexpected duplicates.

### Verification

Confirm the correct item before editing.

## Editing Existing Items

### Step 1 — Locate the Item

Identify the intended record.

### Step 2 — Open Edit

Use the implemented edit action.

### Step 3 — Review Current Information

Check all relevant fields.

### Step 4 — Identify Approved Changes

Confirm the exact requested update.

### Step 5 — Modify Fields

Update only the intended values.

### Step 6 — Check Dependencies

Review category, modifiers, image, and specials.

### Step 7 — Save

Submit the update.

### Step 8 — Confirm Persistence

Verify the updated values remain saved.

### Step 9 — Open Public Menu

Check guest-facing presentation.

### Step 10 — Record Problems

Report any discrepancy.

## Changing Item Categories

Reclassification affects guest navigation.

### Approved Reason

Confirm why the item should move.

### Spreadsheet

Verify the approved destination.

### Parent Category

Choose the correct category.

### Subcategory

Update the child grouping when necessary.

### Modifiers

Ensure existing options remain appropriate.

### Price

Confirm pricing remains unchanged unless separately approved.

### Image

Confirm the media reference remains intact.

### Save

Submit the update.

### Public Verification

Check both the previous and new menu groupings.

### Documentation

Record significant restructuring.

## Updating Prices and Modifiers

Pricing changes require careful review.

### Approval

Confirm the new approved price.

### Base Price

Update the intended amount.

### Modifier Charges

Review related surcharges.

### Market Price

Preserve appropriate market-price behavior.

### Specials

Check whether promotional pricing is affected.

### Data Validation

Ensure values satisfy editor requirements.

### Save

Submit the update.

### Persistence

Confirm the values remain saved.

### Public Menu

Verify all displayed amounts.

### External Ordering

Check Toast separately where operationally required.

### Discrepancies

Escalate material pricing differences.

## Replacing Item Images

Image replacement should not affect unrelated items.

### Step 1 — Locate Item

Open the correct menu record.

### Step 2 — Review Current Image

Confirm the existing asset.

### Step 3 — Select Replacement

Choose approved photography.

### Step 4 — Upload

Use the supported image workflow.

### Step 5 — Review Processing

Confirm the image is accepted.

### Step 6 — Save

Complete any required save operation.

### Step 7 — Verify Storage Reference

Confirm the intended object is associated.

### Step 8 — Verify Public Display

Check the image on the public menu.

### Step 9 — Check Other Items

Ensure unrelated records remain correct.

### Recovery

Preserve an appropriate source image where needed.

## Managing Availability

Availability determines whether guests should see or order an item.

### Temporary Unavailability

An item may be temporarily unavailable.

### Seasonal Items

Some offerings may be limited to specific periods.

### Discontinued Items

Permanent removal may require a different workflow.

### Implementation Boundary

Exact availability controls require verification.

### Manager Action

Use only the currently supported editor controls.

### Public Menu

Confirm the intended visibility.

### External Ordering

Toast may require separate updates.

### Data Integrity

Avoid deleting records merely to handle temporary unavailability.

### Recovery

Confirm the item can be restored where the application supports it.

### Documentation

Record important availability changes through the appropriate process.

## Removing or Discontinuing Items

Removing items can have permanent consequences.

### Implementation Boundary

The exact deletion workflow requires verification.

### Management Approval

Confirm the item should be removed.

### Record Identification

Verify the correct item.

### Related Data

Review modifiers, specials, and other references.

### Images

Determine whether the image is shared.

### Historical Data

Consider whether existing records must be preserved.

### Temporary Alternative

Use supported visibility controls when appropriate.

### Permanent Deletion

Use only the approved implemented workflow.

### Verification

Confirm the public menu reflects the intended outcome.

### Recovery

Do not assume deleted records can be restored automatically.

## Handling Save Errors

A failed save requires diagnosis.

### Validation Error

Check required fields and supported values.

### Authentication Error

Confirm the manager session.

### Authorization Error

Verify the active manager role.

### Database Error

Review relevant application diagnostics.

### Storage Error

Check whether image upload failed.

### Network Error

Determine whether the request reached the server.

### Partial Success

Check whether the record changed before retrying.

### Duplicate Submission

Avoid repeated submissions without verification.

### Evidence

Record the exact safe error message.

### Escalation

Refer unresolved problems to the technical administrator.

## Avoiding Duplicate Records

Duplicate items can confuse guests and managers.

### Before Creation

Search for the intended item.

### Similar Names

Review records with similar wording.

### Category Differences

Check whether the item already exists in another category.

### Save Feedback

Wait for the operation to complete.

### Network Delay

Do not repeatedly select Save during a delay.

### Failed Response

Check whether the first operation succeeded.

### Database Records

Investigate duplicate identifiers or content.

### Correction

Use an approved process to resolve duplicates.

### Verification

Confirm only intended items appear publicly.

### Prevention

Evaluate uniqueness validation where appropriate.

## Public Menu Verification

Administrative changes must be checked from the guest's perspective.

### Step 1 — Open Production or Target Environment

Use the intended website environment.

### Step 2 — Open Full Menu

Access the public menu interface.

### Step 3 — Select Category

Find the appropriate grouping.

### Step 4 — Locate Item

Confirm the item appears.

### Step 5 — Check Name

Verify spelling and formatting.

### Step 6 — Check Description

Confirm accuracy.

### Step 7 — Check Price

Verify the approved amount.

### Step 8 — Check Modifiers

Review options and surcharges.

### Step 9 — Check Image

Confirm the correct photo.

### Step 10 — Check Mobile

Verify the responsive presentation.

### Step 11 — Check Specials

Review promotional presentation if affected.

### Step 12 — Record Outcome

Document any discrepancy.

## Database and Storage Integrity

Menu records depend on consistent data and media references.

### Database Provider

    Supabase PostgreSQL

### Storage Provider

    Supabase Storage

### Menu Records

Maintain valid field values.

### Category Relationships

Preserve approved assignments.

### Modifier Relationships

Avoid invalid or orphaned options.

### Image References

Ensure stored paths resolve.

### Storage Objects

Avoid deleting shared media unintentionally.

### Row-Level Security

Restrict unauthorized mutations.

### Database Migrations

Use approved migration procedures for schema changes.

### Recovery

Application rollback does not automatically restore deleted data.

### Verification

Test changes without affecting unrelated records.

## Security and Permissions

Administrative menu changes require appropriate authorization.

### Authentication

Supabase Auth identifies the user.

### Authorization

The application verifies manager access.

### Required Role

    manager

### Active State

    is_active = true

### Server Protection

Restricted operations must enforce authorization.

### Database Protection

RLS policies must enforce intended access.

### Storage Protection

Media uploads must follow approved permissions.

### Anonymous Users

Must not modify menu records.

### Non-Managers

Must not perform manager-only operations.

### Inactive Managers

Must not retain administrative access.

### Secrets

Do not expose privileged credentials.

### Testing

Verify permitted and denied access contexts.

## Common Manager Workflows

### Workflow A — Add a New Entrée

1. Confirm the item is approved.
2. Prepare its name and description.
3. Confirm category and subcategory.
4. Confirm price and modifiers.
5. Prepare photography.
6. Open Menu Management.
7. Create the item.
8. Save.
9. Verify the public menu.

### Workflow B — Correct an Item Description

1. Locate the correct item.
2. Open Edit.
3. Update the approved wording.
4. Save.
5. Verify public display.

### Workflow C — Update an Item Price

1. Confirm approved pricing.
2. Locate the item.
3. Update the price.
4. Review modifiers.
5. Save.
6. Verify public display.

### Workflow D — Replace a Food Image

1. Locate the item.
2. Select approved photography.
3. Upload the replacement.
4. Save if required.
5. Verify public display.

### Workflow E — Review a Special

1. Identify the intended item.
2. Confirm promotional approval.
3. Review the existing $5 specials toggle.
4. Use only verified supported behavior.
5. Save if appropriate.
6. Verify public presentation.

## Testing and Acceptance

### Access

- [ ] Authorized manager can open Menu Management.
- [ ] Anonymous users cannot modify items.
- [ ] Non-managers cannot modify items.
- [ ] Inactive managers cannot modify items.

### Creation

- [ ] Valid item creation works.
- [ ] Required fields are enforced.
- [ ] Approved categories can be selected.
- [ ] Duplicate submissions are handled appropriately.

### Editing

- [ ] Item name updates correctly.
- [ ] Description updates correctly.
- [ ] Category changes correctly.
- [ ] Price changes correctly.
- [ ] Modifiers persist correctly.

### Images

- [ ] Image upload succeeds.
- [ ] WebP output is produced.
- [ ] 4:3 processing works.
- [ ] Public image loads.

### Specials

- [ ] Existing $5 specials toggle behaves as implemented.

### Public Display

- [ ] Changes appear correctly.
- [ ] Mobile display remains usable.

### Evidence

Record actual results before declaring acceptance.

## Troubleshooting

### Item Not Found

Check the intended category and existing records.

### Add Control Missing

Confirm the current editor implementation and manager authorization.

### Invalid Category

Compare against the approved spreadsheet.

### Save Fails

Review validation, authentication, and database errors.

### Price Incorrect

Inspect the saved value and public display.

### Modifier Missing

Review the item's configured options.

### Image Upload Fails

Check file support and Storage permissions.

### Image Missing Publicly

Verify the object reference and public access.

### Duplicate Item

Check whether a previous save succeeded.

### Special Pricing Unexpected

Confirm the existing toggle behavior.

### Availability Problem

Review only controls supported by the current editor.

### Persistent Error

Escalate with sanitized evidence.

## Future Enhancements

Potential enhancements include:

### Bulk Editing

Update multiple approved items through a controlled workflow.

### Draft and Publish

Separate content editing from public publication.

### Audit History

Track who changed an item and when.

### Change Approval

Require approval for sensitive price or structural changes.

### Item Availability Scheduling

Support approved availability windows.

### Duplicate Detection

Identify potential duplicate items.

### Menu Import Tools

Support validated spreadsheet imports.

### Image Library

Reuse approved assets safely.

### Advanced SPECIALS

Support scheduled promotional pricing.

### Toast POS Integration

Evaluate direct menu synchronization.

### Implementation Boundary

These are future possibilities, not confirmed deployed features.

## Implementation Roadmap

### Stage 1 — Audit Current Controls

Inspect the deployed menu editor.

### Stage 2 — Confirm Data Model

Review menu tables and field constraints.

### Stage 3 — Verify Core Operations

Test creation and editing.

### Stage 4 — Verify Pricing

Test base prices and supported modifiers.

### Stage 5 — Verify Images

Test upload, processing, and public display.

### Stage 6 — Verify Special Pricing

Confirm the existing $5 specials toggle.

### Stage 7 — Verify Security

Test manager authorization and RLS.

### Stage 8 — Train Managers

Review approved operational procedures.

### Stage 9 — Evaluate Enhancements

Prioritize improvements based on operational needs.

### Scheduling

No delivery dates are established by this roadmap.

## Implementation Status

| Capability | Status |
|---|---|
| Protected Menu Management route | Implemented |
| Manager authentication | Implemented |
| Manager authorization | Implemented |
| Menu item creation | Implemented |
| Menu item editing | Implemented |
| Menu image upload | Implemented |
| WebP processing | Implemented |
| 4:3 image output | Implemented |
| Supabase database integration | Implemented |
| Supabase Storage integration | Implemented |
| Existing $5 specials toggle | Implemented |
| Exact item deletion behavior | Verification pending |
| Exact availability controls | Verification pending |
| Exact field validation audit | Verification pending |
| Exact publishing behavior | Verification pending |
| Production menu CRUD acceptance | Pending |
| Production modifier acceptance | Pending |
| Comprehensive RLS acceptance | Pending |
| Menu audit history | Proposed |
| Bulk editing | Proposed |
| Draft-and-publish workflow | Proposed |
| Advanced SPECIALS scheduling | Planned |
| Direct Toast POS synchronization | Under evaluation |

## Related Documentation

- [Menu Management Overview](README.md)
- [Menu Editor Guide](menu-editor-guide.md)
- [Categories and Subcategories](categories-and-subcategories.md)
- [Pricing and Modifiers](pricing-and-modifiers.md)
- [Menu Images](menu-images.md)
- [SPECIALS Management](specials-management.md)
- [Publishing Updates](publishing-updates.md)
- [Menu Troubleshooting](troubleshooting.md)
- [Website Menu System](../02-website/menu-system.md)
- [Admin Menu Management](../04-admin-dashboard/menu-management.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
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
