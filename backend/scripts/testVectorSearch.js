#!/usr/bin/env node
/**
 * testVectorSearch.js — Integration test for the vector service
 * 
 * Run with: node scripts/testVectorSearch.js
 * 
 * Tests the vectorService without needing Supabase or a running server.
 * Results are printed to stdout with pass/fail indicators.
 */

const vectorService = require('../services/vectorService');
const path = require('path');
const fs = require('fs');

const TEST_INDEX = '__test_vector_index';
let passed = 0;
let failed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`  ✅ ${testName}`);
        passed++;
    } else {
        console.log(`  ❌ ${testName}`);
        failed++;
    }
}

async function testTextToVector() {
    console.log('\n🧪 Test: textToVector');

    const v1 = vectorService.textToVector('fitness gym workout health');
    const v2 = vectorService.textToVector('fitness gym workout health');
    const v3 = vectorService.textToVector('coffee shop morning brew');

    assert(v1.length === vectorService.VECTOR_DIM, `Vector dimension is ${vectorService.VECTOR_DIM}`);
    assert(JSON.stringify(Array.from(v1)) === JSON.stringify(Array.from(v2)), 'Same text produces identical vectors');

    // Cosine similarity: same vectors should be 1.0, different should be < 1.0
    const simSame = vectorService._internals.cosineSimilarity(v1, v2);
    const simDiff = vectorService._internals.cosineSimilarity(v1, v3);

    assert(Math.abs(simSame - 1.0) < 0.001, `Self-similarity ≈ 1.0 (got ${simSame.toFixed(4)})`);
    assert(simDiff < simSame, `Different texts have lower similarity (${simDiff.toFixed(4)} < ${simSame.toFixed(4)})`);

    // Empty text should return zero vector
    const vEmpty = vectorService.textToVector('');
    const allZero = Array.from(vEmpty).every(v => v === 0);
    assert(allZero, 'Empty text produces zero vector');
}

async function testUpsertAndSearch() {
    console.log('\n🧪 Test: upsert & search');

    // Clear any previous test data
    vectorService.clearIndex(TEST_INDEX);

    const sampleDocs = [
        { id: 'org-1', text: 'Nike premium athletic sportswear brand fitness running', metadata: { name: 'Nike', type: 'brand' } },
        { id: 'org-2', text: 'Starbucks coffee shop drinks beverages morning cafe', metadata: { name: 'Starbucks', type: 'merchant' } },
        { id: 'org-3', text: 'Soul Cycle indoor cycling fitness class workout gym', metadata: { name: 'Soul Cycle', type: 'host' } },
        { id: 'org-4', text: 'Whole Foods organic grocery health food wellness', metadata: { name: 'Whole Foods', type: 'merchant' } },
        { id: 'org-5', text: 'Lululemon yoga athletic apparel fitness clothing', metadata: { name: 'Lululemon', type: 'brand' } },
    ];

    const result = await vectorService.upsert(TEST_INDEX, sampleDocs);
    assert(result.indexed === 5, `Indexed 5 documents (got ${result.indexed})`);

    // Search for fitness-related content
    const fitnessResults = await vectorService.search(TEST_INDEX, 'fitness gym workout', 3);
    assert(fitnessResults.length === 3, `Got 3 results for "fitness gym workout"`);
    assert(fitnessResults[0].score > fitnessResults[2].score, 'Results are sorted by relevance');

    // The top result should be fitness-related (Nike, Soul Cycle, or Lululemon)
    const fitnessIds = fitnessResults.map(r => r.id);
    const hasFitnessMatch = fitnessIds.some(id => ['org-1', 'org-3', 'org-5'].includes(id));
    assert(hasFitnessMatch, `Top fitness results include fitness-related orgs (${fitnessIds.join(', ')})`);

    // Search for coffee
    const coffeeResults = await vectorService.search(TEST_INDEX, 'coffee morning cafe', 2);
    assert(coffeeResults.length >= 1, `Got results for "coffee morning cafe"`);
    assert(coffeeResults[0].id === 'org-2', `Top coffee result is Starbucks (got ${coffeeResults[0]?.metadata?.name})`);
}

async function testMetadataFilters() {
    console.log('\n🧪 Test: metadata filters');

    // Search with type filter
    const brandResults = await vectorService.search(TEST_INDEX, 'fitness athletic', 5, { type: 'brand' });
    const allBrands = brandResults.every(r => r.metadata.type === 'brand');
    assert(allBrands, `Filter type=brand returns only brands`);
    assert(brandResults.length <= 2, `At most 2 brand results (Nike & Lululemon)`);
}

async function testEdgeCases() {
    console.log('\n🧪 Test: edge cases');

    // Search empty index
    const emptyResults = await vectorService.search('__nonexistent_index', 'test query');
    assert(emptyResults.length === 0, 'Empty index returns no results');

    // Upsert with missing fields
    const badDocs = [
        { id: 'bad-1' },               // Missing text
        { text: 'no id here' },        // Missing id
        { id: 'good-1', text: 'valid' } // Valid
    ];
    const badResult = await vectorService.upsert(TEST_INDEX, badDocs);
    assert(badResult.indexed === 1, 'Only valid docs are indexed');

    // Stats
    const stats = vectorService.getStats();
    assert(typeof stats[TEST_INDEX] === 'number', 'getStats returns document counts');
}

async function testPersistence() {
    console.log('\n🧪 Test: persistence');

    const dataDir = process.env.ZVEC_DATA_DIR || path.join(__dirname, '..', 'data', 'zvec');
    const indexFile = path.join(dataDir, `${TEST_INDEX}.json`);

    assert(fs.existsSync(indexFile), 'Index file was persisted to disk');

    // Read the file and check structure
    const raw = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
    assert(Array.isArray(raw.documents), 'Persisted file has documents array');
    assert(raw.documents.length > 0, 'Persisted file has documents');
}

async function cleanup() {
    console.log('\n🧹 Cleanup');

    vectorService.clearIndex(TEST_INDEX);

    // Remove test persistence file
    const dataDir = process.env.ZVEC_DATA_DIR || path.join(__dirname, '..', 'data', 'zvec');
    const indexFile = path.join(dataDir, `${TEST_INDEX}.json`);
    try {
        if (fs.existsSync(indexFile)) {
            fs.unlinkSync(indexFile);
            console.log(`  🗑️  Removed ${indexFile}`);
        }
    } catch (err) {
        console.warn(`  ⚠️  Could not remove test file: ${err.message}`);
    }
}

async function main() {
    console.log('🔬 Vector Service Integration Tests');
    console.log('═'.repeat(50));

    await testTextToVector();
    await testUpsertAndSearch();
    await testMetadataFilters();
    await testEdgeCases();
    await testPersistence();
    await cleanup();

    console.log('\n' + '═'.repeat(50));
    console.log(`📊 Results: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
        console.log('❌ Some tests failed!');
        process.exit(1);
    } else {
        console.log('✅ All tests passed!');
    }
}

main().catch(err => {
    console.error('❌ Test suite error:', err);
    process.exit(1);
});
