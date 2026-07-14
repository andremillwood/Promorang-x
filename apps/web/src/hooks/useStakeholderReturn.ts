import { useQuery } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as unknown as SupabaseClient;

type StakeholderRole = "participant" | "creator" | "host" | "merchant" | "venue" | "brand" | "agency";

type OutcomeRow = {
  people_reached: number;
  people_joined: number;
  people_showed_up: number;
  people_returned: number;
  stories_created: number;
  creator_driven_visits: number;
  invitations_opened: number;
  collaborations_opened: number;
  redemptions: number;
  purchases: number;
  gross_value: number;
  funded_value: number;
  human_return_summary: string | null;
  commercial_return_summary: string | null;
  scene_learning_summary: string | null;
  content_return_summary: string | null;
  gems_return_summary: string | null;
  participant_value_summary: string | null;
  next_decision: string | null;
  next_decision_note: string | null;
  captured_at: string;
};

type GemRow = { amount: number; transaction_type: string; source: string; description: string | null; created_at: string };
type PassRow = { id: string; status: string; amount_paid: number; source: string; issued_at: string };
type OpeningRow = { id: string; type: string; title: string; status: string; opened_at: string };
type CollaboratorRow = { id: string; role: string; status: string; responsibility: string | null; created_at: string };

const roleLabels: Record<StakeholderRole, string> = {
  participant: "Your social return",
  creator: "Creator return",
  host: "Host return",
  merchant: "Venue return",
  venue: "Venue return",
  brand: "Brand return",
  agency: "Agency return",
};

export function useStakeholderReturn(role: StakeholderRole, enabled = true) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["stakeholder-return", role, user?.id],
    enabled: Boolean(user && enabled),
    queryFn: async () => {
      if (!user) throw new Error("Sign in to view return");

      const [outcomesResult, gemsResult, passesResult, openingsResult, collaborationsResult] = await Promise.all([
        db
          .from("activation_outcome_snapshots")
          .select("people_reached,people_joined,people_showed_up,people_returned,stories_created,creator_driven_visits,invitations_opened,collaborations_opened,redemptions,purchases,gross_value,funded_value,human_return_summary,commercial_return_summary,scene_learning_summary,content_return_summary,gems_return_summary,participant_value_summary,next_decision,next_decision_note,captured_at")
          .eq("owner_user_id", user.id)
          .order("captured_at", { ascending: false })
          .limit(12),
        db
          .from("economy_transactions")
          .select("amount,transaction_type,source,description,created_at")
          .eq("user_id", user.id)
          .eq("currency", "gems")
          .order("created_at", { ascending: false })
          .limit(24),
        db
          .from("activation_access_passes")
          .select("id,status,amount_paid,source,issued_at")
          .eq("user_id", user.id)
          .order("issued_at", { ascending: false })
          .limit(24),
        db
          .from("opportunity_openings")
          .select("id,type,title,status,opened_at")
          .eq("beneficiary_user_id", user.id)
          .order("opened_at", { ascending: false })
          .limit(6),
        db
          .from("activation_collaborators")
          .select("id,role,status,responsibility,created_at")
          .eq("invited_user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(12),
      ]);

      const error = outcomesResult.error || gemsResult.error || passesResult.error || openingsResult.error || collaborationsResult.error;
      if (error) throw error;

      const outcomes = (outcomesResult.data || []) as OutcomeRow[];
      const gems = (gemsResult.data || []) as GemRow[];
      const passes = (passesResult.data || []) as PassRow[];
      const openings = (openingsResult.data || []) as OpeningRow[];
      const collaborations = (collaborationsResult.data || []) as CollaboratorRow[];

      const totals = outcomes.reduce(
        (sum, row) => ({
          peopleReached: sum.peopleReached + Number(row.people_reached || 0),
          peopleJoined: sum.peopleJoined + Number(row.people_joined || 0),
          peopleShowedUp: sum.peopleShowedUp + Number(row.people_showed_up || 0),
          peopleReturned: sum.peopleReturned + Number(row.people_returned || 0),
          storiesCreated: sum.storiesCreated + Number(row.stories_created || 0),
          creatorVisits: sum.creatorVisits + Number(row.creator_driven_visits || 0),
          invitationsOpened: sum.invitationsOpened + Number(row.invitations_opened || 0),
          collaborationsOpened: sum.collaborationsOpened + Number(row.collaborations_opened || 0),
          redemptions: sum.redemptions + Number(row.redemptions || 0),
          purchases: sum.purchases + Number(row.purchases || 0),
          grossValue: sum.grossValue + Number(row.gross_value || 0),
          fundedValue: sum.fundedValue + Number(row.funded_value || 0),
        }),
        { peopleReached: 0, peopleJoined: 0, peopleShowedUp: 0, peopleReturned: 0, storiesCreated: 0, creatorVisits: 0, invitationsOpened: 0, collaborationsOpened: 0, redemptions: 0, purchases: 0, grossValue: 0, fundedValue: 0 },
      );

      const gemsEarned = gems.filter((row) => Number(row.amount) > 0).reduce((sum, row) => sum + Number(row.amount), 0);
      const gemsUsed = Math.abs(gems.filter((row) => Number(row.amount) < 0).reduce((sum, row) => sum + Number(row.amount), 0));
      const paidAccessValue = passes.reduce((sum, row) => sum + Number(row.amount_paid || 0), 0);
      const acceptedCollaborations = collaborations.filter((row) => row.status === "accepted").length;

      const latestHuman = outcomes.find((row) => row.human_return_summary)?.human_return_summary || null;
      const latestCommercial = outcomes.find((row) => row.commercial_return_summary)?.commercial_return_summary || null;
      const latestSceneLearning = outcomes.find((row) => row.scene_learning_summary)?.scene_learning_summary || null;
      const latestContentReturn = outcomes.find((row) => row.content_return_summary)?.content_return_summary || null;
      const latestGemsReturn = outcomes.find((row) => row.gems_return_summary)?.gems_return_summary || null;
      const latestParticipantValue = outcomes.find((row) => row.participant_value_summary)?.participant_value_summary || null;
      const latestDecision = outcomes.find((row) => row.next_decision)?.next_decision || null;
      const latestDecisionNote = outcomes.find((row) => row.next_decision_note)?.next_decision_note || null;

      return {
        title: roleLabels[role],
        role,
        totals,
        gemsEarned,
        gemsUsed,
        paidAccessValue,
        accessCount: passes.length,
        acceptedCollaborations,
        openings,
        collaborations,
        recentGemMovement: gems.slice(0, 5),
        latestHuman,
        latestCommercial,
        latestSceneLearning,
        latestContentReturn,
        latestGemsReturn,
        latestParticipantValue,
        latestDecision,
        latestDecisionNote,
      };
    },
  });
}
