# Junior Developer Playbook

_Last updated: 2025-10-29_

## Goals
- Deliver production-ready Growth Hub features quickly.
- Follow established patterns to reduce review cycles.
- Minimize token usage by working from shared docs and templates.

## Daily Flow
1. **Standup update** (thread or tool): accomplishments, next tasks, blockers.
2. **Plan**: review ticket acceptance criteria, break into subtasks.
3. **Implement**: follow checklist below.
4. **Verify**: run tests, lint, manual QA if applicable.
5. **Document**: update relevant docs, changelog, or decision logs.
6. **Review**: create PR with summary + testing evidence.

## Implementation Checklist
- [ ] Sync `main` and create feature branch `feature/<ticket>-<summary>`.
- [ ] Read related docs (`docs/growth-hub-overview.md`, service/UI guides).
- [ ] Confirm environment variables (`.env`, `.env.local`).
- [ ] Write/adjust unit tests before coding complex logic.
- [ ] Implement feature following service/component patterns.
- [ ] Update mocks/test data as needed (`backend/tests/mocks`).
- [ ] Run commands:
  - Backend: `npm test`
  - Frontend: `npm run lint`, `npm run test`
- [ ] Update docs if API/schema/UI changes.
- [ ] Prepare PR with:
  - Summary (what/why)
  - Testing evidence (commands + output)
  - Screenshots for UI
  - Doc links/updates
- [ ] For Create flow work: confirm storage bucket exists, run smoke curl tests, capture `fallback` flags in notes.
- [ ] When working with real auth, verify `content_share_positions` minted rows for creator UUIDs.

## Communication Expectations
- Surface blockers within 1 working day.
- Propose solutions with rationale when flagging issues.
- Use `#growth-hub-dev` channel for quick sync, `#decisions` for architecture choices.

## Review Etiquette
- Request review from senior dev + QA.
- Respond to comments within 24h.
- If feedback requires major changes, discuss in thread to align on approach.

## Learning Resources
- Architecture overview: `docs/architecture.md`
- Growth Hub domain: `docs/growth-hub-overview.md`
- Backend patterns: `docs/backend/services.md`
- Frontend patterns: `docs/frontend/architecture.md`
- Operations: `docs/operations/runbooks.md`
- AI collaboration: `docs/ai/dev-guidelines.md`
- Create flow specifics: `docs/architecture.md#Create Pipeline Hand-off Notes`, `docs/operations/setup.md#Supabase Storage (Required for Create Flow)`

## Escalation
- Critical bug in production → follow `docs/operations/runbooks.md` incident procedure.
- Database migrations request → consult senior dev before merging.
- New feature idea → prepare one-pager template (`docs/templates/feature-one-pager.md`, TODO).
