import type { LucideIcon } from "lucide-react";
import { SwipeRail } from "@/components/ui/SwipeRail";

type WorkspaceItem = {
  value: string;
  label: string;
  icon: LucideIcon;
  hidden?: boolean;
};

type DashboardWorkspaceNavProps = {
  eyebrow: string;
  title: string;
  activeValue: string;
  items: WorkspaceItem[];
  onValueChange: (value: string) => void;
  anchorId?: string;
};

export function DashboardWorkspaceNav({
  eyebrow,
  title,
  activeValue,
  items,
  onValueChange,
  anchorId = "role-workspace",
}: DashboardWorkspaceNavProps) {
  const visibleItems = items.filter((item) => !item.hidden);

  const openWorkspace = (value: string) => {
    onValueChange(value);
    window.requestAnimationFrame(() => {
      document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <section className="sticky top-0 z-30 border-y border-white/10 bg-[#111111]/95 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-1 py-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-primary">{eyebrow}</p>
          <h2 className="mt-1 font-serif text-lg font-bold text-white sm:text-xl">{title}</h2>
        </div>

        <SwipeRail
          compact
          fadeFrom="from-[#111111]"
          showDots={false}
          className="min-w-0"
          scrollerClassName="gap-2 pb-1"
        >
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.value === activeValue;

            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${anchorId}-${item.value}`}
                onClick={() => openWorkspace(item.value)}
                className={`group flex shrink-0 snap-start items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] sm:text-sm ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-white/55 hover:border-white/20 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </SwipeRail>
      </div>
    </section>
  );
}
