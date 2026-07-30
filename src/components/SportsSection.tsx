import React, { useState } from 'react';
import {
  Trophy,
  Tv,
  Play,
  Calendar,
  Sparkles,
  ShieldAlert,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { BrasileiraoTeam, MatchOfDay, LiveChannel } from '../types';

interface SportsSectionProps {
  standings: BrasileiraoTeam[];
  matches: MatchOfDay[];
  liveChannels: LiveChannel[];
  onPlayChannel: (channel: LiveChannel) => void;
  onBack?: () => void;
  isRefreshingStandings?: boolean;
  onRefreshStandings?: () => void;
}

export const SportsSection: React.FC<SportsSectionProps> = ({
  standings,
  matches,
  liveChannels,
  onPlayChannel,
  onBack,
  isRefreshingStandings = false,
  onRefreshStandings
}) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'table'>('matches');

  const findChannelByMatch = (channelName: string): LiveChannel | undefined => {
    return liveChannels.find(
      (c) =>
        c.name.toLowerCase().includes(channelName.toLowerCase()) ||
        channelName.toLowerCase().includes(c.name.toLowerCase())
    );
  };

  return (
    <div className="min-h-[calc(100vh-62px)] bg-[#070b14] text-white p-4 sm:p-6 lg:p-10 select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="bg-gradient-to-r from-[#0a0f1d] via-[#10192e] to-[#0a0f1d] border border-[#1e2f50] rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,198,255,0.15)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-3 bg-[#080d1a] hover:bg-cyan-950 text-cyan-400 border border-[#182642] hover:border-cyan-500 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 font-bold text-xs"
                title="Voltar para a Tela Inicial"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            )}
            <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                Futebol Ao Vivo & Brasileirão 2025
              </h1>
              <p className="text-xs sm:text-sm text-cyan-400 mt-1 font-medium">
                Transmissões exclusivas em Premiere, SporTV, ESPN & CazéTV
              </p>
            </div>
          </div>
        </div>

        {/* Segmented Control Selector */}
        <div className="flex flex-wrap items-center gap-3 bg-[#0a0f1d] border border-[#182642] p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-300 cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'text-gray-400 hover:text-white hover:bg-[#0d162d]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Jogos do Dia</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ml-1 border ${
              activeTab === 'matches' 
                ? 'bg-emerald-900/50 border-emerald-700/50 text-emerald-300' 
                : 'bg-[#080d1a] border-[#182642] text-gray-400'
            }`}>
              {matches.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-300 cursor-pointer ${
              activeTab === 'table'
                ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'text-gray-400 hover:text-white hover:bg-[#0d162d]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Tabela do Brasileirão</span>
          </button>
        </div>

        {/* Dynamic Tab Content */}
        {activeTab === 'matches' ? (
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span>Jogos do Dia</span>
              </h2>
              <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                {matches.length} Partidas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {matches.map((m) => {
                const matchedChannel = findChannelByMatch(m.channelName);

                return (
                  <div
                    key={m.id}
                    className="bg-[#0a0f1d] border border-[#182642] hover:border-emerald-500 rounded-3xl p-5 shadow-lg transition-all duration-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-gray-400 border-b border-[#182642] pb-3 mb-4">
                      <span className="text-amber-400 font-extrabold uppercase tracking-wider">{m.championship}</span>
                      <span className="flex items-center gap-1 font-mono text-cyan-400">
                        <Clock className="w-3.5 h-3.5" />
                        {m.time}
                      </span>
                    </div>

                    {/* Teams Scoreboard */}
                    <div className="flex items-center justify-between py-2 px-2">
                      {/* Home Team */}
                      <div className="flex flex-col items-center gap-2 w-28 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#080d1a] border border-[#182642] flex items-center justify-center p-2">
                          <img
                            src={m.homeLogo || null}
                            alt={m.homeTeam}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-white line-clamp-1">{m.homeTeam}</span>
                      </div>

                      {/* VS / Status */}
                      <div className="text-center px-2">
                        <span className="px-3 py-1 bg-emerald-950 text-emerald-400 font-black text-xs border border-emerald-800 rounded-full">
                          VS
                        </span>
                      </div>

                      {/* Away Team */}
                      <div className="flex flex-col items-center gap-2 w-28 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#080d1a] border border-[#182642] flex items-center justify-center p-2">
                          <img
                            src={m.awayLogo || null}
                            alt={m.awayTeam}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-white line-clamp-1">{m.awayTeam}</span>
                      </div>
                    </div>

                    {/* Channel Footer Button */}
                    <div className="mt-5 pt-3 border-t border-[#182642] flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                        <Tv className="w-4 h-4 text-cyan-400" />
                        {m.channelName}
                      </span>

                      {matchedChannel ? (
                        <button
                          onClick={() => onPlayChannel(matchedChannel)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all flex items-center gap-1.5"
                        >
                          Assistir <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-500 font-medium">Ao Vivo no IPTV</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Tabela do Brasileirão Serie A</span>
                {isRefreshingStandings && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ml-1" title="Atualizando..." />
                )}
              </h2>
              <div className="flex items-center gap-2">
                {isRefreshingStandings ? (
                  <span className="text-xs text-emerald-400 font-mono animate-pulse">Atualizando tabela...</span>
                ) : (
                  <span className="text-[11px] text-emerald-400 font-extrabold bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-900/50 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Sincronizado em tempo real
                  </span>
                )}
                {onRefreshStandings && (
                  <button
                    onClick={onRefreshStandings}
                    disabled={isRefreshingStandings}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 disabled:opacity-50 cursor-pointer transition-colors bg-[#0a0f1d] hover:bg-[#10192e] px-3 py-1.5 rounded-xl border border-[#182642] active:scale-95 flex items-center gap-1"
                  >
                    <Sparkles className={`w-3 h-3 ${isRefreshingStandings ? 'animate-spin' : ''}`} />
                    <span>Atualizar</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-[#0a0f1d] border border-[#182642] rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#080d1a] border-b border-[#182642] text-gray-400 font-bold uppercase text-[11px] tracking-wider">
                      <th className="py-4 px-4 text-center w-10">Pos</th>
                      <th className="py-4 px-3 text-left">Time</th>
                      <th className="py-4 px-2 text-center w-12">PJ</th>
                      <th className="py-4 px-2 text-center w-12">V</th>
                      <th className="py-4 px-2 text-center w-12">E</th>
                      <th className="py-4 px-2 text-center w-12">D</th>
                      <th className="py-4 px-2 text-center w-12">GP</th>
                      <th className="py-4 px-2 text-center w-12">GA</th>
                      <th className="py-4 px-2 text-center w-12">DG</th>
                      <th className="py-4 px-3 text-center w-16 bg-[#0c142b] text-amber-400 font-extrabold">PTS</th>
                      <th className="py-4 px-4 text-center w-44">Últimos 5</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#182642]">
                    {standings.map((team) => {
                      // Determine if form is represented in English or Portuguese notation
                      const isEnglishForm = team.form.includes('W') || team.form.includes('L');
                      
                      const getFormStatus = (char: string) => {
                        const norm = char.toUpperCase().trim();
                        if (norm === 'W' || norm === 'V') return 'win';
                        if (norm === 'L' || (norm === 'D' && !isEnglishForm)) return 'loss';
                        return 'draw';
                      };

                      return (
                        <tr
                          key={team.position}
                          className="hover:bg-[#10192e] transition-colors font-semibold text-gray-200"
                        >
                          <td className="py-3.5 px-4 text-center font-bold text-gray-400">
                            <span
                              className={`inline-block w-6 h-6 rounded-full text-center leading-6 text-xs font-black ${
                                team.position <= 4
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                                  : team.position <= 6
                                  ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/40'
                                  : team.position >= 17
                                  ? 'bg-rose-950/80 text-rose-400 border border-rose-800/40'
                                  : 'text-gray-400'
                              }`}
                            >
                              {team.position}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-white/5 p-1 border border-[#182642] flex items-center justify-center shrink-0">
                                <img
                                  src={team.logo || "https://s.sde.globo.com/media/organizations/default.svg"}
                                  alt={team.name}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              </div>
                              <span className="font-extrabold text-white whitespace-nowrap">{team.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-2 text-center text-gray-300 font-medium">{team.played}</td>
                          <td className="py-3.5 px-2 text-center text-gray-300 font-medium">{team.won}</td>
                          <td className="py-3.5 px-2 text-center text-gray-300 font-medium">{team.drawn}</td>
                          <td className="py-3.5 px-2 text-center text-gray-300 font-medium">{team.lost}</td>
                          <td className="py-3.5 px-2 text-center text-gray-400 font-normal">{team.goalsFor}</td>
                          <td className="py-3.5 px-2 text-center text-gray-400 font-normal">{team.goalsAgainst}</td>
                          <td className="py-3.5 px-2 text-center text-gray-400 font-mono font-normal">
                            {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                          </td>
                          <td className="py-3.5 px-3 text-center font-black text-[13px] text-white bg-[#0c142b]/80 border-x border-[#182642]/40">
                            {team.points}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {team.form.slice(0, 5).map((char, idx) => {
                                const status = getFormStatus(char);
                                if (status === 'win') {
                                  return (
                                    <div
                                      key={idx}
                                      className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black shadow-sm shrink-0"
                                      title="Vitória"
                                    >
                                      ✓
                                    </div>
                                  );
                                } else if (status === 'loss') {
                                  return (
                                    <div
                                      key={idx}
                                      className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-black shadow-sm shrink-0"
                                      title="Derrota"
                                    >
                                      ✕
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div
                                      key={idx}
                                      className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[9px] font-bold shadow-sm shrink-0"
                                      title="Empate"
                                    >
                                      —
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
