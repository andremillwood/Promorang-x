import React from 'react';
import { X, Sparkles, ShieldCheck, ArrowRight, Download, Share2 } from 'lucide-react';
import { TactileValueReceipt, ValueReceiptData } from './TactileValueReceipt';
import { useI18n } from '@/i18n/I18nContext';
import { triggerHaptic } from '@/lib/haptics';
import { hapticAudio } from '@/lib/hapticAudio';

interface ProofReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ValueReceiptData;
  onDepositToVault?: () => void;
}

export const ProofReceiptModal: React.FC<ProofReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
  onDepositToVault,
}) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  const handleSeal = () => {
    triggerHaptic('success');
    hapticAudio.playSuccess();
    if (onDepositToVault) onDepositToVault();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg my-8">
        {/* Glow halo */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/80 border border-white/10 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Masthead Banner */}
        <div className="text-center mb-4 space-y-1 text-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-bold text-emerald-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t("proofModal.verified")}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">{t("proofModal.title")}</h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {t("proofModal.copy")}
          </p>
        </div>

        {/* 3D Tactile Receipt Object */}
        <TactileValueReceipt
          receipt={receipt}
          interactive={true}
          allowTear={true}
          showShareActions={true}
          className="my-2"
        />

        {/* Action Bottom Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSeal}
            className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t("proofModal.deposit")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
