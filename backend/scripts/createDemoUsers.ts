import { createClient } from '@supabase/supabase-js';
import { hash } from 'bcryptjs';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const DEMO_USERS = [
  {
    email: 'creator@demo.com',
    password: 'demo123',
    username: 'demo_creator',
    display_name: 'Demo Creator',
    user_type: 'creator',
  },
  {
    email: 'advertiser@demo.com',
    password: 'demo123',
    username: 'demo_advertiser',
    display_name: 'Demo Advertiser',
    user_type: 'advertiser',
  },
  {
    email: 'investor@demo.com',
    password: 'demo123',
    username: 'demo_investor',
    display_name: 'Demo Investor',
    user_type: 'investor',
  },
  {
    email: 'planner@demo.com',
    password: 'demo123',
    username: 'demo_planner',
    display_name: 'Event Planner',
    user_type: 'creator',
  },
];

async function createDemoUsers() {
  try {
    for (const user of DEMO_USERS) {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (existingUser) {
        console.log(`User ${user.email} already exists, skipping...`);
        continue;
      }

      const hashedPassword = await hash(user.password, 10);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          username: user.username,
          full_name: user.display_name,
          user_type: user.user_type,
        },
      });

      if (authError) throw authError;

      // Create user in users table
      const { error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: user.email,
            username: user.username,
            display_name: user.display_name,
            user_type: user.user_type,
            password_hash: hashedPassword,
            email_verified: true,
            points_balance: 1000,
            keys_balance: 10,
            gems_balance: 50,
          },
        ]);

      if (userError) throw userError;

      console.log(`Created demo user: ${user.email}`);
    }

    console.log('All demo users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating demo users:', error);
    process.exit(1);
  }
}

createDemoUsers();
