import React, { useState } from "react";
import {
  GitFork,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Ticket,
  DollarSign,
  TrendingUp,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/I18nContext";

export interface CausationNode {
  id: string;
  actorHandle: string;
  actorAvatarText?: string;
  action: string;
  timestamp: string;
  status: "verified" | "pending" | "converted";
  valueContribution?: string;
  verificationDetail?: string;
  children?: CausationNode[];
}

interface CausationTreeProps {
  rootNode: CausationNode;
  targetEntity: string;
  className?: string;
}

export const CausationTree: React.FC<CausationTreeProps> = ({
  rootNode,
  targetEntity,
  className = "",
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { t } = useI18n();

  return (
    <div className={`rounded-2xl border border-white/10 bg-[#0c0c11] p-6 text-white ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-wider">{t("cause.treeTitle")}</h3>
          </div>
          <p className="mt-1 text-xs text-white/50">
            {t("cause.treeCopy", { entity: targetEntity })}
          </p>
        </div>
        <Badge className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-400">
          <CheckCircle2 className="mr-1 h-3 w-3" /> {t("cause.direct")}
        </Badge>
      </div>

      {/* Root Initiator Node */}
      <div className="mt-6">
        <div className="relative flex items-start gap-4 rounded-xl border border-primary/40 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-4 shadow-[0_0_25px_rgba(249,115,22,0.15)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-black text-black ring-4 ring-primary/20">
            {rootNode.actorAvatarText || rootNode.actorHandle.slice(1, 3).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{rootNode.actorHandle}</span>
                <Badge variant="outline" className="border-primary/40 text-[9px] font-bold text-primary">
                  {t("cause.initiator")}
                </Badge>
              </div>
              <span className="font-mono text-[10px] text-white/40">{rootNode.timestamp}</span>
            </div>
            <p className="mt-1 text-xs font-medium text-white/80">{rootNode.action}</p>
            {rootNode.valueContribution && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-1 font-mono text-[11px] text-emerald-400">
                <Sparkles className="h-3 w-3" /> {t("cause.totalYield", { value: rootNode.valueContribution })}
              </div>
            )}
          </div>
        </div>

        {/* Branch Lines & Downstream Children Nodes */}
        {rootNode.children && rootNode.children.length > 0 && (
          <div className="relative ml-5 mt-4 space-y-4 border-l-2 border-dashed border-white/15 pl-6">
            {rootNode.children.map((child, idx) => {
              const isSelected = selectedNodeId === child.id;
              return (
                <div
                  key={child.id}
                  onClick={() => setSelectedNodeId(isSelected ? null : child.id)}
                  className={`group relative cursor-pointer rounded-xl border p-3.5 transition-all duration-200 ${
                    isSelected
                      ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                      : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  {/* Branch connector horizontal pip */}
                  <div className="absolute -left-6 top-5 h-0.5 w-6 bg-white/20" />

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 font-mono text-[10px] font-bold text-white">
                        {child.actorAvatarText || child.actorHandle.slice(1, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{child.actorHandle}</span>
                          <span className="font-mono text-[10px] text-white/40">{child.timestamp}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-white/70">{child.action}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {child.valueContribution && (
                        <span className="font-mono text-xs font-black text-emerald-400">
                          {child.valueContribution}
                        </span>
                      )}
                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] font-mono text-emerald-400/80">
                        <CheckCircle2 className="h-3 w-3" /> {t("cause.verified")}
                      </div>
                    </div>
                  </div>

                  {/* Verification detail drawer if present */}
                  {child.verificationDetail && (
                    <div className="mt-2.5 rounded-lg border border-white/5 bg-black/40 px-2.5 py-1.5 font-mono text-[10px] text-white/50">
                      {t("cause.proof", { detail: child.verificationDetail })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
