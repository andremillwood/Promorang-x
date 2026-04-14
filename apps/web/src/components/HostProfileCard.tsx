import { Link } from "react-router-dom";
import { Star, Shield, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HostProfileCardProps {
    hostId: string;
    name: string;
    avatarUrl?: string | null;
    memberSince?: string;
    momentsHosted?: number;
    rating?: number;
    reviewCount?: number;
    isVerified?: boolean;
    isSuperhost?: boolean;
    responseRate?: number;
    className?: string;
}

/**
 * Airbnb-style host profile card
 * Shows host info, stats, and verification badges
 */
export function HostProfileCard({
    hostId,
    name,
    avatarUrl,
    memberSince,
    momentsHosted = 0,
    rating,
    reviewCount = 0,
    isVerified = false,
    isSuperhost = false,
    responseRate,
    className,
}: HostProfileCardProps) {
    const joinYear = memberSince
        ? new Date(memberSince).getFullYear()
        : new Date().getFullYear();

    return (
        <div className={cn("bg-card border border-border rounded-2xl p-6", className)}>
            <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-2xl text-white font-medium overflow-hidden">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            (name || "?").charAt(0)
                        )}
                    </div>
                    {isSuperhost && (
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                            <Star className="h-3 w-3 text-primary-foreground fill-primary-foreground" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1">
                    <h3 className="font-serif text-xl font-semibold text-foreground">{name}</h3>
                    <p className="text-sm text-muted-foreground">
                        Hosting since {joinYear}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {isSuperhost && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                <Star className="h-3 w-3" />
                                Superhost
                            </span>
                        )}
                        {isVerified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-xs font-medium rounded-full">
                                <Shield className="h-3 w-3" />
                                Verified
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-border">
                <div className="text-center">
                    <p className="font-semibold text-lg text-foreground">{momentsHosted}</p>
                    <p className="text-xs text-muted-foreground">Moments</p>
                </div>
                <div className="text-center border-x border-border">
                    {rating ? (
                        <>
                            <p className="font-semibold text-lg text-foreground flex items-center justify-center gap-1">
                                {rating.toFixed(1)}
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </p>
                            <p className="text-xs text-muted-foreground">{reviewCount} reviews</p>
                        </>
                    ) : (
                        <>
                            <p className="font-semibold text-lg text-foreground">New</p>
                            <p className="text-xs text-muted-foreground">Host</p>
                        </>
                    )}
                </div>
                <div className="text-center">
                    {responseRate ? (
                        <>
                            <p className="font-semibold text-lg text-foreground">{responseRate}%</p>
                            <p className="text-xs text-muted-foreground">Response</p>
                        </>
                    ) : (
                        <>
                            <p className="font-semibold text-lg text-foreground">—</p>
                            <p className="text-xs text-muted-foreground">Response</p>
                        </>
                    )}
                </div>
            </div>

            {/* About section */}
            {isSuperhost && (
                <div className="mt-4 p-3 bg-secondary/30 rounded-xl">
                    <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{name}</span> is a Superhost.
                        They're experienced hosts with excellent reviews.
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                    <Link to={`/profile/${hostId}`}>View Profile</Link>
                </Button>
                <Button variant="secondary" size="icon">
                    <MessageCircle className="h-4 w-4" />
                </Button>
            </div>

            {/* Response time */}
            {responseRate && responseRate >= 90 && (
                <p className="mt-4 text-xs text-muted-foreground text-center">
                    Typically responds within an hour
                </p>
            )}
        </div>
    );
}

export default HostProfileCard;
