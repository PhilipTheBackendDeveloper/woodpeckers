/**
 * Woodpeckers Sneakers & Streetwear — Vercel Serverless Function Entry Point
 * Proxies /api/* requests to the full-stack server router.
 */

// Explicitly require store.json so Vercel's Node File Trace (NFT) bundles it into the function
try { require('../data/store.json'); } catch (e) {}

const server = require('../server/server.js');

module.exports = (req, res) => {
  server.emit('request', req, res);
};
