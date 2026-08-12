import { GrouponMechanicsData } from '../types/grouponMechanics';

export interface CouponItem {
  id: string;
  title: string;
  merchantName: string;
  discountDisplay: string;
  category: string;
  expiryDate: string;
  location: string;
  distance: string;
  imageUrl: string;
  grouponMechanics: GrouponMechanicsData;
}

export const SAMPLE_TIPPING_COUPONS: CouponItem[] = [
  {
    id: 'c-groupon-01',
    title: '50% Off Gourmet Omakase Dinner Tasting',
    merchantName: 'Sakura Sushi Lounge',
    discountDisplay: '50% OFF',
    category: 'Dining',
    expiryDate: '2026-08-15',
    location: 'Downtown Arts District',
    distance: '0.8 mi',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
    grouponMechanics: {
      tippingThreshold: 20,
      currentClaims: 16,
      tippingStatus: 'pending',
      tippingDeadline: '2026-08-10T23:59:59Z',
      squadMinSize: 3,
      squadBonusDiscountPct: 15,
      merchantCommissionRate: 10.0,
      offPeakWindows: [
        { dayName: 'Tuesday', startHour: '14:00', endHour: '17:00', bonusMultiplier: 1.5 }
      ]
    }
  },
  {
    id: 'c-groupon-02',
    title: 'Full Day Spa & Sauna Wellness Pass',
    merchantName: 'Zenith Urban Spa',
    discountDisplay: '$45 (Reg. $90)',
    category: 'Wellness',
    expiryDate: '2026-08-20',
    location: 'Midtown West',
    distance: '1.4 mi',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    grouponMechanics: {
      tippingThreshold: 15,
      currentClaims: 15,
      tippingStatus: 'tipped',
      squadMinSize: 4,
      squadBonusDiscountPct: 20,
      merchantCommissionRate: 12.0
    }
  }
];
