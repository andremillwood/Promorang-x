import { Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export type AdminToolItem = {
  value: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

export type AdminToolGroup = {
  label: string;
  items: AdminToolItem[];
};

type AdminMobileToolSwitchProps = {
  groups: AdminToolGroup[];
  activeTab: string;
  onChange: (value: string) => void;
  search: string;
  onSearch: (value: string) => void;
};

export function AdminMobileToolSwitch({
  groups,
  activeTab,
  onChange,
  search,
  onSearch,
}: AdminMobileToolSwitchProps) {
  const matches = search.trim()
    ? groups.flatMap((group) => group.items).filter((item) =>
        item.label.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : [];

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-[#0e1218] p-4 lg:hidden">
      <label className="block text-sm font-semibold text-white">
        Admin tool
        <select
          value={activeTab}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1.5 h-12 w-full rounded-xl border border-white/15 bg-black px-3 text-base text-white"
        >
          {groups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.items.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Jump to tool…"
          className="h-11 rounded-xl border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/40"
        />
      </div>
      {matches.length > 0 ? (
        <div className="grid grid-cols-1 gap-1.5 rounded-xl border border-cyan-500/30 bg-[#141822] p-2">
          {matches.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                onChange(item.value);
                onSearch("");
              }}
              className="rounded-lg px-3 py-2.5 text-left text-sm text-white/80"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
