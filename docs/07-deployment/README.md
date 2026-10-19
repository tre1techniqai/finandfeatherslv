# 07. Deployment

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Website:** https://finandfeatherslv.live

**Hosting Platform:** Vercel

**Version Control:** Git / GitHub

**SMS Platform:** Twilio

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Development Environment](#development-environment)
3. [GitHub Repository](#github-repository)
4. [Vercel Deployment](#vercel-deployment)
5. [Supabase Configuration](#supabase-configuration)
6. [Twilio Deployment](#twilio-deployment)
7. [Environment Variables](#environment-variables)
8. [Pre-Deployment Verification](#pre-deployment-verification)
9. [Production Verification](#production-verification)
10. [Rollback Procedures](#rollback-procedures)
11. [Security Considerations](#security-considerations)
12. [Implementation Status](#implementation-status)
13. [Detailed Documentation](#detailed-documentation)
14. [Related Documentation](#related-documentation)

---

## Deployment Overview

The Fin & Feathers Las Vegas website is developed
using Next.js and deployed through Vercel.

GitHub provides source code version control.

Supabase provides authentication, database services,
and media storage.

Twilio supports the SMS reservation workflow.

Application deployments and Twilio deployments
are separate processes.

## Development Environment

The project is developed using:

- Visual Studio Code.
- Ubuntu running through Windows Subsystem for Linux.
- Node.js and npm.
- Git and GitHub.
- Next.js and TypeScript.

The existing development workspace is:

/mnt/c/Users/ApertureDev/_Working/00-Projects/CMA/DH/Fin-Feathers/02-WEB/finandfeatherslv

This path describes the established development
workspace and is not a required location
for other developers.

## GitHub Repository

The project repository is:

tre1techniqai/finandfeatherslv

Git is used to track source code changes.

A typical development workflow includes:

1. Review the current Git working tree.
2. Make targeted changes.
3. Run applicable verification commands.
4. Review the resulting diff.
5. Stage only intended files.
6. Create a descriptive commit.
7. Push to the appropriate remote branch.
8. Verify the associated deployment.

The active branch and deployment triggers
must be confirmed before publishing changes.

Do not assume every local file should be committed.

## Vercel Deployment

Vercel hosts the Next.js application.

The production website is:

https://finandfeatherslv.live

The project has an existing GitHub-to-Vercel
deployment integration.

Deployment documentation should cover:

- Project configuration.
- Production branch.
- Preview deployments.
- Build settings.
- Environment variables.
- Deployment history.
- Production verification.
- Rollback options.

The current Vercel project settings must be
inspected before recording exact configuration.

## Supabase Configuration

The application integrates with Supabase for:

- Authentication.
- PostgreSQL database operations.
- Media storage.
- Manager authorization.

Deployment considerations include:

- Correct Supabase project configuration.
- Environment variable availability.
- Authentication redirect configuration.
- Database migrations.
- Storage permissions.
- Row Level Security policies.

Database changes should be verified separately
from application deployments.

See [Database & Storage](../06-database/README.md).

## Twilio Deployment

Twilio supports the restaurant's SMS
reservation request workflow.

The existing implementation includes:

- A reservation parsing function.
- Twilio Studio workflow configuration.
- Structured reservation data processing.
- Staff-facing reservation information.

The reservation parser source is maintained at:

twilio/functions/parse-reservation.js

The parser has been tested locally and deployed
through the Twilio Console.

Twilio Functions and Studio workflows may
require independent deployment and verification.

The exact active Twilio configuration must be
checked before any subsequent production changes.

## Environment Variables

The application uses environment-specific
configuration for external services.

Configuration may include:

- Supabase connection settings.
- Supabase public configuration.
- Server-only Supabase credentials.
- Twilio integration settings.
- Other service-specific configuration.

Actual environment variable names should be
documented after reviewing the application code.

Never include secret values in documentation.

The local .env.local file must not be
committed to Git.

Production credentials should be managed
through the appropriate deployment platform.

## Pre-Deployment Verification

Before deploying application changes:

1. Review modified files.
2. Confirm no secrets are staged.
3. Run TypeScript validation.
4. Run the production build.
5. Test affected functionality locally.
6. Review the Git diff.
7. Confirm the intended deployment branch.

Common verification commands include:

    npx tsc --noEmit
    npm run build
    git status --short
    git diff --check

Additional tests may be required depending
on the affected functionality.

## Production Verification

After deployment, verify:

- Production website availability.
- Responsive layout behavior.
- Affected public website features.
- Administrative login.
- Manager-only route protection.
- Menu content display.
- Reservation form behavior.
- Relevant database operations.
- Relevant media loading.

Do not perform live SMS end-to-end testing
until the required A2P approval is complete.

Production verification should focus on
the functionality affected by the deployment.

## Rollback Procedures

Rollback planning should address:

### Application Rollback

- Identify the last known-good deployment.
- Review the failed deployment.
- Restore the appropriate application version.
- Verify production functionality.

### Database Rollback

- Review the migration or schema change.
- Determine whether data changes are reversible.
- Follow an approved recovery procedure.
- Avoid destructive changes without a backup.

### Twilio Rollback

- Identify the previously working Function version.
- Review the active Studio workflow configuration.
- Restore an approved configuration if necessary.
- Verify behavior through permitted testing.

Rollback steps must be validated against
the actual service configuration before use.

## Security Considerations

Deployment procedures must protect:

- Environment variables.
- Supabase service-role credentials.
- Twilio credentials.
- Authentication configuration.
- Customer information.
- Production database access.
- Administrative permissions.

Avoid committing secrets or publishing
sensitive operational information.

Documentation must not contain credentials,
private tokens, or customer records.

## Implementation Status

| Capability | Status |
|---|---|
| GitHub repository | Implemented |
| Vercel deployment | Implemented |
| Production website domain | Implemented |
| Supabase integration | Implemented |
| Twilio parser deployment | Implemented |
| Twilio Studio integration | Implemented; live verification pending |
| Local TypeScript verification workflow | Established |
| Local production build workflow | Established |
| Documented deployment checklist | In Development |
| Documented rollback procedures | In Development |
| Automated deployment testing | Under Evaluation |
| Live SMS production verification | Pending A2P Approval |

## Detailed Documentation

The following documents will provide
implementation-specific information:

- [GitHub Workflow](github-workflow.md)
- [Vercel Deployment](vercel-deployment.md)
- [Twilio Deployment](twilio-deployment.md)
- [Rollback Procedures](rollback-procedures.md)

These documents will be created and verified
in subsequent documentation steps.

## Related Documentation

- [Project Overview](../01-project-overview/README.md)
- [Authentication](../05-authentication/README.md)
- [Database & Storage](../06-database/README.md)
- [Reservations](../03-reservations/README.md)
- [Operations](../08-operations/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Master Documentation Index](../README.md)
