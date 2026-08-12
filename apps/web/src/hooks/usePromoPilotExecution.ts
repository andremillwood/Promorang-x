import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";

export type PromoPilotJobStatus = "draft" | "blocked" | "ready" | "queued" | "running" | "completed" | "failed" | "cancelled";

export type PromoPilotExecutionJob = {
  id: string;
  job_key: string;
  job_type: "distribution" | "value" | "relationship" | "measurement" | "fulfillment";
  system_name: string;
  label: string;
  required: boolean;
  status: PromoPilotJobStatus;
  blocker?: string | null;
  payload: Record<string, unknown>;
  result: Record<string, unknown>;
};

export type PromoPilotManifest = {
  plan: { id: string; status: string; campaign_id: string };
  jobs: PromoPilotExecutionJob[];
  summary: Record<string, number> & { total: number; required: number; blocked: number; ready: number; queued: number; running: number; completed: number; failed: number };
};

async function requestManifest(path: string, token: string, method = "GET", body?: unknown): Promise<PromoPilotManifest> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "PromoPilot could not complete this request");
  return payload;
}

export function usePromoPilotExecution(campaignId?: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["promopilot-execution", campaignId];
  const token = session?.access_token;

  const manifest = useQuery({
    queryKey,
    enabled: Boolean(campaignId && token),
    retry: false,
    queryFn: () => requestManifest(`/demand-plans/campaign/${campaignId}/execution`, token!),
  });

  const prepare = useMutation({
    mutationFn: () => requestManifest(`/demand-plans/campaign/${campaignId}/prepare`, token!, "POST"),
    onSuccess: (data) => queryClient.setQueryData(queryKey, data),
  });

  const launch = useMutation({
    mutationFn: () => requestManifest(`/demand-plans/campaign/${campaignId}/launch`, token!, "POST", { confirm: true }),
    onSuccess: (data) => queryClient.setQueryData(queryKey, data),
  });

  const process = useMutation({
    mutationFn: () => requestManifest(`/demand-plans/campaign/${campaignId}/process`, token!, "POST"),
    onSuccess: (data) => queryClient.setQueryData(queryKey, data),
  });

  const retryJob = useMutation({
    mutationFn: async (jobId: string) => {
      await requestManifest(`/demand-plans/jobs/${jobId}/retry`, token!, "POST");
      return requestManifest(`/demand-plans/campaign/${campaignId}/execution`, token!);
    },
    onSuccess: (data) => queryClient.setQueryData(queryKey, data),
  });

  return { manifest, prepare, launch, process, retryJob };
}
