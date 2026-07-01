import { API_BASE_URL } from "@/lib/api";

export function recordJourneyEvent(token: string | undefined, event: {
  event_name: string;
  journey_stage: "orientation" | "first_value" | "proof" | "unlock" | "mastery";
  object_type?: string;
  object_id?: string;
  metadata?: Record<string, unknown>;
}) {
  if (!token) return;
  void fetch(`${API_BASE_URL}/economy/journey-events`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch(() => undefined);
}
