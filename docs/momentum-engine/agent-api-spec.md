# Momentum Engine Agent API Spec

This document defines how Promorang should expose machine-readable value to the global AI agent ecosystem.

## 1. Goal

Agents should be able to reason over Promorang as a structured opportunity graph, not as a collection of pages.

Agents should help users and partners:
- discover what matters
- choose what to do
- prepare for completion
- manage perks and legacy

Agents should not silently commit users to real-world obligations without explicit consent.

## 2. Agent Surface Areas

### 2.1 Discovery API
Purpose: find relevant opportunities.

Representative endpoints:
- `GET /api/agent/moments/discover`
- `GET /api/agent/gatherings/live`
- `GET /api/agent/content-moments/discover`
- `GET /api/agent/perks/eligible`

Representative query dimensions:
- user location cluster
- time window
- role
- travel tolerance
- proof complexity
- reward mode
- venue affinity
- creator affinity

### 2.2 Optimization API
Purpose: rank actions and opportunities.

Representative endpoints:
- `POST /api/agent/optimize/participant`
- `POST /api/agent/optimize/venue`
- `POST /api/agent/optimize/brand`
- `POST /api/agent/optimize/creator`

Representative outputs:
- best next opportunity
- expected legacy gain
- expected perk unlock
- threshold crossing likelihood
- venue saturation risk
- estimated proof friction

### 2.3 Execution API
Purpose: prepare and reserve action without overreaching.

Representative endpoints:
- `POST /api/agent/moments/:id/save`
- `POST /api/agent/moments/:id/join`
- `POST /api/agent/moments/:id/reserve`
- `POST /api/agent/moments/:id/add-to-calendar`
- `POST /api/agent/notifications/watch`

Constraint:
- actions that commit user participation should require explicit user authorization

### 2.4 Proof API
Purpose: help users complete moments correctly.

Representative endpoints:
- `GET /api/agent/moments/:id/proof-requirements`
- `POST /api/agent/proof/session`
- `POST /api/agent/proof/preflight`
- `POST /api/agent/proof/submit`

Representative outputs:
- required proof stack
- eligible verification windows
- geofence readiness
- venue code requirements
- missing proof steps

### 2.5 Legacy API
Purpose: let agents understand the user’s longer-term value.

Representative endpoints:
- `GET /api/agent/users/:id/memories`
- `GET /api/agent/users/:id/perks`
- `GET /api/agent/users/:id/impact-profile`
- `GET /api/agent/users/:id/collections/progress`

## 3. Canonical Response Shapes

### 3.1 Moment Object
```json
{
  "id": "moment_123",
  "title": "Sydney Secret at Fountain Plaza",
  "type": "hybrid",
  "pulse_state": "forming",
  "reward_modes": ["gems", "memory", "perk"],
  "venue_id": "venue_1",
  "creator_id": "creator_7",
  "gathering_threshold": 20,
  "threshold_progress": 14,
  "current_bonus": 1.5,
  "capacity_limit": 35,
  "cooldown_policy": {
    "type": "window",
    "minutes": 30
  },
  "proof_requirements": ["geofence", "venue_qr", "timestamped_media"],
  "safety_level": "managed"
}
```

### 3.2 Memory Object
```json
{
  "id": "memory_884",
  "rarity": "epic",
  "collection_key": "fountain-plaza-founders",
  "legacy_score": 180,
  "perk": {
    "benefit_type": "discount",
    "benefit_value": "10_percent",
    "expires_at": null
  }
}
```

### 3.3 Opportunity Recommendation
```json
{
  "moment_id": "moment_123",
  "recommended_for": "participant",
  "score": 0.92,
  "reasons": [
    "close_to_threshold",
    "high_legacy_gain",
    "low_travel_time",
    "active_creator_affinity"
  ],
  "risks": [
    "medium_proof_friction"
  ]
}
```

## 4. Example Agent Queries

### 4.1 Participant Agent
"What are the best two opportunities near me tonight that improve my legacy rank and can be completed in under 45 minutes?"

### 4.2 Venue Agent
"Which time window tomorrow is most likely to produce a safe gathering of 20 to 25 people?"

### 4.3 Brand Agent
"Which creator-led hybrid moments produce the best verified foot traffic for sportswear in Kingston?"

### 4.4 Creator Agent
"Which of my recent drops converted digital viewers into physical venue visits most efficiently?"

## 5. Authorization Model

Agents should operate with scoped permissions:

- `read:discover`
- `read:legacy`
- `read:proof`
- `write:save`
- `write:join`
- `write:reserve`
- `write:notify`

No agent should be allowed to:
- autonomously complete proof without user action
- commit the user to a real-world obligation without consent
- access precise individual movement data without explicit scope

## 6. Product Requirement

If Promorang wants to participate in the agentic economy, these APIs should be treated as first-class product surfaces rather than backend extras.
