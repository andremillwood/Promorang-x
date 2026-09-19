import React, { useState } from "react";
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
import { HelpCircle, Plus, Sparkles, MapPin, ListPlus, Trash2, ShieldCheck } from "lucide-react";
import type { DiscoveryPoll } from "@/data/discoveriesData";

interface AskQuestionModalProps {
  onQuestionCreated?: (newQuestion: DiscoveryPoll) => void;
  trigger?: React.ReactNode;
  defaultCity?: string;
}

export function AskQuestionModal({ onQuestionCreated, trigger, defaultCity = "Kingston" }: AskQuestionModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("Market Intelligence");
  const [city, setCity] = useState(defaultCity);
  const [options, setOptions] = useState<string[]>(["", "", ""]);

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOptionField = () => {
    if (options.length >= 6) {
      toast.info("Maximum 6 starting options.");
      return;
    }
    setOptions([...options, ""]);
  };

  const removeOptionField = (index: number) => {
    if (options.length <= 2) {
      toast.error("Keep at least 2 starting options.");
      return;
    }
    setOptions(options.filter((_, optionIndex) => optionIndex !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      toast.info("Sign in to put a question to the market.");
      return;
    }
    if (!question.trim()) {
      toast.error("Enter a question.");
      return;
    }

    const validOptions = options.map((option) => option.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      toast.error("Provide at least 2 choices.");
      return;
    }

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
          threshold_for_moment: 35,
          total_votes: 0,
          is_moment_triggered: false,
          question_type: "demand",
          status: "active",
          metadata: {
            city: city.trim() || null,
            submitted_by_user_id: user.id,
            source: "community_demand",
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
        authorRole: "Community demand",
        description: `A live demand signal${city.trim() ? ` for ${city.trim()}` : ""}.`,
        contextNotes: "A vote records interest. Reaching a threshold does not guarantee that a Moment, offer, perk, or merchant supply will be created.",
        totalVotes: 0,
        thresholdForMoment: 35,
        signalKind: "demand",
        targetUnlockPerk: "No automatic perk",
        pointsReward: 0,
        options: optionRows.map((row) => ({ id: row.id, text: row.option_text, votes: 0 })),
        comments: [],
        tags: ["community demand", city.trim()].filter(Boolean),
      };

      toast.success("Demand question recorded.", {
        description: "It starts at zero. Votes are recorded only when people actually cast them.",
      });
      onQuestionCreated?.(created);
      setQuestion("");
      setOptions(["", "", ""]);
      setOpen(false);
    } catch (error: any) {
      toast.error("Could not publish this question.", {
        description: error?.message || "The market signal was not recorded.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="rounded-xl border-purple-300 bg-purple-50 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:border-purple-800/80 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60">
            <HelpCircle className="mr-1.5 h-3.5 w-3.5" /> Ask the market
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg rounded-3xl border-gray-800 bg-gray-950 p-6 text-white sm:p-8">
        <DialogHeader>
          <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-purple-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Market signal</span>
          </div>
          <DialogTitle className="text-xl font-black text-white sm:text-2xl">Ask what people want</DialogTitle>
          <DialogDescription className="text-xs leading-5 text-gray-400">
            Start a real demand question. The record begins at zero and grows only from recorded votes. Demand can inform supply; it does not promise that Promorang, a host, or a merchant will create anything.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="question" className="text-xs font-bold text-gray-300">Question</Label>
            <Textarea id="question" placeholder="What should exist, happen, open, or be easier to find?" value={question} onChange={(e) => setQuestion(e.target.value)} className="min-h-[75px] rounded-xl border-gray-800 bg-gray-900 text-xs text-white placeholder-gray-500 focus:border-purple-500" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <div className="relative"><MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" /><Input value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl border-gray-800 bg-gray-900 pl-8 text-xs text-white" /></div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <Label className="flex items-center text-xs font-bold text-gray-300"><ListPlus className="mr-1 h-3.5 w-3.5 text-purple-400" />Starting choices</Label>
              <span className="text-[10px] text-gray-500">All begin at 0 votes</span>
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

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-[11px] leading-5 text-white/50">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-purple-300" /> Vote ≠ attendance. Threshold ≠ guaranteed supply. Demand ≠ offer.
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-800 pt-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-white">Cancel</Button>
            <Button type="submit" disabled={loading} className="rounded-xl bg-purple-600 text-xs font-bold text-white shadow-lg shadow-purple-600/20 hover:bg-purple-500">{loading ? "Recording..." : "Record question"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
