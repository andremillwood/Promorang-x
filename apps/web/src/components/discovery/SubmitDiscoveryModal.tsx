import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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
import { Plus, Sparkles, ShieldCheck } from "lucide-react";

interface SubmitDiscoveryModalProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export function SubmitDiscoveryModal({ onSuccess, trigger }: SubmitDiscoveryModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("restaurant");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setAddress("");
    setCity("");
    setCountry("");
    setCoverImage("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      toast.info("Sign in to propose a Discovery.");
      setOpen(false);
      navigate(`/auth?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    if (!title.trim()) {
      toast.error("Add a name for the place or Discovery.");
      return;
    }

    setLoading(true);
    const slug = `${slugify(title)}-${Date.now()}`;
    try {
      const payload = {
        title: title.trim(),
        slug,
        category,
        description: description.trim() || null,
        location_address: address.trim() || null,
        city: city.trim() || null,
        country: country.trim() || null,
        cover_image: coverImage.trim() || null,
        gallery: coverImage.trim() ? [coverImage.trim()] : [],
        creator_id: user.id,
        verification_status: "pending",
      };

      const { error } = await (supabase as any).from("discoveries").insert(payload);
      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["discoveries"] });
      toast.success("Discovery proposed for review.", {
        description: "Submission is not approval. It will appear publicly after verification.",
      });
      reset();
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Could not submit this Discovery.", {
        description: error?.message || "Please check the details and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" className="gap-2 bg-primary font-bold text-black hover:bg-orange-500">
            <Plus className="h-4 w-4" />
            Propose a Discovery
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#121215] text-white backdrop-blur-xl">
        <DialogHeader>
          <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Community knowledge
          </div>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            Propose a Discovery
          </DialogTitle>
          <DialogDescription className="text-xs leading-5 text-white/60">
            Put a place worth knowing on the map. Your submission enters review first; proposing a place does not publish, verify, reward, or create an offer automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-bold text-white/80">Name *</Label>
            <Input id="title" placeholder="Name of the place or find" value={title} onChange={(e) => setTitle(e.target.value)} className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-xs font-bold text-white/80">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-white/10 bg-white/[0.06] text-white"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">Food & Dining</SelectItem>
                <SelectItem value="beach">Beaches & Coastlines</SelectItem>
                <SelectItem value="trail">Hiking & Outdoors</SelectItem>
                <SelectItem value="hidden_gem">Hidden Gems</SelectItem>
                <SelectItem value="attraction">Attractions & Culture</SelectItem>
                <SelectItem value="nightlife">Nightlife & Bars</SelectItem>
                <SelectItem value="media">Media & Creative</SelectItem>
                <SelectItem value="music">Music & Sounds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coverImage" className="text-xs font-bold text-white/80">Photo URL <span className="font-normal text-white/40">(optional)</span></Label>
            <Input id="coverImage" placeholder="https://..." value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="border-white/10 bg-white/[0.06] text-xs text-white placeholder:text-white/30" />
            {coverImage.trim() ? <div className="mt-2 h-32 overflow-hidden rounded-xl border border-white/10"><img src={coverImage} alt="Proposal preview" className="h-full w-full object-cover" /></div> : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-bold text-white/80">Why is it worth knowing?</Label>
            <Textarea id="description" placeholder="What should someone know before deciding to go?" value={description} onChange={(e) => setDescription(e.target.value)} className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label htmlFor="city" className="text-xs font-bold text-white/80">City / Region</Label><Input id="city" placeholder="Kingston" value={city} onChange={(e) => setCity(e.target.value)} className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30" /></div>
            <div className="space-y-1.5"><Label htmlFor="country" className="text-xs font-bold text-white/80">Country</Label><Input id="country" placeholder="Jamaica" value={country} onChange={(e) => setCountry(e.target.value)} className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30" /></div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-bold text-white/80">Address / location detail</Label>
            <Input id="address" placeholder="Street, landmark, or useful location detail" value={address} onChange={(e) => setAddress(e.target.value)} className="border-white/10 bg-white/[0.06] text-white placeholder:text-white/30" />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-[11px] leading-5 text-white/55">
            <strong className="text-white/80">Truth boundary:</strong> proposed ≠ approved. Approval only means the listing passed the platform review boundary; it does not imply an offer, purchase, attendance, or endorsement.
          </div>

          <Button type="submit" disabled={loading} className="h-12 w-full rounded-full bg-primary text-sm font-bold text-black hover:bg-orange-400">
            {loading ? "Submitting..." : "Submit for review"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
