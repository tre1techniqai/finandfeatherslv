# DATABASE — Supabase Storage

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Supabase Storage integrated; website-media bucket established; menu image upload implemented; complete bucket configuration and policy audit pending

**Feature:** Website Media Storage, File Management, and Access Control

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Storage Objectives](#storage-objectives)
3. [Current Implementation](#current-implementation)
4. [Storage Architecture](#storage-architecture)
5. [Storage Buckets](#storage-buckets)
6. [Website Media Organization](#website-media-organization)
7. [Public Asset Delivery](#public-asset-delivery)
8. [Menu Image Storage](#menu-image-storage)
9. [Image Processing and Optimization](#image-processing-and-optimization)
10. [Administrative Uploads](#administrative-uploads)
11. [File Replacement and Deletion](#file-replacement-and-deletion)
12. [Database Media References](#database-media-references)
13. [Homepage Media](#homepage-media)
14. [GALLERY Storage](#gallery-storage)
15. [SPECIALS Media](#specials-media)
16. [FAM CLUB Media](#fam-club-media)
17. [MERCH Media](#merch-media)
18. [Video Storage and Delivery](#video-storage-and-delivery)
19. [Storage Access Policies](#storage-access-policies)
20. [Security and Privacy](#security-and-privacy)
21. [Performance and Cost Management](#performance-and-cost-management)
22. [Backup and Recovery](#backup-and-recovery)
23. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
24. [Testing and Verification](#testing-and-verification)
25. [Implementation Roadmap](#implementation-roadmap)
26. [Implementation Status](#implementation-status)
27. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the media storage architecture for the Fin & Feathers Las Vegas website.

The application uses Supabase Storage for website media.

Storage supports the existing public website and administrative media operations.

Additional media-management capabilities may be introduced as future development phases are approved.

This document covers:

- Supabase Storage integration.
- Storage buckets.
- File organization.
- Public media delivery.
- Menu images.
- Image optimization.
- Administrative uploads.
- File replacement.
- File deletion.
- Database references.
- Homepage assets.
- GALLERY media.
- SPECIALS media.
- FAM CLUB media.
- MERCH media.
- Video delivery.
- Access policies.
- Security.
- Performance.
- Recovery.

This document distinguishes established storage usage from proposed future capabilities.

## Storage Objectives

The media storage system should support reliable public presentation and controlled administrative management.

### Availability

Approved public media should load reliably.

### Organization

Media files should follow consistent naming and directory conventions.

### Security

Unauthorized users must not upload, replace, or delete protected assets.

### Performance

Images and videos should be optimized for practical website delivery.

### Maintainability

Media references should remain understandable and manageable.

### Data Integrity

Database records should reference the intended stored assets.

### Recoverability

Important media should have an approved recovery strategy.

### Scalability

Storage architecture should accommodate approved future website features.

### Cost Awareness

Media storage and bandwidth should be monitored as usage increases.

## Current Implementation

**Status:** Supabase Storage integration implemented

### Storage Provider

    Supabase Storage

### Established Bucket

    website-media

### Existing Website Uses

The project uses Supabase Storage for public website media.

### Menu Images

Menu images are stored within the established website media infrastructure.

### Established Menu Prefix

    menu/

### Existing Administrative Capability

The Menu Management interface supports image uploads.

### Previously Reviewed Image Output

    WebP
    4:3 aspect ratio

### Existing Homepage Video

The project uses a ribeye video asset delivered through the website media infrastructure.

### Existing Public Assets

Some website assets are also maintained in the application's public directory.

### Verification Boundary

The following require direct inspection:

- Bucket visibility configuration.
- Complete Storage policy definitions.
- File size limits.
- Allowed MIME types.
- Exact administrative upload implementation.
- Complete object inventory.
- Storage lifecycle and retention settings.

### Important Distinction

Use of a public media bucket does not imply that public users should have upload or deletion permissions.

## Storage Architecture

The application uses a combination of website assets and Supabase-hosted media.

### Application Framework

    Next.js App Router

### Deployment

    Vercel

### Storage Provider

    Supabase Storage

### Database

    Supabase PostgreSQL

### Authentication

    Supabase Auth

### Administrative Authorization

    requireManager()

### Local Public Assets

Some images are served from the application's `public/` directory.

### Supabase Assets

Other images and videos are served from Supabase Storage.

### Database References

Application records may contain references to stored media.

### Architectural Principle

File storage and relational database metadata serve different purposes.

### File Storage

Stores the actual media object.

### Database

Stores associated application data and references where required.

## Storage Buckets

Supabase Storage organizes files into buckets.

### Established Bucket

    website-media

### Purpose

The bucket supports website media delivery.

### Existing Content Types

The project uses image and video assets.

### Public Access

The bucket's actual public visibility settings require verification.

### Upload Permissions

Administrative uploads must follow approved authorization rules.

### Delete Permissions

Deletion must be restricted appropriately.

### File Restrictions

Allowed content types and size limits should be reviewed.

### Additional Buckets

Future features may require separate buckets for private or specialized media.

### Architecture Decision

Additional buckets should be created only when justified by security or operational requirements.

### Verification

Inspect the actual Supabase Storage bucket configuration before documenting deployed restrictions.

## Website Media Organization

Consistent storage paths simplify maintenance.

### Established Bucket

    website-media

### Established Menu Prefix

    menu/

### Potential Organization

Future directories may be organized by feature.

Examples include:

    menu/
    gallery/
    specials/
    merch/
    videos/

### Important Boundary

Only the menu prefix is established by the current project context.

The other paths are proposed organizational examples.

### Naming Standards

File names should be predictable and avoid unnecessary special characters.

### Unique Names

Uploads should avoid accidental collisions.

### Versioning

Replacement strategies should account for browser and CDN caching.

### Folder Ownership

Each feature should have clear responsibility for its media.

### Documentation

Storage path conventions should be maintained as the project evolves.

## Public Asset Delivery

The website displays approved media to visitors.

### Delivery Methods

Assets may be delivered through:

- The Next.js public directory.
- Supabase Storage URLs.
- Approved external providers.

### Public Images

Public menu and gallery images should load without requiring manager authentication.

### Public Videos

Approved promotional videos should remain accessible to website visitors.

### Private Assets

Sensitive media must not be exposed through public delivery paths.

### URL Stability

Media references should remain valid across deployments.

### Caching

Browser and CDN caching may affect replacement behavior.

### Broken Links

Missing objects should be handled gracefully.

### Verification

Test asset loading in the actual production environment.

### Security

Public read access must not imply public write access.

## Menu Image Storage

**Status:** Implemented

The administrative menu editor supports image management.

### Administrative Route

    /admin/menu

### Storage Bucket

    website-media

### Storage Prefix

    menu/

### Existing Processing Pattern

Menu image output uses WebP with a 4:3 aspect ratio.

### Upload Purpose

Associate an approved food image with the intended menu item.

### Image Selection

Managers should select appropriate food photography.

### Image Validation

Uploads should be validated before storage.

### Database Association

The menu item must reference the correct uploaded image.

### Replacement

Replacing an image should not leave the menu item pointing to an invalid file.

### Public Display

Approved menu images should display consistently.

### COCKTAILS

No images are required for COCKTAILS.

### Verification Boundary

Exact upload code, object naming, and database reference fields require source inspection.

## Image Processing and Optimization

Image optimization improves loading performance and presentation consistency.

### Existing Menu Standard

    WebP
    4:3 aspect ratio

### File Size

Images should be compressed appropriately.

### Dimensions

Output dimensions should suit the intended display size.

### Aspect Ratio

Image crops should preserve the intended subject.

### Quality

Compression should balance visual quality and bandwidth.

### Transparency

Transparency should be preserved only when required.

### Color

Color handling should remain visually consistent.

### Metadata

Unnecessary embedded metadata may be removed during processing.

### Validation

Processing failures must not produce invalid uploads.

### Accessibility

Meaningful images should have appropriate alternative text where applicable.

### Future Standards

Different media types may require different processing rules.

## Administrative Uploads

Administrative uploads are privileged operations.

### Authentication

The user must be authenticated.

### Authorization

The user must have the appropriate manager permission.

### Existing Helper

    requireManager()

### Server Validation

Upload operations must enforce authorization at the operation boundary.

### File Validation

Validate file type, size, and intended use.

### Filename Handling

Use safe object names.

### Upload Result

Confirm that the storage provider accepted the upload.

### Database Update

Update associated records only after the relevant operation succeeds.

### Partial Failure

Handle cases where the upload succeeds but metadata persistence fails.

### User Feedback

Report errors without exposing private configuration.

### Auditability

Important administrative media changes may require logging.

## File Replacement and Deletion

Media lifecycle operations require careful coordination.

### Replacement

A new asset may replace an existing media reference.

### Existing References

Determine whether other records still use the old object.

### Database Update

Update the relevant application record.

### Cache Behavior

Account for cached URLs and media responses.

### Old File Cleanup

Delete unused objects only after confirming they are no longer required.

### Deletion Authorization

Deletion must require approved permissions.

### Orphaned Files

Unreferenced objects may require periodic review.

### Broken References

Records pointing to missing files should be identified.

### Recovery

Accidental deletion requires an approved recovery process.

### Important Boundary

The current application's complete replacement and cleanup workflow requires verification.

## Database Media References

Supabase Storage and PostgreSQL may be connected through application-level references.

### Storage Object

Contains the media file.

### Database Record

Contains the associated application data.

### Reference Format

The application may use a path, URL, or another approved identifier.

### Schema Verification

The exact deployed reference fields must be inspected.

### Menu Items

Menu records may reference their associated images.

### Future GALLERY

Gallery records may reference published media objects.

### Future SPECIALS

Specials may reference promotional assets.

### Future MERCH

Products may reference multiple images.

### Integrity

Database references must not become invalid unintentionally.

### Migration

Changes to storage paths require coordinated database updates.

## Homepage Media

The homepage includes branded images and promotional media.

### Logo Assets

Established assets include:

    /img/fin-feathers-lv-logo-500.png
    /img/fin-feathers-lv-logo-1000.png

### Background Images

Established assets include:

    /img/fin-feathers-bg-mobile.jpg
    /img/fin-feathers-bg-desktop.jpg

### MERCH Thumbnail

Established asset:

    /img/fin-feathers-merch-thumb.png

### Public Directory

These paths are application public asset references.

### Homepage Video

The ribeye video uses the existing website media infrastructure.

### Virtual Tour

The virtual tour uses a separate embedded experience.

### Performance

Homepage media should be optimized for mobile and desktop.

### Deployment

Public directory assets are deployed with the application.

### Important Distinction

Not every website image is necessarily stored in Supabase Storage.

## GALLERY Storage

**Status:** Public gallery implemented; manager-driven media management planned

### Existing Gallery

The public website includes six established gallery images.

### Existing File Names

    gallery-pic-01.jpg
    gallery-pic-02.jpg
    gallery-pic-03.jpg
    gallery-pic-04.jpg
    gallery-pic-05.jpg
    gallery-pic-06.jpg

### Existing Experience

- Image slider.
- Previous and next controls.
- Position indicators.
- Full-image modal.

### Future Administration

Managers may eventually:

- Upload images.
- Replace images.
- Reorder images.
- Hide images.
- Delete images.

### Future Storage

A dedicated gallery path may be appropriate.

### Database Metadata

Future gallery records may include visibility and display order.

### Access

Public reads and administrative writes require separate authorization.

### Implementation Boundary

The proposed gallery management storage structure is not established as deployed.

## SPECIALS Media

**Status:** Advanced SPECIALS management planned

SPECIALS may include promotional imagery.

### Existing Menu Relationship

SPECIALS may feature existing menu items.

### Image Reuse

Approved menu photography may be reused when appropriate.

### Promotional Images

Future specials may support dedicated promotional assets.

### Storage Organization

A separate specials path may be considered.

### Publishing

Only approved promotional media should appear publicly.

### Scheduling

Media visibility may need to follow the associated special's schedule.

### Manager Access

Uploading or replacing special media must require authorization.

### Database References

Future specials records may reference stored media.

### Implementation Boundary

No dedicated SPECIALS storage workflow is established as deployed.

## FAM CLUB Media

**Status:** Administrative membership system planned

FAM CLUB may eventually require program-related media.

### Potential Assets

- Membership graphics.
- Reward imagery.
- Promotional banners.
- Program illustrations.

### Public Media

General promotional assets may be publicly accessible.

### Private Media

Any member-specific private media requires restricted storage access.

### Member Uploads

Member-uploaded content is not an established requirement.

### Authorization

Administrative changes require approved permissions.

### Privacy

Avoid placing sensitive member information in public media paths.

### Storage Organization

A dedicated feature path may be considered.

### Implementation Boundary

No dedicated FAM CLUB Storage schema or upload workflow is established as deployed.

## MERCH Media

**Status:** External storefront implemented; native commerce under evaluation

### Current Experience

The website displays a merchandise thumbnail.

### Established Asset

    /img/fin-feathers-merch-thumb.png

### External Storefront

The merchandise interface opens an external commerce destination in a modal iframe.

### External Product Images

The commerce provider may manage its own product imagery.

### Native Commerce Option

A future native catalog may require product image storage.

### Potential Requirements

- Product images.
- Variant images.
- Thumbnail images.
- Alternate views.
- Promotional banners.

### Source of Truth

The chosen commerce platform must define authoritative media ownership.

### Storage Boundary

No native MERCH product image storage workflow is established as deployed.

## Video Storage and Delivery

The website includes promotional video content.

### Existing Video

The ribeye video is part of the homepage experience.

### Storage

The project uses Supabase Storage for the video asset.

### Playback

The website uses native browser video playback.

### Cover Image

The video has an associated cover image.

### File Size

The previously reviewed video asset is approximately 19 MB.

### Mobile Performance

Video loading should account for mobile bandwidth.

### Playback Controls

Controls should follow the approved user experience.

### Accessibility

Video accessibility requirements should be reviewed.

### Bandwidth

Large media files may affect delivery costs.

### Future Optimization

Streaming or alternative encodings may be evaluated if usage requires them.

### Verification

Actual delivery behavior should be tested in production.

## Storage Access Policies

Supabase Storage supports access policies for stored objects.

### Public Reads

Approved public media may be readable without authentication.

### Administrative Uploads

Uploads should require appropriate authorization.

### Administrative Updates

Object replacement should be restricted.

### Administrative Deletes

Deletion should require approved permissions.

### Path Restrictions

Policies may restrict operations by bucket or object path.

### Staff Authorization

Manager-only operations should align with the application's role model.

### Existing Helper

    requireManager()

### Database Policies

Storage policies and database policies must be reviewed together.

### Verification Boundary

The deployed Storage policy definitions have not been comprehensively audited.

### Important Principle

Public asset delivery must not create unrestricted public write access.

## Security and Privacy

Storage security requires careful handling of both files and credentials.

### Least Privilege

Grant only required Storage operations.

### Authentication

Administrative uploads must require valid identity.

### Authorization

Manager-only actions must enforce approved permissions.

### File Validation

Reject unsupported or unsafe uploads.

### MIME Types

Validate actual content rather than relying solely on a filename extension.

### File Size

Apply appropriate upload limits.

### Private Data

Sensitive information must not be placed in publicly accessible buckets.

### Credentials

Service-role credentials must remain server-side.

### Logging

Do not expose secrets or private signed URLs unnecessarily.

### Signed URLs

Private media delivery may require time-limited access URLs.

### Audit

Important media changes may require operational records.

### Incident Response

Unexpected public exposure or unauthorized modification requires prompt review.

## Performance and Cost Management

Storage decisions affect website speed and operating cost.

### Image Compression

Use appropriately compressed image formats.

### WebP

The menu image workflow uses WebP.

### Responsive Images

Serve suitable dimensions for mobile and desktop.

### Video Size

Large videos should be reviewed for bandwidth impact.

### Caching

Use an appropriate caching strategy.

### Cache Invalidation

File replacement may require versioned paths or other approved methods.

### Storage Capacity

Monitor total stored media volume.

### Bandwidth

Monitor public asset delivery usage.

### Duplicate Assets

Avoid unnecessary copies.

### Cleanup

Remove obsolete assets through a controlled process.

### Cost Verification

Actual Supabase plan limits and charges must be checked before making budget claims.

## Backup and Recovery

Media recovery requires a deliberate strategy.

### Database Backups

Database backups do not automatically establish complete recovery coverage for Storage objects.

### Storage Backup

Important media should have an approved backup process.

### Original Assets

Retain source media where operationally appropriate.

### Accidental Deletion

Define how deleted assets can be restored.

### Broken References

Recovery may require updating database media references.

### Versioning

Replacement history may improve recoverability.

### Recovery Testing

Test restoration rather than assuming it works.

### Access Control

Backup copies must be protected.

### Disaster Recovery

Document the steps required to restore critical website media.

### Verification Boundary

The current project's complete Storage backup process requires inspection.

## Error Handling and Troubleshooting

### Upload Failure

Verify authorization, file validation, connectivity, and provider response.

### Invalid File Type

Reject the file and explain the supported formats.

### Oversized File

Provide an appropriate size-related error.

### Unauthorized Upload

Do not bypass Storage policy restrictions.

### Missing Object

Verify the stored path and object existence.

### Broken Image

Check the media URL, visibility, and database reference.

### Failed Replacement

Preserve the previous valid reference when possible.

### Failed Deletion

Report the failure without claiming the object was removed.

### Cache Delay

Investigate whether an older version remains cached.

### Video Playback Failure

Check the URL, content type, encoding, and browser compatibility.

### Provider Error

Record appropriate diagnostics without exposing credentials.

### Recovery

Use approved backup or re-upload procedures.

## Testing and Verification

### Bucket Configuration

- Confirm bucket exists.
- Confirm intended visibility.
- Review size limits.
- Review allowed content types.
- Review Storage policies.

### Public Delivery

- Public menu images load.
- Homepage media loads.
- Video plays.
- Missing files fail gracefully.

### Menu Uploads

- Authorized upload.
- Unauthorized upload.
- Valid WebP output.
- Correct 4:3 ratio.
- Correct menu association.
- Failed upload handling.

### Replacement

- Successful replacement.
- Failed replacement.
- Cache behavior.
- Old file cleanup.
- Database reference consistency.

### Deletion

- Authorized deletion.
- Unauthorized deletion.
- Shared reference protection.
- Missing object handling.

### Security

- Anonymous read where approved.
- Anonymous write denied.
- Non-manager write denied.
- Manager write allowed where approved.
- Private credentials remain server-side.

### Future Modules

When implemented:

- GALLERY uploads.
- SPECIALS media.
- FAM CLUB assets.
- MERCH product images.

### Performance

- Mobile image loading.
- Desktop image loading.
- Video bandwidth.
- Cache effectiveness.

### Recovery

- Backup availability.
- File restoration.
- Database reference restoration.

## Implementation Roadmap

### Stage 1 — Inventory Existing Storage

Inspect buckets, paths, objects, and usage.

### Stage 2 — Verify Configuration

Confirm bucket visibility, limits, and allowed media types.

### Stage 3 — Audit Policies

Review public reads and administrative write permissions.

### Stage 4 — Map Application References

Identify which components and database records reference stored objects.

### Stage 5 — Review Image Processing

Verify menu upload transformations and error handling.

### Stage 6 — Define Lifecycle Procedures

Approve replacement, deletion, cleanup, and recovery practices.

### Stage 7 — Plan Future Media Modules

Define Storage requirements for approved GALLERY, SPECIALS, FAM CLUB, and MERCH features.

### Stage 8 — Test Production Delivery

Verify public media performance and administrative upload security.

### Stage 9 — Maintain Documentation

Update storage conventions as functionality changes.

### Scheduling

This roadmap does not establish a committed delivery date.

## Implementation Status

| Capability | Status |
|---|---|
| Supabase Storage integration | Implemented |
| `website-media` bucket | Established |
| Menu media prefix | Established |
| Menu image upload | Implemented |
| WebP menu image processing | Implemented |
| 4:3 menu image output | Implemented |
| Homepage media integration | Implemented |
| Ribeye video integration | Implemented |
| Public GALLERY display | Implemented |
| Complete bucket configuration audit | Verification pending |
| Storage policy inventory | Verification pending |
| Upload size and MIME restrictions | Verification pending |
| Media reference schema audit | Verification pending |
| File replacement lifecycle audit | Verification pending |
| Orphaned file cleanup procedure | Planned |
| Storage backup procedure | Verification pending |
| Manager-driven GALLERY uploads | Planned |
| SPECIALS media management | Planned |
| FAM CLUB media management | Planned |
| Native MERCH product image management | Under Evaluation |
| Storage cost monitoring | Planned operational review |
| Comprehensive Storage acceptance testing | Verification pending |

## Related Documentation

- [Database Overview](README.md)
- [Database Schema](schema.md)
- [Database Access Policies](access-policies.md)
- [Supabase Authentication](../05-authentication/supabase-auth.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Menu Management](../04-admin-dashboard/menu-management.md)
- [Menu Images](../09-menu-management/menu-images.md)
- [Homepage](../02-website/homepage.md)
- [GALLERY Overview](../02-website/gallery/gallery-overview.md)
- [GALLERY Image Management](../02-website/gallery/image-management.md)
- [GALLERY Administration](../04-admin-dashboard/gallery-management.md)
- [SPECIALS Administration](../04-admin-dashboard/specials-management.md)
- [FAM CLUB Administration](../04-admin-dashboard/fam-club-management.md)
- [MERCH Administration](../04-admin-dashboard/merch-management.md)
- [Deployment Overview](../07-deployment/README.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Troubleshooting](../08-operations/troubleshooting.md)
- [Master Documentation Index](../README.md)

---

[Back to Database Overview](README.md)
