import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  onFileSelect: (file: File) => void;
  uploading?: boolean;
  className?: string;
  aspectRatio?: "square" | "video" | "banner";
  frameUrl?: string;
}

export function ImageUpload({
  value,
  onChange,
  onFileSelect,
  uploading = false,
  className,
  aspectRatio = "video",
  frameUrl,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    banner: "aspect-[21/9]",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onFileSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {preview || value ? (
        <div
          className={cn(
            "relative rounded-xl overflow-hidden border border-border",
            aspectClasses[aspectRatio]
          )}
        >
          <img
            src={preview || value}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
          {frameUrl && (
            <img
              src={frameUrl}
              alt="AR Frame"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 opacity-80"
            />
          )}
          {!uploading && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "w-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors",
            "flex flex-col items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50",
            aspectClasses[aspectRatio]
          )}
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Click to upload</p>
            <p className="text-sm text-muted-foreground">
              JPEG, PNG, WebP or GIF (max 5MB)
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
