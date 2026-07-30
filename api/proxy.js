export default async function handler(req, res) {
  // Configuração dos cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL necessária' });
  }

  try {
    const targetUrl = decodeURIComponent(url);
    
    // Faz a requisição simulando o IPTV Smarters
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': 'IPTVSmarters/3.1.5 (Android)',
        'Accept': '*/*',
      },
    });

    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      return res.status(response.status).json(jsonData);
    } else {
      const textData = await response.text();
      return res.status(response.status).send(textData);
    }
  } catch (error) {
    console.error('Erro no proxy:', error);
    return res.status(500).json({ error: 'Erro ao conectar no servidor IPTV', details: error.message });
  }
}
