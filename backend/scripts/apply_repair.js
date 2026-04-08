const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables explicitly
const envPath = path.resolve(__dirname, '../.env.production');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

const { supabase } = require('../lib/supabase');

async function runRepairMigration() {
    console.log('🚀 Starting Brand Infrastructure Repair Migration...');

    if (!supabase) {
        console.error('❌ Supabase client not initialized. Check your environment variables.');
        process.exit(1);
    }

    const migrationFile = path.resolve(__dirname, '../migrations/20260407_repair_brand_infrastructure.sql');
    
    if (!fs.existsSync(migrationFile)) {
        console.error(`❌ Migration file not found: ${migrationFile}`);
        process.exit(1);
    }

    try {
        const sql = fs.readFileSync(migrationFile, 'utf8');
        console.log(`📖 Read migration file: ${path.basename(migrationFile)} (${sql.length} chars)`);

        // Using the documented 'exec_sql' RPC
        console.log('📡 Executing SQL via Supabase RPC...');
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error('❌ Migration failed via RPC:', error.message);
            console.log('💡 HINT: If the "exec_sql" RPC is missing, please apply the SQL manually in the Supabase Dashboard.');
            process.exit(1);
        }

        console.log('✅ Infrastructure Repair execution successful!');
    } catch (err) {
        console.error('❌ Unexpected error during migration:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    runRepairMigration();
}
