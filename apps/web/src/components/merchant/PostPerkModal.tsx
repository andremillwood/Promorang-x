import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Gift, Sparkles, Tag, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExperienceActions } from "@/hooks/usePeopleExperience";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { merchantPerkPostedNext } from "@promorang/shared";

type PerkKind = "discount" | "complimentary" | "merchant";

interface PostPerkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (result: { offerId?: string }) => void;
}

export const PostPerkModal: React.FC<PostPerkModalProps> = ({
  open,
  onOpenChange,
  onCreated,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { provideInventory } = useExperienceActions();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<PerkKind>("discount");
  const [quantity, setQuantity] = useState(50);
  const [youEarn, setYouEarn] = useState("Credit when someone uses it at the counter");

  const handleReset = () => {
    setTitle("");
    setQuantity(50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Say what people get.");
      return;
    }
    if (!user) {
      onOpenChange(false);
      navigate(`/auth?next=${encodeURIComponent("/stock")}`);
      return;
    }

    try {
      const result = await provideInventory.mutateAsync({
        kind,
        title: title.trim(),
        quantity,
        peopleGet: title.trim(),
        youEarn,
      });
      const offerId = result?.offer?.id || result?.opportunity?.sourceId || null;
      toast.success("Perk is live. Share it, then validate the code at the counter.");
      onCreated?.({ offerId });
      onOpenChange(false);
      handleReset();
      const next = merchantPerkPostedNext(offerId);
      navigate(next[0].href);
    } catch (error) {
      toast.error((error as Error).message || "Could not put that perk up yet.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-zinc-950 border-zinc-800 text-white p-6 sm:p-8 rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Store className="w-4 h-4" />
            <span>Put a live perk up</span>
          </div>
          <DialogTitle className="text-2xl font-black text-white">
            What can people get from you?
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            This becomes real inventory. Hosts and creators share it. Members claim it. You validate the code.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-emerald-400">
              1. What are you offering?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "discount" as PerkKind, label: "Discount", icon: Tag },
                { type: "complimentary" as PerkKind, label: "Free item", icon: Gift },
                { type: "merchant" as PerkKind, label: "Visit perk", icon: Sparkles },
              ].map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setKind(item.type)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    kind === item.type
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                      : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <Input
              placeholder="e.g. First drink on the house"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-emerald-400">
              2. How many can be used?
            </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-emerald-400">
              3. What do people who share it earn?
            </label>
            <Input
              value={youEarn}
              onChange={(e) => setYouEarn(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-emerald-500/20 text-[11px] text-zinc-300 space-y-1">
            <p className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Live inventory — not a local draft</span>
            </p>
            <p className="text-zinc-400">
              After you put it up, share the drop. The loop completes only when you record the code at the counter.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={provideInventory.isPending}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-black font-black py-3 rounded-xl shadow-lg shadow-emerald-500/20"
            >
              {provideInventory.isPending ? "Putting it up…" : "Put this perk up"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
