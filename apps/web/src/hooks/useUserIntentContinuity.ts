import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserIntentCategory = 'earn' | 'host' | 'promote' | 'sell' | 'grow' | 'all';

export interface UserGoalOption {
  id: string;
  category: UserIntentCategory;
  title: string;
  description: string;
  timeEst: string;
  badge?: string;
  iconName: string;
  href: string;
  roleContext: string[];
}

export interface ActiveDraftItem {
  id: string;
  type: 'moment' | 'campaign' | 'offer' | 'content' | 'profile';
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  resumeHref: string;
  lastUpdated: string;
  payload?: Record<string, any>;
}

const LOCAL_STORAGE_INTENT_KEY = 'promorang_last_intent_state';
const LOCAL_STORAGE_DRAFT_PREFIX = 'promorang_draft_';
let isDbIntentTableAvailable = true;

export const SYSTEM_GOALS: UserGoalOption[] = [
  {
    id: 'explore_perks',
    category: 'earn',
    title: 'Discover Perks & Flash Drops',
    description: 'Find local VIP perks, free drinks, and claim limited-time bounty codes.',
    timeEst: '~30s',
    badge: 'Popular',
    iconName: 'Ticket',
    href: '/discover',
    roleContext: ['participant', 'explorer']
  },
  {
    id: 'claim_daily_rewards',
    category: 'earn',
    title: 'Claim Daily Pioneer Rewards',
    description: 'Check in on the map and roll your daily rewards multiplier.',
    timeEst: '~15s',
    badge: 'Daily',
    iconName: 'Sparkles',
    href: '/pioneers',
    roleContext: ['participant', 'creator', 'explorer']
  },
  {
    id: 'publish_moment',
    category: 'host',
    title: 'Launch a New Moment',
    description: 'Publish a gathering or activation and unlock 80% revenue split.',
    timeEst: '~2 min',
    badge: 'Host',
    iconName: 'CalendarPlus',
    href: '/create/moment',
    roleContext: ['host', 'organizer', 'merchant']
  },
  {
    id: 'monetize_content',
    category: 'promote',
    title: 'Pick a Content Mission',
    description: 'Amplify a brand drop or moment to earn verified commission links.',
    timeEst: '~1 min',
    badge: 'Earn $',
    iconName: 'Flame',
    href: '/momentum',
    roleContext: ['creator', 'promoter']
  },
  {
    id: 'launch_campaign',
    category: 'promote',
    title: 'Deploy Promotional Drop',
    description: 'Target foot traffic with verified check-in vouchers and promo rewards.',
    timeEst: '~3 min',
    badge: 'Brand',
    iconName: 'Target',
    href: '/create/campaign',
    roleContext: ['brand', 'agency', 'merchant']
  },
  {
    id: 'list_product_offer',
    category: 'sell',
    title: 'List Marketplace Product',
    description: 'Add a menu item or product with auto 5% referral viral booster.',
    timeEst: '~2 min',
    badge: 'Merchant',
    iconName: 'ShoppingBag',
    href: '/offers?template=slow-hour-checkin',
    roleContext: ['merchant']
  },
  {
    id: 'invite_squad',
    category: 'grow',
    title: 'Share Squad Referral Link',
    description: 'Invite creators, hosts, or friends and earn perpetual tier overrides.',
    timeEst: '~20s',
    badge: 'Boost',
    iconName: 'Users',
    href: '/referrals',
    roleContext: ['participant', 'creator', 'host', 'brand', 'merchant', 'promoter']
  }
];

export function useUserIntentContinuity() {
  const { user, activeRole } = useAuth();
  const [activeDraft, setActiveDraft] = useState<ActiveDraftItem | null>(null);
  const [lastIntent, setLastIntent] = useState<string>('explore_perks');
  const [dismissedDraftIds, setDismissedDraftIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from LocalStorage + Supabase
  useEffect(() => {
    const loadState = async () => {
      try {
        // Check local storage for drafts
        const localDraftMoment = localStorage.getItem(`${LOCAL_STORAGE_DRAFT_PREFIX}moment`);
        const localDraftCampaign = localStorage.getItem(`${LOCAL_STORAGE_DRAFT_PREFIX}campaign`);
        const storedIntent = localStorage.getItem(LOCAL_STORAGE_INTENT_KEY);

        if (storedIntent) {
          setLastIntent(storedIntent);
        }

        let identifiedDraft: ActiveDraftItem | null = null;

        if (localDraftMoment) {
          try {
            const parsed = JSON.parse(localDraftMoment);
            if (parsed && parsed.title && !parsed.completed) {
              identifiedDraft = {
                id: parsed.id || 'draft-moment',
                type: 'moment',
                title: parsed.title || 'Untitled Moment Draft',
                description: 'Resume editing your upcoming moment & ticket perks.',
                currentStep: parsed.step || 1,
                totalSteps: 3,
                resumeHref: '/create/moment?resume=true',
                lastUpdated: parsed.updatedAt || new Date().toISOString(),
                payload: parsed
              };
            }
          } catch (e) {
            console.error('Error parsing moment draft', e);
          }
        } else if (localDraftCampaign) {
          try {
            const parsed = JSON.parse(localDraftCampaign);
            if (parsed && parsed.title && !parsed.completed) {
              identifiedDraft = {
                id: parsed.id || 'draft-campaign',
                type: 'campaign',
                title: parsed.title || 'Untitled Campaign Draft',
                description: 'Resume setup for your promotional voucher drop.',
                currentStep: parsed.step || 1,
                totalSteps: 4,
                resumeHref: '/create/campaign?resume=true',
                lastUpdated: parsed.updatedAt || new Date().toISOString(),
                payload: parsed
              };
            }
          } catch (e) {
            console.error('Error parsing campaign draft', e);
          }
        }

        // If user is authenticated, also sync with database state
        if (user?.id && isDbIntentTableAvailable) {
          try {
            const { data: dbIntent, error } = await (supabase as any)
              .from('user_intent_states')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle();

            if (error) {
              if (error.code === 'PGRST204' || error.code === '42P01' || error.message?.includes('404') || error.message?.includes('does not exist')) {
                isDbIntentTableAvailable = false;
              }
            } else if (dbIntent) {
              if (dbIntent.last_intent_key) {
                setLastIntent(dbIntent.last_intent_key);
              }
              if (dbIntent.dismissed_draft_ids && Array.isArray(dbIntent.dismissed_draft_ids)) {
                setDismissedDraftIds(dbIntent.dismissed_draft_ids);
              }

              if (
                dbIntent.active_draft_title &&
                (!identifiedDraft || new Date(dbIntent.updated_at) > new Date(identifiedDraft.lastUpdated))
              ) {
                identifiedDraft = {
                  id: dbIntent.active_draft_id || 'db-draft',
                  type: dbIntent.active_draft_type || 'moment',
                  title: dbIntent.active_draft_title,
                  description: 'Pick up where you left off in your latest draft.',
                  currentStep: dbIntent.draft_step_index || 1,
                  totalSteps: dbIntent.draft_step_total || 3,
                  resumeHref: dbIntent.active_draft_type === 'campaign' ? '/create/campaign?resume=true' : '/create/moment?resume=true',
                  lastUpdated: dbIntent.updated_at,
                  payload: dbIntent.active_draft_payload
                };
              }
            }
          } catch (err: any) {
            isDbIntentTableAvailable = false;
          }
        }

        if (identifiedDraft) {
          setActiveDraft(identifiedDraft);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, [user]);

  const selectIntent = useCallback(async (intentKey: string) => {
    setLastIntent(intentKey);
    localStorage.setItem(LOCAL_STORAGE_INTENT_KEY, intentKey);

    if (user?.id && isDbIntentTableAvailable) {
      try {
        const { error } = await (supabase as any).from('user_intent_states').upsert({
          user_id: user.id,
          last_intent_key: intentKey,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        if (error) {
          if (error.code === 'PGRST204' || error.code === '42P01') isDbIntentTableAvailable = false;
        }
      } catch (err) {
        isDbIntentTableAvailable = false;
      }
    }
  }, [user]);

  const saveDraft = useCallback(async (
    type: 'moment' | 'campaign' | 'offer' | 'content',
    draftId: string,
    title: string,
    step: number,
    totalSteps: number,
    payload: Record<string, any>
  ) => {
    const draftData = {
      id: draftId,
      type,
      title,
      step,
      totalSteps,
      payload,
      updatedAt: new Date().toISOString(),
      completed: false
    };

    localStorage.setItem(`${LOCAL_STORAGE_DRAFT_PREFIX}${type}`, JSON.stringify(draftData));

    setActiveDraft({
      id: draftId,
      type,
      title,
      description: `Resume step ${step} of ${totalSteps}`,
      currentStep: step,
      totalSteps,
      resumeHref: type === 'campaign' ? '/create/campaign?resume=true' : '/create/moment?resume=true',
      lastUpdated: draftData.updatedAt,
      payload
    });

    if (user?.id && isDbIntentTableAvailable) {
      try {
        const { error } = await (supabase as any).from('user_intent_states').upsert({
          user_id: user.id,
          active_draft_type: type,
          active_draft_id: draftId,
          active_draft_title: title,
          active_draft_payload: payload,
          draft_step_index: step,
          draft_step_total: totalSteps,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        if (error) {
          if (error.code === 'PGRST204' || error.code === '42P01') isDbIntentTableAvailable = false;
        }
      } catch (err) {
        isDbIntentTableAvailable = false;
      }
    }
  }, [user]);

  const dismissDraft = useCallback(async (draftId: string) => {
    setDismissedDraftIds(prev => [...prev, draftId]);
    setActiveDraft(null);

    // Clear local storage for matching draft
    if (activeDraft?.type) {
      localStorage.removeItem(`${LOCAL_STORAGE_DRAFT_PREFIX}${activeDraft.type}`);
    }

    if (user?.id && isDbIntentTableAvailable) {
      try {
        const { error } = await (supabase as any).from('user_intent_states').upsert({
          user_id: user.id,
          active_draft_title: null,
          active_draft_payload: {},
          dismissed_draft_ids: [...dismissedDraftIds, draftId],
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        if (error) {
          if (error.code === 'PGRST204' || error.code === '42P01') isDbIntentTableAvailable = false;
        }
      } catch (err) {
        isDbIntentTableAvailable = false;
      }
    }
  }, [user, activeDraft, dismissedDraftIds]);

  // Filter goals relevant to user role or generalized
  const relevantGoals = SYSTEM_GOALS.filter(goal => {
    if (!activeRole) return true;
    return goal.roleContext.includes(activeRole) || goal.roleContext.includes('all');
  });

  return {
    activeDraft: (activeDraft && !dismissedDraftIds.includes(activeDraft.id)) ? activeDraft : null,
    lastIntent,
    relevantGoals,
    allGoals: SYSTEM_GOALS,
    isLoading,
    selectIntent,
    saveDraft,
    dismissDraft
  };
}
