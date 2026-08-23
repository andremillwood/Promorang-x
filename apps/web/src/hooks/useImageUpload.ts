import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type BucketType = "moment-images" | "avatars" | "enrichment-proofs";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (
    file: File,
    bucket: BucketType,
    userId: string,
    options: { allowVideo?: boolean } = {}
  ): Promise<string | null> => {
    if (!file) return null;

    const allowVideo = options.allowVideo === true;

    // Validate file type
    const validTypes = bucket === "enrichment-proofs"
      ? ["image/jpeg", "image/png", "image/webp", "application/pdf"]
      : allowVideo
      ? ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"]
      : ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: allowVideo
          ? "Please upload a JPEG, PNG, WebP, GIF, MP4, WebM, or MOV file."
          : bucket === "enrichment-proofs"
            ? "Please upload a JPEG, PNG, WebP, or PDF proof file."
            : "Please upload a JPEG, PNG, WebP, or GIF image.",
        variant: "destructive",
      });
      return null;
    }

    // Validate file size
    const maxSize = allowVideo ? 50 * 1024 * 1024 : bucket === "enrichment-proofs" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: allowVideo
          ? "Please upload media smaller than 50MB."
          : "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (url: string, bucket: BucketType): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlParts = url.split(`${bucket}/`);
      if (urlParts.length < 2) return false;

      const filePath = urlParts[1];

      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) throw error;

      return true;
    } catch (error: any) {
      console.error("Delete error:", error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
  };
}
