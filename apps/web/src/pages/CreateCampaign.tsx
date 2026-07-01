import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCampaign } from "@/hooks/useCampaigns";
import { useCampaignCompiler } from "@/hooks/useCampaignCompiler";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ShieldCheck, Gift, Target, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cultureImages } from "@/data/culture-demo";

const CreateCampaign = () => {
  const navigate = useNavigate();
  const createCampaign = useCreateCampaign();
  const { compile, isCompiling } = useCampaignCompiler();

  const [prompt, setPrompt] = useState("");
  const [compiledData, setCompiledData] = useState<any>(null);

  const handleCompile = async () => {
    if (!prompt.trim()) return;
    const { campaign, metadata } = await compile(prompt);
    setCompiledData({ ...campaign, metadata });
  };

  const handleLaunch = async () => {
    if (!compiledData) return;

    // Format description strictly according to V1 rules
    const formattedDescription = `
Moment: ${compiledData.moment.name} | Tier: ${compiledData.moment.tier}
Drop: ${compiledData.drop}
Moves: ${compiledData.moves.join(", ")}
Proof: ${compiledData.proof}
Expected Outcome: ${compiledData.outcome.volume}
    `.trim();

    await createCampaign.mutateAsync({
      title: compiledData.moment.name,
      description: formattedDescription,
      budget: null,
      reward_type: "points",
      reward_value: `${compiledData.reward.baseGems} Gems`,
      target_categories: [], 
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      compiler_metadata: {
        ...compiledData.metadata,
        verificationType: compiledData.verificationType,
      }
    });

    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090909] px-4 pb-20 pt-8 text-white">
      <img src={cultureImages.openMic} alt="" className="pointer-events-none absolute inset-0 h-[520px] w-full object-cover opacity-20" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-black/30 via-[#090909]/85 to-[#090909]" />
      <div className="relative mx-auto max-w-5xl">
      <AnimatePresence mode="wait">
        {!compiledData ? (
          <motion.div
            key="input-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid min-h-[68vh] items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_380px]"
          >
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.24em] text-orange-400">Campaign compiler</p>
                <h1 className="max-w-3xl text-5xl font-black leading-[0.92] tracking-tight text-white sm:text-6xl">
                  Turn a desired outcome into verified movement.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/55">
                  Describe the action you want in plain language. Promorang will shape it into a Moment, moves, proof, reward, and expected outcome so the campaign is ready to launch with intent.
                </p>
              </div>

              <div className="relative w-full overflow-hidden rounded-lg border border-orange-500/25 bg-[#111]/95 transition-colors focus-within:border-orange-500/70">
                <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-primary/20 blur-[90px]" />
                <div className="relative p-6 sm:p-8">
                  <label htmlFor="prompt" className="mb-5 block text-2xl font-black tracking-tight text-white">
                    What should people do, prove, or unlock?
                </label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Get people to visit this weekend, check in, post first bite reactions, and unlock a return offer."
                  className="min-h-[150px] resize-none border-none bg-transparent p-0 text-xl text-white shadow-none focus-visible:ring-0 placeholder:text-white/25"
                  autoFocus
                />
              </div>
                <div className="relative border-t border-border bg-background/50 p-4">
                <Button
                  onClick={handleCompile}
                  disabled={!prompt.trim() || isCompiling}
                  size="lg"
                    className="h-14 w-full rounded-md bg-orange-500 px-10 text-base font-black text-black hover:bg-orange-400"
                >
                  {isCompiling ? (
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="mr-2"
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                  )}
                    {isCompiling ? "Compiling proof loop..." : "Compile proof loop"}
                </Button>
              </div>
            </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#111]/90 p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-orange-400">What gets generated</p>
              <div className="mt-5 space-y-3">
                {[
                  { icon: Target, title: "Moment", copy: "The action surface people can understand and join." },
                  { icon: ShieldCheck, title: "Proof", copy: "The verification signal that gives the action value." },
                  { icon: Gift, title: "Unlock", copy: "The reward, status, or return path earned by completion." },
                ].map((item) => (
                  <div key={item.title} className="rounded-lg border border-white/10 bg-black/40 p-4">
                    <item.icon className="h-5 w-5 text-orange-400" />
                    <p className="mt-3 font-black text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/45">{item.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview-phase"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-orange-500/25 bg-[#111]"
          >
            <div className="border-b border-border bg-gradient-to-br from-primary/10 via-card to-background p-8">
               <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/15 px-3 py-1 text-xs font-black uppercase tracking-widest text-primary">
                 Tier {compiledData.moment.tier}
               </span>
               <h2 className="mb-3 text-4xl font-black leading-[0.95] tracking-tight text-white">
                 {compiledData.moment.name}
               </h2>
               <p className="text-muted-foreground">{compiledData.moment.description}</p>
            </div>

            <div className="p-8 space-y-8">
              {/* Drop / Task */}
              <div className="text-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Drop</h3>
                <p className="text-lg font-medium text-foreground">{compiledData.drop}</p>
              </div>

              {/* Moves */}
              <div className="bg-muted/30 rounded-2xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 text-center">Moves</h3>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm font-medium">
                  {compiledData.moves.map((move, i) => (
                    <div key={i} className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold mr-2">
                        {i + 1}
                      </span>
                      <span>{move}</span>
                      {i < compiledData.moves.length - 1 && <ArrowRight className="mx-3 hidden h-4 w-4 text-muted-foreground sm:block" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid 3-col Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="p-4 rounded-2xl bg-muted/20 border border-border">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Proof</h3>
                  <p className="font-semibold">{compiledData.proof}</p>
                </div>
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Reward</h3>
                  <p className="font-bold text-lg text-primary">{compiledData.reward.baseGems} Gems</p>
                  {compiledData.reward.bonus && (
                    <p className="text-xs mt-1 text-primary/80 font-medium">Bonus: {compiledData.reward.bonus}</p>
                  )}
                </div>
                <div className="p-4 rounded-2xl bg-muted/20 border border-border">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Outcome</h3>
                  <p className="font-semibold text-sm">{compiledData.outcome.volume}</p>
                  <p className="text-xs text-muted-foreground mt-1">{compiledData.outcome.reach}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-muted/30 border-t border-border">
               <Button 
                 onClick={handleLaunch}
                 disabled={createCampaign.isPending}
                 className="h-14 w-full rounded-md bg-orange-500 text-lg font-bold text-black hover:bg-orange-400"
               >
                 {createCampaign.isPending ? "Launching..." : "Launch proof-backed campaign"}
               </Button>
               <button 
                 onClick={() => setCompiledData(null)}
                 className="w-full mt-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
               >
                 Go Back and Edit Input
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateCampaign;
