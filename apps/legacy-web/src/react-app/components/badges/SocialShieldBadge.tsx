/**
 * Social Shield Badge Component
 * 
 * Shows Social Shield verification status with state-aware labeling.
 * Always visible as a badge, explainer only at state >= 1.
 */

import { useState } from 'react';
import { Shield, ChevronRight, X, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { useMaturity, UserMaturityState } from '@/react-app/context/MaturityContext';
import { Link } from 'react-router-dom';

interface SocialShieldBadgeProps {
  variant?: 'inline' | 'card' | 'minimal';
  status?: 'verified' | 'pending' | 'none';
  showExplainer?: boolean;
  className?: string;
}

export function SocialShieldBadge({ 
  variant = 'inline', 
  status = 'verified',
  showExplainer = false,
  className = '' 
}: SocialShieldBadgeProps) {
  const { maturityState, visibility } = useMaturity();
  const [showModal, setShowModal] = useState(false);

  const label = visibility.labels.verified;
  const canSeeExplainer = maturityState >= UserMaturityState.ACTIVE;

  const statusConfig = {
    verified: {
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
      text: 'Verified & Protected'
    },
    pending: {
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: AlertTriangle,
      text: 'Verification Pending'
    },
    none: {
      color: 'text-gray-500',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: Lock,
      text: 'Not Verified'
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  // Minimal badge - just icon and text
  if (variant === 'minimal') {
    return (
      <span className={`inline-flex items-center gap-1 ${config.color} ${className}`}>
        <Shield className="w-3.5 h-3.5" />
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
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${config.bg} ${config.color} rounded-full text-sm font-medium hover:opacity-80 transition-opacity ${className}`}
          disabled={!canSeeExplainer || !showExplainer}
        >
          <Shield className="w-4 h-4" />
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

              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-bold text-pr-text-1 text-center mb-2">
                Social Shield
              </h3>
              <p className="text-pr-text-2 text-center mb-4">
                Your content and earnings are protected by our verification system.
                Disputes are handled fairly and transparently.
              </p>

              <div className="bg-pr-surface-2 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-pr-text-1 mb-2">Protection includes:</h4>
                <ul className="space-y-2 text-sm text-pr-text-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Content ownership verification
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Fair dispute resolution
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Earnings protection
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Brand safety guarantee
                  </li>
                </ul>
              </div>

              <Link
                to="/growth-hub/social-shield"
                onClick={() => setShowModal(false)}
                className="block w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl text-center hover:opacity-90 transition-opacity"
              >
                Learn More About Social Shield
              </Link>
            </div>
          </div>
        )}
      </>
    );
  }

  // Card variant - larger display
  return (
    <div className={`${config.bg} rounded-xl p-4 border ${config.border} ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-pr-text-1">{label}</h4>
          <div className="flex items-center gap-1 text-xs">
            <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
            <span className={config.color}>{config.text}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-pr-text-2 mb-3">
        Your content and earnings are protected.
      </p>

      {canSeeExplainer && (
        <Link
          to="/growth-hub/social-shield"
          className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
        >
          Learn more <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

export default SocialShieldBadge;
