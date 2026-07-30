import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import http from "http";
import https from "https";
import zlib from "zlib";
import { GoogleGenAI, Type } from "@google/genai";

// Allow self-signed & custom SSL certificates commonly used by Xtream Codes IPTV servers
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let geminiClient: GoogleGenAI | null = null;
function getGemini() {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not set. Real-time standings will fall back to local demo data.");
      return null;
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

// Memory Cache to prevent API rate limits but keep it extremely fresh
let cachedStandings: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds cache

const TEAM_ASSETS: Record<string, { shortName: string; logo: string }> = {
  "flamengo": { shortName: "FLA", logo: "https://s.sde.globo.com/media/organizations/2018/04/09/Flamengo.svg" },
  "palmeiras": { shortName: "PAL", logo: "https://s.sde.globo.com/media/organizations/2019/07/06/Palmeiras.svg" },
  "botafogo": { shortName: "BOT", logo: "https://s.sde.globo.com/media/organizations/2019/02/04/botafogo-svg.svg" },
  "são paulo": { shortName: "SAO", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/sao-paulo.svg" },
  "sao paulo": { shortName: "SAO", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/sao-paulo.svg" },
  "cruzeiro": { shortName: "CRU", logo: "https://s.sde.globo.com/media/organizations/2021/02/13/cruzeiro_2021.svg" },
  "internacional": { shortName: "INT", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/internacional.svg" },
  "fortaleza": { shortName: "FOR", logo: "https://s.sde.globo.com/media/organizations/2021/09/19/Fortaleza_2021.svg" },
  "atlético-mg": { shortName: "CAM", logo: "https://s.sde.globo.com/media/organizations/2018/03/10/atletico-mg.svg" },
  "atletico-mg": { shortName: "CAM", logo: "https://s.sde.globo.com/media/organizations/2018/03/10/atletico-mg.svg" },
  "atletico mg": { shortName: "CAM", logo: "https://s.sde.globo.com/media/organizations/2018/03/10/atletico-mg.svg" },
  "atlético mineiro": { shortName: "CAM", logo: "https://s.sde.globo.com/media/organizations/2018/03/10/atletico-mg.svg" },
  "bahia": { shortName: "BAH", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/bahia.svg" },
  "vasco da gama": { shortName: "VAS", logo: "https://s.sde.globo.com/media/organizations/2021/09/04/vasco_2021.svg" },
  "vasco": { shortName: "VAS", logo: "https://s.sde.globo.com/media/organizations/2021/09/04/vasco_2021.svg" },
  "corinthians": { shortName: "COR", logo: "https://s.sde.globo.com/media/organizations/2019/09/30/Corinthians.svg" },
  "grêmio": { shortName: "GRE", logo: "https://s.sde.globo.com/media/organizations/2018/03/12/gremio.svg" },
  "gremio": { shortName: "GRE", logo: "https://s.sde.globo.com/media/organizations/2018/03/12/gremio.svg" },
  "fluminense": { shortName: "FLU", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/fluminense.svg" },
  "athletico-pr": { shortName: "CAP", logo: "https://s.sde.globo.com/media/organizations/2019/09/09/Athletico-PR.svg" },
  "athletico pr": { shortName: "CAP", logo: "https://s.sde.globo.com/media/organizations/2019/09/09/Athletico-PR.svg" },
  "athletico paranaense": { shortName: "CAP", logo: "https://s.sde.globo.com/media/organizations/2019/09/09/Athletico-PR.svg" },
  "red bull bragantino": { shortName: "RBB", logo: "https://s.sde.globo.com/media/organizations/2020/01/01/Red_Bull_Bragantino.svg" },
  "bragantino": { shortName: "RBB", logo: "https://s.sde.globo.com/media/organizations/2020/01/01/Red_Bull_Bragantino.svg" },
  "juventude": { shortName: "JUV", logo: "https://s.sde.globo.com/media/organizations/2021/04/29/Juventude_2021.svg" },
  "vitória": { shortName: "VIT", logo: "https://s.sde.globo.com/media/organizations/2024/04/09/vitoria-2024.svg" },
  "vitoria": { shortName: "VIT", logo: "https://s.sde.globo.com/media/organizations/2024/04/09/vitoria-2024.svg" },
  "criciúma": { shortName: "CRI", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/criciuma.svg" },
  "criciuma": { shortName: "CRI", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/criciuma.svg" },
  "cuiabá": { shortName: "CUI", logo: "https://s.sde.globo.com/media/organizations/2018/12/26/Cuiaba_EC.svg" },
  "cuiaba": { shortName: "CUI", logo: "https://s.sde.globo.com/media/organizations/2018/12/26/Cuiaba_EC.svg" },
  "atlético-go": { shortName: "ACG", logo: "https://s.sde.globo.com/media/organizations/2020/07/02/atletico-go-2020.svg" },
  "atletico-go": { shortName: "ACG", logo: "https://s.sde.globo.com/media/organizations/2020/07/02/atletico-go-2020.svg" },
  "atletico go": { shortName: "ACG", logo: "https://s.sde.globo.com/media/organizations/2020/07/02/atletico-go-2020.svg" },
  "atlético goianiense": { shortName: "ACG", logo: "https://s.sde.globo.com/media/organizations/2020/07/02/atletico-go-2020.svg" },
  "santos": { shortName: "SAN", logo: "https://s.sde.globo.com/media/organizations/2018/03/12/santos.svg" },
  "sport": { shortName: "SPO", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/sport.svg" },
  "ceará": { shortName: "CEA", logo: "https://s.sde.globo.com/media/organizations/2019/10/10/ceara.svg" },
  "ceara": { shortName: "CEA", logo: "https://s.sde.globo.com/media/organizations/2019/10/10/ceara.svg" },
  "coritiba": { shortName: "COR", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/coritiba.svg" },
  "goiás": { shortName: "GOI", logo: "https://s.sde.globo.com/media/organizations/2018/11/27/goias.svg" },
  "goias": { shortName: "GOI", logo: "https://s.sde.globo.com/media/organizations/2018/11/27/goias.svg" },
  "novorizontino": { shortName: "NOV", logo: "https://s.sde.globo.com/media/organizations/2019/03/24/novorizontino.svg" },
  "mirassol": { shortName: "MIR", logo: "https://s.sde.globo.com/media/organizations/2020/01/22/Mirassol.svg" },
  "operário": { shortName: "OPE", logo: "https://s.sde.globo.com/media/organizations/2018/11/12/operario-pr.svg" },
  "operario": { shortName: "OPE", logo: "https://s.sde.globo.com/media/organizations/2018/11/12/operario-pr.svg" },
  "vila nova": { shortName: "VIL", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/vila-nova.svg" },
  "amazonas": { shortName: "AMA", logo: "https://s.sde.globo.com/media/organizations/2023/01/26/amazonas.svg" },
  "ponte preta": { shortName: "PON", logo: "https://s.sde.globo.com/media/organizations/2018/03/12/ponte-preta.svg" },
  "guarani": { shortName: "GUA", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/guarani.svg" },
  "crb": { shortName: "CRB", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/crb.svg" },
  "paysandu": { shortName: "PAY", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/paysandu.svg" },
  "botafogo-sp": { shortName: "BSP", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/botafogo-sp.svg" },
  "botafogo sp": { shortName: "BSP", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/botafogo-sp.svg" },
  "chapecoense": { shortName: "CHA", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/chapecoense.svg" },
  "brusque": { shortName: "BRU", logo: "https://s.sde.globo.com/media/organizations/2020/09/03/Brusque.svg" },
  "ituano": { shortName: "ITU", logo: "https://s.sde.globo.com/media/organizations/2018/03/12/ituano.svg" }
};

const DEMO_BRASILEIRAO_TABLE_FALLBACK = [
  { position: 1, name: "Flamengo", shortName: "FLA", logo: "https://s.sde.globo.com/media/organizations/2018/04/09/Flamengo.svg", points: 48, played: 22, won: 15, drawn: 3, lost: 4, goalsFor: 42, goalsAgainst: 18, goalDifference: 24, form: ['W', 'W', 'W', 'D', 'W'] },
  { position: 2, name: "Palmeiras", shortName: "PAL", logo: "https://s.sde.globo.com/media/organizations/2019/07/06/Palmeiras.svg", points: 46, played: 22, won: 14, drawn: 4, lost: 4, goalsFor: 38, goalsAgainst: 17, goalDifference: 21, form: ['W', 'W', 'D', 'W', 'L'] },
  { position: 3, name: "Botafogo", shortName: "BOT", logo: "https://s.sde.globo.com/media/organizations/2019/02/04/botafogo-svg.svg", points: 44, played: 22, won: 13, drawn: 5, lost: 4, goalsFor: 36, goalsAgainst: 20, goalDifference: 16, form: ['W', 'L', 'W', 'W', 'D'] },
  { position: 4, name: "São Paulo", shortName: "SAO", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/sao-paulo.svg", points: 41, played: 22, won: 12, drawn: 5, lost: 5, goalsFor: 33, goalsAgainst: 21, goalDifference: 12, form: ['D', 'W', 'W', 'L', 'W'] },
  { position: 5, name: "Cruzeiro", shortName: "CRU", logo: "https://s.sde.globo.com/media/organizations/2021/02/13/cruzeiro_2021.svg", points: 38, played: 22, won: 11, drawn: 5, lost: 6, goalsFor: 31, goalsAgainst: 22, goalDifference: 9, form: ['W', 'D', 'L', 'W', 'W'] },
  { position: 6, name: "Internacional", shortName: "INT", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/internacional.svg", points: 36, played: 22, won: 10, drawn: 6, lost: 6, goalsFor: 29, goalsAgainst: 21, goalDifference: 8, form: ['L', 'W', 'W', 'D', 'D'] },
  { position: 7, name: "Fortaleza", shortName: "FOR", logo: "https://s.sde.globo.com/media/organizations/2021/09/19/Fortaleza_2021.svg", points: 35, played: 22, won: 10, drawn: 5, lost: 7, goalsFor: 28, goalsAgainst: 23, goalDifference: 5, form: ['W', 'L', 'D', 'W', 'L'] },
  { position: 8, name: "Atlético-MG", shortName: "CAM", logo: "https://s.sde.globo.com/media/organizations/2018/03/10/atletico-mg.svg", points: 33, played: 22, won: 9, drawn: 6, lost: 7, goalsFor: 30, goalsAgainst: 28, goalDifference: 2, form: ['D', 'W', 'L', 'W', 'L'] },
  { position: 9, name: "Bahia", shortName: "BAH", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/bahia.svg", points: 32, played: 22, won: 9, drawn: 5, lost: 8, goalsFor: 29, goalsAgainst: 27, goalDifference: 2, form: ['L', 'D', 'W', 'L', 'W'] },
  { position: 10, name: "Vasco da Gama", shortName: "VAS", logo: "https://s.sde.globo.com/media/organizations/2021/09/04/vasco_2021.svg", points: 30, played: 22, won: 8, drawn: 6, lost: 8, goalsFor: 26, goalsAgainst: 29, goalDifference: -3, form: ['W', 'W', 'D', 'L', 'D'] },
  { position: 11, name: "Corinthians", shortName: "COR", logo: "https://s.sde.globo.com/media/organizations/2019/09/30/Corinthians.svg", points: 28, played: 22, won: 7, drawn: 7, lost: 8, goalsFor: 24, goalsAgainst: 28, goalDifference: -4, form: ['D', 'L', 'W', 'D', 'W'] },
  { position: 12, name: "Grêmio", shortName: "GRE", logo: "https://s.sde.globo.com/media/organizations/2018/03/12/gremio.svg", points: 27, played: 22, won: 7, drawn: 6, lost: 9, goalsFor: 22, goalsAgainst: 27, goalDifference: -5, form: ['L', 'W', 'L', 'D', 'W'] },
  { position: 13, name: "Fluminense", shortName: "FLU", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/fluminense.svg", points: 26, played: 22, won: 7, drawn: 5, lost: 10, goalsFor: 21, goalsAgainst: 26, goalDifference: -5, form: ['W', 'D', 'L', 'W', 'L'] },
  { position: 14, name: "Athletico-PR", shortName: "CAP", logo: "https://s.sde.globo.com/media/organizations/2019/09/09/Athletico-PR.svg", points: 25, played: 22, won: 6, drawn: 7, lost: 9, goalsFor: 22, goalsAgainst: 28, goalDifference: -6, form: ['L', 'L', 'D', 'W', 'L'] },
  { position: 15, name: "Red Bull Bragantino", shortName: "RBB", logo: "https://s.sde.globo.com/media/organizations/2020/01/01/Red_Bull_Bragantino.svg", points: 24, played: 22, won: 6, drawn: 6, lost: 10, goalsFor: 23, goalsAgainst: 30, goalDifference: -7, form: ['D', 'L', 'L', 'W', 'D'] },
  { position: 16, name: "Juventude", shortName: "JUV", logo: "https://s.sde.globo.com/media/organizations/2021/04/29/Juventude_2021.svg", points: 22, played: 22, won: 5, drawn: 7, lost: 10, goalsFor: 20, goalsAgainst: 31, goalDifference: -11, form: ['L', 'D', 'W', 'L', 'L'] },
  { position: 17, name: "Vitória", shortName: "VIT", logo: "https://s.sde.globo.com/media/organizations/2024/04/09/vitoria-2024.svg", points: 20, played: 22, won: 5, drawn: 5, lost: 12, goalsFor: 19, goalsAgainst: 32, goalDifference: -13, form: ['L', 'L', 'L', 'D', 'W'] },
  { position: 18, name: "Criciúma", shortName: "CRI", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/criciuma.svg", points: 19, played: 22, won: 4, drawn: 7, lost: 11, goalsFor: 18, goalsAgainst: 33, goalDifference: -15, form: ['D', 'L', 'D', 'L', 'L'] },
  { position: 19, name: "Cuiabá", shortName: "CUI", logo: "https://s.sde.globo.com/media/organizations/2018/12/26/Cuiaba_EC.svg", points: 17, played: 22, won: 3, drawn: 8, lost: 11, goalsFor: 16, goalsAgainst: 32, goalDifference: -16, form: ['L', 'D', 'L', 'L', 'D'] },
  { position: 20, name: "Atlético-GO", shortName: "ACG", logo: "https://s.sde.globo.com/media/organizations/2020/07/02/atletico-go-2020.svg", points: 14, played: 22, won: 3, drawn: 5, lost: 14, goalsFor: 15, goalsAgainst: 37, goalDifference: -22, form: ['L', 'L', 'L', 'L', 'D'] }
];

function enrichTeamData(team: any) {
  const normName = (team.name || "").toLowerCase().trim();
  let asset = TEAM_ASSETS[normName];
  if (!asset) {
    // Try substring matching
    const foundKey = Object.keys(TEAM_ASSETS).find(key => normName.includes(key) || key.includes(normName));
    if (foundKey) {
      asset = TEAM_ASSETS[foundKey];
    }
  }

  return {
    position: Number(team.position),
    name: team.name,
    shortName: asset ? asset.shortName : (team.name ? team.name.slice(0, 3).toUpperCase() : "TEAM"),
    logo: asset ? asset.logo : "https://s.sde.globo.com/media/organizations/default.svg",
    points: Number(team.points),
    played: Number(team.played),
    won: Number(team.won),
    drawn: Number(team.drawn),
    lost: Number(team.lost),
    goalsFor: Number(team.goalsFor || 0),
    goalsAgainst: Number(team.goalsAgainst || 0),
    goalDifference: Number(team.goalDifference || 0),
    form: Array.isArray(team.form) ? team.form : ['W', 'D', 'L']
  };
}

// Reusable persistent agents for maximum throughput and minimum connection latency
const globalHttpAgent = new http.Agent({ keepAlive: true, maxSockets: 100, keepAliveMsecs: 10000 });
const globalHttpsAgent = new https.Agent({ keepAlive: true, maxSockets: 100, keepAliveMsecs: 10000, rejectUnauthorized: false });

function fetchWithHttp(targetUrl: string, maxRedirects = 10): Promise<{ statusCode: number; data: string }> {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error("Muitos redirecionamentos no servidor IPTV"));

    let parsedUrl: URL;
    const cleanTarget = targetUrl.trim();
    try {
      parsedUrl = new URL(cleanTarget);
    } catch (e) {
      try {
        parsedUrl = new URL(encodeURI(cleanTarget));
      } catch (err2) {
        return reject(new Error("URL do servidor IPTV inválida: " + cleanTarget));
      }
    }

    const isHttps = parsedUrl.protocol === "https:";
    const client = isHttps ? https : http;
    const agent = isHttps ? globalHttpsAgent : globalHttpAgent;

    const req = client.request(
      parsedUrl,
      {
        method: "GET",
        headers: {
          "User-Agent": "IPTVSmartersPro/3.1.5 (Linux; Android 10)",
          "Accept": "*/*",
          "Accept-Encoding": "gzip, deflate",
          "Connection": "close"
        },
        agent,
        timeout: 25000 // 25s timeout for IPTV server requests
      },
      (res) => {
        // Handle Redirects
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, parsedUrl.toString()).toString();
          return fetchWithHttp(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
        }

        const encoding = (res.headers["content-encoding"] || "").toLowerCase();
        const chunks: Buffer[] = [];

        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("error", (err) => reject(new Error("Erro na transferência de dados: " + err.message)));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          let bodyStr = "";

          if (encoding.includes("gzip")) {
            try {
              bodyStr = zlib.gunzipSync(buffer).toString("utf-8");
            } catch {
              try {
                bodyStr = zlib.unzipSync(buffer).toString("utf-8");
              } catch {
                bodyStr = buffer.toString("utf-8");
              }
            }
          } else if (encoding.includes("deflate")) {
            try {
              bodyStr = zlib.inflateSync(buffer).toString("utf-8");
            } catch {
              try {
                bodyStr = zlib.inflateRawSync(buffer).toString("utf-8");
              } catch {
                bodyStr = buffer.toString("utf-8");
              }
            }
          } else {
            bodyStr = buffer.toString("utf-8");
          }

          if (bodyStr.includes('\uFFFD')) {
            const latin1Str = buffer.toString("latin1");
            if (latin1Str.includes("#EXTINF") || latin1Str.includes("http")) {
              bodyStr = latin1Str;
            }
          }

          resolve({ statusCode: res.statusCode || 200, data: bodyStr });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("O servidor IPTV não respondeu a tempo (timeout de 25s). Verifique se o endereço do servidor está correto e online."));
    });

    req.on("error", (err) => {
      reject(new Error("Não foi possível conectar ao servidor IPTV: " + err.message));
    });

    req.end();
  });
}

function parseJsonSafely(text: string): any {
  if (!text) return null;
  const trimmed = text.trim();

  // 1. Try parsing directly
  try {
    return JSON.parse(trimmed);
  } catch {}

  // 2. Try extracting JSON object {...}
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch {}
  }

  // 3. Try extracting JSON array [...]
  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(trimmed.slice(firstBracket, lastBracket + 1));
    } catch {}
  }

  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "RedStream IPTV Backend" });
  });

  // Brasileirao Live Standings Route via Gemini Search Grounding
  app.get("/api/brasileirao/standings", async (req, res) => {
    const now = Date.now();
    if (cachedStandings && (now - lastCacheTime < CACHE_TTL)) {
      return res.json({ standings: cachedStandings, source: "cache", updatedTime: lastCacheTime });
    }

    const ai = getGemini();
    if (!ai) {
      return res.json({ standings: DEMO_BRASILEIRAO_TABLE_FALLBACK, source: "fallback_no_key" });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: "Find the absolute latest official real-time standings of the Campeonato Brasileiro Série A (Brasileirão) for the current 2026 season. Return a JSON array with all 20 teams in their correct order from 1 to 20.",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                position: { type: Type.INTEGER },
                name: { type: Type.STRING },
                points: { type: Type.INTEGER },
                played: { type: Type.INTEGER },
                won: { type: Type.INTEGER },
                drawn: { type: Type.INTEGER },
                lost: { type: Type.INTEGER },
                goalsFor: { type: Type.INTEGER },
                goalsAgainst: { type: Type.INTEGER },
                goalDifference: { type: Type.INTEGER },
                form: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["position", "name", "points", "played", "won", "drawn", "lost", "goalsFor", "goalsAgainst", "goalDifference", "form"]
               }
            }
          }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini.");
      }

      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Invalid format returned by Gemini.");
      }

      const enriched = parsed.map(enrichTeamData).sort((a, b) => a.position - b.position);
      
      // Save to cache
      cachedStandings = enriched;
      lastCacheTime = now;

      return res.json({ standings: enriched, source: "gemini_live", updatedTime: now });
    } catch (err: any) {
      console.error("Error fetching live standings with Gemini:", err?.message || err);
      if (cachedStandings) {
        return res.json({ standings: cachedStandings, source: "cache_fallback", error: err?.message });
      }
      return res.json({ standings: DEMO_BRASILEIRAO_TABLE_FALLBACK, source: "fallback_error", error: err?.message });
    }
  });

  // Xtream Codes Proxy to bypass CORS / Mixed Content issues for API requests
  app.post("/api/xtream/proxy", async (req, res) => {
    try {
      const { targetUrl } = req.body;

      if (!targetUrl || typeof targetUrl !== "string") {
        return res.status(400).json({ error: "targetUrl parameter is required" });
      }

      const { statusCode, data } = await fetchWithHttp(targetUrl);

      let cleanText = data ? data.trim() : "";
      if (cleanText.charCodeAt(0) === 0xFEFF) {
        cleanText = cleanText.slice(1);
      }

      const json = parseJsonSafely(cleanText);

      if (json !== null) {
        return res.status(statusCode >= 200 && statusCode < 300 ? 200 : statusCode).json(json);
      }

      // If text is empty or []
      if (!cleanText || cleanText === "[]" || cleanText === "{}") {
        return res.status(200).json([]);
      }

      // Check if HTML response (e.g. 404 / 403 / 500 error page from server)
      if (cleanText.toLowerCase().includes("<html") || cleanText.toLowerCase().includes("<!doctype")) {
        return res.status(502).json({
          error: `O servidor IPTV retornou uma página HTML (HTTP ${statusCode}). Verifique se a URL do servidor está correta.`
        });
      }

      console.warn("JSON parse error on raw data slice:", cleanText.slice(0, 100));
      return res.status(502).json({
        error: "O servidor IPTV não retornou uma resposta em formato JSON válido.",
        details: cleanText.slice(0, 300)
      });
    } catch (err: any) {
      console.error("Xtream Proxy Error:", err?.message || err);
      return res.status(502).json({
        error: err?.message || "Erro de conexão com o servidor Xtream Codes",
        details: err?.message
      });
    }
  });

  // M3U Playlist Proxy route
  app.post("/api/m3u/proxy", async (req, res) => {
    try {
      const { targetUrl } = req.body;

      if (!targetUrl || typeof targetUrl !== "string") {
        return res.status(400).json({ error: "targetUrl parameter is required" });
      }

      const { statusCode, data } = await fetchWithHttp(targetUrl);

      if (!data || data.trim().length === 0) {
        return res.status(502).json({ error: "O servidor retornou um arquivo M3U vazio." });
      }

      return res.status(statusCode >= 200 && statusCode < 300 ? 200 : statusCode).json({ content: data });
    } catch (err: any) {
      console.error("M3U Proxy Error:", err?.message || err);
      return res.status(502).json({
        error: err?.message || "Erro de conexão ao baixar a lista M3U",
        details: err?.message
      });
    }
  });

function rewriteM3u8Playlist(manifestText: string, baseUrl: string): string {
  const lines = manifestText.split(/\r?\n/);
  const rewrittenLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return line;

    // Handle tag lines with URI="..." (e.g. #EXT-X-KEY:...,URI="...", #EXT-X-MAP:...,URI="...", #EXT-X-MEDIA:...,URI="...")
    if (trimmed.startsWith("#")) {
      if (trimmed.includes('URI="')) {
        return line.replace(/URI="([^"]+)"/g, (_match, uri) => {
          try {
            const resolved = new URL(uri, baseUrl).toString();
            const proxied = `/api/xtream/stream?url=${encodeURIComponent(resolved)}`;
            return `URI="${proxied}"`;
          } catch {
            return _match;
          }
        });
      }
      return line;
    }

    // Line is a URI (segment or sub-playlist)
    try {
      const resolved = new URL(trimmed, baseUrl).toString();
      return `/api/xtream/stream?url=${encodeURIComponent(resolved)}`;
    } catch {
      return line;
    }
  });

  return rewrittenLines.join("\n");
}

  // Xtream Codes Video Stream Proxy (resolves HTTP-on-HTTPS Mixed Content & CORS for live/vod streaming)
  app.get("/api/xtream/stream", async (req, res) => {
    try {
      const streamUrl = req.query.url as string;
      if (!streamUrl) {
        return res.status(400).send("stream url parameter required");
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(streamUrl);
      } catch {
        return res.status(400).send("invalid stream url");
      }

      const client = parsedUrl.protocol === "https:" ? https : http;
      const agent = parsedUrl.protocol === "https:" ? globalHttpsAgent : globalHttpAgent;

      const headers: Record<string, string> = {
        "User-Agent": "IPTVSmartersPro/3.1.5 (Linux; Android 10)",
        "Accept": "*/*",
      };

      if (req.headers.range) {
        headers["Range"] = req.headers.range;
      }

      const proxyReq = client.request(
        parsedUrl.toString(),
        {
          method: "GET",
          headers,
          agent,
        },
        (proxyRes) => {
          // Handle redirects
          if (
            proxyRes.statusCode &&
            proxyRes.statusCode >= 300 &&
            proxyRes.statusCode < 400 &&
            proxyRes.headers.location
          ) {
            const redirectUrl = new URL(proxyRes.headers.location, streamUrl).toString();
            return res.redirect(`/api/xtream/stream?url=${encodeURIComponent(redirectUrl)}`);
          }

          const contentType = (proxyRes.headers["content-type"] || "").toLowerCase();
          const isM3u8Url =
            parsedUrl.pathname.toLowerCase().endsWith(".m3u8") ||
            streamUrl.toLowerCase().includes(".m3u8");

          let isM3u8Manifest = isM3u8Url || contentType.includes("mpegurl") || contentType.includes("m3u8");
          let chunks: Buffer[] = [];
          let headersSentToClient = false;

          const sendHeaders = () => {
            if (headersSentToClient) return;
            headersSentToClient = true;
            res.status(proxyRes.statusCode || 200);
            if (proxyRes.headers["content-type"]) res.setHeader("Content-Type", proxyRes.headers["content-type"]);
            if (proxyRes.headers["content-length"]) res.setHeader("Content-Length", proxyRes.headers["content-length"]);
            if (proxyRes.headers["accept-ranges"]) res.setHeader("Accept-Ranges", proxyRes.headers["accept-ranges"]);
            if (proxyRes.headers["content-range"]) res.setHeader("Content-Range", proxyRes.headers["content-range"]);
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("X-Content-Type-Options", "nosniff");
          };

          if (!isM3u8Manifest) {
            // Direct streaming mode for video segments (.ts, .mp4, etc.) for zero latency
            sendHeaders();
            proxyRes.pipe(res);
            return;
          }

          // Manifest mode: inspect first chunk to verify if it's #EXTM3U text
          proxyRes.on("data", (chunk: any) => {
            const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            if (isM3u8Manifest) {
              chunks.push(buf);
            }
          });

          proxyRes.on("end", () => {
            if (isM3u8Manifest) {
              const fullBuffer = Buffer.concat(chunks);
              const manifestText = fullBuffer.toString("utf8");
              if (manifestText.trim().startsWith("#EXTM3U") || manifestText.includes("#EXTINF")) {
                const rewritten = rewriteM3u8Playlist(manifestText, streamUrl);
                res.status(proxyRes.statusCode || 200);
                res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Cache-Control", "no-cache");
                return res.send(rewritten);
              } else {
                // Not actually an M3U8 manifest, output collected chunks and unpipe rest
                sendHeaders();
                return res.send(fullBuffer);
              }
            } else {
              if (!headersSentToClient) {
                sendHeaders();
              }
              res.end();
            }
          });
        }
      );

      proxyReq.on("error", (err) => {
        console.warn("Stream proxy request error:", err?.message);
        if (!res.headersSent) {
          res.status(502).send("Stream proxy failed: " + err?.message);
        }
      });

      req.on("close", () => {
        proxyReq.destroy();
      });

      proxyReq.end();
    } catch (err: any) {
      console.error("Stream Proxy Error:", err?.message);
      if (!res.headersSent) {
        res.status(500).send("Stream proxy internal error");
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[RedStream IPTV] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
