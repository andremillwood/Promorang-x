# Marketing page convergence review — 2026-10-29

## Scope and preservation
16 public marketing routes: `/for-creators`, `/hosting`, `/for-communities`, `/for-agencies`, `/for-enterprise`, `/for-causes`, `/for-merchants`, `/for-brands`, `/solutions`, `/about`, `/how-it-works`, `/what-is-promorang`, `/pricing`, `/for-developers`, `/join`, `/business/start`.

Preserved existing signup roles, return URLs, merchant-claim parameters, business brief persistence, real demand data boundaries, SEO/schema components, and tangible PromoCard/receipt materials. The public homepage and private role workspaces retain their existing designs. This work used the clean release checkout, leaving the primary checkout's unrelated material changes intact.

## Loop contract and result
Preset: visual-anti-slop. Target: existing-surface. Lenses: ui-craft Anti-Slop Test; landing recipe; finish-bar hierarchy and pixel honesty; responsive and accessibility requirements. Gate: zero critical and zero unresolved major findings within this scope. Renderer: required, existing Playwright verification harness (tier 2), Chromium headless. Visual evaluation occurred. Confidence: full for rendered states; cross-browser verification was not performed. Budget: five iterations; five used. Final gate: pass. Unresolved within budget: none at critical or major severity in the reviewed states.

| Iteration | Highest-impact finding | Applied fix and re-evaluation |
| --- | --- | --- |
| 1 | Repeated dark panels and feature-card grids bury the role-specific task | Photographic openings with distinct portrait/panorama/product/statement compositions; open outcome rows and actual PromoCard context. Re-rendered representative role/business pages. |
| 2 | Architecture-heavy copy and oversized explanatory headings | Shorter localized openings, reduced repeated eyebrows, open narrative rows and removal of padded closing boxes. Re-rendered About, creator and product explanation pages. |
| 3 | Text inheritance obscures actual product materials and warm-surface data | Isolated product typography, corrected paper-surface text and restored PromoCard materials. Re-rendered product, About, pricing and role pages. |
| 4 | Repeated explanations and competing next steps weaken the journey | Progressive FAQ disclosure, removal of duplicate economics content and unrelated footer CTA, linked keyboard-operable specialist tabs. Re-rendered entry and explanation pages. |
| 5 | Narrow-screen entry layouts, duplicate business heading and unreliable display font | Visible role choices at narrow widths, legible entry/photo and paper metadata, open business outcome controls, one page H1, tablet heading containment, locally served licensed Anton. Final route matrix and interaction checks completed. |

## Craft report

| Before | After | Why |
| --- | --- | --- |
| Text-only creator/host/agency/enterprise openings | Role-specific existing photography and clear action hierarchy | Show the people and activity behind the role |
| Identical outcome tiles | Open actionable rows with title, context and direction | Make choices comparable without panel clutter |
| Repeated ticket replicas for informational copy | Open narrative sections | Reserve tangible objects for product context |
| Long architecture explanation in About H1 | Short human headline with a concise product introduction | Establish meaning before explaining the system |
| Unrelated shared footer scene CTA after partner signup CTA | Page-owned next step followed by the sitemap | Preserve conversion intent |
| Specialist tabs lacked arrow navigation and panel relationships | Roving keyboard stop, arrow/home/end controls and linked panel | Make role selection usable without a pointer |
| Shared journey labels reused one DOM id | Unique accessible labels for every journey | Name participant and operator routes correctly |

## Verification
- 69 unique targeted tests pass across marketing journeys, shared navigation, journey accessibility, merchant demand links, auth return paths, business-intake localization and persistence, and homepage inventory/rotation regressions.
- Every changed React/TypeScript file passes targeted ESLint; `git diff --check` passes. Final production build succeeds and generates 30 localized SEO snapshots and 54 sitemap URLs.
- All 16 routes checked at 1440px and 390px: one H1, no page overflow, no broken images, no browser page errors, bundled display font loaded.
- Creator, merchant, Join, business intake, pricing and product explanation also checked at 320px and 768px. Zero page overflow; reduced-motion transitions are disabled.
- Spanish and Portuguese creator openings checked at 320px. Specialist keyboard navigation, keyboard FAQ disclosure, merchant-claim signup URL and the business context form verified. No real lead or purchase was submitted.
- Product illustrations carry no fabricated issued value. Existing category/role photography is illustrative, not presented as evidence of a named event or partnership.
- Font source: official Google Fonts `ofl/anton`, with the original SIL Open Font License included beside the asset.

Evidence: screenshots saved under `/Users/bumblebeecreative/.codex/visualizations/2026/10/15/01a13fc2-dbbf-7102-bbbd-1000872b8cd7/promorang-marketing/`.

Minor observations accepted for this scope: the shared footer remains a long sitemap, and Vite retains the pre-existing large-bundle warning. Several legacy informational body sections remain English; newly introduced opening copy is localized in English, Spanish and Portuguese. No claim of a platform-wide accessibility certification or usability study is made.
