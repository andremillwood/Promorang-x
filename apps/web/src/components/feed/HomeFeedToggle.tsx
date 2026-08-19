import { Sparkles, Calendar, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLandingPreference } from "@/hooks/useLandingPreference";
import { cn } from "@/lib/utils";

export function HomeFeedToggle() {
  const location = useLocation();
  const { preference, setPreference } = useLandingPreference();
  const isForYou = location.pathname === "/for-you";
  const isToday = location.pathname === "/" || location.pathname === "/live";

  return (
    <div className="flex items-center justify-between border-b border-white/10 bg-black/90 px-4 py-2.5 backdrop-blur-md">
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
        <Link
          to="/"
          onClick={() => setPreference("today")}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition",
            isToday
              ? "bg-primary text-black shadow-sm"
              : "text-white/60 hover:text-white"
          )}
        >
          <Calendar className="h-3.5 w-3.5" />
          Today
        </Link>
        <Link
          to="/for-you"
          onClick={() => setPreference("for_you")}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition",
            isForYou
              ? "bg-primary text-black shadow-sm"
              : "text-white/60 hover:text-white"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          For You
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-[10px] font-semibold text-white/40 sm:inline">
          Default: <strong className="text-white/70 capitalize">{preference.replace("_", " ")}</strong>
        </span>
      </div>
    </div>
  );
}
