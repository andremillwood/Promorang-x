import { motion } from "framer-motion";
import { Lock, Sparkles, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const vaultItems = [
    {
        title: "The Heritage Sample",
        description: "Receive the first physical production unit of a Brand's legacy drop.",
        category: "Physical",
        standing: "Herald+",
    },
    {
        title: "Backstage Ledger Pass",
        description: "Front-row access and a seat on the personal council of a Brand Mayor.",
        category: "Access",
        standing: "Luminary+",
    },
    {
        title: "The Founder's Flight",
        description: "A business-class journey to the heart of the Brand's next storytelling summit.",
        category: "Experience",
        standing: "Eminence",
    },
];

export const VaultTeaser = () => {
    return (
        <section className="py-24 bg-charcoal relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] translate-y-1/2" />

            <div className="container px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                    {/* Text content */}
                    <div className="lg:max-w-xl text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest mb-6">
                                <Lock className="w-3 h-3 text-primary" />
                                Restricted Access
                            </div>
                            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 italic">
                                Whispers of <br />
                                <span className="text-gradient-primary">The Phoenix Vault</span>
                            </h2>
                            <p className="text-lg text-white/60 mb-8 leading-relaxed">
                                Beyond the moments lies the reward. The Vault is a restricted 
                                treasure layer where only those with verified Standing 
                                can unlock what truly matters.
                            </p>
                            <div className="flex items-center gap-6 justify-center lg:justify-start">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white font-serif">1,240+</p>
                                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Active Bounties</p>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white font-serif">24.5M</p>
                                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Gratitude Points</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Blurry Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-6 w-full lg:max-w-md">
                        {vaultItems.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="relative group"
                            >
                                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/20">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="space-y-1">
                                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] uppercase font-black px-2">
                                                {item.standing}
                                            </Badge>
                                            <h4 className="font-serif text-lg font-bold text-white/90">{item.title}</h4>
                                        </div>
                                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <Key className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-white/40 leading-relaxed mb-4 blur-[2px] group-hover:blur-[1px] transition-all">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Unlock with Legacy Key</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
