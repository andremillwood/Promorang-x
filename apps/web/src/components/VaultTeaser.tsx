import { motion } from "framer-motion";
import { Lock, Sparkles, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const vaultItems = [
    {
        title: "Free Product Samples",
        description: "Be the first to try a brand's latest release — delivered to your door, no strings attached.",
        category: "Physical",
        standing: "Herald+",
    },
    {
        title: "VIP Event Access",
        description: "Skip the line and get front-row access to exclusive brand events and launch parties.",
        category: "Access",
        standing: "Luminary+",
    },
    {
        title: "Once-in-a-Lifetime Experiences",
        description: "From travel getaways to backstage passes — the kind of rewards money can't buy.",
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
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-zinc-200 text-[10px] font-bold uppercase tracking-widest mb-6">
                                <Lock className="w-3 h-3 text-primary" />
                                Restricted Access
                            </div>
                            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 italic">
                                Whispers of <br />
                                <span className="text-gradient-primary">The Phoenix Vault</span>
                            </h2>
                            <p className="text-lg text-zinc-200 mb-8 leading-relaxed">
                                Beyond the moments lies the reward. The Vault is where 
                                active community members unlock things that 
                                truly matter.
                            </p>
                            <div className="flex items-center gap-6 justify-center lg:justify-start">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white font-serif">1,240+</p>
                                    <p className="text-[10px] text-white/60 uppercase font-black tracking-widest">Available Rewards</p>
                                </div>
                                <div className="w-px h-8 bg-white/20" />
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white font-serif">24.5M</p>
                                    <p className="text-[10px] text-white/60 uppercase font-black tracking-widest">Gratitude Points</p>
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
                                <div className="p-6 bg-white/[0.07] border border-white/20 rounded-3xl backdrop-blur-xl transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-500 group-hover:bg-white/[0.12] group-hover:border-white/30">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="space-y-1">
                                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] uppercase font-black px-2">
                                                {item.standing}
                                            </Badge>
                                            <h4 className="font-serif text-lg font-bold text-white">{item.title}</h4>
                                        </div>
                                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Key className="w-5 h-5 text-zinc-300 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-300 leading-relaxed mb-4 transition-colors group-hover:text-zinc-100">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/80">Unlock with PromoKey</p>
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
