import { CalendarPlus, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    generateGoogleCalendarLink,
    generateOutlookCalendarLink,
    generateIcsFile,
    type CalendarEvent
} from "@/utils/calendar";

interface CalendarButtonProps {
    event: CalendarEvent;
    variant?: "outline" | "ghost" | "default" | "hero";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    showLabel?: boolean;
}

export const CalendarButton = ({
    event,
    variant = "outline",
    size = "sm",
    className,
    showLabel = true
}: CalendarButtonProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} className={className}>
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    {showLabel && "Add to Calendar"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                    <a
                        href={generateGoogleCalendarLink(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">G</div>
                        Google Calendar
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a
                        href={generateOutlookCalendarLink(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <div className="w-4 h-4 rounded-full bg-blue-700 flex items-center justify-center text-[10px] text-white">O</div>
                        Outlook / Teams
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a
                        href={generateIcsFile(event)}
                        download={`${event.title.replace(/\s+/g, "_")}.ics`}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        iCal / Apple (.ics)
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
