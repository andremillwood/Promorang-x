import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Store, 
  Zap, 
  ArrowLeft, 
  History, 
  Search,
  Sparkles,
  Camera,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { usePerks } from '@/hooks/usePerks';
import { redeemPerk } from '@/lib/perks';
import { useI18n } from '@/i18n/I18nContext';

interface ScannedRedemption {
  id: string;
  code: string;
  perkTitle: string;
  customerName: string;
  discountType: string;
  discountValue?: number;
  redeemedAt: string;
  status: 'valid' | 'invalid' | 'already_redeemed';
}

export default function StaffScanner() {
  const { t } = useI18n();
  const [code, setCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [activeResult, setActiveResult] = useState<ScannedRedemption | null>(null);
  const [recentRedemptions, setRecentRedemptions] = useState<ScannedRedemption[]>([
    {
      id: 'red-1',
      code: 'WINGS-SW20',
      perkTitle: '20% Off Legendary Jerk Wings Basket',
      customerName: 'Marcus Campbell',
      discountType: 'percentage',
      discountValue: 20,
      redeemedAt: '10 mins ago',
      status: 'valid',
    },
    {
      id: 'red-2',
      code: 'FICTION-VIP2',
      perkTitle: 'Complimentary Welcome Tequila Shots for Two',
      customerName: 'Sarah Chin',
      discountType: 'free_item',
      redeemedAt: '25 mins ago',
      status: 'valid',
    },
  ]);

  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    // Simulate / verify code against known perks
    let simulated: ScannedRedemption;
    if (cleanCode.includes('WING') || cleanCode.includes('SW20')) {
      simulated = {
        id: `red-${Date.now()}`,
        code: cleanCode,
        perkTitle: '20% Off Legendary Jerk Wings Basket',
        customerName: 'Verified Promorang Pioneer',
        discountType: '20% Discount',
        discountValue: 20,
        redeemedAt: t('staffScan.justNow'),
        status: 'valid',
      };
    } else if (cleanCode.includes('VIP') || cleanCode.includes('SHOT')) {
      simulated = {
        id: `red-${Date.now()}`,
        code: cleanCode,
        perkTitle: 'Complimentary Welcome Tequila Shots for Two',
        customerName: 'VIP Club Member',
        discountType: 'Complimentary Item',
        redeemedAt: t('staffScan.justNow'),
        status: 'valid',
      };
    } else if (cleanCode.startsWith('PRK-')) {
      simulated = {
        id: `red-${Date.now()}`,
        code: cleanCode,
        perkTitle: 'Exclusive Merchant Partner Perk',
        customerName: 'Verified Community Member',
        discountType: 'Perk Offer',
        redeemedAt: t('staffScan.justNow'),
        status: 'valid',
      };
    } else {
      simulated = {
        id: `red-${Date.now()}`,
        code: cleanCode,
        perkTitle: 'Unknown or Expired Code',
        customerName: 'Unverified',
        discountType: 'None',
        redeemedAt: t('staffScan.justNow'),
        status: 'invalid',
      };
    }

    setActiveResult(simulated);
  };

  const handleConfirmRedemption = () => {
    if (!activeResult) return;
    redeemPerk(activeResult.id, activeResult.code);
    setRecentRedemptions([activeResult, ...recentRedemptions]);
    toast.success(t('staffScan.toastConfirmed', { title: activeResult.perkTitle }));
    setActiveResult(null);
    setCode('');
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 sm:p-8 font-sans">
      <SEO title={t('staffScan.seoTitle')} description={t('staffScan.seoDescription')} />

      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <Link
              to="/discover?tab=perks"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-mono uppercase">
                  {t('staffScan.badge')}
                </Badge>
                <span className="text-xs text-zinc-400 font-mono">{t('staffScan.oneTap')}</span>
              </div>
              <h1 className="text-xl font-black text-white">{t('staffScan.title')}</h1>
            </div>
          </div>

          <Link
            to="/for-merchants"
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-semibold"
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('staffScan.merchantHub')}</span>
          </Link>
        </div>

        {/* Code Input & Camera Scan Box */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <span>{t('staffScan.scanTitle')}</span>
              </h2>
              <p className="text-xs text-zinc-400">
                {t('staffScan.scanLede')}
              </p>
            </div>

            <Button
              type="button"
              onClick={() => {
                setIsScanning(!isScanning);
                toast.info(isScanning ? t('staffScan.cameraPaused') : t('staffScan.cameraActiveToast'));
              }}
              variant="outline"
              className={`border-zinc-700 rounded-xl text-xs font-bold gap-2 ${
                isScanning ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-zinc-800 text-zinc-300"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{isScanning ? t('staffScan.cameraActive') : t('staffScan.openCamera')}</span>
            </Button>
          </div>

          <form onSubmit={handleValidateCode} className="flex gap-2">
            <Input
              placeholder="e.g. WINGS-SW20 or PRK-XXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-black/60 border-zinc-700 text-white font-mono text-base tracking-wider rounded-xl uppercase h-12"
            />
            <Button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs px-6 rounded-xl shadow-lg shadow-emerald-500/20 shrink-0 h-12"
            >
              {t('staffScan.verify')}
            </Button>
          </form>

          {/* Quick Demo Pre-fills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-400">
            <span>{t('staffScan.quickTest')}</span>
            {['WINGS-SW20', 'FICTION-VIP2', 'TACBAR-TACO3', 'DUB-EXPRESS'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCode(c)}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Validation Result Modal Card */}
        {activeResult && (
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 ${
            activeResult.status === 'valid'
              ? 'bg-gradient-to-br from-emerald-950/60 via-zinc-900 to-zinc-950 border-emerald-500/50'
              : 'bg-gradient-to-br from-red-950/60 via-zinc-900 to-zinc-950 border-red-500/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeResult.status === 'valid' ? (
                  <Badge className="bg-emerald-500 text-black font-black text-xs uppercase px-3 py-1 border-none flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('staffScan.valid')}</span>
                  </Badge>
                ) : (
                  <Badge className="bg-red-500 text-white font-black text-xs uppercase px-3 py-1 border-none flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{t('staffScan.invalid')}</span>
                  </Badge>
                )}
              </div>
              <span className="font-mono text-xs text-zinc-400 font-bold">{activeResult.code}</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">{activeResult.perkTitle}</h3>
              <p className="text-xs text-zinc-300">
                {t('staffScan.customer')} <strong className="text-white">{activeResult.customerName}</strong>
              </p>
            </div>

            {activeResult.status === 'valid' && (
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">{t('staffScan.discount')}</span>
                <span className="text-emerald-400 font-black text-base">{activeResult.discountType}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              {activeResult.status === 'valid' ? (
                <Button
                  onClick={handleConfirmRedemption}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs py-3.5 rounded-xl shadow-lg shadow-emerald-500/25"
                >
                  ✓ {t('staffScan.confirm')}
                </Button>
              ) : (
                <Button
                  onClick={() => setActiveResult(null)}
                  className="flex-1 bg-red-500 text-white font-black text-xs py-3.5 rounded-xl"
                >
                  {t('staffScan.dismiss')}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setActiveResult(null)}
                className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs"
              >
                {t('staffScan.cancel')}
              </Button>
            </div>
          </div>
        )}

        {/* Recent Redemptions Log */}
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-400" />
              <span>{t('staffScan.todayLog')}</span>
            </h3>
            <span className="text-xs font-mono text-zinc-500">{t('staffScan.validated', { count: recentRedemptions.length })}</span>
          </div>

          <div className="space-y-2.5">
            {recentRedemptions.map((red) => (
              <div
                key={red.id}
                className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800 flex items-center justify-between text-xs"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="font-bold text-white truncate">{red.perkTitle}</p>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    {red.customerName} · <span className="text-emerald-400">{red.code}</span>
                  </p>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono shrink-0 ml-3">{red.redeemedAt}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
