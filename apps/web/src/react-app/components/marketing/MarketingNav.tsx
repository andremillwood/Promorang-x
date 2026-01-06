import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ChevronDown, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useUnauthenticatedTheme } from '@/react-app/hooks/useUnauthenticatedTheme';
import LanguageSwitcher from '@/react-app/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function MarketingNav() {
    const { t } = useTranslation('common');
    const { user } = useAuth();
    const { theme, setTheme } = useUnauthenticatedTheme();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const personaLinks = [
        { label: t('nav.forCreators'), path: '/for-creators' },
        { label: t('nav.forInvestors'), path: '/for-investors' },
        { label: t('nav.forAdvertisers'), path: '/for-advertisers' },
        { label: t('nav.forMerchants'), path: '/for-merchants' },
        { label: t('nav.forOperators'), path: '/for-operators' },
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

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            to="/about"
                            className={`text-sm font-medium transition-colors ${isActive('/about') ? 'text-pr-text-1' : 'text-pr-text-2 hover:text-pr-text-1'
                                }`}
                        >
                            {t('nav.about')}
                        </Link>
                        <Link
                            to="/how-it-works"
                            className={`text-sm font-medium transition-colors ${isActive('/how-it-works') ? 'text-pr-text-1' : 'text-pr-text-2 hover:text-pr-text-1'
                                }`}
                        >
                            {t('nav.howItWorks')}
                        </Link>

                        {/* Persona Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                                className="flex items-center gap-1 text-sm font-medium text-pr-text-2 hover:text-pr-text-1 transition-colors"
                            >
                                {t('nav.solutions')}
                                <ChevronDown className={`w-4 h-4 transition-transform ${personaDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {personaDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-pr-surface-card border border-pr-border rounded-lg shadow-xl py-2 z-50">
                                    {personaLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setPersonaDropdownOpen(false)}
                                            className="block px-4 py-2 text-sm text-pr-text-2 hover:text-pr-text-1 hover:bg-pr-surface-2 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            to="/pricing"
                            className={`text-sm font-medium transition-colors ${isActive('/pricing') ? 'text-pr-text-1' : 'text-pr-text-2 hover:text-pr-text-1'
                                }`}
                        >
                            {t('nav.pricing')}
                        </Link>
                        <Link
                            to="/contact"
                            className={`text-sm font-medium transition-colors ${isActive('/contact') ? 'text-pr-text-1' : 'text-pr-text-2 hover:text-pr-text-1'
                                }`}
                        >
                            {t('nav.contact')}
                        </Link>
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

                        {/* Language Switcher */}
                        <LanguageSwitcher />

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            {user ? (
                                <Button onClick={() => window.location.href = '/dashboard'} variant="primary" size="sm">
                                    {t('nav.dashboard')}
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={() => window.location.href = '/auth'} variant="ghost" size="sm">
                                        {t('nav.login')}
                                    </Button>
                                    <Button onClick={() => window.location.href = '/auth'} variant="primary" size="sm">
                                        {t('nav.getStarted')}
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

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-pr-border">
                        <div className="flex flex-col gap-4">
                            <Link
                                to="/about"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-sm font-medium text-pr-text-2 hover:text-pr-text-1 transition-colors"
                            >
                                {t('nav.about')}
                            </Link>
                            <Link
                                to="/how-it-works"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-sm font-medium text-pr-text-2 hover:text-pr-text-1 transition-colors"
                            >
                                {t('nav.howItWorks')}
                            </Link>
                            <div className="border-t border-pr-border pt-4">
                                <div className="text-xs font-bold uppercase tracking-wider text-pr-text-2 mb-2">{t('nav.solutions')}</div>
                                {personaLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block py-2 text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                            <Link
                                to="/pricing"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-sm font-medium text-pr-text-2 hover:text-pr-text-1 transition-colors"
                            >
                                {t('nav.pricing')}
                            </Link>
                            <Link
                                to="/contact"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-sm font-medium text-pr-text-2 hover:text-pr-text-1 transition-colors"
                            >
                                {t('nav.contact')}
                            </Link>
                            <div className="border-t border-pr-border pt-4 flex flex-col gap-2">
                                {user ? (
                                    <Button onClick={() => window.location.href = '/dashboard'} variant="primary" className="w-full">
                                        {t('nav.dashboard')}
                                    </Button>
                                ) : (
                                    <>
                                        <Button onClick={() => window.location.href = '/auth'} variant="ghost" className="w-full">
                                            {t('nav.login')}
                                        </Button>
                                        <Button onClick={() => window.location.href = '/auth'} variant="primary" className="w-full">
                                            {t('nav.getStarted')}
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
