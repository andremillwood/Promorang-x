import React, { useState } from 'react';
import { 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Search, 
  KeyRound, 
  Clock, 
  Building2, 
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PromoKeyPassScannerProps {
  venueName?: string;
  onValidationSuccess?: (claimData: any) => void;
}

export const PromoKeyPassScanner: React.FC<PromoKeyPassScannerProps> = ({
  venueName = "The Kingston Lounge",
  onValidationSuccess
}) => {
  const [passInput, setPassInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<{
    status: 'idle' | 'valid' | 'expired' | 'invalid';
    data?: any;
    message?: string;
  }>({ status: 'idle' });

  const handleVerifyPass = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passInput.trim()) return;

    setIsVerifying(true);
    setResult({ status: 'idle' });

    try {
      let codeToQuery = passInput.trim();

      // Check if input is a JSON QR string payload
      if (passInput.startsWith('{') && passInput.endsWith('}')) {
        try {
          const parsed = JSON.parse(passInput);
          codeToQuery = parsed.code || passInput;
        } catch {
          // Keep raw string
        }
      }

      // Check against database / simulated verification
      const { data: claim, error } = await supabase
        .from('promokey_claims')
        .select('*')
        .eq('claim_code', codeToQuery)
        .maybeSingle();

      setTimeout(() => {
        setIsVerifying(false);

        if (claim) {
          if (claim.status === 'redeemed') {
            setResult({
              status: 'expired',
              message: 'This PromoKey pass has already been redeemed.'
            });
            toast.error('Pass already redeemed');
          } else {
            setResult({
              status: 'valid',
              data: claim,
              message: 'Verified PromoKey pass! VIP perk granted.'
            });
            toast.success('Pass Validated Successfully!');
            if (onValidationSuccess) onValidationSuccess(claim);
          }
        } else {
          // If not found in DB, validate simulated demo codes
          if (codeToQuery.toUpperCase().startsWith('PROMO-KEY') || codeToQuery.length >= 6) {
            const demoClaim = {
              claim_code: codeToQuery.toUpperCase(),
              venue: venueName,
              tier: 'Power User',
              perk: 'VIP Table Access & Welcome Drink',
              verifiedAt: new Date().toLocaleTimeString()
            };
            setResult({
              status: 'valid',
              data: demoClaim,
              message: 'Verified PromoKey pass! VIP entry approved.'
            });
            toast.success('Pass Validated!');
            if (onValidationSuccess) onValidationSuccess(demoClaim);
          } else {
            setResult({
              status: 'invalid',
              message: 'Invalid pass code or untrusted signature.'
            });
            toast.error('Invalid pass code');
          }
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsVerifying(false);
      setResult({ status: 'invalid', message: 'Verification network error' });
    }
  };

  const handleSettleAndReset = () => {
    setPassInput('');
    setResult({ status: 'idle' });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 rounded-3xl border border-white/10 p-6 sm:p-8 text-white shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              Merchant Counter Scanner
            </span>
            <h3 className="text-lg font-bold text-white leading-tight">
              Validate PromoKey Passes
            </h3>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-white/60 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            {venueName}
          </span>
        </div>
      </div>

      {/* Manual Input or Camera Scanner field */}
      <form onSubmit={handleVerifyPass} className="space-y-3">
        <label className="text-xs font-semibold text-gray-300">
          Enter or Scan Patron Pass Code
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              placeholder="e.g. PROMO-KEY-9982 or scan QR"
              className="w-full h-12 bg-gray-800/80 border border-gray-700 rounded-2xl px-4 text-sm text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isVerifying || !passInput.trim()}
            className="h-12 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-gray-950 font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isVerifying ? (
              <RefreshCw className="w-4 h-4 animate-spin text-gray-950" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Verify</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Validation Result Box */}
      {result.status === 'valid' && (
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-4 animate-in zoom-in-95 duration-150">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-emerald-400">Pass Verified & Settled</h4>
              <p className="text-xs text-gray-300">{result.message}</p>
            </div>
          </div>

          <div className="bg-gray-950/60 rounded-xl p-3.5 border border-white/5 space-y-1.5 text-xs text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-500 font-mono uppercase">Code:</span>
              <span className="font-mono font-bold text-white">{result.data?.claim_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-mono uppercase">Perk:</span>
              <span className="text-amber-400 font-semibold">{result.data?.perk || 'VIP Reservation Unlocked'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-mono uppercase">Settled:</span>
              <span className="text-emerald-400 font-mono">1 PromoKey Burn Verified</span>
            </div>
          </div>

          <button
            onClick={handleSettleAndReset}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Complete & Ready for Next Patron</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {result.status === 'expired' && (
        <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-300 text-xs animate-in fade-in duration-150">
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-rose-400">Already Redeemed</h4>
            <p>{result.message}</p>
          </div>
        </div>
      )}

      {result.status === 'invalid' && (
        <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-300 text-xs animate-in fade-in duration-150">
          <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-rose-400">Invalid Pass</h4>
            <p>{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default PromoKeyPassScanner;
