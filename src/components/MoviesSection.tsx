import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Film,
  Play,
  Star,
  Clock,
  X,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { Category, MovieStream } from '../types';

interface MoviesSectionProps {
  categories: Category[];
  movies: MovieStream[];
  onPlayMovie: (movie: MovieStream) => void;
  searchQuery: string;
  onBack?: () => void;
}

const ITEMS_PER_PAGE = 40;

export const MoviesSection: React.FC<MoviesSectionProps> = ({
  categories,
  movies,
  onPlayMovie,
  searchQuery,
  onBack
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('m_all');
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState<MovieStream | null>(null);
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [displayLimit, setDisplayLimit] = useState<number>(ITEMS_PER_PAGE);

  const mainScrollRef = useRef<HTMLDivElement>(null);

  const preparedCategories = useMemo(() => {
    const hasAll = categories.some((c) => String(c.category_id) === 'm_all');
    if (hasAll) return categories;
    return [{ category_id: 'm_all', category_name: 'TODOS OS FILMES' }, ...categories];
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return preparedCategories;
    return preparedCategories.filter((c) =>
      c.category_name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [preparedCategories, categorySearch]);

  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const categoryMatch =
        selectedCategoryId === 'm_all' ||
        String(m.category_id) === String(selectedCategoryId);

      const searchMatch =
        !searchQuery ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.genre && m.genre.toLowerCase().includes(searchQuery.toLowerCase()));

      return categoryMatch && searchMatch;
    });
  }, [movies, selectedCategoryId, searchQuery]);

  // Reset pagination and scroll position when filters change
  useEffect(() => {
    setDisplayLimit(ITEMS_PER_PAGE);
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [selectedCategoryId, searchQuery]);

  const visibleMovies = useMemo(() => {
    return filteredMovies.slice(0, displayLimit);
  }, [filteredMovies, displayLimit]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { m_all: movies.length };
    movies.forEach((m) => {
      if (m.category_id !== undefined && m.category_id !== null) {
        const catStr = String(m.category_id);
        map[catStr] = (map[catStr] || 0) + 1;
      }
    });
    return map;
  }, [movies]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 600) {
      if (displayLimit < filteredMovies.length) {
        setDisplayLimit((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredMovies.length));
      }
    }
  };

  const handleLoadMore = () => {
    setDisplayLimit((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredMovies.length));
  };

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
            <Film className="w-5 h-5 text-red-400" />
            <h2 className="font-extrabold text-base tracking-wide text-white">
              Categorias Filmes
            </h2>
          </div>
          <span className="text-xs text-red-300 font-mono font-bold bg-red-950/80 px-2 py-0.5 rounded-full border border-red-800">
            {categories.length}
          </span>
        </div>

        {/* Categories List */}
        <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)] pr-1 custom-scrollbar">
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
        onScroll={handleScroll}
        className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-62px)] custom-scrollbar"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-red-950/60">
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
              <span>
                {categories.find((c) => c.category_id === selectedCategoryId)
                  ?.category_name || 'Catálogo de Filmes'}
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-red-950/80 text-red-300 border border-red-800 rounded-full">
                {filteredMovies.length} títulos
              </span>
            </h1>
          </div>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length === 0 ? (
          <div className="text-center py-20 bg-black/40 rounded-3xl border border-dashed border-red-950/60">
            <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-bold text-lg">Nenhum filme encontrado.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {visibleMovies.map((movie) => (
                <div
                  key={movie.stream_id}
                  className="group relative bg-black/45 border border-red-950/80 hover:border-red-500 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(225,29,72,0.45)] hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer"
                  onClick={() => setSelectedMovieForDetails(movie)}
                >
                  {/* Poster Container */}
                  <div className="relative aspect-[2/3] w-full bg-black/40 overflow-hidden">
                    <img
                      src={movie.stream_icon || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'}
                      alt={movie.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                    {/* Rating Badge */}
                    {movie.rating && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/80 backdrop-blur-md border border-amber-500/40 rounded-lg text-[10px] font-black text-amber-400 flex items-center gap-1 shadow-md">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {movie.rating}
                      </div>
                    )}

                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.6)] scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Movie Title */}
                  <div className="p-3.5 bg-black/35">
                    <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-red-400 transition-colors line-clamp-1">
                      {movie.name}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1 font-medium">
                      <span>{movie.year || '2025'}</span>
                      <span className="text-red-400 font-bold uppercase">{movie.container_extension || 'MP4'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button / Indicator */}
            {displayLimit < filteredMovies.length && (
              <div className="mt-8 flex flex-col items-center justify-center gap-2">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 bg-black/40 hover:bg-red-950 text-red-400 font-bold border border-red-950/80 hover:border-red-500 rounded-2xl transition-all flex items-center gap-2 shadow-lg cursor-pointer text-xs"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>
                    Exibindo {visibleMovies.length} de {filteredMovies.length} filmes. Carregar mais...
                  </span>
                </button>
              </div>
            )}
          </>
        )}

        {/* MOVIE DETAILS MODAL */}
        {selectedMovieForDetails && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div className="bg-[#0c0407] border border-red-950/80 rounded-3xl w-full max-w-3xl overflow-hidden shadow-[0_0_50px_rgba(225,29,72,0.4)] relative flex flex-col md:flex-row max-h-[90vh]">
              <button
                onClick={() => setSelectedMovieForDetails(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/80 hover:bg-red-950 text-gray-300 hover:text-white rounded-full border border-red-950/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full md:w-2/5 aspect-[2/3] md:aspect-auto bg-black/40 relative shrink-0">
                <img
                  src={selectedMovieForDetails.stream_icon || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'}
                  alt={selectedMovieForDetails.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {selectedMovieForDetails.year && (
                      <span className="px-2.5 py-0.5 bg-black/40 border border-red-950/80 text-gray-300 rounded-lg text-xs font-mono">
                        {selectedMovieForDetails.year}
                      </span>
                    )}
                    {selectedMovieForDetails.duration && (
                      <span className="px-2.5 py-0.5 bg-black/40 border border-red-950/80 text-gray-300 rounded-lg text-xs font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-red-400" />
                        {selectedMovieForDetails.duration}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-black text-white tracking-wide">
                    {selectedMovieForDetails.name}
                  </h2>

                  <p className="text-sm text-gray-300 leading-relaxed mt-4">
                    {selectedMovieForDetails.plot ||
                      'Uma incrível produção de alta definição disponível para reprodução instantânea.'}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-red-950/80 flex items-center gap-4">
                  <button
                    onClick={() => {
                      const movie = selectedMovieForDetails;
                      setSelectedMovieForDetails(null);
                      onPlayMovie(movie);
                    }}
                    className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-2xl shadow-[0_0_25px_rgba(225,29,72,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    Assistir Agora
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
