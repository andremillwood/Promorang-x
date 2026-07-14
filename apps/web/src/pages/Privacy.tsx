import SEO from "@/components/SEO";

const PrivacyPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <SEO title="Privacy Policy | Promorang" description="How we handle your data and protect your privacy." />
            <main className="pt-24 pb-20 px-6">
                <div className="container max-w-3xl mx-auto prose dark:prose-invert">
                    <h1 className="font-serif">Privacy Policy</h1>
                    <p className="text-muted-foreground italic">Last updated: July 14, 2026</p>

                    <h2>1. Information We Collect</h2>
                    <p>We collect information you provide directly to us, including name, email, profile data, support requests, content and proof photos. We also process participation, transaction, device, notification-token, and approximate or user-provided location information when needed to operate and verify Moments.</p>

                    <h2>2. How We Use Information</h2>
                    <p>We use information to authenticate accounts, operate and secure the platform, facilitate eligible payments and payouts, verify activation completion, moderate user-generated content, prevent fraud, send requested notifications, and personalize discovery.</p>

                    <h2>3. Data Sharing</h2>
                    <p>We share limited information with brands, hosts, creators, and merchants involved in Moments you join, and with service providers that help us operate Promorang, including Supabase for authentication and data infrastructure, Stripe for eligible payments, Google and Apple for authentication, Expo for mobile delivery and notifications, and communications providers. We do not sell personal data.</p>

                    <h2>4. Security</h2>
                    <p>We implement industry-standard security measures to protect your data, though no method of transmission over the internet is 100% secure.</p>

                    <h2>5. Your Rights</h2>
                    <p>You may access or correct profile information through account settings. You may initiate deletion in the mobile app or through our <a href="/account-deletion">account deletion page</a>. Shared user-generated content is included unless retention is legally required.</p>

                    <h2>6. Retention</h2>
                    <p>We retain personal data only for as long as needed for the purposes described here. Some transaction, payout, tax, fraud-prevention, dispute, and regulatory records may be retained after account deletion where required by law or necessary to protect the platform and its users.</p>

                    <h2>7. Contact</h2>
                    <p>Questions and privacy requests can be sent to <a href="mailto:support@promorang.co">support@promorang.co</a>.</p>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPage;
