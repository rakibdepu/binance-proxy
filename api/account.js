export default async function handler(req, res) {
  // Grab the query string (timestamp and signature)
  const queryPart = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
  
  // Dynamically route based on headers sent by Google Apps Script
  const domain = req.headers['x-binance-domain'] || 'https://api3.binance.com';
  const endpoint = req.headers['x-binance-endpoint'] || '/api/v3/account';
  const targetUrl = domain + endpoint + queryPart;
  
  try {
    const response = await fetch(targetUrl, {
      method: req.method, // Automatically handles GET (Spot/Earn) and POST (Funding)
      headers: {
        'X-MBX-APIKEY': req.headers['x-mbx-apikey'],
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)'
      }
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
