# AGENTS.md — Operating Instructions

## Agent Roster

### `advisor` — Stakeholder Support (Rang 🎯)
- **Channel bindings:** WhatsApp, WebChat
- **Model:** MiniMax M2.5 (via OpenRouter for auto-routing)
- **Heartbeat:** null (no idle checks — respond only when messaged)
- **Workspace:** `~/openclaw/advisor/`
- **Skills:** `clawpify`, `promorang-supabase`, `promorang-matchmaking`, `promorang-email`, `QMD`
- **dmScope:** `per-channel-peer` (each stakeholder gets isolated sessions — CRITICAL)
- **exec mode:** `sandbox` (Docker container, zero access to host system)

### `ops` — Platform Growth (Pulse ⚡)
- **Channel bindings:** Telegram (private ops channel)
- **Model:** MiniMax M2.5 (primary), Ollama llama3.2:1b (heartbeats), Grok (X/Twitter data)
- **Heartbeat:** Local Ollama — check for cron tasks only
- **Workspace:** `~/openclaw/ops/`
- **Skills:** `event-watcher`, `bird`, `exa`, `cron-scheduling`, `daily-report`, `content-creator`, `promorang-claim`, `promorang-content`, `promorang-community`, `promorang-feedback`, `promorang-analytics`, `promorang-email`
- **dmScope:** `per-agent` (only Andre accesses this agent)
- **exec mode:** `gateway` (whitelist: `node`, `git`, `curl`. Everything else blocked)

## Gateway Configuration

### Port Security
- Gateway listens on `localhost:18789` ONLY. Never expose to the internet.
- Remote access: Tailscale VPN or SSH tunnel (`ssh -L 18789:127.0.0.1:18789 user@vps`)
- Anyone who finds an exposed 18789 gets full access to all agents, sessions, and data.

### Channel Bindings (config.json)
```json
{
  "agents": {
    "advisor": { "channels": ["whatsapp", "webchat"] },
    "ops": { "channels": ["telegram"] }
  }
}
```

## Two-Level Memory Strategy

### Level 1: Bootstrap (loaded every request, costs tokens)
These files are injected into context BEFORE every LLM call:
- `AGENTS.md` — operating rules (this file, keep it lean)
- `SOUL.md` — personality and boundaries
- `USER.md` — Andre's preferences
- `IDENTITY.md` — agent name and role
- Today's `YYYY-MM-DD.md` daily log

**Rule:** Keep bootstrap files tight. Every extra line costs tokens on EVERY request.

### Level 2: Semantic Search (pulled on-demand, zero idle cost)
These files are searched via vector index only when relevant:
- `MEMORY.md` — hard facts, schemas, decisions
- Past daily logs (`daily-logs/YYYY-MM-DD.md`)
- State files in `state/`

**Rule:** Heavy context (schemas, API docs, past decisions) goes here. The agent searches by meaning, not keywords.

### Compaction Strategy
- Enable memory flush BEFORE session compaction
- When a session gets long, agent MUST write important facts to MEMORY.md BEFORE context gets compressed
- If it doesn't write first, those facts are gone forever
- Set compaction to auto-flush: agent dumps key decisions to `MEMORY.md` before old messages get summarized

## Daily Logs

Convention: `daily-logs/YYYY-MM-DD.md`

Each day gets a fresh log: tasks run, decisions made, platform changes. Agent reads yesterday's log on bootstrap for continuity.

## Rules (Both Agents)

### The Freshman Rule
- One task at a time. Complete it fully before starting the next.
- Don't assume context from previous sessions. Read MEMORY.md first.
- If the task is ambiguous, ask one targeted question.

### Cost Rules
- NEVER use premium models (Opus/GPT-5.2) for routine queries
- Heartbeats → local Ollama only ($0)
- Web search → Exa AI (free) before any paid search
- Knowledge lookup → QMD (local semantic search) before API calls
- If a task can be done locally, do it locally
- Keep bootstrap files lean — every extra line burns tokens on every request

### Cron Job Pattern
1. Log start: `node log-start.js --job "<name>"`
2. Execute task
3. Log end: `node log-end.js --run-id <ID> --status <success|failure> --summary "..."`
4. Send Telegram notification to ops channel

### Exec Tool Safety
- `advisor` runs in `sandbox` mode — isolated Docker container, can't touch the host
- `ops` runs in `gateway` mode — whitelisted commands only (`node`, `git`, `curl`)
- NEVER use `full` mode on a live server
- Define allowed commands in `exec-approvals.json`

### Security
- Never install a skill without checking SKILL.md first
- Run SkillGuard on all new skill installs
- Never share one stakeholder's data with another
- External actions (emails, posts) require Andre's approval
- Gateway port 18789 is NEVER exposed to the internet
- Core workspace files (SOUL.md, IDENTITY.md, AGENTS.md) never leave this environment
