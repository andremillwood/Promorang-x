# Promorang Mobile Store Release Checklist

Last updated: July 14, 2026

## Automated release gate

Run from the repository root:

```bash
npm run release:check --workspace apps/mobile
```

This checks TypeScript and produces independent iOS and Android production bundles. Mobile web is not part of the app-store gate because the native Stripe component requires a separate web adapter.

## Implemented in the repository

- Production bundle identifiers: `com.promorang.mobile` on iOS and Android.
- Native Stripe config with Apple merchant identifier and explicit Google Pay setting.
- Sign in with Apple alongside Google on iOS.
- Clickable Terms and Privacy links at authentication.
- In-app account deletion initiation with a second confirmation.
- Public `/account-deletion` request form for people who cannot access the app.
- Auditable account deletion requests with a stated 30-day processing window.
- Mobile content reporting and user blocking.
- Blocked-user filtering in the personalized feed.
- UGC conduct language and moderation disclosures.
- Explicit notification opt-in and Expo push-token registration.
- Production Promorang icon, adaptive icon, splash mark, and favicon derived from the established brand mark.
- EAS preview and production build profiles with automatic version increments.
- Expo SDK 54 packages aligned to Expo's recommended patch versions.

## Required before the first store build

- [ ] Follow `docs/mobile-account-configuration.md` and commit the generated Expo owner and EAS project ID.
- [ ] Apply `202607140003_mobile_release_readiness.sql` to the production Supabase project.
- [ ] Deploy the backend and web app so the privacy endpoints and `/account-deletion` page are public.
- [ ] Run `eas init` from `apps/mobile` and commit the generated Expo `projectId` and owner association.
- [ ] Configure the production EAS environment using the keys in `.env.example`.
- [ ] Register `merchant.com.promorang.mobile` in the Apple Developer portal, or change the app config to the merchant ID the business owns.
- [ ] Enable Sign in with Apple for `com.promorang.mobile` in Apple Developer and configure Apple as a Supabase auth provider.
- [ ] Add the exact production redirect URI to Supabase Auth redirect URLs.
- [ ] Configure APNs and FCM credentials through EAS before testing push notifications.
- [ ] Decide whether version 1 supports iPad. If not, set `supportsTablet` to `false`; if yes, complete iPad QA and screenshots.

## Dependency security review

The mobile production-tree audit currently reports 30 inherited advisories: 1 low, 20 moderate, 8 high, and 1 critical. None of the high or critical findings is a direct application dependency; the critical `shell-quote` finding arrives through React Native's developer-tools chain. Expo's supported patch versions are installed and `expo install --check` passes. npm's proposed complete remediation requires a major jump from Expo SDK 54 to SDK 57, so do not use `npm audit fix --force` on the release branch.

- [ ] Decide whether to complete and regression-test an Expo SDK 57 upgrade before submission, or formally accept the SDK 54 transitive tooling risk for this release.
- [ ] Re-run the production-tree audit immediately before the release build and retain the result with the release evidence.

## Payments decision — launch blocker

The version 1 decision is recorded in `docs/mobile-payments-policy.md`: native Stripe is limited to clearly classified physical goods and real-world services/access. Digital products, purchased Gems, paid digital functionality, and sponsor funding remain non-purchasable in native builds until compliant native billing or a reviewed exception is implemented.

Document each thing purchasable in the mobile app as one of:

1. Physical good or real-world service/event access: Stripe is generally the appropriate checkout path.
2. Digital content, digital functionality, or in-app virtual currency: implement StoreKit and Google Play Billing unless a documented regional/program exception applies.
3. Earned or previously acquired value: make the mobile app consumption-only and do not link users to an external purchase flow for prohibited digital purchases.

Do not submit until server-side purchase enforcement and QA confirm that the documented classification matches every native purchase surface.

## Device QA matrix

- [ ] Fresh install and upgrade install.
- [ ] Google login on iOS and Android.
- [ ] Apple login on a physical iPhone.
- [ ] Logout, token expiry, and revoked account behavior.
- [ ] Account deletion request and confirmation email/operations queue.
- [ ] Camera, photo library, QR scan, denied permission, and Settings recovery.
- [ ] Content publish, moderation, report, and block flows.
- [ ] Checkout success, cancellation, network failure, receipt, refund, and webhook delay.
- [ ] Push opt-in, denial, token refresh, foreground notification, and notification deep link.
- [ ] Offline launch, slow network, empty states, and API errors.
- [ ] Small Android phone, current Pixel/Samsung class device, current iPhone, and one older supported iPhone.
- [ ] Accessibility labels, dynamic text, screen reader traversal, color contrast, and tap targets.

## Store-console work

Use `docs/mobile-store-listing.md` for listing copy, screenshot planning, reviewer notes, and release evidence.

### Apple App Store Connect

- [ ] Create the app record with bundle ID `com.promorang.mobile`.
- [ ] Complete App Privacy, age rating, export compliance, category, description, keywords, support URL, and privacy URL.
- [ ] Upload iPhone screenshots and iPad screenshots if tablet support remains enabled.
- [ ] Provide a populated reviewer account and review notes explaining camera, QR, UGC moderation, Gems, Stripe, and any role-specific screens.
- [ ] Upload a TestFlight build and complete internal device testing before review.

### Google Play Console

- [ ] Create the app record with package `com.promorang.mobile` and enable Play App Signing.
- [ ] Complete Data Safety, content rating, ads declaration, financial-features declarations where applicable, app access, and the account-deletion URL.
- [ ] Upload phone screenshots, feature graphic, icon, short description, full description, support email, and privacy URL.
- [ ] Upload an Android App Bundle to internal testing and verify the generated target API level.
- [ ] Complete internal/closed testing requirements that apply to the Play developer account before production access.

## Operations for deletion and moderation

- Review `account_deletion_requests` daily and record verification, legal retention, and completion.
- Review `content_reports` against the published Terms, record the resolution, and respond promptly to high-risk safety reports.
- Remove associated UGC during deletion unless a documented legal obligation requires retention.
- Revoke Apple tokens when deleting an account authenticated through Sign in with Apple.
