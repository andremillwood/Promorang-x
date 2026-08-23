import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Sparkles,
  Ticket,
  CalendarPlus,
  Flame,
  Target,
  ShoppingBag,
  Users,
  Compass,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useUserIntentContinuity, UserGoalOption } from '@/hooks/useUserIntentContinuity';
import { useI18n } from '@/i18n/I18nContext';

const iconMap: Record<string, React.ReactNode> = {
  Ticket: <Ticket className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
  CalendarPlus: <CalendarPlus className="h-4 w-4" />,
  Flame: <Flame className="h-4 w-4" />,
  Target: <Target className="h-4 w-4" />,
  ShoppingBag: <ShoppingBag className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />
};

export const IntentGoalModal: React.FC = () => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { allGoals, selectIntent } = useUserIntentContinuity();
  const navigate = useNavigate();

  // Listen for custom event or keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };

    const handleOpenEvent = () => setOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('promorang:open-intent-modal' as any, handleOpenEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('promorang:open-intent-modal' as any, handleOpenEvent);
    };
  }, []);

  const filteredGoals = allGoals.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase()) ||
    g.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectGoal = (goal: UserGoalOption) => {
    selectIntent(goal.id);
    setOpen(false);
    navigate(goal.href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl bg-[#121215] text-white border-white/15 p-0 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/10">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <DialogTitle className="text-lg font-bold text-white">
                {t("intentModal.title")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-white/60">
              {t("intentModal.subtitle")}
            </DialogDescription>
          </DialogHeader>

          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("intentModal.placeholder")}
              className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary rounded-xl"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => handleSelectGoal(goal)}
              className="group flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  {iconMap[goal.iconName] || <Compass className="h-4 w-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white group-hover:text-primary transition-colors">
                      {goal.title}
                    </span>
                    {goal.badge && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-primary/30 text-primary bg-primary/10">
                        {goal.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-white/55 line-clamp-1">
                    {goal.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-white/40 group-hover:text-primary transition-colors">
                <span className="text-[11px] flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {goal.timeEst}
                </span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}

          {filteredGoals.length === 0 && (
            <div className="py-10 text-center text-white/50 text-sm">
              {t("intentModal.noResults", { query: search })}
            </div>
          )}
        </div>

        <div className="p-3 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-[11px] text-white/40 px-5">
          <span>{t("intentModal.protip", { key: "Cmd+K" })}</span>
          <span>{t("intentModal.footerTag")}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
