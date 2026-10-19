# GALLERY — System Overview

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Public gallery implemented; administrative management planned

**Feature:** Restaurant Image Gallery

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Gallery Objectives](#gallery-objectives)
3. [Current Public Implementation](#current-public-implementation)
4. [Existing Gallery Assets](#existing-gallery-assets)
5. [Public Gallery Experience](#public-gallery-experience)
6. [Proposed Gallery Architecture](#proposed-gallery-architecture)
7. [Gallery Content Model](#gallery-content-model)
8. [Image Upload and Processing](#image-upload-and-processing)
9. [Image Ordering](#image-ordering)
10. [Image Visibility](#image-visibility)
11. [Manager Administration](#manager-administration)
12. [Supabase Storage](#supabase-storage)
13. [Responsive Design and Accessibility](#responsive-design-and-accessibility)
14. [Performance and Optimization](#performance-and-optimization)
15. [Security and Content Approval](#security-and-content-approval)
16. [Operational Workflows](#operational-workflows)
17. [Testing and Verification](#testing-and-verification)
18. [Implementation Status](#implementation-status)
19. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the
Fin & Feathers Las Vegas
website image gallery.

It distinguishes between
the existing public gallery
and proposed future
administrative capabilities.

The documentation covers:

- Public image presentation.
- Existing gallery assets.
- Image navigation.
- Full-image viewing.
- Image storage.
- Future image uploads.
- Image ordering.
- Visibility management.
- Administrative security.
- Performance and accessibility.

## Gallery Objectives

The gallery is intended
to showcase the restaurant's
atmosphere, food, and
customer experience.

### Customer Experience Goals

- Present high-quality imagery.
- Encourage exploration.
- Reinforce restaurant branding.
- Support mobile visitors.
- Provide simple navigation.
- Allow enlarged image viewing.

### Administrative Goals

Future management tools
should allow authorized
staff to update gallery
content without routine
source-code changes.

### Content Accuracy

Published images should
accurately represent
the restaurant and its
approved promotional content.

## Current Public Implementation

**Status:** Implemented

The homepage includes
an existing image gallery
slider component.

Established component:

    image-gallery

### Existing Interactions

The public gallery includes:

- Previous navigation.
- Next navigation.
- Slide indicator dots.
- Click-to-open full-image viewing.

### Full-Image Experience

Selecting an image opens
a larger presentation
through the established
gallery modal behavior.

### Current Limitations

The current implementation
has not been verified
as supporting native
manager-controlled:

- Image uploads.
- Image deletion.
- Drag-and-drop ordering.
- Publication status.
- Image metadata editing.
- Gallery analytics.

These capabilities remain
planned or under evaluation.

### Source Verification

The gallery component's
current source file,
asset references, and
modal behavior should
be inspected before
administrative development.

## Existing Gallery Assets

The established website
uses gallery images named:

    gallery-pic-01.jpg
    gallery-pic-02.jpg
    gallery-pic-03.jpg
    gallery-pic-04.jpg
    gallery-pic-05.jpg
    gallery-pic-06.jpg

### Asset Verification

The current repository
should be inspected to
confirm the active
asset paths and references.

### Existing Asset Handling

The public gallery
must continue to work
during future migration
to a managed content system.

### Migration Requirement

If images are moved
to Supabase Storage,
existing public presentation
should remain intact
until the replacement
is verified.

## Public Gallery Experience

The gallery should provide
a consistent browsing
experience across devices.

### Previous and Next

Visitors can move
between gallery images.

### Slide Indicators

Indicator dots communicate
the active image position.

### Enlarged Image

Selecting an image
opens a larger view.

### Modal Dismissal

The existing modal
dismissal behavior
must be verified
before making changes.

### Navigation Consistency

Navigation should behave
predictably at the
beginning and end
of the image collection.

### Empty Gallery

A future dynamic gallery
must define behavior
when no published images
are available.

### Loading Errors

The interface should
handle unavailable images
without breaking
the entire page.

## Proposed Gallery Architecture

**Status:** Planned

The future gallery
may separate content
management from
public presentation.

### Public Component

The existing gallery
continues to render
approved images.

### Gallery Data

A structured source
provides image records.

### Image Storage

Approved image files
are stored in an
appropriate media location.

### Manager Interface

Authorized managers
create and maintain
gallery records.

### Architectural Objective

Allow routine gallery
updates without
requiring application
source-code edits.

### Migration Strategy

The implementation
should preserve
the current gallery
until dynamic content
has been tested.

## Gallery Content Model

**Status:** Planned; schema pending

A future gallery record
may contain:

- Image identifier.
- Storage path.
- Public image URL.
- Alternative text.
- Caption.
- Display order.
- Visibility status.
- Created timestamp.
- Updated timestamp.

These are conceptual fields,
not confirmed existing
database columns.

### Image Identity

Each managed image
should have a stable
identifier.

### Alternative Text

Images should have
meaningful alternative text
where appropriate.

### Captions

Optional captions
must use approved content.

### Display Order

Ordering should be
stored explicitly
rather than depending
on upload time alone.

### Visibility

Managers may need
to hide an image
without deleting it.

## Image Upload and Processing

**Status:** Planned

A future manager interface
may allow image uploads.

### Supported Formats

The final implementation
must define approved
image formats.

Potential formats include:

- JPEG.
- PNG.
- WebP.

### Upload Validation

The system should validate:

- File type.
- File size.
- Image dimensions.
- File integrity.
- Manager authorization.

### Image Processing

Potential processing
capabilities include:

- Resizing.
- Compression.
- Format conversion.
- Thumbnail generation.
- Orientation correction.

These capabilities are
not established as
existing gallery features.

### Upload Feedback

Managers should receive
clear success or
failure messages.

### Duplicate Handling

The system should
define how duplicate
uploads are handled.

### Failed Uploads

Failed uploads must not
create broken public
gallery entries.

## Image Ordering

**Status:** Planned

Managers may eventually
control gallery image order.

### Ordering Methods

Potential approaches include:

- Drag-and-drop.
- Move up or down.
- Numeric display position.

### Public Ordering

The public gallery
should follow the
approved stored order.

### Consistency

Ordering must remain
predictable after:

- Uploading images.
- Hiding images.
- Deleting images.
- Restoring images.
- Editing image records.

### Concurrent Changes

The system should consider
how to handle multiple
managers editing
the gallery simultaneously.

## Image Visibility

**Status:** Planned

Managers may need
to control whether
an image is public.

### Visible

The image is eligible
for public display.

### Hidden

The image remains
stored but does not
appear in the
public gallery.

### Archived

A future archive option
may retain an image
outside routine
gallery management.

### Deleted

Permanent deletion
requires an approved
retention and recovery
policy.

### Public Queries

Hidden or unpublished
records should not
appear in public
gallery results.

### Important Storage Distinction

Hiding a database record
does not necessarily
make a previously public
storage URL inaccessible.

Private-media requirements
must be evaluated separately.

## Manager Administration

**Status:** Planned

The future manager dashboard
may include a gallery
management section.

### Potential Capabilities

- View all gallery images.
- Upload images.
- Edit captions.
- Edit alternative text.
- Change display order.
- Hide images.
- Restore hidden images.
- Remove images.
- Preview public presentation.

### Manager Authorization

Established authorization helper:

    src/lib/auth/require-manager.ts

Protected operations
must verify authorization
on the server.

### Content Approval

Ownership must establish
who may approve
public-facing imagery.

### Existing Dashboard

The new interface
should integrate with
the existing `/admin`
dashboard without
disrupting current
Reservations or
Menu Management functionality.

## Supabase Storage

The website uses
Supabase Storage.

Established bucket:

    website-media

### Existing Usage

The bucket is already
used for website media,
including menu imagery
and video assets.

### Future Gallery Storage

A dedicated gallery
storage prefix may
be introduced.

The final path
requires approval.

### Public Media

Public gallery images
may use approved
publicly accessible URLs.

### Storage Security

Upload, update, and
delete operations
must be restricted.

### Database and Storage Consistency

The application should
avoid leaving orphaned
database records or
unused media files.

### Deletion Safety

Deleting a storage object
must not accidentally
remove media used
elsewhere on the website.

## Responsive Design and Accessibility

The gallery should
follow the website's
mobile-first design.

### Mobile Requirements

- Touch-friendly navigation.
- Responsive image sizing.
- Readable controls.
- Accessible modal behavior.
- Predictable image loading.

### Desktop Requirements

- Clear previous/next controls.
- Responsive gallery width.
- Appropriate enlarged viewing.
- Keyboard-accessible interactions.

### Alternative Text

Meaningful content images
should have suitable
alternative text.

Decorative images
may use appropriate
decorative-image handling.

### Keyboard Navigation

Interactive controls
should be reachable
by keyboard.

### Modal Accessibility

The full-image modal
should support appropriate:

- Focus management.
- Escape-key behavior.
- Accessible labeling.
- Focus restoration.

### Reduced Motion

Any gallery animations
should respect
reduced-motion preferences.

## Performance and Optimization

Image galleries can
affect page loading
and responsiveness.

### Image Dimensions

Images should be
sized appropriately
for their display context.

### Compression

Media should be
optimized without
unacceptable quality loss.

### Responsive Images

The application should
evaluate serving
appropriately sized images.

### Lazy Loading

Offscreen gallery images
may benefit from
controlled lazy loading.

### Full-Image Loading

Large images should
not unnecessarily
delay the initial
homepage render.

### Caching

Image caching must
be coordinated with
content updates.

### Layout Stability

Image containers should
preserve predictable
dimensions to reduce
layout shifts.

## Security and Content Approval

The gallery must
protect administrative
operations and
published content.

### Manager Authorization

Only authorized staff
should modify gallery
records or media.

### Upload Security

Validate files
before accepting them.

### File Naming

Use a predictable
and collision-resistant
storage naming strategy.

### Content Ownership

Images must be approved
for restaurant use.

### Customer Privacy

Images featuring identifiable
customers require
appropriate permissions
and privacy review.

### Sensitive Information

Do not publish images
containing confidential
business or customer data.

### Credential Protection

Supabase service credentials
must not be exposed
to public application code.

## Operational Workflows

### Adding an Image

Proposed future workflow:

1. Open Gallery Management.
2. Select Upload Image.
3. Choose an approved image.
4. Validate the file.
5. Enter appropriate metadata.
6. Set display order.
7. Confirm visibility.
8. Save.
9. Verify public presentation.

### Reordering Images

1. Open Gallery Management.
2. Review current order.
3. Adjust image positions.
4. Save changes.
5. Verify public order.

### Hiding an Image

1. Locate the image.
2. Confirm the intended action.
3. Change visibility.
4. Save.
5. Verify removal from public display.

### Replacing an Image

1. Identify the existing image.
2. Upload the approved replacement.
3. Update the gallery reference.
4. Verify the new image.
5. Remove unused media only
   after confirming it is safe.

### Handling an Error

1. Identify the failed operation.
2. Review the error.
3. Confirm whether data changed.
4. Retry only when safe.
5. Escalate unresolved problems.

## Testing and Verification

### Existing Gallery

- Verify all active images.
- Verify previous navigation.
- Verify next navigation.
- Verify indicator dots.
- Verify enlarged image viewing.
- Verify modal dismissal.
- Verify mobile layout.
- Verify desktop layout.

### Dynamic Gallery

If implemented:

- Verify image records load.
- Verify stored ordering.
- Verify visibility filtering.
- Verify empty gallery behavior.
- Verify missing-image handling.

### Image Uploads

If implemented:

- Upload a valid image.
- Reject invalid file types.
- Reject oversized files.
- Verify image processing.
- Verify storage permissions.
- Verify failure handling.

### Administration

If implemented:

- Verify manager access.
- Verify unauthorized access is denied.
- Verify image editing.
- Verify reordering.
- Verify hiding and restoring.
- Verify deletion safeguards.

### Accessibility

- Verify keyboard navigation.
- Verify accessible labels.
- Verify focus management.
- Verify alternative text.
- Verify reduced-motion behavior.

### Performance

- Verify responsive image sizing.
- Verify loading behavior.
- Verify layout stability.
- Verify caching after updates.

## Implementation Status

| Capability | Status |
|---|---|
| Public image gallery slider | Implemented |
| Previous and next navigation | Implemented |
| Slide indicator dots | Implemented |
| Full-image modal | Implemented |
| Existing gallery image assets | Implemented; paths require verification |
| Dynamic gallery database | Planned |
| Gallery image uploads | Planned |
| Image processing | Under Evaluation |
| Manager image ordering | Planned |
| Image visibility controls | Planned |
| Gallery captions and alt-text editor | Planned |
| Gallery administration interface | Planned |
| Supabase gallery storage structure | Planned |
| Image archival | Under Evaluation |
| Image deletion safeguards | Planned |
| Dynamic gallery end-to-end testing | Pending implementation |

## Related Documentation

- [GALLERY Overview](README.md)
- [Image Management](image-management.md)
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
