import type { ReactNode } from 'react';

type StripeProviderProps = {
  children: ReactNode;
  publishableKey?: string;
  urlScheme?: string;
};

export function StripeProvider({ children }: StripeProviderProps) {
  return children;
}

export function useStripe() {
  return {
    initPaymentSheet: async () => ({
      error: { message: 'Card checkout is available in the native Expo app.' },
    }),
    presentPaymentSheet: async () => ({
      error: { message: 'Card checkout is available in the native Expo app.' },
    }),
  };
}
