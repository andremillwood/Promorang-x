import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { operationalSupabase as db } from "@/integrations/supabase/operational";

export type SceneOption = { id: string; title: string; city: string | null; description: string | null };
export type Collaborator = { id: string; role: string; display_name: string | null; invited_user_id: string | null; invited_organization_id: string | null; responsibility: string | null; status: string; response_message: string | null; metadata?: Record<string, unknown> };
export type ContentAssignment = { id: string; phase: string; title: string; direction: string; format: string | null; destination: string | null; due_at: string | null; compensation_amount: number | null; currency: string; status: string; owner_user_id: string | null };
export type Contribution = { id: string; contribution_type: string; description: string; amount: number | null; currency: string; status: string };
export type PersonOption = { user_id: string; full_name: string | null; location?: string | null; avatar_url: string | null };
export type OutcomeSnapshot = { id: string; people_showed_up: number; people_returned: number; stories_created: number; collaborations_opened: number; gross_value: number; currency: string; human_return_summary: string | null; commercial_return_summary: string | null; scene_learning_summary?: string | null; content_return_summary?: string | null; gems_return_summary?: string | null; participant_value_summary?: string | null; next_decision?: string | null; next_decision_note?: string | null; review_loop?: Record<string, string>; captured_at: string };
export type AccessTier = { id: string; name: string; description: string | null; access_type: string; price: number; currency: string; capacity: number | null; issued_count: number; eligibility_summary: string | null; reward_summary: string | null; status: string };
export type AccessPass = { id: string; tier_id: string; pass_code: string; status: string; source: string; amount_paid: number };
export type FundingEvent = { id: string; amount: number; currency: string; event_type: string; provider: string; occurred_at: string };
export type PayoutAllocation = { id: string; recipient_user_id: string; purpose: string; amount: number; currency: string; release_condition: string; status: string };
export type ResolutionCase = { id: string; case_type: string; title: string; status: string; created_at: string };
export type GemReserve = { proposal_id: string; secured_gems: number; released_gems: number; refunded_gems: number };
export type GemReservation = { id: string; user_id: string; amount_gems: number; purpose: string; status: string; released_gems: number; refunded_gems: number; access_pass_id: string | null; secured_at: string };
export type EconomyWallet = { user_id: string; gems: number };
export type ValueCommitment = { id: string; commitment_type: string; provider_name: string; fulfiller_name: string | null; summary: string; terms: string | null; quantity: number | null; face_value: number | null; currency: string | null; status: string; confirmed_at: string | null };

function requestKey(prefix: string) {
  return `${prefix}:${crypto.randomUUID()}`;
}

function useOperationalMutation<T>(work: (value: T) => Promise<void>, success: string, refresh: () => Promise<unknown>) {
  return useMutation({ mutationFn: work, onSuccess: async () => { await refresh(); toast.success(success); }, onError: (error: Error) => toast.error(error.message || "That change could not be saved") });
}

export function useActivationOperations(proposalId: string) {
  const queryClient = useQueryClient();
  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ["activation", proposalId] }),
    queryClient.invalidateQueries({ queryKey: ["activation-operations", proposalId] }),
    queryClient.invalidateQueries({ queryKey: ["activation-plans"] }),
  ]);

  const scenes = useQuery({ queryKey: ["activation-scenes"], queryFn: async () => { const { data, error } = await db.from("scenes").select("id,title,city,description").eq("status", "active").order("title").limit(50); if (error) throw error; return (data || []) as SceneOption[]; } });
  const people = useQuery({ queryKey: ["activation-people"], queryFn: async () => { const { data, error } = await db.from("profiles").select("user_id,full_name,avatar_url").limit(100); if (error) throw error; return (data || []).filter((person: PersonOption) => Boolean(person.full_name)).sort((a: PersonOption, b: PersonOption) => (a.full_name || "").localeCompare(b.full_name || "")) as PersonOption[]; }, retry: false });
  const operations = useQuery({ queryKey: ["activation-operations", proposalId], queryFn: async () => {
    const user = (await db.auth.getUser()).data.user;
    const [collaborators, content, contributions, history, outcomes, access, passes, funding, payouts, cases, reserve, reservations, wallet, valueCommitments] = await Promise.all([
      db.from("activation_collaborators").select("*").eq("proposal_id", proposalId).neq("status", "removed").order("created_at"),
      db.from("activation_content_assignments").select("*").eq("proposal_id", proposalId).order("created_at"),
      db.from("activation_contributions").select("*").eq("proposal_id", proposalId).order("created_at"),
      db.from("activation_status_history").select("*").eq("proposal_id", proposalId).order("created_at", { ascending: false }),
      db.from("activation_outcome_snapshots").select("*").eq("proposal_id", proposalId).order("captured_at", { ascending: false }),
      db.from("activation_access_tiers").select("*").eq("proposal_id", proposalId).order("created_at"),
      db.from("activation_access_passes").select("*").eq("proposal_id", proposalId).order("issued_at", { ascending: false }),
      db.from("activation_funding_events").select("*").eq("proposal_id", proposalId).order("occurred_at", { ascending: false }),
      db.from("activation_payout_allocations").select("*").eq("proposal_id", proposalId).order("created_at"),
      db.from("activation_resolution_cases").select("*").eq("proposal_id", proposalId).order("created_at", { ascending: false }),
      db.from("activation_gem_reserves").select("*").eq("proposal_id", proposalId).maybeSingle(),
      db.from("activation_gem_reservations").select("*").eq("proposal_id", proposalId).order("secured_at", { ascending: false }),
      user ? db.from("economy_wallets").select("user_id,gems").eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      db.from("activation_value_commitments").select("*").eq("proposal_id", proposalId).order("created_at"),
    ]);
    const error = collaborators.error || content.error || contributions.error || history.error || outcomes.error || access.error || passes.error || funding.error || payouts.error || cases.error || reserve.error || reservations.error || wallet.error || valueCommitments.error;
    if (error) throw error;
    return { collaborators: (collaborators.data || []) as Collaborator[], content: (content.data || []) as ContentAssignment[], contributions: (contributions.data || []) as Contribution[], history: history.data || [], outcomes: (outcomes.data || []) as OutcomeSnapshot[], access: (access.data || []) as AccessTier[], passes: (passes.data || []) as AccessPass[], funding: (funding.data || []) as FundingEvent[], payouts: (payouts.data || []) as PayoutAllocation[], cases: (cases.data || []) as ResolutionCase[], reserve: reserve.data as GemReserve | null, reservations: (reservations.data || []) as GemReservation[], wallet: wallet.data as EconomyWallet | null, valueCommitments: (valueCommitments.data || []) as ValueCommitment[] };
  }, enabled: Boolean(proposalId) });

  const linkScene = useOperationalMutation<string>(async (sceneId) => { const { error } = await db.rpc("link_activation_scene", { p_proposal_id: proposalId, p_scene_id: sceneId }); if (error) throw error; }, "Scene connected", refresh);
  const linkMoment = useOperationalMutation<string>(async (momentId) => { const { error } = await db.rpc("link_activation_moment", { p_proposal_id: proposalId, p_moment_id: momentId }); if (error) throw error; }, "Moment connected", refresh);
  const unlinkScene = useOperationalMutation<void>(async () => { const { error } = await db.rpc("unlink_activation_scene", { p_proposal_id: proposalId }); if (error) throw error; }, "Scene disconnected", refresh);
  const unlinkMoment = useOperationalMutation<void>(async () => { const { error } = await db.rpc("unlink_activation_moment", { p_proposal_id: proposalId }); if (error) throw error; }, "Moment disconnected", refresh);
  const requestMomentPartnership = useOperationalMutation<{ momentId: string; message?: string }>(async (value) => { const { error } = await db.rpc("request_activation_moment_partnership", { p_proposal_id: proposalId, p_moment_id: value.momentId, p_message: value.message || null }); if (error) throw error; }, "Partnership request sent to the host", refresh);
  const move = useOperationalMutation<{ state: string; note?: string }>(async ({ state, note }) => { const { error } = await db.rpc("move_activation", { p_proposal_id: proposalId, p_to_state: state, p_note: note || null }); if (error) throw error; }, "Activation moved forward", refresh);
  const invite = useOperationalMutation<{ userId: string; name: string; role: string; responsibility: string }>(async (value) => { const { error } = await db.from("activation_collaborators").insert({ proposal_id: proposalId, invited_user_id: value.userId, invited_by: (await db.auth.getUser()).data.user?.id, display_name: value.name, role: value.role, responsibility: value.responsibility, status: "invited" }); if (error) throw error; }, "Invitation opened", refresh);
  const addContent = useOperationalMutation<{ phase: string; title: string; direction: string }>(async (value) => { const { error } = await db.from("activation_content_assignments").insert({ proposal_id: proposalId, phase: value.phase, title: value.title, direction: value.direction, status: "open" }); if (error) throw error; }, "Content responsibility added", refresh);
  const addContribution = useOperationalMutation<{ type: string; description: string; amount?: number }>(async (value) => { const user = (await db.auth.getUser()).data.user; const { error } = await db.from("activation_contributions").insert({ proposal_id: proposalId, contributor_user_id: user?.id, contribution_type: value.type, description: value.description, amount: value.amount || null, status: "offered" }); if (error) throw error; }, "Contribution recorded", refresh);
  const respond = useOperationalMutation<{ collaboratorId: string; response: "accepted" | "declined" | "changes_requested"; message?: string }>(async (value) => { const { error } = await db.rpc("respond_to_activation_invitation", { p_collaborator_id: value.collaboratorId, p_response: value.response, p_message: value.message || null }); if (error) throw error; }, "Your response was shared", refresh);
  const recordOutcome = useOperationalMutation<{ sceneId?: string; momentId?: string; showed: number; returned: number; stories: number; collaborations: number; grossValue: number; human: string; commercial: string; content?: string; gems?: string; participantValue?: string; sceneLearning?: string; nextDecision?: string; nextDecisionNote?: string; reviewLoop?: Record<string, string> }>(async (value) => { const user = (await db.auth.getUser()).data.user; if (!user) throw new Error("Sign in to record the shared return"); const { error } = await db.from("activation_outcome_snapshots").insert({ proposal_id: proposalId, scene_id: value.sceneId || null, moment_id: value.momentId || null, owner_user_id: user.id, stakeholder_type: "agency", people_showed_up: value.showed, people_returned: value.returned, stories_created: value.stories, collaborations_opened: value.collaborations, gross_value: value.grossValue, human_return_summary: value.human, commercial_return_summary: value.commercial, content_return_summary: value.content || null, gems_return_summary: value.gems || null, participant_value_summary: value.participantValue || null, scene_learning_summary: value.sceneLearning || null, next_decision: value.nextDecision || null, next_decision_note: value.nextDecisionNote || null, review_loop: value.reviewLoop || {}, metadata: { proposal_id: proposalId } }); if (error) throw error; }, "Shared return recorded", refresh);
  const addAccess = useOperationalMutation<{ momentId?: string; name: string; description: string; type: string; price: number; capacity?: number; eligibility: string; reward: string }>(async (value) => { const { error } = await db.from("activation_access_tiers").insert({ proposal_id: proposalId, moment_id: value.momentId || null, name: value.name, description: value.description, access_type: value.type, price: value.price, capacity: value.capacity || null, eligibility_summary: value.eligibility, reward_summary: value.reward, status: "open" }); if (error) throw error; }, "Access opened", refresh);
  const claimAccess = useOperationalMutation<string>(async (tierId) => { const { error } = await db.rpc("claim_free_activation_access", { p_tier_id: tierId }); if (error) throw error; }, "Your access is ready", refresh);
  const purchaseAccess = useOperationalMutation<string>(async (tierId) => { const { error } = await db.rpc("purchase_activation_access_with_gems", { p_tier_id: tierId, p_idempotency_key: requestKey("access") }); if (error) throw error; }, "Your Gems secured this access", refresh);
  const secureGems = useOperationalMutation<number>(async (amount) => { const { error } = await db.rpc("secure_activation_gems", { p_proposal_id: proposalId, p_amount_gems: amount, p_idempotency_key: requestKey("activation") }); if (error) throw error; }, "Gems secured for this activation", refresh);
  const setValueModel = useOperationalMutation<{ model: string; summary: string }>(async (value) => { const { error } = await db.rpc("set_activation_value_model", { p_proposal_id: proposalId, p_value_model: value.model, p_participant_value_summary: value.summary }); if (error) throw error; }, "Participant value model saved", refresh);
  const addValueCommitment = useOperationalMutation<{ type: string; provider: string; fulfiller?: string; summary: string; terms?: string; quantity?: number; faceValue?: number; currency?: string }>(async (value) => { const { error } = await db.from("activation_value_commitments").insert({ proposal_id: proposalId, commitment_type: value.type, provider_name: value.provider, fulfiller_name: value.fulfiller || null, summary: value.summary, terms: value.terms || null, quantity: value.quantity || null, face_value: value.faceValue ?? null, currency: value.currency || null, status: "offered" }); if (error) throw error; }, "Value commitment recorded", refresh);
  const confirmValueCommitment = useOperationalMutation<string>(async (commitmentId) => { const { error } = await db.rpc("confirm_activation_value_commitment", { p_commitment_id: commitmentId }); if (error) throw error; }, "Promise confirmed", refresh);
  const addPayout = useOperationalMutation<{ momentId?: string; collaboratorId?: string; recipientId: string; purpose: string; amount: number; condition: string }>(async (value) => { const { error } = await db.from("activation_payout_allocations").insert({ proposal_id: proposalId, moment_id: value.momentId || null, collaborator_id: value.collaboratorId || null, recipient_user_id: value.recipientId, purpose: value.purpose, amount: value.amount, release_condition: value.condition, status: "planned" }); if (error) throw error; }, "Payout promise recorded", refresh);
  const openCase = useOperationalMutation<{ momentId?: string; type: string; title: string; description: string; resolution: string }>(async (value) => { const user = (await db.auth.getUser()).data.user; if (!user) throw new Error("Sign in to ask for help"); const { error } = await db.from("activation_resolution_cases").insert({ proposal_id: proposalId, moment_id: value.momentId || null, opened_by: user.id, case_type: value.type, title: value.title, description: value.description, requested_resolution: value.resolution }); if (error) throw error; }, "Your request is now visible", refresh);
  const releasePayout = useOperationalMutation<string>(async (allocationId) => { const { error } = await db.rpc("release_activation_payout_gems", { p_allocation_id: allocationId, p_idempotency_key: requestKey("payout") }); if (error) throw error; }, "Gems released", refresh);
  const refundReservation = useOperationalMutation<string>(async (reservationId) => { const { error } = await db.rpc("refund_activation_gem_reservation", { p_reservation_id: reservationId, p_idempotency_key: requestKey("refund") }); if (error) throw error; }, "Gems refunded", refresh);

  return { scenes, people, operations, linkScene, linkMoment, unlinkScene, unlinkMoment, requestMomentPartnership, move, invite, addContent, addContribution, respond, recordOutcome, addAccess, claimAccess, purchaseAccess, secureGems, setValueModel, addValueCommitment, confirmValueCommitment, addPayout, openCase, releasePayout, refundReservation };
}
