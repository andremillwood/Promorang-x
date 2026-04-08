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

export default function BrandOnboarding() {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/organizations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to create organization');

            toast({
                title: "Welcome Aboard!",
                description: `${formData.name} has been established.`,
            });

            // Refresh profile to update roles
            await refreshProfile();

            // Navigate to dashboard (which handles role routing)
            navigate('/dashboard');

        } catch (error: any) {
            toast({
                title: "Error",
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
                    <h1 className="text-3xl font-bold font-serif">Establish Your Presence</h1>
                    <p className="text-muted-foreground">
                        Create a professional identity to unlock powerful tools.
                    </p>
                </div>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle>Organization Details</CardTitle>
                            <CardDescription>Tell us about your business.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Organization Name</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder="Acme Corp"
                                        className="pl-9"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Account Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => handleChange('type', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="brand">Brand (I want to promote)</SelectItem>
                                        <SelectItem value="merchant">Merchant (I have a venue)</SelectItem>
                                        <SelectItem value="agency">Agency (I manage others)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="industry">Industry</Label>
                                <Input
                                    id="industry"
                                    placeholder="e.g. Fashion, Tech, Hospitality"
                                    value={formData.industry}
                                    onChange={(e) => handleChange('industry', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
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
                                <Label htmlFor="email">Business Email</Label>
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
                                {loading ? "Creating..." : "Create Organization"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
