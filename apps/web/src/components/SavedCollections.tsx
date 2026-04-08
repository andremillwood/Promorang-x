import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, MoreHorizontal, Bookmark, Grid, List, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MasonryGrid } from "@/components/MasonryGrid";
import { MomentCard } from "@/components/MomentCard";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

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
        <div className={cn("", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="font-serif text-2xl font-bold">Saved</h2>
                    <p className="text-sm text-muted-foreground">
                        {totalSaved} moment{totalSaved !== 1 ? "s" : ""} in {collections.length} collection{collections.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                    >
                        {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsCreating(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Collection
                    </Button>
                </div>
            </div>

            {/* Create Collection Modal */}
            {isCreating && (
                <div className="mb-6 p-4 bg-card border border-border rounded-xl">
                    <input
                        type="text"
                        placeholder="Collection name..."
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleCreateCollection}>
                            Create
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Collection Tabs / Pills */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                <button
                    onClick={() => setSelectedCollection(null)}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                        selectedCollection === null
                            ? "bg-primary text-primary-foreground shadow-soft"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                >
                    All Saved
                </button>
                {collections.map(collection => (
                    <button
                        key={collection.id}
                        onClick={() => setSelectedCollection(collection.id)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2",
                            selectedCollection === collection.id
                                ? "bg-primary text-primary-foreground shadow-soft"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                    >
                        {collection.name}
                        <span className="text-xs opacity-70">({collection.moments.length})</span>
                    </button>
                ))}
            </div>

            {/* Collection Grid */}
            {selectedCollection === null ? (
                // Show all collections as cards
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {collections.map(collection => (
                        <button
                            key={collection.id}
                            onClick={() => setSelectedCollection(collection.id)}
                            className="group relative aspect-square rounded-2xl overflow-hidden bg-secondary"
                        >
                            {/* Collection Cover */}
                            {collection.moments[0]?.image_url ? (
                                <img
                                    src={collection.moments[0].image_url}
                                    alt=""
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Bookmark className="h-12 w-12 text-muted-foreground/50" />
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="font-medium text-white text-lg">{collection.name}</h3>
                                <p className="text-white/70 text-sm">
                                    {collection.moments.length} moment{collection.moments.length !== 1 ? "s" : ""}
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
                        ← Back to collections
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
                            <p className="text-muted-foreground">No moments in this collection yet</p>
                            <Button variant="outline" asChild className="mt-4">
                                <Link to="/discover">Discover Moments</Link>
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {collections.length === 0 && (
                <div className="text-center py-12">
                    <Bookmark className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">No saved moments yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Save moments you're interested in and organize them into collections
                    </p>
                    <Button asChild>
                        <Link to="/discover">Discover Moments</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}

export default SavedCollections;
