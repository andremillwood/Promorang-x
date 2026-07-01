import SEO from "@/components/SEO";

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <SEO title="Terms of Service | Promorang" description="Our terms and conditions for using the Promorang platform." />
            <main className="pt-24 pb-20 px-6">
                <div className="container max-w-3xl mx-auto prose dark:prose-invert">
                    <h1 className="font-serif">Terms of Service</h1>
                    <p className="text-muted-foreground italic">Last updated: July 1, 2026</p>

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

                    <h2>6. Pioneer Points</h2>
                    <p>Pioneer Points are a non-cash record of eligible, verified contribution during a defined Promorang season. Eligible contribution may include meaningful platform activity, original content, hosting or facilitating completed Moments, verified venue participation, qualified referrals, and community support.</p>
                    <p>Pioneer Points cannot be purchased, sold, transferred, withdrawn, or exchanged. They are not money, Gems, equity, securities, cryptocurrency, ownership in Promorang, or a promise of payment. Point totals may remain pending while activity is verified and may be rejected or reversed for duplicate identities, self-referrals, bots, coordinated manipulation, cancelled activity, inaccurate proof, or other abuse.</p>
                    <p>If Promorang later establishes a funded reward pool, Promorang will publish the applicable pool amount, eligibility rules, snapshot date, calculation method, verification requirements, minimum distribution, payment timing, and appeal process. Unless and until those terms are published and a pool is funded, Pioneer Points have no cash value and do not guarantee participation in a future distribution.</p>

                    <h2>7. Program Changes</h2>
                    <p>Promorang may pause or amend prospective earning rules to protect program integrity. A season snapshot preserves the records and rules applicable to that snapshot, subject to verification, fraud review, legal requirements, and corrections of technical errors.</p>
                </div>
            </main>
        </div>
    );
};

export default TermsPage;
