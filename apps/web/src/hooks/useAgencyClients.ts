import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL } from "@/lib/api";

export type AgencyRelationship = {
  id: string;
  agency_id: string;
  client_id: string;
  relationship_type: string;
  status: string;
  created_at: string;
  agency: {
    id: string;
    name: string;
    slug: string;
    type: string;
    avatar_url?: string | null;
  } | null;
  client: {
    id: string;
    name: string;
    slug: string;
    type: string;
    avatar_url?: string | null;
  } | null;
};

type AgencyRelationshipPayload = {
  agencyId: string;
  clientId?: string;
  clientName?: string;
  clientType?: "brand" | "merchant";
  website?: string;
  relationshipType?: string;
};

async function getAuthorizedHeaders() {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error("No active session");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

async function requestAgencyRelationships(params: {
  agencyId?: string | null;
  clientId?: string | null;
  search?: string;
}) {
  const headers = await getAuthorizedHeaders();
  const url = new URL(`${API_BASE_URL}/agency-clients`);

  if (params.agencyId) url.searchParams.set("agencyId", params.agencyId);
  if (params.clientId) url.searchParams.set("clientId", params.clientId);
  if (params.search?.trim()) url.searchParams.set("search", params.search.trim());

  const response = await fetch(url.toString(), { headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "Failed to load agency relationships");
  }

  return payload as {
    memberships: Array<{ id: string; name: string; slug: string; type: string; membership_role: string }>;
    relationships: AgencyRelationship[];
    availableClients: Array<{ id: string; name: string; slug: string; type: string; isConnected?: boolean }>;
    availableAgencies: Array<{ id: string; name: string; slug: string; type: string; isConnected?: boolean }>;
  };
}

export function useAgencyRelationships(params: {
  agencyId?: string | null;
  clientId?: string | null;
  search?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["agency-relationships", params.agencyId || null, params.clientId || null, params.search || ""],
    queryFn: () => requestAgencyRelationships(params),
    enabled: params.enabled ?? true,
  });
}

export function useCreateAgencyRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AgencyRelationshipPayload) => {
      const headers = await getAuthorizedHeaders();
      const response = await fetch(`${API_BASE_URL}/agency-clients`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to create agency relationship");
      }

      return data as { relationship: AgencyRelationship };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-relationships"] });
    },
  });
}

export function useUpdateAgencyRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      relationshipType,
    }: {
      id: string;
      status?: string;
      relationshipType?: string;
    }) => {
      const headers = await getAuthorizedHeaders();
      const response = await fetch(`${API_BASE_URL}/agency-clients/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status, relationshipType }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update agency relationship");
      }

      return data as { relationship: AgencyRelationship };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-relationships"] });
    },
  });
}

export function useDeleteAgencyRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const headers = await getAuthorizedHeaders();
      const response = await fetch(`${API_BASE_URL}/agency-clients/${id}`, {
        method: "DELETE",
        headers,
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete agency relationship");
      }

      return data as { success: boolean; removedId: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-relationships"] });
    },
  });
}
