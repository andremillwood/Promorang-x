import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Image,
  FileText,
  Gift,
  Ticket,
  Users,
  Calendar,
  Sparkles,
  CheckCircle,
  Upload,
  Link as LinkIcon,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';

interface ContentItem {
  id: string;
  type: 'image' | 'video' | 'link' | 'text';
  title: string;
  url?: string;
  description?: string;
}

interface DropItem {
  id: string;
  title: string;
  description: string;
  type: 'share' | 'create' | 'engage' | 'review';
  gemReward: number;
  keysCost: number;
  maxParticipants: number;
  requirements?: string;
}

interface CouponItem {
  id: string;
  title: string;
  description: string;
  discountType: 'percent' | 'fixed' | 'freebie';
  discountValue: number;
  quantity: number;
  expiresAt?: Date;
}

export default function NewCampaign() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Campaign basics
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Content to promote
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);

  // Drops (creator tasks)
  const [drops, setDrops] = useState<DropItem[]>([]);

  // Coupons/Incentives
  const [coupons, setCoupons] = useState<CouponItem[]>([]);

  // Budget allocation
  const [totalBudgetGems, setTotalBudgetGems] = useState(500);
  const [promoShareContribution, setPromoShareContribution] = useState(100);

  // Content management
  const addContentItem = () => {
    setContentItems([...contentItems, {
      id: `content-${Date.now()}`,
      type: 'link',
      title: '',
      url: '',
      description: ''
    }]);
  };

  const updateContentItem = (id: string, updates: Partial<ContentItem>) => {
    setContentItems(contentItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeContentItem = (id: string) => {
    setContentItems(contentItems.filter(item => item.id !== id));
  };

  // Drop management
  const addDrop = () => {
    setDrops([...drops, {
      id: `drop-${Date.now()}`,
      title: '',
      description: '',
      type: 'share',
      gemReward: 10,
      keysCost: 1,
      maxParticipants: 100,
      requirements: ''
    }]);
  };

  const updateDrop = (id: string, updates: Partial<DropItem>) => {
    setDrops(drops.map(drop =>
      drop.id === id ? { ...drop, ...updates } : drop
    ));
  };

  const removeDrop = (id: string) => {
    setDrops(drops.filter(drop => drop.id !== id));
  };

  // Coupon management
  const addCoupon = () => {
    setCoupons([...coupons, {
      id: `coupon-${Date.now()}`,
      title: '',
      description: '',
      discountType: 'percent',
      discountValue: 10,
      quantity: 100
    }]);
  };

  const updateCoupon = (id: string, updates: Partial<CouponItem>) => {
    setCoupons(coupons.map(coupon =>
      coupon.id === id ? { ...coupon, ...updates } : coupon
    ));
  };

  const removeCoupon = (id: string) => {
    setCoupons(coupons.filter(coupon => coupon.id !== id));
  };

  // Calculate total rewards
  const totalDropRewards = drops.reduce((sum, drop) => sum + (drop.gemReward * drop.maxParticipants), 0);
  const totalBudgetNeeded = totalDropRewards + promoShareContribution;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaignName.trim()) {
      alert('Please enter a campaign name');
      return;
    }

    if (drops.length === 0) {
      alert('Please add at least one drop to your campaign');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/advertisers/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          name: campaignName,
          description: campaignDescription,
          start_date: startDate.toISOString(),
          end_date: endDate?.toISOString(),
          content_items: contentItems,
          drops: drops,
          coupons: coupons,
          budget_gems: totalBudgetGems,
          promoshare_contribution: promoShareContribution
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create campaign');
      }

      const result = await response.json();
      navigate(`/advertiser/campaigns/${result.data?.id || ''}`);

    } catch (error: any) {
      console.error('Failed to create campaign:', error);
      alert(`Failed to create campaign: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dropTypes = [
    { value: 'share', label: 'Share Content', description: 'Share to social media' },
    { value: 'create', label: 'Create Content', description: 'Create original content' },
    { value: 'engage', label: 'Engage', description: 'Like, comment, save' },
    { value: 'review', label: 'Review', description: 'Write a review' },
  ];

  const steps = [
    { number: 1, title: 'Basics', icon: FileText },
    { number: 2, title: 'Content', icon: Image },
    { number: 3, title: 'Drops', icon: Sparkles },
    { number: 4, title: 'Incentives', icon: Gift },
    { number: 5, title: 'Review', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-pr-text-1">Create Campaign</h2>
          <p className="text-sm text-pr-text-2">
            Bundle content, drops, and incentives into a promotional campaign
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between bg-pr-surface-card rounded-xl p-4 border border-pr-surface-3">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <button
              type="button"
              onClick={() => setCurrentStep(step.number)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                currentStep === step.number
                  ? "bg-purple-100 text-purple-700"
                  : currentStep > step.number
                    ? "text-green-600"
                    : "text-pr-text-2 hover:bg-pr-surface-2"
              )}
            >
              <step.icon className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
            </button>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-8 h-0.5 mx-2",
                currentStep > step.number ? "bg-green-400" : "bg-pr-surface-3"
              )} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basics */}
        {currentStep === 1 && (
          <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-pr-text-1">Campaign Basics</h3>
              <p className="text-sm text-pr-text-2">Name your campaign and set the timeline</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">Campaign Name *</label>
                <Input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., Summer Fashion Launch"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-pr-text-1 mb-2">Description</label>
                <Textarea
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                  placeholder="What is this campaign about? What do you want creators to do?"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-pr-text-1 mb-2">Start Date</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => date && setStartDate(date)}
                    minDate={new Date()}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-pr-text-1 mb-2">End Date (Optional)</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    minDate={startDate}
                    className="w-full"
                    isClearable
                    placeholderText="No end date"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Content */}
        {currentStep === 2 && (
          <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-pr-text-1">Content to Promote</h3>
                <p className="text-sm text-pr-text-2">Add the content you want creators to share and engage with</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addContentItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Content
              </Button>
            </div>

            {contentItems.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-pr-surface-3 rounded-xl">
                <Image className="w-12 h-12 mx-auto text-pr-text-2 mb-4" />
                <p className="text-pr-text-2 mb-4">No content added yet</p>
                <Button type="button" variant="outline" onClick={addContentItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Content
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {contentItems.map((item, index) => (
                  <div key={item.id} className="p-4 bg-pr-surface-2 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-pr-text-1">Content #{index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContentItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        value={item.type}
                        onValueChange={(value) => updateContentItem(item.id, { type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="link">Link/URL</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="text">Text Post</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        value={item.title}
                        onChange={(e) => updateContentItem(item.id, { title: e.target.value })}
                        placeholder="Content title"
                      />
                    </div>

                    <Input
                      value={item.url || ''}
                      onChange={(e) => updateContentItem(item.id, { url: e.target.value })}
                      placeholder="URL (Instagram post, TikTok, website, etc.)"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Drops */}
        {currentStep === 3 && (
          <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-pr-text-1">Drops (Creator Tasks)</h3>
                <p className="text-sm text-pr-text-2">Define tasks for creators to complete and earn rewards</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addDrop}>
                <Plus className="w-4 h-4 mr-2" />
                Add Drop
              </Button>
            </div>

            {drops.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-pr-surface-3 rounded-xl">
                <Sparkles className="w-12 h-12 mx-auto text-pr-text-2 mb-4" />
                <p className="text-pr-text-2 mb-4">No drops added yet</p>
                <Button type="button" variant="outline" onClick={addDrop}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Drop
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {drops.map((drop, index) => (
                  <div key={drop.id} className="p-4 bg-pr-surface-2 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-pr-text-1">Drop #{index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDrop(drop.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={drop.title}
                        onChange={(e) => updateDrop(drop.id, { title: e.target.value })}
                        placeholder="Drop title"
                      />

                      <Select
                        value={drop.type}
                        onValueChange={(value) => updateDrop(drop.id, { type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Task type" />
                        </SelectTrigger>
                        <SelectContent>
                          {dropTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Textarea
                      value={drop.description}
                      onChange={(e) => updateDrop(drop.id, { description: e.target.value })}
                      placeholder="Describe what creators need to do..."
                      rows={2}
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-pr-text-2 mb-1">Gem Reward</label>
                        <Input
                          type="number"
                          value={drop.gemReward}
                          onChange={(e) => updateDrop(drop.id, { gemReward: Number(e.target.value) })}
                          min={1}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-pr-text-2 mb-1">Keys Cost</label>
                        <Input
                          type="number"
                          value={drop.keysCost}
                          onChange={(e) => updateDrop(drop.id, { keysCost: Number(e.target.value) })}
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-pr-text-2 mb-1">Max Participants</label>
                        <Input
                          type="number"
                          value={drop.maxParticipants}
                          onChange={(e) => updateDrop(drop.id, { maxParticipants: Number(e.target.value) })}
                          min={1}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Incentives */}
        {currentStep === 4 && (
          <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-pr-text-1">Coupons & Incentives</h3>
                <p className="text-sm text-pr-text-2">Add coupons or special offers for participants (optional)</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addCoupon}>
                <Plus className="w-4 h-4 mr-2" />
                Add Coupon
              </Button>
            </div>

            {coupons.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-pr-surface-3 rounded-xl">
                <Gift className="w-12 h-12 mx-auto text-pr-text-2 mb-4" />
                <p className="text-pr-text-2 mb-2">No coupons added</p>
                <p className="text-xs text-pr-text-2 mb-4">Coupons are optional but can boost participation</p>
                <Button type="button" variant="outline" onClick={addCoupon}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add a Coupon
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {coupons.map((coupon, index) => (
                  <div key={coupon.id} className="p-4 bg-pr-surface-2 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-pr-text-1">Coupon #{index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCoupon(coupon.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={coupon.title}
                        onChange={(e) => updateCoupon(coupon.id, { title: e.target.value })}
                        placeholder="Coupon title (e.g., 20% Off)"
                      />

                      <Select
                        value={coupon.discountType}
                        onValueChange={(value) => updateCoupon(coupon.id, { discountType: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Discount type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">Percentage Off</SelectItem>
                          <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                          <SelectItem value="freebie">Free Item</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-pr-text-2 mb-1">
                          {coupon.discountType === 'percent' ? 'Discount %' : coupon.discountType === 'fixed' ? 'Amount ($)' : 'Value ($)'}
                        </label>
                        <Input
                          type="number"
                          value={coupon.discountValue}
                          onChange={(e) => updateCoupon(coupon.id, { discountValue: Number(e.target.value) })}
                          min={1}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-pr-text-2 mb-1">Quantity Available</label>
                        <Input
                          type="number"
                          value={coupon.quantity}
                          onChange={(e) => updateCoupon(coupon.id, { quantity: Number(e.target.value) })}
                          min={1}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PromoShare Contribution */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <Ticket className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-purple-900">PromoShare Contribution</h4>
              </div>
              <p className="text-sm text-purple-700 mb-3">
                Contribute gems to the PromoShare jackpot. Participants earn lottery tickets for completing your drops!
              </p>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={promoShareContribution}
                  onChange={(e) => setPromoShareContribution(Number(e.target.value))}
                  min={0}
                  className="w-32"
                />
                <span className="text-sm text-purple-600">💎 gems to jackpot</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3">
              <h3 className="text-lg font-semibold text-pr-text-1 mb-4">Campaign Summary</h3>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-pr-surface-3">
                  <span className="text-pr-text-2">Campaign Name</span>
                  <span className="font-medium text-pr-text-1">{campaignName || 'Not set'}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-pr-surface-3">
                  <span className="text-pr-text-2">Duration</span>
                  <span className="font-medium text-pr-text-1">
                    {startDate.toLocaleDateString()} - {endDate ? endDate.toLocaleDateString() : 'Ongoing'}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-pr-surface-3">
                  <span className="text-pr-text-2">Content Items</span>
                  <span className="font-medium text-pr-text-1">{contentItems.length}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-pr-surface-3">
                  <span className="text-pr-text-2">Drops</span>
                  <span className="font-medium text-pr-text-1">{drops.length}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-pr-surface-3">
                  <span className="text-pr-text-2">Coupons</span>
                  <span className="font-medium text-pr-text-1">{coupons.length}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-pr-surface-3">
                  <span className="text-pr-text-2">PromoShare Contribution</span>
                  <span className="font-medium text-pr-text-1">{promoShareContribution} 💎</span>
                </div>
              </div>
            </div>

            {/* Budget Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-4">Budget Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Drop Rewards ({drops.length} drops)</span>
                  <span className="font-medium">{totalDropRewards} 💎</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">PromoShare Contribution</span>
                  <span className="font-medium">{promoShareContribution} 💎</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-200">
                  <span className="text-blue-900">Total Budget Needed</span>
                  <span className="text-purple-600">{totalBudgetNeeded} 💎</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate(-1)}
          >
            {currentStep > 1 ? 'Previous' : 'Cancel'}
          </Button>

          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next Step
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting || !campaignName || drops.length === 0}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isSubmitting ? 'Creating...' : `Create Campaign (${totalBudgetNeeded} 💎)`}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
