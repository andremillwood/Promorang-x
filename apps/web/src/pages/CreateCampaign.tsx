import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateCampaign, RewardType } from "@/hooks/useCampaigns";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Building2 } from "lucide-react";

const categories = [
  { value: "social", label: "Social Gathering" },
  { value: "workshop", label: "Workshop" },
  { value: "fitness", label: "Fitness & Wellness" },
  { value: "food", label: "Food & Drink" },
  { value: "music", label: "Music & Entertainment" },
  { value: "networking", label: "Networking" },
  { value: "outdoor", label: "Outdoor Adventure" },
  { value: "arts", label: "Arts & Culture" },
];

const rewardTypes: { value: RewardType; label: string }[] = [
  { value: "discount", label: "Discount" },
  { value: "freebie", label: "Free Item" },
  { value: "points", label: "Loyalty Points" },
  { value: "voucher", label: "Voucher" },
  { value: "experience", label: "Exclusive Experience" },
  { value: "access", label: "VIP Access" },
];

const CreateCampaign = () => {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const createCampaign = useCreateCampaign();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    rewardType: "discount",
    rewardValue: "",
    targetCategories: [] as string[],
    startDate: "",
    endDate: "",
  });

  const primaryRole = roles[0] || "brand";

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      targetCategories: prev.targetCategories.includes(category)
        ? prev.targetCategories.filter((c) => c !== category)
        : [...prev.targetCategories, category],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createCampaign.mutateAsync({
      title: formData.title,
      description: formData.description,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      reward_type: formData.rewardType as RewardType,
      reward_value: formData.rewardValue,
      target_categories: formData.targetCategories.length > 0 ? formData.targetCategories : null,
      start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      end_date: formData.endDate ? new Date(formData.endDate).toISOString() : null,
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
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Create Campaign
          </h1>
          <p className="text-muted-foreground mt-2">
            Launch a reward campaign to engage moment participants
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Details */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-serif text-xl font-semibold">Campaign Details</h2>
            </div>

            <div>
              <Label htmlFor="title">Campaign Name *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Summer Launch Promotion"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your campaign goals and what participants can expect..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="e.g., 5000"
              />
            </div>
          </div>

          {/* Reward Configuration */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <h2 className="font-serif text-xl font-semibold">Reward Configuration</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rewardType">Reward Type *</Label>
                <Select
                  value={formData.rewardType}
                  onValueChange={(value) => setFormData({ ...formData, rewardType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {rewardTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rewardValue">Reward Value</Label>
                <Input
                  id="rewardValue"
                  value={formData.rewardValue}
                  onChange={(e) => setFormData({ ...formData, rewardValue: e.target.value })}
                  placeholder="e.g., 20% off, Free coffee"
                />
              </div>
            </div>
          </div>

          {/* Target Categories */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-serif text-xl font-semibold">Target Categories</h2>
            <p className="text-sm text-muted-foreground">
              Select which moment categories this campaign applies to
            </p>

            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <label
                  key={category.value}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={formData.targetCategories.includes(category.value)}
                    onCheckedChange={() => handleCategoryToggle(category.value)}
                  />
                  <span className="text-sm font-medium">{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="hero"
              className="flex-1"
              disabled={createCampaign.isPending || !formData.title}
            >
              {createCampaign.isPending ? "Creating..." : "Launch Campaign"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateCampaign;
