---
title: "Related Items Discovery at End of Filtered Result Lists"
author: "Quentin Guislain"
date: "2026-02-19"
team: "Design"
tags: ["Buyer","Pre-transactional XP"]
prototypes:
  - "/prototypes/related-items-discovery-at-end-of-filtered-result-lists.html"
finalPrototypes:
  - "/prototypes/index.html"
---

## Problem
When buyers reach the bottom of a filtered product list, they hit a dead end with no guidance toward alternative items, causing unnecessary drop-off. The only option is to scroll back up and manually adjust filters, breaking browsing momentum and reducing product discovery.

## Solution
A discovery section was introduced below the last filtered result, combining a clear "end of results" separator with a contained browse bar offering related category chips. This keeps users in a forward-scrolling flow and surfaces adjacent inventory without requiring them to backtrack to filter controls.

## UX & UI Rationale
- Placing discovery at the natural scroll endpoint leverages existing momentum rather than fighting it (progressive disclosure).
- The visual separator with "End of filtered results" label sets clear expectations before presenting alternatives (visibility of system status — Nielsen).
- Category chips use a contained bar with a "Browse" label, creating a distinct visual hierarchy from the filter bar above (law of common region — Gestalt).
- Chip hover states invert to dark, matching the design system's selected chip pattern and providing strong affordance.
- Keeping related content in the same page context avoids disorienting navigation jumps (spatial consistency).

## System Limitations
- The chip component (filters/chips) lacks documented guidance for use outside of filter contexts — no pattern exists for "browse" or "discovery" chip groups embedded in content areas.
- No design system component exists for the contained browse bar (gray background + label + divider + chips), requiring a custom composition.
- The separator pattern ("End of filtered results" with horizontal rules) has no documented component — this was built from scratch.
