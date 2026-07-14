import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as unknown as SupabaseClient;

type OutcomeRow = {
  people_reached: number;
  people_joined: number;
  people_showed_up: number;
  people_returned: number;
  stories_created: number;
  collaborations_opened: number;
  redemptions: number;
  gross_value: number;
  human_return_summary: string | null;
  commercial_return_summary: string | null;
  scene_learning_summary: string | null;
  content_return_summary: string | null;
  gems_return_summary: string | null;
  participant_value_summary: string | null;
  next_decision: string | null;
  next_decision_note: string | null;
};

type GemRow = { amount: number };
type PassRow = { id: string };

export function useStakeholderReturn() {
  const { user } = useAuth();
  const [data, setData] = useState({
    people: 0,
    returns: 0,
    stories: 0,
    collaborations: 0,
    redemptions: 0,
    grossValue: 0,
    gemsEarned: 0,
    accessCount: 0,
    summary: '',
    sceneLearning: '',
    contentReturn: '',
    gemsReturn: '',
    participantValue: '',
    nextDecision: '',
    nextDecisionNote: '',
  });
  const [loading, setLoading] = useState(true);

  const fetchReturn = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [outcomesResult, gemsResult, passesResult] = await Promise.all([
        db.from('activation_outcome_snapshots').select('people_reached,people_joined,people_showed_up,people_returned,stories_created,collaborations_opened,redemptions,gross_value,human_return_summary,commercial_return_summary,scene_learning_summary,content_return_summary,gems_return_summary,participant_value_summary,next_decision,next_decision_note').eq('owner_user_id', user.id).order('captured_at', { ascending: false }).limit(12),
        db.from('economy_transactions').select('amount').eq('user_id', user.id).eq('currency', 'gems').gt('amount', 0).order('created_at', { ascending: false }).limit(24),
        db.from('activation_access_passes').select('id').eq('user_id', user.id).in('status', ['reserved', 'active', 'used']).limit(24),
      ]);
      const error = outcomesResult.error || gemsResult.error || passesResult.error;
      if (error) throw error;
      const outcomes = (outcomesResult.data || []) as OutcomeRow[];
      const gems = (gemsResult.data || []) as GemRow[];
      const passes = (passesResult.data || []) as PassRow[];
      setData({
        people: outcomes.reduce((sum, row) => sum + Number(row.people_reached || row.people_joined || row.people_showed_up || 0), 0),
        returns: outcomes.reduce((sum, row) => sum + Number(row.people_returned || 0), 0),
        stories: outcomes.reduce((sum, row) => sum + Number(row.stories_created || 0), 0),
        collaborations: outcomes.reduce((sum, row) => sum + Number(row.collaborations_opened || 0), 0),
        redemptions: outcomes.reduce((sum, row) => sum + Number(row.redemptions || 0), 0),
        grossValue: outcomes.reduce((sum, row) => sum + Number(row.gross_value || 0), 0),
        gemsEarned: gems.reduce((sum, row) => sum + Number(row.amount || 0), 0),
        accessCount: passes.length,
        summary: outcomes.find((row) => row.human_return_summary)?.human_return_summary || outcomes.find((row) => row.commercial_return_summary)?.commercial_return_summary || '',
        sceneLearning: outcomes.find((row) => row.scene_learning_summary)?.scene_learning_summary || '',
        contentReturn: outcomes.find((row) => row.content_return_summary)?.content_return_summary || '',
        gemsReturn: outcomes.find((row) => row.gems_return_summary)?.gems_return_summary || '',
        participantValue: outcomes.find((row) => row.participant_value_summary)?.participant_value_summary || '',
        nextDecision: outcomes.find((row) => row.next_decision)?.next_decision || '',
        nextDecisionNote: outcomes.find((row) => row.next_decision_note)?.next_decision_note || '',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturn();
  }, [user]);

  return { data, loading, refetch: fetchReturn };
}
