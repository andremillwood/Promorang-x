import { useI18n } from "@/i18n/I18nContext";
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api';
type Benefit = { id: string; title: string; terms: string; checkout_discount: { category?: string; minimum_spend?: number } };
export function StoreBenefits({ merchantId }: { merchantId: string }) {
  const { t } = useI18n();
  const query = useQuery({ queryKey: ['store-checkout-benefits', merchantId], enabled: Boolean(merchantId), queryFn: async () => {
    const response = await fetch(`${API_BASE_URL}/commerce/store-benefits/${encodeURIComponent(merchantId)}`);
    const data = await response.json(); if (!response.ok) throw new Error('Could not load store benefits');
    return data.benefits as Benefit[];
  } });
  return <section className="border-y border-orange-300/20 px-5 py-8"><div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-widest text-orange-300">{t("release.38")}</p><h2 className="mt-3 font-serif text-3xl">{t("release.39")}</h2>{query.isLoading ? <p role="status" className="mt-4 text-sm">{t("release.40")}</p> : query.isError ? <p className="mt-4 text-sm text-white/60">{t("release.41")} <button className="underline" onClick={() => void query.refetch()}>{t("release.18")}</button></p> : query.data?.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2">{query.data.map(benefit => <Link className="border border-white/15 p-5 hover:border-orange-300" key={benefit.id} to={`/offers/${benefit.id}`}><h3 className="text-lg font-bold">{benefit.title}</h3><p className="mt-2 text-sm leading-6 text-white/60">{benefit.terms}</p><span className="mt-4 inline-block text-sm font-bold text-orange-300">{t("release.42")}</span></Link>)}</div> : <p className="mt-4 text-sm text-white/60">{t("release.43")}</p>}</div></section>;
}
