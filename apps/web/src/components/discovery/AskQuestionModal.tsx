import React, { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  HelpCircle,
  Plus,
  Sparkles,
  MapPin,
  ListPlus,
  Trash2,
  ShieldCheck,
  Target,
  HeartHandshake,
  Zap,
  Scale,
  ArrowRight,
} from "lucide-react";
import type { DiscoveryPoll } from "@/data/discoveriesData";

interface AskQuestionModalProps {
  onQuestionCreated?: (newQuestion: DiscoveryPoll) => void;
  trigger?: React.ReactNode;
  defaultCity?: string;
}

const PURPOSES = [
  {
    id: "unlock",
    title: "Choose what should happen next",
    copy: "Use the answers to decide which idea, experience, place or opportunity deserves the next push.",
    icon: Target,
    placeholder: "Example: The top choice will become the next thing I ask PROMORANG / a host / a business to explore.",
  },
  {
    id: "demand",
    title: "See if other people want this too",
    copy: "Test whether your idea is only yours—or whether enough other people want the same thing.",
    icon: HeartHandshake,
    placeholder: "Example: If enough people want this, I’ll share the result with the business / host / community that could respond.",
  },
  {
    id: "motivation",
    title: "Find what would move people",
    copy: "Ask what value, access or experience would actually change someone’s decision.",
    icon: Zap,
    placeholder: "Example: The strongest answer will shape what kind of Offer or activation is worth asking for.",
  },
  {
    id: "verdict",
    title: "Get a verdict before deciding",
    copy: "Use the crowd to compare real options before you or your community commits to one.",
    icon: Scale,
    placeholder: "Example: I’ll use the winning answer to decide which option to move forward with.",
  },
] as const;

type PurposeId = (typeof PURPOSES)[number]["id"];

export function AskQuestionModal({ onQuestionCreated, trigger, defaultCity = "Kingston" }: AskQuestionModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [purpose, setPurpose] = useState<PurposeId>("unlock");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("Market Intelligence");
  const [city, setCity] = useState(defaultCity);
  const [options, setOptions] = useState<string[]>(["", "", ""]);
  const [consequence, setConsequence] = useState("");
  const [decisionOwner, setDecisionOwner] = useState("PROMORANG / community");
  const [targetVoices, setTargetVoices] = useState(35);

  const purposeConfig = useMemo(
    () => PURPOSES.find((item) => item.id === purpose) || PURPOSES[0],
    [purpose],
  );

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOptionField = () => {
    if (options.length >= 6) {
      toast.info("Maximum 6 starting choices.");
      return;
    }
    setOptions([...options, ""]);
  };

  const removeOptionField = (index: number) => {
    if (options.length <= 2) {
      toast.error("Keep at least 2 starting choices.");
      return;
    }
    setOptions(options.filter((_, optionIndex) => optionIndex !== index));
  };

  const reset = () => {
    setPurpose("unlock");
    setQuestion("");
    setOptions(["", "", ""]);
    setConsequence("");
    setDecisionOwner("PROMORANG / community");
    setTargetVoices(35);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      toast.info("Sign in to ask the crowd.");
      return;
    }
    if (!question.trim()) {
      toast.error("Enter the question people should answer.");
      return;
    }

    const validOptions = options.map((option) => option.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      toast.error("Provide at least 2 choices.");
      return;
    }
    if (!consequence.trim()) {
      toast.error("Tell people what their answers can influence.");
      return;
    }

    const threshold = Math.max(5, Math.min(5000, Number(targetVoices) || 35));
    setLoading(true);
    const questionId = crypto.randomUUID();

    try {
      const authorName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Community member";
      const { error: questionError } = await (supabase as any)
        .from("discovery_questions")
        .insert({
          id: questionId,
          question: question.trim(),
          category,
          author_name: authorName,
          threshold_for_moment: threshold,
          total_votes: 0,
          is_moment_triggered: false,
          question_type: "demand",
          status: "active",
          metadata: {
            city: city.trim() || null,
            submitted_by_user_id: user.id,
            source: "community_demand",
            purpose,
            consequence: consequence.trim(),
            decision_owner: decisionOwner,
          },
        });
      if (questionError) throw questionError;

      const optionRows = validOptions.map((optionText) => ({
        id: crypto.randomUUID(),
        discovery_id: questionId,
        question_id: questionId,
        option_text: optionText,
        votes_count: 0,
      }));

      const { error: optionsError } = await (supabase as any).from("discovery_options").insert(optionRows);
      if (optionsError) {
        await (supabase as any).from("discovery_questions").delete().eq("id", questionId);
        throw optionsError;
      }

      const created: DiscoveryPoll = {
        id: questionId,
        slug: questionId,
        question: question.trim(),
        category,
        categorySlug: "community-demand",
        authorName,
        authorRole: decisionOwner,
        description: consequence.trim(),
        contextNotes: "What happens next: " + consequence.trim(),
        totalVotes: 0,
        thresholdForMoment: threshold,
        signalKind: "demand",
        targetUnlockPerk: consequence.trim(),
        pointsReward: 0,
        options: optionRows.map((row) => ({ id: row.id, text: row.option_text, votes: 0 })),
        comments: [],
        tags: ["community question", purpose, city.trim()].filter(Boolean),
        purpose,
        purposeLabel: purposeConfig.title,
        consequence: consequence.trim(),
        decisionOwner,
      };

      toast.success("Your question is live.", {
        description: "People can now see why their answer matters and what the result is meant to influence.",
      });
      onQuestionCreated?.(created);
      reset();
      setOpen(false);
    } catch (error: any) {
      toast.error("Could not publish this question.", {
        description: error?.message || "The market question was not recorded.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) reset(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="rounded-xl border-purple-300 bg-purple-50 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:border-purple-800/80 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60">
            <HelpCircle className="mr-1.5 h-3.5 w-3.5" /> Ask the crowd
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl border-gray-800 bg-gray-950 p-6 text-white sm:p-8">
        <DialogHeader>
          <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-purple-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Ask the crowd</span>
          </div>
          <DialogTitle className="text-2xl font-black text-white sm:text-3xl">Do not ask a poll. Ask for help deciding something.</DialogTitle>
          <DialogDescription className="max-w-xl text-xs leading-5 text-gray-400">
            People should know why their answer matters. Every question needs a purpose and a stated next step. Answers create evidence; they do not automatically create an Offer, Moment, reward or supply.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          <div>
            <Label className="text-xs font-bold text-gray-300">What are you trying to learn or decide?</Label>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PURPOSES.map((item) => {
                const Icon = item.icon;
                const active = purpose === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPurpose(item.id)}
                    className={`rounded-2xl border p-4 text-left transition ${active ? "border-purple-400 bg-purple-500/10" : "border-white/10 bg-white/[0.025] hover:border-white/20"}`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-purple-300" : "text-white/35"}`} />
                    <p className="mt-3 text-sm font-black text-white">{item.title}</p>
                    <p className="mt-1 text-[11px] leading-5 text-white/45">{item.copy}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="question" className="text-xs font-bold text-gray-300">What should people choose?</Label>
            <Textarea
              id="question"
              placeholder={purpose === "motivation" ? "What would actually make you try Restaurant X?" : purpose === "demand" ? "Would you want a Sunday sunset house session in Kingston?" : "What should PROMORANG try to unlock next?"}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[82px] rounded-xl border-gray-800 bg-gray-900 text-sm text-white placeholder-gray-500 focus:border-purple-500"
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-300">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl border-gray-800 bg-gray-900 text-xs text-white"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent className="border-gray-800 bg-gray-900 text-xs text-white">
                  <SelectItem value="Market Intelligence">Market Intelligence</SelectItem>
                  <SelectItem value="Nightlife & Dining">Nightlife & Dining</SelectItem>
                  <SelectItem value="Music & Culture">Music & Culture</SelectItem>
                  <SelectItem value="Wellness & Movement">Wellness & Movement</SelectItem>
                  <SelectItem value="Hidden Gems">Hidden Gems</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-300">City / region</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <Input value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl border-gray-800 bg-gray-900 pl-8 text-xs text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <Label className="flex items-center text-xs font-bold text-gray-300"><ListPlus className="mr-1 h-3.5 w-3.5 text-purple-400" />Choices</Label>
              <span className="text-[10px] text-gray-500">All begin at 0 voices</span>
            </div>
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-4 text-[10px] font-bold text-gray-500">#{index + 1}</span>
                  <Input value={option} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Choice ${index + 1}`} className="rounded-xl border-gray-800 bg-gray-900 text-xs text-white placeholder-gray-500 focus:border-purple-500" />
                  {options.length > 2 ? <button type="button" onClick={() => removeOptionField(index)} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button> : null}
                </div>
              ))}
            </div>
            {options.length < 6 ? <button type="button" onClick={addOptionField} className="flex items-center pt-1 text-[11px] font-bold text-purple-400 hover:text-purple-300"><Plus className="mr-1 h-3.5 w-3.5" />Add another choice</button> : null}
          </div>

          <div className="rounded-[1.5rem] border border-purple-400/20 bg-purple-400/[0.045] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-300">The reason to answer</p>
            <Label htmlFor="consequence" className="mt-3 block text-sm font-black text-white">What can these answers influence?</Label>
            <Textarea
              id="consequence"
              value={consequence}
              onChange={(e) => setConsequence(e.target.value)}
              placeholder={purposeConfig.placeholder}
              className="mt-2 min-h-[76px] rounded-xl border-gray-800 bg-black/35 text-xs text-white placeholder:text-white/25"
              required
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_150px]">
              <div>
                <Label className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">Who will use the result?</Label>
                <Select value={decisionOwner} onValueChange={setDecisionOwner}>
                  <SelectTrigger className="mt-1 rounded-xl border-gray-800 bg-gray-900 text-xs text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="border-gray-800 bg-gray-900 text-xs text-white">
                    <SelectItem value="PROMORANG / community">PROMORANG / community</SelectItem>
                    <SelectItem value="My community">My community</SelectItem>
                    <SelectItem value="A business / brand / host">A business / brand / host</SelectItem>
                    <SelectItem value="Me">Me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="target" className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">Target voices</Label>
                <Input id="target" type="number" min={5} max={5000} value={targetVoices} onChange={(e) => setTargetVoices(Number(e.target.value))} className="mt-1 rounded-xl border-gray-800 bg-gray-900 text-xs text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="flex items-center gap-2 text-xs font-black text-white"><ShieldCheck className="h-4 w-4 text-purple-300" /> No orphan polls.</p>
            <p className="mt-2 text-[11px] leading-5 text-white/45">
              The question can influence a decision, request or next experiment. Reaching the target still does not guarantee supply unless a real operator commits to it.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-gray-800 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-white">Cancel</Button>
            <Button type="submit" disabled={loading} className="rounded-xl bg-purple-600 text-xs font-bold text-white shadow-lg shadow-purple-600/20 hover:bg-purple-500">
              {loading ? "Publishing..." : <>Ask the crowd <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
