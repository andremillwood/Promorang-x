/**
 * PROMORANG GAME CONFIGURATION
 * Narrative wrappers and game layer constants
 */

const DISTRICT_MAPPING = {
    'beauty': 'The Dazzle District',
    'wellness': 'Nirvana sector',
    'tech': 'The Silicon Sprawl',
    'fashion': 'Style Sanctuary',
    'food': 'Gourmet Gardens',
    'entertainment': 'Neon Nexus',
    'default': 'The Commons'
};

const HOUSE_MAPPING = {
    'Solis': {
        motto: 'Radiance in Action',
        color: 'amber',
        district: 'Solar Heights'
    },
    'Luna': {
        motto: 'Wisdom in Shadows',
        color: 'purple',
        district: 'Lunar Plains'
    },
    'Terra': {
        motto: 'Growth in Roots',
        color: 'emerald',
        district: 'Obsidian Hills'
    },
    'Aether': {
        motto: 'Power in Flow',
        color: 'blue',
        district: 'Celestial Peaks'
    }
};

module.exports = {
    DISTRICT_MAPPING,
    HOUSE_MAPPING
};
