# DEPLOYMENT — GitHub Workflow

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** GitHub repository established and connected to Vercel; branch protections, automated checks, and repository security settings require verification

**Feature:** Source Control, Collaboration, and Deployment Coordination

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Workflow Objectives](#workflow-objectives)
3. [Current Implementation](#current-implementation)
4. [Development Environment](#development-environment)
5. [Repository Architecture](#repository-architecture)
6. [Git Configuration](#git-configuration)
7. [Daily Development Workflow](#daily-development-workflow)
8. [Branch Management](#branch-management)
9. [Commit Standards](#commit-standards)
10. [Pull Requests and Code Review](#pull-requests-and-code-review)
11. [GitHub and Vercel Integration](#github-and-vercel-integration)
12. [Environment Variables and Secrets](#environment-variables-and-secrets)
13. [GitHub Authentication and Credentials](#github-authentication-and-credentials)
14. [Working with WSL and VS Code](#working-with-wsl-and-vs-code)
15. [Dependency Management](#dependency-management)
16. [Build and Quality Checks](#build-and-quality-checks)
17. [Database and Storage Changes](#database-and-storage-changes)
18. [Deployment Coordination](#deployment-coordination)
19. [Rollback and Recovery](#rollback-and-recovery)
20. [Repository Security](#repository-security)
21. [Documentation Management](#documentation-management)
22. [Troubleshooting](#troubleshooting)
23. [Testing and Verification](#testing-and-verification)
24. [Operational Procedures](#operational-procedures)
25. [Implementation Roadmap](#implementation-roadmap)
26. [Implementation Status](#implementation-status)
27. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the source-control workflow for the Fin & Feathers Las Vegas website.

The project uses Git for local version control and GitHub for remote repository management.

GitHub is connected to the existing Vercel deployment project.

The workflow should allow development to proceed safely while preserving the ability to inspect, review, and recover changes.

This document covers:

- Local development.
- Git configuration.
- Repository management.
- Branches.
- Commits.
- Pull requests.
- GitHub authentication.
- WSL and VS Code.
- Dependency management.
- Build verification.
- Environment variables.
- Database changes.
- Deployment coordination.
- Rollbacks.
- Security.
- Documentation maintenance.

This document does not establish that unverified GitHub protections or automated workflows are currently enabled.

## Workflow Objectives

The development workflow should support consistent, recoverable changes.

### Traceability

Each meaningful change should be associated with a Git commit.

### Reproducibility

The repository should contain the source files needed to reproduce the application build.

### Safety

Sensitive credentials and local environment files must remain outside source control.

### Collaboration

Changes should be understandable to future contributors.

### Verification

Application changes should pass appropriate checks before deployment.

### Deployment Reliability

GitHub changes should integrate predictably with Vercel.

### Recovery

The team should be able to identify and restore earlier working versions.

### Documentation

Technical documentation should remain synchronized with verified implementation.

## Current Implementation

**Status:** Repository and Vercel integration established

### GitHub Repository

    tre1techniqai/finandfeatherslv

### Repository URL

    https://github.com/tre1techniqai/finandfeatherslv

### Development Framework

    Next.js App Router

### Programming Language

    TypeScript

### Development Editor

    Visual Studio Code

### Development Environment

    Ubuntu 24.04 under WSL

### Deployment Platform

    Vercel

### Production Domain

    https://finandfeatherslv.live

### Existing Integration

The GitHub repository is linked to the Vercel project.

### Established Git History

The project has previously been committed and pushed successfully.

### Verification Boundary

The following require inspection:

- Current default branch.
- Current local branch.
- Remote configuration.
- Branch protection rules.
- Required status checks.
- GitHub Actions workflows.
- Repository access permissions.
- Automated dependency updates.

## Development Environment

The project is developed using Windows with Ubuntu under WSL.

### Editor

    VS Code

### Terminal

    Ubuntu 24.04

### Runtime

    Node.js

### Package Manager

    npm

### Framework

    Next.js

### Database and Storage

    Supabase

### Deployment

    Vercel

### Local Project Directory

    /mnt/c/Users/ApertureDev/_Working/00-Projects/CMA/DH/Fin-Feathers/02-WEB/finandfeatherslv

### Development Principle

Run project commands from the correct repository root.

### Environment Consistency

Node.js and npm versions should be checked when troubleshooting environment-specific failures.

### Source Verification

Actual runtime versions must be obtained from the current development environment.

## Repository Architecture

The repository contains the application source and supporting project files.

### Application

The project uses the Next.js App Router.

### Components

Reusable interface components support public and administrative functionality.

### Authentication

Supabase Auth provides identity authentication.

### Database

Supabase PostgreSQL supports persistent application data.

### Storage

Supabase Storage supports website media.

### Documentation

    docs/

### Environment Configuration

Local environment settings are maintained outside committed secrets.

### Deployment Configuration

Vercel uses the connected repository to build and deploy the application.

### Architecture Boundary

The exact repository tree should be inspected before documenting every source directory or configuration file.

## Git Configuration

Git should be configured for the intended developer identity.

### Inspect Version

    git --version

### Inspect Repository

    git status

### Inspect Current Branch

    git branch --show-current

### Inspect Remotes

    git remote -v

### Inspect User Name

    git config user.name

### Inspect User Email

    git config user.email

### Inspect Credential Helper

    git config --show-origin --get credential.helper

### Identity Consistency

Commits should use the intended developer identity.

### Repository Scope

Prefer repository-specific configuration when multiple identities are used.

### Credential Security

Authentication credentials must not be stored in project source files.

### Verification

Do not assume the active Git identity matches the intended GitHub account without checking.

## Daily Development Workflow

A consistent development routine reduces accidental changes.

### Step 1 — Open Project

Navigate to the established project root.

### Step 2 — Inspect Status

    git status

### Step 3 — Inspect Branch

    git branch --show-current

### Step 4 — Review Recent Changes

    git log -5 --oneline

### Step 5 — Synchronize

Fetch remote changes when appropriate.

    git fetch origin

### Step 6 — Develop

Make approved changes in VS Code.

### Step 7 — Inspect Differences

    git diff

### Step 8 — Validate

Run appropriate project checks.

### Step 9 — Stage

Stage only the intended files.

### Step 10 — Commit

Create a descriptive commit.

### Step 11 — Push

Push the intended branch to the correct remote.

### Step 12 — Verify Deployment

Check the associated Vercel deployment when applicable.

### Safety

Do not pull, reset, or overwrite local changes without first inspecting the working tree.

## Branch Management

Branches separate work from other repository changes.

### Default Branch

The current default branch must be verified from GitHub.

### Feature Branches

Feature branches are recommended for substantial changes.

### Example Names

    feature/admin-documentation
    feature/menu-improvements
    fix/reservation-validation
    docs/deployment-guides

### Branch Creation

    git switch -c feature/example-change

### Branch Inspection

    git branch -a

### Branch Switching

    git switch branch-name

### Remote Tracking

Push the branch with the appropriate upstream configuration.

### Branch Protection

Required reviews and merge restrictions should be considered.

### Verification Boundary

No branch protection policy is established as enabled by this document.

## Commit Standards

Commits should describe meaningful changes.

### Recommended Format

    type: concise description

### Example Types

- feat.
- fix.
- docs.
- refactor.
- test.
- chore.

### Example Commits

    docs: add database security reference
    fix: correct menu item validation
    feat: add approved gallery controls

### Commit Scope

Prefer focused changes that are easy to review.

### Commit Message

Explain what changed rather than using vague descriptions.

### Secrets

Never commit `.env.local` or private credentials.

### Generated Files

Review generated output before committing.

### Verification

Inspect staged changes before creating the commit.

## Pull Requests and Code Review

Pull requests provide a reviewable path for merging changes.

### Proposed Workflow

1. Create a feature branch.
2. Make the approved changes.
3. Run local checks.
4. Push the branch.
5. Open a pull request.
6. Review the changes.
7. Address feedback.
8. Merge through the approved process.
9. Verify the deployment.

### Pull Request Description

Include:

- Purpose.
- Scope.
- Relevant files.
- Verification performed.
- Known limitations.
- Deployment considerations.

### Review Priorities

Check functionality, security, maintainability, and documentation.

### Database Changes

Database migrations require additional scrutiny.

### Sensitive Changes

Authentication and payment-related changes may require enhanced review.

### Current Boundary

The exact repository review requirements and protection settings require verification.

## GitHub and Vercel Integration

GitHub is connected to the Vercel deployment project.

### Repository

    tre1techniqai/finandfeatherslv

### Deployment Provider

    Vercel

### Production Domain

    https://finandfeatherslv.live

### Deployment Triggers

Vercel may build deployments in response to configured Git events.

### Production Branch

The actual production branch configuration must be verified in Vercel.

### Preview Deployments

Nonproduction branches may produce preview deployments depending on project settings.

### Build Environment

Vercel uses its configured environment variables and build settings.

### Deployment Verification

Review the actual deployment status after relevant pushes or merges.

### Important Boundary

A successful Git push does not automatically prove a successful production deployment.

## Environment Variables and Secrets

The application uses environment-specific configuration.

### Local Environment File

    .env.local

### Git Requirement

Do not commit `.env.local`.

### Supabase

Supabase configuration must use the appropriate public and private environment variables.

### Twilio

Messaging credentials must remain protected.

### Vercel

Production secrets belong in the approved Vercel environment configuration.

### Public Variables

Publicly exposed environment variables must not contain privileged credentials.

### Server Variables

Privileged credentials must remain server-side.

### Git History

Removing a secret from the current file does not remove it from earlier Git history.

### Secret Exposure

Suspected leaked credentials require rotation and incident review.

### Verification

Review staged changes and repository history for accidental exposure.

## GitHub Authentication and Credentials

The development environment has previously encountered GitHub authentication issues.

### Repository Owner

    tre1techniqai

### Secondary Account

    Tre1-Techniq

### Previously Observed Issue

A push returned HTTP 403 when authentication used the unintended account.

### Root Cause Category

The authenticated GitHub identity did not have the expected repository write permissions.

### Credential Manager

Git Credential Manager was considered in the WSL workflow.

### WSL Path Consideration

Windows executable paths containing spaces require correct shell handling.

### Authentication Review

Check which account is being used for Git operations.

### Remote Review

Confirm the remote points to the intended repository.

### Permissions

Verify that the authenticated account has appropriate repository access.

### Credential Storage

Use an approved secure credential helper.

### Important Boundary

The current credential helper and active authentication state must be verified rather than inferred from historical troubleshooting.

## Working with WSL and VS Code

The project uses a Windows-hosted development workflow with WSL.

### Terminal Environment

    Ubuntu 24.04

### Editor

    VS Code

### Repository Location

The project resides under a mounted Windows drive.

### Path Handling

Paths containing spaces require correct quoting.

### Git Commands

Run Git commands from the intended repository root.

### Node Modules

Dependency installation should use the intended Node.js environment.

### File Permissions

WSL and Windows file permission behavior may differ.

### Line Endings

Git line-ending configuration should remain consistent.

### Credentials

Windows and WSL credential helpers may require explicit configuration.

### Verification

When troubleshooting, confirm the active shell, executable paths, and working directory.

## Dependency Management

The project uses npm for package management.

### Package Manifest

    package.json

### Lockfile

    package-lock.json

### Installation

    npm install

### Reproducible Installation

    npm ci

### Dependency Changes

Review package changes before committing.

### Lockfile Consistency

Commit appropriate lockfile updates with dependency changes.

### Security

Review security advisories for relevant packages.

### Compatibility

Check compatibility with the project's Next.js and Node.js versions.

### Production

Avoid unreviewed dependency upgrades immediately before critical deployments.

### Verification

The current dependency versions must be read from the repository.

## Build and Quality Checks

Changes should pass appropriate verification before deployment.

### Existing Build Command

    npm run build

### Development Command

    npm run dev

### Build Purpose

Confirm the application can compile and produce its intended build output.

### TypeScript

Review type errors and compatibility issues.

### Linting

Run configured lint checks when available.

### Tests

Run relevant automated tests when present.

### Manual Verification

Test affected public and administrative workflows.

### Authentication

Confirm protected routes remain protected.

### Menu

Verify affected menu operations.

### Reservations

Verify affected reservation form and SMS behavior.

### Documentation

Check links and file organization.

### Important Boundary

The presence of npm scripts or automated CI checks must be verified from the current repository.

## Database and Storage Changes

Git tracks source changes but does not automatically capture all external service state.

### Supabase Database

Schema changes may require migration files.

### Supabase Storage

Uploaded media objects are not automatically stored in Git.

### Database Policies

RLS changes require controlled deployment and verification.

### Migration Review

Review SQL changes before production application.

### Environment Separation

Use appropriate development and production environments.

### Backups

Consider recovery requirements before destructive changes.

### Source of Truth

Document which database and Storage changes are managed through version control.

### Deployment Coordination

Coordinate application changes with required schema updates.

### Important Boundary

A Git rollback does not automatically reverse database migrations or Storage changes.

## Deployment Coordination

GitHub and Vercel should be managed as a coordinated deployment workflow.

### Predeployment Review

Confirm the intended branch and commit.

### Build Verification

Run appropriate checks.

### Environment Variables

Confirm the target environment has the required configuration.

### Database Compatibility

Verify application changes are compatible with the deployed schema.

### Deployment Trigger

Use the approved GitHub/Vercel workflow.

### Deployment Status

Inspect Vercel build and deployment results.

### Production Verification

Test affected functionality on the production domain.

### Failure Handling

Investigate build failures before making further changes.

### Release Notes

Record meaningful changes in the project changelog.

### Important Boundary

Do not assume production has updated until the intended deployment is confirmed.

## Rollback and Recovery

Git provides several recovery mechanisms.

### Inspect History

    git log --oneline

### Inspect Changes

    git diff

### Restore a File

Use the appropriate Git restore command only after identifying the intended version.

### Revert a Commit

    git revert COMMIT_HASH

### Revert Behavior

A revert creates a new commit that reverses selected changes.

### Reset Behavior

Git reset can rewrite local history and may discard work.

### Force Push

Avoid force pushes to shared or production branches unless explicitly approved.

### Vercel Rollback

Vercel deployment recovery must follow the project's approved process.

### Database Changes

Application rollback does not automatically undo database migrations.

### Storage Changes

Deleted or replaced media may require separate recovery.

### Safety

Inspect repository status and recovery impact before running destructive commands.

## Repository Security

Repository access is part of the application's security model.

### Access Control

Only approved contributors should have write permissions.

### Authentication

GitHub accounts should use strong authentication.

### Multifactor Authentication

Enable appropriate account protection.

### Secrets

Do not commit credentials or tokens.

### Branch Protection

Consider requiring reviews and successful checks.

### Dependency Security

Review relevant package vulnerabilities.

### GitHub Actions

Any workflows should use least-privilege permissions.

### Deployment Credentials

Protect Vercel and external service integrations.

### Auditability

Review significant repository access and configuration changes.

### Verification Boundary

Actual repository security settings require inspection.

## Documentation Management

The project maintains a structured documentation directory.

### Documentation Root

    docs/

### Master Index

    docs/README.md

### Categories

Documentation is organized by project area.

### Current Documentation Workflow

Documents are created and verified individually.

### Verification Commands

    wc -l
    grep -n '^## '
    tail -n 18

### Source Accuracy

Distinguish verified behavior from planned functionality.

### Link Integrity

Relative documentation links should resolve correctly.

### Git Tracking

Documentation changes should be committed through the approved workflow.

### Review

Update relevant documentation when implementation changes.

### Private Documentation

The eventual administrative documentation viewer must remain manager-protected.

### Important Boundary

The planned `/admin/docs` viewer is not established as implemented.

## Troubleshooting

### Wrong Repository

Confirm the current directory and remote configuration.

### Wrong Branch

Inspect the active branch before committing.

### Uncommitted Changes

Review `git status` before switching branches or pulling.

### Push Rejected

Check remote history and branch permissions.

### HTTP 403

Verify the authenticated GitHub account and repository access.

### Credential Prompt

Review the configured credential helper.

### WSL Path Failure

Check quoting and executable paths containing spaces.

### Merge Conflict

Review each conflicting file and resolve deliberately.

### Build Failure

Inspect the relevant npm and Vercel output.

### Deployment Not Updated

Verify the pushed branch and configured production branch.

### Missing Environment Variable

Review the target environment configuration without exposing secret values.

### Lost Local Changes

Inspect Git history and reflog before attempting recovery.

## Testing and Verification

### Repository

- Correct repository root.
- Correct remote.
- Correct active branch.
- Clean or understood working tree.

### Authentication

- Correct GitHub account.
- Valid repository permissions.
- Secure credential helper.
- Successful authorized push.

### Commits

- Intended files staged.
- No secrets staged.
- Descriptive commit message.
- Commit visible in history.

### Branches

- Feature branch creation.
- Branch switching.
- Remote tracking.
- Merge behavior.

### Pull Requests

- Correct target branch.
- Relevant review.
- Successful required checks where configured.
- Approved merge.

### Build

- Dependency installation.
- TypeScript compilation.
- Production build.
- Affected feature checks.

### Deployment

- Correct Vercel project.
- Correct deployment branch.
- Successful build.
- Production verification.

### Recovery

- Commit history available.
- Revert procedure understood.
- Vercel recovery documented.
- Database recovery considered.

### Documentation

- File paths.
- Headings.
- Relative links.
- Implementation status accuracy.

## Operational Procedures

### Starting Development

1. Open the repository in VS Code.
2. Confirm the working directory.
3. Inspect Git status.
4. Confirm the current branch.
5. Fetch remote changes when appropriate.
6. Review the planned work.

### Completing Development

1. Review changed files.
2. Run applicable checks.
3. Inspect staged changes.
4. Confirm no secrets are included.
5. Commit with a descriptive message.
6. Push to the intended remote branch.
7. Verify the remote update.

### Deploying Changes

1. Confirm the intended release commit.
2. Verify build results.
3. Confirm environment configuration.
4. Deploy through the approved workflow.
5. Verify the Vercel deployment.
6. Test the production website.
7. Update operational documentation.

### Responding to Failure

1. Identify the affected commit or deployment.
2. Preserve relevant diagnostic information.
3. Determine whether the issue involves application code, database state, or external services.
4. Select the appropriate recovery procedure.
5. Verify the restored functionality.
6. Document the incident.

## Implementation Roadmap

### Stage 1 — Verify Repository Configuration

Inspect the current default branch, remotes, and contributor access.

### Stage 2 — Review Credential Management

Confirm reliable GitHub authentication from WSL.

### Stage 3 — Establish Branch Standards

Approve branch naming and merge practices.

### Stage 4 — Review Repository Protections

Evaluate branch protection and required review settings.

### Stage 5 — Verify Automated Checks

Inspect existing CI workflows and identify missing verification.

### Stage 6 — Align Vercel Deployment

Confirm production and preview branch behavior.

### Stage 7 — Document External State

Establish procedures for Supabase and other service changes.

### Stage 8 — Test Recovery

Verify Git and deployment rollback procedures.

### Stage 9 — Maintain Workflow Documentation

Update this document when repository or deployment settings change.

### Scheduling

This roadmap does not establish a committed delivery date.

## Implementation Status

| Capability | Status |
|---|---|
| Git repository | Implemented |
| GitHub remote repository | Established |
| Repository owner identity | Established |
| VS Code development workflow | Implemented |
| Ubuntu WSL development environment | Implemented |
| GitHub push workflow | Previously verified |
| GitHub/Vercel integration | Established |
| Production domain | Established |
| Current default branch | Verification pending |
| Current remote configuration | Verification pending |
| Current credential helper | Verification pending |
| Branch naming standards | Recommended |
| Pull request workflow | Recommended |
| Branch protection rules | Verification pending |
| Required status checks | Verification pending |
| GitHub Actions CI | Source verification pending |
| Dependency security automation | Verification pending |
| Secret scanning configuration | Verification pending |
| Database migration workflow | Source verification pending |
| Vercel production branch configuration | Verification pending |
| Deployment rollback procedure | Verification pending |
| Documentation source control | In Development |
| Comprehensive workflow acceptance testing | Verification pending |

## Related Documentation

- [Deployment Overview](README.md)
- [Vercel Deployment](vercel-deployment.md)
- [Twilio Deployment](twilio-deployment.md)
- [Rollback Procedures](rollback-procedures.md)
- [Project Architecture](../01-project-overview/architecture.md)
- [Technology Stack](../01-project-overview/technology-stack.md)
- [Development Roadmap](../01-project-overview/development-roadmap.md)
- [Supabase Authentication](../05-authentication/supabase-auth.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Database Storage](../06-database/storage.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Troubleshooting](../08-operations/troubleshooting.md)
- [Changelog](../08-operations/changelog.md)
- [Master Documentation Index](../README.md)

---

[Back to Deployment Overview](README.md)
