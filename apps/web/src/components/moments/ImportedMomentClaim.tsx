import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";
import { importedListingCopy } from "@/i18n/imported-listing-copy";
import { canClaimImportedMoment, importedListingClaimPath, type ImportedMomentOwnership } from "@/lib/imported-listing-claims";

export function ImportedMomentClaim({ moment }: { moment: ImportedMomentOwnership }) {
  const { locale } = useI18n();
  const copy = importedListingCopy[locale];
  if (!canClaimImportedMoment(moment)) return null;

  return (
    <div className="mt-5 border-t border-white/15 pt-5">
      <h2 className="text-sm font-bold text-white">{copy.momentClaimTitle}</h2>
      <p className="mt-2 text-xs leading-5 text-white/60">{copy.momentClaimCopy}</p>
      <Link to={importedListingClaimPath("moment", moment.id)} className="mt-3 inline-flex min-h-11 items-center border border-orange-400/40 px-4 text-xs font-bold text-orange-300 hover:border-orange-300">
        {copy.momentClaimAction}
      </Link>
    </div>
  );
}
