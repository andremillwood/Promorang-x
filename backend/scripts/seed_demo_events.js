require('dotenv').config();
const supabase = require('../lib/supabase');

async function seed() {
    console.log('🌱 Starting Demo Event Seeding...');

    if (!supabase) {
        console.error('❌ Supabase client not initialized. Check your .env file.');
        process.exit(1);
    }

    try {
        // 1. Ensure Demo Users Exist or Get IDs
        console.log('👤 Getting demo users...');
        const emails = ['creator@demo.com', 'investor@demo.com', 'planner@demo.com'];
        const { data: users, error: fetchError } = await supabase
            .from('users')
            .select('id, email')
            .in('email', emails);

        if (fetchError) throw fetchError;

        const creator = users.find(u => u.email === 'creator@demo.com');
        const investor = users.find(u => u.email === 'investor@demo.com');
        const planner = users.find(u => u.email === 'planner@demo.com');

        if (!creator || !investor) {
            console.error('❌ Demo users not found in DB. Please run create-demo-users first or ensure they exist.');
            process.exit(1);
        }

        const DEMO_CREATOR_ID = creator.id;
        const DEMO_INVESTOR_ID = investor.id;
        const DEMO_PLANNER_ID = planner?.id;

        if (!DEMO_PLANNER_ID) {
            console.warn('⚠️  Planner demo user not found. Skipping planner events.');
        }

        // 2. Create the Flagship Event
        console.log('📅 Creating Web3 Creator Summit event...');
        const eventId = 'd0000000-0000-0000-0000-00000000e001';
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 15);

        const endDate = new Date(futureDate);
        endDate.setHours(endDate.getHours() + 8);

        const demoEvent = {
            id: eventId,
            creator_id: DEMO_CREATOR_ID,
            title: 'Web3 Creator Summit 2026',
            description: 'The premier gathering for digital creators, blockchain enthusiasts, and future-forward thinkers. Join us for a day of workshops, networking, and the launch of the Promorang Creator Economy.\n\nHighlights:\n- Keynote by Industry Leaders\n- Interactive Creator Workshops\n- Exclusive NFT Networking Lounge\n- Community Rewards & Gem Drops',
            category: 'conference',
            location_name: 'The Innovation Hub (SOMA)',
            location_address: '123 Tech Terrace, San Francisco, CA',
            event_date: futureDate.toISOString(),
            event_end_date: endDate.toISOString(),
            banner_url: 'https://images.unsplash.com/photo-1540575861501-7ad05823c951?auto=format&fit=crop&q=80&w=1200',
            flyer_url: 'https://images.unsplash.com/photo-1540575861501-7ad05823c951?auto=format&fit=crop&q=80&w=400',
            organizer_name: 'Demo Creator',
            total_rsvps: 42,
            total_check_ins: 0,
            total_tasks_completed: 15,
            total_ugc_submissions: 8,
            total_rewards_pool: 2500,
            total_gems_pool: 500,
            status: 'published',
            is_public: true,
            is_featured: true,
            max_attendees: 200,
            tags: ['web3', 'creators', 'networking', 'sanfrancisco']
        };

        const { error: eventError } = await supabase.from('events').upsert(demoEvent, { onConflict: 'id' });
        if (eventError) {
            console.error('❌ Failed to seed event:', eventError.message);
            return;
        }

        // 3. Add Tasks
        console.log('🎯 Adding missions...');
        const tasks = [
            { id: 't001', event_id: eventId, title: 'Share the Summit', description: 'Post your unique registration link on Twitter orwarpcast and tag @Promorang.', points_reward: 150, gems_reward: 10, status: 'active' },
            { id: 't002', event_id: eventId, title: 'Network Master', description: 'Meet 5 other creators and exchange digital business cards.', points_reward: 200, gems_reward: 25, status: 'active' },
            { id: 't003', event_id: eventId, title: 'Booth Check-in', description: 'Visit the tech demo booth and scan the entry QR code.', points_reward: 100, gems_reward: 5, status: 'active' }
        ];

        for (const task of tasks) {
            await supabase.from('event_tasks').upsert({ ...task }, { onConflict: 'id' });
        }

        // 4. Add Sponsors
        console.log('🤝 Adding partners...');
        const sponsors = [
            { event_id: eventId, sponsor_name: 'Ethos Venture', tier: 'platinum', sponsor_logo: 'https://images.unsplash.com/photo-1614850523296-e8c041de439f?w=100' },
            { event_id: eventId, sponsor_name: 'Creator Protocol', tier: 'gold', sponsor_logo: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=100' }
        ];

        await supabase.from('event_sponsors').insert(sponsors);

        // 5. Add Demo RSVPs
        console.log('👥 Adding demo RSVPs...');
        const rsvps = [
            { event_id: eventId, user_id: DEMO_INVESTOR_ID, status: 'confirmed', check_in_code: 'INV2026SUMMIT' },
            { event_id: eventId, user_id: '00000000-0000-0000-0000-00000000ad01', status: 'confirmed', check_in_code: 'ADV2026SUMMIT', checked_in_at: new Date().toISOString() }
        ];

        for (const rsvp of rsvps) {
            await supabase.from('event_rsvps').upsert(rsvp, { onConflict: 'event_id, user_id' });
        }

        // 6. Add Demo Gallery Media
        console.log('🖼️  Adding gallery media...');
        const media = [
            { event_id: eventId, user_id: DEMO_INVESTOR_ID, media_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800', caption: 'Love the energy here! 🚀', is_approved: true },
            { event_id: eventId, user_id: DEMO_INVESTOR_ID, media_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800', caption: 'The future of social is collective.', is_approved: true }
        ];

        await supabase.from('event_media').insert(media);

        // 7. Add Demo Task Submissions
        console.log('📝 Adding task submissions...');
        const submissions = [
            { event_id: eventId, task_id: 't001', user_id: DEMO_INVESTOR_ID, proof_text: 'Posted to my 5k followers on Twitter!', status: 'pending', points_awarded: 150, gems_awarded: 10 }
        ];

        await supabase.from('event_task_submissions').insert(submissions);

        // 8. Add Organizer Updates
        console.log('📢 Adding announcements...');
        const updates = [
            { event_id: eventId, content: 'Exciting news! We just confirmed 3 more speakers for the NFT workshop block.' },
            { event_id: eventId, content: 'Friendly reminder to RSVP early - we are reaching 80% capacity!' }
        ];

        await supabase.from('event_updates').insert(updates);

        // 9. Add Planner Events (New Section)
        if (DEMO_PLANNER_ID) {
            console.log('📅 Creating Planner events...');

            const event1Date = new Date();
            event1Date.setDate(event1Date.getDate() + 30); // Next month
            const event1End = new Date(event1Date);
            event1End.setHours(event1End.getHours() + 4);

            const event2Date = new Date();
            event2Date.setDate(event2Date.getDate() + 60); // 2 months out
            const event2End = new Date(event2Date);
            event2End.setDate(event2End.getDate() + 2); // 2 day event

            const event3Date = new Date();
            event3Date.setDate(event3Date.getDate() + 7); // 1 week out
            const event3End = new Date(event3Date);
            event3End.setHours(event3End.getHours() + 3);

            const plannerEvents = [
                {
                    id: 'd0000000-0000-0000-0000-00000000e002',
                    creator_id: DEMO_PLANNER_ID,
                    title: 'Tech Startups Mixer',
                    description: 'A casual evening for founders, investors, and tech enthusiasts to connect over drinks and discuss the latest industry trends.',
                    category: 'networking',
                    location_name: 'The Social Capital',
                    location_address: '456 Innovation Ave, San Francisco, CA',
                    event_date: event1Date.toISOString(),
                    event_end_date: event1End.toISOString(),
                    banner_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1200',
                    flyer_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=400',
                    organizer_name: 'Event Planner',
                    total_rsvps: 120,
                    status: 'published',
                    is_public: true,
                    max_attendees: 150,
                    tags: ['startups', 'networking', 'tech']
                },
                {
                    id: 'd0000000-0000-0000-0000-00000000e003',
                    creator_id: DEMO_PLANNER_ID,
                    title: 'Indie Game Showcase',
                    description: 'Experience the newest indie games before they hit the market. Meet the developers and play exclusive demos.',
                    category: 'exhibition',
                    location_name: 'Pixel Gallery',
                    location_address: '789 Gaming Row, San Francisco, CA',
                    event_date: event2Date.toISOString(),
                    event_end_date: event2End.toISOString(),
                    banner_url: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=1200',
                    flyer_url: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=400',
                    organizer_name: 'Event Planner',
                    total_rsvps: 45,
                    status: 'published',
                    is_public: true,
                    max_attendees: 300,
                    tags: ['gaming', 'indie', 'showcase']
                },
                {
                    id: 'd0000000-0000-0000-0000-00000000e004',
                    creator_id: DEMO_PLANNER_ID,
                    title: 'Digital Art Workshop',
                    description: 'Learn the fundamentals of digital painting with industry pros. Bring your tablet and creativity!',
                    category: 'workshop',
                    location_name: 'Creative Studio 5',
                    location_address: '321 Art Lane, San Francisco, CA',
                    event_date: event3Date.toISOString(),
                    event_end_date: event3End.toISOString(),
                    banner_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1200',
                    flyer_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400',
                    organizer_name: 'Event Planner',
                    total_rsvps: 15,
                    status: 'published',
                    is_public: true,
                    max_attendees: 30,
                    tags: ['art', 'workshop', 'digital']
                }
            ];

            const { error: plannerEventsError } = await supabase.from('events').upsert(plannerEvents, { onConflict: 'id' });
            if (plannerEventsError) {
                console.error('❌ Failed to seed planner events:', plannerEventsError.message);
            } else {
                console.log('✨ Added 3 planner events');
            }

            // Add some tasks for the Mixer
            const mixerTasks = [
                { id: 'tp001', event_id: 'd0000000-0000-0000-0000-00000000e002', title: 'Bring a Friend', description: 'Bring a +1 to the mixer.', points_reward: 50, gems_reward: 2, status: 'active' }
            ];
            await supabase.from('event_tasks').upsert(mixerTasks, { onConflict: 'id' });
        }

        console.log('✅ Demo data seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Critical Error during seeding:', error);
        process.exit(1);
    }
}

seed();
