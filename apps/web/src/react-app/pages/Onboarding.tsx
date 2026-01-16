import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Rocket,
    CheckCircle,
    ArrowRight,
    Sparkles,
    Zap,
    Gift
} from 'lucide-react';

export default function Onboarding() {
    // const { user } = useAuth(); // Not needed for display logic
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const totalSteps = 3;

    const interests = [
        { id: 'fashion', label: 'Fashion & Style', icon: '👗' },
        { id: 'tech', label: 'Tech & Gadgets', icon: '📱' },
        { id: 'beauty', label: 'Beauty & Wellness', icon: '💅' },
        { id: 'gaming', label: 'Gaming', icon: '🎮' },
        { id: 'fitness', label: 'Health & Fitness', icon: '💪' },
        { id: 'food', label: 'Food & Dining', icon: '🍔' },
        { id: 'travel', label: 'Travel & Lifestyle', icon: '✈️' },
        { id: 'crypto', label: 'Crypto & Web3', icon: '💎' }
    ];

    const handleInterestToggle = (id: string) => {
        if (selectedInterests.includes(id)) {
            setSelectedInterests(prev => prev.filter(i => i !== id));
        } else {
            setSelectedInterests(prev => [...prev, id]);
        }
    };

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            // Claim welcome bonus
            await fetch('/api/bonuses/claim-welcome', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            await fetch('/api/users/onboarding/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            setTimeout(() => {
                setLoading(false);
                navigate('/dashboard');
            }, 1000);
        } catch (error) {
            console.error('Failed to complete onboarding', error);
            setLoading(false);
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-1 flex flex-col">
            {/* Progress Bar */}
            <div className="w-full h-2 bg-pr-surface-2">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-500 ease-out"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                />
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-4xl w-full bg-pr-surface-card rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-pr-surface-3">

                    {/* Left Side - Visual & Info */}
                    <div className="md:w-5/12 bg-gradient-to-br from-slate-900 to-black p-10 text-white flex flex-col justify-between relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500 rounded-full mix-blend-screen filter blur-3xl opacity-60 animate-blob"></div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full mix-blend-screen filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
                            <div className="absolute -bottom-8 left-20 w-64 h-64 bg-yellow-500 rounded-full mix-blend-screen filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="bg-white/10 backdrop-blur-md w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                <Rocket className="w-6 h-6 text-orange-400" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">
                                {step === 1 && "Welcome to Promorang!"}
                                {step === 2 && "Tailor Your Experience"}
                                {step === 3 && "You're All Set!"}
                            </h2>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                {step === 1 && "Start your journey to becoming a top creator. Earn rewards, influence brands, and grow your following."}
                                {step === 2 && "Select the topics you're passionate about so we can show you the most relevant campaigns and content."}
                                {step === 3 && "We've unlocked some special welcome rewards just for you. Let's get started!"}
                            </p>
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center space-x-3 text-sm font-medium text-slate-300">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-orange-500 bg-orange-500/20 text-orange-400' : 'border-slate-600'}`}>1</div>
                                <span className={step >= 1 ? 'text-white' : ''}>Welcome</span>
                            </div>
                            <div className="w-0.5 h-4 bg-slate-700 ml-4"></div>
                            <div className="flex items-center space-x-3 text-sm font-medium text-slate-300">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-orange-500 bg-orange-500/20 text-orange-400' : 'border-slate-600'}`}>2</div>
                                <span className={step >= 2 ? 'text-white' : ''}>Interests</span>
                            </div>
                            <div className="w-0.5 h-4 bg-slate-700 ml-4"></div>
                            <div className="flex items-center space-x-3 text-sm font-medium text-slate-300">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-orange-500 bg-orange-500/20 text-orange-400' : 'border-slate-600'}`}>3</div>
                                <span className={step >= 3 ? 'text-white' : ''}>Rewards</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Interactive Content */}
                    <div className="md:w-7/12 p-10 flex flex-col bg-pr-surface-card">
                        <div className="flex-1 flex flex-col justify-center">
                            {step === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div className="text-center md:text-left">
                                        <h3 className="text-2xl font-bold text-pr-text-1 mb-2">Let's get you set up</h3>
                                        <p className="text-pr-text-2">Just a few quick questions to personalize your dashboard.</p>
                                    </div>

                                    <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 dark:bg-orange-900/10 dark:border-orange-900/20">
                                        <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center">
                                            <Zap className="w-5 h-5 mr-2 text-orange-600" />
                                            Instant Benefits Unlocked
                                        </h4>
                                        <ul className="space-y-3">
                                            <li className="flex items-center text-pr-text-2">
                                                <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                                                <span>Access to exclusive campaigns</span>
                                            </li>
                                            <li className="flex items-center text-pr-text-2">
                                                <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                                                <span>50% OFF Welcome Coupon</span>
                                            </li>
                                            <li className="flex items-center text-pr-text-2">
                                                <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                                                <span>Daily reward streak started</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleNext}
                                            className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center group"
                                        >
                                            Get Started
                                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div>
                                        <h3 className="text-2xl font-bold text-pr-text-1 mb-2">What are you into?</h3>
                                        <p className="text-pr-text-2">Pick at least 3 topics you love creating content about.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {interests.map((interest) => (
                                            <button
                                                key={interest.id}
                                                onClick={() => handleInterestToggle(interest.id)}
                                                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center space-x-3 ${selectedInterests.includes(interest.id)
                                                    ? 'border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-900/20 dark:text-orange-100'
                                                    : 'border-pr-surface-3 hover:border-orange-200 hover:bg-pr-surface-2 text-pr-text-2'
                                                    }`}
                                            >
                                                <span className="text-2xl">{interest.icon}</span>
                                                <span className="font-medium">{interest.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-6">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="text-pr-text-2 hover:text-pr-text-1 font-medium px-4"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            disabled={selectedInterests.length < 1}
                                            className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center"
                                        >
                                            Next Step
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 text-center">
                                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                        <Gift className="w-12 h-12 text-green-600 dark:text-green-400 animate-bounce" />
                                        <div className="absolute top-0 right-0">
                                            <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-3xl font-bold text-pr-text-1 mb-4">Welcome to the Team!</h3>
                                        <p className="text-pr-text-2 text-lg max-w-md mx-auto">
                                            Your profile is set up and your welcome rewards have been deposited into your account.
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                                        <div className="flex-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl p-6 transform rotate-1 hover:rotate-0 transition-transform cursor-pointer border border-orange-200 dark:border-orange-800 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>
                                                <span className="text-orange-700 dark:text-orange-300 font-bold">WELCOME50</span>
                                            </div>
                                            <div className="text-center py-2">
                                                <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">50% OFF</span>
                                                <p className="text-orange-800 dark:text-orange-200 font-medium">Your First Purchase</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl p-6 transform -rotate-1 hover:rotate-0 transition-transform cursor-pointer border border-emerald-200 dark:border-emerald-800 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">GIFT</span>
                                                <span className="text-emerald-700 dark:text-emerald-300 font-bold">+100 GEMS</span>
                                            </div>
                                            <div className="text-center py-2">
                                                <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">FREE</span>
                                                <p className="text-emerald-800 dark:text-emerald-200 font-medium">Activate Dashboard</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleComplete}
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center">
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    Finalizing...
                                                </span>
                                            ) : (
                                                "Go to Dashboard 🚀"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
