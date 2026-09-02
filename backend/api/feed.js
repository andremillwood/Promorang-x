const express = require('express');
const router = express.Router();
const { supabase: supabaseAdmin } = require('../lib/supabase'); // Service-role client for feed assembly
const { requireAuth } = require('../middleware/auth');

// Demo feed content for unauthenticated users or when database is unavailable
const DEMO_FEED = [
    {
        id: 'demo-event-1',
        type: 'event',
        title: '🎉 Welcome to Promorang!',
        description: 'Join thousands of creators monetizing their content. This is your first step to earning rewards.',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Virtual Event',
        attendees: 1247,
        score: 100
    },
    {
        id: 'demo-drop-1',
        type: 'drop',
        title: 'Share Your First Post',
        description: 'Complete this drop to earn 50 gems. Simply share any content and submit proof.',
        gem_reward_base: 50,
        key_cost: 1,
        category: 'Getting Started',
        difficulty: 'easy',
        current_participants: 89,
        max_participants: 500,
        score: 95
    },
    {
        id: 'demo-prediction-1',
        type: 'prediction',
        creator_name: 'TrendSpotter',
        platform: 'instagram',
        content_title: 'Viral Dance Challenge',
        forecast_type: 'views',
        target_value: 100000,
        current_value: 67500,
        odds: 1.8,
        pool_size: 350.00,
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        score: 90
    },
    {
        id: 'demo-content-1',
        type: 'content',
        title: 'How Creators Earn on Promorang',
        description: 'Learn the basics of the Promorang economy and start earning today.',
        media_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
        posted_at: new Date().toISOString(),
        score: 85
    }
];

// ============================================
// PUBLIC DEMO FEED (no auth required)
// ============================================
router.get('/demo', async (req, res) => {
    res.json({
        status: 'success',
        data: {
            feed: DEMO_FEED,
            meta: {
                user_interests: [],
                is_demo: true
            }
        }
    });
});
// HELPER: SCORING + FEED NORMALIZATION
// ============================================
const PROFILE_WEIGHTS = {
    participant: {
        recency: 1.0,
        intent: 1.4,
        relevance: 1.2,
        proximity: 1.2,
        urgency: 1.1,
        social: 0.9,
        value: 0.8,
        quality: 0.7,
        behavior: 1.25,
    },
    creator: {
        recency: 0.7,
        intent: 1.3,
        relevance: 1.3,
        proximity: 0.8,
        urgency: 0.9,
        social: 0.8,
        value: 1.2,
        quality: 1.0,
        behavior: 1.35,
    },
    host: {
        recency: 1.1,
        intent: 1.1,
        relevance: 0.7,
        proximity: 1.45,
        urgency: 1.45,
        social: 0.7,
        value: 0.9,
        quality: 0.8,
        behavior: 0.9,
    },
    merchant: {
        recency: 1.05,
        intent: 1.15,
        relevance: 0.75,
        proximity: 1.4,
        urgency: 1.4,
        social: 0.75,
        value: 1.1,
        quality: 0.8,
        behavior: 0.95,
    },
    brand: {
        recency: 0.9,
        intent: 1.2,
        relevance: 0.95,
        proximity: 1.2,
        urgency: 1.05,
        social: 0.85,
        value: 1.25,
        quality: 1.0,
        behavior: 1.1,
    },
    agency: {
        recency: 0.85,
        intent: 1.15,
        relevance: 0.9,
        proximity: 1.15,
        urgency: 1.0,
        social: 0.8,
        value: 1.2,
        quality: 1.05,
        behavior: 1.05,
    },
};

const INTEREST_SYNONYMS = {
    social: ['social', 'gathering', 'community', 'nightlife', 'party', 'parties', 'hangout'],
    food: ['food', 'beverage', 'drink', 'drinks', 'dining', 'restaurant', 'culinary', 'eat', 'brunch', 'dinner'],
    fitness: ['fitness', 'sports', 'wellness', 'yoga', 'gym', 'workout', 'run', 'training'],
    music: ['music', 'party', 'parties', 'dj', 'concert', 'nightlife', 'dance', 'sound', 'vinyl', 'dub'],
    arts: ['arts', 'culture', 'art', 'creative', 'gallery', 'theatre', 'theater', 'film', 'photo'],
    outdoor: ['outdoor', 'nature', 'adventure', 'hike', 'hiking', 'beach', 'trail'],
    networking: ['networking', 'business', 'professional', 'career', 'mixer'],
    workshop: ['workshop', 'learning', 'class', 'education', 'talk', 'lecture', 'clinic'],
};

const LIFESTYLE_AFFINITY = {
    active: ['fitness', 'outdoor'],
    foodie: ['food'],
    creative: ['arts', 'music'],
    social: ['social', 'music'],
    professional: ['networking', 'workshop'],
    mindful: ['fitness', 'arts'],
    adventurous: ['outdoor', 'social'],
    homebody: ['workshop', 'food'],
};

const tokensFrom = (...parts) => String(parts.filter(Boolean).join(' '))
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter((token) => token.length > 1);

const interestSlugsForItem = (item) => {
    const haystack = new Set(tokensFrom(item.category, item.title, item.description, item.location, ...(Array.isArray(item.tags) ? item.tags : [])));
    return Object.keys(INTEREST_SYNONYMS).filter((slug) => INTEREST_SYNONYMS[slug].some((word) => haystack.has(word)));
};

const INTENT_MULTIPLIERS = {
    default: {
        recency: 1,
        intent: 1,
        relevance: 1,
        proximity: 1,
        urgency: 1,
        social: 1,
        value: 1,
        quality: 1,
        behavior: 1,
    },
    nearby: {
        recency: 1,
        intent: 1.1,
        relevance: 1,
        proximity: 1.5,
        urgency: 1.2,
        social: 1,
        value: 1,
        quality: 1,
        behavior: 1,
    },
    tonight: {
        recency: 1.1,
        intent: 1.2,
        relevance: 1,
        proximity: 1.1,
        urgency: 1.6,
        social: 1,
        value: 1,
        quality: 1,
        behavior: 1,
    },
    earn: {
        recency: 1,
        intent: 1.2,
        relevance: 1,
        proximity: 1,
        urgency: 1.2,
        social: 1,
        value: 1.7,
        quality: 1.1,
        behavior: 1.15,
    },
};

const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

const nextOccurrenceStart = (item, now = new Date()) => {
    if (!item?.recurrence_enabled || !item?.recurrence_frequency || !item?.starts_at) return item?.starts_at || null;
    const original = new Date(item.starts_at);
    if (!isValidDate(original) || original.getTime() >= now.getTime()) return item.starts_at;
    const interval = Math.max(1, Number(item.recurrence_interval || 1));
    const countLimit = item.recurrence_count ? Math.max(1, Number(item.recurrence_count)) : Number.POSITIVE_INFINITY;
    const until = item.recurrence_until ? new Date(item.recurrence_until) : null;
    const untilTime = until && isValidDate(until) ? until.getTime() : Number.POSITIVE_INFINITY;
    const weekday = Array.isArray(item.recurrence_by_weekday) && item.recurrence_by_weekday.length
        ? item.recurrence_by_weekday.map(Number)
        : [original.getUTCDay()];
    let occurrence = 1;
    let candidate = new Date(original);
    for (let step = 1; step <= 3660; step += 1) {
        if (item.recurrence_frequency === 'daily') {
            if (step % interval !== 0) continue;
            candidate = new Date(original.getTime() + step * 86400000);
        } else if (item.recurrence_frequency === 'monthly') {
            candidate = new Date(Date.UTC(
                original.getUTCFullYear(),
                original.getUTCMonth() + step * interval,
                original.getUTCDate(),
                original.getUTCHours(),
                original.getUTCMinutes(),
                original.getUTCSeconds(),
            ));
        } else {
            const next = new Date(original.getTime() + step * 86400000);
            if (Math.floor(step / 7) % interval !== 0 || !weekday.includes(next.getUTCDay())) continue;
            candidate = next;
        }
        occurrence += 1;
        if (candidate.getTime() >= now.getTime()) break;
    }
    if (occurrence > countLimit || candidate.getTime() > untilTime || candidate.getTime() < now.getTime()) {
        return item.starts_at;
    }
    return candidate.toISOString();
};

const withEffectiveStart = (item) => {
    const next = nextOccurrenceStart(item);
    return next ? { ...item, starts_at: next } : item;
};

const getItemDate = (item) => {
    const dateValue = item.posted_at || item.created_at || item.start_date || item.starts_at || item.assigned_at || item.date || item.expires_at;
    const date = dateValue ? new Date(dateValue) : null;
    return isValidDate(date) ? date : null;
};

const getDaysOld = (itemDate) => {
    if (!itemDate) return 0;
    return (Date.now() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
};

const scoreRecency = (item) => {
    const itemDate = getItemDate(item);
    if (!itemDate) return 0;
    return Math.max(0, 25 - (getDaysOld(itemDate) * 1.25));
};

const scoreInterestMatch = (item, userPrefs) => {
    const wanted = (userPrefs?.preferred_categories || userPrefs?.interests || [])
        .map((value) => String(value || '').toLowerCase())
        .filter(Boolean);
    const lifestyles = (userPrefs?.lifestyle_tags || []).map((value) => String(value || '').toLowerCase());
    if (!wanted.length && !lifestyles.length) return 0;

    const slugs = interestSlugsForItem(item);
    const interestHits = wanted.filter((interest) => slugs.includes(interest));
    const lifestyleHits = lifestyles.flatMap((tag) => (LIFESTYLE_AFFINITY[tag] || []).filter((slug) => slugs.includes(slug)));
    return Math.min(interestHits.length * 10 + [...new Set(lifestyleHits)].length * 6, 28);
};

const scoreGeography = (item, userPrefs) => {
    let score = 0;
    const profileCity = (userPrefs?.city || userPrefs?.location_data?.city || '').toLowerCase();
    const itemCity = (item.city || item.location_city || '').toLowerCase();
    const itemPlace = `${item.city || ''} ${item.location || ''} ${item.venue_name || ''}`.toLowerCase();

    if (profileCity && (itemCity === profileCity || itemPlace.includes(profileCity))) {
        score += 18;
    } else if (profileCity && itemCity && itemCity !== profileCity) {
        score -= 8;
    }

    const profileCountry = (userPrefs?.country || userPrefs?.location_data?.country || '').toLowerCase();
    if (profileCountry && item.country && profileCountry === String(item.country).toLowerCase()) {
        score += 6;
    }

    return score;
};

const scoreDemographics = (item, userContext = {}) => {
    let score = 0;
    const demographics = userContext?.demographics;
    if (!demographics) return score;

    if (item.target_age_min && userContext.age) {
        score += userContext.age >= item.target_age_min ? 6 : -8;
    }
    if (item.target_age_max && userContext.age) {
        score += userContext.age <= item.target_age_max ? 6 : -8;
    }

    if (item.target_gender && demographics.gender && item.target_gender === demographics.gender) {
        score += 4;
    }

    if (item.family_friendly && demographics.has_children) score += 6;
    if (item.parenting_focused && demographics.has_children) score += 8;
    if (item.child_age_range && demographics.children_ages) {
        const [min, max] = String(item.child_age_range).split('-').map(Number);
        const hasMatchingChild = demographics.children_ages.some((age) => age >= min && age <= max);
        if (hasMatchingChild) score += 8;
    }

    if (item.couples_focused && ['married', 'partnership', 'dating', 'engaged'].includes(demographics.marital_status)) {
        score += 6;
    }
    if (item.singles_focused && demographics.marital_status === 'single') {
        score += 5;
    }

    if (item.fitness_level && demographics.fitness_level === item.fitness_level) {
        score += 5;
    }

    if (Array.isArray(item.dietary_preferences) && Array.isArray(demographics.dietary_preferences)) {
        const dietMatches = item.dietary_preferences.filter((preference) => demographics.dietary_preferences.includes(preference));
        score += Math.min(dietMatches.length * 3, 6);
    }

    if (item.pet_friendly && demographics.has_pets) score += 4;
    if (Array.isArray(item.pet_types) && Array.isArray(demographics.pet_types)) {
        const petMatches = item.pet_types.filter((petType) => demographics.pet_types.includes(petType));
        if (petMatches.length > 0) score += 5;
    }

    return score;
};

const scoreLifeEvents = (item, userContext = {}) => {
    let score = 0;
    const upcomingEvents = userContext?.upcoming_personal_events || [];

    for (const event of upcomingEvents) {
        if (event.type === 'my_birthday' && item.birthday_relevant) score += 8;
        if (event.type === 'partner_birthday' && item.gift_ideas) score += 7;
        if (event.type === 'anniversary' && (item.couples_focused || item.romantic)) score += 7;
        if (event.type === 'child_birthday' && item.family_friendly) score += 6;
    }

    return score;
};

const scoreGlobalContext = (item, userContext = {}) => {
    let score = 0;
    const globalContext = userContext?.global_context;
    if (!globalContext) return score;

    if (item.seasonal_tag === globalContext.current_season) score += 4;
    if (item.outdoor_activity && globalContext.outdoor_boost) score += 6;
    if (item.indoor_activity && globalContext.indoor_boost) score += 5;

    if (globalContext.next_holiday && item.holiday_tag === globalContext.next_holiday.name) {
        if (globalContext.days_until_holiday <= 14) score += 5;
        if (globalContext.days_until_holiday <= 7) score += 6;
    }

    for (const sportEvent of globalContext.active_sports_events || []) {
        if (item.tags?.includes(sportEvent.sport_type) || item.sports_related) score += 4;
    }

    for (const musicEvent of globalContext.active_music_events || []) {
        if (item.genres?.some((genre) => musicEvent.genres?.includes(genre)) || item.music_related) score += 3;
    }

    return score;
};

const scoreWeather = (item, userContext = {}) => {
    let score = 0;
    const weatherContext = userContext?.weather;
    if (!weatherContext) return score;

    if (['rainy', 'stormy', 'snowy'].includes(weatherContext.condition) && item.indoor_activity) score += 5;
    if (['sunny', 'clear', 'perfect'].includes(weatherContext.condition) && item.outdoor_activity) score += 6;
    if (weatherContext.temperature > 80 && item.summer_activity) score += 3;
    if (weatherContext.temperature < 40 && item.winter_activity) score += 3;

    return score;
};

const scoreAffinity = (item, interactions = []) => {
    if (!item.creator_id || interactions.length === 0) return 0;
    const creatorInteractions = interactions.filter((interaction) => interaction.meta_data?.creator_id === item.creator_id);
    return Math.min(creatorInteractions.length * 3, 12);
};

const INTERACTION_SIGNAL = {
    view: 0.35,
    impression: 0.35,
    click: 3,
    like: 5,
    share: 7,
    rsvp: 9,
    save: 10,
    purchase: 14,
    dismiss: -18,
};

const normalizeInteractionItemType = (item = {}) => {
    const type = item.type || item.object_type;
    if (type === 'event' || type === 'moment') return 'event';
    if (type === 'offer' || type === 'coupon') return 'campaign';
    if (type === 'piece' || type === 'movement') return 'content';
    if (type === 'drop') return 'drop';
    return type || 'content';
};

const scoreBehavior = (item, interactions = []) => {
    if (!interactions.length) return { score: 0, reason: null };

    const itemType = normalizeInteractionItemType(item);
    const itemId = String(item.entity_id || item.id || '');
    let score = 0;
    let strongestPositive = null;
    let strongestPositiveValue = 0;
    let directViews = 0;

    for (const interaction of interactions) {
        const ageDays = Math.max(0, (Date.now() - new Date(interaction.created_at || Date.now()).getTime()) / 86400000);
        const decay = Math.max(0.2, 1 - (ageDays / 45));
        const signal = INTERACTION_SIGNAL[interaction.interaction_type] ?? Number(interaction.weight || 0);
        const sameType = interaction.item_type === itemType;
        const sameItem = sameType && String(interaction.item_id) === itemId;

        if (sameType) score += signal * decay * 0.35;
        if (sameItem) {
            score += signal * decay * 0.85;
            if (['view', 'impression'].includes(interaction.interaction_type)) directViews += 1;
        }

        if (sameType && signal > strongestPositiveValue) {
            strongestPositiveValue = signal;
            strongestPositive = interaction.interaction_type;
        }
    }

    if (directViews > 2) score -= Math.min((directViews - 2) * 2.5, 10);

    let reason = null;
    if (strongestPositive === 'purchase') reason = 'Based on what you buy';
    else if (strongestPositive === 'save') reason = 'Based on what you save';
    else if (['share', 'like', 'rsvp'].includes(strongestPositive)) reason = 'Inspired by your activity';
    else if (strongestPositive === 'click') reason = 'More like what you explore';

    return { score: Number(Math.max(-40, Math.min(score, 28)).toFixed(2)), reason };
};

const scoreNicheAlignment = (item, userContext = {}) => {
    const demographics = userContext?.demographics;
    if (!Array.isArray(demographics?.content_niches) || !Array.isArray(item.target_content_niches)) return 0;
    const nicheMatches = demographics.content_niches.filter((niche) => item.target_content_niches.includes(niche));
    return Math.min(nicheMatches.length * 4, 12);
};

const scoreIntentMatch = (item, intent) => {
    if (!intent) return 0;

    if (intent === 'nearby' && (item.location_city || item.location || item.country)) {
        return 12;
    }

    if (intent === 'tonight' && (item.start_date || item.starts_at || item.date)) {
        const itemDate = getItemDate(item);
        if (!itemDate) return 6;

        const hoursUntil = (itemDate.getTime() - Date.now()) / (1000 * 60 * 60);
        if (hoursUntil >= -6 && hoursUntil <= 12) return 18;
        if (hoursUntil <= 24) return 12;
        return 6;
    }

    if (intent === 'earn' && (item.gem_reward_base || item.value || item.reward_type || item.type === 'coupon')) {
        return 15;
    }

    return 0;
};

const scoreUrgency = (item) => {
    let score = 0;
    const itemDate = getItemDate(item);
    if (itemDate) {
        const hoursUntil = (itemDate.getTime() - Date.now()) / (1000 * 60 * 60);
        if (hoursUntil >= -4 && hoursUntil <= 8) score += 12;
        else if (hoursUntil <= 24) score += 8;
        else if (hoursUntil <= 72) score += 4;
    }

    if (item.expires_at) score += 4;
    if (item.status === 'active') score += 2;

    return score;
};

const scoreValue = (item) => {
    let score = 0;
    const rewardValue = Number(item.value || item.gem_reward_base || 0);
    if (rewardValue > 0) {
        score += Math.min(rewardValue / 10, 12);
    }

    if (item.type === 'coupon' || item.reward_type) score += 4;
    if (item.key_cost === 0) score += 2;

    return score;
};

const scoreQuality = (item) => {
    let score = 0;
    if (item.type === 'event' && item.status === 'published') score += 5;
    if (item.type === 'drop' && item.status === 'active') score += 5;
    if (item.type === 'coupon') score += 6;
    if (item.attendees || item.current_participants || item.participant_count) {
        score += Math.min(Number(item.attendees || item.current_participants || item.participant_count) / 20, 4);
    }
    if (item.quality_boost) score += item.quality_boost;

    return score;
};

const calculateScoreBreakdown = (item, userPrefs, userContext = {}, interactions = [], intent = null) => ({
    recency: scoreRecency(item),
    intent: scoreIntentMatch(item, intent),
    relevance: scoreInterestMatch(item, userPrefs)
        + scoreDemographics(item, userContext)
        + scoreLifeEvents(item, userContext)
        + scoreGlobalContext(item, userContext)
        + scoreWeather(item, userContext)
        + scoreNicheAlignment(item, userContext),
    proximity: scoreGeography(item, userPrefs),
    urgency: scoreUrgency(item),
    social: scoreAffinity(item, interactions),
    value: scoreValue(item),
    quality: scoreQuality(item),
    behavior: scoreBehavior(item, interactions).score,
    diversity_adjustment: 0,
});

const applyProfileWeights = (scoreBreakdown, profile = 'participant', intent = null) => {
    const profileWeights = PROFILE_WEIGHTS[profile] || PROFILE_WEIGHTS.participant;
    const intentWeights = INTENT_MULTIPLIERS[intent] || INTENT_MULTIPLIERS.default;

    const weightedScore = (
        (scoreBreakdown.recency * profileWeights.recency * intentWeights.recency) +
        (scoreBreakdown.intent * profileWeights.intent * intentWeights.intent) +
        (scoreBreakdown.relevance * profileWeights.relevance * intentWeights.relevance) +
        (scoreBreakdown.proximity * profileWeights.proximity * intentWeights.proximity) +
        (scoreBreakdown.urgency * profileWeights.urgency * intentWeights.urgency) +
        (scoreBreakdown.social * profileWeights.social * intentWeights.social) +
        (scoreBreakdown.value * profileWeights.value * intentWeights.value) +
        (scoreBreakdown.quality * profileWeights.quality * intentWeights.quality) +
        (scoreBreakdown.behavior * profileWeights.behavior * intentWeights.behavior) +
        scoreBreakdown.diversity_adjustment
    );

    return Number(weightedScore.toFixed(2));
};

const normalizeObjectType = (item) => {
    if (item.object_type) return item.object_type;
    if (item.type === 'event') return 'moment';
    if (item.type === 'drop') return 'drop';
    if (item.type === 'coupon') return 'offer';
    if (['content', 'product', 'offer', 'piece', 'promoshare_draw', 'promoshare_receipt'].includes(item.type)) return item.type;
    return 'content';
};

const buildReasonLabels = (item, intent, scoreBreakdown = null) => {
    const labels = [];

    if (item.is_sponsored) labels.push('Sponsored');
    if ((scoreBreakdown?.proximity || 0) >= 10 || (intent === 'nearby' && (item.location_city || item.location))) labels.push('Near you');
    if ((scoreBreakdown?.urgency || 0) >= 10 || (intent === 'tonight' && (item.start_date || item.starts_at || item.date))) labels.push('Tonight');
    if ((scoreBreakdown?.value || 0) >= 8 || (intent === 'earn' && (item.gem_reward_base || item.value || item.reward_type))) labels.push('Earn now');
    if ((scoreBreakdown?.relevance || 0) >= 18) labels.push('Matches your interests');
    if ((scoreBreakdown?.behavior || 0) >= 4 && item.behavior_reason) labels.push(item.behavior_reason);
    if (item.type === 'coupon') labels.push('Brand-funded');
    if (item.type === 'drop') labels.push('Proof-based');
    if ((item.score || 0) >= 70) labels.push('High match');

    return Array.from(new Set(labels)).slice(0, 3);
};

const buildPrimaryAction = (item, objectType) => {
    if (objectType === 'moment') {
        return {
            label: 'View Moment',
            action: 'view',
            href: `/moments/${item.id}`,
        };
    }

    if (objectType === 'drop') {
        return {
            label: 'Start Proof',
            action: 'start_proof',
            href: '/watch-unlock',
        };
    }

    if (objectType === 'offer') {
        return {
            label: 'See offer',
            action: 'view',
            href: `/offers/${item.entity_id || item.id}`,
        };
    }

    if (objectType === 'product') return { label: 'Shop', action: 'view', href: `/shop/${item.entity_id || item.id}` };
    if (objectType === 'piece') return { label: 'View Piece', action: 'view', href: `/pieces/${item.piece_type || 'content'}/${item.entity_id || item.id}` };
    if (objectType === 'promoshare_draw' || objectType === 'promoshare_receipt') {
        return { label: 'Open PromoShare', action: 'view', href: '/promoshare' };
    }

    return {
        label: 'Open',
        action: 'view',
        href: '/discover',
    };
};

const serializeFeedItem = (item, intent) => {
    const objectType = normalizeObjectType(item);

    return {
        ...item,
        object_type: objectType,
        entity_id: item.entity_id || item.id,
        title: item.title || item.content_title || 'Recommended for you',
        subtitle: item.creator_name || item.sponsor_name || item.platform || null,
        image_url: item.image_url || item.media_url || item.flyer_url || item.banner_url || item.image || null,
        reason_labels: buildReasonLabels(item, intent, item.score_breakdown),
        primary_cta: buildPrimaryAction(item, objectType),
        secondary_cta: {
            label: 'Save',
            action: 'save',
        },
        context: {
            starts_at: item.starts_at || item.start_date || item.event_date || item.date || item.expires_at || null,
            location_name: item.location || item.location_name || item.location_city || null,
            city: item.location_city || item.city || null,
            reward_value: item.value || item.gem_reward_base || null,
            reward_label: item.reward_label || (item.gem_reward_base ? `${item.gem_reward_base} Gems` : null),
            participants_count: item.attendees || item.current_participants || item.participant_count || null,
            host_name: item.host_name || null,
            venue_name: item.venue_name || null,
            brand_name: item.sponsor_name || null,
            merchant_name: item.merchant_name || null,
            moment_id: item.linked_moment_id || item.moment_id || null,
            content_id: item.content_id || null,
            venue_id: item.venue_id || null,
            merchant_id: item.merchant_user_id || item.merchant_id || null,
            sponsored: item.type === 'coupon' || !!item.is_sponsored,
            expires_soon: !!item.expires_at,
            available_here_now: !!item.available_here_now || !!item.moment_exclusive,
        },
        piece: item.type === 'piece' ? {
            piece_type: item.piece_type || 'content',
            asset_id: String(item.entity_id || item.content_id || item.id),
            current_price: item.current_price == null ? undefined : Number(item.current_price),
            change_24h: item.change_24h == null ? undefined : Number(item.change_24h),
            volume_24h: item.volume_24h == null ? undefined : Number(item.volume_24h),
            can_buy: item.available_pieces == null ? undefined : Number(item.available_pieces) > 0,
        } : undefined,
        promoshare: item.type === 'promoshare_draw' || item.type === 'promoshare_receipt' ? item.promoshare : undefined,
    };
};

const feedOwnerId = (item) => item.creator_id
    || item.owner_user_id
    || item.user_id
    || item.host_id
    || item.relayer_user_id
    || item.content_items?.creator_id
    || null;

const resolveRankingProfile = (user) => {
    const rawRole = (user?.user_type || user?.role || user?.active_role || '').toLowerCase();
    if (PROFILE_WEIGHTS[rawRole]) return rawRole;
    return 'participant';
};

const ageFromRange = (range) => {
    if (!range) return null;
    const match = String(range).match(/(\d+)/g);
    if (!match?.length) return null;
    if (match.length === 1) return Number(match[0]);
    return Math.round((Number(match[0]) + Number(match[1])) / 2);
};

const diversifyFeedItems = (items) => {
    const hostCounts = new Map();
    const typeCounts = new Map();
    let sponsoredCount = 0;

    const remaining = [...items];
    const ordered = [];

    while (remaining.length > 0) {
        let bestIndex = 0;
        let bestScore = -Infinity;

        for (let index = 0; index < remaining.length; index += 1) {
            const item = remaining[index];
            const hostKey = item.host_id || item.creator_id || item.sponsor_name || 'none';
            const typeKey = item.type || 'unknown';
            const hostPenalty = (hostCounts.get(hostKey) || 0) * 6;
            const typePenalty = (typeCounts.get(typeKey) || 0) * 3;
            const sponsoredPenalty = item.is_sponsored ? sponsoredCount * 7 : 0;
            const diversityAdjustment = -(hostPenalty + typePenalty + sponsoredPenalty);
            const adjustedScore = (item.score || 0) + diversityAdjustment;

            if (adjustedScore > bestScore) {
                bestScore = adjustedScore;
                bestIndex = index;
            }
        }

        const [selectedItem] = remaining.splice(bestIndex, 1);
        const hostKey = selectedItem.host_id || selectedItem.creator_id || selectedItem.sponsor_name || 'none';
        const typeKey = selectedItem.type || 'unknown';
        const hostPenalty = (hostCounts.get(hostKey) || 0) * 6;
        const typePenalty = (typeCounts.get(typeKey) || 0) * 3;
        const sponsoredPenalty = selectedItem.is_sponsored ? sponsoredCount * 7 : 0;
        const diversityAdjustment = -(hostPenalty + typePenalty + sponsoredPenalty);

        selectedItem.score_breakdown = {
            ...(selectedItem.score_breakdown || {}),
            diversity_adjustment: diversityAdjustment,
        };
        selectedItem.score = Number(((selectedItem.base_score || selectedItem.score || 0) + diversityAdjustment).toFixed(2));

        hostCounts.set(hostKey, (hostCounts.get(hostKey) || 0) + 1);
        typeCounts.set(typeKey, (typeCounts.get(typeKey) || 0) + 1);
        if (selectedItem.is_sponsored) sponsoredCount += 1;
        ordered.push(selectedItem);
    }

    return ordered;
};

const buildUserContext = async (userId) => {
    let userPrefs = {};
    let userDemographics = null;
    let userCalendar = [];
    let globalContext = null;
    let userInteractions = [];

    if (!userId) {
        return {
            userPrefs,
            userContext: {
                demographics: null,
                age: null,
                upcoming_personal_events: [],
                global_context: null,
                weather: null,
            },
            userInteractions,
        };
    }

    try {
        const [
            prefsResult,
            demographicsResult,
            calendarResult,
            globalEventsResult,
            interactionsResult,
            explicitPreferencesResult,
        ] = await Promise.all([
            supabaseAdmin
                .from('users')
                .select('preferences, location_data')
                .eq('id', userId)
                .single()
                .catch(() => ({ data: null })),
            supabaseAdmin
                .from('user_demographics')
                .select('*')
                .eq('user_id', userId)
                .single()
                .catch(() => ({ data: null })),
            supabaseAdmin
                .from('user_calendar')
                .select('*')
                .eq('user_id', userId)
                .gte('event_date', new Date().toISOString().split('T')[0])
                .lte('event_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                .catch(() => ({ data: [] })),
            supabaseAdmin
                .from('active_global_events')
                .select('*')
                .limit(10)
                .catch(() => ({ data: [] })),
            supabaseAdmin
                .from('user_interactions')
                .select('item_type, item_id, interaction_type, weight, meta_data, created_at')
                .eq('user_id', userId)
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                .catch(() => ({ data: [] })),
            supabaseAdmin
                .from('user_preferences')
                .select('preferred_categories, lifestyle_tags, age_range, gender, city, state, country, preferred_times, latitude, longitude')
                .eq('user_id', userId)
                .maybeSingle()
                .catch(() => ({ data: null })),
        ]);

        userPrefs = {
            ...(prefsResult.data?.preferences || {}),
            ...(explicitPreferencesResult.data || {}),
        };
        userPrefs.preferred_categories = explicitPreferencesResult.data?.preferred_categories || userPrefs.preferred_categories || [];
        userPrefs.interests = userPrefs.preferred_categories;
        userPrefs.lifestyle_tags = explicitPreferencesResult.data?.lifestyle_tags || userPrefs.lifestyle_tags || [];
        userPrefs.age_range = explicitPreferencesResult.data?.age_range || userPrefs.age_range || null;
        userPrefs.city = explicitPreferencesResult.data?.city || userPrefs.city || null;
        userPrefs.country = explicitPreferencesResult.data?.country || userPrefs.country || null;
        userPrefs.location_data = {
            city: userPrefs.city,
            country: userPrefs.country,
            ...(prefsResult.data?.location_data || {}),
        };

        userDemographics = demographicsResult.data;
        userCalendar = calendarResult.data || [];
        userInteractions = interactionsResult.data || [];

        const sportsEvents = globalEventsResult.data?.filter((event) => event.event_type === 'sports') || [];
        const musicEvents = globalEventsResult.data?.filter((event) => event.event_type === 'music') || [];
        const holidays = globalEventsResult.data?.filter((event) => event.event_type === 'holiday') || [];
        const nextHoliday = holidays.length > 0 ? holidays[0] : null;

        const month = new Date().getMonth() + 1;
        let currentSeason = 'spring';
        if (month >= 6 && month <= 8) currentSeason = 'summer';
        if (month >= 9 && month <= 11) currentSeason = 'fall';
        if (month === 12 || month <= 2) currentSeason = 'winter';

        const { data: seasonalConfig } = await supabaseAdmin
            .from('seasonal_config')
            .select('*')
            .eq('season', currentSeason)
            .eq('hemisphere', 'northern')
            .eq('active', true)
            .single()
            .catch(() => ({ data: null }));

        globalContext = {
            current_season: currentSeason,
            outdoor_boost: seasonalConfig?.outdoor_activity_weight > 60,
            indoor_boost: seasonalConfig?.indoor_activity_weight > 60,
            active_sports_events: sportsEvents,
            active_music_events: musicEvents,
            next_holiday: nextHoliday,
            days_until_holiday: nextHoliday
                ? Math.ceil((new Date(nextHoliday.start_date) - new Date()) / (1000 * 60 * 60 * 24))
                : null,
        };
    } catch (contextError) {
        console.warn('Could not fetch full user context:', contextError.message);
    }

    let userAge = null;
    if (userDemographics?.birthday) {
        const birthDate = new Date(userDemographics.birthday);
        userAge = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    } else {
        userAge = ageFromRange(userPrefs.age_range);
    }

    return {
        userPrefs,
        userContext: {
            demographics: userDemographics,
            age: userAge,
            upcoming_personal_events: userCalendar.map((event) => ({
                type: event.event_type,
                title: event.title,
                days_until: Math.ceil((new Date(event.event_date) - new Date()) / (1000 * 60 * 60 * 24)),
            })),
            global_context: globalContext,
            weather: null,
        },
        userInteractions,
    };
};

const fetchFeedCandidates = async (userId) => {
    try {
        const [moments, eventsTable, drops, content, forecasts, coupons, relays, commerce, pieces, authoredLinks, promoShareCycles, promoShareTickets] = await Promise.all([
            supabaseAdmin.from('moments').select('*').eq('is_active', true).neq('content_origin', 'demo').order('created_at', { ascending: false }).limit(30).catch(() => ({ data: [] })),
            supabaseAdmin.from('events').select('*').neq('status', 'cancelled').order('event_date', { ascending: true }).limit(30).catch(() => ({ data: [] })),
            Promise.resolve({ data: [] }),
            supabaseAdmin.from('content_items').select('*').neq('content_origin', 'demo').in('status', ['published', 'ghost']).order('posted_at', { ascending: false }).limit(30).catch(() => ({ data: [] })),
            Promise.resolve({ data: [] }),
            Promise.resolve({ data: [] }),
            Promise.resolve({ data: [] }),
            supabaseAdmin.from('view_public_commerce_directory').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(30).catch(() => ({ data: [] })),
            supabaseAdmin.from('content_piece_stats').select('*,content_items:content_id(title,description,media_url,creator_id)').order('updated_at', { ascending: false }).limit(20).catch(() => ({ data: [] })),
            supabaseAdmin.from('experience_commerce_links').select('*').order('created_at', { ascending: false }).limit(80).catch(() => ({ data: [] })),
            supabaseAdmin.from('promoshare_cycles').select('id,cycle_type,status,start_at,end_at,jackpot_amount').eq('status', 'active').order('end_at', { ascending: true }).limit(4).catch(() => ({ data: [] })),
            supabaseAdmin.from('promoshare_tickets').select('id,cycle_id,ticket_number,source_action,source_id,multiplier,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(20).catch(() => ({ data: [] })),
        ]);

        return { moments, eventsTable, drops, content, forecasts, coupons, relays, commerce, pieces, authoredLinks, promoShareCycles, promoShareTickets };
    } catch (fetchError) {
        console.error('Error fetching feed candidates:', fetchError);
        return {
            moments: { data: [] },
            eventsTable: { data: [] },
            drops: { data: [] },
            content: { data: [] },
            forecasts: { data: [] },
            coupons: { data: [] },
            relays: { data: [] },
            commerce: { data: [] },
            pieces: { data: [] },
            authoredLinks: { data: [] },
            promoShareCycles: { data: [] },
            promoShareTickets: { data: [] },
        };
    }
};

const scoreFeedItem = (item, rankingProfile, intent, userPrefs, userContext, userInteractions) => {
    const scoreBreakdown = calculateScoreBreakdown(item, userPrefs, userContext, userInteractions, intent);
    const score = applyProfileWeights(scoreBreakdown, rankingProfile, intent);
    const behavior = scoreBehavior(item, userInteractions);

    return {
        ...item,
        behavior_reason: behavior.reason,
        base_score: score,
        score,
        score_breakdown: scoreBreakdown,
    };
};

// ============================================
// GET FOR YOU FEED (Enhanced with Contextual Targeting)
// ============================================
router.get('/for-you', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { limit = 20, offset = 0, intent = null } = req.query;
        const rankingProfile = resolveRankingProfile(req.user);
        const [{ userPrefs, userContext, userInteractions }, candidates, blocksResult] = await Promise.all([
            buildUserContext(userId),
            fetchFeedCandidates(userId),
            supabaseAdmin.from('user_blocks').select('blocked_user_id').eq('blocker_user_id', userId).catch(() => ({ data: [] })),
        ]);

        let feedItems = [];

        if (candidates.moments?.data) {
            feedItems.push(...candidates.moments.data.map((item) => scoreFeedItem({ ...withEffectiveStart(item), type: 'event' }, rankingProfile, intent, userPrefs, userContext, userInteractions)));
        }
        if (candidates.eventsTable?.data) {
            feedItems.push(...candidates.eventsTable.data.map((item) => scoreFeedItem({
                ...item,
                type: 'event',
                starts_at: item.starts_at || item.event_date,
                ends_at: item.ends_at || item.event_end_date,
                location: item.location || item.location_name,
                image_url: item.image_url || item.flyer_url || item.banner_url,
            }, rankingProfile, intent, userPrefs, userContext, userInteractions)));
        }
        if (candidates.drops.data) {
            feedItems.push(...candidates.drops.data.map((item) => scoreFeedItem({ ...item, type: 'drop' }, rankingProfile, intent, userPrefs, userContext, userInteractions)));
        }
        if (candidates.content.data) {
            feedItems.push(...candidates.content.data.map((item) => scoreFeedItem({ ...item, type: 'content' }, rankingProfile, intent, userPrefs, userContext, userInteractions)));
        }
        if (candidates.forecasts.data) {
            feedItems.push(...candidates.forecasts.data.map((item) => scoreFeedItem({
                ...item,
                type: 'prediction',
                creator_name: item.creator?.display_name || 'Anonymous Creator',
                creator_avatar: item.creator?.avatar_url,
                quality_boost: 2,
            }, rankingProfile, intent, userPrefs, userContext, userInteractions)));
        }
        if (candidates.coupons.data) {
            feedItems.push(...candidates.coupons.data.map((item) => scoreFeedItem({
                ...item,
                type: 'coupon',
                title: item.advertiser_coupons?.title || 'Exclusive Reward',
                description: item.advertiser_coupons?.description,
                reward_type: item.advertiser_coupons?.reward_type,
                value: item.advertiser_coupons?.value,
                value_unit: item.advertiser_coupons?.value_unit,
                expires_at: item.advertiser_coupons?.end_date,
                earned_at: item.assigned_at,
            }, rankingProfile, intent, userPrefs, userContext, userInteractions)));
        }
        if (candidates.relays.data) {
            feedItems.push(...candidates.relays.data.map((item) => scoreFeedItem({ ...item, type: 'movement' }, rankingProfile, intent, userPrefs, userContext, userInteractions)));
        }
        if (candidates.commerce.data) {
            const linksByTarget = new Map((candidates.authoredLinks.data || []).map(link => [String(link.target_id), link]));
            feedItems.push(...candidates.commerce.data.map((item) => { const authored = linksByTarget.get(String(item.source_id)); const sponsored = authored?.relationship === 'sponsors' || authored?.attribution?.sponsored === true; const placementWeight = Math.min(Math.max(Number(authored?.attribution?.placement_weight || 0), 0), 8); return scoreFeedItem({
                ...item,
                type: item.discount_value ? 'offer' : 'product',
                title: item.name,
                image_url: item.image_url,
                reward_label: item.discount_value ? `${item.discount_value}${item.discount_type === 'percentage' ? '%' : ''} off` : undefined,
                merchant_name: item.merchant_name,
                entity_id: item.listing_id,
                quality_boost: sponsored ? 4 + placementWeight : authored ? 5 : item.moment_exclusive ? 3 : 1,
                connected_context: authored || null,
                reason_label: authored ? 'Connected to a Moment' : undefined,
                is_sponsored: sponsored,
                sponsor_source_type: sponsored ? authored.source_type : null,
                sponsor_source_id: sponsored ? authored.source_id : null,
            }, rankingProfile, intent, userPrefs, userContext, userInteractions) }));
        }
        if (candidates.pieces.data) {
            feedItems.push(...candidates.pieces.data.map((item) => scoreFeedItem({
                ...item,
                id: item.content_id,
                entity_id: item.content_id,
                type: 'piece',
                title: item.content_items?.title || 'Content Piece',
                description: item.content_items?.description || 'Own a piece of the momentum and follow its return.',
                image_url: item.content_items?.media_url,
                current_price: item.current_price,
                change_24h: item.change_24h,
                available_pieces: item.available_pieces,
                holder_count: item.holder_count,
                quality_boost: 2,
            }, rankingProfile, intent, userPrefs, userContext, userInteractions)));
        }
        if (candidates.promoShareCycles.data) {
            feedItems.push(...candidates.promoShareCycles.data.map((item) => scoreFeedItem({
                ...item,
                type: 'promoshare_draw',
                title: `${item.cycle_type?.[0]?.toUpperCase() || ''}${item.cycle_type?.slice(1) || ''} PromoShare Draw`,
                description: 'Your verified actions can issue named Tickets into this draw.',
                reward_value: Number(item.jackpot_amount || 0),
                reward_label: item.jackpot_amount ? `${Number(item.jackpot_amount).toLocaleString()} Gems` : 'Named rewards',
                expires_at: item.end_at,
                quality_boost: 3,
                promoshare: { cycle_id: item.id, cycle_type: item.cycle_type, ticket_count: 0, draw_at: item.end_at, status: 'closing' },
            }, rankingProfile, intent, userPrefs, userContext, userInteractions)));
        }
        if (candidates.promoShareTickets.data) {
            const cyclesById = new Map((candidates.promoShareCycles.data || []).map((cycle) => [String(cycle.id), cycle]));
            feedItems.push(...candidates.promoShareTickets.data.map((item) => {
                const cycle = cyclesById.get(String(item.cycle_id));
                return scoreFeedItem({
                    ...item,
                    type: 'promoshare_receipt',
                    title: 'PromoShare Ticket earned',
                    description: `Your ${String(item.source_action || 'verified action').replaceAll('_', ' ')} counted.`,
                    expires_at: cycle?.end_at,
                    quality_boost: 5,
                    promoshare: { cycle_id: item.cycle_id, cycle_type: cycle?.cycle_type, ticket_count: 1, source_action: item.source_action, source_id: item.source_id, draw_at: cycle?.end_at, status: 'entered' },
                }, rankingProfile, intent, userPrefs, userContext, userInteractions);
            }));
        }

        const blockedUserIds = new Set((blocksResult.data || []).map((row) => String(row.blocked_user_id)));
        const visibleItems = feedItems.filter((item) => {
            const ownerId = feedOwnerId(item);
            return !ownerId || !blockedUserIds.has(String(ownerId));
        });
        const diversifiedItems = diversifyFeedItems(visibleItems);
        const numericOffset = parseInt(offset, 10);
        const numericLimit = parseInt(limit, 10);
        const pagedItems = diversifiedItems
            .slice(numericOffset, numericOffset + numericLimit)
            .map((item) => serializeFeedItem(item, intent));

        res.json({
            status: 'success',
            data: {
                feed: pagedItems,
                meta: {
                    user_interests: userPrefs.interests || [],
                    next_offset: numericOffset + pagedItems.length,
                    has_more: diversifiedItems.length > numericOffset + pagedItems.length,
                    active_intent: intent,
                    ranking_profile: rankingProfile,
                }
            }
        });

    } catch (error) {
        console.error('Error fetching feed:', error);
        // Return empty feed instead of 500
        res.json({
            status: 'success',
            data: {
                feed: [],
                meta: {
                    user_interests: [],
                    next_offset: parseInt(req.query?.offset || 0, 10),
                    has_more: false,
                    active_intent: req.query?.intent || null,
                    ranking_profile: resolveRankingProfile(req.user),
                }
            },
            warning: 'Feed could not be fully loaded'
        });
    }
});

router.post('/report', requireAuth, async (req, res) => {
    try {
        const { target_type, target_id, reported_user_id = null, reason, details = null } = req.body || {};
        const allowedTypes = new Set(['moment', 'content', 'product', 'offer', 'piece', 'user']);
        const allowedReasons = new Set(['spam', 'harassment', 'hate', 'nudity', 'violence', 'dangerous', 'fraud', 'intellectual_property', 'other']);
        if (!allowedTypes.has(target_type) || !target_id || !allowedReasons.has(reason)) {
            return res.status(422).json({ error: 'Choose a valid report reason' });
        }
        const { error } = await supabaseAdmin.from('content_reports').insert({
            reporter_user_id: req.user.id,
            target_type,
            target_id: String(target_id),
            reported_user_id,
            reason,
            details: details ? String(details).slice(0, 1000) : null,
            source: 'mobile_feed',
        });
        if (error) throw error;
        return res.status(201).json({ success: true });
    } catch (error) {
        console.error('Content report failed:', error);
        return res.status(500).json({ error: 'Could not submit this report' });
    }
});

router.post('/block', requireAuth, async (req, res) => {
    try {
        const blockedUserId = String(req.body?.blocked_user_id || '');
        if (!blockedUserId || blockedUserId === req.user.id) {
            return res.status(422).json({ error: 'Choose another user to block' });
        }
        const { error } = await supabaseAdmin.from('user_blocks').upsert({
            blocker_user_id: req.user.id,
            blocked_user_id: blockedUserId,
        }, { onConflict: 'blocker_user_id,blocked_user_id' });
        if (error) throw error;
        return res.status(201).json({ success: true });
    } catch (error) {
        console.error('User block failed:', error);
        return res.status(500).json({ error: 'Could not block this user' });
    }
});

// ============================================
// LOG INTERACTION
// ============================================
router.post('/interaction', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { item_type, item_id, interaction_type, meta_data } = req.body;

        if (!item_type || !item_id || !interaction_type) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const normalizedType = item_type === 'moment'
            ? 'event'
            : item_type === 'offer' || item_type === 'coupon'
                ? 'campaign'
                : item_type === 'piece'
                    ? 'content'
                    : item_type;
        const normalizedInteraction = interaction_type === 'impression' ? 'view' : interaction_type;
        const allowedTypes = new Set(['content', 'drop', 'event', 'product', 'campaign']);
        const weights = { view: 1, click: 4, like: 6, share: 8, rsvp: 10, purchase: 14, save: 10, dismiss: -18 };

        if (!allowedTypes.has(normalizedType) || weights[normalizedInteraction] === undefined) {
            return res.status(422).json({ success: false, error: 'Unsupported feed interaction' });
        }

        const { error } = await supabaseAdmin
            .from('user_interactions')
            .insert({
                user_id: userId,
                item_type: normalizedType,
                item_id,
                interaction_type: normalizedInteraction,
                meta_data: { ...(meta_data || {}), original_interaction: interaction_type },
                weight: weights[normalizedInteraction]
            });

        if (error) {
            console.error('Error logging interaction:', error);
            // Don't block client on logging error, just log it
            return res.status(200).json({ success: false, warning: 'Failed to save interaction' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error in POST /interaction:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================
// MANAGE PREFERENCES
// ============================================
router.get('/preferences', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { data, error } = await supabaseAdmin
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error('Error fetching preferences:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch preferences' });
        }

        res.json({
            status: 'success',
            data: data || { interests: [], location_data: {}, demographics: {} }
        });
    } catch (error) {
        console.error('Error in GET /preferences:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

router.put('/preferences', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { interests, location_data, demographics } = req.body;

        // Upsert
        const { data, error } = await supabaseAdmin
            .from('user_preferences')
            .upsert({
                user_id: userId,
                interests,
                location_data,
                demographics,
                updated_at: new Date()
            })
            .select()
            .single();

        if (error) {
            console.error('Error updating preferences:', error);
            return res.status(500).json({ success: false, error: 'Failed to update preferences' });
        }

        res.json({
            status: 'success',
            data,
            message: 'Preferences updated'
        });
    } catch (error) {
        console.error('Error in PUT /preferences:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
