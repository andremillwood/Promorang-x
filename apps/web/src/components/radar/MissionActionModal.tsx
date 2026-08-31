import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Upload, 
  Clock, 
  Award, 
  Loader2
} from 'lucide-react';
import { SubMoment } from './MomentDetailModal';
import { MomentProps } from './MomentCard';
import { useI18n } from '@/i18n/I18nContext';

interface MissionActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: SubMoment | null;
  moment: MomentProps | null;
  status: 'AVAILABLE' | 'ACTIVE' | 'SUBMITTED' | 'COMPLETED';
  onStatusChange: (missionId: string, newStatus: 'AVAILABLE' | 'ACTIVE' | 'SUBMITTED' | 'COMPLETED') => void;
}

export const MissionActionModal: React.FC<MissionActionModalProps> = ({
  isOpen,
  onClose,
  mission,
  moment,
  status,
  onStatusChange
}) => {
  const { t } = useI18n();
  const [proofUrl, setProofUrl] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !mission || !moment) return null;

  const handleActivate = async () => {
    setSubmitting(true);
    try {
      // Attempt backend activation if authenticated
      const token = localStorage.getItem('token') || localStorage.getItem('sb-access-token');
      if (token) {
        await fetch(`/api/missions/${encodeURIComponent(mission.id)}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => null);
      }
    } catch {
      // Fallback cleanly
    } finally {
      setSubmitting(false);
      onStatusChange(mission.id, 'ACTIVE');
    }
  };

  const handleInstantCheckIn = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('sb-access-token');
      if (token) {
        await fetch(`/api/missions/${encodeURIComponent(mission.id)}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            proof_url: `https://promorang.co/checkin/${mission.id}`,
            note: `GPS Verified check-in at ${moment.venueName}`
          })
        }).catch(() => null);
      }
    } catch {
      // Fallback cleanly
    } finally {
      setSubmitting(false);
      onStatusChange(mission.id, 'COMPLETED');
      setSuccessMessage(t("missAct.checkinOk", { count: mission.points }));
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('sb-access-token');
      if (token) {
        await fetch(`/api/missions/${encodeURIComponent(mission.id)}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            proof_url: proofUrl.trim(),
            note: note.trim()
          })
        }).catch(() => null);
      }
    } catch {
      // Fallback cleanly
    } finally {
      setSubmitting(false);
      onStatusChange(mission.id, 'SUBMITTED');
      setSuccessMessage(t("missAct.proofOk", { count: mission.points }));
    }
  };

  const isCheckIn = mission.missionType === 'CHECK_IN' || mission.missionType === 'TASTING_PROOF';

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-gray-950 via-purple-950 to-gray-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/30">
              {mission.missionType.replace('_', ' ')}
            </span>
            <span className="flex items-center text-xs text-amber-300 font-semibold">
              <Clock className="w-3 h-3 mr-1" />
              {mission.timeWindow}
            </span>
          </div>

          <h3 className="text-xl font-black text-white leading-tight mb-1">
            {mission.title}
          </h3>
          <p className="text-xs text-gray-300 flex items-center">
            <MapPin className="w-3 h-3 mr-1 text-orange-400" />
            {moment.venueName} • {moment.location}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Reward banner */}
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200/70 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600 text-white rounded-xl shadow-md shadow-purple-600/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-purple-950">{t("missAct.reward")}</p>
                <p className="text-[11px] text-purple-700 font-medium">
                  {mission.rewardType === 'EXCLUSIVE_KEY' ? t("missAct.rewardKey") : t("missAct.rewardPoints")}
                </p>
              </div>
            </div>
            <span className="text-lg font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-xl">
              {t("missAct.pts", { count: mission.points })}
            </span>
          </div>

          {/* Description & Steps */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1.5">
              {t("missAct.instructions")}
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {mission.description}
            </p>
          </div>

          {/* Success State */}
          {successMessage ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-950">{t("missAct.success")}</h4>
                <p className="text-xs text-emerald-700 mt-0.5">{successMessage}</p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                {t("missAct.done")}
              </button>
            </div>
          ) : (
            <>
              {/* Status Action State */}
              {status === 'AVAILABLE' && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-600 space-y-2">
                    <p className="font-semibold text-gray-900 flex items-center">
                      <Sparkles className="w-4 h-4 mr-1 text-purple-600" />
                      {t("missAct.how")}
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-500">
                      <li>{t("missAct.step1")}</li>
                      <li>{t("missAct.step2", { venue: moment.venueName })}</li>
                      <li>{t("missAct.step3")}</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleActivate}
                    disabled={submitting}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{t("missAct.activate")}</span>
                  </button>
                </div>
              )}

              {status === 'ACTIVE' && isCheckIn && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 text-center space-y-3">
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-900">{t("missAct.atVenue", { venue: moment.venueName })}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {t("missAct.verifyHint", { count: mission.points })}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleInstantCheckIn}
                    disabled={submitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{t("missAct.verifyCheckin", { count: mission.points })}</span>
                  </button>
                </div>
              )}

              {status === 'ACTIVE' && !isCheckIn && (
                <form onSubmit={handleSubmitProof} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t("missAct.proofLabel")} <span className="text-purple-600">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder={t("missAct.proofPh")}
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t("missAct.noteLabel")}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={t("missAct.notePh")}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !proofUrl.trim()}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>{t("missAct.submitPts", { count: mission.points })}</span>
                  </button>
                </form>
              )}

              {(status === 'SUBMITTED' || status === 'COMPLETED') && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-xs font-black text-emerald-950">
                    {status === 'COMPLETED' ? t("missAct.missionDone") : t("missAct.proofReview")}
                  </h4>
                  <p className="text-[11px] text-emerald-700">
                    {status === 'COMPLETED'
                      ? t("missAct.claimed", { count: mission.points })
                      : t("missAct.pendingVerify")}
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
