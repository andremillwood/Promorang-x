import type { CommunityWorkspaceData } from '@/types/community';
// Synthetic examples for tests and local visual review only. Never returned by the API.
export const communityFixture: CommunityWorkspaceData = {
  membership: { id: 'member-1', user_id: 'user-1', display_name: 'Alex', status: 'active', tier: 'free', can_manage: false, career_path: 'YouTube Creator', personal_goal: 'Publish a useful video series and build a returning audience.', pods: ['general', 'creators'], joined_at: '2026-09-01T12:00:00Z' },
  framework: { timezone: 'America/Jamaica', paths: ['YouTube Creator', 'Community Leader'], kinds: ['content', 'distribution'], tiers: ['free', 'premium', 'super'],
    pods: [{ id: 'general', name: 'General Room', focus: 'Bring a useful question or your next collaboration.' }, { id: 'creators', name: 'Content Creators', focus: 'Create and get feedback.' }],
    daily: [{ start: '09:00', end: '10:00', title: 'Morning Motivation', prompt: 'Choose one thing to move forward today.' }, { start: '13:00', end: '14:00', title: 'Lunch & Learn', prompt: 'Learn one thing and put it to work.' }],
    weeks: [1, 2, 3, 4].map(week => ({ week, title: ['Find your feet', 'Build your edge', 'Make it happen together', 'Keep the wins moving'][week - 1], sourceTitle: 'Community growth', hostNotes: 'Share real outcomes.', sessions: [{ day: 'Wednesday', tier: 'free', title: 'Creator working session' }] })),
    roles: [{ id: 'creator', name: 'Content Creator', purpose: 'Make useful original work that helps people grow.', proof: 'Original work accepted against the brief.', privileges: ['Creator badge', 'Role room', 'Creator resources'], tiers: ['free', 'premium', 'super'] }], ongoing: [],
  },
  definitions: [{ slug: 'creator', name: 'Content Creator', kind: 'content', tiers: ['free', 'premium', 'super'], min_points: 60, min_moves: 2, term_days: 90, review_days: 30, grace_days: 7 }],
  myRoles: [], people: [],
  goals: [{ id: 'goal-1', title: 'Help the next wave of creators find their feet', why: 'Useful work and a supportive first audience make it easier to keep creating.', starts_on: '2026-09-01', ends_on: '2099-10-01', results: [{ id: 'result-1', title: 'First original tutorials published', unit: 'tutorials', target: 10, current_value: 3 }, { id: 'result-2', title: 'New creators supported', unit: 'members', target: 20, current_value: 8 }] }],
  moves: [{ id: 'move-1', created_by: 'lead-1', title: 'Turn one useful idea into a 60-second tutorial', brief: 'Choose something you know well. Make a short, original tutorial that helps a new creator take their first step.', proof_prompt: 'Share the original video link and a short note explaining who it helps.', kind: 'content', pod: 'creators', status: 'open', result_id: 'result-1', points: 30, gems: 10, capacity: 3, min_tier: 'free', required_role: null, due_at: '2099-09-25T22:00:00Z', eligible: true, secured_gems: 30, released_gems: 0, refunded_gems: 0 }],
  work: [], receipts: [], sessions: [], posts: [],
  totals: { points: 90, recentPoints: 60, approvedMoves: 3, earnedGems: 20, pendingGems: 0 }, lead: null,
};
