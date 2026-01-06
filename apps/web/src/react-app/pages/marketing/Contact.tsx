import { useTranslation } from 'react-i18next';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Contact() {
    const { t } = useTranslation('marketing');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(t('contact.form.successMessage'));
    };

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            {/* Hero */}
            <section className="relative py-20 bg-pr-surface-background overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        {t('contact.hero.headline').split('<highlight>')[0]}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                            {t('contact.hero.headline').split('<highlight>')[1]?.split('</highlight>')[0]}
                        </span>
                        {t('contact.hero.headline').split('</highlight>')[1]}
                    </h1>
                    <p className="text-xl text-pr-text-2 max-w-2xl mx-auto">
                        {t('contact.hero.subheadline')}
                    </p>
                </div>
            </section>

            <section className="py-12 bg-pr-surface-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
                        {/* Contact Info */}
                        <div>
                            <h2 className="text-2xl font-bold text-pr-text-1 mb-6">{t('contact.info.title')}</h2>
                            <p className="text-pr-text-2 mb-8 leading-relaxed">
                                {t('contact.info.description')}
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-500">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-pr-text-1">{t('contact.info.email')}</div>
                                        <a href="mailto:hello@promorang.com" className="text-pr-text-2 hover:text-blue-500 transition-colors">hello@promorang.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 text-purple-500">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-pr-text-1">{t('contact.info.support')}</div>
                                        <a href="mailto:support@promorang.com" className="text-pr-text-2 hover:text-purple-500 transition-colors">support@promorang.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 text-green-500">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-pr-text-1">{t('contact.info.headquarters')}</div>
                                        <p className="text-pr-text-2">{t('contact.info.location')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 shadow-lg">
                            <h2 className="text-2xl font-bold text-pr-text-1 mb-6">{t('contact.form.title')}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-pr-text-1 mb-1">{t('contact.form.firstName')}</label>
                                        <Input id="firstName" placeholder={t('contact.form.firstNamePlaceholder')} required />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-pr-text-1 mb-1">{t('contact.form.lastName')}</label>
                                        <Input id="lastName" placeholder={t('contact.form.lastNamePlaceholder')} required />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-pr-text-1 mb-1">{t('contact.form.email')}</label>
                                    <Input id="email" type="email" placeholder={t('contact.form.emailPlaceholder')} required />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-pr-text-1 mb-1">{t('contact.form.subject')}</label>
                                    <select className="w-full px-3 py-2 bg-pr-surface-background border border-pr-border rounded-md text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>{t('contact.form.subjectOptions.general')}</option>
                                        <option>{t('contact.form.subjectOptions.partnership')}</option>
                                        <option>{t('contact.form.subjectOptions.support')}</option>
                                        <option>{t('contact.form.subjectOptions.press')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-pr-text-1 mb-1">{t('contact.form.message')}</label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        className="w-full px-3 py-2 bg-pr-surface-background border border-pr-border rounded-md text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={t('contact.form.messagePlaceholder')}
                                        required
                                    ></textarea>
                                </div>

                                <Button type="submit" variant="primary" className="w-full gap-2 btn-shine">
                                    {t('contact.form.submit')} <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </div>
    );
}
