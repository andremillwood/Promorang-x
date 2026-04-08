import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calculator, Info } from 'lucide-react';

const SKU_TYPES = [
    { value: 'A1', label: 'Community Moment', range: '$0-$150' },
    { value: 'A2', label: 'Activation Moment', range: '$250-$750' },
    { value: 'A3', label: 'Bounty Moment', range: '$500-$2,500' },
    { value: 'A4', label: 'Merchant Moment', range: '$300-$1,000/mo' },
    { value: 'A5', label: 'Digital Moment', range: '$150-$500' },
];

interface PricingBreakdown {
    sku_type: string;
    brand_cost: number;
    reward_pool: number;
    platform_fee: number;
    ops_buffer: number;
    total: number;
    gross_margin_percent: number;
}

export function MomentPricingCalculator() {
    const [skuType, setSkuType] = useState('A2');
    const [participants, setParticipants] = useState(50);
    const [rewardPerParticipant, setRewardPerParticipant] = useState(5);
    const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        calculatePricing();
    }, [skuType, participants, rewardPerParticipant]);

    const calculatePricing = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/moments/pricing/calculator?sku_type=${skuType}&participants=${participants}&reward_per_participant=${rewardPerParticipant}`
            );
            const data = await response.json();
            if (data.success) {
                setPricing(data.pricing);
            }
        } catch (error) {
            console.error('Error calculating pricing:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
                <Calculator className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Moment Pricing Calculator</h3>
            </div>

            <div className="space-y-4 mb-6">
                {/* SKU Type */}
                <div>
                    <Label htmlFor="sku-type">Moment Type</Label>
                    <Select value={skuType} onValueChange={setSkuType}>
                        <SelectTrigger id="sku-type">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SKU_TYPES.map((sku) => (
                                <SelectItem key={sku.value} value={sku.value}>
                                    {sku.label} ({sku.range})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Participants */}
                <div>
                    <Label htmlFor="participants">Expected Participants</Label>
                    <Input
                        id="participants"
                        type="number"
                        min="1"
                        max="1000"
                        value={participants}
                        onChange={(e) => setParticipants(parseInt(e.target.value) || 0)}
                    />
                </div>

                {/* Reward Per Participant */}
                <div>
                    <Label htmlFor="reward">Reward Per Participant (USD)</Label>
                    <Input
                        id="reward"
                        type="number"
                        min="0"
                        step="0.5"
                        value={rewardPerParticipant}
                        onChange={(e) => setRewardPerParticipant(parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Set to 0 for no participant rewards
                    </p>
                </div>
            </div>

            {/* Pricing Breakdown */}
            {pricing && (
                <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4">Your Investment</h4>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Reward Pool</span>
                            <span className="font-mono">${pricing.reward_pool.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Platform Fee</span>
                            <span className="font-mono">${pricing.platform_fee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Ops Buffer</span>
                            <span className="font-mono">${pricing.ops_buffer.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between font-semibold">
                            <span>Total Brand Cost</span>
                            <span className="font-mono text-lg text-primary">
                                ${pricing.brand_cost.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                        <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-muted-foreground">
                            <p className="font-medium text-foreground mb-1">Escrow Protection</p>
                            <p>
                                Reward pool funds are locked in escrow and distributed to verified participants.
                                Unused funds are automatically refunded when the Moment closes.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="text-center text-sm text-muted-foreground py-4">
                    Calculating...
                </div>
            )}
        </Card>
    );
}
