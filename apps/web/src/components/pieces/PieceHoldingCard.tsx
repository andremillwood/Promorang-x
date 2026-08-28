import { Link } from "react-router-dom";
import { ArrowUpRight, Crown, Layers3 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PieceHoldingView {
  id: string;
  type: "content" | "moment" | "host" | "venue";
  assetId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  quantity: number;
  marketValue: number;
  gain: number;
  unclaimed: number;
  lifetime: number;
  isOwner?: boolean;
}

const typeColor = { content: "from-violet-500/70", moment: "from-orange-500/70", host: "from-cyan-500/70", venue: "from-emerald-500/70" };

export function PieceHoldingCard({ piece }: { piece: PieceHoldingView }) {
  const href = `/pieces/${piece.type}/${piece.assetId}`;
  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-[#111113] shadow-[0_22px_70px_rgba(0,0,0,.22)]">
      <Link to={href} className="relative block aspect-[16/10] overflow-hidden bg-[#19191c]">
        {piece.imageUrl ? <img src={piece.imageUrl} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className={cn("grid h-full place-items-center bg-gradient-to-br to-transparent", typeColor[piece.type])}><Layers3 className="h-12 w-12 text-white/60" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.18em] text-white backdrop-blur">{piece.type} piece</span>
          {piece.isOwner && <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/25 bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold text-amber-200 backdrop-blur"><Crown className="h-3 w-3" /> Creator</span>}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/55">You hold {piece.quantity} Pieces</p><h3 className="mt-1 line-clamp-2 text-xl font-black leading-6 text-white">{piece.title}</h3></div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-black"><ArrowUpRight className="h-4 w-4" /></span>
        </div>
      </Link>
      <div className="p-5">
        {piece.description && <p className="line-clamp-2 min-h-10 text-sm leading-5 text-white/52">{piece.description}</p>}
        <div className="mt-5 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/8 bg-white/[.025] py-3">
          <Metric label="Current value" value={`$${piece.marketValue.toFixed(2)}`} />
          <Metric label="Change" value={`${piece.gain >= 0 ? "+" : "−"}$${Math.abs(piece.gain).toFixed(2)}`} positive={piece.gain >= 0} />
          <Metric label="Ready" value={`$${piece.unclaimed.toFixed(2)}`} positive={piece.unclaimed > 0} />
        </div>
        <div className="mt-4 flex items-center justify-between text-xs"><span className="text-white/40">Lifetime distributions</span><span className="font-bold text-white/72">${piece.lifetime.toFixed(2)}</span></div>
      </div>
    </article>
  );
}

function Metric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return <div className="px-3"><p className="text-[9px] font-bold uppercase tracking-[.12em] text-white/38">{label}</p><p className={cn("mt-1 text-sm font-black text-white", positive && "text-emerald-300")}>{value}</p></div>;
}
