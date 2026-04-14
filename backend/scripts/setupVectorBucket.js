#!/usr/bin/env node
/**
 * setupVectorBucket.js — Create the Supabase Storage bucket for vector indexes
 * 
 * Run once: node scripts/setupVectorBucket.js
 * 
 * Creates a private storage bucket called 'vector-indexes' in your Supabase project.
 * This bucket stores the serialized vector index JSON files that power semantic search.
 */

require('dotenv').config();
const { supabase } = require('../lib/supabase');

const BUCKET_NAME = process.env.ZVEC_STORAGE_BUCKET || 'vector-indexes';

async function main() {
    console.log('🪣 Setting up Supabase Storage bucket for vector indexes...\n');

    if (!supabase) {
        console.error('❌ Supabase client not configured. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
        process.exit(1);
    }

    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('❌ Failed to list buckets:', listError.message);
        process.exit(1);
    }

    const existing = buckets.find(b => b.name === BUCKET_NAME);
    if (existing) {
        console.log(`✅ Bucket "${BUCKET_NAME}" already exists (created: ${existing.created_at})`);
        return;
    }

    // Create the bucket (private — only accessible via service key)
    const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 52428800, // 50 MB — enough for large indexes  
        allowedMimeTypes: ['application/json']
    });

    if (error) {
        console.error('❌ Failed to create bucket:', error.message);
        process.exit(1);
    }

    console.log(`✅ Created private bucket "${BUCKET_NAME}"`);
    console.log('   Max file size: 50 MB');
    console.log('   Allowed types: application/json');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run seed-vectors    (populate indexes from Supabase data)');
    console.log('   2. Test: npm run test:vectors   (verify vector search works)');
}

main().catch(err => {
    console.error('❌ Setup failed:', err);
    process.exit(1);
});
