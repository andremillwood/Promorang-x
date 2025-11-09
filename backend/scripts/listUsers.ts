import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function listUsers() {
  try {
    // List all users from the users table
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
      
    if (error) throw error;
    
    console.log('Users in database:');
    if (users && users.length > 0) {
      users.forEach(user => {
        console.log(`- ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Type: ${user.user_type}`);
        console.log(`  Created: ${user.created_at}`);
        console.log(`  Password Hash: ${user.password_hash ? '********' : 'MISSING'}`);
        console.log('---');
      });
    } else {
      console.log('No users found in the database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
}

listUsers();
