import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
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
import { ArrowLeft, HelpCircle, Plus, Sparkles, MapPin, ListPlus, Trash2, ShieldCheck, Search, Megaphone } from "lucide-react";
import type { DiscoveryPoll } from "@/data/discoveriesData";

interface AskQuestionModalProps {
  onQuestionCreated?: (newQuestion: DiscoveryPoll) => void;
  trigger?: React.ReactNode;
  defaultCity?: string;
}

export function AskQuestionModal({ onQuestionCreated, trigger, defaultCity = "Kingston" }: AskQuestionModalProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<"find" | "request" | null>(null);
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
      toast.info(t("askMarket.maxChoices"));
      return;
    }
    setOptions([...options, ""]);
  };

  const removeOptionField = (index: number) => {
    if (options.length <= 2) {
      toast.error(t("askMarket.minChoices"));
      return;
    }
    setOptions(options.filter((_, optionIndex) => optionIndex !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (intent === "find") {
      if (!question.trim()) {
        toast.error(t("askMarket.enterSearch"));
        return;
      }
      const params = new URLSearchParams({ q: question.trim() });
      if (city.trim()) params.set("city", city.trim());
      setOpen(false);
      setIntent(null);
      setQuestion("");
      navigate(`/discover?${params.toString()}`);
      return;
    }
    if (!user) {
      toast.info(t("askMarket.signIn"));
      return;
    }
    if (!question.trim()) {
      toast.error(t("askMarket.enterRequest"));
      return;
    }

    const validOptions = options.map((option) => option.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      toast.error(t("askMarket.minChoices"));
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

      toast.success(t("askMarket.saved"), {
        description: t("askMarket.savedCopy"),
      });
      onQuestionCreated?.(created);
      setQuestion("");
      setOptions(["", "", ""]);
      setIntent(null);
      setOpen(false);
    } catch (error: any) {
      toast.error(t("askMarket.failed"), {
        description: error?.message || t("askMarket.failedCopy"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) setIntent(null); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="rounded-xl border-purple-300 bg-purple-50 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:border-purple-800/80 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60">
            <HelpCircle className="mr-1.5 h-3.5 w-3.5" /> {t("askMarket.trigger")}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg rounded-3xl border-gray-800 bg-gray-950 p-6 text-white sm:p-8">
        <DialogHeader>
          {intent ? <button type="button" onClick={() => { setIntent(null); setQuestion(""); }} className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-white/55 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" />{t("askMarket.back")}</button> : null}
          <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-purple-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{intent === "request" ? t("askMarket.requestBadge") : t("askMarket.badge")}</span>
          </div>
          <DialogTitle className="text-xl font-black text-white sm:text-2xl">{intent === "find" ? t("askMarket.findTitle") : intent === "request" ? t("askMarket.requestTitle") : t("askMarket.title")}</DialogTitle>
          <DialogDescription className="text-xs leading-5 text-gray-400">
            {intent === "find" ? t("askMarket.findCopy") : intent === "request" ? t("askMarket.requestCopy") : t("askMarket.copy")}
          </DialogDescription>
        </DialogHeader>

        {!intent ? <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => setIntent("find")} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-primary/50 hover:bg-primary/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Search className="h-6 w-6 text-primary" />
            <span className="mt-4 block text-base font-black text-white">{t("askMarket.findChoice")}</span>
            <span className="mt-1 block text-xs leading-5 text-white/50">{t("askMarket.findChoiceCopy")}</span>
          </button>
          <button type="button" onClick={() => setIntent("request")} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-purple-400/50 hover:bg-purple-400/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400">
            <Megaphone className="h-6 w-6 text-purple-300" />
            <span className="mt-4 block text-base font-black text-white">{t("askMarket.requestChoice")}</span>
            <span className="mt-1 block text-xs leading-5 text-white/50">{t("askMarket.requestChoiceCopy")}</span>
          </button>
        </div> : <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="question" className="text-xs font-bold text-gray-300">{intent === "find" ? t("askMarket.findLabel") : t("askMarket.requestLabel")}</Label>
            <Textarea id="question" placeholder={intent === "find" ? t("askMarket.findPlaceholder") : t("askMarket.requestPlaceholder")} value={question} onChange={(e) => setQuestion(e.target.value)} className="min-h-[75px] rounded-xl border-gray-800 bg-gray-900 text-xs text-white placeholder-gray-500 focus:border-purple-500" required />
          </div>

          <div className={`grid gap-3 ${intent === "request" ? "grid-cols-2" : "grid-cols-1"}`}>
            {intent === "request" ? <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-300">{t("askMarket.category")}</Label>
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
            </div> : null}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-300">{t("askMarket.city")}</Label>
              <div className="relative"><MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" /><Input value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl border-gray-800 bg-gray-900 pl-8 text-xs text-white" /></div>
            </div>
          </div>

          {intent === "request" ? <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <Label className="flex items-center text-xs font-bold text-gray-300"><ListPlus className="mr-1 h-3.5 w-3.5 text-purple-400" />{t("askMarket.choices")}</Label>
              <span className="text-[10px] text-gray-500">{t("askMarket.zeroVotes")}</span>
            </div>
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-4 text-[10px] font-bold text-gray-500">#{index + 1}</span>
                  <Input value={option} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={t("askMarket.choice", { number: index + 1 })} className="rounded-xl border-gray-800 bg-gray-900 text-xs text-white placeholder-gray-500 focus:border-purple-500" />
                  {options.length > 2 ? <button type="button" onClick={() => removeOptionField(index)} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button> : null}
                </div>
              ))}
            </div>
            {options.length < 6 ? <button type="button" onClick={addOptionField} className="flex items-center pt-1 text-[11px] font-bold text-purple-400 hover:text-purple-300"><Plus className="mr-1 h-3.5 w-3.5" />{t("askMarket.addChoice")}</button> : null}
          </div> : null}

          {intent === "request" ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-[11px] leading-5 text-white/50">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-purple-300" />{t("askMarket.truth")}
          </div> : null}

          <div className="flex items-center justify-end gap-2 border-t border-gray-800 pt-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-white">{t("askMarket.cancel")}</Button>
            <Button type="submit" disabled={loading} className="rounded-xl bg-purple-600 text-xs font-bold text-white shadow-lg shadow-purple-600/20 hover:bg-purple-500">{intent === "find" ? t("askMarket.search") : loading ? t("askMarket.saving") : t("askMarket.save")}</Button>
          </div>
        </form>}
      </DialogContent>
    </Dialog>
  );
}
