import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, MoreHorizontal, Bookmark, Grid, List, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MasonryGrid } from "@/components/MasonryGrid";
import { MomentCard } from "@/components/MomentCard";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";
import { useI18n } from "@/i18n/I18nContext";
import { SwipeRail } from "@/components/ui/SwipeRail";

type Moment = Tables<"moments">;

interface Collection {
    id: string;
    name: string;
    moments: Moment[];
    isDefault?: boolean;
    coverImage?: string;
}

interface SavedCollectionsProps {
    collections: Collection[];
    onCreateCollection?: (name: string) => void;
    onDeleteCollection?: (id: string) => void;
    onRemoveMoment?: (collectionId: string, momentId: string) => void;
    className?: string;
}

/**
 * Pinterest-style saved collections grid
 * Shows user's saved moments organized in collections
 */
export function SavedCollections({
    collections: initialCollections,
    onCreateCollection,
    onDeleteCollection,
    onRemoveMoment,
    className,
}: SavedCollectionsProps) {
    const { t, formatNumber } = useI18n();
    const [collections, setCollections] = useState(initialCollections);
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isCreating, setIsCreating] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState("");

    const handleCreateCollection = () => {
        if (!newCollectionName.trim()) return;

        const newCollection: Collection = {
            id: `temp-${Date.now()}`,
            name: newCollectionName,
            moments: [],
        };

        setCollections(prev => [...prev, newCollection]);
        onCreateCollection?.(newCollectionName);
        setNewCollectionName("");
        setIsCreating(false);
    };

    const activeCollection = selectedCollection
        ? collections.find(c => c.id === selectedCollection)
        : null;

    const totalSaved = collections.reduce((sum, c) => sum + c.moments.length, 0);

    return (
        <div className={cn("text-white", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">{t("saved.collections")}</p>
                    <h2 className="text-3xl font-black tracking-tight">{t("saved.returning")}</h2>
                    <p className="mt-1 text-sm text-white/45">
                        {t("saved.summary", { moments: formatNumber(totalSaved), collections: formatNumber(collections.length) })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="border border-white/10 text-white hover:bg-white/10 hover:text-white"
                        onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                    >
                        {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" className="border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white" onClick={() => setIsCreating(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("saved.new")}
                    </Button>
                </div>
            </div>

            {/* Create Collection Modal */}
            {isCreating && (
                <div className="mb-6 rounded-lg border border-orange-500/30 bg-white/[0.04] p-4">
                    <input
                        type="text"
                        placeholder={t("saved.name")}
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        className="mb-3 w-full rounded-md border border-white/15 bg-black px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleCreateCollection}>
                            {t("saved.create")}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                            {t("saved.cancel")}
                        </Button>
                    </div>
                </div>
            )}

            {/* Collection Tabs / Pills */}
            <SwipeRail compact fadeFrom="from-black" showDots={false} className="mb-6" scrollerClassName="gap-2 pb-4">
                <button
                    onClick={() => setSelectedCollection(null)}
                    aria-selected={selectedCollection === null}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap snap-start transition-colors",
                        selectedCollection === null
                            ? "bg-orange-500 text-black"
                            : "border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"
                    )}
                >
                    {t("saved.all")}
                </button>
                {collections.map(collection => (
                    <button
                        key={collection.id}
                        onClick={() => setSelectedCollection(collection.id)}
                        aria-selected={selectedCollection === collection.id}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap snap-start transition-colors flex items-center gap-2",
                            selectedCollection === collection.id
                                ? "bg-orange-500 text-black"
                                : "border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"
                        )}
                    >
                        {collection.name}
                        <span className="text-xs opacity-70">({collection.moments.length})</span>
                    </button>
                ))}
            </SwipeRail>

            {/* Collection Grid */}
            {selectedCollection === null ? (
                // Show all collections as cards
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {collections.map(collection => (
                        <button
                            key={collection.id}
                            onClick={() => setSelectedCollection(collection.id)}
                            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-[#141414] text-left"
                        >
                            {/* Collection Cover */}
                            {collection.moments[0]?.image_url ? (
                                <img
                                    src={collection.moments[0].image_url}
                                    alt=""
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Bookmark className="h-12 w-12 text-muted-foreground/50" />
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                            {/* Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="text-xl font-black text-white">{collection.isDefault ? t("saved.all") : collection.name}</h3>
                                <p className="text-white/70 text-sm">
                                    {formatNumber(collection.moments.length)} {t("venueProfile.moments")}
                                </p>
                            </div>

                            {/* Delete button (not for default) */}
                            {!collection.isDefault && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteCollection?.(collection.id);
                                        setCollections(prev => prev.filter(c => c.id !== collection.id));
                                    }}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </button>
                    ))}
                </div>
            ) : (
                // Show moments in selected collection
                <div>
                    <button
                        onClick={() => setSelectedCollection(null)}
                        className="mb-4 text-sm text-muted-foreground hover:text-foreground"
                    >
                        {t("saved.back")}
                    </button>

                    {activeCollection && activeCollection.moments.length > 0 ? (
                        <MasonryGrid>
                            {activeCollection.moments.map(moment => (
                                <MomentCard
                                    key={moment.id}
                                    moment={moment}
                                />
                            ))}
                        </MasonryGrid>
                    ) : (
                        <div className="text-center py-12">
                            <Bookmark className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                            <p className="text-muted-foreground">{t("saved.emptyCollection")}</p>
                            <Button variant="outline" asChild className="mt-4">
                                <Link to="/discover">{t("saved.explore")}</Link>
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {collections.length === 0 && (
                <div className="text-center py-12">
                    <Bookmark className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">{t("saved.empty")}</h3>
                    <p className="text-muted-foreground mb-4">
                        {t("saved.emptyCopy")}
                    </p>
                    <Button asChild>
                        <Link to="/discover">{t("saved.explore")}</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}

export default SavedCollections;
