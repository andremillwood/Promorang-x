import { useState } from 'react';
import { Sparkles, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHasRole, useHostApplication, useCheckHostUnlock } from '@/hooks/useRoles';
import { useAuth } from '@/contexts/AuthContext';
import { HostApplicationModal } from './HostApplicationModal';

export function HostUnlockBanner() {
    const { profile } = useAuth();
    const { data: hasHost, isLoading: loadingRole } = useHasRole('host');
    const { data: application, isLoading: loadingApp } = useHostApplication();
    const checkUnlock = useCheckHostUnlock();
    const [showModal, setShowModal] = useState(false);

    // Don't show if loading or user already has host role
    if (loadingRole || loadingApp || hasHost) return null;

    // Check if user qualifies for auto-unlock (Access Rank 3+)
    const maturityState = profile?.maturity_state || 0;
    const canAutoUnlock = maturityState >= 3;

    // If user can auto-unlock, show unlock button
    if (canAutoUnlock) {
        return (
            <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/20 rounded-lg">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-serif text-lg font-bold mb-1">
                            You Can Now Host Moments! 🎉
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            You've reached Access Rank 3 through consistent participation.
                            Unlock your Host role to start creating Moments!
                        </p>
                        <Button
                            onClick={() => checkUnlock.mutate()}
                            disabled={checkUnlock.isPending}
                            className="gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            {checkUnlock.isPending ? 'Unlocking...' : 'Unlock Host Role'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // If user has pending application, show status
    if (application?.status === 'pending') {
        return (
            <div className="p-4 bg-muted/50 border border-border rounded-xl">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-500/20 rounded-lg">
                        <Clock className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-serif text-lg font-bold mb-1">
                            Application Under Review
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            We're reviewing your Host application. You'll hear from us within 24 hours!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // If application was rejected, show feedback
    if (application?.status === 'rejected') {
        return (
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-destructive/20 rounded-lg">
                        <XCircle className="w-6 h-6 text-destructive" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-serif text-lg font-bold mb-1">
                            Application Not Approved
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            {application.rejection_reason || 'Your application was not approved at this time.'}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                            Keep building your Access Rank! You can apply again or wait until Rank 3 for auto-unlock.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setShowModal(true)}
                            size="sm"
                        >
                            Apply Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // If application was approved (shouldn't show since hasHost would be true)
    if (application?.status === 'approved') {
        return null;
    }

    // Show apply CTA for users without application
    // Only show after 3 check-ins (maturity_state >= 1)
    if (maturityState < 1) return null;

    return (
        <>
            <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/20 rounded-lg">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-serif text-lg font-bold mb-1">
                            Want to Host Moments?
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            You're building consistency! Apply now for fast-track hosting,
                            or reach Access Rank 3 for automatic unlock.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowModal(true)}
                                className="gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Apply to Host
                            </Button>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckCircle className="w-4 h-4" />
                                <span>Auto-unlock at Rank 3 ({3 - maturityState} more days)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <HostApplicationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </>
    );
}
