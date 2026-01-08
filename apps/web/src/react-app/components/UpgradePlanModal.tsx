import { useMemo } from 'react';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import type { AdvertiserPlan } from '@/react-app/services/advertiser';
import ModalBase from '@/react-app/components/ModalBase';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: AdvertiserPlan[];
  currentTier: string;
  onSelect: (planId: string) => void;
  isSubmitting?: boolean;
}

const tierIconMap: Record<string, JSX.Element> = {
  free: <Zap className="w-5 h-5 text-orange-500" />,
  starter: <Zap className="w-5 h-5 text-blue-500" />,
  growth: <Sparkles className="w-5 h-5 text-purple-500" />,
  premium: <Crown className="w-5 h-5 text-yellow-500" />,
  enterprise: <Crown className="w-5 h-5 text-gray-500" />,
};

export function UpgradePlanModal({
  isOpen,
  onClose,
  plans,
  currentTier,
  onSelect,
  isSubmitting,
}: UpgradePlanModalProps) {
  const sortedPlans = useMemo(
    () => plans.slice().sort((a, b) => a.price - b.price),
    [plans],
  );

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      showCloseButton={false}
    >
      <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-pr-surface-card shadow-xl">
        <div className="flex items-center justify-between border-b border-pr-border px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-pr-text-1">Upgrade Advertiser Plan</h2>
            <p className="text-sm text-pr-text-2">
              Choose a plan to unlock more drops, advanced analytics, and exclusive incentive tools.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-pr-text-2 transition-colors hover:bg-pr-surface-2"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid gap-4 md:grid-cols-3">
            {sortedPlans.map((plan) => {
              const isCurrent = plan.id === currentTier;
              return (
                <div
                  key={plan.id}
                  className={`flex flex-col rounded-xl border p-5 shadow-sm transition-all ${isCurrent
                      ? 'border-blue-500 bg-blue-50/60 shadow-blue-100'
                      : 'border-pr-surface-3 hover:border-blue-400 hover:shadow-md'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {tierIconMap[plan.id] ?? <Zap className="w-5 h-5 text-orange-500" />}
                      <h3 className="text-lg font-semibold text-pr-text-1 capitalize">
                        {plan.name}
                      </h3>
                    </div>
                    {isCurrent && (
                      <span className="inline-flex items-center space-x-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        <Check className="h-3 w-3" />
                        <span>Current</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="text-3xl font-bold text-pr-text-1">
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    </div>
                    {plan.price > 0 && (
                      <span className="text-sm text-pr-text-2">/ {plan.billingInterval}</span>
                    )}
                  </div>

                  <ul className="mt-4 space-y-2 text-sm text-pr-text-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start space-x-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => onSelect(plan.id)}
                    disabled={isCurrent || isSubmitting}
                    className={`mt-6 w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isCurrent
                        ? 'cursor-default bg-pr-surface-2 text-pr-text-2'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 disabled:opacity-60'
                      }`}
                  >
                    {isCurrent ? 'Selected Plan' : `Choose ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ModalBase>
  );
}

export default UpgradePlanModal;
