require('dotenv').config({ path: '../../.env' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not set in ../../.env. Cannot run migrations automatically.');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const client = await pool.connect();

    try {
        console.log('🚀 Starting AMI Migration...');

        // Read Migration Files
        const schemaPath = path.join(__dirname, '../migrations/20260203_ami_schema_and_seeds.sql');
        const viewsPath = path.join(__dirname, '../migrations/20260203_ami_ranking_views.sql');

        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const viewsSql = fs.readFileSync(viewsPath, 'utf8');

        await client.query('BEGIN');

        console.log('1️⃣ Running Schema & Seeds...');
        await client.query(schemaSql);

        console.log('2️⃣ Running Ranking Views...');
        await client.query(viewsSql);

        await client.query('COMMIT');
        console.log('✅ AMI Migrations Complete! Activation Mechanics are live.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration Failed:', err);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
