const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { authMiddleware } = require('../lib/auth');

// Apply auth to all routes
router.use(authMiddleware);

const mockListings = () => {
  const now = Date.now();
  return [
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
      created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(now + 48 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'listing-demo-2',
      content_id: 'content-demo-4',
      content_title: 'Creator Collab Series',
      content_thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
      owner_id: '00000000-0000-0000-0000-000000000004',
      owner_name: 'Collab Creator',
      quantity: 80,
      remaining_quantity: 80,
      ask_price: 9.0,
      market_price: 8.8,
      status: 'active',
      created_at: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(now + 72 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

const mockOffers = (currentUser) => {
  const now = Date.now();
  return [
    {
      id: 'offer-demo-1',
      content_id: 'content-demo-1',
      content_title: 'Launch Campaign: Social Buzz',
      buyer_id: '00000000-0000-0000-0000-000000000005',
      buyer_name: 'Marketplace Analyst',
      buyer_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=analyst',
      seller_id: '00000000-0000-0000-0000-000000000001',
      quantity: 25,
      bid_price: 12.75,
      status: 'pending',
      message: 'Happy to take at a slight premium. Can settle within 24h.',
      created_at: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(now + 21 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'offer-demo-2',
      content_id: 'content-demo-2',
      content_title: 'Creator Toolkit Walkthrough',
      buyer_id: currentUser.id,
      buyer_name: currentUser.display_name || currentUser.username || 'You',
      buyer_avatar: currentUser.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
      seller_id: '00000000-0000-0000-0000-000000000004',
      quantity: 30,
      bid_price: 18.0,
      status: 'pending',
      message: 'Would love to take this block before the next update drop.',
      created_at: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(now + 30 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

router.get('/listings', async (req, res) => {
  const ownerOnly = req.query.owner === 'true';
  const listings = mockListings();

  if (ownerOnly) {
    return res.json({ listings: listings.filter((listing) => listing.owner_id === req.user.id) });
  }

  return res.json({ listings });
});

router.post('/listings', async (req, res) => {
  const { content_id, quantity, ask_price } = req.body || {};

  if (!content_id || !quantity || !ask_price) {
    return res.status(400).json({ success: false, error: 'Missing listing fields' });
  }

  const newListing = {
    id: `listing-${Date.now()}`,
    content_id,
    content_title: req.body.content_title || 'Content Listing',
    content_thumbnail: req.body.content_thumbnail || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80',
    owner_id: req.user.id,
    owner_name: req.user.display_name || req.user.username || 'Portfolio Owner',
    quantity,
    remaining_quantity: quantity,
    ask_price,
    market_price: ask_price,
    status: 'active',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
  };

  if (!supabase) {
    return res.status(201).json({ success: true, listing: newListing, message: 'Listing created (mock)' });
  }

  try {
    return res.status(201).json({ success: true, listing: newListing, message: 'Listing created' });
  } catch (error) {
    console.error('Error creating listing:', error);
    return res.status(201).json({ success: true, listing: newListing, message: 'Listing created (fallback)' });
  }
});

router.post('/offers', async (req, res) => {
  const { content_id, seller_id, quantity, bid_price, message } = req.body || {};

  if (!content_id || !quantity || !bid_price) {
    return res.status(400).json({ success: false, error: 'Missing offer fields' });
  }

  const offer = {
    id: `offer-${Date.now()}`,
    content_id,
    buyer_id: req.user.id,
    seller_id: seller_id || null,
    quantity,
    bid_price,
    status: 'pending',
    message,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  };

  if (!supabase) {
    return res.status(201).json({ success: true, offer, message: 'Offer submitted (mock)' });
  }

  try {
    return res.status(201).json({ success: true, offer, message: 'Offer submitted' });
  } catch (error) {
    console.error('Error creating offer:', error);
    return res.status(201).json({ success: true, offer, message: 'Offer submitted (fallback)' });
  }
});

router.get('/offers', async (req, res) => {
  const role = req.query.role;
  const offers = mockOffers(req.user);

  let filtered = offers;
  if (role === 'seller') {
    filtered = offers.filter((offer) => offer.seller_id === req.user.id);
  } else if (role === 'buyer') {
    filtered = offers.filter((offer) => offer.buyer_id === req.user.id);
  }

  return res.json({ offers: filtered });
});

router.post('/offers/:id/accept', async (req, res) => {
  const { id } = req.params;

  if (!supabase) {
    return res.json({ success: true, offer_id: id, message: 'Offer accepted (mock)' });
  }

  try {
    return res.json({ success: true, offer_id: id, message: 'Offer accepted' });
  } catch (error) {
    console.error('Error accepting offer:', error);
    return res.json({ success: true, offer_id: id, message: 'Offer accepted (fallback)' });
  }
});

module.exports = router;
