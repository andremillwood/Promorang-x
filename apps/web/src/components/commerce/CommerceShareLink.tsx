import { useI18n } from "@/i18n/I18nContext";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useReferralCodes, useCreateReferralCode } from '@/hooks/useReferrals';
export function CommerceShareLink({ path }: { path: string }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const codes = useReferralCodes();
  const create = useCreateReferralCode();
  const [message, setMessage] = useState('');
  async function share() {
    try {
      const existing = codes.data?.find(code => code.is_active)?.code;
      const result = existing ? null : await create.mutateAsync();
      const code = existing || result?.code;
      if (!code) throw new Error(t("release.32"));
      const url = new URL(path, window.location.origin); url.searchParams.set('ref', code);
      await navigator.clipboard.writeText(url.href); setMessage(t("release.33"));
    } catch { setMessage(t("release.34")); }
  }
  return <div className="mt-5 border-t border-white/10 py-4"><p className="text-sm text-white/60">{t("release.35")}</p>{user ? <button disabled={codes.isLoading || create.isPending} className="min-h-11 text-sm font-bold text-orange-300 disabled:opacity-50" onClick={() => void share()}>{t("release.36")}</button> : <Link className="inline-flex min-h-11 items-center text-sm text-orange-300" to={`/auth?mode=signup&next=${encodeURIComponent(path)}`}>{t("release.37")}</Link>}<p role="status" className="text-xs text-white/60">{message}</p></div>;
}
