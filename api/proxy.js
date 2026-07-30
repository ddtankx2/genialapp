export default async function handler(req, res) {
  // Configura CORS total para o frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL não fornecida' });
  }

  try {
    const targetUrl = decodeURIComponent(url);

    // Faz a requisição seguindo redirecionamentos (redirect: 'follow')
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': 'IPTVSmarters/3.1.5 (Android)',
        'Accept': '*/*',
      },
      redirect: 'follow',
    });

    const contentType = response.headers.get('content-type') || 'text/plain';
    const data = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    return res.status(response.status).send(Buffer.from(data));
  } catch (error) {
    console.error('Erro no Proxy:', error);
    return res.status(500).json({ error: 'Erro de conexão com o servidor', details: error.message });
  }
}
