import { useState } from "react";
import { Camera, Image, Film, Filter, Loader2, ArrowLeft, Heart, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserMedia, type MomentMedia } from "@/hooks/useUGC";
import { MasonryGrid } from "@/components/MasonryGrid";
import { useJoinedMoments } from "@/hooks/useMoments";
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

type FilterType = "all" | "image" | "video";

const Gallery = () => {
    const { data: media, isLoading: mediaLoading } = useUserMedia();
    const { data: moments } = useJoinedMoments();
    const [filter, setFilter] = useState<FilterType>("all");
    const [selectedMedia, setSelectedMedia] = useState<MomentMedia | null>(null);

    const filteredMedia = (media || []).filter((m) => {
        if (filter === "all") return true;
        return m.media_type === filter;
    });

    // Build a lookup of moment titles by ID
    const momentTitles: Record<string, string> = {};
    moments?.forEach((m) => {
        momentTitles[m.id] = m.title;
    });

    const filterOptions: { value: FilterType; label: string; icon: typeof Camera }[] = [
        { value: "all", label: "All", icon: Image },
        { value: "image", label: "Photos", icon: Camera },
        { value: "video", label: "Videos", icon: Film },
    ];

    return (
        <main className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                        <Link to="/dashboard">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="font-serif text-3xl font-bold tracking-tight">
                            My <span className="italic text-accent">Gallery</span>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            All your captured moments in one place
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold">{filteredMedia.length}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Items
                    </p>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2">
                {filterOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setFilter(option.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${filter === option.value
                                ? "bg-primary text-primary-foreground shadow-soft"
                                : "bg-card border border-border hover:bg-muted"
                            }`}
                    >
                        <option.icon className="w-3.5 h-3.5" />
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Gallery Grid */}
            {mediaLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-square rounded-2xl" />
                    ))}
                </div>
            ) : filteredMedia.length === 0 ? (
                <div className="bg-card rounded-[2rem] p-16 border border-dashed border-border/60 text-center flex flex-col items-center">
                    <div className="h-20 w-20 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                        <Camera className="w-10 h-10 text-accent/40" />
                    </div>
                    <h2 className="font-serif text-2xl font-bold mb-2">No media yet</h2>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        Attend moments and capture photos or videos to build your visual story.
                    </p>
                    <Button variant="default" className="rounded-2xl px-8 shadow-soft" asChild>
                        <Link to="/discover">Discover Moments</Link>
                    </Button>
                </div>
            ) : (
                <MasonryGrid columns={{ sm: 2, md: 3, lg: 4 }} gap={16}>
                    {filteredMedia.map((item) => (
                        <div
                            key={item.id}
                            className="group relative rounded-2xl overflow-hidden bg-card border border-border/40 shadow-soft hover:shadow-soft-xl transition-all duration-300 cursor-pointer"
                            onClick={() => setSelectedMedia(item)}
                        >
                            {item.media_type === "video" ? (
                                <div className="aspect-video bg-charcoal flex items-center justify-center relative">
                                    <Film className="w-12 h-12 text-white/40" />
                                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/40 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-md">
                                        Video
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={item.media_url}
                                    alt={item.caption || "Moment photo"}
                                    className="w-full aspect-auto object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                            )}

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                {item.caption && (
                                    <p className="text-white text-sm font-medium mb-1 line-clamp-2">
                                        {item.caption}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 text-white/70 text-[10px] font-bold uppercase tracking-wider">
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" /> {item.view_count}
                                    </span>
                                    <span>{format(new Date(item.created_at), "MMM d, yyyy")}</span>
                                </div>
                                {momentTitles[item.moment_id] && (
                                    <p className="text-white/50 text-[10px] mt-1 truncate">
                                        {momentTitles[item.moment_id]}
                                    </p>
                                )}
                            </div>

                            {/* Status badge */}
                            {item.moderation_status === "pending" && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[9px] font-bold uppercase tracking-wider">
                                    Pending
                                </div>
                            )}
                            {item.is_featured && (
                                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary/90 text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Heart className="w-3 h-3 fill-current" /> Featured
                                </div>
                            )}
                        </div>
                    ))}
                </MasonryGrid>
            )}

            {/* Lightbox Modal */}
            {selectedMedia && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
                    onClick={() => setSelectedMedia(null)}
                >
                    <div
                        className="relative max-w-4xl w-full max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedMedia(null)}
                            className="absolute -top-12 right-0 text-white/70 hover:text-white text-sm font-bold uppercase tracking-wider"
                        >
                            Close ✕
                        </button>
                        {selectedMedia.media_type === "video" ? (
                            <video
                                src={selectedMedia.media_url}
                                controls
                                className="w-full max-h-[80vh] rounded-2xl"
                            />
                        ) : (
                            <img
                                src={selectedMedia.media_url}
                                alt={selectedMedia.caption || ""}
                                className="w-full max-h-[80vh] object-contain rounded-2xl"
                            />
                        )}
                        {selectedMedia.caption && (
                            <p className="text-white text-center mt-4 font-medium">
                                {selectedMedia.caption}
                            </p>
                        )}
                        <p className="text-white/50 text-center mt-1 text-sm">
                            {format(new Date(selectedMedia.created_at), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Gallery;
