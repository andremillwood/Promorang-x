import { Rocket, Zap, DollarSign, Trophy, Info } from 'lucide-react';
import Tooltip from './Tooltip';
import { cn } from '@/lib/utils';

type MaturityLevel = 'seed' | 'activated' | 'funded' | 'dominant';

interface MilestoneStage {
    id: MaturityLevel;
    label: string;
    icon: React.ComponentType<any>;
    description: string;
    longDescription: string;
}

const STAGES: MilestoneStage[] = [
    {
        id: 'seed',
        label: 'Seed',
        icon: Zap,
        description: 'Awareness & Data',
        longDescription: 'The initial scouting phase for awareness gathering and baseline interest analysis.'
    },
    {
        id: 'activated',
        label: 'Activated',
        icon: Rocket,
        description: 'Verified Demand',
        longDescription: 'Proof of concept achieved with verified user actions and measurable traction.'
    },
    {
        id: 'funded',
        label: 'Funded',
        icon: DollarSign,
        description: 'Scaled Growth',
        longDescription: 'Campaign is fully funded with live escrows for mission-based scaling.'
    },
    {
        id: 'dominant',
        label: 'Dominant',
        icon: Trophy,
        description: 'Category Leader',
        longDescription: 'Achieved high maturity with dominant category presence and long-term liquidity.'
    }
];

interface MaturityMilestonesProps {
    currentMaturity: MaturityLevel;
    verifiedCount?: number;
    targetCount?: number;
    className?: string;
}

export default function MaturityMilestones({
    currentMaturity = 'seed',
    verifiedCount = 0,
    targetCount = 100,
    className
}: MaturityMilestonesProps) {
    const currentIndex = STAGES.findIndex(s => s.id === currentMaturity);
    const progressPercent = Math.min(100, (verifiedCount / targetCount) * 100);

    return (
        <div className={cn("bg-pr-surface-card border border-pr-border rounded-2xl p-6", className)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-lg font-bold text-pr-text-1 flex items-center gap-2">
                        Demand OS Lifecycle
                        <Tooltip content="Maturity represents your campaign's progression from initial data seeding to cross-platform dominance.">
                            <Info className="w-4 h-4 text-pr-text-3 cursor-help" />
                        </Tooltip>
                    </h3>
                    <p className="text-sm text-pr-text-2 mt-1">
                        Currently in <span className="text-orange-400 font-bold capitalize">{currentMaturity}</span> phase
                    </p>
                </div>

                {currentMaturity === 'seed' && (
                    <div className="flex-1 max-w-xs">
                        <div className="flex justify-between text-xs text-pr-text-2 mb-1">
                            <span>{verifiedCount} / {targetCount} verified buys</span>
                            <span>{Math.round(progressPercent)}% to Activated</span>
                        </div>
                        <div className="w-full bg-pr-surface-2 rounded-full h-2 overflow-hidden border border-pr-surface-3">
                            <div
                                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="relative flex justify-between">
                {/* Progress Bar Background */}
                <div className="absolute top-5 left-0 w-full h-1 bg-pr-border -z-10 rounded-full" />

                {/* Active Progress Bar */}
                <div
                    className="absolute top-5 left-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400 -z-10 rounded-full transition-all duration-1000"
                    style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
                />

                {STAGES.map((stage, index) => {
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;

                    const Icon = stage.icon;

                    return (
                        <div key={stage.id} className="flex flex-col items-center flex-1 max-w-[140px]">
                            <Tooltip content={stage.longDescription}>
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 mb-3 border-2",
                                    isCompleted ? "bg-orange-500 border-orange-500 text-white" :
                                        isActive ? "bg-pr-surface-card border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)] scale-110" :
                                            "bg-pr-surface-card border-pr-border text-pr-text-3"
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </Tooltip>

                            <div className="text-center">
                                <span className={cn(
                                    "text-xs font-bold uppercase tracking-wider block",
                                    isActive ? "text-orange-400" :
                                        isCompleted ? "text-pr-text-2" :
                                            "text-pr-text-3"
                                )}>
                                    {stage.label}
                                </span>
                                <span className="text-[10px] text-pr-text-3 leading-tight hidden md:block mt-1">
                                    {stage.description}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
