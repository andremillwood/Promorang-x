import SEO from "@/components/SEO";
import { useI18n } from "@/i18n/I18nContext";
import { privacyContent } from "@/i18n/legal-content";

export default function PrivacyPage() {
  const { locale } = useI18n();
  const document = privacyContent[locale];
  return <div className="min-h-screen bg-background">
    <SEO title={`${document.title} | Promorang`} description={document.seo} />
    <main className="px-6 pb-20 pt-24"><div className="container mx-auto max-w-3xl prose dark:prose-invert">
      <h1 className="font-serif">{document.title}</h1><p className="text-muted-foreground italic">{document.updated}</p>
      {document.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
    </div></main>
  </div>;
}
