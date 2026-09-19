import { useQuery } from "@tanstack/react-query";
import { SavedCollections } from "@/components/SavedCollections";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, ArrowRight, Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import { useI18n } from "@/i18n/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type SavedCollection = {
    id: string;
    name: string;
    isDefault?: boolean;
    moments: Tables<"moments">[];
};

type SavedMomentRow = {
    moment_id: string;
    collection_name: string | null;
    created_at: string;
};

const emptyCollections: SavedCollection[] = [
    { id: "default", name: "All Saved", isDefault: true, moments: [] },
];

const Saved = () => {
    const { t } = useI18n();
    const { toast } = useToast();
    const { user } = useAuth();

    const savedQuery = useQuery({
        queryKey: ["saved-moments", user?.id],
        enabled: Boolean(user),
        queryFn: async (): Promise<SavedCollection[]> => {
            if (!user) return emptyCollections;

            const { data: savedRows, error: savedError } = await (supabase as any)
                .from("saved_moments")
                .select("moment_id,collection_name,created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (savedError) throw savedError;

            const rows = (savedRows || []) as SavedMomentRow[];
            const momentIds = [...new Set(rows.map((row) => row.moment_id).filter(Boolean))];
            if (!momentIds.length) return emptyCollections;

            const { data: moments, error: momentsError } = await supabase
                .from("moments")
                .select("*")
                .in("id", momentIds);

            if (momentsError) throw momentsError;

            const momentById = new Map((moments || []).map((moment) => [moment.id, moment]));
            const allMoments = rows
                .map((row) => momentById.get(row.moment_id))
                .filter((moment): moment is Tables<"moments"> => Boolean(moment));

            const groups = new Map<string, Tables<"moments">[]>();
            for (const row of rows) {
                const collectionName = String(row.collection_name || "Saved").trim() || "Saved";
                if (collectionName === "Saved" || collectionName === "All Saved") continue;
                const moment = momentById.get(row.moment_id);
                if (!moment) continue;
                const list = groups.get(collectionName) || [];
                list.push(moment);
                groups.set(collectionName, list);
            }

            return [
                { id: "default", name: "All Saved", isDefault: true, moments: allMoments },
                ...[...groups.entries()].map(([name, groupedMoments]) => ({
                    id: `collection:${encodeURIComponent(name)}`,
                    name,
                    moments: groupedMoments,
                })),
            ];
        },
    });

    const collections = savedQuery.data || emptyCollections;

    const handleDeleteCollection = async (id: string) => {
        if (!user) return;
        const collection = collections.find((item) => item.id === id);
        if (!collection || collection.isDefault) return;

        const { error } = await (supabase as any)
            .from("saved_moments")
            .update({ collection_name: "Saved" })
            .eq("user_id", user.id)
            .eq("collection_name", collection.name);

        if (error) {
            toast({
                title: "Collection not changed",
                description: "Your saved Moments are unchanged because the update was not recorded.",
                variant: "destructive",
            });
            return;
        }

        await savedQuery.refetch();
        toast({
            title: t("saved.deleted"),
            description: "The collection label was removed. Its Moments remain in All Saved.",
        });
    };

    return (
        <div className="min-h-screen bg-[#090909] text-white">
            <main className="pb-16">
                <section className="relative min-h-[390px] overflow-hidden border-b border-white/10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(249,115,22,0.34),transparent_32%),linear-gradient(135deg,#20150f_0%,#090909_58%)]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-black/40" />
                    <div className="relative mx-auto flex min-h-[390px] max-w-[1600px] items-end px-5 pb-12 pt-20 sm:px-8 lg:min-h-[470px] xl:px-12 xl:pb-16 2xl:px-16">
                        <div className="max-w-2xl">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-black/45 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-400 backdrop-blur">
                                <Bookmark className="h-3.5 w-3.5" />
                                {t("saved.eyebrow")}
                            </div>
                            <h1 className="max-w-4xl font-serif text-4xl font-bold leading-[0.92] tracking-[-.045em] sm:text-6xl xl:text-8xl">
                                {t("saved.title")}
                            </h1>
                            <p className="mt-5 max-w-xl text-base leading-7 text-white/65">{t("saved.copy")}</p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <Link to="/discover" className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-orange-400">
                                    {t("saved.discover")} <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link to="/pulse" className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-black/30 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10">
                                    <Sparkles className="h-4 w-4 text-orange-400" /> {t("saved.live")}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 xl:px-12 xl:py-16 2xl:px-16">
                    {savedQuery.isLoading ? (
                        <div className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] text-sm text-white/50">
                            <Loader2 className="h-5 w-5 animate-spin text-orange-400" />
                            Loading saved Moments…
                        </div>
                    ) : savedQuery.isError ? (
                        <div role="alert" className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                                <div>
                                    <h2 className="font-bold text-white">Saved Moments are unavailable.</h2>
                                    <p className="mt-1 text-sm leading-6 text-white/55">PROMORANG could not read your saved-moment ledger, so this page is not treating the failure as an empty collection.</p>
                                    <button type="button" onClick={() => void savedQuery.refetch()} className="mt-3 text-sm font-bold text-orange-300 hover:text-orange-200">Try again</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <SavedCollections collections={collections} onDeleteCollection={handleDeleteCollection} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default Saved;
