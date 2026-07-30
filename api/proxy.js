import http from 'http';
import https from 'https';

export default async function handler(req, res) {
  // Cabeçalhos para liberar CORS total no navegador
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
    const targetUrl = new URL(decodeURIComponent(url));
    const client = targetUrl.protocol === 'https:' ? https : http;

    const options = {
      method: req.method,
      headers: {
        'User-Agent': 'IPTVSmarters/3.1.5 (Android)',
        'Accept': '*/*',
      },
    };

    // Faz a requisição HTTP direta de baixo nível
    const proxyReq = client.request(targetUrl, options, (proxyRes) => {
      let data = '';

      proxyRes.on('data', (chunk) => {
        data += chunk;
      });

      proxyRes.on('end', () => {
        const contentType = proxyRes.headers['content-type'] || 'text/plain';
        res.setHeader('Content-Type', contentType);
        return res.status(proxyRes.statusCode).send(data);
      });
    });

    proxyReq.on('error', (err) => {
      console.error('Erro na requisição proxy:', err);
      return res.status(500).json({ error: 'Erro ao conectar no servidor IPTV', details: err.message });
    });

    proxyReq.end();
  } catch (error) {
    return res.status(400).json({ error: 'URL inválida', details: error.message });
  }
}
