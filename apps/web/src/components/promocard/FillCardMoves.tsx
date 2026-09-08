import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { fillCardHref, fillCardMoves, type PromoCardAim } from "@promorang/shared";
import { useExperiencePath } from "@/hooks/useExperiencePath";

type FillCardMovesProps = {
  aim?: PromoCardAim | null;
  authenticated?: boolean;
};

function experienceAwarePath(path: string, to: (value: string) => string): string {
  const [base, qs] = path.split("?");
  if (base.startsWith("/discover") || base.startsWith("/auth")) return path;
  const dest = to(base);
  return qs ? `${dest}?${qs}` : dest;
}

export function FillCardMoves({ aim, authenticated }: FillCardMovesProps) {
  const to = useExperiencePath();
  const moves = fillCardMoves(aim);
  return (
    <nav aria-label="Ways to fill your card" className="mt-4 grid gap-2 sm:grid-cols-2">
      {moves.map((move) => {
        const href = fillCardHref(experienceAwarePath(move.path, to), authenticated);
        return (
          <Link
            key={move.id}
            to={href}
            className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-left hover:border-amber-300/40"
          >
            <p className="text-sm font-black text-white">{move.label}</p>
            <p className="mt-1 text-xs leading-5 text-white/50">{move.detail}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">
              Continue
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
