---
title: "Sub-Category Chips & Interactive Navigation"
description: "Designing a chip-based sub-category navigation system that lets users fluidly drill into product categories, refine filters, and move between explore, search results, and filter screens — all within a single interactive prototype."
date: "2026-02-06"
author: "Quentin Guislain"
tags: ["navigation", "filters", "chips", "sub-categories", "search", "mobile", "prototype", "interaction-design"]
prototype: "/prototypes/sub-category-chips-interactive-navigation.html"
thumbnail: ""
---

# Sub-Category Chips & Interactive Navigation

## Problem

buycycle's expansion into multi-sport categories created a two-level navigation challenge. The first level — sport category tabs (Bikes, Cycling Gear, Running, etc.) — was already defined. But once a user selects a sport category, they need to browse product sub-categories (Clothing, Accessories, Shoes, Fork, Drivetrain & Pedals) and then further narrow by related sub-categories within those results.

The existing browse flow had no mechanism for this second-level refinement. Users who tapped "Accessories" under Cycling Gear landed on a flat results list with no way to pivot to adjacent categories (Computers, Locks, Lights, Helmets) without going back and starting over. This created unnecessary friction in the discovery flow — especially for users who are browsing broadly and don't have a specific product in mind.

The design needed to solve three connected problems:
1. Let users move from sport categories into product sub-categories
2. Provide horizontal, low-commitment navigation between related sub-categories on the results screen
3. Connect the sub-category selection to the filter system so the full-screen filter panel reflects the user's current context

## Solution

A three-screen interactive prototype built as a single HTML file, recreated pixel-for-pixel from Figma designs:

**Screen 1 — Explore:** Sport category tabs (horizontally scrollable with icon + label, active state with bottom border indicator) sit below the search bar. Beneath them, product sub-category items are displayed as compact image + label cards in a horizontal scroll. Tapping any sub-category item navigates to Screen 2.

**Screen 2 — Search Results:** A row of **related category chips** — styled as subtle pills (`#F3F3F3` background, `50px` border-radius, `#535353` text) — sits above the filter/sort row. These chips represent adjacent sub-categories the user might want to pivot to. Tapping a chip:
- Hides that chip from the row (you're now viewing it, so it shouldn't appear as a navigation option)
- Reveals the previously selected chip back in the row
- Updates the Category tag on the filter panel to reflect the new selection
- Adjusts the results count

Below the chips, a standard filter row (Filter, Sort by, Category with active badge, Condition) provides access to the full filter panel.

**Screen 3 — Filter Panel:** A full-screen filter list (Category, Price, Brands, Location, Year, Condition, Seller type) with the Category row showing the currently selected sub-category as a tag. This screen reflects the state set by the related category chips.

**Transitions:** Screen 2 slides in from the right (forward navigation feel), Screen 3 slides up from the bottom (modal/panel feel). Both use a 350ms cubic-bezier easing for native iOS-like motion. Both horizontal scroll rows (related categories and filter chips) bleed past the screen edges to signal scrollability.

## UX & UI Rationale

**Related category chips as low-commitment pivots.** The core UX insight is that sub-category browsing in a marketplace is rarely linear. A user looking at Accessories might realize they actually want Computers (bike computers), or Lights, or Helmets. The chip row lets them pivot instantly without navigating back to the explore screen. This reduces interaction cost from 2 taps (back + new selection) to 1 tap (chip).

**Hiding the active chip** follows the principle of **progressive disclosure** and reduces visual noise. If you're viewing "Computers" results, showing a "Computers" chip in the related categories row is redundant information. Removing it and revealing the previously selected category keeps the chip count stable and the options always actionable. This pattern is borrowed from content recommendation systems where the current item is excluded from "related" lists.

**Pill styling for chips vs. bordered styling for filters** creates a clear visual hierarchy through **Gestalt's Law of Similarity**. Related category chips (rounded pills, muted background, no border) read as navigation — soft, browsable, exploratory. Filter chips (rectangular, bordered, with active states and badges) read as controls — functional, stateful, precise. Users don't need labels to distinguish the two rows; the visual language communicates purpose.

**Slide-from-right for results, slide-from-bottom for filters** leverages spatial mental models. Horizontal navigation (going "deeper" into content) slides laterally, matching the direction of the information hierarchy. The filter panel slides vertically because it's a modal overlay — a temporary layer on top of the current view, not a step forward in the navigation stack. This matches iOS conventions that users internalize.

**Edge-bleed on horizontal scroll rows** — both the chips and filters rows extend 16px past the right edge of the content padding. This is a deliberate affordance: content visibly cut off at the edge signals that more items exist beyond the viewport, inviting horizontal scroll without needing a "see more" label or scroll indicator.

## System Assessment

### Where the design system was a strength

**Design tokens translated directly to code.** The full token set — `--bg-primary` (#FCFCFC), `--bg-secondary` (#F3F3F3), `--content-primary` (#090907), `--content-tertiary` (#535353), `--border-quartenary` (#D0D0D0), etc. — mapped 1:1 from Figma variables to CSS custom properties. Every color in the prototype comes from a token, not a hardcoded value. This made Figma-to-code translation fast and predictable.

**The spacing system (16px content padding, 8px chip gaps, 4px icon-label gaps) was consistent** across all three Figma screens, which meant the CSS could reuse the same values without per-screen overrides. The 16px base padding created a rhythm that held across headers, content areas, and filter rows.

**Active state patterns were clear.** The filter chip active state (darker background + dark border + badge) was well-defined in Figma, which made the `filter-chip--active` modifier class straightforward. The sport tab active state (background tint + bottom border) similarly had unambiguous styling.

**Typography scale worked at every level.** 16px for primary labels, 14px for chips and secondary text, 12px for metadata (results count). Three sizes covered everything without any custom values.

### Where the design system limited the solution

**No chip component defined.** This was the biggest gap. The prototype needed two distinct chip variants — a navigational pill (related categories) and a functional filter chip (with optional icon, optional badge, active state). Neither existed as a component in the design system. The related category chip styling had to be reverse-engineered from the Figma file through multiple iterations: the initial interpretation included borders, wrong background color, wrong border-radius, and chevron icons that didn't belong. A defined chip component with documented variants (navigation, filter, status) would have eliminated 3–4 rounds of correction.

**No transition/animation guidelines.** The design system doesn't specify how screens should transition, what easing curves to use, or what duration is appropriate. The slide-from-right and slide-from-bottom animations were designed from scratch. For a mobile-first product, navigation transitions are a core part of the experience — the system should define standard transition patterns (push, modal, fade) with approved easing curves and durations.

**Related categories as a pattern is undefined.** The concept of "here are adjacent categories you might want to browse" doesn't exist as a documented pattern. How should these be styled? How should selection state work? What happens when you tap one? These behavioral questions had to be designed in-conversation. If this pattern will recur across sport categories, search results, and potentially seller pages, it needs system-level definition.

**Filter panel layout not standardized.** The filter screen's layout — grouped rows with a separated Category section and 24px gap — was hand-built from the Figma file. The design system doesn't define a "settings list" or "form rows" pattern for stacked, full-width interactive rows with chevrons. This pattern appears in filters, account settings, preferences, and more. Without a system-level definition, each implementation will vary in row height, padding, divider treatment, and chevron sizing.

**Edge-bleed scroll pattern not documented.** The technique of breaking horizontal scroll containers out of their parent's padding (negative margin + padding compensation) is a deliberate UX pattern used on both the chips and filters rows. The design system doesn't document this pattern or provide a utility class for it, so it was implemented ad-hoc and would need to be re-discovered by any developer encountering the same need.
