import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Megaphone, Gift } from 'lucide-react';
import Layout from '@/react-app/components/Layout';

export default function AdvertiserLayout() {
  const location = useLocation();

  const tabs = [
    { name: 'Dashboard', path: '/advertiser', icon: LayoutDashboard },
    { name: 'Campaigns', path: '/advertiser/campaigns', icon: Megaphone },
    { name: 'Coupons', path: '/advertiser/coupons', icon: Gift },
  ];

  const isActive = (path: string) => {
    if (path === '/advertiser') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Layout>
      <div className="min-h-screen-dynamic bg-pr-surface-2">
        {/* Tab Navigation */}
        <div className="bg-pr-surface-card border-b border-pr-surface-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = isActive(tab.path);
                return (
                  <Link
                    key={tab.name}
                    to={tab.path}
                    className={`
                      flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${
                        active
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-pr-text-2 hover:text-pr-text-1 hover:border-pr-surface-3'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </div>
    </Layout>
  );
}
