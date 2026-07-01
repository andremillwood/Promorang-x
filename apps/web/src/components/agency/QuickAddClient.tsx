import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Link2,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Store,
  Users2,
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
import { Textarea } from "@/components/ui/textarea";
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
  const { toast } = useToast();
  const { activeOrgId, refreshWorkspaceContext } = useAuth();
  const scopedOrganizationId = organizationId || activeOrgId;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [workflow, setWorkflow] = useState<"existing" | "create">("existing");
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("");
  const [relationshipType, setRelationshipType] = useState("full_service");
  const [clientName, setClientName] = useState("");
  const [clientType, setClientType] = useState<"brand" | "merchant">("brand");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");

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

  const canSubmitExisting = !!scopedOrganizationId && !!selectedOrganizationId;
  const canSubmitCreate = !!scopedOrganizationId && !!clientName.trim();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!scopedOrganizationId) return;

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
      await refreshWorkspaceContext();

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
      setNotes("");
      setWorkflow("existing");
      onSuccess?.(result.relationship);
    } catch (error: unknown) {
      toast({
        title: "Relationship update failed",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    }
  };

  const title = mode === "agency" ? "Connect client account" : "Connect agency partner";
  const subtitle =
    mode === "agency"
      ? "Link an existing brand or venue, or create a managed client account directly from your agency portfolio."
      : "See which agency is managing this brand and attach a new agency relationship when needed.";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 border-primary/20 bg-primary/5 hover:border-primary/50">
            <Plus className="h-4 w-4" />
            {mode === "agency" ? "Add Agency Client" : "Connect Agency"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="overflow-hidden border-border p-0 sm:max-w-2xl">
        <div className="relative overflow-hidden bg-charcoal px-8 py-8 text-center text-cream">
          <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/20 blur-[40px]" />
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-xl backdrop-blur-sm">
            {mode === "agency" ? <Building2 className="h-8 w-8 text-primary" /> : <Users2 className="h-8 w-8 text-primary" />}
          </div>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold italic text-cream">{title}</DialogTitle>
            <DialogDescription className="mx-auto mt-2 max-w-xl text-xs text-white/60">{subtitle}</DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant={workflow === "existing" ? "hero" : "outline"}
              className="justify-start gap-2"
              onClick={() => setWorkflow("existing")}
            >
              <Search className="h-4 w-4" />
              Connect existing
            </Button>
            {mode === "agency" && (
              <Button
                type="button"
                variant={workflow === "create" ? "hero" : "outline"}
                className="justify-start gap-2"
                onClick={() => setWorkflow("create")}
              >
                <Plus className="h-4 w-4" />
                Create managed account
              </Button>
            )}
          </div>

          {workflow === "existing" ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Search account</Label>
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={mode === "agency" ? "Search brands or venues" : "Search agencies"}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {mode === "agency" ? "Select client account" : "Select agency account"}
                </Label>
                <Select value={selectedOrganizationId} onValueChange={setSelectedOrganizationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOrganizations.map((organization) => (
                      <SelectItem key={organization.id} value={organization.id}>
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
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Workspace type</Label>
                  <Select value={clientType} onValueChange={(value: "brand" | "merchant") => setClientType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand">Brand</SelectItem>
                      <SelectItem value="merchant">Venue / merchant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-[1fr_1.3fr]">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Relationship type</Label>
              <Select value={relationshipType} onValueChange={setRelationshipType}>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Why this connection matters
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional internal note for the operator."
                rows={3}
              />
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

          <DialogFooter className="gap-3 sm:gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="hero"
              disabled={createRelationship.isPending || (workflow === "existing" ? !canSubmitExisting : !canSubmitCreate)}
            >
              {createRelationship.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
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

          {!relationshipQuery.isLoading && availableOrganizations.length === 0 && workflow === "existing" ? (
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

          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1 text-[10px] font-bold uppercase text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              Workspace relationship layer
            </span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
