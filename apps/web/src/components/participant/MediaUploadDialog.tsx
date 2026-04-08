import { useState, useCallback } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUploadMedia } from "@/hooks/useUGC";

interface MediaUploadDialogProps {
  momentId: string;
  trigger?: React.ReactNode;
}

export function MediaUploadDialog({ momentId, trigger }: MediaUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const uploadMedia = useUploadMedia();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  }, [preview]);

  const handleSubmit = async () => {
    if (!file) return;

    await uploadMedia.mutateAsync({
      momentId,
      file,
      caption: caption.trim() || undefined,
    });

    // Reset and close
    handleRemoveFile();
    setCaption("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Camera className="w-4 h-4 mr-2" />
            Add Photo/Video
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Moment</DialogTitle>
          <DialogDescription>
            Upload a photo or video from this moment to earn points
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          {!file ? (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <input
                type="file"
                id="media-upload"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="media-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Click to upload</p>
                  <p className="text-sm text-muted-foreground">
                    Photos or videos up to 50MB
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden">
              {file.type.startsWith("video/") ? (
                <video
                  src={preview || undefined}
                  className="w-full h-48 object-cover"
                  controls
                />
              ) : (
                <img
                  src={preview || undefined}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemoveFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Textarea
              id="caption"
              placeholder="Describe your experience..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {caption.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || uploadMedia.isPending}
          >
            {uploadMedia.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
