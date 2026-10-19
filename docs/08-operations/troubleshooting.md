# OPERATIONS — Troubleshooting

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Audience:** Developers, Technical Administrators, Authorized Managers, and Support Personnel

**Implementation Status:** Operational troubleshooting procedures documented; individual diagnostic and recovery procedures require verification against deployed configuration

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Troubleshooting Principles](#troubleshooting-principles)
3. [Current System Overview](#current-system-overview)
4. [Incident Severity and Prioritization](#incident-severity-and-prioritization)
5. [Initial Diagnostic Procedure](#initial-diagnostic-procedure)
6. [Evidence Collection](#evidence-collection)
7. [Website Availability Problems](#website-availability-problems)
8. [Homepage Display Problems](#homepage-display-problems)
9. [Header and Navigation Problems](#header-and-navigation-problems)
10. [Responsive Layout Problems](#responsive-layout-problems)
11. [Animation Problems](#animation-problems)
12. [Public Menu Problems](#public-menu-problems)
13. [Reservation Form Problems](#reservation-form-problems)
14. [SMS Handoff Problems](#sms-handoff-problems)
15. [Twilio Message Delivery Problems](#twilio-message-delivery-problems)
16. [Twilio Studio Problems](#twilio-studio-problems)
17. [Reservation Parser Problems](#reservation-parser-problems)
18. [Manager Login Problems](#manager-login-problems)
19. [Manager Authorization Problems](#manager-authorization-problems)
20. [Admin Dashboard Problems](#admin-dashboard-problems)
21. [Menu Management Problems](#menu-management-problems)
22. [Menu Image Upload Problems](#menu-image-upload-problems)
23. [Supabase Database Problems](#supabase-database-problems)
24. [Row-Level Security Problems](#row-level-security-problems)
25. [Supabase Storage Problems](#supabase-storage-problems)
26. [Gallery and Media Problems](#gallery-and-media-problems)
27. [MERCH and External Service Problems](#merch-and-external-service-problems)
28. [Git and GitHub Problems](#git-and-github-problems)
29. [Vercel Build and Deployment Problems](#vercel-build-and-deployment-problems)
30. [Environment Variable Problems](#environment-variable-problems)
31. [Performance and Browser Problems](#performance-and-browser-problems)
32. [Security and Privacy Incidents](#security-and-privacy-incidents)
33. [Recovery and Escalation](#recovery-and-escalation)
34. [Troubleshooting Runbooks](#troubleshooting-runbooks)
35. [Preventive Maintenance](#preventive-maintenance)
36. [Implementation Status](#implementation-status)
37. [Related Documentation](#related-documentation)

---

## Purpose

This document provides troubleshooting guidance for the Fin & Feathers Las Vegas website and its supporting services.

The application includes public website functionality, protected administrative routes, and external integrations.

Problems may originate in application code, configuration, databases, storage, authentication, messaging, hosting, or third-party services.

The purpose of troubleshooting is to:

- Identify the affected functionality.
- Determine the likely failure source.
- Collect useful diagnostic evidence.
- Avoid unnecessary production changes.
- Protect guest and business information.
- Restore service through approved procedures.
- Verify the outcome.
- Record unresolved issues.

This document provides diagnostic procedures rather than guaranteeing that a particular solution will resolve every failure.

## Troubleshooting Principles

Troubleshooting should follow a consistent process.

### Observe Before Changing

Record the actual problem before modifying the system.

### Reproduce When Safe

Attempt to reproduce the issue without affecting valid production records.

### Identify the Scope

Determine whether the problem affects one user, one feature, or the entire website.

### Check Recent Changes

Review recent deployments, configuration changes, and administrative updates.

### Separate Systems

Distinguish application failures from external service failures.

### Protect Data

Avoid destructive database or Storage operations without authorization.

### Protect Secrets

Never expose credentials in screenshots, logs, or support messages.

### Use Approved Access

Only authorized personnel should inspect privileged systems.

### Verify Corrections

Test the affected workflow after applying a fix.

### Document Outcomes

Record confirmed causes and corrective actions.

## Current System Overview

The website uses several technologies.

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

### Production Domain

    https://finandfeatherslv.live

### Database

    Supabase PostgreSQL

### Authentication

    Supabase Auth

### Storage

    Supabase Storage

### Established Bucket

    website-media

### Messaging

    Twilio

### Incoming SMS Workflow

    Twilio Studio

### Reservation Parser

    /parse-reservation

### Manager Authorization

    requireManager()

### Important Boundary

Each service has separate configuration, logs, and recovery procedures.

## Incident Severity and Prioritization

Issue priority should reflect actual impact.

### Critical

Examples include:

- Production website unavailable.
- Confirmed unauthorized access.
- Suspected exposure of privileged credentials.
- Significant guest data exposure.
- Major data integrity failure.

### High

Examples include:

- Reservation messaging unavailable.
- Managers unable to perform essential operations.
- Public menu displaying materially incorrect prices.
- Important administrative mutations failing.

### Medium

Examples include:

- Isolated menu image failure.
- Broken noncritical external link.
- Feature-specific display problem.
- Intermittent administrative error.

### Low

Examples include:

- Minor visual inconsistency.
- Noncritical animation issue.
- Cosmetic spacing problem.

### Prioritization

Escalate according to business impact and security risk.

### Verification Boundary

Formal response-time targets and named escalation contacts require operational approval.

## Initial Diagnostic Procedure

Begin with a structured assessment.

### Step 1 — Record the Problem

Describe the observed behavior.

### Step 2 — Record the Time

Note when the issue occurred.

### Step 3 — Identify the Environment

Determine whether the issue affects local development, preview, or production.

### Step 4 — Identify the User Context

Determine whether the user is anonymous, authenticated, or an authorized manager.

### Step 5 — Reproduce Safely

Repeat the relevant action when appropriate.

### Step 6 — Inspect Browser Errors

Review visible errors and browser diagnostics.

### Step 7 — Inspect Server Logs

Use approved Vercel logging access where applicable.

### Step 8 — Inspect External Services

Review Supabase or Twilio only when relevant.

### Step 9 — Check Recent Changes

Identify related commits, deployments, or configuration updates.

### Step 10 — Select the Next Action

Choose an approved correction or escalation.

## Evidence Collection

Good evidence reduces unnecessary troubleshooting.

### Date and Time

Record the incident time and relevant timezone.

### URL

Record the affected page or endpoint.

### Environment

Identify production, preview, or local development.

### Device

Record the device type.

### Browser

Record the browser and version when relevant.

### User Role

Record anonymous, non-manager, or manager context without exposing credentials.

### Expected Result

Describe what should have happened.

### Actual Result

Describe what happened.

### Error Message

Preserve the exact error text when safe.

### Logs

Capture relevant diagnostic entries.

### Deployment

Record the associated commit or deployment identifier.

### Privacy

Remove unnecessary personal information and secrets before sharing evidence.

## Website Availability Problems

### Symptom

The production website does not load.

### Initial Checks

1. Confirm the intended domain.
2. Check whether the issue affects multiple devices.
3. Check whether the issue affects multiple networks.
4. Review Vercel deployment status.
5. Review domain and DNS configuration.

### Possible Causes

- Failed deployment.
- Hosting incident.
- Domain configuration error.
- DNS problem.
- Runtime failure.
- Network problem.

### Diagnostic Questions

Does the Vercel deployment URL work?

Does the custom domain work?

Is the failure limited to one page?

### Escalation

A production-wide outage requires prompt technical attention.

### Recovery

Follow the approved deployment and domain recovery procedures.

## Homepage Display Problems

### Symptom

The homepage loads but appears incorrect.

### Possible Causes

- Missing assets.
- CSS regression.
- JavaScript error.
- Incorrect deployment.
- Browser caching.
- Responsive layout issue.

### Diagnostic Procedure

1. Confirm the affected viewport.
2. Inspect the browser console.
3. Verify logo and background assets.
4. Check the deployed source revision.
5. Compare mobile and desktop behavior.

### Logo

Verify the intended logo asset loads.

### Background

Verify the appropriate background image is available.

### Buttons

Confirm primary actions remain visible and usable.

### Content

Check for overlapping or hidden sections.

### Resolution

Apply a targeted correction through the approved development workflow.

## Header and Navigation Problems

### Symptom

Navigation links or menus do not behave correctly.

### Desktop Checks

- Header appears.
- Navigation links are visible.
- Links point to intended destinations.

### Mobile Checks

- Menu button appears.
- Dropdown opens.
- Dropdown closes.
- Controls remain accessible.

### Sticky Header

Check behavior during scrolling.

### Possible Causes

- JavaScript event error.
- CSS layering issue.
- Incorrect responsive breakpoint.
- Broken link.
- Modal interaction conflict.

### Diagnostic Procedure

1. Identify the affected control.
2. Reproduce the action.
3. Inspect console errors.
4. Test keyboard interaction.
5. Check the current deployment.

### Verification

Retest the affected navigation on mobile and desktop.

## Responsive Layout Problems

### Symptom

The page appears broken at certain screen sizes.

### Common Issues

- Horizontal overflow.
- Overlapping elements.
- Clipped text.
- Oversized images.
- Modal overflow.
- Unusable buttons.

### Diagnostic Procedure

1. Record viewport dimensions.
2. Reproduce the layout problem.
3. Identify the affected component.
4. Inspect responsive styles.
5. Check related assets.
6. Test neighboring viewport sizes.

### Mobile Priority

The website follows a mobile-first design approach.

### Desktop

Verify the intended wider layout.

### Accessibility

Test increased zoom where relevant.

### Resolution

Make targeted responsive changes and run regression checks.

## Animation Problems

### Symptom

Animations do not play correctly or leave content hidden.

### Established Effects

The website includes:

- Logo neon flicker.
- Header fade-in.
- Slogan reveal.
- Staggered button entrances.
- Scroll-reveal effects.

### Possible Causes

- Missing animation class.
- Incorrect CSS timing.
- JavaScript error.
- IntersectionObserver behavior.
- Reduced-motion preference.
- Incorrect initial visibility state.

### Diagnostic Procedure

1. Identify the affected animation.
2. Test a fresh page load.
3. Test after scrolling.
4. Check browser console.
5. Test reduced-motion behavior.
6. Verify content becomes visible.

### Accessibility

Essential content must remain available without animation.

### Resolution

Correct the affected animation without changing unrelated page behavior.

## Public Menu Problems

### Symptom

Menu items, categories, prices, or images appear incorrectly.

### Possible Causes

- Incorrect database data.
- Incorrect category mapping.
- Failed data fetch.
- Stale display.
- Missing image.
- UI rendering error.

### Diagnostic Procedure

1. Identify the affected menu item.
2. Record the expected value.
3. Inspect the public display.
4. Review the corresponding menu record through approved access.
5. Check relevant logs.
6. Verify whether recent edits were saved.

### Category Rules

Use categories and subcategories from the approved spreadsheet.

### HOOKAH

Do not introduce a HOOKAH category filter.

### COCKTAILS

Cocktail images are not required.

### Resolution

Correct the data or application behavior responsible for the issue.

## Reservation Form Problems

### Symptom

Guests cannot complete the reservation request form.

### Possible Causes

- Required field validation failure.
- Date restriction error.
- Time selection error.
- Party size validation error.
- Consent checkbox issue.
- Modal interaction problem.

### Expected Rules

- Required guest information.
- 30-minute time increments.
- 10:00 AM–10:00 PM reservation window.
- Minimum 2-hour lead time.
- Maximum 90-calendar-day advance window.
- Party size 1–20.
- Required occasion.
- Required SMS consent.
- Two-hour seating disclaimer.

### Diagnostic Procedure

1. Record the entered values without unnecessary personal information.
2. Identify the failing field.
3. Test valid and invalid inputs.
4. Check date and time calculations.
5. Inspect console errors.
6. Verify the intended modal behavior.

### Resolution

Correct the affected validation or UI logic.

## SMS Handoff Problems

### Symptom

The reservation form does not prepare or open the intended SMS.

### Approved Destination

    (702) 546-6394

### Possible Causes

- Invalid generated SMS URL.
- Device incompatibility.
- Missing form data.
- Incorrect encoding.
- Browser restrictions.
- Unsupported desktop behavior.

### Diagnostic Procedure

1. Verify the form passes validation.
2. Inspect the generated message.
3. Confirm the destination number.
4. Test on an approved mobile device.
5. Check the desktop fallback.
6. Confirm the guest-facing reminder.

### Important Distinction

Preparing an SMS does not mean the message was sent.

### Confirmation

Sending an SMS does not automatically confirm a reservation.

### Resolution

Restore the intended guest handoff without introducing misleading confirmation language.

## Twilio Message Delivery Problems

### Symptom

An SMS does not appear to reach the intended messaging workflow.

### Provider

    Twilio

### Possible Causes

- Guest did not send the message.
- Incorrect destination.
- Provider delivery failure.
- Number configuration issue.
- Account restriction.
- Carrier filtering.
- Messaging compliance issue.

### Diagnostic Procedure

1. Confirm a test message was actually sent.
2. Verify the destination number.
3. Review Twilio message logs.
4. Check message status.
5. Review relevant provider errors.
6. Verify account and compliance status.

### A2P

A2P 10DLC approval remains pending.

### Privacy

Do not share full guest phone numbers unnecessarily.

### Escalation

Persistent delivery failures require authorized Twilio administration.

## Twilio Studio Problems

### Symptom

Twilio receives a message but the expected workflow does not complete.

### Possible Causes

- Incorrect incoming routing.
- Wrong Studio flow.
- Unpublished changes.
- Incorrect HTTP request configuration.
- Parser endpoint failure.
- Unexpected workflow branching.

### Diagnostic Procedure

1. Confirm the message reached Twilio.
2. Identify the configured incoming flow.
3. Check the published Studio version.
4. Inspect Studio execution logs.
5. Identify the failing widget.
6. Verify parser request configuration.
7. Test a controlled message.

### Configuration Boundary

Studio changes are separate from Git and Vercel deployments.

### Resolution

Restore the approved published workflow.

## Reservation Parser Problems

### Symptom

Incoming reservation content is parsed incorrectly or rejected.

### Established Endpoint

    /parse-reservation

### Possible Causes

- Unexpected message format.
- Missing fields.
- Incorrect request content type.
- Invalid date parsing.
- Invalid time parsing.
- Runtime error.
- Incorrect webhook authentication.

### Diagnostic Procedure

1. Identify the affected request.
2. Inspect safe diagnostic logs.
3. Verify the request format.
4. Check expected field names.
5. Reproduce with sanitized test data.
6. Review the deployed endpoint version.
7. Confirm Studio compatibility.

### Duplicate Requests

Check whether repeated messages create unintended duplicate actions.

### Security

Do not disable webhook protection merely to make requests succeed.

### Verification

Perform controlled integration testing after correction.

## Manager Login Problems

### Symptom

An authorized manager cannot sign in.

### Authentication Provider

    Supabase Auth

### Login Route

    /admin/login

### Possible Causes

- Incorrect credentials.
- Expired session.
- Invalid recovery link.
- Authentication configuration issue.
- Callback URL mismatch.
- Provider outage.

### Diagnostic Procedure

1. Confirm the correct login page.
2. Record the error without exposing credentials.
3. Verify the account exists through approved administration.
4. Check Supabase Auth status.
5. Review relevant application logs.
6. Test the approved password recovery flow.

### Important Boundary

Authentication success does not guarantee manager authorization.

### Escalation

Unresolved access problems require authorized technical review.

## Manager Authorization Problems

### Symptom

A signed-in user cannot access manager functionality.

### Authorization Helper

    requireManager()

### Role Table

    staff_roles

### Required Role

    manager

### Required State

    is_active = true

### Possible Causes

- Missing staff role.
- Inactive role.
- Incorrect user association.
- RLS issue.
- Server authorization error.
- Stale session state.

### Diagnostic Procedure

1. Confirm authentication succeeded.
2. Identify the protected route.
3. Review the intended staff role.
4. Inspect authorized role records.
5. Check server-side authorization behavior.
6. Review relevant database policies.

### Security

Do not grant elevated access merely to bypass an error.

### Verification

Test authorized and unauthorized contexts after correction.

## Admin Dashboard Problems

### Symptom

The dashboard fails to load or a manager control does not work.

### Main Route

    /admin

### Menu Route

    /admin/menu

### Possible Causes

- Authorization failure.
- Server rendering error.
- Database query failure.
- Missing environment configuration.
- Client-side interaction error.

### Diagnostic Procedure

1. Confirm the manager is authorized.
2. Identify the failing page.
3. Inspect visible error messages.
4. Review browser console.
5. Review Vercel runtime logs.
6. Check relevant Supabase queries.

### Planned Modules

Do not treat unavailable future modules as production defects unless they are represented as implemented.

### Resolution

Correct the affected dashboard feature and verify authorization remains intact.

## Menu Management Problems

### Symptom

A manager cannot create, edit, or delete a menu item.

### Possible Causes

- Missing required fields.
- Invalid price.
- Incorrect category.
- Authorization failure.
- RLS rejection.
- Database constraint.
- Server mutation error.

### Diagnostic Procedure

1. Identify the intended operation.
2. Record the affected item.
3. Check validation messages.
4. Confirm manager authorization.
5. Inspect database errors.
6. Review relevant server logs.
7. Verify whether any partial change occurred.

### Special Toggle

The existing menu editor includes a $5 specials toggle.

### Advanced Scheduling

Advanced day-specific SPECIALS scheduling is planned separately.

### Safety

Avoid repeating a failed operation without checking whether it partially succeeded.

## Menu Image Upload Problems

### Symptom

An image fails to upload or display.

### Storage Provider

    Supabase Storage

### Bucket

    website-media

### Prefix

    menu/

### Expected Output

    WebP

### Expected Aspect Ratio

    4:3

### Possible Causes

- Unsupported source file.
- Image processing error.
- Upload authorization failure.
- Storage policy rejection.
- Missing object.
- Incorrect image reference.

### Diagnostic Procedure

1. Identify the affected menu item.
2. Check the selected source file.
3. Review upload feedback.
4. Confirm the intended object path.
5. Inspect Storage access through approved tools.
6. Check the public image reference.

### Resolution

Correct the upload or reference issue without deleting unrelated assets.

## Supabase Database Problems

### Symptom

Application data cannot be loaded or updated.

### Provider

    Supabase PostgreSQL

### Possible Causes

- Database connectivity failure.
- Missing environment configuration.
- Invalid query.
- Schema mismatch.
- Constraint violation.
- RLS rejection.
- Service incident.

### Diagnostic Procedure

1. Identify the failing operation.
2. Determine the affected table.
3. Review application logs.
4. Check Supabase service status.
5. Inspect the deployed schema.
6. Review relevant policies.
7. Compare recent migrations.

### Data Integrity

Avoid destructive corrections without authorization.

### Recovery

Use the approved database recovery procedures.

## Row-Level Security Problems

### Symptom

A database operation is unexpectedly allowed or denied.

### Security Layer

    PostgreSQL Row-Level Security

### Possible Causes

- Incorrect policy.
- Missing role condition.
- Inactive staff role.
- Unexpected authentication context.
- Missing grant.
- Incorrect operation-specific rule.

### Diagnostic Procedure

1. Identify the table.
2. Identify the operation.
3. Determine the authenticated role.
4. Inspect relevant RLS policies.
5. Review application authorization.
6. Test approved access contexts.

### Required Test Contexts

- Anonymous.
- Authenticated non-manager.
- Active manager.
- Inactive manager.

### Security Warning

Do not broadly disable RLS as a troubleshooting shortcut.

### Verification

Confirm both permitted and denied operations after correction.

## Supabase Storage Problems

### Symptom

Media objects cannot be accessed or modified.

### Provider

    Supabase Storage

### Bucket

    website-media

### Possible Causes

- Missing object.
- Incorrect object path.
- Invalid public URL.
- Storage policy rejection.
- Upload failure.
- Deleted media.
- Incorrect content type.

### Diagnostic Procedure

1. Identify the object path.
2. Verify object existence.
3. Check intended public access.
4. Inspect relevant Storage policies.
5. Check associated database references.
6. Review upload or deletion logs where available.

### Recovery

Restore approved media from an available source.

### Important Boundary

Restoring application code does not restore deleted Storage objects.

## Gallery and Media Problems

### Symptom

Gallery images, virtual tour, or video do not work.

### Gallery

The public gallery includes six established images.

### Ribeye Video

The homepage includes a native video player.

### Virtual Tour

The website opens the tour through a modal iframe.

### Possible Causes

- Missing asset.
- Invalid media URL.
- Browser playback restriction.
- External iframe restriction.
- JavaScript error.
- Responsive layout problem.

### Diagnostic Procedure

1. Identify the affected media component.
2. Verify the media source.
3. Check browser console and network errors.
4. Test another supported browser.
5. Test mobile and desktop.
6. Confirm modal behavior.

### Resolution

Correct the affected media source or presentation.

## MERCH and External Service Problems

### Symptom

An external destination does not open or function.

### Current MERCH Experience

The website uses an external storefront opened in a modal iframe.

### Other External Destinations

- Toast online ordering.
- Google reviews.
- Directions.
- Facebook.
- Instagram.

### Possible Causes

- Broken URL.
- External provider outage.
- Iframe restrictions.
- Browser privacy settings.
- Network issue.
- Incorrect link configuration.

### Diagnostic Procedure

1. Identify the destination.
2. Test the URL directly.
3. Check whether the provider is available.
4. Inspect iframe errors if relevant.
5. Verify the website link.
6. Record the affected browser.

### Implementation Boundary

Native MERCH checkout and direct Toast POS integration remain under evaluation.

## Git and GitHub Problems

### Symptom

Source changes cannot be committed or pushed.

### Repository

    tre1techniqai/finandfeatherslv

### Local Development

    Ubuntu 24.04 under WSL

### Diagnostic Commands

    git status
    git branch --show-current
    git remote -v

### Authentication

Previous development encountered GitHub credential identity conflicts.

### Possible Causes

- Incorrect GitHub account.
- Missing repository permission.
- Credential helper issue.
- Incorrect remote.
- Branch conflict.
- Uncommitted changes.

### Diagnostic Procedure

1. Inspect Git status.
2. Confirm repository remote.
3. Confirm intended GitHub identity.
4. Review the exact error.
5. Resolve credentials through the approved workflow.

### Security

Do not embed personal access tokens in repository URLs.

### Recovery

Avoid destructive Git commands without reviewing their consequences.

## Vercel Build and Deployment Problems

### Symptom

A deployment fails or production behaves incorrectly after deployment.

### Hosting Provider

    Vercel

### Build Command

    npm run build

### Possible Causes

- TypeScript error.
- Missing dependency.
- Environment variable problem.
- Incorrect build setting.
- Runtime incompatibility.
- Failed server function.
- External service mismatch.

### Diagnostic Procedure

1. Identify the affected deployment.
2. Confirm the associated commit.
3. Review build logs.
4. Inspect runtime logs.
5. Verify environment configuration.
6. Check affected integrations.
7. Determine whether rollback is appropriate.

### Production Branch

Verify the actual configured production branch.

### Recovery

Follow the approved Vercel and Git recovery procedures.

## Environment Variable Problems

### Symptom

A feature works locally but fails after deployment.

### Possible Causes

- Missing production variable.
- Incorrect environment scope.
- Typographical error.
- Rotated credential.
- Wrong Supabase project.
- Wrong Twilio configuration.
- Build-time configuration mismatch.

### Diagnostic Procedure

1. Identify the affected integration.
2. Confirm the intended environment.
3. Review required variable names in source.
4. Inspect Vercel configuration through authorized access.
5. Verify values without exposing secrets.
6. Redeploy if required.
7. Test the affected feature.

### Public Variables

Only intended public values should use browser-exposed configuration.

### Private Variables

Privileged credentials must remain server-side.

### Security

Never print secret values in troubleshooting output.

## Performance and Browser Problems

### Symptom

The website loads slowly or behaves inconsistently.

### Possible Causes

- Large media assets.
- Slow network.
- Browser cache.
- JavaScript error.
- External service delay.
- Database query latency.
- Excessive client-side work.

### Diagnostic Procedure

1. Identify the affected device.
2. Record the browser.
3. Check network conditions.
4. Inspect browser performance diagnostics.
5. Identify slow assets or requests.
6. Compare local and production behavior.

### Mobile

Prioritize representative mobile testing.

### Video

Review the performance impact of the ribeye video.

### Images

Verify appropriate image sizes and formats.

### External Services

Separate provider delays from application rendering problems.

### Resolution

Measure the effect of changes rather than assuming improvement.

## Security and Privacy Incidents

### Examples

- Suspected credential exposure.
- Unauthorized manager access.
- Unexpected database permissions.
- Exposed guest information.
- Suspicious webhook requests.
- Unauthorized Storage modifications.

### Immediate Response

1. Record the observed behavior.
2. Avoid exposing additional sensitive information.
3. Notify the authorized technical administrator.
4. Preserve relevant evidence.
5. Restrict affected access where appropriate.
6. Follow the approved incident response process.

### Credentials

Compromised credentials may require rotation.

### Authorization

Review both application and database security.

### Guest Information

Protect names, phone numbers, and reservation details.

### Recovery

Do not make unreviewed destructive changes.

### Documentation

Record the incident and corrective actions.

## Recovery and Escalation

Not every issue can be resolved through ordinary troubleshooting.

### Escalation Triggers

- Production outage.
- Suspected security incident.
- Data loss.
- Reservation processing failure.
- Repeated deployment failure.
- Unauthorized administrative access.
- Persistent database or Storage errors.

### Manager Responsibility

Report the problem and business impact.

### Technical Responsibility

Investigate and select the approved corrective action.

### Rollback

Use the documented rollback procedure when appropriate.

### External Providers

Escalate provider-specific issues through authorized support channels.

### Verification

Confirm service restoration.

### Incident Record

Document the root cause when established.

### Closure

Do not close an incident while critical verification remains incomplete.

## Troubleshooting Runbooks

### Runbook A — Website Not Loading

1. Confirm the production URL.
2. Test another device or network.
3. Review Vercel deployment status.
4. Check domain configuration.
5. Inspect relevant runtime logs.
6. Identify recent changes.
7. Apply an approved recovery action.
8. Verify the public website.

### Runbook B — Manager Cannot Log In

1. Confirm the login URL.
2. Identify the exact error.
3. Check Supabase Auth status.
4. Verify the account through approved access.
5. Review callback configuration.
6. Test password recovery if appropriate.
7. Verify manager authorization.
8. Document the result.

### Runbook C — Menu Update Fails

1. Identify the item and operation.
2. Review validation errors.
3. Confirm manager authorization.
4. Inspect server logs.
5. Review database constraints and RLS.
6. Determine whether the operation partially succeeded.
7. Apply the approved correction.
8. Verify public menu output.

### Runbook D — Menu Image Missing

1. Identify the affected item.
2. Inspect its media reference.
3. Verify the Storage object.
4. Review access policies.
5. Restore or correct the asset.
6. Test the public URL.
7. Verify the menu display.
8. Document the result.

### Runbook E — Reservation SMS Not Processed

1. Confirm the guest actually sent the SMS.
2. Verify the destination number.
3. Review Twilio message logs.
4. Inspect the published Studio workflow.
5. Verify parser invocation.
6. Inspect sanitized parser logs.
7. Correct the affected configuration.
8. Perform a controlled end-to-end test.

### Runbook F — Production Deployment Failure

1. Identify the failing commit.
2. Review Vercel build logs.
3. Check environment configuration.
4. Inspect related database changes.
5. Determine the safest corrective action.
6. Apply an approved fix or rollback.
7. Run production smoke tests.
8. Record the outcome.

## Preventive Maintenance

Routine maintenance reduces avoidable incidents.

### Daily

- Review website availability.
- Check important guest-facing functionality.
- Review reservation workflow issues.
- Escalate critical errors.

### Weekly

- Verify menu accuracy.
- Check important external links.
- Review recurring administrative problems.
- Check important media assets.

### Monthly

- Review active manager access.
- Review unresolved defects.
- Review operational documentation.
- Evaluate recurring performance issues.

### Before Deployment

- Run relevant checks.
- Review configuration dependencies.
- Identify database migration requirements.
- Confirm the recovery plan.

### After Deployment

- Run smoke tests.
- Review logs.
- Confirm affected integrations.
- Record the release.

## Implementation Status

| Troubleshooting Area | Status |
|---|---|
| General diagnostic procedure | Documented |
| Incident severity guidance | Documented |
| Evidence collection procedure | Documented |
| Website availability troubleshooting | Documented |
| Homepage troubleshooting | Documented |
| Navigation troubleshooting | Documented |
| Responsive design troubleshooting | Documented |
| Animation troubleshooting | Documented |
| Public menu troubleshooting | Documented |
| Reservation form troubleshooting | Documented |
| SMS handoff troubleshooting | Documented |
| Twilio delivery troubleshooting | Documented |
| Twilio Studio troubleshooting | Documented |
| Reservation parser troubleshooting | Documented |
| Manager authentication troubleshooting | Documented |
| Manager authorization troubleshooting | Documented |
| Menu Management troubleshooting | Documented |
| Supabase database troubleshooting | Documented |
| RLS troubleshooting | Documented |
| Storage troubleshooting | Documented |
| Vercel deployment troubleshooting | Documented |
| GitHub troubleshooting | Documented |
| Security incident guidance | Documented |
| Recovery runbooks | Documented |
| Named escalation contacts | Pending assignment |
| Formal response-time targets | Pending approval |
| Production diagnostic audit | Verification pending |
| Recovery procedure exercises | Verification pending |
| Comprehensive operational acceptance | Pending |

## Related Documentation

- [Operations Overview](README.md)
- [Manager Guide](manager-guide.md)
- [Testing Checklists](testing-checklists.md)
- [Changelog](changelog.md)
- [Project Architecture](../01-project-overview/architecture.md)
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
