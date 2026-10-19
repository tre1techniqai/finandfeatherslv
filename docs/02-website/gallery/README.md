# GALLERY

**Category:** Website / Media Gallery

**Documentation Status:** In Development

**Public Gallery Status:** Implemented; verification pending

**Admin Management Status:** Planned

---

## Table of Contents

1. [Gallery Overview](#gallery-overview)
2. [Current Website Implementation](#current-website-implementation)
3. [Gallery Image Management](#gallery-image-management)
4. [Supabase Storage Integration](#supabase-storage-integration)
5. [Future Admin Management](#future-admin-management)
6. [Image Optimization](#image-optimization)
7. [Security and Permissions](#security-and-permissions)
8. [Implementation Status](#implementation-status)
9. [Related Documentation](#related-documentation)

---

## Gallery Overview

The Fin & Feathers Las Vegas GALLERY showcases
restaurant photography and promotional imagery.

The gallery is intended to provide guests with a
visual presentation of the restaurant's food,
atmosphere, and overall dining experience.

## Current Website Implementation

The public website includes an image gallery
with slider functionality.

Previously implemented features include:

- Previous and next navigation controls.
- Image position indicators.
- Full-size image viewing.
- Responsive layout behavior.

The original gallery used images named:

- gallery-pic-01.jpg
- gallery-pic-02.jpg
- gallery-pic-03.jpg
- gallery-pic-04.jpg
- gallery-pic-05.jpg
- gallery-pic-06.jpg

The current component paths, image sources,
and deployed behavior should be verified against
the latest application code.

## Gallery Image Management

The future gallery management system should
support the following operations:

- Upload new gallery images.
- Edit image descriptions.
- Replace existing images.
- Change gallery display order.
- Enable or disable individual images.
- Remove outdated gallery images.

The gallery should update from approved content
without requiring manual changes to the
website's source code.

## Supabase Storage Integration

Supabase Storage is used for website media.

The project has an existing public storage
bucket named:

website-media

A future gallery management implementation
may store gallery images within a dedicated
folder or path inside this bucket.

The exact storage structure and database
relationships must be reviewed before development.

The existing menu image upload system may
provide reusable patterns for:

- Image processing.
- File uploads.
- Storage references.
- Manager authorization.

See [Menu Management](../../09-menu-management/README.md).

## Future Admin Management

The planned GALLERY administration interface
may allow authorized managers to:

- View existing gallery images.
- Upload new images.
- Preview images before publishing.
- Reorder gallery content.
- Manage image visibility.
- Replace or remove images.

The interface should clearly distinguish
published content from unpublished changes
if a draft-and-publish workflow is adopted.

## Image Optimization

Image processing should prioritize:

- Responsive display.
- Consistent image quality.
- Reasonable file sizes.
- Appropriate image dimensions.
- Modern image formats when supported.
- Descriptive alternative text.
- Mobile loading performance.

The final gallery image specifications
should be established before implementation.

## Security and Permissions

Gallery management must be restricted to
authorized managers.

Required considerations include:

- Server-side manager authorization.
- Supabase Storage access policies.
- File type validation.
- File size limits.
- Safe file naming.
- Prevention of unauthorized uploads.
- Safe deletion of storage objects.

Public gallery images may remain accessible
without authentication.

## Implementation Status

| Capability | Status |
|---|---|
| Public image gallery | Implemented; verification pending |
| Previous and next navigation | Implemented; verification pending |
| Full-size image viewing | Implemented; verification pending |
| Manager image uploads | Planned |
| Manager image replacement | Planned |
| Gallery display ordering | Planned |
| Image visibility controls | Planned |
| Gallery database integration | Planned |
| Draft and publish workflow | Under Evaluation |

## Related Documentation

- [Website Overview](../README.md)
- [Admin Dashboard](../../04-admin-dashboard/README.md)
- [Menu Management](../../09-menu-management/README.md)
- [Database & Storage](../../06-database/README.md)
- [Deployment](../../07-deployment/README.md)
- [Master Documentation Index](../../README.md)

---

[Back to Website Documentation](../README.md)
