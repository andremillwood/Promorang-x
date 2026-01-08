require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function fixDropCreators() {
    console.log('🔧 Starting Drop Creator Fix...');

    try {
        // 1. Get the Advertiser Demo User
        console.log('🔍 Finding Advertiser Demo User...');
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, display_name, username')
            .or('username.eq.demo_advertiser,email.eq.advertiser@demo.com')
            .maybeSingle();

        if (userError) throw userError;
        if (!user) {
            console.error('❌ Advertiser user not found. Please run create-demo-users script first.');
            process.exit(1);
        }

        console.log(`✅ Found Advertiser: ${user.display_name} (${user.id})`);

        // 2. Update All Drops
        console.log('📝 Updating existing drops...');

        // Check if creator_name column exists by selecting one
        const { data: sample } = await supabase.from('drops').select('id, title').limit(1);

        // Perform update
        const { data: updatedDrops, error: updateError } = await supabase
            .from('drops')
            .update({
                creator_id: user.id,
                creator_name: user.display_name
            })
            .neq('id', '00000000-0000-0000-0000-000000000000') // Dummy condition to match all valid rows
            .select();

        if (updateError) throw updateError;

        console.log(`✅ Updated ${updatedDrops.length} drops to be owned by ${user.display_name}`);

        // 3. Verify
        console.log('\n📊 Validation Check:');
        const { data: check } = await supabase
            .from('drops')
            .select('title, creator_name, creator_id')
            .limit(3);

        check.forEach(d => {
            console.log(`   - "${d.title}": Created by ${d.creator_name} (${d.creator_id})`);
        });

        console.log('\n✨ Fix completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error fixing drops:', error);
        process.exit(1);
    }
}

fixDropCreators();
