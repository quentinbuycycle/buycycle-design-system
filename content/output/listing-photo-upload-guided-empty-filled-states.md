---
title: "Listing Photo Upload — Guided Empty & Filled States"
author: "Quentin Guislain"
date: "2026-03-16"
team: "Product Team"
tags: ["Seller","Seller XP"]
prototypes:
  - "/prototypes/listing-photo-upload-guided-empty-filled-states.html"
finalPrototypes:
  - "/prototypes/index.html"
---

## Problem
Sellers creating listings lacked clear visual guidance on what photos to upload, leading to incomplete or low-quality submissions. The upload step had redundant information and no meaningful transition between empty and filled states, weakening the perceived quality of the flow.

## Solution
A streamlined upload step with a guidance pill strip inside the drop zone, an animated empty-to-filled state transition, and a compact reference strip that persists after upload. Redundant copy was removed to sharpen the information hierarchy.

## UX & UI Rationale
- Guidance pills inside the drop zone leverage proximity (Gestalt) — advice appears exactly where the action happens, not in separate text
- Staggered tile entrance animation (50ms delay per tile) provides spatial orientation and confirms the upload action succeeded (feedback principle)
- Removing duplicate angle/close-up copy from the description reduces cognitive load (Hick's Law) while the pills carry the same information
- Increased spacing (32px) between drop zone content blocks improves scanability and separates distinct action zones (Fitts's Law)
- Reference strip below the filled grid keeps guidance accessible without competing with the photo review task

## System Limitations
- No design system component for drop zones or file upload areas — required custom implementation with manual token application
- No guidance on transition/animation patterns between states within a single step — had to define animation choreography from scratch
- Progress bar component spec doesn't cover inline progress within accordion steps, only top-level page progress
- No pill/tag variant optimized for inline guidance (current chips are filter-oriented) — repurposed with custom styling
