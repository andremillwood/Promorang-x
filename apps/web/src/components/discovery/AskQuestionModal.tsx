import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { HelpCircle, Plus, Sparkles, MapPin, ListPlus, Trash2 } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';

interface AskQuestionModalProps {
  onQuestionCreated?: (newQuestion: any) => void;
  trigger?: React.ReactNode;
  defaultCity?: string;
}

export function AskQuestionModal({
  onQuestionCreated,
  trigger,
  defaultCity = 'Kingston',
}: AskQuestionModalProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('Market Intelligence');
  const [city, setCity] = useState(defaultCity);
  const [options, setOptions] = useState<string[]>([
    '',
    '',
    '',
  ]);

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOptionField = () => {
    if (options.length >= 6) {
      toast.info(t('askQ.maxOpts'));
      return;
    }
    setOptions([...options, '']);
  };

  const removeOptionField = (index: number) => {
    if (options.length <= 2) {
      toast.error(t('askQ.minOpts'));
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      toast.error(t('askQ.needQuestion'));
      return;
    }

    const validOptions = options.map((opt) => opt.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      toast.error(t('askQ.needAnswers'));
      return;
    }

    setLoading(true);

    try {
      const authorName =
        user?.user_metadata?.full_name ||
        user?.email?.split('@')[0] ||
        'Community Curator';

      const questionId = crypto.randomUUID();

      // Insert question into Supabase discovery_questions table
      const { error: qError } = await (supabase as any)
        .from('discovery_questions')
        .insert({
          id: questionId,
          question: question.trim(),
          category: category,
          author_name: authorName,
          total_votes: validOptions.length,
          threshold_for_moment: 35,
          created_at: new Date().toISOString(),
        });

      if (qError) {
        console.warn('Backend database insert notice:', qError);
      }

      // Insert options into discovery_options table
      const optionInserts = validOptions.map((optText, idx) => ({
        id: crypto.randomUUID(),
        question_id: questionId,
        option_text: optText,
        votes_count: idx === 0 ? 2 : 1,
      }));

      const { error: optError } = await (supabase as any)
        .from('discovery_options')
        .insert(optionInserts);

      if (optError) {
        console.warn('Options insert notice:', optError);
      }

      const formattedDiscovery = {
        id: questionId,
        question: question.trim(),
        category: category,
        authorName: authorName,
        totalVotes: validOptions.length + 1,
        thresholdForMoment: 35,
        options: validOptions.map((text, idx) => ({
          id: `opt-${questionId}-${idx}`,
          text,
          votes: idx === 0 ? 2 : 1,
        })),
      };

      toast.success(t('askQ.published'));

      if (onQuestionCreated) {
        onQuestionCreated(formattedDiscovery);
      }

      setOpen(false);
      setQuestion('');
      setOptions(['', '', '']);
    } catch (err: any) {
      console.error('Failed to submit question:', err);
      toast.error(err.message || t('askQ.fail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="rounded-xl border-purple-300 dark:border-purple-800/80 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-purple-600 dark:text-purple-400" />
            {t('askQ.trigger')}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg bg-gray-950 text-white border-gray-800 rounded-3xl p-6 sm:p-8">
        <DialogHeader>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2 w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {t('askQ.badge')}
            </span>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black text-white">
            {t('askQ.title')}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-400">
            {t('askQ.copy')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="question" className="text-xs font-bold text-gray-300">
              {t('askQ.question')}
            </Label>
            <Textarea
              id="question"
              placeholder={t('askQ.questionPh')}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-gray-900 border-gray-800 text-white placeholder-gray-500 text-xs rounded-xl min-h-[75px] focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-300">{t('askQ.category')}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-gray-900 border-gray-800 text-white text-xs rounded-xl">
                  <SelectValue placeholder={t('askQ.category')} />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white text-xs">
                  <SelectItem value="Market Intelligence">{t('askQ.catMarket')}</SelectItem>
                  <SelectItem value="Nightlife & Dining">{t('askQ.catNight')}</SelectItem>
                  <SelectItem value="Music & Culture">{t('askQ.catMusic')}</SelectItem>
                  <SelectItem value="Wellness & Movement">{t('askQ.catWellness')}</SelectItem>
                  <SelectItem value="Hidden Gems">{t('askQ.catGems')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-300">{t('askQ.city')}</Label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('askQ.cityPh')}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-gray-900 border-gray-800 text-white placeholder-gray-500 text-xs pl-8 rounded-xl focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Starting Options Checklist */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-300 flex items-center">
                <ListPlus className="w-3.5 h-3.5 mr-1 text-purple-400" />
                {t('askQ.options')}
              </Label>
              <span className="text-[10px] text-gray-500">{t('askQ.optionsHint')}</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {options.map((opt, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 w-4">
                    #{index + 1}
                  </span>
                  <Input
                    type="text"
                    placeholder={t('askQ.optionPh', { n: index + 1 })}
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="bg-gray-900 border-gray-800 text-white placeholder-gray-500 text-xs rounded-xl focus:border-purple-500"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOptionField(index)}
                      className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <button
                type="button"
                onClick={addOptionField}
                className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center pt-1"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                {t('askQ.addOption')}
              </button>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              {t('askQ.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20"
            >
              {loading ? t('askQ.publishing') : t('askQ.publish')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
