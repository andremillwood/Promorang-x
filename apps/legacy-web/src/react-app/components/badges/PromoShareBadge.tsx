/**
 * PromoShare Badge Component
 * 
 * Shows PromoShare status badge with state-aware labeling.
 * Always visible as a badge, explainer only at state >= 2.
 */

import { useState } from 'react';
import { Trophy, ChevronRight, X, Sparkles } from 'lucide-react';
import { useMaturity, UserMaturityState } from '@/react-app/context/MaturityContext';
import { Link } from 'react-router-dom';

interface PromoShareBadgeProps {
  variant?: 'inline' | 'card' | 'minimal';
  showExplainer?: boolean;
  className?: string;
}

export function PromoShareBadge({ 
  variant = 'inline', 
  showExplainer = false,
  className = '' 
}: PromoShareBadgeProps) {
  const { maturityState, visibility } = useMaturity();
  const [showModal, setShowModal] = useState(false);

  const label = visibility.labels.weeklyWins;
  const canSeeExplainer = maturityState >= UserMaturityState.REWARDED;

  // Minimal badge - just icon and text
  if (variant === 'minimal') {
    return (
      <span className={`inline-flex items-center gap-1 text-amber-600 ${className}`}>
        <Trophy className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">{label}</span>
      </span>
    );
  }

  // Inline badge with optional click for explainer
  if (variant === 'inline') {
    return (
      <>
        <button
          onClick={() => canSeeExplainer && showExplainer && setShowModal(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium hover:bg-amber-100 transition-colors ${className}`}
          disabled={!canSeeExplainer || !showExplainer}
        >
          <Trophy className="w-4 h-4" />
          <span>{label}</span>
          {canSeeExplainer && showExplainer && <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Explainer Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-pr-surface-1 rounded-2xl max-w-md w-full p-6 relative">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1 text-pr-text-2 hover:text-pr-text-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-bold text-pr-text-1 text-center mb-2">
                PromoShare
              </h3>
              <p className="text-pr-text-2 text-center mb-4">
                Every verified action you complete enters you into weekly prize draws. 
                The more you participate, the better your chances!
              </p>

              <div className="bg-pr-surface-2 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-pr-text-1 mb-2">How it works:</h4>
                <ul className="space-y-2 text-sm text-pr-text-2">
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    Complete deals, events, or posts
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    Each action = 1 entry into weekly draw
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    Winners announced every Sunday
                  </li>
                </ul>
              </div>

              <Link
                to="/promoshare"
                onClick={() => setShowModal(false)}
                className="block w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl text-center hover:opacity-90 transition-opacity"
              >
                View PromoShare Dashboard
              </Link>
            </div>
          </div>
        )}
      </>
    );
  }

  // Card variant - larger display
  return (
    <div className={`bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-pr-text-1">{label}</h4>
          <p className="text-xs text-pr-text-2">Qualify for weekly wins</p>
        </div>
      </div>

      <p className="text-sm text-pr-text-2 mb-3">
        This action qualifies you for weekly prize draws.
      </p>

      {canSeeExplainer && (
        <Link
          to="/promoshare"
          className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
        >
          Learn more <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

export default PromoShareBadge;
