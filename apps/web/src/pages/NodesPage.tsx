import React from 'react';
import SEO from '@/components/SEO';
import { PromorangNodeHub } from '@/components/nodes/PromorangNodeHub';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const NodesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // In production, user tier & streak are loaded from AuthContext or user profile
  const userTier = (user?.user_tier as 'free' | 'premium' | 'super') || 'premium';
  const streakDays = user?.points_streak_days || 34;

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-20">
      <SEO
        title="Save & Win Community Vaults | Promorang"
        description="Back local businesses and event check-ins with community savings vaults. Keep 100% of your money with zero risk, plus get free tickets into weekly and monthly cash prize draws."
      />
      <div className="container mx-auto px-4">
        <PromorangNodeHub
          userTier={userTier}
          streakDays={streakDays}
          stakedBalance={1000}
          onUpgradeTier={() => navigate('/pricing')}
          onStake={(nodeId, amount) => {
            console.log(`Staking ${amount} USD into node ${nodeId}`);
          }}
        />
      </div>
    </div>
  );
};

export default NodesPage;
