import { useState } from 'react';
import { TrendingUp, Users, Award, BookOpen, Clock, ChevronRight, Edit2, Check, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  useStakeholderLeverage, 
  UserMomentJourney, 
  getJourneyTypeMeta 
} from '@/hooks/useStakeholderLeverage';
import { toast } from 'sonner';

export function PersonalJourney() {
  const { useUserJourneys, updateJourneyStory } = useStakeholderLeverage();
  const { data: journeys, isLoading } = useUserJourneys();
  const [editingJourney, setEditingJourney] = useState<string | null>(null);
  const [storyDraft, setStoryDraft] = useState('');

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!journeys || journeys.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-serif text-xl font-semibold mb-2">Your Journeys Await</h3>
          <p className="text-muted-foreground">
            As you attend moments, we'll track your growth arcs across different areas of your life—fitness, learning, community, and more.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Your Growth Arcs
          </span>
        </div>
        <h2 className="font-serif text-3xl font-bold">Personal Journeys</h2>
        <p className="text-muted-foreground">
          Track your evolution across different dimensions of life
        </p>
      </div>

      {journeys.map((journey) => (
        <JourneyCard
          key={journey.id}
          journey={journey}
          isEditing={editingJourney === journey.id}
          storyDraft={storyDraft}
          onStartEdit={() => {
            setEditingJourney(journey.id);
            setStoryDraft(journey.transformation_story || '');
          }}
          onSaveStory={() => {
            updateJourneyStory.mutate(
              { journeyId: journey.id, story: storyDraft },
              {
                onSuccess: () => setEditingJourney(null),
              }
            );
          }}
          onCancelEdit={() => setEditingJourney(null)}
          onStoryChange={setStoryDraft}
        />
      ))}
    </div>
  );
}

interface JourneyCardProps {
  journey: UserMomentJourney;
  isEditing: boolean;
  storyDraft: string;
  onStartEdit: () => void;
  onSaveStory: () => void;
  onCancelEdit: () => void;
  onStoryChange: (story: string) => void;
}

function JourneyCard({
  journey,
  isEditing,
  storyDraft,
  onStartEdit,
  onSaveStory,
  onCancelEdit,
  onStoryChange,
}: JourneyCardProps) {
  const meta = getJourneyTypeMeta(journey.journey_type);
  const progressConfidence = journey.confidence_score_start && journey.confidence_score_current
    ? ((journey.confidence_score_current - journey.confidence_score_start) / 10) * 100
    : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-2xl", meta.color)}>
              {meta.icon}
            </div>
            <div>
              <CardTitle className="text-lg">
                {journey.journey_name || `${meta.label} Journey`}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {journey.moment_count} moments • Started {new Date(journey.first_moment_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {journey.streak_days > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              {journey.streak_days} day streak
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Skill Progress */}
        {journey.skill_level_start && journey.skill_level_current && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Skill Level</span>
              <span className="font-medium">
                {journey.skill_level_start} → {journey.skill_level_current}
              </span>
            </div>
            <Progress 
              value={
                journey.skill_level_current === 'beginner' ? 25 :
                journey.skill_level_current === 'intermediate' ? 50 :
                journey.skill_level_current === 'advanced' ? 75 :
                100
              } 
              className="h-2"
            />
          </div>
        )}

        {/* Confidence Growth */}
        {progressConfidence > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Confidence Growth</span>
              <span className="font-medium text-green-600">
                +{Math.round(progressConfidence)}%
              </span>
            </div>
            <Progress value={50 + progressConfidence / 2} className="h-2" />
          </div>
        )}

        {/* Values Demonstrated */}
        {journey.values_demonstrated.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Values you've demonstrated</p>
            <div className="flex flex-wrap gap-2">
              {journey.values_demonstrated.map((value) => (
                <Badge key={value} variant="outline" className="capitalize">
                  {value}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Community Built */}
        {(journey.connections_made > 0 || journey.mentors_found.length > 0) && (
          <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
            {journey.connections_made > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  <strong>{journey.connections_made}</strong> connections
                </span>
              </div>
            )}
            {journey.mentors_found.length > 0 && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  <strong>{journey.mentors_found.length}</strong> mentors
                </span>
              </div>
            )}
            {journey.mentees_helped.length > 0 && (
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  <strong>{journey.mentees_helped.length}</strong> mentees
                </span>
              </div>
            )}
          </div>
        )}

        {/* Transformation Story */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Your transformation story</p>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={onStartEdit} className="gap-1">
                <Edit2 className="w-3 h-3" />
                {journey.transformation_story ? 'Edit' : 'Write'}
              </Button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                placeholder="Describe how this journey has transformed you..."
                value={storyDraft}
                onChange={(e) => onStoryChange(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={onSaveStory} className="gap-1">
                  <Check className="w-3 h-3" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={onCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : journey.transformation_story ? (
            <p className="text-foreground leading-relaxed bg-secondary/30 p-3 rounded-lg">
              {journey.transformation_story}
            </p>
          ) : (
            <p className="text-muted-foreground italic">
              No story written yet. Capture your transformation...
            </p>
          )}
        </div>

        {/* Key Moments Timeline */}
        {journey.key_moments && journey.key_moments.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Key moments</p>
            <div className="space-y-2">
              {journey.key_moments.slice(0, 3).map((moment, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium">{moment.significance}</p>
                    <p className="text-muted-foreground">{moment.reflection}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {journey.badges_earned.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Badges earned</p>
            <div className="flex flex-wrap gap-2">
              {journey.badges_earned.map((badge) => (
                <Badge key={badge} className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                  <Award className="w-3 h-3 mr-1" />
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
