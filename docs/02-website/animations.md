# Homepage Animations

**Project:** Fin & Feathers Las Vegas

**Documentation Status:** In Development

**Implementation Status:** Implemented; source and browser verification pending

**Primary Route:** /

**Last Documentation Review:** October 19, 2026

---

## Table of Contents

1. [Purpose](#purpose)
2. [Animation Design Principles](#animation-design-principles)
3. [Animation Architecture](#animation-architecture)
4. [Homepage Entrance Sequence](#homepage-entrance-sequence)
5. [Logo Neon Flicker](#logo-neon-flicker)
6. [Header Entrance](#header-entrance)
7. [Slogan Animations](#slogan-animations)
8. [Primary Button Animations](#primary-button-animations)
9. [Virtual Tour and Food Video](#virtual-tour-and-food-video)
10. [Scroll Reveal System](#scroll-reveal-system)
11. [Responsive Animation Behavior](#responsive-animation-behavior)
12. [Reduced-Motion Accessibility](#reduced-motion-accessibility)
13. [Performance Considerations](#performance-considerations)
14. [Animation Testing](#animation-testing)
15. [Troubleshooting](#troubleshooting)
16. [Implementation Status](#implementation-status)
17. [Related Documentation](#related-documentation)

---

## Purpose

This document describes the established
animation design for the Fin & Feathers
Las Vegas website.

The animations reinforce the restaurant's
visual identity and introduce homepage
content in a coordinated sequence.

The documentation covers:

- Initial page-load animations.
- Logo effects.
- Header and slogan entrances.
- Primary action buttons.
- Featured media.
- Scroll-triggered reveals.
- Responsive behavior.
- Accessibility.
- Performance and testing.

Animation timing values documented here
represent previously established design
requirements.

The current implementation must be
verified against the application source.

## Animation Design Principles

The animation system follows several
established principles.

### Brand Presentation

The restaurant logo uses a
neon-inspired lighting effect.

The effect should resemble
a sign turning on before
stabilizing at full brightness.

### Coordinated Timing

Homepage elements should appear
in a deliberate sequence.

The sequence should feel connected
rather than presenting unrelated
animations with long pauses.

### Visual Subtlety

Animations should enhance
the website without distracting
from its primary purpose.

### Content Accessibility

Animation must not prevent
customers from accessing
important information or controls.

### Mobile-First Behavior

Animation behavior must remain
appropriate for mobile devices.

### Reduced Motion

Users requesting reduced motion
should receive an accessible
alternative presentation.

## Animation Architecture

The website uses a combination
of CSS animations and React
component behavior.

### Global Styles

The established global stylesheet is:

    src/app/globals.css

This stylesheet manages
animation keyframes and
supporting visual styles.

### Scroll Reveal Component

The established scroll reveal
component is:

    scroll-reveal.tsx

The exact current source path
and component implementation
require verification.

### IntersectionObserver

The scroll reveal system uses
browser visibility detection.

The established approach uses
IntersectionObserver to identify
when sections enter the viewport.

### CSS Animation Responsibilities

CSS controls visual properties
such as:

- Opacity.
- Translation.
- Animation timing.
- Easing.
- Delays.
- Keyframe transitions.

### React Responsibilities

React components coordinate
content structure and
scroll-triggered behavior.

The exact separation of
responsibilities must be
verified in the current code.

## Homepage Entrance Sequence

The established entrance sequence
includes:

1. Logo neon flicker begins.
2. Header fades into view.
3. Slogan content becomes visible.
4. Supporting text reveals.
5. Primary buttons enter in sequence.
6. Featured media appears.
7. Lower-page sections animate
   as the visitor scrolls.

The intended result is a
continuous introduction.

### Sequence Coordination

The primary actions should
begin appearing while the
supporting slogan reveal
is progressing.

The featured media should
appear after the main
hero introduction.

### Timing Verification

The exact current timing
must be inspected in
the stylesheet and components.

The values below record
the established design targets.

## Logo Neon Flicker

### Purpose

The logo animation creates
a neon-sign activation effect.

### Established Behavior

The logo should:

- Begin near darkness.
- Flicker multiple times.
- Vary flicker frequency.
- Increase toward full brightness.
- Stabilize at full visibility.

### Flicker Cycles

The established requirement
is at least three distinct
flicker cycles.

The cycles should not
have identical timing.

### Base Duration

The established base duration is:

    1800ms

The current keyframe duration
and any responsive overrides
require source verification.

### Final State

After the flicker sequence,
the logo should remain
fully visible.

### Avoiding Unwanted Effects

The animation should not:

- Leave the logo dimmed.
- Repeat indefinitely.
- Create excessive flashing.
- Block navigation.
- Cause layout movement.

### Accessibility

The flicker effect must
be disabled or replaced
for reduced-motion users.

## Header Entrance

The website header uses
a fade-in animation.

### Established Duration

    1400ms

### Established Easing

    ease-out

### Timing Relationship

The header begins appearing
early during the logo
flicker sequence.

It should not wait until
the logo animation finishes.

### Final State

The header remains fully
visible and usable after
its entrance.

### Interaction Requirements

Navigation controls must
remain accessible.

Animation must not prevent
customers from using
the menu or other actions.

## Slogan Animations

The homepage includes
a primary slogan and
supporting message.

### Primary Slogan

    ELEVATED DINING MEETS SOUTHERN SOUL

The established entrance
uses a fade-in effect.

### Supporting Message

    Every dish crafted with fresh ingredients
    and genuine hospitality.

The supporting message uses
a left-to-right reveal.

### Established Reveal Duration

    2000ms

### Reveal Behavior

The supporting text should:

- Become visible early enough
  for the entire reveal.
- Reveal progressively
  from left to right.
- Maintain readable positioning.
- Finish without clipping text.

### Coordination

The supporting message reveal
is coordinated with the
primary button entrances.

### Responsive Requirements

The reveal must work when
text wraps onto multiple lines.

The animation must not
permanently hide content
on narrow screens.

## Primary Button Animations

The homepage includes
four primary actions:

- FULL MENU.
- RESERVATIONS.
- ORDER ONLINE.
- LEAVE A REVIEW.

### Established Effect

Buttons use staggered
fade-in animations.

The intended order is
left to right.

### Established Delays

| Button | Established Delay |
|---|---|
| FULL MENU | 1600ms |
| RESERVATIONS | 1750ms |
| ORDER ONLINE | 1900ms |
| LEAVE A REVIEW | 2050ms |

### Timing Relationship

The buttons begin appearing
during the supporting
slogan reveal.

They should not wait for
a long pause after the
supporting message finishes.

### Responsive Behavior

On mobile, the established
button layout uses two columns
and two rows.

The animation sequence
should remain understandable
in the mobile layout.

### Interaction

Buttons must remain usable
after their entrance.

Animation should not cause
unexpected navigation
or layout movement.

## Virtual Tour and Food Video

The homepage includes:

- Virtual Tour.
- Ribeye food video.

### Desktop Layout

The established desktop
presentation places featured
media alongside the hero.

### Entrance Timing

The established desktop
media entrance begins at:

    3600ms

This timing aligns with
the completion of the
hero introduction.

### Above-the-Fold Exception

The desktop Virtual Tour
and Ribeye sections are
excluded from the general
IntersectionObserver reveal
when displayed above the fold.

They use their coordinated
page-load entrance instead.

### Mobile Layout

The mobile layout positions
media beneath the main
hero presentation.

Its reveal behavior must
be verified independently.

### Media Accessibility

Animation must not interfere
with video controls or
virtual tour interaction.

## Scroll Reveal System

The website includes
scroll-triggered animations
for sections below the fold.

### Purpose

Scroll reveals introduce
content as the visitor
moves through the page.

### Established Visual Effect

The preferred effect is:

- Pronounced upward movement.
- Gradual fade-in.
- Smooth easing.
- Short delay after entering
  the viewport.

### Established Translation

    60px upward

The element begins below
its final position.

It moves upward into place.

### Established Fade Duration

    800ms

### Established Slide Duration

    1000ms

### Established Reveal Delay

    180ms

### Visibility Detection

The established implementation
uses IntersectionObserver.

The observer identifies
when a section enters
the viewport.

### Reveal Completion

Once revealed, content
should remain visible.

The current implementation
must be inspected to confirm
whether elements reveal
once or can reanimate.

### Previously Resolved Issue

An earlier implementation
did not trigger lower-page
reveals consistently.

The scroll-reveal component
was subsequently updated
to correct the behavior.

Current production behavior
should be verified.

### Above-the-Fold Handling

Content already visible
when the page loads
should not be unnecessarily
delayed by scroll detection.

The desktop Virtual Tour
and Ribeye sections use
their established exception.

## Responsive Animation Behavior

Animation behavior must
support different viewport sizes.

### Mobile

Verify:

- Logo visibility.
- Header timing.
- Wrapped slogan text.
- Two-column button layout.
- Media entrance.
- Scroll reveals.
- Touch interactions.

### Tablet

Verify:

- Intermediate layouts.
- Text wrapping.
- Media positioning.
- Section reveal timing.

### Desktop

Verify:

- Coordinated hero entrance.
- Media appearance at 3600ms.
- Above-the-fold exceptions.
- Lower-page scroll reveals.

### Orientation Changes

Changing device orientation
must not leave content hidden.

### Browser Zoom

Increased browser zoom
must not cause permanent
animation clipping.

## Reduced-Motion Accessibility

The website must respect
the user's operating-system
motion preference.

### CSS Media Query

The established accessibility
mechanism is:

    prefers-reduced-motion

### Expected Behavior

When reduced motion is requested:

- Logo flicker should be disabled.
- Entrance translations should stop.
- Staggered delays should be removed.
- Scroll reveal content should
  remain accessible.
- Important elements should
  appear without motion.

### Content Visibility

Disabling animations must not
leave elements at zero opacity.

All essential content
must remain visible.

### Interaction

Reduced-motion behavior
must not change the
functionality of buttons,
menus, modals, or media.

## Performance Considerations

Animations should be
implemented efficiently.

### Preferred Properties

Opacity and transform
are generally appropriate
for visual entrance effects.

### Avoiding Layout Changes

Animations should avoid
unnecessary changes to:

- Width.
- Height.
- Document flow.
- Element positioning.

### Media Loading

Large media assets should
not unnecessarily block
the homepage entrance.

### Observer Management

IntersectionObserver instances
should be managed appropriately.

Observers should not remain
attached to removed elements.

### Mobile Performance

Testing should consider:

- Lower-powered devices.
- Slower network connections.
- Browser rendering performance.
- Reduced-motion settings.

## Animation Testing

### Initial Page Load

- Reload the homepage.
- Confirm logo flicker.
- Confirm at least three
  varied flicker cycles.
- Confirm stable final logo.
- Confirm header entrance.
- Confirm slogan entrance.
- Confirm supporting text reveal.
- Confirm staggered buttons.
- Confirm featured media entrance.

### Timing

- Verify logo base duration.
- Verify header duration.
- Verify slogan reveal duration.
- Verify button delays.
- Verify desktop media timing.
- Verify scroll reveal timing.

### Scrolling

- Scroll through all sections.
- Confirm each intended
  section becomes visible.
- Confirm no content remains hidden.
- Confirm reveals do not
  trigger unexpectedly.

### Responsive

- Test narrow mobile screens.
- Test standard mobile screens.
- Test tablet layouts.
- Test desktop layouts.
- Test landscape orientation.

### Accessibility

- Enable reduced motion.
- Reload the homepage.
- Verify all content appears.
- Verify no required action
  depends on animation.
- Test keyboard navigation.

### Performance

- Inspect browser console errors.
- Check layout stability.
- Review animation smoothness.
- Test media playback.
- Inspect behavior under
  slower device conditions.

## Troubleshooting

### Logo Remains Dim

Inspect:

- Final keyframe values.
- Animation fill behavior.
- Element opacity.
- Reduced-motion overrides.

### Slogan Text Is Clipped

Inspect:

- Reveal container dimensions.
- Overflow behavior.
- Text wrapping.
- Responsive CSS.

### Buttons Appear Too Late

Inspect:

- Animation delays.
- Parent visibility.
- Supporting text timing.
- Responsive overrides.

### Media Does Not Appear

Inspect:

- Desktop entrance classes.
- Above-the-fold exceptions.
- Element opacity.
- Media loading state.

### Scroll Reveal Does Not Trigger

Inspect:

- IntersectionObserver setup.
- Element references.
- Observer thresholds.
- Initial visibility.
- Component mounting.
- Reduced-motion behavior.

### Content Remains Invisible

Inspect:

- Initial opacity.
- Reveal completion classes.
- CSS specificity.
- JavaScript errors.
- Reduced-motion overrides.

## Implementation Status

| Capability | Status |
|---|---|
| Logo neon flicker | Implemented |
| Multiple flicker cycles | Implemented; verification pending |
| Header fade-in | Implemented |
| Primary slogan entrance | Implemented |
| Supporting text reveal | Implemented |
| Staggered button entrances | Implemented |
| Desktop media entrance | Implemented |
| Desktop above-the-fold exception | Implemented |
| Scroll reveal component | Implemented |
| IntersectionObserver integration | Implemented |
| Lower-page reveal correction | Previously completed; regression testing pending |
| Responsive animation behavior | Implemented; verification pending |
| Reduced-motion support | Implemented; verification pending |
| Animation performance testing | Pending verification |

## Related Documentation

- [Website Overview](README.md)
- [Homepage](homepage.md)
- [Menu System](menu-system.md)
- [Reservation Form](reservation-form.md)
- [GALLERY](gallery/README.md)
- [Project Architecture](../01-project-overview/architecture.md)
- [Technology Stack](../01-project-overview/technology-stack.md)
- [Testing Checklists](../08-operations/testing-checklists.md)
- [Troubleshooting](../08-operations/troubleshooting.md)
- [Master Documentation Index](../README.md)

---

[Back to Website Overview](README.md)
