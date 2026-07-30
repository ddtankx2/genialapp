import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Eye,
  EyeOff,
  Server,
  Trash2,
  AlertCircle,
  Sparkles,
  LogIn,
  FileText,
  Link as LinkIcon,
  Upload,
  ListFilter
} from 'lucide-react';
import { XtreamServerCredentials } from '../types';

interface LoginScreenProps {
  onLogin: (serverUrl: string, username: string, password: string, serverName?: string) => Promise<void>;
  onLoginM3u: (playlistName: string, m3uUrl?: string, m3uContent?: string) => Promise<void>;
  savedServers: XtreamServerCredentials[];
  onSaveServer: (server: Omit<XtreamServerCredentials, 'id'>) => void;
  onDeleteServer: (id: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onLoginM3u,
  savedServers,
  onSaveServer,
  onDeleteServer,
  isLoading,
  errorMessage
}) => {
  const [loginType, setLoginType] = useState<'xtream' | 'm3u'>('xtream');

  // Xtream fields
  const [serverName, setServerName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // M3U fields
  const [m3uName, setM3uName] = useState('');
  const [m3uSourceType, setM3uSourceType] = useState<'url' | 'file' | 'paste'>('url');
  const [m3uUrl, setM3uUrl] = useState('');
  const [m3uFileName, setM3uFileName] = useState('');
  const [m3uFileContent, setM3uFileContent] = useState('');

  const [showSavedModal, setShowSavedModal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (savedServers.length > 0 && !serverUrl) {
      const last = savedServers[0];
      setServerUrl(last.serverUrl);
      setUsername(last.username);
      setPassword(last.password);
      setServerName(last.name);
    }
  }, [savedServers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (loginType === 'xtream') {
      if (!serverUrl) {
        setLocalError('Por favor, informe a URL do Servidor (ex: http://url.com:8080).');
        return;
      }
      if (!username) {
        setLocalError('Por favor, informe o Usuário.');
        return;
      }

      try {
        await onLogin(serverUrl, username, password, serverName || 'Qualquer Nome');
      } catch (err: any) {
        setLocalError(err?.message || 'Falha ao conectar no servidor IPTV.');
      }
    } else {
      // M3U mode
      if (m3uSourceType === 'url') {
        const trimmedUrl = m3uUrl.trim();
        if (!trimmedUrl) {
          setLocalError('Por favor, informe a URL da lista M3U.');
          return;
        }

        // If the user pasted raw M3U playlist text directly into the URL field
        if (trimmedUrl.startsWith('#EXTM3U') || trimmedUrl.toUpperCase().includes('#EXTINF')) {
          try {
            await onLoginM3u(m3uName || 'Lista M3U Colada', undefined, trimmedUrl);
          } catch (err: any) {
            setLocalError(err?.message || 'Falha ao processar texto M3U.');
          }
          return;
        }

        try {
          await onLoginM3u(m3uName || 'Lista M3U', trimmedUrl, undefined);
        } catch (err: any) {
          setLocalError(err?.message || 'Falha ao carregar lista M3U.');
        }
      } else {
        if (!m3uFileContent.trim()) {
          setLocalError('Por favor, selecione um arquivo M3U válido ou cole o conteúdo.');
          return;
        }
        try {
          await onLoginM3u(m3uName || m3uFileName || 'Lista M3U Arquivo', undefined, m3uFileContent.trim());
        } catch (err: any) {
          setLocalError(err?.message || 'Falha ao processar arquivo M3U.');
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setM3uFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setM3uFileContent(content);
      } else {
        setLocalError('Não foi possível ler o arquivo selecionado.');
      }
    };
    reader.onerror = () => {
      setLocalError('Erro ao ler arquivo .m3u.');
    };
    reader.readAsText(file);
  };

  const handleSelectSaved = (srv: XtreamServerCredentials) => {
    setLoginType('xtream');
    setServerUrl(srv.serverUrl);
    setUsername(srv.username);
    setPassword(srv.password);
    setServerName(srv.name);
    setShowSavedModal(false);
    onLogin(srv.serverUrl, srv.username, srv.password, srv.name);
  };

  const handleQuickDemo = () => {
    setLoginType('xtream');
    const demoUrl = 'http://demo.iptvsmarters.com:8080';
    setServerUrl(demoUrl);
    setUsername('demo');
    setPassword('demo');
    setServerName('IPTV Smarters Demo');
    onLogin(demoUrl, 'demo', 'demo', 'IPTV Smarters Demo');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#b81d24] via-[#2b0204] via-60% to-black text-white flex items-center justify-center p-4 sm:p-8 relative overflow-hidden select-none">
      {/* Soft Ambient Radial Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(255,0,0,0.15),transparent_50%)] pointer-events-none" />

      {/* Main Center Card Grid matching IPTV Smarters Pro */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 my-auto">
        
        {/* LEFT COLUMN: Logo Branding & Action Buttons */}
        <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-8">
          
          {/* Custom IPTV Smarters Pro Logo */}
          <div className="flex flex-col items-center md:items-start group cursor-pointer">
            <div className="relative mb-3 flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.3)] transition-transform hover:scale-105 duration-300">
                <img
                  src="/app_logo.jpg"
                  alt="Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans leading-none">
                  IPTV <span className="text-red-500">SMARTERS</span>
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-red-400 mt-1">
                  PRO VERSION
                </span>
              </div>
            </div>
          </div>

          {/* Left Action Buttons matching Screenshot: CONNECT VPN & LIST USERS */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 w-full pt-4">
            {/* CONNECT VPN */}
            <button
              type="button"
              onClick={() => alert('Status VPN: Conexão protegida e otimizada para streaming IPTV.')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-black hover:from-red-500 hover:to-neutral-900 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-red-500/30 flex items-center gap-2 border border-red-500/30 transition-all cursor-pointer active:scale-95"
            >
              <Shield className="w-4 h-4 fill-white/20 text-white" />
              <span>CONECTAR VPN</span>
            </button>

            {/* LIST USERS */}
            <button
              type="button"
              onClick={() => setShowSavedModal(true)}
              className="px-5 py-3 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-extrabold text-xs uppercase tracking-wider shadow-xl hover:shadow-2xl flex items-center gap-2 transition-all cursor-pointer active:scale-95 border border-white/80"
            >
              <Users className="w-4 h-4 text-red-600" />
              <span>LISTA DE USUÁRIOS</span>
              {savedServers.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-600 text-white rounded-md font-bold">
                  {savedServers.length}
                </span>
              )}
            </button>
          </div>

          {/* Demo button shortcut */}
          <button
            type="button"
            onClick={handleQuickDemo}
            className="text-xs text-white/80 hover:text-white underline font-semibold flex items-center gap-1 mt-2 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Testar com Servidor Demo Grátis</span>
          </button>
        </div>

        {/* RIGHT COLUMN: LOGIN FORM WITH TABS */}
        <div className="md:col-span-7 bg-black/45 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-red-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-fade-in">
          
          {/* TAB MODE SELECTOR */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/40 rounded-2xl mb-6 border border-red-500/10">
            <button
              type="button"
              onClick={() => {
                setLoginType('xtream');
                setLocalError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                loginType === 'xtream'
                  ? 'bg-gradient-to-r from-red-600 to-black text-white shadow-md border border-red-500/40 scale-[1.02]'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>API Xtream</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginType('m3u');
                setLocalError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                loginType === 'm3u'
                  ? 'bg-gradient-to-r from-red-600 to-black text-white shadow-md border border-red-500/40 scale-[1.02]'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <ListFilter className="w-4 h-4 text-red-500" />
              <span>Lista M3U</span>
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-wider text-center uppercase mb-6 drop-shadow-sm flex items-center justify-center gap-2">
            {loginType === 'xtream' ? 'INFORME SEUS DADOS DE ACESSO' : 'ENTRAR COM LISTA M3U / M3U8'}
          </h2>

          {/* Error Message Box */}
          {(errorMessage || localError) && (
            <div className="mb-5 p-3.5 bg-red-600/90 border border-red-400/50 rounded-xl flex items-center gap-3 text-white text-xs font-semibold shadow-md animate-fade-in">
              <AlertCircle className="w-5 h-5 text-white shrink-0" />
              <p className="flex-1">{errorMessage || localError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginType === 'xtream' ? (
              <>
                {/* Any Name */}
                <div>
                  <input
                    type="text"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="Nome do Servidor (ex: Meu IPTV)"
                    className="w-full bg-black/40 hover:bg-black/50 focus:bg-black/60 border border-red-900/40 focus:border-red-500 text-white placeholder-white/50 text-sm font-medium rounded-xl px-4 py-3.5 outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Username */}
                <div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Usuário"
                    required
                    className="w-full bg-black/40 hover:bg-black/50 focus:bg-black/60 border border-red-900/40 focus:border-red-500 text-white placeholder-white/50 text-sm font-medium rounded-xl px-4 py-3.5 outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Password with Eye Toggle Button */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Senha"
                      required
                      className="w-full bg-black/40 hover:bg-black/50 focus:bg-black/60 border border-red-900/40 focus:border-red-500 text-white placeholder-white/50 text-sm font-medium rounded-xl px-4 py-3.5 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-4 bg-black/40 hover:bg-black/50 border border-red-900/40 rounded-xl flex items-center justify-center text-white/90 hover:text-white transition-all cursor-pointer"
                    title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-red-400" /> : <Eye className="w-5 h-5 text-red-400" />}
                  </button>
                </div>

                {/* Server URL */}
                <div>
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="http://url-do-servidor.com:port"
                    required
                    className="w-full bg-black/40 hover:bg-black/50 focus:bg-black/60 border border-red-900/40 focus:border-red-500 text-white placeholder-white/40 text-xs font-mono rounded-xl px-4 py-3.5 outline-none transition-all shadow-inner"
                  />
                </div>
              </>
            ) : (
              <>
                {/* M3U Playlist Name */}
                <div>
                  <input
                    type="text"
                    value={m3uName}
                    onChange={(e) => setM3uName(e.target.value)}
                    placeholder="Nome da Lista (ex: Minha Lista IPTV)"
                    className="w-full bg-black/40 hover:bg-black/50 focus:bg-black/60 border border-red-900/40 focus:border-red-500 text-white placeholder-white/50 text-sm font-medium rounded-xl px-4 py-3.5 outline-none transition-all shadow-inner"
                  />
                </div>

                {/* M3U Sub-Type Selector: URL vs File/Paste */}
                <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-red-900/30 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setM3uSourceType('url')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      m3uSourceType === 'url' ? 'bg-red-600 text-white shadow' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>URL da Lista</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setM3uSourceType('file')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      m3uSourceType === 'file' ? 'bg-red-600 text-white shadow' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Arquivo .M3U</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setM3uSourceType('paste')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      m3uSourceType === 'paste' ? 'bg-red-600 text-white shadow' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Colar Texto</span>
                  </button>
                </div>

                {/* Sub-Type Input Fields */}
                {m3uSourceType === 'url' && (
                  <div>
                    <input
                      type="text"
                      value={m3uUrl}
                      onChange={(e) => setM3uUrl(e.target.value)}
                      placeholder="http://servidor.com/get.php?username=...&type=m3u"
                      className="w-full bg-black/40 hover:bg-black/50 focus:bg-black/60 border border-red-900/40 focus:border-red-500 text-white placeholder-white/40 text-xs font-mono rounded-xl px-4 py-3.5 outline-none transition-all shadow-inner"
                    />
                    <p className="text-[11px] text-white/70 mt-1.5 px-1">
                      Suporta URLs M3U / M3U8 diretas de qualquer servidor IPTV.
                    </p>
                  </div>
                )}

                {m3uSourceType === 'file' && (
                  <div>
                    <label className="flex flex-col items-center justify-center p-5 bg-black/40 hover:bg-black/50 border-2 border-dashed border-red-900/40 hover:border-red-500 rounded-2xl cursor-pointer transition-all">
                      <Upload className="w-8 h-8 text-red-400 mb-2 animate-bounce" />
                      <span className="text-xs font-bold text-white text-center">
                        {m3uFileName ? `Arquivo selecionado: ${m3uFileName}` : 'Clique para selecionar arquivo .m3u / .m3u8'}
                      </span>
                      <span className="text-[10px] text-white/60 mt-1">
                        Formatos suportados: .m3u, .m3u8, .txt
                      </span>
                      <input
                        type="file"
                        accept=".m3u,.m3u8,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {m3uSourceType === 'paste' && (
                  <div>
                    <textarea
                      rows={4}
                      value={m3uFileContent}
                      onChange={(e) => setM3uFileContent(e.target.value)}
                      placeholder="#EXTM3U&#10;#EXTINF:-1 tvg-logo=&quot;http://...&quot; group-title=&quot;CANAIS&quot;, Canal Exemplo&#10;http://stream.m3u8"
                      className="w-full bg-black/40 hover:bg-black/50 focus:bg-black/60 border border-red-900/40 focus:border-red-500 text-white placeholder-white/40 text-xs font-mono rounded-xl p-3 outline-none transition-all shadow-inner resize-none"
                    />
                  </div>
                )}
              </>
            )}

            {/* Action Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-red-600 via-red-700 to-black hover:from-red-500 hover:to-neutral-900 text-white font-black text-base uppercase tracking-wider rounded-xl shadow-2xl hover:shadow-[0_10px_30px_rgba(239,68,68,0.3)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-500/50"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>PROCESSANDO...</span>
                  </>
                ) : (
                  <span>{loginType === 'xtream' ? 'ADICIONAR USUÁRIO' : 'CARREGAR LISTA M3U'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL: SAVED USERS / LIST USERS */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-gradient-to-b from-[#1a0204] to-black border border-red-500/30 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-red-950 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                <h3 className="font-extrabold text-lg text-white">Servidores / Usuários Salvos</h3>
              </div>
              <button
                onClick={() => setShowSavedModal(false)}
                className="text-gray-400 hover:text-white text-xs font-bold px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/40 cursor-pointer border border-red-500/10"
              >
                FECHAR
              </button>
            </div>

            {savedServers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Server className="w-10 h-10 mx-auto text-gray-600 mb-2" />
                <p className="text-sm font-medium">Nenhum usuário salvo ainda.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {savedServers.map((srv) => (
                  <div
                    key={srv.id}
                    className="flex items-center justify-between bg-black/45 border border-red-950 hover:border-red-500/60 p-3.5 rounded-2xl transition-all group"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      onClick={() => handleSelectSaved(srv)}
                    >
                      <div className="w-9 h-9 rounded-xl bg-red-950/40 flex items-center justify-center text-red-400 shrink-0 border border-red-500/10">
                        <Server className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors truncate">
                          {srv.name}
                        </h4>
                        <p className="text-xs text-gray-400 font-mono truncate">{srv.serverUrl}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        onClick={() => handleSelectSaved(srv)}
                        className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-black hover:from-red-500 hover:to-neutral-900 border border-red-500/30 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Conectar
                      </button>
                      <button
                        onClick={() => onDeleteServer(srv.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
