---
title: "AI-Driven Save as Search for Wishlist"
author: "Lena Wittmann"
date: "2026-04-24"
team: "Product Design"
tags: ["Buyer","Pre-transactional XP"]
prototypes:
  - "/prototypes/buycycle_save_search.html"
  - "/prototypes/ai-driven-save-as-search-for-wishlist.html"
finalPrototypes: []
---

## Problem
Buycycle users save multiple listings across the same category and size without a way to get notified when new matching items are listed. The existing wishlist had no mechanism to convert repeated browsing intent into active saved searches.

## Solution
An AI clustering engine analyses the wishlist each session and surfaces a proactive Save as search nudge when 2+ items share category and size. A bottom sheet pre-populates criteria chips (category, size, frame material, shifting type, price ceiling) with optional brand and model-specific sub-searches.

## UX & UI Rationale
- Progressive disclosure: brand and model quick-add sections are hidden until the user actively engages, reducing cognitive load at first open
- AI transparency: green suggested chip styling vs confirmed blue signals AI origin so users know what to review before saving
- Fitts Law: the nudge row sits at the bottom of the list in the thumb zone, making it easy to reach on mobile
- User control: every chip is individually removable with undo so users are never locked into the AI suggestion
- Gestalt similarity: consistent ghost-chip pattern for brand and model quick-add communicates that both create separate parallel searches

## System Limitations
- No design system component for AI-surfaced suggestion chips; a green outlined chip variant had to be invented and should be standardised
- No bottom sheet spec exists; height, handle sizing, and animation timing were approximated from product screenshots
- Green (#0F6E56) doubles as both the AI feature colour and confirmation colour, creating semantic ambiguity; a dedicated AI colour token would help
