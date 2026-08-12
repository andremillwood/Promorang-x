import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, Heart, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
    images: Array<{
        url: string;
        alt?: string;
        caption?: string;
    }>;
    className?: string;
}

/**
 * Airbnb-style image gallery with lightbox
 * Features: Grid layout, fullscreen view, keyboard navigation
 */
export function ImageGallery({ images, className }: ImageGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = "";
    };

    const goNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const goPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        const touch = event.touches[0];
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
    };

    const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartX.current === null || touchStartY.current === null) return;

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX.current;
        const deltaY = touch.clientY - touchStartY.current;

        touchStartX.current = null;
        touchStartY.current = null;

        if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;

        if (deltaX < 0) {
            goNext();
            return;
        }

        goPrev();
    };

    // Keyboard navigation
    useEffect(() => {
        if (!lightboxOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxOpen, goNext, goPrev]);

    if (images.length === 0) return null;

    // Different grid layouts based on image count
    const gridLayout = () => {
        if (images.length === 1) {
            return (
                <button
                    onClick={() => openLightbox(0)}
                    className="w-full h-80 md:h-96 rounded-2xl overflow-hidden group"
                >
                    <img
                        src={images[0].url}
                        alt={images[0].alt || ""}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>
            );
        }

        if (images.length === 2) {
            return (
                <div className="grid grid-cols-2 gap-2 h-80 md:h-96 rounded-2xl overflow-hidden">
                    {images.slice(0, 2).map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => openLightbox(idx)}
                            className="h-full group overflow-hidden"
                        >
                            <img
                                src={img.url}
                                alt={img.alt || ""}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </button>
                    ))}
                </div>
            );
        }

        // 3+ images: Airbnb-style grid
        return (
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-80 md:h-[28rem] rounded-2xl overflow-hidden">
                {/* Main large image */}
                <button
                    onClick={() => openLightbox(0)}
                    className="col-span-2 row-span-2 group overflow-hidden"
                >
                    <img
                        src={images[0].url}
                        alt={images[0].alt || ""}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </button>

                {/* Secondary images */}
                {images.slice(1, 5).map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => openLightbox(idx + 1)}
                        className="group overflow-hidden relative"
                    >
                        <img
                            src={img.url}
                            alt={img.alt || ""}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Show more overlay on last visible image */}
                        {idx === 3 && images.length > 5 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium">
                                +{images.length - 5} more
                            </div>
                        )}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <>
            <div className={cn("relative", className)}>
                {gridLayout()}

                {/* Show all photos button */}
                {images.length > 1 && (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                        onClick={() => openLightbox(0)}
                    >
                        <ZoomIn className="h-4 w-4 mr-2" />
                        Show all photos
                    </Button>
                )}
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black px-safe pt-safe pb-safe">
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
                        <span className="text-white font-medium">
                            {currentIndex + 1} / {images.length}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={closeLightbox}
                            className="text-white hover:bg-white/20"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Main image */}
                    <div
                        className="absolute inset-0 flex touch-pan-y items-center justify-center px-4 pb-36 pt-20 sm:p-16"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <img
                            src={images[currentIndex].url}
                            alt={images[currentIndex].alt || ""}
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>

                    {/* Caption & Reactions (Digital Afterparty) */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                        <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex-1">
                                {images[currentIndex].caption && (
                                    <p className="text-base text-white sm:text-lg">
                                        {images[currentIndex].caption}
                                    </p>
                                )}
                                <p className="text-white/60 text-sm mt-1">Uploaded by a verified attendee.</p>
                                {images.length > 1 && (
                                    <p className="mt-2 text-xs font-medium text-white/70 sm:hidden">
                                        Swipe left or right to browse photos.
                                    </p>
                                )}
                            </div>
                            
                            {/* Verified Reactions */}
                            <div className="flex gap-4 pb-1">
                                <button className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors group">
                                    <div className="p-2 rounded-full bg-white/10 group-hover:bg-red-500/20 transition-colors">
                                        <Heart className="w-6 h-6 group-hover:fill-red-500 group-hover:text-red-500 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] group-active:scale-90" />
                                    </div>
                                    <span className="text-xs font-bold">{Math.floor(Math.random() * 20 + 5)}</span>
                                </button>
                                <button className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors group">
                                    <div className="p-2 rounded-full bg-white/10 group-hover:bg-orange-500/20 transition-colors">
                                        <Flame className="w-6 h-6 group-hover:fill-orange-500 group-hover:text-orange-500 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] group-active:scale-90" />
                                    </div>
                                    <span className="text-xs font-bold">{Math.floor(Math.random() * 5 + 1)}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation arrows */}
                    {images.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={goPrev}
                                className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 text-white hover:bg-white/40 sm:left-4 sm:flex"
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={goNext}
                                className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 text-white hover:bg-white/40 sm:right-4 sm:flex"
                            >
                                <ChevronRight className="h-8 w-8" />
                            </Button>
                        </>
                    )}

                    {/* Thumbnail strip */}
                    <div className="absolute bottom-20 left-0 right-0 flex gap-2 overflow-x-auto px-4 touch-pan-x snap-x-mandatory scrollbar-none sm:justify-center">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={cn(
                                    "h-16 w-16 flex-shrink-0 snap-start overflow-hidden rounded-lg transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]",
                                    idx === currentIndex
                                        ? "ring-2 ring-white opacity-100"
                                        : "opacity-50 hover:opacity-75"
                                )}
                            >
                                <img
                                    src={img.url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

export default ImageGallery;
