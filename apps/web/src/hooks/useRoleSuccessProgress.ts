import { useQuery } from "@tanstack/react-query";
import {
  resolveStakeholderSuccess,
  type StakeholderSuccessSignal,
} from "@promorang/shared/stakeholder-success";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL } from "@/lib/api";

export type SuccessMilestone = {
  label: string;
  complete: boolean;
};

export type RoleSuccessProgress = {
  current: number;
  target: number;
  unit: string;
  sourceLabel: string;
  milestones: SuccessMilestone[];
  nextAction?: { label: string; href: string };
  successStage?: {
    current: number;
    total: number;
    label: string;
    complete: boolean;
  };
};

const roleTargets: Record<string, { target: number; unit: string }> = {
  participant: { target: 5, unit: "verified moves" },
  creator: { target: 25, unit: "verified supporter actions" },
  host: { target: 50, unit: "verified participants" },
  merchant: { target: 50, unit: "customer visits and actions" },
  brand: { target: 100, unit: "verified customer actions" },
  promoter: { target: 10, unit: "people activated" },
  marketing: { target: 100, unit: "attributed actions" },
  agency: { target: 3, unit: "campaigns with results" },
  admin: { target: 3, unit: "connected systems reporting" },
};

const sum = (items: any[], field: string) => items.reduce((total, item) => total + Number(item?.[field] || 0), 0);

async function fetchPromoShare(accessToken?: string) {
  if (!accessToken) return null;
  const response = await fetch(`${API_BASE_URL}/promoshare/dashboard`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  const payload = await response.json();
  return payload?.data || null;
}

async function fetchOwnerOffers(accessToken?: string) {
  if (!accessToken) return [];
  const response = await fetch(`${API_BASE_URL}/offers/mine`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload?.data) ? payload.data : [];
}

export function useRoleSuccessProgress(role: string) {
  const { user, session, activeOrgId, agencyClients } = useAuth();

  return useQuery({
    queryKey: ["role-success-progress", user?.id, activeOrgId, role, agencyClients.map((client) => client.id).join(",")],
    enabled: Boolean(user?.id),
    staleTime: 60_000,
    queryFn: async (): Promise<RoleSuccessProgress> => {
      const targetConfig = roleTargets[role] || roleTargets.participant;
      const promo = await fetchPromoShare(session?.access_token);
      const cycles = promo?.user_stats_by_cycle || [];
      const verifiedMoves = sum(cycles, "verified_moves");
      const joinedMoments = sum(cycles, "moments_joined");
      const referrals = sum(cycles, "referrals");
      const totalEntries = sum(cycles, "total_entries");
      const observedSignals: StakeholderSuccessSignal[] = [];
      let current = 0;
      let sourceLabel = "Verified Promorang activity";
      let nextAction: RoleSuccessProgress["nextAction"];
      let milestones: SuccessMilestone[] = [];

      if (role === "participant") {
        current = verifiedMoves;
        if (joinedMoments > 0) {
          observedSignals.push("participant_opportunity_selected", "participant_committed");
        }
        if (verifiedMoves > 0) observedSignals.push("participant_action_verified");

        sourceLabel = `${verifiedMoves} verified moves · ${joinedMoments} joined Moments`;
        milestones = [
          { label: "Complete a verified move", complete: verifiedMoves >= 1 },
          { label: "Join a Moment", complete: joinedMoments >= 1 },
          { label: "Qualify for PromoShare", complete: cycles.some((cycle: any) => cycle.eligible) },
        ];
        nextAction = verifiedMoves < 1 ? { label: "Complete your first move", href: "/discover" } : { label: "Find the next verified move", href: "/missions" };
      } else if (role === "creator") {
        const { count: contentCount } = await (supabase as any).from("content_pieces").select("*", { count: "exact", head: true }).eq("creator_id", user!.id);
        let creatorSummary: Record<string, number> = {};
        if (session?.access_token) {
          const response = await fetch(`${API_BASE_URL}/o2o/creator-summary`, { headers: { Authorization: `Bearer ${session.access_token}` } });
          if (response.ok) creatorSummary = (await response.json())?.summary || {};
        }
        const attributedJoins = Number(creatorSummary.attributed_joins || 0);
        const verifiedUnlocks = Number(creatorSummary.verified_unlocks || 0);
        const linkedContent = Number(creatorSummary.linked_content_count || 0);
        current = attributedJoins + verifiedUnlocks;

        if (Number(contentCount || 0) > 0) observedSignals.push("creator_opportunity_selected");
        if (linkedContent > 0) observedSignals.push("creator_deliverable_approved");
        if (current > 0) observedSignals.push("creator_attributed_action_verified");

        sourceLabel = "Attributed joins and verified unlocks generated by your stories";
        milestones = [
          { label: "Publish a Release", complete: Number(contentCount || 0) > 0 },
          { label: "Attach a room or perk", complete: linkedContent > 0 },
          { label: "Get paid after a Promorang consequence", complete: current >= 10 },
        ];
        nextAction = Number(contentCount || 0) === 0
          ? { label: "Publish your first Release", href: "/content-drops" }
          : linkedContent === 0
            ? { label: "Attach a room or perk", href: "/give" }
            : { label: "Watch attributed use", href: "/happened" };
      } else if (role === "host") {
        const { data: moments } = await (supabase as any).from("moments").select("id").or(`host_id.eq.${user!.id},organizer_id.eq.${user!.id}`);
        const ids = (moments || []).map((moment: any) => moment.id);
        let participantCount = 0;
        let returningParticipantCount = 0;
        if (ids.length) {
          const result = await (supabase as any).from("moment_participants").select("user_id, moment_id, checked_in_at").in("moment_id", ids);
          const verifiedRows = (result.data || []).filter((row: any) => Boolean(row.checked_in_at));
          participantCount = verifiedRows.length;
          const appearances = verifiedRows.reduce((counts: Record<string, number>, row: any) => ({ ...counts, [row.user_id]: (counts[row.user_id] || 0) + 1 }), {});
          returningParticipantCount = Object.values(appearances).filter((count) => count > 1).length;
        }
        current = participantCount;

        if (ids.length > 0) observedSignals.push("host_moment_live");
        if (participantCount > 0) observedSignals.push("host_commitment_recorded", "host_attendance_verified");
        if (returningParticipantCount > 0) observedSignals.push("host_repeat_attendance_verified");

        sourceLabel = `${participantCount} verified arrivals · ${returningParticipantCount} returning participants`;
        milestones = [
          { label: "Create a Moment", complete: ids.length > 0 },
          { label: "Verify the first arrival", complete: current > 0 },
          { label: "Welcome a participant back", complete: returningParticipantCount > 0 },
        ];
        nextAction = ids.length === 0
          ? { label: "Create your first Moment", href: "/create/moment" }
          : current === 0
            ? { label: "Open live check-ins", href: "/organizer/check-ins" }
            : { label: "Review proof and return", href: "/dashboard?tab=review" };
      } else if (role === "merchant") {
        const { data: venues } = await (supabase as any).from("venues").select("id").eq("owner_id", user!.id);
        const venueIds = (venues || []).map((venue: any) => venue.id);
        let momentIds: string[] = [];
        if (venueIds.length) {
          const result = await (supabase as any).from("moments").select("id").in("venue_id", venueIds);
          momentIds = (result.data || []).map((moment: any) => moment.id);
        }
        let visitorCount = 0;
        let redemptionCount = 0;
        let paidOrderCount = 0;
        if (momentIds.length) {
          const result = await (supabase as any).from("check_ins").select("*", { count: "exact", head: true }).in("moment_id", momentIds).eq("location_verified", true);
          visitorCount = Number(result.count || 0);
        }
        const [{ count: redemptions }, { count: paidOrders }, offers] = await Promise.all([
          (supabase as any).from("product_redemptions").select("*", { count: "exact", head: true }).eq("brand_id", user!.id),
          (supabase as any).from("commerce_orders").select("*", { count: "exact", head: true }).eq("merchant_id", user!.id).eq("payment_status", "paid"),
          fetchOwnerOffers(session?.access_token),
        ]);
        redemptionCount = Number(redemptions || 0);
        paidOrderCount = Number(paidOrders || 0);
        const liveOffers = offers.filter((offer: any) => offer?.status === "active").length;
        current = visitorCount + redemptionCount + paidOrderCount;

        if (venueIds.length > 0) observedSignals.push("merchant_business_ready");
        if (liveOffers > 0) observedSignals.push("merchant_offer_live");
        if (current > 0) observedSignals.push("merchant_customer_action_verified");
        if (paidOrderCount > 0) observedSignals.push("merchant_value_realized");

        sourceLabel = `${visitorCount} verified visits · ${redemptionCount} redemptions · ${paidOrderCount} paid orders · ${liveOffers} live promotions`;
        milestones = [
          { label: "Add a venue", complete: venueIds.length > 0 },
          { label: "Open a customer path", complete: liveOffers > 0 || momentIds.length > 0 },
          { label: "Receive the first verified customer action", complete: current > 0 },
        ];
        nextAction = venueIds.length === 0
          ? { label: "Add your first venue", href: "/dashboard/venues/add" }
          : liveOffers === 0
            ? { label: "Create your first promotion", href: "/dashboard?tab=promotions" }
            : current === 0
              ? { label: "Prepare staff verification", href: "/staff/scanner" }
              : { label: "Review sales and results", href: "/dashboard?tab=results" };
      } else if (["brand", "marketing", "agency"].includes(role)) {
        const clientIds = agencyClients.filter((client) => client.type === "brand").map((client) => client.id);
        let campaignQuery = (supabase as any).from("campaigns").select("id, redemptions, is_active, organization_id");
        if (role === "agency") {
          campaignQuery = clientIds.length ? campaignQuery.in("organization_id", clientIds) : campaignQuery.eq("organization_id", "00000000-0000-0000-0000-000000000000");
        } else if (activeOrgId) {
          campaignQuery = campaignQuery.eq("organization_id", activeOrgId);
        } else {
          campaignQuery = campaignQuery.eq("brand_id", user!.id);
        }
        const { data: campaigns } = await campaignQuery;
        const campaignRows = campaigns || [];
        const actions = sum(campaignRows, "redemptions");
        current = role === "agency" ? campaignRows.filter((campaign: any) => Number(campaign.redemptions || 0) > 0).length : actions;
        sourceLabel = role === "agency" ? "Connected-client campaigns with recorded results" : "Verified campaign redemptions";

        if (role === "agency") {
          if (agencyClients.length > 0) observedSignals.push("agency_client_connected");
          if (campaignRows.length > 0) observedSignals.push("agency_activation_live");
          if (actions > 0) observedSignals.push("agency_client_outcome_verified");
        } else {
          if (campaignRows.length > 0) observedSignals.push("brand_outcome_defined");
          if (campaignRows.some((campaign: any) => campaign.is_active)) observedSignals.push("brand_activation_live");
          if (actions > 0) observedSignals.push("brand_attributed_action_verified");
        }

        milestones = role === "agency" ? [
          { label: "Connect a client account", complete: agencyClients.length > 0 },
          { label: "Launch a client activation", complete: campaignRows.length > 0 },
          { label: "Prove the first client result", complete: actions > 0 },
        ] : [
          { label: "Create a campaign", complete: campaignRows.length > 0 },
          { label: "Activate a live campaign", complete: campaignRows.some((campaign: any) => campaign.is_active) },
          { label: "Record the first verified result", complete: actions > 0 },
        ];
        nextAction = role === "agency"
          ? agencyClients.length === 0
            ? { label: "Connect your first client", href: "/dashboard?tab=clients" }
            : campaignRows.length === 0
              ? { label: "Choose a client to activate", href: "/dashboard?tab=clients" }
              : { label: "Review client impact", href: "/dashboard?tab=impact" }
          : campaignRows.length === 0
            ? { label: "Create your first activation", href: "/create/campaign" }
            : { label: "Review campaign performance", href: "/dashboard?tab=campaigns" };
      } else if (role === "promoter") {
        current = referrals;
        sourceLabel = "Verified referrals recorded by PromoShare";
        milestones = [
          { label: "Share your referral path", complete: referrals > 0 },
          { label: "Activate three people", complete: referrals >= 3 },
          { label: "Reach Champion 10", complete: referrals >= 10 },
        ];
        nextAction = { label: referrals ? "Grow your promoter network" : "Activate your first person", href: "/growth/referrals" };
      } else {
        current = [promo !== null, totalEntries > 0, cycles.length > 0].filter(Boolean).length;
        milestones = [
          { label: "PromoShare reporting connected", complete: promo !== null },
          { label: "Verified entries flowing", complete: totalEntries > 0 },
          { label: "Active cycles visible", complete: cycles.length > 0 },
        ];
        nextAction = { label: "Review platform operations", href: "/admin" };
      }

      const contractState = !["promoter", "admin"].includes(role)
        ? resolveStakeholderSuccess(role, observedSignals)
        : null;
      let successStage: RoleSuccessProgress["successStage"];

      if (contractState) {
        const currentIndex = contractState.stages.findIndex((stage) => stage.status === "current");
        const stageNumber = contractState.isComplete
          ? contractState.stages.length
          : Math.max(0, currentIndex) + 1;

        successStage = {
          current: stageNumber,
          total: contractState.stages.length,
          label: contractState.currentStep.label,
          complete: contractState.isComplete,
        };
        milestones = contractState.stages.map((stage) => ({
          label: stage.label,
          complete: stage.status === "done",
        }));
        nextAction = {
          label: contractState.isComplete ? "Review proven results" : contractState.currentStep.label,
          href: contractState.currentStep.nextHref,
        };
      }

      return {
        current,
        target: targetConfig.target,
        unit: targetConfig.unit,
        sourceLabel,
        milestones,
        nextAction,
        successStage,
      };
    },
  });
}
