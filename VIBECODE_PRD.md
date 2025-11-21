# Vibecode Mobile App – Product Requirements Document

## 1. Background & Current State
- **Product**: Promorang web platform delivers creator and advertiser experiences spanning content discovery, funding, rewards, tiering, and extensive modal-driven workflows.
- **Tech stack**: Vite/React web client backed by Supabase (auth, storage, DB, real-time) and Vercel serverless APIs (Node routes under `backend/api/*`). Shared services include telemetry, error logging, role/type definitions, and navigation metadata.
- **Need**: A native React Native application (Vibecode) for iOS/Android that mirrors and extends the Promorang experience with mobile-first UX, offline resilience, push notifications, and device-level security.

## 2. Product Vision
Deliver a cohesive native app that:
1. Maintains feature parity with the current web ecosystem for creators, brands/advertisers, and admins.
2. Uses Supabase as the single source of truth while consuming existing Vercel APIs for orchestrated workflows (rewards, advertiser tooling, Manychat, etc.).
3. Adds mobile-native value (push notifications, offline caching, device telemetry, biometric security) without fragmenting logic from the web codebase.

## 3. Goals & Success Criteria
- **G1: Parity** – Users can authenticate, explore the home feed, manage content, funding, rewards, and advertiser operations exactly as on web.
- **G2: Reliability** – Crash-free sessions ≥ 99.5%, offline-safe actions for key flows (feed browsing, drafts).
- **G3: Engagement** – Push-enabled CTR ≥ 15%, daily active creator sessions +20% vs. web-only baseline.
- **G4: Operational efficiency** – Shared services/types between web and mobile to minimize divergence; <10% duplicated business logic.

## 4. Target Users & Personas
- **Creators**: Publish drops, manage profiles/settings, monitor rewards, interact with brands.
- **Advertisers/Brands**: Access advertiser dashboard, submit offers, manage sponsorships and funding.
- **Community/Visitors**: Limited browsing before authentication, guided onboarding.
- **Admins/Moderators**: Access admin-only screens, approvals, telemetry dashboards (subject to ProtectedRoute policies).

## 5. Scope
### In Scope
- React Native (TypeScript) app distributed on App Store/Play Store (baseline devices: iPhone 13, Pixel 6).
- Supabase integration: auth (email/password, OAuth), storage, functions, real-time.
- Vercel backend consumption for rewards, advertiser tools, Manychat, custom APIs (`backend/api/index.js`, `rewards.js`, etc.).
- Full translation of modal flows (30+) into native screens/sheets.
- Push notifications, deep linking, secure token storage, telemetry alignment.
- Shared packages for types/services (e.g., `supabaseClient`, `authService`, `userService`, `rewards`).
### Out of Scope (Phase 1)
- Redesign of existing backend schemas.
- New monetization models beyond what web currently supports (placeholder for later phases).

## 6. Assumptions & Dependencies
- Supabase project already configured with mobile keys, deep link domains, and storage buckets accessible from mobile.
- Vercel backend remains authoritative; any new mobile-specific endpoints (e.g., push token registration) will be added under `backend/api`.
- Mobile analytics (Sentry/Segment) integrates with existing telemetry event schema.
- React Native project will likely leverage Expo for development speed; final decision pending engineering alignment.

## 7. Functional Requirements
### 7.1 Authentication & Onboarding
1. Email/password auth with Supabase session persistence in secure storage.
2. OAuth flows via deep links replicating `OAuthCallback.tsx`/`AuthCallback.tsx`.
3. Master Key / 2FA (from `MasterKeyModal`) implemented with biometric unlock where available.
4. Error handling mirrors `ErrorBoundary`/`EnhancedErrorBoundary` semantics with graceful fallbacks.

### 7.2 Navigation & Layout
1. Bottom tab navigator (Home, Discover, Rewards, Profile, Settings, Advertiser/Growth Hub) referencing `navigation.ts` metadata.
2. Stack navigators per domain to render modal-equivalents as full screens or bottom sheets.
3. Layout debugger (from `LayoutDebugger.tsx`) available in QA builds to verify spacing/spacing tokens.

### 7.3 Home & Content
1. Home feed replicates `HomeFeed.tsx` and `Home.tsx` logic: personalized content, filters, infinite scroll, Supabase real-time updates.
2. Content cards support interactions: like/save/share/tip/edit/submit drop (role-dependent).
3. Modal translations:
   - `AddContentModal`, `EditContentModal`, `DropSubmissionModal`, `EditDropModal`.
   - Funding flows (`ContentFundingModal`, `FundingProjectModal`, `SponsorshipModal`, `MakeOfferModal`, `BuySharesModal`).
   - Sharing flows (`ShareContentModal`, `ShareModal`, `ListShareModal`, `ExternalMoveModal`).

### 7.4 Rewards & Economy
1. Rewards dashboard mirrors `rewards.ts` service: gem/gold balances, influence rewards, staking, referrals, tier upgrades.
2. Native screens for `GoldShopModal`, `GemStoreModal`, `StakingModal`, `TipModal`, `WithdrawalModal`, `CurrencyConversionModal`, `AchievementsModal`, `InfluenceRewardsModal`, `UserTierUpgradeModal`, `UpgradePlanModal`.
3. Integration with Vercel rewards API (`backend/api/rewards.js`) and Supabase stored procedures for balances.

### 7.5 Profile & Settings
1. User profile screens combine `Profile.tsx`, `UserProfile.tsx`, and `Profile` type definitions.
2. Settings stack (from `Settings.tsx` and subcomponents):
   - Role settings, content preferences, privacy, theme, payment preferences, notifications.
   - Theme switching uses shared `ThemeContext` tokens adapted for React Native.
3. Edit profile, verification (`InstagramVerificationModal`), and referral flows accessible.

### 7.6 Advertiser & Growth Hub
1. Advertiser dashboard with metrics, offer management, sponsored content pipeline referencing `AdvertiserDashboard.tsx` and `advertiser.ts`.
2. Growth Hub tools (from `growthHubService.ts`) to manage performance analytics and outreach.

### 7.7 Notifications & Social
1. Notification center equivalent to `NotificationCenter.tsx`, synced with push notifications (APNs/FCM).
2. Social shield and verification flows (`SocialShieldModal`, `BrandProfileModal`, `ReferralModal`, `InstagramVerificationModal`).

### 7.8 Admin & Protected Routes
1. Role gating replicates `ProtectedRoute.tsx` checks, using Supabase session + `roles.ts`.
2. Admin-only tools accessible via dedicated stack.

### 7.9 Error Handling & Telemetry
1. `errorLogger.ts`, `errorReportingService.ts`, `errorUtils.ts`, and `telemetry.ts` logic adapted for React Native to capture device info, network status, and app version.
2. Global error boundary similar to `EnhancedErrorBoundary` for fatal errors.

### 7.10 Offline & Sync
1. Local caching for profiles, feed snapshot, drafts using SQLite/AsyncStorage.
2. Mutation queue for submissions/funding when offline; surfaces status banners.

## 8. Non-Functional Requirements
- **Performance**: Initial load < 3s on baseline devices; frame drops < 5% at 60fps.
- **Security**: Tokens stored in Keychain/Keystore; biometric opt-in for high-risk actions (withdrawals, master key).
- **Accessibility**: Dynamic type, VoiceOver/TalkBack support, proper contrast.
- **Scalability**: Shared service layer to avoid branching logic; typed API client reused across platforms.
- **Reliability**: Automatic retries for API calls; background sync for notifications.

## 9. Architecture & Integration
- **Client Layers**:
  - UI components mirroring React web counterparts.
  - State management (e.g., Zustand/Redux Toolkit Query) for cache + server sync.
  - Shared services package (extracted from `frontend/src/react-app/services/*`) consumed by both web and mobile.
- **Backend**:
  - Supabase: auth, profile/content tables, functions, real-time.
  - Vercel: serverless functions for rewards, advertiser flows, Manychat, etc. Evaluate need for new endpoint `/api/push-token` to register device tokens.
- **Networking**: `api.ts` and `authService.ts` logic reused; ensure CORS headers allow mobile origins or rely on token-based auth only.
- **Push Notifications**: Device token registration, topic subscriptions (rewards updates, offers, funding status).
- **Deep Linking**: Custom scheme + universal links for OAuth callbacks, referral invites, drop previews.

## 10. Data Model Alignments
- Respect `profile.ts`, `types.ts`, `roles.ts`; extend with mobile-specific fields (e.g., `pushToken`, `deviceType`) via Supabase migrations.
- All reward/economy entities remain consistent with `rewards.ts` interfaces.

## 11. Milestones & Timeline (High-Level)
1. **Foundation (Weeks 1-3)**: Project setup, theming, navigation, Supabase auth, basic telemetry.
2. **Core Experience (Weeks 4-6)**: Home feed, profile, settings baseline, notification center (without push).
3. **Economy & Modals (Weeks 7-9)**: Rewards, funding, gem/gold shop, major modal translations.
4. **Advertiser & Growth Hub (Weeks 10-11)**: Dashboard, sponsorship workflows, analytics.
5. **Push & Offline (Weeks 12-13)**: Push notifications, offline caching, mutation queue.
6. **QA & Beta (Weeks 14-15)**: Layout debugger, performance tuning, TestFlight/Play beta, store readiness.

## 12. Risks & Mitigations
- **Scope creep**: Strict parity focus; new features require change control.
- **Shared logic divergence**: Mandate shared package for services/types; enforce via lint scripts.
- **Mobile auth complexity**: Early prototype for Supabase deep links; fallback to webview if necessary.
- **Push token handling**: Add backend endpoint early; ensure secure storage and revocation.

## 13. Open Questions
1. Expo vs. bare React Native (impact on native module requirements for secure storage/biometrics).
2. Preferred analytics provider for mobile (Sentry, Segment, Datadog?) and alignment with existing telemetry.
3. Need for mobile-specific vercel endpoints (push token, device telemetry) or if Supabase functions suffice.

## 14. Next Steps
1. Approve PRD scope and milestone plan.
2. Spin up RN repo, extract shared service/type package.
3. Prototype Supabase auth + deep linking.
4. Define push notification backend contract.

## 15. Visual & Motion System (Mobile)
### 15.1 Brand Color Application
- **Primary creator energy**: `#FF6B00` (Promorang orange) with tonal range `#FFF5F0` → `#331500` for gradients, CTA hierarchy, and reward highlights. Primary foreground stays white for WCAG contrast.
- **Secondary growth accent**: `#6C63FF` with tonal range `#F0F0FF` → `#151866`, used for advertiser dashboards, insights, and celebratory states (tier upgrades, referrals).
- **Neutral scaffolding**: Custom zinc/gray stack (`#FAFAFB`, `#F5F6FA`, `#EAECF0`, `#D0D5DD`, `#667085`, `#344054`, `#101828`) mirrors the web typography/background mix so shared designs feel consistent.
- **Status colors**: Success `#12B76A`, warning `#F79009`, error `#F04438`, info `#3E90F0` with light/dark companions pulled directly from Tailwind config to keep banners, badges, and toasts visually aligned across platforms.
- **Surface tokens**: Maintain the existing light (`#FAFBFC` background, `#FFFFFF` cards), dark (`#0D0D0D` background, `#141414` cards), and black/OLED (`#000000` background, `#080808` cards) themes so theming logic can be shared with minimal overrides. Store these as React Native theme objects mirroring `--pr-*` tokens for easy reuse.

### 15.2 Animated UI Language
- **Navigation & layout**: Custom bottom tab bar with animated gradients per tab, shared-element transitions when drilling from feed → detail → funding workflows, and spring-based bottom sheets replacing current modal stacks.
- **Content & rewards**: Supabase real-time updates animate in via Reanimated (card lift + glow), reward meters use liquid fills plus particle bursts (Lottie) for achievements, and gem/gold shops reuse the brand palette with neon glows for premium currencies.
- **Advertiser & analytics**: Animated charts (Victory Native/Reanimated SVG) use the secondary palette while metrics cards pulse subtly when new data arrives; sponsorship pipelines use progress rails that light up segment-by-segment.
- **Notifications & onboarding**: Guided onboarding borrows Duolingo-level delight—mascot/illustration sequences, biometric prompts with morphing gradients, and push-ready notification center with pulsating unread indicators.
- **Performance guardrails**: Cap animation frame drops <5% by using Reanimated 3 + Gesture Handler, offloading Lottie assets, and defining motion tokens (duration, easing, elevation) alongside the color tokens in the shared design system.

## 16. Repository Structure & RN Scaffolding
### 16.1 Folder Layout
- `apps/web/` → existing Vite client (rename current `frontend/` when convenient) continues to host the browser experience.
- `apps/mobile/` → new React Native project (Expo-managed workflow to start) with `app/`, `src/`, and `assets/` directories mirroring the web domain breakdown (auth, home, rewards, advertiser, settings, admin).
- `packages/shared/` → extracted TypeScript modules (types, Supabase/Vercel service clients, telemetry/error utilities, navigation metadata, role guards). Leveraged via local npm workspaces so both apps share a single codepath.
- `packages/ui-tokens/` → optional theme package exporting color/motion/elevation tokens as JSON + TypeScript enums for RN + web consumption (maps directly to the `--pr-*` CSS vars).
- Existing `backend/` and tooling folders stay untouched; add `packages/mobile-native-modules/` later if native bridges (secure storage/biometrics) need custom wrappers.

### 16.2 RN Project Scaffolding
1. Initialize Expo app under `apps/mobile` (`npx create-expo-app apps/mobile --template expo-template-blank-typescript`) and opt into Expo Router for file-based navigation.
2. Configure workspaces in the repo root `package.json` (e.g., `{ "workspaces": ["apps/*", "packages/*"] }`) so shared packages are linkable without manual `npm link`.
3. Inside `apps/mobile` create top-level structure:
   - `app/_layout.tsx`: stack configuration hooking into Theme + Supabase providers.
   - `app/(tabs)/index.tsx`, `discover.tsx`, `rewards.tsx`, `profile.tsx`, `settings.tsx`, `advertiser.tsx` to mirror the tab destinations defined in `navigation.ts`.
   - `app/modals/*` for former modal flows (funding, rewards, sharing) implemented as stack screens/bottom sheets.
   - `src/components`, `src/hooks`, `src/services` for RN-specific UI & bridging (push tokens, secure storage wrappers) while importing business logic from `packages/shared`.
4. Add `tsconfig.json` paths so `@promorang/shared` and `@promorang/ui-tokens` resolve cleanly in both RN + web bundlers.
5. Drop placeholder Storybook/Expo component gallery (`packages/ui-playground`) to validate theme + animation tokens independently.

### 16.3 Shared Service Extraction
1. Move `frontend/src/react-app/services/*`, `utils/*`, and `shared/types.ts` into `packages/shared/src/` and expose explicit entrypoints (`auth`, `user`, `content`, `rewards`, `roles`, `navigation`, `telemetry`, `error-handling`).
2. Replace internal relative imports in the web app with `@promorang/shared/*` to ensure the package boundary is clean; add Vitest/unit coverage to lock behavior.
3. For Supabase + network clients, abstract browser-specific storage (localStorage) via adapter interface so RN implementation can use SecureStore/Keychain seamlessly.
4. Export React hooks/providers (e.g., `useAuth`, `ThemeContext`, `TelemetryProvider`) from `packages/shared` when they are environment-agnostic; wrap them inside environment-specific shells in each app when DOM or native modules differ.

### 16.4 Tooling & Automation
- Extend root lint/test scripts to run `expo-doctor`, RN unit tests (`jest-expo`), and shared package linting as part of CI.
- Provide `scripts/dev:mobile`, `scripts/dev:web`, and `scripts/dev:all` commands to boot the appropriate app(s) with shared watch mode.
- Add Docs (`docs/mobile-architecture.md`) enumerating environment setup, emulator requirements, and bridging strategy for native modules so onboarding new engineers mirrors the existing `ENVIRONMENT_SETUP.md` flow.
