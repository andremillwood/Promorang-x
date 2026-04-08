import { useState, useRef } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  value?: string | null;
  fallback: string;
  onChange: (url: string | null) => void;
  onFileSelect: (file: File) => void;
  uploading?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AvatarUpload({
  value,
  fallback,
  onChange,
  onFileSelect,
  uploading = false,
  size = "lg",
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative group"
      >
        <Avatar className={cn(sizeClasses[size], "border-4 border-background shadow-card")}>
          <AvatarImage src={value || undefined} alt="Avatar" />
          <AvatarFallback className="text-2xl font-semibold bg-gradient-primary text-primary-foreground">
            {fallback}
          </AvatarFallback>
        </Avatar>

        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-charcoal/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
            uploading && "opacity-100"
          )}
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-primary-foreground" />
          )}
        </div>
      </button>

      {value && !uploading && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute -top-1 -right-1 w-6 h-6"
          onClick={handleRemove}
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
