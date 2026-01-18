/**
 * SCOUT SERVICE
 * Handles fetching metadata from external platforms (YouTube, TikTok) via oEmbed.
 */

const axios = require('axios');

/**
 * Fetch Metadata for a given URL
 * @param {string} url - The external URL
 * @returns {Promise<{title: string, thumbnail: string, author: string, author_id: string|null}>}
 */
async function fetchMetadata(url) {
    try {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
            const response = await axios.get(oembedUrl);
            const data = response.data;

            // Extract channel ID if possible from author_url
            let authorId = null;
            if (data.author_url) {
                authorId = data.author_url.split('/').pop();
            }

            return {
                title: data.title || 'Unknown YouTube Video',
                thumbnail: data.thumbnail_url || '',
                author: data.author_name || 'Unknown Creator',
                author_id: authorId,
                raw: data
            };
        }

        if (url.includes('tiktok.com')) {
            const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
            const response = await axios.get(oembedUrl);
            const data = response.data;

            return {
                title: data.title || 'Unknown TikTok Video',
                thumbnail: data.thumbnail_url || '',
                author: data.author_name || 'Unknown Creator',
                author_id: data.author_unique_id || null,
                raw: data
            };
        }

        if (url.includes('x.com') || url.includes('twitter.com')) {
            const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
            const response = await axios.get(oembedUrl);
            const data = response.data;

            return {
                title: data.title || 'Post on X',
                thumbnail: '', // X oEmbed rarely provides high-res thumbnails
                author: data.author_name || 'Unknown User',
                author_id: data.author_url ? data.author_url.split('/').pop() : null,
                raw: data
            };
        }

        if (url.includes('facebook.com') || url.includes('instagram.com')) {
            // NOTE: Facebook/Instagram oEmbed usually requires a specific Meta App Token.
            // For MVP, we provide a robust structured fallback or attempt a generic fetch if possible.
            const platform = url.includes('instagram.com') ? 'Instagram' : 'Facebook';
            return {
                title: `${platform} Content`,
                thumbnail: '',
                author: 'External Creator',
                author_id: null,
                raw: { platform, url }
            };
        }

        return {
            title: 'External Content',
            thumbnail: '',
            author: 'Unknown',
            author_id: null
        };
    } catch (error) {
        console.error('Metadata fetch error:', error.message);
        return {
            title: 'Content Discovery',
            thumbnail: '',
            author: 'Unknown',
            author_id: null
        };
    }
}

/**
 * Verify Bio Code
 * Fetches the profile page of the given platform and checks for the presence of the code.
 * @param {string} platform 
 * @param {string} usernameOrId 
 * @param {string} code 
 */
async function verifyBioCode(platform, usernameOrId, code) {
    try {
        let profileUrl = '';
        if (platform === 'youtube') {
            profileUrl = `https://www.youtube.com/@${usernameOrId}`;
        } else if (platform === 'tiktok') {
            profileUrl = `https://www.tiktok.com/@${usernameOrId}`;
        } else if (platform === 'x' || platform === 'twitter') {
            profileUrl = `https://x.com/${usernameOrId}`;
        } else if (platform === 'instagram') {
            profileUrl = `https://www.instagram.com/${usernameOrId}/`;
        } else {
            return false;
        }

        // Fetch page content
        // Note: For production, we would use a more robust proxy or headless browser to bypass bot detection.
        // For MVP, we attempt a simple GET request.
        const response = await axios.get(profileUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        const html = response.data;
        return html.includes(code);
    } catch (error) {
        console.error(`Verification failed for ${platform}:`, error.message);
        // Fallback for dev: if it's a 403/404 we might be blocked, but we'll return false for security.
        return false;
    }
}

module.exports = {
    fetchMetadata,
    verifyBioCode
};
