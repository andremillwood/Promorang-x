const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtSecret = process.env.JWT_SECRET;
const anonKey = process.env.SUPABASE_ANON_KEY;

console.log('JWT_SECRET length:', jwtSecret?.length);

// Decode anon key to see if it's a Supabase JWT
const decoded = jwt.decode(anonKey);
console.log('Anon key decoded:', JSON.stringify(decoded, null, 2));

// Test: can JWT_SECRET verify Supabase-issued tokens?
try {
  jwt.verify(anonKey, jwtSecret);
  console.log('\n✅ JWT_SECRET CAN verify Supabase tokens');
} catch(e) {
  console.log('\n❌ JWT_SECRET CANNOT verify Supabase tokens:', e.message);
}

// Also check if Supabase JWT secret is the same as JWT_SECRET
// The Supabase JWT secret should be in the Supabase dashboard → Settings → API → JWT Secret
console.log('\nJWT_SECRET first 10 chars:', jwtSecret?.substring(0, 10));
