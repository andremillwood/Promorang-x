import React from 'react';
import ModalBase from './ModalBase';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export interface ExplainerContent {
  title: string;
  subtitle: string;
  badge?: string;
  steps: {
    number: string;
    title: string;
    description: string;
    tip?: string;
  }[];
  ctaText?: string;
  onCtaClick?: () => void;
}

interface ExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ExplainerContent | null;
}

export default function ExplainerModal({
  isOpen,
  onClose,
  content
}: ExplainerModalProps) {
  if (!content) return null;

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-6">
        {/* Header section */}
        <div className="space-y-2">
          {content.badge && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
              <Sparkles className="h-3.5 w-3.5" />
              {content.badge}
            </span>
          )}
          <h2 className="text-2xl font-black text-slate-900">{content.title}</h2>
          <p className="text-base text-slate-600 leading-relaxed">{content.subtitle}</p>
        </div>

        {/* Steps list */}
        <div className="space-y-4">
          {content.steps.map((step) => (
            <div
              key={step.number}
              className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-orange-600 text-sm font-black text-white shadow-md shadow-orange-600/20">
                {step.number}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">{step.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                {step.tip && (
                  <p className="inline-flex items-center gap-1 pt-1 text-xs font-bold text-orange-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Pro tip: {step.tip}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="text-sm font-bold text-slate-500 hover:text-slate-900"
          >
            Got it, thanks
          </button>

          {content.ctaText && (
            <button
              onClick={() => {
                onClose();
                if (content.onCtaClick) content.onCtaClick();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
            >
              {content.ctaText}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </ModalBase>
  );
}
