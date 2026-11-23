/**
 * Woodpeckers Sneakers & Streetwear — Vercel Serverless Function Entry Point
 * Proxies /api/* requests to the full-stack server router.
 */

const server = require('../server/server.js');

module.exports = (req, res) => {
  server.emit('request', req, res);
};
