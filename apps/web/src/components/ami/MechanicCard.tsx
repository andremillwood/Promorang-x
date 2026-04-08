import { ActivationMechanic } from '../../types/ami';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MapPin, Smartphone, Share2, Activity, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MechanicCardProps {
    mechanic: ActivationMechanic;
}

export function MechanicCard({ mechanic }: MechanicCardProps) {
    const getOutcomeColor = (outcome: string) => {
        switch (outcome) {
            case 'foot_traffic': return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
            case 'sales': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
            case 'ugc': return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20';
            case 'social_follows': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
            case 'app_download': return 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const formatOutcome = (outcome: string) => {
        return outcome.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    const getProofIcon = (type: string) => {
        switch (type) {
            case 'GPS': return <MapPin className="w-4 h-4" />;
            case 'QR': return <Smartphone className="w-4 h-4" />;
            case 'Photo': return <Activity className="w-4 h-4" />;
            case 'API': return <Share2 className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    return (
        <Card className="flex flex-col h-full bg-card hover:shadow-soft-xl transition-all duration-300 border-border/50 group overflow-hidden">
            <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-start gap-4">
                    <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs font-semibold ${getOutcomeColor(mechanic.primary_outcome)} border-0`}>
                        {formatOutcome(mechanic.primary_outcome)}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                        {getProofIcon(mechanic.proof_type)}
                        <span>{mechanic.proof_type}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-5 flex-grow">
                <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {mechanic.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {mechanic.description}
                </p>

                {/* Reliability Score */}
                <div className="mt-6 flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${Number(mechanic.reliability_score) >= 90 ? 'bg-green-500/5 text-green-500 border-green-500/20' : 'bg-yellow-500/5 text-yellow-500 border-yellow-500/20'}`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {Number(mechanic.reliability_score || 0).toFixed(0)}% Reliable
                    </div>

                    {/* Confidence Badge */}
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-muted uppercase tracking-wider text-muted-foreground">
                        {mechanic.confidence_level || 'Low'} Conf.
                    </div>

                    {/* Difficulty Badge */}
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold px-2">
                        {mechanic.difficulty} Effort
                    </span>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 mt-auto">
                <Button className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300" variant="secondary" asChild>
                    <Link to={`/strategies/${mechanic.id}`}>
                        <span className="font-bold">View Strategy</span>
                        <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
