# OPERATIONS — Testing Checklists

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Audience:** Developers, Technical Administrators, QA Reviewers, and Authorized Managers

**Implementation Status:** Testing procedures documented; comprehensive production acceptance testing pending

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Testing Objectives](#testing-objectives)
3. [Current Implementation](#current-implementation)
4. [Test Status Definitions](#test-status-definitions)
5. [Testing Environments](#testing-environments)
6. [Test Execution and Evidence](#test-execution-and-evidence)
7. [Pre-Test Preparation](#pre-test-preparation)
8. [Homepage Testing](#homepage-testing)
9. [Header and Navigation Testing](#header-and-navigation-testing)
10. [Responsive Design Testing](#responsive-design-testing)
11. [Animation and Accessibility Testing](#animation-and-accessibility-testing)
12. [Menu Display Testing](#menu-display-testing)
13. [Reservation Form Testing](#reservation-form-testing)
14. [SMS Handoff Testing](#sms-handoff-testing)
15. [Twilio Integration Testing](#twilio-integration-testing)
16. [Administrative Authentication Testing](#administrative-authentication-testing)
17. [Manager Authorization Testing](#manager-authorization-testing)
18. [Admin Dashboard Testing](#admin-dashboard-testing)
19. [Menu Management Testing](#menu-management-testing)
20. [Menu Image Testing](#menu-image-testing)
21. [Supabase Database and RLS Testing](#supabase-database-and-rls-testing)
22. [Supabase Storage Testing](#supabase-storage-testing)
23. [Gallery and Media Testing](#gallery-and-media-testing)
24. [MERCH and External Links Testing](#merch-and-external-links-testing)
25. [Performance and Reliability Testing](#performance-and-reliability-testing)
26. [Security and Privacy Testing](#security-and-privacy-testing)
27. [Build and Deployment Testing](#build-and-deployment-testing)
28. [Regression Testing](#regression-testing)
29. [Future Feature Testing](#future-feature-testing)
30. [Release Acceptance Checklist](#release-acceptance-checklist)
31. [Defect Reporting and Retesting](#defect-reporting-and-retesting)
32. [Implementation Roadmap](#implementation-roadmap)
33. [Implementation Status](#implementation-status)
34. [Related Documentation](#related-documentation)

---

## Purpose

This document provides structured testing checklists for the Fin & Feathers Las Vegas website.

Testing verifies that implemented features behave as intended and that changes do not introduce unexpected problems.

The website includes public restaurant functionality, protected administrative features, and integrations with external services.

Testing must therefore cover more than visual presentation.

This document addresses:

- Public website behavior.
- Responsive layouts.
- Navigation.
- Animations.
- Accessibility.
- Menu presentation.
- Reservation validation.
- SMS handoff.
- Twilio processing.
- Manager authentication.
- Authorization.
- Menu administration.
- Database security.
- Media storage.
- Deployment.
- Regression.
- Future features.

The checklists are designed for repeatable execution.

They do not establish that tests have been completed merely because the procedures are documented.

## Testing Objectives

Testing should identify defects before they affect guests or restaurant operations.

### Functional Correctness

Verify that controls perform their intended actions.

### Data Accuracy

Confirm that menu and reservation information remains correct.

### Security

Verify that protected features reject unauthorized access.

### Reliability

Check that common workflows operate consistently.

### Usability

Confirm that guests can understand and complete intended actions.

### Mobile Compatibility

Verify the mobile-first experience.

### Accessibility

Check keyboard access, readable content, and reduced-motion behavior.

### Integration Integrity

Confirm that connected services exchange information correctly.

### Deployment Confidence

Ensure that production releases pass appropriate acceptance checks.

### Traceability

Record test outcomes and unresolved defects.

## Current Implementation

**Status:** Core application features implemented; full acceptance testing pending

### Public Website

The application includes:

- Homepage.
- Responsive navigation.
- Menu.
- Reservation request form.
- Virtual tour.
- Ribeye video.
- Image gallery.
- Social links.
- MERCH storefront link.
- Loyalty-program presentation.

### Administration

The application includes:

- Manager authentication.
- Protected dashboard.
- Menu Management.
- Menu image uploads.

### Integrations

The application uses:

- Supabase Auth.
- Supabase PostgreSQL.
- Supabase Storage.
- Twilio.
- Vercel.

### Reservation Processing

A Twilio Studio workflow and reservation parser are established.

### Verification Boundary

Complete live reservation messaging acceptance remains pending.

### Planned Features

Advanced SPECIALS, FAM CLUB, GALLERY administration, and native MERCH commerce are not established as fully deployed.

## Test Status Definitions

Each executed test must have a recorded outcome.

### PASS

The test was executed and met its acceptance criteria.

### FAIL

The test was executed and did not meet its acceptance criteria.

### BLOCKED

The test could not be completed because a prerequisite was unavailable.

### NOT APPLICABLE

The test does not apply to the tested feature or release.

### NOT RUN

The test has not been executed.

### Evidence

A PASS should be supported by an actual observation.

### Blocked Tests

Record the reason the test could not proceed.

### Failed Tests

Create or update an associated defect record.

### Retesting

A corrected defect must be tested again.

### Release Decisions

Critical failures should be resolved or explicitly addressed before production acceptance.

## Testing Environments

Tests may be executed in different environments.

### Local Development

The developer's local Next.js environment.

### Vercel Preview

A nonproduction deployment where configured.

### Production

The public website.

### Local Command

    npm run dev

### Build Command

    npm run build

### Production Domain

    https://finandfeatherslv.live

### Supabase

The environment must use the intended Supabase project.

### Twilio

Live messaging tests require approved test devices and configuration.

### Data Separation

Do not assume preview deployments use separate databases.

### Environment Recording

Every test result should identify the environment used.

## Test Execution and Evidence

Testing should produce a useful record.

### Test Identifier

Assign a unique identifier to each test case.

### Test Date

Record when the test was executed.

### Tester

Identify the responsible reviewer.

### Environment

Record local, preview, or production.

### Build Reference

Record the relevant Git commit or deployment identifier when available.

### Expected Result

Describe the intended behavior.

### Actual Result

Record what occurred.

### Status

Use PASS, FAIL, BLOCKED, or NOT APPLICABLE.

### Evidence

Attach appropriate screenshots, logs, or observations.

### Defect Reference

Link failed tests to their defect records.

### Sensitive Data

Do not include passwords, access tokens, or unnecessary guest information in evidence.

## Pre-Test Preparation

Complete preparation before running acceptance tests.

### Repository

- [ ] Correct project opened.
- [ ] Correct branch identified.
- [ ] Working tree status reviewed.
- [ ] Relevant commit identified.

### Environment

- [ ] Target environment confirmed.
- [ ] Required services available.
- [ ] Approved test accounts available.
- [ ] Test data prepared.
- [ ] Production-impacting actions identified.

### Browser

- [ ] Browser version recorded.
- [ ] Device or viewport recorded.
- [ ] Cache behavior considered.

### Security

- [ ] No credentials exposed in test materials.
- [ ] Test users have appropriate permissions.
- [ ] Destructive tests require approval.

### Readiness

- [ ] Expected outcomes documented.
- [ ] Blocking dependencies identified.
- [ ] Evidence collection method established.

## Homepage Testing

The homepage is the primary guest entry point.

### HP-01 — Initial Load

- [ ] Open the homepage.
- [ ] Confirm the page renders.
- [ ] Check for visible errors.
- [ ] Record the result.

### HP-02 — Branding

- [ ] Confirm the correct restaurant logo.
- [ ] Verify image proportions.
- [ ] Confirm no broken assets.

### HP-03 — Slogan

- [ ] Confirm the primary slogan is visible.
- [ ] Confirm the supporting text is readable.

### HP-04 — Primary Actions

- [ ] FULL MENU opens the intended destination.
- [ ] RESERVATIONS opens the request interface.
- [ ] ORDER ONLINE opens the intended ordering destination.
- [ ] LEAVE A REVIEW opens the intended review destination.

### HP-05 — Background

- [ ] Desktop background loads.
- [ ] Mobile background loads.
- [ ] Text remains readable.

### HP-06 — Page Sections

- [ ] Expected homepage sections appear.
- [ ] No major visual overlap occurs.
- [ ] No unexpected horizontal scrolling occurs.

## Header and Navigation Testing

Navigation must work on desktop and mobile.

### NAV-01 — Desktop Header

- [ ] Header is visible.
- [ ] Expected navigation items appear.
- [ ] Links open the intended destinations.

### NAV-02 — Mobile Header

- [ ] Mobile slogan is visible.
- [ ] Menu control is accessible.
- [ ] Menu opens.
- [ ] Menu closes.

### NAV-03 — Sticky Behavior

- [ ] Header behaves correctly while scrolling.
- [ ] Content remains accessible.

### NAV-04 — Menu Actions

- [ ] FULL MENU works.
- [ ] MAKE A RESERVATION works.
- [ ] ORDER ONLINE works.
- [ ] GET DIRECTIONS works.

### NAV-05 — Keyboard

- [ ] Navigation can be reached by keyboard.
- [ ] Interactive controls show an appropriate focus state.
- [ ] Controls can be activated without a mouse.

### NAV-06 — External Destinations

- [ ] External links resolve.
- [ ] Incorrect or broken destinations are reported.

## Responsive Design Testing

The website follows a mobile-first design approach.

### RSP-01 — Small Mobile

- [ ] Content fits a narrow viewport.
- [ ] Text remains readable.
- [ ] Controls remain usable.

### RSP-02 — Standard Mobile

- [ ] Homepage layout is appropriate.
- [ ] Buttons are accessible.
- [ ] Navigation works.

### RSP-03 — Tablet

- [ ] Layout adapts correctly.
- [ ] No major clipping occurs.

### RSP-04 — Desktop

- [ ] Logo scales correctly.
- [ ] Virtual tour placement is appropriate.
- [ ] Ribeye video placement is appropriate.

### RSP-05 — Orientation

- [ ] Portrait orientation works.
- [ ] Landscape orientation works.

### RSP-06 — Zoom

- [ ] Content remains usable with increased browser zoom.
- [ ] Important controls remain accessible.

### RSP-07 — Overflow

- [ ] No unintended horizontal scrolling.
- [ ] Modals fit within available screen space.

## Animation and Accessibility Testing

Animations should improve presentation without reducing usability.

### ANM-01 — Logo Animation

- [ ] Initial neon flicker behaves as intended.
- [ ] Logo settles into its final visible state.

### ANM-02 — Header

- [ ] Header entrance animation completes.

### ANM-03 — Slogan

- [ ] Header text fades in.
- [ ] Supporting text reveals correctly.

### ANM-04 — Buttons

- [ ] Primary buttons appear in the intended sequence.
- [ ] Buttons remain interactive.

### ANM-05 — Scroll Reveal

- [ ] Below-the-fold sections reveal when entering view.
- [ ] Content does not remain unintentionally hidden.

### ANM-06 — Reduced Motion

- [ ] Reduced-motion preference is respected.
- [ ] Essential content remains visible.

### ANM-07 — Keyboard

- [ ] Interactive elements are keyboard accessible.

### ANM-08 — Contrast

- [ ] Important text remains readable.

### ANM-09 — Focus

- [ ] Modal and navigation focus behavior is usable.

## Menu Display Testing

The public menu must present accurate restaurant information.

### MENU-01 — Open Menu

- [ ] Menu opens from the homepage.
- [ ] Menu opens from the header.

### MENU-02 — Categories

- [ ] Approved categories appear.
- [ ] Categories match the source spreadsheet.

### MENU-03 — Subcategories

- [ ] Supported subcategories appear correctly.

### MENU-04 — Item Data

- [ ] Names are correct.
- [ ] Descriptions are correct.
- [ ] Prices are correct.

### MENU-05 — Modifiers

- [ ] Supported options are displayed accurately.
- [ ] Additional charges are correct.

### MENU-06 — Special Labels

- [ ] Supported tags appear correctly.

### MENU-07 — Images

- [ ] Available food images load.
- [ ] Image proportions are appropriate.

### MENU-08 — Category Restrictions

- [ ] No HOOKAH category filter appears.
- [ ] COCKTAILS do not require images.

### MENU-09 — Mobile

- [ ] Menu remains usable on mobile.

## Reservation Form Testing

The reservation form prepares a guest-initiated SMS request.

### RES-01 — Open Modal

- [ ] Reservation control opens the modal.

### RES-02 — Required Fields

- [ ] First name required.
- [ ] Last name required.
- [ ] Date required.
- [ ] Time required.
- [ ] Party size required.
- [ ] Occasion required.
- [ ] SMS consent required.

### RES-03 — Date Validation

- [ ] Past dates rejected.
- [ ] Minimum lead time enforced.
- [ ] Maximum 90-calendar-day window enforced.

### RES-04 — Time Validation

- [ ] Valid times use 30-minute increments.
- [ ] Booking hours follow 10:00 AM–10:00 PM rules.

### RES-05 — Party Size

- [ ] Minimum party size is 1.
- [ ] Maximum party size is 20.
- [ ] Invalid values rejected.

### RES-06 — Seating Policy

- [ ] Two-hour seating disclaimer is visible.

### RES-07 — Modal Dismissal

- [ ] Close button works.
- [ ] Escape works.
- [ ] Backdrop behavior matches the approved design.

### RES-08 — Validation Feedback

- [ ] Invalid inputs produce useful feedback.
- [ ] No invalid request proceeds as valid.

## SMS Handoff Testing

The website prepares a message for the guest to send.

### SMS-01 — Message Preparation

- [ ] Message includes the guest name.
- [ ] Message includes the requested date.
- [ ] Message includes the requested time.
- [ ] Message includes the party size.
- [ ] Message includes the occasion.

### SMS-02 — Destination

- [ ] Message uses the approved number.
- [ ] Number matches (702) 546-6394.

### SMS-03 — Mobile

- [ ] SMS application handoff works on supported devices.
- [ ] Guest can review the message before sending.

### SMS-04 — Desktop

- [ ] Approved copy or fallback behavior works.

### SMS-05 — Modal State

- [ ] Modal remains in the intended state after handoff.
- [ ] Reminder to send the message is visible where designed.

### SMS-06 — Confirmation Language

- [ ] Interface does not claim the reservation is confirmed.
- [ ] Staff confirmation requirement is clear.

### SMS-07 — Consent

- [ ] Required consent is enforced before handoff.

## Twilio Integration Testing

Live integration tests must use approved test devices.

### TWI-01 — Number

- [ ] Correct Twilio number configured.

### TWI-02 — Incoming Message

- [ ] Twilio receives the test SMS.

### TWI-03 — Studio

- [ ] Published Studio workflow executes.

### TWI-04 — Parser

- [ ] Intended parser endpoint is invoked.

### TWI-05 — Valid Message

- [ ] Valid reservation message parses correctly.

### TWI-06 — Missing Fields

- [ ] Incomplete message produces controlled handling.

### TWI-07 — Malformed Message

- [ ] Invalid format does not create an unintended confirmed reservation.

### TWI-08 — Duplicate Message

- [ ] Duplicate processing behavior is verified.

### TWI-09 — Failure

- [ ] Endpoint failure follows the approved fallback process.

### TWI-10 — Staff Handling

- [ ] Intended operational result reaches the appropriate staff workflow.

### TWI-11 — Compliance

- [ ] Current A2P status reviewed.
- [ ] Applicable messaging requirements checked.

### Important Boundary

The live end-to-end test remains pending until actual evidence is recorded.

## Administrative Authentication Testing

Supabase Auth provides administrative identity authentication.

### AUTH-01 — Login Page

- [ ] `/admin/login` loads.

### AUTH-02 — Valid Manager

- [ ] Valid manager can authenticate.

### AUTH-03 — Invalid Credentials

- [ ] Invalid credentials are rejected.

### AUTH-04 — Session

- [ ] Session behavior matches the intended design.

### AUTH-05 — Logout

- [ ] Logout ends the intended authenticated session.

### AUTH-06 — Password Recovery

- [ ] Approved recovery flow works.

### AUTH-07 — Invitation

- [ ] Approved manager invitation flow works.

### AUTH-08 — Errors

- [ ] Authentication errors do not expose sensitive details.

### AUTH-09 — Redirects

- [ ] Production callback URLs work.

### Verification

Use authorized test accounts.

## Manager Authorization Testing

Manager access requires more than successful login.

### PERM-01 — Anonymous User

- [ ] Anonymous user cannot access protected admin functionality.

### PERM-02 — Authenticated Non-Manager

- [ ] Authenticated non-manager cannot access manager functions.

### PERM-03 — Active Manager

- [ ] Active manager can access approved functions.

### PERM-04 — Inactive Manager

- [ ] Inactive manager is denied access.

### PERM-05 — Direct URL

- [ ] Protected routes remain protected when accessed directly.

### PERM-06 — Server Enforcement

- [ ] Server-side authorization is enforced.

### PERM-07 — Database Enforcement

- [ ] Applicable RLS policies enforce intended access.

### PERM-08 — API Operations

- [ ] Protected mutations reject unauthorized requests.

### PERM-09 — Role Changes

- [ ] Access changes take effect appropriately.

### Security Rule

A hidden button is not sufficient authorization protection.

## Admin Dashboard Testing

The dashboard provides access to approved manager functionality.

### ADM-01 — Dashboard Load

- [ ] Authorized manager can open `/admin`.

### ADM-02 — Navigation

- [ ] Available dashboard links work.

### ADM-03 — Menu Management

- [ ] Menu Management opens.

### ADM-04 — Reservations

- [ ] Implemented reservation-related controls behave as designed.

### ADM-05 — Unauthorized Access

- [ ] Non-managers are denied access.

### ADM-06 — Loading

- [ ] Dashboard handles loading states appropriately.

### ADM-07 — Errors

- [ ] Failed operations produce controlled feedback.

### ADM-08 — Mobile

- [ ] Dashboard remains usable on supported mobile layouts.

### ADM-09 — Planned Features

- [ ] Unimplemented modules are not represented as operational.

## Menu Management Testing

Menu Management supports approved administrative changes.

### MGT-01 — Open Editor

- [ ] Authorized manager opens `/admin/menu`.

### MGT-02 — Create Item

- [ ] Valid item can be created.

### MGT-03 — Edit Item

- [ ] Existing item can be updated.

### MGT-04 — Delete Item

- [ ] Supported deletion behavior works safely.

### MGT-05 — Validation

- [ ] Required fields are enforced.

### MGT-06 — Categories

- [ ] Only approved categories are used.

### MGT-07 — Pricing

- [ ] Approved price is saved correctly.

### MGT-08 — Modifiers

- [ ] Supported modifiers persist correctly.

### MGT-09 — Specials Toggle

- [ ] Existing $5 specials toggle behaves as implemented.

### MGT-10 — Public Display

- [ ] Changes appear correctly on the public menu.

### MGT-11 — Authorization

- [ ] Unauthorized users cannot mutate menu records.

## Menu Image Testing

Menu images use the established upload workflow.

### IMG-01 — Upload

- [ ] Authorized manager can select an image.

### IMG-02 — Format

- [ ] Uploaded image is processed into WebP as designed.

### IMG-03 — Aspect Ratio

- [ ] Output follows the intended 4:3 ratio.

### IMG-04 — Storage

- [ ] Image is stored in the intended Supabase bucket.

### IMG-05 — Reference

- [ ] Menu record references the intended image.

### IMG-06 — Display

- [ ] Image loads on the public menu.

### IMG-07 — Replacement

- [ ] Replacing an image updates the intended item.

### IMG-08 — Invalid File

- [ ] Unsupported uploads are handled safely.

### IMG-09 — Authorization

- [ ] Unauthorized users cannot upload.

### IMG-10 — COCKTAILS

- [ ] No cocktail image requirement is introduced.

## Supabase Database and RLS Testing

Database tests must use controlled data and access contexts.

### DB-01 — Public Menu Read

- [ ] Approved public menu records are accessible.

### DB-02 — Anonymous Write

- [ ] Anonymous users cannot perform restricted writes.

### DB-03 — Non-Manager Write

- [ ] Authenticated non-managers cannot perform manager-only writes.

### DB-04 — Manager Write

- [ ] Authorized managers can perform approved operations.

### DB-05 — Inactive Manager

- [ ] Inactive manager access is rejected.

### DB-06 — Data Validation

- [ ] Invalid records are rejected appropriately.

### DB-07 — Referential Integrity

- [ ] Related records remain consistent.

### DB-08 — Migration Compatibility

- [ ] Application behavior matches the deployed schema.

### DB-09 — Error Handling

- [ ] Database failures produce controlled application errors.

### DB-10 — Data Preservation

- [ ] Tests do not unintentionally destroy production records.

## Supabase Storage Testing

Storage tests verify media access and protection.

### STG-01 — Public Assets

- [ ] Approved public media loads.

### STG-02 — Menu Prefix

- [ ] Menu uploads use the intended organization.

### STG-03 — Authorized Upload

- [ ] Manager upload succeeds.

### STG-04 — Unauthorized Upload

- [ ] Unauthorized upload is rejected.

### STG-05 — Object Reference

- [ ] Stored object URL or path resolves correctly.

### STG-06 — Replacement

- [ ] Intended replacement behavior works.

### STG-07 — Deletion

- [ ] Deletion follows approved authorization and reference rules.

### STG-08 — Invalid File

- [ ] Unsupported files are handled safely.

### STG-09 — Error State

- [ ] Storage failure produces useful feedback.

### STG-10 — Backup

- [ ] Recovery requirements are documented and verified separately.

## Gallery and Media Testing

The website includes a gallery, video, and virtual tour.

### MED-01 — Gallery Load

- [ ] Gallery images load.

### MED-02 — Previous

- [ ] Previous control works.

### MED-03 — Next

- [ ] Next control works.

### MED-04 — Indicators

- [ ] Position indicators reflect the selected image.

### MED-05 — Image Modal

- [ ] Selected image opens in the intended modal.

### MED-06 — Modal Close

- [ ] Modal closes correctly.

### MED-07 — Ribeye Video

- [ ] Video loads.
- [ ] Playback controls work.

### MED-08 — Virtual Tour

- [ ] Virtual tour opens.
- [ ] Tour remains usable.

### MED-09 — Mobile

- [ ] Media presentation works on mobile.

### MED-10 — Failure Handling

- [ ] Missing media does not break unrelated page functionality.

## MERCH and External Links Testing

The current MERCH experience uses an external storefront.

### EXT-01 — MERCH Thumbnail

- [ ] Promotional image loads.

### EXT-02 — MERCH Modal

- [ ] External storefront opens in the intended modal.

### EXT-03 — External Provider

- [ ] Storefront is accessible where embedding is supported.

### EXT-04 — Close

- [ ] Modal closes correctly.

### EXT-05 — Ordering

- [ ] ORDER ONLINE opens the intended destination.

### EXT-06 — Reviews

- [ ] LEAVE A REVIEW opens the intended destination.

### EXT-07 — Directions

- [ ] GET DIRECTIONS opens the intended destination.

### EXT-08 — Social Links

- [ ] Facebook link works.
- [ ] Instagram link works.

### EXT-09 — Failure

- [ ] Broken external destinations are reported.

## Performance and Reliability Testing

Performance should be evaluated on representative devices.

### PERF-01 — Initial Load

- [ ] Homepage loads without critical errors.

### PERF-02 — Mobile

- [ ] Important content becomes usable promptly.

### PERF-03 — Images

- [ ] Images do not cause major layout instability.

### PERF-04 — Video

- [ ] Video does not prevent essential page interaction.

### PERF-05 — Navigation

- [ ] Navigation remains responsive.

### PERF-06 — Menu

- [ ] Menu interactions remain responsive.

### PERF-07 — Admin

- [ ] Common administrative actions complete reliably.

### PERF-08 — Network Failure

- [ ] Temporary network problems produce controlled behavior.

### PERF-09 — External Services

- [ ] Provider failures do not create misleading success messages.

### PERF-10 — Measurement

- [ ] Relevant performance measurements are recorded.

## Security and Privacy Testing

Security tests should use approved accounts and methods.

### SEC-01 — Admin Protection

- [ ] Anonymous users cannot access protected manager operations.

### SEC-02 — Role Enforcement

- [ ] Non-managers cannot perform manager actions.

### SEC-03 — Inactive Accounts

- [ ] Inactive managers are denied access.

### SEC-04 — Secrets

- [ ] Private credentials are not exposed in browser assets.

### SEC-05 — Environment Files

- [ ] `.env.local` is not tracked in Git.

### SEC-06 — Storage

- [ ] Unauthorized uploads and deletions are blocked.

### SEC-07 — Database

- [ ] RLS enforces intended restrictions.

### SEC-08 — Webhooks

- [ ] Incoming integration requests use approved authentication.

### SEC-09 — Validation

- [ ] Invalid inputs are handled safely.

### SEC-10 — Logging

- [ ] Logs do not unnecessarily expose personal information.

### SEC-11 — Redirects

- [ ] Authentication redirects use approved destinations.

### SEC-12 — Privacy

- [ ] Guest information is accessible only where authorized.

## Build and Deployment Testing

Deployment testing links source changes to production behavior.

### DEP-01 — Repository

- [ ] Correct GitHub repository identified.

### DEP-02 — Branch

- [ ] Intended deployment branch confirmed.

### DEP-03 — Build

- [ ] `npm run build` completes successfully.

### DEP-04 — Configuration

- [ ] Required environment variables are present.

### DEP-05 — Vercel

- [ ] Intended commit appears in deployment history.

### DEP-06 — Deployment Status

- [ ] Target deployment succeeds.

### DEP-07 — Domain

- [ ] Production domain resolves.

### DEP-08 — HTTPS

- [ ] Secure connection works.

### DEP-09 — Smoke Test

- [ ] Critical guest-facing functionality works.

### DEP-10 — Admin

- [ ] Protected dashboard behavior works.

### DEP-11 — Integrations

- [ ] Affected Supabase or Twilio behavior is verified.

### DEP-12 — Recovery

- [ ] Appropriate recovery procedure is identified.

## Regression Testing

Regression testing checks existing behavior after changes.

### REG-01 — Homepage

- [ ] Branding and primary actions remain correct.

### REG-02 — Navigation

- [ ] Header links still work.

### REG-03 — Menu

- [ ] Categories, prices, and items remain accurate.

### REG-04 — Reservations

- [ ] Form validation remains correct.

### REG-05 — SMS

- [ ] Message formatting remains correct.

### REG-06 — Admin Login

- [ ] Manager authentication still works.

### REG-07 — Authorization

- [ ] Unauthorized access remains blocked.

### REG-08 — Menu Editor

- [ ] Existing CRUD operations still work.

### REG-09 — Images

- [ ] Menu and gallery media still load.

### REG-10 — Responsive Design

- [ ] Mobile and desktop layouts remain usable.

### REG-11 — External Links

- [ ] Ordering, review, directions, and MERCH links still work.

### REG-12 — Deployment

- [ ] No new critical runtime errors appear.

## Future Feature Testing

Future features require separate acceptance plans.

### SPECIALS

When implemented, test:

- Scheduling.
- Day-specific activation.
- Special pricing.
- Manager permissions.
- Public display.

### FAM CLUB

When implemented, test:

- Member enrollment.
- Eligibility.
- Rewards.
- Administrative permissions.
- Privacy.

### GALLERY Administration

When implemented, test:

- Upload.
- Replacement.
- Ordering.
- Visibility.
- Deletion.
- Storage permissions.

### Native MERCH

If approved and implemented, test:

- Product catalog.
- Inventory.
- Cart.
- Checkout.
- Payments.
- Fulfillment.
- Refund handling.

### Toast POS

If integration is approved, test:

- Authentication.
- Menu synchronization.
- Pricing.
- Availability.
- Order submission.
- Failure recovery.

### Implementation Boundary

These are future test requirements, not claims that the features are deployed.

## Release Acceptance Checklist

Before approving a production release:

### Source

- [ ] Intended commit identified.
- [ ] Changes reviewed.
- [ ] No unintended files included.

### Build

- [ ] Build passes.
- [ ] Relevant quality checks pass.

### Security

- [ ] Protected routes tested.
- [ ] No secrets exposed.
- [ ] Relevant RLS policies verified.

### Public Website

- [ ] Homepage passes.
- [ ] Navigation passes.
- [ ] Menu passes.
- [ ] Reservation form passes.
- [ ] Media passes.

### Administration

- [ ] Manager login passes.
- [ ] Manager authorization passes.
- [ ] Affected admin functions pass.

### Integrations

- [ ] Supabase checks pass.
- [ ] Twilio checks pass when relevant.

### Deployment

- [ ] Correct environment.
- [ ] Correct commit.
- [ ] Successful deployment.
- [ ] Production smoke test completed.

### Decision

- [ ] Critical failures resolved or appropriately addressed.
- [ ] Release acceptance recorded.

## Defect Reporting and Retesting

A failed test requires actionable documentation.

### Defect Identifier

Assign a unique reference.

### Summary

Describe the problem concisely.

### Environment

Record where the issue occurred.

### Reproduction Steps

Provide repeatable steps.

### Expected Result

Describe the intended behavior.

### Actual Result

Describe the observed behavior.

### Severity

Assess guest, business, security, and operational impact.

### Evidence

Include relevant screenshots or logs.

### Owner

Assign the appropriate person.

### Fix Reference

Record the corrective commit or configuration change.

### Retest

Execute the affected test again.

### Regression

Run related tests when the fix could affect other functionality.

### Closure

Close the defect only after appropriate verification.

## Implementation Roadmap

### Stage 1 — Establish Test Records

Create a consistent test execution log.

### Stage 2 — Verify Existing Features

Execute public website and manager acceptance tests.

### Stage 3 — Complete Twilio Testing

Perform controlled live end-to-end SMS verification.

### Stage 4 — Audit Security

Verify authorization, RLS, Storage, and webhook protections.

### Stage 5 — Standardize Release Testing

Approve a minimum production smoke-test suite.

### Stage 6 — Add Automated Coverage

Evaluate automated tests for critical application workflows.

### Stage 7 — Test Recovery

Perform approved rollback and restoration exercises.

### Stage 8 — Expand for Future Features

Create acceptance cases as new modules are implemented.

### Stage 9 — Review Periodically

Update checklists when the application changes.

### Scheduling

This roadmap does not establish a committed delivery date.

## Implementation Status

| Testing Area | Status |
|---|---|
| Testing checklist documentation | Documented |
| Homepage test plan | Documented |
| Navigation test plan | Documented |
| Responsive design test plan | Documented |
| Animation test plan | Documented |
| Accessibility test plan | Documented |
| Menu display test plan | Documented |
| Reservation form test plan | Documented |
| SMS handoff test plan | Documented |
| Twilio integration test plan | Documented |
| Authentication test plan | Documented |
| Manager authorization test plan | Documented |
| Menu Management test plan | Documented |
| Menu image test plan | Documented |
| Database and RLS test plan | Documented |
| Storage test plan | Documented |
| Deployment test plan | Documented |
| Regression test plan | Documented |
| Complete production execution record | Pending |
| Live Twilio end-to-end acceptance | Pending |
| Automated test suite inventory | Verification pending |
| Formal release acceptance process | Planned |
| Recovery testing | Verification pending |
| Future module acceptance testing | Planned |

## Related Documentation

- [Operations Overview](README.md)
- [Manager Guide](manager-guide.md)
- [Troubleshooting](troubleshooting.md)
- [Changelog](changelog.md)
- [Homepage](../02-website/homepage.md)
- [Menu System](../02-website/menu-system.md)
- [Reservation Form](../02-website/reservation-form.md)
- [Animations](../02-website/animations.md)
- [Reservation Workflow](../03-reservations/reservation-workflow.md)
- [Twilio Integration](../03-reservations/twilio-integration.md)
- [SMS Parsing](../03-reservations/sms-parsing.md)
- [A2P Compliance](../03-reservations/a2p-compliance.md)
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
