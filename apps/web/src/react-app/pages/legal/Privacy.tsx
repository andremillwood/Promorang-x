import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-pr-surface-background">
      <MarketingNav />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-pr-text-1 mb-4">Privacy Policy</h1>
        <p className="text-pr-text-2 mb-8">Last Updated: November 22, 2025</p>

        <div className="prose prose-lg max-w-none text-pr-text-2">
          <h3>1. Information We Collect</h3>
          <p>
            We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include your name, email address, payment information, and social media handles.
          </p>

          <h3>2. How We Use Your Information</h3>
          <p>
            We use the information we collect to provide, maintain, and improve our services, to process your transactions, to communicate with you, and to monitor and analyze trends and usage.
          </p>

          <h3>3. Information Sharing</h3>
          <p>
            We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf. We may also share information if we believe disclosure is in accordance with any applicable law, regulation, or legal process.
          </p>

          <h3>4. Data Security</h3>
          <p>
            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
          </p>

          <h3>5. Your Rights</h3>
          <p>
            You have the right to access, correct, or delete your personal information. You may also have the right to restrict or object to certain processing of your data.
          </p>

          <h3>6. Cookies</h3>
          <p>
            We use cookies and similar technologies to collect information about your activity, browser, and device. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>

          <h3>7. Changes to Privacy Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </p>

          <h3>8. Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@promorang.com.
          </p>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
