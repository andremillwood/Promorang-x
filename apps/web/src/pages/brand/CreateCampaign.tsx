import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, DollarSign, Target, Users, MapPin } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CATEGORIES = [
    { value: "social", label: "Social Gathering" },
    { value: "fitness", label: "Fitness & Wellness" },
    { value: "food", label: "Food & Drink" },
    { value: "music", label: "Music & Entertainment" },
    { value: "networking", label: "Networking" },
    { value: "outdoor", label: "Outdoor Adventure" },
    { value: "arts", label: "Arts & Culture" },
];

const GOALS = [
    { value: "brand_awareness", label: "Brand Awareness" },
    { value: "customer_acquisition", label: "Customer Acquisition" },
    { value: "engagement", label: "Community Engagement" },
    { value: "product_launch", label: "Product Launch" },
    { value: "loyalty", label: "Customer Loyalty" },
];

const steps = [
    { id: 1, title: "Campaign Details", icon: Target },
    { id: 2, title: "Budget", icon: DollarSign },
    { id: 3, title: "Target Audience", icon: Users },
    { id: 4, title: "Review", icon: Check },
];

interface CampaignFormData {
    title: string;
    description: string;
    goals: string[];
    budget: number;
    duration: number;
    categories: string[];
    locations: string[];
    minAudienceSize: number;
    maxCostPerMoment: number;
}

const CreateCampaign = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<CampaignFormData>({
        title: "",
        description: "",
        goals: [],
        budget: 1000,
        duration: 30,
        categories: [],
        locations: [],
        minAudienceSize: 10,
        maxCostPerMoment: 500,
    });

    const updateField = <K extends keyof CampaignFormData>(
        field: K,
        value: CampaignFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.title || formData.title.length < 5) {
                newErrors.title = "Title must be at least 5 characters";
            }
            if (!formData.description || formData.description.length < 20) {
                newErrors.description = "Description must be at least 20 characters";
            }
            if (formData.goals.length === 0) {
                newErrors.goals = "Select at least one goal";
            }
        }

        if (step === 2) {
            if (formData.budget < 100) {
                newErrors.budget = "Minimum budget is $100";
            }
            if (formData.duration < 7) {
                newErrors.duration = "Minimum duration is 7 days";
            }
        }

        if (step === 3) {
            if (formData.categories.length === 0) {
                newErrors.categories = "Select at least one category";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, 4));
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!user) return;

        setIsSubmitting(true);

        try {
            // Get organization ID from user metadata or context
            // For now, we'll assume it's stored in user metadata
            const organizationId = user.user_metadata?.organization_id;

            if (!organizationId) {
                throw new Error("Organization ID not found. Please complete brand onboarding first.");
            }

            const response = await fetch(`${API_URL}/api/brand/campaigns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.id}`, // Simplified auth
                },
                body: JSON.stringify({
                    organizationId,
                    title: formData.title,
                    description: formData.description,
                    goals: formData.goals,
                    budget: formData.budget,
                    duration: formData.duration,
                    targetAudience: {
                        categories: formData.categories,
                        locations: formData.locations,
                        minAudienceSize: formData.minAudienceSize,
                    },
                    categories: formData.categories,
                    locations: formData.locations,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create campaign');
            }

            const { campaign } = await response.json();

            toast({
                title: "Campaign Created! 🎉",
                description: "Your campaign is now active. Start discovering hosts to sponsor.",
            });

            navigate(`/dashboard/brand/hosts?campaignId=${campaign.id}`);
        } catch (error: any) {
            toast({
                title: "Error creating campaign",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleArrayValue = (field: 'goals' | 'categories', value: string) => {
        const currentArray = formData[field];
        const newArray = currentArray.includes(value)
            ? currentArray.filter(v => v !== value)
            : [...currentArray, value];
        updateField(field, newArray);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="title">Campaign Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => updateField("title", e.target.value)}
                                placeholder="e.g., Summer Fitness Challenge"
                                className={errors.title ? "border-destructive" : ""}
                            />
                            {errors.title && (
                                <p className="text-destructive text-sm mt-1">{errors.title}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => updateField("description", e.target.value)}
                                placeholder="Describe your campaign goals and what you hope to achieve..."
                                rows={4}
                                className={errors.description ? "border-destructive" : ""}
                            />
                            {errors.description && (
                                <p className="text-destructive text-sm mt-1">{errors.description}</p>
                            )}
                        </div>

                        <div>
                            <Label className="mb-3 block">Campaign Goals *</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {GOALS.map((goal) => (
                                    <button
                                        key={goal.value}
                                        type="button"
                                        onClick={() => toggleArrayValue('goals', goal.value)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.goals.includes(goal.value)
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                            }`}
                                    >
                                        <p className="font-medium text-sm">{goal.label}</p>
                                    </button>
                                ))}
                            </div>
                            {errors.goals && (
                                <p className="text-destructive text-sm mt-1">{errors.goals}</p>
                            )}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="budget">Total Budget (USD) *</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="budget"
                                    type="number"
                                    min="100"
                                    step="100"
                                    value={formData.budget}
                                    onChange={(e) => updateField("budget", parseFloat(e.target.value))}
                                    className={`pl-10 ${errors.budget ? "border-destructive" : ""}`}
                                />
                            </div>
                            {errors.budget && (
                                <p className="text-destructive text-sm mt-1">{errors.budget}</p>
                            )}
                            <p className="text-muted-foreground text-sm mt-1">
                                Minimum: $100. This will be allocated to sponsor moments.
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="duration">Campaign Duration (days) *</Label>
                            <Input
                                id="duration"
                                type="number"
                                min="7"
                                max="365"
                                value={formData.duration}
                                onChange={(e) => updateField("duration", parseInt(e.target.value))}
                                className={errors.duration ? "border-destructive" : ""}
                            />
                            {errors.duration && (
                                <p className="text-destructive text-sm mt-1">{errors.duration}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="maxCostPerMoment">Max Cost Per Moment (USD)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="maxCostPerMoment"
                                    type="number"
                                    min="10"
                                    step="10"
                                    value={formData.maxCostPerMoment}
                                    onChange={(e) => updateField("maxCostPerMoment", parseFloat(e.target.value))}
                                    className="pl-10"
                                />
                            </div>
                            <p className="text-muted-foreground text-sm mt-1">
                                Maximum you're willing to pay to sponsor a single moment.
                            </p>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label className="mb-3 block">Target Categories *</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {CATEGORIES.map((category) => (
                                    <button
                                        key={category.value}
                                        type="button"
                                        onClick={() => toggleArrayValue('categories', category.value)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.categories.includes(category.value)
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                            }`}
                                    >
                                        <p className="font-medium text-sm">{category.label}</p>
                                    </button>
                                ))}
                            </div>
                            {errors.categories && (
                                <p className="text-destructive text-sm mt-1">{errors.categories}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="minAudienceSize">Minimum Audience Size</Label>
                            <Input
                                id="minAudienceSize"
                                type="number"
                                min="0"
                                value={formData.minAudienceSize}
                                onChange={(e) => updateField("minAudienceSize", parseInt(e.target.value))}
                            />
                            <p className="text-muted-foreground text-sm mt-1">
                                Only show moments with at least this many expected participants.
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="locations">Target Locations (comma-separated)</Label>
                            <Input
                                id="locations"
                                value={formData.locations.join(", ")}
                                onChange={(e) => updateField("locations", e.target.value.split(",").map(s => s.trim()))}
                                placeholder="e.g., New York, Los Angeles, Chicago"
                            />
                            <p className="text-muted-foreground text-sm mt-1">
                                Leave empty to target all locations.
                            </p>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="font-serif text-xl font-semibold mb-4">{formData.title}</h3>
                            <p className="text-muted-foreground mb-4">{formData.description}</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Budget</p>
                                    <p className="text-lg font-bold">${formData.budget.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Duration</p>
                                    <p className="text-lg font-bold">{formData.duration} days</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm font-medium">Goals:</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {formData.goals.map(goal => (
                                            <span key={goal} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                                                {GOALS.find(g => g.value === goal)?.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium">Target Categories:</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {formData.categories.map(cat => (
                                            <span key={cat} className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">
                                                {CATEGORIES.find(c => c.value === cat)?.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                            <p className="text-sm">
                                ✨ After creating your campaign, you'll be able to discover and sponsor moments that match your criteria.
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!user) {
        navigate("/auth");
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/dashboard")}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
                <h1 className="font-serif text-3xl font-bold text-foreground">
                    Create Campaign
                </h1>
                <p className="text-muted-foreground mt-2">
                    Launch a campaign to discover and sponsor moments
                </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${currentStep >= step.id
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : "border-border text-muted-foreground"
                                    }`}
                            >
                                <step.icon className="w-5 h-5" />
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`w-full h-0.5 mx-2 ${currentStep > step.id ? "bg-primary" : "bg-border"
                                        }`}
                                    style={{ width: "60px" }}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2">
                    {steps.map((step) => (
                        <span
                            key={step.id}
                            className={`text-xs ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                                }`}
                        >
                            {step.title}
                        </span>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                {currentStep < 4 ? (
                    <Button variant="hero" onClick={handleNext}>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        variant="hero"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating..." : "Create Campaign"}
                        <Check className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default CreateCampaign;
