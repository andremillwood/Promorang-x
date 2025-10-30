import { ShareListing, ShareOffer } from '@/shared/types';
import { apiFetch } from '@/react-app/utils/api';

const USE_MOCK_DATA = !import.meta.env.VITE_API_URL;

const mockListings = (): ShareListing[] => [
  {
    id: 'listing-demo-1',
    content_id: 'content-demo-1',
    content_title: 'Launch Campaign: Social Buzz',
    content_thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80',
    owner_id: '00000000-0000-0000-0000-000000000001',
    owner_name: 'Demo Creator',
    quantity: 60,
    remaining_quantity: 40,
    ask_price: 12.5,
    market_price: 12.2,
    status: 'active',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  },
];

export const fetchShareListings = async (ownerOnly = false): Promise<ShareListing[]> => {
  if (USE_MOCK_DATA) {
    if (ownerOnly) {
      return mockListings().filter((listing) => listing.owner_id === '00000000-0000-0000-0000-000000000001');
    }
    return mockListings();
  }

  try {
    const query = ownerOnly ? '?owner=true' : '';
    const response = await apiFetch(`/api/shares/listings${query}`, { credentials: 'include' });
    if (!response.ok) {
      return mockListings();
    }
    const data = await response.json();
    return data.listings || mockListings();
  } catch (error) {
    console.error('Failed to fetch share listings:', error);
    return mockListings();
  }
};

interface CreateListingPayload {
  content_id: string;
  content_title: string;
  content_thumbnail: string;
  quantity: number;
  ask_price: number;
}

export const createShareListing = async (payload: CreateListingPayload) => {
  if (USE_MOCK_DATA) {
    return {
      success: true,
      listing: {
        id: `listing-${Date.now()}`,
        owner_id: '00000000-0000-0000-0000-000000000001',
        owner_name: 'Demo Creator',
        remaining_quantity: payload.quantity,
        market_price: payload.ask_price,
        status: 'active',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        ...payload,
      },
      message: 'Listing created (mock)',
    };
  }

  const response = await apiFetch('/api/shares/listings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create listing');
  }

  return response.json();
};

interface CreateOfferPayload {
  content_id: string;
  seller_id?: string;
  quantity: number;
  bid_price: number;
  message?: string;
}

export const createShareOffer = async (payload: CreateOfferPayload) => {
  if (USE_MOCK_DATA) {
    return {
      success: true,
      offer: {
        id: `offer-${Date.now()}`,
        buyer_id: '00000000-0000-0000-0000-000000000001',
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        ...payload,
      },
      message: 'Offer submitted (mock)',
    };
  }

  const response = await apiFetch('/api/shares/offers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to submit offer');
  }

  return response.json();
};

const mockOffers = (): ShareOffer[] => [
  {
    id: 'offer-demo-1',
    content_id: 'content-demo-1',
    buyer_id: '00000000-0000-0000-0000-000000000005',
    seller_id: '00000000-0000-0000-0000-000000000001',
    quantity: 25,
    bid_price: 12.75,
    status: 'pending',
    message: 'Happy to take at a slight premium. Can settle within 24h.',
    content_title: 'Launch Campaign: Social Buzz',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'offer-demo-2',
    content_id: 'content-demo-2',
    buyer_id: '00000000-0000-0000-0000-000000000001',
    seller_id: '00000000-0000-0000-0000-000000000004',
    quantity: 30,
    bid_price: 18,
    status: 'pending',
    message: 'Would love to take this block before the next update drop.',
    content_title: 'Creator Toolkit Walkthrough',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(),
  },
];

export const fetchShareOffers = async (role: 'seller' | 'buyer'): Promise<ShareOffer[]> => {
  if (USE_MOCK_DATA) {
    const offers = mockOffers();
    return offers.filter((offer) =>
      role === 'seller'
        ? offer.seller_id === '00000000-0000-0000-0000-000000000001'
        : offer.buyer_id === '00000000-0000-0000-0000-000000000001',
    );
  }

  try {
    const response = await apiFetch(`/api/shares/offers?role=${role}`, { credentials: 'include' });
    if (!response.ok) {
      return mockOffers();
    }
    const data = await response.json();
    return data.offers || mockOffers();
  } catch (error) {
    console.error('Failed to fetch share offers:', error);
    return mockOffers();
  }
};

export const acceptShareOffer = async (offerId: string) => {
  if (USE_MOCK_DATA) {
    return { success: true, offer_id: offerId, message: 'Offer accepted (mock)' };
  }

  const response = await apiFetch(`/api/shares/offers/${offerId}/accept`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to accept offer');
  }

  return response.json();
};
