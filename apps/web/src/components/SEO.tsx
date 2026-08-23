import { Helmet } from 'react-helmet-async';
import { useI18n } from '@/i18n/I18nContext';
import { localizePath } from '@/i18n/locale-routing';
import type { Locale } from '@/i18n/translations';

interface SEOProps {
    title: string;
    description: string;
    name?: string;
    type?: string;
    image?: string;
    url?: string;
    schema?: Record<string, any>;
    noindex?: boolean;
}

export default function SEO({
    title,
    description,
    name = 'Promorang',
    type = 'website',
    image,
    url,
    schema,
    noindex = false,
}: SEOProps) {
    const { locale } = useI18n();
    const siteTitle = title === 'Promorang' ? title : `${title} | Promorang`;
    const sourceUrl = url || (typeof window !== 'undefined' ? window.location.href : undefined);
    const parsedUrl = sourceUrl ? new URL(sourceUrl) : null;
    const localizedUrl = parsedUrl
        ? `${parsedUrl.origin}${localizePath(parsedUrl.pathname, locale)}`
        : undefined;
    const alternateUrl = (targetLocale: Locale) => parsedUrl
        ? `${parsedUrl.origin}${localizePath(parsedUrl.pathname, targetLocale)}`
        : undefined;
    const openGraphLocales: Record<Locale, string> = { en: 'en_US', 'es-419': 'es_419', 'pt-BR': 'pt_BR' };

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{siteTitle}</title>
            <meta name='description' content={description} />
            <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
            <meta property="og:site_name" content={name} />
            {localizedUrl && <link rel="canonical" href={localizedUrl} />}
            {alternateUrl('en') && <link rel="alternate" hrefLang="x-default" href={alternateUrl('en')} />}
            {alternateUrl('en') && <link rel="alternate" hrefLang="en" href={alternateUrl('en')} />}
            {alternateUrl('es-419') && <link rel="alternate" hrefLang="es-419" href={alternateUrl('es-419')} />}
            {alternateUrl('pt-BR') && <link rel="alternate" hrefLang="pt-BR" href={alternateUrl('pt-BR')} />}

            {/* Open Graph tags */}
            <meta property="og:type" content={type} />
            <meta property="og:locale" content={openGraphLocales[locale]} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {image && <meta property="og:image" content={image} />}
            {localizedUrl && <meta property="og:url" content={localizedUrl} />}

            {/* Twitter tags */}
            <meta name="twitter:site" content="@promorang" />
            <meta name="twitter:creator" content="@promorang" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}

            {/* Structured Data (JSON-LD) */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}

            {/* @ts-expect-error: Helmet type mismatch with React 18 */}
        </Helmet>
    );
}
