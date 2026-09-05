# PROMORANG architecture

The supported runtime map is maintained in the root [README](../README.md).

| Runtime | Source | Role |
| --- | --- | --- |
| Web | `apps/web` | React/Vite browser application |
| Mobile | `apps/mobile` | Expo/React Native application |
| API | `backend/api/index.js` | Express API deployed separately from web |
| Domain rules | `packages/shared` | Shared participation, market and outcome contracts |
| Developer access | `packages/sdk`, `packages/mcp-server` | API client and MCP interface |
| Database | `supabase/migrations` | Canonical migration source; applied state must be checked separately |

Clients authenticate through Supabase. Backend services handle protected participation, claims, commerce, attribution and settlement. Webhook verification and fulfillment remain backend responsibilities. Database access policies are a separate boundary from Express authorization.

The primary product loop is discovery → participation or claim → verification/redemption → attributable result → repeat activity. The people experience reuses existing domain services; it does not replace wallet or settlement accounting.

Historical Growth Hub and legacy frontend instructions previously in this file were stale. They remain in Git history. For current findings and release limitations, see the [September 2026 audit](platform-audit-2026-09-05.md). Product direction is documented in [the product constitution](PRODUCT_ETHOS_AND_HUMAN_UX.md); aspirational product claims must be checked against running code and configured services.
