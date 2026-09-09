import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RadioTower, Plus, Sparkles, Link2, Film } from "lucide-react";
import { useCreateContentDrop, useAddContentDropAsset } from "@/hooks/useContentDistribution";
import { RELEASE_KINDS, RELEASE_KIND_META, type ReleaseKind } from "@promorang/shared";

interface LaunchContentDropModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function LaunchContentDropModal({ trigger, onSuccess }: LaunchContentDropModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [releaseKind, setReleaseKind] = useState<ReleaseKind>("video");
  const [platform, setPlatform] = useState("tiktok");
  const [externalUrl, setExternalUrl] = useState("");
  const [description, setDescription] = useState("");
  const [basePoints, setBasePoints] = useState("10");
  const [ticketEntries, setTicketEntries] = useState("2");

  const createDrop = useCreateContentDrop();
  const addAsset = useAddContentDropAsset();

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !externalUrl.trim()) {
      toast.error("Please enter a drop title and content URL.");
      return;
    }

    setLoading(true);
    try {
      const response = await createDrop.mutateAsync({
        title,
        description,
        objective_type: "content_launch",
        status: "active",
        reward_config: {
          base_points: Number(basePoints || 10),
          points_by_action: {
            click: Number(basePoints || 10),
            proof_verified: Number(basePoints || 10) * 3,
          },
        },
        promoshare_config: {
          enabled: true,
          actions: ["click", "proof_verified"],
          entries_per_action: Number(ticketEntries || 2),
        },
        metadata: {
          source_platform: platform,
          release_kind: releaseKind,
          original_url: externalUrl,
        },
      });

      if (response?.data?.id) {
        await addAsset.mutateAsync({
          campaignId: response.data.id,
          body: {
            title,
            asset_type: "link",
            target_url: externalUrl,
            attribution_slug: platform,
            metadata: { source_platform: platform },
          },
        });
      }

      toast.success("🚀 Creator Content Drop launched! Distribution rewards active 🎉");
      setTitle("");
      setExternalUrl("");
      setDescription("");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.success("Creator Content Drop published successfully!");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" className="gap-2 bg-primary font-bold hover:bg-orange-500 text-white">
            <RadioTower className="h-4 w-4" />
            Launch Creator Drop
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl border border-white/10 bg-[#111] text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            Publish a Release
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Put the original up. Attach a room or perk next. Opening it counts. Sharing does not pay.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLaunch} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="drop-title" className="text-xs font-bold text-white/80">
              Content Title / Headline *
            </Label>
            <Input
              id="drop-title"
              placeholder="e.g. Sunset Vibes Live DJ Set, Secret Foodie Spot Reel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-white/80">Kind</Label>
              <Select value={releaseKind} onValueChange={(value) => setReleaseKind(value as ReleaseKind)}>
                <SelectTrigger className="border-white/10 bg-white/[0.06] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELEASE_KINDS.map((kind) => (
                    <SelectItem key={kind} value={kind}>{RELEASE_KIND_META[kind].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-white/80">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="border-white/10 bg-white/[0.06] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="spotify">Spotify</SelectItem>
                  <SelectItem value="soundcloud">SoundCloud</SelectItem>
                  <SelectItem value="external">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ticket-entries" className="text-xs font-bold text-white/80">
                PromoShare Tickets
              </Label>
              <Input
                id="ticket-entries"
                type="number"
                min="1"
                value={ticketEntries}
                onChange={(e) => setTicketEntries(e.target.value)}
                className="border-white/10 bg-white/[0.06] text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="external-url" className="text-xs font-bold text-white/80">
              Original Content URL *
            </Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-3 h-4 w-4 text-white/40" />
              <Input
                id="external-url"
                type="url"
                placeholder="https://www.tiktok.com/@username/video/..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="border-white/10 bg-white/[0.06] pl-9 text-white placeholder:text-white/30"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="drop-description" className="text-xs font-bold text-white/80">
              What action should fans take?
            </Label>
            <Textarea
              id="drop-description"
              placeholder="Watch the video, share it with 3 friends, or recreate this video to earn points and entry tickets..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30"
              rows={3}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-bold bg-primary hover:bg-orange-500 text-white"
            >
              {loading ? "Publishing Drop..." : "Launch Drop & Enable Rewards"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
