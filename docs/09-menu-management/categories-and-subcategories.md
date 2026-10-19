# MENU MANAGEMENT — Categories and Subcategories

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Audience:** Restaurant Managers, Menu Administrators, Developers, and QA Reviewers

**Implementation Status:** Menu categorization established; authoritative category and subcategory inventory requires verification against the current approved spreadsheet and database

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Categorization Objectives](#categorization-objectives)
3. [Source of Truth](#source-of-truth)
4. [Current Implementation](#current-implementation)
5. [Category Definitions](#category-definitions)
6. [Subcategory Definitions](#subcategory-definitions)
7. [Approved Category Inventory](#approved-category-inventory)
8. [Category and Subcategory Relationships](#category-and-subcategory-relationships)
9. [Category Naming Standards](#category-naming-standards)
10. [Category Display Order](#category-display-order)
11. [Assigning Menu Items](#assigning-menu-items)
12. [Changing Item Categories](#changing-item-categories)
13. [Adding Categories](#adding-categories)
14. [Editing Categories](#editing-categories)
15. [Removing Categories](#removing-categories)
16. [Managing Subcategories](#managing-subcategories)
17. [Special Category Rules](#special-category-rules)
18. [COCKTAILS Presentation](#cocktails-presentation)
19. [Menu Filters and Navigation](#menu-filters-and-navigation)
20. [Database Representation](#database-representation)
21. [Manager Permissions](#manager-permissions)
22. [Spreadsheet Import and Reconciliation](#spreadsheet-import-and-reconciliation)
23. [Public Menu Verification](#public-menu-verification)
24. [Common Categorization Problems](#common-categorization-problems)
25. [Testing and Acceptance](#testing-and-acceptance)
26. [Future Enhancements](#future-enhancements)
27. [Implementation Roadmap](#implementation-roadmap)
28. [Implementation Status](#implementation-status)
29. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the organizational principles for categories and subcategories in the Fin & Feathers Las Vegas digital menu.

Categories help guests locate restaurant offerings and help managers maintain consistent menu records.

Subcategories provide additional organization where supported by the approved menu structure.

The primary requirement is to preserve the categories and subcategories established in the restaurant's approved menu spreadsheet.

This guide addresses:

- Category definitions.
- Subcategory definitions.
- Approved category inventory.
- Naming conventions.
- Item assignment.
- Menu navigation.
- Category changes.
- Database relationships.
- Spreadsheet reconciliation.
- Manager permissions.
- Testing.
- Future administration.

This document does not authorize the creation of additional categories that are not present in the approved source data.

## Categorization Objectives

### Guest Navigation

Help guests locate menu items quickly.

### Consistent Organization

Use the same category names throughout the application.

### Data Accuracy

Preserve the approved restaurant menu structure.

### Manager Usability

Make item assignment understandable.

### Reliable Filtering

Ensure menu filters display the intended records.

### Responsive Presentation

Support navigation on mobile and desktop.

### Future Administration

Allow approved changes without unnecessary application redevelopment.

### Database Integrity

Avoid invalid category relationships.

### Import Compatibility

Maintain consistency with the approved spreadsheet.

### Change Control

Require approval before introducing structural changes.

## Source of Truth

The approved restaurant menu spreadsheet defines the authoritative menu taxonomy.

### Primary Source

    Approved Fin & Feathers Las Vegas menu spreadsheet

### Scope

The spreadsheet governs:

- Category names.
- Subcategory names.
- Item-to-category assignments.
- Item-to-subcategory assignments.
- Menu item names.
- Approved pricing.
- Applicable modifiers.

### Implementation Records

Database records represent the menu structure used by the application.

### Reconciliation

Differences between spreadsheet data and application data must be investigated.

### Approval

Restaurant management must approve structural changes.

### Documentation Boundary

Do not infer additional categories from website imagery, external menus, or historical examples.

### Verification

The current spreadsheet version and its complete taxonomy should be reviewed before declaring the category inventory final.

## Current Implementation

**Status:** Menu display and administration implemented; detailed taxonomy audit pending

### Public Menu

The website provides a categorized digital menu.

### Administrative Editor

Authorized managers can access:

    /admin/menu

### Database

Supabase PostgreSQL stores menu-related information.

### Authentication

Supabase Auth identifies administrative users.

### Authorization

Manager access is protected by application authorization.

### Current Taxonomy

The original menu import included food and brunch categories.

### Subcategories

Subcategory support must follow the current approved spreadsheet and deployed data model.

### Verification Boundary

The exact category-management controls and underlying schema should be inspected before describing them as implemented.

## Category Definitions

A category is a primary grouping of menu items.

### Examples

Examples from the established original menu import include:

- Starters.
- Entrees.
- Sandwiches.
- Salads.
- Sides.
- Brunch.
- Brunch Sides.
- Brunch Drinks.

### Important Qualification

These examples reflect an established earlier menu import.

They are not a substitute for the current approved spreadsheet.

### Category Function

A category may determine:

- Where an item appears.
- Which filter includes the item.
- How the item is grouped.
- Its relationship to subcategories.

### Category Identity

A category should have a stable identity independent of its display label where supported.

### Category Consistency

Equivalent categories should not be duplicated under slightly different names.

## Subcategory Definitions

A subcategory is a secondary grouping within an approved category.

### Purpose

Subcategories provide more detailed organization.

### Parent Relationship

A subcategory belongs to its intended parent category.

### Item Assignment

An item may be associated with a subcategory where the data model supports it.

### Optionality

Not every category necessarily requires subcategories.

### Naming

Use the exact approved spreadsheet terminology.

### Duplicate Names

Do not assume identical subcategory labels under different parents are interchangeable.

### Validation

The editor should prevent invalid parent-child relationships.

### Public Presentation

Subcategory navigation should match the intended guest experience.

### Verification Boundary

The authoritative subcategory inventory must be extracted from the current spreadsheet.

## Approved Category Inventory

The following inventory distinguishes historical category examples from the current authoritative source.

### Historical Import Categories

| Historical Category | Source Context | Current Approval |
|---|---|---|
| Starters | Original menu import | Verify |
| Entrees | Original menu import | Verify |
| Sandwiches | Original menu import | Verify |
| Salads | Original menu import | Verify |
| Sides | Original menu import | Verify |
| Brunch | Original menu import | Verify |
| Brunch Sides | Original menu import | Verify |
| Brunch Drinks | Original menu import | Verify |

### COCKTAILS

COCKTAILS has been identified in the current menu presentation requirements.

Its exact position in the category and subcategory hierarchy must match the approved spreadsheet.

### Additional Categories

Do not add additional categories unless they are present in the approved source.

### HOOKAH

A HOOKAH category filter must not be included.

### Subcategory Inventory

The full subcategory inventory remains pending verification against the current spreadsheet.

### Finalization

Replace provisional inventory records only after reviewing the approved source.

## Category and Subcategory Relationships

A category hierarchy must remain internally consistent.

### Parent Category

The primary menu grouping.

### Child Subcategory

A secondary grouping belonging to the parent.

### Item Relationship

Each menu item must use the appropriate approved grouping.

### Invalid Relationship

An item should not reference a subcategory belonging to a different category.

### Orphaned Subcategory

A subcategory without a valid parent should be investigated.

### Empty Category

An empty category may require special display handling.

### Empty Subcategory

An empty subcategory should not create confusing guest navigation.

### Data Model

The exact relationship structure depends on the deployed database schema.

### Validation

Both the administrative interface and server-side operations should preserve valid relationships.

## Category Naming Standards

Names should remain consistent with the approved spreadsheet.

### Exact Terminology

Use the approved category name.

### Capitalization

Follow the approved display style.

### Spelling

Avoid typographical inconsistencies.

### Abbreviations

Do not introduce unapproved abbreviations.

### Singular and Plural

Do not alternate between variants without approval.

### Whitespace

Avoid accidental leading or trailing spaces.

### Duplicate Names

Do not create duplicate categories differing only by capitalization or spacing.

### Guest Clarity

Labels should be understandable.

### Internal Identifiers

Stable identifiers should not depend solely on editable display text.

### Approval

Changes to public category names require restaurant approval.

## Category Display Order

Category order affects guest navigation.

### Source Order

Use the approved menu structure as the starting point.

### Public Presentation

The public menu should display categories in the intended sequence.

### Administrative Presentation

The editor should make category selection understandable.

### Stable Ordering

Avoid unpredictable ordering caused by database retrieval behavior.

### Sort Fields

Use the deployed ordering model where supported.

### New Categories

An approved new category requires an approved display position.

### Subcategory Order

Follow the approved hierarchy.

### Mobile

Ensure ordering remains understandable in compact navigation.

### Verification

Check category sequence after structural changes.

### Implementation Boundary

The exact current sorting mechanism requires source and database verification.

## Assigning Menu Items

Managers should assign items to the appropriate approved category.

### Step 1 — Identify the Item

Confirm the correct menu record.

### Step 2 — Review the Spreadsheet

Locate the item's approved category and subcategory.

### Step 3 — Open Menu Management

Navigate to:

    /admin/menu

### Step 4 — Select the Item

Open its supported editing interface.

### Step 5 — Select Category

Choose the approved parent category.

### Step 6 — Select Subcategory

Choose the approved child grouping when applicable.

### Step 7 — Review

Confirm the relationship is correct.

### Step 8 — Save

Use the implemented save action.

### Step 9 — Verify

Check the public menu.

### Step 10 — Record Discrepancies

Report unexpected category behavior.

## Changing Item Categories

Reclassification should be deliberate.

### Valid Reasons

- Correcting an import error.
- Reflecting an approved menu restructure.
- Fixing a misplaced item.
- Aligning with a revised spreadsheet.

### Before Editing

Confirm the approved destination.

### Parent Relationship

Review the item's current category.

### Subcategory Relationship

Check whether the existing subcategory remains valid.

### Modifiers

Confirm that item options remain appropriate.

### Images

Ensure image references remain intact.

### Pricing

Category changes should not unintentionally change pricing.

### Save

Apply the approved update.

### Verification

Confirm the item appears in the intended public category.

### Audit

Record significant restructuring through the approved process.

## Adding Categories

Adding a category changes the menu structure.

### Implementation Boundary

The current editor's category-creation controls require verification.

### Approval

Obtain restaurant approval before creating a new category.

### Source Spreadsheet

Update or confirm the authoritative source.

### Name

Use the approved label.

### Position

Determine the intended display order.

### Subcategories

Define approved child groupings.

### Database

Use only the implemented administrative or migration process.

### Public Menu

Confirm the category appears correctly.

### Security

Only authorized personnel should perform structural changes.

### Documentation

Update the taxonomy reference after approval.

## Editing Categories

Category edits can affect many menu items.

### Implementation Boundary

Do not assume the editor supports category renaming.

### Before Editing

Identify all affected items.

### Naming Change

Confirm the new approved label.

### Subcategories

Review dependent child groupings.

### Filters

Verify the public menu navigation.

### Existing Records

Ensure item assignments remain valid.

### Database

Use the approved update mechanism.

### Verification

Check every affected menu area.

### Rollback

Prepare an appropriate correction strategy.

### Documentation

Record approved structural changes.

## Removing Categories

Category removal requires special care.

### Implementation Boundary

The exact deletion capability is not established.

### Empty Category

Determine whether the category contains any items.

### Existing Items

Identify all affected records.

### Subcategories

Identify dependent child groupings.

### Reassignment

Obtain approval before moving items elsewhere.

### Public Menu

Confirm no invalid filter remains.

### Database Integrity

Avoid orphaned references.

### Storage

Category removal should not unintentionally delete unrelated images.

### Recovery

Use an approved backup or correction strategy.

### Authorization

Restrict destructive operations.

## Managing Subcategories

Subcategory management should preserve the approved hierarchy.

### Source

Use the current approved spreadsheet.

### Parent Category

Confirm the correct parent.

### Subcategory Name

Use the approved label.

### Ordering

Follow the approved sequence.

### Item Assignment

Ensure affected items reference the intended grouping.

### Renaming

Review all dependent records.

### Removal

Reassign or resolve dependent items before deletion.

### Editor Support

Confirm whether the current editor provides these controls.

### Validation

Reject invalid parent-child relationships.

### Verification

Check the public menu after changes.

## Special Category Rules

The project has explicit category requirements.

### Spreadsheet Authority

Only use approved categories and subcategories.

### HOOKAH Restriction

Do not introduce a HOOKAH category filter.

### COCKTAILS Images

Do not require images for COCKTAILS.

### Existing Categories

Preserve approved food and beverage organization.

### New Categories

Require approval before introduction.

### Specials

SPECIALS are promotional behavior and should not automatically become a new menu category.

### Featured Items

An item featured as a special should retain its appropriate menu classification unless an approved design requires otherwise.

### External Ordering

Do not assume Toast uses the same category hierarchy.

### Future Integration

Category mapping will require separate verification if Toast synchronization is developed.

## COCKTAILS Presentation

COCKTAILS has a specific image requirement.

### Image Policy

No images for COCKTAILS.

### Text Presentation

Cocktail entries should remain readable without photography.

### Pricing

Use approved beverage pricing.

### Descriptions

Use accurate menu descriptions.

### Category Placement

Follow the current approved spreadsheet.

### Filtering

COCKTAILS should appear only through its approved category or subcategory structure.

### No Forced Placeholder

Do not require a generic image merely to satisfy an image field.

### Responsive Design

Ensure text-only entries display correctly on mobile.

### Administrative Validation

The editor should not incorrectly require an image for these items.

### Verification

Test the public presentation without cocktail images.

## Menu Filters and Navigation

Filters help guests navigate the menu.

### Category Filters

Display only approved categories.

### Subcategory Filters

Display approved subcategories where applicable.

### Selection

Selecting a category should show the intended items.

### Empty Results

Empty selections should have understandable behavior.

### Active State

The interface should indicate the current selection.

### Mobile Layout

Filters must remain usable on narrow screens.

### Keyboard Access

Controls should be keyboard accessible.

### HOOKAH

No HOOKAH category filter.

### COCKTAILS

Use the approved hierarchy.

### Verification

Test all filters after taxonomy changes.

## Database Representation

Categories and subcategories are represented through the application's data model.

### Database Provider

    Supabase PostgreSQL

### Menu Records

Store the information required to classify items.

### Category Identifiers

Use the deployed schema's approved identifiers.

### Subcategory Identifiers

Use the deployed schema's supported relationships.

### Display Names

Present approved labels.

### Sort Order

Use the implemented ordering model.

### Constraints

Preserve valid category assignments.

### Row-Level Security

Restrict unauthorized structural changes.

### Schema Boundary

The exact table names and columns require inspection.

### Migration

Schema changes should use the approved migration workflow.

### Recovery

Do not assume reverting application code reverses database changes.

## Manager Permissions

Category administration is protected functionality.

### Authentication

    Supabase Auth

### Manager Authorization

    requireManager()

### Staff Role

    manager

### Active Status

    is_active = true

### Item Assignment

Authorized managers may use supported item-editing controls.

### Structural Changes

Category creation, renaming, and deletion may require additional approval.

### Server Protection

Restricted mutations must be authorized server-side.

### Database Protection

RLS must enforce intended permissions.

### Unauthorized Users

Anonymous and non-manager users must not modify the taxonomy.

### Verification

Test the relevant authorization scenarios.

## Spreadsheet Import and Reconciliation

The approved spreadsheet remains the primary taxonomy reference.

### Step 1 — Identify Source Version

Confirm the approved spreadsheet.

### Step 2 — Extract Categories

List all unique category names.

### Step 3 — Extract Subcategories

List all unique approved subcategories.

### Step 4 — Map Relationships

Identify each subcategory's parent.

### Step 5 — Review Item Assignments

Confirm that each item uses the correct grouping.

### Step 6 — Compare Database

Identify missing or unexpected categories.

### Step 7 — Compare Public Menu

Check guest-facing labels and filters.

### Step 8 — Identify Discrepancies

Record differences.

### Step 9 — Obtain Approval

Confirm the intended correction.

### Step 10 — Apply Changes

Use the approved editor or technical workflow.

### Step 11 — Verify

Repeat the comparison after correction.

## Public Menu Verification

Every structural change should be checked publicly.

### Category List

Confirm the approved categories appear.

### Subcategory List

Confirm the intended child groupings appear.

### Category Order

Verify the approved sequence.

### Item Placement

Check representative items in every affected category.

### Item Counts

Investigate unexpected missing or duplicate items.

### Filters

Verify category and subcategory selection.

### COCKTAILS

Confirm text-only presentation works.

### HOOKAH

Confirm no HOOKAH filter appears.

### Mobile

Check compact navigation.

### Desktop

Check wider navigation.

### Error Handling

Report missing or invalid categories.

## Common Categorization Problems

### Missing Category

Compare the database and public menu with the spreadsheet.

### Duplicate Category

Check naming differences and identifiers.

### Wrong Subcategory

Review the parent-child relationship.

### Missing Menu Item

Confirm its category assignment and visibility.

### Unexpected Filter

Check the approved taxonomy and current UI configuration.

### Incorrect Ordering

Review the implemented sort mechanism.

### Empty Category

Check whether it contains active items.

### Category Save Failure

Review validation, authorization, and database errors.

### COCKTAILS Image Error

Verify that no image requirement has been introduced.

### HOOKAH Filter Appears

Treat this as a violation of the approved menu presentation requirements.

### Persistent Issue

Escalate with the affected records and safe diagnostic evidence.

## Testing and Acceptance

### Source Accuracy

- [ ] Approved spreadsheet identified.
- [ ] Category inventory reconciled.
- [ ] Subcategory inventory reconciled.
- [ ] Item assignments reconciled.

### Public Navigation

- [ ] Category filters work.
- [ ] Subcategory filters work where applicable.
- [ ] Ordering is correct.
- [ ] Empty states behave appropriately.

### Special Rules

- [ ] No HOOKAH category filter.
- [ ] COCKTAILS do not require images.

### Manager Administration

- [ ] Authorized item categorization works.
- [ ] Invalid category assignments are rejected.
- [ ] Unsupported structural actions are unavailable.

### Security

- [ ] Anonymous writes rejected.
- [ ] Non-manager writes rejected.
- [ ] Inactive manager writes rejected.
- [ ] Authorized operations work.

### Responsive Design

- [ ] Mobile category navigation works.
- [ ] Desktop category navigation works.

### Evidence

Record actual test results before declaring acceptance.

## Future Enhancements

Potential enhancements require separate approval.

### Category Administration

A dedicated category editor.

### Subcategory Administration

A dedicated hierarchy editor.

### Drag-and-Drop Ordering

Manager-controlled category order.

### Bulk Reclassification

Controlled reassignment of multiple items.

### Taxonomy Validation

Automated comparison against approved source data.

### Import Preview

Review spreadsheet changes before applying them.

### Audit History

Track structural changes.

### Draft Changes

Stage category changes before public publication.

### Toast Mapping

Map website categories to Toast POS categories if integration is approved.

### Implementation Boundary

These enhancements are proposals rather than established production capabilities.

## Implementation Roadmap

### Stage 1 — Review Source Spreadsheet

Confirm the authoritative taxonomy.

### Stage 2 — Audit Database

Inspect actual category and subcategory records.

### Stage 3 — Audit Editor

Confirm available administrative controls.

### Stage 4 — Reconcile Differences

Identify discrepancies between source and implementation.

### Stage 5 — Validate Public Menu

Verify labels, order, filters, and item placement.

### Stage 6 — Verify Special Rules

Confirm HOOKAH and COCKTAILS requirements.

### Stage 7 — Verify Security

Test manager authorization and database policies.

### Stage 8 — Train Managers

Explain approved categorization procedures.

### Stage 9 — Evaluate Enhancements

Consider dedicated taxonomy management features.

### Scheduling

This roadmap does not establish a committed completion date.

## Implementation Status

| Capability | Status |
|---|---|
| Public categorized menu | Implemented |
| Administrative Menu Management | Implemented |
| Menu item category assignment | Established; exact controls require verification |
| Historical category inventory | Documented |
| Current approved category inventory | Verification pending |
| Current approved subcategory inventory | Verification pending |
| Spreadsheet source-of-truth policy | Established |
| HOOKAH filter exclusion | Required |
| COCKTAILS image exclusion | Required |
| Category filter behavior | Verification pending |
| Subcategory filter behavior | Verification pending |
| Category display ordering | Verification pending |
| Dedicated category creation UI | Not established |
| Dedicated category editing UI | Not established |
| Dedicated category deletion UI | Not established |
| Dedicated subcategory management UI | Not established |
| Database taxonomy audit | Pending |
| Public taxonomy acceptance testing | Pending |
| Manager authorization testing | Pending |
| Automated taxonomy validation | Proposed |
| Bulk reclassification | Proposed |
| Toast POS category mapping | Under evaluation |

## Related Documentation

- [Menu Management Overview](README.md)
- [Menu Editor Guide](menu-editor-guide.md)
- [Adding and Editing Items](adding-editing-items.md)
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
- [Manager Guide](../08-operations/manager-guide.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Operations Troubleshooting](../08-operations/troubleshooting.md)
- [Toast POS Integration Overview](../10-toast-pos-integration/integration-overview.md)
- [Master Documentation Index](../README.md)

---

[Back to Menu Management Overview](README.md)
