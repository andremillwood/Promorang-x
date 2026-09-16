import { getStakeholderSuccessContract } from "@promorang/shared/stakeholder-success";
import { useAuth } from "@/contexts/AuthContext";
import { JobFirstWorkspaceGuide } from "@/components/dashboard/JobFirstWorkspaceGuide";

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
  const contract = getStakeholderSuccessContract(role);

  if (!contract) return null;

  const activeOrg = organizations.find((org) => org.id === activeOrgId);
  const roleLabel = ROLE_LABELS[contract.role] || "Workspace";
  const context = activeOrg?.name ? `${roleLabel} · ${activeOrg.name}` : roleLabel;

  return (
    <JobFirstWorkspaceGuide
      role={contract.role}
      context={context}
      purpose={contract.purpose}
      outcome={contract.outcome}
      nextIfWorks={contract.nextIfWorks}
    />
  );
}

export default RoleJobFirstGuide;
