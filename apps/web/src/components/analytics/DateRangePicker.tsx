import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { getPresetDateRanges, formatDateRange } from './utils';

interface DateRangePickerProps {
    startDate: Date;
    endDate: Date;
    onDateRangeChange: (start: Date, end: Date) => void;
    className?: string;
}

/**
 * Date range picker with preset options
 */
export function DateRangePicker({
    startDate,
    endDate,
    onDateRangeChange,
    className,
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const presets = getPresetDateRanges();

    const handlePresetClick = (preset: { start: Date; end: Date }) => {
        onDateRangeChange(preset.start, preset.end);
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className={className}>
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDateRange(startDate, endDate)}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <div className="flex">
                    {/* Preset Options */}
                    <div className="border-r border-border p-3 space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Quick Select</p>
                        {Object.entries(presets).map(([key, preset]) => (
                            <Button
                                key={key}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-sm"
                                onClick={() => handlePresetClick(preset)}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>

                    {/* Custom Calendar */}
                    <div className="p-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Custom Range</p>
                        <CalendarComponent
                            mode="range"
                            selected={{ from: startDate, to: endDate }}
                            onSelect={(range) => {
                                if (range?.from && range?.to) {
                                    onDateRangeChange(range.from, range.to);
                                    setIsOpen(false);
                                }
                            }}
                            numberOfMonths={2}
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
