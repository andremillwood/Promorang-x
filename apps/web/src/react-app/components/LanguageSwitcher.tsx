import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/react-app/contexts/LanguageProvider';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import type { SupportedLanguage } from '@/lib/i18n';
import { Globe, Check } from 'lucide-react';

export default function LanguageSwitcher() {
    const { t } = useTranslation('common');
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleLanguageChange = (lang: SupportedLanguage) => {
        setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pr-surface-card border border-pr-border hover:bg-pr-surface-2 transition-colors"
                aria-label={t('language.select')}
            >
                <Globe className="w-4 h-4 text-pr-text-2" />
                <span className="text-sm font-medium text-pr-text-1">
                    {SUPPORTED_LANGUAGES[language]}
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-pr-surface-card border border-pr-border rounded-lg shadow-xl py-2 z-50 max-h-96 overflow-y-auto">
                    <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-pr-text-2 border-b border-pr-border">
                        {t('language.select')}
                    </div>
                    {(Object.entries(SUPPORTED_LANGUAGES) as [SupportedLanguage, string][]).map(([code, name]) => (
                        <button
                            key={code}
                            onClick={() => handleLanguageChange(code)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${language === code
                                ? 'bg-pr-surface-2 text-pr-text-1'
                                : 'text-pr-text-2 hover:bg-pr-surface-2 hover:text-pr-text-1'
                                }`}
                        >
                            <span>{name}</span>
                            {language === code && <Check className="w-4 h-4 text-green-500" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
