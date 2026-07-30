import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveScreen,
  XtreamServerCredentials,
  UserInfo,
  Category,
  LiveChannel,
  MovieStream,
  SeriesStream,
  BrasileiraoTeam,
  MatchOfDay,
  Episode
} from './types';
import {
  loginXtream,
  fetchLiveCategories,
  fetchLiveStreams,
  fetchVodCategories,
  fetchVodStreams,
  fetchSeriesCategories,
  fetchSeriesStreams,
  fetchSeriesInfo,
  buildStreamUrl
} from './services/xtream';
import { groupSeriesStreams } from './services/seriesGrouper';
import {
  DEMO_BRASILEIRAO_TABLE,
  DEMO_MATCHES_OF_DAY,
  DEMO_LIVE_CATEGORIES,
  DEMO_LIVE_CHANNELS,
  DEMO_MOVIE_CATEGORIES,
  DEMO_MOVIES,
  DEMO_SERIES_CATEGORIES,
  DEMO_SERIES
} from './data/demoData';

import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { SportsSection } from './components/SportsSection';
import { LiveTvSection } from './components/LiveTvSection';
import { MoviesSection } from './components/MoviesSection';
import { SeriesSection } from './components/SeriesSection';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { DownloadProgressOverlay } from './components/DownloadProgressOverlay';

import { saveToIDB, getFromIDB } from './utils/idbStorage';
import { saveItemsToStorage, getItemsFromStorage, getStorageCounts } from './services/dbStorage';
import { parseM3UPlaylist, fetchM3UFromUrl } from './services/m3uParser';

const SAVED_SERVERS_KEY = 'redstream_iptv_saved_servers_v1';
const CURRENT_SESSION_KEY = 'redstream_iptv_session_v1';
const CACHE_CONTENT_KEY = 'redstream_iptv_cached_content_v1';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('login');
  const [activeServer, setActiveServer] = useState<XtreamServerCredentials | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [savedServers, setSavedServers] = useState<XtreamServerCredentials[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Download Progress Overlay state
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadStatusMessage, setDownloadStatusMessage] = useState<string>('');

  // Media Datasets initialized with rich default datasets
  const [liveCategories, setLiveCategories] = useState<Category[]>(DEMO_LIVE_CATEGORIES);
  const [liveChannels, setLiveChannels] = useState<LiveChannel[]>(DEMO_LIVE_CHANNELS);
  const [vodCategories, setVodCategories] = useState<Category[]>(DEMO_MOVIE_CATEGORIES);
  const [vodMovies, setVodMovies] = useState<MovieStream[]>(DEMO_MOVIES);
  const [seriesCategories, setSeriesCategories] = useState<Category[]>(DEMO_SERIES_CATEGORIES);
  const [seriesList, setSeriesList] = useState<SeriesStream[]>(DEMO_SERIES);
  const [standings, setStandings] = useState<BrasileiraoTeam[]>(DEMO_BRASILEIRAO_TABLE);
  const [matches, setMatches] = useState<MatchOfDay[]>(DEMO_MATCHES_OF_DAY);
  const [isRefreshingStandings, setIsRefreshingStandings] = useState<boolean>(false);

  const fetchStandingsLive = async () => {
    try {
      setIsRefreshingStandings(true);
      const res = await fetch('/api/brasileirao/standings');
      if (res.ok) {
        const data = await res.json();
        if (data && data.standings) {
          setStandings(data.standings);
        }
      }
    } catch (e) {
      console.warn('Error fetching live standings:', e);
    } finally {
      setIsRefreshingStandings(false);
    }
  };

  // Automatically fetch standings when sports section is viewed, and update every 30 seconds
  useEffect(() => {
    if (currentScreen === 'sports') {
      fetchStandingsLive();
      const interval = setInterval(() => {
        fetchStandingsLive();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [currentScreen]);

  // Active Video Player Modal state
  const [activePlayer, setActivePlayer] = useState<{
    title: string;
    subtitle?: string;
    streamUrl: string;
    type: 'live' | 'movie' | 'series';
    channelsList?: LiveChannel[];
  } | null>(null);

  // Cache keys for instant re-loads
  const CACHE_CONTENT_KEY = 'redstream_iptv_cached_content_v1';

  // Load cached content if available (IndexedDB first, fallback to localStorage)
  const restoreCachedContent = async () => {
    try {
      const [chans, movs, series, cats, oldData] = await Promise.all([
        getFromIDB<LiveChannel[]>('cached_live_channels'),
        getFromIDB<MovieStream[]>('cached_vod_movies'),
        getFromIDB<SeriesStream[]>('cached_series_list'),
        getFromIDB<any>('cached_categories'),
        getFromIDB<any>('cached_content')
      ]);

      if (chans && chans.length > 0) setLiveChannels(chans);
      else if (oldData?.liveChannels?.length) setLiveChannels(oldData.liveChannels);

      if (movs && movs.length > 0) setVodMovies(movs);
      else if (oldData?.vodMovies?.length) setVodMovies(oldData.vodMovies);

      if (series && series.length > 0) setSeriesList(groupSeriesStreams(series));
      else if (oldData?.seriesList?.length) setSeriesList(groupSeriesStreams(oldData.seriesList));

      if (cats?.liveCategories?.length) setLiveCategories(cats.liveCategories);
      else if (oldData?.liveCategories?.length) setLiveCategories(oldData.liveCategories);

      if (cats?.vodCategories?.length) setVodCategories(cats.vodCategories);
      else if (oldData?.vodCategories?.length) setVodCategories(oldData.vodCategories);

      if (cats?.seriesCategories?.length) setSeriesCategories(cats.seriesCategories);
      else if (oldData?.seriesCategories?.length) setSeriesCategories(oldData.seriesCategories);
    } catch (e) {
      console.warn('Error restoring cached content:', e);
    }
  };

  // Load Saved Servers from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_SERVERS_KEY);
      if (stored) {
        setSavedServers(JSON.parse(stored));
      }
      restoreCachedContent();

      const activeSession = localStorage.getItem(CURRENT_SESSION_KEY);
      if (activeSession) {
        const parsed = JSON.parse(activeSession);
        if (parsed.server && parsed.userInfo) {
          setActiveServer(parsed.server);
          setUserInfo(parsed.userInfo);
          setCurrentScreen('home');
          // Silent background refresh
          fetchServerDataBackground(parsed.server.serverUrl, parsed.server.username, parsed.server.password);
        }
      }
    } catch (e) {
      console.warn('Error reading saved session:', e);
    }
  }, []);

  // Background non-blocking fetcher
  const fetchServerDataBackground = async (url: string, user: string, pass: string) => {
    try {
      setIsRefreshing(true);

      const isM3uSession =
        user === 'm3u_user' ||
        url === 'Arquivo M3U Local' ||
        url.toLowerCase().includes('.m3u') ||
        url.toLowerCase().includes('type=m3u');

      if (isM3uSession) {
        if (url.startsWith('http://') || url.startsWith('https://')) {
          try {
            const rawText = await fetchM3UFromUrl(url);
            const parsed = parseM3UPlaylist(rawText);
            if (
              parsed.liveChannels.length > 0 ||
              parsed.vodMovies.length > 0 ||
              parsed.seriesList.length > 0
            ) {
              const groupedS = groupSeriesStreams(parsed.seriesList);
              setLiveCategories(parsed.liveCategories);
              setLiveChannels(parsed.liveChannels);
              setVodCategories(parsed.vodCategories);
              setVodMovies(parsed.vodMovies);
              setSeriesCategories(parsed.seriesCategories);
              setSeriesList(groupedS);

              const cacheData = {
                liveCategories: parsed.liveCategories,
                liveChannels: parsed.liveChannels,
                vodCategories: parsed.vodCategories,
                vodMovies: parsed.vodMovies,
                seriesCategories: parsed.seriesCategories,
                seriesList: groupedS
              };
              saveToIDB('cached_content', cacheData).catch(() => {});
            }
          } catch (m3uErr) {
            console.warn('Background M3U sync error, keeping cached items:', m3uErr);
          }
        }
        return;
      }

      const isDemo = user.toLowerCase() === 'demo' || user === 'demo_user_vip' || url.toLowerCase().includes('demo');

      const [lc, ls, vc, vm, sc, ss] = await Promise.allSettled([
        fetchLiveCategories(url, user, pass),
        fetchLiveStreams(url, user, pass),
        fetchVodCategories(url, user, pass),
        fetchVodStreams(url, user, pass),
        fetchSeriesCategories(url, user, pass),
        fetchSeriesStreams(url, user, pass)
      ]);

      const liveCats = lc.status === 'fulfilled' ? lc.value : (isDemo ? DEMO_LIVE_CATEGORIES : liveCategories);
      const liveChans = ls.status === 'fulfilled' ? ls.value : (isDemo ? DEMO_LIVE_CHANNELS : liveChannels);
      const vodCats = vc.status === 'fulfilled' ? vc.value : (isDemo ? DEMO_MOVIE_CATEGORIES : vodCategories);
      const vodMovs = vm.status === 'fulfilled' ? vm.value : (isDemo ? DEMO_MOVIES : vodMovies);
      const seriesCats = sc.status === 'fulfilled' ? sc.value : (isDemo ? DEMO_SERIES_CATEGORIES : seriesCategories);
      const seriesL = ss.status === 'fulfilled' ? ss.value : (isDemo ? DEMO_SERIES : seriesList);

      setLiveCategories(liveCats);
      setLiveChannels(liveChans);
      setVodCategories(vodCats);
      setVodMovies(vodMovs);
      setSeriesCategories(seriesCats);
      setSeriesList(seriesL);

      // Save to high-capacity IndexedDB storage
      saveToIDB('cached_live_channels', liveChans).catch(() => {});
      saveToIDB('cached_vod_movies', vodMovs).catch(() => {});
      saveToIDB('cached_series_list', seriesL).catch(() => {});
      saveToIDB('cached_categories', {
        liveCategories: liveCats,
        vodCategories: vodCats,
        seriesCategories: seriesCats
      }).catch(() => {});
    } catch (e) {
      console.warn('Background sync error:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Save server profile
  const handleSaveServer = (serverData: Omit<XtreamServerCredentials, 'id'>) => {
    try {
      const newServer: XtreamServerCredentials = {
        ...serverData,
        id: Date.now().toString()
      };
      const updated = [newServer, ...savedServers.filter(s => s.serverUrl !== newServer.serverUrl)];
      setSavedServers(updated);
      localStorage.setItem(SAVED_SERVERS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving server to localStorage:', e);
    }
  };

  // Delete saved server profile
  const handleDeleteServer = (id: string) => {
    try {
      const updated = savedServers.filter(s => s.id !== id);
      setSavedServers(updated);
      localStorage.setItem(SAVED_SERVERS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error deleting server from localStorage:', e);
    }
  };

  // Load all IPTV content with fast progress animation and real server requests
  const performFullDownload = async (
    url: string,
    user: string,
    pass: string,
    srvName?: string
  ) => {
    setIsDownloading(true);
    setIsLoading(true);
    setErrorMessage(null);
    setDownloadProgress(5);
    setDownloadStatusMessage('Autenticando no servidor Xtream Codes...');

    const isDemo = user.toLowerCase() === 'demo' || user === 'demo_user_vip' || url.toLowerCase().includes('demo');

    try {
      // Step 1: Auth
      const authRes = await loginXtream(url, user, pass);

      const serverObj: XtreamServerCredentials = {
        id: Date.now().toString(),
        name: srvName || 'Servidor Xtream',
        serverUrl: url,
        username: user,
        password: pass,
        lastConnected: new Date().toISOString()
      };

      setActiveServer(serverObj);
      setUserInfo(authRes.user_info);
      handleSaveServer(serverObj);

      try {
        localStorage.setItem(
          CURRENT_SESSION_KEY,
          JSON.stringify({ server: serverObj, userInfo: authRes.user_info })
        );
      } catch (e) {
        console.warn('Error saving current session to localStorage:', e);
      }

      setDownloadProgress(15);
      setDownloadStatusMessage('Autenticação confirmada! Baixando categorias de canais...');

      // Stage 1: Categories & Live Channels (sequential to respect IPTV server connection limits)
      const liveCatsRes = await fetchLiveCategories(url, user, pass).catch((e) => {
        console.warn('Live categories error:', e);
        return [];
      });

      setDownloadProgress(30);
      setDownloadStatusMessage('Baixando lista completa de Canais de TV do seu servidor...');
      const liveStreamsRes = await fetchLiveStreams(url, user, pass).catch((e) => {
        console.warn('Live streams error:', e);
        return [];
      });

      // Stage 2: VOD Categories & Movies
      setDownloadProgress(50);
      setDownloadStatusMessage(`Canais sincronizados (${liveStreamsRes.length} canais)! Baixando categorias de filmes...`);
      const vodCatsRes = await fetchVodCategories(url, user, pass).catch((e) => {
        console.warn('VOD categories error:', e);
        return [];
      });

      setDownloadProgress(65);
      setDownloadStatusMessage('Baixando catálogo de Filmes VOD...');
      const vodStreamsRes = await fetchVodStreams(url, user, pass).catch((e) => {
        console.warn('VOD streams error:', e);
        return [];
      });

      // Stage 3: Series Categories & Episodes
      setDownloadProgress(80);
      setDownloadStatusMessage(`Filmes sincronizados (${vodStreamsRes.length} filmes)! Baixando categorias de séries...`);
      const seriesCatsRes = await fetchSeriesCategories(url, user, pass).catch((e) => {
        console.warn('Series categories error:', e);
        return [];
      });

      setDownloadProgress(90);
      setDownloadStatusMessage('Baixando catálogo de Séries...');
      const seriesStreamsRes = await fetchSeriesStreams(url, user, pass).catch((e) => {
        console.warn('Series streams error:', e);
        return [];
      });

      // Determine final content: use real server content when on a real server, demo data ONLY when on demo mode
      const finalLiveCats = isDemo ? (liveCatsRes.length ? liveCatsRes : DEMO_LIVE_CATEGORIES) : liveCatsRes;
      const finalLiveChans = isDemo ? (liveStreamsRes.length ? liveStreamsRes : DEMO_LIVE_CHANNELS) : liveStreamsRes;
      const finalVodCats = isDemo ? (vodCatsRes.length ? vodCatsRes : DEMO_MOVIE_CATEGORIES) : vodCatsRes;
      const finalVodMovs = isDemo ? (vodStreamsRes.length ? vodStreamsRes : DEMO_MOVIES) : vodStreamsRes;
      const finalSeriesCats = isDemo ? (seriesCatsRes.length ? seriesCatsRes : DEMO_SERIES_CATEGORIES) : seriesCatsRes;
      const rawSeriesL = isDemo ? (seriesStreamsRes.length ? seriesStreamsRes : DEMO_SERIES) : seriesStreamsRes;
      const finalSeriesList = groupSeriesStreams(rawSeriesL);

      if (!isDemo && finalLiveChans.length === 0 && finalVodMovs.length === 0 && finalSeriesList.length === 0) {
        throw new Error('O servidor respondeu, mas não retornou nenhum canal ou filme. Verifique se o seu usuário possui uma lista ativa ou se a assinatura expirou.');
      }

      setLiveCategories(finalLiveCats);
      setLiveChannels(finalLiveChans);
      setVodCategories(finalVodCats);
      setVodMovies(finalVodMovs);
      setSeriesCategories(finalSeriesCats);
      setSeriesList(finalSeriesList);

      // Save to high-capacity IndexedDB storage (handles 30,000+ items each smoothly)
      saveToIDB('cached_live_channels', finalLiveChans).catch(() => {});
      saveToIDB('cached_vod_movies', finalVodMovs).catch(() => {});
      saveToIDB('cached_series_list', finalSeriesList).catch(() => {});
      saveToIDB('cached_categories', {
        liveCategories: finalLiveCats,
        vodCategories: finalVodCats,
        seriesCategories: finalSeriesCats
      }).catch(() => {});

      if (serverObj?.serverUrl) {
        saveItemsToStorage(serverObj.serverUrl, 'live', finalLiveChans).catch(() => {});
        saveItemsToStorage(serverObj.serverUrl, 'vod', finalVodMovs).catch(() => {});
        saveItemsToStorage(serverObj.serverUrl, 'series', finalSeriesList).catch(() => {});
      }

      setDownloadProgress(100);
      setDownloadStatusMessage(
        `Sincronização 100% concluída com o seu servidor! (${finalLiveChans.length} canais, ${finalVodMovs.length} filmes, ${finalSeriesList.length} séries)`
      );
      await new Promise((r) => setTimeout(r, 600));

      setCurrentScreen('home');
    } catch (err: any) {
      console.error('Login or download error:', err);
      setErrorMessage(
        err?.message ||
          'Não foi possível conectar ao servidor Xtream Codes. Verifique a URL e credenciais.'
      );
    } finally {
      setIsDownloading(false);
      setIsLoading(false);
    }
  };

  const loadServerData = async (url: string, user: string, pass: string) => {
    return performFullDownload(url, user, pass, activeServer?.name);
  };

  // Login Action - Trigger step-by-step progress downloader
  const handleLogin = async (
    serverUrl: string,
    username: string,
    password: string,
    serverName?: string
  ) => {
    return performFullDownload(serverUrl, username, password, serverName);
  };

  // Login Action for M3U Playlist
  const handleLoginM3u = async (playlistName: string, m3uUrl?: string, m3uContent?: string) => {
    setIsDownloading(true);
    setIsLoading(true);
    setErrorMessage(null);
    setDownloadProgress(10);
    setDownloadStatusMessage('Carregando lista M3U...');

    try {
      let rawText = m3uContent || '';
      if (m3uUrl) {
        setDownloadStatusMessage('Baixando lista M3U do servidor...');
        rawText = await fetchM3UFromUrl(m3uUrl);
      }

      setDownloadProgress(40);
      setDownloadStatusMessage('Analisando e categorizando canais, filmes e séries...');

      const parsed = parseM3UPlaylist(rawText);

      if (
        parsed.liveChannels.length === 0 &&
        parsed.vodMovies.length === 0 &&
        parsed.seriesList.length === 0
      ) {
        throw new Error('A lista M3U informada não contém canais ou mídias válidas.');
      }

      const groupedM3uSeries = groupSeriesStreams(parsed.seriesList);
      setLiveCategories(parsed.liveCategories);
      setLiveChannels(parsed.liveChannels);
      setVodCategories(parsed.vodCategories);
      setVodMovies(parsed.vodMovies);
      setSeriesCategories(parsed.seriesCategories);
      setSeriesList(groupedM3uSeries);

      const m3uServer: XtreamServerCredentials = {
        id: Date.now().toString(),
        name: playlistName,
        serverUrl: m3uUrl || 'Arquivo M3U Local',
        username: 'm3u_user',
        password: 'm3u_password'
      };

      const m3uUserInfo: UserInfo = {
        username: playlistName,
        password: '***',
        status: 'Ativo (M3U)',
        exp_date: 'Sem expiração',
        is_trial: '0',
        active_cons: '1',
        created_at: new Date().toLocaleDateString('pt-BR'),
        max_connections: 'Sem limite',
        allowed_output_formats: ['m3u8', 'ts', 'mp4']
      };

      setActiveServer(m3uServer);
      setUserInfo(m3uUserInfo);
      handleSaveServer(m3uServer);

      try {
        localStorage.setItem(
          CURRENT_SESSION_KEY,
          JSON.stringify({ server: m3uServer, userInfo: m3uUserInfo })
        );
      } catch (e) {
        console.warn('Error saving session:', e);
      }

      const cacheData = {
        liveCategories: parsed.liveCategories,
        liveChannels: parsed.liveChannels,
        vodCategories: parsed.vodCategories,
        vodMovies: parsed.vodMovies,
        seriesCategories: parsed.seriesCategories,
        seriesList: parsed.seriesList
      };
      saveToIDB('cached_content', cacheData).catch(() => {});

      setDownloadProgress(100);
      setDownloadStatusMessage(
        `Lista M3U carregada com sucesso! (${parsed.liveChannels.length} canais, ${parsed.vodMovies.length} filmes, ${parsed.seriesList.length} séries)`
      );
      await new Promise((r) => setTimeout(r, 600));

      setCurrentScreen('home');
    } catch (err: any) {
      console.error('M3U login error:', err);
      setErrorMessage(err?.message || 'Erro ao processar lista M3U.');
    } finally {
      setIsDownloading(false);
      setIsLoading(false);
    }
  };

  // Logout Action
  const handleLogout = () => {
    setActiveServer(null);
    setUserInfo(null);
    setCurrentScreen('login');
    localStorage.removeItem(CURRENT_SESSION_KEY);
  };

  // Play Live Channel
  const handlePlayLiveChannel = (channel: LiveChannel) => {
    if (!activeServer) return;
    const url = buildStreamUrl(
      activeServer.serverUrl,
      activeServer.username,
      activeServer.password,
      channel.stream_id,
      'm3u8',
      'live',
      channel.direct_source
    );

    setActivePlayer({
      title: channel.name,
      subtitle: channel.current_program || 'Transmissão Ao Vivo',
      streamUrl: url,
      type: 'live',
      channelsList: liveChannels
    });
  };

  // Play Movie
  const handlePlayMovie = (movie: MovieStream) => {
    if (!activeServer) return;
    const url = buildStreamUrl(
      activeServer.serverUrl,
      activeServer.username,
      activeServer.password,
      movie.stream_id,
      movie.container_extension || 'mp4',
      'movie',
      movie.direct_source
    );

    setActivePlayer({
      title: movie.name,
      subtitle: `${movie.genre || 'Filme'} • ${movie.year || '2025'}`,
      streamUrl: url,
      type: 'movie'
    });
  };

  // Play Series Episode
  const handlePlayEpisode = (series: SeriesStream, episode: Episode) => {
    if (!activeServer) return;
    const url = buildStreamUrl(
      activeServer.serverUrl,
      activeServer.username,
      activeServer.password,
      episode.id,
      episode.container_extension || 'mp4',
      'series',
      episode.stream_url
    );

    setActivePlayer({
      title: `${series.name} - Temp ${episode.season} Ep ${episode.episode_num}`,
      subtitle: episode.title || `Episódio ${episode.episode_num}`,
      streamUrl: url,
      type: 'series'
    });
  };

  // Fetch Series Details callback
  const handleFetchSeriesDetails = useCallback(
    async (seriesId: number) => {
      if (!activeServer) return null;
      return await fetchSeriesInfo(
        activeServer.serverUrl,
        activeServer.username,
        activeServer.password,
        seriesId
      );
    },
    [activeServer]
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a050e] via-[#0b0204] to-[#040102] text-white font-sans antialiased selection:bg-red-600 selection:text-white">
      {/* Navigation Top Header */}
      <Header
        currentScreen={currentScreen}
        setCurrentScreen={(scr) => {
          setSearchQuery('');
          setCurrentScreen(scr);
        }}
        activeServer={activeServer}
        userInfo={userInfo}
        onLogout={handleLogout}
        onRefreshData={() => {
          if (activeServer) {
            loadServerData(activeServer.serverUrl, activeServer.username, activeServer.password);
          }
        }}
        isRefreshing={isRefreshing}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Screen Routing */}
      {currentScreen === 'login' && (
        <LoginScreen
          onLogin={handleLogin}
          onLoginM3u={handleLoginM3u}
          savedServers={savedServers}
          onSaveServer={handleSaveServer}
          onDeleteServer={handleDeleteServer}
          isLoading={isLoading}
          errorMessage={errorMessage}
        />
      )}

      {currentScreen === 'home' && (
        <HomeScreen
          onNavigate={(scr) => {
            setSearchQuery('');
            setCurrentScreen(scr);
          }}
          userInfo={userInfo}
          activeServer={activeServer}
          counts={{
            channelsCount: liveChannels.length,
            moviesCount: vodMovies.length,
            seriesCount: seriesList.length,
            matchesCount: matches.length
          }}
          movies={vodMovies}
          series={seriesList}
          onRefreshData={() => {
            if (activeServer) {
              loadServerData(activeServer.serverUrl, activeServer.username, activeServer.password);
            }
          }}
        />
      )}

      {currentScreen === 'sports' && (
        <SportsSection
          standings={standings}
          matches={matches}
          liveChannels={liveChannels}
          onPlayChannel={handlePlayLiveChannel}
          onBack={() => setCurrentScreen('home')}
          isRefreshingStandings={isRefreshingStandings}
          onRefreshStandings={fetchStandingsLive}
        />
      )}

      {currentScreen === 'live' && (
        <LiveTvSection
          categories={liveCategories}
          channels={liveChannels}
          onPlayChannel={handlePlayLiveChannel}
          searchQuery={searchQuery}
          activeServer={activeServer}
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'movies' && (
        <MoviesSection
          categories={vodCategories}
          movies={vodMovies}
          onPlayMovie={handlePlayMovie}
          searchQuery={searchQuery}
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'series' && (
        <SeriesSection
          categories={seriesCategories}
          seriesList={seriesList}
          onFetchSeriesDetails={handleFetchSeriesDetails}
          onPlayEpisode={handlePlayEpisode}
          searchQuery={searchQuery}
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {/* Embedded Video Player Modal */}
      {activePlayer && (
        <VideoPlayerModal
          title={activePlayer.title}
          subtitle={activePlayer.subtitle}
          streamUrl={activePlayer.streamUrl}
          type={activePlayer.type}
          channelsList={activePlayer.channelsList}
          onClose={() => setActivePlayer(null)}
          onSwitchChannel={handlePlayLiveChannel}
        />
      )}

      {/* Download Progress Screen Overlay */}
      <DownloadProgressOverlay
        isOpen={isDownloading}
        progress={downloadProgress}
        statusMessage={downloadStatusMessage}
        serverName={activeServer?.name}
        onCancel={() => {
          setIsDownloading(false);
          setIsLoading(false);
        }}
      />
    </div>
  );
}
