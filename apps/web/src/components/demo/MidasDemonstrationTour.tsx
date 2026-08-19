import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  ExternalLink,
  HelpCircle,
  Ticket,
  Radio,
  MapPin,
  BarChart3,
  CheckCircle2,
  Share2
} from 'lucide-react';

export const DEMO_STEPS = [
  {
    step: 1,
    title: 'Top-of-Funnel Discovery Poll',
    path: '/discover?demo=midas&step=1',
    description: 'Vote on "How are you ending summer 2026?" to cast a real intent signal without filling a survey.',
    cta: 'Vote in poll below, then proceed to Step 2 ➔',
    icon: HelpCircle,
    nextPath: '/moments/sophisticated?demo=midas&step=2'
  },
  {
    step: 2,
    title: 'Sophisticated Beach Party Moment',
    path: '/moments/sophisticated?demo=midas&step=2',
    description: 'Vanessa Bling live headliner, hosted drinks timeline (4–7 PM), and J$5,000 pre-sold ticket access.',
    cta: 'Click "Join Moment" to earn 200 pts, then view Encore Live ➔',
    icon: Ticket,
    nextPath: '/moments/encore-live-featuring-capleton?demo=midas&step=3'
  },
  {
    step: 3,
    title: 'Encore Live featuring Capleton',
    path: '/moments/encore-live-featuring-capleton?demo=midas&step=3',
    description: 'Capleton live reggae concert at Plantation Cove, strictly separated from any weekly club night.',
    cta: 'Next: Explore the Plantation Cove canonical venue node ➔',
    icon: Radio,
    nextPath: '/venues/plantation-cove?demo=midas&step=4'
  },
  {
    step: 4,
    title: 'Canonical Venue: Plantation Cove',
    path: '/venues/plantation-cove?demo=midas&step=4',
    description: 'Verified GPS location (18.45509° N, -77.23241° W) in St. Ann hosting both Midas Moments.',
    cta: 'Next: See how attendee data flows into the Promoter Dashboard ➔',
    icon: MapPin,
    nextPath: '/dashboard/merchant?demo=midas&step=5'
  },
  {
    step: 5,
    title: 'Promoter Intelligence & CRM Dashboard',
    path: '/dashboard/merchant?demo=midas&step=5',
    description: 'Real-time metrics: Discovery completions, contact captures, referral trees, and check-ins.',
    cta: 'Review Complete! Return to the Midas Proposal ➔',
    icon: BarChart3,
    nextPath: '/proposals/midas'
  }
];

export function MidasDemonstrationTour() {
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('demo') === 'midas') {
      setActive(true);
      const stepNum = parseInt(params.get('step') || '1', 10);
      const idx = Math.max(0, Math.min(DEMO_STEPS.length - 1, stepNum - 1));
      setCurrentStepIdx(idx);
    } else {
      // Check if path matches and tour was previously active
      const stored = sessionStorage.getItem('promorang_midas_demo_active');
      if (stored === 'true') {
        setActive(true);
      }
    }
  }, [location]);

  if (!active) return null;

  const currentStep = DEMO_STEPS[currentStepIdx] || DEMO_STEPS[0];
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    if (currentStepIdx < DEMO_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      navigate(DEMO_STEPS[nextIdx].path);
    } else {
      sessionStorage.removeItem('promorang_midas_demo_active');
      navigate('/proposals/midas');
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      navigate(DEMO_STEPS[prevIdx].path);
    } else {
      navigate('/proposals/midas');
    }
  };

  const handleExit = () => {
    setActive(false);
    sessionStorage.removeItem('promorang_midas_demo_active');
    navigate('/proposals/midas');
  };

  return (
    <aside aria-label="Midas Demonstration Tour" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-xl z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#0f0c0a]/95 backdrop-blur-xl border border-orange-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-orange-950/80 text-white space-y-3">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="bg-orange-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">
              Live Walkthrough Mode
            </span>
            <span className="text-white/60 text-xs font-mono">
              Step {currentStep.step} of {DEMO_STEPS.length}
            </span>
          </div>
          <button
            onClick={handleExit}
            className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Exit Walkthrough"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Body */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/20 text-orange-400 flex-shrink-0 mt-0.5">
            <StepIcon className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
              <span>{currentStep.title}</span>
            </h4>
            <p className="text-white/70 text-xs leading-relaxed">
              {currentStep.description}
            </p>
          </div>
        </div>

        {/* Actions & Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-2">
          <button
            onClick={handlePrev}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-xs font-bold transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{currentStepIdx === 0 ? 'Proposal Hub' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-950 flex items-center gap-1.5"
            >
              <span>{currentStepIdx === DEMO_STEPS.length - 1 ? 'Finish & View Proposal' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
}
