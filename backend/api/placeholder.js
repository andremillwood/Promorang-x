const express = require('express');
const router = express.Router();

/**
 * Lightweight placeholder endpoint used by the frontend when no avatar is provided.
 * Responds with an SVG circle badge to avoid 404s in development.
 */
router.get('/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const w = Number.parseInt(width, 10) || 64;
  const h = Number.parseInt(height, 10) || 64;
  const size = Math.max(1, Math.min(512, Math.round((w + h) / 2)));

  res.type('image/svg+xml');
  res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${size / 5}" fill="#e5e7eb"/>
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
        font-family="sans-serif" font-size="${size / 3}" fill="#9ca3af">?</text>
    </svg>
  `);
});

module.exports = router;
