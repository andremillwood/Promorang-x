import { useState } from 'react';
import { Store, Tag, Copy, Check, Zap, ShoppingBag, ShieldCheck, ExternalLink } from 'lucide-react';
import { MerchantCouponType, DropType } from '@/shared/types';

interface MerchantStoreTabProps {
  coupons: MerchantCouponType[];
  sponsoredDrops: DropType[];
  merchantName?: string;
  isPublic?: boolean;
}

export default function MerchantStoreTab({ coupons, sponsoredDrops, merchantName = 'Official Store', isPublic = false }: MerchantStoreTabProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Merchant Store Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
          <Store className="w-48 h-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Verified Merchant Store
              </span>
            </div>
            <h3 className="text-2xl font-black">{merchantName}</h3>
            <p className="text-slate-300 text-sm mt-1 max-w-lg">
              Explore exclusive merchant coupons, promotional offers, and sponsored amplification drops.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-center">
              <div className="text-xs text-slate-400 font-medium">Offers</div>
              <div className="text-xl font-bold text-white">{coupons.length}</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-xs text-slate-400 font-medium">Sponsored Drops</div>
              <div className="text-xl font-bold text-white">{sponsoredDrops.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Catalog Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-orange-500" />
            Active Store Coupons & Offers
          </h4>
          <span className="text-xs font-medium text-gray-500">{coupons.length} Active Deals</span>
        </div>

        {coupons.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-gray-900">No Active Store Deals</h4>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
              Check back soon for special promotions, discount codes, and merchant vouchers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-orange-200 transition-all shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="bg-red-50 text-red-600 font-bold text-xs px-2.5 py-1 rounded-md">
                      {coupon.discount_value} OFF
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {coupon.redemptions_count} Redemptions
                    </span>
                  </div>
                  <h5 className="font-bold text-gray-900 text-base mt-3">{coupon.title}</h5>
                  <p className="text-xs text-gray-500 mt-1">{coupon.discount_description}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="bg-gray-100 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-xs font-mono font-bold text-gray-800">
                    {coupon.code}
                  </div>
                  <button
                    onClick={() => copyCode(coupon.id, coupon.code)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copiedId === coupon.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sponsored Drops Section */}
      {sponsoredDrops.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500" />
            Sponsored Campaign Drops
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sponsoredDrops.map((drop) => (
              <div key={drop.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {drop.drop_type}
                  </span>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    +{drop.gem_reward_base} Gems
                  </span>
                </div>
                <h5 className="font-bold text-gray-900 text-base mt-2">{drop.title}</h5>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{drop.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
