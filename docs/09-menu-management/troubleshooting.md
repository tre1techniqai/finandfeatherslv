# MENU MANAGEMENT — Troubleshooting

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Audience:** Restaurant Managers, Menu Administrators, Developers, and Technical Support

**Implementation Status:** Core menu administration implemented; production troubleshooting and acceptance verification pending

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Troubleshooting Objectives](#troubleshooting-objectives)
3. [System Overview](#system-overview)
4. [Current Implementation Boundaries](#current-implementation-boundaries)
5. [Troubleshooting Principles](#troubleshooting-principles)
6. [Initial Diagnostic Checklist](#initial-diagnostic-checklist)
7. [Manager Login Problems](#manager-login-problems)
8. [Manager Authorization Failures](#manager-authorization-failures)
9. [Menu Editor Not Loading](#menu-editor-not-loading)
10. [Menu Items Not Appearing](#menu-items-not-appearing)
11. [Creating Menu Items](#creating-menu-items)
12. [Editing Menu Items](#editing-menu-items)
13. [Save Failures](#save-failures)
14. [Duplicate Menu Items](#duplicate-menu-items)
15. [Category and Subcategory Problems](#category-and-subcategory-problems)
16. [Pricing Problems](#pricing-problems)
17. [Market-Price Problems](#market-price-problems)
18. [Modifier Problems](#modifier-problems)
19. [Image Upload Failures](#image-upload-failures)
20. [Image Processing Problems](#image-processing-problems)
21. [Missing or Incorrect Images](#missing-or-incorrect-images)
22. [COCKTAILS Presentation Problems](#cocktails-presentation-problems)
23. [SPECIALS Problems](#specials-problems)
24. [Publishing and Visibility Problems](#publishing-and-visibility-problems)
25. [Caching and Stale Content](#caching-and-stale-content)
26. [Supabase Database Problems](#supabase-database-problems)
27. [Supabase Storage Problems](#supabase-storage-problems)
28. [Row-Level Security Problems](#row-level-security-problems)
29. [Toast POS Discrepancies](#toast-pos-discrepancies)
30. [Production Environment Problems](#production-environment-problems)
31. [Safe Recovery Procedures](#safe-recovery-procedures)
32. [Incident Severity and Escalation](#incident-severity-and-escalation)
33. [Diagnostic Evidence](#diagnostic-evidence)
34. [Manager Troubleshooting Workflows](#manager-troubleshooting-workflows)
35. [Testing and Acceptance](#testing-and-acceptance)
36. [Preventive Maintenance](#preventive-maintenance)
37. [Implementation Status](#implementation-status)
38. [Related Documentation](#related-documentation)

---

## Purpose

This document provides troubleshooting procedures for the Fin & Feathers Las Vegas menu management system.

It helps authorized restaurant managers and technical personnel identify problems, determine likely causes, perform safe checks, and escalate issues requiring developer or database access.

The guide covers the administrative menu editor, guest-facing menu, pricing, modifiers, categories, images, SPECIALS, database access, and publishing.

The primary goal is to restore correct menu operation without introducing additional problems.

This document does not authorize managers to bypass security controls, modify production database records directly, or perform destructive recovery operations.

## Troubleshooting Objectives

### Restore Operations

Resolve problems that prevent authorized menu management.

### Protect Menu Accuracy

Correct incorrect guest-facing information.

### Preserve Data

Avoid accidental deletion or duplication.

### Protect Security

Maintain authentication and authorization requirements.

### Minimize Disruption

Reduce the impact of menu errors on restaurant operations.

### Identify Root Causes

Distinguish symptoms from underlying failures.

### Improve Communication

Provide consistent information when escalating issues.

### Support Verification

Confirm that corrections work as intended.

### Maintain Documentation

Record recurring problems and approved solutions.

### Prevent Recurrence

Identify opportunities to improve validation and reliability.

## System Overview

The menu management system uses the following established technologies.

| Component | Technology |
|---|---|
| Website | Next.js App Router |
| Hosting | Vercel |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL |
| Media Storage | Supabase Storage |
| Administrative authorization | Manager role checks |
| Menu administration | `/admin/menu` |
| Public website | `https://finandfeatherslv.live` |
| External ordering | Toast |

### Administrative Login

    /admin/login

### Dashboard

    /admin

### Menu Editor

    /admin/menu

### Storage Bucket

    website-media

### Menu Image Prefix

    menu/

### Image Format

    WebP

### Image Aspect Ratio

    4:3

### Important Boundary

The exact implementation of individual menu controls must be confirmed from the current application.

## Current Implementation Boundaries

Troubleshooting must reflect actual functionality.

### Established

- Manager authentication.
- Protected menu administration.
- Menu item creation and editing.
- Menu image uploads.
- 4:3 WebP processing.
- Supabase integration.
- Existing $5 specials toggle.

### Requires Verification

- Exact modifier editor controls.
- Item deletion behavior.
- Item visibility controls.
- Publishing behavior.
- Cache invalidation.
- Image cleanup.
- Special-pricing effects.

### Planned

- Advanced day-of-week SPECIALS scheduling.
- Automatic promotional activation and expiration.
- Additional administrative capabilities.

### Under Evaluation

- Direct Toast POS integration.

### Operational Rule

Do not diagnose an unimplemented feature as a malfunction merely because the intended future behavior is absent.

## Troubleshooting Principles

### Confirm the Environment

Identify whether the problem occurs in production, preview, or local development.

### Reproduce the Issue

Confirm the actual symptom before changing anything.

### Protect Data

Avoid destructive actions.

### Use Supported Controls

Perform changes through authorized application workflows.

### Check Permissions

Determine whether the user has the correct access.

### Check Persistence

Confirm whether the database operation succeeded.

### Check Public Display

Distinguish stored data from rendered content.

### Avoid Repeated Submissions

Do not repeatedly create records after ambiguous save responses.

### Preserve Evidence

Record relevant errors without exposing secrets.

### Escalate Appropriately

Refer unresolved technical issues to authorized personnel.

## Initial Diagnostic Checklist

Before investigating a specific issue, complete these checks.

### Step 1 — Identify the User

Determine whether the affected person is an authorized manager.

### Step 2 — Identify the Environment

Confirm the website or deployment being accessed.

### Step 3 — Identify the Operation

Determine whether the issue concerns viewing, creating, editing, uploading, or saving.

### Step 4 — Identify the Record

Record the affected menu item name and category.

### Step 5 — Confirm Expected Behavior

Determine what should have happened.

### Step 6 — Confirm Actual Behavior

Record what happened instead.

### Step 7 — Check Error Messages

Capture any visible error.

### Step 8 — Check Persistence

Determine whether the intended change was saved.

### Step 9 — Check Public Display

Verify the guest-facing result.

### Step 10 — Determine Severity

Assess whether the issue requires immediate escalation.

## Manager Login Problems

### Symptoms

- Login fails.
- Credentials are rejected.
- The login page repeatedly reloads.
- The session does not persist.
- The manager cannot reach the dashboard.

### Possible Causes

- Incorrect credentials.
- Expired or invalid session.
- Authentication service error.
- Browser session problems.
- Account configuration issues.

### Manager Checks

1. Confirm the correct login URL.
2. Verify the intended account.
3. Retry authentication once using the normal process.
4. Check whether the problem affects other authorized managers.
5. Record the visible error.

### Technical Checks

Review Supabase Auth behavior and application authentication handling.

### Avoid

Do not share passwords or privileged authentication tokens.

### Escalation

Refer unresolved authentication problems to the authorized administrator.

## Manager Authorization Failures

### Symptoms

- Login succeeds but `/admin/menu` is inaccessible.
- The dashboard redirects unexpectedly.
- The application reports insufficient permissions.

### Established Authorization

    requireManager()

### Role Table

    staff_roles

### Required Role

    manager

### Required Active State

    is_active = true

### Possible Causes

- Missing role assignment.
- Inactive staff role.
- Incorrect account.
- Authorization query failure.
- Application configuration problem.

### Manager Checks

Confirm that the intended manager account is being used.

### Technical Checks

Inspect the approved role assignment and authorization path.

### Security

Do not bypass authorization to restore access.

### Escalation

Role changes must follow approved staff-management procedures.

## Menu Editor Not Loading

### Symptoms

- Blank administrative page.
- Repeated loading state.
- Unexpected application error.
- Menu controls fail to appear.

### Possible Causes

- Authentication failure.
- Authorization failure.
- Application rendering error.
- Database request failure.
- Network connectivity issue.
- Deployment problem.

### Initial Checks

1. Confirm the URL.
2. Confirm manager authentication.
3. Reload the page once.
4. Check whether the dashboard works.
5. Determine whether other managers are affected.

### Technical Checks

Inspect relevant application and deployment diagnostics.

### Database

Confirm that required menu queries succeed.

### Security

Avoid exposing connection strings or credentials in incident reports.

### Escalation

Escalate persistent editor failures.

## Menu Items Not Appearing

### Symptoms

- An expected item is missing from the editor.
- An item is missing from the public menu.
- An item appears in the wrong category.

### Possible Causes

- Incorrect category assignment.
- Unsuccessful creation.
- Incorrect environment.
- Data retrieval failure.
- Visibility behavior.
- Caching.

### Administrative Check

Search or review the intended item.

### Persistence Check

Confirm whether the record exists.

### Category Check

Compare the item against the approved spreadsheet.

### Public Check

Inspect the correct menu grouping.

### Important Distinction

An item missing from the editor and an item missing only from the public website may have different causes.

### Escalation

Refer unresolved data retrieval problems to the technical administrator.

## Creating Menu Items

### Symptoms

- The new-item operation fails.
- A required field is rejected.
- The item does not appear after saving.
- An unexpected duplicate appears.

### Possible Causes

- Invalid input.
- Missing required information.
- Incorrect category.
- Authorization failure.
- Database error.
- Duplicate submission.

### Manager Procedure

1. Confirm the item is approved.
2. Review required fields.
3. Confirm category and price.
4. Submit the item once.
5. Review the result.
6. Check whether the record exists before retrying.

### Verification

Confirm the intended item appears publicly.

### Prevention

Search for existing items before creation.

## Editing Menu Items

### Symptoms

- Existing values cannot be changed.
- Edited values revert.
- A different item changes.
- The public menu retains old information.

### Possible Causes

- Incorrect record selection.
- Failed save.
- Validation error.
- Database mutation failure.
- Caching.
- Incorrect environment.

### Manager Procedure

1. Locate the correct item.
2. Confirm its current values.
3. Apply the approved change.
4. Save once.
5. Reopen the item if needed.
6. Verify the stored values.
7. Verify the public menu.

### Important Distinction

A successful database update does not guarantee immediate public visibility.

### Escalation

Report persistent discrepancies with the affected item identified.

## Save Failures

### Symptoms

- Save returns an error.
- Save never completes.
- A success message appears but data does not persist.
- A network error occurs after submission.

### Possible Causes

- Validation failure.
- Expired session.
- Authorization rejection.
- Database constraint.
- Network interruption.
- Server-side error.

### Immediate Procedure

1. Do not repeatedly select Save.
2. Record the visible message.
3. Check whether the change persisted.
4. Confirm the manager session.
5. Review the entered values.
6. Retry only when safe.

### Partial Success

A network failure may occur after the database operation succeeds.

### Duplicate Risk

Repeated creation requests can produce unintended records.

### Technical Escalation

Review the relevant mutation path and sanitized diagnostics.

## Duplicate Menu Items

### Symptoms

- The same dish appears twice.
- Similar items have conflicting prices.
- Duplicate entries appear in different categories.

### Possible Causes

- Repeated creation.
- Duplicate spreadsheet import.
- Similar naming.
- Failed-response retry.
- Incorrect category assignment.

### Manager Checks

Compare names, descriptions, prices, and categories.

### Technical Checks

Inspect the underlying records and their relationships.

### Correction

Use the approved removal or consolidation process.

### Data Safety

Do not delete records until dependencies are understood.

### Prevention

Check for duplicates before creation.

### Verification

Confirm only intended records appear publicly.

## Category and Subcategory Problems

### Symptoms

- Item appears under the wrong heading.
- Category filter omits an item.
- Unexpected category appears.
- Subcategory assignment is incorrect.

### Source of Truth

The approved restaurant menu spreadsheet.

### Historical Categories

The original import included Starters, Entrees, Sandwiches, Salads, Sides, Brunch, Brunch Sides, and Brunch Drinks.

### Current Taxonomy

The latest approved spreadsheet determines the complete category inventory.

### HOOKAH

Do not add a HOOKAH category filter.

### COCKTAILS

Follow the approved spreadsheet hierarchy.

### Manager Checks

Confirm the item assignment and public navigation.

### Technical Checks

Review category relationships and filtering logic.

### Verification

Check affected items across the intended groupings.

## Pricing Problems

### Symptoms

- Wrong base price.
- Price missing.
- Incorrect surcharge.
- Unexpected special price.
- Website and Toast prices differ.

### Possible Causes

- Outdated approved data.
- Incorrect record.
- Invalid price entry.
- Modifier mismatch.
- Special-related setting.
- Separate Toast configuration.

### Manager Checks

1. Confirm the approved price.
2. Locate the correct item.
3. Review the saved value.
4. Check applicable modifiers.
5. Review specials.
6. Verify the public display.

### External Ordering

Check Toast separately.

### Escalation

Treat materially incorrect guest-facing pricing as a priority.

## Market-Price Problems

### Symptoms

- Market-priced item shows an unintended fixed price.
- Market-price designation is missing.
- The public menu displays an invalid value.

### Historical Examples

Original menu data included market-price offerings such as Snow Crab Legs, Lobster Tails, and Lobster & Grits.

### Display Convention

    MKT

### Source of Truth

Use the latest approved menu information.

### Manager Checks

Confirm whether the item currently uses market pricing.

### Technical Checks

Review the implemented market-price representation.

### Avoid

Do not invent a fixed amount.

### Toast

Check external ordering behavior separately.

### Verification

Confirm the public designation is accurate.

## Modifier Problems

### Symptoms

- Option missing.
- Wrong surcharge.
- Modifier attached to the wrong item.
- Duplicate modifier.
- Incorrect selection behavior.

### Possible Causes

- Incorrect source data.
- Invalid item association.
- Outdated modifier configuration.
- Unsupported editor operation.
- Data relationship problem.

### Historical Examples

Selected wings and tenders included sauce choices.

Selected tacos and wraps included protein additions.

### Pricing

Historical surcharges must be verified against current approved data.

### Manager Checks

Review the item and intended options.

### Technical Checks

Inspect the actual modifier schema and editor controls.

### Verification

Confirm guest-facing labels and charges.

## Image Upload Failures

### Symptoms

- Image selection fails.
- Upload returns an error.
- Upload does not complete.
- The item does not retain the image.

### Established Storage

    Supabase Storage

### Bucket

    website-media

### Prefix

    menu/

### Possible Causes

- Unsupported source file.
- File size restriction.
- Invalid image data.
- Authentication failure.
- Storage permission error.
- Network failure.

### Manager Checks

1. Confirm the intended item.
2. Select an approved image.
3. Review the visible error.
4. Avoid repeated uploads until the result is known.

### Technical Checks

Review the upload workflow and Storage permissions.

### Verification

Confirm the image appears publicly.

## Image Processing Problems

### Established Output

    WebP

### Established Ratio

    4:3

### Symptoms

- Unexpected crop.
- Distorted image.
- Blurry output.
- Processing failure.
- Invalid resulting image.

### Possible Causes

- Poor source resolution.
- Unsuitable composition.
- Unsupported source data.
- Processing error.
- Incorrect output handling.

### Manager Checks

Review the original photograph and final result.

### Technical Checks

Inspect processing dimensions, compression, and error handling.

### Implementation Boundary

Exact processing dimensions and file limits require verification.

### Correction

Use an appropriate source image and approved upload process.

### Verification

Check mobile and desktop display.

## Missing or Incorrect Images

### Symptoms

- Broken image.
- Wrong dish photograph.
- Old image remains visible.
- Image disappears after editing.

### Possible Causes

- Incorrect item association.
- Missing Storage object.
- Invalid object reference.
- Storage access problem.
- Caching.
- Incomplete save.

### Manager Checks

Confirm the correct item and intended photograph.

### Technical Checks

Inspect the stored object and database reference.

### Replacement

Use the supported upload workflow.

### Cleanup

Do not delete older assets without checking references.

### Verification

Confirm the intended image loads publicly.

## COCKTAILS Presentation Problems

### Established Requirement

    No images for COCKTAILS.

### Symptoms

- Editor requires a cocktail image.
- Empty image container disrupts layout.
- Cocktail entry fails to display without photography.
- An unwanted placeholder appears.

### Expected Behavior

COCKTAILS entries should be readable without images.

### Category Assignment

Use the approved spreadsheet taxonomy.

### Manager Checks

Confirm the item information is complete.

### Technical Checks

Review image validation and public fallback rendering.

### Correction

Do not introduce unnecessary cocktail photography to work around an application problem.

### Acceptance

Verify image-free entries on mobile and desktop.

## SPECIALS Problems

### Current Capability

The menu editor includes an existing $5 specials toggle.

### Symptoms

- Toggle state does not persist.
- Special appears unexpectedly.
- Promotional price is incorrect.
- A manager expects automatic scheduling.

### Verification Required

The exact current toggle behavior must be confirmed.

### Planned Functionality

Advanced day-of-week scheduling is not established as implemented.

### Example Future Promotion

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

### Manager Checks

Confirm the approved promotion and current supported controls.

### Technical Checks

Inspect the special-related data and public presentation.

### Toast

Verify external promotional pricing separately.

### Escalation

Report incorrect active promotional information promptly.

## Publishing and Visibility Problems

### Symptoms

- Saved change does not appear publicly.
- Item appears in the editor but not the public menu.
- Old text remains visible.
- Public menu displays inconsistent information.

### Three Verification Stages

1. Administrative save.
2. Database persistence.
3. Public presentation.

### Possible Causes

- Save failure.
- Wrong environment.
- Data retrieval issue.
- Visibility rules.
- Caching.
- Category filtering.

### Manager Checks

Confirm the item and intended public result.

### Technical Checks

Inspect the current public data-fetching implementation.

### Important Boundary

A separate publish action is not established as implemented.

## Caching and Stale Content

### Symptoms

- Old item description.
- Old price.
- Old image.
- Delayed category changes.

### Possible Cache Layers

- Browser cache.
- Application cache.
- CDN cache.
- Image cache.

### Next.js

Caching depends on the actual route and data-fetching implementation.

### Vercel

Deployment and delivery configuration may affect content behavior.

### Supabase Storage

Media URLs may be cached.

### Manager Check

Compare the editor's stored values with public presentation.

### Technical Check

Inspect actual revalidation and caching configuration.

### Avoid

Do not perform arbitrary production cache changes.

### Verification

Confirm the corrected content is visible.

## Supabase Database Problems

### Symptoms

- Menu data fails to load.
- Save operations fail.
- Records appear inconsistent.
- Related item data is missing.

### Provider

    Supabase PostgreSQL

### Possible Causes

- Query failure.
- Invalid data.
- Database constraint.
- Incorrect environment configuration.
- Authorization rejection.
- Schema mismatch.

### Technical Checks

Review the current schema, migrations, and safe application diagnostics.

### Data Integrity

Confirm relationships before changing records.

### Production Safety

Do not modify production records directly without authorization.

### Recovery

Use approved backup and recovery procedures.

### Escalation

Refer database incidents to authorized technical personnel.

## Supabase Storage Problems

### Symptoms

- Upload failure.
- Missing image.
- Access denied.
- Incorrect stored asset.

### Provider

    Supabase Storage

### Bucket

    website-media

### Menu Prefix

    menu/

### Possible Causes

- Storage policy rejection.
- Missing object.
- Incorrect path.
- Invalid upload.
- Authentication failure.
- Network problem.

### Manager Checks

Confirm the intended image and item.

### Technical Checks

Inspect Storage policies and object references.

### Security

Do not expose privileged Storage credentials.

### Recovery

Determine whether the original image is available.

### Verification

Confirm the public image loads correctly.

## Row-Level Security Problems

### Purpose

RLS helps enforce database access restrictions.

### Symptoms

- Authorized manager receives access denied.
- Database mutation fails unexpectedly.
- Unauthorized access appears possible.

### Authentication

    Supabase Auth

### Role Table

    staff_roles

### Required Role

    manager

### Required State

    is_active = true

### Application Authorization

    requireManager()

### Technical Checks

Review the current RLS policies and role-resolution behavior.

### Security Boundary

Do not disable RLS merely to resolve an operational problem.

### Testing

Verify authorized and unauthorized access.

### Escalation

Treat unexpected unauthorized access as a security incident.

## Toast POS Discrepancies

### Current Ordering

The website uses external Toast online ordering.

### Direct Integration

Direct Toast POS synchronization is under evaluation.

### Common Discrepancies

- Different item price.
- Different modifier charge.
- Item missing in Toast.
- Item available on one system but not the other.
- Special displayed on the website but not applied at checkout.

### Manager Checks

Compare approved restaurant pricing with both systems.

### Important Boundary

Website menu edits do not establish automatic Toast synchronization.

### Correction

Use approved procedures for each system.

### Guest Impact

Escalate material checkout discrepancies.

### Future Development

See the dedicated Toast integration documentation.

## Production Environment Problems

### Production Website

    https://finandfeatherslv.live

### Hosting

    Vercel

### Symptoms

- Public website unavailable.
- Admin route unavailable.
- Production differs from preview.
- Environment-specific data failure.

### Possible Causes

- Deployment error.
- Environment variable problem.
- Service availability.
- Database configuration.
- Storage configuration.
- Application regression.

### Technical Checks

Review deployment status and relevant diagnostics.

### Secrets

Keep `.env.local` and privileged keys out of Git.

### Data Separation

Do not assume preview environments use separate databases.

### Recovery

Follow approved deployment rollback procedures.

### Important Distinction

Code rollback does not automatically restore database records.

## Safe Recovery Procedures

### Principle

Use the least destructive approved correction.

### Incorrect Text

Edit the affected item through Menu Management.

### Incorrect Price

Confirm the approved amount before correction.

### Wrong Category

Restore the approved classification.

### Wrong Image

Replace the image association safely.

### Missing Record

Investigate before creating a replacement.

### Duplicate Record

Check dependencies before removal.

### Database Corruption

Escalate to authorized technical personnel.

### Storage Loss

Determine whether original assets or backups are available.

### Deployment Regression

Follow the documented Vercel rollback process.

### Verification

Confirm the corrected public state.

## Incident Severity and Escalation

Incidents should be prioritized by operational impact.

### Critical

Examples:

- Unauthorized administrative access.
- Widespread menu data corruption.
- Serious security exposure.

### High

Examples:

- Major guest-facing pricing errors.
- Menu administration unavailable to all managers.
- Large portions of the public menu missing.

### Medium

Examples:

- A single menu item cannot be updated.
- One approved image fails to display.
- A modifier is incorrect on a limited number of items.

### Low

Examples:

- Minor formatting inconsistency.
- Noncritical visual alignment issue.
- Documentation discrepancy.

### Important Qualification

These severity definitions are proposed operational guidance.

### Escalation

Follow the restaurant's approved incident reporting process.

### Communication

Provide accurate impact information without exposing secrets.

## Diagnostic Evidence

Useful evidence helps technical personnel reproduce problems.

### Environment

Record production, preview, or local development.

### Date and Time

Include the approximate incident time and timezone.

### Route

Record the affected application page.

### Operation

Describe the attempted action.

### Menu Item

Identify the affected dish.

### Expected Result

Explain the intended outcome.

### Actual Result

Explain the observed outcome.

### Error Message

Capture the visible error.

### Reproduction Steps

Document how the issue occurs.

### Screenshots

Include screenshots when appropriate.

### Security

Remove credentials, tokens, private customer information, and secrets.

## Manager Troubleshooting Workflows

### Workflow A — Price Is Wrong

1. Confirm the approved price.
2. Identify the affected item.
3. Review the stored value.
4. Check applicable modifiers.
5. Review specials.
6. Correct through the supported editor.
7. Verify the public menu.
8. Check Toast separately.

### Workflow B — Image Is Missing

1. Identify the item.
2. Confirm whether an image is required.
3. Review the current association.
4. Check for an upload error.
5. Reupload approved photography if appropriate.
6. Verify public display.

### Workflow C — Item Is Missing

1. Confirm the item name.
2. Review the approved category.
3. Search the editor.
4. Check persistence.
5. Check public navigation.
6. Escalate unresolved retrieval problems.

### Workflow D — Manager Cannot Edit

1. Confirm login.
2. Confirm the intended account.
3. Check whether the dashboard is accessible.
4. Record the error.
5. Refer authorization issues to the administrator.
6. Do not bypass permissions.

### Workflow E — SPECIALS Incorrect

1. Identify the affected item.
2. Confirm the approved promotion.
3. Review the existing toggle.
4. Confirm actual supported behavior.
5. Verify the public menu.
6. Coordinate Toast separately.

## Testing and Acceptance

### Authentication

- [ ] Authorized managers can log in.
- [ ] Invalid sessions are rejected.

### Authorization

- [ ] Managers can access supported menu controls.
- [ ] Non-managers cannot modify menu records.
- [ ] Inactive managers cannot modify menu records.

### Menu Operations

- [ ] Item creation succeeds.
- [ ] Item editing succeeds.
- [ ] Invalid values are rejected.
- [ ] Duplicate submissions are handled appropriately.

### Pricing and Modifiers

- [ ] Base prices display correctly.
- [ ] Market-price designations display correctly.
- [ ] Supported modifiers display correctly.

### Images

- [ ] Upload works.
- [ ] WebP output is produced.
- [ ] 4:3 processing works.
- [ ] Public images load.
- [ ] COCKTAILS work without images.

### Publishing

- [ ] Changes persist.
- [ ] Public display reflects approved updates.
- [ ] Mobile and desktop verification passes.

### Security

- [ ] Database access policies are tested.
- [ ] Storage access policies are tested.

### Evidence

Record actual test results before declaring acceptance.

## Preventive Maintenance

### Menu Review

Periodically compare public content with approved restaurant information.

### Pricing Review

Verify prices and surcharges.

### Category Review

Check approved category assignments.

### Modifier Review

Confirm item-specific options.

### Image Review

Identify missing or incorrect photography.

### SPECIALS Review

Verify current promotional settings.

### Access Review

Confirm that only authorized active managers retain administrative access.

### Storage Review

Investigate broken references and unnecessary assets.

### Deployment Review

Monitor relevant application changes.

### Documentation Review

Update troubleshooting procedures as functionality evolves.

## Implementation Status

| Capability | Status |
|---|---|
| Protected Menu Management | Implemented |
| Manager authentication | Implemented |
| Manager authorization | Implemented |
| Menu item creation | Implemented |
| Menu item editing | Implemented |
| Supabase database integration | Implemented |
| Supabase Storage integration | Implemented |
| Menu image upload | Implemented |
| WebP processing | Implemented |
| 4:3 image output | Implemented |
| Existing $5 specials toggle | Implemented |
| Exact modifier controls audit | Pending |
| Exact item deletion behavior audit | Pending |
| Exact item visibility behavior audit | Pending |
| Public menu caching audit | Pending |
| Production save-error testing | Pending |
| Production image-error testing | Pending |
| Production pricing acceptance | Pending |
| Comprehensive RLS testing | Pending |
| Storage policy testing | Pending |
| COCKTAILS no-image acceptance | Pending |
| Automated SPECIALS scheduling | Planned |
| Dedicated publishing workflow | Proposed |
| Direct Toast synchronization | Under evaluation |
| Formal incident-response acceptance | Pending |

## Related Documentation

- [Menu Management Overview](README.md)
- [Menu Editor Guide](menu-editor-guide.md)
- [Categories and Subcategories](categories-and-subcategories.md)
- [Adding and Editing Items](adding-editing-items.md)
- [Pricing and Modifiers](pricing-and-modifiers.md)
- [Menu Images](menu-images.md)
- [SPECIALS Management](specials-management.md)
- [Publishing Updates](publishing-updates.md)
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
