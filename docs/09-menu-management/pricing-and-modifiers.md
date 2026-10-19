# MENU MANAGEMENT — Pricing and Modifiers

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Audience:** Restaurant Managers, Menu Administrators, Developers, and QA Reviewers

**Implementation Status:** Menu pricing administration established; exact modifier controls, special-pricing behavior, and production acceptance require verification

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Pricing Objectives](#pricing-objectives)
3. [Current Implementation](#current-implementation)
4. [Pricing Source of Truth](#pricing-source-of-truth)
5. [Pricing Architecture](#pricing-architecture)
6. [Standard Menu Prices](#standard-menu-prices)
7. [Market-Price Items](#market-price-items)
8. [Modifier Fundamentals](#modifier-fundamentals)
9. [Modifier Types](#modifier-types)
10. [Sauce Options](#sauce-options)
11. [Protein Additions](#protein-additions)
12. [Other Item Options](#other-item-options)
13. [Modifier Pricing](#modifier-pricing)
14. [Required and Optional Selections](#required-and-optional-selections)
15. [Modifier Group Relationships](#modifier-group-relationships)
16. [Adding Modifiers](#adding-modifiers)
17. [Editing Modifiers](#editing-modifiers)
18. [Removing Modifiers](#removing-modifiers)
19. [Changing Base Prices](#changing-base-prices)
20. [Special Pricing](#special-pricing)
21. [Promotional Scheduling](#promotional-scheduling)
22. [Pricing Display Standards](#pricing-display-standards)
23. [Price Calculation Rules](#price-calculation-rules)
24. [Validation and Error Prevention](#validation-and-error-prevention)
25. [Database Representation](#database-representation)
26. [Manager Authorization](#manager-authorization)
27. [Toast POS Pricing Boundaries](#toast-pos-pricing-boundaries)
28. [Common Manager Workflows](#common-manager-workflows)
29. [Public Menu Verification](#public-menu-verification)
30. [Troubleshooting](#troubleshooting)
31. [Testing and Acceptance](#testing-and-acceptance)
32. [Future Enhancements](#future-enhancements)
33. [Implementation Roadmap](#implementation-roadmap)
34. [Implementation Status](#implementation-status)
35. [Related Documentation](#related-documentation)

---

## Purpose

This document defines how prices and modifiers should be maintained in the Fin & Feathers Las Vegas menu management system.

Pricing accuracy is essential because menu information influences guest expectations and restaurant operations.

The menu contains items with standard prices, market-price designations, and optional selections that may carry additional charges.

The guide covers:

- Standard prices.
- Market-price items.
- Modifier groups.
- Sauce choices.
- Protein additions.
- Optional selections.
- Additional charges.
- Special pricing.
- Price calculations.
- Administrative validation.
- Public display.
- External ordering boundaries.
- Testing and troubleshooting.

The approved restaurant menu spreadsheet remains the source of truth for item-specific pricing and modifiers.

## Pricing Objectives

### Accuracy

Display approved prices.

### Consistency

Use consistent pricing conventions.

### Transparency

Communicate additional charges clearly.

### Manager Usability

Make supported price changes straightforward.

### Data Integrity

Prevent malformed or inconsistent pricing records.

### Guest Confidence

Avoid misleading price presentation.

### Modifier Clarity

Ensure options are associated with the correct dishes.

### Promotional Accuracy

Keep standard pricing distinct from specials.

### Security

Restrict price changes to authorized personnel.

### Verification

Confirm changes on the public website.

## Current Implementation

**Status:** Core menu administration implemented

### Administrative Route

    /admin/menu

### Database

    Supabase PostgreSQL

### Authentication

    Supabase Auth

### Authorization

    requireManager()

### Established Capabilities

- Menu item administration.
- Item pricing management.
- Menu item editing.
- Existing $5 specials toggle.
- Menu data displayed publicly.

### Modifier Support

Modifier data is represented in the established menu content.

### Verification Boundary

The exact administrative controls for creating, editing, and removing modifier groups require inspection of the current implementation.

### Future Functionality

Advanced promotional scheduling and direct Toast POS synchronization are not established as deployed.

## Pricing Source of Truth

The approved restaurant menu spreadsheet defines the baseline menu prices and options.

### Primary Reference

    Approved Fin & Feathers Las Vegas menu spreadsheet

### Source Information

The spreadsheet contains:

- Item names.
- Base prices.
- Market-price designations.
- Available choices.
- Additional charges.
- Category assignments.
- Item descriptions.

### Operational Changes

Restaurant management may approve changes after the original import.

### Reconciliation

Approved subsequent changes must be distinguished from historical spreadsheet values.

### External Ordering

Toast may maintain separate prices and modifiers.

### Verification

Compare the public website against the latest approved restaurant pricing.

### Important Boundary

Historical examples in this document are not proof of current prices.

## Pricing Architecture

Pricing may involve several distinct concepts.

### Base Price

The standard listed price for an item.

### Market Price

An item whose current selling price is not represented by a fixed public amount.

### Modifier Charge

An additional amount associated with a selection.

### Special Price

A temporary or promotional price.

### Display Price

The amount or designation shown to the guest.

### Calculated Price

The result of combining supported pricing components.

### External Checkout Price

The amount calculated by an external ordering provider.

### Tax

Tax calculations are not established as part of the public menu editor.

### Service Charges

Restaurant service-charge policies must not be confused with item prices.

### Implementation Boundary

The actual pricing data model and calculation behavior require code and schema verification.

## Standard Menu Prices

Standard prices should follow restaurant approval.

### Price Format

Use the application's supported currency representation.

### Positive Values

Avoid invalid negative prices.

### Decimal Precision

Use appropriate currency precision.

### Price Changes

Confirm management approval.

### Item Identity

Verify the correct item before editing.

### Modifier Review

Check whether additional charges remain accurate.

### Special Review

Check whether promotional settings are affected.

### Save

Use the supported administrative operation.

### Public Verification

Confirm the displayed price.

### External Ordering

Verify Toast pricing separately when applicable.

## Market-Price Items

Some dishes use market pricing.

### Historical Examples

The original menu included market-price offerings such as:

- Snow Crab Legs.
- Lobster Tails.
- Lobster & Grits.
- Honey Bourbon Salmon.

### Historical Qualification

The current market-price inventory requires verification against approved menu data.

### Display Designation

    MKT

### Guest Presentation

The public menu should communicate the market-price designation clearly.

### Administrative Entry

Use the implemented representation for market-priced items.

### Fixed Price Avoidance

Do not invent a fixed price for a market-price item.

### Modifier Charges

Review whether applicable options have separate charges.

### External Ordering

Toast may require a different market-price handling process.

### Verification

Confirm the public display matches restaurant policy.

## Modifier Fundamentals

A modifier is an item-specific selection or customization.

### Purpose

Allow guests to understand available choices.

### Examples

- Sauce choices.
- Protein additions.
- Preparation selections.
- Ingredient options.
- Paid upgrades.

### Parent Item

Modifiers must be associated with the intended dish.

### Modifier Group

Related choices may be organized together.

### Price Effect

Some selections add a charge.

### Optionality

Selections may be optional or required.

### Public Display

Guests should understand what each choice means.

### Administrative Support

The exact current editor controls require verification.

### Future Integration

Modifier mapping will matter if direct Toast POS integration is developed.

## Modifier Types

Modifiers may be grouped by their operational purpose.

### Flavor

Sauces and seasoning choices.

### Protein

Optional protein additions.

### Preparation

Approved cooking or preparation choices.

### Ingredient

Optional additions or substitutions.

### Upgrade

A paid replacement or enhancement.

### Included Choice

An option without an additional charge.

### Paid Choice

An option carrying an approved surcharge.

### Multiple Selection

A group that may permit more than one choice.

### Single Selection

A group that permits one choice.

### Implementation Boundary

These are conceptual modifier types, not confirmed database enum values.

## Sauce Options

The original menu includes sauce choices for selected dishes.

### Historical Examples

- Lemon pepper.
- BBQ.
- Mild.
- Hot.
- Honey hot.

### Historical Pricing

Honey hot carried an additional $1 charge in the original menu data.

### Applicable Items

Examples include wings and tenders.

### Item-Specific Rules

Do not automatically apply sauce choices to unrelated items.

### Naming

Use approved labels.

### Pricing

Verify any current surcharge.

### Grouping

Keep sauce selections associated with the correct dishes.

### Display

Communicate paid options clearly.

### Verification

Test the public presentation.

### Source

Use the latest approved spreadsheet or subsequent approved changes.

## Protein Additions

Some menu items allow additional protein choices.

### Historical Taco Options

Selected tacos included:

- Shrimp.
- Steak.
- Salmon.

### Historical Taco Surcharge

    +$4

### Historical Wrap Options

Selected wraps included:

- Catfish.
- Shrimp.
- Salmon.

### Historical Wrap Surcharges

    Catfish: +$6
    Shrimp: +$8
    Salmon: +$8

### Salad Additions

Historical salad options included chicken, salmon, shrimp, steak, and lobster.

### Pricing Qualification

Do not assume all salad protein additions share the same price.

### Verification

Confirm current options and charges before publication.

## Other Item Options

Some menu items support additional selections.

### Cheese

Selected sandwiches historically included a cheese addition.

### Historical Cheese Surcharge

    +$2

### Preparation Choices

Some dishes may offer approved preparation options.

### Side Choices

Only include side substitutions or upgrades supported by the menu data.

### Ingredient Options

Use restaurant-approved ingredient changes.

### Restrictions

Do not introduce unsupported customizations.

### Pricing

Confirm each applicable charge.

### Item Association

Options must belong to the correct item.

### Display

Use clear labels.

### Verification

Check the public menu after editing.

## Modifier Pricing

Modifier charges must be accurate.

### Base Price Separation

Keep the standard item price distinct from additional charges.

### Surcharge

Use the approved modifier amount.

### Zero-Cost Options

An included choice should not add an unintended charge.

### Negative Charges

Do not use negative amounts unless the approved pricing model explicitly supports them.

### Duplicate Charges

Avoid applying the same surcharge twice.

### Multiple Selections

Verify whether charges are additive.

### Group Restrictions

Respect supported selection limits.

### Market-Price Items

Do not infer a total from an unknown market price.

### External Ordering

Do not assume the website and Toast calculate modifiers identically.

### Verification

Review both the stored values and guest-facing labels.

## Required and Optional Selections

Modifier groups may have different selection requirements.

### Required Selection

The guest must choose an option when the application supports such behavior.

### Optional Selection

The guest may omit the choice.

### Minimum Selection

A group may define a minimum number of choices.

### Maximum Selection

A group may define a maximum number of choices.

### Single Choice

Only one selection is permitted.

### Multiple Choices

More than one selection may be permitted.

### Default Selection

A default may be configured where supported.

### Implementation Boundary

The current public menu may display options informationally rather than functioning as a complete ordering configurator.

### Validation

Do not document unverified ordering interactions as deployed.

### Toast

Actual checkout selection requirements may be controlled by Toast.

## Modifier Group Relationships

Modifier groups should remain associated with approved items.

### Parent Item

Identify the dish.

### Group Name

Use an understandable label.

### Options

Include only approved selections.

### Charges

Associate the correct amount with each option.

### Reuse

Shared groups should be reused only when supported and appropriate.

### Item-Specific Differences

Avoid applying one group's prices to another dish without approval.

### Data Integrity

Prevent orphaned modifier references.

### Deletion

Review dependencies before removing a group.

### Verification

Confirm that affected items display the correct choices.

### Schema Boundary

The exact relationship model requires database inspection.

## Adding Modifiers

Modifier creation must follow the current implemented workflow.

### Step 1 — Confirm Approval

Verify the option is approved.

### Step 2 — Identify Item

Locate the intended menu record.

### Step 3 — Review Existing Options

Avoid duplicates.

### Step 4 — Open Editing

Use the supported item-editing controls.

### Step 5 — Identify Modifier Controls

Confirm the current editor supports the intended operation.

### Step 6 — Enter Name

Use approved wording.

### Step 7 — Enter Charge

Use the approved surcharge.

### Step 8 — Configure Selection Rules

Use only implemented controls.

### Step 9 — Save

Submit the supported update.

### Step 10 — Verify

Check the public menu.

## Editing Modifiers

Modifier changes may affect guest expectations.

### Step 1 — Identify Item

Confirm the correct dish.

### Step 2 — Locate Modifier

Find the intended option.

### Step 3 — Confirm Change

Obtain approval.

### Step 4 — Update Label

Use approved wording.

### Step 5 — Update Charge

Enter the approved amount.

### Step 6 — Review Related Options

Check group consistency.

### Step 7 — Save

Use the implemented operation.

### Step 8 — Confirm Persistence

Reopen the item if necessary.

### Step 9 — Verify Public Display

Check labels and surcharges.

### Step 10 — Review External Ordering

Update Toast separately where required.

## Removing Modifiers

Removing an option may affect existing menu records.

### Implementation Boundary

The exact modifier deletion capability requires verification.

### Approval

Confirm the option is discontinued.

### Parent Item

Identify every affected dish.

### Shared Groups

Check whether other items use the same group.

### Pricing

Review the remaining options.

### Defaults

Ensure no deleted option remains selected by default.

### Validation

Check required-selection constraints.

### Save

Use only the approved supported operation.

### Verification

Confirm the option no longer appears where inappropriate.

### Recovery

Preserve an appropriate record of significant changes.

## Changing Base Prices

Price changes should be controlled.

### Step 1 — Obtain Approval

Confirm the new standard price.

### Step 2 — Identify Item

Locate the correct record.

### Step 3 — Review Current Price

Confirm the existing amount.

### Step 4 — Review Modifiers

Identify related charges.

### Step 5 — Review Specials

Check promotional settings.

### Step 6 — Enter New Price

Use the supported format.

### Step 7 — Save

Submit the update.

### Step 8 — Confirm Persistence

Check the saved record.

### Step 9 — Verify Public Menu

Confirm the guest-facing amount.

### Step 10 — Review Toast

Check external ordering prices separately.

## Special Pricing

The existing editor includes a $5 specials toggle.

### Established Capability

A special-pricing control is implemented.

### Operational Approval

Use only approved promotions.

### Base Price

Maintain the approved standard price.

### Special State

Confirm the current toggle behavior.

### Display

Verify how the public menu presents the special.

### Activation

Do not assume automatic scheduling.

### Deactivation

Confirm how the special is removed.

### Testing

Test the control in an authorized environment.

### Future Development

Advanced SPECIALS scheduling is planned.

### Documentation

Record significant promotions through the approved operational process.

## Promotional Scheduling

The project plans more advanced promotional management.

### Example

    Today's Special (Tuesday) — F&F Taco Tuesday Platter

### Future Requirements

Potential capabilities include:

- Day-of-week scheduling.
- Start and end dates.
- Automatic activation.
- Automatic expiration.
- Item association.
- Promotional pricing.
- Manager approval.
- Public display.
- Scheduling conflict detection.

### Current Boundary

These advanced scheduling capabilities are not established as implemented.

### Existing Toggle

The $5 specials toggle is a separate current capability.

### Future Design

Scheduling should preserve normal item pricing and avoid unintended permanent changes.

## Pricing Display Standards

Guest-facing prices should be understandable.

### Currency

Display fixed prices consistently.

### Market Price

Use the approved market-price designation.

### Modifier Charge

Show additional charges clearly.

### Base Price

Avoid confusing standard prices with promotional prices.

### Special Price

Communicate approved promotions accurately.

### Typography

Keep amounts readable.

### Mobile

Ensure prices do not overlap descriptions.

### Long Labels

Support modifiers with longer names.

### Accessibility

Do not communicate price differences through color alone.

### Verification

Test representative fixed-price and market-price items.

## Price Calculation Rules

Pricing calculations must follow the implemented application behavior.

### Conceptual Example

A fixed-price item may have a base price and one or more modifier charges.

### Illustrative Formula

    Item Total = Base Price + Applicable Modifier Charges

### Example

A $15 item with an approved $1 modifier would have a conceptual subtotal of $16.

### Qualification

This example is illustrative, not evidence that the public website performs checkout calculations.

### Multiple Modifiers

Only add charges permitted by the item's rules.

### Market Price

Do not calculate a total when the base amount is unknown.

### Specials

Apply promotional logic only according to implemented rules.

### Tax

Tax handling is outside the established menu-display calculation.

### Service Charge

The restaurant's service policy is separate from base item pricing.

### Toast

External checkout totals are governed by the external ordering system.

## Validation and Error Prevention

Pricing inputs require appropriate validation.

### Required Values

Enforce the actual schema's required fields.

### Numeric Format

Reject malformed fixed-price amounts.

### Negative Values

Reject unsupported negative charges.

### Decimal Precision

Use valid currency precision.

### Market Price

Handle market-price items through the approved representation.

### Duplicate Modifiers

Avoid unintended duplicate options.

### Invalid Groups

Reject unsupported modifier relationships.

### Special Conflicts

Avoid contradictory standard and promotional settings.

### Server Validation

Do not rely solely on browser validation.

### Error Messages

Provide actionable feedback.

### Partial Success

Check persistence before repeating failed saves.

## Database Representation

Pricing and modifiers are stored through the application's data model.

### Provider

    Supabase PostgreSQL

### Item Records

Store approved menu information.

### Base Prices

Use the deployed pricing field structure.

### Market Price

Use the supported representation.

### Modifier Groups

Follow the implemented relationship model.

### Modifier Charges

Store values in the appropriate supported format.

### Specials

Preserve the existing special-related data structure.

### Constraints

Use schema validation to prevent invalid records.

### RLS

Restrict unauthorized modifications.

### Schema Verification

Exact tables and columns require inspection of the current database documentation and migrations.

## Manager Authorization

Pricing changes are protected administrative actions.

### Authentication

    Supabase Auth

### Authorization

    requireManager()

### Role Table

    staff_roles

### Required Role

    manager

### Required State

    is_active = true

### Anonymous Access

Anonymous users must not modify prices.

### Non-Manager Access

Non-managers must not perform restricted pricing changes.

### Inactive Managers

Inactive managers must not retain administrative privileges.

### Database Security

RLS must enforce intended permissions.

### Verification

Test both permitted and denied operations.

## Toast POS Pricing Boundaries

The website currently links to external Toast online ordering.

### Current Ordering

Guests use the external Toast ordering destination.

### Direct Synchronization

A direct Toast POS API integration is not established as implemented.

### Website Prices

Website pricing is maintained through the menu system.

### Toast Prices

Toast may maintain its own pricing configuration.

### Modifier Mapping

Modifiers may differ between systems.

### Market Pricing

Market-price handling may require special integration rules.

### Specials

Promotions may require separate configuration.

### Discrepancies

Restaurant staff should investigate material differences.

### Future Integration

Direct synchronization requires technical and operational evaluation.

### Security

Do not assume POS access or payment processing exists within the website.

## Common Manager Workflows

### Workflow A — Update a Base Price

1. Confirm management approval.
2. Open Menu Management.
3. Locate the item.
4. Review existing pricing.
5. Enter the new amount.
6. Save.
7. Verify the public menu.
8. Check Toast separately if required.

### Workflow B — Change a Sauce Surcharge

1. Identify the affected dish.
2. Confirm the approved sauce price.
3. Open the supported modifier controls.
4. Update the charge.
5. Save.
6. Verify the public display.

### Workflow C — Add a Protein Option

1. Confirm the option is approved.
2. Identify the correct item.
3. Review existing protein choices.
4. Add the supported option.
5. Set the approved surcharge.
6. Save.
7. Verify the public menu.

### Workflow D — Review Market Price

1. Identify the market-priced item.
2. Confirm restaurant policy.
3. Review the editor's market-price representation.
4. Save only approved changes.
5. Verify the public designation.

### Workflow E — Review a Special

1. Confirm promotional approval.
2. Locate the intended item.
3. Review the existing $5 specials toggle.
4. Use only verified functionality.
5. Save where appropriate.
6. Verify public presentation.

## Public Menu Verification

Pricing changes should be checked from the guest's perspective.

### Step 1 — Open Public Menu

Use the intended website environment.

### Step 2 — Locate Item

Find the correct category and dish.

### Step 3 — Check Base Price

Confirm the approved amount.

### Step 4 — Check Market Price

Verify the correct designation where applicable.

### Step 5 — Check Modifier Labels

Confirm available options.

### Step 6 — Check Modifier Charges

Verify each applicable surcharge.

### Step 7 — Check Special Presentation

Review promotional display if relevant.

### Step 8 — Test Mobile

Confirm prices remain readable.

### Step 9 — Test Desktop

Check wider layout behavior.

### Step 10 — Record Results

Document discrepancies and corrections.

## Troubleshooting

### Incorrect Base Price

Inspect the saved record and public display.

### Modifier Charge Missing

Review the modifier configuration.

### Duplicate Modifier

Check whether a previous save succeeded.

### Wrong Item Association

Review the parent item relationship.

### Market Price Display Incorrect

Confirm the supported market-price representation.

### Special Price Unexpected

Inspect the existing special-related control.

### Save Failure

Review validation, authorization, and database errors.

### Price Appears Stale

Investigate caching and data retrieval behavior.

### Toast Price Differs

Check Toast separately; synchronization is not established.

### Unauthorized Change

Escalate as a security or access incident.

### Persistent Error

Provide sanitized evidence to the technical administrator.

## Testing and Acceptance

### Base Pricing

- [ ] Fixed prices display correctly.
- [ ] Approved price changes persist.
- [ ] Invalid prices are rejected.

### Market Pricing

- [ ] Market-price items display correctly.
- [ ] No invented fixed price is displayed.

### Modifiers

- [ ] Supported options display correctly.
- [ ] Approved surcharges display correctly.
- [ ] Item-specific associations remain correct.
- [ ] Invalid modifier relationships are rejected where enforced.

### Specials

- [ ] Existing $5 specials toggle behaves as implemented.
- [ ] Standard pricing is preserved appropriately.

### Security

- [ ] Anonymous pricing changes are rejected.
- [ ] Non-manager changes are rejected.
- [ ] Inactive manager changes are rejected.
- [ ] Authorized manager changes work.

### Public Display

- [ ] Mobile presentation is correct.
- [ ] Desktop presentation is correct.

### Evidence

Record actual results before declaring acceptance.

## Future Enhancements

Potential improvements include:

### Dedicated Modifier Editor

Manage groups and options independently.

### Bulk Price Updates

Apply approved changes across selected items.

### Price History

Track significant pricing revisions.

### Approval Workflow

Require authorization for sensitive price changes.

### Scheduled Pricing

Support approved future-effective prices.

### Advanced SPECIALS

Manage day-specific promotions.

### Validation Reports

Identify missing or inconsistent prices.

### Spreadsheet Reconciliation

Compare database prices against approved source data.

### Toast Synchronization

Evaluate direct pricing and modifier mapping.

### Audit Logging

Track who changed pricing and when.

### Implementation Boundary

These enhancements are proposals, not confirmed deployed functionality.

## Implementation Roadmap

### Stage 1 — Audit Current Pricing Model

Inspect menu schema and application behavior.

### Stage 2 — Confirm Modifier Controls

Review the actual administrative interface.

### Stage 3 — Reconcile Approved Prices

Compare the database with approved restaurant data.

### Stage 4 — Verify Market Pricing

Test market-price representation.

### Stage 5 — Verify Modifier Charges

Test representative option groups.

### Stage 6 — Verify Specials

Confirm the existing $5 specials toggle.

### Stage 7 — Verify Security

Test authorization and RLS.

### Stage 8 — Train Managers

Review pricing-change procedures.

### Stage 9 — Evaluate Enhancements

Prioritize operational improvements.

### Scheduling

This roadmap does not establish committed completion dates.

## Implementation Status

| Capability | Status |
|---|---|
| Menu item pricing administration | Implemented |
| Protected manager access | Implemented |
| Supabase database integration | Implemented |
| Public menu price display | Implemented |
| Existing $5 specials toggle | Implemented |
| Historical modifier examples | Documented |
| Current approved price reconciliation | Pending |
| Exact modifier creation controls | Verification pending |
| Exact modifier editing controls | Verification pending |
| Exact modifier deletion controls | Verification pending |
| Modifier group schema audit | Pending |
| Market-price behavior audit | Pending |
| Special-pricing behavior audit | Pending |
| Production pricing acceptance tests | Pending |
| Production modifier acceptance tests | Pending |
| Comprehensive RLS testing | Pending |
| Advanced SPECIALS scheduling | Planned |
| Bulk price editing | Proposed |
| Pricing audit history | Proposed |
| Direct Toast POS synchronization | Under evaluation |

## Related Documentation

- [Menu Management Overview](README.md)
- [Menu Editor Guide](menu-editor-guide.md)
- [Categories and Subcategories](categories-and-subcategories.md)
- [Adding and Editing Items](adding-editing-items.md)
- [Menu Images](menu-images.md)
- [SPECIALS Management](specials-management.md)
- [Publishing Updates](publishing-updates.md)
- [Menu Troubleshooting](troubleshooting.md)
- [Website Menu System](../02-website/menu-system.md)
- [Admin Menu Management](../04-admin-dashboard/menu-management.md)
- [Manager Permissions](../04-admin-dashboard/manager-permissions.md)
- [Database Schema](../06-database/schema.md)
- [Database Access Policies](../06-database/access-policies.md)
- [Manager Guide](../08-operations/manager-guide.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Operations Troubleshooting](../08-operations/troubleshooting.md)
- [Changelog](../08-operations/changelog.md)
- [Toast POS Integration Overview](../10-toast-pos-integration/integration-overview.md)
- [Master Documentation Index](../README.md)

---

[Back to Menu Management Overview](README.md)
