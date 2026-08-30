import { useState } from "react";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Bell, Loader2, Radio, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cultureImages } from "@/data/culture-demo";
import { useI18n } from "@/i18n/I18nContext";
import { NextMoveStrip } from "@/components/journey/NextMoveStrip";
import { getMemberNextMove } from "@/lib/member-next-move";

const Activity = () => {
    const { t, formatNumber } = useI18n();
    const { user, roles } = useAuth();
    const primaryRole = roles[0] || "participant";
    const [filter, setFilter] = useState("all");
    const isOperator = ["brand", "merchant", "host", "agency", "admin"].includes(primaryRole);
    const filterOptions = isOperator
        ? [
            { value: "all", label: t("activity.everything") },
            { value: "social", label: t("activity.peopleProof") },
            { value: "payout", label: t("activity.payouts") },
            { value: "inventory", label: t("activity.inventory") },
            { value: "system", label: t("activity.operational") },
        ]
        : [
            { value: "all", label: t("activity.everything") },
            { value: "social", label: t("activity.scene") },
            { value: "proof", label: t("activity.proofRewards") },
            { value: "system", label: "Promorang" },
        ];

    const { data: events, isLoading, refetch } = useQuery({
        queryKey: ["personalized-feed", user?.id],
        queryFn: async () => {
            if (!user) return [];

            // Fetch personalized feed from followed users
            const { data: feedData, error: feedError } = await supabase.rpc(
                'fn_get_personalized_feed',
                {
                    p_user_id: user.id,
                    p_limit: 50,
                    p_offset: 0
                }
            );

            if (feedError) {
                console.error('Feed error:', feedError);
                // Fallback: just return empty array if function doesn't exist yet
                return [];
            }

            // Map feed data to ActivityFeed format
            const feedEvents = (feedData || []).map((item: any) => ({
                id: item.id,
                user_id: item.user_id,
                event_type: item.activity_type,
                title: item.title,
                description: item.description,
                image_url: item.image_url,
                created_at: item.created_at,
                actor: {
                    full_name: item.user_name,
                    avatar_url: item.user_avatar
                },
                metadata: {
                    likes_count: item.likes_count,
                    comments_count: item.comments_count,
                    source_id: item.source_id,
                    source_table: item.source_table
                }
            }));

            return feedEvents;
        },
        enabled: !!user
    });

    const filteredEvents = (events || []).filter(e => {
        if (filter === "all") return true;
        if (filter === "system") return ["low_stock", "budget_alert", "system", "notification"].includes(e.event_type);
        if (filter === "payout") return e.event_type === "payout";
        if (filter === "inventory") return e.event_type === "low_stock";
        if (filter === "proof") return ["reward", "check_in", "drop_completion", "redemption"].includes(e.event_type);
        if (filter === "social") return ["follow", "join", "comment", "reaction", "reward", "post", "drop_completion"].includes(e.event_type);
        return true;
    });

    const handleMarkRead = async (eventId: string) => {
        // Optimistically update or refetch
        // We could also call an API to mark as read
        refetch();
    };

    const handleMarkAllRead = async () => {
        // Logic to mark all as read
        refetch();
    };

    return (
        <main className="min-h-screen bg-[#090909] pb-16 text-white">
            <section className="relative overflow-hidden border-b border-white/10">
                <img src={cultureImages.openMic} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/35" />
                <div className="relative mx-auto flex min-h-[330px] max-w-6xl items-end px-5 pb-10 pt-20 sm:px-8">
                    <div className="max-w-2xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/35 bg-black/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400 backdrop-blur">
                            <Radio className="h-3.5 w-3.5" /> {t("activity.eyebrow")}
                        </div>
                        <h1 className="text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
                            {t("activity.title")}
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-white/60">
                            {t("activity.copy")}
                        </p>
                    </div>
                    <div className="ml-auto hidden gap-8 pb-2 lg:flex">
                        <div><p className="text-3xl font-black">{formatNumber(events?.length || 0)}</p><p className="text-xs text-white/45">{t("activity.recent")}</p></div>
                        <div><p className="text-3xl font-black text-orange-400">{formatNumber(filteredEvents.length)}</p><p className="text-xs text-white/45">{t("activity.view")}</p></div>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
                <div className="mb-6">
                    <NextMoveStrip move={getMemberNextMove({ signedIn: Boolean(user), canCreate: Boolean(user) })} />
                </div>
                <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setFilter(option.value)}
                            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${filter === option.value
                                ? "border-orange-500 bg-orange-500 text-black"
                                : "border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <div className="overflow-hidden rounded-lg border border-white/10 bg-[#111]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-24 text-white/50">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                        <p>{t("activity.listening")}</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="grid min-h-[380px] md:grid-cols-[1.25fr_.75fr]">
                        <div className="flex flex-col justify-end border-b border-white/10 p-7 md:border-b-0 md:border-r md:p-10">
                            <Sparkles className="mb-8 h-8 w-8 text-orange-400" />
                            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">{t("activity.nothing")}</p>
                            <h2 className="max-w-lg text-3xl font-black leading-tight">{t("activity.emptyTitle")}</h2>
                            <p className="mt-4 max-w-lg text-sm leading-6 text-white/50">
                                {t("activity.emptyCopy")}
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <Button asChild className="bg-orange-500 font-bold text-black hover:bg-orange-400">
                                    <Link to="/discover">{t("activity.find")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                </Button>
                                <Button asChild variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white">
                                    <Link to="/creators">{t("activity.follow")}</Link>
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-5 p-7 md:p-10">
                            {[
                                [t("activity.choose"), t("activity.chooseCopy")],
                                [t("activity.prove"), t("activity.proveCopy")],
                                [t("activity.unlock"), t("activity.unlockCopy")],
                            ].map(([title, copy], index) => (
                                <div key={title} className="flex gap-4">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-orange-500/35 text-xs font-bold text-orange-400">{index + 1}</div>
                                    <div><p className="font-bold">{title}</p><p className="mt-1 text-sm leading-5 text-white/45">{copy}</p></div>
                                </div>
                            ))}
                            <div className="flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-white/40">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {t("activity.proofNotice")}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-3 sm:p-5">
                        <ActivityFeed
                            events={filteredEvents}
                            onMarkRead={handleMarkRead}
                            onMarkAllRead={handleMarkAllRead}
                        />
                    </div>
                )}
                </div>
            </div>
        </main>
    );
};

export default Activity;
