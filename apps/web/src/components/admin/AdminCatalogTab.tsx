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
import { translate, useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

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
    titleKey: "catCtrl.brands" as const,
    descKey: "catDlg.desc.brands" as const,
    oneKey: "catDlg.one.brand" as const,
    icon: Building2,
  },
  venues: {
    titleKey: "catCtrl.venues" as const,
    descKey: "catDlg.desc.venues" as const,
    oneKey: "catDlg.one.venue" as const,
    icon: Store,
  },
  products: {
    titleKey: "catCtrl.products" as const,
    descKey: "catDlg.desc.products" as const,
    oneKey: "catDlg.one.product" as const,
    icon: Package,
  },
  offers: {
    titleKey: "catCtrl.offers" as const,
    descKey: "catDlg.desc.offers" as const,
    oneKey: "catDlg.one.offer" as const,
    icon: Tag,
  },
  campaigns: {
    titleKey: "catCtrl.campaigns" as const,
    descKey: "catDlg.desc.campaigns" as const,
    oneKey: "catDlg.one.campaign" as const,
    icon: Megaphone,
  },
} satisfies Record<CatalogType, { titleKey: TranslationKey; descKey: TranslationKey; oneKey: TranslationKey; icon: typeof Store }>;

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
  if (!response.ok || payload.success === false) throw new Error(payload.error || translate("catDlg.requestFailed"));
  return payload;
}

function titleFor(item: CatalogItem) {
  return item.name || item.title || translate("catDlg.untitled");
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

function editableFields(type: CatalogType): [string, TranslationKey][] {
  if (type === "brands") {
    return [
      ["name", "catDlg.f.brandName"],
      ["slug", "catDlg.f.slug"],
      ["industry", "catDlg.f.industry"],
      ["contact_email", "catDlg.f.contactEmail"],
      ["billing_email", "catDlg.f.billingEmail"],
      ["website", "catDlg.f.website"],
      ["avatar_url", "catDlg.f.logoUrl"],
      ["owner_id", "catDlg.f.ownerId"],
    ];
  }

  if (type === "venues") {
    return [
      ["name", "catDlg.f.name"],
      ["description", "catDlg.f.description"],
      ["address", "catDlg.f.address"],
      ["category", "catDlg.f.category"],
      ["phone", "catDlg.f.phone"],
      ["website", "catDlg.f.website"],
      ["image_url", "catDlg.f.imageUrl"],
      ["owner_id", "catDlg.f.ownerId"],
    ];
  }

  if (type === "products") {
    return [
      ["name", "catDlg.f.name"],
      ["description", "catDlg.f.description"],
      ["category", "catDlg.f.category"],
      ["price", "catDlg.f.price"],
      ["currency", "catDlg.f.currency"],
      ["inventory_quantity", "catDlg.f.inventory"],
      ["points_cost", "catDlg.f.pointsCost"],
      ["venue_id", "catDlg.f.venueId"],
      ["merchant_id", "catDlg.f.merchantId"],
    ];
  }

  if (type === "campaigns") {
    return [
      ["title", "catDlg.f.title"],
      ["description", "catDlg.f.description"],
      ["brand_id", "catDlg.f.brandUserId"],
      ["organization_id", "catDlg.f.orgId"],
      ["budget", "catDlg.f.budget"],
      ["reward_type", "catDlg.f.rewardType"],
      ["reward_value", "catDlg.f.rewardValue"],
      ["start_date", "catDlg.f.startDate"],
      ["end_date", "catDlg.f.endDate"],
      ["featured_until", "catDlg.f.featuredUntil"],
    ];
  }

  return [
    ["title", "catDlg.f.title"],
    ["description", "catDlg.f.description"],
    ["terms", "catDlg.f.terms"],
    ["reward_type", "catDlg.f.rewardType"],
    ["fulfillment_type", "catDlg.f.fulfillment"],
    ["value_amount", "catDlg.f.valueAmount"],
    ["value_currency", "catDlg.f.valueCurrency"],
    ["quantity_total", "catDlg.f.qtyTotal"],
    ["per_user_limit", "catDlg.f.perUser"],
    ["venue_id", "catDlg.f.venueId"],
    ["starts_at", "catDlg.f.startsAt"],
    ["ends_at", "catDlg.f.endsAt"],
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
  const { t } = useI18n();
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
      toast({ title: t("catDlg.updated") });
      queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
    },
    onError: (error: any) => {
      toast({ title: t("catDlg.updateFail"), description: error.message, variant: "destructive" });
    },
  });

  const createItem = useMutation({
    mutationFn: async ({ itemType, values, reason }: { itemType: CatalogType; values: Record<string, unknown>; reason: string }) =>
      adminRequest(`/catalog/${itemType}`, session?.access_token, {
        method: "POST",
        body: JSON.stringify({ ...values, reason }),
      }),
    onSuccess: () => {
      toast({ title: t("catDlg.created") });
      queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
    },
    onError: (error: any) => {
      toast({ title: t("catDlg.createFail"), description: error.message, variant: "destructive" });
    },
  });

  const moderateItem = useMutation({
    mutationFn: async ({ itemType, id, action, reason }: { itemType: "brands" | "campaigns"; id: string; action: string; reason?: string }) =>
      adminRequest(`/catalog/${itemType}/${id}/moderate`, session?.access_token, {
        method: "PATCH",
        body: JSON.stringify({ action, reason }),
      }),
    onSuccess: () => {
      toast({ title: t("catDlg.moderated") });
      queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
    },
    onError: (error: any) => {
      toast({ title: t("catDlg.moderateFail"), description: error.message, variant: "destructive" });
    },
  });

  const archiveItem = useMutation({
    mutationFn: async ({ itemType, id, reason }: { itemType: CatalogType; id: string; reason: string }) =>
      adminRequest(`/catalog/${itemType}/${id}`, session?.access_token, {
        method: "DELETE",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      toast({ title: t("catDlg.archived"), description: t("catDlg.archivedDesc") });
      queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
    },
    onError: (error: any) => {
      toast({ title: t("catDlg.archiveFail"), description: error.message, variant: "destructive" });
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
      const reason = window.prompt(t("catDlg.pauseWhy", { kind: t(type === "brands" ? "catDlg.kindBrand" : "catDlg.kindCampaign") }));
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
      toast({ title: t("catDlg.noChanges") });
      return;
    }

    if (!editState.reason.trim()) {
      toast({ title: t("catDlg.reasonNeeded"), description: t("catDlg.reasonNeededDesc"), variant: "destructive" });
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
    const reason = window.prompt(t("catDlg.archiveWhy", { title: titleFor(item) }));
    if (!reason?.trim()) return;
    archiveItem.mutate({ itemType: type, id: item.id, reason: reason.trim() });
  };

  const rejectItem = (itemType: "brands" | "campaigns", item: CatalogItem) => {
    const reason = window.prompt(t("catDlg.rejectWhy", { title: titleFor(item) }));
    if (!reason?.trim()) return;
    moderateItem.mutate({ itemType, id: item.id, action: "reject", reason: reason.trim() });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("catCtrl.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("catCtrl.copy")}</p>
        </div>
        <div className="flex w-full gap-2 sm:max-w-lg">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("catCtrl.search")} className="pl-10" />
          </div>
          {canManage && (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              {t("catCtrl.create")}
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
                {t(catalogMeta[key].titleKey)}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(catalogMeta) as CatalogType[]).map((key) => (
          <TabsContent key={key} value={key} className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("catCtrl.loaded")}</p>
                  <p className="mt-2 text-2xl font-black">{rows.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("catCtrl.active")}</p>
                  <p className="mt-2 text-2xl font-black text-emerald-600">{activeCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("catCtrl.paused")}</p>
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
                {t("catCtrl.empty", { type: t(catalogMeta[key].titleKey) })}
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
                              {item.description || item.address || item.category || item.reward_type || t("catCtrl.noDesc")}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className={statusClass(state)}>{state}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                          <div className="rounded-lg border border-border p-3">
                            <p className="text-xs uppercase tracking-wider">{t("catCtrl.type")}</p>
                            <p className="mt-1 font-medium text-foreground">{item.category || item.reward_type || key}</p>
                          </div>
                          <div className="rounded-lg border border-border p-3">
                            <p className="text-xs uppercase tracking-wider">{t("catCtrl.owner")}</p>
                            <p className="mt-1 truncate font-mono text-xs text-foreground">{item.owner_id || item.merchant_id || item.owner_user_id || item.brand_id || t("catCtrl.none")}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button asChild variant="outline" size="sm">
                            <a href={itemHref(key, item)} target="_blank" rel="noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              {t("catDlg.open")}
                            </a>
                          </Button>
                          {canManage && (
                            <Button variant="outline" size="sm" onClick={() => openEdit(key, item)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              {t("catDlg.edit")}
                            </Button>
                          )}
                          {state !== "active" && (canManage || key === "brands" || key === "campaigns") && (
                            <Button size="sm" onClick={() => activate(item)} disabled={updateItem.isPending}>
                              <PlayCircle className="mr-2 h-4 w-4" />
                              {key === "brands" ? t("catDlg.approveRestore") : t("catDlg.activate")}
                            </Button>
                          )}
                          {state === "active" && (canManage || key === "brands" || key === "campaigns") && (
                            <Button variant="outline" size="sm" onClick={() => pause(item)} disabled={updateItem.isPending}>
                              <PauseCircle className="mr-2 h-4 w-4" />
                              {t("catDlg.pause")}
                            </Button>
                          )}
                          {(key === "brands" || key === "campaigns") && state !== "archived" && (
                            <Button variant="outline" size="sm" onClick={() => rejectItem(key, item)} disabled={moderateItem.isPending}>
                              <CircleX className="mr-2 h-4 w-4" />
                              {t("catDlg.reject")}
                            </Button>
                          )}
                          {canManage && state !== "archived" && (
                            <Button variant="ghost" size="sm" onClick={() => requestArchive(item)} disabled={archiveItem.isPending}>
                              <Archive className="mr-2 h-4 w-4" />
                              {t("catDlg.archive")}
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
            <DialogTitle>{editState?.mode === "create" ? t("catDlg.createTitle", { kind: editState ? t(catalogMeta[editState.type].oneKey) : t("catDlg.one.offer") }) : t("catDlg.editTitle")}</DialogTitle>
            <DialogDescription>
              {editState?.mode === "create" ? t("catDlg.createCopy") : t("catDlg.editCopy")}
            </DialogDescription>
          </DialogHeader>

          {editState ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-sm font-semibold">{editState.mode === "create" ? t("catDlg.newKind", { kind: t(catalogMeta[editState.type].oneKey) }) : titleFor(editState.item)}</p>
                {editState.item.id && <p className="mt-1 font-mono text-xs text-muted-foreground">{editState.item.id}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {editableFields(editState.type).map(([field, label]) => (
                  <div key={field} className={["description", "terms"].includes(field) ? "md:col-span-2" : ""}>
                    <Label htmlFor={`catalog-${field}`}>{t(label)}</Label>
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
                <Label htmlFor="catalog-edit-reason">{t("catDlg.reason")}</Label>
                <Textarea
                  id="catalog-edit-reason"
                  value={editState.reason}
                  onChange={(event) => setEditState((current) => current && { ...current, reason: event.target.value })}
                  placeholder={t("catDlg.reasonPh")}
                  className="mt-2"
                />
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditState(null)}>
              {t("catDlg.cancel")}
            </Button>
            <Button onClick={submitEdit} disabled={updateItem.isPending || createItem.isPending}>
              {editState?.mode === "create" ? t("catDlg.createItem") : t("catDlg.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
