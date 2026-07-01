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
import { Link2, Sparkles, ArrowRight, ShieldCheck, Gift, PlayCircle, Share2, MessageCircle, MapPin } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const actionOptions = [
  { id: "watch", label: "Watch", icon: PlayCircle },
  { id: "share", label: "Share", icon: Share2 },
  { id: "comment", label: "Comment", icon: MessageCircle },
  { id: "join", label: "Join", icon: Sparkles },
  { id: "check_in", label: "Check in", icon: MapPin },
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
      if (!response.ok) throw new Error(payload?.error || "Failed to load O2O options");
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
      if (!response.ok) throw new Error(payload?.error || "Failed to load O2O links");
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
      if (!response.ok) throw new Error(payload?.error || "Failed to create O2O link");
      return payload;
    },
    onSuccess: () => {
      toast({ title: "Mission link created", description: "Your story is now connected to a live moment for verified action." });
      setUnlockSummary("");
      queryClient.invalidateQueries({ queryKey: ["o2o-my-links"] });
      queryClient.invalidateQueries({ queryKey: ["creator-o2o-summary"] });
      onLinkCreated?.();
    },
    onError: (error: Error) => {
      toast({ title: "Link creation failed", description: error.message, variant: "destructive" });
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
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Mission Builder</p>
        <h3 className="mt-2 text-3xl font-black tracking-tight text-foreground">Give the story somewhere meaningful to lead.</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Pair a story with an existing moment when the next step should be watch, join, visit, redeem, or prove. Stories can still stand alone or launch new moments.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-border bg-card p-5 sm:p-7">
          {optionsQuery.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Story</Label>
                <Select value={contentId} onValueChange={setContentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content" />
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
                <Label>Where should it lead?</Label>
                <Select value={momentId} onValueChange={setMomentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select moment" />
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
                <Label>What should people do?</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {actionOptions.map((action) => {
                    const active = selectedActions.includes(action.id);
                    return (
                      <button key={action.id} type="button" onClick={() => toggleAction(action.id)} className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm font-semibold transition ${active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/50"}`}>
                        <action.icon className="h-4 w-4" /> {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>What becomes available after proof?</Label>
                <Input value={unlockSummary} onChange={(e) => setUnlockSummary(e.target.value)} placeholder="Founder access, a return offer, status, or a saved memory..." />
              </div>

              <Button
                className="h-12 w-full font-black"
                onClick={() => createLink.mutate()}
                disabled={!contentId || !momentId || createLink.isPending}
              >
                <Link2 className="mr-2 h-4 w-4" />
                Publish mission link <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border border-primary/25 bg-primary/5 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Participant path preview</p>
            <div className="mt-5 space-y-3">
              {[
                { label: "Story", value: selectedContent?.title || "Choose a published story", icon: PlayCircle },
                { label: "Action", value: selectedActions.length ? selectedActions.map((item) => item.replaceAll("_", " ")).join(" · ") : "Choose what people do", icon: ArrowRight },
                { label: "Moment", value: selectedMoment?.title || "Choose where the story leads", icon: MapPin },
                { label: "Proof", value: selectedActions.includes("check_in") ? "Verified check-in" : "Tracked completion", icon: ShieldCheck },
                { label: "Unlock", value: unlockSummary || "Define what completion opens", icon: Gift },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-md border border-border/60 bg-background/70 p-3">
                  <item.icon className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p><p className="truncate text-sm font-semibold text-foreground">{item.value}</p></div>
                </div>
              ))}
            </div>
          </div>
        <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Linked Missions</p>
          </div>
          <div className="mt-5 space-y-3">
            {linksQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-2xl" />)
            ) : (linkedItems.length ? (
              linkedItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{item.content?.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Linked to {item.moment?.title}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border border-primary/20">
                      {Number(item.o2o_conversion_rate || 0).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                No mission links yet. Pair a story with an active moment when you want O2O tracking, or launch a new moment from the story first.
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
