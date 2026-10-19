# Technology Stack

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Application Framework:** Next.js App Router

**Primary Language:** TypeScript

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Technology Stack Overview](#technology-stack-overview)
3. [Frontend Technologies](#frontend-technologies)
4. [Backend Technologies](#backend-technologies)
5. [Authentication and Authorization](#authentication-and-authorization)
6. [Database and Storage](#database-and-storage)
7. [Reservation and Messaging Services](#reservation-and-messaging-services)
8. [External Website Integrations](#external-website-integrations)
9. [Development Tools](#development-tools)
10. [Version Control](#version-control)
11. [Hosting and Deployment](#hosting-and-deployment)
12. [Environment Configuration](#environment-configuration)
13. [Future Technology Considerations](#future-technology-considerations)
14. [Dependency Management](#dependency-management)
15. [Security and Maintenance](#security-and-maintenance)
16. [Verification Requirements](#verification-requirements)
17. [Related Documentation](#related-documentation)

---

## Purpose

This document identifies the technologies
used to develop, deploy, and maintain
the Fin & Feathers Las Vegas website.

Its objectives are to:

- Establish a central technology inventory.
- Explain the purpose of each technology.
- Identify major external dependencies.
- Support development and maintenance.
- Distinguish implemented and planned services.
- Document technical verification requirements.

Specific package versions must be verified
against the current project configuration.

## Technology Stack Overview

| Technology | Primary Responsibility | Status |
|---|---|---|
| Next.js | Application framework | Implemented |
| React | User interface components | Implemented |
| TypeScript | Application programming language | Implemented |
| Tailwind CSS | Interface styling | Implemented |
| Node.js | JavaScript runtime and development tooling | Implemented |
| npm | Package management | Implemented |
| Supabase Auth | Administrative authentication | Implemented |
| Supabase PostgreSQL | Application database | Implemented |
| Supabase Storage | Website media storage | Implemented |
| Twilio | Reservation SMS processing | Implemented; live verification pending |
| Git | Source version control | Implemented |
| GitHub | Remote repository hosting | Implemented |
| Vercel | Website hosting and deployment | Implemented |
| Toast | External online ordering | Implemented; link verification pending |
| Toast API | Potential direct POS integration | Under Evaluation |
| Native merchandise commerce | Potential direct website shopping | Under Evaluation |

## Frontend Technologies

### Next.js

Next.js provides the primary application
framework.

The project uses the App Router architecture.

Next.js supports:

- Route-based application organization.
- React component rendering.
- Server-side functionality.
- Client-side interactive components.
- Application layouts.
- Asset delivery.
- Production builds.

The exact installed Next.js version
must be verified through package.json
and the package lockfile.

### React

React is used to build reusable
interface components.

The website uses React components for:

- Navigation.
- Homepage presentation.
- Menu interfaces.
- Reservation forms.
- Image galleries.
- Modal dialogs.
- Administrative interfaces.
- Interactive website features.

Component dependencies and versions
require source verification.

### TypeScript

TypeScript is the primary application
programming language.

It provides:

- Static type checking.
- Typed component properties.
- Typed application data.
- Improved development tooling.
- Compile-time error detection.

The project's TypeScript configuration
is maintained through tsconfig.json.

### Tailwind CSS

Tailwind CSS provides utility-based
interface styling.

The website uses Tailwind for:

- Responsive layouts.
- Spacing and alignment.
- Typography.
- Buttons and controls.
- Administrative interface styling.
- Mobile-first presentation.

The installed Tailwind version
and configuration require verification.

### Custom CSS

The project also uses custom CSS
for selected visual effects.

Established examples include:

- Homepage entrance animations.
- Neon logo effects.
- Scroll reveal behavior.
- Background presentation.
- Responsive visual refinements.

Global styling is maintained through
the application's stylesheet structure.

## Backend Technologies

### Next.js Server-Side Functionality

The application uses Next.js
server-side capabilities.

These support operations such as:

- Authenticated page access.
- Supabase database queries.
- Administrative functionality.
- Server-side authorization.
- Integration with external services.

The exact use of Server Actions,
Route Handlers, and other server-side
patterns must be verified in the source.

### Node.js

Node.js supports the development
and execution environment.

It is used for:

- Dependency installation.
- Development tooling.
- Application builds.
- TypeScript verification.
- Supporting scripts.

The required Node.js version
must be verified against the project
and deployment configuration.

### npm

npm manages application dependencies
and project scripts.

The repository contains the
package.json configuration.

Dependency installation and
build commands should follow
the project's defined scripts.

## Authentication and Authorization

### Supabase Auth

Supabase Auth provides administrative
user authentication.

The application uses authenticated
user information to determine access
to manager-only functionality.

### Manager Authorization

The existing authorization helper is:

    src/lib/auth/require-manager.ts

It verifies:

- An authenticated user.
- An associated staff role.
- Active staff status.
- The manager role.

The authorization process references
the staff_roles database table.

### Authentication Security

Authentication requirements include:

- Protected administrative routes.
- Secure session handling.
- Server-side authorization.
- Restricted database access.
- Appropriate password recovery flows.

The current authentication configuration
requires detailed verification.

## Database and Storage

### Supabase PostgreSQL

Supabase PostgreSQL stores
application data.

Known application tables include:

    staff_roles
    menu_items

Additional reservation-related tables
must be identified through inspection.

The complete database schema
is documented separately.

### Supabase Storage

Supabase Storage provides
website media storage.

The established bucket is:

    website-media

Existing use cases include:

- Public website imagery.
- Food and menu images.
- Video and promotional media.

The menu management workflow includes
4:3 WebP image processing.

Storage access policies and
upload limits require verification.

### Supabase Client Libraries

The Next.js application uses
Supabase client libraries.

The current implementation includes
a server-side Supabase client helper.

The exact installed packages,
versions, and initialization patterns
must be verified against the source.

## Reservation and Messaging Services

### Twilio

Twilio supports the restaurant's
SMS reservation workflow.

The existing implementation includes:

- Reservation message processing.
- A Twilio Function.
- Twilio Studio workflow configuration.
- Structured reservation information.
- Staff-facing reservation notifications.

The parser source is maintained at:

    twilio/functions/parse-reservation.js

### Reservation SMS Workflow

The public reservation form
prepares a text message.

The guest sends the request.

Twilio processes the incoming message.

Restaurant staff reviews the request
and determines whether it can be confirmed.

A submitted request is not automatically
a confirmed reservation.

### A2P Compliance

Live production SMS verification
remains dependent on A2P approval.

The current compliance status
must be verified before enabling
or testing live production messaging.

## External Website Integrations

### Toast Online Ordering

The public website provides
an ORDER ONLINE action.

The existing experience uses
an external Toast ordering destination.

A direct Toast POS API integration
is under evaluation.

### Merchandise Storefront

The website includes a merchandise
promotion connected to an external store.

A native merchandise commerce system
is under evaluation.

### Virtual Tour

The website includes a virtual
tour experience.

The established implementation uses
an embedded modal presentation.

The current source and destination
require verification.

### Social Media and Reviews

The website includes external
social media and review links.

The current destinations
require verification.

### Loyalty Program

The website includes an
F&F FAM CLUB presentation.

The current integration and
enrollment behavior require verification.

## Development Tools

### Visual Studio Code

Visual Studio Code is the primary
development editor.

It supports:

- TypeScript development.
- Project navigation.
- Terminal access.
- Source code inspection.
- Git integration.
- Debugging.

### Windows Subsystem for Linux

The established development environment
uses Ubuntu through WSL.

This provides a Linux terminal
for development commands.

### Browser Development Tools

Browser development tools support:

- Responsive testing.
- Console error inspection.
- Network request inspection.
- Layout debugging.
- Accessibility review.

### Command-Line Verification

Common verification commands include:

    npx tsc --noEmit
    npm run build
    git status --short
    git diff --check

Additional checks may be required
for specific features.

## Version Control

### Git

Git maintains local source
code history.

It supports:

- Change tracking.
- Commits.
- Branches.
- Diffs.
- Reverts.

### GitHub

GitHub hosts the project repository.

Repository:

    tre1techniqai/finandfeatherslv

The current branch strategy,
repository permissions, and
protection settings require verification.

### Credential Management

GitHub credentials must be protected.

The established development environment
has previously required verification
of the active GitHub account.

The correct repository account
must be used when pushing changes.

Credentials must never be committed
to the repository.

## Hosting and Deployment

### Vercel

Vercel hosts the Next.js application.

Production website:

    https://finandfeatherslv.live

The existing project is linked
to GitHub.

Vercel provides application
build and deployment infrastructure.

The exact production branch,
preview configuration, and
environment settings require verification.

### Supabase Infrastructure

Supabase independently hosts:

- Authentication.
- PostgreSQL.
- Storage.

Database changes and storage
configuration must be managed
separately from application deployments.

### Twilio Infrastructure

Twilio independently hosts
its messaging workflow components.

Twilio Function and Studio
changes require their own
deployment and verification process.

## Environment Configuration

The application uses environment
variables for service configuration.

Configuration may include:

- Public Supabase settings.
- Server-side Supabase settings.
- Twilio configuration.
- External integration settings.
- Environment-specific application values.

Actual environment variable names
must be verified against the source.

Secret values must not appear
in documentation or source commits.

The local .env.local file must remain
outside Git version control.

## Future Technology Considerations

### Toast POS API Integration

Potential future capabilities include:

- Menu synchronization.
- Modifier synchronization.
- Native shopping cart.
- Order submission.
- Payment processing.

The available API capabilities
and commercial requirements
must be confirmed before implementation.

### Merchandise Commerce

A future commerce platform
may provide:

- Product catalogs.
- Inventory.
- Checkout.
- Payments.
- Order management.
- Fulfillment.

Platform selection remains pending.

### SPECIALS Scheduling

Future specials management may require:

- Scheduling data.
- Recurrence logic.
- Promotional pricing.
- Administrative controls.

### F&F FAM CLUB

Future loyalty management may require
additional service integrations
or database functionality.

### Documentation Viewer

The planned manager-only documentation
viewer will display Markdown files
from the project's docs directory.

Any Markdown rendering dependencies
must be reviewed before installation.

## Dependency Management

Application dependencies are declared
in package.json.

The package lockfile records
resolved dependency versions.

Dependency management should include:

- Reviewing installed versions.
- Monitoring security advisories.
- Evaluating compatibility.
- Testing upgrades.
- Avoiding unnecessary dependencies.
- Preserving reproducible builds.

Dependency changes should be
reviewed and verified before deployment.

## Security and Maintenance

The technology stack must be maintained
with attention to:

- Authentication security.
- Manager authorization.
- Dependency vulnerabilities.
- Database access policies.
- Storage permissions.
- Secure environment variables.
- External API credentials.
- Customer information protection.
- Deployment integrity.
- Backup and recovery procedures.

Sensitive configuration must not
be included in project documentation.

## Verification Requirements

The following items require inspection:

- package.json dependency versions.
- package-lock.json resolved versions.
- Node.js runtime requirements.
- Next.js configuration.
- TypeScript configuration.
- Tailwind configuration.
- Supabase client packages.
- Supabase initialization patterns.
- Current Twilio dependencies.
- Vercel build configuration.
- GitHub branch settings.
- External service URLs.
- Installed image processing libraries.
- Markdown rendering library requirements.

Verified details should be recorded
in subsequent documentation updates.

## Related Documentation

- [Project Overview](README.md)
- [Application Architecture](architecture.md)
- [Development Roadmap](development-roadmap.md)
- [Website](../02-website/README.md)
- [Authentication](../05-authentication/README.md)
- [Database & Storage](../06-database/README.md)
- [Deployment](../07-deployment/README.md)
- [Toast POS Integration](../10-toast-pos-integration/README.md)
- [Merchandise Commerce](../11-merch-commerce/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Project Overview](README.md)
