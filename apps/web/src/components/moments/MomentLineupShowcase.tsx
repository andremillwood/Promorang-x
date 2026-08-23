import React from 'react';
import {
  Music2,
  Mic2,
  Utensils,
  Camera,
  Volume2,
  Wine,
  Sparkles,
  Users,
  Building2,
  Tag,
  Share2,
  Award
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collaborator, CollaboratorRoleType } from './MomentLineupBuilder';
import { useI18n } from '@/i18n/I18nContext';

interface MomentLineupShowcaseProps {
  collaborators: Collaborator[];
  onApplyPromoCode?: (code: string) => void;
}

const roleIconMap: Record<CollaboratorRoleType, React.ReactNode> = {
  dj: <Music2 className="h-4 w-4 text-purple-400" />,
  artist: <Sparkles className="h-4 w-4 text-amber-400" />,
  comedian: <Mic2 className="h-4 w-4 text-pink-400" />,
  performer: <Sparkles className="h-4 w-4 text-rose-400" />,
  sound_lighting: <Volume2 className="h-4 w-4 text-blue-400" />,
  photographer: <Camera className="h-4 w-4 text-cyan-400" />,
  chef: <Utensils className="h-4 w-4 text-emerald-400" />,
  caterer: <Utensils className="h-4 w-4 text-emerald-400" />,
  mixologist: <Wine className="h-4 w-4 text-orange-400" />,
  host: <Users className="h-4 w-4 text-orange-400" />,
  sponsor: <Building2 className="h-4 w-4 text-yellow-400" />,
};

const roleLabelMap: Record<CollaboratorRoleType, string> = {
  dj: 'Headliner DJ',
  artist: 'Live Artist',
  comedian: 'Featured Comedian',
  performer: 'Performer',
  sound_lighting: 'Sound & Lighting AV',
  photographer: 'Official Photography',
  chef: 'Culinary Partner',
  caterer: 'Catering',
  mixologist: 'Bar & Mixology',
  host: 'Co-Host',
  sponsor: 'Brand Sponsor',
};

export const MomentLineupShowcase: React.FC<MomentLineupShowcaseProps> = ({
  collaborators,
  onApplyPromoCode,
}) => {
  const { t, formatNumber } = useI18n();
  if (!collaborators || collaborators.length === 0) return null;

  const performers = collaborators.filter((c) =>
    ['dj', 'artist', 'comedian', 'performer', 'host'].includes(c.roleType)
  );

  const productionAndFood = collaborators.filter((c) =>
    ['sound_lighting', 'photographer', 'chef', 'caterer', 'mixologist', 'sponsor'].includes(
      c.roleType
    )
  );

  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-b from-[#141417] via-[#0f0f12] to-[#09090b] p-6 sm:p-8 text-white shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {t("lineupShowcase.eyebrow")}
            </span>
          </div>
          <h3 className="mt-1 font-sans text-xl sm:text-2xl font-black text-white">
            {t("lineupShowcase.title")}
          </h3>
        </div>

        <Badge variant="outline" className="border-white/20 text-white/70 text-xs">
          {t("lineupShowcase.contributors", { count: formatNumber(collaborators.length) })}
        </Badge>
      </div>

      {/* Performers Section */}
      {performers.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-2">
            <Music2 className="h-3.5 w-3.5 text-purple-400" /> {t("lineupShowcase.performances")}
          </h4>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {performers.map((performer) => (
              <div
                key={performer.id}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-primary/40 hover:bg-white/[0.06]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white border border-white/10 group-hover:scale-105 transition-transform">
                    {roleIconMap[performer.roleType] || <Users className="h-5 w-5" />}
                  </div>

                  <div>
                    <h5 className="font-bold text-sm text-white">
                      {performer.stageName || performer.name}
                    </h5>
                    <p className="text-xs text-primary font-medium">
                      {roleLabelMap[performer.roleType] || 'Performer'}
                    </p>
                    {performer.stageName && performer.name !== performer.stageName && (
                      <p className="text-[10px] text-white/40">{performer.name}</p>
                    )}
                  </div>
                </div>

                {performer.customPromoCode && (
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-white/50 font-mono">
                      🔑 {performer.customPromoCode}
                    </span>
                    {onApplyPromoCode && (
                      <button
                        onClick={() => onApplyPromoCode(performer.customPromoCode!)}
                        className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 underline"
                      >
                        {t("lineupShowcase.useFanPass")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Production, Culinary & Media Section */}
      {productionAndFood.length > 0 && (
        <div className="mt-6 space-y-3 pt-4 border-t border-white/5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-2">
            <Award className="h-3.5 w-3.5 text-emerald-400" /> {t("lineupShowcase.production")}
          </h4>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {productionAndFood.map((partner) => (
              <div
                key={partner.id}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                  {roleIconMap[partner.roleType] || <Award className="h-4 w-4" />}
                </div>

                <div>
                  <h5 className="font-bold text-xs text-white">
                    {partner.stageName || partner.name}
                  </h5>
                  <p className="text-[11px] text-white/60 font-medium">
                    {roleLabelMap[partner.roleType] || 'Production Partner'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
