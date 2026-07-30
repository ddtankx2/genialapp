import { Category, LiveChannel, MovieStream, SeriesStream, Episode } from '../types';
import { parseEpisodeName } from './seriesGrouper';

export interface ParsedM3UResult {
  liveCategories: Category[];
  liveChannels: LiveChannel[];
  vodCategories: Category[];
  vodMovies: MovieStream[];
  seriesCategories: Category[];
  seriesList: SeriesStream[];
}

interface M3USeriesEntry {
  series: SeriesStream;
  episodes: Record<string, Episode[]>;
}

const m3uSeriesStore = new Map<string, M3USeriesEntry>();

export function getM3USeriesDetails(seriesId: number) {
  for (const entry of m3uSeriesStore.values()) {
    if (entry.series.series_id === seriesId) {
      return {
        info: {
          name: entry.series.name,
          cover: entry.series.cover,
          plot: entry.series.plot,
          cast: entry.series.cast,
          director: entry.series.director,
          genre: entry.series.genre,
          releaseDate: entry.series.releaseDate,
          rating: entry.series.rating
        },
        seasons: Object.keys(entry.episodes).map(k => parseInt(k)).sort((a,b) => a - b),
        episodes: entry.episodes
      };
    }
  }
  return null;
}

export function parseM3UEpisodeName(rawName: string) {
  return parseEpisodeName(rawName);
}

function extractAttr(text: string, attrName: string): string {
  const pattern = new RegExp(`(?:${attrName})\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^,\\s>]+))`, 'i');
  const match = text.match(pattern);
  if (match) {
    const val = (match[1] || match[2] || match[3] || '').trim();
    return val.replace(/^["']|["']$/g, '').trim();
  }
  return '';
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'geral'
  );
}

function getFileExtension(url: string): string {
  try {
    const clean = url.split('?')[0].split('#')[0];
    const ext = clean.split('.').pop() || '';
    if (ext.length > 0 && ext.length <= 5) return ext.toLowerCase();
  } catch {}
  return 'mp4';
}

export function parseM3UPlaylist(m3uContent: string): ParsedM3UResult {
  m3uSeriesStore.clear();

  let cleanContent = m3uContent || '';
  if (cleanContent.charCodeAt(0) === 0xFEFF) {
    cleanContent = cleanContent.slice(1);
  }

  const lines = cleanContent.split(/\r?\n/);

  const liveCatMap = new Map<string, Category>();
  const vodCatMap = new Map<string, Category>();
  const seriesCatMap = new Map<string, Category>();

  const liveChannels: LiveChannel[] = [];
  const vodMovies: MovieStream[] = [];
  const seriesList: SeriesStream[] = [];

  let currentExtInf: string | null = null;
  let streamIdCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.toUpperCase().startsWith('#EXTINF')) {
      currentExtInf = line;
      continue;
    }

    if (line.startsWith('#')) {
      if (line.toUpperCase().startsWith('#EXTGRP:')) {
        const grp = line.replace(/#EXTGRP:/i, '').trim();
        if (currentExtInf && !currentExtInf.includes('group-title')) {
          currentExtInf += ` group-title="${grp}"`;
        }
      }
      continue;
    }

    // Standard media URL line (any line not starting with #)
    const mediaUrl = line;
    const extInf = currentExtInf || '';
    currentExtInf = null;

    // 1. Extract Channel / Media Title
    let name = '';
    const commaIdx = extInf.lastIndexOf(',');
    if (commaIdx !== -1) {
      name = extInf.substring(commaIdx + 1).trim();
    }
    if (!name) {
      name = extractAttr(extInf, 'tvg-name') || extractAttr(extInf, 'name');
    }
    if (!name) {
      name = `Mídia ${streamIdCounter}`;
    }

    // 2. Extract Logo
    const logo =
      extractAttr(extInf, 'tvg-logo') ||
      extractAttr(extInf, 'logo') ||
      extractAttr(extInf, 'tvg-cover');

    // 3. Extract Group / Category Name
    let groupName =
      extractAttr(extInf, 'group-title') ||
      extractAttr(extInf, 'group_title') ||
      extractAttr(extInf, 'group');

    if (!groupName) groupName = 'Geral';

    // 4. Extract EPG ID
    const epgId = extractAttr(extInf, 'tvg-id') || extractAttr(extInf, 'id');

    const lowerGroup = groupName.toLowerCase();
    const lowerUrl = mediaUrl.toLowerCase();
    const currentId = streamIdCounter++;

    // Classifier: Series vs Movie vs Live TV
    const isExplicitSeries =
      lowerUrl.includes('/series/') ||
      /S\d{1,2}\s*E\d{1,2}|T\d{1,2}\s*E\d{1,2}|\b\d{1,2}x\d{1,2}\b/i.test(name) ||
      /\b(series|séries|série|temporada|season|episodes)\b/i.test(lowerGroup) ||
      /\b(series|séries|série)\b/i.test(name);

    const isExplicitMovie =
      !isExplicitSeries &&
      (lowerUrl.includes('/movie/') ||
        /\.(mp4|mkv|avi|mov|wmv|flv|webm)($|\?)/i.test(mediaUrl) ||
        /\b(vod|filmes|filme|movies|movie|cinema|lançamentos|lançamento)\b/i.test(lowerGroup) ||
        /\b(filme|movie|4k|1080p)\b/i.test(name));

    let contentType: 'series' | 'movie' | 'live' = 'live';

    if (isExplicitSeries) {
      contentType = 'series';
    } else if (isExplicitMovie) {
      contentType = 'movie';
    } else {
      contentType = 'live';
    }

    const categoryId = slugify(groupName);

    if (contentType === 'series') {
      if (!seriesCatMap.has(categoryId)) {
        seriesCatMap.set(categoryId, { category_id: categoryId, category_name: groupName });
      }

      const parsedEp = parseM3UEpisodeName(name);
      const seriesSlug = slugify(`${groupName}_${parsedEp.baseName}`);

      if (!m3uSeriesStore.has(seriesSlug)) {
        const newSeries: SeriesStream = {
          num: currentId,
          name: parsedEp.baseName,
          series_id: currentId,
          cover: logo,
          plot: `Série M3U: ${parsedEp.baseName}`,
          cast: '',
          director: '',
          genre: groupName,
          releaseDate: '',
          last_modified: '',
          rating: '8.5',
          rating_5based: 5,
          category_id: categoryId
        };
        seriesList.push(newSeries);
        m3uSeriesStore.set(seriesSlug, { series: newSeries, episodes: {} });
      }

      const storeEntry = m3uSeriesStore.get(seriesSlug)!;
      const sKey = String(parsedEp.season);
      if (!storeEntry.episodes[sKey]) {
        storeEntry.episodes[sKey] = [];
      }

      storeEntry.episodes[sKey].push({
        id: currentId,
        episode_num: parsedEp.episode_num,
        title: parsedEp.subTitle,
        container_extension: getFileExtension(mediaUrl) || 'mp4',
        info: {
          duration: 'HD',
          movie_image: logo,
          plot: `Episódio ${parsedEp.episode_num} de ${parsedEp.baseName}`
        },
        season: parsedEp.season,
        stream_url: mediaUrl
      });
    } else if (contentType === 'movie') {
      if (!vodCatMap.has(categoryId)) {
        vodCatMap.set(categoryId, { category_id: categoryId, category_name: groupName });
      }
      vodMovies.push({
        num: currentId,
        name,
        stream_type: 'movie',
        stream_id: currentId,
        stream_icon: logo,
        rating: '5.0',
        rating_5based: 5,
        added: new Date().toISOString(),
        category_id: categoryId,
        container_extension: getFileExtension(mediaUrl) || 'mp4',
        custom_sid: '',
        direct_source: mediaUrl,
        genre: groupName
      });
    } else {
      // Live TV
      if (!liveCatMap.has(categoryId)) {
        liveCatMap.set(categoryId, { category_id: categoryId, category_name: groupName });
      }
      liveChannels.push({
        num: currentId,
        name,
        stream_type: 'live',
        stream_id: currentId,
        stream_icon: logo,
        epg_channel_id: epgId,
        category_id: categoryId,
        direct_source: mediaUrl
      });
    }
  }

  const liveCategories: Category[] = [
    { category_id: 'all', category_name: 'TODOS OS CANAIS' },
    ...Array.from(liveCatMap.values())
  ];

  const vodCategories: Category[] = [
    { category_id: 'm_all', category_name: 'TODOS OS FILMES' },
    ...Array.from(vodCatMap.values())
  ];

  const seriesCategories: Category[] = [
    { category_id: 's_all', category_name: 'TODAS AS SÉRIES' },
    ...Array.from(seriesCatMap.values())
  ];

  return {
    liveCategories,
    liveChannels,
    vodCategories,
    vodMovies,
    seriesCategories,
    seriesList
  };
}

export async function fetchM3UFromUrl(url: string): Promise<string> {
  const cleanUrl = url.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    throw new Error('A URL da lista M3U deve começar com http:// ou https://');
  }

  const res = await fetch('/api/m3u/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetUrl: cleanUrl })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro ao carregar lista M3U (HTTP ${res.status}).`);
  }

  const data = await res.json();
  if (!data.content) {
    throw new Error('A lista M3U está vazia ou não pôde ser baixada.');
  }

  return data.content;
}
