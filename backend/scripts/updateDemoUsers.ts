import { createClient } from '@supabase/supabase-js';
import { hash } from 'bcryptjs';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Demo users data
const DEMO_USERS = [
  {
    email: 'creator@demo.com',
    username: 'demo_creator',
    display_name: 'Demo Creator',
    user_type: 'creator'
  },
  {
    email: 'investor@demo.com',
    username: 'demo_investor',
    display_name: 'Demo Investor',
    user_type: 'investor'
  },
  {
    email: 'advertiser@demo.com',
    username: 'demo_advertiser',
    display_name: 'Demo Advertiser',
    user_type: 'advertiser'
  }
];

async function updateDemoUsers() {
  try {
    const password = 'demo123';
    const hashedPassword = await hash(password, 10);
    
    console.log('Updating demo users with password hash...');
    
    for (const user of DEMO_USERS) {
      console.log(`\nUpdating user: ${user.email}`);
      
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', user.email)
        .single();
      
      if (existingUser) {
        // Update existing user
        const { data, error } = await supabase
          .from('users')
          .update({
            username: user.username,
            display_name: user.display_name,
            user_type: user.user_type,
            password_hash: hashedPassword,
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email);
        
        if (error) {
          console.error(`Error updating user ${user.email}:`, error.message);
        } else {
          console.log(`✅ Successfully updated ${user.email}`);
        }
      } else {
        // Create new user if doesn't exist
        const { data, error } = await supabase
          .from('users')
          .insert([
            {
              ...user,
              password_hash: hashedPassword,
              email_verified: true,
              points_balance: 100,
              keys_balance: 5,
              gems_balance: 10
            }
          ]);
        
        if (error) {
          console.error(`Error creating user ${user.email}:`, error.message);
        } else {
          console.log(`✅ Successfully created ${user.email}`);
        }
      }
    }
    
    console.log('\n✅ Demo users update completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating demo users:', error);
    process.exit(1);
  }
}

updateDemoUsers();
