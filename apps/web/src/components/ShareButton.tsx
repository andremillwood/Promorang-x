import { Share2, Copy, Check, Twitter, Facebook, Linkedin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
}

export function ShareButton({ title, description, url, imageUrl }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = url || window.location.href;
  const shareText = description 
    ? `${title} - ${description.slice(0, 100)}${description.length > 100 ? '...' : ''}`
    : title;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        console.log("Share cancelled or failed");
      }
    } else {
      handleCopyLink();
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
  };

  const openShareLink = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {typeof navigator.share === "function" && (
          <>
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share via...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={() => openShareLink("twitter")}>
          <Twitter className="w-4 h-4 mr-2" />
          Twitter / X
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => openShareLink("facebook")}>
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => openShareLink("linkedin")}>
          <Linkedin className="w-4 h-4 mr-2" />
          LinkedIn
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => openShareLink("whatsapp")}>
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-emerald-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
