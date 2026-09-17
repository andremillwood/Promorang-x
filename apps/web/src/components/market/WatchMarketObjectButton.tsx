import { Bell, BellRing, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSavedMarketObjects, type SaveMarketObjectInput } from "@/hooks/useSavedMarketObjects";

type WatchMarketObjectButtonProps = SaveMarketObjectInput & {
  compact?: boolean;
  className?: string;
};

export function WatchMarketObjectButton({ compact = false, className, ...object }: WatchMarketObjectButtonProps) {
  const { toast } = useToast();
  const saved = useSavedMarketObjects();
  const watching = saved.isSaved(object.type, object.id);

  async function toggle() {
    try {
      const result = await saved.toggle(object);
      if (result.redirected) return;
      toast({
        title: result.saved ? "Watching on your PromoCard" : "Removed from watch",
        description: result.saved
          ? "PROMORANG can now keep this relationship visible when you return."
          : "This is no longer in your watched market objects.",
      });
    } catch (error) {
      toast({
        title: "Could not update your watch",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saved.toggling}
      data-resumable-intent="market_watch"
      data-resumable-target={`${object.type}:${object.id}`}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 text-xs font-black transition disabled:opacity-50",
        watching
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-white/15 bg-white/[0.04] text-white/75 hover:border-primary/35 hover:text-white",
        compact && "min-h-9 px-3 text-[11px]",
        className,
      )}
      aria-pressed={watching}
      aria-label={`${watching ? "Stop watching" : "Watch"} ${object.title}`}
    >
      {saved.toggling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : watching ? <BellRing className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
      {watching ? "Watching" : compact ? "Watch" : "Watch on PromoCard"}
    </button>
  );
}

export default WatchMarketObjectButton;
