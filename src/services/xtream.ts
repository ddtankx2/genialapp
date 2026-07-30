import {
  XtreamAuthResponse,
  Category,
  LiveChannel,
  MovieStream,
  SeriesStream,
  SeriesInfoResponse
} from '../types';
import {
  DEMO_USER_INFO,
  DEMO_LIVE_CATEGORIES,
  DEMO_LIVE_CHANNELS,
  DEMO_MOVIE_CATEGORIES,
  DEMO_MOVIES,
  DEMO_SERIES_CATEGORIES,
  DEMO_SERIES,
  DEMO_SERIES_EPISODES,
  PUBLIC_SAMPLE_STREAMS
} from '../data/demoData';

// Proxy para contornar o bloqueio HTTPS -> HTTP da Vercel
const fetchWithProxy = async (url: string) => {
  if (url.startsWith('http://')) {
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    return fetchWithProxy(proxyUrl);
  }
  return fetchWithProxy(url);
};
export function sanitizeXtreamUrl(url: string): string {
  if (!url) return '';
  let clean = url.trim();
  clean = clean.split('?')[0]; // drop query string
  clean = clean.replace(/\/+(player_api\.php|get\.php|xmltv\.php|c\/?)?$/i, '');
  clean = clean.replace(/\/+$/, '');
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `http://${clean}`;
  }
  return clean;
}

export async function loginXtream(
  baseUrl: string,
  username: string,
  password: string
): Promise<XtreamAuthResponse> {
  // If demo server requested or empty credentials
  if (
    username.toLowerCase() === 'demo' ||
    baseUrl.toLowerCase().includes('demo') ||
    !baseUrl ||
    !username
  ) {
    return DEMO_USER_INFO as XtreamAuthResponse;
  }

  const cleanUrl = sanitizeXtreamUrl(baseUrl);
  const targetUrl = `${cleanUrl}/player_api.php?username=${encodeURIComponent(username.trim())}&password=${encodeURIComponent(password.trim())}`;

  try {
    const res = await fetchWithProxy('/api/xtream/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl })
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(
        errorJson.error ||
          `Não foi possível conectar ao servidor Xtream (HTTP ${res.status}). Verifique a URL e credenciais.`
      );
    }

    const data = await res.json();
    if (data && data.user_info) {
      return data;
    } else if (data && data.error) {
      throw new Error(data.error);
    } else if (data && typeof data === 'object') {
      // Synthesize user_info for servers that don't return standard user_info block
      return {
        user_info: {
          username: username,
          password: password,
          message: 'Conectado com sucesso',
          auth: 1,
          status: 'Active',
          exp_date: 'Ilimitado',
          is_trial: '0',
          active_cons: '1',
          created_at: '',
          max_connections: '1',
          allowed_output_formats: ['m3u8', 'ts', 'mp4']
        },
        server_info: {
          url: cleanUrl,
          port: '',
          https_port: '',
          server_protocol: 'http',
          rtmp_port: '',
          timezone: 'America/Sao_Paulo',
          timestamp_now: Math.floor(Date.now() / 1000),
          time_now: new Date().toISOString()
        }
      };
    } else {
      throw new Error('Usuário ou senha inválidos no servidor Xtream.');
    }
  } catch (err: any) {
    console.warn('Real Xtream login failed:', err);
    throw err;
  }
}

function normalizeArray<T>(data: any): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') {
    // If wrapped inside a property like data.streams, data.channels or data.categories
    if (Array.isArray(data.streams)) return data.streams;
    if (Array.isArray(data.channels)) return data.channels;
    if (Array.isArray(data.categories)) return data.categories;

    // Do not convert auth error or user_info object into streams
    if (data.user_info || data.user_data || data.error) return [];

    const vals = Object.values(data);
    const valid = vals.filter(
      item =>
        item &&
        typeof item === 'object' &&
        ('stream_id' in item ||
         'series_id' in item ||
         'category_id' in item ||
         'name' in item ||
         'category_name' in item)
    );
    if (valid.length > 0) return valid as T[];
  }
  return [];
}

export async function fetchLiveCategories(
  baseUrl: string,
  username: string,
  password: string
): Promise<Category[]> {
  const isDemo = username.toLowerCase() === 'demo' || username === 'demo_user_vip' || baseUrl.toLowerCase().includes('demo');
  if (isDemo) {
    return DEMO_LIVE_CATEGORIES;
  }

  const cleanUrl = sanitizeXtreamUrl(baseUrl);
  const targetUrl = `${cleanUrl}/player_api.php?username=${encodeURIComponent(username.trim())}&password=${encodeURIComponent(password.trim())}&action=get_live_categories`;

  try {
    const res = await fetchWithProxy('/api/xtream/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json().catch(() => null);
    const items = normalizeArray<Category>(data);
    if (items.length > 0) {
      return [{ category_id: 'all', category_name: 'Todos os Canais' }, ...items];
    }
    return [{ category_id: 'all', category_name: 'Todos os Canais' }];
  } catch (e) {
    console.error('Error fetching live categories from server:', e);
    return [{ category_id: 'all', category_name: 'Todos os Canais' }];
  }
}

export async function fetchLiveStreams(
  baseUrl: string,
  username: string,
  password: string,
  categoryId?: string
): Promise<LiveChannel[]> {
  const isDemo = username.toLowerCase() === 'demo' || username === 'demo_user_vip' || baseUrl.toLowerCase().includes('demo');
  if (isDemo) {
    if (!categoryId || categoryId === 'all') return DEMO_LIVE_CHANNELS;
    return DEMO_LIVE_CHANNELS.filter(c => c.category_id === categoryId);
  }

  const cleanUrl = sanitizeXtreamUrl(baseUrl);
  let targetUrl = `${cleanUrl}/player_api.php?username=${encodeURIComponent(username.trim())}&password=${encodeURIComponent(password.trim())}&action=get_live_streams`;
  if (categoryId && categoryId !== 'all') {
    targetUrl += `&category_id=${encodeURIComponent(categoryId)}`;
  }

  try {
    const res = await fetchWithProxy('/api/xtream/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json().catch(() => null);
    const items = normalizeArray<LiveChannel>(data);
    return items;
  } catch (e) {
    console.error('Error fetching live streams from server:', e);
    return [];
  }
}

export async function fetchVodCategories(
  baseUrl: string,
  username: string,
  password: string
): Promise<Category[]> {
  const isDemo = username.toLowerCase() === 'demo' || username === 'demo_user_vip' || baseUrl.toLowerCase().includes('demo');
  if (isDemo) {
    return DEMO_MOVIE_CATEGORIES;
  }

  const cleanUrl = sanitizeXtreamUrl(baseUrl);
  const targetUrl = `${cleanUrl}/player_api.php?username=${encodeURIComponent(username.trim())}&password=${encodeURIComponent(password.trim())}&action=get_vod_categories`;

  try {
    const res = await fetchWithProxy('/api/xtream/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json().catch(() => null);
    const items = normalizeArray<Category>(data);
    if (items.length > 0) {
      return [{ category_id: 'm_all', category_name: 'Todos os Filmes' }, ...items];
    }
    return [{ category_id: 'm_all', category_name: 'Todos os Filmes' }];
  } catch (e) {
    console.error('Error fetching VOD categories from server:', e);
    return [{ category_id: 'm_all', category_name: 'Todos os Filmes' }];
  }
}

export async function fetchVodStreams(
  baseUrl: string,
  username: string,
  password: string,
  categoryId?: string
): Promise<MovieStream[]> {
  const isDemo = username.toLowerCase() === 'demo' || username === 'demo_user_vip' || baseUrl.toLowerCase().includes('demo');
  if (isDemo) {
    if (!categoryId || categoryId === 'm_all') return DEMO_MOVIES;
    return DEMO_MOVIES.filter(m => m.category_id === categoryId);
  }

  const cleanUrl = sanitizeXtreamUrl(baseUrl);
  let targetUrl = `${cleanUrl}/player_api.php?username=${encodeURIComponent(username.trim())}&password=${encodeURIComponent(password.trim())}&action=get_vod_streams`;
  if (categoryId && categoryId !== 'm_all') {
    targetUrl += `&category_id=${encodeURIComponent(categoryId)}`;
  }

  try {
    const res = await fetchWithProxy('/api/xtream/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json().catch(() => null);
    const items = normalizeArray<MovieStream>(data);
    return items;
  } catch (e) {
    console.error('Error fetching VOD streams from server:', e);
    return [];
  }
}

export async function fetchSeriesCategories(
  baseUrl: string,
  username: string,
  password: string
): Promise<Category[]> {
  const isDemo = username.toLowerCase() === 'demo' || username === 'demo_user_vip' || baseUrl.toLowerCase().includes('demo');
  if (isDemo) {
    return DEMO_SERIES_CATEGORIES;
  }

  const cleanUrl = sanitizeXtreamUrl(baseUrl);
  const targetUrl = `${cleanUrl}/player_api.php?username=${encodeURIComponent(username.trim())}&password=${encodeURIComponent(password.trim())}&action=get_series_categories`;

  try {
    const res = await fetchWithProxy('/api/xtream/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json().catch(() => null);
    const items = normalizeArray<Category>(data);
    if (items.length > 0) {
      return [{ category_id: 's_all', category_name: 'Todas as Séries' }, ...items];
    }
    return [{ category_id: 's_all', category_name: 'Todas as Séries' }];
  } catch (e) {
    console.error('Error fetching Series categories from server:', e);
    return [{ category_id: 's_all', category_name: 'Todas as Séries' }];
  }
}

export async function fetchSeriesStreams(
  baseUrl: string,
  username: string,
  password: string,
  categoryId?: string
): Promise<SeriesStream[]> {
  const isDemo = username.toLowerCase() === 'demo' || username === 'demo_user_vip' || baseUrl.toLowerCase().includes('demo');
  if (isDemo) {
    if (!categoryId || categoryId === 's_all') return DEMO_SERIES;
    return DEMO_SERIES.filter(s => s.category_id === categoryId);
  }

  const cleanUrl = sanitizeXtreamUrl(baseUrl);
  let targetUrl = `${cleanUrl}/player_api.php?username=${encodeURIComponent(username.trim())}&password=${encodeURIComponent(password.trim())}&action=get_series`;
  if (categoryId && categoryId !== 's_all') {
    targetUrl += `&category_id=${encodeURIComponent(categoryId)}`;
  }

  try {
    const res = await fetchWithProxy('/api/xtream/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json().catch(() => null);
    const items = normalizeArray<SeriesStream>(data);
    return groupSeriesStreams(items);
  } catch (e) {
    console.error('Error fetching Series from server:', e);
    return [];
  }
}

import { getM3USeriesDetails } from './m3uParser';
import { groupSeriesStreams, getAutoSeriesDetails } from './seriesGrouper';

export async function fetchSeriesInfo(
  baseUrl: string,
  username: string,
  password: string,
  seriesId: number
): Promise<SeriesInfoResponse | null> {
  const autoInfo = getAutoSeriesDetails(seriesId);
  if (autoInfo) {
    return autoInfo;
  }

  const m3uInfo = getM3USeriesDetails(seriesId);
  if (m3uInfo) {
    return m3uInfo as any;
  }

  if (username === 'demo_user_vip' || username === 'demo') {
    const series = DEMO_SERIES.find(s => s.series_id === seriesId) || DEMO_SERIES[0];
    const episodes = DEMO_SERIES_EPISODES[seriesId] || DEMO_SERIES_EPISODES[301];

    // Group episodes by season
    const episodesBySeason: Record<string, typeof episodes> = {};
    episodes.forEach(ep => {
      const sNum = ep.season.toString();
      if (!episodesBySeason[sNum]) episodesBySeason[sNum] = [];
      episodesBySeason[sNum].push(ep);
    });

    return {
      seasons: [
        {
          air_date: "2024-01-01",
          episode_count: 10,
          id: 1,
          name: "Temporada 1",
          overview: "Primeira temporada espetacular.",
          season_number: 1,
          cover: series.cover,
          cover_big: series.cover
        },
        {
          air_date: "2025-01-01",
          episode_count: 8,
          id: 2,
          name: "Temporada 2",
          overview: "Segunda temporada de tirar o fôlego.",
          season_number: 2,
          cover: series.cover,
          cover_big: series.cover
        }
      ],
      info: {
        name: series.name,
        cover: series.cover,
        plot: series.plot,
        cast: series.cast,
        director: series.director,
        genre: series.genre,
        releaseDate: series.releaseDate,
        rating: series.rating
      },
      episodes: episodesBySeason
    };
  }

  const cleanUrl = sanitizeXtreamUrl(baseUrl);
  const targetUrl = `${cleanUrl}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=get_series_info&series_id=${seriesId}`;

  try {
    const res = await fetchWithProxy('/api/xtream/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json().catch(() => null);
  } catch (e) {
    console.error('Error fetching series details:', e);
  }
  return null;
}

export function buildStreamUrl(
  baseUrl: string,
  username: string,
  password: string,
  streamId: number | string,
  extension: string = 'm3u8',
  type: 'live' | 'movie' | 'series' = 'live',
  directSource?: string
): string {
  if (directSource && (directSource.startsWith('http://') || directSource.startsWith('https://'))) {
    return `/api/xtream/stream?url=${encodeURIComponent(directSource)}`;
  }

  if (typeof streamId === 'string' && (streamId.startsWith('http://') || streamId.startsWith('https://'))) {
    return `/api/xtream/stream?url=${encodeURIComponent(streamId)}`;
  }

  if (username === 'demo_user_vip' || username === 'demo') {
    // Pick a deterministic sample public stream for demo testing
    const numId = typeof streamId === 'number' ? streamId : parseInt(streamId, 10) || 1;
    return PUBLIC_SAMPLE_STREAMS[numId % PUBLIC_SAMPLE_STREAMS.length];
  }

  const cleanUrl = sanitizeXtreamUrl(baseUrl);
  const u = encodeURIComponent(username.trim());
  const p = encodeURIComponent(password.trim());

  let directUrl = '';
  if (type === 'live') {
    directUrl = `${cleanUrl}/live/${u}/${p}/${streamId}.${extension || 'm3u8'}`;
  } else if (type === 'movie') {
    directUrl = `${cleanUrl}/movie/${u}/${p}/${streamId}.${extension || 'mp4'}`;
  } else {
    directUrl = `${cleanUrl}/series/${u}/${p}/${streamId}.${extension || 'mp4'}`;
  }

  // Route through server stream proxy to prevent browser Mixed Content (HTTP on HTTPS) and CORS blocks
  return `/api/xtream/stream?url=${encodeURIComponent(directUrl)}`;
}

export interface EpgListingItem {
  id: string;
  epg_id?: string;
  title: string;
  lang?: string;
  start: string;
  end: string;
  description: string;
  channel_id?: string;
  start_timestamp?: number;
  stop_timestamp?: number;
}

export async function fetchShortEpg(
  baseUrl: string,
  username: string,
  password: string,
  streamId: number | string
): Promise<EpgListingItem[]> {
  if (username === 'demo_user_vip' || username === 'demo') {
    return [];
  }

  const cleanUrl = sanitizeXtreamUrl(baseUrl);
  const targetUrl = `${cleanUrl}/player_api.php?username=${encodeURIComponent(username.trim())}&password=${encodeURIComponent(password.trim())}&action=get_short_epg&stream_id=${streamId}&limit=10`;

  try {
    const res = await fetchWithProxy('/api/xtream/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl })
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => null);
    if (data && Array.isArray(data.epg_listings)) {
      return data.epg_listings.map((item: any) => {
        let titleStr = item.title || '';
        try {
          if (titleStr && !titleStr.includes(' ') && titleStr.length % 4 === 0) {
            const decoded = atob(titleStr);
            if (decoded && /^[\x20-\x7E\xA0-\xFF]+$/.test(decoded)) {
              titleStr = decoded;
            }
          }
        } catch {}

        let descStr = item.description || '';
        try {
          if (descStr && !descStr.includes(' ') && descStr.length % 4 === 0) {
            const decoded = atob(descStr);
            if (decoded && /^[\x20-\x7E\xA0-\xFF]+$/.test(decoded)) {
              descStr = decoded;
            }
          }
        } catch {}

        return {
          id: String(item.id || Math.random()),
          title: titleStr || 'Programa Ao Vivo',
          start: item.start || '',
          end: item.end || '',
          description: descStr || 'Sem descrição disponível.',
          start_timestamp: item.start_timestamp,
          stop_timestamp: item.stop_timestamp
        };
      });
    }
  } catch (e) {
    console.warn('Error fetching EPG:', e);
  }
  return [];
}
