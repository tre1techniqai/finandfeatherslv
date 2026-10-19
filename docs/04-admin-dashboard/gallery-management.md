# ADMIN DASHBOARD — GALLERY Management

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Public gallery implemented; dedicated administrative gallery management interface planned

**Feature:** Manager GALLERY Administration

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Gallery Management Objectives](#gallery-management-objectives)
3. [Current Implementation](#current-implementation)
4. [Administrative Architecture](#administrative-architecture)
5. [Manager Authorization](#manager-authorization)
6. [GALLERY Management Dashboard](#gallery-management-dashboard)
7. [Gallery Data Model](#gallery-data-model)
8. [Image Upload Workflow](#image-upload-workflow)
9. [Image Processing and Optimization](#image-processing-and-optimization)
10. [Image Metadata](#image-metadata)
11. [Gallery Ordering](#gallery-ordering)
12. [Image Visibility and Publishing](#image-visibility-and-publishing)
13. [Image Replacement and Removal](#image-replacement-and-removal)
14. [Public Gallery Integration](#public-gallery-integration)
15. [Supabase Storage Integration](#supabase-storage-integration)
16. [Validation and Data Integrity](#validation-and-data-integrity)
17. [Security and Privacy](#security-and-privacy)
18. [Error Handling and Recovery](#error-handling-and-recovery)
19. [Manager Operating Procedures](#manager-operating-procedures)
20. [Testing and Verification](#testing-and-verification)
21. [Implementation Roadmap](#implementation-roadmap)
22. [Implementation Status](#implementation-status)
23. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed administrative GALLERY management interface for the Fin & Feathers Las Vegas website.

The objective is to allow authorized restaurant managers to maintain approved gallery images without requiring direct source-code changes.

The document covers:

- Administrative gallery access.
- Image uploads.
- Image processing.
- Image metadata.
- Gallery ordering.
- Visibility controls.
- Publication.
- Image replacement.
- Image removal.
- Supabase Storage.
- Public gallery integration.
- Security.
- Operational recovery.

This document describes an intended management system.

It does not establish that a dedicated administrative gallery editor currently exists.

## Gallery Management Objectives

The administrative GALLERY system should simplify maintenance of the restaurant's public image gallery.

### Content Independence

Authorized managers should eventually be able to update gallery content without developer intervention.

### Visual Quality

Gallery images should meet approved visual and technical standards.

### Consistent Presentation

Images should display correctly across desktop and mobile layouts.

### Ordering Control

Managers should be able to determine the approved image sequence.

### Visibility Control

Images should appear publicly only when approved.

### Reliable Publishing

The interface should accurately report whether an update succeeded.

### Storage Integrity

Database records and media files should remain consistent.

### Operational Recovery

Managers should have an approved way to correct or reverse mistakes.

## Current Implementation

**Status:** Public gallery implemented; administrative management planned

The website includes a public-facing image gallery.

### Established Component

    image-gallery

### Existing Public Experience

The gallery includes:

- Image slider.
- Previous and next navigation.
- Position indicators.
- Full-image modal presentation.

### Established Gallery Assets

Previously documented gallery images include:

    gallery-pic-01.jpg
    gallery-pic-02.jpg
    gallery-pic-03.jpg
    gallery-pic-04.jpg
    gallery-pic-05.jpg
    gallery-pic-06.jpg

### Administrative Foundation

The project includes an existing protected Admin Dashboard.

### Established Route

    /admin

### Authorization Helper

    src/lib/auth/require-manager.ts

### Existing Storage Infrastructure

The project uses Supabase Storage for website media.

### Implementation Boundary

The existence of Supabase Storage and a public gallery does not establish an operational gallery administration interface.

### Source Verification

The latest public gallery component and image sources should be inspected before changing how images are loaded.

## Administrative Architecture

The proposed GALLERY management module would operate within the existing Next.js application.

### Framework

    Next.js App Router

### Language

    TypeScript

### Styling

    Tailwind CSS

### Authentication

    Supabase Auth

### Database

    Supabase PostgreSQL

### Media Storage

    Supabase Storage

### Hosting

    Vercel

### Proposed Workflow

1. Manager opens GALLERY management.
2. Manager selects an approved image.
3. Application validates the file.
4. Image processing prepares the asset.
5. Storage upload completes.
6. Gallery metadata is saved.
7. Manager configures ordering and visibility.
8. Public website displays approved images.
9. Manager verifies the result.

### Architecture Boundary

This is a proposed flow.

The actual route structure, metadata schema, and publishing strategy require implementation approval.

## Manager Authorization

GALLERY management must be restricted to authorized staff.

### Established Helper

    requireManager()

### Source

    src/lib/auth/require-manager.ts

### Role Source

    staff_roles

### Required Role

    manager

### Active Status

The staff role must be active.

### Protected Actions

Potential administrative operations include:

- Upload image.
- Edit image metadata.
- Reorder gallery.
- Change image visibility.
- Replace image.
- Remove image.

### Server-Side Authorization

Each protected mutation must verify manager authorization on the server.

### Storage Policies

Media storage operations must enforce appropriate access controls.

### Database Policies

Gallery metadata requires appropriate database policies.

### Client-Side Restrictions

Hiding controls in the browser does not provide sufficient security.

## GALLERY Management Dashboard

**Status:** Planned

A dedicated management page may display gallery content in an organized interface.

### Proposed Sections

- Gallery overview.
- Image library.
- Upload controls.
- Image details.
- Ordering controls.
- Visibility settings.
- Publication status.

### Image Cards

Each gallery image may be represented by a thumbnail and relevant metadata.

### Potential Card Information

- Thumbnail.
- Image title.
- Display order.
- Visibility.
- Upload date.
- Processing status.

### Manager Actions

Potential actions include:

- Upload.
- Preview.
- Edit.
- Reorder.
- Activate.
- Deactivate.
- Replace.
- Remove.

### Empty State

An empty gallery should be clearly distinguished from a failed data retrieval.

### Loading State

The interface should provide appropriate feedback while images load.

### Error State

Storage or database failures should be communicated clearly.

### Mobile Layout

The management interface should remain usable on smaller screens.

## Gallery Data Model

**Status:** Design pending

The future administrative module may require persistent gallery metadata.

### Potential Fields

- Image identifier.
- Storage reference.
- Title.
- Description.
- Alternative text.
- Display order.
- Active status.
- Upload timestamp.
- Update timestamp.
- Uploaded-by identifier.

### Schema Boundary

These are conceptual attributes, not verified Supabase database columns.

### Stable Identity

Each gallery record should have a stable identifier.

### Storage Relationship

Metadata must reference a valid stored image.

### Display Order

Ordering should be stored consistently.

### Visibility

The data model should distinguish approved public images from hidden images.

### Ownership

Administrative changes may need to identify the responsible manager.

### Data Integrity

Deleting or replacing images must not leave broken public references.

## Image Upload Workflow

**Status:** Planned

The upload interface should guide managers through a controlled process.

### Step 1 — Open Management

Navigate to the approved GALLERY administration page.

### Step 2 — Select Upload

Choose the image upload action.

### Step 3 — Choose File

Select an approved image from the local device.

### Step 4 — Validate File

Check file type, size, and other requirements.

### Step 5 — Process Image

Prepare the image for approved website presentation.

### Step 6 — Preview

Allow the manager to inspect the processed result.

### Step 7 — Enter Metadata

Add required title, description, and alternative text.

### Step 8 — Upload

Send the approved asset to Supabase Storage.

### Step 9 — Save Record

Persist the associated gallery metadata.

### Step 10 — Configure Visibility

Choose the approved publication state.

### Step 11 — Verify

Confirm the image appears correctly in the administrative interface.

### Step 12 — Review Public Gallery

Check the image in the public website when published.

### Implementation Boundary

These steps describe the proposed workflow, not existing verified controls.

## Image Processing and Optimization

Gallery images should be optimized for website presentation.

### Processing Objectives

- Preserve visual quality.
- Reduce unnecessary file size.
- Maintain appropriate dimensions.
- Support responsive display.
- Avoid distortion.

### Aspect Ratio

The approved gallery presentation should determine image aspect ratio requirements.

### Source Images

Original images may require cropping or resizing.

### Output Format

The project should select an approved output format for gallery media.

### Existing Menu Image Pattern

The menu editor uses a previously inspected 4:3 WebP processing workflow.

### Important Distinction

The menu editor's image requirements must not automatically be imposed on gallery images.

### Preview

Managers should be able to inspect cropping and composition before publication.

### File Size

Upload limits should balance quality and performance.

### Orientation

Portrait and landscape images may require different handling.

### Verification

Image processing rules must be tested against the public gallery layout.

## Image Metadata

Image metadata helps managers organize and present gallery content.

### Title

A short descriptive title may help identify the image.

### Description

A longer description may provide additional context.

### Alternative Text

Alternative text should describe meaningful image content for accessibility.

### Display Order

A numeric or equivalent ordering value may control presentation sequence.

### Visibility

A publication field may indicate whether the image is public.

### Storage Reference

The record should identify the correct stored media asset.

### File Information

Dimensions and file size may be useful for administrative review.

### Attribution

The business may need to track image ownership or licensing.

### Validation

Metadata should be validated before saving.

### Public Exposure

Only approved metadata should be exposed publicly.

## Gallery Ordering

**Status:** Planned

Managers may need to change the order in which gallery images appear.

### Ordering Objective

The public gallery should follow the approved image sequence.

### Potential Controls

- Drag-and-drop ordering.
- Move up.
- Move down.
- Numeric position.

### Mobile Accessibility

Ordering must remain usable on touch devices.

### Keyboard Accessibility

Ordering should also support accessible non-drag interactions.

### Persistence

The new order must be saved reliably.

### Concurrent Changes

The system should consider conflicting ordering updates by multiple managers.

### Hidden Images

The business must define how hidden images affect ordering.

### Public Verification

Managers should confirm that the public slider reflects the saved order.

## Image Visibility and Publishing

**Status:** Planned

The administrative module should provide controlled image visibility.

### Potential States

- Draft.
- Active.
- Hidden.
- Archived.

These are conceptual states, not verified database values.

### Draft

A draft image should not appear publicly.

### Active

An active image may appear in the public gallery.

### Hidden

A hidden image should not appear in the public gallery.

### Archived

An archived image may remain stored for approved future use.

### Publication

The public gallery should display only approved visible images.

### Save Confirmation

The interface must confirm publication only after persistence succeeds.

### Cache Considerations

Changes may require an approved revalidation or caching strategy.

### Preview

Managers should be able to inspect the intended public presentation.

## Image Replacement and Removal

Image replacement and deletion require safeguards.

### Replacement

Managers may need to replace an existing gallery image.

### Replacement Objectives

- Preserve correct gallery placement.
- Avoid broken references.
- Maintain appropriate metadata.
- Prevent unintended image duplication.

### Removal

Managers may need to remove obsolete or incorrect images.

### Soft Deactivation

Hiding an image may be preferable to immediate permanent deletion.

### Permanent Deletion

Permanent removal should require appropriate confirmation.

### Storage Cleanup

The application must define whether removing a gallery record also deletes the stored file.

### Shared Assets

Files used elsewhere on the website must not be deleted accidentally.

### Rollback

The system should support an approved recovery process when practical.

### Auditability

Significant removal actions may require an audit record.

## Public Gallery Integration

The administrative module must remain compatible with the existing public gallery.

### Existing Public Component

    image-gallery

### Existing Navigation

The public gallery supports previous and next controls.

### Indicators

The public gallery includes position indicators.

### Full-Image View

Visitors can open images in a modal.

### Proposed Data Flow

1. Manager publishes approved gallery metadata.
2. Public website retrieves eligible images.
3. Images are ordered according to saved settings.
4. Public slider renders the images.
5. Visitors navigate and open full-image views.

### Source Boundary

The current public gallery's actual image loading strategy requires source inspection.

### Static Assets

Existing gallery images may be referenced through application assets.

### Future Migration

Moving from static assets to database-driven gallery content requires careful migration.

### Public Compatibility

The slider, indicators, and modal behavior should remain functional.

### Mobile Verification

Gallery presentation must be tested across mobile screen sizes.

## Supabase Storage Integration

The project uses Supabase Storage for website media.

### Existing Bucket

    website-media

### Existing Use

The bucket is used for approved website images and videos.

### Future Gallery Use

The administrative gallery may store approved images in a dedicated path within the existing media infrastructure.

### Path Design

The exact gallery storage path requires approval.

### File Naming

Storage names should avoid accidental collisions.

### Upload Authorization

Only authorized users should upload administrative gallery assets.

### Public Access

Published gallery images must be accessible through the approved public media strategy.

### Private Assets

Unpublished or sensitive assets should not become public unintentionally.

### Storage Cleanup

Unused files should be handled through an approved maintenance process.

### Verification

Storage policies, paths, and public URL behavior require implementation testing.

## Validation and Data Integrity

The administrative system should validate gallery operations.

### File Type

Accept only approved image formats.

### File Size

Enforce appropriate upload limits.

### Dimensions

Validate minimum and maximum dimensions where required.

### Aspect Ratio

Apply approved gallery presentation requirements.

### Metadata

Validate required titles and alternative text.

### Storage References

Ensure saved records reference valid media assets.

### Ordering

Prevent invalid or conflicting order values.

### Visibility

Enforce approved publication states.

### Duplicate Uploads

Detect accidental duplicates where practical.

### Server Validation

Do not rely exclusively on browser-side checks.

### Transactional Consistency

Handle partial failures between file upload and database persistence.

## Security and Privacy

GALLERY administration is a protected capability.

### Authentication

Require valid Supabase authentication.

### Authorization

Require the active manager role.

### Server-Side Enforcement

Protect all administrative operations.

### Storage Security

Use appropriate Supabase Storage policies.

### Database Security

Use appropriate metadata access policies.

### File Validation

Reject unsupported or unsafe files.

### Credentials

Do not expose privileged storage credentials in browser code.

### Image Rights

Only publish images the restaurant is authorized to use.

### Guest Privacy

Obtain appropriate permissions for identifiable guest imagery.

### Metadata Privacy

Avoid publishing sensitive location or personal metadata unintentionally.

### Logging

Avoid unnecessary sensitive information in operational logs.

### Auditability

Important gallery changes may require audit records.

## Error Handling and Recovery

### Upload Failure

Display a clear failure message and allow safe retry.

### Processing Failure

Do not upload or publish an invalid processed image.

### Storage Failure

Do not report success when the file was not stored.

### Metadata Save Failure

Handle uploaded files that lack corresponding database records.

### Broken Image Reference

Identify and correct missing or invalid storage references.

### Reordering Failure

Preserve the last valid order when saving fails.

### Publication Failure

Do not display an unpublished image as active.

### Deletion Failure

Clearly distinguish record deletion from storage file deletion.

### Concurrent Changes

Consider conflicts when multiple managers edit the gallery.

### Public Cache Mismatch

Investigate caching and revalidation behavior.

### Recovery

Provide approved rollback or correction procedures.

### Escalation

Unresolved problems should be referred to the technical maintainer.

## Manager Operating Procedures

The following procedures describe the intended future administrative workflow.

### Uploading a New Image

1. Sign in as an authorized manager.
2. Open GALLERY management.
3. Select an approved image.
4. Validate the file.
5. Review the processed preview.
6. Enter required metadata.
7. Upload the image.
8. Save the gallery record.
9. Configure visibility.
10. Verify public presentation.

### Editing Image Metadata

1. Locate the correct image.
2. Review existing metadata.
3. Update approved fields.
4. Save.
5. Confirm persistence.
6. Review public presentation.

### Reordering the Gallery

1. Review the approved image sequence.
2. Apply ordering changes.
3. Save.
4. Confirm the new order.
5. Check the public slider.

### Hiding an Image

1. Locate the image.
2. Change its visibility.
3. Save.
4. Verify it no longer appears publicly.

### Replacing an Image

1. Confirm the correct gallery entry.
2. Select the approved replacement.
3. Validate and process the file.
4. Save the replacement.
5. Verify the public image.
6. Review storage cleanup requirements.

### Removing an Image

1. Confirm the image is no longer needed.
2. Check for other references.
3. Follow the approved removal process.
4. Verify the gallery remains functional.
5. Record the action where required.

### Current Operational Boundary

These are proposed procedures, not confirmed existing management controls.

## Testing and Verification

### Authorization

- Valid active manager.
- Unauthenticated user.
- Inactive manager.
- Unauthorized role.
- Direct route access.
- Unauthorized mutation attempt.

### Upload

- Valid image.
- Invalid file type.
- Oversized file.
- Unsupported dimensions.
- Upload failure.
- Duplicate upload.

### Processing

- Correct resizing.
- Correct cropping.
- Correct output format.
- Acceptable image quality.
- Portrait handling.
- Landscape handling.

### Metadata

- Valid title.
- Valid alternative text.
- Missing required values.
- Invalid storage reference.
- Metadata save failure.

### Ordering

- Reorder images.
- Save new order.
- Verify public order.
- Handle conflicting updates.

### Visibility

- Active image visible.
- Hidden image absent.
- Draft image absent.
- Publication failure handled.

### Replacement and Removal

- Replace image.
- Preserve metadata.
- Avoid broken references.
- Prevent unintended shared-file deletion.
- Recover from failed deletion.

### Public Gallery

- Previous navigation.
- Next navigation.
- Position indicators.
- Full-image modal.
- Mobile layout.
- Empty gallery fallback.

### Security

- Database policies.
- Storage policies.
- Input validation.
- Session expiration.
- Safe file handling.

## Implementation Roadmap

### Stage 1 — Inspect Public Gallery

Review the existing gallery component and its asset references.

### Stage 2 — Approve Management Requirements

Confirm:

- Image format.
- Dimensions.
- Aspect ratio.
- File size.
- Metadata.
- Visibility rules.
- Ordering behavior.
- Deletion policy.

### Stage 3 — Design Data Model

Define approved gallery metadata tables and storage relationships.

### Stage 4 — Implement Protected Dashboard

Build the manager-only gallery administration interface.

### Stage 5 — Implement Upload Processing

Add file validation, processing, storage upload, and metadata persistence.

### Stage 6 — Implement Management Controls

Add editing, ordering, visibility, replacement, and removal.

### Stage 7 — Integrate Public Gallery

Connect approved gallery data while preserving existing slider behavior.

### Stage 8 — Test

Verify authorization, uploads, data integrity, public presentation, and recovery.

### Stage 9 — Operational Handoff

Provide manager instructions and support procedures.

### Scheduling

This sequence is proposed and does not establish a committed delivery date.

## Implementation Status

| Capability | Status |
|---|---|
| Public image gallery | Implemented |
| Previous and next navigation | Implemented |
| Gallery position indicators | Implemented |
| Full-image modal | Implemented |
| Admin Dashboard foundation | Implemented |
| Manager authentication | Implemented |
| Active manager authorization | Implemented |
| Supabase Storage infrastructure | Implemented |
| Public gallery source inventory | Verification pending |
| Dedicated GALLERY admin route | Planned |
| Gallery metadata schema | Design pending |
| Administrative image upload | Planned |
| Gallery-specific image processing | Planned |
| Image metadata editing | Planned |
| Gallery ordering controls | Planned |
| Image visibility controls | Planned |
| Image replacement | Planned |
| Image removal | Planned |
| Public database-driven gallery | Planned |
| Gallery audit history | Under Evaluation |
| End-to-end administrative testing | Pending implementation |

## Related Documentation

- [Admin Dashboard Overview](README.md)
- [Dashboard Overview](dashboard-overview.md)
- [Manager Permissions](manager-permissions.md)
- [Website GALLERY Overview](../02-website/gallery/README.md)
- [GALLERY Program Overview](../02-website/gallery/gallery-overview.md)
- [GALLERY Image Management](../02-website/gallery/image-management.md)
- [Website GALLERY Administration](../02-website/gallery/admin-management.md)
- [Database Overview](../06-database/README.md)
- [Database Storage](../06-database/storage.md)
- [Access Policies](../06-database/access-policies.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Master Documentation Index](../README.md)

---

[Back to Admin Dashboard Overview](README.md)
