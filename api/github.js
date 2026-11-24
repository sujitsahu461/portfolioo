/**
 * @fileoverview GET /api/github — Public GitHub activity for the portfolio.
 * The data logic lives in lib/github-live.js so Sujit AI can use the same cache.
 */

const { getGithubData } = require('../lib/github-live');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    const data = await getGithubData();
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    res.statusCode = 200;
    return res.end(JSON.stringify(data));
  } catch (err) {
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: 'GitHub is unreachable right now' }));
  }
};
