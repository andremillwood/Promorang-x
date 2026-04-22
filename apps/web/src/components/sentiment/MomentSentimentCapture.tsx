import { useState } from 'react';
import { Star, Camera, Video, Check, ChevronRight, ChevronLeft, Sparkles, Heart, ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useMomentSentiment, CreateSentimentReviewInput, getRatingLabel } from '@/hooks/useMomentSentiment';
import { toast } from 'sonner';

interface MomentSentimentCaptureProps {
  momentId: string;
  proofSubmissionId?: string;
  momentTitle: string;
  onComplete?: () => void;
  onSkip?: () => void;
}

const TAGS = [
  { id: 'Inspiring', label: '✨ Inspiring', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'Educational', label: '📚 Educational', color: 'bg-blue-100 text-blue-800' },
  { id: 'Fun', label: '🎉 Fun', color: 'bg-pink-100 text-pink-800' },
  { id: 'Networking', label: '🤝 Networking', color: 'bg-green-100 text-green-800' },
  { id: 'Transformative', label: '🦋 Transformative', color: 'bg-purple-100 text-purple-800' },
  { id: 'Community', label: '👥 Community', color: 'bg-orange-100 text-orange-800' },
  { id: 'Creative', label: '🎨 Creative', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'Actionable', label: '⚡ Actionable', color: 'bg-red-100 text-red-800' },
  { id: 'Entertaining', label: '🎭 Entertaining', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'ThoughtProvoking', label: '💭 Thought-Provoking', color: 'bg-teal-100 text-teal-800' },
  { id: 'Intimate', label: '💫 Intimate', color: 'bg-rose-100 text-rose-800' },
  { id: 'Energetic', label: '🔥 Energetic', color: 'bg-amber-100 text-amber-800' },
  { id: 'Relaxing', label: '🌿 Relaxing', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'Professional', label: '💼 Professional', color: 'bg-slate-100 text-slate-800' },
  { id: 'LifeChanging', label: '🌟 Life-Changing', color: 'bg-violet-100 text-violet-800' },
];

const STEPS = ['rating', 'experience', 'feedback', 'tags', 'share'] as const;
type Step = typeof STEPS[number];

export function MomentSentimentCapture({
  momentId,
  proofSubmissionId,
  momentTitle,
  onComplete,
  onSkip,
}: MomentSentimentCaptureProps) {
  const [currentStep, setCurrentStep] = useState<Step>('rating');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [overallRating, setOverallRating] = useState(0);
  const [experienceRating, setExperienceRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [whatMadeSpecial, setWhatMadeSpecial] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const { createReview } = useMomentSentiment();

  const currentStepIndex = STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }
    if (wouldRecommend === null) {
      toast.error('Please indicate if you would recommend this moment');
      return;
    }

    setIsSubmitting(true);

    const reviewData: CreateSentimentReviewInput = {
      moment_id: momentId,
      proof_submission_id: proofSubmissionId,
      overall_rating: overallRating,
      experience_rating: experienceRating || undefined,
      value_rating: valueRating || undefined,
      would_recommend: wouldRecommend,
      review_title: reviewTitle || undefined,
      review_text: reviewText || undefined,
      what_made_special: whatMadeSpecial || undefined,
      tags: selectedTags,
      submitted_from: 'web',
    };

    try {
      await createReview.mutateAsync(reviewData);
      onComplete?.();
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'rating':
        return overallRating > 0 && wouldRecommend !== null;
      case 'experience':
        return true; // Optional
      case 'feedback':
        return true; // Optional
      case 'tags':
        return true; // Optional
      case 'share':
        return true;
      default:
        return false;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {STEPS.length}
          </span>
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Skip for now
          </Button>
        </div>
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <CardTitle className="text-xl mt-4">
          How was "{momentTitle}"?
        </CardTitle>
        <p className="text-muted-foreground">
          Your feedback helps hosts create better moments and helps others discover great experiences.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Overall Rating */}
        {currentStep === 'rating' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg font-medium mb-4">Overall Rating</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setOverallRating(star)}
                    className={cn(
                      "p-2 transition-all duration-200 hover:scale-110",
                      star <= overallRating ? "text-yellow-400" : "text-gray-300"
                    )}
                  >
                    <Star 
                      className="w-10 h-10" 
                      fill={star <= overallRating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
              {overallRating > 0 && (
                <p className="mt-2 text-muted-foreground">
                  {getRatingLabel(overallRating)}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-lg font-medium text-center">Would you recommend this moment?</p>
              <div className="flex justify-center gap-4">
                <Button
                  variant={wouldRecommend === true ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setWouldRecommend(true)}
                  className="gap-2"
                >
                  <ThumbsUp className="w-5 h-5" />
                  Yes, absolutely!
                </Button>
                <Button
                  variant={wouldRecommend === false ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setWouldRecommend(false)}
                  className="gap-2"
                >
                  <Heart className="w-5 h-5" />
                  Not really
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Detailed Ratings */}
        {currentStep === 'experience' && (
          <div className="space-y-6">
            <p className="text-lg font-medium">Rate your experience (optional)</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Experience Quality</span>
                  <span className="text-sm text-muted-foreground">
                    {experienceRating > 0 ? getRatingLabel(experienceRating) : 'Not rated'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setExperienceRating(star)}
                      className={cn(
                        "p-1 transition-all duration-200 hover:scale-110",
                        star <= experienceRating ? "text-yellow-400" : "text-gray-300"
                      )}
                    >
                      <Star 
                        className="w-8 h-8" 
                        fill={star <= experienceRating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Value Received</span>
                  <span className="text-sm text-muted-foreground">
                    {valueRating > 0 ? getRatingLabel(valueRating) : 'Not rated'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setValueRating(star)}
                      className={cn(
                        "p-1 transition-all duration-200 hover:scale-110",
                        star <= valueRating ? "text-yellow-400" : "text-gray-300"
                      )}
                    >
                      <Star 
                        className="w-8 h-8" 
                        fill={star <= valueRating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Written Feedback */}
        {currentStep === 'feedback' && (
          <div className="space-y-6">
            <p className="text-lg font-medium">Share your experience (optional)</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Review Title
                </label>
                <Input
                  placeholder="e.g., 'A truly transformative evening'"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  What made this moment special?
                </label>
                <Textarea
                  placeholder="Describe what stood out to you..."
                  value={whatMadeSpecial}
                  onChange={(e) => setWhatMadeSpecial(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {whatMadeSpecial.length}/500 characters
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Full Review
                </label>
                <Textarea
                  placeholder="Share more details about your experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {reviewText.length}/2000 characters
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Tags */}
        {currentStep === 'tags' && (
          <div className="space-y-4">
            <p className="text-lg font-medium">What describes this moment? (optional)</p>
            <p className="text-sm text-muted-foreground">
              Select all that apply to help others find similar moments.
            </p>
            
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    selectedTags.includes(tag.id)
                      ? cn(tag.color, "ring-2 ring-offset-1 ring-primary")
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {tag.label}
                </button>
              ))}
            </div>
            
            {selectedTags.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        )}

        {/* Step 5: Share & Submit */}
        {currentStep === 'share' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium">Almost done!</p>
              <p className="text-muted-foreground">
                Your review will help others discover great moments and help hosts improve their events.
              </p>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Your Review Summary
              </h4>
              <div className="text-sm space-y-1">
                <p><strong>Overall:</strong> {overallRating > 0 ? `${overallRating}/5 - ${getRatingLabel(overallRating)}` : 'Not rated'}</p>
                <p><strong>Recommend:</strong> {wouldRecommend === true ? 'Yes!' : wouldRecommend === false ? 'No' : 'Not answered'}</p>
                {experienceRating > 0 && <p><strong>Experience:</strong> {experienceRating}/5</p>}
                {valueRating > 0 && <p><strong>Value:</strong> {valueRating}/5</p>}
                {reviewTitle && <p><strong>Title:</strong> {reviewTitle}</p>}
                {selectedTags.length > 0 && (
                  <p><strong>Tags:</strong> {selectedTags.map(t => TAGS.find(tag => tag.id === t)?.label.split(' ')[1]).join(', ')}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {}}
                className="flex-1 gap-2"
              >
                <Camera className="w-4 h-4" />
                Add Photo
              </Button>
              <Button
                variant="outline"
                onClick={() => {}}
                className="flex-1 gap-2"
              >
                <Video className="w-4 h-4" />
                Add Video
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep === 'share' ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Submit Review
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
