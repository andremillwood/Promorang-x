import React, { useState } from 'react';
import { 
  Store, 
  Sparkles, 
  Gift, 
  Users, 
  Calendar, 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  Zap,
  Tag,
  Plus
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePerks } from '@/hooks/usePerks';
import { Perk, PerkType, PerkObjective, PerkAudience } from '@/types/perk';
import { toast } from 'sonner';

interface PostPerkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (perk: Perk) => void;
}

export const PostPerkModal: React.FC<PostPerkModalProps> = ({
  open,
  onOpenChange,
  onCreated,
}) => {
  const { createPerk, isCreating } = usePerks();
  const [step, setStep] = useState(1);

  // 5 Simple Business Questions State
  const [title, setTitle] = useState('');
  const [perkType, setPerkType] = useState<PerkType>('discount');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [description, setDescription] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [merchantLocation, setMerchantLocation] = useState('Kingston, Jamaica');
  const [targetAudience, setTargetAudience] = useState<PerkAudience>('everyone');
  const [validityDays, setValidityDays] = useState<number>(30);
  const [availableQuantity, setAvailableQuantity] = useState<number>(50);
  const [objective, setObjective] = useState<PerkObjective>('bring_new_customers');

  const handleReset = () => {
    setStep(1);
    setTitle('');
    setDescription('');
    setDiscountValue(20);
    setAvailableQuantity(50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter what you are offering.');
      return;
    }

    const newPerk: Perk = {
      id: `perk-merchant-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || `Special offer from ${merchantName || 'Verified Merchant'}.`,
      perkType,
      discountType: perkType === 'discount' ? 'percentage' : 'free_item',
      discountValue: perkType === 'discount' ? discountValue : undefined,
      merchantName: merchantName.trim() || 'My Business',
      merchantLocation: merchantLocation.trim(),
      availableQuantity,
      remainingQuantity: availableQuantity,
      startsAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + validityDays * 86400000).toISOString(),
      rewardPoints: 50,
      rewardGems: 1,
      promoShareTickets: 2,
      sourceType: 'coupon',
      objective,
      targetAudience,
      redemptionMethod: 'qr_scan',
      redemptionCode: `PRK-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      terms: `Valid for ${validityDays} days from posting. One claim per customer.`,
      category: 'Food & Drinks',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    };

    createPerk(newPerk);
    if (onCreated) onCreated(newPerk);
    onOpenChange(false);
    handleReset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-zinc-950 border-zinc-800 text-white p-6 sm:p-8 rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Store className="w-4 h-4" />
            <span>Businesses → Offer</span>
          </div>
          <DialogTitle className="text-2xl font-black text-white">
            Give People a Reason to Choose You
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Post an irresistible Perk. Promorang turns it into discoverable demand signals, social sharing, and verified foot traffic.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Question 1: What are you offering? */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-emerald-400">
              1. What are you offering?
            </label>
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'discount' as PerkType, label: 'Percentage Off', icon: Tag },
                { type: 'complimentary_item' as PerkType, label: 'Free Item', icon: Gift },
                { type: 'experience' as PerkType, label: 'VIP Pass / Exp', icon: Sparkles },
              ].map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setPerkType(item.type)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    perkType === item.type
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                      : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div>
              <Input
                placeholder="e.g. 20% Off Legendary Jerk Wings Basket"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Business Name (e.g. Sweetwood)"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white rounded-xl text-xs"
              />
              <Input
                placeholder="Location (e.g. Kingston)"
                value={merchantLocation}
                onChange={(e) => setMerchantLocation(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white rounded-xl text-xs"
              />
            </div>

            {perkType === 'discount' && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">Discount Amount:</span>
                <div className="flex items-center gap-1">
                  {[10, 15, 20, 25, 50].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setDiscountValue(val)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold ${
                        discountValue === val
                          ? 'bg-emerald-500 text-black'
                          : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Question 2: Who is it for? */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <label className="block text-xs font-black uppercase tracking-wider text-emerald-400">
              2. Who is it for?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'everyone' as PerkAudience, label: 'Everyone' },
                { id: 'new_customers' as PerkAudience, label: 'First-timers' },
                { id: 'repeat_regulars' as PerkAudience, label: 'Regulars' },
                { id: 'vip_members' as PerkAudience, label: 'VIP Pass' },
              ].map((aud) => (
                <button
                  type="button"
                  key={aud.id}
                  onClick={() => setTargetAudience(aud.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    targetAudience === aud.id
                      ? 'border-emerald-500 bg-emerald-500/20 text-white'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {aud.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: When can they use it & Quantity */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-emerald-400">
                3. Valid Window
              </label>
              <select
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value={7}>Next 7 Days (Urgent Drop)</option>
                <option value={14}>Next 14 Days</option>
                <option value={30}>Next 30 Days (Standard)</option>
                <option value={60}>Next 60 Days</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-emerald-400">
                4. Total Drop Cap
              </label>
              <select
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value={25}>25 Claims (Exclusive)</option>
                <option value={50}>50 Claims (Popular)</option>
                <option value={100}>100 Claims (High Volume)</option>
                <option value={250}>250 Claims</option>
              </select>
            </div>
          </div>

          {/* Question 5: What do you want this Perk to accomplish? */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <label className="block text-xs font-black uppercase tracking-wider text-emerald-400">
              5. Primary Business Objective
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'bring_new_customers' as PerkObjective, label: 'Bring New Buyers' },
                { id: 'fill_slow_hours' as PerkObjective, label: 'Fill Slow Hours' },
                { id: 'launch_item' as PerkObjective, label: 'Launch New Item' },
                { id: 'generate_referrals' as PerkObjective, label: 'Drive Referrals' },
                { id: 'reward_loyal' as PerkObjective, label: 'Reward Regulars' },
                { id: 'drive_attendance' as PerkObjective, label: 'Drive Foot Traffic' },
              ].map((obj) => (
                <button
                  type="button"
                  key={obj.id}
                  onClick={() => setObjective(obj.id)}
                  className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold text-left transition-all ${
                    objective === obj.id
                      ? 'border-emerald-500 bg-emerald-500/20 text-white font-bold'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {obj.label}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-configured underlying infrastructure guarantee */}
          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-emerald-500/20 text-[11px] text-zinc-300 space-y-1">
            <p className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero Upfront Cost · Pay-For-Performance</span>
            </p>
            <p className="text-zinc-400">
              Promorang distributes your Perk to active participants and creators. You only fulfill value when customers show up.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-black font-black py-3 rounded-xl shadow-lg shadow-emerald-500/20"
            >
              Post Perk Now →
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
