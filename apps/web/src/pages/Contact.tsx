import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { trackMetaEvent } from "@/components/MetaPixel";
import { useI18n } from "@/i18n/I18nContext";

const ContactPage = () => {
    const { t } = useI18n();
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        topic: "general",
        subject: "",
        message: "",
    });

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const apiBase = import.meta.env.VITE_API_URL || "https://api.promorang.co";
            const response = await fetch(`${apiBase}/api/email/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    topic: formData.topic,
                    subject: formData.subject,
                    message: formData.message,
                }),
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok || payload.success === false) {
                throw new Error(payload.error || t("contact.failed"));
            }

            trackMetaEvent("Lead", {
                content_name: "Contact form",
                lead_type: formData.topic,
            });
            setSubmitted(true);
        } catch (sendError) {
            setError(sendError instanceof Error ? sendError.message : t("contact.failed"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title={t("contact.title")}
                description={t("contact.copy")}
            />

            <main className="pt-24 pb-20 px-6">
                <div className="container max-w-6xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{t("contact.title")}</h1>
                        <p className="text-lg text-muted-foreground">
                            {t("contact.copy")}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="grid gap-6">
                                <div className="flex gap-4 p-6 bg-card border border-border rounded-2xl">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{t("contact.emailUs")}</h3>
                                        <p className="text-muted-foreground mb-2">For general inquiries and support.</p>
                                        <a href="mailto:support@promorang.co" className="text-primary font-semibold hover:underline">
                                            support@promorang.co
                                        </a>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-6 bg-card border border-border rounded-2xl">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{t("contact.chat")}</h3>
                                        <p className="text-muted-foreground mb-2">Use a structured support ticket if you need account-specific follow-up.</p>
                                        <Link to="/support/tickets" className="text-primary font-semibold hover:underline">
                                            Open support tickets
                                        </Link>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-6 bg-card border border-border rounded-2xl">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{t("contact.partnerships")}</h3>
                                        <p className="text-muted-foreground">
                                            Brands, venues, communities, and agencies can use the same form for partnership requests.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-gradient-primary rounded-3xl text-white">
                                <h3 className="text-2xl font-bold mb-4">{t("contact.community")}</h3>
                                <p className="opacity-90 mb-6">
                                    Follow us on social media for the latest updates and featured moments.
                                </p>
                                <div className="flex gap-4">
                                    {/* Social links placeholder */}
                                    <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">T</div>
                                    <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">I</div>
                                    <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">L</div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div id="contact-form" className="bg-card border border-border rounded-3xl p-8 md:p-10 scroll-mt-24">
                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">{t("contact.sent")}</h3>
                                    <p className="text-muted-foreground mb-8">
                                        {t("contact.sentCopy")}
                                    </p>
                                    <Button variant="outline" onClick={() => setSubmitted(false)}>
                                        {t("contact.another")}
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                            {error}
                                        </div>
                                    )}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="first-name" className="text-sm font-semibold">{t("contact.firstName")}</label>
                                            <Input
                                                id="first-name"
                                                value={formData.firstName}
                                                onChange={(event) => handleChange("firstName", event.target.value)}
                                                placeholder="Jane"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="last-name" className="text-sm font-semibold">{t("contact.lastName")}</label>
                                            <Input
                                                id="last-name"
                                                value={formData.lastName}
                                                onChange={(event) => handleChange("lastName", event.target.value)}
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="contact-email" className="text-sm font-semibold">{t("contact.email")}</label>
                                        <Input
                                            id="contact-email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(event) => handleChange("email", event.target.value)}
                                            placeholder="jane@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="topic" className="text-sm font-semibold">{t("contact.topic")}</label>
                                        <select
                                            id="topic"
                                            value={formData.topic}
                                            onChange={(event) => handleChange("topic", event.target.value)}
                                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="general">General question</option>
                                            <option value="support">Account support</option>
                                            <option value="partnership">Partnership</option>
                                            <option value="billing">Billing or payouts</option>
                                            <option value="safety">Trust and safety</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-semibold">{t("contact.subject")}</label>
                                        <Input
                                            id="subject"
                                            value={formData.subject}
                                            onChange={(event) => handleChange("subject", event.target.value)}
                                            placeholder="How can we help?"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-semibold">{t("contact.message")}</label>
                                        <Textarea
                                            id="message"
                                            value={formData.message}
                                            onChange={(event) => handleChange("message", event.target.value)}
                                            placeholder="Tell us more about what you're looking for..."
                                            className="min-h-[150px]"
                                            required
                                        />
                                    </div>
                                    <Button type="submit" variant="hero" className="w-full h-12" disabled={isSubmitting}>
                                        <Send className="w-4 h-4 mr-2" />
                                        {isSubmitting ? t("contact.sending") : t("contact.send")}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactPage;
