# AUTHENTICATION — Password Recovery

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Supabase Auth and manager authorization implemented; password recovery routes, callbacks, email configuration, and end-to-end behavior require source verification

**Feature:** Administrative Password Recovery and Account Access Restoration

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Recovery Objectives](#recovery-objectives)
3. [Current Implementation](#current-implementation)
4. [Recovery Architecture](#recovery-architecture)
5. [Recovery Entry Points](#recovery-entry-points)
6. [Password Reset Request](#password-reset-request)
7. [Recovery Email Delivery](#recovery-email-delivery)
8. [Recovery Links and Tokens](#recovery-links-and-tokens)
9. [Recovery Callback Handling](#recovery-callback-handling)
10. [New Password Submission](#new-password-submission)
11. [Authentication After Recovery](#authentication-after-recovery)
12. [Manager Authorization After Recovery](#manager-authorization-after-recovery)
13. [Session Management](#session-management)
14. [Expired and Invalid Recovery Links](#expired-and-invalid-recovery-links)
15. [Account Enumeration Protection](#account-enumeration-protection)
16. [Email and Redirect Configuration](#email-and-redirect-configuration)
17. [Security and Privacy](#security-and-privacy)
18. [Error Handling and Recovery](#error-handling-and-recovery)
19. [Manager Support Procedures](#manager-support-procedures)
20. [Testing and Verification](#testing-and-verification)
21. [Deployment Considerations](#deployment-considerations)
22. [Implementation Roadmap](#implementation-roadmap)
23. [Implementation Status](#implementation-status)
24. [Related Documentation](#related-documentation)

---

## Purpose

This document defines the intended password recovery experience for administrative accounts on the Fin & Feathers Las Vegas website.

Password recovery allows an authorized user to regain access to an existing authentication identity without requiring the disclosure of an existing password.

The recovery process must protect the account from unauthorized access.

It must also preserve the distinction between authentication and administrative authorization.

This document covers:

- Password recovery entry points.
- Reset requests.
- Email delivery.
- Recovery links.
- Token validation.
- Recovery callbacks.
- Password updates.
- Authentication sessions.
- Manager authorization.
- Security.
- Error handling.
- Testing.
- Deployment configuration.

This document describes the established authentication foundation and the recovery functionality that requires further implementation verification.

## Recovery Objectives

The password recovery experience should be secure, reliable, and understandable.

### Account Access

Authorized users should have a supported method for recovering account access.

### Identity Protection

Recovery must not allow unauthorized users to take control of an account.

### Secure Tokens

Recovery links must use the authentication provider's approved verification mechanism.

### Clear Instructions

Users should understand how to request and complete a password reset.

### Limited Disclosure

The application should avoid unnecessarily revealing whether an email address belongs to an account.

### Reliable Redirects

Recovery links should direct users to the correct approved application environment.

### Authorization Preservation

A password reset must not create or elevate manager permissions.

### Operational Support

Failed recovery attempts should have a documented escalation process.

## Current Implementation

**Status:** Authentication foundation implemented; recovery flow verification pending

The application uses Supabase Auth.

### Established Authorization Helper

    src/lib/auth/require-manager.ts

### Established Server Client

    @/lib/supabase/server

### Established Client Factory

    createSupabaseServerClient()

### Established Login Destination

    /admin/login

### Established Staff Role Table

    staff_roles

### Required Manager Role

    manager

### Required Active State

    is_active = true

### Verified Authorization Behavior

The manager helper reads authenticated claims and separately verifies an active manager staff role.

### Recovery Implementation Boundary

The following require inspection:

- Password recovery request page.
- Password recovery form.
- Reset email invocation.
- Recovery callback route.
- Password update page.
- Session handling after recovery.
- Password reset success navigation.

### Important Distinction

Supabase Auth supporting password recovery does not prove that the application has a complete, tested recovery user interface.

## Recovery Architecture

Password recovery should use Supabase Auth as the authoritative identity provider.

### Authentication Provider

    Supabase Auth

### Framework

    Next.js App Router

### Language

    TypeScript

### Database

    Supabase PostgreSQL

### Administrative Authorization

    requireManager()

### Proposed Recovery Flow

1. User opens the approved recovery entry point.
2. User submits the email associated with the account.
3. Application requests password recovery through Supabase Auth.
4. Provider processes the request.
5. User receives a recovery email where applicable.
6. User opens the recovery link.
7. Application handles the recovery callback.
8. Provider validates the recovery credentials.
9. User enters a new password.
10. Provider confirms the password update.
11. User authenticates through the approved process.
12. Protected administrative access is independently authorized.

### Provider Responsibility

Supabase Auth manages identity verification and password updates.

### Application Responsibility

The application manages the recovery interface, navigation, and protected administrative experience.

### Authorization Boundary

The application must continue to enforce the active manager role requirement.

### Architecture Status

The exact current recovery implementation must be verified before treating this proposed flow as operational.

## Recovery Entry Points

**Status:** Source verification pending

Users should have a clear way to begin password recovery.

### Potential Entry Point

The administrative login page may provide a password recovery link.

### Existing Login Destination

    /admin/login

### Recovery Route

The actual application recovery route must be confirmed from source.

### User Experience

The entry point should explain that the process is intended for account access recovery.

### Navigation

Users should be able to return to the login page.

### Accessibility

The recovery entry point must support keyboard and assistive technology navigation.

### Mobile Presentation

The experience should work on mobile devices.

### Security

The recovery entry point should not expose protected administrative information.

### Implementation Boundary

Do not assume a particular recovery route or component exists until it is inspected.

## Password Reset Request

**Status:** Proposed workflow; source verification pending

The password reset request should initiate provider-managed recovery.

### Step 1 — Open Recovery

The user navigates to the approved password recovery page.

### Step 2 — Enter Email

The user enters the email associated with the intended account.

### Step 3 — Validate Input

The application checks basic email formatting.

### Step 4 — Submit Request

The application invokes the approved Supabase Auth recovery operation.

### Step 5 — Handle Provider Response

The application processes the provider's result.

### Step 6 — Display Guidance

The interface provides appropriate instructions about checking email.

### Step 7 — Await Delivery

The user waits for the recovery message.

### Step 8 — Open Link

The user follows the recovery link when received.

### Duplicate Requests

The application should avoid encouraging unnecessary repeated submissions.

### Rate Limits

Provider and application rate limits must be respected.

### Important Boundary

Submitting a reset request does not mean a password has been changed.

## Recovery Email Delivery

Password recovery commonly depends on provider-managed email delivery.

### Provider Configuration

Supabase Auth email configuration must be reviewed.

### Sender Identity

The recovery email should identify the approved sender.

### Recipient

The message should be delivered only to the appropriate address.

### Email Content

The email should explain the recovery purpose.

### Recovery Link

The message should contain the provider-approved recovery link.

### Link Expiration

The link follows the configured provider expiration behavior.

### Delivery Failure

The application must not report confirmed delivery without evidence.

### Spam Filtering

Users may need to inspect spam or junk folders.

### Email Provider Limits

Delivery may be affected by provider limits or configuration.

### Source Verification

The actual email templates, sender configuration, and delivery behavior require inspection.

## Recovery Links and Tokens

Recovery links are sensitive authentication artifacts.

### Provider Validation

The application must rely on Supabase Auth's approved verification mechanism.

### Token Confidentiality

Recovery tokens must not be exposed in application logs.

### Link Expiration

Expired links must not permit password updates.

### Invalid Links

Malformed or invalid recovery credentials must be rejected.

### Reuse

The implementation must follow the provider's actual token reuse behavior.

### URL Handling

Recovery credentials must be processed through the appropriate callback mechanism.

### Browser History

Avoid unnecessarily retaining sensitive token information in application URLs.

### External Redirects

Do not redirect recovery credentials to untrusted destinations.

### Security Principle

Possession of an invalid or expired recovery link must not grant account access.

### Configuration Verification

Actual token lifetime and callback behavior must be confirmed from Supabase configuration.

## Recovery Callback Handling

**Status:** Source verification pending

A recovery callback connects the provider's verification process to the application.

### Callback Responsibility

The callback must process the recovery response according to the configured Supabase Auth flow.

### Valid Recovery

A valid recovery response should establish the appropriate password update context.

### Invalid Recovery

Invalid or expired credentials should be rejected.

### Session Context

The application may need an authenticated recovery session before permitting password updates.

### Redirect Safety

Callback destinations must be controlled by the application.

### Error Feedback

Failures should be communicated without exposing sensitive token details.

### Environment Awareness

Production and preview deployments may require different approved redirect settings.

### Source Verification

The actual callback route and token handling must be inspected.

### Implementation Boundary

Do not assume a specific callback path or exchange method without source evidence.

## New Password Submission

**Status:** Source verification pending

The password update interface should allow a verified recovery user to set a new password.

### Authorized Recovery Context

The application must verify that the user has a valid recovery context.

### Password Entry

The user enters the new password.

### Confirmation

The interface may request password confirmation.

### Validation

Passwords must satisfy the approved authentication policy.

### Submission

The application invokes the provider-approved password update operation.

### Provider Confirmation

The interface must wait for the provider to confirm success.

### Error Handling

Invalid or rejected passwords should produce clear feedback.

### Sensitive Data

Passwords must not be written to application logs.

### Browser State

Password fields should be handled securely.

### Success State

The interface should report completion only after the password update succeeds.

### Implementation Boundary

Exact password requirements and form behavior require configuration and source verification.

## Authentication After Recovery

Successful password recovery restores the ability to authenticate using the updated credentials.

### Identity Continuity

The recovery process should preserve the intended account identity.

### Updated Credentials

The new password replaces the previous password according to provider behavior.

### Login

The user should follow the approved sign-in flow.

### Session Behavior

The provider may establish or maintain an authentication session during recovery.

### Session Verification

The application's actual post-recovery session behavior must be tested.

### Existing Sessions

The effect of password changes on other sessions must be verified against provider configuration.

### User Feedback

The application should clearly communicate whether sign-in is required.

### Authentication Boundary

Successful recovery establishes or restores identity authentication, not administrative authorization.

## Manager Authorization After Recovery

Manager authorization remains independent of password recovery.

### Established Helper

    requireManager()

### Role Source

    staff_roles

### Required Role

    manager

### Active Requirement

    is_active = true

### Authenticated User

The helper extracts the authenticated user identifier from claims.

### Role Verification

The helper queries the staff role associated with that identifier.

### Active Manager

An active manager may access protected administrative routes.

### Inactive Manager

An inactive manager remains unauthorized after a password reset.

### Missing Role

An authenticated user without a manager staff role remains unauthorized.

### Incorrect Role

A non-manager user remains unauthorized.

### Security Principle

Password recovery must never bypass or modify the staff role requirement.

## Session Management

Recovery operations interact with authentication sessions.

### Recovery Session

The provider may establish a temporary or authenticated context for password updates.

### Validity

The application must verify the recovery context before accepting a new password.

### Session Expiration

Expired sessions must not grant protected access.

### Session Refresh

Refresh behavior depends on the configured Supabase client integration.

### Existing Sessions

Password updates may have implications for other authenticated sessions.

### Shared Devices

Managers should avoid performing recovery on untrusted shared devices.

### Sign-Out

The application should support appropriate sign-out after recovery.

### Role Changes

Existing sessions must not override the current active manager authorization requirement.

### Source Verification

The exact session lifecycle must be tested against the application's current implementation.

## Expired and Invalid Recovery Links

Recovery links may fail for legitimate reasons.

### Expired Link

The provider may reject a link after its configured validity period.

### Invalid Link

Malformed or incorrect credentials must be rejected.

### Previously Used Link

Reuse behavior depends on provider configuration.

### Wrong Environment

A link may point to an unapproved or incorrectly configured deployment.

### Session Conflict

Existing browser authentication state may affect the recovery experience.

### User Guidance

The interface should explain how to request another recovery email.

### Retry Safety

Retrying should not bypass provider verification.

### Administrative Support

Managers with repeated recovery failures should use the approved support procedure.

### Configuration Boundary

Do not document a fixed expiration period without verifying provider settings.

## Account Enumeration Protection

Password recovery must avoid unnecessarily disclosing account existence.

### Risk

Different public responses may reveal whether an email address is registered.

### Response Design

The application should use appropriately neutral recovery request messaging.

### Error Details

Internal provider errors should not be displayed directly when they expose sensitive account information.

### Logging

Diagnostic logs should avoid unnecessary personal information.

### Rate Limiting

The implementation should respect provider and application request limits.

### Abuse Prevention

Repeated automated requests should be considered during security review.

### Support Process

Staff should not disclose account details to unverified requesters.

### Testing

Test responses for both registered and unregistered email addresses.

### Security Boundary

The precise provider response behavior must be verified rather than assumed.

## Email and Redirect Configuration

Password recovery depends on correct environment configuration.

### Production Domain

    https://finandfeatherslv.live

### Existing Login Route

    /admin/login

### Recovery Redirect

The actual recovery callback destination must be confirmed.

### Supabase URL Configuration

Approved application redirect URLs must be configured in Supabase.

### Production Environment

Production recovery links must resolve to the intended production application.

### Preview Environments

Preview deployments may require separately approved redirect destinations.

### Email Templates

Recovery email templates should be reviewed for clarity and security.

### Sender Configuration

The email sender and delivery mechanism must be verified.

### Environment Variables

Authentication configuration must use approved environment variables.

### Secret Protection

Privileged credentials must remain server-side.

### Documentation

Do not record actual recovery tokens or secret values.

## Security and Privacy

Password recovery is a security-sensitive workflow.

### Provider Verification

Use Supabase Auth's approved recovery mechanism.

### Token Security

Treat recovery links as sensitive.

### Password Security

Never log or expose passwords.

### HTTPS

Production recovery pages must use HTTPS.

### Redirect Validation

Only approved redirect destinations should be used.

### Session Protection

Recovery and authenticated sessions must be handled securely.

### Account Enumeration

Avoid unnecessarily revealing registered accounts.

### Rate Limiting

Respect provider limits and evaluate additional protections as needed.

### Manager Authorization

Continue enforcing active manager roles after recovery.

### Privileged Credentials

Never expose service-role credentials in browser code.

### Logging

Avoid recording sensitive tokens, passwords, or unnecessary personal information.

### Incident Response

Suspected account compromise requires approved escalation and access review.

## Error Handling and Recovery

### Invalid Email Format

Provide clear input validation feedback.

### Provider Request Failure

Do not report a confirmed successful provider operation when the request fails.

### Email Delivery Problem

Provide appropriate troubleshooting guidance.

### Expired Link

Offer the approved recovery request process.

### Invalid Token

Reject the recovery attempt safely.

### Callback Failure

Display an appropriate error without exposing token details.

### Password Validation Failure

Explain the approved password requirements.

### Password Update Failure

Preserve the existing account state and allow safe retry.

### Session Failure

Require the user to reestablish the appropriate authentication context.

### Unauthorized Manager

Do not grant access when the staff role is inactive or missing.

### Configuration Failure

Review environment variables, callback routes, and Supabase redirect settings.

### Provider Outage

Escalate persistent service failures through approved operational channels.

## Manager Support Procedures

### Requesting Password Recovery

1. Open the approved administrative login page.
2. Select the password recovery option.
3. Enter the account email.
4. Submit the request.
5. Review the on-screen guidance.
6. Check email for the recovery message.
7. Open the approved link.
8. Complete the password update.
9. Sign in as instructed.
10. Verify administrative access.

### Recovery Email Not Received

1. Confirm the intended email address.
2. Check spam and junk folders.
3. Allow appropriate delivery time.
4. Avoid repeated rapid submissions.
5. Request another link if appropriate.
6. Escalate persistent failures.

### Expired Recovery Link

1. Return to the approved recovery entry point.
2. Request a new recovery message.
3. Use the new link within the configured validity period.
4. Contact authorized support if the problem continues.

### Password Reset Succeeds but Admin Access Fails

1. Confirm the correct account was used.
2. Verify authentication succeeds.
3. Review the active staff role.
4. Confirm the required manager role.
5. Escalate authorization problems through the approved process.

### Suspected Compromise

1. Report the issue promptly.
2. Follow approved account security procedures.
3. Review active staff authorization.
4. Apply appropriate session or account revocation.
5. Document the incident according to policy.

### Current Operational Boundary

These are intended procedures; exact UI navigation requires source verification.

## Testing and Verification

### Recovery Request

- Valid registered account.
- Unregistered email.
- Invalid email format.
- Missing email.
- Repeated requests.
- Provider request failure.

### Email Delivery

- Correct recipient.
- Approved sender.
- Correct template.
- Correct recovery link.
- Delivery failure.

### Recovery Link

- Valid link.
- Expired link.
- Invalid token.
- Previously used link.
- Wrong environment.

### Callback

- Successful verification.
- Failed verification.
- Missing recovery context.
- Redirect validation.
- Session establishment.

### Password Update

- Valid password.
- Invalid password.
- Missing confirmation.
- Mismatched confirmation.
- Provider update failure.
- Successful update.

### Authentication

- Login with updated password.
- Rejection of previous password as applicable.
- Session behavior after reset.
- Sign-out behavior.

### Manager Authorization

- Active manager after recovery.
- Inactive manager after recovery.
- User without staff role.
- Non-manager role.
- Failed role lookup.

### Security

- No token logging.
- No password logging.
- No exposed privileged credentials.
- Safe account enumeration behavior.
- Approved redirect destinations.

### Production

- Correct production domain.
- Correct Supabase URL configuration.
- Correct email delivery.
- HTTPS.
- End-to-end successful recovery.

## Deployment Considerations

### Vercel

The application is deployed through Vercel.

### Production Domain

    https://finandfeatherslv.live

### Environment Variables

Production Supabase configuration must match the intended project.

### Redirect URLs

Recovery redirects must be approved in the Supabase authentication settings.

### Preview Deployments

Preview URLs may require separate configuration and testing.

### Email Delivery

Provider email settings must work in the intended deployment environment.

### Build Validation

Authentication changes should pass the application's build process.

### Regression Testing

Password recovery changes must not break existing manager sign-in or authorization.

### Rollback

Deployment rollback does not automatically revert Supabase Auth configuration changes.

### Verification

Test recovery in the actual target environment before declaring the feature production-ready.

## Implementation Roadmap

### Stage 1 — Inspect Existing Authentication Source

Review login, recovery, callback, and password update routes.

### Stage 2 — Review Supabase Configuration

Confirm recovery email settings, redirect URLs, and token behavior.

### Stage 3 — Identify Missing Functionality

Compare current implementation against the required recovery workflow.

### Stage 4 — Approve User Experience

Confirm recovery messaging, password policy, and navigation.

### Stage 5 — Implement Missing Components

Add only the required recovery routes, forms, and callbacks.

### Stage 6 — Verify Security

Test token handling, account enumeration, session behavior, and authorization.

### Stage 7 — Test End to End

Complete the recovery process in local and production environments as appropriate.

### Stage 8 — Operational Handoff

Document manager instructions and support escalation procedures.

### Scheduling

This sequence is proposed and does not establish a committed delivery date.

## Implementation Status

| Capability | Status |
|---|---|
| Supabase Auth foundation | Implemented |
| Server-side Supabase client | Implemented |
| Manager authorization helper | Implemented |
| Active manager role requirement | Implemented |
| Unauthenticated redirect | Implemented |
| Unauthorized redirect | Implemented |
| Password recovery entry point | Source verification pending |
| Password reset request form | Source verification pending |
| Recovery email invocation | Source verification pending |
| Recovery email delivery configuration | Verification pending |
| Recovery callback route | Source verification pending |
| Recovery token validation | Verification pending |
| Password update form | Source verification pending |
| Password update provider integration | Source verification pending |
| Post-recovery session handling | Verification pending |
| Post-recovery manager authorization | Enforced by existing helper |
| Expired link recovery experience | Verification pending |
| Account enumeration protections | Verification pending |
| Production redirect configuration | Verification pending |
| End-to-end password recovery testing | Verification pending |

## Related Documentation

- [Authentication Overview](README.md)
- [Supabase Authentication](supabase-auth.md)
- [Manager Invitations](manager-invitations.md)
- [Admin Dashboard Overview](../04-admin-dashboard/README.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Database Overview](../06-database/README.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Deployment Overview](../07-deployment/README.md)
- [Vercel Deployment](../07-deployment/vercel-deployment.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Troubleshooting](../08-operations/troubleshooting.md)
- [Master Documentation Index](../README.md)

---

[Back to Authentication Overview](README.md)
