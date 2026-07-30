export default async function handler(req, res) {
  // Permite que o seu app consulte esta API sem bloqueio de CORS
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
    // A Vercel (servidor) busca a lista HTTP sem o bloqueio de segurança do navegador
    const response = await fetch(decodeURIComponent(url));
    const data = await response.text();
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao conectar no servidor IPTV' });
  }
}
