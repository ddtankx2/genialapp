import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Clapperboard,
  Play,
  Star,
  ChevronDown,
  X,
  ArrowLeft,
  Tv,
  Calendar,
  Film,
  User,
  Clock,
  Info
} from 'lucide-react';
import { Category, SeriesStream, Episode } from '../types';
import { groupSeriesStreams } from '../services/seriesGrouper';

interface SeriesSectionProps {
  categories: Category[];
  seriesList: SeriesStream[];
  onFetchSeriesDetails: (seriesId: number) => Promise<any>;
  onPlayEpisode: (series: SeriesStream, episode: Episode) => void;
  searchQuery: string;
  onBack?: () => void;
}

const ITEMS_PER_PAGE = 40;

interface NormalizedEpisode {
  id: string | number;
  episode_num: number;
  title: string;
  season: number;
  container_extension: string;
  duration: string;
  plot: string;
  cover: string;
  stream_url?: string;
}

interface NormalizedSeriesDetails {
  info: {
    name: string;
    cover: string;
    plot: string;
    cast: string;
    director: string;
    genre: string;
    releaseDate: string;
    rating: string;
  };
  seasons: number[];
  episodesBySeason: Record<number, NormalizedEpisode[]>;
  totalSeasonsCount: number;
  totalEpisodesCount: number;
}

function normalizeSeriesDetails(raw: any, fallbackSeries?: SeriesStream | null): NormalizedSeriesDetails {
  const info = {
    name: raw?.info?.name || fallbackSeries?.name || 'Série',
    cover: raw?.info?.cover || fallbackSeries?.cover || '',
    plot: raw?.info?.plot || fallbackSeries?.plot || 'Escolha uma temporada para visualizar os episódios disponíveis e iniciar a reprodução.',
    cast: raw?.info?.cast || fallbackSeries?.cast || '',
    director: raw?.info?.director || fallbackSeries?.director || '',
    genre: raw?.info?.genre || fallbackSeries?.genre || 'Série HD',
    releaseDate: raw?.info?.releaseDate || raw?.info?.release_date || fallbackSeries?.releaseDate || '',
    rating: raw?.info?.rating || fallbackSeries?.rating || '8.5'
  };

  const episodesBySeason: Record<number, NormalizedEpisode[]> = {};

  const processSingleEpisode = (rawEp: any, fallbackSeason?: number) => {
    if (!rawEp || typeof rawEp !== 'object') return;

    let sNum = parseInt(rawEp.season || rawEp.season_num || rawEp.season_number || rawEp.season_id);
    if (isNaN(sNum) || sNum < 1) {
      sNum = fallbackSeason || 1;
    }

    let eNum = parseInt(rawEp.episode_num || rawEp.episode_number || rawEp.episode || rawEp.num);
    if (isNaN(eNum) || eNum < 1) {
      const titleStr = String(rawEp.title || rawEp.name || '');
      const match = titleStr.match(/(?:E|EP|EPISODIO|EPISÓDIO)\s*0*(\d+)/i) || titleStr.match(/\d+x0*(\d+)/i);
      if (match) {
        eNum = parseInt(match[1]);
      } else {
        eNum = (episodesBySeason[sNum]?.length || 0) + 1;
      }
    }

    let title = String(rawEp.title || rawEp.name || '').trim();
    title = title.replace(/^S\d+\s*E\d+\s*[-:]*\s*/i, '').replace(/^T\d+\s*E\d+\s*[-:]*\s*/i, '').trim();
    if (!title || title.toLowerCase().startsWith('episode') || title.toLowerCase().startsWith('episódio')) {
      title = `Episódio ${eNum}`;
    }

    const epCover =
      rawEp.info?.movie_image ||
      rawEp.info?.cover ||
      rawEp.movie_image ||
      rawEp.cover ||
      rawEp.stream_icon ||
      info.cover;

    let duration = rawEp.info?.duration || rawEp.duration || '';
    if (rawEp.info?.duration_secs && !duration) {
      const mins = Math.floor(rawEp.info.duration_secs / 60);
      duration = `${mins} min`;
    }

    const plot = rawEp.info?.plot || rawEp.info?.overview || rawEp.plot || rawEp.overview || '';
    const id = rawEp.id || rawEp.stream_id || `${sNum}_${eNum}`;
    const container_extension = rawEp.container_extension || rawEp.extension || 'mp4';
    const stream_url = rawEp.stream_url || rawEp.direct_source || '';

    if (!episodesBySeason[sNum]) {
      episodesBySeason[sNum] = [];
    }

    const exists = episodesBySeason[sNum].some(
      (e) => String(e.id) === String(id) || e.episode_num === eNum
    );

    if (!exists) {
      episodesBySeason[sNum].push({
        id,
        episode_num: eNum,
        title,
        season: sNum,
        container_extension,
        duration,
        plot,
        cover: epCover,
        stream_url
      });
    }
  };

  const rawEpisodes = raw?.episodes;

  if (rawEpisodes) {
    if (Array.isArray(rawEpisodes)) {
      rawEpisodes.forEach((ep) => processSingleEpisode(ep));
    } else if (typeof rawEpisodes === 'object') {
      Object.keys(rawEpisodes).forEach((sKey) => {
        const sMatch = sKey.match(/\d+/);
        const parsedSeason = sMatch ? parseInt(sMatch[0]) : 1;
        const seasonVal = rawEpisodes[sKey];

        if (Array.isArray(seasonVal)) {
          seasonVal.forEach((ep) => processSingleEpisode(ep, parsedSeason));
        } else if (typeof seasonVal === 'object' && seasonVal !== null) {
          Object.values(seasonVal).forEach((ep) => processSingleEpisode(ep, parsedSeason));
        }
      });
    }
  }

  if (Array.isArray(raw?.seasons)) {
    raw.seasons.forEach((sObj: any) => {
      const sNum = parseInt(sObj.season_number || sObj.id || sObj.number);
      if (sNum && sNum >= 1 && !episodesBySeason[sNum]) {
        episodesBySeason[sNum] = [];
      }
    });
  }

  let seasonNumbers = Object.keys(episodesBySeason)
    .map((k) => parseInt(k))
    .filter((n) => !isNaN(n) && n >= 1)
    .sort((a, b) => a - b);

  if (seasonNumbers.length === 0) {
    seasonNumbers = [1];
    episodesBySeason[1] = [];
  }

  let totalEpisodesCount = 0;
  seasonNumbers.forEach((sNum) => {
    if (episodesBySeason[sNum]) {
      episodesBySeason[sNum].sort((a, b) => a.episode_num - b.episode_num);
      totalEpisodesCount += episodesBySeason[sNum].length;
    } else {
      episodesBySeason[sNum] = [];
    }
  });

  return {
    info,
    seasons: seasonNumbers,
    episodesBySeason,
    totalSeasonsCount: seasonNumbers.length,
    totalEpisodesCount
  };
}

export const SeriesSection: React.FC<SeriesSectionProps> = ({
  categories,
  seriesList,
  onFetchSeriesDetails,
  onPlayEpisode,
  searchQuery,
  onBack
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('s_all');
  const [activeSeries, setActiveSeries] = useState<SeriesStream | null>(null);
  const [seriesInfo, setSeriesInfo] = useState<any | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [displayLimit, setDisplayLimit] = useState<number>(ITEMS_PER_PAGE);

  const mainScrollRef = useRef<HTMLDivElement>(null);

  const preparedCategories = useMemo(() => {
    const hasAll = categories.some((c) => String(c.category_id) === 's_all');
    if (hasAll) return categories;
    return [{ category_id: 's_all', category_name: 'TODAS AS SÉRIES' }, ...categories];
  }, [categories]);

  const processedSeriesList = useMemo(() => {
    return groupSeriesStreams(seriesList);
  }, [seriesList]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return preparedCategories;
    return preparedCategories.filter((c) =>
      c.category_name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [preparedCategories, categorySearch]);

  const filteredSeries = useMemo(() => {
    return processedSeriesList.filter((s) => {
      const categoryMatch =
        selectedCategoryId === 's_all' ||
        String(s.category_id) === String(selectedCategoryId);

      const searchMatch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.genre && s.genre.toLowerCase().includes(searchQuery.toLowerCase()));

      return categoryMatch && searchMatch;
    });
  }, [processedSeriesList, selectedCategoryId, searchQuery]);

  useEffect(() => {
    setDisplayLimit(ITEMS_PER_PAGE);
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [selectedCategoryId, searchQuery]);

  const visibleSeries = useMemo(() => {
    return filteredSeries.slice(0, displayLimit);
  }, [filteredSeries, displayLimit]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { s_all: processedSeriesList.length };
    processedSeriesList.forEach((s) => {
      if (s.category_id !== undefined && s.category_id !== null) {
        const catStr = String(s.category_id);
        map[catStr] = (map[catStr] || 0) + 1;
      }
    });
    return map;
  }, [processedSeriesList]);

  const handleLoadMore = () => {
    setDisplayLimit((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredSeries.length));
  };

  const handleSelectSeries = async (series: SeriesStream) => {
    setActiveSeries(series);
    setIsLoadingDetails(true);
    setSeriesInfo(null);

    try {
      const details = await onFetchSeriesDetails(series.series_id);
      setSeriesInfo(details);
    } catch (e) {
      console.error('Error fetching series details:', e);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const normalizedDetails = useMemo(() => {
    if (!activeSeries) return null;
    return normalizeSeriesDetails(seriesInfo, activeSeries);
  }, [seriesInfo, activeSeries]);

  useEffect(() => {
    if (normalizedDetails && normalizedDetails.seasons.length > 0) {
      setSelectedSeason(normalizedDetails.seasons[0]);
    }
  }, [normalizedDetails?.seasons]);

  const currentEpisodes = useMemo(() => {
    if (!normalizedDetails || !normalizedDetails.episodesBySeason[selectedSeason]) return [];
    return normalizedDetails.episodesBySeason[selectedSeason];
  }, [normalizedDetails, selectedSeason]);

  return (
    <div className="min-h-[calc(100vh-62px)] bg-transparent text-white flex flex-col md:flex-row select-none">
      {/* LEFT SIDEBAR: CATEGORIES */}
      <aside className="w-full md:w-72 lg:w-80 bg-black/45 backdrop-blur-md border-r border-red-950/60 p-4 shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between px-2 pb-2 border-b border-red-950/60">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 bg-black/40 hover:bg-red-950 text-red-400 border border-red-950/60 hover:border-red-500 rounded-xl transition-all cursor-pointer mr-1"
                title="Voltar para a Tela Inicial"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <Clapperboard className="w-5 h-5 text-red-400" />
            <h2 className="font-extrabold text-base tracking-wide text-white">
              Categorias Séries
            </h2>
          </div>
          <span className="text-xs text-red-300 font-mono font-bold bg-red-950/80 px-2 py-0.5 rounded-full border border-red-800">
            {categories.length}
          </span>
        </div>

        {/* Categories Search */}
        <div className="px-1">
          <input
            type="text"
            placeholder="Filtrar categorias..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full bg-black/40 border border-red-950/60 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition-colors"
          />
        </div>

        {/* Categories List */}
        <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1 custom-scrollbar">
          {filteredCategories.map((cat) => {
            const isSelected = selectedCategoryId === cat.category_id;
            const count = categoryCounts[cat.category_id] || 0;

            return (
              <button
                key={cat.category_id}
                onClick={() => setSelectedCategoryId(cat.category_id)}
                className={`w-full text-left px-3.5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-between group cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600 via-red-800 to-black text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] border border-red-500/60 scale-[1.02]'
                    : 'bg-black/40 hover:bg-gradient-to-r hover:from-red-950 hover:to-black text-gray-300 hover:text-white border border-red-950/60 hover:border-red-600/40'
                }`}
              >
                <span className="truncate pr-2">{cat.category_name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold transition-colors ${
                    isSelected
                      ? 'bg-black/40 text-white'
                      : 'bg-[#0e172a] text-gray-400 group-hover:text-red-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* RIGHT MAIN PANEL */}
      <main
        ref={mainScrollRef}
        className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-62px)] custom-scrollbar"
      >
        {/* Header Info Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-red-950/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
              <span>Séries Organizadas por Temporadas</span>
              <span className="text-xs font-bold text-red-400 bg-red-950/80 px-2.5 py-1 rounded-full border border-red-800">
                {filteredSeries.length} disponíveis
              </span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Selecione uma série para navegar pelas suas temporadas e episódios.
            </p>
          </div>
        </div>

        {/* Series Cards Grid */}
        {filteredSeries.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Clapperboard className="w-12 h-12 text-gray-600 animate-pulse" />
            <h3 className="text-base font-bold text-gray-300">Nenhuma série encontrada</h3>
            <p className="text-xs text-gray-500 max-w-sm">
              Tente selecionar outra categoria ou buscar por outro título no campo de busca.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {visibleSeries.map((series) => (
                <div
                  key={series.series_id}
                  onClick={() => handleSelectSeries(series)}
                  className="bg-black/45 border border-red-950/80 hover:border-red-500 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(225,29,72,0.45)] group flex flex-col relative"
                >
                  <div className="aspect-[2/3] bg-black/40 relative overflow-hidden">
                    <img
                      src={
                        series.cover ||
                        'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80'
                      }
                      alt={series.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{series.rating || '8.5'}</span>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                      <div className="p-3 bg-red-600/90 text-white rounded-full shadow-[0_0_20px_rgba(225,29,72,0.6)] border border-red-300 scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 flex flex-col flex-1 justify-between bg-black/35">
                    <div>
                      <h3 className="font-extrabold text-xs text-white line-clamp-1 group-hover:text-red-300 transition-colors">
                        {series.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5 font-medium">
                        {series.genre || 'Série Completa'}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-red-950/60 flex items-center justify-between text-[10px] text-red-400 font-bold uppercase tracking-wider">
                      <span>Ver Temporadas</span>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {displayLimit < filteredSeries.length && (
              <div className="mt-8 flex flex-col items-center justify-center gap-2">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 bg-black/40 hover:bg-red-950 text-red-400 font-bold border border-red-950/80 hover:border-red-500 rounded-2xl transition-all flex items-center gap-2 shadow-lg cursor-pointer text-xs"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>
                    Exibindo {visibleSeries.length} de {filteredSeries.length} séries. Carregar mais...
                  </span>
                </button>
              </div>
            )}
          </>
        )}

        {/* NETFLIX / SMARTERS PLAYER PRO STYLE SERIES DETAILS MODAL */}
        {activeSeries && normalizedDetails && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
            <div className="bg-[#0c0407] border border-red-950/80 rounded-3xl w-full max-w-5xl overflow-hidden shadow-[0_0_60px_rgba(225,29,72,0.4)] relative flex flex-col max-h-[92vh]">
              {/* Close Button */}
              <button
                onClick={() => setActiveSeries(null)}
                className="absolute top-4 right-4 z-30 p-2 bg-black/80 hover:bg-red-950 text-gray-300 hover:text-white rounded-full border border-red-950/80 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top Banner / Series Info Header */}
              <div className="relative p-5 sm:p-7 bg-gradient-to-b from-red-950/40 via-[#0c0407] to-[#0c0407] border-b border-red-950/80 flex flex-col md:flex-row gap-6 shrink-0 overflow-y-auto max-h-[45vh]">
                {/* Poster Cover */}
                <div className="w-32 sm:w-44 aspect-[2/3] bg-black/40 rounded-2xl overflow-hidden border border-red-950/80 shadow-xl shrink-0 mx-auto md:mx-0">
                  <img
                    src={
                      normalizedDetails.info.cover ||
                      'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80'
                    }
                    alt={normalizedDetails.info.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {normalizedDetails.info.rating}
                    </span>

                    <span className="text-xs font-bold text-red-300 bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-800">
                      {normalizedDetails.totalSeasonsCount}{' '}
                      {normalizedDetails.totalSeasonsCount === 1 ? 'Temporada' : 'Temporadas'}
                    </span>

                    <span className="text-xs font-bold text-rose-300 bg-red-950/40 px-2.5 py-0.5 rounded-full border border-red-900/80">
                      {normalizedDetails.totalEpisodesCount} Episódios
                    </span>

                    {normalizedDetails.info.releaseDate && (
                      <span className="text-xs font-bold text-gray-300 bg-black/40 px-2.5 py-0.5 rounded-full border border-red-950/80 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-red-400" />
                        {normalizedDetails.info.releaseDate}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                    {normalizedDetails.info.name}
                  </h2>

                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider mt-1">
                    {normalizedDetails.info.genre}
                  </p>

                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mt-3 max-w-3xl line-clamp-3">
                    {normalizedDetails.info.plot}
                  </p>

                  {(normalizedDetails.info.cast || normalizedDetails.info.director) && (
                    <div className="mt-3 text-xs text-gray-400 space-y-0.5">
                      {normalizedDetails.info.cast && (
                        <p className="line-clamp-1">
                          <strong className="text-gray-200">Elenco:</strong> {normalizedDetails.info.cast}
                        </p>
                      )}
                      {normalizedDetails.info.director && (
                        <p className="line-clamp-1">
                          <strong className="text-gray-200">Direção:</strong> {normalizedDetails.info.director}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Seasons & Episodes Container */}
              <div className="p-5 sm:p-7 flex-1 flex flex-col overflow-hidden bg-transparent">
                {/* SEASON SELECTOR TABS */}
                <div className="mb-4 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-extrabold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Tv className="w-4 h-4 text-red-400" />
                      Selecione a Temporada:
                    </label>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {normalizedDetails.seasons.map((sNum) => {
                      const isSelected = selectedSeason === sNum;
                      const epsCount = normalizedDetails.episodesBySeason[sNum]?.length || 0;

                      return (
                        <button
                          key={sNum}
                          onClick={() => setSelectedSeason(sNum)}
                          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-red-600 via-red-800 to-black text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-500 scale-105'
                              : 'bg-black/40 hover:bg-red-950/50 text-gray-300 border border-red-950/80 hover:border-red-500/50'
                          }`}
                        >
                          <span>Temporada {sNum}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                              isSelected ? 'bg-black/40 text-white' : 'bg-red-950/80 text-red-300'
                            }`}
                          >
                            {epsCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* EPISODES LIST FOR SELECTED SEASON */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-red-950/80">
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Episódios da Temporada {selectedSeason}</span>
                      <span className="text-[10px] text-red-400 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-800">
                        {currentEpisodes.length} episódios
                      </span>
                    </h4>
                  </div>

                  {isLoadingDetails ? (
                    <div className="py-12 text-center text-xs text-red-400 flex items-center justify-center gap-2 my-auto">
                      <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      <span>Carregando episódios da temporada...</span>
                    </div>
                  ) : currentEpisodes.length === 0 ? (
                    <div className="p-8 bg-black/40 rounded-2xl text-xs text-gray-400 text-center border border-red-950/80 my-auto">
                      Nenhum episódio encontrado para a Temporada {selectedSeason}.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-1 custom-scrollbar max-h-[38vh]">
                      {currentEpisodes.map((ep) => (
                        <div
                          key={ep.id}
                          onClick={() => {
                            const s = activeSeries;
                            setActiveSeries(null);
                            onPlayEpisode(s, {
                              id: ep.id,
                              episode_num: ep.episode_num,
                              title: ep.title,
                              container_extension: ep.container_extension,
                              season: ep.season,
                              info: {
                                duration: ep.duration,
                                movie_image: ep.cover,
                                plot: ep.plot
                              },
                              stream_url: ep.stream_url
                            });
                          }}
                          className="p-3 bg-black/40 hover:bg-red-950/50 border border-red-950/80 hover:border-red-500 rounded-2xl flex items-center gap-3 cursor-pointer transition-all group shadow-md"
                        >
                          {/* Episode Thumbnail */}
                          <div className="w-24 sm:w-28 aspect-video bg-black rounded-xl overflow-hidden relative shrink-0 border border-red-950/80">
                            <img
                              src={ep.cover || normalizedDetails.info.cover}
                              alt={ep.title}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <div className="p-1.5 bg-red-600/90 text-white rounded-full shadow-md group-hover:scale-110 transition-transform">
                                <Play className="w-3.5 h-3.5 fill-current" />
                              </div>
                            </div>
                            {ep.duration && (
                              <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono font-bold text-gray-300 px-1.5 py-0.5 rounded border border-white/10">
                                {ep.duration}
                              </span>
                            )}
                          </div>

                          {/* Episode Text Info */}
                          <div className="flex-1 min-w-0 pr-1">
                            <div className="flex items-center gap-2">
                              <span className="bg-red-950/80 text-red-300 font-mono font-bold text-[10px] rounded border border-red-800 shrink-0 px-1.5 py-0.5">
                                E{ep.episode_num < 10 ? `0${ep.episode_num}` : ep.episode_num}
                              </span>
                              <h5 className="font-extrabold text-xs text-white truncate group-hover:text-red-300 transition-colors">
                                {ep.title}
                              </h5>
                            </div>

                            {ep.plot && (
                              <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-snug">
                                {ep.plot}
                              </p>
                            )}
                          </div>

                          {/* Play Action Button */}
                          <button className="hidden sm:flex px-3 py-2 bg-red-950/80 group-hover:bg-red-600 text-red-300 group-hover:text-white rounded-xl text-xs font-bold transition-all items-center gap-1.5 shrink-0 shadow-sm">
                            <span>Assistir</span>
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
