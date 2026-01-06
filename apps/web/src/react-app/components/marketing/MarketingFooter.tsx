import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MarketingFooter() {
    const { t } = useTranslation('common');
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-pr-surface-1 border-t border-pr-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    {/* Product */}
                    <div>
                        <h3 className="text-sm font-bold text-pr-text-1 mb-4">{t('footer.platform')}</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/how-it-works" className="text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors">
                                    {t('nav.howItWorks')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors">
                                    {t('nav.pricing')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors">
                                    {t('nav.about')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/promo-points" className="text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors">
                                    {t('nav.promoPoints')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Solutions */}
                    <div>
                        <h3 className="text-sm font-bold text-pr-text-1 mb-4">{t('nav.solutions')}</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/for-creators" className="text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors">
                                    {t('nav.forCreators')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/for-investors" className="text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors">
                                    {t('nav.forInvestors')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/for-advertisers" className="text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors">
                                    {t('nav.forAdvertisers')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/for-merchants" className="text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors">
                                    {t('nav.forMerchants')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-sm font-bold text-pr-text-1 mb-4">{t('footer.company')}</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/contact" className="text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors">
                                    {t('nav.contact')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/join-team" className="text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors">
                                    {t('nav.joinTeam')}
                                </Link>
                            </li>
                            <li>
                                <a href="https://blog.promorang.com" target="_blank" rel="noopener noreferrer" className="text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors">
                                    {t('nav.blog')}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-bold text-pr-text-1 mb-4">{t('footer.legal')}</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/terms" className="text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors">
                                    {t('nav.terms')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors">
                                    {t('nav.privacy')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/cookies" className="text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors">
                                    {t('nav.cookies')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-8 border-t border-pr-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <img
                            src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png"
                            alt="Promorang"
                            className="h-6 w-auto opacity-70"
                        />
                    </div>

                    <p className="text-sm text-pr-text-2">
                        © {currentYear} Promorang. {t('footer.tagline')}
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center gap-4">
                        <a
                            href="https://twitter.com/promorang"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pr-text-2 hover:text-pr-text-1 transition-colors"
                        >
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a
                            href="https://linkedin.com/company/promorang"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pr-text-2 hover:text-pr-text-1 transition-colors"
                        >
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a
                            href="https://instagram.com/promorang"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pr-text-2 hover:text-pr-text-1 transition-colors"
                        >
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a
                            href="https://youtube.com/@promorang"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pr-text-2 hover:text-pr-text-1 transition-colors"
                        >
                            <Youtube className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
