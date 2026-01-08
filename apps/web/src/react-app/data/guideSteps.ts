import {
    User,
    Share2,
    DollarSign,
    Trophy,
    Gift,
    Settings,
    Shield
} from 'lucide-react';

export interface GuideStep {
    id: string;
    title: string;
    description: string;
    icon: any;
    actionLabel: string;
    link: string;
    isCompleted?: boolean;
}

export const GUIDE_STEPS: GuideStep[] = [
    {
        id: 'complete_profile',
        title: 'Complete Your Profile',
        description: 'Add a bio and profile picture to look professional.',
        icon: User,
        actionLabel: 'Edit Profile',
        link: '/settings'
    },
    {
        id: 'connect_social',
        title: 'Connect Social Accounts',
        description: 'Link your Instagram or TikTok to verify your influence.',
        icon: Share2,
        actionLabel: 'Connect',
        link: '/settings#socials'
    },
    {
        id: 'first_drop',
        title: 'Join Your First Drop',
        description: 'Browse the marketplace and apply for a campaign.',
        icon: DollarSign,
        actionLabel: 'Browse Drops',
        link: '/marketplace'
    },
    {
        id: 'master_key',
        title: 'Activate Master Key',
        description: 'Unlock daily rewards by activating your Master Key.',
        icon: Trophy,
        actionLabel: 'Go to Wallet',
        link: '/wallet'
    },
    {
        id: 'refer_friend',
        title: 'Refer a Creator',
        description: 'Invite a friend to earn bonus points.',
        icon: Gift,
        actionLabel: 'Get Link',
        link: '/growth'
    }
];
