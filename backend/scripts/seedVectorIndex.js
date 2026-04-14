#!/usr/bin/env node
/**
 * seedVectorIndex.js — Populate Zvec indexes from Supabase data
 * 
 * Run with: node scripts/seedVectorIndex.js
 * Or:       npm run seed-vectors
 * 
 * This fetches organizations, moments, and campaigns from Supabase
 * and indexes them into the in-process vector store for semantic search.
 */

require('dotenv').config();
const { supabase } = require('../lib/supabase');
const vectorService = require('../services/vectorService');

async function seedOrganizations() {
    console.log('📦 Fetching organizations...');
    const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug, type, avatar_url, website')
        .limit(500);

    if (error) {
        console.warn('⚠️  Could not fetch organizations:', error.message);
        return 0;
    }

    if (!data || data.length === 0) {
        console.log('   No organizations found');
        return 0;
    }

    const docs = data.map(org => ({
        id: org.id,
        text: [org.name, org.type, org.slug, org.website]
            .filter(Boolean)
            .join(' '),
        metadata: {
            name: org.name,
            type: org.type,
            slug: org.slug,
            logo_url: org.avatar_url,
            website: org.website
        }
    }));

    const result = await vectorService.upsert('organizations', docs);
    return result.indexed;
}

async function seedMoments() {
    console.log('📦 Fetching moments...');
    const { data, error } = await supabase
        .from('moments')
        .select('id, title, description, type, status, created_at')
        .limit(500);

    if (error) {
        console.warn('⚠️  Could not fetch moments:', error.message);
        return 0;
    }

    if (!data || data.length === 0) {
        console.log('   No moments found');
        return 0;
    }

    const docs = data.map(m => ({
        id: m.id,
        text: [m.title, m.description, m.type].filter(Boolean).join(' '),
        metadata: {
            title: m.title,
            description: m.description,
            type: m.type,
            status: m.status
        }
    }));

    const result = await vectorService.upsert('moments', docs);
    return result.indexed;
}

async function seedCampaigns() {
    console.log('📦 Fetching campaigns...');
    const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, description, campaign_type, status')
        .limit(500);

    if (error) {
        console.warn('⚠️  Could not fetch campaigns:', error.message);
        return 0;
    }

    if (!data || data.length === 0) {
        console.log('   No campaigns found');
        return 0;
    }

    const docs = data.map(c => ({
        id: c.id,
        text: [c.name, c.description, c.campaign_type].filter(Boolean).join(' '),
        metadata: {
            title: c.name,
            description: c.description,
            campaign_type: c.campaign_type,
            status: c.status
        }
    }));

    const result = await vectorService.upsert('campaigns', docs);
    return result.indexed;
}

async function main() {
    console.log('🚀 Seeding vector indexes from Supabase...\n');

    if (!supabase) {
        console.error('❌ Supabase client not configured. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
        process.exit(1);
    }

    const orgCount = await seedOrganizations();
    const momentCount = await seedMoments();
    const campaignCount = await seedCampaigns();

    console.log('\n✅ Vector seeding complete!');
    console.log(`   Organizations: ${orgCount}`);
    console.log(`   Moments:       ${momentCount}`);
    console.log(`   Campaigns:     ${campaignCount}`);
    console.log('\n📊 Index stats:', vectorService.getStats());
}

main().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
