import { Link } from "react-router-dom";
import { ArrowRight, Layers3, TrendingUp, Users } from "lucide-react";
import { FeedItem } from "@/services/feed";

export function PieceFeedCard({ item }: { item: FeedItem }) {
  const raw = item.raw || {};
  const change = Number(raw.change_24h || 0);
  return <article className="relative overflow-hidden rounded-[1.75rem] border border-violet-400/20 bg-[radial-gradient(circle_at_85%_10%,rgba(139,92,246,.22),transparent_30%),linear-gradient(145deg,#0c0a13,#151022)] p-6 text-white shadow-2xl">
    <div className="absolute right-[-3rem] top-[-3rem] h-40 w-40 rounded-full border border-violet-300/15" />
    <div className="relative"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-400/15 text-violet-300"><Layers3 className="h-5 w-5" /></span><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-violet-300">Content Piece</p><p className="text-xs text-white/40">Own the momentum, not just the post</p></div></div><span className={`rounded-full px-3 py-1 text-xs font-black ${change >= 0 ? "bg-emerald-400/15 text-emerald-300" : "bg-red-400/15 text-red-300"}`}>{change >= 0 ? "+" : ""}{change.toFixed(1)}%</span></div>
    <h3 className="mt-7 max-w-2xl text-3xl font-black tracking-[-.04em]">{item.title}</h3>{item.description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">{item.description}</p> : null}
    <div className="mt-7 grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/10"><Metric label="Price" value={`$${Number(raw.current_price || 0).toFixed(2)}`} icon={TrendingUp}/><Metric label="Available" value={String(raw.available_pieces || 0)} icon={Layers3}/><Metric label="Holders" value={String(raw.holder_count || 0)} icon={Users}/></div>
    <Link to={item.primary_cta.href || `/pieces/content/${item.entity_id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-violet-300 hover:text-white">Open Piece profile <ArrowRight className="h-4 w-4" /></Link></div>
  </article>;
}
function Metric({label,value,icon:Icon}:{label:string;value:string;icon:typeof TrendingUp}){return <div className="bg-black/35 p-4"><Icon className="h-4 w-4 text-violet-300"/><p className="mt-4 text-xl font-black">{value}</p><p className="text-[10px] uppercase tracking-widest text-white/35">{label}</p></div>}
