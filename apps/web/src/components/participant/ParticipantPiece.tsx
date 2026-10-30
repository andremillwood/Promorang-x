import { Link } from "react-router-dom";
import { Archive, ShieldCheck } from "lucide-react";
import { currentUiLocale } from "@/i18n/geo-locale";
import { memoryArtwork, type RetainedMemory } from "@/lib/participant-memory";
export function ParticipantPiece({ memory, moments = [] }: {memory: RetainedMemory; moments?: Array<{id: string; image_url?: string | null}>}) {
 const image = memoryArtwork(memory, moments);
 const meta = memory.metadata || {};
 const date = memory.issued_at ? new Date(memory.issued_at) : null;
 return <Link to={`/memories/${memory.id}`} className={`participant-piece ${image ? "" : "participant-piece--no-image"}`}>
  {image ? <img src={image} alt="" loading="lazy" /> : <Archive size={56} aria-hidden="true" />}
  <span className="participant-piece-label">{meta.proof_submission_id ? <ShieldCheck size={12} aria-hidden="true" /> : <Archive size={12} aria-hidden="true" />}{memory.rarity || "Piece"}</span>
  <h3>{memory.title || String(meta.moment_title || "Your Piece")}</h3>
  {meta.scene_title || meta.venue_name ? <p>{String(meta.scene_title || meta.venue_name)}</p> : null}
  {date && Number.isFinite(date.getTime()) ? <p>{date.toLocaleDateString(currentUiLocale(), {month:"short",day:"numeric",year:"numeric"})}</p> : null}
  {!image ? <p>Artwork not supplied</p> : null}
 </Link>;
}
