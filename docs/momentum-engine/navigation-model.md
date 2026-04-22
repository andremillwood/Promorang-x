# Momentum Engine Navigation Model

This document proposes the top-level information architecture for the app as it shifts toward Pulse, Gatherings, Memories, and agent-ready coordination.

## 1. Core Principle

Navigation should reflect the three user-facing loops:

1. join the pulse
2. show up and verify
3. keep the memory

## 2. Recommended Primary Navigation

### Mobile Bottom Navigation
- `Pulse`
- `Discover`
- `Create`
- `Vault`
- `Dashboard`

### Desktop Primary Navigation
- `Pulse`
- `Discover`
- `Vault`
- `Create`
- `Solutions`
- `Dashboard`

## 3. Screen Intent

### 3.1 Pulse
Purpose:
- live opportunities
- gatherings close to threshold
- creator drops
- urgency and momentum stream

Current repo alignment:
- likely evolves from or complements `Discover`
- should become the “what is forming now” surface

### 3.2 Discover
Purpose:
- broader browsing
- categories
- evergreen opportunity discovery
- venue and host exploration

Current repo alignment:
- current `Discover.tsx` remains useful
- should skew less urgent than Pulse

### 3.3 Create
Purpose:
- hosts create moments
- creators create content moments
- brands create sponsored activations
- venues configure capacity and perk-based experiences

Current repo alignment:
- builds on current create flows and dashboard actions

### 3.4 Vault
Purpose:
- memories
- rarity
- active perks
- collections
- impact profile

Current repo alignment:
- currently closest conceptual relative is the rewards area
- should become a first-class destination, not a buried dashboard tab

### 3.5 Dashboard
Purpose:
- role-specific control center
- host performance
- venue efficiency
- brand ROI
- creator O2O conversion
- admin and moderation tooling

## 4. Recommended URL Model

### Public / Participant
- `/pulse`
- `/discover`
- `/moments/:id`
- `/vault`
- `/memories/:id`

### Create
- `/create/moment`
- `/create/content-moment`
- `/create/campaign`

### Stakeholder Dashboards
- `/dashboard`
- `/dashboard/host`
- `/dashboard/venue`
- `/dashboard/brand`
- `/dashboard/creator`
- `/dashboard/admin`

## 5. Current Repo Mapping Recommendation

Near-term migration path:
- keep existing routes working
- add new primary routes gradually
- redirect old secondary screens into the new model over time

Suggested practical mapping:
- `/pulse` initially reuses Discover data with live-first sorting
- `/vault` can start as a dedicated evolution of rewards + saved + memory state
- `/create/moment` should be canonical instead of multiple create entry points

## 6. UX Rule

The user should never need to understand internal economic abstractions to navigate the app.

The nav should communicate:
- what is happening now
- what I can do
- what I own or have earned
- how I manage my role
