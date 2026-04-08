import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import type { NavigationItem } from '@/react-app/config/navigation';

interface MobileNavProps {
  items: NavigationItem[];
  isActive: (path: string) => boolean;
  onMenuClick: () => void;
  showMobileMenu: boolean;
}

export default function MobileNav({ items, isActive, onMenuClick, showMobileMenu }: MobileNavProps) {
  const visibleItems = items.slice(0, 4);

  return (
    <div className="flex items-stretch bg-pr-surface-card bg-white dark:bg-[#141414] border-t border-pr-surface-3">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 sm:py-3 px-1 transition-colors tap-target ${
              isActive(item.href) ? 'text-orange-600' : 'text-gray-400 hover:text-pr-text-2'
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs mt-0.5 sm:mt-1 font-medium leading-tight truncate max-w-full">{item.name}</span>
          </Link>
        );
      })}

      <button
        onClick={onMenuClick}
        className={`flex-1 flex flex-col items-center justify-center py-2 sm:py-3 px-1 transition-colors tap-target ${
          showMobileMenu ? 'text-orange-600' : 'text-gray-400 hover:text-pr-text-2'
        }`}
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5 flex-shrink-0" />
        <span className="text-xs mt-0.5 sm:mt-1 font-medium leading-tight truncate max-w-full">More</span>
      </button>
    </div>
  );
}
