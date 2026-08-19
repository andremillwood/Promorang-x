import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Archive, Building2, CircleX, ExternalLink, Megaphone, Package, PauseCircle, Pencil, PlayCircle, Plus, Search, Store, Tag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL || "https://api.promorang.co";

type CatalogType = "brands" | "venues" | "products" | "offers" | "campaigns";

type CatalogItem = Record<string, any> & {
  id: string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  address?: string | null;
  is_active?: boolean | null;
  status?: string | null;
  created_at?: string | null;
};

type EditState = {
  item: CatalogItem;
  type: CatalogType;
  values: Record<string, string>;
  reason: string;
  mode: "create" | "edit";
} | null;

const catalogMeta = {
  brands: {
    title: "Brands",
    description: "Brand workspaces, ownership, verification, and platform standing.",
    icon: Building2,
  },
  venues: {
    title: "Venues",
    description: "Public places, business pages, and hosting infrastructure.",
    icon: Store,
  },
  products: {
    title: "Products",
    description: "Merchant marketplace listings, services, and redeemable inventory.",
    icon: Package,
  },
  offers: {
    title: "Offers",
    description: "Unified offer inventory, reward distribution, and claimable value.",
    icon: Tag,
  },
  campaigns: {
    title: "Campaigns",
    description: "Brand-funded campaigns, targeting, rewards, and lifecycle state.",
    icon: Megaphone,
  },
} satisfies Record<CatalogType, { title: string; description: string; icon: typeof Store }>;

async function adminRequest<T>(path: string, token?: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}/api/admin${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) throw new Error(payload.error || "Admin catalog request failed");
  return payload;
}

function titleFor(item: CatalogItem) {
  return item.name || item.title || "Untitled item";
}

function statusFor(type: CatalogType, item: CatalogItem) {
  if (type === "brands") return item.status || "active";
  if (type === "offers") return item.status || "draft";
  return item.is_active === false ? "inactive" : "active";
}

function statusClass(status: string) {
  if (["active", "approved", "joinable"].includes(status)) return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700";
  if (["paused", "inactive", "draft"].includes(status)) return "border-amber-500/25 bg-amber-500/10 text-amber-700";
  if (["archived", "ended", "rejected", "suspended"].includes(status)) return "border-destructive/25 bg-destructive/10 text-destructive";
  return "border-border bg-muted/40 text-muted-foreground";
}

function itemHref(type: CatalogType, item: CatalogItem) {
  if (type === "brands") return `/brands/${item.slug || item.id}`;
  if (type === "venues") return `/venues/${item.slug || item.id}`;
  if (type === "products") return item.venue_id ? `/venues/${item.venue_id}` : "/marketplace";
  if (type === "campaigns") return `/dashboard/campaigns/${item.id}`;
  return "/offers";
}

function editableFields(type: CatalogType) {
  if (type === "brands") {
    return [
      ["name", "Brand name"],
      ["slug", "URL slug"],
      ["industry", "Industry"],
      ["contact_email", "Contact email"],
      ["billing_email", "Billing email"],
      ["website", "Website"],
      ["avatar_url", "Logo URL"],
      ["owner_id", "Owner user ID"],
    ];
  }

  if (type === "venues") {
    return [
      ["name", "Name"],
      ["description", "Description"],
      ["address", "Address"],
      ["category", "Category"],
      ["phone", "Phone"],
      ["website", "Website"],
      ["image_url", "Image URL"],
      ["owner_id", "Owner user ID"],
    ];
  }

  if (type === "products") {
    return [
      ["name", "Name"],
      ["description", "Description"],
      ["category", "Category"],
      ["price", "Price"],
      ["currency", "Currency"],
      ["inventory_quantity", "Inventory"],
      ["points_cost", "Points cost"],
      ["venue_id", "Venue ID"],
      ["merchant_id", "Merchant user ID"],
    ];
  }

  if (type === "campaigns") {
    return [
      ["title", "Title"],
      ["description", "Description"],
      ["brand_id", "Brand user ID"],
      ["organization_id", "Brand organization ID"],
      ["budget", "Budget"],
      ["reward_type", "Reward type"],
      ["reward_value", "Reward value"],
      ["start_date", "Start date"],
      ["end_date", "End date"],
      ["featured_until", "Featured until"],
    ];
  }

  return [
    ["title", "Title"],
    ["description", "Description"],
    ["terms", "Terms"],
    ["reward_type", "Reward type"],
    ["fulfillment_type", "Fulfillment"],
    ["value_amount", "Value amount"],
    ["value_currency", "Value currency"],
    ["quantity_total", "Quantity total"],
    ["per_user_limit", "Per-user limit"],
    ["venue_id", "Venue ID"],
    ["starts_at", "Starts at"],
    ["ends_at", "Ends at"],
  ];
}

function buildEditValues(type: CatalogType, item: CatalogItem) {
  return Object.fromEntries(
    editableFields(type).map(([field]) => [field, item[field] === null || item[field] === undefined ? "" : String(item[field])])
  );
}

function parseCatalogValue(field: string, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (["price", "value_amount", "budget"].includes(field)) return Number(trimmed);
  if (["inventory_quantity", "points_cost", "quantity_total", "per_user_limit"].includes(field)) return Number.parseInt(trimmed, 10);
  return trimmed;
}

export function AdminCatalogTab() {
  const { session, roles } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [type, setType] = useState<CatalogType>("venues");
  const [search, setSearch] = useState("");
  const [editState, setEditState] = useState<EditState>(null);
  const canManage = (roles as string[]).some((role) => ["admin", "administrator", "master_admin"].includes(role));

  const query = useQuery({
    queryKey: ["admin-catalog", type, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const payload = await adminRequest<{ items: CatalogItem[] }>(`/catalog/${type}?${params.toString()}`, session?.access_token);
      return payload.items || [];
    },
    enabled: !!session?.access_token,
  });

  const updateItem = useMutation({
    mutationFn: async ({ itemType, id, patch, reason }: { itemType: CatalogType; id: string; patch: Record<string, unknown>; reason?: string }) =>
      adminRequest(`/catalog/${itemType}/${id}`, session?.access_token, {
        method: "PATCH",
        body: JSON.stringify({ ...patch, reason }),
      }),
    onSuccess: () => {
      toast({ title: "Catalog item updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
    },
    onError: (error: any) => {
      toast({ title: "Catalog update failed", description: error.message, variant: "destructive" });
    },
  });

  const createItem = useMutation({
    mutationFn: async ({ itemType, values, reason }: { itemType: CatalogType; values: Record<string, unknown>; reason: string }) =>
      adminRequest(`/catalog/${itemType}`, session?.access_token, {
        method: "POST",
        body: JSON.stringify({ ...values, reason }),
      }),
    onSuccess: () => {
      toast({ title: "Catalog item created" });
      queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
    },
    onError: (error: any) => {
      toast({ title: "Catalog creation failed", description: error.message, variant: "destructive" });
    },
  });

  const moderateItem = useMutation({
    mutationFn: async ({ itemType, id, action, reason }: { itemType: "brands" | "campaigns"; id: string; action: string; reason?: string }) =>
      adminRequest(`/catalog/${itemType}/${id}/moderate`, session?.access_token, {
        method: "PATCH",
        body: JSON.stringify({ action, reason }),
      }),
    onSuccess: () => {
      toast({ title: "Moderation action recorded" });
      queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
    },
    onError: (error: any) => {
      toast({ title: "Moderation failed", description: error.message, variant: "destructive" });
    },
  });

  const archiveItem = useMutation({
    mutationFn: async ({ itemType, id, reason }: { itemType: CatalogType; id: string; reason: string }) =>
      adminRequest(`/catalog/${itemType}/${id}`, session?.access_token, {
        method: "DELETE",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      toast({ title: "Item archived", description: "The record remains available for audit and recovery." });
      queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
    },
    onError: (error: any) => {
      toast({ title: "Archive failed", description: error.message, variant: "destructive" });
    },
  });

  const rows = useMemo(() => query.data || [], [query.data]);
  const activeCount = rows.filter((item) => ["active"].includes(statusFor(type, item))).length;
  const pausedCount = rows.filter((item) => ["inactive", "paused", "draft"].includes(statusFor(type, item))).length;

  const activate = (item: CatalogItem) => {
    if (type === "brands" || type === "campaigns") {
      moderateItem.mutate({ itemType: type, id: item.id, action: "approve" });
      return;
    }
    const patch = type === "offers" ? { status: "active" } : { is_active: true };
    updateItem.mutate({ itemType: type, id: item.id, patch });
  };

  const pause = (item: CatalogItem) => {
    if (type === "brands" || type === "campaigns") {
      const reason = window.prompt(`Why are you pausing this ${type === "brands" ? "brand" : "campaign"}?`);
      if (!reason?.trim()) return;
      moderateItem.mutate({ itemType: type, id: item.id, action: "pause", reason: reason.trim() });
      return;
    }
    const patch = type === "offers" ? { status: "paused" } : { is_active: false };
    updateItem.mutate({ itemType: type, id: item.id, patch });
  };

  const openEdit = (itemType: CatalogType, item: CatalogItem) => {
    setEditState({
      item,
      type: itemType,
      values: buildEditValues(itemType, item),
      reason: "",
      mode: "edit",
    });
  };

  const openCreate = () => {
    setEditState({
      item: { id: "" },
      type,
      values: buildEditValues(type, { id: "" }),
      reason: "",
      mode: "create",
    });
  };

  const submitEdit = () => {
    if (!editState) return;

    const patch = Object.fromEntries(
      editableFields(editState.type)
        .map(([field]) => [field, parseCatalogValue(field, editState.values[field] || "")])
        .filter(([field, value]) => {
          if (editState.mode === "create") return value !== null;
          const original = editState.item[field as string];
          const normalizedOriginal = original === null || original === undefined ? null : String(original);
          const normalizedNext = value === null || value === undefined ? null : String(value);
          return normalizedOriginal !== normalizedNext;
        })
    );

    if (Object.keys(patch).length === 0) {
      toast({ title: "No changes to save" });
      return;
    }

    if (!editState.reason.trim()) {
      toast({ title: "Reason required", description: "Add a short admin reason for this catalog edit.", variant: "destructive" });
      return;
    }

    if (editState.mode === "create") {
      createItem.mutate({ itemType: editState.type, values: patch, reason: editState.reason.trim() });
    } else {
      updateItem.mutate({
        itemType: editState.type,
        id: editState.item.id,
        patch,
        reason: editState.reason.trim(),
      });
    }
    setEditState(null);
  };

  const requestArchive = (item: CatalogItem) => {
    const reason = window.prompt(`Why are you archiving “${titleFor(item)}”? This can be restored later.`);
    if (!reason?.trim()) return;
    archiveItem.mutate({ itemType: type, id: item.id, reason: reason.trim() });
  };

  const rejectItem = (itemType: "brands" | "campaigns", item: CatalogItem) => {
    const reason = window.prompt(`Why are you rejecting “${titleFor(item)}”?`);
    if (!reason?.trim()) return;
    moderateItem.mutate({ itemType, id: item.id, action: "reject", reason: reason.trim() });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Catalog Control</h2>
          <p className="text-sm text-muted-foreground">Moderate public catalog objects that shape discovery, claims, and commerce.</p>
        </div>
        <div className="flex w-full gap-2 sm:max-w-lg">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search catalog..." className="pl-10" />
          </div>
          {canManage && (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create
            </Button>
          )}
        </div>
      </div>

      <Tabs value={type} onValueChange={(value) => setType(value as CatalogType)} className="space-y-5">
        <TabsList>
          {(Object.keys(catalogMeta) as CatalogType[]).map((key) => {
            const Icon = catalogMeta[key].icon;
            return (
              <TabsTrigger key={key} value={key} className="gap-2">
                <Icon className="h-4 w-4" />
                {catalogMeta[key].title}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(catalogMeta) as CatalogType[]).map((key) => (
          <TabsContent key={key} value={key} className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Loaded</p>
                  <p className="mt-2 text-2xl font-black">{rows.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Active</p>
                  <p className="mt-2 text-2xl font-black text-emerald-600">{activeCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Paused / Draft</p>
                  <p className="mt-2 text-2xl font-black text-amber-600">{pausedCount}</p>
                </CardContent>
              </Card>
            </div>

            {query.isLoading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-44 rounded-xl" />)}
              </div>
            ) : rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                No {catalogMeta[key].title.toLowerCase()} matched.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {rows.map((item) => {
                  const state = statusFor(key, item);
                  const MetaIcon = catalogMeta[key].icon;
                  return (
                    <Card key={item.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <MetaIcon className="h-4 w-4 text-primary" />
                              <span className="truncate">{titleFor(item)}</span>
                            </CardTitle>
                            <CardDescription className="mt-1 line-clamp-2">
                              {item.description || item.address || item.category || item.reward_type || "No description"}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className={statusClass(state)}>{state}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                          <div className="rounded-lg border border-border p-3">
                            <p className="text-xs uppercase tracking-wider">Type</p>
                            <p className="mt-1 font-medium text-foreground">{item.category || item.reward_type || key}</p>
                          </div>
                          <div className="rounded-lg border border-border p-3">
                            <p className="text-xs uppercase tracking-wider">Owner</p>
                            <p className="mt-1 truncate font-mono text-xs text-foreground">{item.owner_id || item.merchant_id || item.owner_user_id || item.brand_id || "none"}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button asChild variant="outline" size="sm">
                            <a href={itemHref(key, item)} target="_blank" rel="noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open
                            </a>
                          </Button>
                          {canManage && (
                            <Button variant="outline" size="sm" onClick={() => openEdit(key, item)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          )}
                          {state !== "active" && (canManage || key === "brands" || key === "campaigns") && (
                            <Button size="sm" onClick={() => activate(item)} disabled={updateItem.isPending}>
                              <PlayCircle className="mr-2 h-4 w-4" />
                              {key === "brands" ? "Approve / restore" : "Activate"}
                            </Button>
                          )}
                          {state === "active" && (canManage || key === "brands" || key === "campaigns") && (
                            <Button variant="outline" size="sm" onClick={() => pause(item)} disabled={updateItem.isPending}>
                              <PauseCircle className="mr-2 h-4 w-4" />
                              Pause
                            </Button>
                          )}
                          {(key === "brands" || key === "campaigns") && state !== "archived" && (
                            <Button variant="outline" size="sm" onClick={() => rejectItem(key, item)} disabled={moderateItem.isPending}>
                              <CircleX className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          )}
                          {canManage && state !== "archived" && (
                            <Button variant="ghost" size="sm" onClick={() => requestArchive(item)} disabled={archiveItem.isPending}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!editState} onOpenChange={(open) => !open && setEditState(null)}>
        <DialogContent className="max-h-[86vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editState?.mode === "create" ? `Create ${editState ? catalogMeta[editState.type].title.slice(0, -1) : "item"}` : "Edit catalog item"}</DialogTitle>
            <DialogDescription>
              {editState?.mode === "create"
                ? "Create a platform-managed record. The action and reason will be recorded."
                : "Update public details or transfer ownership. Changes are recorded in the admin audit log when available."}
            </DialogDescription>
          </DialogHeader>

          {editState ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-sm font-semibold">{editState.mode === "create" ? `New ${catalogMeta[editState.type].title.toLowerCase().slice(0, -1)}` : titleFor(editState.item)}</p>
                {editState.item.id && <p className="mt-1 font-mono text-xs text-muted-foreground">{editState.item.id}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {editableFields(editState.type).map(([field, label]) => (
                  <div key={field} className={["description", "terms"].includes(field) ? "md:col-span-2" : ""}>
                    <Label htmlFor={`catalog-${field}`}>{label}</Label>
                    {["description", "terms"].includes(field) ? (
                      <Textarea
                        id={`catalog-${field}`}
                        value={editState.values[field] || ""}
                        onChange={(event) =>
                          setEditState((current) => current && {
                            ...current,
                            values: { ...current.values, [field]: event.target.value },
                          })
                        }
                        className="mt-2"
                      />
                    ) : (
                      <Input
                        id={`catalog-${field}`}
                        value={editState.values[field] || ""}
                        onChange={(event) =>
                          setEditState((current) => current && {
                            ...current,
                            values: { ...current.values, [field]: event.target.value },
                          })
                        }
                        className="mt-2"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="catalog-edit-reason">Admin reason</Label>
                <Textarea
                  id="catalog-edit-reason"
                  value={editState.reason}
                  onChange={(event) => setEditState((current) => current && { ...current, reason: event.target.value })}
                  placeholder="Explain why this edit or ownership transfer is needed."
                  className="mt-2"
                />
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditState(null)}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={updateItem.isPending || createItem.isPending}>
              {editState?.mode === "create" ? "Create Item" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
