# AI Developer Guidelines

_Last updated: 2025-10-29_

## Purpose
Ensure AI (Cascade/SWE) contributors work efficiently, follow project standards, and minimize token usage while delivering production-ready code.

## Required Context for Any Task
Before coding, gather:
1. **Task description** and acceptance criteria.
2. **Relevant file paths** (use `find_by_name`, `grep_search`).
3. **Existing implementation patterns** (reference docs below).
4. **Tests to update/run**.

## Token Efficiency Tips
- Reference specific files/line ranges instead of broad queries.
- Summarize code context in bullet points when asking for guidance.
- Cache repeated commands in prompts (e.g., `npm test`).
- Use `update_plan` only when task complexity warrants multi-step work.

## Coding Standards
- Follow service patterns in `docs/backend/services.md`.
- Frontend components/hook conventions in `docs/frontend/architecture.md`.
- Tests must mock Supabase consistently (`backend/tests/mocks`).
- Add comments only for non-obvious logic; prefer self-documenting code.

## Workflow Checklist
1. Create feature branch (`feature/<ticket>-<short-desc>`).
2. Implement changes with focused commits.
3. Update documentation if APIs, schemas, or flows change.
4. Run appropriate checks:
   - Backend: `npm test`
   - Frontend: `npm run lint`, `npm run test`
5. Provide PR summary with test evidence and doc links.

## Documentation Index
- `docs/architecture.md`
- `docs/growth-hub-overview.md`
- `docs/backend/services.md`
- `docs/frontend/architecture.md`
- `docs/frontend/growth-hub-ui.md`
- `docs/operations/runbooks.md`

## Communication Guidelines
- Status updates: concise bullet (progress, next action, blockers).
- Escalate blockers within same day via Slack `#growth-hub-dev`.
- Record decisions in `docs/decisions/<YYYY-MM-DD>-<topic>.md`.

## Security & Secrets
- Never expose Supabase keys or JWT secrets in logs/PRs.
- Use `.env.example` as template; update when new vars introduced.

## When in Doubt
- Read existing tests/docs before writing new logic.
- Ask for clarifications with proposed approach + open questions.
- Avoid speculative refactors; focus on ticket scope.
