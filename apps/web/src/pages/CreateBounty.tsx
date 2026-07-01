import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateBounty } from "@/hooks/useBounties";
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
import { ArrowLeft, Target, DollarSign, Users, Calendar, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { cultureImages } from "@/data/culture-demo";

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
        <div className="min-h-screen bg-[#090909] pb-16 text-white">
            {/* Header */}
            <section className="relative overflow-hidden border-b border-white/10">
                <img src={cultureImages.streetArt} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/40" />
            <div className="relative mx-auto max-w-5xl px-5 pb-10 pt-20 sm:px-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/dashboard")}
                    className="mb-8 text-white/55 hover:bg-white/10 hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/35 bg-black/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400"><Target className="h-3.5 w-3.5" /> Open brief</div>
                <h1 className="max-w-3xl text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">Put a clear outcome into the market.</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/55">Tell capable hosts what should happen, what success looks like, and what the approved result is worth.</p>
                </div>
            </section>

            <form onSubmit={handleSubmit} className="mx-auto grid max-w-5xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                {/* Core Details */}
                <div className="space-y-6 rounded-lg border border-white/10 bg-[#111] p-5 sm:p-7">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">01 · Outcome</p><h2 className="mt-2 text-2xl font-black">What needs to become true?</h2></div>

                    <div>
                        <Label htmlFor="title">Bounty Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Fill an intimate rooftop wellness session"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Public Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the opportunity in language a strong host would want to act on..."
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="requirements">Specific Requirements *</Label>
                        <Textarea
                            id="requirements"
                            value={formData.requirements}
                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                            placeholder="Define the non-negotiables, expected proof, audience, and deliverables..."
                            className="min-h-[120px]"
                            required
                        />
                    </div>
                </div>

                {/* Targets & Logistics */}
                <div className="space-y-6 rounded-lg border border-white/10 bg-[#111] p-5 sm:p-7">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">02 · Fit</p><h2 className="mt-2 text-2xl font-black">Who can deliver it, and where?</h2></div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <div className="space-y-6 rounded-lg border border-orange-500/30 bg-gradient-to-br from-orange-500/15 to-transparent p-5 sm:p-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">03 · Backing</p>
                            <h2 className="mt-2 text-2xl font-black">Fund the approved outcome</h2>
                            <p className="mt-1 text-sm text-white/45">The host earns this when the agreed proof is approved.</p>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-md bg-orange-500 text-black">
                            <DollarSign className="w-7 h-7" />
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
                            className="h-16 border-white/15 bg-black/50 pl-10 text-2xl font-bold text-white sm:text-3xl"
                            required
                        />
                    </div>

                    <p className="text-xs leading-5 text-white/45">
                        A 20% platform fee is added transparently. Funds are held until the agreed proof is reviewed.
                    </p>
                </div>

                </div>
                <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
                    <div className="rounded-lg border border-white/10 bg-[#111] p-6">
                        <Sparkles className="h-6 w-6 text-orange-400" />
                        <h3 className="mt-6 text-xl font-black">A strong bounty is easy to judge.</h3>
                        <div className="mt-6 space-y-5">
                            {[["Promise", formData.title || "Name the outcome"], ["Proof", formData.requirements || "Define acceptance"], ["Unlock", formData.payoutAmount ? `$${formData.payoutAmount} on approval` : "Set funded value"]].map(([label, value], index) => <div key={label} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-orange-500/30 text-xs text-orange-400">{index + 1}</span><div><p className="text-xs font-bold uppercase tracking-wider text-white/35">{label}</p><p className="mt-1 line-clamp-2 text-sm font-semibold text-white/75">{value}</p></div></div>)}
                        </div>
                        <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-white/40"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Approval releases the funded payout.</div>
                    </div>
                {/* Submit */}
                <div className="flex flex-col gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-12 border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                        onClick={() => navigate("/dashboard")}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="h-14 bg-orange-500 text-base font-black text-black hover:bg-orange-400"
                        disabled={createBounty.isPending || !formData.title || !formData.payoutAmount}
                    >
                        {createBounty.isPending ? "Publishing brief..." : "Publish funded brief"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
                </aside>
            </form>
        </div>
    );
};

export default CreateBounty;
