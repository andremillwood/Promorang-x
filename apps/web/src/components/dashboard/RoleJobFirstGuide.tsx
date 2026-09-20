import { useAuth } from "@/contexts/AuthContext";
import { JobFirstWorkspaceGuide } from "@/components/dashboard/JobFirstWorkspaceGuide";

type RoleContract = {
  purpose: string;
  outcome: string;
  nextIfWorks: string;
};

const ROLE_CONTRACTS: Record<string, RoleContract> = {
  participant: {
    purpose: "Use Promorang to find worthwhile things to do, act on them, and build a history that gives you better access and value over time.",
    outcome: "Make one useful move that is worth your time.",
    nextIfWorks: "Keep what was useful, unlock the next opportunity, return when it matters, or share it with someone who would value it.",
  },
  creator: {
    purpose: "Use your distribution and creative work to produce useful, attributable actions for brands, places, and communities — and get rewarded when the agreed outcome is proven.",
    outcome: "Complete creator work that causes a verified supporter or customer action.",
    nextIfWorks: "Package the result into your reputation, earn the agreed reward, and qualify for stronger opportunities.",
  },
  host: {
    purpose: "Use this workspace to fill and operate experiences with the right people, verify who actually participated, and build an audience that returns.",
    outcome: "Create a Moment people actually attend and participate in.",
    nextIfWorks: "Review who came, identify returning people, improve the next Moment, and grow the audience you can bring back.",
  },
  merchant: {
    purpose: "Use Promorang to turn attention into measurable visits, claims, purchases, redemptions, reviews, and repeat behavior at your business.",
    outcome: "Create the next verified customer action for your business.",
    nextIfWorks: "Bring those customers back, improve the offer, increase frequency, or expand the activation to another product or location.",
  },
  brand: {
    purpose: "Use this workspace to turn marketing activity into attributable customer movement and evidence you can use to decide what deserves more investment.",
    outcome: "Create measurable customer movement for this brand.",
    nextIfWorks: "Review what was proven, then repeat, improve, retarget, or scale the activation based on the evidence.",
  },
  agency: {
    purpose: "Use Promorang to operate client work, create measurable customer movement, and return to the client with evidence rather than activity reports alone.",
    outcome: "Produce one undeniable managed result for a client.",
    nextIfWorks: "Package the proof for the client, decide what to repeat or change, and expand the account around outcomes that were actually demonstrated.",
  },
};

const ROLE_LABELS: Record<string, string> = {
  participant: "Your PromoCard",
  creator: "Creator workspace",
  host: "Host workspace",
  merchant: "Merchant workspace",
  brand: "Brand workspace",
  agency: "Agency portfolio",
};

export function RoleJobFirstGuide({ role }: { role: string }) {
  const { organizations, activeOrgId } = useAuth();
  const contract = ROLE_CONTRACTS[role];

  if (!contract) return null;

  const activeOrg = organizations.find((org) => org.id === activeOrgId);
  const context = activeOrg?.name
    ? `${ROLE_LABELS[role] || "Workspace"} · ${activeOrg.name}`
    : ROLE_LABELS[role] || "Workspace";

  return (
    <JobFirstWorkspaceGuide
      role={role}
      context={context}
      purpose={contract.purpose}
      outcome={contract.outcome}
      nextIfWorks={contract.nextIfWorks}
    />
  );
}

export default RoleJobFirstGuide;
