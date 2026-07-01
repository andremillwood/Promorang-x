import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  UserCircle, 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  Gift,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { StepCelebration } from "./StepCelebration";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: typeof UserCircle;
  action: string;
  link: string;
  isComplete: boolean;
}

interface FirstStepsProps {
  onComplete?: () => void;
  onDismiss?: () => void;
}

export function FirstSteps({ onComplete, onDismiss }: FirstStepsProps) {
  const { user } = useAuth();
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [celebration, setCelebration] = useState<{ isOpen: boolean; stepName: string }>({ 
    isOpen: false, 
    stepName: "" 
  });
  const [previousCompleted, setPreviousCompleted] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const checkProgress = async () => {
      setLoading(true);
      
      // Check profile completion
      const { data: profile } = await supabase
        .from('users')
        .select('display_name, avatar_url, username')
        .eq('id', user.id)
        .single();

      const hasProfile = !!(profile?.display_name && profile?.avatar_url);
      const hasUsername = !!profile?.username;

      // Check if joined any moments
      const { count: joinedCount } = await supabase
        .from('moment_participants')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const hasJoined = (joinedCount || 0) > 0;

      // Check if checked in
      const { count: checkedInCount } = await supabase
        .from('moment_participants')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'checked_in');

      const hasCheckedIn = (checkedInCount || 0) > 0;

      // Check if following anyone
      const { count: followingCount } = await supabase
        .from('user_follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', user.id);

      const hasFollowing = (followingCount || 0) > 0;

      // Check if earned rewards
      const { data: rewards } = await (supabase as any)
        .from('economy_wallets')
        .select('points, promokeys, gems')
        .eq('user_id', user.id)
        .single();

      const hasRewards = (rewards?.points || 0) > 0 || (rewards?.promokeys || 0) > 0;

      const stepsData: Step[] = [
        {
          id: "profile",
          title: "Complete Your Profile",
          description: "Add your name and photo so others recognize you",
          icon: UserCircle,
          action: "Set up profile",
          link: "/dashboard/settings",
          isComplete: hasProfile
        },
        {
          id: "discover",
          title: "Find Your First Moment",
          description: "Browse local experiences and join something interesting",
          icon: Search,
          action: "Browse moments",
          link: "/discover",
          isComplete: hasJoined
        },
        {
          id: "checkin",
          title: "Check In On Location",
          description: "Verify your attendance and earn points",
          icon: MapPin,
          action: "Check in",
          link: "/check-in",
          isComplete: hasCheckedIn
        },
        {
          id: "follow",
          title: "Follow Creators",
          description: "Connect with hosts and creators you like",
          icon: Users,
          action: "Find people",
          link: "/creators",
          isComplete: hasFollowing
        },
        {
          id: "rewards",
          title: "Earn Your First Reward",
          description: "Collect points and keys for participation",
          icon: Gift,
          action: "View rewards",
          link: "/vault",
          isComplete: hasRewards
        }
      ];

      setSteps(stepsData);
      setLoading(false);

      // Check for newly completed steps
      const currentlyCompleted = stepsData.filter(s => s.isComplete).map(s => s.id);
      const newlyCompleted = currentlyCompleted.filter(id => !previousCompleted.includes(id));
      
      if (newlyCompleted.length > 0 && previousCompleted.length > 0) {
        // Trigger celebration for the most recently completed step
        const completedStep = stepsData.find(s => s.id === newlyCompleted[0]);
        if (completedStep) {
          setCelebration({ isOpen: true, stepName: completedStep.title });
        }
      }
      
      setPreviousCompleted(currentlyCompleted);

      // If all complete, call onComplete
      if (stepsData.every(s => s.isComplete)) {
        onComplete?.();
      }
    };

    checkProgress();
  }, [user, onComplete, previousCompleted]);

  if (dismissed || loading) return null;

  const completedCount = steps.filter(s => s.isComplete).length;
  const progress = (completedCount / steps.length) * 100;
  const allComplete = completedCount === steps.length;

  if (allComplete) return null;

  return (
    <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Getting Started
              </span>
            </div>
            <h2 className="text-xl font-bold font-serif">Complete Your Setup</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {completedCount === 0 
                ? "Let's get you started with 5 quick steps"
                : `Great progress! ${steps.length - completedCount} steps remaining`
              }
            </p>
          </div>
          <button 
            onClick={() => { setDismissed(true); onDismiss?.(); }}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-medium">{completedCount} of {steps.length} completed</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isLocked = index > 0 && !steps[index - 1].isComplete;
            
            return (
              <div 
                key={step.id}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                  step.isComplete 
                    ? "bg-muted/50" 
                    : isLocked 
                      ? "opacity-50" 
                      : "bg-card border border-border hover:border-primary/50 cursor-pointer"
                }`}
              >
                {/* Icon / Check */}
                <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.isComplete 
                    ? "bg-emerald-500/10 text-emerald-500" 
                    : isLocked 
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary"
                }`}>
                  {step.isComplete ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-sm ${step.isComplete ? "line-through text-muted-foreground" : ""}`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {step.description}
                  </p>
                </div>

                {/* Action */}
                {!step.isComplete && !isLocked && (
                  <Button size="sm" variant="ghost" className="flex-shrink-0" asChild>
                    <Link to={step.link}>
                      {step.action}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                )}

                {isLocked && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    Locked
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {completedCount >= 3 && (
          <div className="mt-6 pt-4 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              You're getting the hang of it! 🎉
            </p>
            <Button variant="outline" size="sm" onClick={() => { setDismissed(true); onDismiss?.(); }}>
              Hide This Guide
            </Button>
          </div>
        )}
      </CardContent>

      {/* Celebration Modal */}
      <StepCelebration
        isOpen={celebration.isOpen}
        stepName={celebration.stepName}
        onClose={() => setCelebration({ isOpen: false, stepName: "" })}
      />
    </Card>
  );
}

export default FirstSteps;
