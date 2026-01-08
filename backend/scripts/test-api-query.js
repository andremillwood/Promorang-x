require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function testDropsQuery() {
    console.log('🧪 Testing Supabase Query...');

    try {
        const { data: rows, error } = await supabase
            .from('drops')
            .select(`
          *,
          creator:users!creator_id (
            display_name,
            username,
            avatar_url
          )
        `)
            .limit(3);

        if (error) {
            console.error('❌ Query failed:', error.message);
            process.exit(1);
        }

        if (!rows || rows.length === 0) {
            console.log('⚠️ No drops found to test.');
        } else {
            console.log('✅ Query successful!');
            rows.forEach(r => {
                console.log(`   - Drop: ${r.title}`);
                console.log(`     Creator Object:`, r.creator);
                // Simulate mapping
                const name = r.creator?.display_name || r.creator?.username || r.creator_name || 'Unknown';
                console.log(`     Resolved Name: ${name}`);
            });
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err);
        process.exit(1);
    }
}

testDropsQuery();
