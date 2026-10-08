import { trackGrowthEvent } from "@/lib/marketing-attribution";

export function acquisitionJourney(path: string, search = ""): "commercial" | "participant" {
  const commercial = ["/business", "/pricing", "/for-brands", "/for-communities", "/for-merchants", "/create/campaign", "/dashboard/campaigns", "/dashboard/proposals"];
  if (path === "/promopush") return "commercial";
  if (commercial.some(route => path === route || path.startsWith(`${route}/`))) return "commercial";
  if (path === "/auth") {
    const params = new URLSearchParams(search);
    if (["merchant", "brand", "agency", "host"].includes(params.get("role") || "")) return "commercial";
    const next = params.get("next");
    if (next?.startsWith("/") && !next.startsWith("//") && next.split("?")[0] !== "/auth") return acquisitionJourney(next.split("?")[0]);
  }
  return "participant";
}

export type BusinessStep = "outcome" | "business" | "success" | "context" | "recommendation";
export type BusinessEvent = "started" | "progress" | "completed" | "auth_started" | "auth_resumed" | "continued" | "lead_captured";
const sent = new Set<string>();
export function trackBusinessStep(attempt: string, event: BusinessEvent, step: BusinessStep) {
  const key = `business:${attempt}:${event}:${step}`;
  if (event === "auth_resumed") {
    const authKey = `business:${attempt}:auth_started:recommendation`;
    let interrupted = sent.has(authKey);
    try { interrupted ||= !!sessionStorage.getItem(authKey); } catch { /* Memory state is sufficient in this tab. */ }
    if (!interrupted) return;
  }
  if (sent.has(key)) return;
  try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch { /* Memory deduplication still works. */ }
  sent.add(key);
  void trackGrowthEvent({ eventName: ["started", "progress", "auth_resumed"].includes(event) ? "page_view" : "cta_clicked", journey: "commercial",
    stage: event === "continued" ? "activated" : "captured", entityType: "business_navigator",
    entityId: attempt, idempotencyKey: key, properties: { step, navigator_event: event },
  });
}
