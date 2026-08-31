import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MomentCard } from "@/components/MomentCard";
import { DemoEventBanner } from "@/components/DemoEventBanner";
import { demoMoments as moments } from "@/data/demo-moments";
import { supabase } from "@/integrations/supabase/client";
import { taxonomyLabelKey } from "@/lib/moment-taxonomy";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const filters: { value: string; labelKey: TranslationKey }[] = [
  { value: "All", labelKey: "momSect.filterAll" },
  { value: "drop", labelKey: "momSect.filterDrops" },
  { value: "ritual", labelKey: "momSect.filterRituals" },
  { value: "service", labelKey: "momSect.filterServices" },
  { value: "content", labelKey: "momSect.filterCreator" },
  { value: "grocery", labelKey: "momSect.filterGrocery" },
];

const MomentsSection = () => {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: liveMoments } = useQuery({
    queryKey: ["public-home-moments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moments")
        .select("*")
        .eq("is_active", true)
        .order("starts_at", { ascending: true })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    retry: 0,
  });

  const sourceMoments = Array.isArray(liveMoments) && liveMoments.length > 0 ? liveMoments : moments;
  const showingExamples = sourceMoments === moments;

  const filteredMoments = activeCategory === "All"
    ? sourceMoments
    : sourceMoments.filter((m: any) =>
      m.category === activeCategory ||
      m.venue_category === activeCategory ||
      m.moment_archetype === activeCategory
    );

  return (
    <section className="relative overflow-hidden bg-gradient-warm py-14 md:py-20" data-tour="moments-section">
      <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
      <div className="container relative z-10 px-6">
        {showingExamples && (
          <div className="max-w-5xl mx-auto mb-8">
            <DemoEventBanner variant="home" />
          </div>
        )}

        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_0.55fr] lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-primary">
              {showingExamples ? t("momSect.exampleKicker") : t("momSect.liveKicker")}
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
              {showingExamples ? t("momSect.exampleTitle") : t("momSect.liveTitle")}
            </h2>
            <p className="text-lg leading-8 text-muted-foreground">
              {showingExamples ? t("momSect.exampleBody") : t("momSect.liveBody")}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">{t("momSect.signal")}</p>
            <p className="mt-2 font-serif text-3xl font-bold text-foreground">
              {showingExamples ? t("momSect.exampleTeach") : t("momSect.liveJoin")}
            </p>
            <p className="font-serif text-3xl font-bold text-primary">
              {showingExamples ? t("momSect.exampleConvert") : t("momSect.liveReturn")}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {showingExamples ? t("momSect.exampleSignalBody") : t("momSect.liveSignalBody")}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/explore/moments"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                {t("momSect.exploreAll")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/create/moment"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-foreground transition hover:bg-secondary"
              >
                {t("momSect.createOne")}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveCategory(filter.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] ${activeCategory === filter.value
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border shadow-sm"
                }`}
            >
              {t(filter.labelKey)}
            </button>
          ))}
        </div>

        {showingExamples && (
          <div className="mb-8 flex flex-wrap gap-2">
            {["fashion_retail", "personal_service", "grocery", "fitness_wellness", "content"].map((tag) => {
              const key = taxonomyLabelKey("venue", tag) || taxonomyLabelKey("arch", tag);
              return (
              <span
                key={tag}
                className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary"
              >
                {key ? t(key as TranslationKey) : tag}
              </span>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredMoments.map((moment) => (
            <MomentCard key={moment.id} moment={moment as any} />
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
              {showingExamples ? t("momSect.exampleCtaTitle") : t("momSect.liveCtaTitle")}
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              {showingExamples ? t("momSect.exampleCtaBody") : t("momSect.liveCtaBody")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/create/moment"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] shadow-soft hover:shadow-elevated"
              >
                {t("momSect.hostMoment")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/for-brands"
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-full font-medium hover:bg-secondary/80 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]"
              >
                {t("momSect.forBusinesses")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/explore/moments"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline underline-offset-4"
              >
                {t("momSect.exploreAllMoments")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MomentsSection;
