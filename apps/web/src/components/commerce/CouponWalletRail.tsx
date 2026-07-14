import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, Clock, Gift, QrCode, TicketCheck } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type CouponRedemption = {
  id: string;
  claim_code?: string | null;
  status: string;
  created_at?: string;
  redeemed_at?: string | null;
  expires_at?: string | null;
  coupons?: {
    name?: string | null;
    description?: string | null;
    discount_type?: string | null;
    discount_value?: number | null;
    merchant_stores?: {
      store_name?: string | null;
      logo_url?: string | null;
    } | null;
  } | null;
};

export function CouponWalletRail() {
  const { user, session } = useAuth();
  const [selected, setSelected] = useState<CouponRedemption | null>(null);
  const q = useQuery({
    queryKey: ['coupon-wallet', user?.id],
    enabled: !!session?.access_token,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/coupons/my-redemptions`, {
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not load claimed offers');
      return (data.data?.redemptions || []) as CouponRedemption[];
    },
  });

  if (!user || q.isLoading || !q.data?.length) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TicketCheck className="h-4 w-4 text-primary" />
          <h2 className="font-black">Claimed offers</h2>
        </div>
        <Badge variant="secondary">{q.data.length}</Badge>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {q.data.slice(0, 10).map((item) => {
          const coupon = item.coupons;
          const claimed = item.status === 'claimed';
          const value = coupon?.discount_value
            ? `${coupon.discount_value}${coupon.discount_type === 'percentage' ? '%' : ''}`
            : 'Offer';

          return (
            <Card key={item.id} className="min-w-[280px] overflow-hidden border-primary/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                    {claimed ? <Gift className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
                  </div>
                  <Badge variant={claimed ? 'default' : 'secondary'} className="capitalize">{item.status}</Badge>
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                  {coupon?.merchant_stores?.store_name || value}
                </p>
                <h3 className="mt-1 line-clamp-2 text-lg font-black">{coupon?.name || 'Promorang offer'}</h3>
                <div className="mt-4 rounded-lg border border-dashed bg-muted/40 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Redemption code</p>
                  <p className="mt-1 font-mono text-sm font-bold">{item.claim_code || 'Code pending'}</p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {item.expires_at ? new Date(item.expires_at).toLocaleDateString() : 'No expiry posted'}
                  </span>
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setSelected(item)}>Show</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.coupons?.name || 'Promorang offer'}</DialogTitle>
            <DialogDescription>
              {selected?.coupons?.merchant_stores?.store_name || 'Show this code to the merchant when redeeming.'}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border bg-muted/30 p-5 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-primary text-primary-foreground">
              <QrCode className="h-6 w-6" />
            </div>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Redemption code</p>
            <p className="mt-2 break-all font-mono text-3xl font-black tracking-wider">{selected?.claim_code || 'CODE PENDING'}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Status: <span className="capitalize">{selected?.status}</span>
              {selected?.expires_at ? ` · Expires ${new Date(selected.expires_at).toLocaleDateString()}` : ''}
            </p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            The merchant scans or enters this code from their redemption validator. Keep the code private until you are ready to redeem.
          </p>
        </DialogContent>
      </Dialog>
    </section>
  );
}
