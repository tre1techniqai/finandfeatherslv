# MENU MANAGEMENT — Menu Images

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Audience:** Authorized Restaurant Managers, Menu Administrators, Developers, and QA Reviewers

**Implementation Status:** Menu image upload and processing implemented; production acceptance, storage policies, and lifecycle behavior require verification

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Image Management Objectives](#image-management-objectives)
3. [Current Implementation](#current-implementation)
4. [Image System Architecture](#image-system-architecture)
5. [Approved Image Standards](#approved-image-standards)
6. [Image Content Guidelines](#image-content-guidelines)
7. [Aspect Ratio Requirements](#aspect-ratio-requirements)
8. [WebP Processing](#webp-processing)
9. [Image Dimensions and File Sizes](#image-dimensions-and-file-sizes)
10. [Image Naming Conventions](#image-naming-conventions)
11. [Supabase Storage Organization](#supabase-storage-organization)
12. [Preparing Images for Upload](#preparing-images-for-upload)
13. [Accessing the Image Editor](#accessing-the-image-editor)
14. [Uploading a New Menu Image](#uploading-a-new-menu-image)
15. [Assigning Images to Items](#assigning-images-to-items)
16. [Replacing Existing Images](#replacing-existing-images)
17. [Removing Image Associations](#removing-image-associations)
18. [Handling Items Without Images](#handling-items-without-images)
19. [COCKTAILS Image Policy](#cocktails-image-policy)
20. [Image Validation](#image-validation)
21. [Image Cropping and Composition](#image-cropping-and-composition)
22. [Image Quality Assurance](#image-quality-assurance)
23. [Database and Storage Relationships](#database-and-storage-relationships)
24. [Storage Security and Permissions](#storage-security-and-permissions)
25. [Image Loading and Performance](#image-loading-and-performance)
26. [Caching and Image Updates](#caching-and-image-updates)
27. [Asset Cleanup and Recovery](#asset-cleanup-and-recovery)
28. [Common Manager Workflows](#common-manager-workflows)
29. [Troubleshooting](#troubleshooting)
30. [Testing and Acceptance](#testing-and-acceptance)
31. [Future Enhancements](#future-enhancements)
32. [Implementation Roadmap](#implementation-roadmap)
33. [Implementation Status](#implementation-status)
34. [Related Documentation](#related-documentation)

---

## Purpose

This document explains how menu images are prepared, uploaded, associated with menu items, replaced, and verified on the Fin & Feathers Las Vegas website.

Food photography supports the restaurant's visual presentation and helps guests understand menu offerings.

The image management process must preserve consistent quality while avoiding broken links, incorrect item associations, unnecessary storage usage, and unauthorized uploads.

This guide covers:

- Image selection.
- Photography standards.
- Aspect ratio.
- WebP processing.
- File preparation.
- Supabase Storage.
- Manager uploads.
- Image assignment.
- Image replacement.
- Image validation.
- Public display.
- Security.
- Performance.
- Recovery.
- Testing.

It distinguishes established implementation from behavior requiring verification.

## Image Management Objectives

### Visual Consistency

Present menu photography with a consistent appearance.

### Accurate Representation

Use images that represent the intended dishes.

### Manager Independence

Allow authorized staff to update supported menu images.

### Performance

Use efficient image formats.

### Responsive Presentation

Maintain appropriate display on mobile and desktop.

### Storage Integrity

Keep database references aligned with stored assets.

### Security

Restrict image modifications to authorized personnel.

### Accessibility

Ensure the menu remains understandable without photography.

### Recovery

Avoid irreversible image loss where practical.

### Operational Verification

Confirm that uploaded images appear correctly.

## Current Implementation

**Status:** Core menu image management implemented

### Application

    Next.js App Router

### Authentication

    Supabase Auth

### Database

    Supabase PostgreSQL

### Storage Provider

    Supabase Storage

### Storage Bucket

    website-media

### Menu Storage Prefix

    menu/

### Image Output Format

    WebP

### Image Aspect Ratio

    4:3

### Administrative Route

    /admin/menu

### Established Functionality

The project includes a menu image upload workflow with WebP processing and 4:3 output.

### Verification Boundary

Exact processing dimensions, maximum file size, object naming, replacement semantics, and cleanup behavior require inspection of the current application.

## Image System Architecture

Menu images involve several application layers.

### Manager Interface

An authorized manager selects an image through Menu Management.

### Authentication

Supabase Auth identifies the user.

### Authorization

The application checks manager permissions.

### Processing

The upload workflow produces a WebP image with a 4:3 aspect ratio.

### Storage

Supabase Storage holds the processed asset.

### Database

Menu records reference the intended image.

### Public Menu

The website displays the image with the associated dish.

### Hosting

Vercel serves the application.

### External Assets

Supabase Storage serves the uploaded media through the configured access mechanism.

### Integrity Requirement

A successful upload must result in a valid image reference associated with the intended item.

## Approved Image Standards

Menu photography should follow consistent standards.

### Aspect Ratio

    4:3

### Output Format

    WebP

### Subject

The actual restaurant dish.

### Composition

The dish should be the primary visual subject.

### Lighting

Use clear, appealing lighting.

### Sharpness

The food should be in focus.

### Color

Preserve natural, recognizable food colors.

### Background

Avoid unnecessary visual clutter.

### Branding

Do not add unapproved promotional graphics.

### Text Overlays

Avoid unnecessary text embedded in photographs.

### Consistency

Use a coherent visual presentation across the menu.

## Image Content Guidelines

Images should accurately represent the restaurant's offerings.

### Actual Dish

Use photography of the correct menu item.

### Ingredients

Avoid showing ingredients not included in the offering without appropriate context.

### Portion Representation

Avoid misleading portion sizes.

### Garnishes

Use garnishes consistent with restaurant presentation.

### Plates

Maintain a professional presentation.

### Background Objects

Avoid distracting props.

### People

Avoid unnecessary people in food product images.

### Third-Party Images

Use only assets the restaurant is authorized to publish.

### Watermarks

Avoid unapproved watermarks.

### Approval

Restaurant management should approve imagery before publication.

## Aspect Ratio Requirements

The established menu image aspect ratio is 4:3.

### Ratio

    Width : Height = 4 : 3

### Example Dimensions

Illustrative 4:3 dimensions include:

- 800 × 600.
- 1200 × 900.
- 1600 × 1200.

### Important Qualification

These dimensions are examples, not confirmed processing output sizes.

### Cropping

Preserve the main subject when cropping.

### Centering

Avoid cutting off important parts of the dish.

### Orientation

Landscape-oriented food photographs generally fit the ratio naturally.

### Portrait Sources

Portrait photographs may require more substantial cropping.

### Stretching

Do not distort an image to force the ratio.

### Verification

Confirm that the processed result retains the intended composition.

## WebP Processing

The established menu upload workflow produces WebP images.

### Purpose

WebP supports efficient image delivery.

### Input Formats

The exact supported input formats require verification.

### Conversion

The application processes the selected image into the established output format.

### Output

    .webp

### Compression

The exact compression quality requires source-code verification.

### Transparency

Transparency handling depends on the implemented processing workflow.

### Metadata

Metadata preservation or removal requires verification.

### Processing Errors

Invalid source files should produce appropriate error feedback.

### Public Display

Confirm that the resulting file loads correctly in supported browsers.

### Recovery

Retain appropriate original source photography when needed.

## Image Dimensions and File Sizes

Image dimensions affect visual quality and performance.

### Source Resolution

Use a sufficiently detailed original photograph.

### Output Resolution

The exact processed dimensions must be confirmed from the application.

### File Size

The exact upload limit must be confirmed from the current implementation.

### Compression

Use the established WebP processing workflow.

### Oversized Sources

Very large files may increase upload time or processing requirements.

### Undersized Sources

Small source images may appear blurry.

### Mobile

Efficient images are important for mobile performance.

### Desktop

Images should remain sharp at their intended display size.

### Verification

Test representative images after processing.

### Documentation

Record actual size limits after inspecting the implementation.

## Image Naming Conventions

Consistent naming improves asset management.

### Source Filenames

Use understandable names for original photography.

### Descriptive Terms

Include the dish name where practical.

### Special Characters

Avoid unusual characters in source filenames.

### Duplicate Names

Avoid confusing repeated filenames.

### Storage Names

The application may generate object names automatically.

### Implementation Boundary

Do not assume uploaded files retain their original names.

### Item Identifiers

The storage path may include an item identifier if implemented.

### Replacement

Avoid overwriting unrelated assets.

### Versioning

Versioned filenames may help with caching if supported.

### Verification

Inspect actual Storage paths before formalizing a naming convention.

## Supabase Storage Organization

The established media storage system uses Supabase.

### Bucket

    website-media

### Menu Prefix

    menu/

### Illustrative Path

    website-media/menu/<generated-image-name>.webp

### Important Qualification

The path above illustrates organization, not a verified filename-generation rule.

### Public Media

The bucket is used for website media.

### Access

Actual read and write policies must be verified.

### Database Reference

Menu records should point to the intended object.

### Orphaned Objects

Unreferenced images may require controlled cleanup.

### Shared Objects

An image may be referenced by more than one record.

### Security

Do not expose privileged Storage credentials in browser code.

## Preparing Images for Upload

Prepare images before opening the editor.

### Step 1 — Identify the Dish

Confirm the correct menu item.

### Step 2 — Select Photography

Choose an approved image.

### Step 3 — Confirm Rights

Ensure the restaurant can publish the asset.

### Step 4 — Inspect Quality

Check sharpness and lighting.

### Step 5 — Review Composition

Confirm the food is the primary subject.

### Step 6 — Anticipate Cropping

Ensure the image can be cropped to 4:3.

### Step 7 — Review Background

Remove distracting elements when appropriate.

### Step 8 — Confirm Accuracy

Ensure the image represents the dish.

### Step 9 — Preserve Source

Keep the original where appropriate.

### Step 10 — Upload

Use the authorized menu editor.

## Accessing the Image Editor

Menu image management is part of protected administration.

### Step 1 — Open Website

Visit:

    https://finandfeatherslv.live

### Step 2 — Open Login

Navigate to:

    /admin/login

### Step 3 — Sign In

Use an authorized manager account.

### Step 4 — Open Dashboard

Navigate to:

    /admin

### Step 5 — Open Menu Management

Navigate to:

    /admin/menu

### Step 6 — Locate Item

Find the intended menu record.

### Step 7 — Open Editing

Use the supported editing action.

### Step 8 — Find Image Control

Locate the implemented upload or replacement control.

## Uploading a New Menu Image

### Step 1 — Confirm Approval

Use approved food photography.

### Step 2 — Identify Menu Item

Confirm the correct record.

### Step 3 — Open Image Upload

Use the implemented editor control.

### Step 4 — Select Source File

Choose the approved image.

### Step 5 — Review Preview

Inspect the selected image if the interface provides a preview.

### Step 6 — Confirm Crop

Check the intended 4:3 composition.

### Step 7 — Upload

Submit through the supported workflow.

### Step 8 — Wait for Processing

Allow the operation to complete.

### Step 9 — Review Feedback

Check for success or error messages.

### Step 10 — Save Item

Complete any required item save operation.

### Step 11 — Verify Public Menu

Confirm the correct image appears.

## Assigning Images to Items

An image must be associated with the intended dish.

### Correct Item

Verify the menu record before uploading.

### Image Reference

The database should reference the intended stored asset.

### Existing Image

Review the current association.

### New Image

Use approved photography.

### Save

Persist the association through the supported workflow.

### Verification

Check the menu item after saving.

### Public Display

Confirm the correct dish photograph appears.

### Duplicate Items

Avoid assigning an image to the wrong similarly named record.

### Shared Assets

Use shared images only when appropriate and supported.

### Recovery

Preserve enough information to correct an accidental association.

## Replacing Existing Images

Image replacement should be deliberate.

### Step 1 — Locate Item

Find the intended menu record.

### Step 2 — Review Existing Image

Confirm the image being replaced.

### Step 3 — Prepare Replacement

Choose approved photography.

### Step 4 — Open Image Control

Use the supported upload workflow.

### Step 5 — Upload Replacement

Submit the new image.

### Step 6 — Save

Complete any required save action.

### Step 7 — Verify Database Reference

Confirm the item points to the intended image.

### Step 8 — Verify Public Display

Check the guest-facing menu.

### Step 9 — Review Old Asset

Determine whether the old image remains stored.

### Step 10 — Avoid Unsafe Cleanup

Do not delete the old asset without checking references.

## Removing Image Associations

Some menu items may not require photography.

### Implementation Boundary

The exact image-removal control requires verification.

### Operational Approval

Confirm that removing the image is appropriate.

### Database Reference

The menu record may need its image association cleared.

### Storage Object

Removing an association does not necessarily delete the stored file.

### Shared Assets

Check whether another item references the same image.

### Public Display

Verify the item remains readable.

### Placeholder Behavior

Use the current application's implemented fallback.

### COCKTAILS

Cocktail images are not required.

### Recovery

Retain appropriate source assets where necessary.

### Verification

Confirm no broken image appears.

## Handling Items Without Images

Not every menu entry requires photography.

### Text-Only Entries

A menu item may be presented using its name, description, and price.

### Fallback Design

The public menu should remain understandable without an image.

### Layout

Avoid empty image containers that disrupt readability.

### Accessibility

Ensure the text provides the necessary information.

### Performance

Do not load unnecessary placeholder images.

### Validation

Image requirements should follow actual restaurant policy.

### COCKTAILS

No images are required for COCKTAILS.

### Other Categories

Follow the approved menu presentation requirements.

### Verification

Test representative image-free entries.

### Implementation Boundary

Exact fallback behavior requires public UI verification.

## COCKTAILS Image Policy

The project has an explicit requirement concerning COCKTAILS.

### Requirement

    No images for COCKTAILS.

### Administrative Workflow

Managers should not be required to upload cocktail photography.

### Public Display

Cocktail entries should display correctly without images.

### Validation

The editor should not impose an image requirement on these records.

### Layout

Text-only cocktail entries should remain visually consistent.

### Category Hierarchy

COCKTAILS must follow the approved spreadsheet taxonomy.

### Placeholders

Do not add unnecessary generic cocktail images.

### Testing

Verify image-free presentation on mobile and desktop.

### Future Changes

Any change to this policy requires explicit approval.

### Documentation

Preserve this requirement across related menu documentation.

## Image Validation

Upload validation protects the application.

### File Type

Accept only supported source formats.

### File Size

Enforce the actual configured limit.

### Image Content

Reject unreadable or malformed files.

### Dimensions

Handle unsupported dimensions safely.

### Processing

Confirm conversion completes successfully.

### Output Format

Verify WebP output.

### Aspect Ratio

Verify 4:3 output.

### Authorization

Reject unauthorized uploads.

### Storage

Handle Storage errors without exposing credentials.

### Feedback

Provide actionable errors.

### Verification

Test valid and invalid files in a controlled environment.

## Image Cropping and Composition

Cropping should preserve the dish.

### Primary Subject

Keep the food visible.

### Center of Interest

Position the important portion appropriately.

### Plate Edges

Avoid awkward cropping.

### Garnishes

Preserve meaningful presentation details.

### Background

Remove unnecessary visual distractions.

### Aspect Ratio

Maintain 4:3.

### Distortion

Do not stretch the photograph.

### Preview

Inspect the processed result where possible.

### Portrait Sources

Review whether enough of the dish remains visible.

### Landscape Sources

Avoid cutting off important ingredients.

### Verification

Check the final image in the public menu layout.

## Image Quality Assurance

Image quality should be reviewed before and after upload.

### Accuracy

Does the image represent the correct dish?

### Sharpness

Is the food in focus?

### Lighting

Is the dish clearly visible?

### Color

Are colors natural?

### Composition

Is the dish framed appropriately?

### Cropping

Is the 4:3 crop acceptable?

### Compression

Are artifacts noticeable?

### Public Display

Does the image load correctly?

### Mobile

Is the dish recognizable at smaller sizes?

### Desktop

Does the image remain sufficiently sharp?

### Approval

Has the image been approved for publication?

## Database and Storage Relationships

Menu images depend on consistent records and objects.

### Database

    Supabase PostgreSQL

### Storage

    Supabase Storage

### Menu Record

Stores or references image information.

### Storage Object

Contains the uploaded image.

### Object Path

Identifies the stored asset.

### Public URL

May be derived through the application's Storage access mechanism.

### Reference Integrity

The record must point to the intended object.

### Replacement

Changing a reference may leave an older object stored.

### Deletion

Removing a record does not necessarily remove its media.

### Recovery

Database restoration and Storage restoration may require separate actions.

## Storage Security and Permissions

Menu uploads are restricted operations.

### Authentication

    Supabase Auth

### Authorization

    requireManager()

### Staff Role

    manager

### Active State

    is_active = true

### Upload Access

Only authorized personnel should upload menu assets.

### Replacement Access

Only authorized personnel should replace menu images.

### Delete Access

Destructive Storage actions require appropriate authorization.

### Public Reads

The exact Storage read policy must be verified.

### Privileged Keys

Do not expose service-role credentials in client code.

### Testing

Verify authorized and unauthorized upload scenarios.

## Image Loading and Performance

Menu images should load efficiently.

### WebP

Use the established processed output format.

### Dimensions

Avoid unnecessarily large assets.

### Responsive Layout

Display images appropriately across screen sizes.

### Layout Stability

Reserve appropriate display space where supported.

### Lazy Loading

Use the application's implemented loading behavior.

### Network Conditions

Test on slower mobile connections.

### Missing Assets

Handle failed image requests gracefully.

### Compression

Balance file size and visual quality.

### Browser Support

Verify the intended supported browsers.

### Monitoring

Investigate repeated image loading failures.

## Caching and Image Updates

Caching can affect when replacement images become visible.

### Browser Cache

A browser may retain an earlier image response.

### CDN Cache

Media delivery may involve caching.

### Object URL

Reusing an unchanged URL may affect replacement visibility.

### Versioned Paths

Unique paths may reduce stale-image problems where supported.

### Implementation Boundary

The current naming and cache invalidation strategy requires verification.

### Save Confirmation

A successful save does not automatically prove that every browser displays the new image.

### Verification

Reload the public menu and confirm the correct image.

### Persistent Stale Image

Investigate the stored object, URL, and cache behavior.

### Safety

Do not make arbitrary production cache changes without approval.

## Asset Cleanup and Recovery

Unused assets should be handled carefully.

### Orphaned Images

Some Storage objects may no longer be referenced.

### Shared Images

An object may be used by multiple menu records.

### Cleanup Review

Identify references before deletion.

### Approval

Obtain authorization for destructive cleanup.

### Backup

Preserve appropriate originals.

### Database Recovery

Restoring a database record may not restore a deleted Storage object.

### Storage Recovery

Recovery options require verification.

### Audit

Record significant cleanup operations.

### Prevention

Use consistent upload and replacement procedures.

### Implementation Boundary

Automated cleanup is not established as implemented.

## Common Manager Workflows

### Workflow A — Add Photography to a New Dish

1. Confirm the dish is approved.
2. Prepare the image.
3. Open Menu Management.
4. Create or locate the item.
5. Upload the image.
6. Complete any required save.
7. Verify the public menu.

### Workflow B — Replace an Outdated Image

1. Identify the correct item.
2. Review the existing image.
3. Select approved replacement photography.
4. Upload the new image.
5. Save if required.
6. Verify the public menu.
7. Review old-asset cleanup separately.

### Workflow C — Correct a Wrong Image

1. Confirm the affected item.
2. Identify the intended photo.
3. Open editing.
4. Replace the association.
5. Save.
6. Verify the public display.

### Workflow D — Review a Missing Image

1. Confirm whether the item requires an image.
2. Inspect the current image reference.
3. Check upload history where available.
4. Reupload approved photography if necessary.
5. Verify the public menu.

### Workflow E — Maintain COCKTAILS

1. Confirm the correct category or subcategory.
2. Maintain approved names, descriptions, and prices.
3. Do not require cocktail images.
4. Verify text-only public presentation.

## Troubleshooting

### Upload Control Missing

Confirm manager access and the current editor interface.

### File Rejected

Check the supported file format and configured size limit.

### Upload Fails

Review safe application diagnostics and Storage permissions.

### Processing Error

Check the source image and processing behavior.

### Wrong Crop

Use a more appropriate source composition.

### Image Appears Blurry

Review source resolution and processed output.

### Wrong Dish Image

Confirm the item-to-image association.

### Image Does Not Load

Check the stored object and reference.

### Old Image Still Appears

Investigate caching and replacement behavior.

### Unexpected Storage Error

Review permissions and object path handling.

### COCKTAILS Image Required

Treat this as a discrepancy with the approved requirements.

### Persistent Issue

Escalate with sanitized diagnostic evidence.

## Testing and Acceptance

### Upload

- [ ] Authorized manager can upload a supported image.
- [ ] Invalid files are rejected safely.
- [ ] Upload errors provide useful feedback.

### Processing

- [ ] Output uses WebP.
- [ ] Output maintains 4:3.
- [ ] Image quality is acceptable.

### Association

- [ ] Image attaches to the correct item.
- [ ] Replacement updates the intended item.
- [ ] Unrelated items remain unchanged.

### Public Display

- [ ] Images load on mobile.
- [ ] Images load on desktop.
- [ ] Missing images are handled appropriately.
- [ ] COCKTAILS work without images.

### Security

- [ ] Anonymous uploads are rejected.
- [ ] Non-manager uploads are rejected.
- [ ] Inactive manager uploads are rejected.
- [ ] Authorized manager uploads succeed.

### Recovery

- [ ] Asset cleanup does not break referenced images.
- [ ] Recovery procedures are documented.

### Evidence

Record actual test results before declaring acceptance.

## Future Enhancements

Potential improvements include:

### Dedicated Media Library

Browse approved menu assets.

### Image Reuse

Associate one approved asset with multiple items safely.

### Crop Preview

Provide interactive 4:3 composition review.

### Bulk Upload

Upload multiple images through a controlled workflow.

### Asset Versioning

Preserve replacement history.

### Automated Quality Checks

Detect low-resolution or malformed images.

### Orphan Detection

Identify unused Storage objects.

### Audit Logging

Track uploads and replacements.

### Image Optimization Reporting

Monitor media size and loading performance.

### Recovery Tools

Improve restoration of accidentally removed assets.

### Implementation Boundary

These enhancements are proposals, not confirmed deployed features.

## Implementation Roadmap

### Stage 1 — Audit Current Upload Workflow

Inspect the deployed editor and processing implementation.

### Stage 2 — Confirm Processing Settings

Record actual dimensions, compression quality, and file limits.

### Stage 3 — Review Storage Policies

Verify authorized upload and read behavior.

### Stage 4 — Test New Uploads

Confirm successful image creation and association.

### Stage 5 — Test Replacements

Verify replacement behavior and caching.

### Stage 6 — Test Missing Images

Confirm appropriate public fallbacks.

### Stage 7 — Verify COCKTAILS

Ensure images are not required.

### Stage 8 — Review Cleanup

Identify safe asset lifecycle procedures.

### Stage 9 — Train Managers

Provide approved image-management instructions.

### Stage 10 — Evaluate Enhancements

Prioritize future media administration capabilities.

### Scheduling

This roadmap does not establish committed delivery dates.

## Implementation Status

| Capability | Status |
|---|---|
| Protected Menu Management | Implemented |
| Menu image upload | Implemented |
| Supabase Storage integration | Implemented |
| `website-media` bucket | Established |
| `menu/` storage prefix | Established |
| WebP processing | Implemented |
| 4:3 output | Implemented |
| Menu item image association | Implemented |
| Manager authentication | Implemented |
| Manager authorization | Implemented |
| Exact source format support | Verification pending |
| Exact maximum upload size | Verification pending |
| Exact processed dimensions | Verification pending |
| Exact compression settings | Verification pending |
| Image replacement lifecycle | Verification pending |
| Image removal controls | Verification pending |
| Storage read/write policy audit | Pending |
| Cache invalidation behavior | Verification pending |
| Automated orphan cleanup | Not established |
| COCKTAILS image exclusion | Required |
| Production upload acceptance tests | Pending |
| Comprehensive Storage security tests | Pending |
| Dedicated media library | Proposed |
| Bulk image upload | Proposed |
| Asset version history | Proposed |

## Related Documentation

- [Menu Management Overview](README.md)
- [Menu Editor Guide](menu-editor-guide.md)
- [Categories and Subcategories](categories-and-subcategories.md)
- [Adding and Editing Items](adding-editing-items.md)
- [Pricing and Modifiers](pricing-and-modifiers.md)
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
- [Master Documentation Index](../README.md)

---

[Back to Menu Management Overview](README.md)
