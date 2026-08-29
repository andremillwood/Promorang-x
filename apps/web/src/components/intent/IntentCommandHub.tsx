import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Sparkles,
  CalendarPlus,
  Flame,
  Target,
  ShoppingBag,
  Users,
  ArrowRight,
  Clock,
  Compass,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SwipeRail } from '@/components/ui/SwipeRail';
import { useUserIntentContinuity, UserIntentCategory, UserGoalOption } from '@/hooks/useUserIntentContinuity';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nContext';

const iconMap: Record<string, React.ReactNode> = {
  Ticket: <Ticket className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  CalendarPlus: <CalendarPlus className="h-5 w-5" />,
  Flame: <Flame className="h-5 w-5" />,
  Target: <Target className="h-5 w-5" />,
  ShoppingBag: <ShoppingBag className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />
};

export const IntentCommandHub: React.FC = () => {
  const { t } = useI18n();
  const { user, profile } = useAuth();
  const { relevantGoals, allGoals, selectIntent, lastIntent } = useUserIntentContinuity();
  const [selectedCategory, setSelectedCategory] = useState<UserIntentCategory>('all');

  const categories: { id: UserIntentCategory; label: string }[] = [
    { id: 'all', label: t("intentHub.catAll") },
    { id: 'earn', label: t("intentHub.catEarn") },
    { id: 'host', label: t("intentHub.catHost") },
    { id: 'promote', label: t("intentHub.catPromote") },
    { id: 'sell', label: t("intentHub.catSell") },
    { id: 'grow', label: t("intentHub.catGrow") }
  ];

  const filteredGoals = (selectedCategory === 'all' ? relevantGoals : allGoals.filter(g => g.category === selectedCategory));
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'there';

  return (
    <section className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#18181b] via-[#111113] to-[#09090b] p-6 sm:p-8 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              {t("intentHub.eyebrow")}
            </span>
          </div>
          <h2 className="mt-1 font-sans text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t("intentHub.title", { name: displayName })}
          </h2>
          <p className="text-xs sm:text-sm text-white/60">
            {t("intentHub.subtitle")}
          </p>
        </div>

        <Badge variant="outline" className="self-start sm:self-auto border-primary/40 bg-primary/10 text-primary px-3 py-1 font-semibold text-xs">
          ⚡ {t("intentHub.launcher")}
        </Badge>
      </div>

      {/* Category Pills */}
      <SwipeRail compact fadeFrom="from-black" showDots={false} className="mt-5" scrollerClassName="items-center gap-2 pb-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            aria-selected={selectedCategory === cat.id}
            className={`shrink-0 snap-start rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
              selectedCategory === cat.id
                ? 'bg-primary text-white shadow-[0_2px_10px_rgba(255,85,0,0.35)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </SwipeRail>

      {/* Action Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGoals.map((goal) => {
          const isLastUsed = lastIntent === goal.id;

          return (
            <Link
              key={goal.id}
              to={goal.href}
              onClick={() => selectIntent(goal.id)}
              className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                isLastUsed
                  ? 'border-primary/50 bg-gradient-to-b from-primary/15 via-[#1a1410] to-[#120e0b]'
                  : 'border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.06]'
              }`}
            >
              {isLastUsed && (
                <div className="absolute -top-2.5 right-4">
                  <Badge className="bg-primary text-white border-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-md">
                    {t("intentHub.recentFocus")}
                  </Badge>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-200">
                    {iconMap[goal.iconName] || <Compass className="h-5 w-5" />}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/50">
                    <Clock className="h-3 w-3" />
                    <span>{goal.timeEst}</span>
                  </div>
                </div>

                <h3 className="mt-4 font-sans text-base font-bold text-white group-hover:text-primary transition-colors">
                  {goal.title}
                </h3>
                <p className="mt-1 text-xs text-white/60 line-clamp-2 leading-relaxed">
                  {goal.description}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                  {t("intentHub.startObjective")} <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
                {goal.badge && (
                  <Badge variant="secondary" className="bg-white/10 text-white/80 text-[10px]">
                    {goal.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
