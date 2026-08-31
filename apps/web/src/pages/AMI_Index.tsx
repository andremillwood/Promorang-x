import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import {
    Target,
    ArrowRight,
    Zap,
    TrendingUp,
    Users,
    MessageSquare,
    ShoppingBag,
    MapPin,
    UserPlus,
    X
} from 'lucide-react';
import SEO from '../components/SEO';
import { Playbook, PlaybookCard } from '../components/ami/PlaybookCard';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '../components/ui/dialog';
import { PromoPilotCompiler } from '../components/campaigns/PromoPilotCompiler';
import { useI18n } from '@/i18n/I18nContext';
import type { TranslationKey } from '@/i18n/translations';

const PLAYBOOKS: Playbook[] = [
    {
        id: 'content-1',
        goal: 'CONTENT',
        titleKey: 'launchRes.p1Title',
        context: 'First bite reaction',
        happensKey: 'launchRes.p1Happens',
        getsKey: 'launchRes.p1Gets',
        bestForKey: 'launchRes.p1Best',
    },
    {
        id: 'content-2',
        goal: 'CONTENT',
        titleKey: 'launchRes.p2Title',
        context: 'Surprise reaction',
        happensKey: 'launchRes.p2Happens',
        getsKey: 'launchRes.p2Gets',
        bestForKey: 'launchRes.p2Best',
    },
    {
        id: 'content-3',
        goal: 'CONTENT',
        titleKey: 'launchRes.p3Title',
        context: 'Visitor story',
        happensKey: 'launchRes.p3Happens',
        getsKey: 'launchRes.p3Gets',
        bestForKey: 'launchRes.p3Best',
    },
    {
        id: 'purchase-1',
        goal: 'PURCHASE',
        titleKey: 'launchRes.p4Title',
        context: 'Limited time order',
        happensKey: 'launchRes.p4Happens',
        getsKey: 'launchRes.p4Gets',
        bestForKey: 'launchRes.p4Best',
    },
    {
        id: 'visit-1',
        goal: 'VISIT',
        titleKey: 'launchRes.p5Title',
        context: 'Location visit',
        happensKey: 'launchRes.p5Happens',
        getsKey: 'launchRes.p5Gets',
        bestForKey: 'launchRes.p5Best',
    },
    {
        id: 'referral-1',
        goal: 'REFERRAL',
        titleKey: 'launchRes.p6Title',
        context: 'Referral program',
        happensKey: 'launchRes.p6Happens',
        getsKey: 'launchRes.p6Gets',
        bestForKey: 'launchRes.p6Best',
    },
];

type GoalType = "CONTENT" | "PURCHASE" | "VISIT" | "REFERRAL";

export default function AMI_Index() {
    const { t } = useI18n();
    const [selectedGoal, setSelectedGoal] = useState<GoalType>("CONTENT");
    const [activePlaybook, setActivePlaybook] = useState<Playbook | null>(null);
    const [isCompilerOpen, setIsCompilerOpen] = useState(false);

    const filteredPlaybooks = PLAYBOOKS.filter(p => p.goal === selectedGoal);

    const handleUsePlaybook = (playbook: Playbook) => {
        setActivePlaybook(playbook);
        setIsCompilerOpen(true);
    };

    const goalOptions: { id: GoalType; label: TranslationKey; icon: React.ReactNode; color: string; bg: string }[] = [
        { id: 'CONTENT', label: 'launchRes.goalContent', icon: <MessageSquare className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { id: 'PURCHASE', label: 'launchRes.goalPurchase', icon: <ShoppingBag className="w-5 h-5" />, color: 'text-green-500', bg: 'bg-green-500/10' },
        { id: 'VISIT', label: 'launchRes.goalVisit', icon: <MapPin className="w-5 h-5" />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { id: 'REFERRAL', label: 'launchRes.goalReferral', icon: <UserPlus className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title={t("launchRes.seoTitle")}
                description={t("launchRes.seoDesc")}
            />

            <div className="container mx-auto px-4 py-12 max-w-6xl space-y-16">

                {/* Section 1: Result Selection */}
                <div className="space-y-8 text-center">
                    <div className="space-y-4">
                        <h2 className="text-sm uppercase tracking-[0.2em] font-black text-primary opacity-80">{t("launchRes.phase")}</h2>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter italic">
                            {t("launchRes.title1")} <span className="text-primary underline decoration-primary/30">{t("launchRes.title2")}</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            {t("launchRes.lede")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        {goalOptions.map((goal) => (
                            <button
                                key={goal.id}
                                onClick={() => setSelectedGoal(goal.id as GoalType)}
                                className={`
                                    relative p-6 rounded-2xl border-2 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-300 text-left flex flex-col gap-4 group
                                    ${selectedGoal === goal.id
                                        ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10'
                                        : 'border-border/50 bg-card hover:border-primary/50 hover:bg-muted/50'}
                                `}
                            >
                                <div className={`w-12 h-12 rounded-xl ${goal.bg} ${goal.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                    {goal.icon}
                                </div>
                                <span className={`font-bold leading-tight ${selectedGoal === goal.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {t(goal.label)}
                                </span>
                                {selectedGoal === goal.id && (
                                    <div className="absolute top-3 right-3">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section 2: Playbooks */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-border/50 pb-4">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-primary fill-primary/20" />
                            <h3 className="text-xl font-black italic tracking-tight uppercase">{t("launchRes.templates")}</h3>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {t("launchRes.patterns", { count: filteredPlaybooks.length })}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPlaybooks.length > 0 ? (
                            filteredPlaybooks.map((playbook) => (
                                <PlaybookCard
                                    key={playbook.id}
                                    playbook={playbook}
                                    onUse={handleUsePlaybook}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-muted/30 rounded-3xl border-2 border-dashed border-border/50">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <h4 className="text-lg font-bold mb-1">{t("launchRes.emptyTitle")}</h4>
                                <p className="text-muted-foreground text-sm">{t("launchRes.emptyCopy")}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Campaign Compiler Modal */}
            <Dialog open={isCompilerOpen} onOpenChange={setIsCompilerOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-primary/20 shadow-2xl">
                    <div className="absolute right-4 top-4 z-50">
                        <Button variant="ghost" size="icon" onClick={() => setIsCompilerOpen(false)} className="rounded-full h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="p-8 pb-0">
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-primary/10 text-primary uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded">
                                    {t("launchRes.prefilled")}
                                </div>
                            </div>
                            <DialogTitle className="text-3xl font-serif font-black italic tracking-tighter">
                                {activePlaybook ? t(activePlaybook.titleKey) : ""}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                {t("launchRes.compilerDesc")}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 pt-4 overflow-y-auto max-h-[80vh]">
                        {activePlaybook && (
                            <PromoPilotCompiler
                                initialInput={{
                                    goal: activePlaybook.goal,
                                    context: activePlaybook.context
                                }}
                                onSuccess={() => setIsCompilerOpen(false)}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Footer / CTA Section */}
            <div className="bg-muted/30 border-t border-border/50 py-20">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <TrendingUp className="w-10 h-10 mx-auto text-primary opacity-50" />
                    <h2 className="text-3xl font-serif font-bold italic tracking-tight">{t("launchRes.needTitle")}</h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        {t("launchRes.needCopy")}
                    </p>
                    <Button variant="outline" size="lg" className="rounded-full font-black italic tracking-tighter" asChild>
                        <a href="/activate">{t("launchRes.custom")} <ArrowRight className="ml-2 w-4 h-4" /></a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
