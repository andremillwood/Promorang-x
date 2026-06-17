import { useState, useEffect } from "react";
import { loadStripe, Stripe, StripeElements } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Stripe promise (initialized once)
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Initialize Stripe with publishable key from backend
 */
const getStripe = async () => {
    if (!stripePromise) {
        try {
            const response = await fetch(`${API_URL}/api/stripe/config`);
            const { publishableKey, configured } = await response.json();

            if (!configured || !publishableKey) {
                console.warn('Stripe is not configured');
                return null;
            }

            stripePromise = loadStripe(publishableKey);
        } catch (error) {
            console.error('Error loading Stripe:', error);
            return null;
        }
    }
    return stripePromise;
};

interface CheckoutFormProps {
    clientSecret: string;
    amount: number;
    currency: string;
    onSuccess: (paymentIntent?: any) => void;
    onCancel: () => void;
}

/**
 * Checkout form component (used inside Elements provider)
 */
const CheckoutForm = ({ clientSecret, amount, currency, onSuccess, onCancel }: CheckoutFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSucceeded, setPaymentSucceeded] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/dashboard?payment=success`,
                },
                redirect: 'if_required',
            });

            if (error) {
                toast({
                    title: "Payment Failed",
                    description: error.message,
                    variant: "destructive",
                });
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                setPaymentSucceeded(true);
                toast({
                    title: "Payment Successful",
                    description: `Your payment of ${currency.toUpperCase()} ${amount.toLocaleString()} has been processed.`,
                });
                setTimeout(() => {
                    onSuccess(paymentIntent);
                }, 1500);
            }
        } catch (err: any) {
            toast({
                title: "Payment Error",
                description: err.message || "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (paymentSucceeded) {
        return (
            <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                    Payment Successful!
                </h3>
                <p className="text-muted-foreground">
                    Redirecting...
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className="flex-1"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay {currency.toUpperCase()} {amount.toLocaleString()}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};

interface StripeCheckoutProps {
    amount: number;
    currency?: string;
    paymentIntentPath?: string;
    paymentIntentBody?: Record<string, any>;
    metadata?: Record<string, any>;
    onSuccess: (paymentIntent?: any) => void;
    onCancel: () => void;
}

/**
 * Stripe Checkout Component
 * Creates payment intent and renders Stripe Elements
 */
const StripeCheckout = ({
    amount,
    currency = 'usd',
    paymentIntentPath = '/api/stripe/payment-intent',
    paymentIntentBody,
    metadata = {},
    onSuccess,
    onCancel,
}: StripeCheckoutProps) => {
    const { toast } = useToast();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);

    useEffect(() => {
        initializePayment();
    }, [amount, currency, paymentIntentPath]);

    const initializePayment = async () => {
        setIsLoading(true);
        try {
            // Load Stripe
            const stripe = await getStripe();
            if (!stripe) {
                toast({
                    title: "Payment Unavailable",
                    description: "Payment processing is not configured. Please contact support.",
                    variant: "destructive",
                });
                onCancel();
                return;
            }
            setStripeInstance(stripe);

            const session = await supabase.auth.getSession();
            const accessToken = session.data.session?.access_token;
            if (!accessToken) {
                throw new Error('Authentication session expired');
            }

            // Create payment intent
            const response = await fetch(`${API_URL}${paymentIntentPath}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(paymentIntentBody || {
                    amount,
                    currency,
                    metadata,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create payment intent');
            }

            const payload = await response.json();
            const intent = payload.intent || payload;
            if (intent.manual_required) {
                throw new Error(intent.message || 'Card payment is unavailable for this Moment');
            }
            const secret = intent.clientSecret || intent.client_secret;
            if (!secret) throw new Error('Payment intent did not return a client secret');
            setClientSecret(secret);
        } catch (error: any) {
            console.error('Error initializing payment:', error);
            toast({
                title: "Payment Initialization Failed",
                description: error.message,
                variant: "destructive",
            });
            onCancel();
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-12">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Initializing payment...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!clientSecret || !stripeInstance) {
        return (
            <Card>
                <CardContent className="py-8">
                    <p className="text-center text-muted-foreground">
                        Unable to initialize payment. Please try again.
                    </p>
                    <Button onClick={onCancel} className="mt-4 mx-auto block">
                        Go Back
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: '#0070f3',
            },
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Complete Payment
                </CardTitle>
                <CardDescription>
                    Total: {currency.toUpperCase()} {amount.toLocaleString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Elements stripe={stripeInstance} options={options}>
                    <CheckoutForm
                        clientSecret={clientSecret}
                        amount={amount}
                        currency={currency}
                        onSuccess={onSuccess}
                        onCancel={onCancel}
                    />
                </Elements>
            </CardContent>
        </Card>
    );
};

export default StripeCheckout;
