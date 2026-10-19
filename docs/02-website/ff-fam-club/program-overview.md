# F&F FAM CLUB — Program Overview

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Public presentation implemented; expanded functionality planned

**Feature:** F&F FAM CLUB

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Program Vision](#program-vision)
3. [Current Website Implementation](#current-website-implementation)
4. [Customer Engagement Objectives](#customer-engagement-objectives)
5. [Proposed Membership Capabilities](#proposed-membership-capabilities)
6. [Rewards and Benefits](#rewards-and-benefits)
7. [Customer Communications](#customer-communications)
8. [Membership Data](#membership-data)
9. [Administrative Management](#administrative-management)
10. [Potential Integrations](#potential-integrations)
11. [Privacy and Consent](#privacy-and-consent)
12. [Development Requirements](#development-requirements)
13. [Testing and Verification](#testing-and-verification)
14. [Implementation Status](#implementation-status)
15. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the F&F FAM CLUB
customer engagement initiative for
Fin & Feathers Las Vegas.

It establishes the distinction between:

- The existing website presentation.
- The intended customer experience.
- Potential membership functionality.
- Future administrative capabilities.
- Integrations requiring evaluation.
- Features requiring business approval.

This document is a planning reference.

It does not establish unapproved
membership benefits, reward values,
or promotional commitments.

## Program Vision

F&F FAM CLUB is the restaurant's
customer loyalty and engagement concept.

The program is intended to encourage
ongoing relationships between the
restaurant and its customers.

Potential objectives include:

- Encouraging repeat visits.
- Promoting restaurant specials.
- Sharing restaurant announcements.
- Supporting event awareness.
- Recognizing returning customers.
- Increasing customer engagement.
- Strengthening the restaurant brand.

Specific program mechanics require
approval from restaurant ownership.

## Current Website Implementation

The public website includes
an established loyalty program
presentation component.

Previously established component:

    loyalty-program

The exact source path and
component implementation
require verification.

### Existing Scope

The current website presents
F&F FAM CLUB information
to visitors.

The current implementation
should be reviewed to identify:

- Displayed program messaging.
- Available customer actions.
- Enrollment destinations.
- External service dependencies.
- Data collection behavior.
- Mobile and desktop presentation.

### Important Distinction

Displaying a loyalty program
section does not necessarily
mean the website operates
its own membership database,
rewards engine, or enrollment system.

These capabilities must be
verified before being described
as operational.

## Customer Engagement Objectives

The program may support several
business objectives.

### Customer Retention

Encourage customers to return
through relevant communication
and approved member benefits.

### Restaurant Promotions

Share information about:

- Daily specials.
- Weekly specials.
- New menu items.
- Seasonal promotions.
- Restaurant events.

### Brand Community

Provide customers with a
recognizable relationship
to the restaurant brand.

### Customer Experience

Make program information
easy to find and understand.

### Operational Simplicity

Future management tools
should minimize unnecessary
administrative work.

## Proposed Membership Capabilities

**Status:** Planned; requirements pending

Potential capabilities include:

- Customer enrollment.
- Member profiles.
- Membership status.
- Communication preferences.
- Enrollment confirmation.
- Profile updates.
- Membership deactivation.

### Enrollment

The program may eventually
provide an enrollment form
or integrate with an
approved external platform.

Before implementation,
the project must determine:

- Required enrollment fields.
- Eligibility requirements.
- Age-related restrictions.
- Consent requirements.
- Verification procedures.
- Data retention policies.

### Member Identification

Potential approaches include:

- Email address.
- Mobile phone number.
- Platform-generated member ID.

The selected method must
follow approved privacy
and security requirements.

### Membership Status

A future system may track:

- Active members.
- Pending enrollment.
- Unsubscribed members.
- Deactivated memberships.

The final status model
requires business approval.

## Rewards and Benefits

**Status:** Under Evaluation

Potential benefits may include:

- Member-only promotions.
- Special event announcements.
- Birthday-related offers.
- Early promotional access.
- Approved loyalty rewards.

These are examples of
possible program features,
not confirmed restaurant offers.

### Business Rules

Before rewards are implemented,
ownership must approve:

- Reward eligibility.
- Earning requirements.
- Redemption conditions.
- Expiration rules.
- Promotional exclusions.
- Fraud prevention measures.

### Pricing Coordination

Member benefits must not
conflict with approved
restaurant menu pricing.

Promotional pricing should
remain consistent with
the SPECIALS system.

### Point-Based Rewards

A points system is not
assumed to exist.

If considered, it requires
separate evaluation of:

- Earning calculations.
- Balance tracking.
- Redemption logic.
- Transaction history.
- POS integration.
- Customer support procedures.

## Customer Communications

**Status:** Planned; approval dependent

The program may eventually
support customer communications.

Potential communication types:

- Restaurant announcements.
- Promotional updates.
- Event notifications.
- Loyalty program information.
- Approved member offers.

### Communication Channels

Potential channels include:

- Email.
- SMS.
- External loyalty platforms.

No particular communication
provider is selected
by this document.

### Consent

Promotional communications
must use appropriate consent.

Reservation SMS consent
must not automatically
be treated as consent
for marketing messages.

### Unsubscribe Requirements

Future communication workflows
must support applicable
opt-out requirements.

### Content Approval

Marketing content and offers
should follow restaurant
ownership approval procedures.

## Membership Data

**Status:** Planned; schema not approved

A future membership system
may require records for:

- Member identity.
- Enrollment date.
- Membership status.
- Contact preferences.
- Consent records.
- Reward eligibility.
- Communication history.

### Data Minimization

Collect only information
needed for approved
program functionality.

### Data Accuracy

Members should have
an appropriate process
for correcting information.

### Data Retention

Retention requirements
must be established
before collecting data.

### Existing Database

The website uses Supabase.

However, a dedicated
F&F FAM CLUB membership
schema must not be assumed
to exist without verification.

## Administrative Management

**Status:** Planned

A future manager interface
may allow authorized staff to:

- Update program information.
- Review membership statistics.
- Manage approved promotions.
- Review enrollment activity.
- Manage member status.
- Review communication settings.

### Authorization

Administrative capabilities
must use the established
manager authorization system.

Existing helper:

    src/lib/auth/require-manager.ts

### Sensitive Information

Member information must not
be exposed to unauthorized users.

### Administrative Auditability

The project should evaluate
change tracking for sensitive
membership operations.

### Scope Approval

Manager permissions must
be defined before
administrative implementation.

## Potential Integrations

**Status:** Under Evaluation

### Toast POS

Potential future integration
could support:

- Purchase-linked rewards.
- Member identification.
- Eligible transaction tracking.
- Reward redemption.

Feasibility depends on
Toast API capabilities
and approved access.

### Email or SMS Services

External communication
services may support
member notifications.

Provider selection requires
cost and compliance review.

### Existing Loyalty Platform

An existing external
loyalty provider may be
retained or integrated.

The current website
dependencies require verification.

### SPECIALS

Future coordination may
allow approved specials
to be promoted to members.

This does not require
automatic discount eligibility
unless explicitly approved.

## Privacy and Consent

The program must protect
customer information.

### Consent Separation

Reservation communications
and marketing communications
serve different purposes.

Consent for one purpose
must not automatically
authorize the other.

### Access Control

Only authorized personnel
should access protected
membership information.

### Secure Storage

Sensitive information must
be stored and processed
through approved systems.

### Third-Party Services

Any external platform
must be evaluated for:

- Data handling.
- Security practices.
- Consent support.
- Integration requirements.
- Operational costs.

### Policy Documentation

Privacy disclosures must
accurately describe
the approved program.

## Development Requirements

Before expanding the program,
the project should complete
the following work.

### Business Requirements

1. Define the program's purpose.
2. Confirm eligibility rules.
3. Approve member benefits.
4. Approve promotional policies.
5. Define staff responsibilities.

### Technical Requirements

1. Inspect the current component.
2. Identify existing integrations.
3. Confirm data requirements.
4. Evaluate platform options.
5. Design the membership model.
6. Define manager permissions.
7. Plan security controls.

### Operational Requirements

1. Define enrollment support.
2. Establish customer assistance procedures.
3. Define unsubscribe handling.
4. Approve communication workflows.
5. Establish reporting needs.

### Release Requirements

Implementation should proceed
only after business rules,
technical requirements,
and compliance obligations
are approved.

## Testing and Verification

### Existing Website

- Verify the F&F FAM CLUB section.
- Verify mobile presentation.
- Verify desktop presentation.
- Verify all customer actions.
- Verify external destinations.
- Verify accessible controls.

### Enrollment

If enrollment is implemented:

- Validate required fields.
- Verify consent collection.
- Prevent duplicate or invalid records.
- Verify enrollment confirmation.
- Test failure recovery.

### Membership Management

If management is implemented:

- Verify manager authorization.
- Verify membership status changes.
- Verify protected data access.
- Verify administrative error handling.

### Communications

If communications are implemented:

- Verify approved consent.
- Verify unsubscribe behavior.
- Verify message content.
- Verify delivery handling.
- Verify communication records.

### Rewards

If rewards are implemented:

- Verify eligibility.
- Verify earning rules.
- Verify redemption rules.
- Verify expiration.
- Verify pricing consistency.

## Implementation Status

| Capability | Status |
|---|---|
| Public F&F FAM CLUB presentation | Implemented |
| Current enrollment destination | Verification pending |
| Existing external loyalty integration | Verification pending |
| Native member enrollment | Planned; requirements pending |
| Membership database | Not verified |
| Member profile management | Planned |
| Reward rules | Under Evaluation |
| Points-based loyalty | Under Evaluation |
| Member promotions | Planned; approval dependent |
| Promotional communications | Planned; approval dependent |
| Manager administration | Planned |
| Toast-linked loyalty | Under Evaluation |
| Privacy and consent model | Requirements pending |
| End-to-end membership testing | Pending future implementation |

## Related Documentation

- [F&F FAM CLUB Overview](README.md)
- [Member Experience](member-experience.md)
- [Admin Management](admin-management.md)
- [Website Overview](../README.md)
- [Homepage](../homepage.md)
- [SPECIALS](../specials/README.md)
- [Admin Dashboard](../../04-admin-dashboard/README.md)
- [Authentication](../../05-authentication/README.md)
- [Database & Storage](../../06-database/README.md)
- [Toast POS Integration](../../10-toast-pos-integration/README.md)
- [Master Documentation Index](../../README.md)

---

[Back to F&F FAM CLUB Overview](README.md)
