import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";
import { Link2, Sparkles, ArrowRight, ShieldCheck, Gift, PlayCircle, Share2, MessageCircle, MapPin } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const actionOptions = [
  { id: "watch", key: "o2oLink.act.watch" as TranslationKey, icon: PlayCircle },
  { id: "share", key: "o2oLink.act.share" as TranslationKey, icon: Share2 },
  { id: "comment", key: "o2oLink.act.comment" as TranslationKey, icon: MessageCircle },
  { id: "join", key: "o2oLink.act.join" as TranslationKey, icon: Sparkles },
  { id: "check_in", key: "o2oLink.act.check_in" as TranslationKey, icon: MapPin },
];

type O2OManageOption = {
  id: string;
  title: string;
};

type O2OLinkRow = {
  id: string;
  o2o_conversion_rate?: number | null;
  content?: {
    title?: string | null;
  } | null;
  moment?: {
    title?: string | null;
  } | null;
};

type O2OLinkManagerProps = {
  initialContentId?: string;
  onLinkCreated?: () => void;
};

export function O2OLinkManager({ initialContentId, onLinkCreated }: O2OLinkManagerProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const actionLabel = (id: string) => {
    const match = actionOptions.find((item) => item.id === id);
    return match ? t(match.key) : id.replaceAll("_", " ");
  };
  const queryClient = useQueryClient();
  const [contentId, setContentId] = useState("");
  const [momentId, setMomentId] = useState("");
  const [entryActions, setEntryActions] = useState("watch,share");
  const [unlockSummary, setUnlockSummary] = useState("");

  useEffect(() => {
    if (initialContentId) {
      setContentId(initialContentId);
    }
  }, [initialContentId]);

  const optionsQuery = useQuery({
    queryKey: ["o2o-manage-options"],
    enabled: !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/o2o/manage/options`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || t("o2oLink.loadOptsFail"));
      return payload?.options;
    },
  });

  const linksQuery = useQuery({
    queryKey: ["o2o-my-links"],
    enabled: !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/o2o/links/mine`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || t("o2oLink.loadLinksFail"));
      return payload?.links || [];
    },
  });

  const createLink = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/api/o2o/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          content_item_id: contentId,
          moment_id: momentId,
          entry_action_types: entryActions.split(",").map((item) => item.trim()).filter(Boolean),
          physical_unlock_rules: unlockSummary ? { summary: unlockSummary } : null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || t("o2oLink.createFail"));
      return payload;
    },
    onSuccess: () => {
      toast({ title: t("o2oLink.toastOk"), description: t("o2oLink.toastOkBody") });
      setUnlockSummary("");
      queryClient.invalidateQueries({ queryKey: ["o2o-my-links"] });
      queryClient.invalidateQueries({ queryKey: ["creator-o2o-summary"] });
      onLinkCreated?.();
    },
    onError: (error: Error) => {
      toast({ title: t("o2oLink.toastFail"), description: error.message, variant: "destructive" });
    },
  });

  const contentOptions = useMemo<O2OManageOption[]>(() => optionsQuery.data?.content_items || [], [optionsQuery.data]);
  const momentOptions = useMemo<O2OManageOption[]>(() => optionsQuery.data?.moments || [], [optionsQuery.data]);
  const linkedItems = (linksQuery.data || []) as O2OLinkRow[];
  const selectedActions = entryActions.split(",").map((item) => item.trim()).filter(Boolean);
  const toggleAction = (action: string) => {
    const next = selectedActions.includes(action)
      ? selectedActions.filter((item) => item !== action)
      : [...selectedActions, action];
    setEntryActions(next.join(","));
  };
  const selectedContent = contentOptions.find((item) => item.id === contentId);
  const selectedMoment = momentOptions.find((item) => item.id === momentId);

  return (
    <section className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("o2oLink.eyebrow")}</p>
        <h3 className="mt-3 font-serif text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-foreground sm:text-5xl">{t("o2oLink.title")}</h3>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          {t("o2oLink.subtitle")}
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,.9fr)_minmax(24rem,1.1fr)]">
        <div className="rounded-[2rem] border border-border/60 bg-card/55 p-6 sm:p-8">
          {optionsQuery.isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("o2oLink.storyLabel")}</Label>
                <Select value={contentId} onValueChange={setContentId}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder={t("o2oLink.storyPh")} />
                  </SelectTrigger>
                  <SelectContent>
                    {contentOptions.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("o2oLink.momentLabel")}</Label>
                <Select value={momentId} onValueChange={setMomentId}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder={t("o2oLink.momentPh")} />
                  </SelectTrigger>
                  <SelectContent>
                    {momentOptions.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("o2oLink.doLabel")}</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {actionOptions.map((action) => {
                    const active = selectedActions.includes(action.id);
                    return (
                      <button key={action.id} type="button" aria-pressed={active} onClick={() => toggleAction(action.id)} className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/50"}`}>
                        <action.icon className="h-4 w-4" /> {t(action.key)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("o2oLink.unlockLabel")}</Label>
                <Input className="h-12 rounded-xl" value={unlockSummary} onChange={(e) => setUnlockSummary(e.target.value)} placeholder={t("o2oLink.unlockPh")} />
              </div>

              <Button
                className="h-12 w-full rounded-full font-black"
                onClick={() => createLink.mutate()}
                disabled={!contentId || !momentId || createLink.isPending}
              >
                <Link2 className="mr-2 h-4 w-4" />
                {t("o2oLink.connect")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,.24)] sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">{t("o2oLink.path")}</p>
            <div className="mt-5 space-y-3">
              {[
                { label: t("o2oLink.pathStory"), value: selectedContent?.title || t("o2oLink.chooseStory"), icon: PlayCircle },
                { label: t("o2oLink.pathAction"), value: selectedActions.length ? selectedActions.map((item) => actionLabel(item)).join(" · ") : t("o2oLink.chooseDo"), icon: ArrowRight },
                { label: t("o2oLink.pathMoment"), value: selectedMoment?.title || t("o2oLink.chooseLead"), icon: MapPin },
                { label: t("o2oLink.pathProof"), value: selectedActions.includes("check_in") ? t("o2oLink.verifiedCheckin") : t("o2oLink.trackedDone"), icon: ShieldCheck },
                { label: t("o2oLink.pathUnlock"), value: unlockSummary || t("o2oLink.defineUnlock"), icon: Gift },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 border-b border-white/10 py-3 last:border-b-0">
                  <item.icon className="h-4 w-4 shrink-0 text-orange-400" />
                  <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-wider text-white/35">{item.label}</p><p className="truncate text-sm font-semibold text-white/90">{item.value}</p></div>
                </div>
              ))}
            </div>
          </div>
        <div className="rounded-[2rem] border border-border/60 bg-card/55 p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("o2oLink.inMotion")}</p>
          </div>
          <div className="mt-5 space-y-3">
            {linksQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-2xl" />)
            ) : (linkedItems.length ? (
              linkedItems.map((item) => (
                <div key={item.id} className="border-b border-border/60 py-4 last:border-b-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{item.content?.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{t("o2oLink.linkedTo", { title: item.moment?.title || "" })}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border border-primary/20">
                      {Number(item.o2o_conversion_rate || 0).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                {t("o2oLink.empty")}
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
