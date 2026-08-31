import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ActivationMechanic } from '../types/ami';
import { amiService } from '../services/ami';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, MapPin, Smartphone, Share2, Activity, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import { useI18n } from '@/i18n/I18nContext';
import type { TranslationKey } from '@/i18n/translations';
import type { ConfidenceLevel, MechanicDifficulty, MechanicOutcome } from '../types/ami';

const OUTCOME_KEYS: Record<MechanicOutcome, TranslationKey> = {
    foot_traffic: "mechDetail.outcomeTraffic",
    sales: "mechDetail.outcomeSales",
    ugc: "mechDetail.outcomeUgc",
    social_follows: "mechDetail.outcomeFollows",
    app_download: "mechDetail.outcomeDownload",
};

const DIFF_KEYS: Record<MechanicDifficulty, TranslationKey> = {
    Low: "mechDetail.diffLow",
    Medium: "mechDetail.diffMedium",
    High: "mechDetail.diffHigh",
};

const CONF_KEYS: Record<ConfidenceLevel, TranslationKey> = {
    Low: "mechDetail.confLow",
    Medium: "mechDetail.confMedium",
    High: "mechDetail.confHigh",
};

export default function MechanicDetail() {
    const { t } = useI18n();
    const { id } = useParams<{ id: string }>();
    const [mechanic, setMechanic] = useState<ActivationMechanic | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchMechanic = async () => {
            setLoading(true);
            try {
                const data = await amiService.getMechanicById(id);
                setMechanic(data);
            } catch (error) {
                console.error('Failed to load mechanic:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMechanic();
    }, [id]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
                <Skeleton className="h-12 w-3/4 rounded-xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (!mechanic) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">{t("mechDetail.notFound")}</h1>
                <Button asChild>
                    <Link to="/">{t("mechDetail.returnIndex")}</Link>
                </Button>
            </div>
        );
    }

    const formatOutcome = (outcome: MechanicOutcome | string) => {
        return OUTCOME_KEYS[outcome as MechanicOutcome]
            ? t(OUTCOME_KEYS[outcome as MechanicOutcome])
            : outcome.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    const getOutcomeColor = (outcome: string) => {
        switch (outcome) {
            case 'foot_traffic': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'sales': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'ugc': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'social_follows': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'app_download': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default: return 'bg-muted text-muted-foreground border-border/50';
        }
    };

    return (
        <>
            <SEO
                title={`${mechanic.name} - ${t("mechDetail.seoSuffix")}`}
                description={mechanic.description}
            />

            <div className="container mx-auto max-w-5xl space-y-8 px-4 py-6 pb-20 sm:space-y-10 sm:py-8 sm:pb-24">
                {/* Header */}
                <div className="space-y-6">
                    <Link to="/strategies" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        {t("mechDetail.back")}
                    </Link>

                    <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getOutcomeColor(mechanic.primary_outcome)}`}>
                                    {formatOutcome(mechanic.primary_outcome)}
                                </Badge>
                                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold">
                                    {mechanic.category}
                                </Badge>
                                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold bg-muted/50">
                                    {t("mechDetail.proof", { type: mechanic.proof_type })}
                                </Badge>
                            </div>

                            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                                {mechanic.name}
                            </h1>
                            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
                                {mechanic.description}
                            </p>
                        </div>

                        {/* Reliability Card */}
                        <div className="w-full max-w-full space-y-4 rounded-2xl border border-border/50 bg-card p-5 shadow-sm sm:p-6 md:w-auto md:max-w-sm">
                            <div className="space-y-1">
                                <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">{t("mechDetail.reliability")}</span>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-3xl font-bold sm:text-4xl ${Number(mechanic.reliability_score) >= 90 ? 'text-green-500' : 'text-yellow-500'}`}>
                                        {Number(mechanic.reliability_score || 0).toFixed(0)}%
                                    </span>
                                    <span className="text-sm font-medium text-muted-foreground">{t("mechDetail.successRate")}</span>
                                </div>
                            </div>

                            <div className="h-px bg-border/50" />

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{t("mechDetail.confidence")}</span>
                                <Badge variant="outline" className={mechanic.confidence_level === 'High' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}>
                                    {CONF_KEYS[mechanic.confidence_level] ? t(CONF_KEYS[mechanic.confidence_level]) : mechanic.confidence_level}
                                </Badge>
                            </div>

                            <Button className="w-full font-bold group" size="lg" asChild>
                                <Link to={`/create-moment?mechanic_id=${mechanic.id}`}>
                                    {t("mechDetail.useStrategy")}
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Context & Fit */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-card/50 rounded-2xl p-6 border border-border/50 space-y-6">
                            <h3 className="font-serif text-2xl font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                {t("mechDetail.why")}
                            </h3>
                            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                                <p>
                                    {t("mechDetail.whyCopy", {
                                        effort: DIFF_KEYS[mechanic.difficulty] ? t(DIFF_KEYS[mechanic.difficulty]) : mechanic.difficulty.toLowerCase(),
                                        outcome: formatOutcome(mechanic.primary_outcome),
                                        count: mechanic.min_audience_size,
                                    })}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("mechDetail.recommended")}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {mechanic.recommended_context_tags?.length > 0 ? (
                                        mechanic.recommended_context_tags.map(tag => (
                                            <div key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/5 text-green-600 dark:text-green-400 border border-green-500/10 text-sm font-medium">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                {tag}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic">{t("mechDetail.general")}</div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("mechDetail.notRecommended")}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {mechanic.disallowed_context_tags?.length > 0 ? (
                                        mechanic.disallowed_context_tags.map(tag => (
                                            <div key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/5 text-red-600 dark:text-red-400 border border-red-500/10 text-sm font-medium">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                {tag}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic">{t("mechDetail.noRestrictions")}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats */}
                    <div className="space-y-6">
                        <div className="bg-muted/30 rounded-2xl p-6 border border-border/50 space-y-4">
                            <h4 className="font-bold text-lg">{t("mechDetail.perf")}</h4>

                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">{t("mechDetail.activations")}</div>
                                <div className="text-2xl font-mono font-bold">{mechanic.total_instances || 0}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">{t("mechDetail.participants")}</div>
                                <div className="text-2xl font-mono font-bold">{mechanic.total_participants || 0}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">{t("mechDetail.avgCost")}</div>
                                <div className="text-2xl font-mono font-bold">
                                    {mechanic.avg_cost_per_action ? `$${mechanic.avg_cost_per_action.toFixed(2)}` : t("mechDetail.na")}
                                </div>
                                <div className="text-xs text-muted-foreground">{t("mechDetail.forUnit", { unit: mechanic.expected_action_unit || "action" })}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
