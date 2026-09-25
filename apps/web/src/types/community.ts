export type CommunityTier = 'free' | 'premium' | 'super';
export type CommunityMembership = {
  id: string; user_id: string; status: 'pending' | 'active' | 'paused' | 'removed'; tier: CommunityTier;
  can_manage: boolean; member_kind?: 'participant' | 'builder'; display_name: string; career_path: string; personal_goal: string; pods: string[]; joined_at: string | null;
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
  network?: { settings: CommunityProgramSettings; plans: CommunityNetworkPlan[]; enrollment: CommunityNetworkEnrollment | null };
  engine?: { enabled: boolean; workspace: CommunityEngineWorkspace | null };
  isPlatformAdmin?: boolean;
  lead: null | { members: CommunityMembership[]; applications: CommunitySeat[]; reviewQueue: CommunityWork[];
    unfinished: CommunityWork[]; canAssignLeads: boolean;
    audit: Array<{ id: string; actor_id: string; action: string; record_id: string; created_at: string }> };
};
export type CommunityAction = (action: string, data: Record<string, unknown>) => Promise<unknown>;

export type CommunityProgramSettings = {
  participant_access_enabled: boolean;
  matrix_program_enabled: boolean;
  business_engine_enabled: boolean;
  matrix_mode: 'pilot' | 'active' | 'paused';
};
export type CommunityNetworkPlan = {
  plan_key: 'participant' | 'builder' | 'studio'; name: string; description: string;
  monthly_fee_cents: number; currency: string; status: 'draft' | 'available' | 'retired';
  features: string[]; requires_disclosure: boolean; requires_legal_approval: boolean;
};
export type CommunityNetworkEnrollment = {
  id: string; space_id: string; membership_id: string; user_id: string; sponsor_user_id: string | null;
  plan_key: 'builder' | 'studio'; status: 'interest' | 'pending' | 'active' | 'paused' | 'withdrawn';
  joined_at: string; activated_at: string | null; last_activity_at: string | null; plan?: CommunityNetworkPlan;
};
export type CommunityNetworkEvent = {
  id: string; event_type: string; source_ref: string | null; value_cents: number;
  status: 'pending' | 'verified' | 'rejected' | 'paid' | 'void'; notes: string | null;
  verified_at: string | null; created_at: string; enrollment?: { user_id: string; plan_key: string } | null;
};
export type CommunityNetworkData = {
  member: { id: string; member_kind: 'participant' | 'builder'; tier: CommunityTier; status: string };
  settings: CommunityProgramSettings; plans: CommunityNetworkPlan[]; enrollment: CommunityNetworkEnrollment | null; paths: string[];
  events: CommunityNetworkEvent[]; canExpressInterest: boolean; disclosure: string;
};
export type CommunityEngineWorkspace = { id: string; membership_id?: string; owner_id?: string; name: string; plan_key: string; status: string; timezone: string; created_at: string; updated_at: string };
export type CommunityEngineStage = { id: string; stage_key: string; name: string; sort_order: number; color: string; is_won: boolean; is_lost: boolean };
export type CommunityEngineContact = { id: string; display_name: string; email: string | null; phone: string | null; organization: string | null; source: string; lifecycle_stage: string; consent_status: string; next_action_at: string | null; notes: string | null; created_at: string; updated_at: string };
export type CommunityEngineDeal = { id: string; title: string; value_cents: number; source: string; expected_close_at: string | null; notes: string | null; stage_id: string; contact_id: string | null; stage?: CommunityEngineStage; contact?: { display_name: string; email: string | null }; created_at: string; updated_at: string };
export type CommunityEngineTask = { id: string; title: string; status: 'open' | 'complete' | 'snoozed'; priority: 'low' | 'normal' | 'high'; due_at: string | null; contact_id: string | null; deal_id: string | null; created_at: string; completed_at: string | null };
export type CommunityEngineAutomation = { id: string; name: string; trigger_key: string; action_key: string; status: string; config: Record<string, unknown>; last_run_at: string | null; created_at: string };
export type CommunityEngineForm = { id: string; name: string; slug: string; status: string; fields: Array<Record<string, unknown>>; submission_count: number; created_at: string };
export type CommunityEngineData = {
  enabled: boolean; canCreate: boolean; workspace: CommunityEngineWorkspace | null; plans: CommunityNetworkPlan[];
  stages: CommunityEngineStage[]; contacts: CommunityEngineContact[]; deals: CommunityEngineDeal[]; tasks: CommunityEngineTask[];
  automations: CommunityEngineAutomation[]; forms: CommunityEngineForm[];
};
export type CommunityAdminMetrics = {
  totalMembers: number; activeMembers: number; participants: number; builders: number; pendingMembers: number; pausedMembers: number;
  activeRoles: number; submittedWork: number; openMoves: number; heldGems: number; upcomingSessions: number;
  networkInterest: number; activeNetworkMembers: number; verifiedNetworkEvents: number; engineWorkspaces: number;
  engineContacts: number; engineDeals: number; openEngineTasks: number;
};
export type CommunityAdminData = {
  isPlatformAdmin: true; settings: CommunityProgramSettings; plans: CommunityNetworkPlan[]; metrics: CommunityAdminMetrics;
  members: CommunityMembership[]; seats: CommunitySeat[]; moves: CommunityMove[]; reviewQueue: CommunityWork[];
  goals: CommunityGoal[]; sessions: CommunitySession[]; enrollments: CommunityNetworkEnrollment[]; events: CommunityNetworkEvent[];
  engineWorkspaces: CommunityEngineWorkspace[]; audit: Array<{ id: string; actor_id: string; action: string; record_id: string | null; detail?: Record<string, unknown>; created_at: string }>;
};
