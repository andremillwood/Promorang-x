import { type ReactNode, useEffect, useRef, useState, Children } from "react";
import { cn } from "@/lib/utils";

interface MasonryGridProps {
    children: ReactNode;
    columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
    gap?: number;
    className?: string;
}

/**
 * Pinterest-style Masonry Grid Layout
 * Dynamically distributes children across columns based on height
 */
export function MasonryGrid({
    children,
    columns = 3,
    gap = 24,
    className
}: MasonryGridProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial column count calculation
    const getInitialColumns = () => {
        if (typeof columns === "number") return columns;
        const width = typeof window !== "undefined" ? window.innerWidth : 1200;
        if (width < 640) return columns.sm || 1;
        if (width < 1024) return columns.md || 2;
        if (width < 1280) return columns.lg || 3;
        return columns.xl || 4;
    };

    const [columnCount, setColumnCount] = useState(getInitialColumns());

    // Responsive column count
    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (typeof columns === "number") {
                if (width < 640) setColumnCount(1);
                else if (width < 1024) setColumnCount(2);
                else if (width < 1280) setColumnCount(3);
                else setColumnCount(columns);
            } else {
                if (width < 640) setColumnCount(columns.sm || 1);
                else if (width < 1024) setColumnCount(columns.md || 2);
                else if (width < 1280) setColumnCount(columns.lg || 3);
                else setColumnCount(columns.xl || 4);
            }
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, [columns]);

    // Normalize children to array
    const childArray = Children.toArray(children);

    // Distribute children across columns
    const columnsToRender = Math.max(1, columnCount);
    const columnArrays: ReactNode[][] = Array.from(
        { length: columnsToRender },
        () => []
    );

    childArray.forEach((child, index) => {
        const colIndex = index % columnsToRender;
        if (columnArrays[colIndex]) {
            columnArrays[colIndex].push(child);
        }
    });

    return (
        <div
            ref={containerRef}
            className={cn("flex", className)}
            style={{ gap: `${gap}px` }}
        >
            {columnArrays.map((column, columnIndex) => (
                <div
                    key={columnIndex}
                    className="flex-1 flex flex-col"
                    style={{ gap: `${gap}px` }}
                >
                    {column.map((child, childIndex) => (
                        <div key={childIndex} className="break-inside-avoid">
                            {child}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default MasonryGrid;
