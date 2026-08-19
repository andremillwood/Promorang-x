import { useEffect, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import {
  ArrowRight,
  CheckCircle,
  Play,
  Sparkles,
  Activity,
  Users,
  Target,
  Shield,
  TrendingUp,
  ChevronRight,
  Star,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import CollapsibleSection from '@/react-app/components/CollapsibleSection';
import ExplainerModal, { ExplainerContent } from '@/react-app/components/ExplainerModal';

const businessVerificationExplainer: ExplainerContent = {
  title: 'How Verified Brand Actions Work',
  subtitle: 'We make sure you only pay when real customers take real actions.',
  badge: 'Guaranteed Results',
  steps: [
    {
      number: '1',
      title: 'Pick your campaign package',
      description: 'Choose 100 real people, 750 customer activations, or a custom local venue push.',
      tip: 'Starts at JMD $25,000 with 5-day delivery.'
    },
    {
      number: '2',
      title: 'Real community members complete your task',
      description: 'Local members visit your store, check in, try your product, or post authentic user-generated content.',
    },
    {
      number: '3',
      title: 'Automatic photo & location verification',
      description: 'Our system checks photo receipts, check-in timestamps, and social posts before any payout is released.',
      tip: 'You get full access to a live proof dashboard.'
    },
    {
      number: '4',
      title: 'Receive your UGC content & customers',
      description: 'Keep full rights to all photos, reviews, and customer posts generated during the campaign.',
    }
  ],
  ctaText: 'Launch Campaign Now'
};

export default function Activate() {
  const { isPending, redirectToLogin } = useAuth();
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [activeStats, setActiveStats] = useState({
    earners: 127,
    payout: 0.3,
    earnings: 12
  });

  // Animate stats on load
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStats(prev => ({
        earners: prev.earners + Math.floor(Math.random() * 5),
        payout: prev.payout + (Math.random() * 0.1),
        earnings: prev.earnings + Math.floor(Math.random() * 3)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ExplainerModal
        isOpen={explainerOpen}
        onClose={() => setExplainerOpen(false)}
        content={{
          ...businessVerificationExplainer,
          onCtaClick: () => redirectToLogin()
        }}
      />

      {/* Modern Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png"
                alt="Promorang"
                className="h-8 w-auto transition-transform hover:scale-105"
              />
              <span className="ml-3 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded uppercase tracking-tighter">Business</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#packages" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Packages</a>
              <a href="#outcomes" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">How Verification Works</a>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setExplainerOpen(true)}
                className="hidden sm:inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 gap-1"
              >
                <HelpCircle className="w-4 h-4" />
                How Verification Works
              </button>
              <button
                onClick={() => redirectToLogin()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Launch Campaign
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 lg:py-24 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-8">
               <Sparkles className="w-4 h-4 mr-2" />
               Real Customer Engagement for Local Brands
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Get real people into your business in
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                5 Days — Guaranteed.
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              We connect your business with real community members who visit your venue, try your products, and share verified reviews.
              <span className="font-semibold text-gray-900"> Real actions instead of fake ad clicks.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => redirectToLogin()}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center"
              >
                100 Real People — JMD $25k
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setExplainerOpen(true)}
                className="bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-8 py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-5 h-5 text-blue-600" />
                How Verification Works
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-500">
              <div className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Verified Local Actions</div>
              <div className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Full Content Rights</div>
              <div className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> 5-Day Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* Commercial Offer Stack Section */}
      <section id="packages" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Campaign Package</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Clear pricing upfront. Pay for real customer actions.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Hero Offer */}
            <div className="bg-white rounded-3xl p-10 border-2 border-blue-500 shadow-2xl relative transform scale-105 z-10">
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-6 py-1.5 rounded-bl-3xl rounded-tr-lg text-xs font-black uppercase tracking-widest">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">The Starter Pack</h3>
              <div className="text-4xl font-black text-blue-600 mb-4">JMD $25,000</div>
              <p className="text-gray-600 mb-8 font-semibold">100 Verified People Campaign</p>
              <ul className="space-y-4 mb-10 text-gray-700">
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                   <span>100 Verified customer actions</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                   <span>10–20 Customer photos & posts</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                   <span>Live proof dashboard access</span>
                </li>
              </ul>
              <button onClick={() => redirectToLogin()} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-lg hover:shadow-xl">
                Start Starter Pack
              </button>
            </div>

            {/* Core Offer */}
            <div className="bg-slate-50 rounded-3xl p-10 border border-slate-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Customer Activation</h3>
              <div className="text-4xl font-black text-slate-900 mb-4">JMD $120,000</div>
              <p className="text-gray-600 mb-8 font-semibold">Growth Campaign for Local Venues</p>
              <ul className="space-y-4 mb-10 text-gray-700">
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-slate-400 mr-4 flex-shrink-0" />
                   <span>750 Verified customer actions</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-slate-400 mr-4 flex-shrink-0" />
                   <span>Multi-day store check-in push</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-slate-400 mr-4 flex-shrink-0" />
                   <span>Targeted local audience reach</span>
                </li>
              </ul>
              <button onClick={() => redirectToLogin()} className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-lg transition-all">
                Launch Activation Pack
              </button>
            </div>

            {/* High Ticket */}
            <div className="bg-slate-50 rounded-3xl p-10 border border-slate-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">City Takeover</h3>
              <div className="text-4xl font-black text-slate-900 mb-4">JMD $300,000</div>
              <p className="text-gray-600 mb-8 font-semibold">Full Market Push</p>
              <ul className="space-y-4 mb-10 text-gray-700">
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-slate-400 mr-4 flex-shrink-0" />
                   <span>2,200 Verified customer actions</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-slate-400 mr-4 flex-shrink-0" />
                   <span>Full campaign content library</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-slate-400 mr-4 flex-shrink-0" />
                   <span>Priority creator & venue matching</span>
                </li>
              </ul>
              <button onClick={() => redirectToLogin()} className="w-full border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white py-4 rounded-2xl font-black text-lg transition-all">
                Talk to Strategy Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Outcome Proof Section wrapped in CollapsibleSection */}
      <section id="outcomes" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CollapsibleSection
            badge="Verified Results"
            title="How We Guarantee Real Customer Actions"
            subtitle="Every action taken by community members is verified by photo receipts, check-ins, or social links."
            promptText="Tap to view proof dashboard & verification details"
            defaultOpen={true}
            icon={Shield}
          >
            <div className="flex flex-col lg:flex-row items-center gap-12 pt-4">
              <div className="lg:w-1/2 space-y-6">
                <h3 className="text-3xl font-bold text-gray-900">Real customer actions, verified live</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We bridge digital promotion with real foot traffic. Everyday members visit your store, test your product, or post authentic feedback, and our system confirms it before payment is made.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-3">
                    <div className="bg-blue-100 p-2.5 rounded-xl"><Users className="w-5 h-5 text-blue-600" /></div>
                    <span className="font-bold text-slate-900">In-Store Foot Traffic</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-3">
                    <div className="bg-purple-100 p-2.5 rounded-xl"><Activity className="w-5 h-5 text-purple-600" /></div>
                    <span className="font-bold text-slate-900">Photo Content Bundles</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-3">
                     <div className="bg-green-100 p-2.5 rounded-xl"><Target className="w-5 h-5 text-green-600" /></div>
                     <span className="font-bold text-slate-900">Product Reviews</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-3">
                     <div className="bg-orange-100 p-2.5 rounded-xl"><Sparkles className="w-5 h-5 text-orange-600" /></div>
                     <span className="font-bold text-slate-900">Social Highlights</span>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 w-full">
                 <div className="bg-white p-8 rounded-3xl shadow-xl space-y-6 border border-slate-100">
                    <div>
                      <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Live Proof Dashboard</div>
                      <div className="text-3xl font-bold text-slate-900">12,482 Actions Verified</div>
                      <div className="text-sm text-gray-500 mt-1">Across 85 active local merchant campaigns this month.</div>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 w-3/4 rounded-full"></div>
                    </div>
                    <button onClick={() => redirectToLogin()} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-black text-lg shadow-md hover:shadow-lg transition-all">
                      Start Your Campaign Today
                    </button>
                 </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <img
              src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png"
              alt="Promorang"
              className="h-9 w-auto mx-auto mb-6 opacity-50 grayscale"
            />
            <p className="text-slate-400 text-sm">© Promorang Business Division. Real customer actions for growing local brands.</p>
        </div>
      </footer>
    </div>
  );
}
