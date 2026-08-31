import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Loader2, Settings, DollarSign, Gem, Zap, Shield,
    Save, AlertTriangle, Construction, RefreshCw
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface PlatformConfig {
    payout_threshold_usd: number;
    gem_usd_rate: number;
    point_multiplier: number;
    maintenance_mode: boolean;
    maintenance_message: string;
}

export function AdminConfigTab() {
    const { t } = useI18n();
    const { session } = useAuth();
    const { toast } = useToast();
    const [config, setConfig] = useState<PlatformConfig>({
        payout_threshold_usd: 250,
        gem_usd_rate: 0.01,
        point_multiplier: 1,
        maintenance_mode: false,
        maintenance_message: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const headers = { Authorization: `Bearer ${session?.access_token}` };

    const fetchConfig = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/economy/config`, { headers });
            if (res.ok) setConfig(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        if (session?.access_token) fetchConfig();
    }, [session]);

    const saveConfig = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/economy/config`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                toast({ title: t("platCfg.toastSaved"), description: t("platCfg.toastSavedBody") });
            } else {
                const data = await res.json();
                throw new Error(data.error);
            }
        } catch (e: any) {
            toast({ title: t("platCfg.toastFail"), description: e.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="grid md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{t("platCfg.title")}</h2>
                        <p className="text-muted-foreground text-sm">{t("platCfg.copy")}</p>
                    </div>
                </div>
                <Button onClick={saveConfig} disabled={isSaving} className="shadow-glow gap-2">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t("platCfg.save")}
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Economy Settings */}
                <Card className="border-cyan-500/20">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Gem className="w-5 h-5 text-cyan-400" />
                            {t("platCfg.economy")}
                        </CardTitle>
                        <CardDescription>{t("platCfg.economyCopy")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider font-bold">{t("platCfg.gemRate")}</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">$</span>
                                <Input
                                    type="number"
                                    step="0.001"
                                    value={config.gem_usd_rate}
                                    onChange={e => setConfig({ ...config, gem_usd_rate: parseFloat(e.target.value) })}
                                    className="font-mono"
                                />
                                <span className="text-sm text-muted-foreground whitespace-nowrap">{t("platCfg.perGem")}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">{t("platCfg.gemMath", { amount: (100 * config.gem_usd_rate).toFixed(2) })}</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider font-bold">{t("platCfg.multiplier")}</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    max="10"
                                    value={config.point_multiplier}
                                    onChange={e => setConfig({ ...config, point_multiplier: parseFloat(e.target.value) })}
                                    className="font-mono"
                                />
                                <span className="text-sm text-muted-foreground">×</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                {config.point_multiplier > 1 
                                    ? t("platCfg.doubleOn", { n: config.point_multiplier })
                                    : t("platCfg.doubleOff")
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Payout Settings */}
                <Card className="border-emerald-500/20">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-500" />
                            {t("platCfg.payouts")}
                        </CardTitle>
                        <CardDescription>{t("platCfg.payoutsCopy")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider font-bold">{t("platCfg.minWithdraw")}</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">$</span>
                                <Input
                                    type="number"
                                    step="50"
                                    min="50"
                                    value={config.payout_threshold_usd}
                                    onChange={e => setConfig({ ...config, payout_threshold_usd: parseFloat(e.target.value) })}
                                    className="font-mono"
                                />
                                <span className="text-sm text-muted-foreground">USD</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                {t("platCfg.mustAccum", { amount: config.payout_threshold_usd })}
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <p className="text-xs text-muted-foreground">
                                <strong className="text-foreground">{t("platCfg.tip")}</strong> {t("platCfg.tipBody")}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Maintenance Mode */}
                <Card className={`md:col-span-2 ${config.maintenance_mode ? 'border-red-500/50 bg-red-500/5' : 'border-border'}`}>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Construction className={`w-5 h-5 ${config.maintenance_mode ? 'text-red-500' : 'text-muted-foreground'}`} />
                            {t("platCfg.maint")}
                            {config.maintenance_mode && (
                                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] uppercase font-bold rounded-full animate-pulse">
                                    {t("platCfg.active")}
                                </span>
                            )}
                        </CardTitle>
                        <CardDescription>{t("platCfg.maintCopy")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className={`w-5 h-5 ${config.maintenance_mode ? 'text-red-500' : 'text-muted-foreground'}`} />
                                <div>
                                    <p className="text-sm font-bold">{config.maintenance_mode ? t("platCfg.siteMaint") : t("platCfg.siteLive")}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {config.maintenance_mode ? t("platCfg.usersSee") : t("platCfg.allOpen")}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={config.maintenance_mode}
                                onCheckedChange={v => setConfig({ ...config, maintenance_mode: v })}
                            />
                        </div>
                        {config.maintenance_mode && (
                            <div className="space-y-2 animate-in slide-in-from-top-2">
                                <Label className="text-xs uppercase tracking-wider font-bold">{t("platCfg.customMsg")}</Label>
                                <Textarea
                                    placeholder={t("platCfg.msgPh")}
                                    value={config.maintenance_message}
                                    onChange={e => setConfig({ ...config, maintenance_message: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
