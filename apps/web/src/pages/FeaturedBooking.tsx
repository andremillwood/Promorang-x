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
import { API_BASE_URL } from '@/lib/api';
import { useI18n } from '@/i18n/I18nContext';
import type { TranslationKey } from '@/i18n/translations';
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

const ENTITY_TYPES: Array<{ value: string; label: TranslationKey; icon: typeof Clock }> = [
  { value: 'moment', label: 'featBook.typeMoment', icon: Clock },
  { value: 'content', label: 'featBook.typeContent', icon: Eye },
  { value: 'promoshare_pool', label: 'featBook.typePool', icon: Sparkles },
];

export default function FeaturedBooking() {
  const { t } = useI18n();
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
      const response = await fetch(`${API_BASE_URL}/featured-marketplace/placement-types`);
      if (!response.ok) {
        throw new Error(`Placement types request failed with ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setPlacementTypes(data.placement_types);
      }
    } catch (error) {
      console.error('Error fetching placement types:', error);
      toast.error(t('featBook.toastLoad'));
    }
  };
  
  const calculatePricing = async () => {
    if (!selectedPlacement) return;
    
    try {
      const placement = placementTypes.find(p => p.placement_type === selectedPlacement);
      if (!placement) return;
      
      let url = `${API_BASE_URL}/featured-marketplace/pricing/${selectedPlacement}?`;
      
      if (placement.pricing_type === 'fixed_daily') {
        url += `duration_days=${durationDays}`;
      } else if (placement.pricing_type === 'cpc') {
        url += `budget=${budget}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Pricing request failed with ${response.status}`);
      }

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
        `${API_BASE_URL}/featured-marketplace/availability/${selectedPlacement}?duration_days=${durationDays}`
      );
      if (!response.ok) {
        throw new Error(`Availability request failed with ${response.status}`);
      }

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
      toast.error(t('featBook.toastRequired'));
      return;
    }
    
    if (!availability?.available) {
      toast.error(t('featBook.toastNoSlots'));
      return;
    }
    
    setIsBooking(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/featured-marketplace/book`, {
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
      
      if (!response.ok) {
        throw new Error(`Booking request failed with ${response.status}`);
      }

      const data: BookingResponse = await response.json();
      
      if (data.success && data.payment_required) {
        toast.success(t('featBook.toastCreated'));
        
        // Create Stripe checkout session
        const checkoutResponse = await fetch(
          `${API_BASE_URL}/featured-marketplace/${data.payment_required.booking_id}/checkout`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!checkoutResponse.ok) {
          throw new Error(`Checkout request failed with ${checkoutResponse.status}`);
        }
        
        const checkoutData = await checkoutResponse.json();
        
        if (checkoutData.success && checkoutData.checkoutUrl) {
          // Redirect to Stripe
          window.location.href = checkoutData.checkoutUrl;
        } else {
          toast.error(t('featBook.toastCheckout'));
        }
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(t('featBook.toastBook'));
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
        return t('featBook.perDayLabel');
      case 'cpc':
        return t('featBook.perClickLabel');
      case 'one_time':
        return t('featBook.flatFeeLabel');
      case 'per_send':
        return t('featBook.perSendLabel');
      default:
        return '';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 sm:py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10 text-center sm:mb-12">
          <h1 className="mb-4 flex flex-col items-center justify-center gap-3 text-3xl font-bold sm:flex-row sm:text-4xl">
            <Sparkles className="w-8 h-8 text-primary" />
            {t('featBook.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('featBook.lede')}
          </p>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('featBook.bookTitle')}</CardTitle>
                <CardDescription>
                  {t('featBook.bookDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Entity Selection */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('featBook.contentType')}</Label>
                    <Select value={entityType} onValueChange={setEntityType}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('featBook.selectType')} />
                      </SelectTrigger>
                      <SelectContent>
                        {ENTITY_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              {t(type.label)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('featBook.contentId')}</Label>
                    <Input
                      placeholder={t('featBook.idPlaceholder')}
                      value={entityId}
                      onChange={(e) => setEntityId(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Placement Type Selection */}
                <div className="space-y-2">
                  <Label>{t('featBook.placementType')}</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {placementTypes.map((type) => (
                      <button
                        key={type.placement_type}
                        onClick={() => setSelectedPlacement(type.placement_type)}
                        className={`p-4 rounded-lg border text-left transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] ${
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
                              {type.pricing_type === 'fixed_daily' && t('featBook.perDayPrice', { amount: type.base_price_per_day ?? 0 })}
                              {type.pricing_type === 'cpc' && t('featBook.perClickPrice', { amount: type.cost_per_click ?? 0 })}
                              {type.pricing_type === 'one_time' && t('featBook.flatPrice', { amount: type.base_price ?? 0 })}
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
                        <div className="flex items-center justify-between gap-3">
                          <Label>{t('featBook.duration')}</Label>
                          <span className="text-sm font-medium">{t('featBook.days', { count: durationDays })}</span>
                        </div>
                        <Input
                          type="range"
                          min={1}
                          max={30}
                          value={durationDays}
                          onChange={(e) => setDurationDays(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                          <span>{t('featBook.day1')}</span>
                          <span>{t('featBook.day7')}</span>
                          <span>{t('featBook.day14')}</span>
                          <span>{t('featBook.day30')}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <Label>{t('featBook.budget')}</Label>
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
                        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                          <span>{t('featBook.minBudget')}</span>
                          <span>{t('featBook.maxBudget')}</span>
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
                <CardTitle>{t('featBook.summary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pricing ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">{t('featBook.basePrice')}</span>
                        <span>${pricing.base_price.toFixed(2)}</span>
                      </div>
                      
                      {pricing.discount_applied > 0 && (
                        <div className="flex items-center justify-between gap-3 text-green-600 dark:text-green-400">
                          <span>{t('featBook.volumeDiscount', { pct: (pricing.discount_applied * 100).toFixed(0) })}</span>
                          <span>-${pricing.discount_amount.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">{t('featBook.subtotal')}</span>
                        <span>${pricing.final_price.toFixed(2)}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">{t('featBook.platformFee')}</span>
                        <span>${pricing.platform_fee.toFixed(2)}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between gap-3 text-lg font-bold">
                        <span>{t('featBook.total')}</span>
                        <span className="text-primary">${pricing.final_price.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {availability && (
                      <div className="mt-4 p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2 text-sm">
                          {availability.available ? (
                            <>
                              <Check className="w-4 h-4 text-green-500" />
                              <span>{t(availability.slots === 1 ? 'featBook.slotOne' : 'featBook.slotMany', { count: availability.slots })}</span>
                            </>
                          ) : (
                            <>
                              <div className="w-4 h-4 rounded-full bg-red-500" />
                              <span className="text-red-500">{t('featBook.noSlots')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{t('featBook.selectPricing')}</p>
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
                      {t('featBook.processing')}
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      {t('featBook.proceed')}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Benefits */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">{t('featBook.why')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{t('featBook.viewsTitle')}</p>
                    <p className="text-xs text-muted-foreground">{t('featBook.viewsCopy')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MousePointer className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{t('featBook.engageTitle')}</p>
                    <p className="text-xs text-muted-foreground">{t('featBook.engageCopy')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{t('featBook.roiTitle')}</p>
                    <p className="text-xs text-muted-foreground">{t('featBook.roiCopy')}</p>
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
