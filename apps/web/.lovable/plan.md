
# Promorang PRD v1.0 Alignment Assessment and Implementation Plan

## Executive Summary

This assessment compares the current Promorang implementation against the PRD v1.0 definition, identifying alignment status, required terminology changes, and missing Moment primitives that must be built.

---

## 1. Side-by-Side Assessment Table

| Component | Current Implementation | PRD Alignment | Action |
|-----------|----------------------|---------------|--------|
| **Hero Trust Stats** | "10K+ Moments Created", "50K+ People Joined", "500+ Cities" | Aligned | Keep - these are participation/execution metrics |
| **MomentsSection** | Discovery-oriented grid with participant counts | Aligned | Keep |
| **MomentCard** | Shows participants joined, spots left, rewards | Aligned | Keep |
| **ForBrands Section** | "Participants", "Redemption" stats shown | Aligned | Keep - operational metrics for brands |
| **ParticipantDashboard Stats** | "Moments Joined", "Check-ins", "Rewards Earned", "This Month" with +N | Partial | Rename "This Month +N" to "Joined This Month" - remove growth framing |
| **ParticipantDashboard** | "My Moment Canon" archive section | Aligned | Keep |
| **HostDashboard Stats** | "Total Moments", "Active Moments", "Total Participants", "Avg. per Moment" | Aligned | Keep - operational metrics |
| **BrandDashboard Stats** | "Total Campaigns", "Total Impressions", "Redemptions", "Active Campaigns" | Partial | Rename "Impressions" to "Participants Reached" |
| **BrandDashboard Table** | "Impressions", "Redemptions", "Rate" columns | Partial | Rename "Impressions" to "Participants" |
| **MerchantDashboard Stats** | "Total Venues", "Active Venues", "Weekly Traffic", "Growth" | Partial | Rename "Growth" to "Change" or remove percentage framing |
| **Analytics Page Header** | "Track your performance and engagement" | Misaligned | Reframe to "Review your participation records" |
| **Analytics Page Stats** | "Check-in Rate" with TrendingUp icon | Aligned | Keep - this is verification completion |
| **Analytics Charts** | "Participant Trend", "Participants by Moment" | Aligned | Keep - operational tracking |
| **CreateCampaign** | Uses "Campaign" terminology | Aligned | Keep for brand-facing, map externally |
| **Discover Page** | Search, filter, category pills | Aligned | Keep |
| **MomentDetail Page** | Join/Leave, host info, check-in, rewards | Aligned | Keep |
| **Rewards Page** | "Total Earned", "Available", "Claimed", "Expired" | Aligned | Keep - redemption tracking |
| **Check-in System** | QR code + code entry verification | Aligned | Keep |
| **Moments DB** | `is_active` boolean only | Missing | Add explicit lifecycle states |

---

## 2. Components Classification

### 2.1 Keep Unchanged
- `Hero.tsx` - Trust stats are participation-based
- `MomentsSection.tsx` - Discovery-oriented
- `MomentCard.tsx` - Participant counts are allowed
- `ForBrands.tsx` - Operational metrics for brand justification
- `Discover.tsx` - Discovery experience aligned
- `MomentDetail.tsx` - Core moment entry page
- `CheckIn.tsx` - Verification system
- `Rewards.tsx` - Redemption tracking
- `QRCodeDisplay.tsx` - Verification tool
- `ShareButton.tsx` - Social sharing
- `CreateMoment.tsx` - Creation wizard
- `EditMoment.tsx` - Moment management

### 2.2 Rename/Reframe
| File | Current | Change To |
|------|---------|-----------|
| `ParticipantDashboard.tsx` | "This Month" with +N and TrendingUp | "Joined This Month" with Calendar icon |
| `BrandDashboard.tsx` | "Total Impressions" | "Participants Reached" |
| `BrandDashboard.tsx` | Table column "Impressions" | "Participants" |
| `MerchantDashboard.tsx` | "Growth" with percentage | "Weekly Change" or remove |
| `Analytics.tsx` | "Track your performance and engagement" | "Review your participation records" |
| `Analytics.tsx` | Page title emoji | Remove chart emoji, use neutral |

### 2.3 Defer (Lower Priority)
- Push notification triggers
- Admin moderation dashboard
- Advanced deep link tracking
- Multi-role switching UI

---

## 3. Terminology Mapping (Internal to External)

Implement display utility for consistent terminology:

| Internal (Brand/System) | External (User-Facing) |
|------------------------|----------------------|
| Campaign | Moment (or "Sponsored Moment") |
| Activation | Experience |
| KPI | Record Summary |
| Performance | Participation Outcome |
| Impressions | Participants Reached |
| Engagement | Participation |

---

## 4. Missing Moment Primitives (Implementation Required)

### 4.1 Moment Lifecycle States (Critical)

**Current State:** Binary `is_active` boolean

**Required States:**
```
draft -> scheduled -> joinable -> active -> closed -> archived
```

**Database Migration:**
- Add `status` enum column to `moments` table
- Values: `draft`, `scheduled`, `joinable`, `active`, `closed`, `archived`
- Add transition logic based on `starts_at` and `ends_at`
- Update RLS policies to respect status

**UI Updates:**
- Host Dashboard: Show status badges with state names
- Moment Detail: Display current state clearly
- Analytics: Filter by lifecycle state

### 4.2 Moment Entry Page Enhancement (Critical)

**Current State:** Basic detail page exists

**Required Additions:**
- Explicit participation rules section
- Verification method disclosure (QR/code)
- Reward terms visibility
- Host profile prominence
- Clear state indicator (joinable/active/closed)

### 4.3 Moment Record View (Critical)

**Purpose:** Immutable summary after moment closes - the monetizable artifact

**Required New Component:** `MomentRecord.tsx`

**Content:**
- Immutable moment summary (title, date, location, host)
- Final participant count
- Verification completion count
- Rewards issued count
- Export capability (CSV/PDF stub)

**Access:** Available after moment status becomes `closed` or `archived`

### 4.4 Visibility Rules (Required for Create Moment)

**Current State:** All moments are public

**Required Addition to CreateMoment wizard:**
- Visibility selector: `open` | `invite` | `private`
- Invite flow for `invite` visibility (future enhancement)

---

## 5. Implementation Phases

### Phase 1: Language Cleanup (Low Risk)
1. Update `ParticipantDashboard.tsx`:
   - Change "This Month" label to "Joined This Month"
   - Replace TrendingUp icon with Calendar icon

2. Update `BrandDashboard.tsx`:
   - Rename "Total Impressions" to "Participants Reached"
   - Rename table column "Impressions" to "Participants"

3. Update `MerchantDashboard.tsx`:
   - Change "Growth" to "Weekly Change" (remove +/- percentage framing)

4. Update `Analytics.tsx`:
   - Change subheadline from "Track your performance and engagement" to "Review your participation records"

### Phase 2: Moment Lifecycle (Database + UI)
1. Database migration:
   - Add `status` column with enum type
   - Default to `joinable` for backward compatibility
   - Create trigger to auto-transition based on timestamps

2. Update `moments` queries:
   - Replace `is_active` checks with `status` checks
   - Discovery shows `joinable` and `active` moments
   - Past moments filter by `closed` or `archived`

3. UI status indicators:
   - Badge component for lifecycle state
   - Host controls for manual state transitions

### Phase 3: Moment Record View
1. Create `MomentRecord.tsx` component
2. Add route `/moments/:id/record`
3. Display immutable summary for closed/archived moments
4. Add export stub (CSV download of participant list)

### Phase 4: Enhanced Moment Entry Page
1. Add participation rules section
2. Add verification method disclosure
3. Improve host profile display
4. Add clear state indicator banner

### Phase 5: Visibility Rules
1. Add `visibility` column to `moments` table
2. Update CreateMoment wizard with visibility step
3. Update Discovery to respect visibility
4. Update RLS for visibility enforcement

---

## 6. Forbidden Metrics Audit

**Confirmed NOT Present (Good):**
- Followers
- Likes
- Views (except "Impressions" which will be renamed)
- Reach
- Engagement rate
- Trending / popularity rankings
- Leaderboards
- DAU / MAU surfaced to users
- Time-on-app surfaced to users

**No Removal Required** - Current implementation does not contain social comparison or attention vanity metrics.

---

## 7. Technical Details

### Database Schema Addition
```sql
-- Add moment lifecycle status
CREATE TYPE moment_status AS ENUM (
  'draft',
  'scheduled',
  'joinable',
  'active',
  'closed',
  'archived'
);

ALTER TABLE moments 
ADD COLUMN status moment_status NOT NULL DEFAULT 'joinable';

-- Add visibility
CREATE TYPE moment_visibility AS ENUM ('open', 'invite', 'private');

ALTER TABLE moments 
ADD COLUMN visibility moment_visibility NOT NULL DEFAULT 'open';

-- Create auto-status trigger
CREATE OR REPLACE FUNCTION update_moment_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.starts_at > NOW() THEN
    NEW.status = 'scheduled';
  ELSIF NEW.ends_at IS NOT NULL AND NEW.ends_at < NOW() THEN
    NEW.status = 'closed';
  ELSIF NEW.starts_at <= NOW() THEN
    NEW.status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Files to Modify
- `src/components/dashboards/ParticipantDashboard.tsx` - Label/icon changes
- `src/components/dashboards/BrandDashboard.tsx` - Terminology changes
- `src/components/dashboards/MerchantDashboard.tsx` - Remove growth framing
- `src/pages/Analytics.tsx` - Reframe copy
- `src/pages/MomentDetail.tsx` - Add status indicator, participation rules
- `src/pages/CreateMoment.tsx` - Add visibility selector
- New: `src/pages/MomentRecord.tsx` - Record view
- New: `src/components/MomentStatusBadge.tsx` - Status display

---

## 8. Summary

**Alignment Score:** ~80% aligned with PRD v1.0

**Critical Gaps:**
1. Moment lifecycle states (blocking proper record generation)
2. Moment Record view (monetizable artifact missing)
3. Minor terminology issues ("Impressions", "Growth", "Performance")

**No Architectural Changes Required** - Foundation is sound, adjustments are incremental.
