import { SeriesStream, Episode, SeriesInfoResponse } from '../types';

export interface ParsedEpisodeName {
  baseName: string;
  season: number;
  episode_num: number;
  subTitle: string;
  isEpisodePattern: boolean;
}

export function parseEpisodeName(rawName: string): ParsedEpisodeName {
  if (!rawName) {
    return { baseName: 'Série', season: 1, episode_num: 1, subTitle: 'Episódio 1', isEpisodePattern: false };
  }

  const cleaned = rawName.trim();

  // 1. Check patterns with BOTH season and episode (S01E01, 1x01, Temporada 1 Episodio 1, etc.)
  const seasonEpPatterns = [
    // S01E01 / S1E1 / T01E01 / S01.E01 / S01_E01 / S01 - E01 / S01E001
    /^(.*?)(?:\s*[-_.:\s]+)*\b[ST](\d{1,2})[\s._-]*E(\d{1,3})\b(?:\s*[-_.:\s]+)*(.*)$/i,
    // 01x01 / 1x1 / 01x001
    /^(.*?)(?:\s*[-_.:\s]+)*\b(\d{1,2})x(\d{1,3})\b(?:\s*[-_.:\s]+)*(.*)$/i,
    // Temporada 1 Episodio 1 / Season 1 Episode 1 / Temp 1 Ep 1
    /^(.*?)(?:\s*[-_.:\s]+)*\b(?:Temporada|Season|Temp|T)[\s._-]*(\d{1,2})[\s._-]*(?:Epis[oó]dio|Episode|Ep|E)[\s._-]*(\d{1,3})\b(?:\s*[-_.:\s]+)*(.*)$/i,
    // E01 S01 (reversed)
    /^(.*?)(?:\s*[-_.:\s]+)*\bE(\d{1,3})[\s._-]*[ST](\d{1,2})\b(?:\s*[-_.:\s]+)*(.*)$/i
  ];

  for (let idx = 0; idx < seasonEpPatterns.length; idx++) {
    const pattern = seasonEpPatterns[idx];
    const match = cleaned.match(pattern);
    if (match) {
      let baseName = (match[1] || '').trim().replace(/[-_.:\s]+$/, '').trim();
      let seasonNum = 1;
      let epNum = 1;

      if (idx === 3) {
        epNum = parseInt(match[2], 10) || 1;
        seasonNum = parseInt(match[3], 10) || 1;
      } else {
        seasonNum = parseInt(match[2], 10) || 1;
        epNum = parseInt(match[3], 10) || 1;
      }

      let subTitle = (match[4] || '').trim().replace(/^[-_.:\s]+/, '').trim();
      if (!baseName) baseName = cleaned;
      if (!subTitle || /^E\d+$/i.test(subTitle) || /^EP\d+$/i.test(subTitle)) {
        subTitle = `Episódio ${epNum}`;
      }

      return {
        baseName,
        season: seasonNum,
        episode_num: epNum,
        subTitle,
        isEpisodePattern: true
      };
    }
  }

  // 2. Check patterns that specify JUST the episode number with an episode prefix
  // "Naruto - Episódio 01", "Naruto Episódio 1", "Naruto Episode 5", "Naruto Ep. 1", "Naruto E01", "Naruto EP01"
  const episodeOnlyPatterns = [
    // "Naruto - Episódio 01" / "Naruto Episódio 1" / "Naruto Episode 5" / "Naruto Ep. 1"
    /^(.*?)(?:\s*[-_.:\s]+)+\b(?:Epis[oó]dio|Episode|Ep|E|Ep\.)[\s._-]*(\d{1,3})\b(?:\s*[-_.:\s]+)*(.*)$/i,
    // "Naruto E01" / "Naruto EP01" / "Naruto EP.01"
    /^(.*?)(?:\s*[-_.:\s]+)*\bE(?:P|P\.)?(\d{1,3})\b(?:\s*[-_.:\s]+)*(.*)$/i
  ];

  for (const pattern of episodeOnlyPatterns) {
    const match = cleaned.match(pattern);
    if (match) {
      let baseName = (match[1] || '').trim().replace(/[-_.:\s]+$/, '').trim();
      const epNum = parseInt(match[2], 10) || 1;
      let subTitle = (match[3] || '').trim().replace(/^[-_.:\s]+/, '').trim();

      if (!baseName) baseName = cleaned;
      if (!subTitle) {
        subTitle = `Episódio ${epNum}`;
      }

      return {
        baseName,
        season: 1, // Default to Season 1
        episode_num: epNum,
        subTitle,
        isEpisodePattern: true
      };
    }
  }

  // 3. Fallback check for numbers at the end of the string, e.g. "Naruto - 01", "Naruto - 1" or "Naruto 01"
  const trailingNumberPatterns = [
    // "Naruto - 01" / "Naruto - 1"
    /^(.*?)(?:\s*[-_.:\s]+)+\b(\d{1,3})$/,
    // "Naruto 01" / "Naruto 1"
    /^(.*?)\s+(\d{1,3})$/
  ];

  for (const pattern of trailingNumberPatterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const baseName = (match[1] || '').trim().replace(/[-_.:\s]+$/, '').trim();
      const epNum = parseInt(match[2], 10);
      if (baseName && baseName.length > 2 && isNaN(Number(baseName))) {
        return {
          baseName,
          season: 1,
          episode_num: epNum,
          subTitle: `Episódio ${epNum}`,
          isEpisodePattern: true
        };
      }
    }
  }

  return {
    baseName: cleaned,
    season: 1,
    episode_num: 1,
    subTitle: cleaned,
    isEpisodePattern: false
  };
}

function stringToHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash) || 10001;
}

const autoSeriesStore = new Map<number, SeriesInfoResponse>();

export function getAutoSeriesDetails(seriesId: number): SeriesInfoResponse | null {
  return autoSeriesStore.get(seriesId) || null;
}

export function groupSeriesStreams(items: SeriesStream[]): SeriesStream[] {
  if (!items || items.length === 0) return [];

  const seriesMap = new Map<
    string,
    {
      parent: SeriesStream;
      episodesMap: Record<string, Episode[]>;
      seasonsSet: Set<number>;
    }
  >();

  const result: SeriesStream[] = [];

  for (const item of items) {
    const parsed = parseEpisodeName(item.name);

    if (parsed.isEpisodePattern) {
      const catKey = String(item.category_id || 's_all');
      const slugName = parsed.baseName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_');
      const groupKey = `${catKey}::${slugName}`;

      if (!seriesMap.has(groupKey)) {
        const computedSeriesId = stringToHash(groupKey);
        const parentSeries: SeriesStream = {
          num: item.num || computedSeriesId,
          name: parsed.baseName,
          series_id: computedSeriesId,
          cover: item.cover || '',
          plot: item.plot || `Série ${parsed.baseName}`,
          cast: item.cast || '',
          director: item.director || '',
          genre: item.genre || 'Série HD',
          releaseDate: item.releaseDate || '',
          last_modified: item.last_modified || '',
          rating: item.rating || '8.5',
          rating_5based: item.rating_5based || 5,
          category_id: item.category_id || 's_all'
        };

        seriesMap.set(groupKey, {
          parent: parentSeries,
          episodesMap: {},
          seasonsSet: new Set()
        });
      }

      const entry = seriesMap.get(groupKey)!;
      const sKey = String(parsed.season);

      if (!entry.episodesMap[sKey]) {
        entry.episodesMap[sKey] = [];
      }
      entry.seasonsSet.add(parsed.season);

      const epId = item.series_id || item.num || `${parsed.season}_${parsed.episode_num}`;
      const epCover = item.cover || entry.parent.cover;

      const exists = entry.episodesMap[sKey].some(
        (e) => String(e.id) === String(epId) || e.episode_num === parsed.episode_num
      );

      if (!exists) {
        entry.episodesMap[sKey].push({
          id: epId,
          episode_num: parsed.episode_num,
          title: parsed.subTitle,
          container_extension: 'mp4',
          season: parsed.season,
          info: {
            duration: '45 min',
            movie_image: epCover,
            plot: `Episódio ${parsed.episode_num} de ${parsed.baseName}`
          },
          stream_url: (item as any).direct_source || (item as any).stream_url || ''
        });
      }
    } else {
      result.push(item);
    }
  }

  for (const entry of seriesMap.values()) {
    const parent = entry.parent;
    const sortedSeasons = Array.from(entry.seasonsSet).sort((a, b) => a - b);

    Object.keys(entry.episodesMap).forEach((sKey) => {
      entry.episodesMap[sKey].sort((a, b) => a.episode_num - b.episode_num);
    });

    const seasonsMeta = sortedSeasons.map((sNum) => ({
      air_date: '',
      episode_count: entry.episodesMap[String(sNum)]?.length || 0,
      id: sNum,
      name: `Temporada ${sNum}`,
      overview: `Temporada ${sNum} de ${parent.name}`,
      season_number: sNum,
      cover: parent.cover,
      cover_big: parent.cover
    }));

    autoSeriesStore.set(parent.series_id, {
      seasons: seasonsMeta,
      info: {
        name: parent.name,
        cover: parent.cover,
        plot: parent.plot,
        cast: parent.cast,
        director: parent.director,
        genre: parent.genre,
        releaseDate: parent.releaseDate,
        rating: parent.rating
      },
      episodes: entry.episodesMap
    });

    parent.seasonsCount = sortedSeasons.length;
    result.push(parent);
  }

  // Deduplicate and validate series list to ensure only one entry per series exists
  const finalResult: SeriesStream[] = [];
  const seenIds = new Set<number>();

  for (const series of result) {
    if (!series.series_id) continue;
    if (!seenIds.has(series.series_id)) {
      seenIds.add(series.series_id);
      finalResult.push(series);
    }
  }

  return finalResult;
}
