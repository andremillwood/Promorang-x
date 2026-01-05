const mockUsers = new Map();

/**
 * Ensures a user profile exists in the mock store
 */
const ensureUserProfile = (user) => {
    if (!user || !user.id) return user;

    if (!mockUsers.has(user.id)) {
        mockUsers.set(user.id, {
            id: user.id,
            email: user.email || 'demo@example.com',
            username: user.username || 'demo_user',
            display_name: user.display_name || user.username || 'Demo User',
            user_type: user.user_type || 'creator',
            points_balance: user.points_balance || 1000,
            keys_balance: user.keys_balance || 50,
            gems_balance: user.gems_balance || 0,
            gold_collected: user.gold_collected || 0,
            user_tier: user.user_tier || 'free',
            avatar_url: user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...user
        });
    }
    return mockUsers.get(user.id);
};

/**
 * Updates a user profile in the mock store
 */
const updateUserProfile = (userId, updates) => {
    const user = mockUsers.get(userId) || { id: userId };
    const updatedUser = {
        ...user,
        ...updates,
        updated_at: new Date().toISOString()
    };
    mockUsers.set(userId, updatedUser);
    return updatedUser;
};

/**
 * Gets a user profile from the mock store
 */
const getUserProfile = (userId) => {
    return mockUsers.get(userId);
};

module.exports = {
    ensureUserProfile,
    updateUserProfile,
    getUserProfile,
    mockUsers
};
