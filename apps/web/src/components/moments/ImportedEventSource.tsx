import { ExternalLink } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { importedListingCopy } from "@/i18n/imported-listing-copy";
import { safeEvidenceUrl } from "@/lib/imported-listing-claims";

export function ImportedEventSource({ sourceUrl }: { sourceUrl?: string | null }) {
  const { locale } = useI18n();
  const copy = importedListingCopy[locale];
  const href = safeEvidenceUrl(sourceUrl || "");
  return <div>
    <h2 className="text-2xl font-bold text-white">{copy.eventSourceTitle}</h2>
    <p className="mt-3 text-sm leading-6 text-white/60">{copy.eventSourceCopy}</p>
    {href ? <a href={href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-12 items-center gap-2 bg-orange-500 px-5 text-xs font-bold text-black">{copy.eventSourceAction}<ExternalLink className="h-4 w-4" /></a> : null}
  </div>;
}
