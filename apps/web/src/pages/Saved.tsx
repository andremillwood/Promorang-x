import { useState } from "react";
import { SavedCollections } from "@/components/SavedCollections";
import { useToast } from "@/hooks/use-toast";
import { demoMoments } from "@/data/demo-moments";
import { Bookmark, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

// Initial collections for demonstration
const initialCollections = [
    {
        id: "default",
        name: "All Saved",
        isDefault: true,
        moments: demoMoments.slice(0, 3),
    },
    {
        id: "weekend",
        name: "Weekend Plans",
        moments: demoMoments.slice(3, 5),
    },
    {
        id: "foodie",
        name: "Foodie Finds",
        moments: [],
    },
];

const Saved = () => {
    const { toast } = useToast();
    const [collections, setCollections] = useState(initialCollections);

    const handleCreateCollection = (name: string) => {
        toast({
            title: "Collection created",
            description: `"${name}" is ready for you to add moments`,
        });
        // TODO: Persist to Supabase
    };

    const handleDeleteCollection = (id: string) => {
        setCollections(prev => prev.filter(c => c.id !== id));
        toast({
            title: "Collection deleted",
            description: "The collection has been removed",
        });
        // TODO: Persist to Supabase
    };

    return (
        <div className="min-h-screen bg-[#090909] text-white">
            <main className="pb-16">
                <section className="relative min-h-[390px] overflow-hidden border-b border-white/10">
                    <img
                        src={demoMoments[3].image_url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-55"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-black/40" />
                    <div className="relative mx-auto flex min-h-[390px] max-w-6xl items-end px-5 pb-12 pt-20 sm:px-8">
                        <div className="max-w-2xl">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-black/45 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-400 backdrop-blur">
                                <Bookmark className="h-3.5 w-3.5" />
                                Your shortlist
                            </div>
                            <h1 className="max-w-xl text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
                                Keep the moments that keep calling you back.
                            </h1>
                            <p className="mt-5 max-w-xl text-base leading-7 text-white/65">
                                Plans, drops, places, and scenes you chose before the feed moved on.
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <Link
                                    to="/discover"
                                    className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-orange-400"
                                >
                                    Find something new <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    to="/pulse"
                                    className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-black/30 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                                >
                                    <Sparkles className="h-4 w-4 text-orange-400" /> See what is live
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
                    <SavedCollections
                        collections={collections as any}
                        onCreateCollection={handleCreateCollection}
                        onDeleteCollection={handleDeleteCollection}
                    />
                </div>
            </main>
        </div>
    );
};

export default Saved;
