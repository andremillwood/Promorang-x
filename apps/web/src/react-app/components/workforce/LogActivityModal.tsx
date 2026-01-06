import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (activity: any) => void;
}

export default function LogActivityModal({ isOpen, onClose, onSuccess }: LogActivityModalProps) {
  const [type, setType] = useState('');
  const [target, setTarget] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newActivity = {
      id: Date.now(),
      action: type === 'acquisition' ? 'User Acquisition' : 
              type === 'content' ? 'Content Creation' : 
              type === 'event' ? 'Hosted Event' : 'Other Activity',
      target: target,
      time: 'Just now',
      points: '+50'
    };
    
    onSuccess(newActivity);
    setSubmitting(false);
    setType('');
    setTarget('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-pr-surface-card border-pr-surface-border text-pr-text-1">
        <DialogHeader>
          <DialogTitle>Log Workforce Activity</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Activity Type</Label>
            <Select onValueChange={setType} value={type}>
              <SelectTrigger>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="acquisition">User Acquisition</SelectItem>
                <SelectItem value="content">Content Creation</SelectItem>
                <SelectItem value="event">Hosted Event/Pod</SelectItem>
                <SelectItem value="business">Business Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Target / Subject</Label>
            <Input 
              placeholder="e.g. @username, Event Name, Business Name" 
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea 
              placeholder="Add details about this activity..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!type || !target || submitting}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {submitting ? 'Logging...' : 'Log Activity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
