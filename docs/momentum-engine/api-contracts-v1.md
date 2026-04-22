# Momentum Engine API Contracts V1

This document translates the product model into application-facing API contracts that can be implemented on the current backend.

## 1. Product API Groups

### 1.1 Moments
- `GET /api/moments`
- `GET /api/moments/:id`
- `POST /api/moments`
- `PATCH /api/moments/:id`
- `POST /api/moments/:id/join`
- `POST /api/moments/:id/leave`

Extended response fields to support Momentum Engine:
- `moment_mode`
- `pulse_state`
- `gathering_threshold`
- `threshold_progress`
- `current_bonus_multiplier`
- `memory_enabled`
- `memory_rarity`
- `proof_mode`

### 1.2 Gatherings and Pulse
- `GET /api/pulse/live`
- `GET /api/moments/:id/pulse`
- `POST /api/moments/:id/pulse/refresh`

Representative response:
```json
{
  "moment_id": "uuid",
  "pulse_state": "forming",
  "threshold_progress": 12,
  "gathering_threshold": 20,
  "current_bonus_multiplier": 1.5,
  "saturation_risk": "low"
}
```

### 1.3 Proof and Verification
- `GET /api/moments/:id/proof-requirements`
- `POST /api/moments/:id/proof-submissions`
- `POST /api/proof-submissions/:id/review`

### 1.4 Memories and Vault
- `GET /api/memories`
- `GET /api/memories/:id`
- `GET /api/vault`
- `GET /api/perks/active`

### 1.5 Content Moments
- `GET /api/content-moments`
- `GET /api/content-moments/:id`
- `POST /api/content-moments/:id/engage`
- `GET /api/content-moments/:id/o2o-metrics`

### 1.6 Impact and Catalyst
- `GET /api/impact/profile`
- `GET /api/impact/events`
- `GET /api/catalysts/leaderboard`

## 2. Stakeholder Dashboard Endpoints

### Participant
- `GET /api/participant/pulse-feed`
- `GET /api/participant/vault-summary`
- `GET /api/participant/impact-summary`

### Host
- `GET /api/host/moments/performance`
- `GET /api/host/gatherings/formation`

### Venue
- `GET /api/venue/efficiency`
- `PATCH /api/venue/capacity-policy`

### Brand
- `GET /api/brand/o2o-performance`
- `GET /api/brand/memory-conversion`

### Creator
- `GET /api/creator/o2o-conversion`
- `GET /api/creator/content-moment-performance`

## 3. Recommended Backend Mapping

Current repo pattern:
- Express routes in `backend/api/*`
- service logic in `backend/services/*`

Suggested additions:
- `backend/api/momentum.js`
- `backend/api/memories.js`
- `backend/api/pulse.js`
- `backend/api/proof.js`
- `backend/api/impact.js`

Suggested services:
- `backend/services/momentumService.js`
- `backend/services/memoryService.js`
- `backend/services/proofService.js`
- `backend/services/impactService.js`

## 4. Compatibility Guidance

Do not break existing `moments` endpoints abruptly.

Safer approach:
- extend responses with Momentum Engine fields
- keep legacy consumers working
- progressively migrate screens to use richer objects

## 5. Immediate Engineering Recommendation

The first implementation contract worth building is:

1. `GET /api/moments/:id`
2. `GET /api/moments/:id/pulse`
3. `GET /api/moments/:id/proof-requirements`
4. `POST /api/moments/:id/proof-submissions`
5. `GET /api/vault`

That creates the minimum usable loop:
- discover
- join
- verify
- receive memory
- view persistence
