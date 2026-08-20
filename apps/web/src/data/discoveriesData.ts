export interface OptionRecommendation {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  badge?: string;
  image?: string;
  location?: string;
  dealOrPerk: string;
  actionText: string;
  actionUrl: string;
  matchReason: string;
}

export interface SquadRewardGoal {
  targetInvites: number;
  bonusPointsPerInvite: number;
  instantPerkUnlockTitle: string;
  squadRewardBadge: string;
}

export interface DiscoveryPoll {
  id: string;
  slug: string;
  question: string;
  category: string;
  categorySlug: string;
  authorName: string;
  authorHandle?: string;
  authorAvatar?: string;
  authorRole: string;
  description: string;
  contextNotes: string;
  totalVotes: number;
  thresholdForMoment: number;
  targetUnlockPerk: string;
  pointsReward: number;
  options: DiscoveryOption[];
  userVotedOptionId?: string;
  connectedScene?: {
    title: string;
    slug: string;
    category: string;
  };
  comments: DiscoveryComment[];
  tags: string[];
  squadGoal?: SquadRewardGoal;
  optionRecommendations?: Record<string, OptionRecommendation[]>;
  recommendedMissions?: Array<{
    id: string;
    title: string;
    reward: string;
    type: string;
    url: string;
  }>;
}

export const DISCOVERY_POLLS: DiscoveryPoll[] = [
  {
    id: 'disc-arla-price-003',
    slug: 'arla-price-perception-1l-cream',
    question: 'What would you pay for a 1L cream that cooks savory AND whips sweet without curdling?',
    category: 'Price-Drop Quest 💡',
    categorySlug: 'retail-intelligence',
    authorName: 'Retail Scout Maya',
    authorHandle: '@RetailScoutJA',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    authorRole: 'Culinary Scout & Market Lead',
    description: 'Arla Pro Whip & Cook is a versatile European dairy blend engineered to perform in scorching savory pastas without splitting, and whip to 3.5× volume for desserts. Help set the community price-drop target so we can unlock bulk wholesale vouchers across Kingston supermarkets.',
    contextNotes: 'When this community meter hits 160 votes, Promorang and Arla Pro drop an instant J$500-off tasting voucher code directly to every voter on this ballot.',
    totalVotes: 158,
    thresholdForMoment: 160,
    targetUnlockPerk: '🎁 J$500 Off 1L Tasting Voucher at Select Kingston Grocers',
    pointsReward: 35,
    squadGoal: {
      targetInvites: 2,
      bonusPointsPerInvite: 25,
      instantPerkUnlockTitle: 'Instant VIP Tasting Pass Key',
      squadRewardBadge: 'Taste Catalyst Badge'
    },
    options: [
      { id: 'opt-p1', text: 'Under J$1,000 (Bargain Level)', votes: 14 },
      { id: 'opt-p2', text: 'J$1,000 – J$1,499 (PriceSmart Roadshow Tier ~J$1,200)', votes: 48 },
      { id: 'opt-p3', text: 'J$1,500 – J$1,999 (Premium Quality Match)', votes: 52 },
      { id: 'opt-p4', text: 'J$2,000 – J$2,499 (Imported Gourmet Standard)', votes: 28 },
      { id: 'opt-p5', text: 'J$2,500+ (Stated Regular Retail ~J$2,700)', votes: 16 }
    ],
    optionRecommendations: {
      'opt-p1': [
        {
          id: 'rec-ps-redhills',
          title: 'PriceSmart Kingston Roadshow',
          subtitle: 'Red Hills Road • Wholesale Club',
          category: 'Bulk Value Drop',
          badge: 'Wholesale Match',
          image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80',
          location: 'Red Hills Rd, Kingston',
          dealOrPerk: 'Special J$1,199 1L Trial Carton with Free Demo Tasting Cup',
          actionText: 'Get Roadshow Pass',
          actionUrl: '/scenes/food-taste',
          matchReason: 'Matched to your bargain-hunting tier. Best per-litre rate available in Kingston.'
        },
        {
          id: 'rec-mega-baking',
          title: 'MegaMart Kingston Bakery Section',
          subtitle: 'Upper Waterloo Rd • Everyday Grocer',
          category: 'Baking Essentials',
          badge: '10% Back in Points',
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
          location: '29 Upper Waterloo Rd, Kingston',
          dealOrPerk: '100 Bonus PromoPoints with any dairy purchase receipt upload',
          actionText: 'View Grocer Deal',
          actionUrl: '/scenes/food-taste',
          matchReason: 'Budget-friendly staple partner with active receipt scan bounties.'
        }
      ],
      'opt-p2': [
        {
          id: 'rec-ps-redhills',
          title: 'PriceSmart Kingston Live Tasting Booth',
          subtitle: 'Red Hills Road • Live Roadshow Station',
          category: 'Live Activation',
          badge: 'Active Roadshow',
          image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
          location: 'Red Hills Rd, Kingston',
          dealOrPerk: 'Sample hot Rasta Pasta & chilled Mousse at the booth this Friday!',
          actionText: 'RSVP for Roadshow',
          actionUrl: '/scenes/food-taste',
          matchReason: 'Direct match for your J$1,200 tier pick. Live demo & discount voucher booth.'
        },
        {
          id: 'rec-sovereign-super',
          title: 'Sovereign Supermarket Liguanea',
          subtitle: 'Liguanea Plaza • Gourmet Dairy Aisle',
          category: 'Local Convenience',
          badge: 'Express Pickup',
          image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&auto=format&fit=crop&q=80',
          location: '106 Hope Rd, Kingston 6',
          dealOrPerk: 'J$300 Voucher on 2× Arla Pro 1L Cartons',
          actionText: 'Claim Voucher Key',
          actionUrl: '/scenes/food-taste',
          matchReason: 'Central Kingston spot stocking fresh chilled cartons at promotional pricing.'
        }
      ],
      'opt-p3': [
        {
          id: 'rec-uncorked-cheese',
          title: 'Uncorked Cheese & Gourmet Market',
          subtitle: 'Barbican & Sovereign North',
          category: 'Artisan Gourmet',
          badge: 'Chef Recommended',
          image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=80',
          location: 'Sovereign North, Barbican, Kingston',
          dealOrPerk: '15% Off Artisan Pasta Kits with Dairy Pairing',
          actionText: 'View Gourmet Perks',
          actionUrl: '/scenes/food-taste',
          matchReason: 'Matches your premium quality benchmark for high-end culinary prep.'
        },
        {
          id: 'rec-cpj-market',
          title: 'CPJ Market Kingston',
          subtitle: 'Lady Musgrave Rd • Foodservice Hub',
          category: 'Pro Culinary',
          badge: 'Pro Tier Match',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
          location: '71 Lady Musgrave Rd, Kingston',
          dealOrPerk: 'Wholesale Case Pricing Access with PromoKey',
          actionText: 'Unlock Case Key',
          actionUrl: '/scenes/food-taste',
          matchReason: 'Preferred pro-grade supplier for restaurant-quality European dairy.'
        }
      ],
      'opt-p4': [
        {
          id: 'rec-cpj-market',
          title: 'CPJ Market Premium Cellar & Dairy',
          subtitle: 'Lady Musgrave Rd • Imported Delicacies',
          category: 'Gourmet Standard',
          badge: 'Import Grade',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
          location: '71 Lady Musgrave Rd, Kingston',
          dealOrPerk: 'Free Chef Recipe Booklet & J$600 Tasting Credit',
          actionText: 'Claim Chef Pass',
          actionUrl: '/scenes/food-taste',
          matchReason: 'For cooks who prioritize zero curdling over lowest price point.'
        }
      ],
      'opt-p5': [
        {
          id: 'rec-uncorked-cheese',
          title: 'Uncorked Specialty Market',
          subtitle: 'Barbican • Boutique Provisions',
          category: 'Luxury Pantry',
          badge: 'Top Shelf',
          image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=80',
          location: 'Sovereign North, Barbican',
          dealOrPerk: 'Exclusive Chef Demo Table Access',
          actionText: 'Explore Collection',
          actionUrl: '/scenes/food-taste',
          matchReason: 'Recognizes regular supermarket pricing and unlocks VIP culinary tasting perks.'
        }
      ]
    },
    recommendedMissions: [
      {
        id: 'ms-pasta-challenge',
        title: 'Cook & Snap: 30-Min Savory Rasta Pasta',
        reward: '+120 PromoPoints',
        type: 'Creator Quest',
        url: '/missions'
      },
      {
        id: 'ms-dessert-whip',
        title: 'Baking Challenge: 3.5× Stable Mousse Peak',
        reward: '+150 PromoPoints',
        type: 'Taste Trial',
        url: '/missions'
      }
    ],
    connectedScene: {
      title: 'Food & Taste Culture',
      slug: 'food-taste',
      category: 'Culinary'
    },
    tags: ['Arla Pro', 'Culinary Quest', 'Tasting Drop', 'Baking', 'Price Drop'],
    comments: [
      {
        id: 'c1',
        author: 'Chef Danielle',
        badge: 'Verified Caterer',
        optionSupported: 'J$1,000 – J$1,499 (PriceSmart Roadshow Tier ~J$1,200)',
        text: 'At around J$1,200 this is an absolute steal for commercial kitchens and heavy home bakers. The stability under heat is much better than traditional heavy cream.',
        likes: 18,
        timeAgo: '1 hour ago'
      },
      {
        id: 'c2',
        author: 'Damian K.',
        badge: 'Kingston Foodie',
        optionSupported: 'J$1,500 – J$1,999 (Premium Quality Match)',
        text: 'Given current supermarket prices for imported heavy whipping cream hovering at J$1,800–J$2,200, landing anywhere between 1,500-1,800 is solid value.',
        likes: 9,
        timeAgo: '3 hours ago'
      },
      {
        id: 'c3',
        author: 'Tara Chen',
        badge: 'Home Baker',
        optionSupported: 'J$1,000 – J$1,499 (PriceSmart Roadshow Tier ~J$1,200)',
        text: 'Used this at the PriceSmart roadshow for whipped mousse and it held peak shape for 24 hours in the fridge without weeping!',
        likes: 14,
        timeAgo: '5 hours ago'
      }
    ]
  },
  {
    id: 'disc-summer-end-001',
    slug: 'summer-2026-finale-jamaica',
    question: 'How are you ending summer 2026 in Jamaica?',
    category: 'Summer Finale Drop ☀️',
    categorySlug: 'summer-finale',
    authorName: 'Promorang Culture Guild',
    authorHandle: '@PromorangCulture',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    authorRole: 'Community Cultural Curator',
    description: 'Summer 2026 is wrapping up! We are partnering with top event producers and beach clubs to crowdfund exclusive subsidized passes, complimentary cocktails, and backstage wristbands for the winning celebration style.',
    contextNotes: 'Hitting 150 votes triggers a dedicated beachfront sunset pop-up lounge with complimentary welcome cocktails for all verified voters.',
    totalVotes: 0,
    thresholdForMoment: 150,
    targetUnlockPerk: '🏖️ Beachfront Sunset Pop-Up Lounge + 25 Free Entry Guest Keys',
    pointsReward: 50,
    options: [
      { id: 'opt-se1', text: '🏖️ Beach party & oceanfront vibes', votes: 0 },
      { id: 'opt-se2', text: '🎤 Live concert & conscious stage show', votes: 0 },
      { id: 'opt-se3', text: '🔥 Club night & high-energy indoor party', votes: 0 },
      { id: 'opt-se4', text: '🍹 Something chill & courtyard food lyme', votes: 0 },
      { id: 'opt-se5', text: '🌴 Haven’t decided yet', votes: 0 }
    ],
    connectedScene: {
      title: 'Nightlife & Social Rituals',
      slug: 'nightlife-rituals',
      category: 'Entertainment'
    },
    tags: ['Summer 2026', 'Beach Party', 'Concerts', 'Nightlife', 'Secret Drop'],
    comments: []
  },
  {
    id: 'disc-live-music-002',
    slug: 'what-gets-you-out-live-experience',
    question: 'What gets you out for a live experience?',
    category: 'Live Music Clash 🎤',
    categorySlug: 'live-culture',
    authorName: 'Midas Live Scout',
    authorHandle: '@MidasLive',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    authorRole: 'Live Production & Talent Lead',
    description: 'We are teaming up with Midas Live to fund an exclusive, high-energy live stage showcase with top selectors and conscious performers. Vote on what gets you in the venue to trigger 20 backstage passes.',
    contextNotes: 'Unlocking 100 votes triggers 20 VIP Backstage Soundcheck Passes and complimentary drink tokens for voters.',
    totalVotes: 0,
    thresholdForMoment: 100,
    targetUnlockPerk: '🎟️ 20 VIP Backstage Soundcheck Keys + Cocktail Tokens',
    pointsReward: 35,
    options: [
      { id: 'opt-lm1', text: '🦁 Reggae & conscious roots vibration', votes: 0 },
      { id: 'opt-lm2', text: '⚡ Dancehall energy & top selectors', votes: 0 },
      { id: 'opt-lm3', text: '🌍 Afrobeats & crossover rhythm', votes: 0 },
      { id: 'opt-lm4', text: '🔥 Hip Hop & sound clashes', votes: 0 },
      { id: 'opt-lm5', text: '⭐ Depends strictly on the headliner', votes: 0 }
    ],
    connectedScene: {
      title: 'Sound & Music Creators',
      slug: 'music-creators',
      category: 'Music'
    },
    tags: ['Live Music', 'Reggae', 'Dancehall', 'Midas Live', 'VIP Drop'],
    comments: [
      {
        id: 'c1',
        author: 'Jahson K.',
        badge: 'Sound Collector',
        optionSupported: '🦁 Reggae & conscious roots vibration',
        text: 'Live instrumentation, heavy bassline, and conscious lyrical delivery is what sets Jamaica apart from the entire world.',
        likes: 31,
        timeAgo: '30 mins ago'
      },
      {
        id: 'c2',
        author: 'Kadian M.',
        badge: 'Event Scout',
        optionSupported: '⚡ Dancehall energy & top selectors',
        text: 'High energy juggling with great sound engineering will have any venue packed within 30 minutes flat.',
        likes: 19,
        timeAgo: '2 hours ago'
      }
    ]
  },
  {
    id: 'disc-debate-001',
    slug: 'kingston-jerk-spot-undisputed-king-friday',
    question: 'Which Kingston jerk spot is undisputed King on a Friday evening?',
    category: 'Cultural Showdown 🔥',
    categorySlug: 'cultural-debate',
    authorName: 'Food Scout Jules',
    authorHandle: '@KingstonFoodies',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    authorRole: 'Kingston Food Scout & Culinary Storyteller',
    description: 'The legendary Kingston Friday Jerk debate. Vote to back your spot. When the meter hits 120, Promorang drops a secret 25% Off Jerk & Craft Beer Tasting Key at the winning venue for all voters.',
    contextNotes: 'Reaching 120 votes unlocks an exclusive 25% Off Platter & Drink Pass at the winning jerk center!',
    totalVotes: 112,
    thresholdForMoment: 120,
    targetUnlockPerk: '🍗 25% Off Jerk Platter & Craft Beer Tasting Pass (Winning Spot)',
    pointsReward: 35,
    squadGoal: {
      targetInvites: 2,
      bonusPointsPerInvite: 25,
      instantPerkUnlockTitle: 'Instant Friday Jerk Fast-Pass',
      squadRewardBadge: 'Jerk Connoisseur Badge'
    },
    options: [
      { id: 'opt-j1', text: '🔥 Sweetwood Jerk Joint (Liguanea)', votes: 48 },
      { id: 'opt-j2', text: '🌿 Scotchies Jerk Center (Chelsea Ave)', votes: 39 },
      { id: 'opt-j3', text: '🌊 Boston Jerk Table (Downtown Waterfront)', votes: 16 },
      { id: 'opt-j4', text: '🍖 Pepperwood Jerk Center (New Kingston)', votes: 9 }
    ],
    optionRecommendations: {
      'opt-j1': [
        {
          id: 'rec-sweetwood',
          title: 'Sweetwood Jerk Joint',
          subtitle: 'Liguanea • Pimento Wood Fire Pit',
          category: 'Kingston Classic',
          badge: 'Friday Peak Lyme',
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
          location: 'Liguanea (opp Emancipation Park side), Kingston',
          dealOrPerk: 'Complimentary Festival & Roast Breadfruit with 1lb Jerk Order',
          actionText: 'View Spot Card',
          actionUrl: '/scenes/food-taste',
          matchReason: 'Your selected champion. Unlocks local crowd radar & Friday specials.'
        }
      ],
      'opt-j2': [
        {
          id: 'rec-scotchies',
          title: 'Scotchies Jerk Center',
          subtitle: 'Chelsea Ave, New Kingston',
          category: 'Garden Lyme',
          badge: 'Signature Sauce',
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80',
          location: 'Chelsea Ave, Kingston 5',
          dealOrPerk: '10% Off Platter & Secret Sauce Tasting Key',
          actionText: 'Claim Scotchies Key',
          actionUrl: '/scenes/food-taste',
          matchReason: 'Classic open-air thatched roof experience with legendary pepper blend.'
        }
      ],
      'opt-j3': [
        {
          id: 'rec-boston-downtown',
          title: 'Boston Jerk Table Downtown',
          subtitle: 'Kingston Waterfront',
          category: 'Waterfront Street Food',
          badge: 'Authentic Portland Style',
          image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80',
          location: 'Ocean Blvd Waterfront, Downtown Kingston',
          dealOrPerk: 'BOGO Coconut Water with any 1/2lb Pork or Chicken',
          actionText: 'Explore Downtown Spot',
          actionUrl: '/scenes/food-taste',
          matchReason: 'Waterfront ocean breeze matched with authentic Portland pimento pit flavors.'
        }
      ],
      'opt-j4': [
        {
          id: 'rec-pepperwood',
          title: 'Pepperwood Jerk Center',
          subtitle: 'Chelsea Ave / New Kingston',
          category: 'After-Work Lyme',
          badge: 'Live Sports & Grill',
          image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&auto=format&fit=crop&q=80',
          location: 'New Kingston Business District',
          dealOrPerk: 'Double Points on Friday Happy Hour orders',
          actionText: 'View Happy Hour Deal',
          actionUrl: '/scenes/food-taste',
          matchReason: 'Prime Friday spot for business district professionals and post-work lymes.'
        }
      ]
    },
    recommendedMissions: [
      {
        id: 'ms-jerk-crawl',
        title: 'Kingston Jerk Crawl: Review 2 Pit Spots',
        reward: '+200 PromoPoints',
        type: 'Foodie Trail',
        url: '/missions'
      }
    ],
    connectedScene: {
      title: 'Food & Taste Culture',
      slug: 'food-taste',
      category: 'Culinary'
    },
    tags: ['Jerk Chicken', 'Kingston Food', 'Friday Lyme', 'Street Food', 'Foodies'],
    comments: [
      {
        id: 'c1',
        author: 'Andre M.',
        badge: 'Jerk Connoisseur',
        optionSupported: 'Sweetwood Jerk Joint (Liguanea)',
        text: 'Sweetwood jerk pork with festival and roasted breadfruit on a Friday afternoon around 5 PM is unmatched anywhere in St. Andrew.',
        likes: 42,
        timeAgo: '45 mins ago'
      },
      {
        id: 'c2',
        author: 'Leanne B.',
        badge: 'Local Scout',
        optionSupported: 'Scotchies Jerk Center (Chelsea Ave)',
        text: 'Scotchies sauce recipe and sweet potato pudding keeps me coming back every single week. Atmosphere with thatched roof is classic.',
        likes: 27,
        timeAgo: '1 hour ago'
      },
      {
        id: 'c3',
        author: 'Dwayne R.',
        badge: 'Downtown Explorer',
        optionSupported: 'Boston Jerk Table (Downtown Waterfront)',
        text: 'Downtown ocean breeze with genuine Boston style pimento wood jerk is heavily slept on! Give them their flowers.',
        likes: 16,
        timeAgo: '3 hours ago'
      }
    ]
  },
  {
    id: 'disc-arla-tasteoff-001',
    slug: 'arla-tasteoff-rasta-pasta-vs-mousse',
    question: 'Rasta Pasta or Chocolate Chip Mousse: Which one wins the PriceSmart Taste-Off?',
    category: 'Arla Taste-Off 🍝🍫',
    categorySlug: 'arla-campaign',
    authorName: 'Arla Pro × Promorang Scout',
    authorHandle: '@ArlaProCaribbean',
    authorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&auto=format&fit=crop&q=80',
    authorRole: 'Executive Culinary Partner',
    description: 'During the live roadshow at PriceSmart Kingston and Red Hills Rd, visitors sample both hot savoury Rasta Pasta and chilled Chocolate Chip Mousse prepared with Arla Whip & Cook. Vote on your winning recipe!',
    contextNotes: 'Reaching 200 votes unlocks 50 free full Recipe Packs and Chef Cooking kits for Promorang members.',
    totalVotes: 184,
    thresholdForMoment: 200,
    targetUnlockPerk: 'Free Arla Pro Chef Recipe Pack + In-Store Discount Pass',
    pointsReward: 40,
    options: [
      { id: 'opt-arla-pasta', text: '🍝 Team Rasta Pasta (Hot & Savoury)', votes: 98 },
      { id: 'opt-arla-mousse', text: '🍫 Team Chocolate Chip Mousse (Cold & Whipped)', votes: 86 }
    ],
    connectedScene: {
      title: 'Food & Taste Culture',
      slug: 'food-taste',
      category: 'Culinary'
    },
    tags: ['Arla Pro', 'Taste-Off', 'Rasta Pasta', 'Dessert', 'PriceSmart'],
    comments: [
      {
        id: 'c1',
        author: 'Camille Sterling',
        badge: 'PriceSmart Shopper',
        optionSupported: '🍝 Team Rasta Pasta (Hot & Savoury)',
        text: 'The sauce on the Rasta Pasta did not separate even after sitting under the food warmer! The bell pepper and scotch bonnet came through beautifully.',
        likes: 21,
        timeAgo: '1 hour ago'
      },
      {
        id: 'c2',
        author: 'Tyrone H.',
        badge: 'Dessert Lover',
        optionSupported: '🍫 Team Chocolate Chip Mousse (Cold & Whipped)',
        text: 'The chocolate mousse was airy and rich without tasting greasy. Definitely making this for Sunday dinner.',
        likes: 18,
        timeAgo: '2 hours ago'
      }
    ]
  },
  {
    id: 'disc-arla-mode-002',
    slug: 'arla-whip-cook-drink-mode',
    question: 'Whip It, Cook It, or Drink It: If you get one carton of Arla Whip & Cook right now, what happens first?',
    category: 'Product Mode 🍳🍰🥤',
    categorySlug: 'arla-campaign',
    authorName: 'Taste Collective Jamaica',
    authorHandle: '@TasteCollective',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    authorRole: 'Community Food Steward',
    description: 'Explore the 3 application pillars of 1 versatile dairy carton. From creamy Alfredo sauces, to light cakes and fruit parfaits, to local Strong Back punches and specialty coffees.',
    contextNotes: 'Reaching 150 votes triggers a digital Masterclass video series with top Jamaican pastry and executive chefs.',
    totalVotes: 126,
    thresholdForMoment: 150,
    targetUnlockPerk: 'Exclusive Chef Masterclass Access & Digital Recipe Guidebook',
    pointsReward: 25,
    options: [
      { id: 'opt-arla-cook', text: '🍳 Cook It (Alfredo, creamy chicken, seafood pasta)', votes: 58 },
      { id: 'opt-arla-whip', text: '🍰 Whip It (Mousse, cheesecake, cake toppings)', votes: 46 },
      { id: 'opt-arla-drink', text: '🥤 Drink It (Strong Back punch, specialty coffee)', votes: 22 }
    ],
    connectedScene: {
      title: 'Food & Taste Culture',
      slug: 'food-taste',
      category: 'Culinary'
    },
    tags: ['Arla Pro', 'Culinary Innovation', 'Baking', 'Beverage'],
    comments: [
      {
        id: 'c1',
        author: 'Mixologist Wayne',
        badge: 'Beverage Specialist',
        optionSupported: '🥤 Drink It (Strong Back punch, specialty coffee)',
        text: 'Added 2oz to an iced stout punch with nutmeg and vanilla and it created a silky foam collar that lasted 15 minutes!',
        likes: 14,
        timeAgo: '4 hours ago'
      }
    ]
  },
  {
    id: 'disc-demand-002',
    slug: 'what-should-promorang-fund-unlock-next-kingston',
    question: 'What should Promorang fund and unlock in Kingston next?',
    category: 'Demand-to-Supply 🎯',
    categorySlug: 'demand-supply',
    authorName: 'Promorang Kingston Guild',
    authorHandle: '@PromorangKingston',
    authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    authorRole: 'City Ecosystem Lead',
    description: 'Promorang allocates co-funding to bring community-requested experiences to life. Nominate where our next merchant partnership and subsidized PromoKey drop should happen.',
    contextNotes: 'When any option passes 35 votes, our partnership team contracts the host venue to schedule a verified Promorang Moment.',
    totalVotes: 46,
    thresholdForMoment: 50,
    targetUnlockPerk: 'Community-Funded Pop-Up Moment with Subsidized Pass Allocation',
    pointsReward: 50,
    options: [
      { id: 'opt-1', text: 'Secret Jamaican Food Crawl (Barbican)', votes: 23 },
      { id: 'opt-2', text: 'Clay & Sip Pottery Workshop (New Kingston)', votes: 12 },
      { id: 'opt-3', text: 'Sunset Vinyl & High Tea (Strawberry Hill)', votes: 7 },
      { id: 'opt-4', text: 'Beginner Boxing & Coffee Morning', votes: 4 }
    ],
    connectedScene: {
      title: 'Active Living & City Culture',
      slug: 'active-living',
      category: 'Lifestyle'
    },
    tags: ['Demand Supply', 'Co-Creation', 'Kingston Events', 'Workshops'],
    comments: [
      {
        id: 'c1',
        author: 'Nia Campbell',
        badge: 'Creative Pioneer',
        optionSupported: 'Clay & Sip Pottery Workshop (New Kingston)',
        text: 'Pottery and ceramics in Kingston is having a huge moment right now! We need a central studio event with wine and tapas.',
        likes: 19,
        timeAgo: '1 day ago'
      }
    ]
  },
  {
    id: 'disc-nightlife-004',
    slug: 'wednesday-after-work-hangout-table-perks',
    question: 'Which Wednesday after-work hangout spot needs exclusive table perks?',
    category: 'Kingston After Dark 🍸',
    categorySlug: 'after-dark',
    authorName: 'Fiction Resident DJ & Host',
    authorHandle: '@DJFictionKGN',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    authorRole: 'Nightlife Curator',
    description: 'Midweek social energy in Kingston is growing rapidly. Vote for the venue that deserves dedicated VIP table reservations and complimentary welcome cocktails for Promorang members on Wednesdays.',
    contextNotes: 'Reaching 60 votes locks in a recurring weekly PromoKey drop with 20% off table tabs.',
    totalVotes: 58,
    thresholdForMoment: 60,
    targetUnlockPerk: '20% Tab Discount & Priority Courtyard Seating',
    pointsReward: 25,
    options: [
      { id: 'opt-n1', text: 'FAT Wednesdays at Tracks & Records', votes: 27 },
      { id: 'opt-n2', text: 'Tacbar Courtyard Margaritas (Devon House)', votes: 18 },
      { id: 'opt-n3', text: 'AC Lounge Mixology & Tapas Bar', votes: 13 }
    ],
    connectedScene: {
      title: 'Nightlife & Social Rituals',
      slug: 'nightlife-rituals',
      category: 'Nightlife'
    },
    tags: ['Nightlife', 'Wednesday Lyme', 'Cocktails', 'Kingston Bars'],
    comments: [
      {
        id: 'c1',
        author: 'Tariq S.',
        badge: 'Nightlife Scout',
        optionSupported: 'FAT Wednesdays at Tracks & Records',
        text: 'Tracks & Records with the sports screens and live DJ sets sets the bar for midweek energy in Marketplace.',
        likes: 12,
        timeAgo: '2 days ago'
      }
    ]
  }
];

export function getDiscoveryPollByIdOrSlug(idOrSlug: string): DiscoveryPoll | undefined {
  const clean = (idOrSlug || '').toLowerCase().trim();
  return DISCOVERY_POLLS.find(p => 
    p.id.toLowerCase() === clean || 
    p.slug.toLowerCase() === clean ||
    clean.includes(p.id.toLowerCase()) ||
    clean.includes(p.slug.toLowerCase()) ||
    p.question.toLowerCase().replace(/[^a-z0-9]+/g, '-').includes(clean)
  );
}

export function getAllDiscoveryPolls(): DiscoveryPoll[] {
  return DISCOVERY_POLLS;
}

import type { Discovery } from "@promorang/shared";

export const CURATED_DISCOVERIES: Discovery[] = [
  {
    id: "disc-strawberry-hill-01",
    slug: "strawberry-hill-panoramic-deck",
    title: "Strawberry Hill Panoramic Deck & High Tea",
    category: "hidden_gem",
    description: "Perched 3,100 feet above the Caribbean in the Blue Mountains. World-renowned 360-degree city views, signature Blue Mountain coffee tastings, and sunset cocktails.",
    cover_image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&auto=format&fit=crop&q=80"
    ],
    location_address: "Irish Town, Blue Mountains",
    latitude: 18.0674,
    longitude: -76.7329,
    city: "Kingston",
    country: "Jamaica",
    venue_id: "venue-strawberry-hill",
    creator_id: "creator-editorial",
    verification_status: "approved",
    checkin_count: 248,
    save_count: 512,
    average_rating: 4.9,
    metadata: {
      vibe: ["Scenic", "Sunset", "Romantic", "Luxury Lyme"],
      best_time: "Friday – Sunday 4:00 PM – 7:30 PM",
      price_range: "$$$",
      highlights: ["Panoramic Sunset Views", "Single-Estate Coffee", "Infinity Edge Pool"],
      tips: ["Arrive 30 minutes before golden hour for the best veranda seating."]
    },
    creator_profile: {
      id: "scout-jules",
      display_name: "Food Scout Jules",
      username: "KingstonFoodies",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      reputation_title: "Master Cultural Scout"
    }
  },
  {
    id: "disc-dub-club-02",
    slug: "dub-club-skyline-ritual",
    title: "Kingston Dub Club & Skyline Reggae Ritual",
    category: "music",
    description: "The Sunday night cultural epicenter on Jack's Hill overlooking the shimmering lights of Kingston. Vinyl-only roots, heavy dub plates, ital vegetarian stew, and organic vibes.",
    cover_image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80"
    ],
    location_address: "7b Skyline Drive, Jack's Hill",
    latitude: 18.0465,
    longitude: -76.7582,
    city: "Kingston",
    country: "Jamaica",
    venue_id: "venue-dub-club",
    creator_id: "creator-jahson",
    verification_status: "approved",
    checkin_count: 412,
    save_count: 689,
    average_rating: 4.95,
    metadata: {
      vibe: ["Roots Reggae", "Conscious", "City Lights", "Vinyl Only"],
      best_time: "Sunday 8:00 PM – 2:00 AM",
      price_range: "$$",
      highlights: ["Rockers Sound System", "Ital Food", "Unrivalled Night Skyline"],
      tips: ["Take a trusted ride share up Skyline Drive; parking fills quickly after 10 PM."]
    },
    creator_profile: {
      id: "scout-jahson",
      display_name: "Jahson K.",
      username: "SoundCollector",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      reputation_title: "Sound Heritage Scout"
    }
  },
  {
    id: "disc-tacbar-devon-03",
    slug: "tacbar-devon-house-courtyard",
    title: "Tacbar Courtyard Margaritas & Taco Stand",
    category: "restaurant",
    description: "Nestled in the historic Devon House courtyard. Handcrafted gourmet tacos with jerk chicken, blackened mahi, fresh lime margaritas, and open-air courtyard energy.",
    cover_image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80"
    ],
    location_address: "26 Hope Road, Devon House Courtyard",
    latitude: 18.0163,
    longitude: -76.7909,
    city: "Kingston",
    country: "Jamaica",
    venue_id: "venue-tacbar",
    creator_id: "creator-maya",
    verification_status: "approved",
    checkin_count: 318,
    save_count: 420,
    average_rating: 4.85,
    metadata: {
      vibe: ["Casual Gourmet", "Outdoor Courtyard", "Cocktails", "Date Spot"],
      best_time: "Wednesday – Saturday 5:30 PM – 10:00 PM",
      price_range: "$$",
      highlights: ["Jerk Pork Tacos", "Smoked Mezcal Margaritas", "Courtyard Patio"],
      tips: ["Pair with an I Scream scoop right next door after your meal."]
    },
    creator_profile: {
      id: "scout-maya",
      display_name: "Maya Chen",
      username: "MayaEats",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      reputation_title: "Culinary Scout"
    }
  },
  {
    id: "disc-boston-jerk-04",
    slug: "boston-jerk-waterfront-station",
    title: "Boston Jerk Table & Waterfront Lyme",
    category: "restaurant",
    description: "Authentic Portland-style pimento wood pit jerk set against the Kingston Harbour breeze. Smoky jerk chicken, roast breadfruit, and cold Red Stripe.",
    cover_image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80"
    ],
    location_address: "Ocean Boulevard, Downtown Waterfront",
    latitude: 17.9678,
    longitude: -76.7915,
    city: "Kingston",
    country: "Jamaica",
    venue_id: "venue-boston-jerk-waterfront",
    creator_id: "creator-dwayne",
    verification_status: "approved",
    checkin_count: 195,
    save_count: 310,
    average_rating: 4.8,
    metadata: {
      vibe: ["Authentic Pit Jerk", "Harbour Breeze", "Friday Lyme", "Street Food"],
      best_time: "Friday & Saturday 12:00 PM – 9:00 PM",
      price_range: "$",
      highlights: ["Pimento Wood Smoke", "Festival & Roast Breadfruit", "Ocean Walkway"],
      tips: ["Ask for the homemade scotch bonnet pepper sauce on the side."]
    },
    creator_profile: {
      id: "scout-dwayne",
      display_name: "Dwayne R.",
      username: "DowntownScout",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      reputation_title: "Downtown Insider"
    }
  },
  {
    id: "disc-holywell-peak-05",
    slug: "holywell-peak-mist-trail",
    title: "Holywell Peak Forest & Mist Trail",
    category: "trail",
    description: "A cool, high-elevation rainforest retreat inside the Blue and John Crow Mountains National Park. Fern-lined trails, bird sanctuaries, and picnic gazebos surrounded by mountain mist.",
    cover_image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80"
    ],
    location_address: "Holywell Recreational Park, Blue Mountains",
    latitude: 18.0892,
    longitude: -76.7261,
    city: "St. Andrew",
    country: "Jamaica",
    venue_id: "venue-holywell",
    creator_id: "creator-trailhead",
    verification_status: "approved",
    checkin_count: 142,
    save_count: 278,
    average_rating: 4.9,
    metadata: {
      vibe: ["Cool Climate", "Hiking", "Ecosystem", "Mountain Mist"],
      best_time: "Saturday & Sunday 8:00 AM – 3:00 PM",
      price_range: "$",
      highlights: ["Blue Mountain Peak View", "Orchid Trail", "Cold Mountain Springs"],
      tips: ["Bring a light windbreaker jacket as temperatures hover around 18°C (64°F)."]
    },
    creator_profile: {
      id: "scout-trail",
      display_name: "Alana Miller",
      username: "JamaicaTrailblazers",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
      reputation_title: "Nature & Trail Guide"
    }
  },
  {
    id: "disc-blue-ridge-06",
    slug: "blue-ridge-mountain-lounge",
    title: "Blue Ridge Restaurant & Cottages",
    category: "hidden_gem",
    description: "Rustic alpine cottage dining suspended over the misty valleys of Salt Hill. Farm-to-table Jamaican fusion cuisine, roaring fireplace, and crisp mountain serenity.",
    cover_image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80"
    ],
    location_address: "Salt Hill, Blue Mountains",
    latitude: 18.0721,
    longitude: -76.7118,
    city: "St. Andrew",
    country: "Jamaica",
    venue_id: "venue-blue-ridge",
    creator_id: "creator-maya",
    verification_status: "approved",
    checkin_count: 176,
    save_count: 360,
    average_rating: 4.88,
    metadata: {
      vibe: ["Alpine Escape", "Farm-to-Table", "Fireplace", "Peaceful"],
      best_time: "Friday – Sunday 12:00 PM – 8:00 PM",
      price_range: "$$$",
      highlights: ["Roasted Pumpkin Soup", "Valley Overlook Deck", "Artisan Cocktails"],
      tips: ["Advance reservations strongly recommended for weekend sunset dining."]
    },
    creator_profile: {
      id: "scout-maya",
      display_name: "Maya Chen",
      username: "MayaEats",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      reputation_title: "Culinary Scout"
    }
  }
];

export function getAllCuratedDiscoveries(): Discovery[] {
  return CURATED_DISCOVERIES;
}

export function getCuratedDiscoveryBySlug(slug: string): Discovery | undefined {
  const clean = (slug || '').toLowerCase().trim();
  return CURATED_DISCOVERIES.find(d => 
    d.slug.toLowerCase() === clean || 
    d.id.toString().toLowerCase() === clean ||
    clean.includes(d.slug.toLowerCase())
  );
}
