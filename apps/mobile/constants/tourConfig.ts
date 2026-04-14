// Tour configuration for mobile app
// Shared tour IDs with web for cross-platform progress tracking

export type TourId =
    | 'first-time-user'
    | 'create-proposal'
    | 'catalog'
    | 'check-in'
    | 'dashboard';

export interface TourStep {
    title: string;
    content: string;
    target?: string; // Optional: for highlighting specific elements
}

export interface TourConfig {
    id: TourId;
    title: string;
    description: string;
    steps: TourStep[];
}

/**
 * First-Time User Tour
 * Guides new users through the mobile app basics
 */
export const firstTimeUserTour: TourConfig = {
    id: 'first-time-user',
    title: 'Welcome to Promorang!',
    description: 'Let\'s show you around',
    steps: [
        {
            title: 'Welcome! 👋',
            content: 'Welcome to Promorang! We\'re excited to help you discover amazing opportunities. Let\'s take a quick tour.',
        },
        {
            title: 'Explore Moments',
            content: 'Browse moments happening near you. Swipe through categories to find experiences that interest you!',
        },
        {
            title: 'Your Profile',
            content: 'Tap here to access your profile, settings, and saved moments.',
        },
        {
            title: 'Get Started! 🎉',
            content: 'You\'re all set! Start exploring and participating in moments.',
        },
    ],
};

/**
 * Create Proposal Tour
 * Guides users through creating a proposal
 */
export const createProposalTour: TourConfig = {
    id: 'create-proposal',
    title: 'Create Your First Proposal',
    description: 'Learn how to submit a proposal',
    steps: [
        {
            title: 'Let\'s Create! 🎯',
            content: 'We\'ll guide you through creating your first proposal step by step.',
        },
        {
            title: 'Proposal Title',
            content: 'Give your proposal a clear, descriptive title that explains what you\'re offering.',
        },
        {
            title: 'Budget Allocation',
            content: 'Set your budget and how you want to allocate it across different channels.',
        },
        {
            title: 'Target Audience',
            content: 'Define who you want to reach with your proposal.',
        },
        {
            title: 'Submit for Review',
            content: 'Once you\'re happy with your proposal, submit it for review. You\'ll be notified of the status!',
        },
    ],
};

/**
 * Catalog Tour
 * Shows users how to browse and select products
 */
export const catalogTour: TourConfig = {
    id: 'catalog',
    title: 'Browse the Catalog',
    description: 'Discover products and services',
    steps: [
        {
            title: 'Product Catalog 🛍️',
            content: 'Browse through available products and services from our partners.',
        },
        {
            title: 'Search & Filter',
            content: 'Use the search bar and filters to find exactly what you need.',
        },
        {
            title: 'Product Details',
            content: 'Tap any product to see full details, pricing, and availability.',
        },
        {
            title: 'Add to Proposal',
            content: 'Select products to add them to your proposal or cart.',
        },
    ],
};

/**
 * Check-In Tour
 * Explains the check-in process
 */
export const checkInTour: TourConfig = {
    id: 'check-in',
    title: 'Check Into Moments',
    description: 'Learn how to check in',
    steps: [
        {
            title: 'Check-In Process 📍',
            content: 'When you arrive at a moment, use this screen to check in and confirm your attendance.',
        },
        {
            title: 'Scan QR Code',
            content: 'Scan the QR code provided by the host to quickly check in.',
        },
        {
            title: 'Earn Rewards',
            content: 'Checking in earns you points and unlocks rewards!',
        },
    ],
};

/**
 * Dashboard Tour
 * Overview of the dashboard features
 */
export const dashboardTour: TourConfig = {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'Track your activity and stats',
    steps: [
        {
            title: 'Dashboard Overview 📊',
            content: 'Your dashboard shows all your key metrics and activity at a glance.',
        },
        {
            title: 'Your Stats',
            content: 'See your points, moments attended, and rewards earned.',
        },
        {
            title: 'Recent Activity',
            content: 'View your recent check-ins, proposals, and interactions.',
        },
        {
            title: 'Quick Actions',
            content: 'Access common actions like creating proposals or checking in from here.',
        },
    ],
};

// Export all tours
export const tours: TourConfig[] = [
    firstTimeUserTour,
    createProposalTour,
    catalogTour,
    checkInTour,
    dashboardTour,
];

// Helper to get tour by ID
export const getTourById = (id: TourId): TourConfig | undefined => {
    return tours.find(tour => tour.id === id);
};
