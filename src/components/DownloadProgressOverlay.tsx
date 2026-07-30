import React from 'react';
import {
  Tv,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  Database,
  Film,
  Clapperboard,
  ListVideo,
  ShieldCheck
} from 'lucide-react';

interface DownloadProgressOverlayProps {
  isOpen: boolean;
  progress: number;
  statusMessage: string;
  serverName?: string;
  onCancel?: () => void;
}

export const DownloadProgressOverlay: React.FC<DownloadProgressOverlayProps> = ({
  isOpen,
  progress,
  statusMessage,
  serverName,
  onCancel
}) => {
  if (!isOpen) return null;

  const steps = [
    { label: 'Autenticação no Servidor', minProgress: 15, icon: ShieldCheck },
    { label: 'Categorias de Canais', minProgress: 30, icon: ListVideo },
    { label: 'Lista de Canais de TV', minProgress: 55, icon: Tv },
    { label: 'Catálogo de Filmes', minProgress: 75, icon: Film },
    { label: 'Séries e Episódios', minProgress: 95, icon: Clapperboard }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in select-none">
      {/* Background Red/Rose Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-red-600/20 via-rose-600/20 to-transparent rounded-full blur-[160px] pointer-events-none" />

      {/* Main Progress Card */}
      <div className="w-full max-w-lg bg-[#0e0508]/95 border-2 border-red-600/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(225,29,72,0.4)] relative z-10 flex flex-col items-center text-center">
        {/* App Logo & Header */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-950 p-0.5 shadow-[0_0_35px_rgba(225,29,72,0.6)] flex items-center justify-center">
            <div className="w-full h-full bg-[#080204] rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <Tv className="w-10 h-10 text-rose-500 animate-pulse" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-1.5 rounded-full shadow-lg border border-red-400">
            {progress >= 100 ? (
              <CheckCircle2 className="w-4 h-4 text-white" />
            ) : (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            )}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase mb-1">
          IPTV <span className="text-rose-500">SMARTERS</span>
        </h2>
        <p className="text-xs text-gray-400 font-medium mb-6">
          {serverName ? `Baixando dados do servidor: ${serverName}` : 'Conectando ao servidor Xtream Codes'}
        </p>

        {/* Big Percentage Display */}
        <div className="my-2 flex flex-col items-center">
          <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-200 to-red-400 tracking-tight drop-shadow-[0_0_25px_rgba(225,29,72,0.5)]">
            {Math.min(100, Math.max(0, Math.round(progress)))}%
          </span>
          <span className="text-xs font-bold text-rose-400 mt-1 uppercase tracking-widest flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 animate-bounce" />
            DOWNLOAD EM ANDAMENTO
          </span>
        </div>

        {/* Animated Progress Bar Container */}
        <div className="w-full bg-[#050203] rounded-full p-1 border border-red-900/60 my-6 shadow-inner relative overflow-hidden">
          {/* Animated Background Shimmer */}
          <div
            className="h-4 sm:h-5 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400 shadow-[0_0_20px_rgba(225,29,72,0.8)] transition-all duration-300 ease-out relative"
            style={{ width: `${Math.min(100, Math.max(2, progress))}%` }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Status Message Text */}
        <div className="min-h-[2.5rem] flex items-center justify-center px-4 py-2 bg-black/50 border border-red-950 rounded-xl w-full mb-6 text-xs sm:text-sm font-semibold text-gray-200">
          <p className="truncate text-rose-300">{statusMessage}</p>
        </div>

        {/* Downloading Steps Checklist */}
        <div className="w-full space-y-2 mb-6 text-left">
          {steps.map((step, idx) => {
            const isCompleted = progress >= step.minProgress;
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-red-950/40 border-red-800/80 text-white'
                    : 'bg-black/30 border-red-950/40 text-gray-500 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isCompleted ? 'text-rose-400' : 'text-gray-600'}`} />
                  <span>{step.label}</span>
                </div>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-[10px] text-gray-600 font-mono">PENDENTE</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Cancel Button */}
        {onCancel && progress < 100 && (
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-rose-300 text-xs font-bold border border-red-800 transition-all cursor-pointer flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Cancelar Download
          </button>
        )}
      </div>
    </div>
  );
};
