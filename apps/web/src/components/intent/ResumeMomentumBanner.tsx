import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Clock, ArrowRight, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActiveDraftItem } from '@/hooks/useUserIntentContinuity';
import { useI18n } from '@/i18n/I18nContext';

interface ResumeMomentumBannerProps {
  draft: ActiveDraftItem | null;
  onDismiss: (draftId: string) => void;
}

export const ResumeMomentumBanner: React.FC<ResumeMomentumBannerProps> = ({ draft, onDismiss }) => {
  const { t } = useI18n();
  if (!draft) return null;

  const progressPercent = Math.round((draft.currentStep / Math.max(1, draft.totalSteps)) * 100);

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-r from-[#1c120c] via-[#2a170d] to-[#160d07] p-5 text-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(ellipse_at_top_right,rgba(255,85,0,0.18),transparent_70%)] pointer-events-none" />
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/40 shadow-inner">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/25 text-primary border border-primary/40 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                {t("intentResume.badge")}
              </Badge>
              <span className="flex items-center text-xs text-white/50">
                <Clock className="mr-1 h-3 w-3" /> {t("intentResume.step", { current: draft.currentStep.toString(), total: draft.totalSteps.toString() })}
              </span>
            </div>
            
            <h3 className="mt-1 font-sans text-base font-bold text-white tracking-tight">
              {draft.title}
            </h3>
            <p className="text-xs text-white/70">
              {draft.description}
            </p>

            {/* Micro Progress Bar */}
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-1.5 w-36 overflow-hidden rounded-full bg-white/10">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-primary">{t("intentResume.complete", { percent: progressPercent.toString() })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(draft.id)}
            className="h-9 px-3 text-xs text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="mr-1.5 h-3.5 w-3.5" /> {t("intentResume.dismiss")}
          </Button>

          <Button
            asChild
            size="sm"
            className="h-9 rounded-full bg-primary px-4 text-xs font-bold text-white shadow-[0_4px_14px_rgba(255,85,0,0.4)] hover:bg-primary/90"
          >
            <Link to={draft.resumeHref}>
              {t("intentResume.continueDraft")} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
