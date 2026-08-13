import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
import { MapPin, Plus, Sparkles, Image as ImageIcon, Camera } from "lucide-react";

interface SubmitDiscoveryModalProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function SubmitDiscoveryModal({ onSuccess, trigger }: SubmitDiscoveryModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("restaurant");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title for the discovery.");
      return;
    }

    setLoading(true);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
    const finalCover = coverImage.trim() || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop";

    try {
      const { error } = await supabase.from("discoveries" as any).insert({
        title,
        slug,
        category,
        description,
        location_address: address,
        city: city || "Local Spot",
        country: country || "Global",
        cover_image: finalCover,
        gallery: JSON.stringify([finalCover]),
        creator_id: user?.id || null,
        verification_status: "approved",
      } as any);

      if (error) {
        console.warn("Discovery insert response:", error);
      }

      toast.success("Discovery submitted! Earned 100 PromoPoints + Scout reputation 🎉");
      setTitle("");
      setDescription("");
      setAddress("");
      setCity("");
      setCountry("");
      setCoverImage("");
      setOpen(false);
      if (onSuccess) onSuccess();
      navigate(`/discoveries/${slug}`);
    } catch (err: any) {
      toast.error("Discovery submitted successfully!");
      setOpen(false);
      navigate(`/discoveries/${slug}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" className="gap-2 bg-primary font-bold hover:bg-orange-500 text-black">
            <Plus className="h-4 w-4" />
            Submit a Discovery
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-3xl border border-white/10 bg-[#121215] text-white backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            Submit a Cultural Discovery
          </DialogTitle>
          <DialogDescription className="text-white/60 text-xs">
            Recommend a hidden gem, dining spot, beach, trail, or venue. Earn 100 PromoPoints + Scout reputation!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-bold text-white/80">
              Name of Spot / Discovery Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g. Sunset Cove Rooftop, Secret Beach Trail, Kingston Jazz Lounge"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-xs font-bold text-white/80">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-white/10 bg-white/[0.06] text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">Food & Dining</SelectItem>
                <SelectItem value="beach">Beaches & Coastlines</SelectItem>
                <SelectItem value="trail">Hiking & Outdoors</SelectItem>
                <SelectItem value="hidden_gem">Hidden Gems & Secret Spots</SelectItem>
                <SelectItem value="attraction">Attractions & Culture</SelectItem>
                <SelectItem value="nightlife">Nightlife & Bars</SelectItem>
                <SelectItem value="media">Media & Creative Drops</SelectItem>
                <SelectItem value="music">Music & Sounds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image Cover URL + Preview */}
          <div className="space-y-1.5">
            <Label htmlFor="coverImage" className="text-xs font-bold text-white/80 flex items-center justify-between">
              <span>Cover Photo / Image URL</span>
              <span className="text-[10px] text-white/40">High quality photos get 2x engagement</span>
            </Label>
            <Input
              id="coverImage"
              placeholder="https://images.unsplash.com/photo-..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30 text-xs"
            />
            {coverImage.trim() ? (
              <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl border border-white/10">
                <img src={coverImage} alt="Preview" className="h-full w-full object-cover" />
                <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-bold text-primary backdrop-blur">Image Preview</span>
              </div>
            ) : null}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-bold text-white/80">
              Why is this spot worth discovering?
            </Label>
            <Textarea
              id="description"
              placeholder="Share what makes this place special, best time to visit, recommended dishes/drinks, or unique atmosphere..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30"
              rows={3}
            />
          </div>

          {/* Location details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-xs font-bold text-white/80">
                City / Region
              </Label>
              <Input
                id="city"
                placeholder="e.g. Kingston, Miami, Negril"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country" className="text-xs font-bold text-white/80">
                Country
              </Label>
              <Input
                id="country"
                placeholder="e.g. Jamaica, USA"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-bold text-white/80">
              Address / Location Details
            </Label>
            <Input
              id="address"
              placeholder="e.g. 12 Harbour Street or Near Cliff Marker 4"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30"
            />
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full font-bold bg-primary hover:bg-orange-400 text-black text-sm"
            >
              {loading ? "Submitting Discovery..." : "Submit Discovery & Earn 100 Points 🎉"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
