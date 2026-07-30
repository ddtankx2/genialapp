import http from 'http';
import https from 'https';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Captura o parâmetro 'url' da requisição
  const targetParam = req.query.url;

  if (!targetParam) {
    return res.status(400).json({ error: 'URL necessária' });
  }

  try {
    const targetUrlString = decodeURIComponent(targetParam);
    const targetUrl = new URL(targetUrlString);
    const client = targetUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      path: targetUrl.pathname + targetUrl.search,
      method: req.method,
      headers: {
        'User-Agent': 'IPTVSmarters/3.1.5 (Android)',
        'Accept': '*/*',
        'Host': targetUrl.hostname
      },
      timeout: 10000 // Timeout de 10 segundos
    };

    const proxyReq = client.request(options, (proxyRes) => {
      // Trata redirecionamentos (HTTP 301, 302, 307, 308)
      if ([301, 302, 307, 308].includes(proxyRes.statusCode) && proxyRes.headers.location) {
        res.setHeader('Location', proxyRes.headers.location);
        return res.status(proxyRes.statusCode).end();
      }

      const contentType = proxyRes.headers['content-type'] || 'application/json';
      res.setHeader('Content-Type', contentType);
      res.status(proxyRes.statusCode);

      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Erro de conexão no proxy:', err.message);
      return res.status(502).json({ error: 'Erro ao conectar no servidor IPTV', details: err.message });
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      return res.status(504).json({ error: 'Tempo limite esgotado ao conectar ao servidor IPTV' });
    });

    proxyReq.end();
  } catch (error) {
    return res.status(400).json({ error: 'URL inválida', details: error.message });
  }
}
