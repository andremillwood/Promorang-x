import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Film, Link2, Sparkles } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const platformOptions = ["youtube", "instagram", "tiktok", "podcast", "external"];

export function CreatorMissionPublisher() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [platform, setPlatform] = useState("youtube");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platformUrl, setPlatformUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  const createContent = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/api/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          platform,
          title,
          description,
          platform_url: platformUrl,
          media_url: mediaUrl || null,
          total_shares: 100,
          share_price: 0,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to publish content");
      }
      return payload?.content;
    },
    onSuccess: () => {
      toast({
        title: "Content published",
        description: "Your content is now available to attach to a mission and measure for O2O conversion.",
      });
      setTitle("");
      setDescription("");
      setPlatformUrl("");
      setMediaUrl("");
      queryClient.invalidateQueries({ queryKey: ["o2o-manage-options"] });
      queryClient.invalidateQueries({ queryKey: ["o2o-my-links"] });
      queryClient.invalidateQueries({ queryKey: ["creator-o2o-summary"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Publish failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Creator Publishing</p>
        <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">Publish a content moment</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create the digital story first. Then attach it to a physical moment so participants can watch, join, check in, and unlock a memory.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sydney Secret: The Hidden Roast Route" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell participants what the mission is, what they should watch for, and what unlocks in the real world."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Platform</Label>
              <div className="flex flex-wrap gap-2">
                {platformOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPlatform(option)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                      platform === option
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/20"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Platform URL</Label>
              <Input value={platformUrl} onChange={(e) => setPlatformUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            </div>

            <div className="space-y-2">
              <Label>Preview Image URL</Label>
              <Input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://..." />
            </div>

            <Button
              variant="hero"
              className="w-full"
              onClick={() => createContent.mutate()}
              disabled={!title || !platformUrl || createContent.isPending}
            >
              <Film className="mr-2 h-4 w-4" />
              Publish Content Moment
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">How creators fit the loop</p>
          </div>
          <div className="mt-5 space-y-4">
            {[
              "Publish a digital story that carries the mission and sets the tone.",
              "Attach that story to a real-world moment or gathering.",
              "Let participants join through the story, then verify in person.",
              "Track joins, unlocks, memories, and creator earnings from the same mission.",
            ].map((step, index) => (
              <div key={step} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-start gap-3">
                  <Badge className="bg-primary/10 text-primary border border-primary/20">{index + 1}</Badge>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
              <Link2 className="mb-2 h-4 w-4 text-primary" />
              After publishing, use the Mission Builder below to connect the content to a live moment and activate Watch & Unlock.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
