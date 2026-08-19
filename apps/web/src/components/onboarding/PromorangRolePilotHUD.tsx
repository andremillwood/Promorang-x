import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  ChevronDown,
  ChevronUp,
  Minimize2,
  CheckCircle2,
  Compass,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import {
  ROLE_PILOT_CONFIGS,
  PilotRoleId,
  RoleTourConfig
} from '@/config/rolePilotConfig';

const STORAGE_ACTIVE_KEY = 'promorang_role_pilot_active';
const STORAGE_ROLE_KEY = 'promorang_role_pilot_role';
const STORAGE_STEP_KEY = 'promorang_role_pilot_step';

export function PromorangRolePilotHUD() {
  const location = useLocation();
  const navigate = useNavigate();

  const [active, setActive] = useState(false);
  const [currentRole, setCurrentRole] = useState<PilotRoleId>('explorer');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Sync state with URL params & session storage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pilotParam = params.get('pilot') as PilotRoleId | null;
    const stepParam = params.get('step');

    if (pilotParam && ROLE_PILOT_CONFIGS[pilotParam]) {
      setActive(true);
      setCurrentRole(pilotParam);
      sessionStorage.setItem(STORAGE_ACTIVE_KEY, 'true');
      sessionStorage.setItem(STORAGE_ROLE_KEY, pilotParam);

      if (stepParam) {
        const stepNum = parseInt(stepParam, 10);
        const tour = ROLE_PILOT_CONFIGS[pilotParam];
        const idx = Math.max(0, Math.min(tour.steps.length - 1, stepNum - 1));
        setCurrentStepIdx(idx);
        sessionStorage.setItem(STORAGE_STEP_KEY, idx.toString());
      }
    } else {
      const storedActive = sessionStorage.getItem(STORAGE_ACTIVE_KEY);
      const storedRole = sessionStorage.getItem(STORAGE_ROLE_KEY) as PilotRoleId | null;
      const storedStep = sessionStorage.getItem(STORAGE_STEP_KEY);

      if (storedActive === 'true' && storedRole && ROLE_PILOT_CONFIGS[storedRole]) {
        setActive(true);
        setCurrentRole(storedRole);
        if (storedStep) {
          setCurrentStepIdx(parseInt(storedStep, 10) || 0);
        }
      }
    }
  }, [location]);

  // Listen for custom launch events from anywhere in the app (e.g. Header button)
  useEffect(() => {
    const handleLaunchTour = (event: CustomEvent<{ role?: PilotRoleId }>) => {
      const targetRole = event.detail?.role && ROLE_PILOT_CONFIGS[event.detail.role]
        ? event.detail.role
        : 'explorer';
      setActive(true);
      setMinimized(false);
      setCurrentRole(targetRole);
      setCurrentStepIdx(0);
      sessionStorage.setItem(STORAGE_ACTIVE_KEY, 'true');
      sessionStorage.setItem(STORAGE_ROLE_KEY, targetRole);
      sessionStorage.setItem(STORAGE_STEP_KEY, '0');
      navigate(ROLE_PILOT_CONFIGS[targetRole].steps[0].path);
    };

    window.addEventListener('promorang:start-role-pilot' as any, handleLaunchTour);
    return () => {
      window.removeEventListener('promorang:start-role-pilot' as any, handleLaunchTour);
    };
  }, [navigate]);

  if (!active) return null;

  // Don't display HUD on Midas proposal demo to avoid clashing with MidasDemonstrationTour
  const searchParams = new URLSearchParams(location.search);
  if (searchParams.get('demo') === 'midas' || location.pathname.startsWith('/proposals/midas')) {
    return null;
  }

  const roleConfig: RoleTourConfig = ROLE_PILOT_CONFIGS[currentRole] || ROLE_PILOT_CONFIGS.explorer;
  const currentStep = roleConfig.steps[currentStepIdx] || roleConfig.steps[0];
  const StepIcon = currentStep.icon;
  const RoleIcon = roleConfig.icon;

  const handleStepJump = (idx: number) => {
    setCurrentStepIdx(idx);
    sessionStorage.setItem(STORAGE_STEP_KEY, idx.toString());
    navigate(roleConfig.steps[idx].path);
  };

  const handleNext = () => {
    if (currentStepIdx < roleConfig.steps.length - 1) {
      handleStepJump(currentStepIdx + 1);
    } else {
      // Completed current role tour
      handleExit();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      handleStepJump(currentStepIdx - 1);
    }
  };

  const handleRoleChange = (role: PilotRoleId) => {
    setCurrentRole(role);
    setCurrentStepIdx(0);
    setShowRoleMenu(false);
    sessionStorage.setItem(STORAGE_ROLE_KEY, role);
    sessionStorage.setItem(STORAGE_STEP_KEY, '0');
    navigate(ROLE_PILOT_CONFIGS[role].steps[0].path);
  };

  const handleExit = () => {
    setActive(false);
    sessionStorage.removeItem(STORAGE_ACTIVE_KEY);
    sessionStorage.removeItem(STORAGE_ROLE_KEY);
    sessionStorage.removeItem(STORAGE_STEP_KEY);
  };

  const handleReset = () => {
    handleStepJump(0);
  };

  // Minimized Floating Pill Mode
  if (minimized) {
    return (
      <aside aria-label="Role Pilot HUD Minimized" className="fixed bottom-6 right-6 z-50 animate-in fade-in zoom-in duration-200">
        <button
          onClick={() => setMinimized(false)}
          className="bg-stone-900/95 border-2 text-white px-4 py-2.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-2.5 hover:scale-105 transition-all text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-xl"
          style={{ borderColor: roleConfig.themeColor }}
        >
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: roleConfig.themeColor }} />
          <span>{roleConfig.name} Pilot ({currentStep.step}/{roleConfig.steps.length})</span>
          <ChevronUp className="w-3.5 h-3.5" style={{ color: roleConfig.themeColor }} />
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Universal Role Pilot HUD" className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-8 sm:max-w-2xl z-50 animate-in slide-in-from-bottom-6 duration-300">
      <div className="bg-stone-950/95 backdrop-blur-2xl border-2 border-stone-800 rounded-lg p-5 sm:p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.95)] text-stone-100 space-y-4 font-sans">
        
        {/* Top Control Ribbon */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2 relative">
            <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_0_3px_rgba(255,255,255,0.1)]" style={{ backgroundColor: roleConfig.themeColor }} />
            
            {/* Role dropdown switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-800/80 hover:bg-stone-700 text-xs font-mono font-black uppercase tracking-wider text-white transition-colors"
                title="Switch guided role perspective"
              >
                <RoleIcon className="w-3.5 h-3.5" style={{ color: roleConfig.themeColor }} />
                <span>{roleConfig.name} Path</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-stone-900 border border-stone-700 rounded-md shadow-2xl py-1 z-50">
                  <div className="px-3 py-1 text-[10px] font-mono text-stone-400 uppercase tracking-widest border-b border-stone-800">
                    Switch Role Pilot
                  </div>
                  {(Object.keys(ROLE_PILOT_CONFIGS) as PilotRoleId[]).map((rKey) => {
                    const r = ROLE_PILOT_CONFIGS[rKey];
                    const RIcon = r.icon;
                    const isSelected = rKey === currentRole;
                    return (
                      <button
                        key={rKey}
                        onClick={() => handleRoleChange(rKey)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-stone-800 transition-colors ${
                          isSelected ? 'font-bold text-white bg-stone-800/50' : 'text-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <RIcon className="w-4 h-4" style={{ color: r.themeColor }} />
                          <span>{r.name}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <span className="text-stone-600 text-xs">/</span>
            <span className="text-xs font-mono text-amber-400 font-bold">
              Step {currentStep.step} of {roleConfig.steps.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              className="text-stone-400 hover:text-white p-1 rounded hover:bg-stone-800 transition-colors"
              title="Restart current role tour"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMinimized(true)}
              className="text-stone-400 hover:text-white p-1 rounded hover:bg-stone-800 transition-colors"
              title="Minimize Pilot HUD"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExit}
              className="text-stone-400 hover:text-rose-400 p-1 rounded hover:bg-stone-800 transition-colors"
              title="Close Guide"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border ${currentStep.badgeColor}`}>
              {currentStep.stage}
            </span>
            <span className="text-[11px] text-stone-400 font-mono hidden sm:inline">
              Promorang Experiential Co-Pilot
            </span>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-white shrink-0 mt-0.5">
              <StepIcon className="w-5 h-5" style={{ color: roleConfig.themeColor }} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                {currentStep.title}
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                {currentStep.insight}
              </p>
            </div>
          </div>
        </div>

        {/* Multi-step progress dots */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {roleConfig.steps.map((s, idx) => {
            const isDone = idx < currentStepIdx;
            const isCur = idx === currentStepIdx;
            return (
              <button
                key={s.step}
                onClick={() => handleStepJump(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  isCur
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : isDone
                    ? 'bg-emerald-500'
                    : 'bg-stone-800 hover:bg-stone-700'
                }`}
                title={`Jump to Step ${s.step}: ${s.title}`}
              />
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-1 gap-2">
          <button
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className={`px-3 py-2 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
              currentStepIdx === 0
                ? 'opacity-30 cursor-not-allowed text-stone-500'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg"
              style={{ backgroundColor: roleConfig.themeColor }}
            >
              <span>{currentStep.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
