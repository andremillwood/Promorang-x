import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    name?: string;
    type?: string;
    image?: string;
    url?: string;
    schema?: Record<string, any>;
}

export default function SEO({
    title,
    description,
    name = 'Promorang',
    type = 'website',
    image,
    url,
    schema
}: SEOProps) {
    const siteTitle = title === 'Promorang' ? title : `${title} | Promorang`;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{siteTitle}</title>
            <meta name='description' content={description} />

            {/* Open Graph tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {image && <meta property="og:image" content={image} />}
            {url && <meta property="og:url" content={url} />}

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
