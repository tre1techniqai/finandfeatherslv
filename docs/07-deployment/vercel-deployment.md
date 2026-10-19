# DEPLOYMENT — Vercel Deployment

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Vercel deployment established; GitHub integration connected; production domain established; detailed configuration audit pending

**Feature:** Application Hosting, Build, Deployment, and Production Operations

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Deployment Objectives](#deployment-objectives)
3. [Current Implementation](#current-implementation)
4. [Hosting Architecture](#hosting-architecture)
5. [Vercel Project Configuration](#vercel-project-configuration)
6. [GitHub Integration](#github-integration)
7. [Production Domain](#production-domain)
8. [Development and Preview Environments](#development-and-preview-environments)
9. [Build Configuration](#build-configuration)
10. [Environment Variables](#environment-variables)
11. [Supabase Integration](#supabase-integration)
12. [Twilio Integration](#twilio-integration)
13. [Authentication and Redirects](#authentication-and-redirects)
14. [Static Assets and Media Delivery](#static-assets-and-media-delivery)
15. [Server Routes and Functions](#server-routes-and-functions)
16. [Deployment Workflow](#deployment-workflow)
17. [Production Verification](#production-verification)
18. [Monitoring and Logs](#monitoring-and-logs)
19. [Performance and Reliability](#performance-and-reliability)
20. [Deployment Security](#deployment-security)
21. [Database and Storage Coordination](#database-and-storage-coordination)
22. [Failure Handling](#failure-handling)
23. [Rollback and Recovery](#rollback-and-recovery)
24. [Testing and Verification](#testing-and-verification)
25. [Operational Procedures](#operational-procedures)
26. [Implementation Roadmap](#implementation-roadmap)
27. [Implementation Status](#implementation-status)
28. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the application deployment architecture and operating procedures for the Fin & Feathers Las Vegas website.

The application is hosted on Vercel.

The Vercel project is connected to the established GitHub repository.

The deployment process must support reliable public website delivery, protected administrative functionality, and integration with external services.

This document addresses:

- Vercel hosting.
- Project configuration.
- GitHub integration.
- Production domains.
- Preview deployments.
- Build configuration.
- Environment variables.
- Supabase integration.
- Twilio integration.
- Authentication.
- Static assets.
- Server functions.
- Deployment verification.
- Monitoring.
- Security.
- Recovery.

The document distinguishes established deployment capabilities from settings that still require verification.

## Deployment Objectives

The deployment workflow should provide reliable application delivery.

### Availability

The production website should remain accessible.

### Consistency

Deployments should use the intended source revision and configuration.

### Security

Private credentials and administrative functionality must remain protected.

### Reproducibility

Builds should follow a documented process.

### Visibility

Deployment failures should be diagnosable.

### Recovery

The team should be able to restore a previously working application deployment.

### Integration Reliability

External services must use the appropriate production configuration.

### Performance

The website should provide an acceptable experience across mobile and desktop devices.

### Change Control

Production updates should follow an approved workflow.

## Current Implementation

**Status:** Vercel hosting established

### Hosting Provider

    Vercel

### Framework

    Next.js App Router

### Language

    TypeScript

### GitHub Repository

    tre1techniqai/finandfeatherslv

### Production Domain

    https://finandfeatherslv.live

### Previously Confirmed Vercel URL

    https://fin-and-feathers-lv.vercel.app

### Database and Authentication

    Supabase

### Messaging Provider

    Twilio

### Existing Integration

The GitHub repository is linked to the Vercel project.

### Existing Application

The project includes public website and administrative routes.

### Verification Boundary

The following require direct inspection:

- Current Vercel project identifier.
- Production branch.
- Framework and build settings.
- Environment variable inventory.
- Deployment protection.
- Function configuration.
- Domain DNS settings.
- Current production deployment identifier.
- Monitoring configuration.

## Hosting Architecture

Vercel hosts the Next.js application.

### Application Layer

    Next.js App Router

### Public Website

The application serves restaurant information and guest-facing functionality.

### Administrative Application

Protected routes provide manager functionality.

### Authentication

Supabase Auth establishes authenticated identity.

### Database

Supabase PostgreSQL stores application data.

### Media Storage

Supabase Storage delivers approved media assets.

### Messaging

Twilio supports the SMS reservation workflow.

### Source Control

GitHub stores application source.

### Deployment Platform

Vercel builds and hosts application deployments.

### Architecture Principle

Vercel deployment state is separate from Supabase and Twilio service configuration.

## Vercel Project Configuration

The existing Vercel project should be treated as the canonical deployment destination.

### Project Ownership

The responsible Vercel account or team must be verified.

### Connected Repository

    tre1techniqai/finandfeatherslv

### Framework Preset

The application uses Next.js.

### Root Directory

The configured Vercel root directory must be inspected.

### Install Command

The actual configured dependency installation command must be verified.

### Build Command

The effective build command must be confirmed.

### Output Settings

Use the settings appropriate for the project's Next.js configuration.

### Node.js Version

The deployed Node.js version must be checked.

### Function Settings

Runtime, region, duration, and memory settings require inspection where applicable.

### Project Settings

Changes should be documented before production deployment.

### Verification

Do not assume Vercel's current settings match historical defaults.

## GitHub Integration

The Vercel project is linked to GitHub.

### Repository

    tre1techniqai/finandfeatherslv

### Deployment Source

Vercel uses the configured Git integration.

### Production Branch

The actual production branch requires verification.

### Preview Branches

Nonproduction branches may produce preview deployments.

### Commit Association

Each deployment should be associated with a specific source revision.

### Build Status

GitHub and Vercel may display deployment status information.

### Access

Only approved users should be able to change production deployment settings.

### Repository Permissions

The GitHub integration must have appropriate repository access.

### Failure Handling

A failed Git integration should be diagnosed before attempting unrelated changes.

### Important Boundary

A successful Git push does not prove that Vercel successfully deployed the change.

## Production Domain

### Established Domain

    https://finandfeatherslv.live

### Production Purpose

The domain is the public entry point for the restaurant website.

### HTTPS

Production traffic should use HTTPS.

### Domain Configuration

Vercel domain assignment and DNS records require verification.

### Redirects

Canonical domain and redirect behavior should be reviewed.

### Authentication URLs

Supabase authentication redirects must use approved destinations.

### Twilio Webhooks

Any production webhook configuration must point to the correct application endpoint.

### Public Links

Restaurant links should use the intended canonical domain.

### Domain Changes

Changes require coordination with authentication, messaging, and other integrations.

### Verification

Test the domain after relevant DNS or Vercel configuration changes.

## Development and Preview Environments

Development and preview deployments support safer testing.

### Local Development

The application is developed in VS Code with Ubuntu under WSL.

### Local Command

    npm run dev

### Preview Deployments

Vercel may create preview deployments for nonproduction Git changes.

### Preview Configuration

The actual preview deployment settings require inspection.

### Environment Variables

Preview environments should use approved configuration.

### Supabase

Preview deployments must not accidentally modify production data.

### Twilio

Preview webhook testing must avoid unintended production messaging.

### Authentication

Preview callback URLs must be explicitly approved where necessary.

### Access Protection

Preview deployments may require access restrictions.

### Data Separation

The team should define whether preview environments use separate backend services.

### Important Boundary

A preview URL is not automatically a safe test environment if it uses production credentials.

## Build Configuration

Vercel builds the Next.js application.

### Existing Build Command

    npm run build

### Package Manifest

    package.json

### Dependency Lockfile

    package-lock.json

### Dependency Installation

The effective installation command must be verified.

### Node.js Runtime

Runtime compatibility should match project requirements.

### TypeScript

Type errors may prevent successful builds.

### Next.js

Framework configuration affects the build and runtime.

### Environment Variables

Build-time configuration must be available where required.

### Static Generation

Some pages may be generated during build.

### Dynamic Routes

Other routes may execute server-side.

### Build Output

Review build logs for warnings and errors.

### Verification

The actual Vercel build settings should be compared with local project configuration.

## Environment Variables

Environment variables configure external services and application behavior.

### Local Development

    .env.local

### Vercel Environments

Vercel supports environment-specific configuration.

### Public Variables

Browser-accessible variables must contain only information intended for public exposure.

### Private Variables

Server-only credentials must not be exposed to the browser.

### Supabase

The application requires appropriate Supabase configuration.

### Twilio

Messaging operations require protected provider configuration.

### Environment Separation

Production and preview values should be reviewed separately.

### Secret Rotation

Rotating credentials may require redeployment or runtime verification.

### Source Control

Never commit `.env.local` or secrets to Git.

### Documentation

Record variable purposes without documenting secret values.

### Verification Boundary

Exact variable names and deployment scopes must be inspected from the application and Vercel settings.

## Supabase Integration

Supabase provides authentication, database, and media services.

### Authentication

    Supabase Auth

### Database

    Supabase PostgreSQL

### Storage

    Supabase Storage

### Established Bucket

    website-media

### Server Client

    createSupabaseServerClient()

### Manager Authorization

    requireManager()

### Production Configuration

The Vercel deployment must use the intended Supabase project.

### Credentials

Privileged credentials must remain server-side.

### Database Compatibility

Application deployments must be compatible with the current schema.

### Storage

Public media references must resolve correctly.

### Verification

Confirm database connectivity, authentication, and Storage access after relevant deployments.

## Twilio Integration

Twilio supports the reservation SMS workflow.

### Provider

    Twilio

### Reservation Process

The guest sends a prepared reservation text message.

### Incoming Processing

The project includes a deployed parsing endpoint.

### Established Endpoint Path

    /parse-reservation

### Twilio Studio

Incoming SMS processing uses the configured Twilio workflow.

### Production Webhook

The complete production URL must be confirmed from the deployed routing configuration.

### Credentials

Twilio secrets must remain server-side.

### A2P Compliance

Messaging compliance approval remains a separate operational requirement.

### Live Testing

End-to-end production verification is still required.

### Deployment Boundary

A successful Vercel deployment does not independently verify Twilio Studio or carrier messaging behavior.

## Authentication and Redirects

Authentication depends on coordination between Vercel and Supabase.

### Authentication Provider

    Supabase Auth

### Administrative Login

    /admin/login

### Protected Dashboard

    /admin

### Manager Authorization

    requireManager()

### Required Role

    manager

### Required Active State

    is_active = true

### Recovery

Password recovery callback behavior requires source verification.

### Invitations

Manager invitation callback behavior requires source verification.

### Production Redirects

Supabase must allow the intended production authentication destinations.

### Preview Redirects

Preview URLs may require separate approved configuration.

### Security

Untrusted redirect destinations must not receive authentication credentials.

### Verification

Test login and authorization on the deployed application.

## Static Assets and Media Delivery

The application uses multiple asset delivery methods.

### Next.js Public Directory

Some assets are served directly from the application.

### Mobile Logo

    /img/fin-feathers-lv-logo-500.png

### Desktop Logo

    /img/fin-feathers-lv-logo-1000.png

### Mobile Background

    /img/fin-feathers-bg-mobile.jpg

### Desktop Background

    /img/fin-feathers-bg-desktop.jpg

### MERCH Thumbnail

    /img/fin-feathers-merch-thumb.png

### Supabase Storage

Additional media is delivered from the `website-media` bucket.

### Menu Images

Menu image uploads use WebP output.

### Video

The homepage includes a ribeye video.

### Cache Behavior

Asset updates may be affected by browser or CDN caching.

### Verification

Test image and video loading after deployment.

## Server Routes and Functions

Next.js server routes execute application logic.

### Administrative Routes

Protected administrative pages require manager authorization.

### API Routes

API endpoints may process application or integration requests.

### SMS Parsing

The project includes:

    /parse-reservation

### Runtime

The actual deployment runtime configuration requires inspection.

### Authorization

Sensitive operations must enforce authorization at the execution boundary.

### Validation

Server endpoints must validate inputs.

### Logging

Sensitive information must not be exposed in logs.

### Errors

Server failures should produce controlled responses.

### Function Limits

Execution duration and resource limits depend on actual Vercel configuration.

### Verification

Test affected server routes after deployment.

## Deployment Workflow

The intended deployment workflow begins with a reviewed source change.

### Step 1 — Inspect Local Status

    git status

### Step 2 — Confirm Branch

    git branch --show-current

### Step 3 — Review Changes

    git diff

### Step 4 — Run Checks

    npm run build

### Step 5 — Commit

Create a descriptive Git commit.

### Step 6 — Push

Push to the intended GitHub branch.

### Step 7 — Confirm Vercel Trigger

Verify that Vercel received the intended commit.

### Step 8 — Inspect Build

Review the build result.

### Step 9 — Confirm Deployment

Verify the deployment reached the intended environment.

### Step 10 — Test Application

Test affected functionality.

### Step 11 — Record Changes

Update relevant documentation and changelog.

### Important Boundary

The actual production branch and deployment trigger settings require verification.

## Production Verification

A successful deployment must be tested.

### Homepage

Confirm the homepage loads.

### Branding

Confirm the logo and background images load.

### Navigation

Test desktop and mobile navigation.

### Menu

Verify menu presentation and categories.

### Reservations

Test form validation and SMS handoff behavior.

### Gallery

Verify slider and image modal behavior.

### Video

Verify ribeye video playback.

### MERCH

Verify the external storefront modal behavior.

### Admin Login

Confirm the login route loads.

### Manager Authorization

Confirm unauthorized users cannot access protected routes.

### Menu Management

Verify approved manager operations.

### Supabase

Check database and Storage connectivity.

### Twilio

Test relevant messaging behavior through the approved test procedure.

### Mobile

Review responsive behavior.

### Accessibility

Check keyboard and basic assistive technology behavior.

## Monitoring and Logs

Vercel provides deployment and runtime diagnostic capabilities.

### Deployment Logs

Review build and deployment events.

### Function Logs

Inspect relevant server execution failures.

### Application Errors

Track significant runtime problems.

### External Services

Supabase and Twilio require separate monitoring.

### Sensitive Data

Do not log passwords, tokens, or privileged credentials.

### Error Context

Record enough information to diagnose problems safely.

### Availability

Monitor production website accessibility.

### Performance

Review relevant performance indicators.

### Alerting

Operational alerts may be configured if appropriate.

### Verification Boundary

The project's actual monitoring and alerting configuration requires inspection.

## Performance and Reliability

Deployment performance depends on application and external service behavior.

### Mobile-First Design

The website prioritizes mobile usability.

### Image Optimization

Use appropriately sized images.

### Video Delivery

Review the impact of large video assets.

### Caching

Caching should improve delivery without preventing important updates.

### Server Functions

Avoid unnecessary server work.

### Database Queries

Review inefficient queries.

### External Services

Supabase and Twilio availability affect related features.

### Error Handling

The application should handle temporary provider failures.

### Build Size

Monitor application bundle growth.

### Performance Testing

Test representative mobile and desktop experiences.

### Verification

Actual production performance should be measured rather than assumed.

## Deployment Security

Production deployment security requires coordinated controls.

### HTTPS

Use secure transport.

### Environment Secrets

Keep privileged credentials server-side.

### Repository Access

Restrict GitHub write permissions.

### Vercel Access

Restrict deployment configuration access.

### Authentication

Supabase Auth protects identity.

### Authorization

The manager helper protects administrative access.

### Database Security

RLS and database privileges require verification.

### Storage Security

Public reads and administrative writes require separate controls.

### Webhook Security

External webhook endpoints require appropriate validation.

### Redirect Security

Authentication redirects must use approved destinations.

### Logs

Avoid exposing sensitive data.

### Preview Security

Protect preview deployments where necessary.

## Database and Storage Coordination

Vercel deployments do not automatically synchronize all external service state.

### Database Schema

Supabase migrations may need separate execution.

### Database Policies

RLS changes require separate verification.

### Storage Objects

Uploaded files exist outside the Git repository.

### Environment Variables

Vercel configuration is managed separately from source files.

### Compatibility

Application code must match the deployed database schema.

### Deployment Order

Schema and application changes should be sequenced deliberately.

### Backups

Destructive database or Storage changes require recovery planning.

### Rollback

Application rollback does not automatically reverse database changes.

### Documentation

Record cross-service dependencies before deployment.

### Important Principle

A production release includes more than the application commit when external configuration changes are required.

## Failure Handling

### Build Failure

Review Vercel build logs.

### Missing Dependency

Inspect package configuration and lockfile.

### TypeScript Error

Correct the source error and rebuild.

### Missing Environment Variable

Review target environment configuration.

### Authentication Failure

Check Supabase connectivity and redirect settings.

### Database Error

Inspect the relevant Supabase schema, permissions, and query behavior.

### Storage Error

Check bucket configuration, policies, and media references.

### Twilio Error

Review provider configuration and webhook routing.

### Domain Error

Check Vercel domain assignment and DNS configuration.

### Function Failure

Review runtime logs and request handling.

### Failed Deployment

Preserve diagnostic information and follow the approved recovery procedure.

## Rollback and Recovery

Application recovery may involve restoring a previous deployment.

### Identify Failure

Determine the affected release.

### Review Deployment History

Locate the last known working deployment.

### Vercel Recovery

Use the approved Vercel deployment recovery procedure.

### Git Recovery

A Git revert may be appropriate for source changes.

### Environment Configuration

Check whether configuration changes contributed to the failure.

### Database Changes

Database migrations may require separate corrective action.

### Storage Changes

Media replacements or deletions may require separate recovery.

### Twilio Configuration

Messaging workflow changes may require provider-side correction.

### Verification

Confirm restored functionality after recovery.

### Documentation

Record the cause and recovery steps.

### Important Boundary

The exact Vercel rollback mechanism and project permissions require verification.

## Testing and Verification

### Vercel Project

- Correct project.
- Correct repository.
- Correct production branch.
- Correct build configuration.
- Correct Node.js version.

### Environment Variables

- Required variables present.
- Correct environment scope.
- No exposed secrets.
- Correct Supabase project.
- Correct Twilio configuration.

### Domain

- Production domain resolves.
- HTTPS works.
- Canonical redirects behave correctly.

### Application

- Homepage.
- Navigation.
- Menu.
- Reservations.
- Gallery.
- Video.
- MERCH.

### Administration

- Login.
- Manager authorization.
- Unauthorized access rejection.
- Menu Management.

### Integrations

- Supabase Auth.
- Supabase PostgreSQL.
- Supabase Storage.
- Twilio webhook.
- SMS parsing.

### Deployment

- Correct commit deployed.
- Build succeeds.
- Runtime errors reviewed.
- Production smoke tests pass.

### Recovery

- Deployment history available.
- Rollback permissions verified.
- Database recovery considerations documented.

## Operational Procedures

### Before Deployment

1. Confirm the intended source revision.
2. Review application changes.
3. Run applicable local checks.
4. Review environment requirements.
5. Identify database or Storage dependencies.
6. Confirm the target deployment environment.

### During Deployment

1. Push or merge through the approved GitHub workflow.
2. Confirm Vercel received the intended revision.
3. Review build output.
4. Wait for the deployment result.
5. Investigate any failure before proceeding.

### After Deployment

1. Open the production domain.
2. Test affected public functionality.
3. Test affected administrative functionality.
4. Review relevant logs.
5. Confirm external integrations.
6. Update the changelog.

### During an Incident

1. Identify the failing deployment.
2. Preserve relevant logs.
3. Assess whether the issue affects code or external services.
4. Select the appropriate recovery action.
5. Verify restoration.
6. Document the outcome.

## Implementation Roadmap

### Stage 1 — Audit Vercel Configuration

Inspect project settings, framework configuration, and connected repository.

### Stage 2 — Verify Production Branch

Confirm the exact branch that triggers production deployments.

### Stage 3 — Review Environment Variables

Confirm required variables and their deployment scopes.

### Stage 4 — Audit Domains

Verify production DNS, HTTPS, and redirects.

### Stage 5 — Review Preview Deployments

Confirm preview behavior and access protection.

### Stage 6 — Verify Integrations

Test Supabase and Twilio configuration in the intended environment.

### Stage 7 — Establish Release Checks

Approve a repeatable predeployment and postdeployment checklist.

### Stage 8 — Test Recovery

Verify the available rollback procedure.

### Stage 9 — Maintain Documentation

Update this document as deployment configuration changes.

### Scheduling

This roadmap does not establish a committed delivery date.

## Implementation Status

| Capability | Status |
|---|---|
| Vercel project | Established |
| GitHub integration | Established |
| Next.js deployment | Implemented |
| Production domain | Established |
| Public website hosting | Implemented |
| Administrative routes | Implemented |
| Supabase integration | Implemented |
| Supabase Storage media delivery | Implemented |
| Twilio parsing endpoint deployment | Implemented |
| Current Vercel project settings audit | Verification pending |
| Production branch configuration | Verification pending |
| Build command configuration | Verification pending |
| Node.js runtime configuration | Verification pending |
| Environment variable inventory | Verification pending |
| Production DNS and redirect audit | Verification pending |
| Preview deployment access rules | Verification pending |
| Authentication callback configuration | Verification pending |
| Function runtime settings | Verification pending |
| Deployment monitoring and alerts | Verification pending |
| Automated deployment smoke tests | Planned operational improvement |
| Production SMS end-to-end verification | Pending |
| Vercel rollback procedure | Verification pending |
| Cross-service recovery procedure | In Development |
| Comprehensive deployment acceptance testing | Verification pending |

## Related Documentation

- [Deployment Overview](README.md)
- [GitHub Workflow](github-workflow.md)
- [Twilio Deployment](twilio-deployment.md)
- [Rollback Procedures](rollback-procedures.md)
- [Project Architecture](../01-project-overview/architecture.md)
- [Technology Stack](../01-project-overview/technology-stack.md)
- [Development Roadmap](../01-project-overview/development-roadmap.md)
- [Homepage](../02-website/homepage.md)
- [Reservation Form](../02-website/reservation-form.md)
- [Reservation Workflow](../03-reservations/reservation-workflow.md)
- [Twilio Integration](../03-reservations/twilio-integration.md)
- [Supabase Authentication](../05-authentication/supabase-auth.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Database Storage](../06-database/storage.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Troubleshooting](../08-operations/troubleshooting.md)
- [Changelog](../08-operations/changelog.md)
- [Master Documentation Index](../README.md)

---

[Back to Deployment Overview](README.md)
