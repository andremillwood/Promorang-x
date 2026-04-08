/**
 * Last Night Service
 * 
 * Provides data for the "Last Night" view - yesterday's finalized outcomes.
 * This is what turns activity into memory.
 */

const { pool } = require('../db');

/**
 * Get yesterday's outcome for the Last Night view
 */
async function getLastNight(userId) {
    const client = await pool.connect();

    try {
        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Get the daily outcome
        const outcomeResult = await client.query(`
            SELECT 
                id,
                date,
                district_id,
                district_name,
                winning_house_id,
                house_scores,
                total_participants,
                total_quests_completed,
                total_gems_distributed,
                draw_winners,
                locked_at
            FROM daily_outcomes
            WHERE date = $1
        `, [yesterdayStr]);

        const outcome = outcomeResult.rows[0];

        // Get user's participation for yesterday
        let userParticipation = null;
        if (userId) {
            const participationResult = await client.query(`
                SELECT 
                    quests_completed,
                    gems_earned,
                    house_points_contributed,
                    draw_entries,
                    house_id,
                    house_rank,
                    first_action_at,
                    last_action_at
                FROM user_daily_participation
                WHERE user_id = $1 AND date = $2
            `, [userId, yesterdayStr]);

            userParticipation = participationResult.rows[0] || null;
        }

        // If no outcome exists, return fallback/demo data
        if (!outcome) {
            return {
                date: yesterdayStr,
                hasOutcome: false,
                demo: true,
                district: {
                    id: 'food-district',
                    name: 'Food District'
                },
                winner: {
                    houseId: 'sauce',
                    houseName: 'House Sauce',
                    houseColor: '#F97316',
                    houseIcon: '🔥'
                },
                houseScores: [
                    { houseId: 'sauce', houseName: 'House Sauce', score: 892, color: '#F97316', icon: '🔥' },
                    { houseId: 'luna', houseName: 'House Luna', score: 847, color: '#8B5CF6', icon: '🌙' },
                    { houseId: 'tide', houseName: 'House Tide', score: 723, color: '#06B6D4', icon: '🌊' },
                    { houseId: 'stone', houseName: 'House Stone', score: 681, color: '#84CC16', icon: '🏔️' }
                ],
                stats: {
                    participants: 156,
                    questsCompleted: 423,
                    gemsDistributed: 2150
                },
                drawWinners: [
                    { tier: 'grand', prize: '500 Gems', winner: 'Navigator_Alpha' },
                    { tier: 'major', prize: '100 Gems', winner: 'QuestRunner_42' }
                ],
                userParticipation: userParticipation || {
                    didParticipate: false,
                    questsCompleted: 0,
                    gemsEarned: 0,
                    houseRank: null
                },
                historyLine: 'House Sauce claimed Food District • Day 4 (Demo)'
            };
        }

        // Parse house scores
        const houseScores = parseHouseScores(outcome.house_scores);
        const winningHouse = getHouseDetails(outcome.winning_house_id);

        return {
            date: outcome.date,
            hasOutcome: true,
            demo: false,
            district: {
                id: outcome.district_id,
                name: outcome.district_name
            },
            winner: {
                houseId: outcome.winning_house_id,
                houseName: winningHouse.name,
                houseColor: winningHouse.color,
                houseIcon: winningHouse.icon
            },
            houseScores,
            stats: {
                participants: outcome.total_participants,
                questsCompleted: outcome.total_quests_completed,
                gemsDistributed: parseFloat(outcome.total_gems_distributed) || 0
            },
            drawWinners: outcome.draw_winners || [],
            userParticipation: userParticipation ? {
                didParticipate: true,
                questsCompleted: userParticipation.quests_completed,
                gemsEarned: parseFloat(userParticipation.gems_earned) || 0,
                housePointsContributed: userParticipation.house_points_contributed,
                drawEntries: userParticipation.draw_entries,
                houseRank: userParticipation.house_rank
            } : {
                didParticipate: false,
                questsCompleted: 0,
                gemsEarned: 0,
                houseRank: null
            },
            lockedAt: outcome.locked_at,
            historyLine: `${winningHouse.name} claimed ${outcome.district_name}`
        };

    } finally {
        client.release();
    }
}

/**
 * Record today's outcome (called by cron at midnight)
 */
async function recordDailyOutcome() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const today = new Date().toISOString().split('T')[0];

        // Aggregate house scores from today's participation
        const scoresResult = await client.query(`
            SELECT 
                house_id,
                SUM(house_points_contributed) as total_points,
                COUNT(DISTINCT user_id) as participants
            FROM user_daily_participation
            WHERE date = $1 AND house_id IS NOT NULL
            GROUP BY house_id
            ORDER BY total_points DESC
        `, [today]);

        // Build house scores object
        const houseScores = {};
        let winningHouseId = null;
        let maxScore = 0;

        for (const row of scoresResult.rows) {
            houseScores[row.house_id] = parseInt(row.total_points) || 0;
            if (houseScores[row.house_id] > maxScore) {
                maxScore = houseScores[row.house_id];
                winningHouseId = row.house_id;
            }
        }

        // Get totals
        const totalsResult = await client.query(`
            SELECT 
                COUNT(DISTINCT user_id) as total_participants,
                SUM(quests_completed) as total_quests,
                SUM(gems_earned) as total_gems
            FROM user_daily_participation
            WHERE date = $1
        `, [today]);

        const totals = totalsResult.rows[0] || {};

        // Upsert the daily outcome
        await client.query(`
            INSERT INTO daily_outcomes (
                date,
                district_id,
                district_name,
                winning_house_id,
                house_scores,
                total_participants,
                total_quests_completed,
                total_gems_distributed,
                locked_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT (date) DO UPDATE SET
                winning_house_id = EXCLUDED.winning_house_id,
                house_scores = EXCLUDED.house_scores,
                total_participants = EXCLUDED.total_participants,
                total_quests_completed = EXCLUDED.total_quests_completed,
                total_gems_distributed = EXCLUDED.total_gems_distributed,
                locked_at = NOW()
        `, [
            today,
            'food-district',
            'Food District',
            winningHouseId,
            JSON.stringify(houseScores),
            parseInt(totals.total_participants) || 0,
            parseInt(totals.total_quests) || 0,
            parseFloat(totals.total_gems) || 0
        ]);

        // Update house ranks in participation records
        let rank = 1;
        for (const row of scoresResult.rows) {
            await client.query(`
                UPDATE user_daily_participation
                SET house_rank = $1
                WHERE date = $2 AND house_id = $3
            `, [rank, today, row.house_id]);
            rank++;
        }

        await client.query('COMMIT');

        console.log(`[LastNight] Recorded outcome for ${today}: Winner = ${winningHouseId}`);

        return { success: true, winningHouseId, houseScores };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[LastNight] Error recording daily outcome:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Track user participation for today
 */
async function trackParticipation(userId, { questsCompleted = 0, gemsEarned = 0, housePoints = 0, drawEntries = 0 }) {
    const client = await pool.connect();

    try {
        const today = new Date().toISOString().split('T')[0];

        // Get user's house
        const userResult = await client.query('SELECT house_id FROM users WHERE id = $1', [userId]);
        const houseId = userResult.rows[0]?.house_id || null;

        await client.query(`
            INSERT INTO user_daily_participation (
                user_id,
                date,
                quests_completed,
                gems_earned,
                house_points_contributed,
                draw_entries,
                house_id,
                first_action_at,
                last_action_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            ON CONFLICT (user_id, date) DO UPDATE SET
                quests_completed = user_daily_participation.quests_completed + $3,
                gems_earned = user_daily_participation.gems_earned + $4,
                house_points_contributed = user_daily_participation.house_points_contributed + $5,
                draw_entries = user_daily_participation.draw_entries + $6,
                last_action_at = NOW()
        `, [userId, today, questsCompleted, gemsEarned, housePoints, drawEntries, houseId]);

    } finally {
        client.release();
    }
}

// Helper: Get house details
function getHouseDetails(houseId) {
    const houses = {
        sauce: { name: 'House Sauce', color: '#F97316', icon: '🔥' },
        luna: { name: 'House Luna', color: '#8B5CF6', icon: '🌙' },
        tide: { name: 'House Tide', color: '#06B6D4', icon: '🌊' },
        stone: { name: 'House Stone', color: '#84CC16', icon: '🏔️' }
    };
    return houses[houseId] || { name: 'Unknown', color: '#71717A', icon: '❓' };
}

// Helper: Parse house scores into array
function parseHouseScores(scores) {
    const scoreObj = typeof scores === 'string' ? JSON.parse(scores) : (scores || {});
    return Object.entries(scoreObj)
        .map(([houseId, score]) => ({
            houseId,
            ...getHouseDetails(houseId),
            houseName: getHouseDetails(houseId).name,
            score: parseInt(score) || 0
        }))
        .sort((a, b) => b.score - a.score);
}

module.exports = {
    getLastNight,
    recordDailyOutcome,
    trackParticipation
};
