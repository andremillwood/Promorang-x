# Momentum Engine Repo Implementation Map

This document maps the Momentum Engine strategy onto the current repository so implementation can start with minimal ambiguity.

## 1. Existing Frontend Areas That Already Fit

### Discovery and moments
- `apps/web/src/pages/Discover.tsx`
- `apps/web/src/pages/MomentDetail.tsx`
- `apps/web/src/pages/CreateMoment.tsx`
- `apps/web/src/components/MomentCard.tsx`

### Dashboards and stakeholder surfaces
- `apps/web/src/pages/Dashboard.tsx`
- `apps/web/src/components/dashboards/*`
- `apps/web/src/components/analytics/*`
- `apps/web/src/components/admin/*`

### Content and adjacent systems
- `backend/api/content.js`
- `content_items` and content share migrations
- existing advertiser campaign and content engagement structures

## 2. Suggested New Frontend Surfaces

### New pages
- `apps/web/src/pages/Pulse.tsx`
- `apps/web/src/pages/Vault.tsx`
- `apps/web/src/pages/MemoryDetail.tsx`

### New components
- `apps/web/src/components/pulse/PulseFeed.tsx`
- `apps/web/src/components/pulse/PulseTicker.tsx`
- `apps/web/src/components/vault/MemoryCard.tsx`
- `apps/web/src/components/vault/ActivePerksPanel.tsx`
- `apps/web/src/components/proof/ProofRequirementList.tsx`

## 3. Suggested Backend Additions

### New routes
- `backend/api/momentum.js`
- `backend/api/pulse.js`
- `backend/api/memories.js`
- `backend/api/proof.js`
- `backend/api/impact.js`

### New services
- `backend/services/momentumService.js`
- `backend/services/pulseService.js`
- `backend/services/memoryService.js`
- `backend/services/proofService.js`
- `backend/services/impactService.js`

## 4. Suggested Supabase Migration Groups

### Group A
Extend `moments`

### Group B
Create proof tables

### Group C
Create memories and perks tables

### Group D
Create pulse snapshots and impact tables

### Group E
Create content-moment linking and venue capacity policy tables

## 5. Recommended Sequence For Engineering

1. Schema migration package
2. Backend read endpoints for pulse, proof, vault
3. Frontend `Pulse` and `Vault`
4. Proof submission flow
5. Memory issuance and perk activation
6. Stakeholder dashboards using new objects

## 6. Recommended Sequence For Design

1. Pulse feed and live card language
2. Gathering active states
3. Vault and memory identity system
4. Proof flow UX
5. Creator content moment surfaces

## 7. Recommended Sequence For GTM

1. Tight neighborhood / venue cluster launch
2. creator + venue pair pilots
3. founder memory campaigns
4. proof-backed case studies for brands

This keeps the launch dense, credible, and operationally safe.
