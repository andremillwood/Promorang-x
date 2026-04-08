import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSubmitHostApplication } from '@/hooks/useRoles';

interface HostApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HostApplicationModal({ isOpen, onClose }: HostApplicationModalProps) {
    const [motivation, setMotivation] = useState('');
    const [momentIdea, setMomentIdea] = useState('');
    const submitApplication = useSubmitHostApplication();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!motivation.trim() || !momentIdea.trim()) {
            return;
        }

        await submitApplication.mutateAsync({
            motivation: motivation.trim(),
            moment_idea: momentIdea.trim(),
        });

        // Reset form and close
        setMotivation('');
        setMomentIdea('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-serif text-xl font-bold">Apply to Host</h2>
                            <p className="text-sm text-muted-foreground">
                                Fast-track your hosting journey
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Motivation */}
                    <div className="space-y-2">
                        <Label htmlFor="motivation">
                            Why do you want to host Moments?
                        </Label>
                        <Textarea
                            id="motivation"
                            placeholder="Share your motivation for becoming a host..."
                            value={motivation}
                            onChange={(e) => setMotivation(e.target.value)}
                            rows={4}
                            required
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            Tell us what excites you about hosting and bringing people together.
                        </p>
                    </div>

                    {/* Moment Idea */}
                    <div className="space-y-2">
                        <Label htmlFor="moment-idea">
                            Describe your first Moment idea
                        </Label>
                        <Textarea
                            id="moment-idea"
                            placeholder="What kind of Moment would you create first?"
                            value={momentIdea}
                            onChange={(e) => setMomentIdea(e.target.value)}
                            rows={4}
                            required
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            Give us a glimpse of the experience you'd create for participants.
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-sm text-foreground">
                            <strong>Review Time:</strong> We'll review your application within 24 hours.
                            If approved, you'll be able to create Moments immediately!
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={submitApplication.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={submitApplication.isPending || !motivation.trim() || !momentIdea.trim()}
                        >
                            {submitApplication.isPending ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
