import { FormEvent, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, BadgeCheck, Link2, Play, Plus, RadioTower, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn, getSafeMediaUrl } from "@/lib/utils";
import {
  ContentDistributionCampaign,
  useAddContentDropAsset,
  useContentDrops,
  useCreateContentDrop,
  useMyContentDrops,
  useUpdateContentDropStatus,
} from "@/hooks/useContentDistribution";
import { useAuth } from "@/contexts/AuthContext";
import { OpportunityTerms } from "@/components/economy/OpportunityTerms";
import { StakeholderHowLead } from "@/components/people/StakeholderLoop";
import { RELEASE_KINDS, RELEASE_KIND_META, type ReleaseKind } from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";
import { useToast } from "@/hooks/use-toast";

const defaultDrop = {
  title: "",
  description: "",
  objective_type: "content_launch",
  release_kind: "video" as ReleaseKind,
  external_url: "",
  asset_title: "",
  platform: "external",
  linked_moment_id: "",
  linked_offer_id: "",
  base_points: "0",
  entries_per_action: "0",
};

const platformOptions = [
  { value: "external", label: "External Link" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "spotify", label: "Spotify" },
  { value: "soundcloud", label: "SoundCloud" },
];

function getAssets(drop: ContentDistributionCampaign) {
  return drop.content_distribution_assets || [];
}

function DropCard({ drop }: { drop: ContentDistributionCampaign }) {
  const { t, formatNumber } = useI18n();
  const assets = getAssets(drop);
  const primary = assets[0];
  const points = Number(drop.reward_config?.base_points || 0);
  const entries = Number(drop.promoshare_config?.entries_per_action || 0);
  const fundedGems = Math.max(...Object.values(drop.reward_config?.gems_by_action || {}).map(Number), 0);

  return (
    <Card className="group overflow-hidden rounded-2xl border-white/10 bg-white/[0.045] text-white transition hover:border-primary/50">
      <CardContent className="p-0">
        <div className="grid min-h-[260px] gap-0 sm:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[220px] bg-black">
            {primary?.media_url ? (
              <img src={getSafeMediaUrl(primary.media_url)!} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
            ) : (
              <div className="flex h-full min-h-[220px] items-center justify-center bg-white/[0.04]">
                <RadioTower className="h-12 w-12 text-primary/70" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
            <div className="absolute left-3 top-3 flex gap-2">
              <Badge className="bg-black/65 text-white">{drop.objective_type.replace("_", " ")}</Badge>
              {drop.linked_moment_id && <Badge className="bg-primary text-primary-foreground">{t("drops.linked")}</Badge>}
              {drop.status !== "active" && <Badge variant="outline" className="border-white/25 bg-black/55 text-white">{drop.status}</Badge>}
            </div>
            <span className="absolute bottom-4 left-4 grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-black/45"><Play className="h-4 w-4 fill-white" /></span>
          </div>
          <div className="flex min-w-0 flex-col justify-between p-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Release opportunity</p>
              <h2 className="mt-2 line-clamp-2 text-2xl font-black tracking-tight">{drop.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/50">{drop.description || "Open the release to see what action is expected and what counts as proof."}</p>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { label: t("drops.points"), value: points },
                { label: t("drops.entries"), value: entries },
                { label: t("drops.assets"), value: assets.length },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/[0.06] p-3">
                  <p className="text-xl font-black">{formatNumber(item.value)}</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">{item.label}</p>
                </div>
              ))}
            </div>
            <OpportunityTerms
              dark
              compact
              className="mt-3"
              cost={t("drops.costFree")}
              reward={`${points} Points + ${entries} entr${entries === 1 ? "y" : "ies"}${fundedGems > 0 ? ` + up to ${fundedGems} Gems` : ""}`}
              funding={t(drop.linked_moment_id ? "drops.linkedPool" : "drops.campaignAllocation")}
              proof={t("drops.proof")}
              settlement={t("drops.settlement")}
            />
            <Button asChild className="mt-5 w-full justify-between">
              <Link to={`/content-drops/${drop.id}`}>{t("drops.openOpportunity")}<ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ContentDrops() {
  const { t, formatNumber } = useI18n();
  const { session, activeRole } = useAuth();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const lensRole = params.get("role") || activeRole;
  const dropsQuery = useContentDrops("active");
  const myDropsQuery = useMyContentDrops("all");
  const createDrop = useCreateContentDrop();
  const addAsset = useAddContentDropAsset();
  const updateStatus = useUpdateContentDropStatus();
  const [draft, setDraft] = useState(defaultDrop);

  const drops = useMemo(() => dropsQuery.data || [], [dropsQuery.data]);
  const myDrops = useMemo(() => myDropsQuery.data || [], [myDropsQuery.data]);
  const totals = useMemo(() => ({
    active: drops.filter((drop) => drop.status === "active").length,
    assets: drops.reduce((sum, drop) => sum + getAssets(drop).length, 0),
    linked: drops.filter((drop) => !!drop.linked_moment_id).length,
  }), [drops]);
  const liveTotalsAvailable = !dropsQuery.isLoading && !dropsQuery.error;

  const updateDraft = (key: keyof typeof defaultDrop, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    let campaignId: string | null = null;

    try {
      const response = await createDrop.mutateAsync({
        title: draft.title,
        description: draft.description,
        objective_type: draft.objective_type,
        status: "draft",
        linked_moment_id: draft.linked_moment_id || null,
        reward_config: {
          base_points: Number(draft.base_points || 0),
          points_by_action: {
            click: Number(draft.base_points || 0),
            proof_verified: Number(draft.base_points || 0) * 3,
          },
        },
        promoshare_config: {
          enabled: Number(draft.entries_per_action || 0) > 0,
          actions: ["click", "proof_verified", "conversion"],
          entries_per_action: Number(draft.entries_per_action || 0),
        },
        metadata: {
          source_platform: draft.platform,
          release_kind: draft.release_kind,
          original_url: draft.external_url,
          linked_offer_id: draft.linked_offer_id || null,
        },
      });

      campaignId = response.data.id;

      await addAsset.mutateAsync({
        campaignId,
        body: {
          title: draft.asset_title || draft.title,
          asset_type: "link",
          target_url: draft.external_url,
          attribution_slug: draft.platform,
          metadata: { source_platform: draft.platform },
        },
      });

      await updateStatus.mutateAsync({ campaignId, status: "active" });

      setDraft(defaultDrop);
      toast({
        title: "Release published",
        description: "The release record and its asset are saved, and the opportunity is now active.",
      });
      await Promise.all([dropsQuery.refetch(), myDropsQuery.refetch()]);
    } catch (error) {
      if (campaignId) {
        await myDropsQuery.refetch();
        toast({
          title: "Release not published",
          description: "PROMORANG saved a draft, but could not complete the asset or activation step. The incomplete record was not promoted as a live opportunity.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-black to-black p-6 sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Creator distribution</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Choose useful work. Publish it. Prove what it caused.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60">A release should exist because there is a real audience action worth creating or measuring. Promorang records the live opportunities that actually exist; when none are live, this page stays honestly empty.</p>
          <div className="mt-5 max-w-2xl"><StakeholderHowLead role={lensRole} surface="drops" /></div>
          <div className="mt-6 grid max-w-2xl grid-cols-3 gap-2">
            {[
              { label: "Live releases", value: liveTotalsAvailable ? totals.active : null, icon: RadioTower },
              { label: "Assets", value: liveTotalsAvailable ? totals.assets : null, icon: Link2 },
              { label: "Linked Moments", value: liveTotalsAvailable ? totals.linked : null, icon: BadgeCheck },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <item.icon className="h-4 w-4 text-primary" />
                <p className="mt-3 text-2xl font-black">{item.value == null ? "—" : formatNumber(item.value)}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-white/40">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <Tabs defaultValue="discover" className="mt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Release workspace</p><h2 className="mt-1 text-3xl font-black">What do you need to do?</h2></div>
            <TabsList className="grid w-full grid-cols-3 bg-white/[0.06] sm:w-[420px]">
              <TabsTrigger value="discover">Find work</TabsTrigger>
              <TabsTrigger value="create">Publish release</TabsTrigger>
              <TabsTrigger value="mine">My releases</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="discover" className="mt-5">
            {dropsQuery.isLoading ? (
              <div className="h-40 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
            ) : dropsQuery.error ? (
              <Card className="border-red-500/20 bg-red-500/5 text-white">
                <CardContent className="p-8 text-center">
                  <p className="text-xl font-black">Live opportunities are unavailable.</p>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/50">PROMORANG could not read the release source, so this is not being shown as an empty market.</p>
                  <Button type="button" variant="outline" className="mt-5 border-white/15 bg-black/20 text-white hover:bg-white/10" onClick={() => dropsQuery.refetch()}>
                    <RefreshCcw className="mr-2 h-4 w-4" />Retry live source
                  </Button>
                </CardContent>
              </Card>
            ) : drops.length ? (
              <div className="grid gap-4 lg:grid-cols-2">{drops.map((drop) => <DropCard key={drop.id} drop={drop} />)}</div>
            ) : (
              <Card className="border-dashed border-white/15 bg-white/[0.025] text-white">
                <CardContent className="p-8 text-center">
                  <p className="text-xl font-black">No live release opportunities right now.</p>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/50">That means there is nothing currently published for creators to act on. We do not substitute seeded examples or demo activity into the live feed.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="create" className="mt-5">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" />Publish a release with a clear purpose</CardTitle></CardHeader>
              <CardContent>
                {!session?.access_token ? (
                  <div className="rounded-md border bg-muted p-5"><p className="font-semibold">{t("drops.signInTitle")}</p><p className="mt-1 text-sm text-muted-foreground">{t("drops.signInCopy")}</p></div>
                ) : (
                  <form onSubmit={submit} className="grid gap-4 lg:grid-cols-2">
                    <div className="lg:col-span-2 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">Before publishing, be able to answer: who should act, what should they do, what counts as proof, and what value do they receive?</div>
                    <div><Label htmlFor="drop-title">{t("drops.dropTitle")}</Label><Input id="drop-title" required value={draft.title} onChange={(e) => updateDraft("title", e.target.value)} className="mt-2" placeholder={t("drops.dropPlaceholder")} /></div>
                    <div><Label>What is this?</Label><Select value={draft.release_kind} onValueChange={(value) => updateDraft("release_kind", value)}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent>{RELEASE_KINDS.map((kind) => <SelectItem key={kind} value={kind}>{RELEASE_KIND_META[kind].label}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label>{t("drops.platform")}</Label><Select value={draft.platform} onValueChange={(value) => updateDraft("platform", value)}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent>{platformOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label htmlFor="external-url">{t("drops.externalLink")}</Label><Input id="external-url" required type="url" value={draft.external_url} onChange={(e) => updateDraft("external_url", e.target.value)} className="mt-2" placeholder="https://..." /></div>
                    <div className="lg:col-span-2"><Label htmlFor="asset-title">{t("drops.assetLabel")}</Label><Input id="asset-title" value={draft.asset_title} onChange={(e) => updateDraft("asset_title", e.target.value)} className="mt-2" placeholder={t("drops.assetPlaceholder")} /></div>
                    <div><Label htmlFor="linked-moment">Attach a Moment ID</Label><Input id="linked-moment" value={draft.linked_moment_id} onChange={(e) => updateDraft("linked_moment_id", e.target.value)} className="mt-2" placeholder="Optional" /></div>
                    <div><Label htmlFor="linked-offer">Attach an offer ID</Label><Input id="linked-offer" value={draft.linked_offer_id} onChange={(e) => updateDraft("linked_offer_id", e.target.value)} className="mt-2" placeholder="Optional" /></div>
                    <div className="lg:col-span-2"><Label htmlFor="drop-description">What should this release cause?</Label><Textarea id="drop-description" required value={draft.description} onChange={(e) => updateDraft("description", e.target.value)} className="mt-2 min-h-[110px]" placeholder="Describe the audience action and why it matters." /></div>
                    <div><Label htmlFor="base-points">Points per accepted action</Label><Input id="base-points" type="number" min="0" value={draft.base_points} onChange={(e) => updateDraft("base_points", e.target.value)} className="mt-2" /></div>
                    <div><Label htmlFor="entries">PromoShare entries per action</Label><Input id="entries" type="number" min="0" value={draft.entries_per_action} onChange={(e) => updateDraft("entries_per_action", e.target.value)} className="mt-2" /></div>
                    <div className="lg:col-span-2"><Button disabled={createDrop.isPending || addAsset.isPending || updateStatus.isPending} type="submit"><RadioTower className="mr-2 h-4 w-4" />Publish release</Button></div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mine" className="mt-5">
            {!session?.access_token ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">{t("drops.signInCopy")}</CardContent></Card>
            ) : myDropsQuery.isLoading ? (
              <div className="h-40 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
            ) : myDropsQuery.error ? (
              <Card className="border-red-500/20 bg-red-500/5 text-white">
                <CardContent className="p-8 text-center">
                  <p className="text-xl font-black">Your release records are unavailable.</p>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/50">The account source failed. PROMORANG will not describe that as having no releases.</p>
                  <Button type="button" variant="outline" className="mt-5 border-white/15 bg-black/20 text-white hover:bg-white/10" onClick={() => myDropsQuery.refetch()}>
                    <RefreshCcw className="mr-2 h-4 w-4" />Retry account source
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {myDrops.map((drop) => <DropCard key={drop.id} drop={drop} />)}
                {!myDrops.length && <Card><CardContent className="p-8 text-center text-muted-foreground">You have not published a release yet. Publish one only when there is a real action worth creating or measuring.</CardContent></Card>}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
