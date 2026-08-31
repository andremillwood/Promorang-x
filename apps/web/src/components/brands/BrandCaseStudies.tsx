import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, Users, Receipt, Camera, Trophy, Sparkles, Building2, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

export interface CaseStudy {
  id: string;
  client: string;
  badgeKey: TranslationKey;
  titleKey: TranslationKey;
  challengeKey: TranslationKey;
  solutionKey: TranslationKey;
  metrics: Array<{ labelKey: TranslationKey; value: string }>;
  icon: typeof Receipt;
  accentColor: string;
  glowColor: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "fmcg-retail",
    client: "Lifespan Spring Water & Sunshine Snacks",
    badgeKey: "brandCases.s1Badge",
    titleKey: "brandCases.s1Title",
    challengeKey: "brandCases.s1Challenge",
    solutionKey: "brandCases.s1Solution",
    metrics: [
      { labelKey: "brandCases.s1m1", value: "< 5s" },
      { labelKey: "brandCases.s1m2", value: "100%" },
      { labelKey: "brandCases.s1m3", value: "Verified" },
    ],
    icon: Receipt,
    accentColor: "from-blue-500/20 to-cyan-500/20 border-cyan-500/30",
    glowColor: "bg-cyan-500/10",
  },
  {
    id: "ladies-expo",
    client: "Ladies Expo Jamaica",
    badgeKey: "brandCases.s2Badge",
    titleKey: "brandCases.s2Title",
    challengeKey: "brandCases.s2Challenge",
    solutionKey: "brandCases.s2Solution",
    metrics: [
      { labelKey: "brandCases.s2m1", value: "800+" },
      { labelKey: "brandCases.s2m2", value: "800+" },
      { labelKey: "brandCases.s2m3", value: "Near-Zero" },
    ],
    icon: Camera,
    accentColor: "from-pink-500/20 to-rose-500/20 border-rose-500/30",
    glowColor: "bg-rose-500/10",
  },
  {
    id: "venue-revival",
    client: "I Luv Hip Hop & Encore Throwback Series",
    badgeKey: "brandCases.s3Badge",
    titleKey: "brandCases.s3Title",
    challengeKey: "brandCases.s3Challenge",
    solutionKey: "brandCases.s3Solution",
    metrics: [
      { labelKey: "brandCases.s3m1", value: "0 ➔ 230+" },
      { labelKey: "brandCases.s3m2", value: "+340%" },
      { labelKey: "brandCases.s3m3", value: "Repeat" },
    ],
    icon: Flame,
    accentColor: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    glowColor: "bg-amber-500/10",
  },
];

export function BrandCaseStudies() {
  const { t } = useI18n();
  return (
    <section className="py-20 bg-charcoal text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary mb-4 border border-primary/30">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{t("brandCases.badge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">
            {t("brandCases.title1")} <br />
            <span className="text-gradient-primary">{t("brandCases.title2")}</span>
          </h2>
          <p className="text-zinc-300 text-base sm:text-lg">
            {t("brandCases.copy")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {CASE_STUDIES.map((study, index) => {
            const Icon = study.icon;
            return (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`rounded-3xl border bg-gradient-to-b ${study.accentColor} p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl`}
              >
                <div className={`absolute top-0 right-0 w-40 h-40 ${study.glowColor} rounded-full blur-3xl`} />
                
                <div>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <Badge variant="outline" className="border-white/20 bg-white/10 text-white font-medium text-xs">
                      {t(study.badgeKey)}
                    </Badge>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{study.client}</p>
                  <h3 className="text-xl font-black tracking-tight text-white mb-4 leading-snug">{t(study.titleKey)}</h3>
                  
                  <div className="space-y-3 mb-8 text-sm text-zinc-300">
                    <p className="leading-relaxed"><strong className="text-white">{t("brandCases.challenge")}</strong> {t(study.challengeKey)}</p>
                    <p className="leading-relaxed"><strong className="text-white">{t("brandCases.execution")}</strong> {t(study.solutionKey)}</p>
                  </div>
                </div>

                <div>
                  <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                    {study.metrics.map((m, idx) => (
                      <div key={idx} className="bg-black/30 rounded-xl p-2.5">
                        <p className="text-lg font-black text-white">{m.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">{t(m.labelKey)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
