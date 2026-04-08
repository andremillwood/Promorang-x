import { Step } from 'react-joyride';

export type TourId =
    | 'first-time-user'
    | 'create-moment'
    | 'create-campaign'
    | 'discover'
    | 'analytics'
    | 'merchant-setup'
    | 'brand-directory'
    | 'merchant-directory'
    | 'host-directory';

export interface TourConfig {
    id: TourId;
    title: string;
    description: string;
    targetRole?: 'host' | 'brand' | 'merchant' | 'user';
    steps: Step[];
}

/**
 * First-Time User Tour
 * Guides new users through the home page and basic navigation
 */
export const firstTimeUserTour: TourConfig = {
    id: 'first-time-user',
    title: 'Welcome to Promorang!',
    description: 'Let\'s show you around',
    steps: [
        {
            target: 'body',
            content: '👋 Welcome to Promorang! We\'re excited to help you discover and create amazing moments. Let\'s take a quick tour.',
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '[data-tour="moments-section"]',
            content: '✨ These are example moments happening in your area. Browse categories and find experiences that interest you!',
            placement: 'top',
        },
        {
            target: '[data-tour="discover-link"]',
            content: '🔍 Click here to explore all available moments. Use filters to find exactly what you\'re looking for.',
            placement: 'bottom',
        },
        {
            target: '[data-tour="create-moment-cta"]',
            content: '🎉 Ready to host your own moment? Click here to create one and bring people together!',
            placement: 'top',
        },
        {
            target: '[data-tour="user-menu"]',
            content: '⚙️ Access your profile, settings, and saved moments from here. Let\'s get started!',
            placement: 'bottom',
        },
    ],
};

/**
 * Create Moment Tour
 * Guides hosts through creating their first moment
 */
export const createMomentTour: TourConfig = {
    id: 'create-moment',
    title: 'Create Your First Moment',
    description: 'Learn how to host an amazing experience',
    targetRole: 'host',
    steps: [
        {
            target: 'body',
            content: '🎯 Let\'s create your first moment! We\'ll guide you through each step to ensure success.',
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '[data-tour="moment-title"]',
            content: '📝 Give your moment a catchy, descriptive title. Make it clear what attendees will experience!',
            placement: 'bottom',
        },
        {
            target: '[data-tour="moment-category"]',
            content: '🏷️ Choose a category that best describes your moment. This helps people discover it.',
            placement: 'bottom',
        },
        {
            target: '[data-tour="moment-location"]',
            content: '📍 Specify where your moment will happen. You can choose an existing venue or add a new location.',
            placement: 'bottom',
        },
        {
            target: '[data-tour="moment-capacity"]',
            content: '👥 Set a maximum number of participants. Limited spots create urgency and exclusivity!',
            placement: 'bottom',
        },
        {
            target: '[data-tour="moment-reward"]',
            content: '🎁 Optional: Offer a reward to boost engagement. This could be a discount, free item, or special perk.',
            placement: 'bottom',
        },
        {
            target: '[data-tour="moment-publish"]',
            content: '🚀 When you\'re ready, publish your moment! You can always edit it later.',
            placement: 'top',
        },
    ],
};

/**
 * Discover Tour
 * Helps users navigate the discover page
 */
export const discoverTour: TourConfig = {
    id: 'discover',
    title: 'Discover Amazing Moments',
    description: 'Find experiences worth joining',
    steps: [
        {
            target: 'body',
            content: '🔍 Welcome to Discover! This is where you\'ll find all the amazing moments happening around you.',
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '[data-tour="search-bar"]',
            content: '🔎 Search for moments by name, location, or activity. Try searching for something you love!',
            placement: 'bottom',
        },
        {
            target: '[data-tour="category-filter"]',
            content: '🏷️ Filter by category to narrow down your options. Find exactly what you\'re in the mood for.',
            placement: 'bottom',
        },
        {
            target: '[data-tour="sort-options"]',
            content: '⚡ Sort by date, popularity, or distance to find the perfect moment for you.',
            placement: 'bottom',
        },
        {
            target: '[data-tour="moment-card"]',
            content: '💫 Click on any moment card to see full details, RSVP, and connect with the host.',
            placement: 'top',
        },
    ],
};

/**
 * Create Campaign Tour
 * Guides brands through campaign creation
 */
export const createCampaignTour: TourConfig = {
    id: 'create-campaign',
    title: 'Launch Your First Campaign',
    description: 'Activate your brand through moments',
    targetRole: 'brand',
    steps: [
        {
            target: 'body',
            content: '🎯 Let\'s create your first brand activation campaign! We\'ll help you reach the right audience.',
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '[data-tour="campaign-name"]',
            content: '📝 Name your campaign. This is internal - choose something that helps you track it.',
            placement: 'bottom',
        },
        {
            target: '[data-tour="campaign-budget"]',
            content: '💰 Set your campaign budget. This determines how many moments you can sponsor.',
            placement: 'bottom',
        },
        {
            target: '[data-tour="campaign-targeting"]',
            content: '🎯 Define your target audience by category, location, and demographics.',
            placement: 'bottom',
        },
        {
            target: '[data-tour="campaign-criteria"]',
            content: '✅ Set activation criteria - what moments qualify for your campaign?',
            placement: 'bottom',
        },
        {
            target: '[data-tour="campaign-launch"]',
            content: '🚀 Launch your campaign and start discovering moments to sponsor!',
            placement: 'top',
        },
    ],
};

/**
 * Analytics Tour
 * Explains the analytics dashboard
 */
export const analyticsTour: TourConfig = {
    id: 'analytics',
    title: 'Understanding Your Analytics',
    description: 'Track your success and insights',
    steps: [
        {
            target: 'body',
            content: '📊 Welcome to Analytics! Here you can track your performance and gain insights.',
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '[data-tour="overview-metrics"]',
            content: '📈 These key metrics show your overall performance at a glance.',
            placement: 'bottom',
        },
        {
            target: '[data-tour="engagement-chart"]',
            content: '💫 Track engagement over time to see when your moments perform best.',
            placement: 'top',
        },
        {
            target: '[data-tour="date-range"]',
            content: '📅 Adjust the date range to analyze specific time periods.',
            placement: 'bottom',
        },
        {
            target: '[data-tour="export-data"]',
            content: '📥 Export your data for deeper analysis or reporting.',
            placement: 'left',
        },
    ],
};

/**
 * All tour configurations
 */
export const tours: Record<TourId, TourConfig> = {
    'first-time-user': firstTimeUserTour,
    'create-moment': createMomentTour,
    'create-campaign': createCampaignTour,
    'discover': discoverTour,
    'analytics': analyticsTour,
    'merchant-setup': {
        id: 'merchant-setup',
        title: 'Set Up Your Merchant Profile',
        description: 'Start selling products and services',
        targetRole: 'merchant',
        steps: [
            {
                target: 'body',
                content: '🏪 Let\'s set up your merchant profile so you can start offering products and services!',
                placement: 'center',
                disableBeacon: true,
            },
        ],
    },
    'brand-directory': {
        id: 'brand-directory',
        title: 'Explore Brands',
        description: 'Discover brands powering the ecosystem',
        steps: [
            {
                target: 'body',
                content: '🏢 Welcome to the Brand Directory! Here you can find all the brands active on Promorang.',
                placement: 'center',
                disableBeacon: true,
            },
            {
                target: '[data-tour="directory-search"]',
                content: '🔍 Searching for a specific brand? Use this bar to find them by name.',
                placement: 'bottom',
            },
            {
                target: '[data-tour="directory-category"]',
                content: '🏷️ Browse brands by industry, such as Lifestyle, Tech, or Entertainment.',
                placement: 'bottom',
            },
            {
                target: '[data-tour="directory-card"]',
                content: '✨ Click on any brand to see their active campaigns and sponsored moments.',
                placement: 'top',
            },
        ],
    },
    'merchant-directory': {
        id: 'merchant-directory',
        title: 'Find Local Merchants',
        description: 'Discover venues and services near you',
        steps: [
            {
                target: 'body',
                content: '🛍️ Welcome to the Merchant Directory! Find local businesses hosting moments and offering rewards.',
                placement: 'center',
                disableBeacon: true,
            },
            {
                target: '[data-tour="directory-search"]',
                content: '📍 Search by business name or location to find merchants in your city.',
                placement: 'bottom',
            },
            {
                target: '[data-tour="directory-category"]',
                content: '🍵 Looking for a cafe, gym, or restaurant? Select a category to narrow your search.',
                placement: 'bottom',
            },
            {
                target: '[data-tour="directory-card"]',
                content: '🎁 View merchant profiles to see available products and redemption history.',
                placement: 'top',
            },
        ],
    },
    'host-directory': {
        id: 'host-directory',
        title: 'Connect with Hosts',
        description: 'Find community leaders and curators',
        steps: [
            {
                target: 'body',
                content: '🤝 Welcome to the Host Directory! Meet the creators and organizers behind your favorite moments.',
                placement: 'center',
                disableBeacon: true,
            },
            {
                target: '[data-tour="directory-search"]',
                content: '🔎 Find specific hosts by their display name or username.',
                placement: 'bottom',
            },
            {
                target: '[data-tour="directory-card"]',
                content: '⭐ Check out their hosted moments and reliability score to find top-rated curators!',
                placement: 'top',
            },
        ],
    },
};

/**
 * Get tour by ID
 */
export function getTour(tourId: TourId): TourConfig {
    return tours[tourId];
}

/**
 * Get tours for a specific role
 */
export function getToursForRole(role: 'host' | 'brand' | 'merchant' | 'user'): TourConfig[] {
    return Object.values(tours).filter(
        tour => !tour.targetRole || tour.targetRole === role
    );
}
