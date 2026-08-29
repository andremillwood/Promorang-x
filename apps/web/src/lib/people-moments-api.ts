import { API_BASE_URL } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { buildPeopleMomentInsert, type MomentPrivacy } from "@promorang/shared";

async function authHeaders(json = false) {
  const { data } = await supabase.auth.getSession();
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/people-moments${path}`, init);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload as T;
}

export async function createPeopleMoment(body: Record<string, unknown>) {
  try {
    return await request<{ success: true; moment: Record<string, unknown> }>("/moments", {
      method: "POST",
      headers: await authHeaders(true),
      body: JSON.stringify(body),
    });
  } catch (error) {
    const { data: sessionData } = await supabase.auth.getUser();
    const userId = sessionData.user?.id;
    if (!userId) throw error;

    const insert = buildPeopleMomentInsert(
      {
        title: String(body.title || ""),
        location: String(body.location || ""),
        hereNow: Boolean(body.here_now),
        startsAt: (body.starts_at as string | undefined) || null,
        privacy: (body.privacy as MomentPrivacy | undefined) || "public",
        officialHost: Boolean(body.official_host),
        description: (body.description as string | undefined) || null,
        imageUrl: (body.image_url as string | undefined) || null,
        venueName: (body.venue_name as string | undefined) || null,
      },
      userId,
    );

    const { data, error: insertError } = await (supabase as any)
      .from("moments")
      .insert(insert)
      .select()
      .single();

    if (insertError) {
      const {
        origin_type: _originType,
        here_now: _hereNow,
        claim_status: _claimStatus,
        claimed_by_stakeholder_id: _claimedBy,
        creator_user_id: _creatorUserId,
        plan_id: _planId,
        pulse_state: _pulseState,
        ...legacy
      } = insert;
      const { data: fallback, error: fallbackError } = await supabase
        .from("moments")
        .insert({
          ...legacy,
          status: insert.status as never,
          visibility: insert.visibility as never,
        } as never)
        .select()
        .single();
      if (fallbackError) throw fallbackError;
      return { success: true as const, moment: fallback as Record<string, unknown> };
    }

    await (supabase as any).from("moment_participants").insert({
      moment_id: data.id,
      user_id: userId,
      status: "joined",
      source: "create",
    });
    await (supabase as any).rpc("seed_people_moment_prompts", {
      p_moment_id: data.id,
      p_owner_id: userId,
    });
    await (supabase as any).from("activity_events").insert({
      event_name: "moment.created",
      actor_user_id: userId,
      moment_id: data.id,
      metadata: { via: "client_fallback" },
    });

    return { success: true as const, moment: data as Record<string, unknown> };
  }
}

export async function joinPeopleMoment(momentId: string, body: Record<string, unknown> = {}) {
  try {
    return await request<{ success: true; already_joined?: boolean }>(`/moments/${momentId}/join`, {
      method: "POST",
      headers: await authHeaders(true),
      body: JSON.stringify(body),
    });
  } catch (error) {
    const { data: sessionData } = await supabase.auth.getUser();
    const userId = sessionData.user?.id;
    if (!userId) throw error;

    const { data: existing } = await supabase
      .from("moment_participants")
      .select("id, status")
      .eq("moment_id", momentId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing && existing.status !== "cancelled") {
      return { success: true as const, already_joined: true };
    }

    const { error: joinError } = await (supabase as any).from("moment_participants").insert({
      moment_id: momentId,
      user_id: userId,
      status: "joined",
      invited_by_user_id: body.invited_by_user_id || null,
      referral_code: body.referral_code || null,
      source: body.source || "moment_page",
      campaign: body.campaign || null,
    });
    if (joinError) throw joinError;

    await (supabase as any).from("activity_events").insert({
      event_name: "moment.joined",
      actor_user_id: userId,
      moment_id: momentId,
      invited_by_user_id: body.invited_by_user_id || null,
      referral_code: body.referral_code || null,
      source: body.source || "moment_page",
      campaign: body.campaign || null,
    });

    return { success: true as const, already_joined: false };
  }
}

export async function fetchPeopleParticipants(momentId: string) {
  return request<{ success: true; participants: Array<Record<string, unknown>> }>(
    `/moments/${momentId}/participants`,
    { headers: await authHeaders() },
  );
}

export async function fetchDemandSnapshot(momentId: string) {
  return request<{ success: true; snapshot: Record<string, unknown> | null }>(
    `/moments/${momentId}/demand`,
    { headers: await authHeaders() },
  );
}

export async function submitPeopleContent(momentId: string, body: Record<string, unknown>) {
  return request<{ success: true }>(`/moments/${momentId}/content`, {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify(body),
  });
}

export async function requestMomentClaim(momentId: string, body: Record<string, unknown> = {}) {
  return request<{ success: true }>(`/moments/${momentId}/claim`, {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify(body),
  });
}

export async function attachMomentPerk(momentId: string, body: Record<string, unknown>) {
  return request<{ success: true }>(`/moments/${momentId}/perks`, {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify(body),
  });
}

export async function claimMomentPerk(perkId: string) {
  return request<{ success: true }>(`/perks/${perkId}/claim`, {
    method: "POST",
    headers: await authHeaders(),
  });
}

export async function sendPeopleInvite(body: Record<string, unknown>) {
  return request<{ success: true; invite: { token: string } }>("/invites", {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify(body),
  });
}

export async function createSocialPlan(body: Record<string, unknown>) {
  return request<{ success: true; plan: Record<string, unknown> }>("/plans", {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify(body),
  });
}

export async function fetchSocialPlan(planId: string) {
  return request<{ success: true; plan: Record<string, unknown> }>(`/plans/${planId}`, {
    headers: await authHeaders(),
  });
}

export async function fetchMySocialPlans() {
  return request<{ success: true; plans: Array<Record<string, unknown>> }>("/plans/me", {
    headers: await authHeaders(),
  });
}

export async function addSocialPlanOption(planId: string, body: Record<string, unknown>) {
  return request<{ success: true }>(`/plans/${planId}/options`, {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify(body),
  });
}

export async function voteSocialPlanOption(planId: string, optionId: string) {
  return request<{ success: true }>(`/plans/${planId}/votes`, {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify({ option_id: optionId }),
  });
}

export async function convertSocialPlan(planId: string, body: Record<string, unknown> = {}) {
  return request<{ success: true; moment: { id: string } }>(`/plans/${planId}/convert`, {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify(body),
  });
}

export function fetchHappeningNow() {
  return request<{ success: true; moments: Array<Record<string, unknown>> }>("/happening-now");
}
