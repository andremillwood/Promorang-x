require('dotenv').config({ path: '../../.env' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
    const client = await pool.connect();

    try {
        console.log('🚀 Starting Final Moment Infrastructure Cleanup...');
        await client.query('BEGIN');

        // 1. Drop Legacy Tables logic (Subtractive)
        const tablesToDrop = [
            'content_shares',
            'leaderboard',
            'achievements',
            'tasks',
            'sponsorships',
            'investments'
        ];

        for (const table of tablesToDrop) {
            console.log(`Checking table: ${table}...`);
            await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        }

        // 2. Clean User Table columns
        console.log('Cleaning user table...');
        const userColsToDrop = [
            'xp_points',
            'level',
            'points_streak_days',
            'total_earnings_usd',
            'gems_balance',
            'keys_balance',
            'gold_collected'
        ];

        for (const col of userColsToDrop) {
            await client.query(`ALTER TABLE users DROP COLUMN IF EXISTS ${col}`);
        }

        // 3. Ensure Reliability Index exists and defaults
        console.log('Initializing Reliability Index...');
        await client.query(`
            UPDATE users 
            SET reliability_score = 100 
            WHERE reliability_score IS NULL
        `);

        // 4. Verification Check
        const momentCount = await client.query('SELECT COUNT(*) FROM moments');
        console.log(`Current Moment Count: ${momentCount.rows[0].count}`);

        await client.query('COMMIT');
        console.log('✅ Migration Complete. System is now Pure Moment Infrastructure.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration Failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
