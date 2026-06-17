# Promorang UI/UX Overhaul Consolidation Matrix

This document turns the platform overhaul into a page and route decision matrix.

It is intended to answer:

- what stays
- what gets merged
- what gets renamed
- what becomes secondary
- what should be deprecated or redirected

This is the bridge between the product strategy in [DESIGN.md](../DESIGN.md) and implementation work in `apps/web/src/pages`.

## 1. Target Product Model

The primary product should resolve into:

- `Pulse`
- `Discover`
- `Create`
- `Vault`
- `Dashboard`

Secondary utility surfaces:

- `Search`
- `Activity`
- `Saved`
- `Wallet`
- `Settings`

Public marketing and partnership pages remain, but should not dominate the signed-in experience.

## 2. Decision Labels

- `Keep`: preserve as a first-class surface
- `Keep / Refine`: preserve, but redesign and simplify
- `Merge`: combine into another primary surface
- `Move Under`: keep functionality but relocate under a parent area
- `Rename`: preserve functionality with clearer naming
- `Deprecate`: remove over time and redirect
- `Admin Only`: keep out of normal participant navigation

## 3. Primary Surface Matrix

| Current Surface | Current Route(s) | Decision | Target Surface | Notes |
|---|---|---|---|---|
| `Pulse` | `/pulse` | `Keep / Refine` | `Pulse` | Should become the live-first home for urgency, forming moments, and threshold activity. |
| `Explore` | `/explore` | `Keep / Refine` | `Discover` | Route can stay, but product language should bias toward `Discover`. |
| `ExploreMoments` | `/explore/moments`, `/discover` | `Keep / Refine` | `Discover` | Canonical catalog of moments. |
| `ExploreVenues` | `/explore/venues` | `Keep / Refine` | `Discover` | Venue browsing should remain inside discovery. |
| `ExploreRewards` | `/explore/rewards` | `Move Under` | `Discover` and `Vault` | Public reward discovery is useful, but not as a top-level mental model. |
| `ExploreContent` | `/explore/content` | `Keep / Refine` | `Discover` | Content should remain browseable, but subordinate to moments and places. |
| `ForYou` | `/for-you` | `Merge` | `Pulse` or `Discover` | Personalized discovery should become a mode within the primary discovery experience, not a separate product lane. |
| `MomentDetail` | `/moments/:id` | `Keep / Refine` | `Moment Detail` | This should become the best and most complete product screen. |
| `CheckIn` | `/moments/:id/checkin` | `Keep / Refine` | `Moment Flow` | Keep as a task surface in the moment flow. |
| `MomentRecord` | `/moments/:id/record` | `Keep / Refine` | `Moment Flow` | Can remain as proof/memory capture in the canonical moment experience. |
| `EditMoment` | `/moments/:id/edit` | `Keep / Refine` | `Create / Dashboard` | Better framed as host editing within create/dashboard flow. |
| `CreateMoment` | `/create-moment`, `/dashboard/moments/create` | `Rename` | `/create/moment` | Make one canonical route and redirect other entry points. |
| `Vault` | `/vault` | `Keep / Refine` | `Vault` | Should absorb the retention and earned-value story. |
| `MemoryDetail` | `/memories/:id` | `Keep / Refine` | `Vault` | Good supporting object page for collectible memory detail. |
| `Dashboard` | `/dashboard` | `Keep / Refine` | `Dashboard` | Keep one shared shell with role-aware modules inside it. |

## 4. Economy Surface Matrix

| Current Surface | Current Route(s) | Decision | Target Surface | Notes |
|---|---|---|---|---|
| `Rewards` | `/dashboard/rewards` | `Merge` | `Vault` | Rewards and Vault are currently conceptually split but should become one earned-value experience. |
| `Wallet` | `/wallet` | `Keep / Refine` | `Wallet` | Keep as a utility surface for balances, transactions, redemption rules, and advanced value tools. |
| `PromoShare` | `/promoshare` | `Move Under` | `Vault` or `Wallet` | Valuable system, but not strong enough as a primary nav destination for most users. |
| `Marketplace` | `/shop` | `Keep / Refine` | `Discover` or `Wallet` | Local merchant commerce is useful, but should align with broader product positioning. |
| `TradingMarketplace` | `/marketplace` | `Move Under` | `Wallet > Advanced Assets` | Advanced economy feature, not primary user mental model. |
| `PiecePortfolio` | `/portfolio` | `Move Under` | `Wallet > Advanced Assets` | Keep but gate behind economy depth. |
| `PieceProfile` | `/pieces/:pieceType/:assetId` | `Move Under` | `Wallet > Advanced Assets` | Detail page for advanced users only. |
| `LiquidityDashboard` | `/liquidity` | `Move Under` | `Wallet > Advanced Assets` | Not top-level. |
| `KYCPage` | `/kyc` | `Move Under` | `Wallet` | Compliance utility only. |
| `FeaturedBooking` | `/featured` | `Move Under` | `Dashboard > Commercial` | Commercial upsell / ad-buying function. |

## 5. Participant Utility Matrix

| Current Surface | Current Route(s) | Decision | Target Surface | Notes |
|---|---|---|---|---|
| `Saved` | `/saved`, `/dashboard/saved` | `Keep` | `Saved` | Simple secondary utility. |
| `Activity` | `/activity`, `/dashboard/activity` | `Keep / Refine` | `Activity` | Keep as notifications/history stream. |
| `Following` | `/dashboard/following` | `Move Under` | `Activity` or `Profile` | Useful, but not top-level nav material. |
| `Search` | `/search` | `Keep / Refine` | `Search` | Cross-entity search remains valuable. |
| `UserProfile` | `/profile`, `/profile/:userId` | `Keep / Refine` | `Profile` | Profile should expose identity, role, standing, and memory/value context. |
| `Settings` | `/dashboard/settings` | `Keep` | `Settings` | Keep as a standard utility. |

## 6. Mission and Activation Matrix

| Current Surface | Current Route(s) | Decision | Target Surface | Notes |
|---|---|---|---|---|
| `WatchUnlock` | `/watch-unlock` | `Rename` | `Missions` | Clearer and less gimmicky name. |
| `ContentMissionDetail` | `/watch-unlock/:id` | `Rename` | `Mission Detail` | Keep as supporting page for creator/brand mission loop. |
| `Activate` | `/activate` | `Merge` | `Create` or `Discover` | Activation language overlaps with moments and campaigns; should not stand alone without a sharper product reason. |
| `BountyBoard` | `/bounties` | `Move Under` | `Missions` or `Dashboard` | Keep if strategically important, otherwise subordinate it. |
| `CreateBounty` | `/dashboard/bounties/create` | `Move Under` | `Create` | Avoid separate conceptual track unless bounty system is core. |
| `CampaignDetail` | `/dashboard/campaigns/:id` | `Keep / Refine` | `Dashboard` | Good role-specific operational page. |
| `CreateCampaign` | `/dashboard/campaigns/create`, `/dashboard/brand/campaigns/create` | `Rename` | `/create/campaign` | Unify entry and language. |
| `brand/CreateCampaign` | `/dashboard/brand/campaigns/create` | `Merge` | `/create/campaign` | One campaign creation flow with role-aware fields. |

## 7. Creation and Workspace Matrix

| Current Surface | Current Route(s) | Decision | Target Surface | Notes |
|---|---|---|---|---|
| `CreateProposal` | `/propose/new` | `Move Under` | `Dashboard > Commercial` | Specialist business workflow, not primary nav. |
| `ProposalWorkspace` | `/dashboard/proposals` | `Move Under` | `Dashboard > Commercial` | Keep for agencies/brands. |
| `ServiceCatalog` | `/dashboard/catalog` | `Move Under` | `Dashboard > Commercial` | Useful operational tool, not broad product identity. |
| `AddVenue` | `/dashboard/venues/add` | `Move Under` | `Create` or `Dashboard > Venues` | Venue creation should feel like a structured create flow. |
| `AddProduct` | `/dashboard/products/add` | `Move Under` | `Dashboard > Commerce` | Keep for merchants only. |
| `Gallery` | `/dashboard/gallery` | `Move Under` | `Dashboard` | Media ops tool. |
| `UGCReview` | `/dashboard/ugc-review` | `Move Under` | `Dashboard` | Moderation/review utility. |

## 8. Dashboard Role Matrix

| Current Surface | Current Route(s) | Decision | Target Surface | Notes |
|---|---|---|---|---|
| `ParticipantDashboardV2` | `/dashboard` | `Keep / Refine` | `Dashboard` | Participant dashboard should become lighter because Pulse/Discover/Vault carry more of the product. |
| `CreatorDashboardV2` | `/dashboard` by role | `Keep / Refine` | `Dashboard / Creator` | Keep role-specific panels, but unify shell and nav logic. |
| `HostDashboardV2` | `/dashboard` by role | `Keep / Refine` | `Dashboard / Host` | Keep role-specific task modules. |
| `BrandDashboardV2` | `/dashboard` by role | `Keep / Refine` | `Dashboard / Brand` | Keep, but make campaign loop more legible. |
| `MerchantDashboardV2` | `/dashboard` by role | `Keep / Refine` | `Dashboard / Merchant` | Keep, but reduce fragmentation. |
| `AgencyDashboard` | `/dashboard` by role | `Keep / Refine` | `Dashboard / Agency` | Useful but should not fork the product language too far. |
| `Analytics` | `/dashboard/analytics` | `Move Under` | `Dashboard` | Shared analytics module, not a separate top-level product category. |
| `Participants` | `/dashboard/participants` | `Move Under` | `Dashboard` | Supporting operational list/detail page. |
| `SponsorDashboard` | `/sponsor` | `Merge` | `Dashboard / Brand` | Redundant with brand dashboard direction. |
| `SponsorAnalyticsDashboard` | `/sponsor/analytics` | `Merge` | `Dashboard / Brand` | Fold into brand analytics. |

## 9. Public Marketing Matrix

| Current Surface | Current Route(s) | Decision | Target Surface | Notes |
|---|---|---|---|---|
| `Index` | `/` | `Keep / Refine` | `Homepage` | Public story should align tightly with momentum positioning. |
| `ForBrands` | `/for-brands` | `Keep / Refine` | `Solutions` | Partnership landing page. |
| `ForCreators` | `/for-creators` | `Keep / Refine` | `Solutions` | Partnership landing page. |
| `ForMerchants` | `/for-merchants` | `Keep / Refine` | `Solutions` | Partnership landing page. |
| `ForCommunities` | `/for-communities` | `Keep / Refine` | `Solutions` | Host/community landing page. |
| `ForAgencies` | `/for-agencies` | `Keep / Refine` | `Solutions` | Keep if agency GTM remains important. |
| `Hosting` | `/host` | `Deprecate` | `/for-communities` or `/create/moment` | Too ambiguous as a top-level route. |
| `WhyJoin` | `/why-join` | `Merge` | Homepage | Can likely be folded into homepage story. |
| `Pricing` | `/pricing` | `Keep / Refine` | `Pricing` | Important for B2B and commercial flows. |
| `Help` | `/help`, `/support` | `Keep` | `Help` | Straight utility page. |
| `Contact` | `/contact` | `Keep` | `Contact` | Standard utility. |
| `Terms` | `/terms` | `Keep` | `Legal` | Standard utility. |
| `Privacy` | `/privacy` | `Keep` | `Legal` | Standard utility. |
| `ProposeLanding` | `/propose` | `Move Under` | `Solutions` or `Commercial` | Keep if proposal-led sales motion matters. |

## 10. Discovery and Directory Matrix

| Current Surface | Current Route(s) | Decision | Target Surface | Notes |
|---|---|---|---|---|
| `Brands` | `/brands` | `Keep / Refine` | `Discover` | Public directory is consistent with SEO and partnerships. |
| `BrandProfile` | `/brands/:slug` | `Keep / Refine` | `Discover` | Good SEO and sponsor identity page. |
| `Merchants` | `/merchants` | `Keep / Refine` | `Discover` | Could be reframed as places or venues depending on strategy. |
| `Hosts` | `/hosts` | `Keep / Refine` | `Discover` | Good ecosystem directory if community layer matters. |
| `VenueProfile` | `/venues/:slug` | `Keep / Refine` | `Discover` | Important directory and SEO surface. |
| `CategoryArchive` | `/categories/:categorySlug` | `Keep` | `Discover` | SEO and content organization asset. |
| `LocationArchive` | `/locations/...` | `Keep` | `Discover` | SEO and place-based browsing asset. |
| `VenueReportTeaser` | `/venue-report/:id` | `Move Under` | `Commercial` | Specialized lead-gen surface. |

## 11. Admin Matrix

| Current Surface | Current Route(s) | Decision | Target Surface | Notes |
|---|---|---|---|---|
| `AdminDashboard` | `/admin` | `Admin Only` | `Admin` | Keep. |
| `PromoShareAdmin` | `/admin/promoshare` | `Admin Only` | `Admin` | Keep. |
| `FeaturedPlacementsAdmin` | `/admin/featured` | `Admin Only` | `Admin` | Keep. |
| `KYCAdminDashboard` | `/admin/kyc` | `Admin Only` | `Admin` | Keep. |
| `PiecesAdmin` | admin surface | `Admin Only` | `Admin` | Keep. |
| `SupportTickets` | `/support/tickets` | `Admin Only` or `Dashboard > Support` | `Support` | Depends on whether support is staff-only or stakeholder-facing. |
| `SupportTicketDetail` | `/support/tickets/:id` | `Admin Only` or `Dashboard > Support` | `Support` | Same note as above. |

## 12. Onboarding Matrix

| Current Surface | Current Route(s) | Decision | Target Surface | Notes |
|---|---|---|---|---|
| `AuthPage` | `/auth` | `Keep / Refine` | `Auth` | Keep simple and clean. |
| `AuthCallback` | `/auth/callback` | `Keep` | `Auth` | Utility route. |
| `Onboarding` | `/onboarding` | `Keep / Refine` | `Onboarding` | Should route into first success, not generic dashboard default. |
| `BrandOnboarding` | `/onboarding/brand` | `Merge` | `Onboarding` | Prefer role-aware branching within one onboarding architecture unless strong sales reasons exist. |

## 13. Deprecated or Legacy-Leaning Surfaces

These pages are either strategically fuzzy or duplicative enough that they should not shape the next IA:

- `Activate`
- `Hosting`
- `WhyJoin`
- separate `ForYou` as its own permanent primary surface
- separate `Rewards` as its own permanent primary surface
- separate `SponsorDashboard` outside the shared dashboard model
- top-level advanced economy routes in normal participant nav

## 14. Recommended Canonical Route Set

### Public / Participant

- `/`
- `/pulse`
- `/discover`
- `/moments/:id`
- `/vault`
- `/memories/:id`
- `/search`
- `/wallet`
- `/activity`
- `/saved`

### Create

- `/create/moment`
- `/create/mission`
- `/create/campaign`

### Role Workspaces

- `/dashboard`
- `/dashboard/creator`
- `/dashboard/host`
- `/dashboard/brand`
- `/dashboard/merchant`
- `/dashboard/agency`
- `/dashboard/admin`

### Public Directories

- `/brands`
- `/brands/:slug`
- `/venues/:slug`
- `/hosts`
- `/categories/:categorySlug`
- `/locations/:countrySlug`
- `/locations/:countrySlug/:citySlug`

## 15. Execution Sequence

### Phase 1: Structural cleanup

- make `Pulse`, `Discover`, `Vault`, and `Dashboard` the visible product spine
- establish canonical create routes
- de-emphasize advanced economy routes from default navigation

### Phase 2: Surface consolidation

- merge `Rewards` into `Vault`
- fold `ForYou` into the discovery model
- fold sponsor surfaces into brand dashboard
- unify campaign creation entry points

### Phase 3: Navigation and redirects

- redirect old create routes to canonical routes
- collapse duplicate dashboard paths
- trim top-level nav to core product destinations

### Phase 4: Advanced systems isolation

- relocate trading/liquidity/pieces/KYC into advanced wallet/dashboard areas
- keep these accessible but not identity-defining

## 16. Immediate Next Build Targets

If implementation begins now, the first screens to rebuild should be:

1. `Pulse`
2. `Discover`
3. `Moment Detail`
4. `Vault`
5. shared `Dashboard` shell

These five will establish the system for the rest of the app and make later route consolidation easier.
