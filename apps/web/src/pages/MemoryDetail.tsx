import { API_BASE_URL } from "@/lib/api";
import { currentUiLocale } from "@/i18n/geo-locale";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Archive, ArrowLeft, ArrowRight, Gift, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRetainedMomentArtwork } from "@/hooks/useRetainedMomentArtwork";
import { memoryArtwork, memoryProvenance, type RetainedMemory } from "@/lib/participant-memory";
import SEO from "@/components/SEO";

type MemoryDetailRecord = RetainedMemory & {
 perk?: {benefit_value?: string | {label?: string; percent_off?: number; amount_off?: number}; benefit_type?: string; source_type?: string; expires_at?: string; redemption_rules?: unknown} | null;
};
function dateLabel(value: string) {
 return new Date(value).toLocaleDateString(currentUiLocale(), {month:"short",day:"numeric",year:"numeric"});
}
function benefitLabel(perk: NonNullable<MemoryDetailRecord["perk"]>) {
 const value = perk.benefit_value;
 return typeof value === "string" ? value : value?.label || (value?.percent_off ? `${value.percent_off}% off` : value?.amount_off ? `${value.amount_off} off` : "Attached benefit");
}
export default function MemoryDetail() {
 const {id} = useParams<{id:string}>();
 const {user,session} = useAuth();
 const memoryQuery = useQuery<MemoryDetailRecord | null>({
  queryKey:["memory",id,user?.id], enabled:Boolean(id && user && session?.access_token),
  queryFn:async () => {
   const response = await fetch(`${API_BASE_URL}/memories/${encodeURIComponent(id!)}`, {headers:{Authorization:`Bearer ${session!.access_token}`}});
   const payload = await response.json();
   if (!response.ok) throw new Error("Your Piece couldn’t load.");
   return payload?.memory || null;
  },
 });
 const memory = memoryQuery.data;
 const artwork = useRetainedMomentArtwork(memory ? [memory] : []);
 const image = memory ? memoryArtwork(memory,artwork) : null;
 const meta = memory?.metadata || {};
 const events = memory ? memoryProvenance(memory) : [];
 const verified = Boolean(memory?.mission_attribution?.verified_at || meta.proof_state === "verified");
 const expired = Boolean(memory?.perk?.expires_at && Date.parse(memory.perk.expires_at) <= Date.now());
 return <div className="participant-world"><main className="participant-memory">
  <SEO title={`${memory?.title || "Your Piece"} — Promorang Vault`} description="Revisit the source, participation history and access attached to your Piece." />
  <Link to="/vault" className="pr-world-link inline-flex min-h-11 items-center gap-2"><ArrowLeft size={17} />My Vault</Link>
  {!user ? <section className="participant-memory-section"><h1>Open your Piece</h1><p>Sign in to see your personal participation history.</p><Link to={`/auth?next=${encodeURIComponent(`/memories/${id}`)}`} className="pr-world-primary mt-5">Sign in</Link></section>
  : memoryQuery.isLoading || !session ? <div role="status" className="participant-memory-section">Loading your Piece…</div>
  : memoryQuery.isError ? <div role="alert" className="participant-memory-section"><h1>Your Piece couldn’t load.</h1><button type="button" disabled={memoryQuery.isFetching} onClick={() => void memoryQuery.refetch()} className="pr-world-primary mt-5">Try again</button></div>
  : !memory ? <section className="participant-memory-section"><h1>Piece not found</h1><p>It may be unavailable or belong to a different account.</p><Link to="/vault" className="pr-world-link inline-flex min-h-11">Return to your Vault</Link></section>
  : <div className="participant-memory-layout">
   <div>
    <section className="participant-memory-art">
     {image ? <img src={image} alt="" /> : <Archive size={80} aria-hidden="true" className="absolute left-1/2 top-20 -translate-x-1/2 text-orange-300/30" />}
     <div><p className="mb-3 text-sm text-orange-200">{memory.rarity || "Your Piece"}</p><h1>{memory.title || String(meta.moment_title || "A Piece of your story")}</h1>{meta.scene_title ? <p className="mt-3 text-sm">{String(meta.scene_title)}</p> : null}{!image ? <p className="mt-3 text-xs text-stone-400">Artwork not supplied</p> : null}</div>
    </section>
    <dl className="participant-provenance">
     {memory.issued_at && Number.isFinite(Date.parse(memory.issued_at)) ? <><dt>Kept</dt><dd>{dateLabel(memory.issued_at)}</dd></> : null}
     {meta.venue_name || meta.location ? <><dt>Origin</dt><dd>{String(meta.venue_name || meta.location)}</dd></> : null}
     {memory.collection_key ? <><dt>Collection</dt><dd>{memory.collection_key.replace(/[-_]/g," ")}</dd></> : null}
     <dt>Acquired</dt><dd>{verified ? "Verified participation" : "Issued to your Vault"}</dd>
     <dt>Your Piece</dt><dd className="font-mono text-xs">{memory.id}</dd>
    </dl>
    {memory.moment_id ? <Link to={`/moments/${memory.moment_id}`} className="pr-world-link mt-5 inline-flex min-h-11 items-center gap-3">Revisit the Moment <ArrowRight size={16} /></Link> : null}
   </div>
   <div>
    <section className="participant-memory-section"><h2 className="flex items-center gap-2"><ShieldCheck size={21} className="text-orange-400" />Your participation trail</h2>{memory.description ? <p>{memory.description}</p> : null}
     {events.length ? <ol className="participant-timeline">{events.map((event) => <li key={event.label}><strong>{event.label}</strong><time dateTime={event.at}>{dateLabel(event.at)}</time></li>)}</ol> : <p>This Piece is retained. A dated participation timeline hasn’t been supplied.</p>}
    </section>
    <section className="participant-memory-section"><h2 className="flex items-center gap-2"><Gift size={21} className="text-orange-400" />Attached access</h2>
     {memory.perk ? <><p className="font-bold text-white">{benefitLabel(memory.perk)}</p>{memory.perk.expires_at ? <p>{expired ? "Expired" : "Expires"} · {Number.isFinite(Date.parse(memory.perk.expires_at)) ? dateLabel(memory.perk.expires_at) : "Check with the issuer"}</p> : null}<p>Check your Card for current eligibility, status and redemption instructions.</p><Link to="/card" className="pr-world-primary mt-5">Open my Card <ArrowRight size={16} /></Link>{memory.perk.redemption_rules ? <details className="mt-5"><summary className="flex min-h-11 cursor-pointer items-center text-sm">Issuer’s redemption rules</summary><pre className="whitespace-pre-wrap break-words text-xs leading-6 text-stone-400">{typeof memory.perk.redemption_rules === "string" ? memory.perk.redemption_rules : JSON.stringify(memory.perk.redemption_rules,null,2)}</pre></details> : null}</> : <p>No access has been attached to this Piece. Your participation history stays here.</p>}
    </section>
    <section className="participant-memory-section"><h2>Keep your story moving</h2><p>Find the next experience, join a Scene, or help bring a Want to life.</p><Link to="/discover" className="pr-world-link mt-4 inline-flex min-h-11 items-center gap-3">Explore what’s next <ArrowRight size={16} /></Link></section>
   </div>
  </div>}
 </main></div>;
}
