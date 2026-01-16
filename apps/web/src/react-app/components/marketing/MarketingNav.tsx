import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useUnauthenticatedTheme } from '@/react-app/hooks/useUnauthenticatedTheme';

export default function MarketingNav() {
    const { user } = useAuth();
    const { theme, setTheme } = useUnauthenticatedTheme();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    // Simplified navigation links
    const navLinks = [
        { label: 'Explore', path: '/explore' },
        { label: 'How It Works', path: '/how-it-works' },
        { label: 'For Business', path: '/advertisers' },
        { label: 'Pricing', path: '/pricing' },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-pr-surface-background border-b border-pr-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img
                            src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png"
                            alt="Promorang"
                            className="h-8 w-auto"
                        />
                    </Link>

                    {/* Desktop Navigation - Simplified */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-medium transition-colors ${isActive(link.path)
                                        ? 'text-blue-500'
                                        : 'text-pr-text-2 hover:text-pr-text-1'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            className="p-2 rounded-full bg-pr-surface-card border border-pr-border hover:bg-pr-surface-2 transition-colors"
                        >
                            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </button>

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            {user ? (
                                <Button onClick={() => window.location.href = '/dashboard'} variant="primary" size="sm">
                                    Dashboard
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={() => window.location.href = '/auth'} variant="ghost" size="sm">
                                        Login
                                    </Button>
                                    <Button onClick={() => window.location.href = '/auth'} variant="primary" size="sm">
                                        Get Started
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-pr-surface-2 transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu - Simplified */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-pr-border">
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`text-sm font-medium ${isActive(link.path)
                                            ? 'text-blue-500'
                                            : 'text-pr-text-2 hover:text-pr-text-1'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* More Options - Link to Catalog */}
                            <div className="border-t border-pr-border pt-4">
                                <Link
                                    to="/catalog"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors"
                                >
                                    Browse All Solutions →
                                </Link>
                            </div>

                            <div className="border-t border-pr-border pt-4 flex flex-col gap-2">
                                {user ? (
                                    <Button onClick={() => window.location.href = '/dashboard'} variant="primary" className="w-full">
                                        Dashboard
                                    </Button>
                                ) : (
                                    <>
                                        <Button onClick={() => window.location.href = '/auth'} variant="ghost" className="w-full">
                                            Login
                                        </Button>
                                        <Button onClick={() => window.location.href = '/auth'} variant="primary" className="w-full">
                                            Get Started
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
