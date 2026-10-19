# F&F FAM CLUB — Member Experience

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Public presentation implemented; member experience expansion planned

**Feature:** F&F FAM CLUB

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Experience Overview](#experience-overview)
3. [Current Public Experience](#current-public-experience)
4. [Proposed Member Journey](#proposed-member-journey)
5. [Program Discovery](#program-discovery)
6. [Enrollment Experience](#enrollment-experience)
7. [Enrollment Confirmation](#enrollment-confirmation)
8. [Member Identity and Access](#member-identity-and-access)
9. [Member Profile](#member-profile)
10. [Rewards and Benefits Experience](#rewards-and-benefits-experience)
11. [Promotions and SPECIALS](#promotions-and-specials)
12. [Member Communications](#member-communications)
13. [Preferences and Unsubscribe](#preferences-and-unsubscribe)
14. [Privacy and Data Protection](#privacy-and-data-protection)
15. [Responsive Design and Accessibility](#responsive-design-and-accessibility)
16. [Error Handling and Support](#error-handling-and-support)
17. [Testing and Verification](#testing-and-verification)
18. [Implementation Status](#implementation-status)
19. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the customer-facing
experience for the F&F FAM CLUB program.

It distinguishes between the existing
website presentation and potential future
membership functionality.

The document covers:

- Program discovery.
- Enrollment.
- Membership confirmation.
- Member identification.
- Account and profile management.
- Rewards and benefits.
- Promotional communications.
- Consent and privacy.
- Accessibility and support.

Future features require business approval,
technical design, and implementation
before they can be considered operational.

## Experience Overview

F&F FAM CLUB is intended to provide
an ongoing relationship between
Fin & Feathers Las Vegas and its customers.

The experience should be:

- Easy to discover.
- Easy to understand.
- Simple to join.
- Transparent about benefits.
- Respectful of communication preferences.
- Accessible across devices.
- Consistent with restaurant branding.

The program must not promise
unapproved discounts, rewards,
or membership privileges.

## Current Public Experience

**Status:** Implemented; source verification pending

The website includes an established
loyalty program presentation component.

Previously established component:

    loyalty-program

The exact source file, displayed content,
and customer interactions must be verified.

### Current Experience Review

The implementation review should identify:

- Where the F&F FAM CLUB section appears.
- What program information is displayed.
- Whether an enrollment action exists.
- Whether the action opens an external service.
- Whether customer information is collected.
- Whether confirmation messaging exists.
- How the section behaves on mobile.
- How the section behaves on desktop.

### Existing Scope Limitation

The presence of a loyalty program section
does not establish that the website currently
supports native membership registration,
member accounts, reward balances,
or reward redemption.

These capabilities remain unverified
or planned until confirmed.

## Proposed Member Journey

**Status:** Planned

A future customer journey may follow
the sequence below.

1. Customer discovers F&F FAM CLUB.
2. Customer reviews program information.
3. Customer selects an enrollment action.
4. Customer reviews eligibility and terms.
5. Customer provides required information.
6. Customer selects communication preferences.
7. Customer submits the enrollment request.
8. The system validates the information.
9. Enrollment is confirmed.
10. Customer receives approved
    membership information.
11. Customer accesses available benefits.
12. Customer manages preferences
    or requests assistance.

This sequence is conceptual.

The final journey depends on
the selected membership platform
and approved business requirements.

## Program Discovery

The public website should make
F&F FAM CLUB information
easy to locate.

### Homepage Presentation

The established homepage includes
a loyalty program section.

### Program Messaging

Customer-facing messaging should explain:

- What F&F FAM CLUB is.
- Who may participate.
- How to join.
- What benefits are available.
- Whether participation is free.
- Whether restrictions apply.
- How communications are managed.

Only approved statements
should be published.

### Primary Action

A future enrollment action
should clearly identify
what happens when selected.

For example, the interface
should distinguish between:

- Viewing program information.
- Opening an external enrollment page.
- Beginning an enrollment form.
- Accessing an existing account.

The exact action label
requires approval.

## Enrollment Experience

**Status:** Planned; requirements pending

A future enrollment process
may be provided by the website
or an approved external platform.

### Enrollment Requirements

Before development, the restaurant
must approve:

- Eligibility criteria.
- Required customer information.
- Age requirements, if applicable.
- Consent language.
- Membership terms.
- Verification requirements.
- Duplicate account handling.

### Potential Enrollment Fields

Possible fields include:

- First name.
- Last name.
- Email address.
- Mobile phone number.
- Communication preferences.

These are proposed fields,
not an approved final form.

### Data Minimization

Enrollment should request
only the information necessary
for approved program functionality.

### Form Validation

A future form should validate:

- Required fields.
- Input formats.
- Consent selections.
- Duplicate submissions.
- Invalid or incomplete entries.

### Enrollment Security

Customer information should
be transmitted and stored
through approved secure systems.

## Enrollment Confirmation

**Status:** Planned

After successful enrollment,
the customer should receive
clear confirmation.

### Confirmation Content

An approved confirmation may include:

- Enrollment status.
- Program name.
- Next steps.
- How to access membership information.
- How to update communication preferences.
- Where to obtain support.

### Confirmation Channels

Potential channels include:

- On-screen confirmation.
- Email.
- SMS.

The selected channels depend
on approved consent and
service configuration.

### Important Distinction

Displaying an enrollment form
does not prove that enrollment
was completed.

Confirmation should reflect
the actual system result.

### Failure Handling

If enrollment fails,
the interface should explain
the problem without falsely
indicating success.

## Member Identity and Access

**Status:** Under Evaluation

A future program may require
a way to identify members.

Potential approaches include:

- Email-based identification.
- Phone-based identification.
- Membership number.
- External loyalty platform account.

### Native Account Option

If the website eventually
supports native member accounts,
the project must define:

- Registration.
- Authentication.
- Session management.
- Account recovery.
- Authorization.
- Account deletion or deactivation.

### External Platform Option

If an external platform is used,
the customer experience should
clearly explain the transition.

### Administrative Separation

Customer membership access
must remain separate from
manager administrative access.

The existence of Supabase manager
authentication does not imply
that customer accounts already exist.

## Member Profile

**Status:** Planned

A future member profile
may allow customers to review
or update approved information.

Potential capabilities include:

- Viewing contact details.
- Updating contact information.
- Managing communication preferences.
- Viewing membership status.
- Reviewing eligible benefits.
- Requesting account assistance.

### Profile Security

Members must not be able
to access another member's
private information.

### Profile Accuracy

Updates should be validated
before being saved.

### Account Closure

The project should establish
an approved process for
membership deactivation
or deletion requests.

## Rewards and Benefits Experience

**Status:** Under Evaluation

Potential future benefits include:

- Member-only offers.
- Birthday promotions.
- Event announcements.
- Early access to promotions.
- Restaurant loyalty rewards.

These are possible features,
not approved program commitments.

### Benefit Presentation

Approved benefits should display:

- Benefit name.
- Description.
- Eligibility requirements.
- Validity period.
- Redemption instructions.
- Restrictions.

### Reward Balances

A points or balance system
must not be assumed to exist.

If implemented, balances
must reflect verified records.

### Redemption

Reward redemption requires
approved business rules
and technical support.

### POS Coordination

Any purchase-linked reward
or redemption feature
requires evaluation of
the selected POS integration.

## Promotions and SPECIALS

**Status:** Planned; approval dependent

F&F FAM CLUB may eventually
promote restaurant specials.

### Potential Promotion Types

- Daily specials.
- Weekly specials.
- Limited-time offers.
- Member-only promotions.
- Event-related promotions.

### Pricing Accuracy

Promotional content must
reflect approved prices.

### Promotion Eligibility

A promotion being visible
to a member does not
automatically establish
eligibility for a discount.

### Scheduling

Promotions should follow
approved start and end dates.

### SPECIALS Integration

Future integration may use
the restaurant's planned
SPECIALS scheduling system.

The existing menu editor's
$5 special flag is separate
from that proposed system.

## Member Communications

**Status:** Planned; consent dependent

Future member communications
may include:

- Program announcements.
- Restaurant news.
- Approved promotions.
- Event notifications.
- Membership updates.

### Communication Channels

Potential channels include:

- Email.
- SMS.
- Approved external platforms.

### Message Content

Communications should be:

- Relevant.
- Accurate.
- Approved.
- Clearly branded.
- Consistent with customer preferences.

### Consent Separation

Reservation-related SMS consent
must not automatically authorize
marketing communications.

### Delivery Status

A message being prepared
does not establish that
it was delivered.

The system should distinguish
between submission, acceptance,
delivery, and failure
where supported.

## Preferences and Unsubscribe

**Status:** Planned

Members should have an
appropriate way to manage
communication preferences.

### Preference Management

Potential settings include:

- Email promotions.
- SMS promotions.
- Event notifications.
- Program announcements.

The final settings depend
on approved program design.

### Unsubscribe

Marketing communications
must support applicable
opt-out requirements.

### Consent Records

The system should retain
appropriate records of
consent and preference changes.

### Membership Versus Marketing

Unsubscribing from promotional
messages should not automatically
be treated as cancellation
of membership unless
the approved program rules
explicitly require it.

## Privacy and Data Protection

Customer membership information
must be handled responsibly.

### Information Collection

Collect only approved
customer information.

### Purpose Limitation

Use information only
for disclosed and
authorized purposes.

### Access Restrictions

Protected membership data
must not be publicly accessible.

### Third-Party Services

External enrollment or
communication providers
must be evaluated for
data handling and security.

### Data Retention

Retention periods and
deletion procedures
require approval.

### Privacy Disclosures

The website's privacy information
must accurately describe
the implemented membership system.

## Responsive Design and Accessibility

The member experience should
follow the website's
mobile-first approach.

### Mobile Requirements

- Readable program information.
- Touch-friendly controls.
- Responsive enrollment forms.
- Clear confirmation messages.
- Accessible preference controls.

### Desktop Requirements

- Consistent navigation.
- Readable content.
- Accessible forms.
- Clear account actions.

### Accessibility Requirements

- Proper form labels.
- Keyboard navigation.
- Visible focus states.
- Accessible validation messages.
- Sufficient contrast.
- Appropriate heading structure.
- Screen-reader-compatible controls.

### Reduced Motion

Any animations must respect
reduced-motion preferences
where applicable.

## Error Handling and Support

The member experience should
handle errors clearly.

### Enrollment Errors

Potential conditions include:

- Missing information.
- Invalid contact information.
- Duplicate enrollment.
- Service unavailability.
- Consent validation failure.

### Account Errors

If accounts are implemented:

- Authentication failure.
- Expired sessions.
- Recovery problems.
- Unauthorized access.

### Reward Errors

If rewards are implemented:

- Ineligible benefit.
- Expired promotion.
- Unavailable reward.
- Redemption failure.

### Support

The restaurant must approve
how customers request help
with membership issues.

Support procedures should
avoid exposing private data.

## Testing and Verification

### Existing Presentation

- Locate the F&F FAM CLUB section.
- Verify displayed content.
- Verify customer actions.
- Verify external destinations.
- Test mobile layout.
- Test desktop layout.
- Test keyboard accessibility.

### Enrollment

If implemented:

- Verify required fields.
- Verify validation messages.
- Verify consent.
- Test duplicate submissions.
- Verify successful enrollment.
- Verify failure handling.

### Member Access

If implemented:

- Verify authentication.
- Verify account recovery.
- Verify session handling.
- Verify access restrictions.
- Verify account deactivation.

### Communications

If implemented:

- Verify communication consent.
- Verify preferences.
- Verify unsubscribe handling.
- Verify approved message content.
- Verify delivery reporting.

### Rewards

If implemented:

- Verify eligibility.
- Verify reward visibility.
- Verify expiration.
- Verify redemption.
- Verify pricing consistency.

### Privacy

- Verify protected data access.
- Verify third-party disclosures.
- Verify consent records.
- Verify deletion procedures
  when implemented.

## Implementation Status

| Capability | Status |
|---|---|
| Public loyalty presentation | Implemented |
| Program discovery on homepage | Implemented |
| Current enrollment destination | Verification pending |
| Native enrollment form | Planned |
| Enrollment confirmation | Planned |
| Native member accounts | Under Evaluation |
| Member profile | Planned |
| Member preference management | Planned |
| Approved rewards | Under Evaluation |
| Points and balances | Under Evaluation |
| Reward redemption | Under Evaluation |
| Member-specific SPECIALS | Planned; approval dependent |
| Promotional communications | Planned; consent dependent |
| Unsubscribe management | Planned |
| Membership privacy model | Requirements pending |
| End-to-end member experience testing | Pending future implementation |

## Related Documentation

- [F&F FAM CLUB Overview](README.md)
- [Program Overview](program-overview.md)
- [Admin Management](admin-management.md)
- [Website Overview](../README.md)
- [Homepage](../homepage.md)
- [SPECIALS](../specials/README.md)
- [Authentication](../../05-authentication/README.md)
- [Database & Storage](../../06-database/README.md)
- [Admin Dashboard](../../04-admin-dashboard/README.md)
- [Master Documentation Index](../../README.md)

---

[Back to F&F FAM CLUB Overview](README.md)
