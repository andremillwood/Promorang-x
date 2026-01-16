import { useState } from 'react';
import { Twitter, Facebook, Link as LinkIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModalBase from '@/react-app/components/ModalBase';

interface Achievement {
    key: string;
    name: string;
    description: string;
    icon: string;
    category: string;
}

interface ShareAchievementModalProps {
    achievement: Achievement;
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export default function ShareAchievementModal({ achievement, isOpen, onClose, userId }: ShareAchievementModalProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = `${window.location.origin}/api/achievements/share/${userId}/${achievement.key}`;
    const tweetText = `I just unlocked the "${achievement.name}" achievement on Promorang! 🚀 Check it out:`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getCategoryColor = (category: string) => {
        const colorMap: { [key: string]: string } = {
            'engagement': 'from-blue-500 to-cyan-500',
            'creation': 'from-purple-500 to-pink-500',
            'earning': 'from-green-500 to-emerald-500',
            'progression': 'from-orange-500 to-red-500',
            'social': 'from-indigo-500 to-purple-500',
        };
        return colorMap[category] || 'from-yellow-500 to-orange-500';
    };

    return (
        <ModalBase isOpen={isOpen} onClose={onClose} maxWidth="md" title="Share Achievement">
            <div className="p-6 text-center">
                {/* Card Preview */}
                <div className={`mb-8 p-8 rounded-3xl bg-gradient-to-br ${getCategoryColor(achievement.category)} text-white shadow-2xl transform transition-transform hover:scale-[1.02]`}>
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-inner">
                        <span className="text-4xl">🏆</span>
                    </div>
                    <h2 className="text-3xl font-black mb-2 drop-shadow-md">
                        ACHIEVEMENT UNLOCKED
                    </h2>
                    <div className="h-px bg-white/20 w-1/2 mx-auto mb-6" />
                    <h3 className="text-xl font-bold mb-1">{achievement.name}</h3>
                    <p className="text-white/80 text-sm italic">{achievement.description}</p>

                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2">
                        <img
                            src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_FULL-02.png"
                            className="w-5 h-5 invert grayscale brightness-200"
                            alt="Promorang"
                        />
                        <span className="text-[10px] font-black tracking-widest uppercase opacity-60">Promorang</span>
                    </div>
                </div>

                <p className="text-sm text-slate-500 mb-6">
                    Share your progress with your network and earn more referral points!
                </p>

                {/* Share Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Button
                        onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`)}
                        className="bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-bold"
                    >
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                    </Button>
                    <Button
                        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}
                        className="bg-[#4267B2] hover:bg-[#3b5998] text-white font-bold"
                    >
                        <Facebook className="w-4 h-4 mr-2" />
                        Facebook
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1 font-bold border-2"
                        onClick={handleCopy}
                    >
                        <LinkIcon className="w-4 h-4 mr-2 text-indigo-600" />
                        {copied ? 'Copied!' : 'Copy Link'}
                    </Button>
                    <Button
                        variant="outline"
                        className="font-bold border-2"
                        title="Download Image"
                    >
                        <Download className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </ModalBase>
    );
}
