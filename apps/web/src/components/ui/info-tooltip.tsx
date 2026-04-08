import React from "react";
import { HelpCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
    content: string | React.ReactNode;
    className?: string;
    iconClassName?: string;
}

export const InfoTooltip = ({
    content,
    className,
    iconClassName,
}: InfoTooltipProps) => {
    return (
        <TooltipProvider {...({} as any)}>
            <Tooltip delayDuration={300} {...({} as any)}>
                <TooltipTrigger asChild {...({} as any)}>
                    <button
                        type="button"
                        className={cn("inline-flex ml-1.5 focus:outline-none", className)}
                        tabIndex={-1}
                    >
                        <HelpCircle
                            className={cn(
                                "h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors cursor-help",
                                iconClassName
                            )}
                        />
                    </button>
                </TooltipTrigger>
                <TooltipContent
                    side="top"
                    className="max-w-[250px] bg-popover text-popover-foreground border border-border shadow-soft rounded-xl px-3 py-2 text-xs leading-relaxed"
                    {...({} as any)}
                >
                    {content}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
