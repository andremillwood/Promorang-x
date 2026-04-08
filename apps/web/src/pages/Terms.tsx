import SEO from "@/components/SEO";

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <SEO title="Terms of Service | Promorang" description="Our terms and conditions for using the Promorang platform." />
            <main className="pt-24 pb-20 px-6">
                <div className="container max-w-3xl mx-auto prose dark:prose-invert">
                    <h1 className="font-serif">Terms of Service</h1>
                    <p className="text-muted-foreground italic">Last updated: February 3, 2026</p>

                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing and using Promorang, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

                    <h2>2. Description of Service</h2>
                    <p>Promorang provides a platform connecting brands, merchants, and community hosts for the creation of brand-funded activations ("Moments").</p>

                    <h2>3. User Accounts</h2>
                    <p>Users must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials.</p>

                    <h2>4. Bounties and Payments</h2>
                    <p>Bounties are paid out upon successful verification of the required activation proof. Promorang reserves the right to withhold payments if proof is found to be fraudulent or non-compliant.</p>

                    <h2>5. Conduct</h2>
                    <p>Users must behave professionally and respectfully in person and on the platform. Harassment or unsafe behavior during Moments will result in immediate termination of account access.</p>
                </div>
            </main>
        </div>
    );
};

export default TermsPage;
