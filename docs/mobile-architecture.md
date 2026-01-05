# Vibecode Mobile Architecture Overview

This document tracks the structural decisions behind the Vibecode mobile effort and how the web + mobile mono-repo is organized.

## Workspace Layout

- `apps/web` – existing Vite client (formerly `frontend/`).
- `apps/mobile` – React Native/Expo project (to be initialized with `npx create-expo-app`).
- `packages/shared` – shared TypeScript services, hooks, and utilities consumed by both clients.
- `packages/ui-tokens` – design token exports for color, surface, motion, spacing, and typography.
- `backend` – existing Vercel serverless functions (included as a workspace for install orchestration).

### Installing Dependencies

From the repo root run `npm install`. The workspace configuration installs `apps/web`, `apps/mobile` (placeholder for now), all packages under `packages/*`, and `backend` in a single pass.

### Running Apps

- `npm run dev:web` – boots the Vite client from `apps/web`.
- `npm run dev:mobile` – placeholder until the Expo project is initialized.
- `npm run dev` – currently aliased to `dev:web`; will be expanded with a concurrent runner once the mobile dev server is active.

## Next Engineering Tasks

1. **Initialize Expo project** in `apps/mobile` and configure Expo Router + React Navigation.
2. **Extract shared services**: move modules from `apps/web/src/react-app/services`, `utils`, and `shared/types.ts` into `packages/shared`, exporting them via namespaced entrypoints.
3. **Token adoption**: import `@promorang/ui-tokens` in both apps so theming and motion values stay synchronized.
4. **Secure storage adapters**: define interfaces inside `packages/shared` for session storage so browser storage and Expo SecureStore implementations remain swappable.
5. **Documentation**: expand this file with emulator setup steps (iOS Simulator, Android Emulator), Expo account requirements, push notification provisioning, and CI considerations.
