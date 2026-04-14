import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCampaign } from "@/hooks/useCampaigns";
import { useCampaignCompiler, CompiledCampaign } from "@/hooks/useCampaignCompiler";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="max-w-2xl mx-auto pt-10 pb-20 px-4">
      <AnimatePresence mode="wait">
        {!compiledData ? (
          <motion.div
            key="input-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-[60vh] space-y-6"
          >
            <div className="w-full relative shadow-lg rounded-3xl overflow-hidden border border-border bg-card focus-within:border-primary/50 transition-colors">
              <div className="p-8">
                <label htmlFor="prompt" className="block text-2xl font-bold font-serif mb-6 text-foreground text-center">
                  What do you want customers to do?
                </label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Get people to post first bite reactions to my wings"
                  className="text-xl min-h-[120px] resize-none border-none shadow-none focus-visible:ring-0 p-0 bg-transparent text-center placeholder:text-muted-foreground/40"
                  autoFocus
                />
              </div>
              <div className="bg-muted/30 p-4 border-t border-border flex justify-center">
                <Button
                  onClick={handleCompile}
                  disabled={!prompt.trim() || isCompiling}
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-12 font-bold shadow-md bg-foreground text-background hover:bg-foreground/90 transition-all text-lg h-14"
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
                  {isCompiling ? "Compiling..." : "Generate Insights"}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview-phase"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 bg-card border border-border shadow-xl rounded-3xl overflow-hidden"
          >
            <div className="p-8 text-center bg-muted/20 border-b border-border">
               <span className="inline-block px-3 py-1 bg-primary/20 text-primary-foreground font-bold rounded-full text-xs tracking-widest uppercase mb-4">
                 Tier {compiledData.moment.tier}
               </span>
               <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
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
                 className="w-full rounded-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
               >
                 {createCampaign.isPending ? "Executing..." : "Launch Campaign"}
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
  );
};

export default CreateCampaign;
