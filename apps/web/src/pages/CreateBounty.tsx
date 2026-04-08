import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateBounty } from "@/hooks/useBounties";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Target, DollarSign, Users, Calendar } from "lucide-react";

const categories = [
    { value: "social", label: "Social" },
    { value: "food", label: "Food & Drink" },
    { value: "fitness", label: "Fitness" },
    { value: "music", label: "Music" },
    { value: "arts", label: "Arts" },
    { value: "outdoor", label: "Outdoor" },
    { value: "networking", label: "Networking" },
    { value: "workshop", label: "Workshop" },
];

const CreateBounty = () => {
    const { user, roles } = useAuth();
    const navigate = useNavigate();
    const createBounty = useCreateBounty();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        requirements: "",
        category: "social",
        location: "",
        minParticipants: "10",
        payoutAmount: "",
        expiresAt: "",
    });

    const primaryRole = roles[0] || "brand";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await createBounty.mutateAsync({
            title: formData.title,
            description: formData.description,
            requirements: formData.requirements,
            target_category: formData.category,
            target_location: formData.location || null,
            target_min_participants: parseInt(formData.minParticipants),
            payout_amount: parseFloat(formData.payoutAmount),
            expires_at: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
        });

        navigate("/dashboard");
    };

    if (!user) {
        navigate("/auth");
        return null;
    }

    return (
        <DashboardLayout currentRole={primaryRole}>
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
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Target className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="font-serif text-3xl font-bold text-gradient-primary">
                                Post a Bounty
                            </h1>
                            <p className="text-muted-foreground">
                                Request a custom moment from our community of hosts
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 pb-12">
                    {/* Core Details */}
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
                        <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
                            Bounty Scope
                        </h2>

                        <div>
                            <Label htmlFor="title">Bounty Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Rooftop Sunset Yoga Session"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Public Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Briefly describe what kind of moment you're looking for..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="requirements">Specific Requirements *</Label>
                            <Textarea
                                id="requirements"
                                value={formData.requirements}
                                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                placeholder="List specific host requirements, location preferences, or content needed..."
                                className="min-h-[120px]"
                                required
                            />
                        </div>
                    </div>

                    {/* Targets & Logistics */}
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
                        <h2 className="font-serif text-xl font-semibold">Targets & Logistics</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category">Target Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="location">Target Location</Label>
                                <div className="relative">
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g., Brooklyn, NY"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="minParticipants" className="flex items-center gap-2">
                                    <Users className="w-3 h-3" />
                                    Min Participants
                                </Label>
                                <Input
                                    id="minParticipants"
                                    type="number"
                                    min="1"
                                    value={formData.minParticipants}
                                    onChange={(e) => setFormData({ ...formData, minParticipants: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="expiresAt" className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    Bounty Expiry
                                </Label>
                                <Input
                                    id="expiresAt"
                                    type="date"
                                    value={formData.expiresAt}
                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payout */}
                    <div className="bg-gradient-warm border border-border rounded-2xl p-8 space-y-6 shadow-md text-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-serif text-2xl font-bold mb-1">Total Payout</h2>
                                <p className="text-slate-600 text-sm">Amount the host will receive upon approval</p>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
                                <DollarSign className="w-7 h-7 text-primary" />
                            </div>
                        </div>

                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold opacity-50">$</span>
                            <Input
                                id="payoutAmount"
                                type="number"
                                min="10"
                                step="5"
                                value={formData.payoutAmount}
                                onChange={(e) => setFormData({ ...formData, payoutAmount: e.target.value })}
                                placeholder="250.00"
                                className="pl-10 text-3xl h-16 bg-white/50 border-white/20 font-bold focus:bg-white"
                                required
                            />
                        </div>

                        <p className="text-xs opacity-70 italic">
                            Note: A 20% platform fee will be added to this total and held in escrow.
                        </p>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-14 text-lg"
                            onClick={() => navigate("/dashboard")}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="hero"
                            className="flex-1 h-14 text-lg shadow-xl"
                            disabled={createBounty.isPending || !formData.title || !formData.payoutAmount}
                        >
                            {createBounty.isPending ? "Posting Bounty..." : "Post Bounty Now"}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default CreateBounty;
