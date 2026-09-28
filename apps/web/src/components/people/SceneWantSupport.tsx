import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useSupportFindOrAskDemand } from "@/hooks/useFindOrAsk";
import { useI18n } from "@/i18n/I18nContext";

/** Reuses the canonical support action: interest never implies a purchase or supply. */
export function SceneWantSupport({ id, sceneSlug }: { id: string; sceneSlug: string }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const support = useSupportFindOrAskDemand();
  const client = useQueryClient();
  const [added, setAdded] = useState(false);
  const className = "inline-flex min-h-11 items-center border border-white/20 px-4 py-2 text-xs font-bold disabled:opacity-60";
  if (!user) return <Link className={className} to={`/auth?next=${encodeURIComponent(`/scenes/${sceneSlug}#scene-demand`)}`}>{t("clarity.wantAction")}</Link>;
  return <div><button type="button" className={className} disabled={added || support.isPending} onClick={async () => {
    try {
      await support.mutateAsync(id);
      setAdded(true);
      await client.invalidateQueries({ queryKey: ["scene", sceneSlug] });
    } catch { /* The mutation error is rendered below. */ }
  }}>{added ? t("findOrAsk.supportAdded") : t("clarity.wantAction")}</button>{support.isError ? <p role="alert" className="mt-2 text-sm text-red-200">{t("findOrAsk.supportError")}</p> : null}</div>;
}
