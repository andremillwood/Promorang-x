import { useState } from 'react';
import { Fingerprint, Sparkles, Check, Edit2, ChevronRight, Lock, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  useStakeholderLeverage, 
  UserIdentityMarker, 
  getIdentityDimensionDescription 
} from '@/hooks/useStakeholderLeverage';
import { toast } from 'sonner';

const IDENTITY_DIMENSIONS: Record<string, { icon: string; color: string }> = {
  explorer: { icon: '🧭', color: 'bg-blue-500/10 text-blue-600' },
  connector: { icon: '🤝', color: 'bg-green-500/10 text-green-600' },
  creator: { icon: '✨', color: 'bg-purple-500/10 text-purple-600' },
  learner: { icon: '📚', color: 'bg-amber-500/10 text-amber-600' },
  mentor: { icon: '🎓', color: 'bg-teal-500/10 text-teal-600' },
  advocate: { icon: '📢', color: 'bg-rose-500/10 text-rose-600' },
};

export function IdentityMarkers() {
  const { useUserIdentityMarkers, confirmIdentityMarker } = useStakeholderLeverage();
  const { data: markers, isLoading } = useUserIdentityMarkers();
  const [editingMarker, setEditingMarker] = useState<string | null>(null);
  const [reflectionDraft, setReflectionDraft] = useState('');

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!markers || markers.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Fingerprint className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-serif text-xl font-semibold mb-2">Your Identity is Forming</h3>
          <p className="text-muted-foreground">
            As you attend diverse moments, we'll identify the unique characteristics that define who you're becoming.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Separate confirmed and unconfirmed markers
  const confirmed = markers.filter(m => m.is_user_confirmed);
  const unconfirmed = markers.filter(m => !m.is_user_confirmed);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Fingerprint className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Who You're Becoming
          </span>
        </div>
        <h2 className="font-serif text-3xl font-bold">Your Identity Markers</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Characteristics demonstrated through your moment patterns. Confirm the ones that resonate with who you see yourself as.
        </p>
      </div>

      {/* Confirmed Identity */}
      {confirmed.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Confirmed Characteristics
          </h3>
          {confirmed.map((marker) => (
            <IdentityCard
              key={marker.id}
              marker={marker}
              isEditing={editingMarker === marker.id}
              reflectionDraft={reflectionDraft}
              onStartEdit={() => {
                setEditingMarker(marker.id);
                setReflectionDraft(marker.user_reflection || '');
              }}
              onSave={() => {
                confirmIdentityMarker.mutate(
                  { markerId: marker.id, reflection: reflectionDraft },
                  {
                    onSuccess: () => setEditingMarker(null),
                  }
                );
              }}
              onCancel={() => setEditingMarker(null)}
              onReflectionChange={setReflectionDraft}
            />
          ))}
        </div>
      )}

      {/* Suggested Identity */}
      {unconfirmed.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg text-muted-foreground">
            Suggested (based on your patterns)
          </h3>
          {unconfirmed.map((marker) => (
            <IdentityCard
              key={marker.id}
              marker={marker}
              isEditing={editingMarker === marker.id}
              reflectionDraft={reflectionDraft}
              onStartEdit={() => {
                setEditingMarker(marker.id);
                setReflectionDraft(marker.user_reflection || '');
              }}
              onSave={() => {
                confirmIdentityMarker.mutate(
                  { markerId: marker.id, reflection: reflectionDraft },
                  {
                    onSuccess: () => setEditingMarker(null),
                  }
                );
              }}
              onCancel={() => setEditingMarker(null)}
              onReflectionChange={setReflectionDraft}
              isSuggested
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface IdentityCardProps {
  marker: UserIdentityMarker;
  isEditing: boolean;
  reflectionDraft: string;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onReflectionChange: (text: string) => void;
  isSuggested?: boolean;
}

function IdentityCard({
  marker,
  isEditing,
  reflectionDraft,
  onStartEdit,
  onSave,
  onCancel,
  onReflectionChange,
  isSuggested = false,
}: IdentityCardProps) {
  const meta = IDENTITY_DIMENSIONS[marker.dimension] || { icon: '✨', color: 'bg-muted text-muted-foreground' };
  const description = getIdentityDimensionDescription(marker.dimension);

  return (
    <Card className={cn(
      "transition-all duration-200",
      isSuggested && "border-dashed border-muted"
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-2xl", meta.color)}>
              {meta.icon}
            </div>
            <div>
              <CardTitle className="text-lg capitalize">
                {marker.dimension}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isSuggested && (
              <Badge variant={marker.is_public ? "default" : "outline"} className="gap-1">
                {marker.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {marker.is_public ? 'Public' : 'Private'}
              </Badge>
            )}
            {marker.is_user_confirmed && (
              <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Strength Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Strength in this characteristic</span>
            <span className="font-medium">{marker.strength_score}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500",
                marker.strength_score > 75 ? "bg-green-500" :
                marker.strength_score > 50 ? "bg-blue-500" :
                "bg-amber-500"
              )}
              style={{ width: `${marker.strength_score}%` }}
            />
          </div>
        </div>

        {/* Evidence */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Based on {marker.supporting_moments.length} supporting moments
          </p>
          <p className="text-xs text-muted-foreground">
            Evidence since {new Date(marker.first_evidence_at || '').toLocaleDateString()}
          </p>
        </div>

        {/* User Reflection */}
        {marker.is_user_confirmed && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Your reflection</p>
              {!isEditing && (
                <Button variant="ghost" size="sm" onClick={onStartEdit} className="gap-1">
                  <Edit2 className="w-3 h-3" />
                  Edit
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  placeholder={`How does being a ${marker.dimension} show up in your life?`}
                  value={reflectionDraft}
                  onChange={(e) => onReflectionChange(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={onSave} className="gap-1">
                    <Check className="w-3 h-3" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : marker.user_reflection ? (
              <p className="text-foreground leading-relaxed bg-secondary/30 p-3 rounded-lg italic">
                "{marker.user_reflection}"
              </p>
            ) : null}
          </div>
        )}

        {/* Action for suggested markers */}
        {isSuggested && (
          <Button 
            onClick={onStartEdit} 
            className="w-full"
            variant="outline"
          >
            <Check className="w-4 h-4 mr-2" />
            Confirm This is Me
          </Button>
        )}

        {/* Visibility toggle for confirmed markers */}
        {marker.is_user_confirmed && !isEditing && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">Visibility</span>
            <div className="flex items-center gap-2">
              <Switch 
                checked={marker.is_public}
                onCheckedChange={(checked) => {
                  // TODO: Implement visibility toggle mutation
                  toast.success(checked ? 'Made public' : 'Made private');
                }}
              />
              <span className="text-sm">
                {marker.is_public ? 'Public' : 'Private'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
