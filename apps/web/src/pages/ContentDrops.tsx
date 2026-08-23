import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Flame,
  Link2,
  Play,
  Plus,
  RadioTower,
} from "lucide-react";
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
} from "@/hooks/useContentDistribution";
import { useAuth } from "@/contexts/AuthContext";
import { seededContentDrops } from "@/data/seeded-content-drops";
import { OpportunityTerms } from "@/components/economy/OpportunityTerms";
import { LaunchContentDropModal } from "@/components/content/LaunchContentDropModal";
import { useI18n } from "@/i18n/I18nContext";

const defaultDrop = {
  title: "",
  description: "",
  objective_type: "content_launch",
  external_url: "",
  asset_title: "",
  platform: "external",
  base_points: "3",
  entries_per_action: "1",
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

function DropCard({ drop, featured = false }: { drop: ContentDistributionCampaign; featured?: boolean }) {
  const { t, formatNumber } = useI18n();
  const assets = getAssets(drop);
  const primary = assets[0];
  const points = Number(drop.reward_config?.base_points || 0);
  const entries = Number(drop.promoshare_config?.entries_per_action || 1);
  const fundedGems = Math.max(...Object.values(drop.reward_config?.gems_by_action || {}).map(Number), 0);

  return (
    <Card className={cn(
      "group overflow-hidden rounded-2xl border-white/10 bg-white/[0.045] text-white transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_24px_70px_rgba(0,0,0,.32)]",
      featured && "lg:col-span-2"
    )}>
      <CardContent className="p-0">
        <div className={cn("grid min-h-[280px] gap-0", featured ? "lg:grid-cols-[1.2fr_.8fr]" : "sm:grid-cols-[0.92fr_1fr]")}>
          <div className="relative min-h-[250px] bg-black">
            {primary?.media_url ? (
              <img src={getSafeMediaUrl(primary.media_url)!} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
            ) : (
              <div className="flex h-full min-h-[220px] items-center justify-center bg-[linear-gradient(135deg,#111827,#f97316_62%,#facc15)]">
                <RadioTower className="h-14 w-14 text-white/90" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
            <div className="absolute left-3 top-3 flex gap-2">
              <Badge className="bg-black/65 text-white">{drop.objective_type.replace("_", " ")}</Badge>
              {drop.linked_moment_id && <Badge className="bg-primary text-primary-foreground">{t("drops.linked")}</Badge>}
            </div>
            <span className="absolute bottom-4 left-4 grid h-12 w-12 place-items-center rounded-full border border-white/35 bg-black/45 backdrop-blur"><Play className="h-5 w-5 fill-white" /></span>
          </div>
          <div className="flex min-w-0 flex-col justify-between p-5">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/45">
                <Flame className="h-4 w-4 text-primary" />
                {t("drops.cardEyebrow")}
              </div>
              <h2 className="line-clamp-2 text-2xl font-black tracking-tight">{drop.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/50">
                {drop.description || t("drops.cardCopy")}
              </p>
            </div>
            <div className="mt-5">
              <div className="grid grid-cols-3 gap-2">
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
            </div>
            <OpportunityTerms
              dark
              compact={!featured}
              className="mt-3"
              cost={t("drops.costFree")}
              reward={`${points} Points + ${entries} entry${entries === 1 ? "" : "ies"}${fundedGems > 0 ? ` + up to ${fundedGems} Gems` : ""}`}
              funding={t(drop.linked_moment_id ? "drops.linkedPool" : "drops.campaignAllocation")}
              proof={t("drops.proof")}
              settlement={t("drops.settlement")}
            />
            <Button asChild className="mt-5 w-full justify-between">
              <Link to={`/content-drops/${drop.id}`}>
                {t("drops.openOpportunity")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ContentDrops() {
  const { t, formatNumber } = useI18n();
  const { session } = useAuth();
  const dropsQuery = useContentDrops("active");
  const myDropsQuery = useMyContentDrops("all");
  const createDrop = useCreateContentDrop();
  const [draft, setDraft] = useState(defaultDrop);

  const liveDrops = dropsQuery.data;
  const drops = useMemo(() => {
    return liveDrops?.length ? liveDrops : seededContentDrops;
  }, [liveDrops]);
  const myDrops = useMemo(() => myDropsQuery.data || [], [myDropsQuery.data]);
  const addAsset = useAddContentDropAsset();

  const totals = useMemo(() => {
    const all = drops.length ? drops : myDrops;
    return {
      active: all.filter((drop) => drop.status === "active").length,
      assets: all.reduce((sum, drop) => sum + getAssets(drop).length, 0),
      linked: all.filter((drop) => !!drop.linked_moment_id).length,
    };
  }, [drops, myDrops]);

  const updateDraft = (key: keyof typeof defaultDrop, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const response = await createDrop.mutateAsync({
      title: draft.title,
      description: draft.description,
      objective_type: draft.objective_type,
      status: "active",
      reward_config: {
        base_points: Number(draft.base_points || 0),
        points_by_action: {
          click: Number(draft.base_points || 0),
          share: Number(draft.base_points || 0) * 2,
          repost: Number(draft.base_points || 0) * 2,
        },
      },
      promoshare_config: {
        enabled: true,
        actions: ["share", "repost", "signup", "conversion", "proof_verified"],
        entries_per_action: Number(draft.entries_per_action || 1),
      },
      metadata: {
        source_platform: draft.platform,
      },
    });

    await addAsset.mutateAsync({
      campaignId: response.data.id,
      body: {
        title: draft.asset_title || draft.title,
        asset_type: "link",
        target_url: draft.external_url,
        attribution_slug: draft.platform,
        metadata: {
          source_platform: draft.platform,
        },
      },
    });

    setDraft(defaultDrop);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">
          <img src={getSafeMediaUrl(getAssets(drops[0] || seededContentDrops[0])?.[0]?.media_url) || ""} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/20" />
          <div className="relative grid min-h-[420px] gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary"><RadioTower className="h-3 w-3" /> {t("drops.signal")}</div>
              <h1 className="mt-5 max-w-4xl font-sans text-5xl font-black uppercase leading-[0.86] tracking-[-0.065em] sm:text-7xl">{t("drops.hero1")}<br /><span className="text-primary">{t("drops.hero2")}</span></h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">{t("drops.heroCopy")}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <LaunchContentDropModal />
                <Button asChild variant="outline" className="border-white/20 bg-black/35 text-white hover:bg-white/10 hover:text-white"><a href="#content-drop-feed">{t("drops.browse")} <ArrowRight className="ml-2 h-4 w-4" /></a></Button>
                <Button asChild variant="outline" className="border-white/20 bg-black/35 text-white hover:bg-white/10 hover:text-white"><Link to="/growth">{t("drops.growth")}</Link></Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/55 p-3 backdrop-blur-xl">
              {[
                { label: t("drops.active"), value: totals.active, icon: RadioTower },
                { label: t("drops.assets"), value: totals.assets, icon: Link2 },
                { label: t("drops.moments"), value: totals.linked, icon: BadgeCheck },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/[0.06] p-3">
                  <item.icon className="h-4 w-4 text-primary" /><p className="mt-4 text-2xl font-black">{formatNumber(item.value)}</p><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-white/40">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Tabs id="content-drop-feed" defaultValue="discover" className="mt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("drops.eyebrow")}</p><h2 className="mt-1 text-3xl font-black">{t("drops.feedTitle")}</h2></div>
          <TabsList className="grid w-full grid-cols-3 bg-white/[0.06] sm:w-[420px]">
            <TabsTrigger value="discover">{t("drops.discover")}</TabsTrigger>
            <TabsTrigger value="create">{t("drops.launch")}</TabsTrigger>
            <TabsTrigger value="mine">{t("drops.mine")}</TabsTrigger>
          </TabsList>
          </div>

          <TabsContent value="discover" className="mt-5">
            <div className="grid gap-4 lg:grid-cols-2">
              {drops.map((drop, index) => (
                <DropCard key={drop.id} drop={drop} featured={index === 0} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  {t("drops.launchTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!session?.access_token ? (
                  <div className="rounded-md border bg-muted p-5">
                    <p className="font-semibold">{t("drops.signInTitle")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t("drops.signInCopy")}</p>
                  </div>
                ) : (
                  <form onSubmit={submit} className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <Label htmlFor="drop-title">{t("drops.dropTitle")}</Label>
                      <Input id="drop-title" required value={draft.title} onChange={(e) => updateDraft("title", e.target.value)} className="mt-2" placeholder={t("drops.dropPlaceholder")} />
                    </div>
                    <div>
                      <Label>{t("drops.platform")}</Label>
                      <Select value={draft.platform} onValueChange={(value) => updateDraft("platform", value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {platformOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="lg:col-span-2">
                      <Label htmlFor="external-url">{t("drops.externalLink")}</Label>
                      <Input id="external-url" required type="url" value={draft.external_url} onChange={(e) => updateDraft("external_url", e.target.value)} className="mt-2" placeholder="https://..." />
                    </div>
                    <div className="lg:col-span-2">
                      <Label htmlFor="asset-title">{t("drops.assetLabel")}</Label>
                      <Input id="asset-title" value={draft.asset_title} onChange={(e) => updateDraft("asset_title", e.target.value)} className="mt-2" placeholder={t("drops.assetPlaceholder")} />
                    </div>
                    <div className="lg:col-span-2">
                      <Label htmlFor="drop-description">{t("drops.why")}</Label>
                      <Textarea id="drop-description" value={draft.description} onChange={(e) => updateDraft("description", e.target.value)} className="mt-2 min-h-[110px]" />
                    </div>
                    <div>
                      <Label htmlFor="base-points">{t("drops.basePoints")}</Label>
                      <Input id="base-points" type="number" min="0" value={draft.base_points} onChange={(e) => updateDraft("base_points", e.target.value)} className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="entries">{t("drops.entriesPerAction")}</Label>
                      <Input id="entries" type="number" min="0" value={draft.entries_per_action} onChange={(e) => updateDraft("entries_per_action", e.target.value)} className="mt-2" />
                    </div>
                    <div className="lg:col-span-2">
                      <Button disabled={createDrop.isPending || addAsset.isPending} type="submit">
                        <RadioTower className="mr-2 h-4 w-4" />
                        {t("drops.launchCta")}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mine" className="mt-5">
            <div className="grid gap-4 lg:grid-cols-2">
              {myDrops.map((drop) => <DropCard key={drop.id} drop={drop} />)}
              {!myDrops.length && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    {t("drops.mineEmpty")}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
