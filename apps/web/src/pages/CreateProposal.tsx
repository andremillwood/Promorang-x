import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, ArrowRight, Save, Upload } from "lucide-react";

export default function CreateProposal() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "community", // Default to community
        location: "",
        expectedParticipants: "",
        fundingRequest: "",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDraft = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase.from("proposals").insert({
                planner_id: user.id,
                title: formData.title || "Untitled Draft",
                description: formData.description,
                budget: formData.fundingRequest ? parseFloat(formData.fundingRequest) : null,
                status: "draft",
                metadata: {
                    type: formData.type,
                    location: formData.location,
                    expectedParticipants: formData.expectedParticipants
                }
            });

            if (error) throw error;
            toast.success("Draft saved successfully");
            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save draft");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase.from("proposals").insert({
                planner_id: user.id,
                title: formData.title,
                description: formData.description,
                budget: formData.fundingRequest ? parseFloat(formData.fundingRequest) : null,
                status: "sent",
                metadata: {
                    type: formData.type,
                    location: formData.location,
                    expectedParticipants: formData.expectedParticipants
                }
            });

            if (error) throw error;

            toast.success("Proposal submitted for review!");
            navigate("/dashboard?tab=proposals");
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit proposal");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-4">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h1 className="font-serif text-3xl md:text-4xl font-bold">Propose a Moment</h1>
                    <p className="text-muted-foreground text-lg">
                        Have an idea? Describe it, set the budget, and get funded by brands.
                    </p>
                </div>

                <Card className="border-border/50 shadow-soft">
                    <CardHeader>
                        <CardTitle>Moment Details</CardTitle>
                        <CardDescription>What kind of experience are you creating?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                placeholder="e.g. Sunset Yoga & Matcha"
                                value={formData.title}
                                onChange={(e) => handleInputChange("title", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Moment Type</label>
                            <Select
                                value={formData.type}
                                onValueChange={(val) => handleInputChange("type", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="community">Community Gathering</SelectItem>
                                    <SelectItem value="activation">Brand Activation</SelectItem>
                                    <SelectItem value="digital">Digital / Remote</SelectItem>
                                    <SelectItem value="bounty">Bounty Fulfillment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                placeholder="Describe the vibe, the activities, and why people should come..."
                                className="min-h-[120px]"
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Proposed Location</label>
                            <Input
                                placeholder="e.g. Central Park, Great Lawn"
                                value={formData.location}
                                onChange={(e) => handleInputChange("location", e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleDraft}
                                disabled={loading}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Draft
                            </Button>
                            <Button
                                className="flex-1"
                                variant="hero"
                                onClick={handleSubmit}
                                disabled={loading || !formData.title || !formData.description}
                            >
                                Submit Proposal
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
