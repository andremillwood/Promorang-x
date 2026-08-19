# Mobile account configuration

This runbook contains the account-owned setup that cannot be completed from source control. Record completion in `mobile-store-release-checklist.md`; do not commit secrets or downloaded signing credentials.

## 1. Expo and EAS ownership

From `apps/mobile`, sign in to the Expo account that will own the production app and run:

```bash
npx eas-cli init
```

Confirm that Expo writes both of these values to `app.json`:

```json
{
  "expo": {
    "owner": "YOUR_EXPO_ACCOUNT_OR_ORG",
    "extra": {
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_UUID"
      }
    }
  }
}
```

Commit the owner and project ID. They are identifiers, not secrets. Then add the public production variables to the EAS `production` environment using `apps/mobile/.env.example` as the inventory.

## 2. Apple Developer and App Store Connect

- Register App ID `com.promorang.mobile`.
- Enable Sign in with Apple and Push Notifications for that App ID.
- Register merchant ID `merchant.com.promorang.mobile`, or update `app.json` to the merchant ID owned by the business.
- Let EAS manage the distribution certificate and provisioning profile unless the organization already has a signing policy.
- Create the matching App Store Connect app record.
- Configure an APNs key in EAS and send a real push to a physical iPhone.

The current app declares that it does not use non-exempt encryption and supports iPad. If iPad is not included in version 1, change `ios.supportsTablet` to `false` before generating store assets.

## 3. Google Play Console

- Create package `com.promorang.mobile` and enable Play App Signing.
- Create or select the Firebase project used for Android push.
- Upload the FCM v1 service-account credential through EAS; do not commit it.
- Configure the Android OAuth client with the production signing certificate SHA-1 and SHA-256 values.
- Upload an internal-test Android App Bundle and confirm the generated target API level.

## 4. Supabase authentication

In Authentication > URL Configuration, allow the exact native redirect:

```text
promorang://auth/callback
```

Keep the deployed web callback as an additional redirect if web OAuth uses it. In Authentication > Providers:

- Enable Google with the production web/client credentials required by Supabase and the native platform clients.
- Enable Apple with the Apple Services ID/team/key configuration required by Supabase.
- Test Google on both platforms and Apple on a physical iPhone using a store-signed or TestFlight build.

The mobile implementation uses `promorang://auth/callback`; changing the app scheme requires changing the allowlist and application code together.

## 5. Push notifications

The app requests permission only after an explicit user action, obtains an Expo push token using the EAS project ID, registers it at `/api/notifications/push-token`, and routes notification taps through the shared journey resolver.

Before release:

- Apply `202607140003_mobile_release_readiness.sql` and all later required migrations.
- Confirm the production API accepts an authenticated push-token registration.
- Configure APNs and FCM v1 credentials in EAS.
- Test opt-in, denial, reinstall/token refresh, foreground delivery, background delivery, terminated-app delivery, and deep links.
- Remove invalid device tokens when Expo reports `DeviceNotRegistered`.

## 6. Production values to record privately

Keep a private release record containing the Expo organization/project, Apple team and App Store Connect app IDs, Google Play app ID, Supabase project reference, credential owners, renewal dates, and the location of recovery material. Do not put keys, tokens, passwords, or service-account files in this repository.

