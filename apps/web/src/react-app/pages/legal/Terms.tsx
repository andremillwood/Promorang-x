import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';

export default function Terms() {
  return (
    <div className="min-h-screen bg-pr-surface-background">
      <MarketingNav />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-pr-text-1 mb-4">Terms and Conditions</h1>
        <p className="text-pr-text-2 mb-8">Last Updated: November 22, 2025</p>

        <div className="prose prose-lg max-w-none text-pr-text-2">
          <h3>1. Introduction</h3>
          <p>
            Welcome to Promorang. By accessing our website and using our services, you agree to be bound by the following terms and conditions.
          </p>

          <h3>2. User Accounts</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </p>

          <h3>3. Platform Usage</h3>
          <p>
            Promorang connects creators, advertisers, and merchants. You agree to use the platform for lawful purposes only. You must not use the platform to solicit performance of any illegal activity or other activity which infringes the rights of others.
          </p>

          <h3>4. Subscriptions and Payments</h3>
          <p>
            Subscriptions are billed in advance on a monthly basis. All payments are non-refundable except as expressly set forth in our Refund Policy. We reserve the right to change our subscription plans or adjust pricing for our service or any components thereof in any manner and at any time as we may determine in our sole and absolute discretion.
          </p>

          <h3>5. Content and Conduct</h3>
          <p>
            Users retain ownership of the content they post but grant Promorang a license to use, store, and display that content. We have the right to remove any content that violates these Terms or is otherwise objectionable.
          </p>

          <h3>6. Termination</h3>
          <p>
            We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h3>7. Limitation of Liability</h3>
          <p>
            In no event shall Promorang, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.
          </p>

          <h3>8. Changes to Terms</h3>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
          </p>

          <h3>9. Contact Us</h3>
          <p>
            If you have any questions about these Terms, please contact us at support@promorang.com.
          </p>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
