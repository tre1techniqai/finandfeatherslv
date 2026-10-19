# GALLERY — Image Management

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Existing gallery assets implemented; managed image operations planned

**Feature:** Gallery Image Management

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Current Image Implementation](#current-image-implementation)
3. [Image Management Objectives](#image-management-objectives)
4. [Proposed Image Lifecycle](#proposed-image-lifecycle)
5. [Image Upload Requirements](#image-upload-requirements)
6. [File Validation](#file-validation)
7. [Image Processing](#image-processing)
8. [File Naming and Storage Paths](#file-naming-and-storage-paths)
9. [Image Metadata](#image-metadata)
10. [Display Order](#display-order)
11. [Visibility and Publication](#visibility-and-publication)
12. [Image Replacement](#image-replacement)
13. [Image Deletion and Recovery](#image-deletion-and-recovery)
14. [Supabase Storage Integration](#supabase-storage-integration)
15. [Database Consistency](#database-consistency)
16. [Performance and Optimization](#performance-and-optimization)
17. [Security and Privacy](#security-and-privacy)
18. [Operational Procedures](#operational-procedures)
19. [Testing and Verification](#testing-and-verification)
20. [Implementation Status](#implementation-status)
21. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the proposed
image management requirements
for the Fin & Feathers
Las Vegas GALLERY system.

The objective is to allow
authorized managers to maintain
approved gallery imagery
without requiring routine
source-code modifications.

This document distinguishes
existing gallery assets from
future upload, processing,
ordering, and deletion features.

## Current Image Implementation

**Status:** Public gallery implemented

The website currently includes
an image gallery slider.

Established component:

    image-gallery

### Existing Gallery Assets

The established image names are:

    gallery-pic-01.jpg
    gallery-pic-02.jpg
    gallery-pic-03.jpg
    gallery-pic-04.jpg
    gallery-pic-05.jpg
    gallery-pic-06.jpg

The current source files
and active asset paths
must be verified.

### Existing Public Features

The gallery includes:

- Previous and next navigation.
- Slide indicator dots.
- Enlarged image viewing.

### Existing Administrative Foundation

The website has a
manager dashboard.

Established route:

    /admin

The project also uses
Supabase Storage.

### Not Yet Verified

A native gallery
image management interface
has not been established
as operational.

Future capabilities include:

- Image uploading.
- Image metadata editing.
- Image ordering.
- Visibility controls.
- Image replacement.
- Safe deletion.

## Image Management Objectives

The future system should:

- Preserve image quality.
- Simplify routine updates.
- Prevent broken images.
- Maintain consistent ordering.
- Support approved content.
- Protect media operations.
- Reduce unnecessary storage usage.
- Preserve existing gallery behavior.
- Support mobile and desktop.

### Administrative Simplicity

Managers should be able
to perform approved
image operations through
a clear interface.

### Public Reliability

Image management operations
must not interrupt
the public gallery.

## Proposed Image Lifecycle

**Status:** Planned

An image may pass through
several operational stages.

### 1. Selection

A manager selects
an approved image.

### 2. Validation

The application checks
file requirements.

### 3. Processing

The image may be
resized or optimized.

### 4. Upload

The processed image
is stored securely.

### 5. Registration

A gallery record
is created or updated.

### 6. Publication

The image becomes
eligible for public display.

### 7. Maintenance

Managers may edit metadata,
ordering, or visibility.

### 8. Replacement or Removal

An image may be
replaced, archived,
or deleted according
to approved procedures.

### Lifecycle Status

This is a proposed workflow,
not an existing automated
gallery pipeline.

## Image Upload Requirements

**Status:** Planned

The future interface
may support uploads
from a manager's device.

### Supported File Types

Potential supported formats:

- JPEG.
- PNG.
- WebP.

The final accepted formats
require technical approval.

### Upload Size

A maximum file size
must be defined.

The system should
reject oversized files
before unnecessary
processing or storage.

### Image Dimensions

Minimum and maximum
image dimensions
should be established.

### Image Orientation

The gallery should
support approved
landscape and portrait
images according to
the final presentation design.

### Upload Progress

The interface may display:

- Uploading.
- Processing.
- Saving.
- Completed.
- Failed.

### Success Confirmation

Success must be shown
only after the required
storage and data operations
have completed.

## File Validation

File validation must
protect the application
and media storage.

### Validation Requirements

Check:

- Authenticated manager access.
- Approved file type.
- File size.
- Image dimensions.
- File integrity.
- Supported processing format.

### Extension Validation

A filename extension
alone must not be
considered sufficient
file validation.

### Invalid Files

Invalid files must
be rejected with
clear feedback.

### Malformed Images

Corrupt or unsupported
images should not
be published.

### Duplicate Files

The project must decide
whether duplicate uploads
are permitted.

### Server-Side Enforcement

Critical validation
must not depend solely
on browser-side checks.

## Image Processing

**Status:** Under Evaluation

The system may process
images before publication.

### Resizing

Oversized images
may be reduced
to approved dimensions.

### Compression

Compression should
balance visual quality
with file size.

### Format Conversion

The system may convert
images to an approved
web-friendly format.

### Thumbnails

Thumbnail versions
may improve gallery
loading performance.

### Orientation

Image orientation
should remain correct
after processing.

### Color Handling

Processing should avoid
unexpected color shifts.

### Original Files

The project must decide
whether original
uploads are retained.

### Processing Failures

An image must not
be published when
required processing fails.

## File Naming and Storage Paths

**Status:** Planned

Managed images should
use predictable,
collision-resistant
storage names.

### Existing Names

Current gallery assets
use sequential names
such as:

    gallery-pic-01.jpg

### Future Naming

A future upload system
should avoid relying
only on sequential filenames.

### Potential Naming Strategy

Use generated unique
identifiers or another
approved collision-resistant
approach.

### Storage Organization

A future gallery prefix
may be introduced
within the existing
media bucket.

Conceptual example:

    website-media/gallery/

This path is proposed,
not an established
storage requirement.

### Path Safety

Storage paths must
not allow traversal
or unauthorized access.

### Reference Stability

Renaming a stored image
must not silently break
existing gallery references.

## Image Metadata

**Status:** Planned

A future gallery record
may contain metadata
describing the image.

### Potential Metadata

- Image identifier.
- Storage object path.
- Alternative text.
- Caption.
- Display order.
- Visibility status.
- File type.
- File size.
- Image dimensions.
- Created timestamp.
- Updated timestamp.

These are proposed fields,
not verified database columns.

### Alternative Text

Content images should
have meaningful
alternative text.

### Captions

Optional captions
should contain
approved restaurant
messaging.

### Internal Notes

Internal administrative
notes, if supported,
must not appear
in public responses.

### Metadata Updates

Managers should be able
to edit permitted metadata
without reuploading
the image.

## Display Order

**Status:** Planned

Managers may eventually
control the order
of gallery images.

### Ordering Options

Potential controls include:

- Drag-and-drop.
- Move up.
- Move down.
- Numeric position.

### Public Ordering

The gallery should
display published images
according to the
approved stored order.

### Hidden Images

Hiding an image
should not create
unpredictable ordering.

### New Uploads

The system must define
where newly uploaded
images appear.

### Concurrent Edits

The design should consider
multiple managers changing
image order simultaneously.

### Save Confirmation

The interface must not
report a successful reorder
until the update succeeds.

## Visibility and Publication

**Status:** Planned

Managers may need
to control public visibility.

### Draft

An image record
is being prepared
and is not public.

### Visible

An approved image
is eligible for display.

### Hidden

An image remains
managed but is excluded
from public gallery results.

### Archived

A future archive option
may retain an image
outside the active gallery.

### Deleted

Permanent deletion
requires approved safeguards.

### Important Distinction

Hiding an image
in the database
does not automatically
make a previously public
storage URL private.

### Publication Approval

The restaurant must define
who can approve
new public imagery.

## Image Replacement

**Status:** Planned

Managers may need
to replace an existing
gallery image.

### Replacement Workflow

1. Select the existing image.
2. Choose an approved replacement.
3. Validate the replacement file.
4. Process the image if required.
5. Upload the replacement.
6. Update the gallery reference.
7. Verify public presentation.
8. Remove unused files
   only after safe verification.

### Preserve Metadata

The system should define
whether captions, alternative
text, and display order
are retained during replacement.

### Avoid Broken References

The existing image
should remain available
until the replacement
is successfully registered.

### Cache Behavior

Replacing an image
may require cache
invalidation or a
new object URL.

### Failure Recovery

A failed replacement
must not leave the
gallery pointing to
a missing image.

## Image Deletion and Recovery

**Status:** Planned; policy pending

Deleting media can
cause permanent data loss.

### Soft Deletion

The system may first
hide or archive images.

### Permanent Deletion

Permanent deletion
should require an
explicit confirmation.

### Shared Media

Before deleting an object,
the system must verify
that other website features
do not depend on it.

### Database Cleanup

Related records
must remain consistent.

### Storage Cleanup

Unused storage objects
may be removed according
to an approved procedure.

### Recovery

The project should define
whether deleted images
can be restored.

### Auditability

Important deletion actions
should be recorded
where supported.

## Supabase Storage Integration

The project uses
Supabase Storage.

Established bucket:

    website-media

### Current Usage

The bucket supports
website media, including
menu imagery and video.

### Gallery Integration

The future gallery
may store managed
images in a dedicated
bucket prefix.

### Upload Authorization

Only authorized staff
should upload images.

### Delete Authorization

Storage deletion
must be protected.

### Public URLs

Public gallery images
may use approved
public URLs.

### Storage Policies

Storage access policies
must be reviewed before
implementing uploads.

### Service Credentials

Private Supabase credentials
must never be exposed
to public browser code.

## Database Consistency

**Status:** Planned

The future system
may use a database table
for gallery metadata.

### Proposed Relationship

A gallery record
references a stored
media object.

### Upload Consistency

The application must avoid
creating public records
for failed uploads.

### Deletion Consistency

Deleting a database record
must not accidentally
remove shared media.

### Partial Failures

The system must handle
cases where:

- Storage upload succeeds
  but database insertion fails.
- Database update succeeds
  but storage cleanup fails.
- Image replacement fails
  during processing.
- Network interruption occurs
  during an operation.

### Recovery Strategy

A documented cleanup
or reconciliation process
should address
partial failures.

### Data Integrity

The database should
enforce appropriate
constraints where practical.

## Performance and Optimization

Gallery media should
be optimized for
responsive browsing.

### Image Dimensions

Images should match
their intended
display context.

### Responsive Delivery

The application should
evaluate appropriate
image sizes for
different devices.

### Compression

Avoid unnecessarily
large files.

### Lazy Loading

Images outside
the initial viewport
may be loaded later.

### Enlarged Images

Full-size viewing
should not force
all large assets
to load immediately.

### Layout Stability

Reserve predictable
image display space.

### Caching

Cache settings should
support performance
without leaving
outdated images visible
after approved updates.

### Testing

Performance should
be checked on
mobile connections
as well as desktop.

## Security and Privacy

Image management
requires secure
administrative controls.

### Existing Manager Helper

    src/lib/auth/require-manager.ts

### Authorization

All protected operations
must verify manager access
on the server.

### Storage Permissions

Uploads, updates,
and deletion must
use appropriate
storage access policies.

### File Validation

Do not trust
uploaded filenames
or file extensions alone.

### Customer Privacy

Images containing
identifiable customers
require appropriate
permissions and review.

### Content Rights

The restaurant must
have permission to
publish uploaded images.

### Sensitive Information

Do not upload
confidential business
or customer information
for public display.

### Logging

Operational logs
must not expose
private credentials.

## Operational Procedures

### Uploading an Image

1. Confirm image approval.
2. Open Gallery Management.
3. Select the image file.
4. Validate the upload.
5. Enter metadata.
6. Select visibility.
7. Save.
8. Verify public presentation.

### Editing Metadata

1. Locate the image.
2. Update permitted fields.
3. Save.
4. Verify the change.

### Reordering Images

1. Review the current order.
2. Adjust image positions.
3. Save.
4. Verify the public sequence.

### Hiding an Image

1. Select the image.
2. Change visibility.
3. Save.
4. Confirm public removal.

### Replacing an Image

1. Select the existing image.
2. Upload the replacement.
3. Verify the new reference.
4. Confirm public presentation.
5. Remove unused media safely.

### Deleting an Image

1. Confirm deletion authority.
2. Verify the image is not shared.
3. Confirm the action.
4. Apply approved deletion rules.
5. Verify database consistency.
6. Verify storage cleanup.

## Testing and Verification

### File Validation

- Accept approved image formats.
- Reject unsupported file types.
- Reject oversized files.
- Reject malformed images.
- Reject unauthorized uploads.

### Processing

If implemented:

- Verify resizing.
- Verify compression.
- Verify orientation.
- Verify thumbnail generation.
- Verify processing failures.

### Storage

- Verify successful uploads.
- Verify correct object paths.
- Verify access restrictions.
- Verify public URL behavior.
- Verify failed upload cleanup.

### Metadata

- Verify alternative text.
- Verify captions.
- Verify display order.
- Verify visibility.
- Verify permitted updates.

### Replacement and Deletion

- Verify safe replacement.
- Verify failure recovery.
- Verify shared-file protection.
- Verify archive behavior.
- Verify deletion confirmation.

### Public Gallery

- Verify all published images.
- Verify hidden-image filtering.
- Verify image ordering.
- Verify enlarged image viewing.
- Verify mobile responsiveness.
- Verify desktop responsiveness.
- Verify accessibility.

### Security

- Verify manager authorization.
- Verify storage policies.
- Verify database access policies.
- Verify file validation.
- Verify credential protection.

## Implementation Status

| Capability | Status |
|---|---|
| Existing public gallery | Implemented |
| Existing gallery assets | Implemented; paths require verification |
| Supabase Storage bucket | Implemented |
| Gallery-specific upload interface | Planned |
| Upload file validation | Planned |
| Image resizing and compression | Under Evaluation |
| Thumbnail generation | Under Evaluation |
| Unique file naming | Planned |
| Gallery metadata database | Planned |
| Alternative text editing | Planned |
| Caption editing | Planned |
| Image ordering | Planned |
| Visibility management | Planned |
| Image replacement | Planned |
| Image archival | Under Evaluation |
| Safe deletion | Planned |
| Partial-failure recovery | Planned |
| Dynamic gallery testing | Pending implementation |

## Related Documentation

- [GALLERY Overview](README.md)
- [System Overview](gallery-overview.md)
- [Admin Management](admin-management.md)
- [Website Overview](../README.md)
- [Homepage](../homepage.md)
- [Admin Dashboard](../../04-admin-dashboard/README.md)
- [GALLERY Admin Category](../../04-admin-dashboard/gallery-management.md)
- [Database & Storage](../../06-database/README.md)
- [Storage](../../06-database/storage.md)
- [Operations](../../08-operations/README.md)
- [Master Documentation Index](../../README.md)

---

[Back to GALLERY Overview](README.md)
