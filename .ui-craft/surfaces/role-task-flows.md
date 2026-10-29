# Role task flows — Craft Report

## Checked

Followed dashboard links into creator mission contribution submission, host guest arrivals / proof decisions / sponsorship responses, merchant fulfillment / receipt cancellation / payment confirmation, brand campaign planning and saving, and agency client connection / workspace switching.

Reviewed task clarity, error versus completion states, retained input, repeated submissions, dialog positioning and scrolling, accessible labels, keyboard dismissal/focus, narrow layouts and theme contrast. Existing React/Vite/Tailwind stack, semantic tokens and brand materials preserved.

## Changed

| Before | After | Why |
| --- | --- | --- |
| Reduced-motion CSS removed the positioning transform from dialogs, placing mobile forms off-screen | Dialog and alertdialog positioning is excluded from the transform reset; reduced animation durations remain | Accessibility floor: reduced motion must preserve usable layout. Rendered MissionRail dialog reproduced the issue at 320px. |
| Client dialog clipped its long form, had an unsaved notes field and presented failed account loads as empty matches | Scrollable compact dialog, labelled controls, no unsupported notes field, real retry and inline save errors | Brief: working controls must have a real outcome; failure differs from empty. `QuickAddClient` retains drafts on failure and does not recreate a saved relationship when context refresh fails. Pending access cannot open a client workspace. |
| Contribution errors were toast-only; failed progress reads could permit acting on unknown state | Inline submission recovery, retained link/note, parsed URL validation, request lock and review confirmation only after success | Brief: state feedback must explain what happened. `MissionRail` preserves submitted versus verified distinctions; `ContentDropDetail` exposes action-recording failure. |
| Guest Enter could send another check-in while one was pending; light variables made the route unreadable in the dark host shell | Synchronous in-flight guard, labelled search, visible error/status feedback and local dark scope | Ease of use and contrast. `HostGuestOperations` keeps the last loaded guest list if a background refresh fails and returns to Studio through its back link. |
| Receipt cancellation and direct-payment confirmation used browser prompts; shipment updates relied on transient toasts | Labelled confirmation dialogs, retained payment reference on failure, inline shipment results and explicit shipment → delivery completion | Brief: controls state consequences, preserve work and do not claim money was collected. Existing API contracts and permission enforcement remain in place. |
| Campaign save failures could reject without visible recovery | Both legacy and PromoPilot editors retain the plan and show an inline retry message; repeated saves and leaving during save are guarded | Brief: retain user work after errors. No campaign is made live or funded by these UI changes. |

## Passed

- **24 targeted regression tests passed** across role navigation, deeper-panel states and the six new task-recovery tests.
- App-configured ESLint passed for changed implementation and tests. Diff whitespace check passed.
- Production build and material import-isolation check passed. Existing large-chunk warning remains. SEO generated 30 localized snapshots / 54 sitemap URLs; dynamic SEO pages were skipped because their fetch failed.
- Chrome flow checks at **320×844 and 1440×844**: creator invalid URL / failed submission / successful review submission; host repeated Enter / failed and successful arrivals / guest search; client draft failure / success / active and pending workspace actions; shipment failure / ship / deliver; receipt cancellation failure / success; payment reference validation / failure / success; legacy and modern campaign save failure / success with edits retained; host proof-decision and sponsorship-response failure / success.
- No uncaught page errors in the main flow runs. Document widths matched viewports; dialogs stayed within their viewports. Screenshots were inspected, including the final host contrast fix.
- Additional **320×568** client dialog check with normal motion: footer reachable by internal scrolling, Escape closes the dialog and focus returns to Add client. Reduced-motion dialog positioning verified in the mobile/desktop runs.

## Left alone and verification boundary

Browser checks render actual components and use isolated fixture sessions, intercepted API responses and simulated failures/successes. They validate client state transitions, not live authorization, money movement, delivery, publishing, notification delivery or backend concurrency/idempotency. All external mutations were intercepted. Workspace switching checks validate the correct client/role callbacks, not access to a real client account. The campaign success check validates its destination URL; the destination page was outside this pass.

Camera capture, physical iOS/Android devices, every role setting and every possible server response remain outside this scope. Existing direct-payment-method configuration prompts were not part of the order-confirmation pass. Temporary preview entrypoints and fixture-session overrides were removed after verification.

Screenshots for this local session: `/tmp/flow-creator-retry-320.png`, `/tmp/flow-host-final-{320,1440}.png`, `/tmp/flow-agency-retry-{320,1440}.png`, `/tmp/flow-payment-retry-{320,1440}.png`, `/tmp/flow-modern-plan-retry-{320,1440}.png`, `/tmp/flow-short-screen-client-320.png`.

## Verdict

Ready for review of the exercised task flows. Live account and transaction verification remains a separate integration check.
