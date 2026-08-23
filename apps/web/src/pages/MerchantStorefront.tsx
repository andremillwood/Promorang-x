import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CalendarClock, MapPin, Package, Sparkles, Store, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nContext';

const kindIcon = (item: any) => {
  if (item.discount_value) return Tag;
  if (item.fulfillment_mode === 'booking') return CalendarClock;
  return Package;
};

export default function MerchantStorefront() {
  const { t, locale } = useI18n();
  const { merchantId } = useParams();
  const offerLabel = (item: any) => item.discount_value
    ? t("storefront.off", { value: `${item.discount_value}${item.discount_type === 'percentage' ? '%' : ''}` })
    : null;
  const q = useQuery({
    queryKey: ['storefront', merchantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('view_public_commerce_directory')
        .select('*')
        .eq('merchant_user_id', merchantId)
        .eq('is_active', true)
        .eq('visibility', 'public')
        .limit(120);
      if (error) throw error;
      return data || [];
    },
  });

  const items = useMemo(() => {
    return [...(q.data || [])].sort((a: any, b: any) => {
      const aRank = a.discount_value ? 0 : a.fulfillment_mode === 'booking' ? 1 : 2;
      const bRank = b.discount_value ? 0 : b.fulfillment_mode === 'booking' ? 1 : 2;
      return aRank - bRank || new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [q.data]);
  const merchant = items[0];
  const offers = items.filter((x: any) => x.discount_value);
  const services = items.filter((x: any) => x.fulfillment_mode === 'booking' || x.listing_kind === 'service');

  return (
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(255,106,26,.24),transparent_30%),linear-gradient(135deg,#080808,#15110f)] p-7 text-white sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="gap-1 bg-primary text-primary-foreground"><Store className="h-3.5 w-3.5" />{t("storefront.label")}</Badge>
          {offers.length ? <Badge variant="secondary" className="bg-white/10 text-white">{t("storefront.offers", { count: offers.length })}</Badge> : null}
          {services.length ? <Badge variant="secondary" className="bg-white/10 text-white">{t("storefront.bookable", { count: services.length })}</Badge> : null}
        </div>
        <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-.06em] sm:text-7xl">{merchant?.merchant_name || t("storefront.local")}</h1>
        <p className="mt-4 max-w-2xl text-white/55">{t("storefront.copy")}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/45">
          {merchant?.location ? <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{merchant.location}</span> : null}
          {merchant?.merchant_website ? <Button asChild size="sm" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"><a href={merchant.merchant_website} target="_blank" rel="noreferrer">{t("storefront.website")}</a></Button> : null}
        </div>
      </section>

      {offers[0] ? (
        <Link to={`/shop/${encodeURIComponent(offers[0].listing_id)}`} className="mt-6 grid overflow-hidden rounded-3xl border bg-card md:grid-cols-[1.15fr_.85fr]">
          <div className="min-h-[260px] bg-muted">
            {offers[0].image_url ? <img src={offers[0].image_url} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          <div className="flex flex-col justify-between p-6">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary"><Sparkles className="h-4 w-4" />{t("storefront.featured")}</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.04em]">{offers[0].name}</h2>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{offers[0].description}</p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <Badge>{offerLabel(offers[0])}</Badge>
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </Link>
      ) : null}

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {q.isLoading ? <p>{t("storefront.loading")}</p> : items.map((x: any) => {
          const Icon = kindIcon(x);
          return (
            <Link key={x.listing_id} to={`/shop/${encodeURIComponent(x.listing_id)}`} className="group overflow-hidden rounded-3xl border border-border bg-card">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                {x.image_url ? <img src={x.image_url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : null}
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={x.discount_value ? 'default' : 'secondary'} className="gap-1 capitalize"><Icon className="h-3 w-3" />{offerLabel(x) || x.listing_kind || t("market.product")}</Badge>
                  <Badge variant="outline" className="capitalize">{x.fulfillment_mode || t("storefront.pickup")}</Badge>
                </div>
                <h2 className="mt-3 text-xl font-black">{x.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{x.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <b>{typeof x.price === 'number' ? new Intl.NumberFormat(locale, { style: 'currency', currency: x.currency || 'USD' }).format(x.price) : x.points_cost ? `${x.points_cost} pts` : t("market.open")}</b>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
