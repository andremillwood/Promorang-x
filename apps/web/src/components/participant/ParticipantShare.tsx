import { useState } from "react";
import { Check, Share2 } from "lucide-react";
export function ParticipantShare({title,href}: {title:string;href:string}) {
 const [state,setState] = useState<"idle"|"copied"|"failed">("idle");
 async function share() {
  const url = new URL(href,window.location.origin).href;
  try {
   if (navigator.share) { await navigator.share({title,url}); return; }
   await navigator.clipboard.writeText(url); setState("copied");
  } catch (error) {
   if (!(error instanceof DOMException && error.name === "AbortError")) setState("failed");
  }
 }
 return <div className="participant-share"><button type="button" aria-label={`Share ${title}`} onClick={() => void share()}>{state === "copied" ? <Check size={18} /> : <Share2 size={18} />}</button>{state === "copied" ? <span role="status">Link copied</span> : state === "failed" ? <label className="participant-share-fallback">Copy this link<input aria-label={`Link to ${title}`} readOnly value={new URL(href,window.location.origin).href} onFocus={event=>event.currentTarget.select()} /></label> : null}</div>;
}
