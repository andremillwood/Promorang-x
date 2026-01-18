const scoutService = require('./services/scoutService');

async function verify() {
    console.log('--- Phase 1: Metadata Scraping ---');
    const ytUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rickroll
    try {
        const metadata = await scoutService.fetchMetadata(ytUrl);
        console.log('YouTube Metadata:', metadata.title.includes('Rick Astley') ? '✅ PASS' : '❌ FAIL');
        console.log('Title found:', metadata.title);
        console.log('Thumbnail Found:', metadata.thumbnail ? '✅ PASS' : '❌ FAIL');
    } catch (e) {
        console.log('YouTube Scrape Failed:', e.message);
    }

    const ttUrl = 'https://www.tiktok.com/@arianagrande/video/7321520108608294186';
    try {
        const metadata = await scoutService.fetchMetadata(ttUrl);
        console.log('TikTok Metadata:', metadata.title ? '✅ PASS' : '❌ FAIL');
        console.log('Title found:', metadata.title);
    } catch (e) {
        console.log('TikTok Scrape Failed:', e.message);
    }

    const xUrl = 'https://x.com/isatandigravity/status/1880467779415711904'; // Antigravity launch post
    try {
        const metadata = await scoutService.fetchMetadata(xUrl);
        console.log('X (Twitter) Metadata:', metadata.title ? '✅ PASS' : '❌ FAIL');
        console.log('Title found:', metadata.title);
    } catch (e) {
        console.log('X Scrape Failed:', e.message);
    }

    const igUrl = 'https://www.instagram.com/p/C2AAb-RL9Vd/';
    try {
        const metadata = await scoutService.fetchMetadata(igUrl);
        console.log('Instagram Metadata (Fallback):', metadata.title.includes('Instagram') ? '✅ PASS' : '❌ FAIL');
        console.log('Title found:', metadata.title);
    } catch (e) {
        console.log('Instagram Scrape Failed:', e.message);
    }
}

verify();
