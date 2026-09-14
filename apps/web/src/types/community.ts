export type CommunityTier = 'free' | 'premium' | 'super';
export type CommunityMembership = {
  id: string; user_id: string; status: 'pending' | 'active' | 'paused' | 'removed'; tier: CommunityTier;
  can_manage: boolean; display_name: string; career_path: string; personal_goal: string; pods: string[]; joined_at: string | null;
};
export type CommunityMove = {
  id: string; created_by: string; title: string; brief: string; proof_prompt: string; kind: string; pod: string;
  status: 'proposed' | 'open' | 'closed'; result_id: string | null; points: number; gems: number; capacity: number;
  min_tier: CommunityTier; required_role: string | null; due_at: string; eligible: boolean;
  secured_gems: number; released_gems: number; refunded_gems: number;
};
export type CommunityWork = {
  id: string; move_id: string; user_id: string; status: string; proof: string | null; proof_url: string | null;
  submitted_at: string | null; reviewed_at: string | null; feedback: string | null;
  points_awarded: number; gems_awarded: number; verified_value: number; move: CommunityMove;
};
export type CommunityGoal = {
  id: string; title: string; why: string; starts_on: string; ends_on: string;
  results: Array<{ id: string; title: string; unit: string; target: number; current_value: number }>;
};
export type CommunityRoleDefinition = {
  slug: string; name: string; kind: string; tiers: CommunityTier[]; min_points: number; min_moves: number;
  term_days: number; review_days: number; grace_days: number;
};
export type CommunitySeat = {
  id: string; user_id: string; role_slug: string; status: string; application: string; starts_at: string | null;
  term_ends_at: string | null; review_at: string | null; grace_until: string | null; review_note: string | null;
  effective_status?: string; points?: number; moves?: number; definition?: CommunityRoleDefinition;
};
export type CommunitySession = {
  id: string; title: string; description: string; starts_at: string; duration_minutes: number;
  min_tier: CommunityTier; required_role: string | null; join_url: string | null; replay_url: string | null;
  moment_id: string | null; joined: boolean; eligible: boolean;
};
export type CommunityPost = {
  id: string; author_name: string; kind: string; pod: string; title: string; body: string; href: string | null;
  min_tier: CommunityTier; required_role: string | null; created_at: string;
};
export type CommunityWorkspaceData = {
  membership: CommunityMembership;
  framework: {
    paths: string[]; pods: Array<{ id: string; name: string; focus: string }>; kinds: string[]; tiers: CommunityTier[]; timezone: string;
    daily: Array<{ start: string; end: string; title: string; prompt: string }>;
    weeks: Array<{ week: number; title: string; sourceTitle: string; hostNotes: string; sessions: Array<{ day: string; tier: string; title: string }> }>;
    roles: Array<{ id: string; name: string; purpose: string; proof: string; privileges: string[]; tiers: CommunityTier[] }>;
    ongoing: Array<{ title: string; kind: string; purpose: string }>;
  };
  definitions: CommunityRoleDefinition[]; myRoles: CommunitySeat[];
  people: Array<Pick<CommunityMembership, 'id' | 'user_id' | 'display_name' | 'career_path' | 'personal_goal' | 'pods' | 'joined_at'>>;
  moves: CommunityMove[]; goals: CommunityGoal[]; sessions: CommunitySession[]; posts: CommunityPost[];
  work: CommunityWork[]; receipts: CommunityWork[];
  totals: { points: number; recentPoints: number; approvedMoves: number; earnedGems: number; pendingGems: number };
  lead: null | { members: CommunityMembership[]; applications: CommunitySeat[]; reviewQueue: CommunityWork[];
    unfinished: CommunityWork[]; canAssignLeads: boolean;
    audit: Array<{ id: string; actor_id: string; action: string; record_id: string; created_at: string }> };
};
export type CommunityAction = (action: string, data: Record<string, unknown>) => Promise<unknown>;
