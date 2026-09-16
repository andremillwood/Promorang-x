# UI V2 Vercel validation retry — 2026-09-15

This documentation-only commit intentionally triggers a fresh Vercel preview deployment for `andre/ui-v2-foundation` after the Hobby-plan build-rate window cleared.

Validation target:

1. confirm the explicit optional native dependencies allow Vite config loading on Vercel Linux;
2. capture the first real application build/type error if one remains;
3. do not merge PR #114 until the web preview succeeds and browser QA is completed.

No product behavior or UI is changed by this commit.
