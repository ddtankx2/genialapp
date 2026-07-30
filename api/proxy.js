export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extrai a URL completa preservando os parâmetros com & e ?
  const rawUrl = req.url.split('url=')[1];

  if (!rawUrl) {
    return res.status(400).json({ error: 'URL necessária' });
  }

  try {
    const targetUrl = decodeURIComponent(rawUrl);
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': 'IPTVSmarters/3.1.5 (Android)',
        'Accept': '*/*',
      },
    });

    const data = await response.text();
    return res.status(response.status).send(data);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao conectar no servidor IPTV' });
  }
}
