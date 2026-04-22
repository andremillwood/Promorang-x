import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link2, Sparkles } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function O2OLinkManager() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [contentId, setContentId] = useState("");
  const [momentId, setMomentId] = useState("");
  const [entryActions, setEntryActions] = useState("watch,share");
  const [unlockSummary, setUnlockSummary] = useState("");

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
      toast({ title: "O2O link created", description: "Your content mission is now connected to a live moment." });
      setUnlockSummary("");
      queryClient.invalidateQueries({ queryKey: ["o2o-my-links"] });
      queryClient.invalidateQueries({ queryKey: ["creator-o2o-summary"] });
    },
    onError: (error: Error) => {
      toast({ title: "Link creation failed", description: error.message, variant: "destructive" });
    },
  });

  const contentOptions = useMemo(() => optionsQuery.data?.content_items || [], [optionsQuery.data]);
  const momentOptions = useMemo(() => optionsQuery.data?.moments || [], [optionsQuery.data]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Mission Builder</p>
        <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">Link content to moments</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Build watch-and-unlock missions by pairing a content asset with a physical moment you host.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          {optionsQuery.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Content Asset</Label>
                <Select value={contentId} onValueChange={setContentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentOptions.map((item: any) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Linked Moment</Label>
                <Select value={momentId} onValueChange={setMomentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select moment" />
                  </SelectTrigger>
                  <SelectContent>
                    {momentOptions.map((item: any) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Entry Actions</Label>
                <Input value={entryActions} onChange={(e) => setEntryActions(e.target.value)} placeholder="watch, share, comment" />
              </div>

              <div className="space-y-2">
                <Label>Unlock Summary</Label>
                <Input value={unlockSummary} onChange={(e) => setUnlockSummary(e.target.value)} placeholder="Watch the story, then check in on-site..." />
              </div>

              <Button
                variant="hero"
                className="w-full"
                onClick={() => createLink.mutate()}
                disabled={!contentId || !momentId || createLink.isPending}
              >
                <Link2 className="mr-2 h-4 w-4" />
                Create Mission Link
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Linked Missions</p>
          </div>
          <div className="mt-5 space-y-3">
            {linksQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-2xl" />)
            ) : (linksQuery.data?.length ? (
              linksQuery.data.map((item: any) => (
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
                No mission links yet. Pair one of your content assets with a hosted moment to start O2O tracking.
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
