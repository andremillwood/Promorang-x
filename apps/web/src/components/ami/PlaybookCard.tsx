import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Rocket, Target, Users, Play } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import type { TranslationKey } from '@/i18n/translations';

export interface Playbook {
    id: string;
    goal: "CONTENT" | "PURCHASE" | "VISIT" | "REFERRAL";
    titleKey: TranslationKey;
    context: string;
    happensKey: TranslationKey;
    getsKey: TranslationKey;
    bestForKey: TranslationKey;
}

interface PlaybookCardProps {
    playbook: Playbook;
    onUse: (playbook: Playbook) => void;
}

export function PlaybookCard({ playbook, onUse }: PlaybookCardProps) {
    const { t } = useI18n();

    const getGoalBadge = (goal: string) => {
        switch (goal) {
            case 'CONTENT': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'PURCHASE': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'VISIT': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'REFERRAL': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <Card className="flex flex-col h-full bg-card hover:shadow-xl transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-300 border-border/50 group overflow-hidden">
            <CardHeader className="p-6 pb-2">
                <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] uppercase font-black tracking-widest ${getGoalBadge(playbook.goal)} border`}>
                        {playbook.goal}
                    </Badge>
                </div>
                <CardTitle className="font-serif text-2xl font-bold italic tracking-tight group-hover:text-primary transition-colors">
                    {t(playbook.titleKey)}
                </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-4 flex-grow">
                <div className="space-y-1.5">
                    <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1.5">
                        <Target className="w-3 h-3" /> {t("launchRes.happens")}
                    </h4>
                    <p className="text-sm font-medium leading-relaxed">
                        {t(playbook.happensKey)}
                    </p>
                </div>

                <div className="space-y-1.5">
                    <h4 className="text-[10px] uppercase font-bold text-primary tracking-widest flex items-center gap-1.5">
                        <Rocket className="w-3 h-3" /> {t("launchRes.gets")}
                    </h4>
                    <p className="text-sm font-medium leading-relaxed">
                        {t(playbook.getsKey)}
                    </p>
                </div>

                <div className="space-y-1.5">
                    <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1.5">
                        <Users className="w-3 h-3" /> {t("launchRes.bestFor")}
                    </h4>
                    <p className="text-xs text-muted-foreground italic">
                        {t(playbook.bestForKey)}
                    </p>
                </div>
            </CardContent>

            <CardFooter className="p-6 pt-0 mt-auto">
                <Button 
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-black italic tracking-tighter shadow-lg shadow-primary/20 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] active:scale-95 group-hover:scale-[1.02]"
                    onClick={() => onUse(playbook)}
                >
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    {t("launchRes.usePlaybook")}
                </Button>
            </CardFooter>
        </Card>
    );
}
