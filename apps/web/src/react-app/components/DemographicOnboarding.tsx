import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { api } from '../utils/api';
import { toast } from 'sonner';
import { 
  Cake, 
  Heart, 
  Baby, 
  Dumbbell, 
  Utensils, 
  Briefcase, 
  Camera,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';

interface ProfilingQuestion {
  id: string;
  question_key: string;
  question_text: string;
  question_short: string;
  description: string;
  input_type: 'single_select' | 'multi_select' | 'date' | 'text' | 'number' | 'boolean';
  options?: Array<{ value: string; label: string; emoji?: string }>;
  category: string;
  points_reward: number;
  field_mapping: string;
}

interface DemographicData {
  birthday?: string;
  gender?: string;
  marital_status?: string;
  has_children?: boolean;
  children_ages?: string[];
  has_pets?: boolean;
  pet_types?: string[];
  fitness_level?: string;
  dietary_preferences?: string[];
  work_schedule?: string;
  content_niches?: string[];
  [key: string]: any;
}

export function DemographicOnboarding({ 
  onComplete, 
  isOpen = true 
}: { 
  onComplete?: () => void; 
  isOpen?: boolean;
}) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState<ProfilingQuestion[]>([]);
  const [demographics, setDemographics] = useState<DemographicData>({});
  const [completionScore, setCompletionScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  // Fetch profiling questions on mount
  useEffect(() => {
    fetchQuestions();
    fetchCurrentDemographics();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/profiling-questions');
      if (response.data?.questions) {
        setQuestions(response.data.questions);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const fetchCurrentDemographics = async () => {
    try {
      const [demoResponse, completionResponse] = await Promise.all([
        api.get('/users/me/demographics'),
        api.get('/users/me/demographics/completion')
      ]);
      
      if (demoResponse.data?.demographics) {
        setDemographics(demoResponse.data.demographics);
      }
      
      if (completionResponse.data?.completion) {
        setCompletionScore(completionResponse.data.completion.score);
      }
    } catch (error) {
      console.error('Failed to fetch demographics:', error);
    }
  };

  const handleAnswer = (field: string, value: any) => {
    setDemographics(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelect = (field: string, value: string, checked: boolean) => {
    setDemographics(prev => {
      const current = prev[field] || [];
      if (checked) {
        return { ...prev, [field]: [...current, value] };
      } else {
        return { ...prev, [field]: current.filter((v: string) => v !== value) };
      }
    });
  };

  const saveCurrentStep = async () => {
    const currentQuestion = questions[step];
    if (!currentQuestion) return;

    setIsLoading(true);
    try {
      const field = currentQuestion.field_mapping;
      const value = demographics[field];
      
      if (value !== undefined && value !== null && value !== '') {
        const response = await api.post('/users/me/demographics', {
          [field]: value
        });
        
        if (response.data?.points_awarded) {
          setTotalPoints(prev => prev + response.data.points_awarded);
          toast.success(`+${response.data.points_awarded} points!`);
        }
        
        if (response.data?.completion_score !== undefined) {
          setCompletionScore(response.data.completion_score);
        }
      }
      
      // Move to next step or complete
      if (step < questions.length - 1) {
        setStep(prev => prev + 1);
      } else {
        toast.success('Profile complete! You\'ll now see personalized recommendations.');
        onComplete?.();
      }
    } catch (error) {
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const skipStep = () => {
    if (step < questions.length - 1) {
      setStep(prev => prev + 1);
    } else {
      onComplete?.();
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  // Get icon for question category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'demographics': return <Cake className="w-6 h-6 text-pink-500" />;
      case 'family': return <Baby className="w-6 h-6 text-blue-500" />;
      case 'lifestyle': return <Dumbbell className="w-6 h-6 text-green-500" />;
      case 'work': return <Briefcase className="w-6 h-6 text-orange-500" />;
      case 'preferences': return <Camera className="w-6 h-6 text-purple-500" />;
      default: return <Sparkles className="w-6 h-6 text-yellow-500" />;
    }
  };

  const currentQuestion = questions[step];

  if (!isOpen || questions.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentQuestion && getCategoryIcon(currentQuestion.category)}
              <div>
                <CardTitle className="text-lg">Complete Your Profile</CardTitle>
                <CardDescription>
                  Step {step + 1} of {questions.length}
                </CardDescription>
              </div>
            </div>
            {totalPoints > 0 && (
              <div className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                +{totalPoints} pts
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Profile Completion</span>
              <span className="font-medium">{completionScore}%</span>
            </div>
            <Progress value={completionScore} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentQuestion && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{currentQuestion.question_text}</h3>
                <p className="text-muted-foreground">{currentQuestion.description}</p>
              </div>

              {/* Single Select */}
              {currentQuestion.input_type === 'single_select' && currentQuestion.options && (
                <RadioGroup
                  value={demographics[currentQuestion.field_mapping] || ''}
                  onValueChange={(value) => handleAnswer(currentQuestion.field_mapping, value)}
                  className="grid grid-cols-1 gap-3"
                >
                  {currentQuestion.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label 
                        htmlFor={option.value} 
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        {option.emoji && <span>{option.emoji}</span>}
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Multi Select */}
              {currentQuestion.input_type === 'multi_select' && currentQuestion.options && (
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3">
                      <Checkbox
                        id={option.value}
                        checked={(demographics[currentQuestion.field_mapping] || []).includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleMultiSelect(currentQuestion.field_mapping, option.value, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={option.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        {option.emoji && <span>{option.emoji}</span>}
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {/* Date Input */}
              {currentQuestion.input_type === 'date' && (
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={demographics[currentQuestion.field_mapping] || ''}
                    onChange={(e) => handleAnswer(currentQuestion.field_mapping, e.target.value)}
                    className="w-full"
                  />
                </div>
              )}

              {/* Boolean */}
              {currentQuestion.input_type === 'boolean' && (
                <RadioGroup
                  value={demographics[currentQuestion.field_mapping]?.toString() || ''}
                  onValueChange={(value) => handleAnswer(currentQuestion.field_mapping, value === 'true')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="yes" />
                    <Label htmlFor="yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="no" />
                    <Label htmlFor="no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={goBack}
              disabled={step === 0 || isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={skipStep}
                disabled={isLoading}
              >
                Skip
              </Button>
              <Button
                onClick={saveCurrentStep}
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  'Saving...'
                ) : step === questions.length - 1 ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Quick inline profile completion prompt
export function ProfileCompletionPrompt({ onClick }: { onClick: () => void }) {
  const [completion, setCompletion] = useState({ score: 0, next_suggestion: null as string | null });

  useEffect(() => {
    fetchCompletion();
  }, []);

  const fetchCompletion = async () => {
    try {
      const response = await api.get('/users/me/demographics/completion');
      if (response.data?.completion) {
        setCompletion(response.data.completion);
      }
    } catch (error) {
      console.error('Failed to fetch completion:', error);
    }
  };

  if (completion.score >= 80) return null;

  const suggestions: Record<string, string> = {
    birthday: 'Add your birthday for special rewards! 🎂',
    gender: 'Help us personalize your experience',
    marital_status: 'Get relationship-relevant opportunities 💕',
    children_info: 'Unlock family-friendly content 👶',
    fitness_level: 'Find fitness opportunities 💪',
    content_niches: 'Match with perfect brand deals 📸'
  };

  const message = completion.next_suggestion 
    ? suggestions[completion.next_suggestion] || 'Complete your profile for personalized recommendations'
    : 'Complete your profile for personalized recommendations';

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-purple-900">{message}</p>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={completion.score} className="h-1.5 w-24" />
              <span className="text-xs text-purple-600">{completion.score}% complete</span>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={onClick}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Complete Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Calendar Event Quick Add
export function QuickCalendarAdd({ 
  eventType, 
  title,
  onSuccess 
}: { 
  eventType: string; 
  title: string;
  onSuccess?: () => void;
}) {
  const [date, setDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = async () => {
    if (!date) return;

    try {
      await api.post('/users/me/calendar', {
        event_type: eventType,
        title: title,
        event_date: date,
        is_recurring: true
      });
      
      toast.success('Event added to your calendar!');
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to add event');
    }
  };

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <Cake className="w-4 h-4 mr-2" />
        Add {title}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-40"
      />
      <Button size="sm" onClick={handleSave}>
        <Check className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
    </div>
  );
}

export default DemographicOnboarding;
