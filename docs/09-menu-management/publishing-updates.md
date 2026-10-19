# MENU MANAGEMENT — Publishing Updates

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Audience:** Authorized Restaurant Managers, Menu Administrators, Developers, and QA Reviewers

**Implementation Status:** Menu editing and saving established; exact public-update behavior, cache invalidation, draft publishing, and production acceptance require verification

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Publishing Objectives](#publishing-objectives)
3. [Current Implementation](#current-implementation)
4. [Publishing Terminology](#publishing-terminology)
5. [Current Publishing Architecture](#current-publishing-architecture)
6. [Manager Access Requirements](#manager-access-requirements)
7. [Types of Menu Updates](#types-of-menu-updates)
8. [Pre-Publication Preparation](#pre-publication-preparation)
9. [Approving Menu Changes](#approving-menu-changes)
10. [Saving New Menu Items](#saving-new-menu-items)
11. [Publishing Item Edits](#publishing-item-edits)
12. [Publishing Price Changes](#publishing-price-changes)
13. [Publishing Modifier Changes](#publishing-modifier-changes)
14. [Publishing Image Changes](#publishing-image-changes)
15. [Publishing Category Changes](#publishing-category-changes)
16. [Publishing SPECIALS](#publishing-specials)
17. [Menu Availability and Visibility](#menu-availability-and-visibility)
18. [Database Persistence](#database-persistence)
19. [Public Menu Data Retrieval](#public-menu-data-retrieval)
20. [Caching and Revalidation](#caching-and-revalidation)
21. [Production and Preview Environments](#production-and-preview-environments)
22. [Public Menu Verification](#public-menu-verification)
23. [Mobile and Desktop Acceptance](#mobile-and-desktop-acceptance)
24. [Handling Failed Updates](#handling-failed-updates)
25. [Correcting Published Errors](#correcting-published-errors)
26. [Rollback and Recovery](#rollback-and-recovery)
27. [Database and Storage Security](#database-and-storage-security)
28. [Toast POS Coordination](#toast-pos-coordination)
29. [Manager Publishing Checklist](#manager-publishing-checklist)
30. [Common Publishing Workflows](#common-publishing-workflows)
31. [Troubleshooting](#troubleshooting)
32. [Testing and Acceptance](#testing-and-acceptance)
33. [Future Draft-and-Publish System](#future-draft-and-publish-system)
34. [Implementation Roadmap](#implementation-roadmap)
35. [Implementation Status](#implementation-status)
36. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the operational process for publishing menu updates on the Fin & Feathers Las Vegas website.

The website includes protected Menu Management functionality through which authorized managers can maintain menu records.

However, a successful administrative save does not by itself establish that a guest can see the intended update.

A complete publishing process must distinguish three outcomes:

1. The administrative operation was accepted.
2. The intended data was persisted.
3. The public menu displays the correct information.

This guide establishes procedures for confirming those outcomes.

It also identifies future improvements, including a dedicated draft-and-publish workflow, approval controls, and publishing history.

These future capabilities must not be described as deployed until verified.

## Publishing Objectives

### Accuracy

Publish approved restaurant information.

### Reliability

Ensure saved updates persist correctly.

### Visibility

Confirm changes appear in the intended public menu.

### Security

Restrict modifications to authorized managers.

### Consistency

Keep item names, categories, prices, and images aligned.

### Performance

Avoid unnecessary delays in public presentation.

### Traceability

Record significant menu changes.

### Recovery

Support safe correction of publishing mistakes.

### Operational Coordination

Communicate changes that affect external ordering.

### Future Readiness

Prepare for more sophisticated publishing controls.

## Current Implementation

**Status:** Protected menu administration established

### Administrative Route

    /admin/menu

### Application

    Next.js App Router

### Database

    Supabase PostgreSQL

### Authentication

    Supabase Auth

### Authorization

    requireManager()

### Storage

    Supabase Storage

### Established Capabilities

- Menu item administration.
- Menu item editing.
- Menu image uploads.
- WebP image processing.
- Existing $5 specials toggle.

### Verification Required

- Exact save response behavior.
- Whether updates become publicly visible immediately.
- Whether the public menu is dynamically rendered.
- Whether caching or revalidation affects updates.
- Whether item visibility controls exist.
- Whether a separate publishing state exists.

### Not Established

A dedicated draft-and-publish workflow is not confirmed as implemented.

## Publishing Terminology

The following terms distinguish different stages of a menu update.

### Edit

A change made to an item through the administrative interface.

### Save

An operation intended to persist edited information.

### Persistence

Successful storage of the intended data.

### Publication

Availability of the intended information to public website visitors.

### Verification

Confirmation that the public presentation matches the approved change.

### Draft

Content that has been prepared but not publicly released.

### Approval

Restaurant authorization to make a change.

### Revalidation

A mechanism that refreshes cached or generated application content.

### Rollback

An approved action intended to restore a previous state.

### Important Qualification

These terms describe operational concepts and do not necessarily correspond to current database status fields.

## Current Publishing Architecture

Menu publishing involves multiple systems.

### Manager Interface

Authorized staff access Menu Management.

### Application Server

The application processes supported administrative operations.

### Authentication

Supabase Auth identifies the manager.

### Authorization

The application verifies manager permissions.

### Database

Supabase PostgreSQL stores menu records.

### Storage

Supabase Storage holds menu images.

### Public Application

The website presents menu content.

### Hosting

Vercel hosts the application.

### Caching

The current caching strategy requires verification.

### External Ordering

Toast remains a separate ordering system.

### Verification Boundary

The exact data-fetching and cache-invalidation mechanisms must be confirmed from the current source code.

## Manager Access Requirements

Publishing-related changes are restricted operations.

### Login

    /admin/login

### Dashboard

    /admin

### Menu Management

    /admin/menu

### Authentication Provider

    Supabase Auth

### Role Table

    staff_roles

### Required Role

    manager

### Active State

    is_active = true

### Authorization Helper

    requireManager()

### Unauthorized Users

Anonymous visitors and non-managers must not modify menu records.

### Security Requirement

Manager authorization must be enforced beyond the visible interface.

## Types of Menu Updates

Different changes require different verification procedures.

### New Item

A new approved dish is added.

### Item Name

An existing item is renamed.

### Description

Guest-facing text is revised.

### Category

An item is moved to another approved grouping.

### Subcategory

An item receives an approved secondary classification.

### Price

A base price changes.

### Modifier

An option or surcharge changes.

### Image

A food photograph is added or replaced.

### Special

An approved promotional setting changes.

### Availability

An item becomes available or unavailable where supported.

### Removal

A discontinued item is removed through an approved workflow.

## Pre-Publication Preparation

Prepare each change before editing the live menu.

### Step 1 — Identify the Item

Confirm the intended record.

### Step 2 — Confirm Approval

Verify that restaurant management authorized the change.

### Step 3 — Review Source Data

Compare against the approved menu spreadsheet or later approved instructions.

### Step 4 — Identify Dependencies

Check related prices, modifiers, categories, and images.

### Step 5 — Prepare Content

Confirm names, descriptions, and amounts.

### Step 6 — Prepare Media

Select approved photography where needed.

### Step 7 — Review External Ordering

Identify whether Toast must be updated separately.

### Step 8 — Consider Timing

Coordinate changes with restaurant operations.

### Step 9 — Plan Verification

Determine what the public menu should display.

### Step 10 — Proceed

Use the supported manager editor.

## Approving Menu Changes

Restaurant approval should precede publication.

### New Dishes

Confirm the item is authorized for the menu.

### Pricing

Confirm the approved price.

### Modifiers

Confirm options and additional charges.

### Descriptions

Review substantive ingredient or preparation changes.

### Photography

Use approved food imagery.

### Categories

Follow the approved spreadsheet taxonomy.

### SPECIALS

Confirm promotional pricing and timing.

### Removal

Confirm that an item should be discontinued.

### External Ordering

Coordinate changes that affect Toast.

### Implementation Boundary

An automated approval workflow is not established as implemented.

## Saving New Menu Items

### Step 1 — Open Menu Management

Navigate to the protected editor.

### Step 2 — Review Existing Items

Check for duplicates.

### Step 3 — Create Item

Use the implemented creation control.

### Step 4 — Enter Approved Information

Complete supported fields.

### Step 5 — Assign Category

Use the approved taxonomy.

### Step 6 — Enter Price

Use approved pricing.

### Step 7 — Configure Options

Add supported modifiers.

### Step 8 — Upload Image

Use approved photography where appropriate.

### Step 9 — Save

Submit the record.

### Step 10 — Confirm Persistence

Check that the record exists.

### Step 11 — Verify Public Menu

Confirm correct guest-facing presentation.

## Publishing Item Edits

### Step 1 — Locate Item

Identify the intended record.

### Step 2 — Open Edit

Use the supported editor.

### Step 3 — Review Existing Data

Check the current values.

### Step 4 — Confirm Change

Identify the approved update.

### Step 5 — Modify Fields

Change only the intended information.

### Step 6 — Review Dependencies

Check categories, prices, modifiers, and images.

### Step 7 — Save

Submit the edit.

### Step 8 — Confirm Persistence

Verify that the updated values remain stored.

### Step 9 — Open Public Menu

Check the guest-facing item.

### Step 10 — Record Discrepancies

Report any mismatch.

## Publishing Price Changes

Price updates require particular care.

### Approval

Confirm the new price.

### Correct Item

Verify the intended record.

### Standard Price

Update the base price.

### Modifier Charges

Review associated surcharges.

### Market Price

Preserve appropriate market-price behavior.

### SPECIALS

Check promotional pricing interactions.

### Save

Submit the update.

### Persistence

Confirm the intended amount was stored.

### Public Verification

Check the displayed price.

### Toast Coordination

Update or verify external ordering prices separately.

### Escalation

Investigate any material pricing discrepancy immediately.

## Publishing Modifier Changes

Modifiers influence guest expectations.

### Parent Item

Confirm the correct dish.

### Modifier Group

Identify the affected group.

### Option Name

Use approved terminology.

### Charge

Confirm the surcharge.

### Required Selection

Use only implemented selection rules.

### Save

Submit supported changes.

### Persistence

Confirm the options remain associated.

### Public Display

Check labels and charges.

### Other Items

Verify shared options did not change unintentionally.

### Toast

Review external ordering configuration separately.

## Publishing Image Changes

Image updates involve both database and Storage operations.

### Source

Use approved photography.

### Aspect Ratio

    4:3

### Output Format

    WebP

### Storage Bucket

    website-media

### Storage Prefix

    menu/

### Upload

Use the supported manager workflow.

### Association

Confirm the intended menu item references the image.

### Save

Complete any required save action.

### Public Display

Check the image in the guest-facing menu.

### Caching

Investigate stale imagery if the previous image remains visible.

## Publishing Category Changes

Category changes affect menu navigation.

### Source of Truth

Use the approved spreadsheet.

### Parent Category

Select the correct grouping.

### Subcategory

Confirm the appropriate child grouping.

### HOOKAH

Do not introduce a HOOKAH category filter.

### COCKTAILS

Follow the approved category structure without requiring images.

### Item Placement

Confirm the item appears in the intended location.

### Previous Category

Check that the item is no longer incorrectly listed.

### Filter Behavior

Test category navigation.

### Mobile

Verify the updated grouping remains accessible.

### Approval

Do not introduce unapproved categories.

## Publishing SPECIALS

The editor includes an existing $5 specials toggle.

### Current Control

The special-related toggle is implemented.

### Exact Behavior

Its current effect requires verification.

### Manager Approval

Use only approved promotions.

### Standard Price

Avoid unintended permanent changes.

### Save

Use the supported operation.

### Public Verification

Confirm the intended promotional presentation.

### Day-Specific Scheduling

Advanced recurring SPECIALS are planned.

### Example Future Promotion

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

### External Ordering

Coordinate promotional pricing with Toast separately.

### Important Boundary

Do not assume automatic activation or expiration is available.

## Menu Availability and Visibility

Availability and publication are related but distinct.

### Available Item

An item the restaurant currently offers.

### Unavailable Item

An item that cannot currently be offered.

### Published Item

An item visible on the public website.

### Hidden Item

An item not shown publicly.

### Important Distinction

An unavailable item is not necessarily an unpublished item.

### Implementation Boundary

Exact availability and visibility controls require verification.

### Temporary Changes

Use supported controls where available.

### Discontinued Items

Follow approved removal procedures.

### Public Verification

Confirm the intended visibility.

### Toast Coordination

Check external availability separately.

## Database Persistence

Saving should result in durable data changes.

### Database

    Supabase PostgreSQL

### Save Request

The application submits an authorized mutation.

### Validation

The server should reject invalid values.

### Authorization

Manager permissions must be enforced.

### Database Operation

The intended record is inserted or updated.

### Response

The application reports success or failure.

### Verification

Reopen or retrieve the record to confirm persistence.

### Partial Failure

A network error may occur after the database operation succeeds.

### Duplicate Prevention

Check persistence before retrying a creation operation.

### Recovery

Do not assume application rollback restores previous database values.

## Public Menu Data Retrieval

The public website retrieves menu information through its implemented data-access layer.

### Source

The current menu data source must be confirmed from the application.

### Database

Supabase PostgreSQL supports the established menu administration system.

### Rendering

The exact public rendering strategy requires verification.

### Dynamic Retrieval

Some applications fetch data for each request.

### Cached Retrieval

Other applications reuse previously generated results.

### Client Retrieval

Some interfaces fetch data in the browser.

### Implementation Boundary

Do not assume which strategy the current public menu uses.

### Verification

Inspect the current menu components and data-fetching code.

### Acceptance

Confirm that approved changes appear publicly.

## Caching and Revalidation

Caching may influence update visibility.

### Browser Cache

A browser may retain prior responses.

### Application Cache

Next.js may cache data or rendered output depending on implementation.

### CDN Cache

Media and responses may be cached.

### Image URLs

An unchanged image URL may continue displaying an older asset.

### Revalidation

The application may use a revalidation mechanism.

### Current Behavior

Exact cache configuration requires code inspection.

### Manager Expectations

Do not promise immediate visibility without verification.

### Troubleshooting

Compare administrative persistence with public presentation.

### Safe Correction

Use the approved application-specific cache strategy.

### Avoidance

Do not make arbitrary production cache changes.

## Production and Preview Environments

Publishing behavior may differ across environments.

### Production

    https://finandfeatherslv.live

### Hosting

    Vercel

### Preview Deployments

Vercel may provide separate preview environments.

### Database Configuration

Each environment's database connection must be verified.

### Storage Configuration

Each environment's Storage connection must be verified.

### Environment Variables

Use the approved deployment configuration.

### Secrets

Do not expose `.env.local` or privileged credentials.

### Data Separation

Do not assume preview environments use isolated data.

### Verification

Confirm the target environment before testing mutations.

### Safety

Avoid test records in production without approval.

## Public Menu Verification

Every meaningful menu update requires public verification.

### Step 1 — Confirm Save

Check the administrative result.

### Step 2 — Confirm Persistence

Verify the intended record values.

### Step 3 — Open Public Website

Visit the intended environment.

### Step 4 — Open Full Menu

Access the guest-facing menu.

### Step 5 — Select Category

Navigate to the appropriate grouping.

### Step 6 — Locate Item

Find the affected dish.

### Step 7 — Check Text

Review the name and description.

### Step 8 — Check Price

Confirm approved pricing.

### Step 9 — Check Modifiers

Review options and charges.

### Step 10 — Check Image

Confirm the intended photograph.

### Step 11 — Check Specials

Review promotional presentation if applicable.

### Step 12 — Record Outcome

Document discrepancies.

## Mobile and Desktop Acceptance

Menu updates must work across device sizes.

### Mobile Priority

The website follows a mobile-first design.

### Category Navigation

Confirm filters remain usable.

### Item Names

Avoid unintended truncation.

### Descriptions

Check text wrapping.

### Prices

Ensure amounts remain readable.

### Modifier Lists

Verify options do not overflow.

### Images

Preserve intended proportions.

### Empty Images

Confirm image-free entries remain readable.

### Desktop

Check the wider layout.

### Accessibility

Verify keyboard and readable-text behavior where applicable.

### Acceptance

Record actual results rather than assuming responsive correctness.

## Handling Failed Updates

A failed save should be investigated before retrying.

### Validation Error

Check required fields and supported values.

### Authentication Error

Confirm the manager session.

### Authorization Error

Review active manager permissions.

### Database Error

Inspect relevant safe diagnostics.

### Storage Error

Check image upload status.

### Network Error

Determine whether the operation may have succeeded.

### Partial Success

Confirm whether data changed before repeating the request.

### Duplicate Risk

Avoid repeated creation submissions.

### Evidence

Capture the exact error without exposing secrets.

### Escalation

Refer unresolved failures to the technical administrator.

## Correcting Published Errors

Published mistakes should be corrected promptly.

### Identify Error

Determine what is wrong.

### Assess Impact

Evaluate guest-facing consequences.

### Confirm Approved Value

Verify the intended correction.

### Correct Record

Open the appropriate menu item.

### Apply Change

Use supported administrative controls.

### Save

Submit the correction.

### Confirm Persistence

Check stored values.

### Verify Public Display

Confirm the correction is visible.

### External Ordering

Check Toast if the issue affects ordering.

### Incident Record

Document material errors through the appropriate process.

## Rollback and Recovery

Menu recovery differs from application deployment rollback.

### Application Rollback

Reverts deployed application code to an earlier release.

### Database Recovery

Restores or corrects menu records.

### Storage Recovery

Restores missing or damaged media assets.

### Important Distinction

A Vercel rollback does not automatically undo database edits.

### Price Correction

An incorrect price may require a new authorized update.

### Deleted Record

Recovery depends on available backups and data retention.

### Removed Image

Storage recovery may require a separate process.

### Approval

Destructive recovery actions require authorization.

### Testing

Verify the corrected public state.

### Documentation

Record significant recovery actions.

## Database and Storage Security

Publishing depends on protected data operations.

### Authentication

    Supabase Auth

### Authorization

    requireManager()

### Role Table

    staff_roles

### Required Role

    manager

### Active State

    is_active = true

### Database

    Supabase PostgreSQL

### Storage

    Supabase Storage

### RLS

Database and Storage policies must enforce intended access.

### Service Credentials

Privileged keys must remain server-side.

### Validation

Server operations should validate restricted mutations.

### Testing

Verify permitted and denied publishing operations.

## Toast POS Coordination

The website currently uses external Toast online ordering.

### Website Menu

Presents restaurant information.

### Toast Ordering

Handles the external ordering experience.

### Direct Synchronization

Not established as implemented.

### Price Changes

May require separate Toast updates.

### Modifier Changes

May require separate Toast configuration.

### Item Availability

May require separate Toast availability changes.

### SPECIALS

May require separate promotion configuration.

### Manager Coordination

Confirm the intended information across systems.

### Guest Experience

Avoid advertising pricing that differs unexpectedly at checkout.

### Future Integration

Evaluate direct synchronization through the dedicated Toast documentation.

## Manager Publishing Checklist

Before declaring a menu change complete:

### Approval

- [ ] Restaurant approval confirmed.
- [ ] Correct item identified.

### Content

- [ ] Item name correct.
- [ ] Description accurate.
- [ ] Category correct.
- [ ] Subcategory correct where applicable.

### Pricing

- [ ] Base price approved.
- [ ] Modifiers reviewed.
- [ ] Specials reviewed where applicable.

### Media

- [ ] Correct image associated.
- [ ] Image loads publicly.
- [ ] COCKTAILS do not require images.

### Publishing

- [ ] Save completed.
- [ ] Data persistence confirmed.
- [ ] Public menu verified.
- [ ] Mobile display reviewed.
- [ ] Toast coordination completed where needed.

## Common Publishing Workflows

### Workflow A — Publish a New Item

1. Confirm approval.
2. Prepare item information.
3. Open Menu Management.
4. Create the record.
5. Save.
6. Confirm persistence.
7. Verify public display.
8. Check Toast separately if needed.

### Workflow B — Publish a Price Change

1. Confirm approved pricing.
2. Locate the item.
3. Update the amount.
4. Review modifiers.
5. Save.
6. Confirm persistence.
7. Verify public price.
8. Coordinate Toast.

### Workflow C — Publish a New Image

1. Select approved photography.
2. Open the correct item.
3. Upload the image.
4. Complete any required save.
5. Confirm association.
6. Verify public display.

### Workflow D — Correct a Published Error

1. Identify the discrepancy.
2. Confirm the approved correction.
3. Update the record.
4. Save.
5. Confirm persistence.
6. Verify public correction.
7. Record significant incidents.

## Troubleshooting

### Save Reports Success but Public Menu Is Unchanged

Check persistence, data retrieval, and caching.

### Item Missing Publicly

Review category assignment and supported visibility behavior.

### Price Incorrect

Compare approved pricing with saved and displayed values.

### Modifier Missing

Inspect the item's modifier configuration.

### Image Missing

Check the Storage object and image reference.

### Old Image Appears

Investigate caching and object replacement behavior.

### Category Filter Incorrect

Compare the public taxonomy with the approved spreadsheet.

### Special Not Displayed

Verify the current toggle's actual behavior.

### Toast Differs

Check the external ordering configuration.

### Access Denied

Confirm the manager account and active role.

### Persistent Failure

Escalate with sanitized diagnostic evidence.

## Testing and Acceptance

### Administrative Save

- [ ] Authorized manager can save valid changes.
- [ ] Invalid changes are rejected.
- [ ] Save errors are understandable.

### Persistence

- [ ] Created records persist.
- [ ] Edited records persist.
- [ ] Failed responses do not cause accidental duplicates.

### Public Visibility

- [ ] New items appear correctly.
- [ ] Edited text appears correctly.
- [ ] Prices appear correctly.
- [ ] Modifiers appear correctly.
- [ ] Images appear correctly.
- [ ] Category navigation remains correct.

### Security

- [ ] Anonymous mutations are rejected.
- [ ] Non-manager mutations are rejected.
- [ ] Inactive manager mutations are rejected.

### Responsive Design

- [ ] Mobile verification passes.
- [ ] Desktop verification passes.

### Evidence

Record actual results before declaring acceptance.

## Future Draft-and-Publish System

A future publishing system may separate editing from public release.

### Draft State

Allow managers to prepare unpublished changes.

### Review State

Support review of proposed changes.

### Approval

Require authorization for selected changes.

### Scheduled Publication

Release changes at an approved time.

### Version History

Retain prior published versions.

### Change Comparison

Show differences before publication.

### Rollback

Support controlled restoration of prior content.

### Audit History

Track who approved and published changes.

### Notifications

Inform relevant staff about important releases.

### Toast Coordination

Support operational checks before publishing.

### Implementation Boundary

These are proposed capabilities, not confirmed current functionality.

## Implementation Roadmap

### Stage 1 — Audit Current Save Behavior

Inspect administrative mutation paths.

### Stage 2 — Verify Data Persistence

Confirm actual database writes.

### Stage 3 — Audit Public Retrieval

Inspect public menu data fetching.

### Stage 4 — Audit Caching

Confirm revalidation and cache behavior.

### Stage 5 — Test Media Updates

Verify Storage association and public image loading.

### Stage 6 — Verify Manager Authorization

Test application and database access controls.

### Stage 7 — Establish Publishing Checklist

Train managers to verify public changes.

### Stage 8 — Coordinate Toast Procedures

Document external ordering responsibilities.

### Stage 9 — Evaluate Draft Publishing

Assess future approval and versioning requirements.

### Stage 10 — Perform Acceptance Testing

Record verified behavior in the intended environment.

### Scheduling

No committed completion dates are established by this roadmap.

## Implementation Status

| Capability | Status |
|---|---|
| Protected Menu Management | Implemented |
| Menu item creation | Implemented |
| Menu item editing | Implemented |
| Menu image upload | Implemented |
| WebP image processing | Implemented |
| Supabase database integration | Implemented |
| Supabase Storage integration | Implemented |
| Manager authentication | Implemented |
| Manager authorization | Implemented |
| Existing $5 specials toggle | Implemented |
| Exact save-response audit | Pending |
| Public data retrieval audit | Pending |
| Cache and revalidation audit | Pending |
| Exact visibility controls | Verification pending |
| Dedicated draft state | Not established |
| Separate publish action | Not established |
| Automated approval workflow | Proposed |
| Scheduled publication | Proposed |
| Menu version history | Proposed |
| One-click content rollback | Proposed |
| Production publishing acceptance | Pending |
| Comprehensive RLS acceptance | Pending |
| Direct Toast synchronization | Under evaluation |

## Related Documentation

- [Menu Management Overview](README.md)
- [Menu Editor Guide](menu-editor-guide.md)
- [Categories and Subcategories](categories-and-subcategories.md)
- [Adding and Editing Items](adding-editing-items.md)
- [Pricing and Modifiers](pricing-and-modifiers.md)
- [Menu Images](menu-images.md)
- [SPECIALS Management](specials-management.md)
- [Menu Troubleshooting](troubleshooting.md)
- [Website Menu System](../02-website/menu-system.md)
- [Admin Menu Management](../04-admin-dashboard/menu-management.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Database Storage](../06-database/storage.md)
- [Vercel Deployment](../07-deployment/vercel-deployment.md)
- [Rollback Procedures](../07-deployment/rollback-procedures.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Operations Troubleshooting](../08-operations/troubleshooting.md)
- [Changelog](../08-operations/changelog.md)
- [Toast POS Integration Overview](../10-toast-pos-integration/integration-overview.md)
- [Master Documentation Index](../README.md)

---

[Back to Menu Management Overview](README.md)
