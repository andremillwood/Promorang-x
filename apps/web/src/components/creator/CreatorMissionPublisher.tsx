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
import { Film, ImagePlus, Link2, Loader2, Upload, ArrowRight, Eye, ShieldCheck, Gift } from "lucide-react";
import { cultureImages } from "@/data/culture-demo";

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
    <section className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Shape the story</p>
        <h3 className="mt-3 font-serif text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-foreground sm:text-5xl">Give people something worth following somewhere.</h3>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Start with the story itself. It can live on its own, launch a release moment, support an existing gathering, or become a mission that moves people into the world.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)]">
        <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/55">
          <div className="space-y-6 p-6 sm:p-8">
            <div className="space-y-2">
              <Label>What is the story called?</Label>
              <Input className="h-12 rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sydney Secret: The Hidden Roast Route" />
            </div>

            <div className="space-y-2">
              <Label>Why should someone care?</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl"
                placeholder="Share the point of view, invitation, or feeling at the heart of this story."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Where does it live?</Label>
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
              <Label>Where can people experience it?</Label>
              <Input className="h-12 rounded-xl" value={platformUrl} onChange={(e) => setPlatformUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label>The image people meet first</Label>
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
                <Label>A wider image for the invitation</Label>
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
              <Label>More of the story</Label>
              <MediaGalleryUpload
                value={galleryImages}
                onChange={setGalleryImages}
                onFilesSelect={handleGalleryUpload}
                uploading={uploadingImage}
              />
            </div>

            <Button
              className="h-12 w-full rounded-full bg-primary font-black"
              onClick={() => createContent.mutate()}
              disabled={!publisherReady || createContent.isPending || uploadingImage}
            >
              {createContent.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Film className="mr-2 h-4 w-4" />}
              Publish story <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="h-fit overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0b] text-white shadow-[0_30px_90px_rgba(0,0,0,.28)] xl:sticky xl:top-28">
          <div className="relative aspect-[4/3] overflow-hidden bg-black sm:aspect-[5/4]">
            <img src={mediaUrl || bannerImageUrl || cultureImages.openMic} alt="" className="h-full w-full object-cover opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <Badge className="mb-3 bg-orange-500 text-black">{platform}</Badge>
              <h4 className="font-serif text-3xl font-semibold leading-tight">{title || "Your story appears here"}</h4>
              <p className="mt-2 line-clamp-2 text-sm text-white/60">{description || "Add the promise, point of view, or invitation that gives people a reason to care."}</p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">How people will meet it</p><p className="mt-1 text-sm text-white/50">{publisherReady ? "Ready to publish, then connect to a Moment or mission." : "Add a title and destination to continue."}</p></div>
              <Eye className="h-5 w-5 text-orange-400" />
            </div>
            <div className="mt-6 grid grid-cols-5 gap-1">
              {[
                { label: "Story", icon: Film },
                { label: "Audience", icon: Eye },
                { label: "Action", icon: ArrowRight },
                { label: "Proof", icon: ShieldCheck },
                { label: "Unlock", icon: Gift },
              ].map((stage, index) => (
                <div key={stage.label} className="text-center">
                  <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border ${index === 0 ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}><stage.icon className="h-3.5 w-3.5" /></div>
                  <p className="mt-2 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{stage.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-white/10 pt-5 text-sm leading-6 text-white/50">
              <Link2 className="mb-2 h-4 w-4 text-orange-400" />
              After publishing, the story stays selected while you choose where it should lead.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
