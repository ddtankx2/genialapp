import http from 'http';
import https from 'https';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL necessária' });
  }

  try {
    let targetUrlString = decodeURIComponent(url);

    // Garante protocolo HTTP se o usuário/frontend não enviou
    if (!targetUrlString.startsWith('http://') && !targetUrlString.startsWith('https://')) {
      targetUrlString = `http://${targetUrlString}`;
    }

    const targetUrl = new URL(targetUrlString);
    const client = targetUrl.protocol === 'https:' ? https : http;

    const options = {
      method: req.method,
      headers: {
        'User-Agent': 'IPTVSmarters/3.1.5 (Android)',
        'Accept': '*/*',
      },
    };

    const proxyReq = client.request(targetUrl, options, (proxyRes) => {
      let data = '';

      proxyRes.on('data', (chunk) => {
        data += chunk;
      });

      proxyRes.on('end', () => {
        const contentType = proxyRes.headers['content-type'] || 'application/json';
        res.setHeader('Content-Type', contentType);
        return res.status(proxyRes.statusCode).send(data);
      });
    });

    proxyReq.on('error', (err) => {
      console.error('Erro de conexão:', err);
      return res.status(500).json({ error: 'Erro ao conectar no servidor IPTV', details: err.message });
    });

    proxyReq.end();
  } catch (error) {
    return res.status(400).json({ error: 'URL inválida', details: error.message });
  }
}
