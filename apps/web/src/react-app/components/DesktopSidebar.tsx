import { Link } from 'react-router-dom';
import { LogOut, Search } from 'lucide-react';
import type { NavigationGroup, NavigationItem } from '@/react-app/config/navigation';

interface DesktopSidebarProps {
  groups: NavigationGroup[];
  isActive: (path: string) => boolean;
  onNavClick?: (item: NavigationItem) => boolean | void;
  onLogout?: () => void;
  onSearch?: () => void;
}

export default function DesktopSidebar({ groups, isActive, onNavClick, onLogout, onSearch }: DesktopSidebarProps) {
  const showSectionLabels = groups.length > 1;

  return (
    <div className="flex flex-col w-full h-full">
      {/* Logo */}
      <div className="p-6 border-b border-pr-surface-3">
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <img 
            src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_FULL-02.png"
            alt="Promorang"
            className="h-10 w-10 transition-transform group-hover:scale-105"
          />
          <span className="text-xl font-bold text-pr-text-1">Promorang</span>
        </Link>
      </div>

      {/* Search Button */}
      {onSearch && (
        <div className="p-3 border-b border-pr-surface-3">
          <button
            onClick={onSearch}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-pr-text-2 hover:bg-pr-surface-2 hover:text-pr-text-1 transition-all duration-200 group"
          >
            <Search className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left">Search</span>
            <kbd className="hidden xl:inline-flex items-center px-2 py-1 text-xs font-medium text-pr-text-2 bg-pr-surface-2 border border-pr-surface-3 rounded group-hover:bg-pr-surface-3">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.section} className="space-y-1">
              {showSectionLabels && (
                <p className="px-4 text-xs font-semibold uppercase tracking-wide text-pr-text-2/70">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={(e) => {
                      if (onNavClick && onNavClick(item)) {
                        e.preventDefault();
                      }
                    }}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 shadow-sm'
                        : 'text-pr-text-2 hover:bg-pr-surface-2 hover:text-pr-text-1'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-pr-surface-3 space-y-3">
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:text-red-400 hover:bg-red-500/5 border border-red-500/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        )}
        <div className="text-xs text-pr-text-2 text-center">
          © 2024 Promorang
        </div>
      </div>
    </div>
  );
}
