# GALLERY — Admin Management

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Planned; dedicated gallery administration not yet implemented

**Feature:** Gallery Manager Administration

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Administrative Objectives](#administrative-objectives)
3. [Current Administrative Foundation](#current-administrative-foundation)
4. [Proposed Manager Interface](#proposed-manager-interface)
5. [Gallery Dashboard](#gallery-dashboard)
6. [Image Upload Workflow](#image-upload-workflow)
7. [Image Editing and Metadata](#image-editing-and-metadata)
8. [Display Order Management](#display-order-management)
9. [Visibility and Publication](#visibility-and-publication)
10. [Image Replacement](#image-replacement)
11. [Archiving and Deletion](#archiving-and-deletion)
12. [Public Gallery Preview](#public-gallery-preview)
13. [Manager Permissions](#manager-permissions)
14. [Database and Storage Integration](#database-and-storage-integration)
15. [Content Approval and Privacy](#content-approval-and-privacy)
16. [Error Handling and Recovery](#error-handling-and-recovery)
17. [Operational Procedures](#operational-procedures)
18. [Testing and Verification](#testing-and-verification)
19. [Implementation Dependencies](#implementation-dependencies)
20. [Implementation Status](#implementation-status)
21. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed
administrative capabilities for
managing the Fin & Feathers
Las Vegas website GALLERY.

The future interface should allow
authorized restaurant managers
to maintain approved gallery
content without requiring
routine developer intervention.

This document describes
planned functionality.

It does not establish that
a dedicated gallery management
interface currently exists.

## Administrative Objectives

The proposed administration
system should:

- Simplify gallery updates.
- Preserve existing public behavior.
- Support approved image uploads.
- Support metadata editing.
- Support image reordering.
- Control public visibility.
- Prevent accidental data loss.
- Protect storage operations.
- Provide clear operational feedback.
- Support mobile and desktop administration.

### Primary Business Goal

Managers should be able
to update the public
gallery through a secure
administrative interface.

### Content Quality

Published imagery must
meet approved restaurant
branding and quality standards.

## Current Administrative Foundation

The website already has
a manager dashboard.

Established route:

    /admin

Existing manager authorization:

    src/lib/auth/require-manager.ts

### Existing Administrative Features

The dashboard currently
provides access to:

- Reservation management.
- Menu management.

### Existing Public Gallery

The homepage includes
a gallery slider with:

- Previous navigation.
- Next navigation.
- Indicator dots.
- Enlarged image viewing.

### Existing Media Storage

The project uses
Supabase Storage.

Established bucket:

    website-media

### Planned Functionality

The following gallery
administration capabilities
are not yet established
as operational:

- Gallery image uploads.
- Gallery metadata editing.
- Display order controls.
- Image visibility management.
- Image replacement.
- Image archival.
- Image deletion.

## Proposed Manager Interface

**Status:** Planned

The manager dashboard may
include a Gallery Management
navigation entry.

### Potential Sections

- Gallery Overview.
- All Images.
- Upload Image.
- Hidden Images.
- Archived Images.

These are proposed interface
areas, not confirmed routes.

### Interface Design

The interface should follow
the existing administrative
design language.

### Responsive Requirements

Managers should be able
to review and maintain
gallery content on
appropriate mobile
and desktop devices.

### Accessibility

Controls must be
keyboard-accessible,
clearly labeled,
and understandable.

### Existing Feature Protection

Adding gallery administration
must not disrupt
Reservations or
Menu Management.

## Gallery Dashboard

**Status:** Planned

The primary view may
display gallery images
as thumbnails.

### Potential Information

Each image entry may show:

- Thumbnail.
- Caption.
- Alternative text.
- Display order.
- Visibility status.
- Upload date.
- Last updated date.

### Potential Actions

- Edit.
- Reorder.
- Hide.
- Restore.
- Replace.
- Archive.
- Delete.

### Filtering

Potential filters include:

- Visible images.
- Hidden images.
- Archived images.
- Recently uploaded images.

### Sorting

Potential sorting options:

- Display order.
- Upload date.
- Last updated.
- Filename.

### Empty States

The interface should
provide useful messaging
when no images match
the selected filter.

## Image Upload Workflow

**Status:** Planned

Managers may eventually
upload approved gallery images.

### Proposed Workflow

1. Open Gallery Management.
2. Select Upload Image.
3. Choose an approved file.
4. Validate the file.
5. Process the image if required.
6. Enter image metadata.
7. Select display position.
8. Select publication status.
9. Save the image.
10. Verify public presentation.

### File Validation

The system should check:

- File type.
- File size.
- Image dimensions.
- File integrity.
- Manager authorization.

### Processing

Potential image processing
includes:

- Resizing.
- Compression.
- Format conversion.
- Thumbnail generation.

Processing requirements
remain under evaluation.

### Upload Progress

The interface should
communicate whether
an upload is:

- Pending.
- Uploading.
- Processing.
- Saving.
- Complete.
- Failed.

### Success Criteria

A successful upload
must not be reported
until required storage
and database operations
have completed.

## Image Editing and Metadata

**Status:** Planned

Managers may need
to edit image information
without uploading
a replacement file.

### Proposed Editable Fields

- Caption.
- Alternative text.
- Display order.
- Visibility status.

Additional fields
require approval.

### Alternative Text

Content images should
have meaningful
alternative text.

### Captions

Captions must follow
approved restaurant
messaging.

### Internal Metadata

Administrative notes,
if introduced,
must not be exposed
through public queries.

### Validation

Metadata updates
must be validated
before saving.

### Save Feedback

The interface should
report success only
after the update
has been persisted.

## Display Order Management

**Status:** Planned

Managers may eventually
control the order
in which gallery
images appear.

### Potential Controls

- Drag-and-drop.
- Move up.
- Move down.
- Numeric position.

### Public Ordering

The public gallery
should use the
approved saved order.

### Hidden Images

Hidden images should
not cause unpredictable
public ordering.

### Concurrent Editing

The implementation
should consider
simultaneous changes
by multiple managers.

### Error Handling

A failed reorder
must not be displayed
as successfully saved.

## Visibility and Publication

**Status:** Planned

The future interface
may support image
publication states.

### Draft

An image is being
prepared and is
not public.

### Visible

An approved image
is eligible for
public display.

### Hidden

An image remains
managed but is excluded
from public gallery results.

### Archived

An image is retained
outside the active
gallery workflow.

### Publication Approval

Restaurant ownership
must determine who
may approve and
publish images.

### Storage Visibility

Hiding an image
from the gallery
does not automatically
make a public storage
URL inaccessible.

This distinction must
be understood when
handling sensitive media.

## Image Replacement

**Status:** Planned

Managers may need
to replace an image
while preserving
its gallery position.

### Proposed Workflow

1. Select an existing image.
2. Choose a replacement file.
3. Validate the replacement.
4. Process the replacement if required.
5. Upload the new file.
6. Update the gallery record.
7. Verify public presentation.
8. Remove unused media safely.

### Metadata Retention

The system must define
which metadata is retained
during replacement.

Potential retained fields:

- Display order.
- Caption.
- Alternative text.
- Publication status.

### Failure Protection

The original image
should remain available
until the replacement
is successfully registered.

### Caching

Replacement must account
for image caching
and updated URLs.

## Archiving and Deletion

**Status:** Planned; policies pending

Image removal requires
careful safeguards.

### Hiding

Hiding is the preferred
non-destructive option
when temporary removal
is sufficient.

### Archiving

Archiving may preserve
historical content.

### Permanent Deletion

Permanent deletion
should require explicit
confirmation.

### Shared Media Protection

The system must verify
that an image is not
used elsewhere before
deleting its storage object.

### Retention Policy

The restaurant must
approve retention
and recovery requirements.

### Audit History

The project should
evaluate recording
important deletion
and archival actions.

## Public Gallery Preview

**Status:** Planned

Managers may benefit
from previewing
gallery changes
before publication.

### Preview Requirements

A preview may display:

- Image appearance.
- Caption.
- Display position.
- Mobile presentation.
- Desktop presentation.

### Preview Limitations

A preview is not proof
that a change has
been published.

### Public Verification

After saving,
managers should verify
the public website.

### Navigation Verification

The existing previous,
next, indicator, and
enlarged-image interactions
must continue to work.

## Manager Permissions

Administrative actions
must use the established
manager authorization system.

### Existing Authentication

The project uses
Supabase Auth.

### Existing Role Data

Manager authorization
uses the `staff_roles`
table.

### Existing Helper

    src/lib/auth/require-manager.ts

### Authorization Requirements

The helper checks for
an authenticated user
with an active
manager role.

### Server-Side Protection

Protected operations
must enforce authorization
on the server.

### Storage Protection

Upload, replacement,
and deletion operations
must be appropriately
restricted.

### Future Permissions

More granular permissions
may be considered later.

They must not be assumed
to exist currently.

## Database and Storage Integration

**Status:** Planned

A future gallery system
may use Supabase
database records
and Storage objects.

### Potential Gallery Record

A record may include:

- Gallery image ID.
- Storage path.
- Caption.
- Alternative text.
- Display order.
- Publication status.
- Created timestamp.
- Updated timestamp.

These are conceptual fields,
not confirmed existing
database columns.

### Storage Bucket

Existing bucket:

    website-media

### Potential Storage Prefix

A gallery-specific
prefix may be introduced.

The final path
requires approval.

### Public Queries

Only approved public
gallery data should
be returned to visitors.

### Administrative Writes

Only authorized managers
should modify records.

### Data Integrity

The implementation
must handle partial
database and storage failures.

### Shared Media

Storage cleanup must
avoid deleting assets
used by other website
components.

## Content Approval and Privacy

Public gallery content
must meet restaurant
approval requirements.

### Image Ownership

The restaurant must
have appropriate rights
to publish each image.

### Customer Images

Images containing
identifiable customers
require appropriate
permissions and review.

### Sensitive Information

Do not publish
confidential business
or customer information.

### Brand Consistency

Images should reflect
approved restaurant
branding and presentation.

### Moderation

Ownership must establish
who is responsible
for reviewing uploads.

### Removal Requests

The project should
define how to handle
requests to remove
published images.

## Error Handling and Recovery

The interface must
handle operational
failures safely.

### Upload Failure

Do not publish a
gallery record for
an unsuccessful upload.

### Database Failure

Do not report success
when a record cannot
be saved.

### Replacement Failure

Preserve the original
image when replacement
does not complete.

### Reordering Failure

Retain or restore
the last confirmed order.

### Deletion Failure

Identify incomplete
cleanup operations.

### Network Interruption

The interface should
allow safe retry
when appropriate.

### Recovery Procedure

Managers should:

1. Review the error.
2. Confirm the actual saved state.
3. Avoid repeating destructive actions.
4. Retry when safe.
5. Escalate unresolved issues.
6. Verify the final public result.

## Operational Procedures

### Adding Gallery Content

1. Confirm image approval.
2. Open Gallery Management.
3. Upload the image.
4. Enter metadata.
5. Configure display order.
6. Set visibility.
7. Save.
8. Verify the public gallery.

### Updating an Image Caption

1. Select the image.
2. Edit the caption.
3. Save.
4. Verify the public result.

### Reordering Images

1. Review the current sequence.
2. Adjust image positions.
3. Save.
4. Verify the displayed order.

### Temporarily Removing an Image

1. Select the image.
2. Change visibility to Hidden.
3. Save.
4. Verify public removal.

### Replacing an Image

1. Select the existing image.
2. Upload the approved replacement.
3. Verify the new image.
4. Confirm metadata and ordering.
5. Clean up unused files safely.

### Permanently Deleting an Image

1. Confirm deletion authority.
2. Verify the image is not shared.
3. Confirm the destructive action.
4. Apply the approved deletion procedure.
5. Verify database and storage consistency.

## Testing and Verification

### Authentication

- Reject unauthenticated users.
- Reject unauthorized roles.
- Reject inactive managers.
- Permit authorized managers.

### Uploads

- Accept approved file types.
- Reject unsupported files.
- Reject oversized files.
- Handle malformed images.
- Handle upload failures.

### Metadata

- Edit captions.
- Edit alternative text.
- Save permitted fields.
- Reject invalid data.
- Verify public updates.

### Ordering

- Move images.
- Save order.
- Verify public order.
- Handle hidden images.
- Handle concurrent changes.

### Visibility

- Publish approved images.
- Hide images.
- Restore images.
- Archive images if supported.
- Verify public filtering.

### Replacement and Deletion

- Replace images safely.
- Preserve existing records on failure.
- Confirm destructive actions.
- Protect shared media.
- Verify storage cleanup.

### Public Gallery

- Verify previous navigation.
- Verify next navigation.
- Verify indicator dots.
- Verify enlarged image viewing.
- Verify responsive layouts.
- Verify accessibility.

### Security

- Verify server-side authorization.
- Verify database access policies.
- Verify storage access policies.
- Verify upload validation.
- Verify credential protection.

## Implementation Dependencies

Before development begins,
the project should confirm:

1. Existing gallery component structure.
2. Existing asset paths.
3. Approved manager requirements.
4. Gallery database schema.
5. Supabase Storage policies.
6. Accepted upload formats.
7. File-size limits.
8. Image processing strategy.
9. Publication and approval rules.
10. Deletion and recovery policies.
11. Public gallery migration strategy.
12. Testing and rollback procedures.

### Development Sequence

A proposed sequence is:

1. Verify existing implementation.
2. Approve gallery requirements.
3. Design database records.
4. Configure secure storage.
5. Implement manager reads.
6. Implement uploads.
7. Implement metadata editing.
8. Implement ordering and visibility.
9. Implement replacement safeguards.
10. Connect the public gallery.
11. Test end to end.
12. Deploy and verify.

This sequence is proposed,
not a committed development schedule.

## Implementation Status

| Capability | Status |
|---|---|
| Existing admin dashboard | Implemented |
| Existing manager authorization | Implemented |
| Existing public gallery | Implemented |
| Existing Supabase Storage bucket | Implemented |
| Gallery management dashboard | Planned |
| Image upload interface | Planned |
| Upload validation | Planned |
| Gallery metadata editing | Planned |
| Display order controls | Planned |
| Image visibility controls | Planned |
| Image publication workflow | Planned |
| Image replacement | Planned |
| Image archival | Under Evaluation |
| Permanent deletion safeguards | Planned |
| Public gallery preview | Planned |
| Gallery database schema | Planned |
| Image processing | Under Evaluation |
| Administrative audit history | Under Evaluation |
| Dynamic gallery integration | Planned |
| End-to-end gallery testing | Pending implementation |

## Related Documentation

- [GALLERY Overview](README.md)
- [System Overview](gallery-overview.md)
- [Image Management](image-management.md)
- [Website Overview](../README.md)
- [Homepage](../homepage.md)
- [Admin Dashboard](../../04-admin-dashboard/README.md)
- [GALLERY Admin Category](../../04-admin-dashboard/gallery-management.md)
- [Manager Permissions](../../04-admin-dashboard/manager-permissions.md)
- [Database & Storage](../../06-database/README.md)
- [Storage](../../06-database/storage.md)
- [Operations](../../08-operations/README.md)
- [Master Documentation Index](../../README.md)

---

[Back to GALLERY Overview](README.md)
