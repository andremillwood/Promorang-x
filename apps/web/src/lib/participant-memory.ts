export type RetainedMemory = {
  id: string; title?: string | null; description?: string | null; rarity?: string | null;
  issued_at?: string | null; moment_id?: string | null; collection_key?: string | null;
  metadata?: Record<string, unknown> | null;
  mission_attribution?: {first_engaged_at?: string | null; joined_at?: string | null; verified_at?: string | null; status?: string | null} | null;
};
export function memoryArtwork(memory: RetainedMemory, moments: Array<{id: string; image_url?: string | null}> = []) {
  const meta = memory.metadata || {};
  const candidate = [meta.image_url, meta.artwork_url, meta.moment_image_url, moments.find((moment) => moment.id === memory.moment_id)?.image_url].find((value) => typeof value === "string" && /^(https?:\/\/|\/(?!\/))/.test(value));
  return typeof candidate === "string" ? candidate : null;
}
export function memoryProvenance(memory: RetainedMemory) {
  const attribution = memory.mission_attribution;
  return [
    {label: "You moved it", at: attribution?.first_engaged_at},
    {label: "You joined", at: attribution?.joined_at},
    {label: "Participation verified", at: attribution?.verified_at},
    {label: "Piece added to your Vault", at: memory.issued_at},
  ].filter((event): event is {label: string; at: string} => Boolean(event.at && Number.isFinite(Date.parse(event.at))));
}
