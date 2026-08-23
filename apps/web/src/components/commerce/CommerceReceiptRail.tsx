import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BadgeCheck, Bookmark, Gift, Receipt, ShoppingBag, TicketCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { resolveCommerceReceiptPresentation } from '@promorang/shared';
import { useI18n } from '@/i18n/I18nContext';

type CommerceReceipt = {
  id: string;
  receipt_type: string;
  status: string;
  amount: number | string;
  currency: string;
  redemption_code?: string | null;
  occurred_at: string;
  attribution?: {
    coupon_code?: string;
    source?: string;
    payment_method?: string;
    quantity?: number;
    [key: string]: unknown;
  } | null;
  merchant_products?: {
    name?: string | null;
    image_url?: string | null;
  } | null;
};

const receiptIcon = {
  purchase: ShoppingBag,
  reservation: Bookmark,
  claim: Gift,
  redemption: TicketCheck,
  refund: Receipt,
} as const;

function receiptTitle(receipt: CommerceReceipt) {
  if (receipt.merchant_products?.name) return receipt.merchant_products.name;
  if (receipt.receipt_type === 'claim') return `Offer claimed${receipt.attribution?.coupon_code ? ` · ${receipt.attribution.coupon_code}` : ''}`;
  if (receipt.receipt_type === 'redemption') return `Offer redeemed${receipt.attribution?.coupon_code ? ` · ${receipt.attribution.coupon_code}` : ''}`;
  return receipt.receipt_type.replace('_', ' ');
}

function receiptValue(receipt: CommerceReceipt) {
  const amount = Number(receipt.amount || 0);
  if (receipt.redemption_code) return receipt.redemption_code;
  if (amount > 0) return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: receipt.currency || 'USD',
  }).format(amount);
  return receipt.status;
}

export function CommerceReceiptRail() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ['commerce-receipts', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('commerce_receipts')
        .select('*,merchant_products:listing_id(name,image_url)')
        .eq('user_id', user!.id)
        .order('occurred_at', { ascending: false })
        .limit(12);
      if (error) throw error;
      return (data || []) as CommerceReceipt[];
    },
  });

  if (!user) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          <h2 className="font-black">{t("receipt.railTitle")}</h2>
        </div>
        {q.data?.length ? <Badge variant="secondary">{q.data.length}</Badge> : null}
      </div>

      {q.isLoading ? (
        <div className="flex gap-3 overflow-hidden pb-2">
          {[0, 1, 2].map((item) => <Skeleton key={item} className="h-36 min-w-[280px] rounded-2xl" />)}
        </div>
      ) : !q.data?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
            <BadgeCheck className="h-5 w-5 text-primary" />
            {t("receipt.railEmpty")}
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {q.data.map((receipt) => {
            const Icon = receiptIcon[receipt.receipt_type as keyof typeof receiptIcon] || Receipt;
            const presentation = resolveCommerceReceiptPresentation({ receiptType: receipt.receipt_type, status: receipt.status, productName: receipt.merchant_products?.name, attribution: receipt.attribution as any });
            return (
              <Link key={receipt.id} to={`/receipts/${receipt.id}`} className="group min-w-[280px] overflow-hidden rounded-2xl border bg-card transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card">
                {receipt.merchant_products?.image_url ? (
                  <div className="h-20 bg-muted">
                    <img src={receipt.merchant_products.image_url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                ) : null}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant={receipt.status === 'fulfilled' ? 'default' : 'secondary'} className="capitalize">
                      {receipt.status}
                    </Badge>
                  </div>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary">{presentation.headline}</p>
                  <h3 className="mt-1 line-clamp-2 font-black capitalize">{receiptTitle(receipt)}</h3>
                  {presentation.outcomes.length > 1 ? <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-300">+ {presentation.outcomes.slice(1).map((outcome) => outcome.value).join(' · ')}</p> : null}
                  <div className="mt-4 rounded-xl border border-dashed bg-muted/35 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {receipt.redemption_code ? t("receipt.redemptionCode") : t("receipt.receiptValue")}
                    </p>
                    <p className="mt-1 break-all font-mono text-sm font-bold">{receiptValue(receipt)}</p>
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    {new Date(receipt.occurred_at).toLocaleDateString(locale)}
                    {receipt.attribution?.source ? ` · ${receipt.attribution.source}` : ''}
                  </p>
                  <p className="mt-3 text-xs font-bold text-primary">{t("receipt.open")}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
