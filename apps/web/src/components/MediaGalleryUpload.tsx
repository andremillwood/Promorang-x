import { useRef } from "react";
import { ImagePlus, GripVertical, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type GalleryImage = {
  url: string;
  alt?: string;
  caption?: string;
  media_type?: "image" | "video";
};

type MediaGalleryUploadProps = {
  value: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  onFilesSelect: (files: File[]) => void;
  uploading?: boolean;
  className?: string;
  maxItems?: number;
};

export function MediaGalleryUpload({
  value,
  onChange,
  onFilesSelect,
  uploading = false,
  className,
  maxItems = 10,
}: MediaGalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const images = Array.isArray(value) ? value : [];

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).slice(0, Math.max(maxItems - images.length, 0));
    if (files.length > 0) onFilesSelect(files);
    event.target.value = "";
  };

  const updateItem = (index: number, patch: Partial<GalleryImage>) => {
    onChange(images.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const removeItem = (index: number) => {
    onChange(images.filter((_, itemIndex) => itemIndex !== index));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= images.length) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    onChange(next);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        disabled={uploading || images.length >= maxItems}
        onChange={handleFiles}
      />

      {images.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((image, index) => (
            <div key={`${image.url}-${index}`} className="rounded-xl border border-border bg-background p-3">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                <img src={image.url} alt={image.alt || image.caption || ""} className="h-full w-full object-cover" />
                <div className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-bold text-white">
                  {index + 1}
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <Input
                  value={image.caption || ""}
                  onChange={(event) => updateItem(index, { caption: event.target.value, alt: event.target.value })}
                  placeholder="Caption or alt text"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                    <Button type="button" variant="outline" size="sm" disabled={index === 0} onClick={() => moveItem(index, -1)}>
                      Up
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled={index === images.length - 1} onClick={() => moveItem(index, 1)}>
                      Down
                    </Button>
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/50 hover:bg-muted/50"
        >
          <ImagePlus className="h-7 w-7 text-primary" />
          <div className="text-center">
            <p className="font-medium text-foreground">Add supporting images</p>
            <p className="text-sm text-muted-foreground">Upload event stills, menu shots, room images, merch, or screenshots.</p>
          </div>
        </button>
      )}

      {images.length > 0 && images.length < maxItems ? (
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload className="mr-2 h-4 w-4" />
          Add Images
        </Button>
      ) : null}
    </div>
  );
}
