# Scene launch readiness v1

This pass supports a Scene-led market test while preserving the mixed marketplace, existing mobile navigation, PromoCard, and canonical objects. It adds no migrations or economic mechanics.

## Journeys

- Home → Explore Scenes → search by name, Promise or place → Scene → follow → Today.
- Scene → Want or Offer through existing creation routes → return to the Scene.
- Start → idea/audience → Promise → details → preview/publish → first contribution/share.
- Follow uses `scene_memberships`; active membership refreshes Today and Card queries. Followed Scenes enter the existing feed ranking even outside the selected city's discovery results. Following does not guarantee top placement or imply attendance.
- Only successful clipboard/native share completion is measured; cancellation is not success. Copying a link is not a conversion.

## Measurement

Uses existing `growth_events` accepted event names (`page_view`, `cta_clicked`), with the specific experiment action in `properties.action`:

| Action | Stage | Recorded when |
| --- | --- | --- |
| `scene_viewed` | acquired | Scene data has loaded |
| `scene_followed` | activated | Membership write succeeds |
| `scene_creation_started` | activated | Creation form opens |
| `scene_published` | outcome | Creation API returns the saved Scene |
| `scene_contribution_initiated` | activated | A contribution doorway is selected |
| `scene_contribution_completed` | outcome | Want/Offer API returns a saved ID |
| `scene_shared` | amplified | Share sheet resolves or clipboard write succeeds |

Visitor and return analysis reuse the existing route `page_view`, anonymous/user identity and session fields. Compare distinct sessions for the same identity, rather than interpreting reloads as return visits. Events report UI actions; they do not establish attendance, fulfillment, or revenue.

## Verification

- Targeted web tests: creation preview/publish/failure, follow success/failure/cache invalidation, share success/cancellation/failure, support success/failure, localization completeness, existing mixed-feed ranking.
- Backend tests: Scene metadata, country neutrality, whitespace-name rejection, demand semantics and existing people-experience failure rules.
- Typecheck baseline comparison: 562 diagnostics on both the unchanged base and branch, with no introduced diagnostics (comparison ignores line-number shifts).
- Targeted lint: no errors; existing GiveSomething effect dependency warning remains.
- Production build succeeds. Existing large-chunk warning remains; dynamic SEO fetch fails in this environment, so the generator emits its static localized snapshots only.
- Browser: public home, directory, detail and creation entry at 320, 390, 768, 1440 and 1920 pixels; no horizontal page overflow. Contribution routes and creation entry checked at 390 pixels in English, Spanish and Portuguese.
- Creation through preview and publish verified in the browser with writes intercepted. No sample Scene was published. Real public Scene, Moment, demand and Offer queries were inspected.
- Existing safe-area navigation and scrollable document layout retained. Installed-device PWA, real mobile keyboard and authenticated production writes still require a release smoke test.

## Data and release notes

- No synthetic counts, testimonials, memberships or Moments were added. Scene detail no longer injects a promotional Moment when the relationship query has no record.
- Promise uses `metadata.tagline`; audience uses metadata, idea uses description. Country is optional and no longer defaults to Jamaica.
- New UI copy uses the existing English, Latin American Spanish and Brazilian Portuguese catalogs. Existing untranslated copy outside the new journey remains.
- The inspected live database lacks `discoveries.scene_id`, despite the existing `202608110001_public_discovery_graph.sql` migration in this repository. Scene Discoveries are omitted on that schema; no city/category inference substitutes for the missing relationship. Enabling that enrichment requires deploying the existing migration through the normal release process.
- Public profile projection uses the fields present on the inspected database. No membership counts or private membership records are exposed.
- Native share completion means the operating system accepted the share, not that anyone received or acted on it.
