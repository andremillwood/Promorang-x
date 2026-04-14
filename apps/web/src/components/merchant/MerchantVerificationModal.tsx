import { useState } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Store, 
    ShieldCheck, 
    MapPin, 
    Key, 
    CheckCircle2, 
    ArrowRight,
    Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface MerchantVerificationModalProps {
  momentTitle: string;
  venueName: string;
  onVerified: () => void;
}

export const MerchantVerificationModal = ({ momentTitle, venueName, onVerified }: MerchantVerificationModalProps) => {
    const [pin, setPin] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();

    const handleVerify = async () => {
        setIsVerifying(true);
        // Simulate secure verification
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (pin === "1234") { // Mock PIN for demo
            setIsSuccess(true);
            toast({
                title: "Venue Verified! 📍",
                description: "Your physical attendance has been confirmed by the Merchant.",
            });
            setTimeout(() => {
                onVerified();
            }, 2000);
        } else {
            toast({
                title: "Invalid PIN",
                description: "Please ask the merchant for the correct venue verification code.",
                variant: "destructive"
            });
            setPin("");
        }
        setIsVerifying(false);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="hero" className="w-full h-12 rounded-2xl shadow-glow font-black uppercase tracking-widest text-xs">
                    <MapPin className="w-4 h-4 mr-2" /> Verify at Venue
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-charcoal text-cream border-white/5 p-0 overflow-hidden">
                <AnimatePresence mode="wait">
                    {!isSuccess ? (
                        <motion.div 
                            key="verification"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="p-8 space-y-8"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                    <Store className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="font-serif text-2xl font-bold italic tracking-tight">{venueName}</h3>
                                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Ground Anchor Verification</p>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">Enter Merchant PIN</label>
                                <div className="flex gap-4 items-center">
                                    <div className="relative flex-1">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                        <Input 
                                            type="password"
                                            maxLength={4}
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value)}
                                            className="bg-black/40 border-white/10 h-12 pl-10 text-center text-2xl tracking-[1em] font-black focus:ring-primary"
                                            placeholder="****"
                                        />
                                    </div>
                                    <Button 
                                        onClick={handleVerify}
                                        disabled={pin.length < 4 || isVerifying}
                                        className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/80 transition-all font-black"
                                    >
                                        {isVerifying ? (
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Key className="w-5 h-5" /></motion.div>
                                        ) : (
                                            <ArrowRight className="w-5 h-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                                <p className="text-[10px] text-white/60 leading-relaxed font-medium">
                                    <span className="text-primary font-bold">Merchant Proof:</span> Authenticating your physical presence yields 50% more bonus points and strengthens the ROI profile for <span className="text-white font-bold">{momentTitle.split(' ')[0]}</span>.
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-12 text-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12 }}
                                >
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                </motion.div>
                            </div>
                            <h3 className="font-serif text-3xl font-bold italic text-white mb-2">Ground Verified</h3>
                            <p className="text-white/60 text-sm">Action anchored to physical location.</p>
                            <div className="mt-8 flex justify-center gap-1">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="h-1 w-8 bg-emerald-500 rounded-full" />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
};
