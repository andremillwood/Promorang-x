const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPromoShareFlow() {
    console.log('🚀 Starting PromoShare Verification Flow...');

    try {
        // 1. Verify Active Cycle
        console.log('\nPlease verify if there is an active cycle...');
        const { data: cycle, error: cycleError } = await supabase
            .from('promoshare_cycles')
            .select('*')
            .eq('status', 'active')
            .order('end_at', { ascending: true })
            .limit(1)
            .single();

        if (cycleError || !cycle) {
            console.error('❌ No active cycle found. Please run the migration to insert demo data.');
            return;
        }
        console.log(`✅ Active Cycle Found: ID ${cycle.id} (${cycle.cycle_type})`);

        // 2. Identify Test User
        const { data: user } = await supabase
            .from('users')
            .select('id, username')
            .limit(1)
            .single();

        if (!user) {
            console.error('❌ No users found to test with.');
            return;
        }
        console.log(`👤 Testing with User: ${user.username} (ID: ${user.id})`);

        // 3. Simulate Ticket Generation (Direct Insert to test DB constraints first)
        console.log('\n🎫 Testing Ticket Creation (Direct DB)...');
        const { data: ticket, error: ticketError } = await supabase
            .from('promoshare_tickets')
            .insert({
                user_id: user.id,
                cycle_id: cycle.id,
                source_action: 'test_script',
                source_id: 'test_' + Date.now(),
                multiplier: 1.0
            })
            .select()
            .single();

        if (ticketError) {
            console.error('❌ Failed to create ticket:', ticketError.message);
        } else {
            console.log(`✅ Ticket Created: ID ${ticket.id}`);
        }

        // 4. Verify Dashboard Data Query
        console.log('\n📊 Verifying Dashboard Data Query...');
        const { count: ticketCount } = await supabase
            .from('promoshare_tickets')
            .select('*', { count: 'exact', head: true })
            .eq('cycle_id', cycle.id)
            .eq('user_id', user.id);

        console.log(`✅ User Ticket Count: ${ticketCount}`);

        const { data: poolItems } = await supabase
            .from('promoshare_pool_items')
            .select('*')
            .eq('cycle_id', cycle.id);

        console.log(`✅ Pool Items Found: ${poolItems?.length || 0}`);

        // 4. TEST V2: REVENUE TRACKING
        console.log('\n--- Testing Revenue Tracking (V2) ---');
        const { data: ledgerEntry, error: ledgerError } = await supabase
            .from('promoshare_revenue_ledger')
            .insert({
                total_amount: 100.00,
                promoshare_amount: 5.00, // 5%
                source_type: 'test_transaction',
                status: 'allocated',
                allocated_cycle_id: cycle.id
            })
            .select()
            .single();

        if (ledgerError) console.error('Revenue Ledger Error:', ledgerError);
        else console.log('Revenue Ledger Entry Created:', ledgerEntry ? 'SUCCESS' : 'FAILED');

        // 5. TEST V2: LOTTERY TICKETS WITH NUMBERS
        console.log('\n--- Testing Ticket Numbers (V2) ---');
        const { data: ticketV2, error: ticketV2Error } = await supabase
            .from('promoshare_tickets')
            .insert({
                user_id: user.id,
                cycle_id: cycle.id,
                source_action: 'manual_test_v2',
                ticket_number: 123456 // Explicit number for testing
            })
            .select()
            .single();

        if (ticketV2Error) console.error('Ticket V2 Error:', ticketV2Error);
        else console.log('V2 Ticket Created with Number:', ticketV2.ticket_number);

        // 6. TEST DRAW OUTCOME (Manual verification needed for full logic)
        // We can't easily run the full service logic here without importing the service, 
        // which might have dependencies. 
        // But we can verify the DB state is ready for the draw.

        console.log('\n--- Verification Complete ---');
        console.log('Please check the dashboard to see the new cycle and tickets.');

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testPromoShareFlow();
```
