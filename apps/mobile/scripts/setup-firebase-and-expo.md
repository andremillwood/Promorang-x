# Firebase Cloud Messaging (FCM) & Expo Setup Guide

## 1. Firebase Cloud Messaging (FCM) Credentials
To receive push notifications on Android physical devices via FCM:

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a project named **Promorang Mobile** (or select your existing project).
3. Add an Android app with Package Name: `com.promorang.mobile`.
4. Download `google-services.json` and place it in `apps/mobile/google-services.json`.
5. In Firebase Project Settings > Cloud Messaging, locate your **Server Key** or generate a private key JSON under **Service Accounts**.

---

## 2. Setting Up an Expo Account (When Ready for Cloud Builds)
If you do not have an Expo account yet:

1. Create a free account at [expo.dev](https://expo.dev/signup).
2. Log in via your terminal inside `apps/mobile`:
   ```bash
   npx eas-cli login
   ```
3. Initialize your project:
   ```bash
   npx eas-cli init
   ```
   This automatically updates `app.json` with your `owner` and `extra.eas.projectId`.

---

## 3. Generating Android Release Builds (.aab for Play Store) Locally
You can generate production Android App Bundles (`.aab`) locally without needing cloud build credits:

```bash
# 1. Check configuration
npm run release:check

# 2. Build local Android AAB package
npx eas-cli build --platform android --profile production --local
```
