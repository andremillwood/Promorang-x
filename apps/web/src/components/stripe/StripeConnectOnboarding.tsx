import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ExternalLink, CheckCircle, AlertCircle, DollarSign } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ConnectAccountStatus {
    accountId: string | null;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    onboardingRequired: boolean;
}

/**
 * Stripe Connect Onboarding Component
 * Allows hosts to set up Stripe Connect for automated payouts
 */
const StripeConnectOnboarding = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [accountStatus, setAccountStatus] = useState<ConnectAccountStatus | null>(null);

    useEffect(() => {
        checkConnectStatus();
    }, []);

    const checkConnectStatus = async () => {
        setIsLoading(true);
        try {
            // Check if user has a Stripe Connect account
            const response = await fetch(`${API_URL}/api/stripe/connect/account/${user?.id}`, {
                headers: {
                    'Authorization': `Bearer ${user?.id}`,
                },
            });

            if (response.ok) {
                const account = await response.json();
                setAccountStatus({
                    accountId: account.id,
                    chargesEnabled: account.chargesEnabled,
                    payoutsEnabled: account.payoutsEnabled,
                    detailsSubmitted: account.detailsSubmitted,
                    onboardingRequired: !account.detailsSubmitted,
                });
            } else {
                // No account exists yet
                setAccountStatus(null);
            }
        } catch (error: any) {
            console.error('Error checking Connect status:', error);
            setAccountStatus(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAccount = async () => {
        setIsCreating(true);
        try {
            // Create Stripe Connect account
            const createResponse = await fetch(`${API_URL}/api/stripe/connect/account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.id}`,
                },
            });

            if (!createResponse.ok) {
                const error = await createResponse.json();
                throw new Error(error.error || 'Failed to create Connect account');
            }

            const { accountId } = await createResponse.json();

            // Get onboarding link
            const linkResponse = await fetch(`${API_URL}/api/stripe/connect/account-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.id}`,
                },
                body: JSON.stringify({ accountId }),
            });

            if (!linkResponse.ok) {
                const error = await linkResponse.json();
                throw new Error(error.error || 'Failed to create onboarding link');
            }

            const { url } = await linkResponse.json();

            // Redirect to Stripe onboarding
            window.location.href = url;
        } catch (error: any) {
            console.error('Error creating Connect account:', error);
            toast({
                title: "Setup Failed",
                description: error.message,
                variant: "destructive",
            });
            setIsCreating(false);
        }
    };

    const handleContinueOnboarding = async () => {
        if (!accountStatus?.accountId) return;

        setIsCreating(true);
        try {
            const response = await fetch(`${API_URL}/api/stripe/connect/account-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.id}`,
                },
                body: JSON.stringify({ accountId: accountStatus.accountId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create onboarding link');
            }

            const { url } = await response.json();
            window.location.href = url;
        } catch (error: any) {
            console.error('Error continuing onboarding:', error);
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-12">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Checking payout setup...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Account fully set up
    if (accountStatus && accountStatus.payoutsEnabled && accountStatus.chargesEnabled) {
        return (
            <Card className="border-green-500/50 bg-green-500/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        Payouts Enabled
                    </CardTitle>
                    <CardDescription>
                        Your Stripe Connect account is fully set up and ready to receive payouts.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Charges enabled</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Payouts enabled</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Onboarding complete</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Account exists but onboarding incomplete
    if (accountStatus && accountStatus.onboardingRequired) {
        return (
            <Card className="border-amber-500/50 bg-amber-500/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <AlertCircle className="w-5 h-5" />
                        Complete Payout Setup
                    </CardTitle>
                    <CardDescription>
                        You've started the setup process but haven't completed it yet.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <AlertDescription>
                            To receive payouts, you need to complete the Stripe Connect onboarding process.
                            This includes verifying your identity and adding your bank account details.
                        </AlertDescription>
                    </Alert>

                    <Button
                        onClick={handleContinueOnboarding}
                        disabled={isCreating}
                        className="w-full"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Redirecting...
                            </>
                        ) : (
                            <>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Continue Setup
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // No account - show setup option
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Set Up Payouts
                </CardTitle>
                <CardDescription>
                    Enable automated payouts to your bank account via Stripe Connect
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p>With Stripe Connect, you can:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Receive automated payouts for your hosted moments</li>
                        <li>Track your earnings in real-time</li>
                        <li>Get paid directly to your bank account</li>
                        <li>Benefit from Stripe's secure payment processing</li>
                    </ul>
                </div>

                <Alert>
                    <AlertDescription>
                        You'll be redirected to Stripe to complete a quick onboarding process.
                        This typically takes 5-10 minutes and requires basic business information.
                    </AlertDescription>
                </Alert>

                <Button
                    onClick={handleCreateAccount}
                    disabled={isCreating}
                    className="w-full"
                >
                    {isCreating ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Setting up...
                        </>
                    ) : (
                        <>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Set Up Payouts with Stripe
                        </>
                    )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                    By continuing, you agree to Stripe's{" "}
                    <a
                        href="https://stripe.com/connect-account/legal"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-foreground"
                    >
                        Connected Account Agreement
                    </a>
                </p>
            </CardContent>
        </Card>
    );
};

export default StripeConnectOnboarding;
