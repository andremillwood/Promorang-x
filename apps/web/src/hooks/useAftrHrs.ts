import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import { localeRequestHeaders } from "@/i18n/geo-locale";
import { clearAftrHrsClaimPending, hasAftrHrsClaimPending } from "@/lib/aftrhrs-claim";
import { getGrowthAttribution, getGrowthSessionId } from "@/lib/marketing-attribution";
import {
  AFTRHRS_COPY,
  AFTRHRS_DIGITAL_PASS_LIMIT,
  AFTRHRS_OG_IMAGE_PATH,
  AFTRHRS_MOMENT_ID,
  AFTRHRS_PATHS,
  AFTRHRS_RECURRENCE,
  AFTRHRS_START_ISO,
  DEFAULT_AFTRHRS_FAQS,
  SEA_DECK_VENUE_ID,
  publicRemainingPercent,
  remainingDigitalPasses,
  shouldResumeAftrHrsClaim,
} from "@promorang/shared";

export type AftrHrsAmbassador = {
  id: string;
  name: string;
  profileImage?: string | null;
  profilePath: string;
  approved: boolean;
  allocation: number;
  distributed: number;
  remaining: number;
  trackingCode: string;
  contactPreference: string;
  publicContactHandle?: string | null;
  distributionLocations: Array<{ label: string; detail?: string }>;
};

export type AftrHrsPass = {
  id: string;
  unique_code: string;
  qr_payload: string;
  pass_type: string;
  status: string;
  claimed_at: string;
  redeemed_at?: string | null;
};

export type AftrHrsSnapshot = {
  edition: {
    id: string;
    moment_id: string;
    venue_id: string;
    slug: string;
    title: string;
    tagline: string;
    supporting_copy: string;
    powered_by: string;
    music_categories: string[];
    published: boolean;
    page_mode: "live" | "post-event";
    claims_open: boolean;
    digital_allocation: number;
    digital_claimed: number;
    claim_closes_at: string | null;
    paid_admission_jmd: number;
    paid_patron_benefit: string;
    faqs: Array<{ question: string; answer: string }>;
    venue_policies: Record<string, string | null>;
    artwork: Record<string, string>;
    remaining: number;
    remainingPercent?: number;
    soldOut: boolean;
    venueSlug: string;
    moments?: { starts_at?: string | null; image_url?: string | null; venue_name?: string | null } | null;
    venue_profiles?: {
      name: string;
      address: string;
      city: string;
      description: string;
      featured_image_url?: string | null;
      images?: Array<{ url: string; alt?: string }>;
      verification_status?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      social_links?: Record<string, string>;
      contact?: Record<string, string>;
      opening_information?: string | null;
    } | null;
  };
  ambassadors: AftrHrsAmbassador[];
  pass: AftrHrsPass | null;
  participation: { state: string; reminder_opt_in?: boolean } | null;
  followingVenue: boolean;
  communityCount: number;
};

export const AFTRHRS_FALLBACK: AftrHrsSnapshot = {
  edition: {
    id: AFTRHRS_MOMENT_ID,
    moment_id: AFTRHRS_MOMENT_ID,
    venue_id: SEA_DECK_VENUE_ID,
    slug: "aftrhrs",
    title: "AftrHrs",
    tagline: AFTRHRS_COPY.headline,
    supporting_copy: AFTRHRS_COPY.supporting,
    powered_by: "Origin — Alric & Boyd",
    music_categories: ["Afro House", "Classic House", "House Fusion"],
    published: true,
    page_mode: "live",
    claims_open: true,
    digital_allocation: AFTRHRS_DIGITAL_PASS_LIMIT,
    digital_claimed: 0,
    claim_closes_at: null,
    paid_admission_jmd: 2000,
    paid_patron_benefit: "Complimentary drink and wings",
    faqs: [...DEFAULT_AFTRHRS_FAQS],
    venue_policies: {
      entry_policy: "Valid invitation, RSVP, or paid admission. Capacity and door policy remain with Sea Deck.",
    },
    artwork: {
      logo: "/campaigns/aftrhrs/logo.jpg",
      flyer: "/campaigns/aftrhrs/flyer.jpg",
      invite: "/campaigns/aftrhrs/invite.jpg",
      og: AFTRHRS_OG_IMAGE_PATH,
    },
    remaining: AFTRHRS_DIGITAL_PASS_LIMIT,
    remainingPercent: publicRemainingPercent(AFTRHRS_DIGITAL_PASS_LIMIT, AFTRHRS_DIGITAL_PASS_LIMIT),
    soldOut: false,
    venueSlug: "sea-deck",
    moments: { starts_at: AFTRHRS_START_ISO, image_url: "/campaigns/aftrhrs/flyer.jpg", venue_name: "Sea Deck", ...AFTRHRS_RECURRENCE },
    venue_profiles: {
      name: "Sea Deck",
      address: "Orchid Village, 20 Barbican Road, Kingston",
      city: "Kingston",
      description: AFTRHRS_COPY.venue,
      featured_image_url: "/campaigns/aftrhrs/flyer.jpg",
      images: [
        { url: "/campaigns/aftrhrs/flyer.jpg", alt: "AftrHrs at Sea Deck" },
        { url: "/campaigns/aftrhrs/invite.jpg", alt: "AftrHrs invitation" },
      ],
      verification_status: "verified",
      latitude: 18.0174,
      longitude: -76.7669,
    },
  },
  ambassadors: [
    {
      id: "field",
      name: "AftrHrs Field",
      profileImage: "/campaigns/aftrhrs/logo.jpg",
      profilePath: "/moments/aftrhrs/ambassador",
      approved: true,
      allocation: 15,
      distributed: 0,
      remaining: 15,
      trackingCode: "AH-FIELD",
      contactPreference: "promorang",
      distributionLocations: [{ label: "Ambassadors", detail: "Approved field ambassadors distribute physical invitations by arrangement." }],
    },
    {
      id: "door",
      name: "Sea Deck Wednesday desk",
      profileImage: "/campaigns/aftrhrs/invite.jpg",
      profilePath: "/venues/sea-deck",
      approved: true,
      allocation: 15,
      distributed: 0,
      remaining: 15,
      trackingCode: "AH-SEADECK",
      contactPreference: "promorang",
      distributionLocations: [{ label: "Sea Deck", detail: "Physical invitations may be collected at Sea Deck on Wednesday at 7:00 PM when announced." }],
    },
  ],
  pass: null,
  participation: null,
  followingVenue: false,
  communityCount: 0,
};

async function request<T>(path: string, token?: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/aftrhrs${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...localeRequestHeaders(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const error = new Error(payload.error || "AftrHrs request failed") as Error & { code?: string; status?: number };
    error.code = payload.code;
    error.status = response.status;
    throw error;
  }
  return payload.data as T;
}

function attribution() {
  const growth = getGrowthAttribution();
  const last = growth?.lastTouch;
  return {
    sessionId: getGrowthSessionId(),
    source: last?.utm_source || last?.sourcePath || "landing",
    campaign: last?.utm_campaign || null,
    referrer: last?.referral_code || last?.referrer || document.referrer || null,
    utmSource: last?.utm_source || null,
  };
}

export function useAftrHrs() {
  const { session, user } = useAuth();
  const token = session?.access_token;
  const queryClient = useQueryClient();

  const snapshot = useQuery({
    queryKey: ["aftrhrs", user?.id || "anon"],
    queryFn: async () => {
      try {
        return await request<AftrHrsSnapshot>("/public", token);
      } catch (error) {
        if (token) throw error;
        return AFTRHRS_FALLBACK;
      }
    },
  });

  const track = useMutation({
    mutationFn: (name: string) => request("/track", token, { method: "POST", body: JSON.stringify({ name, ...attribution() }) }),
  });

  const claim = useMutation({
    mutationFn: (termsAccepted: boolean) =>
      request("/claim", token, {
        method: "POST",
        body: JSON.stringify({ termsAccepted, ...attribution(), email: user?.email }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["aftrhrs"] }),
  });

  const join = useMutation({
    mutationFn: () => request("/join", token, { method: "POST", body: JSON.stringify(attribution()) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["aftrhrs"] }),
  });

  const ambassadorRequest = useMutation({
    mutationFn: (body: { ambassadorId?: string; note?: string; waitlist?: boolean }) =>
      request(body.waitlist ? "/waitlist" : "/ambassador-request", token, {
        method: "POST",
        body: JSON.stringify({ ...body, ...attribution() }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["aftrhrs"] }),
  });

  const follow = useMutation({
    mutationFn: (next: boolean) => request("/venue/follow", token, { method: "POST", body: JSON.stringify({ follow: next }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["aftrhrs"] }),
  });

  const data = snapshot.data || AFTRHRS_FALLBACK;
  const remainingPercent = data.edition.remainingPercent ?? publicRemainingPercent(
    remainingDigitalPasses({
      digitalAllocation: data.edition.digital_allocation,
      digitalClaimed: data.edition.digital_claimed,
    }),
    data.edition.digital_allocation,
  );

  return {
    ...snapshot,
    data,
    remainingPercent,
    soldOut: remainingPercent <= 0 || data.edition.soldOut,
    passLoadFailed: Boolean(token && snapshot.isError),
    token,
    user,
    track,
    claim,
    join,
    ambassadorRequest,
    follow,
    paths: AFTRHRS_PATHS,
  };
}

export function useAftrHrsAutoClaim(options?: { redirectToPass?: boolean }) {
  const { data, user, claim, soldOut } = useAftrHrs();
  const navigate = useNavigate();
  const [autoClaiming, setAutoClaiming] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (
      !shouldResumeAftrHrsClaim({
        authenticated: Boolean(user),
        hasPass: Boolean(data.pass),
        soldOut,
        pendingTermsAccepted: hasAftrHrsClaimPending(),
      })
    ) {
      return;
    }
    if (started.current) return;
    started.current = true;
    setAutoClaiming(true);
    claim.mutateAsync(true)
      .then(() => {
        clearAftrHrsClaimPending();
        if (options?.redirectToPass !== false) {
          navigate(AFTRHRS_PATHS.passAlias, { replace: true });
        }
      })
      .catch((error) => {
        const code = (error as { code?: string }).code;
        if (code === "already_claimed") {
          clearAftrHrsClaimPending();
          navigate(AFTRHRS_PATHS.passAlias, { replace: true });
          return;
        }
        started.current = false;
        setAutoClaiming(false);
      });
  }, [user, data.pass, soldOut, claim, navigate, options?.redirectToPass]);

  return { autoClaiming };
}

export type AftrHrsGuestLane = {
  remainingPercent: number;
  soldOut: boolean;
  open: boolean;
};

export type AftrHrsGuestPublic = {
  rsvp: AftrHrsGuestLane;
  digitalPass: AftrHrsGuestLane;
};

const GUEST_FALLBACK: AftrHrsGuestPublic = {
  rsvp: { remainingPercent: 100, soldOut: false, open: true },
  digitalPass: { remainingPercent: 100, soldOut: false, open: true },
};

export function useAftrHrsGuest() {
  const snapshot = useQuery({
    queryKey: ["aftrhrs-guest"],
    queryFn: async () => {
      try {
        return await request<AftrHrsSnapshot & { guest?: AftrHrsGuestPublic }>("/public");
      } catch {
        return { ...AFTRHRS_FALLBACK, guest: GUEST_FALLBACK };
      }
    },
  });
  const guest = snapshot.data?.guest || GUEST_FALLBACK;
  const rsvp = useMutation({
    mutationFn: async (body: { name: string; email: string; phone: string; kind: "rsvp" | "digital-pass"; termsAccepted: boolean; website?: string }) => {
      try {
        return await request<{ ok: boolean; kind: string; name?: string; ticketPath?: string | null; code?: string | null; silent?: boolean }>("/guest-rsvp", undefined, {
          method: "POST",
          body: JSON.stringify({ ...body, ...attribution() }),
        });
      } catch (error) {
        if (error instanceof TypeError) {
          throw new Error("We could not reach the list. Try again in a moment.");
        }
        throw error;
      }
    },
    onSuccess: () => snapshot.refetch(),
  });
  return {
    ...snapshot,
    edition: snapshot.data?.edition || AFTRHRS_FALLBACK.edition,
    guest,
    communityCount: snapshot.data?.communityCount || 0,
    rsvp,
  };
}

export function useAftrHrsGuestTicket(code?: string) {
  return useQuery({
    queryKey: ["aftrhrs-ticket", code],
    queryFn: () => request<{
      name: string;
      kind: string;
      code: string;
      qrPayload: string;
      status: string;
      weekFriday?: string | null;
      monthKey?: string | null;
    }>(`/ticket/${encodeURIComponent(String(code || "").toUpperCase())}`),
    enabled: Boolean(code),
    retry: false,
  });
}

export function useAftrHrsAdmin() {
  const { session } = useAuth();
  const token = session?.access_token;
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["aftrhrs-admin"],
    queryFn: () => request<Record<string, unknown>>("/admin", token),
    enabled: Boolean(token),
    retry: false,
  });
  const update = useMutation({
    mutationFn: (body: Record<string, unknown>) => request("/admin", token, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["aftrhrs-admin"] }),
  });
  const updatePass = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      request(`/admin/passes/${id}`, token, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["aftrhrs-admin"] }),
  });
  const digitalRelease = useMutation({
    mutationFn: (action: "close" | "open") =>
      request("/admin/digital-release", token, { method: "POST", body: JSON.stringify({ action }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["aftrhrs-admin"] }),
  });
  return { ...query, token, update, updatePass, digitalRelease };
}

export function useAftrHrsAmbassador() {
  const { session } = useAuth();
  const token = session?.access_token;
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["aftrhrs-ambassador"],
    queryFn: () => request<Record<string, unknown>>("/ambassador", token),
    enabled: Boolean(token),
    retry: false,
  });
  const fulfill = useMutation({
    mutationFn: (body: Record<string, unknown>) => request("/ambassador/fulfill", token, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["aftrhrs-ambassador"] }),
  });
  return { ...query, token, fulfill };
}

export function useAftrHrsDoor() {
  const { session } = useAuth();
  const token = session?.access_token;
  return useMutation({
    mutationFn: (code: string) => request("/redeem", token, { method: "POST", body: JSON.stringify({ code, notes: "door_scan" }) }),
  });
}
