# Promorang community members experience

This is the operating model for the private community layer added to Promorang-x. It turns the existing PromoCard into the member’s account representation while giving active community members a place to do useful work, earn recognition, and keep access to the rooms and perks they have earned.

The design follows **Promorang - Community Management - 101** and **Promorang - Community Framework & General Community Schedule**. Their practical ideas are kept intact: daily prompts, platform learning, feedback, content, referrals, events, recognition, career paths, rotating roles, and direct community revenue. The product language is intentionally lighter:

| Community language | What it means in the product |
| --- | --- |
| **Goal** | The change the community wants to make this season. |
| **Win** | A measurable result attached to that goal. |
| **Move** | A small, claimable piece of work that helps a win happen. |
| **Receipt** | The proof a member submits. A lead verifies it before rewards land. |
| **Place** | A role, room, tier, or perk that a member currently has access to. |
| **Rhythm** | The daily and four-week schedule that keeps the community moving. |

## Product shape

The public product keeps its existing account, PromoCard, perks, and Moments flows. A signed-in account can see the invitation into Community, but `/community` stays private: a person must apply and then be approved as an active member. Pending, paused, and removed members never receive cached workspace data in the UI.

Inside the private workspace:

- **Today** is the friendly front door: the member’s PromoCard, current place, next move, one goal trail, and a clear invitation to earn the next win.
- **Move board** is the work queue. Members can pitch an idea, claim an open move, submit a receipt, and see whether a lead needs changes.
- **Rhythm** combines booked sessions with the planned four-week playbook and the Jamaica-time daily schedule. Planned sessions are clearly marked as planned until a lead books them.
- **My place** shows tier, role seats, points progress, review date, grace window, and the moves needed to keep a seat.
- **Rooms** contains the General Room, the five source-aligned pods, role rooms, and the active member directory.
- **My wins** is the receipt history: approved points, Gems, verified value, and the existing wallet link.
- **Lead room** appears only for active leads and contains review, publishing, member, role, session, policy, funding, and audit tools.

The PromoCard connection is deliberately visible in both directions. The community hero uses the member’s PromoCard face, links back to `/card` for perks and saved access, and links to `/moments` for the broader Moments experience. The card also links into Community, so the card remains the account representation rather than becoming a second identity system.

## How the community operates

Members can suggest a move, but a lead opens it after linking it to a measurable win. An opened move has a brief, proof prompt, deadline, capacity, points, optional Gems, tier requirement, and optional role requirement. A member claims a place, does the work, and submits a receipt. A lead approves, requests changes, or declines it. Approval is the only point at which the canonical points/Gems ledger and the linked win are updated.

Paid moves are funded before opening. The funder’s Gems are held against the move, released once per approved receipt, and refunded when an opened move closes with unused capacity. The transaction keys make funding, rewards, and refunds safe to retry. Members cannot review their own work, and a late claim stays visible for a lead to decide rather than being silently erased.

Roles are useful seats, not permanent status badges. A member applies with a short reason, a lead appoints them for a 90-day term, and a 30-day check-in measures approved points and role-kind moves. A seven-day grace window gives the member a chance to catch up; after grace, the seat pauses until a fresh application. Platform administrators control who can manage the Lead Room through the protected `user_roles` table. Account metadata cannot grant access.

The initial seats map to the source framework:

| Seat | Helps with | Default access |
| --- | --- | --- |
| Community Ambassador | Welcome, onboarding, and activation | Premium / Super |
| Content Creator | Useful original content and highlights | Free / Premium / Super |
| Event Coordinator | Sessions and event logistics | Premium / Super |
| Growth Champion | Referrals and distribution | Free / Premium / Super |
| Task Master | Move quality, follow-through, and operations | Free / Premium / Super |
| Mentor | Peer support and skills development | Premium / Super |

## The playful OKR-like loop

Use the loop in weekly check-ins and monthly planning. It keeps the discipline of OKRs without making the community feel like a spreadsheet.

1. **Pick the change.** Write one plain-language goal and a short reason it matters.
2. **Name the win.** Add one to three measurable results with a unit and target.
3. **Choose the moves.** Publish small jobs that members can finish in one sitting or one focused block.
4. **Leave a receipt.** Proof should show what changed, who benefited, and a link when a link exists.
5. **Give the big up.** A lead verifies the receipt, awards points/Gems when funded, and updates the win.
6. **Keep your place.** Role review looks at the recent window, then keeps, graces, pauses, or reopens the seat.

Example: “Help five new creators publish their first useful piece” is the goal. “Five first-time creators supported” is the win. A move might be “Run a 30-minute tutorial clinic,” with 40 points, 15 Gems, a two-person capacity, and a receipt asking for the replay plus each creator’s published link.

## Community rhythm

All times use `America/Jamaica` and can be hosted in the General Room or a pod.

| Time | Beat | Member invitation |
| --- | --- | --- |
| 9–10 | Morning Motivation | Share the intention for the day and give a Big Up. |
| 10–12 | Platform Tips | Try one product tip and help one other member use it. |
| 12–1 | Polls / Feedback | Vote, answer, and surface friction while it is fresh. |
| 1–2 | Lunch & Learn | Join a short lesson, clinic, or peer demo. |
| 2–3 | Content Highlights | Share useful work and explain why it helped. |
| 3–4 | Referral Strategies | Make one warm introduction or improve one distribution path. |
| 4–5 | Reflection | Post the win, the lesson, and the next move. |

The four-week loop is:

- **Week 1 — Welcome:** finish the profile, choose a career path, meet the rooms, and claim a starter move.
- **Week 2 — Skills:** attend a clinic, ship a small piece of work, and give useful feedback.
- **Week 3 — Activation:** collaborate across pods, make a referral, and help a member reach a win.
- **Week 4 — Review:** share receipts, review role standing, celebrate Big Ups, and choose the next month’s goal.

The longer-running layer includes the newsletter, Big Ups, PromoShare moments, resource library, monthly challenge, super-user campaigns, and feedback loops from the source framework.

## Build map

- `backend/community/framework.js` is the source-aligned schedule, pods, paths, roles, and operating vocabulary.
- `backend/community/validation.js` validates every command, including dates and HTTPS proof/resource links.
- `backend/services/communityService.js` is the private API boundary. It loads only the active member’s workspace and re-checks membership after loading it.
- `backend/api/community.js` exposes `/api/community/access`, `/api/community/workspace`, and authenticated action commands with private no-store caching.
- `supabase/migrations/20260914034622_community_members_experience.sql` creates the data model, RLS posture, invoker functions, audit trail, role review, and canonical ledger hooks.
- `apps/web/src/pages/CommunityPortal.tsx` and the `components/community` modules provide the protected experience and lead room.

## Rollout loop

1. Bootstrap one platform administrator as the first lead.
2. Invite a small pilot across creators, growth, events, and mentoring.
3. Run one four-week rhythm with funded moves and a visible receipt trail.
4. Review completion, approval time, repeat participation, role retention, Gems released/refunded, and member feedback.
5. Adjust policy thresholds and move templates in the Lead Room, then widen access.

The first release is intentionally small: it gives the community a safe place to practice the loop before adding more tiers, automations, or public discovery.
