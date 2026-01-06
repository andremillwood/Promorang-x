import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
    className?: string
    min?: number
    max?: number
    step?: number
    value?: number[]
    defaultValue?: number[]
    onValueChange?: (value: number[]) => void
    onValueCommit?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, min = 0, max = 100, step = 1, value, defaultValue, onValueChange, onValueCommit, ...props }, ref) => {
        const [localValue, setLocalValue] = React.useState(defaultValue || value || [min, max])

        React.useEffect(() => {
            if (value) {
                setLocalValue(value)
            }
        }, [value])

        const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = Math.min(Number(e.target.value), localValue[1] - step)
            const nextValue = [newValue, localValue[1]]
            setLocalValue(nextValue)
            onValueChange?.(nextValue)
        }

        const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = Math.max(Number(e.target.value), localValue[0] + step)
            const nextValue = [localValue[0], newValue]
            setLocalValue(nextValue)
            onValueChange?.(nextValue)
        }

        const handleCommit = () => {
            onValueCommit?.(localValue)
        }

        return (
            <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
                <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
                    <div className="absolute h-full bg-primary" style={{ left: `${(localValue[0] / max) * 100}%`, right: `${100 - (localValue[1] / max) * 100}%` }} />
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localValue[0]}
                    onChange={handleMinChange}
                    onMouseUp={handleCommit}
                    onTouchEnd={handleCommit}
                    className="absolute h-full w-full opacity-0 cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localValue[1]}
                    onChange={handleMaxChange}
                    onMouseUp={handleCommit}
                    onTouchEnd={handleCommit}
                    className="absolute h-full w-full opacity-0 cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4"
                />
                {/* Visual Thumbs */}
                <div
                    className="absolute h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    style={{ left: `calc(${(localValue[0] / max) * 100}% - 10px)` }}
                />
                <div
                    className="absolute h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    style={{ left: `calc(${(localValue[1] / max) * 100}% - 10px)` }}
                />
            </div>
        )
    }
)
Slider.displayName = "Slider"

export { Slider }
