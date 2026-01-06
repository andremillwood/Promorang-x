import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PersonaHeroProps {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaLink: string;
    stats?: Array<{ value: string; label: string }>;
    backgroundGradient?: string;
    icon?: ReactNode;
}

export default function PersonaHero({
    headline,
    subheadline,
    ctaText,
    ctaLink,
    stats,
    backgroundGradient = 'from-blue-600/20 to-purple-600/20',
    icon,
}: PersonaHeroProps) {
    return (
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-pr-surface-background">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                <div className={`absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br ${backgroundGradient} rounded-full blur-[120px] animate-pulse`} />
                <div className={`absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br ${backgroundGradient} rounded-full blur-[120px] animate-pulse delay-1000`} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
                {/* Icon */}
                {icon && (
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-pr-surface-card/80 backdrop-blur-md border border-pr-border mb-8 animate-fade-in-up">
                        {icon}
                    </div>
                )}

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                    {headline}
                </h1>

                {/* Subheadline */}
                <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10 leading-relaxed">
                    {subheadline}
                </p>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                    <Button
                        onClick={() => window.location.href = ctaLink}
                        variant="primary"
                        size="lg"
                        className="text-lg px-12 py-6 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-1 transition-all"
                        rightIcon={<ArrowRight className="w-6 h-6" />}
                    >
                        {ctaText}
                    </Button>
                </div>

                {/* Stats */}
                {stats && stats.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16">
                        {stats.map((stat, index) => (
                            <div key={index} className="p-6">
                                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-bold uppercase tracking-widest text-pr-text-2">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
