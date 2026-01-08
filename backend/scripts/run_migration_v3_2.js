const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables explicitly
const envPath = path.resolve(__dirname, '../.env.local');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

const { supabase } = require('../lib/supabase');

async function runMigration() {
    console.log('🚀 Starting Economy v3.2 Migration...');

    if (!supabase) {
        console.error('❌ Supabase client not initialized. Check your environment variables.');
        process.exit(1);
    }

    const migrationFile = path.join(__dirname, '../migrations/20251123_setup_economy_v3.2.sql');

    try {
        const sql = fs.readFileSync(migrationFile, 'utf8');
        console.log(`📖 Read migration file: ${path.basename(migrationFile)}`);

        // Using the same RPC as the seed script
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error('❌ Migration failed via RPC:', error.message);
            console.log('Attempting verify connection...');
            const { data, error: connError } = await supabase.from('users').select('count').limit(1).single();
            if (connError) console.error('Connection check failed:', connError.message);
            else console.log('Connection check passed.');

            process.exit(1);
        }

        console.log('✅ Migration executed successfully!');
    } catch (err) {
        console.error('❌ Unexpected error:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    runMigration();
}
