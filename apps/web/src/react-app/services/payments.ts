import { API_BASE_URL, PAYMENT_CONFIG } from '@/react-app/config';
import { apiFetch } from '../utils/api';

export type PaymentProvider = 'stripe' | 'coinbase' | 'mock';

export interface CheckoutRequest {
  provider?: PaymentProvider;
  planId?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface CheckoutResponse {
  provider: PaymentProvider;
  url: string;
  status: 'mock' | 'ready';
  expiresAt?: string;
}

export interface PaymentProviderSummary {
  provider: PaymentProvider;
  enabled: boolean;
  ready: boolean;
  publishableKey?: string;
  mode: 'mock' | 'live';
}

export interface ProvidersResponse {
  providers: PaymentProviderSummary[];
  defaultProvider: PaymentProvider;
}

interface ProviderPayload {
  provider?: string;
  enabled?: boolean;
  ready?: boolean;
  publishableKey?: string;
  mode?: string;
}

interface ProvidersApiResponse {
  status?: 'success' | 'error';
  data?: {
    providers?: ProviderPayload[];
    defaultProvider?: string;
  };
  message?: string;
}

interface CheckoutApiResponse {
  status?: 'success' | 'error';
  data?: {
    provider?: string;
    url?: string;
    status?: string;
    expiresAt?: string;
  };
  message?: string;
}

const mockCheckout = (provider: PaymentProvider = 'mock'): CheckoutResponse => {
  const base = typeof window !== 'undefined' ? window.location.origin : API_BASE_URL || 'http://localhost:5173';
  const url = `${base}/payments/mock-checkout?provider=${provider}`;

  return {
    provider,
    url,
    status: 'mock',
  };
};

const normaliseProvider = (name?: string): PaymentProvider => {
  switch ((name || '').toLowerCase()) {
    case 'stripe':
      return 'stripe';
    case 'coinbase':
    case 'coinbase-commerce':
      return 'coinbase';
    default:
      return 'mock';
  }
};

export const paymentsService = {
  async listProviders(): Promise<ProvidersResponse> {
    try {
      const response = await apiFetch('/api/payments/providers');

      if (!response.ok) {
        throw new Error(`Failed to load payment providers (${response.status})`);
      }

      const payload = (await response.json().catch(() => null)) as ProvidersApiResponse | null;

      if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid providers response');
      }

      const providers = Array.isArray(payload.data?.providers)
        ? payload.data.providers.map((provider: ProviderPayload) => ({
            provider: normaliseProvider(provider?.provider),
            enabled: Boolean(provider?.enabled),
            ready: Boolean(provider?.ready),
            publishableKey: provider?.publishableKey,
            mode: provider?.mode === 'live' ? 'live' : 'mock',
          }))
        : [];

      return {
        providers,
        defaultProvider: normaliseProvider(payload.data?.defaultProvider || PAYMENT_CONFIG.defaultProvider),
      };
    } catch (error) {
      console.warn('[Payments] Falling back to config providers', error);

      const paymentsEnabled = PAYMENT_CONFIG.enabled;

      const providers: PaymentProviderSummary[] = [
        {
          provider: 'stripe',
          enabled: paymentsEnabled && Boolean(PAYMENT_CONFIG.stripePublishableKey),
          ready: paymentsEnabled && Boolean(PAYMENT_CONFIG.stripePublishableKey),
          publishableKey: PAYMENT_CONFIG.stripePublishableKey,
          mode: paymentsEnabled && PAYMENT_CONFIG.stripePublishableKey ? 'live' : 'mock',
        },
        {
          provider: 'coinbase',
          enabled: paymentsEnabled && Boolean(PAYMENT_CONFIG.coinbaseCommerceKey),
          ready: paymentsEnabled && Boolean(PAYMENT_CONFIG.coinbaseCommerceKey),
          publishableKey: PAYMENT_CONFIG.coinbaseCommerceKey,
          mode: paymentsEnabled && PAYMENT_CONFIG.coinbaseCommerceKey ? 'live' : 'mock',
        },
        {
          provider: 'mock',
          enabled: !paymentsEnabled,
          ready: true,
          mode: 'mock',
        },
      ];

      return {
        providers,
        defaultProvider: normaliseProvider(PAYMENT_CONFIG.defaultProvider),
      };
    }
  },

  async startCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
    const provider = request.provider || normaliseProvider(PAYMENT_CONFIG.defaultProvider);

    if (!provider || !request.planId) {
      throw new Error('provider and planId required');
    }

    if (!PAYMENT_CONFIG.enabled) {
      return mockCheckout(provider);
    }

    try {
      const response = await apiFetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          plan_id: request.planId,
          success_url: request.successUrl,
          cancel_url: request.cancelUrl,
          metadata: request.metadata,
        }),
      });

      const payload = (await response.json().catch(() => null)) as CheckoutApiResponse | null;

      if (!response.ok || !payload || payload.status !== 'success') {
        throw new Error(payload?.message || 'Checkout unavailable');
      }

      const data = payload.data || {};

      if (!data.url) {
        throw new Error('Checkout response missing URL');
      }

      return {
        provider: normaliseProvider(data.provider || provider),
        url: data.url,
        status: data.status === 'ready' ? 'ready' : 'mock',
        expiresAt: data.expiresAt,
      };
    } catch (error) {
      console.warn('[Payments] Falling back to mock checkout', error);
      return mockCheckout(provider);
    }
  },
};

export default paymentsService;
