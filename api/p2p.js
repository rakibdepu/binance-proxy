// api/p2p.js — Deploy to binance-proxy-lac.vercel.app/api/p2p
export default async function handler(req, res) {
  const ALLOWED_DOMAINS = new Set([
    'api.binance.com',
    'p2p.binance.com',
    'www.binance.com'
  ]);

  const domain = String(req.headers['x-binance-domain'] || 'api.binance.com').trim();
  const endpoint = String(req.headers['x-binance-endpoint'] || '').trim();

  if (!ALLOWED_DOMAINS.has(domain) || !endpoint.startsWith('/')) {
    return res.status(400).json({ error: 'Invalid x-binance-domain or x-binance-endpoint header' });
  }

  // Optional shared secret check if PROXY_SECRET is set in Vercel env vars
  if (process.env.PROXY_SECRET && req.headers['x-proxy-secret'] !== process.env.PROXY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized proxy request' });
  }

  // Forward all query parameters (?timestamp=...&signature=...)
  const urlObj = new URL(req.url, `https://${req.headers.host}`);
  const targetUrl = `https://${domain}${endpoint}${urlObj.search}`;

  const forwardHeaders = {
    'Accept': 'application/json',
    'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0'
  };

  if (req.headers['x-mbx-apikey']) {
    forwardHeaders['X-MBX-APIKEY'] = req.headers['x-mbx-apikey'];
  }
  if (req.method === 'POST') {
    forwardHeaders['Content-Type'] = 'application/json';
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: req.method === 'POST' ? JSON.stringify(req.body || {}) : undefined
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (err) {
    return res.status(502).json({ error: 'Upstream Binance fetch failed', details: err.message });
  }
}
