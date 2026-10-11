/** Ordinary API/network errors must never reload the app or discard entered work. */
export function isRecoverableChunkError(message: string): boolean {
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading (?:CSS )?chunk [\w-]+ failed|error loading dynamically imported module/i.test(message);
}
