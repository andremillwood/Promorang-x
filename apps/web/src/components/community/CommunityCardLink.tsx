import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';

export function CommunityCardLink() {
  return <Link to="/community" className="flex min-h-16 items-center justify-between gap-4 border-y border-orange-300/20 py-4 text-orange-100">
    <span className="flex items-center gap-3"><Users className="h-5 w-5" /><span><span className="block text-sm font-semibold">Your community</span><span className="mt-1 block text-xs text-white/60">Your people, moves, and place in the community.</span></span></span><ArrowRight className="h-4 w-4 shrink-0" />
  </Link>;
}
