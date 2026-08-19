import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  ScanLine, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  MapPin, 
  Clock, 
  ShieldCheck,
  Search,
  ArrowRight
} from 'lucide-react';

export default function MerchantScannerPage() {
  const navigate = useNavigate();
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    status: 'VALID' | 'INVALID' | 'EXPIRED' | 'REDEEMED';
    perk?: string;
    venueName?: string;
    claimedBy?: string;
    code?: string;
  } | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoCodeInput.trim().toUpperCase();

    if (!cleanCode) return;

    if (cleanCode.startsWith('PROMO-KEY') || cleanCode === 'VALID') {
      setVerificationResult({
        status: 'VALID',
        code: cleanCode,
        perk: '35% off Signature Chef Tasting Menu + Complimentary Pairing',
        venueName: 'Marketplace Bistro & Lounge',
        claimedBy: 'Andre M. (Founding Member)'
      });
    } else if (cleanCode === 'EXPIRED') {
      setVerificationResult({
        status: 'EXPIRED',
        code: cleanCode,
        perk: 'Expired PromoKey Perk',
        venueName: 'Marketplace Bistro'
      });
    } else if (cleanCode === 'REDEEMED') {
      setVerificationResult({
        status: 'REDEEMED',
        code: cleanCode,
        perk: 'Already Redeemed at 7:14 PM',
        venueName: 'Marketplace Bistro'
      });
    } else {
      setVerificationResult({
        status: 'INVALID',
        code: cleanCode
      });
    }
  };

  const handleConfirmRedemption = () => {
    alert(`PromoKey ${verificationResult?.code} successfully redeemed!`);
    setVerificationResult(null);
    setPromoCodeInput('');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans p-6 flex flex-col justify-between">
      <div className="max-w-md mx-auto w-full">
        
        {/* Top Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl">
            <ScanLine className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              On-Site Venue Staff Verification
            </span>
            <h1 className="text-xl font-black text-white">Merchant PromoKey Scanner</h1>
          </div>
        </div>

        {/* Manual Code Input Form */}
        <form onSubmit={handleVerify} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl shadow-xl mb-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Enter / Scan PromoKey Code
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={promoCodeInput}
                onChange={e => setPromoCodeInput(e.target.value)}
                placeholder="e.g. PROMO-KEY-9982"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-4 pr-10 py-3 text-sm font-mono text-white placeholder-gray-500 uppercase tracking-wider focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs rounded-lg text-white"
              >
                Verify
              </button>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 text-center">
            Tip: Type <span className="text-emerald-400 font-mono">PROMO-KEY-9982</span> to simulate a valid customer redemption.
          </p>
        </form>

        {/* Verification Result Feedback Box */}
        {verificationResult && (
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl shadow-2xl animate-fadeIn space-y-4">
            
            {verificationResult.status === 'VALID' && (
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <span className="px-3 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-full inline-block">
                  CONFIRMED VALID KEY
                </span>
                <h3 className="text-base font-bold text-white leading-tight">
                  {verificationResult.perk}
                </h3>
                <div className="bg-gray-800/80 p-3 rounded-xl text-left text-xs space-y-1 text-gray-300">
                  <p><span className="text-gray-500">Customer:</span> {verificationResult.claimedBy}</p>
                  <p><span className="text-gray-500">Venue:</span> {verificationResult.venueName}</p>
                  <p><span className="text-gray-500">Code:</span> <span className="font-mono text-emerald-400 font-bold">{verificationResult.code}</span></p>
                </div>

                <button
                  onClick={handleConfirmRedemption}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 text-white"
                >
                  Confirm & Honor Perk
                </button>
              </div>
            )}

            {verificationResult.status !== 'VALID' && (
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-7 h-7" />
                </div>
                <span className="px-3 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-wider rounded-full inline-block">
                  {verificationResult.status} PROMOKEY
                </span>
                <p className="text-xs text-gray-400">
                  This code cannot be redeemed. Please ask customer to re-open their active PromoKey modal.
                </p>
                <button
                  onClick={() => setVerificationResult(null)}
                  className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 font-bold text-xs rounded-xl text-gray-200"
                >
                  Try Another Code
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      <div className="text-center text-xs text-gray-600 py-4">
        Promorang On-Site Verification System • Powered by Scene Intelligence
      </div>
    </div>
  );
}
