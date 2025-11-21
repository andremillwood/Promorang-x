# Promorang Frontend Refactor Status

## Completed ✅

### Phase 1: Enhanced Dark Mode Theme System
- ✅ Updated CSS variables with richer dark tones
  - Dark theme: `#0D0D0D`, `#141414`, `#1C1C1C`
  - Black theme: `#000000`, `#080808`, `#101010`
- ✅ Fixed html/body to use `var(--pr-surface-1)` (eliminates white boxed effect)
- ✅ Updated all theme HSL values for better tonal separation

### Phase 2: Settings Page & Components
- ✅ Created `/src/react-app/pages/Settings.tsx`
  - Tab-based layout (Theme / Privacy / Content / Roles)
  - Responsive: stacked on mobile, side-by-side on desktop
  - Uses theme tokens throughout

- ✅ Created `/src/react-app/components/settings/ThemeSettings.tsx`
  - Light / Dark Grey / Pure Black selection
  - Saves to Supabase `user_metadata.theme`
  - Instant theme switching via ThemeContext

- ✅ Created `/src/react-app/components/settings/PrivacySettings.tsx`
  - Public profile / Followers-only / Private mode toggles
  - Activity display controls (points, keys, gems, shares, predictions)
  - Saves to Supabase `user_metadata.privacy`

- ✅ Created `/src/react-app/components/settings/ContentPreferences.tsx`
  - 10 category toggles (beauty, fitness, tech, finance, etc.)
  - Format preferences (reels, static, longform)
  - Block list for creators and brands
  - Opportunity preferences (content shares, predictions, tasks, ecommerce, investments)
  - Saves to Supabase `user_metadata.contentPreferences`

- ✅ Created `/src/react-app/components/settings/RoleSettings.tsx`
  - Multi-role selection: creator, merchant, advertiser, investor
  - Detailed feature descriptions for each role
  - Saves to Supabase `user_metadata.roles: string[]`

## In Progress 🚧

### Phase 3: TRUE 3-Column Responsive Layout
**Status:** Layout.tsx partially updated with ultrawide support

**Remaining Work:**
1. Convert Layout.tsx to use CSS Grid instead of Flexbox
   ```tsx
   // Target structure:
   <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_300px]">
     <aside>Left Sidebar (260px)</aside>
     <main>Center Column (fluid, max 1600px/1800px)</main>
     <aside>Right Sidebar (300px, hidden < xl)</aside>
   </div>
   ```

2. Update center column wrapper:
   - Remove `max-w-[760px]` constraint
   - Apply `max-w-[1600px] 2xl:max-w-[1800px]` to content wrapper
   - Ensure responsive padding: `px-4 md:px-6 xl:px-8 2xl:px-12`

3. Right sidebar visibility:
   - Currently: `hidden xl:flex`
   - Target: `hidden lg:flex` (visible from lg breakpoint)

### Phase 4: Layout Scanner Script
**Status:** Not started

**Requirements:**
- Create `/tools/scan-layout.ts`
- Scan for:
  - Hard-coded colors (bg-gray-*, text-white, etc.)
  - Deprecated layout classes (max-w-screen-xl, container px-4)
  - Cards not using theme tokens
  - Non-fluid width containers
  - Shadow/border inconsistencies
- Output fix recommendations
- Auto-apply simple fixes

### Phase 5: Page Migrations
**Status:** Not started

**Pages to Migrate:**
- [ ] Home/Dashboard
- [ ] ReferralDashboard
- [ ] Rewards
- [ ] ShoppingCart
- [ ] StorePage
- [ ] TaskDetail
- [ ] TestContentDetailsPage
- [ ] UserProfile (Profile.tsx)

**Migration Checklist per Page:**
- Replace hard-coded colors with theme tokens
- Update container widths to ultrawide-friendly
- Ensure cards use `w-full max-w-full overflow-hidden`
- Apply responsive padding
- Test mobile/tablet/desktop/ultrawide breakpoints

### Phase 6: Navigation Updates
**Status:** Not started

**Requirements:**
- Add `/settings` link to DesktopSidebar
- Add `/settings` link to MobileNav
- Apply theme tokens to navigation backgrounds
- Ensure Settings icon and label are visible

## Pending ⏳

### Phase 7: Lint & Build Verification
- Run `npm run lint -- --fix`
- Run `npm run build`
- Verify no new errors introduced
- Test theme switching in production

### Phase 8: Documentation & Deployment
- Generate comprehensive diff summary
- Document all modified files
- Create deployment checklist
- Deploy to Vercel production

## Technical Debt & Notes

### Pre-existing Issues (Not Addressed in This Refactor):
- Layout.tsx has type mismatches with `google_user_data` property
- Some components use local `UserType` interface vs shared types
- CSS warnings for @tailwind directives (expected, non-blocking)

### Design Decisions:
1. **Theme Tokens:** All new components use `bg-pr-surface-*` and `text-pr-text-*`
2. **Supabase Sync:** All settings save to `user_metadata` for cross-device sync
3. **Multi-Role Support:** Users can select multiple roles simultaneously
4. **Ultrawide Strategy:** Fluid center column up to 1600px (xl) / 1800px (2xl)

### Testing Requirements:
- [ ] iPhone Safari (mobile)
- [ ] Android Chrome (mobile)
- [ ] iPad (tablet)
- [ ] Desktop 1440px
- [ ] Desktop 1920px
- [ ] Desktop 2560px (ultrawide)
- [ ] Theme switching (light → dark → black)
- [ ] Settings persistence across sessions

## Next Steps

1. **Immediate:** Complete Layout.tsx grid refactor
2. **High Priority:** Add Settings link to navigation
3. **Medium Priority:** Create layout scanner script
4. **Lower Priority:** Migrate remaining pages to theme tokens

## Files Modified

### Created:
- `/src/react-app/pages/Settings.tsx`
- `/src/react-app/components/settings/ThemeSettings.tsx`
- `/src/react-app/components/settings/PrivacySettings.tsx`
- `/src/react-app/components/settings/ContentPreferences.tsx`
- `/src/react-app/components/settings/RoleSettings.tsx`
- `/REFACTOR_STATUS.md` (this file)

### Modified:
- `/src/react-app/index.css` (enhanced dark mode variables)
- `/src/react-app/components/Layout.tsx` (partial ultrawide updates)
- `/tailwind.config.js` (theme tokens, ultrawide utilities)
- `/src/react-app/main.tsx` (ThemeProvider integration)

### To Be Modified:
- `/src/react-app/components/DesktopSidebar.tsx` (add Settings link)
- `/src/react-app/components/MobileNav.tsx` (add Settings link)
- `/src/react-app/components/Layout.tsx` (complete grid refactor)
- All major pages (theme token migration)
