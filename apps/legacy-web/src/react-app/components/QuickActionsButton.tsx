import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as _Plus, X as _X, PenSquare as _PenSquare, Gift as _Gift, Target as _Target, Share2 as _Share2 } from 'lucide-react';

const Plus = _Plus as any;
const X = _X as any;
const PenSquare = _PenSquare as any;
const Gift = _Gift as any;
const Target = _Target as any;
const Share2 = _Share2 as any;

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

export default function QuickActionsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      id: 'create',
      label: 'Create Content',
      icon: PenSquare,
      href: '/create',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      id: 'drop',
      label: 'Apply to Drop',
      icon: Gift,
      href: '/earn',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      id: 'forecast',
      label: 'Place Forecast',
      icon: Target,
      href: '/market?tab=forecasts',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      id: 'share',
      label: 'Share & Earn',
      icon: Share2,
      href: '/referrals',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  const handleAction = (href: string) => {
    setIsOpen(false);
    navigate(href);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Quick actions menu */}
      <div className="fixed bottom-20 right-4 z-50 md:hidden">
        {isOpen && (
          <div className="mb-3 space-y-2 animate-in slide-in-from-bottom-4 duration-200">
            {actions.map((action, index) => (
              <button
                key={action.id}
                onClick={() => handleAction(action.href)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white shadow-lg transition-all duration-200 ${action.color}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <action.icon className="w-5 h-5" />
                <span className="font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? 'bg-pr-surface-1 text-pr-text-1 rotate-45'
              : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
          }`}
          aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>
    </>
  );
}
