# OPERATIONS — Manager Guide

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Audience:** Authorized Restaurant Managers and Administrative Staff

**Implementation Status:** Manager authentication, dashboard access, and Menu Management implemented; additional management modules remain planned or under evaluation

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Manager Responsibilities](#manager-responsibilities)
3. [Current Administrative Capabilities](#current-administrative-capabilities)
4. [Accessing the Admin Dashboard](#accessing-the-admin-dashboard)
5. [Manager Accounts and Permissions](#manager-accounts-and-permissions)
6. [Dashboard Navigation](#dashboard-navigation)
7. [Daily Opening Checklist](#daily-opening-checklist)
8. [Reservation Request Handling](#reservation-request-handling)
9. [Reservation Confirmation Procedures](#reservation-confirmation-procedures)
10. [Reservation Exceptions](#reservation-exceptions)
11. [Menu Management Overview](#menu-management-overview)
12. [Adding Menu Items](#adding-menu-items)
13. [Editing Menu Items](#editing-menu-items)
14. [Menu Pricing and Modifiers](#menu-pricing-and-modifiers)
15. [Menu Images](#menu-images)
16. [Menu Categories and Subcategories](#menu-categories-and-subcategories)
17. [SPECIALS Management](#specials-management)
18. [FAM CLUB Management](#fam-club-management)
19. [GALLERY Management](#gallery-management)
20. [MERCH Management](#merch-management)
21. [Website Content and Presentation](#website-content-and-presentation)
22. [Manager Account Security](#manager-account-security)
23. [Troubleshooting Common Issues](#troubleshooting-common-issues)
24. [Incident Reporting and Escalation](#incident-reporting-and-escalation)
25. [Daily Closing Checklist](#daily-closing-checklist)
26. [Weekly and Monthly Maintenance](#weekly-and-monthly-maintenance)
27. [Manager Training and Onboarding](#manager-training-and-onboarding)
28. [Operational Checklists](#operational-checklists)
29. [Implementation Status](#implementation-status)
30. [Related Documentation](#related-documentation)

---

## Purpose

This guide explains how authorized managers should operate and maintain the Fin & Feathers Las Vegas website.

The website supports restaurant guests and provides administrative functionality for approved staff.

Managers are responsible for keeping available restaurant information accurate and responding to operational issues.

This guide covers:

- Manager access.
- Dashboard navigation.
- Reservation requests.
- Reservation confirmation.
- Menu administration.
- Menu images.
- Menu pricing.
- Operational checks.
- Security.
- Troubleshooting.
- Incident escalation.
- Future management features.

The guide distinguishes current functionality from planned capabilities.

It does not authorize managers to bypass application security or modify production infrastructure without appropriate technical approval.

## Manager Responsibilities

Managers help maintain accurate and reliable restaurant information.

### Guest Experience

Ensure the website provides useful and current information.

### Reservations

Review incoming requests and communicate confirmations accurately.

### Menu Accuracy

Keep menu item names, descriptions, prices, and availability correct.

### Image Quality

Use approved, relevant food photography.

### Operational Awareness

Identify website issues that affect guests.

### Security

Protect administrative accounts and guest information.

### Escalation

Report technical problems through the approved support process.

### Change Review

Verify the public website after important administrative changes.

### Documentation

Follow established procedures and report gaps.

### Important Principle

A manager's access level determines which administrative actions are permitted.

## Current Administrative Capabilities

**Status:** Core manager access and menu administration implemented

### Available Components

The project includes:

- Administrative login.
- Protected dashboard.
- Manager authorization.
- Menu Management.
- Reservation-related dashboard functionality.

### Admin Route

    /admin

### Login Route

    /admin/login

### Menu Route

    /admin/menu

### Manager Authorization

The application uses:

    requireManager()

### Staff Role Requirement

    role = manager
    is_active = true

### Planned Features

Advanced SPECIALS, FAM CLUB, GALLERY, and MERCH administration remain future development work.

### Verification Boundary

Individual dashboard controls and reservation administration behavior should be confirmed against the current deployed application.

## Accessing the Admin Dashboard

Authorized managers can access the administrative interface.

### Step 1 — Open the Website

Visit:

    https://finandfeatherslv.live

### Step 2 — Open Admin Login

Navigate to:

    https://finandfeatherslv.live/admin/login

### Step 3 — Enter Credentials

Use the approved manager account.

### Step 4 — Authenticate

Complete the configured sign-in process.

### Step 5 — Open Dashboard

After successful authorization, access:

    /admin

### Unauthorized Access

Users without the required active manager role are not authorized to use protected manager functions.

### Login Problems

Do not share credentials or attempt to bypass authorization.

### Support

Report unresolved account problems to the designated technical administrator.

## Manager Accounts and Permissions

Manager access uses Supabase authentication and application authorization.

### Identity Provider

    Supabase Auth

### Staff Roles

    staff_roles

### Required Role

    manager

### Required Account State

    is_active = true

### Authentication

Confirms the identity of the signed-in user.

### Authorization

Determines whether the user has manager privileges.

### Account Invitations

Manager accounts may be created through the approved invitation process.

### Account Recovery

Password recovery must follow the approved workflow.

### Access Removal

Former staff members should have access revoked promptly.

### Permission Changes

Only authorized administrators should modify staff roles.

### Security Principle

Successful login alone does not establish manager authorization.

## Dashboard Navigation

The administrative dashboard provides access to supported management functions.

### Main Dashboard

    /admin

### Menu Management

    /admin/menu

### Reservations

The dashboard includes reservation-related functionality.

### Feature Availability

Some management modules are planned rather than deployed.

### Navigation

Use the application's provided navigation controls.

### Browser Back

Browser navigation should not be relied upon to undo saved changes.

### Saved Changes

Verify whether an operation completed successfully before leaving the page.

### Access Errors

A permission error may indicate an account or authorization problem.

### Verification

The exact dashboard layout and available controls should be confirmed during manager onboarding.

## Daily Opening Checklist

Managers should review the website at the start of restaurant operations.

### Website Availability

Open the production website.

### Homepage

Confirm that the homepage loads correctly.

### Navigation

Check the primary navigation.

### Menu

Verify that current menu information is visible.

### Reservations

Check for outstanding reservation requests.

### Messaging

Review any reported SMS processing problems.

### Promotions

Confirm that visible promotional content remains accurate.

### Media

Check important images and videos.

### Administrative Access

Confirm that the authorized manager account works.

### Issues

Record and escalate problems affecting guests.

### Completion

Use the approved operational checklist to record the review.

## Reservation Request Handling

The website uses an SMS-based reservation request process.

### Guest Action

The guest completes the reservation form.

### SMS Preparation

The website prepares a text message.

### Guest Send

The guest must send the message.

### Restaurant Receipt

The message is received through the configured messaging workflow.

### Staff Review

Staff reviews the requested reservation details.

### Confirmation

The request must be confirmed through the approved staff process.

### Important Distinction

An SMS request is not an automatically confirmed reservation.

### Manager Responsibility

Ensure requests receive appropriate operational attention.

### Technical Problems

Report missing or malformed reservation information.

### Privacy

Handle guest contact information appropriately.

## Reservation Confirmation Procedures

Reservation confirmation remains a staff responsibility.

### Step 1 — Review Request

Read the guest's requested details.

### Step 2 — Verify Guest Information

Confirm the name and relevant contact details.

### Step 3 — Verify Date

Check the requested reservation date.

### Step 4 — Verify Time

Check the requested reservation time.

### Step 5 — Verify Party Size

Confirm the number of guests.

### Step 6 — Review Availability

Use the approved restaurant reservation process.

### Step 7 — Confirm or Propose Alternative

Communicate the appropriate outcome.

### Step 8 — Use Yelp Reservations

Complete the established confirmation process through Yelp Reservations as required.

### Step 9 — Communicate Clearly

Ensure the guest understands whether the reservation is confirmed.

### Step 10 — Avoid Duplicate Bookings

Check for repeated messages before creating another reservation.

## Reservation Exceptions

Some requests require additional review.

### Requested Time Unavailable

Offer an appropriate alternative when possible.

### Incomplete Message

Request the missing information.

### Invalid Date

Clarify the intended reservation date.

### Invalid Party Size

Follow restaurant policy for the requested group.

### Duplicate Request

Determine whether the guest has already submitted the same request.

### Delayed Message

Review the request carefully before confirming availability.

### Special Occasion

Consider the guest's selected occasion during staff handling.

### Technical Failure

Escalate missing or incorrectly parsed messages.

### Unconfirmed Request

Never describe an unconfirmed request as a completed booking.

### Guest Privacy

Avoid sharing reservation details with unauthorized parties.

## Menu Management Overview

**Status:** Implemented

The administrative menu interface supports menu management operations.

### Admin Route

    /admin/menu

### Primary Responsibilities

Managers may maintain supported menu data.

### Menu Items

Review names, descriptions, prices, and associated settings.

### Images

Manage approved menu photography.

### Availability

Use the controls provided by the current implementation.

### Specials

The existing menu editor includes a $5 specials toggle.

### Advanced Scheduling

Day-specific SPECIALS scheduling is planned separately.

### Data Accuracy

Changes should match approved restaurant pricing and offerings.

### Public Verification

Check the public menu after significant updates.

## Adding Menu Items

Managers should use the approved menu editor.

### Step 1 — Open Menu Management

Navigate to:

    /admin/menu

### Step 2 — Select the Add Action

Use the available interface control.

### Step 3 — Enter Name

Use the approved menu item name.

### Step 4 — Enter Description

Provide an accurate guest-facing description.

### Step 5 — Select Category

Use the categories and subcategories supported by the menu data.

### Step 6 — Set Price

Enter the approved price or applicable market-price designation.

### Step 7 — Configure Options

Use supported modifier controls where available.

### Step 8 — Add Image

Upload approved photography when appropriate.

### Step 9 — Save

Complete the available save action.

### Step 10 — Verify

Confirm the item appears correctly on the public menu.

## Editing Menu Items

Menu edits should preserve accuracy and consistency.

### Step 1 — Find the Item

Open the existing item in Menu Management.

### Step 2 — Review Current Data

Inspect its name, description, price, category, and image.

### Step 3 — Make Approved Changes

Update only the intended fields.

### Step 4 — Check Modifiers

Confirm associated options remain correct.

### Step 5 — Check Special Status

Verify any supported special-related settings.

### Step 6 — Save

Use the available save action.

### Step 7 — Verify

Check the updated item.

### Step 8 — Review Public Display

Confirm the guest-facing menu is correct.

### Error Handling

If saving fails, do not assume the changes were applied.

### Escalation

Report repeated save failures.

## Menu Pricing and Modifiers

Menu pricing must reflect approved restaurant offerings.

### Standard Price

Use the approved base price.

### Market Price

Use the supported market-price designation where applicable.

### Modifiers

Some items support optional selections or additional charges.

### Protein Add-Ons

Certain menu items support additional protein choices.

### Sauce Options

Some wings and tenders include sauce selections.

### Additional Charges

Confirm that modifier prices are accurate.

### Specials

The existing menu editor includes a $5 specials toggle.

### Price Verification

Check guest-facing prices after updates.

### Operational Approval

Do not introduce unapproved prices.

### Toast POS

Direct Toast POS synchronization remains under evaluation.

### Important Boundary

Updating the website menu does not establish that Toast POS pricing changed.

## Menu Images

Menu photography is part of the website media system.

### Storage Provider

    Supabase Storage

### Established Bucket

    website-media

### Established Prefix

    menu/

### Image Format

The menu upload workflow uses WebP.

### Aspect Ratio

    4:3

### Image Quality

Use clear, relevant food photography.

### Accuracy

Images should represent the intended dish.

### Replacement

Verify that the new image displays correctly.

### COCKTAILS

No images are required for COCKTAILS.

### Troubleshooting

If an image does not load, report the affected item and image.

### Storage Safety

Managers should not directly delete unrelated media objects.

## Menu Categories and Subcategories

The menu structure must follow the approved source spreadsheet.

### Source of Truth

Use only categories and subcategories established in the menu spreadsheet.

### Category Selection

Choose the correct existing category for each item.

### Subcategories

Use supported subcategories when applicable.

### Consistency

Do not create arbitrary categories without approval.

### HOOKAH

Do not add a HOOKAH category filter.

### COCKTAILS

Do not require cocktail images.

### Reclassification

Review category changes before saving.

### Guest Experience

Correct categories help visitors find menu items.

### Verification

Check the public menu after category-related updates.

## SPECIALS Management

**Status:** Advanced management planned

SPECIALS will support selected menu items offered on particular days.

### Example

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

### Existing Menu Editor

The current editor includes a $5 specials toggle.

### Future Administration

Managers may eventually:

- Select eligible menu items.
- Assign special prices.
- Schedule days.
- Enable or disable specials.
- Review active promotions.

### Scheduling

Future functionality may control when specials appear.

### Accuracy

Special prices and availability must be approved.

### Public Display

Only active, approved specials should appear.

### Implementation Boundary

Do not assume the advanced scheduling interface is currently available.

## FAM CLUB Management

**Status:** Planned

FAM CLUB is the restaurant's loyalty and membership initiative.

### Existing Website

The public website includes a loyalty-program component.

### Future Administration

Managers may eventually:

- Review member information.
- Manage approved program content.
- Review rewards.
- Update approved offers.
- Monitor participation.

### Privacy

Member information requires appropriate access restrictions.

### Eligibility

Program rules must be approved before enforcement.

### Rewards

Do not promise rewards that are not supported by the implemented program.

### Access

Future administrative controls must be manager-protected.

### Implementation Boundary

A complete manager-facing FAM CLUB administration system is not established as deployed.

## GALLERY Management

**Status:** Public gallery implemented; administration planned

### Existing Website

The gallery displays six established images.

### Public Features

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

### Image Quality

Use approved restaurant photography.

### Privacy

Avoid publishing images without appropriate rights or permissions.

### Accessibility

Provide meaningful alternative text where supported.

### Storage

Future gallery uploads may use Supabase Storage.

### Implementation Boundary

Manager-driven gallery editing is not established as deployed.

## MERCH Management

**Status:** External storefront implemented; native commerce under evaluation

### Current Website

The website includes a merchandise promotional thumbnail.

### Existing Experience

The thumbnail opens an external merchandise storefront in a modal iframe.

### External Provider

Product catalog, inventory, checkout, and fulfillment may be managed by the external provider.

### Future Native Commerce

The project is evaluating an integrated merchandise system.

### Potential Manager Features

- Product creation.
- Product editing.
- Inventory tracking.
- Product images.
- Order review.
- Fulfillment management.

### Payments

Payment processing requires an approved provider and security model.

### Current Boundary

The website does not have an established native merchandise checkout.

### Manager Responsibility

Use the current approved storefront management process until new functionality is implemented.

## Website Content and Presentation

Managers should monitor guest-facing website presentation.

### Branding

Confirm the restaurant logo displays correctly.

### Slogan

The homepage includes:

    ELEVATED DINING MEETS SOUTHERN SOUL

### Navigation

Verify menu, reservations, ordering, and directions links.

### Virtual Tour

Confirm the virtual tour opens.

### Ribeye Video

Confirm the video plays.

### Gallery

Check image navigation.

### Social Links

Verify the intended social destinations.

### MERCH

Check the storefront modal.

### Animations

Report visual issues affecting usability.

### Technical Changes

Code-level presentation changes require the approved development workflow.

## Manager Account Security

Administrative accounts must be protected.

### Individual Accounts

Use the assigned manager account.

### Passwords

Do not share passwords.

### Session Security

Sign out on shared devices.

### Unauthorized Access

Report unexpected access attempts.

### Account Recovery

Use the approved password recovery process.

### Invitations

Manager invitations must follow authorized procedures.

### Role Changes

Do not modify permissions without approval.

### Guest Information

Access reservation details only for legitimate business purposes.

### Suspicious Activity

Report unusual account behavior.

### Credential Exposure

Escalate suspected credential compromise immediately.

## Troubleshooting Common Issues

### Cannot Sign In

Verify credentials and follow the approved recovery process.

### Unauthorized Message

Confirm the account has an active manager role.

### Menu Item Not Saving

Check required fields and report persistent failures.

### Incorrect Price

Review the saved item and public display.

### Image Not Loading

Verify the affected item and report the broken media.

### Reservation SMS Not Received

Review the approved Twilio troubleshooting procedure.

### Duplicate Reservation Request

Check whether the request has already been handled.

### Gallery Problem

Report the affected image or control.

### Video Problem

Record the browser, device, and observed behavior.

### Website Unavailable

Escalate promptly.

### Security Concern

Do not attempt an unauthorized workaround.

## Incident Reporting and Escalation

Managers should report issues clearly.

### Report Contents

Include:

- Date and time.
- Affected page or feature.
- Description of the problem.
- Steps that led to the issue.
- Expected behavior.
- Actual behavior.
- Device or browser when relevant.
- Screenshot when appropriate.
- Business impact.

### Sensitive Information

Do not include passwords, tokens, or unnecessary guest personal information.

### Priority

Issues affecting reservations, security, or site availability require prompt attention.

### Technical Escalation

Contact the designated technical administrator.

### Temporary Workaround

Use only approved operational alternatives.

### Resolution

Verify the affected functionality after a reported fix.

### Recordkeeping

Document significant incidents.

## Daily Closing Checklist

At the end of operations, managers should review outstanding website-related responsibilities.

### Reservations

Check unresolved reservation requests.

### Guest Communication

Ensure outstanding confirmations are addressed appropriately.

### Menu Accuracy

Confirm changes made during the day remain correct.

### Specials

Review promotional content relevant to the next operating day.

### Media

Report newly observed broken images or video issues.

### Technical Problems

Document unresolved issues.

### Security

Sign out of shared administrative devices.

### Escalation

Pass unresolved operational issues to the appropriate person.

### Completion

Record checklist completion through the approved process.

## Weekly and Monthly Maintenance

Routine review helps maintain accuracy.

### Weekly — Menu

Review prices, descriptions, and availability.

### Weekly — Reservations

Review recurring reservation workflow problems.

### Weekly — Media

Check important public images and video.

### Weekly — Promotions

Review active and upcoming promotional information.

### Weekly — Links

Check primary external links.

### Monthly — Accounts

Review active manager access with the authorized administrator.

### Monthly — Documentation

Report outdated operating instructions.

### Monthly — Security

Review unresolved access or privacy concerns.

### Monthly — Performance

Report recurring loading or usability problems.

### Future Features

Expand maintenance procedures when new management modules are implemented.

## Manager Training and Onboarding

New managers should complete structured onboarding.

### Account Setup

Receive an approved account invitation.

### Authentication

Complete sign-in and any required recovery setup.

### Dashboard Orientation

Review available navigation.

### Menu Training

Practice supported item management in an approved environment.

### Pricing

Review the approval process for price changes.

### Images

Learn the menu image standards.

### Reservations

Understand SMS requests and staff confirmation.

### Privacy

Review guest information handling.

### Troubleshooting

Learn how to report technical issues.

### Planned Features

Understand which administrative capabilities are not yet available.

### Verification

An authorized administrator should confirm readiness before independent use.

## Operational Checklists

### Opening

- [ ] Website loads.
- [ ] Navigation works.
- [ ] Menu is accurate.
- [ ] Important media loads.
- [ ] Reservation requests reviewed.
- [ ] Manager access works.
- [ ] Issues recorded.

### Menu Update

- [ ] Correct item selected.
- [ ] Name and description accurate.
- [ ] Category correct.
- [ ] Price approved.
- [ ] Modifiers accurate.
- [ ] Image appropriate.
- [ ] Changes saved.
- [ ] Public display verified.

### Reservation Handling

- [ ] Request details reviewed.
- [ ] Date and time verified.
- [ ] Party size verified.
- [ ] Availability checked.
- [ ] Confirmation or alternative communicated.
- [ ] Yelp Reservations workflow completed as applicable.
- [ ] Duplicate requests checked.

### Closing

- [ ] Outstanding requests reviewed.
- [ ] Guest communication addressed.
- [ ] Menu changes checked.
- [ ] Issues escalated.
- [ ] Shared sessions signed out.

## Implementation Status

| Capability | Status |
|---|---|
| Manager login | Implemented |
| Manager authorization | Implemented |
| Protected dashboard | Implemented |
| Menu Management | Implemented |
| Menu item creation and editing | Implemented |
| Menu image upload | Implemented |
| Menu WebP processing | Implemented |
| Menu 4:3 image output | Implemented |
| $5 specials toggle | Implemented |
| Reservation SMS handoff | Implemented |
| Reservation-related dashboard functionality | Implemented; exact controls require verification |
| Twilio incoming workflow | Established |
| Reservation parser | Deployed |
| Live SMS end-to-end acceptance | Pending |
| Advanced SPECIALS scheduling | Planned |
| FAM CLUB administration | Planned |
| GALLERY administration | Planned |
| Native MERCH administration | Under Evaluation |
| Toast POS synchronization | Under Evaluation |
| Manager training program | Planned operational process |
| Formal opening and closing records | Planned operational process |
| Manager-facing documentation viewer | Planned |
| Comprehensive manager acceptance testing | Verification pending |

## Related Documentation

- [Operations Overview](README.md)
- [Testing Checklists](testing-checklists.md)
- [Troubleshooting](troubleshooting.md)
- [Changelog](changelog.md)
- [Admin Dashboard Overview](../04-admin-dashboard/dashboard-overview.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Menu Management](../04-admin-dashboard/menu-management.md)
- [Reservation Management](../04-admin-dashboard/reservation-management.md)
- [SPECIALS Administration](../04-admin-dashboard/specials-management.md)
- [FAM CLUB Administration](../04-admin-dashboard/fam-club-management.md)
- [GALLERY Administration](../04-admin-dashboard/gallery-management.md)
- [MERCH Administration](../04-admin-dashboard/merch-management.md)
- [Manager Invitations](../05-authentication/manager-invitations.md)
- [Password Recovery](../05-authentication/password-recovery.md)
- [Reservation Workflow](../03-reservations/reservation-workflow.md)
- [Twilio Integration](../03-reservations/twilio-integration.md)
- [Menu Editor Guide](../09-menu-management/menu-editor-guide.md)
- [Menu Images](../09-menu-management/menu-images.md)
- [Vercel Deployment](../07-deployment/vercel-deployment.md)
- [Rollback Procedures](../07-deployment/rollback-procedures.md)
- [Master Documentation Index](../README.md)

---

[Back to Operations Overview](README.md)
