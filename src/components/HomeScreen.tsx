import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tv,
  Play,
  Clapperboard,
  BookOpen,
  Grid,
  RotateCcw,
  RefreshCw,
  Trophy,
  ShoppingCart,
  UserCheck,
  Calendar,
  Sparkles,
  ShieldCheck,
  Zap,
  Film,
  Share2
} from 'lucide-react';
import { ActiveScreen, UserInfo, XtreamServerCredentials, MovieStream, SeriesStream } from '../types';

interface HomeScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
  userInfo: UserInfo | null;
  activeServer: XtreamServerCredentials | null;
  counts: {
    channelsCount: number;
    moviesCount: number;
    seriesCount: number;
    matchesCount: number;
  };
  movies?: MovieStream[];
  series?: SeriesStream[];
  onRefreshData?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  userInfo,
  activeServer,
  counts,
  movies = [],
  series = [],
  onRefreshData
}) => {
  const [liveUpdatedSecs, setLiveUpdatedSecs] = useState<number>(3);
  const [moviesUpdatedSecs, setMoviesUpdatedSecs] = useState<number>(1);
  const [seriesUpdatedSecs, setSeriesUpdatedSecs] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'IPTV Smarters Pro',
      text: 'Assista a canais de TV ao vivo, filmes e séries com a melhor qualidade!',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.log('Erro ao compartilhar:', err);
    }
  };

  const movies2026 = useMemo(() => {
    // 1. Filter for 2026, 2025 or 'm_lancamentos' movies
    let list = movies.filter(
      (m) => m.year === '2026' || m.year === '2025' || String(m.category_id) === 'm_lancamentos'
    );
    // 2. Fallback to first 15 movies if we don't have enough
    if (list.length === 0 && movies.length > 0) {
      list = movies.slice(0, 15);
    }
    
    // 3. Fallback to stunning high-quality cinema releases with Unsplash covers if still empty
    if (list.length === 0) {
      list = [
        {
          stream_id: 20261,
          name: "Avatar: Fogo e Cinzas (2026)",
          stream_icon: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
          year: "2026",
          rating: "9.0"
        },
        {
          stream_id: 20262,
          name: "Vingadores: Doomsday (2026)",
          stream_icon: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
          year: "2026",
          rating: "8.8"
        },
        {
          stream_id: 20263,
          name: "The Batman II (Especial 2026)",
          stream_icon: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&auto=format&fit=crop&q=80",
          year: "2026",
          rating: "8.9"
        },
        {
          stream_id: 20264,
          name: "Planeta Terra IV: Origens (2026)",
          stream_icon: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
          year: "2026",
          rating: "9.5"
        },
        {
          stream_id: 20265,
          name: "Gladiador II (Lançamento)",
          stream_icon: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
          year: "2026",
          rating: "8.6"
        }
      ] as any[];
    }

    const seen = new Set<string>();
    return list.filter((m) => {
      if (!m.stream_icon) return false;
      const url = m.stream_icon.trim();
      if (!url) return false;
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }, [movies]);

  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);

  useEffect(() => {
    if (movies2026.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentMovieIndex((prev) => (prev + 1) % movies2026.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [movies2026]);

  const activeMovie = movies2026[currentMovieIndex];

  const seriesPopular = useMemo(() => {
    // 1. Filter for series with valid ratings or categories
    let list = series.filter(
      (s) => s.rating && Number(s.rating) >= 7
    );
    // 2. Fallback to first 15 series if we don't have enough
    if (list.length === 0 && series.length > 0) {
      list = series.slice(0, 15);
    }
    
    // 3. Fallback to stunning high-quality TV show releases with Unsplash covers if still empty
    if (list.length === 0) {
      list = [
        {
          series_id: 202611,
          name: "Stranger Things 5 (2026)",
          cover: "https://images.unsplash.com/photo-1574375927938-d5a98e8edd85?w=500&auto=format&fit=crop&q=80",
          rating: "9.2"
        },
        {
          series_id: 202612,
          name: "The Last of Us - Temporada 2",
          cover: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=80",
          rating: "9.1"
        },
        {
          series_id: 202613,
          name: "House of the Dragon II",
          cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
          rating: "8.9"
        },
        {
          series_id: 202614,
          name: "Ruptura (Severance S2)",
          cover: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80",
          rating: "9.0"
        },
        {
          series_id: 202615,
          name: "Round 6: Temporada 3",
          cover: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=500&auto=format&fit=crop&q=80",
          rating: "8.7"
        }
      ] as any[];
    }

    const seen = new Set<string>();
    return list.filter((s) => {
      if (!s.cover) return false;
      const url = s.cover.trim();
      if (!url) return false;
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }, [series]);

  const [currentSeriesIndex, setCurrentSeriesIndex] = useState(0);

  useEffect(() => {
    if (seriesPopular.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSeriesIndex((prev) => (prev + 1) % seriesPopular.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [seriesPopular]);

  const activeSeries = seriesPopular[currentSeriesIndex];

  const handleCardRefresh = (e: React.MouseEvent, type: 'live' | 'movies' | 'series') => {
    e.stopPropagation();
    if (onRefreshData) onRefreshData();
    if (type === 'live') setLiveUpdatedSecs(1);
    if (type === 'movies') setMoviesUpdatedSecs(1);
    if (type === 'series') setSeriesUpdatedSecs(1);
  };

  const usernameDisplay = userInfo?.username || activeServer?.username || 'demo';
  const expirationDisplay =
    userInfo?.exp_date && userInfo.exp_date !== '0'
      ? new Date(parseInt(userInfo.exp_date) * 1000).toLocaleDateString('pt-BR')
      : 'Ilimitada';

  return (
    <div className="min-h-[calc(100vh-62px)] bg-transparent text-white p-4 sm:p-6 lg:p-10 flex flex-col justify-between relative overflow-hidden select-none animate-fade-in">
      {/* Background Subtle Red Gradient Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-red-900/25 via-rose-950/10 to-transparent blur-3xl pointer-events-none" />

      {/* IPTV SMARTERS MAIN TILES */}
      <div className="max-w-6xl mx-auto w-full my-auto z-10 space-y-6">
        {/* JOGOS DO DIA RIBBON BANNER */}
        <motion.button
          onClick={() => onNavigate('sports')}
          animate={{
            boxShadow: [
              "0 0 15px rgba(16,185,129,0.3)",
              "0 0 35px rgba(16,185,129,0.8)",
              "0 0 15px rgba(16,185,129,0.3)"
            ],
            borderColor: [
              "rgba(52,211,153,0.4)",
              "rgba(255,255,255,0.8)",
              "rgba(52,211,153,0.4)"
            ],
            scale: [1, 1.01, 1]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-full p-4 rounded-2xl bg-emerald-950 border border-emerald-500/60 font-black text-sm text-white uppercase tracking-wider flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer relative overflow-hidden group"
        >
          {/* Football Field Grass Background Photo */}
          <img
            src="/football_field_grass.jpg"
            alt="Gramado de Futebol"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500 z-0"
          />

          {/* Dark Green Vignette Overlay for Premium Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-black/40 to-emerald-950/80 z-0" />

          {/* Animated Background Light Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite] pointer-events-none z-10" />

          {/* Falling and Bouncing Soccer Ball */}
          <motion.span
            className="text-2xl shrink-0 inline-block drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] relative z-10"
            animate={{
              y: [-60, 0, -25, 0, -10, 0, -4, 0],
              rotate: [0, 180, 360, 540, 720, 810, 900, 900],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1.5,
              times: [0, 0.4, 0.55, 0.7, 0.8, 0.9, 0.95, 1],
              ease: "easeOut"
            }}
          >
            ⚽
          </motion.span>

          {/* Appearing Little Soccer Player */}
          <motion.span
            className="text-2xl shrink-0 inline-block drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] relative z-10"
            animate={{
              x: [-4, 4, -4],
              y: [0, -6, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🏃‍♂️
          </motion.span>

          {/* Perfectly Centered Title with Trophy Icon */}
          <span className="relative z-20 flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
            <span className="tracking-widest">JOGOS DO DIA & TABELA DO BRASILEIRÃO</span>
            <Trophy className="w-5 h-5 text-amber-300 shrink-0 animate-pulse" />
          </span>

          {/* Mini Soccer Goal on the right */}
          <motion.span
            className="text-xl shrink-0 inline-block ml-1 relative z-10"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [-5, 5, -5]
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🥅
          </motion.span>
        </motion.button>

        {/* TOP ROW: 3 EQUAL MAIN CARDS SIDE BY SIDE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* TILE 1: LIVE TV */}
          <div
            onClick={() => onNavigate('live')}
            className="group relative min-h-[280px] sm:min-h-[320px] lg:min-h-[360px] rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-red-600 via-rose-800 to-[#0c0406] shadow-[0_0_35px_rgba(225,29,72,0.45)] hover:shadow-[0_0_55px_rgba(225,29,72,0.7)] border-2 border-red-500/80 overflow-hidden cursor-pointer"
          >
            {/* Ambient inner glow */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

            {/* Top Badge */}
            <div className="flex items-center justify-between z-10">
              <span className="px-3.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-black text-white border border-red-500/40 shadow">
                {counts.channelsCount || 0} CANAIS
              </span>
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_#ef4444]" />
            </div>

            {/* Center Television Graphic */}
            <div className="my-auto flex flex-col items-center justify-center text-center z-10 py-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-wider uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                TV AO VIVO
              </h2>
            </div>

            {/* Bottom Translucent Info Strip */}
            <div className="z-10 bg-black/60 backdrop-blur-md border border-red-500/30 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between text-xs font-semibold text-gray-200 shadow-inner">
              <span className="truncate pr-2">Última atualização: {liveUpdatedSecs} seg atrás</span>
              <button
                onClick={(e) => handleCardRefresh(e, 'live')}
                title="Atualizar TV ao Vivo"
                className="p-1.5 sm:p-2 bg-red-950/80 hover:bg-red-600 text-white rounded-xl transition-all border border-red-700/60 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* TILE 2: MOVIES */}
          <div
            onClick={() => onNavigate('movies')}
            className="group relative min-h-[280px] sm:min-h-[320px] lg:min-h-[360px] rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-neutral-900 via-red-950/80 to-black shadow-[0_0_35px_rgba(225,29,72,0.25)] hover:shadow-[0_0_55px_rgba(225,29,72,0.55)] border-2 border-red-950/60 hover:border-red-500/50 overflow-hidden cursor-pointer"
          >
            {/* Background Cover Slideshow (Full cover, beautifully centered, no stretch) */}
            <div className="absolute inset-0 z-0">
              <AnimatePresence mode="popLayout">
                {activeMovie && (
                  <motion.img
                    key={activeMovie.stream_id}
                    src={activeMovie.stream_icon}
                    alt={activeMovie.name}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 0.52, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80';
                    }}
                  />
                )}
              </AnimatePresence>
              {/* Premium dark gradient mask to ensure contrast and beautiful framing */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50 pointer-events-none" />
            </div>

            {/* Ambient inner glow */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500 z-10" />

            {/* Top Row - Simple, clean identifier */}
            <div className="flex items-center justify-between z-10 w-full">
              <span className="px-3.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-black text-white border border-red-500/40 shadow">
                {counts.moviesCount || 0} FILMES
              </span>
            </div>

            {/* Center Play Graphic */}
            <div className="my-auto flex flex-col items-center justify-center text-center z-10 py-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-wider uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                FILMES
              </h2>
            </div>

            {/* Bottom Translucent Info Strip */}
            <div className="z-10 bg-black/60 backdrop-blur-md border border-red-500/30 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between text-xs font-semibold text-gray-200 shadow-inner w-full">
              <span className="truncate pr-2">Última atualização: {moviesUpdatedSecs} seg atrás</span>
              <button
                onClick={(e) => handleCardRefresh(e, 'movies')}
                title="Atualizar Filmes"
                className="p-1.5 sm:p-2 bg-red-950/80 hover:bg-red-600 text-white rounded-xl transition-all border border-red-700/60 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* TILE 3: SERIES */}
          <div
            onClick={() => onNavigate('series')}
            className="group relative min-h-[280px] sm:min-h-[320px] lg:min-h-[360px] rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-neutral-900 via-red-950/80 to-black shadow-[0_0_35px_rgba(225,29,72,0.25)] hover:shadow-[0_0_55px_rgba(225,29,72,0.55)] border-2 border-red-950/60 hover:border-red-500/50 overflow-hidden cursor-pointer"
          >
            {/* Background Cover Slideshow (Full cover, beautifully centered, no stretch) */}
            <div className="absolute inset-0 z-0">
              <AnimatePresence mode="popLayout">
                {activeSeries && (
                  <motion.img
                    key={activeSeries.series_id}
                    src={activeSeries.cover}
                    alt={activeSeries.name}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 0.52, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=80';
                    }}
                  />
                )}
              </AnimatePresence>
              {/* Premium dark gradient mask to ensure contrast and beautiful framing */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50 pointer-events-none" />
            </div>

            {/* Ambient inner glow */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500 z-10" />

            {/* Top Row - Simple, clean identifier */}
            <div className="flex items-center justify-between z-10 w-full">
              <span className="px-3.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-black text-white border border-red-500/40 shadow">
                {counts.seriesCount || 0} SÉRIES
              </span>
            </div>

            {/* Center Clapperboard Graphic */}
            <div className="my-auto flex flex-col items-center justify-center text-center z-10 py-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-wider uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                SÉRIES
              </h2>
            </div>

            {/* Bottom Translucent Info Strip */}
            <div className="z-10 bg-black/60 backdrop-blur-md border border-red-500/30 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between text-xs font-semibold text-gray-200 shadow-inner w-full">
              <span className="truncate pr-2">Última atualização: {seriesUpdatedSecs} seg atrás</span>
              <button
                onClick={(e) => handleCardRefresh(e, 'series')}
                title="Atualizar Séries"
                className="p-1.5 sm:p-2 bg-red-950/80 hover:bg-red-600 text-white rounded-xl transition-all border border-red-700/60 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: SUB-ACTION TILES FULL WIDTH */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
          {/* LIVE WITH EPG */}
          <button
            onClick={() => onNavigate('live')}
            className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-950 via-rose-900 to-[#120407] hover:from-red-700 hover:to-rose-700 border border-red-700/60 shadow-[0_0_20px_rgba(225,29,72,0.25)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] font-black text-xs sm:text-sm text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-red-400 shrink-0" />
            <span className="truncate">TV COM GUIA (EPG)</span>
          </button>

          {/* MULTI-SCREEN */}
          <button
            onClick={() => onNavigate('live')}
            className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-950 via-rose-900 to-[#120407] hover:from-red-700 hover:to-rose-700 border border-red-700/60 shadow-[0_0_20px_rgba(225,29,72,0.25)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] font-black text-xs sm:text-sm text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer"
          >
            <Grid className="w-4 h-4 text-red-400 shrink-0" />
            <span className="truncate">MULTI-TELA</span>
          </button>

          {/* CATCH UP */}
          <button
            onClick={() => onNavigate('live')}
            className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-950 via-rose-900 to-[#120407] hover:from-red-700 hover:to-rose-700 border border-red-700/60 shadow-[0_0_20px_rgba(225,29,72,0.25)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] font-black text-xs sm:text-sm text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-red-400 shrink-0" />
            <span className="truncate">GRAVAÇÕES (CATCH-UP)</span>
          </button>

          {/* FUTEBOL / SPORTS */}
          <button
            onClick={() => onNavigate('sports')}
            className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-800 via-rose-700 to-red-950 hover:from-red-600 hover:to-rose-600 border border-rose-500/60 shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)] font-black text-xs sm:text-sm text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate">JOGOS DO DIA</span>
          </button>
        </div>
      </div>

      {/* FOOTER BAR */}
      <div className="max-w-6xl mx-auto w-full mt-8 z-10 pt-4 border-t border-red-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-gray-300 font-bold">
        {/* Expiration */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Validade:</span>
          <span className="text-white font-extrabold">{expirationDisplay}</span>
        </div>

        {/* Storage Capacity Status Indicator */}
        <div className="flex items-center gap-2 bg-[#0d0407] border border-red-900/60 px-4 py-1.5 rounded-full text-rose-400 shadow-sm text-xs">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>
            IndexedDB Turbo ({((counts.channelsCount || 0) + (counts.moviesCount || 0) + (counts.seriesCount || 0)).toLocaleString()} mídias no cache)
          </span>
        </div>

        {/* Logged in User */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Usuário logado:</span>
          <span className="text-rose-400 font-extrabold uppercase">{usernameDisplay}</span>
        </div>
      </div>
    </div>
  );
};
