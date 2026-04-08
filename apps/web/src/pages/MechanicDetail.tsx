import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ActivationMechanic } from '../types/ami';
import { amiService } from '../services/ami';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, MapPin, Smartphone, Share2, Activity, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

export default function MechanicDetail() {
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
                <h1 className="text-2xl font-bold mb-4">Strategy Not Found</h1>
                <Button asChild>
                    <Link to="/">Return to Index</Link>
                </Button>
            </div>
        );
    }

    const formatOutcome = (outcome: string) => {
        return outcome.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
                title={`${mechanic.name} - Activation Strategy`}
                description={mechanic.description}
            />

            <div className="container mx-auto px-4 py-8 max-w-5xl space-y-10 pb-24">
                {/* Header */}
                <div className="space-y-6">
                    <Link to="/strategies" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Index
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
                                    {mechanic.proof_type} Proof
                                </Badge>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground">
                                {mechanic.name}
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                {mechanic.description}
                            </p>
                        </div>

                        {/* Reliability Card */}
                        <div className="w-full md:w-auto p-6 bg-card border border-border/50 rounded-2xl shadow-sm space-y-4 min-w-[300px]">
                            <div className="space-y-1">
                                <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Reliability Score</span>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-4xl font-bold ${Number(mechanic.reliability_score) >= 90 ? 'text-green-500' : 'text-yellow-500'}`}>
                                        {Number(mechanic.reliability_score || 0).toFixed(0)}%
                                    </span>
                                    <span className="text-sm font-medium text-muted-foreground">success rate</span>
                                </div>
                            </div>

                            <div className="h-px bg-border/50" />

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Confidence</span>
                                <Badge variant="outline" className={mechanic.confidence_level === 'High' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}>
                                    {mechanic.confidence_level}
                                </Badge>
                            </div>

                            <Button className="w-full font-bold group" size="lg" asChild>
                                <Link to={`/create-moment?mechanic_id=${mechanic.id}`}>
                                    Use Strategy
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
                                Why it works
                            </h3>
                            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                                <p>
                                    This mechanic is designed for <strong>{mechanic.difficulty.toLowerCase()} effort</strong> execution
                                    with a primary focus on <strong>{formatOutcome(mechanic.primary_outcome)}</strong>.
                                    It requires {mechanic.min_audience_size} minimum participants to be effective.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recommended For</h4>
                                <div className="flex flex-wrap gap-2">
                                    {mechanic.recommended_context_tags?.length > 0 ? (
                                        mechanic.recommended_context_tags.map(tag => (
                                            <div key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/5 text-green-600 dark:text-green-400 border border-green-500/10 text-sm font-medium">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                {tag}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic">General purpose use</div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Not Recommended For</h4>
                                <div className="flex flex-wrap gap-2">
                                    {mechanic.disallowed_context_tags?.length > 0 ? (
                                        mechanic.disallowed_context_tags.map(tag => (
                                            <div key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/5 text-red-600 dark:text-red-400 border border-red-500/10 text-sm font-medium">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                {tag}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic">No specific restrictions</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats */}
                    <div className="space-y-6">
                        <div className="bg-muted/30 rounded-2xl p-6 border border-border/50 space-y-4">
                            <h4 className="font-bold text-lg">Performance Data</h4>

                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Total Activations</div>
                                <div className="text-2xl font-mono font-bold">{mechanic.total_instances || 0}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Total Participants</div>
                                <div className="text-2xl font-mono font-bold">{mechanic.total_participants || 0}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Avg. Cost Per Action</div>
                                <div className="text-2xl font-mono font-bold">
                                    {mechanic.avg_cost_per_action ? `$${mechanic.avg_cost_per_action.toFixed(2)}` : 'N/A'}
                                </div>
                                <div className="text-xs text-muted-foreground">for {mechanic.expected_action_unit || 'action'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
