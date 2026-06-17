import { ChangeEvent, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MediaGalleryUpload, type GalleryImage } from "@/components/MediaGalleryUpload";
import { useToast } from "@/hooks/use-toast";
import { Film, ImagePlus, Link2, Loader2, Sparkles, Upload } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const platformOptions = ["youtube", "instagram", "tiktok", "podcast", "external"];

type CreatorMissionPublisherProps = {
  onPublished?: (content: { id: string; title?: string | null }) => void;
};

export function CreatorMissionPublisher({ onPublished }: CreatorMissionPublisherProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [platform, setPlatform] = useState("youtube");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platformUrl, setPlatformUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

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
          thumbnail_url: mediaUrl || null,
          banner_image_url: bannerImageUrl || null,
          gallery_images: galleryImages,
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
    onSuccess: (content) => {
      toast({
        title: "Content published",
        description: "Your story can stand alone, launch a moment, or become a mission when you are ready.",
      });
      setTitle("");
      setDescription("");
      setPlatformUrl("");
      setMediaUrl("");
      setBannerImageUrl("");
      setGalleryImages([]);
      queryClient.invalidateQueries({ queryKey: ["o2o-manage-options"] });
      queryClient.invalidateQueries({ queryKey: ["o2o-my-links"] });
      queryClient.invalidateQueries({ queryKey: ["creator-o2o-summary"] });
      queryClient.invalidateQueries({ queryKey: ["creator-content-library"] });
      if (content?.id) {
        onPublished?.({ id: String(content.id), title: content.title });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Publish failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const publisherReady = useMemo(() => Boolean(title && platformUrl), [title, platformUrl]);

  const uploadContentImage = async (file: File) => {
    if (!session?.access_token) return null;
    const fileData = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(fileData).reduce((acc, byte) => acc + String.fromCharCode(byte), "")
    );

    const response = await fetch(`${API_URL}/api/content/upload-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type || "image/jpeg",
        fileData: base64,
      }),
    });

    const payload = await response.json();
    if (!response.ok || !payload?.imageUrl) {
      throw new Error(payload?.error || "Failed to upload image");
    }

    return payload.imageUrl as string;
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>, target: "thumbnail" | "banner" = "thumbnail") => {
    const file = event.target.files?.[0];
    if (!file || !session?.access_token) return;

    setUploadingImage(true);
    try {
      const imageUrl = await uploadContentImage(file);
      if (target === "banner") setBannerImageUrl(imageUrl || "");
      else setMediaUrl(imageUrl || "");
      toast({
        title: "Image uploaded",
        description: target === "banner" ? "Your mission banner image is ready." : "Your content preview image is ready.",
      });
    } catch (error) {
      toast({
        title: "Image upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleGalleryUpload = async (files: File[]) => {
    if (!files.length) return;
    setUploadingImage(true);
    try {
      const uploaded = await Promise.all(files.map(uploadContentImage));
      setGalleryImages((prev) => [
        ...prev,
        ...uploaded.filter(Boolean).map((url) => ({ url: url as string, media_type: "image" as const })),
      ]);
    } catch (error) {
      toast({
        title: "Gallery upload failed",
        description: error instanceof Error ? error.message : "Failed to upload gallery images",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Creator Publishing</p>
        <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">Publish a story</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Start with the story itself. It can live on its own, launch a release moment, support an existing gathering, or become a mission that moves people into the world.
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
              <div className="flex items-center justify-between gap-3">
                <Label>Preview Image</Label>
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  <Upload className="h-3.5 w-3.5" />
                  Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageUpload(event, "thumbnail")} />
                </label>
              </div>
              <Input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://..." />
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                {uploadingImage ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading preview image...
                  </div>
                ) : mediaUrl ? (
                  <div className="space-y-3">
                    <img
                      src={mediaUrl}
                      alt="Content preview"
                      className="h-40 w-full rounded-xl object-cover"
                    />
                    <p className="text-xs text-muted-foreground">
                      This image will be used as the mission preview in discovery and creator surfaces.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <ImagePlus className="h-4 w-4 text-primary" />
                    Add a preview image by URL or upload to make the story more legible in feeds and missions.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label>Mission Banner Image</Label>
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  <Upload className="h-3.5 w-3.5" />
                  Upload Banner
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageUpload(event, "banner")} />
                </label>
              </div>
              <Input value={bannerImageUrl} onChange={(e) => setBannerImageUrl(e.target.value)} placeholder="https://..." />
              {bannerImageUrl ? (
                <img src={bannerImageUrl} alt="Mission banner preview" className="h-32 w-full rounded-xl object-cover" />
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Supporting Images</Label>
              <MediaGalleryUpload
                value={galleryImages}
                onChange={setGalleryImages}
                onFilesSelect={handleGalleryUpload}
                uploading={uploadingImage}
              />
            </div>

            <Button
              variant="hero"
              className="w-full"
              onClick={() => createContent.mutate()}
              disabled={!publisherReady || createContent.isPending || uploadingImage}
            >
              {createContent.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Film className="mr-2 h-4 w-4" />}
              Publish Story
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
              "Publish a story people can watch, share, save, and come back to.",
              "Let it stand alone, use it to launch a moment, or pair it with an existing place or gathering.",
              "Turn the story into a mission when you want watch, join, visit, redeem, or proof behavior.",
              "Track attention, joins, unlocks, memories, and creator earnings from the same story spine.",
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
              After publishing, choose the next shape: keep it as a story, create a launch moment from it, or use the Mission Builder below to connect it to an active moment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
