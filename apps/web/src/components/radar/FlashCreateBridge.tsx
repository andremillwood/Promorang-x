import React from 'react';
import { Sparkles, ArrowRight, Zap, Shield, Rocket } from 'lucide-react';

interface FlashCreateBridgeProps {
  context?: 'dashboard' | 'builder' | 'onboarding';
  className?: string;
}

export default function FlashCreateBridge({ context = 'dashboard', className = '' }: FlashCreateBridgeProps) {
  const getContent = () => {
    switch (context) {
      case 'builder':
        return {
          title: 'Need a Custom Strategy?',
          description: 'Our expert operators can design, launch, and manage your entire campaign for you.',
          cta: 'Talk to a Growth Specialist',
          icon: <Rocket className="w-6 h-6 text-yellow-400" />
        };
      case 'onboarding':
        return {
          title: 'Done-For-You Activation',
          description: 'Skip the setup. FlashCreate handles the creator matching and verification SOPs.',
          cta: 'Explore Managed Services',
          icon: <Shield className="w-6 h-6 text-yellow-400" />
        };
      default:
        return {
          title: 'Scale Beyond Inventory',
          description: 'Unlock custom high-impact campaigns with FlashCreate Managed Services.',
          cta: 'Upgrade to Managed',
          icon: <Zap className="w-6 h-6 text-yellow-400" />
        };
    }
  };

  const content = getContent();

  return (
    <div className={`relative overflow-hidden bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-2xl ${className}`}>
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">FlashCreate x Promorang</span>
            <h3 className="text-xl font-bold">{content.title}</h3>
          </div>
        </div>

        <p className="text-slate-400 mb-6 text-sm leading-relaxed">
          {content.description}
        </p>

        <a 
          href="https://flashcreate.com/bridge?utm_source=promorang&utm_medium=bridge" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center justify-between w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          <span>{content.cta}</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </a>

        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Managed Service</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>Jarvis-Grade AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
