import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Layers,
  FileText
} from 'lucide-react';

export const DEMO_STEPS = [
  {
    step: 1,
    stage: 'STAGE 01 · ATTENDEE INTENT CAPTURE',
    title: 'Consumer Discovery Poll',
    path: '/discover?demo=midas&step=1',
    executiveInsight: 'The attendee taps "Beach party" or "Conscious live show" in 5 seconds. Contact ID is captured immediately without a tedious survey barrier.',
    actionLabel: 'Next: View Beach Party Experience ➔',
    icon: HelpCircle,
    badgeColor: 'text-[#ff5a1f] bg-[#ff5a1f15] border-[#ff5a1f33]'
  },
  {
    step: 2,
    stage: 'STAGE 02 · EVENT EXPERIENCE & PERKS',
    title: 'Sophisticated Beach Party Moment',
    path: '/moments/sophisticated?demo=midas&step=2',
    executiveInsight: 'Attendees see Vanessa Bling billing, the hosted drinks window (4–7 PM), and claim an Express Entry pass by inviting 2 friends on WhatsApp.',
    actionLabel: 'Next: View Capleton Reggae Concert ➔',
    icon: Ticket,
    badgeColor: 'text-[#ff5a1f] bg-[#ff5a1f15] border-[#ff5a1f33]'
  },
  {
    step: 3,
    stage: 'STAGE 03 · BRAND DISAMBIGUATION',
    title: 'Encore Live featuring Capleton',
    path: '/moments/encore-live-featuring-capleton?demo=midas&step=3',
    executiveInsight: 'Capleton\'s conscious concert is strictly separated from any weekly club night, protecting Midas\'s standalone event equity.',
    actionLabel: 'Next: View Canonical Venue Hub ➔',
    icon: Radio,
    badgeColor: 'text-[#a855f7] bg-[#a855f715] border-[#a855f733]'
  },
  {
    step: 4,
    stage: 'STAGE 04 · CANONICAL LOCATION ANCHOR',
    title: 'Plantation Cove Official Venue Hub',
    path: '/venues/plantation-cove?demo=midas&step=4',
    executiveInsight: 'Both Midas events sit under this single persistent venue profile, building long-term GPS authority and repeat check-in data.',
    actionLabel: 'Next: View Promoter Intelligence Dashboard ➔',
    icon: MapPin,
    badgeColor: 'text-[#10b981] bg-[#10b98115] border-[#10b98133]'
  },
  {
    step: 5,
    stage: 'STAGE 05 · PROMOTER CRM & ATTRIBUTION',
    title: 'Promoter Intelligence Dashboard',
    path: '/dashboard/merchant?demo=midas&step=5',
    executiveInsight: 'Midas monitors real-time voter counts, verified attendee phone numbers, referral squad depth, and gate check-in throughput.',
    actionLabel: 'Finish & Return to Midas Brief ➔',
    icon: BarChart3,
    badgeColor: 'text-[#3b82f6] bg-[#3b82f615] border-[#3b82f633]'
  }
];

export function MidasDemonstrationTour() {
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('demo') === 'midas') {
      setActive(true);
      const stepNum = parseInt(params.get('step') || '1', 10);
      const idx = Math.max(0, Math.min(DEMO_STEPS.length - 1, stepNum - 1));
      setCurrentStepIdx(idx);
    } else {
      const stored = sessionStorage.getItem('promorang_midas_demo_active');
      if (stored === 'true') {
        setActive(true);
      }
    }
  }, [location]);

  if (!active) return null;

  const currentStep = DEMO_STEPS[currentStepIdx] || DEMO_STEPS[0];
  const StepIcon = currentStep.icon;

  const handleStepJump = (idx: number) => {
    setCurrentStepIdx(idx);
    navigate(DEMO_STEPS[idx].path);
  };

  const handleNext = () => {
    if (currentStepIdx < DEMO_STEPS.length - 1) {
      handleStepJump(currentStepIdx + 1);
    } else {
      sessionStorage.removeItem('promorang_midas_demo_active');
      navigate('/proposals/midas');
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      handleStepJump(currentStepIdx - 1);
    } else {
      navigate('/proposals/midas');
    }
  };

  const handleExit = () => {
    setActive(false);
    sessionStorage.removeItem('promorang_midas_demo_active');
    navigate('/proposals/midas');
  };

  // Minimized Floating Pill Mode
  if (minimized) {
    return (
      <aside aria-label="Midas Demonstration Tour Quick Access" className="fixed bottom-6 right-6 z-50 animate-in fade-in zoom-in duration-200">
        <button
          onClick={() => setMinimized(false)}
          className="bg-[#0f0d0b]/95 border-2 border-[#ff5a1f] text-white px-4 py-2.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(255,90,31,0.25)] flex items-center gap-2.5 hover:scale-105 transition-all text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-xl"
        >
          <span className="w-2 h-2 rounded-full bg-[#ff5a1f] animate-pulse" />
          <span>Midas Purview HUD (Step {currentStep.step}/5)</span>
          <ChevronUp className="w-3.5 h-3.5 text-[#ff5a1f]" />
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Midas Executive Purview HUD" className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-8 sm:max-w-2xl z-50 animate-in slide-in-from-bottom-6 duration-300">
      <div className="bg-[#0f0d0b]/95 backdrop-blur-2xl border-2 border-[#ffffff20] rounded-sm p-5 sm:p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9),0_0_20px_rgba(255,90,31,0.15)] text-[#f4efe5] space-y-4 font-sans">
        
        {/* Top Control Ribbon */}
        <div className="flex items-center justify-between border-b border-[#ffffff15] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff5a1f] shadow-[0_0_0_3px_#ff5a1f33]" />
            <span className="text-[11px] font-mono font-black uppercase tracking-widest text-[#f4efe5]">
              Midas Executive Purview
            </span>
            <span className="text-stone-500 text-xs">/</span>
            <span className="text-xs font-mono text-[#ffcf38] font-bold">
              Step {currentStep.step} of {DEMO_STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to="/proposals/midas"
              className="text-[11px] font-mono text-stone-400 hover:text-white px-2 py-1 rounded-sm hover:bg-[#ffffff10] transition-colors flex items-center gap-1"
              title="Return to Midas Commercial Brief"
            >
              <FileText className="w-3 h-3 text-[#ff5a1f]" />
              <span className="hidden sm:inline">Proposal Brief</span>
            </Link>
            <button
              onClick={() => setMinimized(true)}
              className="text-stone-400 hover:text-white p-1 rounded-sm hover:bg-[#ffffff10] transition-colors"
              title="Minimize Purview HUD"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExit}
              className="text-stone-400 hover:text-white p-1 rounded-sm hover:bg-[#ffffff10] transition-colors"
              title="Exit Walkthrough"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step Header & Executive Insight */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-sm bg-[#ffffff08] border border-[#ffffff15] text-[#ff5a1f] flex-shrink-0 mt-0.5">
            <StepIcon className="w-5 h-5" />
          </div>
          
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 border rounded-sm ${currentStep.badgeColor}`}>
                {currentStep.stage}
              </span>
            </div>

            <h4 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
              {currentStep.title}
            </h4>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              {currentStep.executiveInsight}
            </p>
          </div>
        </div>

        {/* Interactive Step Pill Breadcrumbs */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {DEMO_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => handleStepJump(idx)}
              className={`py-1 text-center font-mono text-[10px] uppercase font-bold border transition-all rounded-sm ${
                currentStepIdx === idx
                  ? 'bg-[#ff5a1f] border-[#ff5a1f] text-white font-black shadow-[2px_2px_0_#000]'
                  : currentStepIdx > idx
                  ? 'bg-[#10b98120] border-[#10b98140] text-[#10b981]'
                  : 'bg-[#ffffff05] border-[#ffffff15] text-stone-500 hover:text-white hover:border-[#ffffff30]'
              }`}
            >
              <span className="hidden sm:inline">Stage </span>0{s.step}
            </button>
          ))}
        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[#ffffff15] gap-3">
          <button
            onClick={handlePrev}
            className="px-3.5 py-2 rounded-sm bg-[#ffffff08] hover:bg-[#ffffff15] text-stone-300 hover:text-white text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{currentStepIdx === 0 ? 'Proposal' : 'Back'}</span>
          </button>

          <button
            onClick={handleNext}
            className="flex-1 sm:flex-initial bg-[#ff5a1f] hover:bg-[#ff6b35] text-white text-xs font-mono font-bold px-5 py-2.5 rounded-sm transition-all shadow-[4px_4px_0_#000] flex items-center justify-center gap-2 uppercase tracking-wider active:translate-x-[1px] active:translate-y-[1px]"
          >
            <span>{currentStep.actionLabel}</span>
          </button>
        </div>

      </div>
    </aside>
  );
}
