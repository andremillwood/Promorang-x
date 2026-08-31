import { useState } from 'react';
import { Sparkles, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHasRole, useHostApplication, useCheckHostUnlock } from '@/hooks/useRoles';
import { useAuth } from '@/contexts/AuthContext';
import { HostApplicationModal } from './HostApplicationModal';
import { useI18n } from '@/i18n/I18nContext';

export function HostUnlockBanner() {
    const { t } = useI18n();
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
                            {t("hostUnlock.chapterTitle")}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            {t("hostUnlock.chapterCopy")}
                        </p>
                        <Button
                            onClick={() => checkUnlock.mutate()}
                            disabled={checkUnlock.isPending}
                            className="gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            {checkUnlock.isPending ? t("hostUnlock.unlocking") : t("hostUnlock.startHosting")}
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
                            {t("hostUnlock.reviewTitle")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {t("hostUnlock.reviewCopy")}
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
                            {t("hostUnlock.rejectedTitle")}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            {application.rejection_reason || t("hostUnlock.rejectedDefault")}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                            {t("hostUnlock.rejectedHint")}
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setShowModal(true)}
                            size="sm"
                        >
                            {t("hostUnlock.applyAgain")}
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
                            {t("hostUnlock.readyTitle")}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            {t("hostUnlock.readyCopy")}
                        </p>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowModal(true)}
                                className="gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                {t("hostUnlock.applyHost")}
                            </Button>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckCircle className="w-4 h-4" />
                                <span>{t("hostUnlock.invitedRank", { count: 3 - maturityState })}</span>
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
