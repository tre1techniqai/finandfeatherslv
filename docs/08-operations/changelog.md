# OPERATIONS — Changelog

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Audience:** Developers, Technical Administrators, Restaurant Management, and Project Stakeholders

**Implementation Status:** Changelog structure established; historical release records require reconciliation with GitHub, Vercel, and operational evidence

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Changelog Objectives](#changelog-objectives)
3. [Current Project Baseline](#current-project-baseline)
4. [Change Management Principles](#change-management-principles)
5. [Versioning Strategy](#versioning-strategy)
6. [Change Categories](#change-categories)
7. [Change Status Definitions](#change-status-definitions)
8. [Release Record Format](#release-record-format)
9. [Historical Development Milestones](#historical-development-milestones)
10. [Website Development History](#website-development-history)
11. [Reservation Development History](#reservation-development-history)
12. [Administrative Development History](#administrative-development-history)
13. [Database and Authentication History](#database-and-authentication-history)
14. [Deployment and Infrastructure History](#deployment-and-infrastructure-history)
15. [Documentation Development History](#documentation-development-history)
16. [Current Implementation Baseline](#current-implementation-baseline)
17. [Pending Verification](#pending-verification)
18. [Planned Development](#planned-development)
19. [Release Preparation](#release-preparation)
20. [Production Release Procedure](#production-release-procedure)
21. [Hotfix and Emergency Changes](#hotfix-and-emergency-changes)
22. [Rollback and Recovery Records](#rollback-and-recovery-records)
23. [Database Change Records](#database-change-records)
24. [Twilio and Messaging Change Records](#twilio-and-messaging-change-records)
25. [Administrative Content Changes](#administrative-content-changes)
26. [Security and Access Changes](#security-and-access-changes)
27. [Incident and Defect Records](#incident-and-defect-records)
28. [Verification and Evidence](#verification-and-evidence)
29. [Changelog Maintenance Procedures](#changelog-maintenance-procedures)
30. [Release Templates](#release-templates)
31. [Implementation Roadmap](#implementation-roadmap)
32. [Implementation Status](#implementation-status)
33. [Related Documentation](#related-documentation)

---

## Purpose

This document establishes the official changelog framework for the Fin & Feathers Las Vegas website.

The changelog provides a readable history of meaningful changes to the application and its supporting operations.

It should help project stakeholders understand:

- What changed.
- Why the change was made.
- When the change occurred.
- Which features were affected.
- Whether the change was deployed.
- Whether the change was tested.
- Whether additional work remains.
- How the change can be traced to technical evidence.

The changelog complements Git history, deployment history, database migration records, and operational incident records.

It does not replace those systems.

Historical information in this document is based on established project development context.

Exact historical release dates, commit identifiers, and production deployment identifiers must be reconciled with the authoritative technical records.

## Changelog Objectives

### Maintain Project History

Preserve significant development decisions and completed milestones.

### Support Restaurant Operations

Explain changes that affect guests or managers.

### Improve Release Traceability

Connect releases to their underlying source changes.

### Record Verification

Distinguish deployed functionality from successfully tested functionality.

### Support Recovery

Identify changes associated with production incidents.

### Improve Communication

Provide understandable summaries for nontechnical stakeholders.

### Support Future Development

Document outstanding work and dependencies.

### Preserve Security

Avoid recording private credentials or sensitive guest information.

### Reduce Ambiguity

Use consistent terminology and status definitions.

### Establish Accountability

Record responsible roles and approval evidence where available.

## Current Project Baseline

### Project Name

    Fin & Feathers Las Vegas

### Production Domain

    https://finandfeatherslv.live

### Framework

    Next.js App Router

### Language

    TypeScript

### Hosting

    Vercel

### Source Control

    GitHub

### Repository

    tre1techniqai/finandfeatherslv

### Database

    Supabase PostgreSQL

### Authentication

    Supabase Auth

### Storage

    Supabase Storage

### Storage Bucket

    website-media

### Messaging

    Twilio

### Reservation Processing

    Twilio Studio and deployed reservation parser

### Operational Reservation Confirmation

    Staff confirmation using the established Yelp Reservations process

### Baseline Limitation

This technical summary is not a substitute for inspecting the current deployed configuration.

## Change Management Principles

### Document Meaningful Changes

Record changes that affect behavior, data, security, integrations, operations, or user experience.

### Preserve Chronology

Use accurate dates when supported by evidence.

### Avoid Invented Releases

Do not assign historical version numbers without supporting records.

### Distinguish Environments

A locally completed feature is not automatically deployed to production.

### Distinguish Deployment from Verification

A successful deployment does not establish that every affected workflow passed acceptance testing.

### Record Dependencies

Identify relevant database, Storage, authentication, and Twilio changes.

### Preserve Traceability

Link commits, pull requests, deployments, and test evidence when available.

### Protect Sensitive Data

Never include passwords, access tokens, private keys, or unnecessary guest information.

### Record Recovery

Document production rollbacks and emergency corrections.

### Keep Entries Understandable

Explain the operational significance of each change.

## Versioning Strategy

The project should adopt a consistent release identification strategy.

### Proposed Format

    MAJOR.MINOR.PATCH

### Major Release

A significant application or operational change.

### Minor Release

A substantial backward-compatible feature addition.

### Patch Release

A targeted fix or maintenance improvement.

### Prerelease

An internal or preview release may use an additional identifier.

### Historical Versions

Do not retroactively assign version numbers without approval.

### Current Version

The authoritative current production version must be determined from release records.

### Git Commits

A commit identifies source history but is not necessarily a production release.

### Vercel Deployments

A deployment identifies a hosted build.

### Release Tags

Approved Git tags may be used to mark significant releases.

### Recommendation

Adopt formal versioning when the release-management process is approved.

## Change Categories

### Added

New functionality or capabilities.

### Changed

Updates to existing behavior.

### Fixed

Corrections to defects.

### Removed

Features or behavior intentionally removed.

### Security

Changes addressing access, privacy, or security.

### Performance

Changes intended to improve speed or efficiency.

### Infrastructure

Hosting, configuration, database, or integration changes.

### Documentation

Updates to operating or development guidance.

### Operations

Changes to restaurant-facing procedures.

### Deprecated

Functionality scheduled for replacement or removal.

### Verification

Test or audit results that materially affect release readiness.

## Change Status Definitions

### Planned

The change has been identified but not implemented.

### In Development

Implementation work is underway.

### Implemented Locally

The change exists in local source or development infrastructure.

### Committed

The change is recorded in Git history.

### Deployed to Preview

The change is available in a preview environment.

### Deployed to Production

The change is confirmed on the production deployment.

### Verification Pending

The change exists, but required acceptance evidence is incomplete.

### Verified

The specified acceptance checks passed.

### Blocked

A dependency prevents completion.

### Rolled Back

A previously applied change was reversed or replaced through an approved recovery action.

### Retired

The functionality is no longer supported.

## Release Record Format

Every significant release should have a consistent record.

### Release Identifier

Record the approved version or release name.

### Release Date

Use the actual deployment date.

### Environment

Identify production, preview, or another environment.

### Commit Identifier

Record the relevant Git commit.

### Deployment Identifier

Record the Vercel deployment reference.

### Summary

Describe the release in plain language.

### Changes

Group changes by category.

### Database Dependencies

Record associated migrations.

### Integration Dependencies

Record affected external services.

### Testing

Summarize completed acceptance checks.

### Known Issues

Document unresolved limitations.

### Approval

Record the responsible approver where required.

### Recovery Reference

Identify the applicable rollback or recovery procedure.

## Historical Development Milestones

The following milestones reflect established project development work.

They are not presented as independently audited production release records.

### Initial Website Foundation

The project established a Next.js application with a homepage, header, and footer.

### Vercel Integration

The application was connected to a Vercel project.

### GitHub Repository

Source control was established in the designated GitHub repository.

### Supabase Integration

Supabase was connected for database, authentication, and media functionality.

### Public Website Expansion

The homepage gained restaurant branding, navigation, media, and guest-facing actions.

### Reservation Interface

A reservation request modal and SMS handoff were developed.

### Twilio Processing

Incoming SMS infrastructure and reservation parsing were established.

### Manager Administration

Protected manager access and Menu Management were implemented.

### Documentation Library

The project began establishing a comprehensive operational and technical documentation system.

### Historical Verification

Exact milestone dates and corresponding commits require reconciliation.

## Website Development History

### Homepage Branding

The website adopted the Fin & Feathers Las Vegas branding.

### Logo Assets

Responsive logo assets were incorporated.

### Restaurant Slogan

The homepage presents:

    ELEVATED DINING MEETS SOUTHERN SOUL

### Primary Actions

The homepage includes actions for:

- Full menu.
- Reservations.
- Online ordering.
- Reviews.

### Virtual Tour

A virtual tour component was added.

### Ribeye Video

A restaurant video component was incorporated.

### Image Gallery

A gallery with navigation and full-image viewing was added.

### Social Links

Facebook and Instagram links were incorporated.

### Merchandise Promotion

The website added an external MERCH storefront entry point.

### Animation

Homepage entrance animations and scroll-reveal behavior were developed.

### Release Evidence

Production deployment dates for individual website changes require verification.

## Reservation Development History

### Reservation Modal

A guest-facing reservation request interface was developed.

### Required Fields

The interface includes guest details, requested reservation details, occasion, and SMS consent.

### Date and Time Rules

The form includes reservation scheduling constraints.

### SMS Preparation

The website prepares a reservation request text message.

### Guest-Initiated Send

The guest must send the message.

### Desktop Fallback

An alternative message-copy workflow was established for desktop use.

### Staff Confirmation

Reservations remain subject to staff confirmation.

### Twilio Infrastructure

Incoming SMS processing was established through Twilio.

### Reservation Parser

A parsing endpoint was deployed.

### Compliance

A2P 10DLC approval remains pending.

### Acceptance

Live end-to-end verification remains outstanding.

## Administrative Development History

### Manager Authentication

Supabase Auth was integrated with the administrative interface.

### Protected Dashboard

The application established a protected manager dashboard.

### Role-Based Access

Manager authorization uses the staff role model.

### Menu Management

Administrative menu management functionality was developed.

### Menu Item Editing

The system supports menu item administration.

### Menu Image Upload

A media upload workflow was established.

### Image Processing

Menu image processing uses WebP output and a 4:3 aspect ratio.

### Specials Toggle

The menu editor includes an existing $5 specials toggle.

### Reservation Administration

Reservation-related dashboard functionality has been developed.

### Verification

The exact current production behavior of individual administrative controls should be confirmed.

## Database and Authentication History

### Supabase Project

Supabase provides database and authentication infrastructure.

### PostgreSQL

The application uses PostgreSQL for application data.

### Staff Roles

The project includes a staff role model.

### Manager Authorization

Manager access depends on approved role conditions.

### Row-Level Security

Database access policies form part of the security architecture.

### Storage

Supabase Storage provides website media hosting.

### Authentication Flows

Manager login and account recovery functionality have been developed.

### Migration History

Actual migration identifiers and deployment dates require source inspection.

### Backup History

Database backup and recovery availability require verification.

### Security Changes

Future RLS or role-policy changes should receive explicit changelog entries.

## Deployment and Infrastructure History

### GitHub Repository

    tre1techniqai/finandfeatherslv

### Vercel Project

The repository is connected to the established Vercel deployment infrastructure.

### Production Domain

    https://finandfeatherslv.live

### Development Environment

The project has been developed using VS Code and Ubuntu under WSL.

### Supabase Storage

The website uses the established media bucket.

### Twilio

Twilio supports reservation messaging.

### Studio

Twilio Studio handles incoming message workflow processing.

### Deployment Coordination

Application releases may require corresponding external configuration changes.

### Verification

Exact production deployment history should be obtained from Vercel and GitHub.

### Recovery

Rollback procedures are documented separately.

## Documentation Development History

The project documentation is organized into numbered topic directories.

### Project Overview

Architecture, technology, and roadmap documentation.

### Website

Public website functionality and supporting modules.

### Reservations

Reservation workflow, Twilio, parsing, and compliance.

### Admin Dashboard

Manager-facing administration.

### Authentication

Supabase authentication and account lifecycle.

### Database

Schema, access policies, and Storage.

### Deployment

GitHub, Vercel, Twilio, and recovery.

### Operations

Manager guidance, testing, troubleshooting, and changelog.

### Menu Management

Detailed menu administration procedures.

### Toast POS Integration

Feasibility and potential integration design.

### Merch Commerce

Native commerce evaluation and future implementation planning.

### Documentation Status

Each document should retain its own implementation and verification status.

## Current Implementation Baseline

The following baseline summarizes established capabilities.

### Public Website

- Responsive homepage.
- Restaurant branding.
- Primary navigation.
- Public menu.
- Reservation request interface.
- Virtual tour.
- Ribeye video.
- Image gallery.
- Social links.
- External MERCH storefront.

### Administrative Website

- Manager login.
- Protected dashboard.
- Role-based authorization.
- Menu Management.
- Menu image upload.
- Reservation-related functionality.

### Infrastructure

- GitHub repository.
- Vercel hosting.
- Supabase database.
- Supabase authentication.
- Supabase Storage.
- Twilio messaging infrastructure.

### Verification Boundary

The baseline identifies established capabilities, not a blanket claim that every feature has passed current production acceptance testing.

## Pending Verification

Some functionality requires additional evidence.

### Production Release History

Reconcile Git commits with Vercel deployments.

### Current Production Version

Determine the authoritative active release.

### Manager Dashboard

Verify individual production controls.

### Reservation Messaging

Complete live guest-to-staff testing.

### Twilio Studio

Audit the published workflow.

### Webhook Security

Verify the deployed authentication mechanism.

### A2P 10DLC

Confirm registration and approval status.

### Database Recovery

Verify actual backup and restoration options.

### Storage Recovery

Verify asset recovery procedures.

### Security

Complete authorization and RLS acceptance checks.

### Documentation

Confirm that operational instructions match deployed behavior.

## Planned Development

Future changes should be recorded when implementation begins.

### SPECIALS

Day-specific scheduling and administration.

### FAM CLUB

Expanded membership and loyalty administration.

### GALLERY

Manager-controlled image administration.

### MERCH

Potential native product catalog and commerce.

### Toast POS

Potential direct integration with restaurant operations.

### Advanced Reservations

Further reservation administration where approved.

### Manager Experience

Additional dashboard capabilities.

### Reporting

Potential operational reporting features.

### Security

Ongoing access and compliance improvements.

### Documentation

Continued maintenance of the project knowledge base.

### Status

These items should not be recorded as deployed until supported by actual implementation evidence.

## Release Preparation

Before a production release, review the intended changes.

### Source Review

Identify all included commits.

### Scope

Confirm which features are affected.

### Dependencies

Identify external services and database requirements.

### Build

Run the approved application build.

### Testing

Execute relevant acceptance checks.

### Security

Review authorization and secret handling.

### Database

Review migrations and data compatibility.

### Messaging

Review Twilio changes when applicable.

### Recovery

Identify the appropriate rollback strategy.

### Approval

Obtain required authorization.

### Changelog Draft

Prepare the release entry before deployment.

## Production Release Procedure

### Step 1 — Identify the Release

Record the intended release reference.

### Step 2 — Confirm Source

Verify the intended Git commit.

### Step 3 — Review Build

Confirm the application build passes.

### Step 4 — Review Dependencies

Check database and external service requirements.

### Step 5 — Deploy

Use the approved GitHub/Vercel workflow.

### Step 6 — Confirm Deployment

Record the successful deployment reference.

### Step 7 — Verify Production

Run relevant smoke tests.

### Step 8 — Verify Integrations

Check affected Supabase and Twilio functionality.

### Step 9 — Record Issues

Document any outstanding defects.

### Step 10 — Finalize Changelog

Record actual deployment and verification outcomes.

## Hotfix and Emergency Changes

Emergency changes should remain traceable.

### Trigger

A critical production issue requires prompt correction.

### Scope

Identify the smallest appropriate fix.

### Evidence

Record the original failure.

### Approval

Obtain emergency authorization through the approved process.

### Implementation

Apply a targeted change.

### Testing

Run the relevant minimum acceptance checks.

### Deployment

Use the authorized release workflow.

### Verification

Confirm that the critical issue is resolved.

### Regression

Check related functionality.

### Changelog

Record the hotfix and its associated incident.

### Follow-Up

Review the root cause and preventive actions.

## Rollback and Recovery Records

Recovery actions must be documented separately from ordinary feature releases.

### Incident Reference

Identify the related incident.

### Original Release

Record the affected deployment.

### Recovery Decision

Explain why rollback or restoration was selected.

### Application Changes

Record any Git revert or Vercel recovery action.

### Database Changes

Record any approved database restoration or corrective migration.

### Storage Changes

Record restored or replaced assets.

### Twilio Changes

Record any Studio or webhook configuration restoration.

### Verification

Document the checks performed after recovery.

### Remaining Risks

Record unresolved issues.

### Important Boundary

A Vercel rollback does not automatically restore external service state.

## Database Change Records

Database changes require precise traceability.

### Migration Identifier

Record the relevant migration file or identifier.

### Environment

Identify where the migration was applied.

### Deployment Date

Use the actual execution date.

### Purpose

Describe the schema or policy change.

### Affected Objects

Identify tables, columns, functions, or policies.

### Compatibility

Record application dependencies.

### Data Impact

Describe whether existing records were modified.

### Verification

Record migration checks.

### Recovery

Identify the approved corrective or restoration strategy.

### Security

Record RLS changes explicitly.

### Evidence

Link to source-controlled migration records when available.

## Twilio and Messaging Change Records

Twilio changes may occur independently of application deployments.

### Phone Number

Record relevant configuration changes.

### Studio Flow

Record the affected workflow.

### Published Version

Identify the published flow revision where available.

### Parser Contract

Document request or response changes.

### Webhook

Record destination and authentication changes without exposing secrets.

### Credentials

Record rotation events without recording credential values.

### Compliance

Record A2P status changes when verified.

### Testing

Document controlled messaging tests.

### Staff Workflow

Record operational changes affecting reservation handling.

### Recovery

Identify the previous approved configuration when available.

## Administrative Content Changes

Not every restaurant content edit requires a full software release.

### Menu Items

Managers may update approved item information.

### Pricing

Record significant pricing changes through the appropriate business process.

### Modifiers

Review changes to optional selections and additional charges.

### Images

Track important media replacements when necessary.

### Specials

Record future scheduled promotion changes through the approved administrative process.

### Gallery

Future image administration may require content-level history.

### Merch

Future native commerce may require product and inventory audit records.

### Operational Record

Routine content changes may belong in application audit logs rather than the software changelog.

### Escalation

Unexpected or unauthorized changes should be treated as incidents.

## Security and Access Changes

Security-related changes require careful records.

### Manager Invitations

Record authorized account provisioning through the approved system.

### Role Changes

Track changes to manager permissions.

### Account Deactivation

Document removal of administrative access.

### RLS

Record database policy changes.

### Storage Policies

Record changes to upload and object access.

### Authentication Configuration

Track callback and security-setting changes.

### Credential Rotation

Record when credentials were rotated without revealing values.

### Webhook Security

Track authentication and validation changes.

### Incident Response

Record corrective actions following security incidents.

### Privacy

Avoid storing unnecessary personal details in changelog entries.

## Incident and Defect Records

Incidents and defects should connect to relevant releases.

### Incident Identifier

Use a consistent reference.

### Date

Record when the issue was detected.

### Environment

Identify the affected environment.

### Summary

Describe the problem.

### Business Impact

Explain how guests or staff were affected.

### Root Cause

Record the confirmed cause when established.

### Resolution

Describe the corrective action.

### Deployment

Link the relevant release or hotfix.

### Verification

Record successful retesting.

### Follow-Up

Identify preventive work.

### Closure

Close only after the required evidence is available.

## Verification and Evidence

A reliable changelog separates claims from evidence.

### Git Evidence

Use actual commit identifiers.

### GitHub Evidence

Use pull request or release references where available.

### Vercel Evidence

Use deployment identifiers and timestamps.

### Database Evidence

Use migration and approved audit records.

### Twilio Evidence

Use safe configuration and execution references.

### Test Evidence

Use completed testing records.

### Manager Evidence

Use authorized operational acceptance where relevant.

### Historical Uncertainty

Mark unverified dates and deployment states explicitly.

### Corrections

Update inaccurate historical entries when authoritative evidence becomes available.

### Auditability

A reviewer should be able to trace significant claims to supporting records.

## Changelog Maintenance Procedures

### Before Development

Identify whether the planned work requires a changelog entry.

### During Development

Record meaningful decisions and dependencies.

### Before Deployment

Prepare a draft release summary.

### After Deployment

Confirm the actual deployed revision.

### After Testing

Update verification status.

### After an Incident

Record the incident and recovery actions.

### After a Rollback

Update the affected release status.

### Periodic Review

Reconcile entries with source and deployment records.

### Ownership

Assign an authorized maintainer.

### Review

Have significant entries reviewed before treating them as authoritative.

### Retention

Preserve historical entries unless correction or removal is required by an approved policy.

## Release Templates

### Template A — Standard Release

    Release:
    Date:
    Environment:
    Status:
    Git Commit:
    Vercel Deployment:
    Approved By:

    Summary:

    Added:
    Changed:
    Fixed:
    Security:
    Infrastructure:
    Documentation:

    Database Changes:
    External Service Changes:
    Testing Completed:
    Known Issues:
    Recovery Reference:

### Template B — Hotfix

    Hotfix:
    Date:
    Related Incident:
    Affected Release:
    Root Cause:
    Correction:
    Git Commit:
    Deployment:
    Verification:
    Remaining Risks:

### Template C — Configuration Change

    Change:
    Date:
    Service:
    Environment:
    Authorized By:
    Reason:
    Previous Configuration Reference:
    New Configuration Reference:
    Testing:
    Recovery Plan:

### Template D — Incident

    Incident:
    Detected:
    Resolved:
    Severity:
    Affected Services:
    Business Impact:
    Root Cause:
    Corrective Actions:
    Verification:
    Follow-Up:

### Template E — Documentation Update

    Document:
    Date:
    Summary:
    Reason:
    Related Feature:
    Implementation Status:
    Reviewed By:

## Implementation Roadmap

### Stage 1 — Establish Format

Adopt a consistent release record structure.

### Stage 2 — Reconcile History

Review GitHub and Vercel history.

### Stage 3 — Establish Baseline

Identify the current production deployment.

### Stage 4 — Assign Ownership

Designate changelog maintainers and approvers.

### Stage 5 — Integrate Releases

Require changelog updates during production release preparation.

### Stage 6 — Track External Changes

Record significant Supabase, Twilio, and DNS configuration changes.

### Stage 7 — Link Testing

Associate releases with acceptance evidence.

### Stage 8 — Track Incidents

Connect hotfixes and recovery actions to incident records.

### Stage 9 — Review Periodically

Audit entries for accuracy and completeness.

### Scheduling

This roadmap does not establish a committed implementation date.

## Implementation Status

| Capability | Status |
|---|---|
| Changelog documentation structure | Documented |
| Change categories | Documented |
| Change status definitions | Documented |
| Release record format | Documented |
| Historical development summary | Documented; independent verification pending |
| Website development summary | Documented |
| Reservation development summary | Documented |
| Administrative development summary | Documented |
| Database and authentication summary | Documented |
| Deployment and infrastructure summary | Documented |
| Documentation development summary | Documented |
| Current implementation baseline | Documented |
| Pending verification register | Documented |
| Planned development register | Documented |
| Release preparation procedure | Documented |
| Production release procedure | Documented |
| Hotfix procedure | Documented |
| Rollback record format | Documented |
| Database change record format | Documented |
| Twilio change record format | Documented |
| Security change record format | Documented |
| Incident record format | Documented |
| GitHub history reconciliation | Pending |
| Vercel history reconciliation | Pending |
| Current production version confirmation | Pending |
| Formal release versioning | Proposed |
| Named changelog owner | Pending assignment |
| Changelog approval workflow | Planned |
| Comprehensive historical audit | Pending |

## Related Documentation

- [Operations Overview](README.md)
- [Manager Guide](manager-guide.md)
- [Testing Checklists](testing-checklists.md)
- [Troubleshooting](troubleshooting.md)
- [Project Overview](../01-project-overview/README.md)
- [Project Architecture](../01-project-overview/architecture.md)
- [Technology Stack](../01-project-overview/technology-stack.md)
- [Development Roadmap](../01-project-overview/development-roadmap.md)
- [Website Overview](../02-website/README.md)
- [Reservation Workflow](../03-reservations/reservation-workflow.md)
- [Twilio Integration](../03-reservations/twilio-integration.md)
- [Admin Dashboard Overview](../04-admin-dashboard/dashboard-overview.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Menu Management](../04-admin-dashboard/menu-management.md)
- [Supabase Authentication](../05-authentication/supabase-auth.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Database Storage](../06-database/storage.md)
- [GitHub Workflow](../07-deployment/github-workflow.md)
- [Vercel Deployment](../07-deployment/vercel-deployment.md)
- [Twilio Deployment](../07-deployment/twilio-deployment.md)
- [Rollback Procedures](../07-deployment/rollback-procedures.md)
- [Menu Editor Guide](../09-menu-management/menu-editor-guide.md)
- [Master Documentation Index](../README.md)

---

[Back to Operations Overview](README.md)
