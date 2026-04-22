/**
 * FEATURED BOOKING INTERFACE
 * 
 * Allows sponsors to browse and book featured placements for:
 * - Their content pieces
 * - Their Moments
 * - Their PromoShare pools
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Clock, 
  DollarSign, 
  Eye, 
  MousePointer,
  Check,
  ArrowRight,
  Loader2,
  Crown,
  TrendingUp,
  Megaphone
} from 'lucide-react';

interface PlacementType {
  placement_type: string;
  name: string;
  description: string;
  pricing_type: string;
  base_price_per_day?: number;
  base_price?: number;
  cost_per_click?: number;
  min_duration_days?: number;
  max_duration_days?: number;
  available_slots?: number;
}

interface PricingResponse {
  placement_type: string;
  name: string;
  pricing_type: string;
  base_price: number;
  discount_applied: number;
  discount_amount: number;
  final_price: number;
  platform_fee: number;
  merchant_revenue: number;
  duration_days?: number;
}

interface BookingResponse {
  success: boolean;
  booking?: {
    id: string;
    status: string;
  };
  pricing?: PricingResponse;
  payment_required?: {
    amount: number;
    booking_id: string;
  };
  error?: string;
}

const ENTITY_TYPES = [
  { value: 'moment', label: 'Moment', icon: Clock },
  { value: 'content', label: 'Content Piece', icon: Eye },
  { value: 'promoshare_pool', label: 'PromoShare Pool', icon: Sparkles },
];

export default function FeaturedBooking() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Pre-fill from URL params
  const initialEntityType = searchParams.get('entity_type') || '';
  const initialEntityId = searchParams.get('entity_id') || '';
  
  const [placementTypes, setPlacementTypes] = useState<PlacementType[]>([]);
  const [selectedPlacement, setSelectedPlacement] = useState('');
  const [entityType, setEntityType] = useState(initialEntityType);
  const [entityId, setEntityId] = useState(initialEntityId);
  const [durationDays, setDurationDays] = useState(7);
  const [budget, setBudget] = useState(50);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [availability, setAvailability] = useState<{ available: boolean; slots: number } | null>(null);
  
  // Load placement types on mount
  useEffect(() => {
    fetchPlacementTypes();
  }, []);
  
  // Calculate pricing when selection changes
  useEffect(() => {
    if (selectedPlacement) {
      calculatePricing();
      checkAvailability();
    }
  }, [selectedPlacement, durationDays, budget]);
  
  const fetchPlacementTypes = async () => {
    try {
      const response = await fetch('/api/featured-marketplace/placement-types');
      const data = await response.json();
      
      if (data.success) {
        setPlacementTypes(data.placement_types);
      }
    } catch (error) {
      console.error('Error fetching placement types:', error);
      toast.error('Failed to load placement options');
    }
  };
  
  const calculatePricing = async () => {
    if (!selectedPlacement) return;
    
    try {
      const placement = placementTypes.find(p => p.placement_type === selectedPlacement);
      if (!placement) return;
      
      let url = `/api/featured-marketplace/pricing/${selectedPlacement}?`;
      
      if (placement.pricing_type === 'fixed_daily') {
        url += `duration_days=${durationDays}`;
      } else if (placement.pricing_type === 'cpc') {
        url += `budget=${budget}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setPricing(data.pricing);
      }
    } catch (error) {
      console.error('Error calculating pricing:', error);
    }
  };
  
  const checkAvailability = async () => {
    if (!selectedPlacement) return;
    
    try {
      const response = await fetch(
        `/api/featured-marketplace/availability/${selectedPlacement}?duration_days=${durationDays}`
      );
      const data = await response.json();
      
      if (data.success) {
        setAvailability(data.availability);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };
  
  const handleBooking = async () => {
    if (!selectedPlacement || !entityType || !entityId) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!availability?.available) {
      toast.error('No slots available for this placement type');
      return;
    }
    
    setIsBooking(true);
    
    try {
      const response = await fetch('/api/featured-marketplace/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          placement_type: selectedPlacement,
          entity_type: entityType,
          entity_id: entityId,
          duration_days: durationDays,
          start_date: new Date().toISOString(),
          budget: budget
        })
      });
      
      const data: BookingResponse = await response.json();
      
      if (data.success && data.payment_required) {
        toast.success('Booking created! Redirecting to payment...');
        
        // Create Stripe checkout session
        const checkoutResponse = await fetch(
          `/api/featured-marketplace/${data.payment_required.booking_id}/checkout`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        const checkoutData = await checkoutResponse.json();
        
        if (checkoutData.success && checkoutData.checkoutUrl) {
          // Redirect to Stripe
          window.location.href = checkoutData.checkoutUrl;
        } else {
          toast.error('Failed to create payment session');
        }
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };
  
  const getPlacementIcon = (type: string) => {
    switch (type) {
      case 'homepage_hero':
      case 'promoshare_homepage_banner':
        return <Crown className="w-5 h-5" />;
      case 'homepage_featured':
        return <TrendingUp className="w-5 h-5" />;
      case 'moment_featured':
      case 'moment_category_boost':
        return <Clock className="w-5 h-5" />;
      case 'promoshare_push_notification':
        return <Megaphone className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };
  
  const getPricingTypeLabel = (type: string) => {
    switch (type) {
      case 'fixed_daily':
        return 'per day';
      case 'cpc':
        return 'per click';
      case 'one_time':
        return 'flat fee';
      case 'per_send':
        return 'per send';
      default:
        return '';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Featured Placements
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Boost your visibility with premium placements across the platform. 
            Get your Moments, Content, and PromoShare pools in front of more users.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Your Placement</CardTitle>
                <CardDescription>
                  Select your content and placement type to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Entity Selection */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Content Type</Label>
                    <Select value={entityType} onValueChange={setEntityType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ENTITY_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Content ID</Label>
                    <Input
                      placeholder="Enter content/moment/pool ID"
                      value={entityId}
                      onChange={(e) => setEntityId(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Placement Type Selection */}
                <div className="space-y-2">
                  <Label>Placement Type</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {placementTypes.map((type) => (
                      <button
                        key={type.placement_type}
                        onClick={() => setSelectedPlacement(type.placement_type)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          selectedPlacement === type.placement_type
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-md ${
                            selectedPlacement === type.placement_type
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            {getPlacementIcon(type.placement_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{type.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {type.pricing_type === 'fixed_daily' && `$${type.base_price_per_day}/day`}
                              {type.pricing_type === 'cpc' && `$${type.cost_per_click}/click`}
                              {type.pricing_type === 'one_time' && `$${type.base_price} flat`}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Duration/Budget Selection */}
                {selectedPlacement && (
                  <div className="space-y-4">
                    <Separator />
                    
                    {placementTypes.find(p => p.placement_type === selectedPlacement)?.pricing_type === 'fixed_daily' ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Duration (Days)</Label>
                          <span className="text-sm font-medium">{durationDays} days</span>
                        </div>
                        <Input
                          type="range"
                          min={1}
                          max={30}
                          value={durationDays}
                          onChange={(e) => setDurationDays(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1 day</span>
                          <span>7 days (10% off)</span>
                          <span>14 days (15% off)</span>
                          <span>30 days (25% off)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Budget</Label>
                          <span className="text-sm font-medium">${budget}</span>
                        </div>
                        <Input
                          type="range"
                          min={25}
                          max={500}
                          step={25}
                          value={budget}
                          onChange={(e) => setBudget(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>$25 min</span>
                          <span>$500 max</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Pricing Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pricing ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Base Price</span>
                        <span>${pricing.base_price.toFixed(2)}</span>
                      </div>
                      
                      {pricing.discount_applied > 0 && (
                        <div className="flex justify-between items-center text-green-600">
                          <span>Volume Discount ({(pricing.discount_applied * 100).toFixed(0)}%)</span>
                          <span>-${pricing.discount_amount.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${pricing.final_price.toFixed(2)}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Platform Fee (15%)</span>
                        <span>${pricing.platform_fee.toFixed(2)}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">${pricing.final_price.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {availability && (
                      <div className="mt-4 p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2 text-sm">
                          {availability.available ? (
                            <>
                              <Check className="w-4 h-4 text-green-500" />
                              <span>{availability.slots} slot(s) available</span>
                            </>
                          ) : (
                            <>
                              <div className="w-4 h-4 rounded-full bg-red-500" />
                              <span className="text-red-500">No slots available</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Select a placement type to see pricing</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBooking}
                  disabled={!pricing || !availability?.available || isBooking || !entityType || !entityId}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Benefits */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Why Featured?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">3x More Views</p>
                    <p className="text-xs text-muted-foreground">Featured content gets premium visibility</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MousePointer className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Higher Engagement</p>
                    <p className="text-xs text-muted-foreground">Users engage more with promoted content</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Better ROI</p>
                    <p className="text-xs text-muted-foreground">More participation = better results</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
