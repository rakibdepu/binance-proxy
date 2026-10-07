export default async function handler(req, res) {
  // Grab the query string (timestamp and signature) from Google Apps Script
  const query = req.url.split('?')[1] || '';
  const targetUrl = 'https://api3.binance.com/api/v3/account?' + query;
  
  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': req.headers['x-mbx-apikey'],
        // Spoof a real Windows Chrome browser to bypass the CloudFront 403 block
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy failed' });
  }
}
