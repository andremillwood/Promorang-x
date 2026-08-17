import React from 'react';
import { X, Sparkles, CheckCircle2, Award, ArrowRight, Target, Camera, Share2, Compass, ShieldCheck } from 'lucide-react';
import { MomentProps } from './MomentCard';

export interface SubMoment {
  id: string;
  title: string;
  timeWindow: string;
  description: string;
  points: number;
  missionType: 'CHECK_IN' | 'CONTENT_DROP' | 'TASTING_PROOF' | 'BRING_FRIEND';
  rewardType: 'POINTS' | 'EXCLUSIVE_KEY' | 'BEVERAGE_TOKEN';
  status?: 'AVAILABLE' | 'COMPLETED' | 'LOCKED';
}

interface MomentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  moment: MomentProps | null;
  onClaimKey?: (id: string) => void;
}

// Dynamic context-aware Sub-Moments & Scout Missions generator based on venue & category
export function getSubMomentsForMoment(moment: MomentProps | null): SubMoment[] {
  if (!moment) return [];

  const titleLower = moment.title.toLowerCase();
  const venueLower = moment.venueName.toLowerCase();

  if (titleLower.includes('tacbar') || venueLower.includes('tacbar')) {
    return [
      {
        id: 'sub-tac-1',
        title: 'Taco Tuesday Scotch Bonnet Crunch Proof',
        timeWindow: '6:00 PM – 8:30 PM',
        description: 'Order any 3 signature tacos and verify check-in at the Devon House courtyard bar.',
        points: 50,
        missionType: 'TASTING_PROOF',
        rewardType: 'POINTS'
      },
      {
        id: 'sub-tac-2',
        title: 'Patio Margarita Photo Drop',
        timeWindow: '7:00 PM – 10:00 PM',
        description: 'Upload 1 photo tagging @tacbarjamaica & @promorang to unlock creator reward.',
        points: 75,
        missionType: 'CONTENT_DROP',
        rewardType: 'EXCLUSIVE_KEY'
      },
      {
        id: 'sub-tac-3',
        title: 'Squad Taco Round (Bring 2+ Friends)',
        timeWindow: 'All Evening',
        description: 'Scan group guest passes together at checkout for 15% table dividend.',
        points: 100,
        missionType: 'BRING_FRIEND',
        rewardType: 'BEVERAGE_TOKEN'
      }
    ];
  }

  if (titleLower.includes('pegasus') || venueLower.includes('pegasus') || venueLower.includes('24 seven')) {
    return [
      {
        id: 'sub-peg-1',
        title: 'Sunset Poolside Check-In & Welcome Spritz',
        timeWindow: '6:00 PM – 7:30 PM',
        description: 'Check in at the tropical pool bar during live acoustic opening set.',
        points: 50,
        missionType: 'CHECK_IN',
        rewardType: 'POINTS'
      },
      {
        id: 'sub-peg-2',
        title: 'Grill Master Tasting Review',
        timeWindow: '7:30 PM – 9:30 PM',
        description: 'Rate the Chef\'s jerk skewer pairing in the Discovery survey.',
        points: 75,
        missionType: 'TASTING_PROOF',
        rewardType: 'EXCLUSIVE_KEY'
      },
      {
        id: 'sub-peg-3',
        title: '24 Seven Midnight Cheesecake Run',
        timeWindow: '10:00 PM – 2:00 AM',
        description: 'Redeem your nightcap perk at 24 Seven Café inside the hotel lobby.',
        points: 60,
        missionType: 'CHECK_IN',
        rewardType: 'POINTS'
      }
    ];
  }

  if (titleLower.includes('dub club') || venueLower.includes('dub club')) {
    return [
      {
        id: 'sub-dub-1',
        title: 'Skyline Golden Hour Arrival',
        timeWindow: '8:00 PM – 9:30 PM',
        description: 'Arrive before peak selector rotation and scan entrance beacon on Jack\'s Hill.',
        points: 60,
        missionType: 'CHECK_IN',
        rewardType: 'POINTS'
      },
      {
        id: 'sub-dub-2',
        title: 'Sound System Dubplate Clip',
        timeWindow: '10:00 PM – Midnight',
        description: 'Capture 10s of audio atmosphere with live selector echo chamber.',
        points: 80,
        missionType: 'CONTENT_DROP',
        rewardType: 'EXCLUSIVE_KEY'
      }
    ];
  }

  if (titleLower.includes('tracks') || venueLower.includes('tracks') || titleLower.includes('fat wednesday')) {
    return [
      {
        id: 'sub-fat-1',
        title: 'FAT Wednesday Midweek Kickoff Check-In',
        timeWindow: '7:00 PM – 8:30 PM',
        description: 'Check in at Usain Bolt\'s Marketplace lounge and claim your digital drink stamp.',
        points: 50,
        missionType: 'CHECK_IN',
        rewardType: 'POINTS'
      },
      {
        id: 'sub-fat-2',
        title: 'Bolt Burger & Jerk Platter Review',
        timeWindow: '8:00 PM – 10:30 PM',
        description: 'Rate the signature jerk platter seasoning in the live Promorang Taste Discovery.',
        points: 75,
        missionType: 'TASTING_PROOF',
        rewardType: 'EXCLUSIVE_KEY'
      },
      {
        id: 'sub-fat-3',
        title: 'FAT Wednesday Stadium Screen Story Drop',
        timeWindow: '9:00 PM – Midnight',
        description: 'Share a 10s story clip of the 20ft big-screen sports lounge energy tagging @promorang.',
        points: 80,
        missionType: 'CONTENT_DROP',
        rewardType: 'EXCLUSIVE_KEY'
      }
    ];
  }

  if (titleLower.includes('steakhouse') || titleLower.includes('verandah') || titleLower.includes('chandon') || titleLower.includes('open house')) {
    return [
      {
        id: 'sub-chandon-1',
        title: 'Devon House Courtyard Friday Arrival',
        timeWindow: '9:00 PM – 10:30 PM',
        description: 'Scan Friday Open House beacon upon entering the historic Devon House courtyard.',
        points: 60,
        missionType: 'CHECK_IN',
        rewardType: 'POINTS'
      },
      {
        id: 'sub-chandon-2',
        title: 'Chandon Champagne & Dry-Aged Cut Pairing',
        timeWindow: '10:00 PM – Midnight',
        description: 'Submit tasting review of the chef\'s dry-aged steak cut or champagne flight.',
        points: 90,
        missionType: 'TASTING_PROOF',
        rewardType: 'EXCLUSIVE_KEY'
      },
      {
        id: 'sub-chandon-3',
        title: 'Courtyard Friday Vibe Drop',
        timeWindow: '10:30 PM – 1:00 AM',
        description: 'Upload high-vibe atmosphere visual to unlock VIP guest pass status for next Friday.',
        points: 100,
        missionType: 'CONTENT_DROP',
        rewardType: 'EXCLUSIVE_KEY'
      }
    ];
  }

  if (titleLower.includes('chilitos') || venueLower.includes('chilitos')) {
    return [
      {
        id: 'sub-chi-1',
        title: 'Hope Road Courtyard Check-in',
        timeWindow: '12:00 PM – 3:00 PM',
        description: 'Scan QR at table upon seating to claim Founding member bonus.',
        points: 40,
        missionType: 'CHECK_IN',
        rewardType: 'POINTS'
      },
      {
        id: 'sub-chi-2',
        title: 'Jamexican Fusion Taste Test',
        timeWindow: 'Lunch & Dinner',
        description: 'Review the Scotch bonnet taco sauce pairing.',
        points: 60,
        missionType: 'TASTING_PROOF',
        rewardType: 'POINTS'
      }
    ];
  }

  // Default rich sub-moments for any cultural venue
  return [
    {
      id: 'sub-gen-1',
      title: 'Scout Arrival & Verified Check-In',
      timeWindow: moment.dateDisplay,
      description: `Verify physical presence at ${moment.venueName} via GPS or QR scan.`,
      points: 50,
      missionType: 'CHECK_IN',
      rewardType: 'POINTS'
    },
    {
      id: 'sub-gen-2',
      title: 'Community Story & Vibe Drop',
      timeWindow: 'During Experience',
      description: 'Submit an authentic photo or 15-second video snippet for the Scene recap.',
      points: 75,
      missionType: 'CONTENT_DROP',
      rewardType: 'EXCLUSIVE_KEY'
    },
    {
      id: 'sub-gen-3',
      title: 'Post-Moment Discovery Review',
      timeWindow: 'Within 24 Hours',
      description: 'Vote on whether this venue should graduate into an official permanent partner.',
      points: 50,
      missionType: 'TASTING_PROOF',
      rewardType: 'POINTS'
    }
  ];
}

import { MissionActionModal } from './MissionActionModal';

export const MomentDetailModal: React.FC<MomentDetailModalProps> = ({
  isOpen,
  onClose,
  moment,
  onClaimKey
}) => {
  const [selectedMission, setSelectedMission] = React.useState<SubMoment | null>(null);
  const [missionStatuses, setMissionStatuses] = React.useState<Record<string, 'AVAILABLE' | 'ACTIVE' | 'SUBMITTED' | 'COMPLETED'>>({});

  if (!isOpen || !moment) return null;

  const subMoments = getSubMomentsForMoment(moment);
  const totalSubPoints = subMoments.reduce((sum, s) => sum + s.points, moment.pointsReward);

  const handleStatusChange = (missionId: string, newStatus: 'AVAILABLE' | 'ACTIVE' | 'SUBMITTED' | 'COMPLETED') => {
    setMissionStatuses((prev) => ({
      ...prev,
      [missionId]: newStatus
    }));
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Modal Header Image */}
          <div className="relative h-56 bg-gray-950 w-full overflow-hidden">
            <img
              src={moment.image}
              alt={moment.title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-black rounded-lg uppercase tracking-wider">
                {moment.intentType}
              </span>
              <span className="px-3 py-1 bg-amber-500/90 text-gray-950 text-xs font-black rounded-lg">
                {moment.ownership}
              </span>
            </div>

            {/* Venue & Title */}
            <div className="absolute bottom-4 left-6 right-6 text-white">
              <p className="text-xs text-amber-300 font-bold uppercase tracking-wider mb-1 flex items-center">
                <Compass className="w-3.5 h-3.5 mr-1" />
                {moment.venueName} • {moment.location}
              </p>
              <h2 className="text-xl md:text-2xl font-black leading-tight drop-shadow-md">
                {moment.title}
              </h2>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 md:p-8 max-h-[65vh] overflow-y-auto space-y-6">
            {/* Overview */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Moment Overview</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
                {moment.description}
              </p>
            </div>

            {/* Total Reward Capability */}
            <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-2xl border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-orange-500 text-white rounded-xl shadow-md shadow-orange-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-orange-950 dark:text-orange-200 font-black">Total Activation Earning Potential</p>
                  <p className="text-[11px] text-orange-800 dark:text-orange-400">Complete all sub-moments & missions</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-orange-600 dark:text-orange-400">+{totalSubPoints}</span>
                <span className="text-xs font-bold text-orange-900 dark:text-orange-300 ml-1">Points</span>
              </div>
            </div>

            {/* Sub-Moments & Live Missions Checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">
                    Sub-Moments & Scout Missions ({subMoments.length})
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Micro-Actions
                </span>
              </div>

              <div className="space-y-3">
                {subMoments.map((sub, idx) => {
                  const mStatus = missionStatuses[sub.id] || sub.status || 'AVAILABLE';
                  return (
                    <div
                      key={sub.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 border border-gray-200/80 dark:border-gray-800 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white">{sub.title}</h4>
                            <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded font-semibold">
                              {sub.timeWindow}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-normal">
                            {sub.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end space-x-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
                        <span className="text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-900/50 px-2.5 py-1 rounded-lg">
                          +{sub.points} pts
                        </span>
                        {mStatus === 'COMPLETED' ? (
                          <button
                            onClick={() => setSelectedMission(sub)}
                            className="px-3 py-1.5 bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed</span>
                          </button>
                        ) : mStatus === 'SUBMITTED' ? (
                          <button
                            onClick={() => setSelectedMission(sub)}
                            className="px-3 py-1.5 bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center space-x-1"
                          >
                            <span>Under Review ⏳</span>
                          </button>
                        ) : mStatus === 'ACTIVE' ? (
                          <button
                            onClick={() => setSelectedMission(sub)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm animate-pulse"
                          >
                            Submit Proof
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedMission(sub)}
                            className="px-3 py-1.5 bg-gray-900 dark:bg-gray-700 hover:bg-purple-600 dark:hover:bg-purple-600 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                          >
                            Start Mission
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="p-6 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {moment.ownership === 'EDITORIAL DISCOVERY' && !moment.isClaimed ? (
                <span className="text-amber-800 dark:text-amber-400 font-semibold flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1 text-amber-600 dark:text-amber-400" />
                  Unclaimed Editorial • Claim venue to host official drops
                </span>
              ) : (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center">
                  <Sparkles className="w-4 h-4 mr-1 text-emerald-600 dark:text-emerald-400" />
                  Verified Partner Moment • Instant QR scanner redemption
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {moment.ownership === 'EDITORIAL DISCOVERY' && !moment.isClaimed ? (
                <button
                  onClick={() => window.location.href = `/join/venue?venue=${encodeURIComponent(moment.venueName)}`}
                  className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Claim This Venue</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    if (onClaimKey) onClaimKey(moment.id);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Unlock PromoKey Perks</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Mission Action & Verification Drawer */}
      <MissionActionModal
        isOpen={Boolean(selectedMission)}
        onClose={() => setSelectedMission(null)}
        mission={selectedMission}
        moment={moment}
        status={selectedMission ? (missionStatuses[selectedMission.id] || selectedMission.status || 'AVAILABLE') : 'AVAILABLE'}
        onStatusChange={handleStatusChange}
      />
    </>
  );
};
