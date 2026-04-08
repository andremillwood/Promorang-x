import SEO from "@/components/SEO";

const PrivacyPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <SEO title="Privacy Policy | Promorang" description="How we handle your data and protect your privacy." />
            <main className="pt-24 pb-20 px-6">
                <div className="container max-w-3xl mx-auto prose dark:prose-invert">
                    <h1 className="font-serif">Privacy Policy</h1>
                    <p className="text-muted-foreground italic">Last updated: February 3, 2026</p>

                    <h2>1. Information We Collect</h2>
                    <p>We collect information you provide directly to us (name, email, profile data) and information about your participation in Moments, including location data when necessary for verification.</p>

                    <h2>2. How We Use Information</h2>
                    <p>We use your information to operate the platform, facilitate payments, verify activation completion, and personalize your experience.</p>

                    <h2>3. Data Sharing</h2>
                    <p>We share limited data with brands and merchants involved in the Moments you participate in (e.g., proof of activation). We do not sell your personal data to third parties.</p>

                    <h2>4. Security</h2>
                    <p>We implement industry-standard security measures to protect your data, though no method of transmission over the internet is 100% secure.</p>

                    <h2>5. Your Rights</h2>
                    <p>You have the right to access, correct, or delete your personal information at any time through your account settings or by contacting support.</p>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPage;
