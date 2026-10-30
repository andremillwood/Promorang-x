import { BrandImage } from "@/components/media/BrandImage";
import { Link } from "react-router-dom";
import { Archive, ShieldCheck } from "lucide-react";
import { currentUiLocale } from "@/i18n/geo-locale";
import { memoryArtwork, type RetainedMemory } from "@/lib/participant-memory";
export function ParticipantPiece({ memory, moments = [] }: {memory: RetainedMemory; moments?: Array<{id: string; image_url?: string | null; category?: string | null}>}) {
 const image = memoryArtwork(memory, moments);
 const meta = memory.metadata || {};
 const sourceCategory = moments.find(moment=>moment.id===memory.moment_id)?.category;
 const date = memory.issued_at ? new Date(memory.issued_at) : null;
 return <Link to={`/memories/${memory.id}`} className="participant-piece">
  <BrandImage src={image} category={String(meta.category || sourceCategory || memory.collection_key || "")} title={`${memory.title || ""} ${meta.moment_title || ""}`} description={String(meta.scene_title || "")} kind="piece" />
  <span className="participant-piece-label">{meta.proof_submission_id ? <ShieldCheck size={12} aria-hidden="true" /> : <Archive size={12} aria-hidden="true" />}{memory.rarity || "Piece"}</span>
  <h3>{memory.title || String(meta.moment_title || "Your Piece")}</h3>
  {meta.scene_title || meta.venue_name ? <p>{String(meta.scene_title || meta.venue_name)}</p> : null}
  {date && Number.isFinite(date.getTime()) ? <p>{date.toLocaleDateString(currentUiLocale(), {month:"short",day:"numeric",year:"numeric"})}</p> : null}
 </Link>;
}
