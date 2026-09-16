# Promorang Admin Experience and Access-Control Development Plan

**Status:** Active delivery plan  
**Version:** 1.0  
**Effective date:** 2026-09-13  
**Owners:** Product, Design, Engineering, Operations, and Security  
**Depends on:** `PRODUCT_ECOSYSTEM_DEFINITION.md`, `ACTIVATION_SYSTEM.md`, and `DEVELOPMENT_PLAN.md`

## Delivery progress

| Tranche | Status | Evidence | Remaining work |
|---|---|---|---|
| Plain-language, role-aware admin shell | Implemented and source/build/browser-entry verified | `apps/web/src/pages/AdminDashboard.tsx`, `apps/web/src/components/admin/AdminCommandCenter.tsx`, `apps/web/src/lib/admin-access.ts`, unit tests, and unauthenticated browser rejection at `/admin` | Authenticated role-based usability testing |
| Work-first admin home | Implemented and source/build verified | Role guidance, permitted work cards, real-data-only counts, and clear unavailable-data state in `AdminCommandCenter.tsx` | Assignment, due-date, and server-persisted onboarding contracts |
| Central server capability policy | Implemented and clean-database matrix verified | `backend/lib/adminCapabilities.js`, `backend/middleware/auth.js`, policy tests, and role counts of 6/12/21/27 capabilities | Staged authenticated HTTP and browser role-matrix tests |
| Main privileged route migration | Implemented at source level | Capability guards across admin, Pieces, PromoShare, Save & Win, PromoPush, commerce, growth, discovery, leads, and marketplace APIs | Inventory non-route database functions and Edge Functions |
| Database capability foundation | Clean-chain verified; not deployed | `supabase/migrations/20260913234827_admin_capability_foundation.sql`; all 169 migrations replayed; database lint reports zero errors | Remediate legacy public-schema exposure, run advisors, then staged deployment |
| Admin team-management experience | Implemented at source/database-test level | Owner-only `AdminTeamAccessTab`, audited role RPCs, temporary grants, revocation, final-owner protection, and permission-aware navigation | Email invitation, onboarding progress, work reassignment, live deployment, and browser role-matrix testing |

“Implemented” does not mean deployed. Database-backed permissions must not be treated as production-active until the migration and live authorization matrix have passed.

### 2026-09-14 release-gate update

- The complete 169-migration application history now replays on a fresh local database.
- Role/capability separation passed: Support 6, Reviewer 12, Operations Manager 21, and Platform Owner 27 capabilities; owner-only permissions did not leak to lower roles.
- Web lint, 63 frontend tests, 113 backend tests, and the production build pass.
- The public site renders in a real browser and unauthenticated `/admin` entry is rejected.
- Authenticated browser role journeys are pending because the current local Supabase Storage/Realtime service images fail during their own bootstrap, before application migrations run.
- A broader historical-schema audit found 109 public tables without RLS and 31 views without `security_invoker`. This is now the primary deployment blocker and is planned in `ADMIN_SECURITY_REMEDIATION_BACKLOG.md`.

## 1. Product outcome

Create an admin experience that a newly invited team member can understand, safely use, and confidently teach to someone else.

The experience must:

- begin with the work that needs attention, not Promorang's internal architecture;
- use plain language while preserving canonical product terms where precision matters;
- show each administrator only the tools and data required for their responsibilities;
- explain the consequence of sensitive actions before they are taken;
- enforce access on the server and database, not merely hide controls in the browser;
- create a reliable audit trail for access and consequential decisions;
- support onboarding, daily work, escalation, handoff, and offboarding as complete journeys.

## 2. Current-state diagnosis

### Experience problems

- The landing experience exposes roughly 28 tools in five groups at once.
- Labels such as “Master Telemetry,” “Node Economy,” “Discovery Loop,” “Audit Ledger,” and “Campaign Compiler” describe systems rather than human tasks.
- The first screen optimizes for platform breadth rather than helping an administrator answer “what needs my attention?”
- Urgency, ownership, due dates, and recommended next actions are not consistently expressed.
- There is no role-specific welcome, guided first task, contextual glossary, or onboarding checklist.
- Search matches tool names, but does not help people search by intent such as “refund an order” or “review an ID.”

### Access-control problems

- `moderator`, `admin`, `administrator`, and `master_admin` all pass the general admin entry check.
- The frontend largely presents the same workspace after that check.
- Some backend routes correctly require platform or master-admin access, while others use the broad admin guard for sensitive work.
- Role names and authorization logic are repeated across frontend components, middleware, services, and database functions.
- A user-editable metadata role is still considered in some authorization paths and must not be trusted for privileged decisions.
- Organization roles and platform roles are different concepts but can appear similar to users and maintainers.

## 3. Product principles

1. **Work before systems.** Lead with tasks, queues, outcomes, and exceptions.
2. **Least privilege by default.** New access starts at the smallest useful scope.
3. **Server authority.** The browser may personalize the interface, but the server decides whether an action is allowed.
4. **Progressive disclosure.** Advanced controls appear only when the user needs and can use them.
5. **Explain consequences.** Money movement, account restriction, role changes, and irreversible actions state their effect in plain language.
6. **Safe recovery.** Prefer reversible states, reasons, review windows, and escalation over silent destructive changes.
7. **One vocabulary.** A term has one meaning across interface copy, support material, API, audit history, and training.
8. **Observable trust.** Every privileged decision records who, what, when, why, and the affected object.

## 4. Administrator roles

Roles are understandable job bundles. Permissions are the enforceable capabilities underneath them.

| Role | Plain-language purpose | Default scope | Examples of excluded access |
|---|---|---|---|
| Support | Help people resolve account and product questions | User lookup, support cases, read-only activity context, internal notes | Identity approval, payouts, system configuration, role management |
| Reviewer | Review trust and evidence queues | Support capabilities plus identity, content, proof, application, and event review | Treasury configuration, broadcasts, catalog changes, role management |
| Operations Manager | Run day-to-day platform operations | Moments, campaigns, catalog, commerce, support, approved broadcasts, operational reporting | Admin-role assignment, security policy, unrestricted treasury controls |
| Platform Owner | Govern Promorang and its administrators | All capabilities, access management, audit records, system and financial controls | None, subject to step-up authentication and audit requirements |

Initial compatibility mapping:

| Existing role | New experience role |
|---|---|
| `moderator` | Reviewer |
| `admin` / `administrator` | Operations Manager |
| `master_admin` | Platform Owner |

Support is introduced as a restricted platform role by the capability-foundation migration. It must not be assigned in a deployed environment until that migration and the live authorization matrix are verified.

## 5. Capability model

Capability names are implementation contracts and should be centralized.

### People and trust

- `users.read`
- `users.restrict`
- `support.read`
- `support.respond`
- `identity.read`
- `identity.review`
- `content.review`
- `proof.review`
- `applications.review`

### Operations and commercial activity

- `moments.read`
- `moments.manage`
- `campaigns.manage`
- `catalog.read`
- `catalog.manage`
- `orders.read`
- `orders.manage`
- `broadcasts.manage`
- `reports.read`
- `operations.read`

### Money, governance, and system control

- `payouts.read`
- `payouts.approve`
- `economy.read`
- `economy.manage`
- `access_rules.manage`
- `audit.read`
- `admin_access.manage`
- `system_config.manage`

### Authorization rules

- A role grants a reviewed set of capabilities.
- A user may hold more than one role; effective access is the union of approved capabilities.
- High-risk capabilities may require an explicit grant even when a broad role exists.
- Organization access is scoped to an organization and never implies platform administration.
- Platform administration never silently implies ownership of a brand, merchant, venue, or buyer account.
- Denials return a safe, plain-language message and a machine-readable reason.
- Frontend visibility uses the same shared capability vocabulary as server enforcement.

## 6. Permission matrix for the first release

| Area | Support | Reviewer | Operations Manager | Platform Owner |
|---|:---:|:---:|:---:|:---:|
| Work queue | Relevant items | Relevant items | All operational items | All items |
| User lookup | View | View | Manage allowed fields | Full |
| Support cases | Respond | Respond | Respond/escalate | Full |
| Identity checks | Context only | Review | Review/escalate | Full |
| Proof/content review | — | Review | Review/escalate | Full |
| Host applications | — | Review | Manage | Full |
| Moments and venues | View | View | Manage | Full |
| Catalog and orders | View for support | View | Manage | Full |
| Announcements | — | — | Draft/send within policy | Full |
| Payouts | — | — | View and prepare | Approve/manage |
| Rewards and balances | Context only | Context only | Operational view | Manage rules |
| Access rules | — | — | — | Manage |
| Audit history | Own actions | Relevant review history | Operational history | Full |
| Admin access | — | — | — | Invite/change/revoke |
| System settings | — | — | — | Manage |

This matrix is a product baseline. Every API route and database operation must be inventoried before production enforcement is declared complete.

## 7. Information architecture and language

### New primary navigation

1. **Home** — priorities, assigned work, service health, and recently completed work.
2. **People** — user accounts, identity checks, applications, and support context.
3. **Reviews** — proof, content, event evidence, and other trust decisions.
4. **Experiences** — Moments, venues, campaigns/Activations, and owner claims.
5. **Commerce** — catalog, orders, redemptions, and customer-impacting exceptions.
6. **Money** — payouts, committed value, balances, and reconciliation; restricted by capability.
7. **Communications** — support and approved announcements.
8. **Reports** — growth, acquisition, operations, and financial reporting.
9. **Administration** — team access, audit history, access rules, and system settings; owner-only where appropriate.

### Plain-language replacement guide

| Current label | Preferred label | Supporting description |
|---|---|---|
| Master Command | Home | Work requiring attention across Promorang |
| Master Telemetry | Overview | Current activity and service health |
| Verification Hub | Reviews | Identity, proof, and evidence waiting for decisions |
| KYC | Identity check | Confirm a person's identity for protected features |
| Growth Radar | Growth report | Acquisition and participation trends |
| Discovery Loop | Discovery performance | How people find and act on opportunities |
| Pioneer Audit | Pioneer contributions | Review credited early contributions |
| Scout Proof Review | Place information reviews | Check submitted place details and evidence |
| Gem Node Economy | Rewards and balances | Issued, committed, available, and settled value |
| Access & PromoKeys | Participation rules | Define who can view, join, claim, or redeem |
| Audit Ledger | Admin activity history | Review important actions taken by administrators |
| PromoPush Broadcast | Announcements | Send approved messages to selected audiences |
| Campaign Compiler | Activation setup | Configure and prepare an Activation |
| System Config | Platform settings | Owner-only platform behavior and safeguards |

Canonical product names such as Activation, PromoCard, PromoShare, Pieces, Points, and Gems should retain their approved names and receive short explanations in context.

## 8. Core user journeys

### Journey A — Invite and assign access

1. Platform Owner chooses “Invite admin.”
2. Owner selects a job bundle and sees exactly what it permits and excludes.
3. High-risk additional capabilities require a separate explicit choice and reason.
4. Invitee sees role, responsibilities, expected response times, and access expiry if applicable.
5. Acceptance records inviter, invitee, role, scope, and timestamp.
6. First sign-in begins guided onboarding rather than opening the full dashboard.

### Journey B — First day onboarding

1. Welcome explains the person's role in one sentence.
2. A checklist covers safety, vocabulary, queue ownership, escalation, and one guided practice item.
3. Each section provides “What you can do here” and “When to escalate.”
4. The first real task includes contextual guidance and a reversible or reviewable outcome.
5. Completion is recorded for training and operational readiness, not used as a substitute for access control.

### Journey C — Daily work

1. Home shows assigned, urgent, overdue, and unassigned work.
2. Every item states why it is in the queue, its deadline, and the next safe action.
3. Related user and object context appears without forcing navigation across many tools.
4. Completing an item shows the resulting user-facing state and any follow-up obligation.
5. The administrator can move to the next item without returning to a system map.

### Journey D — Sensitive decision

1. The interface summarizes evidence and policy relevant to the decision.
2. Approve, reject, restrict, pay, refund, or broadcast actions explain their consequence.
3. A reason is required where policy, reversibility, or user impact warrants it.
4. High-risk actions require step-up authentication and, where appropriate, two-person approval.
5. Success shows an audit reference and the state visible to the affected user.

### Journey E — Escalation and handoff

1. Administrator chooses an escalation reason and destination.
2. Context, evidence, previous decisions, and service deadline travel with the item.
3. Ownership is explicit; escalated items do not remain ambiguously assigned.
4. The originating administrator can see the outcome when their work depends on it.

### Journey F — Access change and offboarding

1. Owner can review active administrators, capabilities, last activity, and temporary grants.
2. Changes show gained and lost access before confirmation.
3. Revocation invalidates or refreshes privileged sessions according to the security policy.
4. Open work is reassigned and the change is audited.

## 9. Delivery phases

### Phase 0 — Baseline and safeguards

**Goal:** Establish measurable current state and stop new inconsistency.

- Inventory admin pages, routes, API endpoints, database functions, and policies.
- Inventory all accepted role spellings and authorization sources.
- Establish the shared role/capability vocabulary.
- Record baseline task-success, time-to-first-action, error, and support metrics.
- Add an access-control decision record and named owner.

**Exit criteria:** Every privileged surface has an owner and proposed capability; no new admin feature ships with an ad hoc role check.

### Phase 1 — Calm, role-aware admin shell

**Goal:** Immediately reduce cognitive load while preserving workflows.

- Replace system-centric navigation labels with task-oriented language.
- Group destinations around People, Reviews, Experiences, Commerce, Money, Communications, Reports, and Administration.
- Filter navigation by current trusted roles using a centralized compatibility policy.
- Redirect inaccessible deep links to the person's first permitted destination.
- Replace the “ROOT” badge and technical header copy with role name and purpose.
- Add descriptions to search so users can search by intent.
- Add a “Current access” explanation.

**Exit criteria:** Moderator, admin, and master admin see meaningfully different navigation; no permitted existing route is removed; responsive and keyboard checks pass.

### Phase 2 — Work-first home and onboarding

**Goal:** Make the first screen answer “what should I do next?”

- Build a unified work-item contract for queues.
- Add urgent, assigned, unassigned, due-soon, and recently completed sections.
- Add role-specific empty states and escalation guidance.
- Implement the onboarding checklist, glossary, guided first task, and replayable tour.
- Persist onboarding progress server-side.

**Exit criteria:** A newly invited reviewer can find and complete an assigned review without verbal guidance in usability testing.

### Phase 3 — Server-enforced capabilities

**Goal:** Make authorization consistent and auditable.

- Add canonical capabilities and role-capability assignments in a migration.
- Enable RLS on exposed authorization tables and define least-privilege policies.
- Read authorization only from server-controlled records or trusted app metadata; do not trust user metadata.
- Add `requireCapability` middleware and migrate API routes from broad `requireAdmin` checks.
- Protect database functions and revoke default public execution where required.
- Return consistent authorization errors and log high-risk denials.
- Add authorization contract tests for every role/capability pair.

**Exit criteria:** Direct API requests cannot exceed displayed permissions; security review and database advisors pass; capability tests cover every privileged endpoint.

### Phase 4 — Admin team management

**Goal:** Let Platform Owners safely delegate work.

- Build admin team list, invite, role change, custom grant, expiry, suspension, and revocation flows.
- Show permissions in plain language before granting access.
- Prevent removal of the final active Platform Owner.
- Require reason and step-up authentication for sensitive changes.
- Notify affected administrators about access changes.

**Exit criteria:** Access can be granted and revoked without engineering intervention, with full audit evidence and no orphaned work.

### Phase 5 — Sensitive-action hardening

**Goal:** Reduce avoidable financial, trust, and communications risk.

- Identify actions requiring reasons, step-up authentication, dual approval, or cooling-off periods.
- Add previews for announcements, payouts, rule changes, account restrictions, and bulk actions.
- Add idempotency, reversal, and reconciliation evidence where value moves.
- Add emergency access procedure with expiry and prominent audit treatment.

**Exit criteria:** Critical actions are reproducible, attributable, policy-compliant, and recoverable where the domain allows.

### Phase 6 — Quality, measurement, and continuous improvement

**Goal:** Operate the admin product as a product.

- Add journey analytics without recording unnecessary sensitive content.
- Run task-based usability tests with new and experienced administrators.
- Review denied actions, abandoned tasks, queue ageing, escalations, and search terms monthly.
- Maintain role documentation and training alongside capability changes.
- Add quarterly access reviews and automatic reminders for temporary access.

**Exit criteria:** Product and operations owners can identify friction and access risk from evidence, and improvement has an accountable cadence.

## 10. Engineering workstreams

### Shared access package

- Role normalization and aliases.
- Capability constants and types.
- Role-to-capability defaults.
- Helpers for `hasCapability`, `canAccessAdminArea`, and the first permitted destination.
- Unit tests shared by UI and server where runtime boundaries permit.

### Frontend

- Role-aware navigation and route resolution.
- Permission-aware actions, not just permission-aware pages.
- Plain-language descriptions, helpful empty states, and consequence previews.
- Accessible focus order, labels, status announcements, contrast, and reduced motion.
- Responsive layouts suitable for urgent work on smaller screens.

### Backend

- Central capability resolver with short-lived caching and reliable invalidation.
- Middleware applied at route/action granularity.
- Structured denials that reveal no sensitive resource existence.
- Auditing for role changes and consequential operations.
- Session refresh/revocation strategy for privilege changes.

### Database

- Server-owned role, capability, assignment, scope, expiry, and audit records.
- RLS and restricted grants for every exposed authorization table.
- Safe privileged functions with explicit caller checks and locked search paths.
- Constraints preventing invalid roles, duplicate active assignments, and removal of the final owner.

### Operations and content

- Responsibility and escalation policy for each queue.
- Plain-language help and decision guides.
- Training scenarios and readiness checklist.
- Defined service levels and queue ownership.

## 11. Testing strategy

### Automated

- Unit tests for role normalization, capability resolution, navigation filtering, and fallback routing.
- API authorization matrix tests covering unauthenticated, ordinary user, Support, Reviewer, Operations Manager, and Platform Owner.
- Database tests for RLS, function execution, expiry, scope, and final-owner protection.
- Component tests for hidden actions, access explanations, and denied deep links.
- End-to-end tests for invitation, onboarding, daily review, escalation, role change, and revocation.
- Accessibility checks for keyboard operation, focus, headings, labels, live status, and contrast.

### Human validation

- Five-second comprehension test for the admin home.
- First-task study with people who did not build the platform.
- Policy scenario tests for ambiguous reviews and escalation.
- Failure-state tests: unavailable data, expired session, concurrent decision, revoked access, and partial service outage.

## 12. Product-success measures

### Activation and comprehension

- At least 90% of invited administrators can state their responsibilities and exclusions after onboarding.
- At least 85% complete their first assigned task without live assistance.
- Median time from first sign-in to first correct action is under 10 minutes.

### Operational quality

- Reduce median time-to-resolution for review and support queues by 30%.
- Fewer than 5% of items are reassigned because the original administrator lacked the correct responsibility.
- Reduce abandoned admin searches and repeated navigation loops by 40%.

### Safety and access

- Zero successful API operations outside the authorization matrix in automated tests.
- 100% of role changes and high-risk actions have actor, time, target, reason, and outcome.
- 100% of temporary access grants expire automatically.
- Quarterly access reviews reach 100% completion.

Metrics are decision aids, not incentives to approve reviews quickly at the expense of safety or fairness.

## 13. Rollout strategy

1. Release the plain-language, role-filtered shell behind an admin-experience flag.
2. Dogfood with the Platform Owner and one representative of each role.
3. Compare task completion and error patterns against the baseline.
4. Roll out to all current administrators with an access summary and short guided tour.
5. Introduce server capabilities route-by-route, starting with access management, money movement, broadcasts, and account restrictions.
6. Keep a tested emergency rollback for interface changes; never roll back a security restriction merely to restore convenience.
7. Remove legacy labels and broad guards only after route inventory and parity evidence are complete.

## 14. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Hidden navigation is mistaken for security | Track frontend filtering and server enforcement as separate deliverables |
| Existing administrators lose required access | Produce role-diff reports, staged rollout, and explicit temporary grants |
| Permission model becomes too granular to operate | Start with job bundles and add custom grants only for demonstrated needs |
| Role changes remain active in old sessions | Define refresh/revocation behavior and test it |
| Plain language removes important precision | Keep canonical term as supporting text where legal, financial, or product meaning matters |
| Queue consolidation creates another data source | Use a read model over canonical records, not a competing workflow database |
| Sensitive data appears in broad search | Capability-filter search results and minimize returned fields |

## 15. Definition of done

This initiative is complete only when:

- every privileged UI action maps to a named capability;
- every privileged API and database operation enforces that capability;
- each admin role has a documented, tested end-to-end journey;
- a new administrator can onboard and complete representative work without developer assistance;
- inaccessible sections and actions are absent, while denied direct requests remain safely blocked;
- access changes take effect within the documented session window;
- critical actions are attributable and auditable;
- plain-language content passes comprehension testing;
- accessibility, responsive, failure-state, and security tests pass;
- operational ownership and quarterly access review are active.

## 16. Immediate execution tranche

The first implementation tranche delivers:

- a centralized frontend compatibility policy for current admin roles;
- role-specific admin navigation;
- safe fallback when a user opens a section outside their role;
- plain-language group, page, header, search, and action labels;
- unit tests for the access policy;
- build and targeted test verification.

This tranche improves comprehension and reduces accidental discovery of privileged tools. It does **not** claim to complete server-side capability enforcement; that remains the next security-critical tranche.
