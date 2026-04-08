import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type BucketType = "moment-images" | "avatars";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (
    file: File,
    bucket: BucketType,
    userId: string
  ): Promise<string | null> => {
    if (!file) return null;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, WebP, or GIF image.",
        variant: "destructive",
      });
      return null;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
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
