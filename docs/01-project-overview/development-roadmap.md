# Development Roadmap

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Roadmap Status:** Active Planning

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Development Strategy](#development-strategy)
3. [Current Project Status](#current-project-status)
4. [Phase 1 — Public Website](#phase-1--public-website)
5. [Phase 2 — Administrative Foundation](#phase-2--administrative-foundation)
6. [Phase 3 — Content Management](#phase-3--content-management)
7. [Phase 4 — Customer Engagement](#phase-4--customer-engagement)
8. [Phase 5 — External Integrations](#phase-5--external-integrations)
9. [Phase 6 — Commerce Expansion](#phase-6--commerce-expansion)
10. [Documentation Development](#documentation-development)
11. [Dependencies and Approvals](#dependencies-and-approvals)
12. [Testing and Release Criteria](#testing-and-release-criteria)
13. [Risks and Constraints](#risks-and-constraints)
14. [Roadmap Status Summary](#roadmap-status-summary)
15. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the phased development
strategy for the Fin & Feathers Las Vegas website.

The roadmap provides a planning reference for:

- Restaurant ownership.
- Authorized managers.
- Website developers.
- Technical administrators.
- Future integration partners.

It distinguishes:

- Existing functionality.
- Work currently in development.
- Planned enhancements.
- Features under evaluation.
- Capabilities requiring approval.

The roadmap is not a commitment to
specific delivery dates.

## Development Strategy

The project follows an incremental
development approach.

The original objective was to establish
a mobile-first restaurant website
with essential customer-facing functionality.

Subsequent development expands the website
into a manager-controlled platform.

The long-term direction includes:

- Restaurant content management.
- Reservation operations.
- Promotional scheduling.
- Loyalty program administration.
- Media management.
- Merchandise commerce.
- Potential Toast POS integration.

Each phase should preserve existing
working functionality.

### Development Principles

1. Inspect existing code before changes.
2. Implement one controlled change at a time.
3. Preserve established functionality.
4. Verify application behavior.
5. Protect customer and administrative data.
6. Avoid unnecessary dependencies.
7. Document completed work.
8. Obtain approval for significant changes.

## Current Project Status

The application has progressed beyond
its original static website scope.

Established functionality includes:

- Public restaurant website.
- Responsive homepage.
- Restaurant menu presentation.
- Reservation request interface.
- Homepage animations.
- Virtual tour.
- Food video presentation.
- Image gallery.
- Merchandise promotion.
- Loyalty program presentation.
- Supabase integration.
- Manager authentication.
- Admin Dashboard.
- Menu Management.
- Twilio reservation processing components.
- GitHub source control.
- Vercel deployment.

Some operational workflows require
additional end-to-end verification.

The administrative documentation center
is currently in the documentation
preparation stage.

## Phase 1 — Public Website

**Status:** Substantially Implemented

### Objectives

Establish the restaurant's public
website and primary customer interactions.

### Scope

- Mobile-first responsive design.
- Restaurant branding.
- Homepage presentation.
- Restaurant menu.
- Reservation request interface.
- Online ordering access.
- Customer review access.
- Virtual tour.
- Food video.
- Image gallery.
- Social media links.
- Merchandise promotion.
- Loyalty program presentation.
- Contact and event information.

### Visual Enhancements

Implemented animation work includes:

- Homepage logo effects.
- Slogan entrance animations.
- Staggered button entrances.
- Scroll reveal effects.
- Responsive animation behavior.

### Remaining Verification

- Confirm current production behavior.
- Verify mobile and desktop layouts.
- Verify public menu accuracy.
- Verify all external links.
- Verify media loading.
- Verify reservation form behavior.
- Complete applicable accessibility testing.

### Completion Criteria

Phase 1 should be considered
operationally verified when critical
customer-facing functionality passes
the approved testing checklist.

## Phase 2 — Administrative Foundation

**Status:** Partially Implemented

### Objectives

Establish secure manager access
and administrative infrastructure.

### Implemented Components

- Supabase authentication.
- Manager role verification.
- Server-side authorization helper.
- Admin Dashboard.
- Menu Management interface.
- Reservation management foundation.

### Authentication Requirements

Manager-only functionality must require:

- An authenticated session.
- An active staff role.
- The manager role.
- Appropriate database permissions.

### Planned Improvements

- Additional operational verification.
- Expanded manager documentation.
- Administrative navigation refinements.
- Manager invitation workflow verification.
- Password recovery workflow verification.
- Documentation center integration.

### Documentation Center

The planned documentation viewer
will be located at:

    /admin/docs

It will provide manager-only access
to the project's Markdown documentation.

The documentation source will remain
in the private project directory:

    docs/

The viewer must enforce server-side
manager authorization.

### Completion Criteria

- Manager authentication verified.
- Unauthorized access blocked.
- Existing admin functionality tested.
- Documentation viewer secured.
- Administrative navigation verified.

## Phase 3 — Content Management

**Status:** Planned; Menu Management Implemented

### Objectives

Allow authorized managers to maintain
restaurant content without modifying code.

### Menu Management

Existing functionality includes:

- Menu item creation.
- Menu item editing.
- Pricing updates.
- Category and subcategory assignment.
- Item tags.
- Menu image uploads.
- Active and inactive status.
- Display ordering.
- Existing $5 special flag.

### SPECIALS

Planned capabilities include:

- Selecting existing menu items.
- Configuring promotional pricing.
- Daily specials.
- Weekly specials.
- Recurring schedules.
- Start and expiration dates.
- Promotion visibility controls.

The planned scheduling system
is distinct from the existing
$5 special flag.

### GALLERY

Planned capabilities include:

- Uploading images.
- Replacing images.
- Reordering gallery items.
- Activating or hiding images.
- Managing public presentation.

### MERCH Presentation

Potential administrative capabilities include:

- Updating promotional imagery.
- Managing storefront links.
- Updating merchandise presentation.

Native commerce functionality
is evaluated separately.

### Completion Criteria

- Manager permissions verified.
- Content changes persist correctly.
- Public content updates are accurate.
- Upload workflows are secure.
- Scheduling behavior is tested.
- Existing public functionality remains intact.

## Phase 4 — Customer Engagement

**Status:** Planned and Partially Implemented

### Objectives

Improve customer engagement
and restaurant communication.

### F&F FAM CLUB

The website already includes
loyalty program presentation.

Potential future capabilities include:

- Program content management.
- Enrollment information management.
- Promotional messaging.
- Member communications.
- Manager-facing loyalty controls.

The precise integration requirements
must be established before development.

### Reservation Improvements

Potential improvements include:

- Administrative reservation workflows.
- Reservation status management.
- Staff notification refinements.
- Improved request tracking.
- Operational reporting.

The existing SMS request workflow
must remain distinct from a
confirmed reservation.

### Communication Compliance

SMS-related changes depend on:

- Appropriate customer consent.
- Approved messaging language.
- Required A2P registration.
- Verified delivery behavior.

### Completion Criteria

- Approved business requirements.
- Customer consent verified.
- Messaging compliance confirmed.
- Staff workflows tested.
- End-to-end behavior verified.

## Phase 5 — External Integrations

**Status:** Under Evaluation

### Toast POS Integration

Potential integration capabilities include:

- Menu synchronization.
- Modifier synchronization.
- Item availability.
- Native ordering.
- Order submission.
- Order status information.
- Payment processing.

### Feasibility Requirements

Before implementation:

1. Confirm Toast API eligibility.
2. Verify supported endpoints.
3. Determine required permissions.
4. Evaluate costs.
5. Establish authoritative data sources.
6. Confirm payment architecture.
7. Obtain ownership approval.

### Implementation Approach

The proposed sequence is:

- Feasibility research.
- Architecture design.
- Prototype.
- Development.
- Testing.
- Production launch.

No direct Toast API integration
is currently assumed to be operational.

### Completion Criteria

- Vendor access approved.
- Integration costs accepted.
- Data mapping verified.
- Failure handling tested.
- Security requirements satisfied.
- Production launch approved.

## Phase 6 — Commerce Expansion

**Status:** Under Evaluation

### Objectives

Evaluate direct merchandise purchasing
through the restaurant website.

### Proposed Capabilities

- Product catalog.
- Product variants.
- Inventory management.
- Shopping cart.
- Secure checkout.
- Payment processing.
- Shipping.
- Pickup options.
- Order management.
- Sales reporting.

### Platform Evaluation

Potential approaches include:

- Established commerce platform.
- Hosted checkout integration.
- Custom storefront architecture.

The selected approach must balance:

- Customer experience.
- Development costs.
- Recurring fees.
- Security responsibilities.
- Inventory management.
- Fulfillment requirements.
- Administrative complexity.

### Completion Criteria

- Platform selected.
- Ownership approval obtained.
- Payment requirements verified.
- Inventory behavior tested.
- Fulfillment procedures established.
- Production checkout verified.

The existing external merchandise
storefront should remain available
until a replacement is approved.

## Documentation Development

**Status:** In Development

The project documentation is organized
into eleven categories:

1. Project Overview.
2. Website.
3. Reservations.
4. Admin Dashboard.
5. Authentication.
6. Database & Storage.
7. Deployment.
8. Operations.
9. Menu Management.
10. Toast POS Integration.
11. Merchandise Commerce.

### Documentation Workflow

The documentation development process is:

1. Establish the master index.
2. Establish category indexes.
3. Create detailed Markdown documents.
4. Verify implementation-specific details.
5. Review internal links.
6. Review security and sensitive content.
7. Implement the manager-only viewer.
8. Test documentation navigation.
9. Verify authorization.
10. Maintain documentation as features change.

### Documentation Access

Documentation files will remain
outside the public directory.

The future viewer must enforce
manager-only authorization.

Documentation must not contain:

- API secrets.
- Passwords.
- Private access tokens.
- Sensitive customer information.
- Unapproved internal credentials.

## Dependencies and Approvals

Some development activities depend
on external approvals or decisions.

### Restaurant Ownership

Ownership approval may be required for:

- New administrative capabilities.
- Promotional business rules.
- Loyalty program changes.
- Commerce platform selection.
- Payment processing.
- Integration costs.
- Operational policies.

### Twilio

Live SMS workflows depend on:

- A2P approval.
- Messaging configuration.
- Approved consent language.
- Production delivery verification.

### Toast

Direct POS integration depends on:

- API eligibility.
- Supported integration capabilities.
- Vendor permissions.
- Commercial requirements.

### Merchandise Commerce

Native checkout depends on:

- Platform selection.
- Payment provider approval.
- Inventory requirements.
- Fulfillment policies.

## Testing and Release Criteria

Every development phase should include
appropriate verification.

### Code Quality

- TypeScript validation.
- Production build verification.
- Relevant lint checks.
- Git diff review.

### Functional Testing

- Public website behavior.
- Administrative functionality.
- Database operations.
- Media uploads.
- Reservation workflows.
- External integrations.

### Security Testing

- Authentication.
- Manager authorization.
- Database access policies.
- Storage permissions.
- Credential protection.

### Responsive Testing

- Mobile layouts.
- Tablet layouts.
- Desktop layouts.
- Interactive controls.
- Modal behavior.

### Release Approval

A feature should not be designated
production-ready until required
testing and approvals are complete.

## Risks and Constraints

Major project risks include:

- Third-party service dependencies.
- Integration approval delays.
- Unexpected vendor costs.
- Database permission errors.
- Authentication failures.
- Media storage issues.
- SMS delivery limitations.
- Payment security requirements.
- Changes affecting existing functionality.
- Incomplete operational documentation.

Mitigation measures include:

- Incremental development.
- Controlled source changes.
- Verification before deployment.
- Secure configuration management.
- Documented fallback procedures.
- Clear feature status tracking.

## Roadmap Status Summary

| Workstream | Status |
|---|---|
| Public website | Substantially Implemented |
| Homepage animations | Implemented |
| Public menu | Implemented |
| Reservation request form | Implemented |
| Twilio reservation processing | Implemented; live verification pending |
| Manager authentication | Implemented |
| Admin Dashboard | Implemented |
| Menu Management | Implemented |
| Reservation administration | In Development |
| Documentation indexes | Established |
| Detailed technical documentation | In Development |
| Manager-only documentation viewer | Planned |
| SPECIALS scheduling | Planned |
| F&F FAM CLUB management | Planned |
| GALLERY management | Planned |
| MERCH presentation management | Planned |
| Toast POS API integration | Under Evaluation |
| Native merchandise commerce | Under Evaluation |

## Related Documentation

- [Project Overview](README.md)
- [Application Architecture](architecture.md)
- [Technology Stack](technology-stack.md)
- [Website](../02-website/README.md)
- [Reservations](../03-reservations/README.md)
- [Admin Dashboard](../04-admin-dashboard/README.md)
- [Operations](../08-operations/README.md)
- [Menu Management](../09-menu-management/README.md)
- [Toast POS Integration](../10-toast-pos-integration/README.md)
- [Merchandise Commerce](../11-merch-commerce/README.md)
- [Master Documentation Index](../README.md)

---

[Back to Project Overview](README.md)
