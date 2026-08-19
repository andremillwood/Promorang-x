export type TippingStatus = 'pending' | 'tipped' | 'expired' | 'sold_out';

export interface OffPeakWindow {
  dayName: string; // 'Tuesday', 'Wednesday'
  startHour: string; // '14:00'
  endHour: string; // '17:00'
  bonusMultiplier: number; // e.g. 1.5x
}

export interface GrouponMechanicsData {
  tippingThreshold: number;
  currentClaims: number;
  tippingStatus: TippingStatus;
  tippingDeadline?: string;
  squadMinSize?: number;
  squadBonusDiscountPct?: number;
  merchantCommissionRate: number; // e.g., 10 (for 10%)
  offPeakWindows?: OffPeakWindow[];
}

export interface DealSquad {
  id: string;
  couponId: string;
  leaderUserId: string;
  leaderName: string;
  squadCode: string;
  minRequired: number;
  currentMembersCount: number;
  status: 'active' | 'completed' | 'expired';
  expiresAt: string;
  members: { userId: string; avatarUrl?: string; name: string }[];
}
