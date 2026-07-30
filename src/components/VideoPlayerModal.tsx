import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Tv,
  List,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Scaling,
  Smartphone,
  Compass
} from 'lucide-react';
import { LiveChannel, MovieStream, Episode, SeriesStream } from '../types';
import { requestFullscreenWithFit } from '../utils/deviceDetector';

interface VideoPlayerModalProps {
  title: string;
  subtitle?: string;
  streamUrl: string;
  type: 'live' | 'movie' | 'series';
  onClose: () => void;
  channelsList?: LiveChannel[];
  onSwitchChannel?: (channel: LiveChannel) => void;
}

export type VideoFitMode = 'contain' | 'cover' | 'fill';

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  title,
  subtitle,
  streamUrl,
  type,
  onClose,
  channelsList = [],
  onSwitchChannel
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChannelDrawer, setShowChannelDrawer] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeUrl, setActiveUrl] = useState(streamUrl);
  const [videoFit, setVideoFit] = useState<VideoFitMode>('contain');

  useEffect(() => {
    setActiveUrl(streamUrl);
    setHasError(false);
  }, [streamUrl]);

  // Keydown event listener for Smart TV Remote & Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Back' || e.key === 'BrowserBack') {
        e.preventDefault();
        onClose();
      } else if (e.key === ' ' || e.key === 'MediaPlayPause') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        if (type !== 'live' && videoRef.current) {
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
        }
      } else if (e.key === 'ArrowRight') {
        if (type !== 'live' && videoRef.current) {
          videoRef.current.currentTime = Math.min(
            videoRef.current.duration || 0,
            videoRef.current.currentTime + 10
          );
        }
      } else if (e.key === 'ArrowUp') {
        if (videoRef.current) {
          const newVol = Math.min(1, videoRef.current.volume + 0.1);
          videoRef.current.volume = newVol;
          setVolume(newVol);
        }
      } else if (e.key === 'ArrowDown') {
        if (videoRef.current) {
          const newVol = Math.max(0, videoRef.current.volume - 0.1);
          videoRef.current.volume = newVol;
          setVolume(newVol);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [type, onClose, isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    const startPlayback = () => {
      if (!video) return;
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(e => {
        console.warn('Autoplay unmuted blocked, trying muted autoplay:', e);
        video.muted = true;
        setIsMuted(true);
        video.play().then(() => setIsPlaying(true)).catch(err => console.warn('Autoplay completely blocked:', err));
      });
    };

    const loadStream = () => {
      setHasError(false);

      const isHlsStream = activeUrl.toLowerCase().includes('m3u8') || activeUrl.toLowerCase().includes('.ts') || type === 'live' || activeUrl.includes('/stream?url=');

      if (Hls.isSupported() && isHlsStream) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          startFragPrefetch: true,
          testBandwidth: false,
          maxBufferLength: 8,
          maxMaxBufferLength: 16,
          maxBufferSize: 30 * 1024 * 1024,
          maxBufferHole: 0.5,
          liveSyncDurationCount: 2,
          liveMaxLatencyDurationCount: 4,
          manifestLoadingTimeOut: 8000,
          manifestLoadingMaxRetry: 4,
          fragLoadingTimeOut: 8000,
          fragLoadingMaxRetry: 4,
          backBufferLength: 30
        });

        hls.loadSource(activeUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          startPlayback();
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn('HLS Network Error, retrying...');
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('HLS Media Error, recovering...');
                hls?.recoverMediaError();
                break;
              default:
                console.error('Fatal HLS Error, trying native playback fallback:', data);
                if (video) {
                  video.src = activeUrl;
                  startPlayback();
                } else {
                  setHasError(true);
                  setErrorMessage('O servidor de transmissão não respondeu no momento.');
                }
                hls?.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS for Safari
        video.src = activeUrl;
        startPlayback();
      } else {
        // Standard video file (MP4/TS/WebM)
        video.src = activeUrl;
        startPlayback();
      }
    };

    loadStream();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [activeUrl, type]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);
    if (video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await requestFullscreenWithFit(containerRef.current);
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.error(err));
      }
      setIsFullscreen(false);
    }
  };

  const cycleVideoFit = () => {
    if (videoFit === 'contain') setVideoFit('cover');
    else if (videoFit === 'cover') setVideoFit('fill');
    else setVideoFit('contain');
  };

  const getFitLabel = () => {
    if (videoFit === 'cover') return 'Preencher Tela';
    if (videoFit === 'fill') return 'Esticar Vídeo';
    return 'Proporcional (Original)';
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden h-full w-full"
    >
      {/* Video Element with Dynamic Screen Filling */}
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        className={`w-full h-full cursor-pointer transition-all duration-200 ${
          videoFit === 'cover'
            ? 'object-cover'
            : videoFit === 'fill'
            ? 'object-fill'
            : 'object-contain'
        }`}
        onClick={togglePlay}
        playsInline
        preload="auto"
      />

      {/* Error Overlay Fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
          <h3 className="text-2xl font-black text-white">Falha na Transmissão</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-md">
            {errorMessage || 'Não foi possível carregar a transmissão do servidor IPTV.'}
          </p>
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => {
                setHasError(false);
                if (videoRef.current) videoRef.current.load();
              }}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Tentar Novamente
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-gray-300 font-bold rounded-2xl border border-neutral-800"
            >
              Sair do Player
            </button>
          </div>
        </div>
      )}

      {/* Top Bar Overlay */}
      <div className="absolute top-0 left-0 right-0 p-3 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-500 shadow-md">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-red-400 font-medium truncate max-w-xs sm:max-w-md">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Video Fit / Aspect Ratio Toggle Button */}
          <button
            onClick={cycleVideoFit}
            className="px-3 py-2 bg-neutral-900/90 hover:bg-red-950 text-white rounded-xl border border-neutral-800 hover:border-red-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
            title={`Ajuste de Tela: ${getFitLabel()}`}
          >
            <Scaling className="w-4 h-4 text-red-500" />
            <span className="hidden sm:inline">{getFitLabel()}</span>
            <span className="sm:hidden uppercase">{videoFit}</span>
          </button>

          {/* Drawer Toggle for Live Channels */}
          {type === 'live' && channelsList.length > 0 && (
            <button
              onClick={() => setShowChannelDrawer(!showChannelDrawer)}
              className="px-3 py-2 bg-neutral-900/80 hover:bg-red-950 text-white rounded-xl border border-neutral-800 hover:border-red-800 text-xs font-bold transition-all flex items-center gap-2"
            >
              <List className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">Lista de Canais</span>
            </button>
          )}

          {/* Close Player */}
          <button
            onClick={onClose}
            className="p-2 bg-neutral-900/80 hover:bg-red-950 text-gray-300 hover:text-white rounded-xl border border-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Side Channel Switcher Drawer for Live TV */}
      {showChannelDrawer && type === 'live' && (
        <div className="absolute top-20 bottom-24 right-4 w-72 bg-neutral-950/95 border border-red-900/50 rounded-3xl p-4 z-20 backdrop-blur-xl flex flex-col shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-2">
            <h3 className="font-extrabold text-sm text-white">Alternar Canal</h3>
            <button
              onClick={() => setShowChannelDrawer(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {channelsList.map((ch) => (
              <button
                key={ch.stream_id}
                onClick={() => {
                  if (onSwitchChannel) onSwitchChannel(ch);
                  setShowChannelDrawer(false);
                }}
                className="w-full p-2.5 bg-neutral-900/80 hover:bg-gradient-to-r hover:from-red-950 hover:to-neutral-900 border border-neutral-800 hover:border-red-800 rounded-xl text-left flex items-center gap-2.5 transition-all text-xs font-bold text-white group"
              >
                <div className="w-8 h-8 rounded-lg bg-black p-1 border border-neutral-800 shrink-0 flex items-center justify-center">
                  {ch.stream_icon && ch.stream_icon.trim() ? (
                    <img
                      src={ch.stream_icon || null}
                      alt={ch.name}
                      className="w-full h-full object-contain"
                      onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                    />
                  ) : (
                    <Tv className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <span className="truncate group-hover:text-red-400 transition-colors">
                  {ch.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Custom Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 bg-gradient-to-t from-black via-black/70 to-transparent z-10 flex flex-col gap-2.5">
        {/* Scrubber for VOD */}
        {type !== 'live' && duration > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-400">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onChange={handleSeek}
              className="flex-1 accent-red-600 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-gray-400">{formatTime(duration)}</span>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl shadow-[0_0_15px_rgba(220,38,38,0.6)] transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 bg-neutral-900/80 px-3 py-2 rounded-2xl border border-neutral-800">
              <button onClick={toggleMute} className="text-gray-300 hover:text-white">
                {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 accent-red-600 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {type === 'live' && (
              <span className="px-2.5 py-1 bg-red-600 text-white text-[11px] sm:text-xs font-black rounded-full animate-pulse flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white rounded-full" /> AO VIVO
              </span>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-3 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-2xl border border-neutral-800 transition-colors"
              title="Tela Cheia"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

