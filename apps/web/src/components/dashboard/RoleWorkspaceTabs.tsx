import type { LucideIcon } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export type RoleWorkspaceItem = { id: string; label: string; icon: LucideIcon; hint?: string };

/** Visible Radix triggers keep labels, focus, selection and panels in one place. */
export function RoleWorkspaceTabs({ label, items }: { label: string; items: RoleWorkspaceItem[] }) {
  return (
    <TabsList aria-label={label} className="flex w-full flex-wrap justify-start gap-1 overflow-visible rounded-none bg-transparent p-0 sm:w-full sm:justify-start">
      {items.map(({ id, label: text, icon: Icon, hint }) => (
        <TabsTrigger key={id} value={id} title={hint} className="min-h-11 max-w-full gap-2 whitespace-normal rounded-none border-b-[3px] border-transparent px-3 py-2 text-left text-sm font-medium text-white/70 data-[state=active]:border-orange-400 data-[state=active]:bg-transparent data-[state=active]:text-orange-300 data-[state=active]:shadow-none">
          <Icon aria-hidden="true" className="h-4 w-4 shrink-0" /><span className="min-w-0 break-words">{text}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
