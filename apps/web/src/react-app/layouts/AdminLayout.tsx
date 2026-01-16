import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShieldCheck,
    Users,
    LogOut,
    ChevronRight,
    Menu,
    LifeBuoy,
    Settings,
    Map
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const isActive = (path: string) => location.pathname === path;

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
        { icon: ShieldCheck, label: 'KYC Verification', path: '/admin/kyc' },
        { icon: LifeBuoy, label: 'Support Tickets', path: '/admin/support' },
        { icon: Settings, label: 'Roles & Settings', path: '/admin/settings' },
        { icon: Map, label: 'Site Map', path: '/admin/sitemap' },
    ];

    const handleLogout = () => {
        // In a real app we'd clear tokens etc.
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'
                    } bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}
            >
                <div className="p-4 flex items-center justify-between border-b border-gray-700">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-2 font-bold text-xl text-blue-400">
                            <ShieldCheck className="w-6 h-6" />
                            <span>Admin</span>
                        </div>
                    ) : (
                        <ShieldCheck className="w-8 h-8 text-blue-400 mx-auto" />
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1 rounded-lg hover:bg-gray-700 text-gray-400"
                    >
                        {isSidebarOpen ? <Menu className="w-5 h-5" /> : null}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive(item.path)
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {isSidebarOpen && <span className="font-medium">{item.label}</span>}
                            {!isSidebarOpen && isActive(item.path) && (
                                <div className="absolute left-20 bg-gray-800 p-2 rounded shadow-lg border border-gray-700 text-sm whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:bg-gray-700 transition-colors ${!isSidebarOpen && 'justify-center'
                            }`}
                    >
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span>Exit Admin</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
