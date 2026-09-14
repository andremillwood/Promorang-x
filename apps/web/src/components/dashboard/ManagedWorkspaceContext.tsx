import { ArrowLeftRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function ManagedWorkspaceContext() {
  const {
    activeOrgId,
    organizations,
    agencyClients,
    setActiveOrgId,
    setActiveRole,
  } = useAuth();

  const activeClient = agencyClients.find((client) => client.id === activeOrgId);
  const managingAgency = organizations.find((organization) => organization.type === "agency");

  if (!activeClient || !managingAgency || activeClient.id === managingAgency.id) return null;

  const clientType = activeClient.type === "merchant" ? "Merchant" : "Brand";

  return (
    <section
      aria-label="Managed workspace context"
      className="flex flex-col gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-400">Managed client workspace</p>
          <p className="mt-1 text-sm font-bold text-foreground">
            {activeClient.name} <span className="font-normal text-muted-foreground">· {clientType} · Managed by {managingAgency.name}</span>
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            You are operating this client on behalf of {managingAgency.name}. Work and results created here belong to {activeClient.name} unless a specific record states otherwise.
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 rounded-xl"
        onClick={() => {
          setActiveOrgId(managingAgency.id);
          setActiveRole("agency");
        }}
      >
        <ArrowLeftRight className="mr-2 h-4 w-4" />
        Return to {managingAgency.name}
      </Button>
    </section>
  );
}

export default ManagedWorkspaceContext;
