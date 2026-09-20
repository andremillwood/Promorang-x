import { Link } from 'react-router-dom';
import { ArrowRight, Radio, Users } from 'lucide-react';

export function CommunityCardLink() {
  return (
    <Link to="/community" className="pr-world-panel pr-world-panel--signal group block overflow-hidden p-5 sm:p-6">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="pr-world-kicker">Scene</p>
          <h3 className="mt-3 font-serif text-3xl font-bold leading-none tracking-[-.04em] text-white">Your people are part of the map.</h3>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/48">Enter the persistent context around the Moments, places and people you keep coming back to.</p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[.04] text-[#ff5a1f]"><Radio className="h-5 w-5" /></span>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.12em] text-white/45"><Users className="h-4 w-4" />Scene membership ≠ attendance</span>
        <span className="pr-world-link inline-flex items-center gap-1">Enter Scene <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
      </div>
    </Link>
  );
}
