import { useState } from "react";
import { SavedCollections } from "@/components/SavedCollections";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import { useI18n } from "@/i18n/I18nContext";

type SavedCollection = {
    id: string;
    name: string;
    isDefault?: boolean;
    moments: Tables<"moments">[];
};

const initialCollections: SavedCollection[] = [
    {
        id: "default",
        name: "All Saved",
        isDefault: true,
        moments: [],
    },
];

const Saved = () => {
    const { t } = useI18n();
    const { toast } = useToast();
    const [collections, setCollections] = useState(initialCollections);

    const handleCreateCollection = (name: string) => {
        toast({
            title: t("saved.created"),
            description: t("saved.createdCopy", { name }),
        });
        // TODO: Persist to Supabase
    };

    const handleDeleteCollection = (id: string) => {
        setCollections(prev => prev.filter(c => c.id !== id));
        toast({
            title: t("saved.deleted"),
            description: t("saved.deletedCopy"),
        });
        // TODO: Persist to Supabase
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
                            <p className="mt-5 max-w-xl text-base leading-7 text-white/65">
                                {t("saved.copy")}
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <Link
                                    to="/discover"
                                    className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-orange-400"
                                >
                                    {t("saved.discover")} <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    to="/pulse"
                                    className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-black/30 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                                >
                                    <Sparkles className="h-4 w-4 text-orange-400" /> {t("saved.live")}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 xl:px-12 xl:py-16 2xl:px-16">
                    <SavedCollections
                        collections={collections}
                        onCreateCollection={handleCreateCollection}
                        onDeleteCollection={handleDeleteCollection}
                    />
                </div>
            </main>
        </div>
    );
};

export default Saved;
