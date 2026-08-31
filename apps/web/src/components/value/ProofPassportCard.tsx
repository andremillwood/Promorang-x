import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Award, 
  TrendingUp, 
  MapPin, 
  Video, 
  Coins, 
  ExternalLink, 
  FileCheck, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n/I18nContext';
import { ValueReceiptData } from './TactileValueReceipt';

interface ProofPassportCardProps {
  userHandle?: string;
  pioneerRank?: string;
  totalFootfall?: number;
  totalCommerceDriven?: number;
  totalMediaImpressions?: number;
  totalGemsEarned?: number;
  recentReceipts?: ValueReceiptData[];
  onSelectReceipt?: (receipt: ValueReceiptData) => void;
}

const DEFAULT_SAMPLE_RECEIPTS: ValueReceiptData[] = [
  {
    id: 'rec_tia_joyride_01',
    receiptNumber: 'REC-2026-T8812',
    actorHandle: '@tia',
    actorName: 'Tia Sterling',
    actionType: 'share',
    actionTitle: 'Distributed PromoShare RSVP Link',
    targetEntity: 'Joyride Friday @ Warehouse 9',
    timestamp: 'Aug 24, 2026',
    status: 'verified',
    verificationMethod: 'Gate Scanner QR Verification',
    proofHash: '0x98f4e2b83a00c71e84aa92bc112',
    metrics: [
      { label: 'Link Visits', value: '12' },
      { label: 'Verified Arrivals', value: '3', highlight: true },
    ],
    rewards: [
      { type: 'cash', label: 'Cash Payout', value: '$24.00 USD' },
      { type: 'points', label: 'Points', value: '+480 pts' },
    ],
  },
  {
    id: 'rec_marcus_sunset_ugc',
    receiptNumber: 'REC-2026-M4409',
    actorHandle: '@marcus.creates',
    actorName: 'Marcus Vance',
    actionType: 'ugc_clip',
    actionTitle: 'Published Reel Review + Community Drop',
    targetEntity: 'Sunset Cafe & Lounge',
    timestamp: 'Aug 23, 2026',
    status: 'verified',
    verificationMethod: 'POS Coupon Match + Media Audit',
    proofHash: '0x33b1e77d09ac421f98de012',
    metrics: [
      { label: 'Views Verified', value: '4,850' },
      { label: 'Orders Driven', value: '8', highlight: true },
    ],
    rewards: [
      { type: 'cash', label: 'Bounty Yield', value: '$35.00 USD' },
      { type: 'keys', label: 'VIP Pass', value: 'VIP Tasting Key #04' },
    ],
  },
];

export const ProofPassportCard: React.FC<ProofPassportCardProps> = ({
  userHandle = '@pioneer_member',
  pioneerRank = 'Pioneer Level 3 · Trusted Contributor',
  totalFootfall = 18,
  totalCommerceDriven = 1240.00,
  totalMediaImpressions = 84500,
  totalGemsEarned = 3200,
  recentReceipts = DEFAULT_SAMPLE_RECEIPTS,
  onSelectReceipt,
}) => {
  const { t, formatNumber } = useI18n();
  return (
    <div className="w-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl text-white space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400 mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{t("passport.badge")}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">{t("passport.canon", { handle: userHandle })}</h2>
          <p className="text-xs md:text-sm text-zinc-400 max-w-xl mt-1">
            {t("passport.copy")}
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 min-w-[220px]">
          <span className="text-xs text-zinc-400 font-medium">{t("passport.standing")}</span>
          <div className="flex items-center gap-2 mt-1">
            <Award className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-300">{pioneerRank}</span>
          </div>
          <span className="mt-1.5 text-[10px] text-zinc-500 font-mono">{t("passport.audited")}</span>
        </div>
      </div>

      {/* Cumulative Impact Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t("passport.commerce")}</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">${formatNumber(totalCommerceDriven)}</div>
          <p className="text-[10px] text-zinc-400 mt-1">{t("passport.commerceSub")}</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t("passport.footfall")}</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{t("passport.visits", { count: formatNumber(totalFootfall) })}</div>
          <p className="text-[10px] text-zinc-400 mt-1">{t("passport.footfallSub")}</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t("passport.media")}</span>
            <Video className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300">{formatNumber(totalMediaImpressions)}</div>
          <p className="text-[10px] text-zinc-400 mt-1">{t("passport.mediaSub")}</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t("passport.rewards")}</span>
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400">{t("passport.gems", { count: formatNumber(totalGemsEarned) })}</div>
          <p className="text-[10px] text-zinc-400 mt-1">{t("passport.rewardsSub")}</p>
        </div>
      </div>

      {/* Verified Receipts Stream */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-400" />
            <span>{t("passport.recent")}</span>
          </h3>
          <span className="text-xs text-zinc-500 font-mono">{t("passport.sealed")}</span>
        </div>

        <div className="space-y-2.5">
          {recentReceipts.map((rec) => (
            <div
              key={rec.id}
              onClick={() => onSelectReceipt && onSelectReceipt(rec)}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 rounded-2xl cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{rec.actionTitle}</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                      {t("passport.verified")}
                    </Badge>
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                    <span>{rec.targetEntity}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-zinc-500">{rec.timestamp}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:justify-end">
                <div className="text-right">
                  <div className="text-xs font-bold text-amber-300">
                    {rec.rewards.map(r => r.value).join(' + ')}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    HASH: {rec.proofHash ? rec.proofHash.slice(0, 10) + '...' : '0x99a...'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
