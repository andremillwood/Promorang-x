import { Link as _Link } from 'react-router-dom';
import { LogOut as _LogOut, Search as _Search, Settings as _Settings } from 'lucide-react';
const Link = _Link as any;
const LogOut = _LogOut as any;
const Search = _Search as any;
const SettingsIcon = _Settings as any;
import AccountSwitcher from '@/react-app/components/AccountSwitcher';
import MerchantAccountSwitcher from '@/react-app/components/MerchantAccountSwitcher';
import type { NavigationGroup, NavigationItem } from '@/react-app/config/navigation';

interface DesktopSidebarProps {
  groups: NavigationGroup[];
  isActive: (path: string) => boolean;
  onNavClick?: (item: NavigationItem) => boolean | void;
  onLogout?: () => void;
  onSearch?: () => void;
  userData?: any;
  profilePath?: string;
  showSuccessGuide?: boolean;
  onToggleSuccessGuide?: () => void;
}

export default function DesktopSidebar({ groups, isActive, onNavClick, onLogout, onSearch, userData, profilePath, showSuccessGuide, onToggleSuccessGuide }: DesktopSidebarProps) {
  const showSectionLabels = groups.length > 1;

  return (
    <div className="flex flex-col w-full h-full bg-[#0c0a0f] relative overflow-hidden">
      {/* Ambient Wash */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[30%] bg-amber-500/[0.04] blur-[100px] pointer-events-none rounded-full" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <div className="p-8 border-b border-white/5">
          <Link
            to="/today"
            className="flex items-center space-x-4 group"
          >
            <img
              src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_FULL-02.png"
              alt="Promorang"
              className="h-10 w-10 transition-transform group-hover:scale-105"
            />
            <span className="text-2xl font-black text-white tracking-tighter italic lowercase">Promorang</span>
          </Link>
        </div>

        {/* Profile Section - Quick Access */}
        {(userData || profilePath) && (
          <div className="p-6">
            <Link
              to={profilePath || '/profile/me'}
              className={`flex items-center space-x-4 p-4 rounded-[2rem] transition-all duration-300 group ${isActive(profilePath || '/profile/me')
                ? 'bg-white/5 ring-1 ring-white/10'
                : 'hover:bg-white/[0.03]'
                }`}
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-amber-500 transition-colors">
                  <img
                    src={userData?.avatar_url || `https://ui-avatars.com/api/?name=${userData?.display_name || 'User'}&background=random`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-[#0c0a0f] rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white italic lowercase truncate leading-none">
                  {userData?.display_name || 'My Profile'}
                </p>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1.5 truncate">
                  @{userData?.username || 'view story'}
                </p>
              </div>
            </Link>
          </div>
        )}

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

        {/* Account Switcher */}
        {userData?.user_type === 'advertiser' && (
          <div className="px-5 py-3 border-b border-pr-surface-3">
            <AccountSwitcher />
          </div>
        )}
        {userData?.user_type === 'merchant' && (
          <div className="px-5 py-3 border-b border-pr-surface-3">
            <MerchantAccountSwitcher />
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
                  const Icon = item.icon as any;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={(e: any) => {
                        if (onNavClick && onNavClick(item)) {
                          e.preventDefault();
                        }
                      }}
                      className={`flex items-center space-x-4 px-6 py-4 rounded-full text-sm font-black transition-all duration-300 italic lowercase tracking-tight ${active
                        ? 'bg-amber-500/10 text-amber-500 shadow-xl shadow-amber-500/5'
                        : 'text-white/30 hover:bg-white/[0.03] hover:text-white/60'
                        }`}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-amber-500' : 'text-white/20'}`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}

            {/* Restore Success Guide (Only if hidden) */}
            {showSuccessGuide === false && onToggleSuccessGuide && (
              <div className="space-y-1">
                <button
                  onClick={onToggleSuccessGuide}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-pr-text-2 hover:bg-green-50 hover:text-green-700 transition-all duration-200 group border border-dashed border-gray-200 hover:border-green-200"
                >
                  {/* Dynamically imported Trophy to avoid huge bundle impact if not tree-shaken, 
                    but lucide-react treeshaking is good usually. Need to import Trophy though. */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 flex-shrink-0 text-green-500"
                  >
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                  </svg>
                  <span className="truncate">Show Success Guide</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="p-6 space-y-4">
          <Link
            to="/settings"
            className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white hover:bg-white/10 border border-white/5 transition-all"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </Link>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          )}
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/5 text-center pt-2">
            © 2024 Promorang
          </div>
        </div>
      </div>
    </div>
  );
}
