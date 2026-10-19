# 08. Operations

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Primary Audience:** Restaurant Managers and Technical Administrators

**Operational Readiness:** Verification In Progress

---

## Table of Contents

1. [Operations Overview](#operations-overview)
2. [Roles and Responsibilities](#roles-and-responsibilities)
3. [Daily Operations](#daily-operations)
4. [Menu Management Procedures](#menu-management-procedures)
5. [Reservation Management Procedures](#reservation-management-procedures)
6. [Website Content Management](#website-content-management)
7. [Testing and Quality Assurance](#testing-and-quality-assurance)
8. [Troubleshooting](#troubleshooting)
9. [Incident Response](#incident-response)
10. [Change Management](#change-management)
11. [Security and Data Protection](#security-and-data-protection)
12. [Implementation Status](#implementation-status)
13. [Detailed Documentation](#detailed-documentation)
14. [Related Documentation](#related-documentation)

---

## Operations Overview

The Operations documentation provides procedures
for managing and maintaining the Fin & Feathers
Las Vegas website and administrative systems.

It is intended to support:

- Restaurant managers.
- Authorized administrative staff.
- Website developers.
- Technical support personnel.

The documentation separates routine restaurant
operations from technical maintenance procedures.

Operational procedures must be verified against
the current application before being designated
as production-ready.

## Roles and Responsibilities

### Restaurant Managers

Authorized managers may be responsible for:

- Reviewing reservation requests.
- Managing restaurant menu content.
- Updating menu prices.
- Uploading menu images.
- Managing item availability.
- Reviewing future SPECIALS functionality.
- Managing future website content features.

Manager permissions must be enforced through
the application's authorization system.

### Technical Administrators

Technical administrators may be responsible for:

- Maintaining application source code.
- Managing deployments.
- Investigating application errors.
- Reviewing database configuration.
- Maintaining external integrations.
- Coordinating security updates.
- Supporting incident recovery.

Repository access and application manager
permissions are separate responsibilities.

## Daily Operations

A future daily operations checklist may include:

1. Verify that the public website is accessible.
2. Confirm that menu information is current.
3. Review new reservation requests.
4. Check for operational notifications.
5. Verify that public website media loads.
6. Review scheduled promotions when available.
7. Escalate technical issues when necessary.

This checklist is a proposed operational procedure.

Individual checks should be confirmed with
restaurant ownership before formal adoption.

## Menu Management Procedures

The existing Admin Dashboard includes a
Menu Management interface.

Manager operations include:

- Creating menu items.
- Editing item information.
- Updating pricing.
- Managing categories and subcategories.
- Managing menu tags.
- Uploading menu images.
- Activating or deactivating menu items.
- Adjusting display order.
- Managing the existing $5 special flag.

Managers should verify that changes appear
correctly on the public website.

See [Menu Management](../09-menu-management/README.md).

## Reservation Management Procedures

The reservation system uses an SMS request
workflow supported by Twilio.

The intended staff process includes:

1. Receive a reservation request.
2. Review the requested date and time.
3. Check party size and occasion.
4. Determine availability.
5. Confirm the reservation or propose
   an alternative arrangement.
6. Communicate the outcome to the guest.
7. Maintain an appropriate reservation record.

A submitted request must not be represented
as a confirmed reservation until staff
has completed the confirmation process.

Live SMS end-to-end testing remains dependent
on the required A2P approval.

See [Reservations](../03-reservations/README.md).

## Website Content Management

Future management capabilities may include:

### SPECIALS

- Create scheduled promotions.
- Select existing menu items.
- Configure promotional pricing.
- Set recurring schedules.
- Activate or deactivate promotions.

### F&F FAM CLUB

- Update loyalty program content.
- Maintain enrollment information.
- Manage promotional announcements.

### GALLERY

- Upload images.
- Replace images.
- Change display order.
- Manage visibility.

### MERCH

- Manage merchandise products.
- Update product imagery.
- Configure prices and variants.
- Manage inventory and orders.

These capabilities are planned and should
not be treated as available until implemented.

## Testing and Quality Assurance

Operational testing should include:

### Public Website

- Desktop layout.
- Mobile layout.
- Navigation.
- Menu display.
- Image loading.
- Reservation form validation.
- External links and embedded content.

### Admin Dashboard

- Manager login.
- Unauthorized access protection.
- Menu item creation and editing.
- Menu image uploads.
- Item visibility controls.
- Reservation management views.

### Integrations

- Supabase database access.
- Supabase Storage.
- Twilio reservation parsing.
- Deployment configuration.

Testing must distinguish simulated workflows
from live production verification.

## Troubleshooting

The troubleshooting guide will cover:

- Website availability issues.
- Build and deployment errors.
- Administrative login problems.
- Manager authorization failures.
- Menu updates not appearing.
- Image upload failures.
- Reservation processing errors.
- Twilio integration issues.
- Database access errors.

Troubleshooting procedures should include:

1. Identify the affected feature.
2. Reproduce the issue when safe.
3. Review relevant error information.
4. Determine the affected service.
5. Apply an approved corrective action.
6. Verify that functionality is restored.
7. Document the outcome.

Avoid exposing credentials or customer
information in troubleshooting records.

## Incident Response

Potential operational incidents include:

- Public website outages.
- Failed deployments.
- Authentication failures.
- Database connectivity issues.
- Storage access failures.
- Reservation processing interruptions.
- Unauthorized access attempts.

The incident response process should establish:

- Incident identification.
- Severity assessment.
- Responsible personnel.
- Immediate containment.
- Service restoration.
- Verification.
- Documentation.
- Follow-up actions.

Detailed escalation contacts and recovery
procedures require owner approval.

## Change Management

Website and administrative changes should
follow a controlled development process.

The recommended workflow includes:

1. Define the requested change.
2. Review affected functionality.
3. Inspect existing source code.
4. Implement targeted changes.
5. Run relevant tests.
6. Review the Git diff.
7. Commit approved changes.
8. Deploy through the established workflow.
9. Verify the deployed functionality.
10. Record meaningful changes.

The project changelog should distinguish:

- New features.
- Improvements.
- Bug fixes.
- Security updates.
- Infrastructure changes.
- Known issues.

## Security and Data Protection

Operational procedures must protect:

- Manager authentication credentials.
- Customer reservation information.
- Supabase credentials.
- Twilio credentials.
- Database records.
- Administrative permissions.
- Deployment configuration.

Staff should access only the information
required for their assigned responsibilities.

Sensitive information must not be included
in public documentation or Git commits.

## Implementation Status

| Capability | Status |
|---|---|
| Public website operations | Active |
| Manager authentication | Implemented |
| Menu administration | Implemented |
| Reservation management | In Development |
| Daily operations checklist | Proposed |
| Manager operations guide | Documentation pending |
| Testing checklists | In Development |
| Troubleshooting guide | Documentation pending |
| Incident response procedures | Planned |
| Change management workflow | Established |
| Project changelog | Documentation pending |
| SPECIALS administration | Planned |
| F&F FAM CLUB administration | Planned |
| GALLERY administration | Planned |
| MERCH administration | Planned |

## Detailed Documentation

The following documents will provide
implementation-specific information:

- [Manager Guide](manager-guide.md)
- [Testing Checklists](testing-checklists.md)
- [Troubleshooting](troubleshooting.md)
- [Project Changelog](changelog.md)

These documents will be created and verified
in subsequent documentation steps.

## Related Documentation

- [Project Overview](../01-project-overview/README.md)
- [Website](../02-website/README.md)
- [Reservations](../03-reservations/README.md)
- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Authentication](../05-authentication/README.md)
- [Database & Storage](../06-database/README.md)
- [Deployment](../07-deployment/README.md)
- [Menu Management](../09-menu-management/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Master Documentation Index](../README.md)
