export type CommerceCaseStatus = "open" | "in_progress" | "resolved" | "closed";

export function resolveCommerceCaseJourney(status: CommerceCaseStatus, merchantResponded = false) {
  const steps = [
    { id: "reported", label: "Reported", state: "complete" as const },
    { id: "merchant", label: "Merchant response", state: (merchantResponded || ["resolved", "closed"].includes(status) ? "complete" : status === "in_progress" ? "current" : "upcoming") as "complete" | "current" | "upcoming" },
    { id: "review", label: "Promorang review", state: (["resolved", "closed"].includes(status) ? "complete" : merchantResponded ? "current" : "upcoming") as "complete" | "current" | "upcoming" },
    { id: "resolution", label: "Resolution", state: (["resolved", "closed"].includes(status) ? "complete" : "upcoming") as "complete" | "upcoming" },
  ];
  return { steps, complete: ["resolved", "closed"].includes(status) };
}
