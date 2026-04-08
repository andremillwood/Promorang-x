import { useState } from 'react';
import { Clock, CheckCircle, XCircle, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    usePendingHostApplications,
    useApproveHostApplication,
    useRejectHostApplication,
    type HostApplication,
} from '@/hooks/useRoles';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export function AdminHostApplicationsTab() {
    const { data: applications, isLoading } = usePendingHostApplications();
    const approveApplication = useApproveHostApplication();
    const rejectApplication = useRejectHostApplication();

    const [selectedApp, setSelectedApp] = useState<HostApplication | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const handleApprove = async (applicationId: string) => {
        await approveApplication.mutateAsync(applicationId);
    };

    const handleRejectClick = (app: HostApplication) => {
        setSelectedApp(app);
        setShowRejectDialog(true);
    };

    const handleRejectConfirm = async () => {
        if (!selectedApp || !rejectReason.trim()) return;

        await rejectApplication.mutateAsync({
            applicationId: selectedApp.id,
            reason: rejectReason.trim(),
        });

        setShowRejectDialog(false);
        setSelectedApp(null);
        setRejectReason('');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">Loading applications...</p>
                </div>
            </div>
        );
    }

    if (!applications || applications.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-serif text-lg font-bold mb-2">No Pending Applications</h3>
                    <p className="text-sm text-muted-foreground">
                        All host applications have been reviewed.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {applications.map((app) => (
                    <div
                        key={app.id}
                        className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors"
                    >
                        <div className="flex items-start gap-4">
                            {/* User Avatar */}
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <User className="w-6 h-6 text-primary" />
                            </div>

                            {/* Application Content */}
                            <div className="flex-1 space-y-4">
                                {/* Header */}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-serif text-lg font-bold">
                                            {(app as any).profiles?.full_name || 'Unknown User'}
                                        </h3>
                                        <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs font-medium rounded">
                                            Pending
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Applied {new Date(app.created_at).toLocaleDateString()}
                                        {(app as any).profiles?.maturity_state !== undefined && (
                                            <span className="ml-2">
                                                • Access Rank {(app as any).profiles.maturity_state}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/* Motivation */}
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-1">
                                        Motivation
                                    </Label>
                                    <p className="text-sm">{app.motivation}</p>
                                </div>

                                {/* Moment Idea */}
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-1">
                                        First Moment Idea
                                    </Label>
                                    <p className="text-sm">{app.moment_idea}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={() => handleApprove(app.id)}
                                        disabled={approveApplication.isPending}
                                        className="gap-2"
                                        size="sm"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        {approveApplication.isPending ? 'Approving...' : 'Approve'}
                                    </Button>
                                    <Button
                                        onClick={() => handleRejectClick(app)}
                                        disabled={rejectApplication.isPending}
                                        variant="outline"
                                        className="gap-2"
                                        size="sm"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Application</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this application.
                            The user will see this feedback.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reject-reason">Rejection Reason</Label>
                            <Textarea
                                id="reject-reason"
                                placeholder="Explain why this application is being rejected..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRejectDialog(false);
                                setRejectReason('');
                            }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRejectConfirm}
                            disabled={!rejectReason.trim() || rejectApplication.isPending}
                            variant="destructive"
                            className="flex-1"
                        >
                            {rejectApplication.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
