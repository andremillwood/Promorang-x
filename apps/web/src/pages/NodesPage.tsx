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
        title="Community Liquidity Nodes & No-Loss Jackpot | Promorang"
        description="Deploy Promorang commerce nodes to power instant checkout settlement and AMM liquidity. 100% principal protected with weekly and monthly cash jackpot entries."
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
