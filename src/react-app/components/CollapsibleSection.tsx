import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, HelpCircle } from 'lucide-react';

interface CollapsibleSectionProps {
  id?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  promptText?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  icon?: React.ElementType;
}

export default function CollapsibleSection({
  id,
  badge = 'How it works',
  title,
  subtitle,
  promptText = 'Tap to expand & learn more',
  defaultOpen = false,
  children,
  className = '',
  headerClassName = '',
  icon: Icon
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div id={id} className={`rounded-3xl border border-slate-900/10 bg-white transition-all shadow-sm ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between p-6 text-left focus:outline-none ${headerClassName}`}
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-4">
          {Icon ? (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <Icon className="h-6 w-6" />
            </div>
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Sparkles className="h-6 w-6 text-orange-400" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                {badge}
              </span>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                {isOpen ? 'Click to hide details' : promptText}
              </span>
            </div>
            <h3 className="mt-1.5 text-2xl font-black text-slate-950">{title}</h3>
            {subtitle && <p className="mt-1 text-sm font-medium text-slate-600 leading-relaxed">{subtitle}</p>}
          </div>
        </div>

        <div className="ml-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 p-6 pt-4 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}
