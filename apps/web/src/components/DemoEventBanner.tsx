import { Info, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DemoEventBannerProps {
    variant?: "home" | "discover";
    className?: string;
}

/**
 * Informational banner to communicate that displayed events are examples
 * and encourage stakeholders to create their own events
 */
export function DemoEventBanner({ variant = "home", className }: DemoEventBannerProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 p-6",
                "backdrop-blur-sm shadow-soft",
                className
            )}
        >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Info className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground">
                            {variant === "home" ? "Example Moments" : "Viewing Example Events"}
                        </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {variant === "home"
                            ? "These are examples of what moments can look like on Promorang. Ready to create your own?"
                            : "The events shown below are examples. Be the first to create real moments in your community!"}
                    </p>
                </div>

                {/* CTA */}
                <div className="flex-shrink-0 flex flex-wrap gap-2">
                    <Link
                        to="/create-moment"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        Create Moment
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                        to="/for-brands"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary text-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors"
                    >
                        For Businesses
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default DemoEventBanner;
