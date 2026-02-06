---
title: "Sub-Category Chips & Interactive Navigation"
author: "Quentin Guislain"
date: "2026-02-06"
team: "Design"
tags: ["Buyer","Pre-transactional XP"]
prototype: "/prototypes/sub-category-chips-interactive-navigation.html"
---

## Problem
Users who drilled into a product sub-category had no way to pivot to adjacent sub-categories without navigating back to the explore screen. This added unnecessary friction to the browse-and-discover flow in a multi-sport marketplace.

## Solution
A chip-based related category row on the search results screen lets users pivot sub-categories in a single tap — hiding the active chip, revealing the previous one, updating the filter panel, and adjusting results count. Three screens (Explore, Search Results, Filter Panel) are connected with directional slide transitions: right for forward navigation, bottom for the filter modal.

## UX & UI Rationale
- Related category chips as low-commitment pivots reduce sub-category switching from 2 taps to 1\n- Hiding the active chip applies progressive disclosure — removing redundant info keeps every visible chip actionable\n- Pill styling for navigation chips vs. bordered styling for filter chips leverages Gestalt similarity to separate browsing from filtering\n- Directional transitions (slide-right for depth, slide-up for overlay) match iOS spatial mental models\n- Edge-bleed on horizontal scroll rows signals hidden content without needing explicit affordances

## System Limitations
- No chip component exists in the design system — related category pills and filter chips had to be built from scratch, causing 3–4 rounds of styling corrections\n- No transition or animation guidelines — easing curves, durations, and directional patterns were designed ad-hoc\n- No edge-bleed horizontal scroll pattern documented — the negative-margin technique needs rediscovery by other teams\n- No filter panel / settings list row pattern — stacked full-width rows with chevrons and tags had to be hand-built
