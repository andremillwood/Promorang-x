import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Building2, Globe, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/i18n/I18nContext';

export default function BrandOnboarding() {
    const { user, refreshWorkspaceContext } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useI18n();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'brand', // Default to brand
        industry: '',
        website: '',
        contact_email: user?.email || ''
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.rpc("create_organization_workspace", {
                p_name: formData.name,
                p_type: formData.type,
                p_industry: formData.industry || null,
                p_website: formData.website || null,
                p_contact_email: formData.contact_email || null,
            });
            if (error) throw error;

            toast({
                title: t("brandOnb.ready"),
                description: t("brandOnb.readyDesc", { name: formData.name }),
            });

            await refreshWorkspaceContext();

            // Navigate to the Flash Launch compiler to immediately start creating a campaign
            navigate('/dashboard/brand/campaigns/create');

        } catch (error: any) {
            toast({
                title: t("brandOnb.error"),
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold font-serif">{t("brandOnb.title")}</h1>
                    <p className="text-muted-foreground">
                        {t("brandOnb.lede")}
                    </p>
                </div>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle>{t("brandOnb.details")}</CardTitle>
                            <CardDescription>{t("brandOnb.detailsDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t("brandOnb.orgName")}</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder={t("brandOnb.orgPlaceholder")}
                                        className="pl-9"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">{t("brandOnb.accountType")}</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => handleChange('type', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("brandOnb.selectType")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="brand">{t("brandOnb.typeBrand")}</SelectItem>
                                        <SelectItem value="merchant">{t("brandOnb.typeMerchant")}</SelectItem>
                                        <SelectItem value="agency">{t("brandOnb.typeAgency")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="industry">{t("brandOnb.industry")}</Label>
                                <Input
                                    id="industry"
                                    placeholder={t("brandOnb.industryPh")}
                                    value={formData.industry}
                                    onChange={(e) => handleChange('industry', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">{t("brandOnb.website")}</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="website"
                                        placeholder="https://example.com"
                                        className="pl-9"
                                        value={formData.website}
                                        onChange={(e) => handleChange('website', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">{t("brandOnb.email")}</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="contact@example.com"
                                        className="pl-9"
                                        value={formData.contact_email}
                                        onChange={(e) => handleChange('contact_email', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" variant="hero" disabled={loading}>
                                {loading ? t("brandOnb.creating") : t("brandOnb.create")}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
