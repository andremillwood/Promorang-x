export interface DiscoveryOption {
  id: string;
  text: string;
  votes: number;
}

export interface DiscoveryComment {
  id: string;
  author: string;
  avatarUrl?: string;
  badge?: string;
  optionSupported?: string;
  text: string;
  likes: number;
  timeAgo: string;
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
    options: [
      { id: 'opt-p1', text: 'Under J$1,000 (Bargain Level)', votes: 14 },
      { id: 'opt-p2', text: 'J$1,000 – J$1,499 (PriceSmart Roadshow Tier ~J$1,200)', votes: 48 },
      { id: 'opt-p3', text: 'J$1,500 – J$1,999 (Premium Quality Match)', votes: 52 },
      { id: 'opt-p4', text: 'J$2,000 – J$2,499 (Imported Gourmet Standard)', votes: 28 },
      { id: 'opt-p5', text: 'J$2,500+ (Stated Regular Retail ~J$2,700)', votes: 16 }
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
    options: [
      { id: 'opt-j1', text: '🔥 Sweetwood Jerk Joint (Liguanea)', votes: 48 },
      { id: 'opt-j2', text: '🌿 Scotchies Jerk Center (Chelsea Ave)', votes: 39 },
      { id: 'opt-j3', text: '🌊 Boston Jerk Table (Downtown Waterfront)', votes: 16 },
      { id: 'opt-j4', text: '🍖 Pepperwood Jerk Center (New Kingston)', votes: 9 }
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
