import React, { useState, useEffect } from 'react';
import {
  Tv,
  LogOut,
  Maximize,
  Minimize,
  RefreshCw,
  Search,
  Radio,
  Bell,
  User,
  Settings,
  Grid,
  Sparkles,
  Wifi,
  X,
  Sliders,
  ShieldCheck,
  ArrowLeft,
  Smartphone,
  Monitor,
  Compass
} from 'lucide-react';
import { ActiveScreen, XtreamServerCredentials, UserInfo } from '../types';
import { useDeviceDetection, requestFullscreenWithFit } from '../utils/deviceDetector';

interface HeaderProps {
  currentScreen: ActiveScreen;
  setCurrentScreen: (screen: ActiveScreen) => void;
  activeServer: XtreamServerCredentials | null;
  userInfo?: UserInfo | null;
  onLogout: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  setCurrentScreen,
  activeServer,
  userInfo,
  onLogout,
  onRefreshData,
  isRefreshing,
  searchQuery,
  setSearchQuery
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const { deviceType, setDeviceType, orientation, isLandscape } = useDeviceDetection();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await requestFullscreenWithFit();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => console.error(err));
        setIsFullscreen(false);
      }
    }
  };

  const cycleDeviceMode = () => {
    if (deviceType === 'tv') setDeviceType('mobile');
    else if (deviceType === 'mobile') setDeviceType('desktop');
    else setDeviceType('tv');
  };

  if (currentScreen === 'login' || currentScreen === 'live') return null;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0b0204]/90 backdrop-blur-md border-b border-red-950/50 px-3 sm:px-4 lg:px-8 py-2 select-none shadow-xl w-full">
        <div className="flex flex-wrap items-center justify-between gap-2.5 max-w-7xl mx-auto">
          {/* LEFT: BRAND LOGO, CLOCK & DEVICE DETECTOR PILL */}
          <div className="flex items-center gap-2 sm:gap-4">
            {currentScreen !== 'home' && (
              <button
                onClick={() => setCurrentScreen('home')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#120508] hover:bg-red-950 text-rose-400 hover:text-rose-300 border border-red-900/80 hover:border-red-500 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 group"
                title="Voltar para a Tela Inicial"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            )}

            <div
              onClick={() => setCurrentScreen('home')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-neutral-800 shadow-[0_0_15px_rgba(239,68,68,0.2)] group-hover:scale-105 transition-all">
                  <img
                    src="/app_logo.jpg"
                    alt="Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-white font-sans">
                    IPTV <span className="text-rose-500">SMARTERS</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-red-950/80 px-1.5 py-0.2 border border-red-800/80 rounded">
                    PRO
                  </span>
                </div>
              </div>
            </div>

            {/* DEVICE DETECTION & MODE PILL */}
            <button
              onClick={cycleDeviceMode}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#120508] hover:bg-red-950/80 border border-red-900/80 hover:border-red-600 rounded-xl text-[11px] font-bold text-rose-300 transition-all cursor-pointer shadow-sm"
              title="Clique para alternar o modo de interface (TV, Celular, Desktop)"
            >
              {deviceType === 'tv' && <Tv className="w-3.5 h-3.5 text-rose-400" />}
              {deviceType === 'mobile' && <Smartphone className="w-3.5 h-3.5 text-rose-400" />}
              {deviceType === 'desktop' && <Monitor className="w-3.5 h-3.5 text-rose-400" />}
              <span className="capitalize">{deviceType === 'tv' ? 'Smart TV' : deviceType === 'mobile' ? 'Celular' : 'Desktop'}</span>
              <span className="text-[9px] text-gray-400 font-mono uppercase bg-red-950 px-1 rounded">
                {orientation}
              </span>
            </button>

            {/* LIVE CLOCK */}
            <div className="text-xs sm:text-sm font-bold text-gray-300 font-mono tracking-wider bg-[#120508] px-2.5 py-1 rounded-xl border border-red-900/60 hidden sm:block">
              {currentTime || '04:06 PM'}
            </div>
          </div>

          {/* CENTER: MASTER SEARCH */}
          <div className="flex-1 max-w-xs sm:max-w-md mx-1 sm:mx-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar Canais, Filmes, Séries..."
                className="w-full bg-[#0f0508] border border-red-900/60 focus:border-red-500 text-xs sm:text-sm text-white placeholder-gray-400 rounded-2xl pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 outline-none transition-all focus:ring-1 focus:ring-red-500/50 shadow-inner"
              />
            </div>
          </div>

          {/* RIGHT: ACTION ICONS ROW */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Device Mode Quick Switch Button for Small Screens */}
            <button
              onClick={cycleDeviceMode}
              title={`Modo Atual: ${deviceType.toUpperCase()} (${orientation}). Clique para alterar.`}
              className="p-2 bg-[#120508] hover:bg-red-950 text-rose-400 hover:text-rose-300 rounded-xl border border-red-900/60 transition-all cursor-pointer md:hidden"
            >
              {deviceType === 'tv' ? <Tv className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </button>

            {/* Radio / EPG button */}
            <button
              onClick={() => setCurrentScreen('sports')}
              title="Jogos do Dia & EPG"
              className="p-2 bg-[#120508] hover:bg-red-950 text-gray-300 hover:text-rose-400 rounded-xl border border-red-900/60 transition-all cursor-pointer"
            >
              <Radio className="w-4 h-4" />
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => setShowNotificationsModal(true)}
              title="Notificações"
              className="p-2 bg-[#120508] hover:bg-red-950 text-gray-300 hover:text-rose-400 rounded-xl border border-red-900/60 transition-all cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            </button>

            {/* User Account */}
            <button
              onClick={() => setShowAccountModal(true)}
              title="Minha Conta"
              className="p-2 bg-[#120508] hover:bg-red-950 text-gray-300 hover:text-rose-400 rounded-xl border border-red-900/60 transition-all cursor-pointer"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Multi-screen */}
            <button
              onClick={() => setCurrentScreen('live')}
              title="Multi-Screen / TV"
              className="p-2 bg-[#120508] hover:bg-red-950 text-gray-300 hover:text-rose-400 rounded-xl border border-red-900/60 transition-all cursor-pointer"
            >
              <Grid className="w-4 h-4" />
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettingsModal(true)}
              title="Configurações"
              className="p-2 bg-[#120508] hover:bg-red-950 text-gray-300 hover:text-rose-400 rounded-xl border border-red-900/60 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Refresh Data */}
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              title="Atualizar Listas"
              className="p-2 bg-[#120508] hover:bg-red-950 text-gray-300 hover:text-rose-400 rounded-xl border border-red-900/60 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-rose-500' : ''}`} />
            </button>

            {/* Fullscreen Toggle with Orientation Fit */}
            <button
              onClick={toggleFullscreen}
              title="Preencher Tela / Tela Cheia"
              className="p-2 bg-[#120508] hover:bg-red-950 text-rose-400 hover:text-rose-300 rounded-xl border border-red-900/60 transition-all cursor-pointer"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Logout / Switch User */}
            <button
              onClick={onLogout}
              title="Trocar de Conta / Sair"
              className="p-2 bg-red-950/80 hover:bg-red-700 text-rose-300 hover:text-white rounded-xl border border-red-700/60 transition-all cursor-pointer ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ACCOUNT DETAILS MODAL */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0c0407] border border-red-900/80 rounded-3xl max-w-md w-full p-6 text-white shadow-[0_0_50px_rgba(225,29,72,0.25)] relative">
            <button
              onClick={() => setShowAccountModal(false)}
              className="absolute top-4 right-4 p-2 bg-[#18080d] hover:bg-red-950 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-800 flex items-center justify-center text-rose-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Informações da Conta</h3>
                <p className="text-xs text-rose-400 font-mono">Status: {userInfo?.status === 'Active' ? 'Ativo' : (userInfo?.status || 'Ativo')}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 bg-[#15070a] rounded-xl border border-red-950">
                <span className="text-gray-400">Usuário:</span>
                <span className="font-bold text-white font-mono">{userInfo?.username || activeServer?.username || 'Demo'}</span>
              </div>
              <div className="flex justify-between p-3 bg-[#15070a] rounded-xl border border-red-950">
                <span className="text-gray-400">Servidor:</span>
                <span className="font-bold text-rose-400 truncate max-w-[200px] font-mono">{activeServer?.serverUrl || 'Demostração Local'}</span>
              </div>
              <div className="flex justify-between p-3 bg-[#15070a] rounded-xl border border-red-950">
                <span className="text-gray-400">Validade da Assinatura:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {userInfo?.exp_date
                    ? new Date(parseInt(userInfo.exp_date) * 1000).toLocaleDateString()
                    : 'Ilimitada (VIP)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS MODAL */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0c0407] border border-red-900/80 rounded-3xl max-w-md w-full p-6 text-white shadow-[0_0_50px_rgba(225,29,72,0.25)] relative">
            <button
              onClick={() => setShowNotificationsModal(false)}
              className="absolute top-4 right-4 p-2 bg-[#18080d] hover:bg-red-950 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-rose-500" />
              <h3 className="font-extrabold text-base text-white">Notificações & Avisos</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-[#15070a] rounded-xl border border-red-950">
                <p className="font-bold text-rose-300">Detecção de Dispositivo Ativa</p>
                <p className="text-gray-400 text-[11px] mt-0.5">O sistema detecta automaticamente se você está utilizando uma Smart TV ou Celular e ajusta o layout da tela.</p>
              </div>
              <div className="p-3 bg-[#15070a] rounded-xl border border-red-950">
                <p className="font-bold text-rose-300">Modo Preencher Tela Disponível</p>
                <p className="text-gray-400 text-[11px] mt-0.5">No player de vídeo, utilize o botão "Preencher Tela" para adaptar a imagem em qualquer orientação (Retrato/Paisagem).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0c0407] border border-red-900/80 rounded-3xl max-w-md w-full p-6 text-white shadow-[0_0_50px_rgba(225,29,72,0.25)] relative">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 p-2 bg-[#18080d] hover:bg-red-950 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-rose-500" />
              <h3 className="font-extrabold text-base text-white">Configurações da Interface</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#15070a] rounded-xl border border-red-950 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Modo de Dispositivo</p>
                  <p className="text-[11px] text-gray-400">Atual: {deviceType.toUpperCase()}</p>
                </div>
                <button
                  onClick={cycleDeviceMode}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Alternar
                </button>
              </div>

              <div className="p-3 bg-[#15070a] rounded-xl border border-red-950 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Orientação Atual</p>
                  <p className="text-[11px] text-gray-400">{orientation.toUpperCase()} ({isLandscape ? 'Paisagem' : 'Retrato'})</p>
                </div>
                <button
                  onClick={toggleFullscreen}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-red-950 text-rose-300 rounded-xl font-bold cursor-pointer"
                >
                  Tela Cheia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
