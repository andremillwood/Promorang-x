import { useI18n as useWebI18n } from "@/i18n/I18nContext";
import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Link2,
  Loader2,
  Plus,
  Search,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAgencyRelationships,
  useCreateAgencyRelationship,
  type AgencyRelationship,
} from "@/hooks/useAgencyClients";

interface QuickAddClientProps {
  mode?: "agency" | "brand";
  organizationId?: string | null;
  onSuccess?: (relationship: AgencyRelationship) => void;
  trigger?: React.ReactNode;
}

export function QuickAddClient({
  mode = "agency",
  organizationId,
  onSuccess,
  trigger,
}: QuickAddClientProps) {
  const { t: webT } = useWebI18n();
  const { toast } = useToast();
  const { activeOrgId, refreshWorkspaceContext } = useAuth();
  const scopedOrganizationId = organizationId || activeOrgId;
  const inFlight = useRef(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [workflow, setWorkflow] = useState<"existing" | "create">("existing");
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("");
  const [relationshipType, setRelationshipType] = useState("full_service");
  const [clientName, setClientName] = useState("");
  const [clientType, setClientType] = useState<"brand" | "merchant">("brand");
  const [website, setWebsite] = useState("");
  const [submitError, setSubmitError] = useState("");

  const relationshipQuery = useAgencyRelationships({
    agencyId: mode === "agency" ? scopedOrganizationId : undefined,
    clientId: mode === "brand" ? scopedOrganizationId : undefined,
    search,
    enabled: open && !!scopedOrganizationId,
  });
  const createRelationship = useCreateAgencyRelationship();

  const availableOrganizations = useMemo(
    () => (mode === "agency" ? relationshipQuery.data?.availableClients : relationshipQuery.data?.availableAgencies) || [],
    [mode, relationshipQuery.data],
  );

  const relationshipTypeOptions = [
    { value: "full_service", label: "Full service" },
    { value: "partial", label: "Partial support" },
    { value: "strategy", label: "Strategy only" },
    { value: "media", label: "Media / content" },
    { value: "activation", label: "Activation ops" },
  ];

  const selectedAccount = availableOrganizations.find((organization) => organization.id === selectedOrganizationId);
  const canSubmitExisting = !!scopedOrganizationId && !!selectedAccount && !selectedAccount.isConnected && !relationshipQuery.isLoading && !relationshipQuery.isError;
  const canSubmitCreate = !!scopedOrganizationId && !!clientName.trim();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!scopedOrganizationId || inFlight.current || createRelationship.isPending || (workflow === "existing" ? !canSubmitExisting : !canSubmitCreate)) return;
    inFlight.current = true;
    setSubmitError("");

    try {
      const payload =
        workflow === "existing"
          ? mode === "agency"
            ? {
                agencyId: scopedOrganizationId,
                clientId: selectedOrganizationId,
                relationshipType,
              }
            : {
                agencyId: selectedOrganizationId,
                clientId: scopedOrganizationId,
                relationshipType,
              }
          : {
              agencyId: scopedOrganizationId,
              clientName: clientName.trim(),
              clientType,
              relationshipType,
              website: website.trim() || undefined,
            };

      const result = await createRelationship.mutateAsync(payload);
      // A failed refresh must not turn a saved relationship into a retryable create.
      await refreshWorkspaceContext().catch(() => undefined);

      toast({
        title: mode === "agency" ? "Client relationship updated" : "Agency relationship updated",
        description:
          result.relationship.status === "pending"
            ? "The relationship was created as pending and can be approved from the connected workspace."
            : "The account link is live and available in your management view.",
      });

      setOpen(false);
      setSelectedOrganizationId("");
      setClientName("");
      setWebsite("");
      setSearch("");
      setWorkflow("existing");
      onSuccess?.(result.relationship);
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : "The connection could not be saved. Try again.");
      toast({
        title: "Relationship update failed",
        description: error instanceof Error ? error.message : webT("web.tryAgainShort"),
        variant: "destructive",
      });
    } finally { inFlight.current = false; }
  };

  const title = mode === "agency" ? "Connect client account" : "Connect agency partner";
  const subtitle =
    mode === "agency"
      ? "Link an existing brand or venue, or create a managed client account directly from your agency portfolio."
      : "See which agency is managing this brand and attach a new agency relationship when needed.";

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!createRelationship.isPending) { setOpen(value); setSubmitError(""); } }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 border-primary/20 bg-primary/5 hover:border-primary/50">
            <Plus className="h-4 w-4" />
            {mode === "agency" ? "Add client" : "Connect agency"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="overscroll-contain overflow-y-auto border-border p-0 sm:max-w-2xl" onEscapeKeyDown={(event) => { if (createRelationship.isPending) event.preventDefault(); }} onPointerDownOutside={(event) => { if (createRelationship.isPending) event.preventDefault(); }}>
        <DialogHeader className="px-5 pt-6 sm:px-6">
          <DialogTitle className="pr-10 font-sans text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="mt-2 text-sm">{subtitle}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              aria-pressed={workflow === "existing"} variant={workflow === "existing" ? "default" : "outline"}
              className="h-auto min-h-11 justify-start gap-2 whitespace-normal"
              disabled={createRelationship.isPending} onClick={() => { setWorkflow("existing"); setSubmitError(""); }}
            >
              <Search className="h-4 w-4" />
              Connect existing
            </Button>
            {mode === "agency" && (
              <Button
                type="button"
                aria-pressed={workflow === "create"} variant={workflow === "create" ? "default" : "outline"}
                className="h-auto min-h-11 justify-start gap-2 whitespace-normal"
                disabled={createRelationship.isPending} onClick={() => { setWorkflow("create"); setSubmitError(""); }}
              >
                <Plus className="h-4 w-4" />
                Create managed account
              </Button>
            )}
          </div>

          {workflow === "existing" ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="client-search">Search account</Label>
                <Input
                  id="client-search"
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setSelectedOrganizationId(""); }}
                  placeholder={mode === "agency" ? "Search brands or venues" : "Search agencies"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-account">
                  {mode === "agency" ? "Select client account" : "Select agency account"}
                </Label>
                <Select value={selectedOrganizationId} onValueChange={setSelectedOrganizationId}>
                  <SelectTrigger id="client-account" className="min-h-11">
                    <SelectValue placeholder="Choose an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOrganizations.map((organization) => (
                      <SelectItem key={organization.id} value={organization.id} disabled={organization.isConnected}>
                        <div className="flex items-center gap-2">
                          {organization.type === "merchant" ? <Store className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                          <span>{organization.name}</span>
                          {organization.isConnected ? <span className="text-[10px] text-muted-foreground">already linked</span> : null}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Workspace name
                </Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  placeholder="e.g. Acme Consumer Goods"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client-type">Workspace type</Label>
                  <Select value={clientType} onValueChange={(value: "brand" | "merchant") => setClientType(value)}>
                    <SelectTrigger id="client-type" className="min-h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand">{webT("lens.brand.workspace")}</SelectItem>
                      <SelectItem value="merchant">Venue / merchant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {webT("brandProfilePage.website")}
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="client-relationship">Relationship type</Label>
              <Select value={relationshipType} onValueChange={setRelationshipType}>
                <SelectTrigger id="client-relationship" className="min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {relationshipTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


          </div>

          <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Link2 className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Relationship behavior</span>
            </div>
            <p className="text-sm text-muted-foreground">
              If you already belong to both workspaces, the connection goes live immediately. Otherwise it is created as
              pending so the other side can review it.
            </p>
          </div>

          {submitError ? <p role="alert" className="text-sm text-destructive">{submitError}</p> : null}
          <DialogFooter className="gap-3 sm:gap-3">
            <Button type="button" variant="ghost" disabled={createRelationship.isPending} onClick={() => setOpen(false)}>
              {webT("findOrAsk.cancel")}
            </Button>
            <Button
              type="submit"
              variant="hero"
              disabled={createRelationship.isPending || (workflow === "existing" ? !canSubmitExisting : !canSubmitCreate)}
            >
              {createRelationship.isPending ? (
                <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Saving connection…</span>
              ) : (
                <span className="flex items-center gap-2">
                  {mode === "agency" ? "Save client connection" : "Save agency connection"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </DialogFooter>

          {relationshipQuery.isLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading relationship options…
            </div>
          ) : null}

          {!relationshipQuery.isLoading && !relationshipQuery.isError && availableOrganizations.length === 0 && workflow === "existing" ? (
            <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">No matches yet</span>
              </div>
              {mode === "agency"
                ? "No matching brands or venues are available for this search. Create a managed account if this client is net new."
                : "No matching agencies are available for this search yet."}
            </div>
          ) : null}

          {relationshipQuery.isError && workflow === "existing" ? <div role="alert" className="rounded-xl border border-destructive/30 p-4 text-sm"><p>Accounts could not be loaded.</p><Button type="button" variant="outline" className="mt-3" disabled={relationshipQuery.isFetching} onClick={() => void relationshipQuery.refetch()}>Try again</Button></div> : null}

        </form>
      </DialogContent>
    </Dialog>
  );
}
