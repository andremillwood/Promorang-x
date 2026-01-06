import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface CTASectionProps {
    headline: string;
    subheadline?: string;
    ctaText: string;
    ctaLink: string;
    secondaryCta?: {
        text: string;
        link: string;
    };
    backgroundStyle?: 'gradient' | 'solid' | 'subtle';
}

export default function CTASection({
    headline,
    subheadline,
    ctaText,
    ctaLink,
    secondaryCta,
    backgroundStyle = 'subtle',
}: CTASectionProps) {
    const getBackgroundClass = () => {
        switch (backgroundStyle) {
            case 'gradient':
                return 'bg-gradient-to-r from-blue-600 to-purple-600';
            case 'solid':
                return 'bg-pr-surface-1';
            case 'subtle':
            default:
                return 'bg-pr-surface-background relative overflow-hidden';
        }
    };

    return (
        <section className={`py-24 ${getBackgroundClass()}`}>
            {backgroundStyle === 'subtle' && (
                <div className="absolute inset-0 bg-blue-600/5" />
            )}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <h2 className={`text-4xl md:text-6xl font-bold mb-8 ${backgroundStyle === 'gradient' ? 'text-white' : 'text-pr-text-1'}`}>
                    {headline}
                </h2>
                {subheadline && (
                    <p className={`text-xl mb-10 max-w-2xl mx-auto ${backgroundStyle === 'gradient' ? 'text-white/90' : 'text-pr-text-2'}`}>
                        {subheadline}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        onClick={() => window.location.href = ctaLink}
                        variant={backgroundStyle === 'gradient' ? 'secondary' : 'primary'}
                        size="lg"
                        className={`text-xl px-16 py-6 shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 transform hover:-translate-y-1 transition-all w-full sm:w-auto ${backgroundStyle === 'gradient' ? 'text-white' : ''}`}
                    >
                        {ctaText}
                    </Button>
                    {secondaryCta && (
                        <Button
                            onClick={() => window.location.href = secondaryCta.link}
                            variant="ghost"
                            size="lg"
                            className={`text-xl px-16 py-6 w-full sm:w-auto ${backgroundStyle === 'gradient' ? 'text-white hover:bg-white/10' : ''}`}
                        >
                            {secondaryCta.text}
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}
