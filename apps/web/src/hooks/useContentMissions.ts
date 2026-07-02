import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import type { CameraConsent, MissionArchetype } from "@/lib/mission-archetypes";

export type ContentMission = {
  id: string;
  moment_id: string;
  title: string;
  action_text: string;
  publish_destination: string;
  qualification_text: string;
  proof_type: "link" | "photo" | "video" | "qr" | "referral";
  starts_at: string | null;
  due_at: string | null;
  reward_type: "pioneer_points" | "voucher" | "access" | "discount" | "recognition";
  reward_value: string;
  reward_points: number | null;
  participant_limit: number | null;
  archetype: MissionArchetype;
  camera_consent: CameraConsent | null;
  status: "live";
};

export type MissionParticipation = {
  id: string;
  mission_id: string;
  status: "joined" | "submitted" | "verified" | "rejected" | "rewarded";
  proof_submission_id: string | null;
};

async function authHeaders(json = false) {
  const { data } = await supabase.auth.getSession();
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
  };
}

export function useContentMissions(momentId: string | null, signedIn: boolean) {
  const queryClient = useQueryClient();
  const missions = useQuery({
    queryKey: ["content-missions", momentId],
    enabled: Boolean(momentId),
    queryFn: async (): Promise<ContentMission[]> => {
      const response = await fetch(`${API_BASE_URL}/missions/moments/${momentId}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load missions");
      return payload.missions || [];
    },
  });

  const progress = useQuery({
    queryKey: ["content-missions", momentId, "me"],
    enabled: Boolean(momentId && signedIn),
    queryFn: async (): Promise<MissionParticipation[]> => {
      const response = await fetch(`${API_BASE_URL}/missions/moments/${momentId}/me`, { headers: await authHeaders() });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load mission progress");
      return payload.participations || [];
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["content-missions", momentId] });
  const join = useMutation({
    mutationFn: async (missionId: string) => {
      const response = await fetch(`${API_BASE_URL}/missions/${missionId}/join`, { method: "POST", headers: await authHeaders() });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to join mission");
      return payload;
    },
    onSuccess: refresh,
  });
  const submit = useMutation({
    mutationFn: async ({ missionId, proofUrl, note }: { missionId: string; proofUrl: string; note: string }) => {
      const response = await fetch(`${API_BASE_URL}/missions/${missionId}/submit`, {
        method: "POST",
        headers: await authHeaders(true),
        body: JSON.stringify({ proof_url: proofUrl, note }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to submit proof");
      return payload;
    },
    onSuccess: refresh,
  });

  return { missions, progress, join, submit };
}
