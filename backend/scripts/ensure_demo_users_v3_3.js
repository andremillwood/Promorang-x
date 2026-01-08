require('dotenv').config();
const supabase = require('../lib/supabase');

const DEMO_USERS = [
    {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'creator@demo.com',
        username: 'demo_creator',
        display_name: 'Demo Creator',
        user_type: 'creator'
    },
    {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'advertiser@demo.com',
        username: 'demo_advertiser',
        display_name: 'Demo Advertiser',
        user_type: 'advertiser'
    }
];

async function ensureDemoUsers() {
    console.log('🚀 Ensuring demo users exist in database...');

    if (!supabase) {
        console.error('❌ Supabase client not initialized. Check your credentials.');
        return;
    }

    for (const user of DEMO_USERS) {
        console.log(`Checking user: ${user.email} (${user.id})`);

        const { data, error } = await supabase
            .from('users')
            .upsert(user, { onConflict: 'id' })
            .select();

        if (error) {
            console.error(`❌ Failed to upsert user ${user.email}:`, error.message);
        } else {
            console.log(`✅ User ${user.email} ensured.`);
        }
    }

    console.log('✨ Demo user check complete.');
}

ensureDemoUsers();
