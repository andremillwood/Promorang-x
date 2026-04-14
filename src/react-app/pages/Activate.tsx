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
  Star
} from 'lucide-react';

export default function Activate() {
  const { isPending, redirectToLogin } = useAuth();
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
              <a href="#outcomes" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Outcomes</a>
            </div>
            <div className="flex items-center space-x-4">
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
               New Commercial Scaling Layer
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Get real people to interact with your brand in 
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                5 Days — Guaranteed.
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              We drive hundreds of real customer actions and authentic content around your brand. 
              <span className="font-semibold text-gray-900"> High-density attention on demand.</span>
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
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-500">
              <div className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Verified Local Actions</div>
              <div className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> UGC Content Rights</div>
              <div className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> 5-Day Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* Commercial Offer Stack Section */}
      <section id="packages" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Commercial Offer Stack</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Skip the complexity. Buy the outcome.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Hero Offer */}
            <div className="bg-white rounded-3xl p-10 border-2 border-blue-500 shadow-2xl relative transform scale-105 z-10">
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-6 py-1.5 rounded-bl-3xl rounded-tr-lg text-xs font-black uppercase tracking-widest">
                Entry Point
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">The Hero Bundle</h3>
              <div className="text-4xl font-black text-blue-600 mb-4">JMD $25,000</div>
              <p className="text-gray-600 mb-8 font-semibold">100 Real People Campaign</p>
              <ul className="space-y-4 mb-10 text-gray-700">
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                   <span>100 Verified human engagements</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                   <span>10–20 UGC pieces (optional)</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                   <span>Full proof dashboard access</span>
                </li>
              </ul>
              <button onClick={() => redirectToLogin()} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-lg hover:shadow-xl">
                Start Hero Campaign
              </button>
            </div>

            {/* Core Offer */}
            <div className="bg-slate-50 rounded-3xl p-10 border border-slate-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Customer Activation</h3>
              <div className="text-4xl font-black text-slate-900 mb-4">JMD $120,000</div>
              <p className="text-gray-600 mb-8 font-semibold">Repeatable Growth Engine</p>
              <ul className="space-y-4 mb-10 text-gray-700">
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-slate-400 mr-4 flex-shrink-0" />
                   <span>500–1,000 Verified actions</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-slate-400 mr-4 flex-shrink-0" />
                   <span>Multi-day venue activation</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-slate-400 mr-4 flex-shrink-0" />
                   <span>Advanced audience targeting</span>
                </li>
              </ul>
              <button onClick={() => redirectToLogin()} className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-lg transition-all">
                Enable Activation Engine
              </button>
            </div>

            {/* High Ticket */}
            <div className="bg-slate-50 rounded-3xl p-10 border border-slate-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Always-On Attention</h3>
              <div className="text-4xl font-black text-slate-900 mb-4">JMD $350K+</div>
              <p className="text-gray-600 mb-8 font-semibold">Strategic Scaling</p>
              <ul className="space-y-4 mb-10 text-gray-700">
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-slate-400 mr-4 flex-shrink-0" />
                   <span>Recurring weekly activations</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-slate-400 mr-4 flex-shrink-0" />
                   <span>Strategic account manager</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-slate-400 mr-4 flex-shrink-0" />
                   <span>Priority creator matching</span>
                </li>
              </ul>
              <button onClick={() => redirectToLogin()} className="w-full border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white py-4 rounded-2xl font-black text-lg transition-all">
                Talk to Strategy Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Outcome Proof Section */}
      <section id="outcomes" className="py-24 bg-slate-50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Marketing Outcomes — Verified In-App.</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We bridge the gap between digital content and physical business results. Every action taken is verified by our AI-engine via OCR receipts or geofenced activity.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-xl"><Users className="w-6 h-6 text-blue-600" /></div>
                  <span className="font-bold">Foot Traffic</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                  <div className="bg-purple-100 p-3 rounded-xl"><Activity className="w-6 h-6 text-purple-600" /></div>
                  <span className="font-bold">UGC Bundles</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                   <div className="bg-green-100 p-3 rounded-xl"><Target className="w-6 h-6 text-green-600" /></div>
                   <span className="font-bold">Product Trials</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                   <div className="bg-orange-100 p-3 rounded-xl"><Sparkles className="w-6 h-6 text-orange-600" /></div>
                   <span className="font-bold">Social Blitz</span>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
               <div className="bg-white p-10 rounded-3xl shadow-2xl space-y-8">
                  <div>
                    <div className="text-sm font-black text-blue-600 uppercase mb-2">Live Proof</div>
                    <div className="text-3xl font-bold">12,482 Actions</div>
                    <div className="text-gray-500">Verified this month across 85 active brands.</div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-3/4 rounded-full"></div>
                  </div>
                  <button onClick={() => redirectToLogin()} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 rounded-2xl font-black text-xl shadow-lg hover:shadow-2xl transition-all">
                    Secure Your Reach Today
                  </button>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <img 
              src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png"
              alt="Promorang"
              className="h-10 w-auto mx-auto mb-8 opacity-50 grayscale"
            />
            <p className="text-slate-400 text-sm">© 2024 Promorang Campaigns Division. Outcome-focused marketing for the modern era.</p>
        </div>
      </footer>
    </div>
  );
}
