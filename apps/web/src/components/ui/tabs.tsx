import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { getNearestSwipeIndex, getSwipeOverflowState } from "@/lib/swipe-overflow";
import { useI18n } from "@/i18n/I18nContext";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const { t } = useI18n();
  const localRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const [overflows, setOverflows] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [itemCount, setItemCount] = React.useState(0);

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const updateScrollState = React.useCallback(() => {
    const el = localRef.current;
    if (!el) return;
    const next = getSwipeOverflowState(el.scrollLeft, el.clientWidth, el.scrollWidth);
    setCanScrollLeft(next.canScrollLeft);
    setCanScrollRight(next.canScrollRight);
    setOverflows(next.overflows);
    const cards = Array.from(el.children).filter((node): node is HTMLElement => node instanceof HTMLElement);
    setItemCount(cards.length);
    if (!cards.length) return;
    setActiveIndex(getNearestSwipeIndex(
      cards.map((card) => card.offsetLeft + card.offsetWidth / 2),
      el.scrollLeft + el.clientWidth / 2,
    ));
  }, []);

  React.useEffect(() => {
    const el = localRef.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>("[data-state='active'], [aria-selected='true']");
    if (active) {
      const left = active.offsetLeft - (el.clientWidth - active.offsetWidth) / 2;
      el.scrollTo({ left: Math.max(0, left) });
    }
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, props.children]);

  return (
    <div className="relative w-full min-w-0">
      {overflows && (
        <div className="mb-1.5 flex justify-end">
          <span className="flex items-center gap-1 text-[10px] font-bold text-primary">
            {canScrollRight ? (
              <>
                {t("swipe.more")} <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </>
            ) : (
              t("swipe.position", { current: String(activeIndex + 1), total: String(Math.max(itemCount, 1)) })
            )}
          </span>
        </div>
      )}
      {canScrollLeft && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-8 bg-gradient-to-r from-background to-transparent" />
      )}
      {canScrollRight && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-10 bg-gradient-to-l from-background to-transparent" />
      )}
      <TabsPrimitive.List
        ref={setRefs}
        className={cn(
          "flex h-auto min-h-10 w-full max-w-full items-center justify-start gap-1 overflow-x-auto rounded-md bg-muted p-1 text-muted-foreground snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:inline-flex sm:w-auto sm:justify-center",
          overflows && "pr-8",
          className,
        )}
        {...props}
      />
    </div>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex min-h-[44px] shrink-0 snap-start items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:min-h-9",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
