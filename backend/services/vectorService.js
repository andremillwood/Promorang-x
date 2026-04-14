/**
 * vectorService.js — In-Process Vector Search Engine
 * 
 * Lightweight, zero-dependency vector database for semantic matchmaking
 * and search. Uses cosine similarity over TF-IDF-style embeddings.
 * 
 * Persistence: Supabase Storage (primary, works on Vercel) + local disk (fallback).
 * On cold start, indexes are fetched from Supabase Storage bucket 'vector-indexes'.
 * On upsert, indexes are uploaded to Supabase Storage and cached locally.
 * 
 * Usage:
 *   const vectorService = require('./vectorService');
 *   await vectorService.upsert('organizations', docs);
 *   const results = await vectorService.search('organizations', queryText, 5);
 */

const fs = require('fs');
const path = require('path');

// ─── Configuration ──────────────────────────────────────────────────
const VECTOR_DIM = parseInt(process.env.ZVEC_DIMENSION || '128', 10);
const DATA_DIR = process.env.ZVEC_DATA_DIR || path.join(__dirname, '..', 'data', 'zvec');
const STORAGE_BUCKET = process.env.ZVEC_STORAGE_BUCKET || 'vector-indexes';

// Lazy-load supabase to avoid circular dependency issues
let _supabase = null;
function getSupabase() {
    if (_supabase === null) {
        try {
            const { supabase } = require('../lib/supabase');
            _supabase = supabase || false; // false = tried but unavailable
        } catch {
            _supabase = false;
        }
    }
    return _supabase || null;
}

// ─── In-Memory Index Store ──────────────────────────────────────────
// Each index: { documents: Map<id, { id, text, vector, metadata }> }
const indexes = new Map();

// ─── Vocabulary for TF-IDF Embedding ────────────────────────────────
// We use a deterministic hash-based projection (feature hashing)
// instead of building a vocabulary. This means:
// - No training step needed
// - Works with any text immediately
// - Fixed-dimension output regardless of vocabulary size

/**
 * Simple string hash (djb2) → deterministic integer
 */
function hashWord(word) {
    let hash = 5381;
    for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) + hash + word.charCodeAt(i)) & 0x7fffffff;
    }
    return hash;
}

/**
 * Tokenize text into normalized words
 */
function tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 1);
}

/**
 * Convert text to a fixed-dimension vector using feature hashing (hashing trick).
 * Each word is hashed to a bucket, and the vector is L2-normalized.
 * 
 * This produces consistent vectors for the same text and captures
 * word-level similarity (shared words → similar vectors).
 * 
 * @param {string} text - Input text to embed
 * @returns {Float32Array} - Normalized vector of dimension VECTOR_DIM
 */
function textToVector(text) {
    const vector = new Float32Array(VECTOR_DIM);
    const words = tokenize(text);

    if (words.length === 0) return vector;

    // Feature hashing: each word hashes to a bucket with +1 or -1 sign
    for (const word of words) {
        const h = hashWord(word);
        const bucket = h % VECTOR_DIM;
        const sign = (hashWord(word + '_sign') % 2 === 0) ? 1 : -1;
        vector[bucket] += sign;
    }

    // Bigrams for better semantic capture
    for (let i = 0; i < words.length - 1; i++) {
        const bigram = words[i] + '_' + words[i + 1];
        const h = hashWord(bigram);
        const bucket = h % VECTOR_DIM;
        const sign = (hashWord(bigram + '_sign') % 2 === 0) ? 1 : -1;
        vector[bucket] += sign * 0.5; // Bigrams weighted lower
    }

    // L2 normalize
    let norm = 0;
    for (let i = 0; i < VECTOR_DIM; i++) {
        norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
        for (let i = 0; i < VECTOR_DIM; i++) {
            vector[i] /= norm;
        }
    }

    return vector;
}

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a, b) {
    let dot = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
    }
    return dot; // Vectors are already normalized, so dot = cosine
}

// ─── Index Management ───────────────────────────────────────────────

// Track which indexes have been loaded from remote storage
const loadedFromStorage = new Set();

/**
 * Serialize an index to a JSON-compatible object
 */
function serializeIndex(index) {
    return {
        documents: Array.from(index.documents.values()).map(doc => ({
            ...doc,
            vector: Array.from(doc.vector) // Float32Array → plain array for JSON
        }))
    };
}

/**
 * Deserialize documents from raw JSON into the index
 */
function deserializeInto(index, raw) {
    for (const doc of raw.documents) {
        index.documents.set(doc.id, {
            ...doc,
            vector: new Float32Array(doc.vector)
        });
    }
}

/**
 * Get or create an in-memory index (sync — loads from local disk only).
 * For Supabase Storage, use ensureIndexLoaded() which is async.
 */
function getOrCreateIndex(name) {
    if (!indexes.has(name)) {
        indexes.set(name, { documents: new Map() });

        // Try to load from local disk cache
        try {
            const filePath = path.join(DATA_DIR, `${name}.json`);
            if (fs.existsSync(filePath)) {
                const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                deserializeInto(indexes.get(name), raw);
                console.log(`📦 Loaded ${indexes.get(name).documents.size} docs from local cache "${name}"`);
            }
        } catch (err) {
            console.warn(`⚠️ Could not load local index "${name}":`, err.message);
        }
    }
    return indexes.get(name);
}

/**
 * Ensure an index is loaded, trying Supabase Storage first (for Vercel cold starts).
 * This is the async version that should be used in API endpoints.
 */
async function ensureIndexLoaded(name) {
    const index = getOrCreateIndex(name);

    // If already loaded from storage or index has data, skip remote fetch
    if (loadedFromStorage.has(name) || index.documents.size > 0) {
        return index;
    }

    // Try to load from Supabase Storage
    const supabase = getSupabase();
    if (supabase) {
        try {
            const { data, error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .download(`${name}.json`);

            if (!error && data) {
                const text = await data.text();
                const raw = JSON.parse(text);
                deserializeInto(index, raw);
                loadedFromStorage.add(name);
                console.log(`☁️  Loaded ${index.documents.size} docs from Supabase Storage "${name}"`);

                // Cache locally for faster subsequent loads
                persistToLocalDisk(name);
            }
        } catch (err) {
            console.warn(`⚠️ Could not load from Supabase Storage "${name}":`, err.message);
        }
    }

    loadedFromStorage.add(name); // Mark as attempted even if failed
    return index;
}

/**
 * Persist index to local disk (fast, synchronous cache)
 */
function persistToLocalDisk(name) {
    const index = indexes.get(name);
    if (!index) return;

    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        const filePath = path.join(DATA_DIR, `${name}.json`);
        const serializable = serializeIndex(index);
        fs.writeFileSync(filePath, JSON.stringify(serializable));
        console.log(`💾 Cached ${index.documents.size} docs to local disk "${name}"`);
    } catch (err) {
        // On Vercel, local disk writes to /tmp or may fail — that's OK
        console.warn(`⚠️ Local disk cache skipped for "${name}":`, err.message);
    }
}

/**
 * Persist index to Supabase Storage (async, durable for Vercel)
 */
async function persistToStorage(name) {
    const index = indexes.get(name);
    if (!index) return;

    const supabase = getSupabase();
    if (!supabase) {
        console.warn('⚠️ Supabase not available — skipping remote persistence');
        return;
    }

    try {
        const serializable = serializeIndex(index);
        const jsonStr = JSON.stringify(serializable);
        const blob = new Blob([jsonStr], { type: 'application/json' });

        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(`${name}.json`, blob, {
                upsert: true,
                contentType: 'application/json'
            });

        if (error) throw error;
        console.log(`☁️  Uploaded ${index.documents.size} docs to Supabase Storage "${name}"`);
    } catch (err) {
        console.error(`❌ Failed to upload index "${name}" to Storage:`, err.message);
    }
}

/**
 * Persist to both local disk and Supabase Storage
 */
async function persistIndex(name) {
    persistToLocalDisk(name);
    await persistToStorage(name);
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Upsert documents into a named vector index.
 * 
 * @param {string} indexName - Name of the index (e.g., 'organizations')
 * @param {Array<{id: string, text: string, metadata?: object}>} docs 
 *   Each doc needs an `id` and `text` (which will be vectorized).
 *   Optional `metadata` is stored alongside for filtering/display.
 * @returns {{ indexed: number }} Count of documents indexed
 */
async function upsert(indexName, docs) {
    const index = await ensureIndexLoaded(indexName);
    let count = 0;

    for (const doc of docs) {
        if (!doc.id || !doc.text) continue;

        const vector = textToVector(doc.text);
        index.documents.set(doc.id, {
            id: doc.id,
            text: doc.text,
            vector,
            metadata: doc.metadata || {}
        });
        count++;
    }

    // Persist to local disk + Supabase Storage
    await persistIndex(indexName);

    return { indexed: count };
}

/**
 * Semantic search within a named vector index.
 * 
 * @param {string} indexName - Name of the index to search
 * @param {string} queryText - Natural language query
 * @param {number} [topK=5] - Number of results to return
 * @param {object} [filters={}] - Optional metadata filters (key-value exact match)
 * @returns {Array<{id: string, text: string, score: number, metadata: object}>}
 */
async function search(indexName, queryText, topK = 5, filters = {}) {
    const index = await ensureIndexLoaded(indexName);

    if (index.documents.size === 0) {
        return [];
    }

    const queryVector = textToVector(queryText);
    const results = [];

    for (const doc of index.documents.values()) {
        // Apply metadata filters
        let passesFilter = true;
        for (const [key, value] of Object.entries(filters)) {
            if (doc.metadata[key] !== value) {
                passesFilter = false;
                break;
            }
        }
        if (!passesFilter) continue;

        const score = cosineSimilarity(queryVector, doc.vector);
        results.push({
            id: doc.id,
            text: doc.text,
            score: Math.round(score * 10000) / 10000, // 4 decimal places
            metadata: doc.metadata
        });
    }

    // Sort by score descending, take topK
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
}

/**
 * Get stats about all indexes
 * @returns {object} Index name → document count
 */
function getStats() {
    const stats = {};
    for (const [name, index] of indexes.entries()) {
        stats[name] = index.documents.size;
    }
    return stats;
}

/**
 * Clear an index (useful for testing)
 */
function clearIndex(indexName) {
    const index = indexes.get(indexName);
    if (index) {
        index.documents.clear();
    }
}

/**
 * Remove a single document from an index
 */
function removeDocument(indexName, docId) {
    const index = indexes.get(indexName);
    if (index) {
        return index.documents.delete(docId);
    }
    return false;
}

module.exports = {
    upsert,
    search,
    textToVector,
    getStats,
    clearIndex,
    removeDocument,
    getOrCreateIndex,
    ensureIndexLoaded,
    VECTOR_DIM,
    STORAGE_BUCKET,
    // Exposed for testing
    _internals: {
        tokenize,
        cosineSimilarity,
        hashWord,
        persistToLocalDisk,
        persistToStorage
    }
};
