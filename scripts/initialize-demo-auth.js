
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dnysosmscoceplvcejkv.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueXNvc21zY29jZXBsdmNlamt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3NTY4NCwiZXhwIjoyMDc2MTUxNjg0fQ.kz_8w3HD1_Wm_BM8-4MUIaT2aInqxCQJwxfsDFzzJXo";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const demoUsers = [
  { role: "participant", email: "demo.participant@promorang.net", password: "demo123456", name: "Demo Participant" },
  { role: "host", email: "demo.host@promorang.net", password: "demo123456", name: "Demo Host" },
  { role: "brand", email: "demo.brand@promorang.net", password: "demo123456", name: "Demo Brand" },
  { role: "merchant", email: "demo.merchant@promorang.net", password: "demo123456", name: "Demo Merchant" },
];

async function initialize() {
  console.log("🚀 Starting Absolute Demo Auth Pre-Seeding...");

  for (const user of demoUsers) {
    console.log(`\nChecking user: ${user.email} (${user.role})`);
    
    // 1. Create/Check Auth User via Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.name }
    });

    let userId;

    if (authError) {
      if (authError.message.includes("already registered")) {
        console.log("✅ User already exists in Auth.");
        // Get user ID
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existingUser = listData.users.find(u => u.email === user.email);
        userId = existingUser?.id;
      } else {
        console.error(`❌ Error creating auth user: ${authError.message}`);
        continue;
      }
    } else {
      console.log(`✅ Auth user created successfully: ${authData.user.id}`);
      userId = authData.user.id;
    }

    if (!userId) {
      console.error("❌ Could not determine user ID.");
      continue;
    }

    // 2. Ensure Role exists in user_roles
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role", user.role)
      .maybeSingle();

    if (roleError) {
      console.error(`❌ Error checking roles: ${roleError.message}`);
    } else if (!roleData) {
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: user.role });
      
      if (insertError) {
        console.error(`❌ Error inserting role: ${insertError.message}`);
      } else {
        console.log(`✅ Role '${user.role}' assigned.`);
      }
    } else {
      console.log(`✅ Role '${user.role}' already assigned.`);
    }

    // 3. Ensure Profile exists
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error(`❌ Error checking profile: ${profileError.message}`);
    } else if (!profileData) {
      const { error: insertProfileError } = await supabase
        .from("profiles")
        .insert({ 
          id: userId, 
          display_name: user.name,
          username: user.email.split('@')[0].replace('.', '_')
        });
      
      if (insertProfileError) {
        console.error(`❌ Error inserting profile: ${insertProfileError.message}`);
      } else {
        console.log(`✅ Profile created.`);
      }
    } else {
      console.log(`✅ Profile already exists.`);
    }
  }

  console.log("\n✨ Initialization complete.");
}

initialize();
